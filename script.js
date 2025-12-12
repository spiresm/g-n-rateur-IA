// =========================================================
// CONFIGURATION (FRONTEND)
// =========================================================

const API_BASE_URL = "https://g-n-rateur-backend-1.onrender.com";
const FRONTEND_URL = "https://genrateuria.netlify.app"; // Utilisé pour la redirection après l'authentification

// =========================================================
// 🆕 LISTE DES STYLES DE TITRE (depuis script.js)
// =========================================================

const STYLE_TITRE_OPTIONS = [
    { label: "Texte sanglant dégoulinant", value: "dripping horror lettering, torn edges, glossy red liquid texture, glowing sinister vibe" },
    { label: "Néon cyberpunk", value: "bright neon tube letters, electric glow, slight chromatic aberration, futuristic vaporwave look" },
    { label: "Typographie givrée / glace", value: "frosted glass letters, icy texture, translucent frozen edges, cold blue inner glow" },
    { label: "Lettrage en bois sculpté", value: "hand-carved wooden lettering, deep grooves, warm grain texture, rustic fantasy aesthetic" },
    { label: "Texte métallique gravé", value: "polished engraved steel letters, sharp reflections, industrial sci-fi shine" },
    { label: "Style cartoon / bulle", value: "rounded bubbly cartoon letters, colorful shading, outlined comic look" },
    { label: "Effet slasher sanglant", value: "sharp jagged letters, blood splatter texture, rough grain, violent horror tone" },
    { label: "Lettrage en cristal / gemme", value: "faceted gemstone letters, prism reflections, diamond-like clarity, luminous highlights" },
    { label: "Ruban de soie flottant", value: "silk ribbon floating letters, soft smooth texture, ethereal lighting, elegant flow" },
    { label: "Peinture murale style art déco", value: "art deco mural painting typography, stylized geometric patterns, gold leaf accents, flat design" }
];

// =========================================================
// 🛡️ UTILITIES DE SÉCURITÉ (Gestion du Token dans localStorage - depuis script (40).js)
// =========================================================

function setToken(token) {
    try {
        localStorage.setItem('google_auth_token', token);
        console.log("SUCCESS: Token sauvegardé dans localStorage.");
        return true;
    } catch (e) {
        console.error("ERREUR CRITIQUE: Impossible de sauvegarder dans localStorage. La session ne peut pas être maintenue.", e);
        return false;
    }
}

function getToken() {
    try {
        const token = localStorage.getItem('google_auth_token');
        return token;
    } catch (e) {
        console.error("ERREUR CRITIQUE: Impossible de lire le token dans localStorage.", e);
        return null;
    }
}

function clearToken() {
    try {
        localStorage.removeItem('google_auth_token');
        sessionStorage.removeItem('auth_redirect_done'); // Nettoyage de sécurité
    } catch (e) {
        console.warn("Avertissement: Impossible de retirer le token de localStorage.");
    }
}

// =========================================================
// 🛡️ AUTHENTICATION FUNCTIONS (LOGIQUE ANTI-BOUCLE - depuis script (40).js)
// =========================================================

let isAuthenticated = getToken() !== null;

// Vérifie si un token est présent dans l'URL (après une redirection de login)
function handleLoginRedirect() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
        alert("Erreur d'authentification: " + error);
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, FRONTEND_URL);
        return;
    }

    if (token) {
        console.log("Token reçu de l'URL.");
        if (setToken(token)) {
            isAuthenticated = true;
        }
        // Utiliser sessionStorage pour empêcher une boucle de redirection si l'utilisateur rafraîchit
        sessionStorage.setItem('auth_redirect_done', 'true');
        // Nettoyer l'URL sans rafraîchir la page
        window.history.replaceState({}, document.title, FRONTEND_URL);
    }
}

