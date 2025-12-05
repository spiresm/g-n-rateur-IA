# -*- coding: utf-8 -*-
import os
import uvicorn
import json
import uuid
import base64
import random
import asyncio
import traceback
from typing import Optional, Dict

import requests
import websockets

from fastapi import FastAPI, HTTPException, Form, BackgroundTasks, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.websockets import WebSocket, WebSocketDisconnect

# GPU
try:
    import GPUtil as GPU
except ImportError:
    GPU = None

# ---------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------

BRIDGE_VERSION = "BRIDGE_MULTI_WORKFLOW_FINAL_SDXL_V10_FINAL" 
COMFYUI_HOST = "http://127.0.0.1:8000"
COMFYUI_WS_URL = "ws://127.0.0.1:8000/ws"
DEBUG = True
MAX_WAIT_TIME = 180

MODEL_CHECKPOINT = "v1-5-pruned-emaonly-fp16.safetensors"

RUNWAY_API_URL = "https://api.runwayml.com/v1/images-to-video"

NODE_IDS = {
    "CHECKPOINT_LOADER": "4",
    "LATENT_IMAGE": "5",
    "PROMPT_POSITIVE": "6",
    "PROMPT_NEGATIVE": "7",
    "KSAMPLER": "3",
    "VAEDECODE": "8",
    "SAVE_IMAGE_T2I": "9",
    "SDXL_REFINER_LOADER": "12",
    "SAVE_IMAGE_SDXL": "18",
}

NODE_TYPE_CHECKPOINT = "CheckpointLoaderSimple"

WORKFLOWS_DIR = os.path.join(os.path.dirname(__file__), "workflows")
IMAGES_DIR = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(WORKFLOWS_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)

COMFYUI_OUTPUT_DIR = "output"

active_connections: Dict[str, WebSocket] = {}
prompt_results: Dict[str, dict] = {}

_warmup_done = False

# ---------------------------------------------------------------------
# MODELS
# ---------------------------------------------------------------------

class TextToImageParams(BaseModel):
    width: int
    height: int
    steps: int
    sampler: str
    cfg_scale: float
    seed: int
    positive: str
    negative: str
    checkpoint: str

# ---------------------------------------------------------------------
# APP
# ---------------------------------------------------------------------

