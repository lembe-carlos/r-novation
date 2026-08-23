// ══════════════════════════════════════════════════════════════
//  KAMER ADS — Régie publicitaire KAMER360
//  Annonces sponsorisées payantes (CPC / CPM)
// ══════════════════════════════════════════════════════════════

var KAMER_ADS = [];
var ADS_TARIF_CPC = 50;   // FCFA par clic
var ADS_TARIF_CPM = 5;    // FCFA pour 1000 vues

function _adsBackendUrl() {
  var url = 'https://kamer360-backend-production.up.railway.app';
  if (typeof SM_CONFIG !== 'undefined' && SM_CONFIG.backend) {
    url = typeof SM_CONFIG.backend === 'string' ? SM_CONFIG.backend : (SM_CONFIG.backend.url || url);
  }
  return url;
}

// ── Charger les annonces du gérant connecté ──
async function chargerAdsGerant() {
  try {
    var sb = typeof _sbMain === 'function' ? _sbMain() : null;
    if (!sb || !currentUser) return;
    var res = await sb.from('kamer360_ads').select('*').eq('gerant_email', currentUser.email).order('created_at', { ascending: false });
    if (res.data) {
      KAMER_ADS = res.data;
      renderAdsListe();
    }
  } catch(e) { _logErr('chargerAdsGerant', e); }
}

function initPageKamerAds() {
  chargerAdsGerant();
}

// ── Afficher la liste des annonces du gérant ──
function renderAdsListe() {
  var z = document.getElementById('ads-liste');
  if (!z) return;

  var actives = KAMER_ADS.filter(function(a){ return a.statut === 'active'; });
  var totalVues = KAMER_ADS.reduce(function(s,a){ return s + (a.nb_vues||0); }, 0);
  var totalClics = KAMER_ADS.reduce(function(s,a){ return s + (a.nb_clics||0); }, 0);
  var totalDepense = KAMER_ADS.reduce(function(s,a){ return s + (a.budget_depense||0); }, 0);

  var elA = document.getElementById('ads-nb-actives');   if (elA) elA.textContent = actives.length;
  var elV = document.getElementById('ads-total-vues');   if (elV) elV.textContent = totalVues.toLocaleString('fr-FR');
  var elC = document.getElementById('ads-total-clics');  if (elC) elC.textContent = totalClics.toLocaleString('fr-FR');
  var elD = document.getElementById('ads-total-depense'); if (elD) elD.textContent = totalDepense.toLocaleString('fr-FR');

  if (KAMER_ADS.length === 0) {
    z.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:50px 20px;color:#999"><div style="font-size:40px;margin-bottom:10px">📢</div><div style="font-weight:700;margin-bottom:4px">Aucune annonce pour le moment</div><div style="font-size:13px">Créez votre première campagne pour booster vos ventes</div></div>';
    return;
  }

  var statutColors = {
    en_attente: { bg:'#fef3c7', tx:'#92400e', lbl:'⏳ En attente' },
    active:     { bg:'#d1fae5', tx:'#065f46', lbl:'🟢 Active' },
    suspendue:  { bg:'#fee2e2', tx:'#991b1b', lbl:'⏸ Suspendue' },
    terminee:   { bg:'#f3f4f6', tx:'#374151', lbl:'✅ Terminée' },
  };

  z.innerHTML = KAMER_ADS.map(function(a) {
    var st = statutColors[a.statut] || statutColors.en_attente;
    var pctBudget = a.budget_total > 0 ? Math.min(100, Math.round((a.budget_depense||0) / a.budget_total * 100)) : 0;
    return '<div style="border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;background:#fff">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">'
      +   '<div style="font-weight:800;font-size:14px;color:#111">' + _escHtml(a.titre) + '</div>'
      +   '<span style="background:' + st.bg + ';color:' + st.tx + ';font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;white-space:nowrap">' + st.lbl + '</span>'
      + '</div>'
      + '<div style="font-size:12px;color:#6b7280;margin-bottom:10px">' + _escHtml(a.description||'') + '</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;font-size:11px;text-align:center">'
      +   '<div><div style="font-weight:800;color:#3b82f6">' + (a.nb_vues||0).toLocaleString('fr-FR') + '</div><div style="color:#9ca3af">Vues</div></div>'
      +   '<div><div style="font-weight:800;color:#f59e0b">' + (a.nb_clics||0).toLocaleString('fr-FR') + '</div><div style="color:#9ca3af">Clics</div></div>'
      +   '<div><div style="font-weight:800;color:#007A3D">' + (a.budget_total - (a.budget_depense||0)).toLocaleString('fr-FR') + '</div><div style="color:#9ca3af">FCFA restant</div></div>'
      + '</div>'
      + '<div style="height:6px;background:#f3f4f6;border-radius:10px;overflow:hidden;margin-bottom:10px">'
      +   '<div style="height:100%;width:' + pctBudget + '%;background:#007A3D"></div>'
      + '</div>'
      + (a.statut === 'active' ? '<button onclick="suspendreAnnonceAds(\'' + a.id + '\')" style="width:100%;padding:8px;background:#fee2e2;color:#991b1b;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">⏸ Suspendre</button>' : '')
      + '</div>';
  }).join('');
}

