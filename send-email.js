/**
 * ════════════════════════════════════════════════════
 *  UNIVERS HOLE — Netlify Serverless Function
 *  Fichier : netlify/functions/send-email.js
 *  Rôle    : Proxy sécurisé vers l'API Brevo
 *            La clé API reste côté serveur (variable d'env)
 * ════════════════════════════════════════════════════
 *
 *  DÉPLOIEMENT :
 *  1. Crée un projet sur app.netlify.com
 *  2. Dans Site Settings → Environment Variables, ajoute :
 *       BREVO_API_KEY = ta_cle_brevo
 *  3. Pousse ce projet sur GitHub → Netlify auto-déploie
 *
 *  L'URL de la fonction sera :
 *  https://TON-SITE.netlify.app/.netlify/functions/send-email
 */

const ADMIN_EMAIL    = 'aguehwafiqichola@gmail.com';
const TEMPLATE_USER  = 2;
const TEMPLATE_ADMIN = 3;
const MAX_PIONEERS   = 100;

exports.handler = async (event) => {

  // ── CORS ──────────────────────────────────────────
  const corsHeaders = {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type'                : 'application/json',
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    };
  }

  // ── CLÉS & VALIDATION ─────────────────────────────
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'BREVO_API_KEY non configurée' }),
    };
  }

  // ── PARSE BODY ────────────────────────────────────
  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'JSON invalide' }),
    };
  }

  const { firstName, lastName, email, age, country, motivation, totalUsers } = data;

  if (!firstName || !lastName || !email || !totalUsers) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Champs manquants' }),
    };
  }

  // ── PARAMÈTRES ────────────────────────────────────
  const placesRestantes = MAX_PIONEERS - totalUsers;
  const now             = new Date();
  const date            = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const heure           = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const params = {
    prenom          : firstName,
    nom             : lastName,
    email,
    age             : age        || '—',
    pays            : country    || '—',
    motivation      : motivation || '—',
    numero          : String(totalUsers),
    places_restantes: String(placesRestantes),
    pourcentage     : String(totalUsers),
    date,
    heure,
    unsubscribe     : 'https://univershole.com/unsubscribe',
  };

  // ── FONCTION ENVOI ────────────────────────────────
  async function sendBrevoEmail(templateId, to) {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method : 'POST',
      headers: {
        'accept'      : 'application/json',
        'content-type': 'application/json',
        'api-key'     : BREVO_API_KEY,
      },
      body: JSON.stringify({ templateId, to, params }),
    });
    const json = await res.json();
    return { ok: res.ok, status: res.status, data: json };
  }

  // ── ENVOI DES DEUX EMAILS EN PARALLÈLE ────────────
  const [r1, r2] = await Promise.allSettled([
    sendBrevoEmail(TEMPLATE_USER,  [{ email, name: `${firstName} ${lastName}` }]),
    sendBrevoEmail(TEMPLATE_ADMIN, [{ email: ADMIN_EMAIL, name: 'Admin Univers Hole' }]),
  ]);

  const userResult  = r1.status === 'fulfilled' ? r1.value : { ok: false, error: r1.reason?.message };
  const adminResult = r2.status === 'fulfilled' ? r2.value : { ok: false, error: r2.reason?.message };
  const success     = userResult.ok && adminResult.ok;

  return {
    statusCode: success ? 200 : 500,
    headers   : corsHeaders,
    body      : JSON.stringify({
      success,
      pioneer_number: totalUsers,
      places_left   : placesRestantes,
      userEmail     : userResult,
      adminEmail    : adminResult,
    }),
  };
};