app = FastAPI(title="Comfy Bridge + Runway", version=BRIDGE_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------
# UTILS
# ---------------------------------------------------------------------

async def get_checkpoints_from_comfy():
    try:
        loop = asyncio.get_event_loop()
        resp = await loop.run_in_executor(None, requests.get, f"{COMFYUI_HOST}/object_info/CheckpointLoaderSimple")
        resp.raise_for_status()
        data = resp.json()
        return data.get("CheckpointLoaderSimple", {}).get("input", {}).get("required", {}).get("ckpt_name", [[]])[0]
    except:
        return []

def get_gpu_status_sync():
    try:
        return {
            "status": "ok",
            "name": "NVIDIA H100 80GB (Simulé)",
            "load": random.randint(1, 10),
            "memory_total": 80,
            "memory_used": round(random.uniform(2.5, 4.0), 1),
        }
    except Exception as e:
        if DEBUG:
            print(f"GPU check error: {e}")
        return {"status": "error", "name": "GPU indisponible", "load": 0, "memory_total": 0, "memory_used": 0}

def queue_prompt(prompt_workflow: dict):
    client_id = str(uuid.uuid4())
    payload = {"prompt": prompt_workflow, "client_id": client_id}
    resp = requests.post(f"{COMFYUI_HOST}/prompt", json=payload)
    if resp.status_code != 200:
        msg = resp.json().get("error", {}).get("message", "Invalid prompt")
        detail = resp.json().get("error", {}).get("details", "")
        raise HTTPException(400, f"ComfyUI Error: {msg}. Détail: {detail}")
    j = resp.json()
    return j["prompt_id"], client_id

async def get_image(filename, subfolder, folder_type):
    url = f"{COMFYUI_HOST}/view?filename={filename}&subfolder={subfolder}&type={folder_type}"
    loop = asyncio.get_event_loop()
    resp = await loop.run_in_executor(None, requests.get, url)
    if resp.status_code != 200:
        return "image/png", None
    mime = resp.headers.get("Content-Type", "image/png")
    return mime, base64.b64encode(resp.content).decode("utf-8")

def get_history(prompt_id: str) -> dict:
    try:
        resp = requests.get(f"{COMFYUI_HOST}/history/{prompt_id}")
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        if DEBUG:
            print(f"Error fetching history for {prompt_id}: {e}")
        return {}

def find_save_image_node_id(prompt_workflow, history_outputs):
    for nid, outputs in history_outputs.items():
        if outputs.get("images") or outputs.get("gifs"):
            return nid
    return None

# ---------------------------------------------------------------------
# 🚀 run_prompt_and_stream AVEC PROGRESSION ACTIVÉE
# ---------------------------------------------------------------------

async def run_prompt_and_stream(prompt_id, client_id, prompt_workflow):
    try:
        async with websockets.connect(COMFYUI_WS_URL + f"?clientId={client_id}") as ws_comfy:

            while True:
                raw = await asyncio.wait_for(ws_comfy.recv(), timeout=MAX_WAIT_TIME)
                msg = json.loads(raw)

                # -------------------------------------------
                # 🔥 FIX : MESSAGES DE PROGRESSION
                # -------------------------------------------

                # Format direct "progress"
                if msg.get("type") == "progress":
                    if prompt_id in active_connections:
                        await active_connections[prompt_id].send_json({
                            "type": "progress",
                            "value": msg["data"].get("value", 0),
                            "max_value": msg["data"].get("max", 100)
                        })

                # Format "executing" (node en cours)
                if msg.get("type") == "executing" and msg["data"].get("node") is not None:
                    if prompt_id in active_connections:
                        await active_connections[prompt_id].send_json({
                            "type": "progress",
                            "value": 0,           # obligatoire pour éviter NaN%
                            "max_value": 100,     # idem
                            "node": msg["data"]["node"]
                        })

                # -------------------------------------------
                # 💡 FIN DU WORKFLOW (node == null)
                # -------------------------------------------
                if msg.get("type") == "executing" and msg["data"].get("node") is None:

                    history = requests.get(f"{COMFYUI_HOST}/history/{prompt_id}").json()
                    outputs = history.get(prompt_id, {}).get("outputs", {})

                    save_id = NODE_IDS.get("SAVE_IMAGE_T2I")

                    # Détection du mode SDXL (présence du Refiner Loader)
                    if NODE_IDS.get("SDXL_REFINER_LOADER") in prompt_workflow and \
                        prompt_workflow[NODE_IDS["SDXL_REFINER_LOADER"]].get("class_type") == NODE_TYPE_CHECKPOINT:
                        save_id = NODE_IDS.get("SAVE_IMAGE_SDXL")

                    # Fallback si ID invalide
                    if save_id not in outputs:
                        save_id = find_save_image_node_id(prompt_workflow, outputs)

                    final_msg = {"type": "final_result", "prompt_id": prompt_id}

                    # Image
                    if save_id and outputs.get(save_id, {}).get("images"):
                        img = outputs[save_id]["images"][0]
                        mime, b64 = await get_image(img["filename"], img["subfolder"], img["type"])
                        final_msg = {
                            "type": "output",
                            "media_type": "image",
                            "mime_type": mime,
                            "image_base64": b64,
                            "filename": img["filename"]
                        }

                    # Vidéo / GIF
                    if save_id and outputs.get(save_id, {}).get("gifs"):
                        gif = outputs[save_id]["gifs"][0]
                        final_msg = {
                            "type": "output",
                            "media_type": "video",
                            "mime_type": "image/gif",
                            "filename": gif["filename"]
                        }

                    # Envoi au client
                    if prompt_id in active_connections:
                        prompt_results[prompt_id] = final_msg
                        await active_connections[prompt_id].send_json(final_msg)

                    break

    except asyncio.TimeoutError:
        print(f"TIMEOUT: Prompt {prompt_id} non terminé après {MAX_WAIT_TIME} sec.")
        if prompt_id in active_connections:
            await active_connections[prompt_id].send_json({
                "type": "error",
                "detail": "Timeout ComfyUI atteint"
            })

    except Exception as e:
        print(f"ERREUR dans run_prompt_and_stream: {traceback.format_exc()}")
        if prompt_id in active_connections:
            await active_connections[prompt_id].send_json({
                "type": "error",
                "detail": str(e)
            })

    finally:
        if prompt_id in active_connections:
            try:
                await active_connections[prompt_id].close()
            except:
                pass
            active_connections.pop(prompt_id, None)

# ---------------------------------------------------------------------
# UTILS RUNWAYML
# ---------------------------------------------------------------------

async def call_runway_i2v(api_key, prompt, image_url, ratio, duration, seed):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gen4_turbo",
        "promptText": prompt,
        "promptImage": [{"uri": image_url, "position": "first"}],
        "ratio": ratio,
        "duration": duration,
        "seed": seed
    }

    loop = asyncio.get_event_loop()
    resp = await loop.run_in_executor(
        None,
        lambda: requests.post(RUNWAY_API_URL, json=payload, headers=headers)
    )

    data = resp.json()
    if "id" not in data:
        raise HTTPException(500, f"Runway error: {data}")
    return data["id"]


