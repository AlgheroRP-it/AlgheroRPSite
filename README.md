# AlgheroRP — Setup Vercel

## Struttura del progetto

```
algherorp/
├── api/
│   └── callback.js      ← Funzione serverless Vercel (OAuth callback)
├── public/
│   └── index.html       ← Sito principale
└── vercel.json          ← Configurazione Vercel
```

## Deploy su Vercel

### 1. Carica su GitHub
- Crea un repo su GitHub chiamato `algherorp`
- Carica tutti e tre i file mantenendo la struttura delle cartelle

### 2. Collega a Vercel
- Vai su vercel.com → "Add New Project"
- Importa il repo GitHub `algherorp`
- Clicca "Deploy" (Vercel rileva tutto in automatico)

### 3. Aggiungi le variabili d'ambiente
Vai su: Vercel → Il tuo progetto → Settings → Environment Variables

Aggiungi queste tre variabili:

| Nome                  | Valore                                      |
|-----------------------|---------------------------------------------|
| ROBLOX_CLIENT_ID      | 6794088596316329561                         |
| ROBLOX_CLIENT_SECRET  | (il tuo secret — non condividerlo mai)      |
| ROBLOX_REDIRECT_URI   | https://TUONOME.vercel.app/api/callback     |

### 4. Aggiorna il Redirect URI su Roblox
- Vai su create.roblox.com/dashboard/credentials
- Apri la tua app OAuth
- Aggiungi il Redirect URI: `https://TUONOME.vercel.app/api/callback`

### 5. Re-deploy
Dopo aver aggiunto le variabili, fai "Redeploy" dal pannello Vercel.

## Note
- Il sito salva il profilo Roblox in localStorage dopo il login
- L'utente rimane loggato finché non clicca "Esci"
- L'app Roblox è in modalità privata (max 10 utenti) finché non la pubblichi
