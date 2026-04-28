// netlify/functions/callback.js
// Questa funzione gira su Netlify — il client_secret è al sicuro nelle variabili d'ambiente

exports.handler = async function(event) {
  const params   = event.queryStringParameters || {};
  const code     = params.code;
  const error    = params.error;

  const siteUrl  = process.env.SITE_URL;   // es. https://algherorpememergencyhamburg.netlify.app

  if (error) {
    return redirect(`${siteUrl}/?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return { statusCode: 400, body: 'Codice mancante' };
  }

  const clientId     = process.env.ROBLOX_CLIENT_ID;
  const clientSecret = process.env.ROBLOX_CLIENT_SECRET;
  const redirectUri  = `${siteUrl}/.netlify/functions/callback`;

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
      return redirect(`${siteUrl}/?error=token_failed`);
    }

    const { access_token } = await tokenRes.json();

    // Recupera profilo utente Roblox
    const userRes = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) {
      return redirect(`${siteUrl}/?error=userinfo_failed`);
    }

    const user = await userRes.json();

    const qs = new URLSearchParams({
      roblox_id:       user.sub,
      roblox_username: user.name        || 'Giocatore',
      roblox_display:  user.displayName || user.name || 'Giocatore',
      roblox_picture:  user.picture     || '',
    });

    return redirect(`${siteUrl}/?${qs.toString()}`);

  } catch (err) {
    console.error('OAuth error:', err);
    return redirect(`${siteUrl}/?error=server_error`);
  }
};

function redirect(url) {
  return {
    statusCode: 302,
    headers: { Location: url },
    body: '',
  };
}