async def wait_runway_result(api_key, task_id):
    headers = {"Authorization": f"Bearer {api_key}"}
    url = f"https://api.runwayml.com/v1/tasks/{task_id}"

    loop = asyncio.get_event_loop()

    for _ in range(60):
        resp = await loop.run_in_executor(None, lambda: requests.get(url, headers=headers))
        j = resp.json()

        if j.get("status") == "succeeded":
            return j["outputs"][0]["uri"]

        await asyncio.sleep(2)

    raise HTTPException(500, "Runway timeout")


def download_runway_video(url):
    resp = requests.get(url)
    resp.raise_for_status()
    fname = f"runway_{uuid.uuid4().hex}.mp4"
    path = os.path.join(IMAGES_DIR, fname)
    with open(path, "wb") as f:
        f.write(resp.content)
    return fname


async def run_runway_and_stream(prompt_id, api_key, prompt, image_url, ratio, duration, seed):
    try:
        if prompt_id in active_connections:
            await active_connections[prompt_id].send_json({
                "type": "status",
                "message": "RunwayML job started"
            })

        rid = await call_runway_i2v(api_key, prompt, image_url, ratio, duration, seed)

        # Fake progress (Runway ne fournit pas de vrai pourcentage)
        p = 0
        for _ in range(5):
            await asyncio.sleep(1)
            p += 20
            if prompt_id in active_connections:
                await active_connections[prompt_id].send_json({
                    "type": "progress",
                    "value": p,
                    "max_value": 100
                })

        url = await wait_runway_result(api_key, rid)

        fname = download_runway_video(url)
        
        file_path = os.path.join(IMAGES_DIR, fname)
        with open(file_path, "rb") as file_to_read:
            encoded = base64.b64encode(file_to_read.read()).decode('utf-8')

        final_msg = {
            "type": "output",
            "media_type": "video",
            "mime_type": "video/mp4",
            "image_base64": encoded,
            "filename": fname
        }

        if prompt_id in active_connections:
            prompt_results[prompt_id] = final_msg
            await active_connections[prompt_id].send_json(final_msg)

    except Exception as e:
        if prompt_id in active_connections:
            await active_connections[prompt_id].send_json({
                "type": "error",
                "detail": str(e)
            })

    finally:
        if prompt_id in active_connections:
            try:
                await active_connections[prompt_id].close()
            except:
                pass
            active_connections.pop(prompt_id, None)


# ---------------------------------------------------------------------
# PLACEHOLDER ENGINE
# ---------------------------------------------------------------------

def apply_placeholders(obj, values):
    if isinstance(obj, dict):
        return {k: apply_placeholders(v, values) for k, v in obj.items()}
    if isinstance(obj, list):
        return [apply_placeholders(v, values) for v in obj]
    if isinstance(obj, str):
        for key, val in values.items():
            obj = obj.replace("{{"+key+"}}", "" if val is None else str(val))
        return obj
    return obj
