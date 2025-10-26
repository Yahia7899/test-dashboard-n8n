# 🤖 Assistant IA - Chatbot

Interface de chat minimaliste et élégante pour discuter avec une intelligence artificielle propulsée par n8n.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)

## ✨ Fonctionnalités

- 💬 **Interface chat** : Design moderne inspiré de ChatGPT
- ⚡ **Temps réel** : Réponses instantanées de votre IA
- 🎨 **Design élégant** : Fond sombre, gradients violet/cyan
- 📱 **Responsive** : Fonctionne sur tous les écrans
- ⌨️ **Raccourcis clavier** : Entrée pour envoyer, Shift+Entrée pour nouvelle ligne
- 🔄 **Auto-scroll** : Scroll automatique vers le dernier message
- ⏳ **États de chargement** : Indicateur visuel pendant le traitement
- ❌ **Gestion d'erreurs** : Messages d'erreur clairs et élégants

## 🚀 Installation

### 1. Cloner et installer

```bash
git clone https://github.com/votre-repo/chatbot-ia.git
cd chatbot-ia
npm install
```

### 2. Lancer l'application

```bash
npm run dev
```

### 3. Ouvrir dans le navigateur

Visitez [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Webhook n8n

L'URL du webhook n8n est configurée dans `/app/api/chat/route.ts` :

```typescript
const WEBHOOK_URL = 'https://n8n.srv971532.hstgr.cloud/webhook/8d037ba8-73a9-4d3a-af62-393e2a1084c2'
```

Pour changer l'URL, modifiez cette constante.

### Format de communication

**Le chatbot envoie au webhook :**
```json
{
  "message": "Question de l'utilisateur",
  "timestamp": "2025-10-26T15:00:00.000Z"
}
```

**Le webhook doit retourner :**
```json
{
  "response": "Réponse de l'IA"
}
```

ou

```json
{
  "message": "Réponse de l'IA"
}
```

## 🎨 Design

### Palette de couleurs

- **Fond** : `#0B0F1A` (Bleu très foncé)
- **Messages utilisateur** : Gradient Purple → Cyan
- **Messages IA** : Fond semi-transparent blanc/5%
- **Accents** : Purple `#a855f7` et Cyan `#06b6d4`

### Composants

- **Header** : Logo avec effet glow + titre
- **Zone de messages** : Scroll automatique, bulles arrondies
- **Input** : Textarea extensible avec bouton d'envoi
- **États** : Loading spinner, messages d'erreur

## 📁 Structure du projet

```
/
├── app/
│   ├── api/
│   │   └── chat/route.ts      # API pour communiquer avec n8n
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Page de chat
│   └── globals.css             # Styles globaux
├── lib/
│   └── types.ts                # Types TypeScript
└── package.json
```

## 🔧 Configuration n8n

### Workflow recommandé

```
┌──────────────┐     ┌────────────┐     ┌──────────────────┐
│   Webhook    │────▶│ Traitement │────▶│   Respond to     │
│   Trigger    │     │  (AI/RAG)  │     │    Webhook       │
└──────────────┘     └────────────┘     └──────────────────┘
```

### Configuration du Webhook Trigger

- **Method** : POST
- **Path** : `/webhook/votre-id`

### Configuration Respond to Webhook

```json
{
  "response": "{{ $json.votre_reponse_ia }}"
}
```

## 🛠️ Développement

### Scripts disponibles

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer en production
npm start

# Linter
npm run lint
```

### Technologies utilisées

- **Next.js 16** : Framework React
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styles utilitaires
- **Lucide React** : Icônes (Send, Loader2, Sparkles)

## 🎯 Utilisation

### Envoyer un message

1. Tapez votre message dans la zone de texte
2. Appuyez sur **Entrée** ou cliquez sur le bouton **Envoyer**
3. Le message est envoyé au webhook n8n
4. La réponse s'affiche automatiquement

### Raccourcis clavier

- **Entrée** : Envoyer le message
- **Shift + Entrée** : Nouvelle ligne

## 🐛 Dépannage

### Le chatbot ne répond pas

1. Vérifiez que votre workflow n8n est **activé**
2. Vérifiez l'URL du webhook dans `/app/api/chat/route.ts`
3. Vérifiez que le webhook retourne bien `response` ou `message`

### Erreur de timeout

Le timeout est de 30 secondes. Si votre IA prend plus de temps :

```typescript
// Dans /app/api/chat/route.ts
signal: AbortSignal.timeout(60000), // 60 secondes
```

### Erreur de CORS

Si vous hébergez n8n sur un domaine différent, ajoutez les headers CORS dans n8n.

## 📝 Exemples de prompts

```
"Bonjour, tu es qui ?"
"Explique-moi comment fonctionne l'IA"
"Quelle est la capitale de la France ?"
"Écris-moi un poème sur l'océan"
```

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Variables d'environnement

Aucune variable d'environnement n'est requise pour le fonctionnement de base.

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 💡 Support

Pour toute question, créez une issue sur GitHub.

---

**Fait avec ❤️ et Next.js**
