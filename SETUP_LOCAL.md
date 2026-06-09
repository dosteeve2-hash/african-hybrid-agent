# Setup Local — African Hybrid Agent (Mode Souverain)

Ce guide configure le projet pour fonctionner **100% offline**, sans aucune dépendance aux API externes (OpenAI, Anthropic, etc.).

---

## 1. Installer Ollama

Ollama est un serveur LLM local. Il tourne sur ton PC et expose une API compatible OpenAI.

### Windows
```
winget install Ollama.Ollama
```
Ou télécharge le `.exe` depuis https://ollama.com/download

### macOS
```bash
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

---

## 2. Démarrer le serveur Ollama

```bash
ollama serve
```

Par défaut il écoute sur `http://localhost:11434`. Le laisser tourner en arrière-plan.

---

## 3. Télécharger un modèle

### Recommandé : Llama 3.2 (léger, rapide, multilingue)
```bash
ollama pull llama3.2
```
Taille : ~2 GB. Idéal pour une machine avec 8 GB RAM.

### Autres options
```bash
ollama pull mistral          # 4 GB — plus fort en raisonnement
ollama pull llama3.2:3b      # 2 GB — ultra-léger
ollama pull deepseek-r1:7b   # 4 GB — fort en raisonnement structuré
ollama pull aya:8b           # 5 GB — spécialisé multilingue (arabe, swahili...)
```

Pour voir les modèles disponibles : https://ollama.com/library

---

## 4. Configurer le projet

Crée un fichier `.env.local` à la racine du projet :

```env
# ── LLM Local (Ollama) — SOUVERAIN ──────────────────────────────────────────
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# ── Cloud (optionnel — fallback si Ollama offline) ────────────────────────────
# ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...
```

Si tu n'as pas de clé API cloud, laisse ces lignes en commentaire — le projet fonctionnera quand même avec Ollama.

---

## 5. Lancer le projet

```bash
npm install --legacy-peer-deps
npm run dev
```

Ouvrir : http://localhost:3000

---

## 6. Tester le setup

1. Ouvre l'interface chat
2. Pose une question en français sur l'Afrique de l'Ouest
3. La réponse doit indiquer `provider: ollama` dans les métadonnées
4. Si Ollama n'est pas lancé → le projet bascule automatiquement sur Claude (si clé) ou synthèse locale

---

## 7. Ordre de priorité des LLMs

```
1. Ollama (local)         → Souverain, pas d'internet nécessaire
2. Claude (Anthropic)     → Cloud, qualité maximale
3. OpenAI                 → Cloud, fallback
4. Synthèse locale        → Toujours disponible, extrait brut du corpus
```

---

## 8. Ajouter des données au corpus

Les données africaines sont dans `data/corpus/`. Ajoute des fichiers `.md` :

```
data/corpus/
├── langues-burkina-faso.md            ← Mooré, Dioula, Fulfuldé
├── cultures-ethnies-afrique-ouest.md  ← Mossi, Bambara, Peul, Dogon
├── histoire-royaumes-afrique-ouest.md ← Empires, colonisation, Sankara
├── pratiques-traditionnelles-savoirs.md ← Médecine, agriculture, cérémonies
└── ton-fichier.md                     ← Ajoute tes propres sources
```

Format YAML frontmatter attendu :
```yaml
---
title: Titre du document
sourceType: reference | research | news | official
region: BF | ML | SN | ...
regions: [BF, ML]
credibilityTier: official | high | medium | low
language: fr | en | moore | bambara
tags: [tag1, tag2]
---
## Contenu ici
```

---

## 9. Déploiement souverain (futur)

Pour héberger sur ton propre serveur en Afrique :

```bash
# Sur le serveur Ubuntu
curl -fsSL https://ollama.com/install.sh | sh
ollama serve &
ollama pull llama3.2

# Cloner et démarrer le projet
git clone https://github.com/dosteeve2-hash/african-hybrid-agent
cd african-hybrid-agent
npm install --legacy-peer-deps
npm run build
npm start
```

Variables d'environnement sur le serveur :
```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
NODE_ENV=production
```

---

## Dépannage

**Ollama ne répond pas**
```bash
# Vérifier que le service tourne
curl http://localhost:11434/api/tags
# Redémarrer
ollama serve
```

**Modèle non trouvé**
```bash
ollama list          # Voir les modèles installés
ollama pull llama3.2 # Réinstaller
```

**Réponses en anglais**
Ajoute dans `.env.local` :
```env
OLLAMA_MODEL=mistral   # Mistral parle mieux français
```

**Lenteur** : Llama 3.2 nécessite ~8 GB RAM. Sur 4 GB, utilise `llama3.2:3b`.