// Fonction pour afficher/masquer les éléments d'interface en fonction de l'état d'auth
function checkAuthStatusAndDisplayContent() {
    const loginLink = document.getElementById('login-link');
    const logoutButton = document.getElementById('logout-button');
    const mainContentWrapper = document.getElementById('main-content-wrapper');

    if (isAuthenticated) {
        console.log("Statut: Authentifié. Affichage du contenu.");
        if (loginLink) loginLink.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'block';
        if (mainContentWrapper) mainContentWrapper.style.display = 'block'; // Affiche l'interface principale
    } else {
        console.log("Statut: Non Authentifié. Contenu masqué.");
        if (loginLink) loginLink.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'none';
        if (mainContentWrapper) mainContentWrapper.style.display = 'none'; // Masque l'interface principale
    }
}

// =========================================================
// 🧠 FONCTIONS DE L'INTERFACE ET DE GÉNÉRATION (depuis script.js)
// =========================================================

// ... (Les fonctions suivantes sont conservées de script.js) ...

function populateTitleStyles() {
    const select = document.getElementById('aff_style_titre');
    if (!select) return;

    // Ajouter l'option par défaut
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Choose…";
    select.appendChild(defaultOption);

    STYLE_TITRE_OPTIONS.forEach(style => {
        const option = document.createElement('option');
        option.value = style.value;
        option.textContent = style.label;
        select.appendChild(option);
    });
}