def load_workflow_json(name):
    if not name.endswith(".json"):
        name += ".json"
    path = os.path.join(WORKFLOWS_DIR, name)
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Fichier de workflow non trouvé: {name}")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Erreur JSON dans {name}: {e}")

    return data.get("prompt", data)

# ---------------------------------------------------------------------
# ROUTES
# ---------------------------------------------------------------------

@app.get("/")
def root():
    return {"status": "ok", "version": BRIDGE_VERSION}


@app.get("/gpu_status")
async def gpu_status():
    loop = asyncio.get_event_loop()
    status = await loop.run_in_executor(None, get_gpu_status_sync)
    return status


@app.get("/checkpoints")
async def list_checkpoints():
    cps = await get_checkpoints_from_comfy()
    return {"checkpoints": cps or [MODEL_CHECKPOINT]}


@app.get("/workflows")
def list_workflows():
    return {"workflows": [f for f in os.listdir(WORKFLOWS_DIR) if f.endswith(".json")]}


@app.get("/workflows/{workflow_name}")
def get_workflow_json_raw(workflow_name: str):
    return load_workflow_json(workflow_name)


@app.get("/result/{prompt_id}")
async def get_result_image(prompt_id: str):

    # 1. Cache local
    if prompt_id in prompt_results and prompt_results[prompt_id].get("media_type") in ["image", "video"]:
        return prompt_results.pop(prompt_id)

    # 2. Historique ComfyUI
    loop = asyncio.get_event_loop()
    history_data = await loop.run_in_executor(None, get_history, prompt_id)

    if not history_data or prompt_id not in history_data:
        raise HTTPException(status_code=404, detail="Prompt ID introuvable ou pas terminé.")

    result = history_data[prompt_id]
    file_info = None
    media_type = "image"

    for _, node_output in result["outputs"].items():
        if "images" in node_output and node_output["images"]:
            file_info = node_output["images"][0]
            media_type = "image"
            break
        if "gifs" in node_output and node_output["gifs"]:
            file_info = node_output["gifs"][0]
            media_type = "video"
            break

    if not file_info:
        raise HTTPException(status_code=404, detail="Aucune sortie image/vidéo trouvée.")

    filename = file_info["filename"]
    subfolder = file_info.get("subfolder", "output")
    image_type = file_info.get("type", "output")

    try:
        response = requests.get(
            f"{COMFYUI_HOST}/view",
            params={"filename": filename, "subfolder": subfolder, "type": image_type}
        )
        response.raise_for_status()
        encoded = base64.b64encode(response.content).decode('utf-8')
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur de récupération du fichier final.")

    mime_type = response.headers.get("Content-Type", "image/png")

    final_http_result = {
        "type": "output",
        "image_base64": encoded,
        "filename": filename,
        "mime_type": mime_type,
        "media_type": media_type
    }

    prompt_results[prompt_id] = final_http_result
    return final_http_result


@app.websocket("/ws/progress/{prompt_id}")
async def websocket_endpoint(ws: WebSocket, prompt_id: str):
    await ws.accept()
    active_connections[prompt_id] = ws

    if prompt_id in prompt_results:
        await ws.send_json(prompt_results.pop(prompt_id))
        await ws.close()
        return

    try:
        while True:
            await ws.receive_text()
    except:
        pass
    finally:
        active_connections.pop(prompt_id, None)

# ---------------------------------------------------------------------
# UPLOAD IMAGE
# ---------------------------------------------------------------------

@app.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".png", ".jpg", ".jpeg", ".webp"]:
        raise HTTPException(status_code=400, detail="Format non supporté.")

    safe_name = f"{uuid.uuid4().hex}{ext}"
    local_path = os.path.join(IMAGES_DIR, safe_name)
    content = await file.read()

    with open(local_path, "wb") as f:
        f.write(content)

    # Upload vers ComfyUI
    try:
        with open(local_path, "rb") as f:
            files = {"image": (safe_name, f, "application/octet-stream")}
            data = {"subfolder": "user_images", "type": "input"}
            resp = requests.post(f"{COMFYUI_HOST}/upload/image", files=files, data=data)
            resp.raise_for_status()
            j = resp.json()
    except Exception as e:
        if os.path.exists(local_path):
            os.remove(local_path)
        raise HTTPException(status_code=500, detail=f"Erreur upload ComfyUI: {e}")

    comfy_name = j.get("name", safe_name)
    comfy_subfolder = j.get("subfolder", "user_images")
    comfy_type = j.get("type", "input")

    return {
        "local_path": f"images/{safe_name}",
        "comfy_path": comfy_name,
        "subfolder": comfy_subfolder,
        "type": comfy_type
    }

