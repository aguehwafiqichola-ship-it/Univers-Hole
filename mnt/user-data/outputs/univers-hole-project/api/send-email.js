/**
 * ════════════════════════════════════════════════════
 *  UNIVERS HOLE — Vercel Serverless Function
 *  Fichier : api/send-email.js
 *  Rôle    : Proxy sécurisé vers l'API Brevo
 *
 *  DÉPLOIEMENT :
 *  1. Crée un projet sur vercel.com
 *  2. Dans Settings → Environment Variables, ajoute :
 *       BREVO_API_KEY = ta_cle_brevo
 *  3. Pousse sur GitHub → Vercel auto-déploie
 *
 *  L'URL de la fonction sera :
 *  https://TON-SITE.vercel.app/api/send-email
 * ════════════════════════════════════════════════════
 */

const ADMIN_EMAIL    = 'aguehwafiqichola@gmail.com';
const TEMPLATE_USER  = 2;
const TEMPLATE_ADMIN = 3;
const MAX_PIONEERS   = 100;

export default async function handler(req, res) {

  // ── CORS ──────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ success: false, error: 'Method not allowed' });

  // ── CLÉ API ───────────────────────────────────────
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    return res.status(500).json({ success: false, error: 'BREVO_API_KEY non configurée dans Vercel' });
  }

  // ── PARSE ─────────────────────────────────────────
  const { firstName, lastName, email, age, country, motivation, totalUsers } = req.body;

  if (!firstName || !lastName || !email || !totalUsers) {
    return res.status(400).json({ success: false, error: 'Champs manquants' });
  }

  // ── PARAMÈTRES ────────────────────────────────────
  const placesRestantes = MAX_PIONEERS - totalUsers;
  const now   = new Date();
  const date  = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

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

  // ── ENVOI BREVO ───────────────────────────────────
  async function sendBrevoEmail(templateId, to) {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method : 'POST',
      headers: {
        'accept'      : 'application/json',
        'content-type': 'application/json',
        'api-key'     : BREVO_API_KEY,
      },
      body: JSON.stringify({ templateId, to, params }),
    });
    const json = await r.json();
    return { ok: r.ok, status: r.status, data: json };
  }

  // Envoi en parallèle
  const [r1, r2] = await Promise.allSettled([
    sendBrevoEmail(TEMPLATE_USER,  [{ email, name: `${firstName} ${lastName}` }]),
    sendBrevoEmail(TEMPLATE_ADMIN, [{ email: ADMIN_EMAIL, name: 'Admin Univers Hole' }]),
  ]);

  const userResult  = r1.status === 'fulfilled' ? r1.value : { ok: false, error: r1.reason?.message };
  const adminResult = r2.status === 'fulfilled' ? r2.value : { ok: false, error: r2.reason?.message };
  const success     = userResult.ok && adminResult.ok;

  return res.status(success ? 200 : 500).json({
    success,
    pioneer_number: totalUsers,
    places_left   : placesRestantes,
    userEmail     : userResult,
    adminEmail    : adminResult,
  });
}