// Récupère les données de la liste des options pour un <select> donné
function populateSelectOptions(selectId, endpoint, defaultOptionText = "Loading…") {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = `<option value="">${defaultOptionText}</option>`;

    fetch(`${API_BASE_URL}/api/${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        // Vider et ajouter l'option 'Choose…'
        select.innerHTML = `<option value="">Choose…</option>`; 
        data.forEach(item => {
            const option = document.createElement('option');
            // Assumer que les items sont des chaînes de caractères (noms de fichiers ou IDs)
            option.value = item;
            option.textContent = item.replace('.safetensors', '').replace(/_/g, ' '); // Nettoyage
            select.appendChild(option);
        });
        
        // Si c'est la liste des checkpoints, essayer de sélectionner le premier si possible
        if (selectId === 'checkpoint-select' && data.length > 0) {
            select.value = data[0]; 
        }
    })
    .catch(error => {
        console.error(`Error loading ${endpoint}:`, error);
        select.innerHTML = `<option value="">Error loading data.</option>`;
    });
}

let currentWorkflow = null; // Stocke l'objet workflow actif

function selectWorkflow(workflowPath) {
    // 1. Mise à jour de l'input caché
    const workflowSelectInput = document.getElementById('workflow-select');
    if (workflowSelectInput) {
        workflowSelectInput.value = workflowPath;
    }

    // 2. Récupération des données du workflow pour afficher/masquer les inputs
    fetch(`${API_BASE_URL}/api/workflows/${workflowPath}`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(workflowData => {
        currentWorkflow = workflowData;
        console.log("Workflow chargé:", workflowData.name);
        
        // Logique pour afficher/masquer les groupes d'inputs
        const elementsToToggle = [
            'group-steps', 'group-cfg', 'group-width', 'group-height', 'group-sampler', 'group-seed',
            'video-params-section', 'input-image-section', 'sdxl-panel', 'checkpoint-wrapper'
        ];

        elementsToToggle.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // Par défaut, tout est masqué
                el.style.display = 'none';
            }
        });

        // Afficher les éléments en fonction des tags du workflow
        if (workflowData.tags.includes('image')) {
            document.getElementById('group-steps').style.display = 'block';
            document.getElementById('group-cfg').style.display = 'block';
            document.getElementById('group-width').style.display = 'block';
            document.getElementById('group-height').style.display = 'block';
            document.getElementById('group-sampler').style.display = 'block';
            document.getElementById('group-seed').style.display = 'block';
        }
        if (workflowData.tags.includes('video')) {
            document.getElementById('video-params-section').style.display = 'block';
        }
        if (workflowData.tags.includes('img2img')) {
            document.getElementById('input-image-section').style.display = 'block';
        }
        if (workflowData.tags.includes('sdxl')) {
            document.getElementById('sdxl-panel').style.display = 'block';
        }
        if (workflowData.tags.includes('checkpoint')) {
            document.getElementById('checkpoint-wrapper').style.display = 'block';
        }

    })
    .catch(error => {
        console.error("Erreur lors du chargement du workflow:", error);
    });
}

function loadWorkflows() {
    const container = document.getElementById('workflow-groups-container');
    if (!container) return;
    container.innerHTML = 'Chargement...';

    fetch(`${API_BASE_URL}/api/workflows`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        container.innerHTML = '';
        const workflowData = data.workflows || [];
        const groups = {};

        // 1. Groupement par catégorie
        workflowData.forEach(item => {
            const category = item.category || 'Other';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
        });

        // 2. Affichage (défilement horizontal)
        Object.keys(groups).forEach(category => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'workflow-group';
            
            const groupTitle = document.createElement('h3');
            groupTitle.textContent = category;
            groupDiv.appendChild(groupTitle);
            
            const carousel = document.createElement('div');
            carousel.className = 'workflow-carousel';

            groups[category].forEach(item => {
                const card = document.createElement('div');
                card.className = 'workflow-card';
                card.dataset.path = item.path;
                
                const img = document.createElement('img');
                img.src = item.vignette_url;
                img.alt = item.name;

                const nameDiv = document.createElement('div');
                nameDiv.className = 'workflow-name';
                nameDiv.textContent = item.name;

                card.appendChild(img);
                card.appendChild(nameDiv);

                // Gestion du clic pour sélectionner
                card.addEventListener('click', () => {
                    document.querySelectorAll('.workflow-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    selectWorkflow(item.path);
                });

                // Gestion du survol pour le popover (à implémenter)

                carousel.appendChild(card);
            });

            groupDiv.appendChild(carousel);
            container.appendChild(groupDiv);
        });
        
        // 3. Sélectionner le premier workflow par défaut, ou un workflow image par défaut
        const defaultWorkflowCard = document.querySelector('.workflow-card[data-path="default_image.json"]') || document.querySelector('.workflow-card');
        if (defaultWorkflowCard) {
            defaultWorkflowCard.click();
        }
    })
    .catch(error => {
        console.error("Erreur lors du chargement des workflows:", error);
        container.innerHTML = `<span style="color:red;">Erreur: Impossible de charger les workflows.</span>`;
    });
}

function refreshGPU() {
    // Si l'utilisateur n'est pas authentifié, ne rien faire
    if (!isAuthenticated) return;
    
    fetch(`${API_BASE_URL}/api/gpu-status`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        document.getElementById('gpu-name').textContent = data.name || 'N/A';
        document.getElementById('gpu-util').textContent = data.utilization_gpu ? `${data.utilization_gpu}%` : '0%';
        document.getElementById('gpu-mem').textContent = data.memory_used && data.memory_total ? 
            `${data.memory_used} / ${data.memory_total} GB` : '0 / 0 GB';
        document.getElementById('gpu-temp').textContent = data.temperature_gpu ? `${data.temperature_gpu} °C` : '– °C';

        const dot = document.querySelector('.gpu-dot');
        if (dot) {
            // Logique simple: rouge si > 70%, jaune si > 30%, vert sinon
            const util = parseInt(data.utilization_gpu) || 0;
            if (util > 70) {
                dot.style.backgroundColor = 'red';
            } else if (util > 30) {
                dot.style.backgroundColor = 'orange';
            } else {
                dot.style.backgroundColor = 'green';
            }
        }
    })
    .catch(error => {
        console.error("Erreur lors du rafraîchissement du statut GPU:", error);
        // Afficher N/A en cas d'erreur
        document.getElementById('gpu-name').textContent = 'N/A';
        document.getElementById('gpu-util').textContent = '0%';
        document.getElementById('gpu-mem').textContent = '0 / 0 GB';
        document.getElementById('gpu-temp').textContent = '— °C';
        const dot = document.querySelector('.gpu-dot');
        if (dot) dot.style.backgroundColor = 'gray';
    });
}

function generatePrompt() {
    // Si l'utilisateur n'est pas authentifié, ne rien faire
    if (!isAuthenticated) return;
    
    const elements = {
        aff_titre: document.getElementById('aff_titre').value,
        aff_sous_titre: document.getElementById('aff_sous_titre').value,
        aff_tagline: document.getElementById('aff_tagline').value,
        aff_theme: document.getElementById('aff_theme').value || document.getElementById('aff_theme_custom').value,
        aff_ambiance: document.getElementById('aff_ambiance').value || document.getElementById('aff_ambiance_custom').value,
        aff_perso: document.getElementById('aff_perso_sugg').value || document.getElementById('aff_perso_desc').value,
        aff_env: document.getElementById('aff_env_sugg').value || document.getElementById('aff_env_desc').value,
        aff_action: document.getElementById('aff_action_sugg').value || document.getElementById('aff_action_desc').value,
        aff_details: document.getElementById('aff_details').value,
        aff_palette: document.getElementById('aff_palette').value || document.getElementById('aff_palette_custom').value,
        aff_style_titre: document.getElementById('aff_style_titre').value || document.getElementById('aff_style_titre_custom').value
    };

    // Construction du Prompt
    const promptParts = [];

    // 1. Description de la scène principale
    let scene = '';
    if (elements.aff_perso || elements.aff_env || elements.aff_action) {
        scene += `A high-quality, photorealistic poster image of a scene where ${elements.aff_perso} is ${elements.aff_action} in ${elements.aff_env}.`;
    } else {
        scene += `A colorful and detailed event poster image, high resolution.`;
    }
    promptParts.push(scene);

    // 2. Thème/Ambiance et Détails
    if (elements.aff_theme) {
        promptParts.push(`Theme: ${elements.aff_theme}.`);
    }
    if (elements.aff_ambiance) {
        promptParts.push(`Mood/Style: ${elements.aff_ambiance}.`);
    }
    if (elements.aff_details) {
        promptParts.push(`Details: ${elements.aff_details}.`);
    }

    // 3. Typographie (Titres)
    let titleSection = 'Prominently featuring text elements:';

    if (elements.aff_titre) {
        titleSection += ` Main Title "${elements.aff_titre}".`;
    }
    if (elements.aff_sous_titre) {
        titleSection += ` Subtitle "${elements.aff_sous_titre}".`;
    }
    if (elements.aff_tagline) {
        titleSection += ` Tagline "${elements.aff_tagline}".`;
    }
    
    // 4. Style du Titre
    if (elements.aff_style_titre) {
        titleSection += ` The title uses a font style described as: ${elements.aff_style_titre}.`;
    }

    if (titleSection !== 'Prominently featuring text elements:') {
         promptParts.push(titleSection);
    }

    // 5. Palette de Couleurs
    if (elements.aff_palette) {
        promptParts.push(`Color Palette: ${elements.aff_palette}.`);
    }

    // 6. Style visuel final
    promptParts.push(`High detail, cinematic lighting, dramatic composition, poster design, 4K resolution.`);

    // 7. Negative Prompt (si nécessaire - ici on l'ajoute directement si on veut)
    const negativePrompt = "blurry, worst quality, distorted, missing limbs, duplicate, ugly, signature, watermark, lowres, text artifacts, bad anatomy, deformed, monochrome";

    document.getElementById('prompt').value = promptParts.filter(p => p.trim() !== '').join(' ') + ` --neg ${negativePrompt}`;
    alert("Prompt généré avec succès ! (Vérifiez le panneau de résultats)");

    // Afficher le bouton de génération d'image
    document.getElementById('generate-button').style.display = 'block';
}


function submitGeneration(event) {
    event.preventDefault(); // Empêche l'envoi de formulaire standard
    
    // Si l'utilisateur n'est pas authentifié, empêcher l'envoi
    if (!isAuthenticated) {
        document.getElementById('error-box').textContent = "Veuillez vous connecter pour lancer une génération.";
        document.getElementById('error-box').style.display = 'block';
        return;
    }
    
    // Masquer les erreurs précédentes
    document.getElementById('error-box').style.display = 'none';

    // 1. Récupération des données du formulaire
    const form = event.target;
    const formData = new FormData(form);
    const data = {};

    // Données de base
    formData.forEach((value, key) => {
        // Ignorer le champ de seed si le random est coché
        if (key === 'seed_value' && document.getElementById('seed-random-toggle').checked) {
            data['seed'] = -1; // -1 est souvent utilisé pour indiquer un seed aléatoire
            return;
        }
        if (key === 'prompt') {
            data[key] = value;
        } else if (!isNaN(parseFloat(value))) {
            data[key] = parseFloat(value);
        } else {
            data[key] = value;
        }
    });

    // Gestion du seed (si la valeur est absente ou si c'est le champ de toggle)
    if (document.getElementById('seed-random-toggle') && document.getElementById('seed-random-toggle').checked) {
        data['seed'] = -1;
    } else {
        // Utiliser la valeur textuelle si le random n'est pas coché
        data['seed'] = parseInt(document.getElementById('seed-input').value) || 42; 
    }
    delete data.seed_random; // Supprimer le champ du toggle


    // Si le workflow est un workflow 'affiche', s'assurer que le prompt est généré/disponible
    if (document.getElementById('workflow-select').value.includes('affiche') && !data.prompt) {
        document.getElementById('error-box').textContent = "Veuillez générer le Prompt d'abord !";
        document.getElementById('error-box').style.display = 'block';
        return;
    }

    // 2. Gestion du Refiner SDXL (si visible)
    if (document.getElementById('sdxl-panel').style.display === 'block') {
        data['sdxl_mode'] = document.getElementById('sdxl_mode').value;
        data['sdxl_start'] = parseFloat(document.getElementById('sdxl_start-slider').value) / 100;
        data['sdxl_end'] = parseFloat(document.getElementById('sdxl_end-slider').value) / 100;
        data['sdxl_quality'] = document.getElementById('sdxl_quality').value;
    }

    // 3. Préparer l'interface utilisateur pour le lancement
    document.getElementById('job-status-pill').textContent = 'STARTING...';
    document.getElementById('job-status-pill').className = 'pill-yellow';
    document.getElementById('progress-overlay').style.display = 'flex';
    document.getElementById('result-placeholder').style.display = 'none';
    const generateButton = document.getElementById('generate-button');
    generateButton.disabled = true;
    generateButton.querySelector('.dot').style.display = 'block';
    
    const startTime = Date.now();
    let jobId = null;
    let eventSource = null;

    // Fonction de nettoyage
    const cleanup = () => {
        if (eventSource) {
            eventSource.close();
            eventSource = null;
        }
        generateButton.disabled = false;
        generateButton.querySelector('.dot').style.display = 'none';
    };

    // 4. Lancement du job de génération via l'API
    fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || 'La requête de génération a échoué.');
            });
        }
        return response.json();
    })
    .then(jobData => {
        jobId = jobData.job_id;
        console.log("Job lancé:", jobId);

        // 5. Connexion aux événements SSE (Server-Sent Events)
        const sseUrl = `${API_BASE_URL}/api/stream-progress?job_id=${jobId}`;
        eventSource = new EventSource(sseUrl);

        eventSource.onmessage = (event) => {
            const progress = JSON.parse(event.data);
            
            document.getElementById('progress-label').textContent = progress.status || 'Processing...';
            document.getElementById('progress-percent').textContent = progress.percent !== undefined ? `${progress.percent}%` : '...';
            document.getElementById('progress-inner').style.width = progress.percent !== undefined ? `${progress.percent}%` : '0%';
            
            if (progress.status === 'DONE' && progress.result_url) {
                // Succès: Affichage de l'image
                cleanup();
                document.getElementById('job-status-pill').textContent = 'DONE';
                document.getElementById('job-status-pill').className = 'pill-green';
                document.getElementById('progress-overlay').style.display = 'none';

                const endTime = Date.now();
                const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
                document.getElementById('time-taken').textContent = `${timeTaken}s`;

                const resultArea = document.getElementById('result-area');
                resultArea.style.backgroundImage = `url('${progress.result_url}')`;
                resultArea.style.backgroundSize = 'contain';
                resultArea.style.backgroundRepeat = 'no-repeat';
                resultArea.style.backgroundPosition = 'center';

                // Mettre à jour les métadonnées
                document.getElementById('meta-seed').textContent = progress.metadata.seed || 'N/A';
                document.getElementById('meta-steps').textContent = progress.metadata.steps || 'N/A';
                document.getElementById('meta-cfg').textContent = progress.metadata.cfg_scale || 'N/A';
                document.getElementById('meta-sampler').textContent = progress.metadata.sampler || 'N/A';
                
            } else if (progress.status === 'FAILED') {
                // Échec
                cleanup();
                document.getElementById('job-status-pill').textContent = 'FAILED';
                document.getElementById('job-status-pill').className = 'pill-red';
                document.getElementById('progress-overlay').style.display = 'none';
                document.getElementById('error-box').textContent = `Erreur de génération: ${progress.message || 'Détails non spécifiés.'}`;
                document.getElementById('error-box').style.display = 'block';
            }
        };

        eventSource.onerror = (err) => {
            console.error("Erreur SSE:", err);
            // Vérifiez si l'erreur est due à une fermeture normale ou à une erreur de réseau
            if (eventSource.readyState === EventSource.CLOSED) {
                // C'est potentiellement une fermeture normale après "DONE"
                return;
            }
            cleanup();
            document.getElementById('job-status-pill').textContent = 'ERROR';
            document.getElementById('job-status-pill').className = 'pill-red';
            document.getElementById('progress-overlay').style.display = 'none';
            document.getElementById('error-box').textContent = "Erreur de connexion (SSE). Vérifiez la console.";
            document.getElementById('error-box').style.display = 'block';
        };

    })
    .catch(error => {
        // Erreur lors de la requête POST initiale
        cleanup();
        document.getElementById('job-status-pill').textContent = 'ERROR';
        document.getElementById('job-status-pill').className = 'pill-red';
        document.getElementById('progress-overlay').style.display = 'none';
        document.getElementById('error-box').textContent = error.message || "Une erreur inconnue est survenue lors du lancement du job.";
        document.getElementById('error-box').style.display = 'block';
    });
}

// =========================================================
// GESTION DU DOM ET DES ÉVÉNEMENTS
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // 🛡️ 1. GESTION DE L'AUTHENTIFICATION ET REDIRECTION
    handleLoginRedirect();
    checkAuthStatusAndDisplayContent();

    // 2. Si l'utilisateur est authentifié, initialiser l'application
    if (isAuthenticated) {
        
        // 2.1 Initialisation des listes déroulantes spécifiques
        populateTitleStyles();
        populateSelectOptions('checkpoint-select', 'checkpoints', 'Loading Checkpoints…');

        // 2.2 Gestion de la déconnexion
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                clearToken();
                isAuthenticated = false;
                checkAuthStatusAndDisplayContent(); // Masque le contenu et affiche le bouton de connexion
            });
        }
        
        // 2.3 Initialisation de l'interface et des événements

        // Bouton pour générer le prompt de l'affiche
        const afficheGenerateBtn = document.getElementById('affiche-generate-btn');
        if (afficheGenerateBtn) {
            afficheGenerateBtn.addEventListener('click', generatePrompt);
        }
        
        // Bouton pour la génération aléatoire (Affiche)
        const afficheRandomBtn = document.getElementById('affiche-random-btn');
        if (afficheRandomBtn) {
            afficheRandomBtn.addEventListener('click', () => {
                // Logique pour sélectionner aléatoirement des options
                const selectIds = ['aff_theme', 'aff_ambiance', 'aff_perso_sugg', 'aff_env_sugg', 'aff_action_sugg', 'aff_palette', 'aff_style_titre'];
                selectIds.forEach(id => {
                    const select = document.getElementById(id);
                    if (select && select.options.length > 1) {
                        // Choisir une option aléatoire (sauf la première 'Choose…')
                        const randomIndex = Math.floor(Math.random() * (select.options.length - 1)) + 1;
                        select.value = select.options[randomIndex].value;
                    }
                });
                
                // Vider les champs custom/texte pour éviter les conflits
                document.getElementById('aff_titre').value = "";
                document.getElementById('aff_sous_titre').value = "";
                document.getElementById('aff_tagline').value = "";
                document.getElementById('aff_theme_custom').value = "";
                document.getElementById('aff_ambiance_custom').value = "";
                document.getElementById('aff_perso_desc').value = "";
                document.getElementById('aff_env_desc').value = "";
                document.getElementById('aff_action_desc').value = "";
                document.getElementById('aff_details').value = "";
                document.getElementById('aff_palette_custom').value = "";
                document.getElementById('aff_style_titre_custom').value = "";

                // Générer immédiatement le prompt après avoir mis à jour les champs
                generatePrompt();
                alert("Paramètres aléatoires appliqués et Prompt généré !");
            });
        }

        // Événement de soumission du formulaire de génération
        const generationForm = document.getElementById('generation-form');
        if (generationForm) {
            generationForm.addEventListener('submit', submitGeneration);
        }

        // Gestion de l'interrupteur des modes (Image vs Affiche)
        const modeCards = document.querySelectorAll('.mode-card');
        const afficheMenu = document.getElementById("affiche-menu");
        const generateButton = document.getElementById('generate-button');
        const afficheGenerateBtnWrapper = document.getElementById("affiche-generate-button-wrapper");

        modeCards.forEach(card => {
            card.addEventListener('click', function() {
                modeCards.forEach(c => c.classList.remove('active-mode'));
                this.classList.add('active-mode');

                const mode = this.dataset.mode;
                
                // Mettre à jour la visibilité des boutons
                if (mode === "affiche") { 
                    if (afficheMenu) afficheMenu.style.display = "block";
                    selectWorkflow("affiche.json"); 

                    if (generateButton) generateButton.style.display = 'none'; // Le bouton de soumission classique est masqué
                    if (afficheGenerateBtnWrapper) afficheGenerateBtnWrapper.style.display = 'block'; // Le bouton 'Generate Prompt' est visible

                } else { // Mode Image
                    if (afficheMenu) afficheMenu.style.display = "none";
                    selectWorkflow("default_image.json"); // Sélectionner un workflow image par défaut

                    if (generateButton) generateButton.style.display = 'block'; // Le bouton de soumission classique est visible
                    if (afficheGenerateBtnWrapper) afficheGenerateBtnWrapper.style.display = 'none'; // Le bouton 'Generate Prompt' est masqué
                }
            });
        });
        
        // INITIALISATION FINAL (SIMULER UN CLIC POUR INITIALISER L'AFFICHAGE)
        const defaultModeCard = document.querySelector(".mode-card.active-mode");
        if (defaultModeCard) {
            // Déclenche l'événement click pour appliquer la logique de visibilité et charger le workflow par défaut
            defaultModeCard.dispatchEvent(new Event('click'));
        }

        // Chargement initial des données
        setInterval(refreshGPU, 10000); // Rafraîchir toutes les 10s
        refreshGPU();
        loadWorkflows(); // Charger les workflows (avec la dépendance d'auth)
        
        // ... Ajouter ici d'autres listeners si nécessaire (e.g., Quick Format, Modal, etc.)
    } 
    // Si non authentifié, seul le code de checkAuthStatusAndDisplayContent() s'est exécuté.
});

// ... (Autres fonctions non listées comme les modals, Quick Format, Copy Params, etc. si elles existent dans l'un des scripts originaux et sont nécessaires) ...