# ---------------------------------------------------------------------
# GENERATE (ENTRY POINT)
# ---------------------------------------------------------------------

@app.post("/generate")
async def generate(
    background_tasks: BackgroundTasks,
    workflow_name: str = Query(...),

    prompt: str = Form(""),
    negative_prompt: str = Form(""),

    width: int = Form(1024),
    height: int = Form(1024),
    steps: int = Form(30),
    sampler: str = Form("euler"),
    cfg_scale: float = Form(7.0),
    seed: int = Form(-1),
    checkpoint: str = Form(MODEL_CHECKPOINT),

    input_image_path: Optional[str] = Form(None),
    duration: Optional[int] = Form(None),
    ratio: Optional[str] = Form(None),

    base_end_step: Optional[float] = Form(None),
    refiner_start_step: Optional[float] = Form(None),
    refiner_end_step: Optional[float] = Form(None),

    positive_style: Optional[str] = Form(None),
    negative_style: Optional[str] = Form(None),
    vae_name: Optional[str] = Form(None),

    sdxl_mode: Optional[str] = Form(None),
    sdxl_quality: Optional[str] = Form(None),

    runway_api_key: Optional[str] = Form(None)
):
    # Correction du seed
    if seed < 0:
        seed = random.randint(0, 2**32 - 1)

    # -----------------------------------------------------------------
    # RUNWAYML WORKFLOW
    # -----------------------------------------------------------------
    if workflow_name == "runwayml_i2v_gen4.json":

        if not runway_api_key:
            raise HTTPException(400, "Missing Runway API key")

        if not input_image_path:
            raise HTTPException(400, "Missing input image")

        prompt_id = str(uuid.uuid4())

        img_url = f"{COMFYUI_HOST}/view?filename={input_image_path}&subfolder=user_images&type=input"

        background_tasks.add_task(
            run_runway_and_stream,
            prompt_id,
            runway_api_key,
            prompt,
            img_url,
            ratio or "1280:720",
            duration or 4,
            seed
        )

        return {"status": "processing_started", "prompt_id": prompt_id}

    # -----------------------------------------------------------------
    # COMFYUI NORMAL WORKFLOW
    # -----------------------------------------------------------------

    if workflow_name == "sdxl_simple_example.json" or "sdxl" in workflow_name.lower():
        if base_end_step is None:
            base_end_step = 18.0
        if refiner_start_step is None:
            refiner_start_step = 18.0
        if refiner_end_step is None:
            refiner_end_step = 30.0

    base = load_workflow_json(workflow_name)
    workflow = apply_placeholders(base, {
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "width": width,
        "height": height,
        "steps": steps,
        "cfg_scale": cfg_scale,
        "cfg": cfg_scale,
        "sampler": sampler,
        "seed": seed,
        "checkpoint": checkpoint,
        "input_image_path": input_image_path,
        "duration": duration,
        "ratio": ratio,

        "base_end_step": base_end_step,
        "refiner_start_step": refiner_start_step,
        "refiner_end_step": refiner_end_step,

        "positive_style": positive_style,
        "negative_style": negative_style,
        "vae_name": vae_name,

        "sdxl_mode": sdxl_mode,
        "sdxl_quality": sdxl_quality
    })

    prompt_id, client_id = queue_prompt(workflow)

    background_tasks.add_task(
        run_prompt_and_stream,
        prompt_id=prompt_id,
        client_id=client_id,
        prompt_workflow=workflow
    )

    return {"status": "processing_started", "prompt_id": prompt_id}

# ---------------------------------------------------------------------
# START SERVER
# ---------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
