// api/callback.js — Vercel Serverless Function
// Questo file NON va mai modificato con il tuo secret direttamente.
// Il secret viene letto da ROBLOX_CLIENT_SECRET nelle variabili d'ambiente di Vercel.

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`/?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.status(400).json({ error: 'Codice mancante' });
  }

  const clientId     = process.env.ROBLOX_CLIENT_ID;
  const clientSecret = process.env.ROBLOX_CLIENT_SECRET;
  const redirectUri  = process.env.ROBLOX_REDIRECT_URI;

  try {
    // Scambio codice → token
    const tokenRes = await fetch('https://apis.roblox.com/oauth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        redirect_uri:  redirectUri,
        client_id:     clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('Token error:', errBody);
      return res.redirect('/?error=token_failed');
    }

    const { access_token } = await tokenRes.json();

    // Recupera profilo utente Roblox
    const userRes = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) {
      return res.redirect('/?error=userinfo_failed');
    }

    const user = await userRes.json();
    // user contiene: sub (userId), name (username), profile (URL profilo), picture

    // Reindirizza alla homepage con i dati utente nell'URL
    const params = new URLSearchParams({
      roblox_id:       user.sub,
      roblox_username: user.name        || 'Giocatore',
      roblox_display:  user.displayName || user.name || 'Giocatore',
      roblox_picture:  user.picture     || '',
    });

    return res.redirect(`/?${params.toString()}`);

  } catch (err) {
    console.error('OAuth error:', err);
    return res.redirect('/?error=server_error');
  }
}
