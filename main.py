from fastapi import FastAPI, UploadFile, File, Request, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import requests
import uuid
import os
import json
import base64
import asyncio

# Pour le proxy WebSocket
import websockets
from websockets.exceptions import ConnectionClosedOK, ConnectionClosedError

# =========================================================
# CONFIGURATION
# =========================================================

# URL de ton POD COMFYUI (RunPod)
COMFYUI_URL = "https://vtytk59ny8wevj-8188.proxy.runpod.net"
# URL du WebSocket COMFYUI (NON SÉCURISÉ)
# ATTENTION: Cette adresse IP locale statique (169.155.241.26:8001) DOIT CORRESPONDRE à l'IP INTERNE DE VOTRE POD RUNPOD
COMFYUI_WS_URL = "ws://169.155.241.26:8001"

# Dépôts de fichiers sur le backend Render
WORKFLOWS_DIR = "./workflows"
RESULTS_DIR = "./results"
UPLOAD_DIR = "./input_images"
CHECKPOINTS_DIR = "./models/checkpoints"

os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CHECKPOINTS_DIR, exist_ok=True)

app = FastAPI()

# ---------------------------------------------------------
# CORS COMPLET (CORRIGÉ)
# ---------------------------------------------------------
# L'utilisation de allow_credentials=True avec allow_origins=["*"] est interdite par les navigateurs.
# Nous remplaçons ["*"] par l'URL spécifique du frontend.
origins = [
    "https://genrateuria.netlify.app", # Votre domaine Netlify
    "http://localhost:8000",           # Utile pour le développement local
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Préflight OPTIONS (utile pour Netlify + Render + FormData)
@app.options("/{rest_of_path:path}")
async def preflight(rest_of_path: str):
    return {}

# =========================================================
# ROUTES DE BASE / SYSTÈME
# =========================================================

@app.get("/healthz")
def health():
    return {"status": "ok"}

@app.get("/gpu_status")
def gpu_status():
    """Fournit l'état du GPU (Mock)."""
    return {
        "name": "NVIDIA GPU (RunPod/Render)",
        "load": 5,
        "memory_used": 1.2,
        "memory_total": 24.0,
        "temperature": 45
    }

# =========================================================
# ROUTES DE DONNÉES (Checkpoints, Workflows)
# =========================================================

@app.get("/workflows")
def get_workflows():
    files = []
    if os.path.exists(WORKFLOWS_DIR):
        for f in os.listdir(WORKFLOWS_DIR):
            if f.endswith(".json"):
                files.append(f)
    return {"workflows": files}

@app.get("/workflows/{workflow_name}")
def get_workflow_content(workflow_name: str):
    """Récupère le contenu JSON d'un workflow spécifique."""
    workflow_path = os.path.join(WORKFLOWS_DIR, workflow_name)
    
    if not os.path.exists(workflow_path):
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    try:
        with open(workflow_path, "r") as f:
            workflow_content = json.load(f)
        return workflow_content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

@app.get("/checkpoints")
def get_checkpoints():
    """Répond à l'appel du frontend pour charger la liste des modèles."""
    if not os.path.exists(CHECKPOINTS_DIR):
        return {"checkpoints": []}
        
    files = []
    for f in os.listdir(CHECKPOINTS_DIR):
        if f.endswith((".safetensors", ".ckpt")):
            files.append(f)
            
    return {"checkpoints": files}

# =========================================================
# ROUTES D'UPLOAD
# =========================================================

@app.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    """Gère l'upload d'une image pour les workflows Img2Img, etc."""
    filename = file.filename
    comfy_path = f"input/{filename}"
    local_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(local_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        return {"error": f"Erreur de sauvegarde: {str(e)}"}
        
    return {
        "local_path": local_path,
        "comfy_path": comfy_path
    }

# =========================================================
# ROUTES DE GÉNÉRATION
# =========================================================

@app.post("/generate")
async def generate(request: Request):
    """Envoie le workflow complet à ComfyUI."""
    form = await request.form()

    # 🔥 IMPORTANT : récupérer d'abord dans la query string, puis dans le form
    workflow_name = (
        request.query_params.get("workflow_name")
        or form.get("workflow_name")
        or "image_z_image_turbo-alien.json"
    )

    workflow_path = os.path.join(WORKFLOWS_DIR, workflow_name)
    if not os.path.exists(workflow_path):
        raise HTTPException(status_code=404, detail=f"Workflow file '{workflow_name}' not found on server")

    with open(workflow_path, "r") as f:
        workflow_json = json.load(f)

    # Remplacement des placeholders {{clé}} par les valeurs du form
    workflow_str = json.dumps(workflow_json)
    form_data = dict(form)
    
    for key, value in form_data.items():
        placeholder = "{{" + key + "}}"
        workflow_str = workflow_str.replace(placeholder, str(value))

    workflow_json = json.loads(workflow_str)

    client_id = str(uuid.uuid4())

    payload = {
        "prompt": workflow_json,
        "client_id": client_id
    }

    # Envoi à ComfyUI
    try:
        resp = requests.post(
            f"{COMFYUI_URL}/api/prompt",
            json=payload,
            timeout=200
        )
        data = resp.json()
        # On renvoie prompt_id au frontend (utilisé pour WS et /result)
        return {"status": "processing_started", "prompt_id": data.get("prompt_id")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending prompt to ComfyUI: {str(e)}")


@app.get("/progress/{prompt_id}")
def progress(prompt_id: str):
    url = f"{COMFYUI_URL}/api/prompt/{prompt_id}"
    resp = requests.get(url)

    try:
        return resp.json()
    except Exception:
        raise HTTPException(status_code=500, detail="Invalid progress response")


# =========================================================
# RESULT / HTTP FALLBACK
# =========================================================

@app.get("/result/{prompt_id}")
def result(prompt_id: str):
    """
    Récupère le fichier image généré à partir de l'API history de ComfyUI.
    """
    print(f"DEBUG: ROUTE /result/{prompt_id} ATTEINTE. Récupération de l'historique ComfyUI...")

    history_url = f"{COMFYUI_URL}/api/history/{prompt_id}"
    resp = requests.get(history_url)
    
    if resp.status_code != 200:
        print(f"ERROR: L'API history de ComfyUI a retourné le statut {resp.status_code}.")
        raise HTTPException(status_code=404, detail="ComfyUI history API error.")
        
    try:
        data = resp.json()
    except Exception:
        print("ERROR: Échec de l'analyse JSON de la réponse history.")
        raise HTTPException(status_code=404, detail="ComfyUI returned invalid JSON.")

    # ✅ CORRECTION ICI : pas de clé 'history', la racine est directement indexée par prompt_id
    prompt_data = data.get(prompt_id, {})
    if not prompt_data:
        print(f"DEBUG: Aucun bloc de données pour ce prompt_id dans l'historique.")
        raise HTTPException(status_code=404, detail="No history found for this prompt_id yet.")

    outputs = prompt_data.get("outputs", {})

    # === Vérification des sorties ===
    if not outputs:
        print(f"DEBUG: Historique récupéré, mais 'outputs' est vide pour {prompt_id}. Le process est peut-être encore en cours.")
        # Renvoyer 404 pour que le frontend continue le polling
        raise HTTPException(status_code=404, detail="No outputs yet or outputs are empty.")

    filename = None
    subfolder = None
    image_type = None

    # Parcourir les sorties pour trouver le premier fichier image
    for node_id, node_output in outputs.items():
        if "images" in node_output and node_output["images"]:
            # Utiliser la dernière image générée (plus sûr)
            image_info = node_output["images"][-1]
            filename = image_info["filename"]
            subfolder = image_info.get("subfolder", "")
            image_type = image_info.get("type", "output")
            break

    if not filename:
        print(f"DEBUG: Historique trouvé, mais aucun nœud ne contenait une image valide. Clés de sortie : {list(outputs.keys())}")
        raise HTTPException(status_code=404, detail="Outputs found, but no image file detected in nodes.")

    # Télécharger l'image finale via ComfyUI
    params = f"filename={filename}&subfolder={subfolder}&type={image_type}"
    file_url = f"{COMFYUI_URL}/api/view?{params}"
    
    print(f"DEBUG: Image trouvée: {filename}. Téléchargement depuis {file_url}")
    
    file_resp = requests.get(file_url)

    if file_resp.status_code != 200:
        print(f"ERROR: Échec du téléchargement de l'image depuis ComfyUI: {file_resp.status_code}")
        raise HTTPException(status_code=404, detail="Failed to download image from ComfyUI.")

    encoded = base64.b64encode(file_resp.content).decode("utf-8")

    return {
        "filename": filename,
        "image_base64": encoded
    }


# =========================================================
# ROUTE PROXY WEBSOCKET (FIX WSS)
# =========================================================

@app.websocket("/ws/progress/{prompt_id}")
async def websocket_endpoint(client_websocket: WebSocket, prompt_id: str):
    """
    Agit comme un proxy: reçoit la connexion WSS sécurisée du frontend,
    et la relaie vers le WS non sécurisé de ComfyUI.
    """
    await client_websocket.accept()
    
    comfy_ws_url = f"{COMFYUI_WS_URL}/ws/progress/{prompt_id}"

    try:
        async with websockets.connect(comfy_ws_url) as comfy_websocket:
            
            async def client_to_server():
                try:
                    while True:
                        message = await client_websocket.receive_text()
                        await comfy_websocket.send(message)
                except (WebSocketDisconnect, ConnectionClosedOK, ConnectionClosedError):
                    pass
                except Exception as e:
                    print(f"Erreur client-serveur: {e}")

            async def server_to_client():
                try:
                    while True:
                        message = await comfy_websocket.recv()
                        if isinstance(message, bytes):
                            message = message.decode('utf-8')
                        await client_websocket.send_text(message)
                except (ConnectionClosedOK, ConnectionClosedError):
                    await client_websocket.close()
                except Exception as e:
                    print(f"Erreur serveur-client: {e}")
                    await client_websocket.close()

            await asyncio.gather(client_to_server(), server_to_client())

    except ConnectionRefusedError:
        await client_websocket.send_text(json.dumps({
            "type": "error",
            "detail": "ComfyUI n'est pas joignable à l'adresse spécifiée."
        }))
        await client_websocket.close()
    except Exception as e:
        print(f"Erreur générale WS: {e}")
        await client_websocket.close()
