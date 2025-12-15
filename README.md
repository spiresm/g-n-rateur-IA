# Rubens - Générateur de Contenu IA

Application de génération d'images IA powered by ComfyUI avec authentification Google.

## 🚀 Fonctionnalités

- ✅ **Authentification Google OAuth 2.0**
- ✅ **Génération d'images via ComfyUI**
- ✅ **Mode Affiche avancé** avec paramètres détaillés
- ✅ **Mode Paramètres** pour contrôle manuel complet
- ✅ **Galerie d'images** avec historique
- ✅ **Polling temps réel** avec barre de progression
- ✅ **Gestion d'erreurs** et retry automatique

## 📋 Prérequis

1. **Backend API ComfyUI** déployé sur `https://g-n-rateur-backend-1.onrender.com`
2. **Google OAuth Client ID** configuré
3. Token JWT stocké dans `localStorage` après authentification

## 🔧 Configuration

### 1. Google OAuth

Modifiez `/components/LoginPage.tsx` :

```typescript
const GOOGLE_CLIENT_ID = "VOTRE_CLIENT_ID_GOOGLE";
```

### 2. Backend API

L'URL du backend est configurée dans `/services/api.ts` :

```typescript
const API_BASE_URL = "https://g-n-rateur-backend-1.onrender.com";
```

## 🔐 Authentification

L'application utilise Google OAuth 2.0 :

1. L'utilisateur clique sur "Se connecter avec Google"
2. Redirection vers le backend `/auth/google`
3. Le backend renvoie un JWT token dans l'URL `?token=xxx`
4. Le token est stocké dans `localStorage` et décodé
5. L'utilisateur est authentifié et peut utiliser l'application

### Token JWT

Le token contient :
- `name` : Nom complet
- `given_name` : Prénom
- `picture` : URL de l'avatar
- `email` : Email
- `exp` : Date d'expiration

## 🎨 Utilisation

### Mode Affiche

1. Sélectionnez "Générateur d'Affiches"
2. Remplissez les champs :
   - Titre, sous-titre, tagline
   - Thème/occasion
   - Ambiance
   - Personnage principal
   - Environnement
   - Action
   - Palette de couleurs
   - Style du titre
3. Cliquez sur "Générer le Prompt"
4. Lancez la génération

### Mode Paramètres

1. Sélectionnez "Paramètres de Génération"
2. Configurez :
   - Prompt & Negative Prompt
   - Steps, CFG Scale, Seed
   - Sampler & Scheduler
   - Dimensions
3. Lancez la génération

## 📡 API Endpoints

### `/generate`
- **Méthode** : POST
- **Headers** : `Authorization: Bearer TOKEN`
- **Body** : FormData avec paramètres
- **Retour** : `{ prompt_id: string }`

### `/progress/:promptId`
- **Méthode** : GET
- **Headers** : `Authorization: Bearer TOKEN`
- **Retour** : `{ status: { completed: boolean } }`

### `/result/:promptId`
- **Méthode** : GET
- **Headers** : `Authorization: Bearer TOKEN`
- **Retour** : `{ image_base64: string, filename: string }`

### `/gpu_status`
- **Méthode** : GET
- **Retour** : GPU info (load, memory, temperature)

### `/workflows`
- **Méthode** : GET
- **Retour** : `{ workflows: string[] }`

### `/checkpoints`
- **Méthode** : GET
- **Retour** : `{ checkpoints: string[] }`

## 🏗️ Architecture

```
/
├── contexts/
│   └── AuthContext.tsx          # Contexte d'authentification
├── services/
│   └── api.ts                   # Services API
├── hooks/
│   └── useImageGeneration.ts    # Hook de génération d'images
├── components/
│   ├── Header.tsx               # Header avec user info
│   ├── LoginPage.tsx            # Page de connexion Google
│   ├── ProtectedRoute.tsx       # Protection des routes
│   ├── ProgressOverlay.tsx      # Overlay de progression
│   ├── WorkflowSelector.tsx     # Sélecteur de mode
│   ├── PosterGenerator.tsx      # Générateur d'affiches
│   ├── GenerationParameters.tsx # Paramètres avancés
│   └── PreviewPanel.tsx         # Prévisualisation & galerie
└── App.tsx                      # App principale
```

## 🔄 Flow de Génération

1. **Submit** : Envoi des paramètres → `/generate`
2. **Polling** : Vérification status → `/progress/:id` (toutes les 900ms)
3. **Completion** : Détection de `completed: true`
4. **Fetch** : Récupération image → `/result/:id` (jusqu'à 10 tentatives)
5. **Display** : Affichage base64 dans la galerie

## 🛡️ Sécurité

- Token JWT avec expiration
- Vérification automatique à chaque requête
- Déconnexion automatique si token expiré
- Protection des routes avec `ProtectedRoute`

## 🎯 TODO

- [ ] Ajouter support des workflows vidéo
- [ ] Implémenter la sélection de checkpoints
- [ ] Ajouter le GPU monitoring en temps réel
- [ ] Sauvegarder les favoris en base de données
- [ ] Export de presets de configuration

## 📝 Notes

- **Figma Make** n'est pas conçu pour collecter des données personnelles sensibles
- Le token est stocké en clair dans `localStorage` (OK pour prototypage)
- Pour la production, utiliser httpOnly cookies + refresh tokens
