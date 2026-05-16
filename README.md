# 🌌 Univers Hole — Guide de déploiement

## Structure du projet

```
univers-hole-project/
├── public/
│   ├── index.html                     ← Page d'accueil principale
│   └── univers-plus-registration.html ← Page inscription pionniers
│
├── netlify/
│   └── functions/
│       └── send-email.js              ← Function serverless (Netlify)
│
├── api/
│   └── send-email.js                  ← Function serverless (Vercel)
│
├── netlify.toml                       ← Config Netlify
├── vercel.json                        ← Config Vercel
└── README.md                          ← Ce fichier
```

---

## 🚀 Déploiement sur NETLIFY (recommandé — gratuit)

### Étape 1 — GitHub
1. Crée un compte GitHub si tu n'en as pas
2. Crée un nouveau repository : `univers-hole`
3. Upload tous les fichiers de ce dossier dedans

### Étape 2 — Netlify
1. Va sur **app.netlify.com** → "Add new site" → "Import from GitHub"
2. Connecte ton GitHub et sélectionne le repo `univers-hole`
3. Paramètres de build :
   - **Publish directory** : `public`
   - **Functions directory** : `netlify/functions`
4. Clique **Deploy site**

### Étape 3 — Variable d'environnement (CLÉ API)
1. Dans ton site Netlify → **Site configuration → Environment variables**
2. Clique **Add a variable**
3. Key : `BREVO_API_KEY`
4. Value : `ta_nouvelle_cle_brevo_xkeysib-...`
5. Clique **Save** puis **Trigger deploy**

### Résultat
- Site : `https://ton-site.netlify.app`
- Fonction : `https://ton-site.netlify.app/api/send-email`

---

## ⚡ Déploiement sur VERCEL

### Étape 1 — GitHub (même chose)
Upload les fichiers sur un repo GitHub.

### Étape 2 — Vercel
1. Va sur **vercel.com** → "Add New Project"
2. Importe depuis GitHub
3. Framework Preset : **Other**
4. Root Directory : laisser vide
5. Clique **Deploy**

### Étape 3 — Variable d'environnement
1. Dans ton projet Vercel → **Settings → Environment Variables**
2. Name : `BREVO_API_KEY`
3. Value : `ta_nouvelle_cle_brevo`
4. Environment : **Production + Preview + Development**
5. **Save** → **Redeploy**

### Résultat
- Site : `https://ton-site.vercel.app`
- Fonction : `https://ton-site.vercel.app/api/send-email`

---

## ⚠️ Sécurité — À faire AVANT le déploiement

1. **Regénère ta clé Brevo** sur brevo.com → Settings → API Keys
2. **Ne mets JAMAIS** la clé dans le code HTML ou JS
3. La clé doit uniquement être dans les variables d'environnement Netlify/Vercel
4. En production, remplace `Access-Control-Allow-Origin: *` par ton domaine réel

---

## 🧪 Tester en local

```bash
# Netlify CLI
npm install -g netlify-cli
netlify dev

# Vercel CLI
npm install -g vercel
vercel dev
```

---

## 📧 Configuration Brevo

- Template #2 : Confirmation utilisateur
- Template #3 : Notification admin → aguehwafiqichola@gmail.com
- Variables utilisées : prenom, nom, email, age, pays, motivation,
                        numero, places_restantes, pourcentage, date, heure