// ── Créer une nouvelle annonce + payer ──
async function creerAnnonceAds() {
  var titre = (document.getElementById('ads-titre') || {}).value || '';
  var description = (document.getElementById('ads-description') || {}).value || '';
  var lien = (document.getElementById('ads-lien') || {}).value || '';
  var emplacement = (document.getElementById('ads-emplacement') || {}).value || 'boutique_accueil';
  var budget = parseInt((document.getElementById('ads-budget') || {}).value) || 0;

  if (!titre.trim()) { toast('Le titre est requis', 'warning'); return; }
  if (budget < 1000) { toast('Le budget minimum est de 1 000 FCFA', 'warning'); return; }
  if (!currentUser) { toast('Vous devez être connecté', 'error'); return; }

  closeM('m-ads');

  var modal = document.getElementById('m-paiement-embed');
  if (!modal) {
    // Fallback sans modal de paiement intégré (mode test direct)
    await _activerAnnonceAds(titre, description, lien, emplacement, budget, 'test_sans_modal');
    return;
  }

  document.getElementById('pe-titre').textContent = '📢 Campagne KAMER Ads';
  document.getElementById('pe-cmd-num').textContent = 'ADS-' + Date.now().toString().slice(-6);
  document.getElementById('pe-montant').textContent = budget.toLocaleString('fr-FR') + ' FCFA';
  ['pe-view-mobile', 'pe-view-carte', 'pe-view-resultat'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.style.display = 'none';
  });
  document.getElementById('pe-view-carte').style.display = 'flex';
  document.getElementById('pe-close-btn').style.display = 'flex';
  modal.style.display = 'flex';

  var reference = 'ADS-' + Date.now();

  try {
    var res = await fetch(_adsBackendUrl() + '/api/paiement/initier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        montant: budget, email: currentUser.email, nom: currentUser.email,
        description: 'Campagne KAMER Ads — ' + titre,
        reference: reference, canal: 'card'
      })
    });
    var data = await res.json();

    if (data.success && data.payment_url) {
      if (data.mode === 'test') {
        setTimeout(async function() {
          await _activerAnnonceAds(titre, description, lien, emplacement, budget, reference);
          document.getElementById('m-paiement-embed').style.display = 'none';
        }, 1200);
        return;
      }
      var iframe = document.getElementById('pe-carte-iframe');
      iframe.src = data.payment_url;
      iframe.onload = function() {
        document.getElementById('pe-carte-loading').style.display = 'none';
        iframe.style.display = 'block';
      };
      window._peInterval = setInterval(function() {
        _adsVerifierStatut(reference, titre, description, lien, emplacement, budget);
      }, 4000);
    } else {
      throw new Error(data.error || 'Erreur initialisation paiement');
    }
  } catch(e) {
    _logErr('creerAnnonceAds', e);
    toast('Paiement indisponible. Réessayez.', 'error');
  }
}

async function _adsVerifierStatut(reference, titre, description, lien, emplacement, budget) {
  try {
    var res = await fetch(_adsBackendUrl() + '/api/paiement/statut/' + reference);
    var data = await res.json();
    if (data.status === 'complete' || data.status === 'success') {
      if (window._peInterval) { clearInterval(window._peInterval); window._peInterval = null; }
      await _activerAnnonceAds(titre, description, lien, emplacement, budget, reference);
      document.getElementById('m-paiement-embed').style.display = 'none';
    } else if (data.status === 'failed' || data.status === 'declined') {
      if (window._peInterval) { clearInterval(window._peInterval); window._peInterval = null; }
      toast('Paiement refusé', 'error');
      document.getElementById('m-paiement-embed').style.display = 'none';
    }
  } catch(e) { _logErr('_adsVerifierStatut', e); }
}

async function _activerAnnonceAds(titre, description, lien, emplacement, budget, reference) {
  try {
    var sb = typeof _sbMain === 'function' ? _sbMain() : null;
    if (sb) {
      await sb.from('kamer360_ads').insert({
        gerant_email: currentUser.email, titre: titre, description: description,
        lien_produit: lien, emplacement: emplacement, budget_total: budget,
        cout_par_clic: ADS_TARIF_CPC, cout_par_vue: ADS_TARIF_CPM,
        statut: 'active', date_debut: new Date().toISOString().slice(0,10)
      });
    }
    toast('Campagne "' + titre + '" lancée avec succès !', 'success');
    chargerAdsGerant();
  } catch(e) { _logErr('_activerAnnonceAds', e); }
}

async function suspendreAnnonceAds(id) {
  try {
    var sb = typeof _sbMain === 'function' ? _sbMain() : null;
    if (sb) await sb.from('kamer360_ads').update({ statut: 'suspendue' }).eq('id', id);
    toast('Annonce suspendue', 'success');
    chargerAdsGerant();
  } catch(e) { _logErr('suspendreAnnonceAds', e); }
}

// ══════════════════════════════════════════════════════════════
//  API PUBLIQUE — Génération de clé développeur
// ══════════════════════════════════════════════════════════════
async function genererCleApi() {
  var nomApp = (document.getElementById('api-nom-app') || {}).value || '';
  var email = (document.getElementById('api-email-dev') || {}).value || '';

  if (!nomApp.trim()) { toast('Le nom de l\u2019application est requis', 'warning'); return; }
  if (!email.trim() || !email.includes('@')) { toast('Email valide requis', 'warning'); return; }

  try {
    var res = await fetch(_adsBackendUrl() + '/api/v1/keys/generer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom_app: nomApp, email_dev: email })
    });
    var data = await res.json();

    if (data.success) {
      document.getElementById('api-cle-valeur').textContent = data.cle_api;
      document.getElementById('api-cle-resultat').style.display = 'block';
      toast('Clé API générée avec succès !', 'success');
    } else {
      toast(data.error || 'Erreur lors de la génération', 'error');
    }
  } catch(e) {
    _logErr('genererCleApi', e);
    toast('Service indisponible. Réessayez plus tard.', 'error');
  }
}
