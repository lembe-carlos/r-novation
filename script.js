// ══════════════════════════════════════════════════════════════
//  GESTIONNAIRE D'ERREURS CENTRALISÉ — kamer360
//  Remplace les catch vides par un logging silencieux en prod
// ══════════════════════════════════════════════════════════════
var _K360_DEBUG = window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1';

function _logErr(context, error) {
  if (_K360_DEBUG) {
    console.warn('[KAMER360 ERROR]', context, error);
  }
  // En production : envoyer à Supabase pour analyse (optionnel)
  // try { _sbMain().from('error_logs').insert({ctx: context, msg: String(error), ts: new Date().toISOString()}); } catch(e) {}
}

function _logPaymentErr(context, error) {
  console.error('[KAMER360 PAIEMENT]', context, error);
  if (typeof toast === 'function') {
    toast('Erreur de paiement. Contactez le support : +237 693 59 14 79', 'error');
  }
}

function _logOrderErr(context, error) {
  console.error('[KAMER360 COMMANDE]', context, error);
  if (typeof toast === 'function') {
    toast('Erreur lors de la commande. Réessayez ou contactez le support.', 'error');
  }
}


// ═══════════════ CONFIGURATION BOUTIQUE ═══════════════
var CFG_DEFAULT = {
 nom: 'KAMER360 — NGAPET LEMBE',
 desc: 'La première plateforme de courses en ligne au Cameroun. Produits frais, prix compétitifs, livraison rapide partout au pays.',
 adresse: 'Bepanda, Douala, Cameroun',
 tel: '+237 683 39 22 68',
 email: 'lembetiny02@gmail.com',
 wa: '237683392268',
 annee: '2026',
 devise: 'FCFA',
 mtn: '683 39 22 68',
 orange: '693 59 14 79'
};

var CFG = Object.assign({}, CFG_DEFAULT);

// ── Recherche ville en temps réel (formulaire inscription) ──
function initVilleSearchLive(input) {
 var q = (input.value || '').trim().toLowerCase();
 var list = document.getElementById('r-ville-list');
 var hidden = document.getElementById('r-ville');
 if (hidden) hidden.value = input.value.trim();
 if (!list) return;
 if (q.length < 1) { list.style.display = 'none'; return; }

 var resultats = CAMEROUN_VILLES.filter(function(v) {
 return v.ville.toLowerCase().includes(q) ||
 v.dept.toLowerCase().includes(q) ||
 v.region.toLowerCase().includes(q);
 }).slice(0, 12);

 if (resultats.length === 0) {
 list.innerHTML = '<div style="padding:10px 14px;color:#999;font-size:13px">Aucune ville trouvée</div>';
 list.style.display = 'block';
 return;
 }
 list.innerHTML = resultats.map(function(v) {
 var safe = v.ville.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
 return '<div onclick="selectionnerVilleInscription(\'' + safe + '\')" '
 + 'style="padding:9px 14px;cursor:pointer;border-bottom:1px solid #f0f0f0;font-size:13px" '
 + 'onmouseover="this.style.background=\'#f0faf5\'" onmouseout="this.style.background=\'#fff\'">'
 + '<span style="font-weight:600;color:#111">' + v.ville + '</span>'
 + ' <span style="font-size:11px;color:#999">' + v.dept + ' — ' + v.region + '</span>'
 + '</div>';
 }).join('');
 list.style.display = 'block';
}

function selectionnerVilleInscription(ville) {
 var input = document.getElementById('r-ville-search');
 var hidden = document.getElementById('r-ville');
 var list = document.getElementById('r-ville-list');
 if (input) input.value = ville;
 if (hidden) hidden.value = ville;
 if (list) list.style.display = 'none';
}

function chargerConfig() {
 try {
 var saved = JSON.parse(localStorage.getItem('sm_config') || 'null');
 if (saved) CFG = Object.assign({}, CFG_DEFAULT, saved);
 } catch(e) { _logErr("script.js", e); }
 // Remplir les champs du formulaire
 var champs = ['nom','desc','adresse','tel','email','wa','annee','devise','mtn','orange'];
 champs.forEach(function(k) {
 var el = document.getElementById('cfg-' + k);
 if (el) el.value = CFG[k] || '';
 });
 mettreAJourApercu();
}

function sauvegarderConfig() {
 CFG.nom = document.getElementById('cfg-nom').value.trim() || CFG_DEFAULT.nom;
 CFG.desc = document.getElementById('cfg-desc').value.trim() || CFG_DEFAULT.desc;
 CFG.adresse = document.getElementById('cfg-adresse').value.trim() || CFG_DEFAULT.adresse;
 CFG.tel = document.getElementById('cfg-tel').value.trim() || CFG_DEFAULT.tel;
 CFG.email = document.getElementById('cfg-email').value.trim() || CFG_DEFAULT.email;
 CFG.wa = document.getElementById('cfg-wa').value.trim() || CFG_DEFAULT.wa;
 CFG.annee = document.getElementById('cfg-annee').value.trim() || CFG_DEFAULT.annee;
 CFG.devise = document.getElementById('cfg-devise').value || 'FCFA';
 CFG.mtn = document.getElementById('cfg-mtn').value.trim() || CFG_DEFAULT.mtn;
 CFG.orange = document.getElementById('cfg-orange').value.trim() || CFG_DEFAULT.orange;

 try { localStorage.setItem('sm_config', JSON.stringify(CFG)); } catch(e) { _logErr("script.js", e); }

 mettreAJourApercu();
 toast('Paramètres sauvegardés ! La boutique est mise à jour.', 'success');
 addNotif('Paramètres boutique mis à jour', 'green');
}

function sauvegarderNotifs() {
 var notifs = {
 rupture: document.getElementById('notif-rupture').checked,
 cmd: document.getElementById('notif-cmd').checked,
 client: document.getElementById('notif-client').checked,
 resume: document.getElementById('notif-resume').checked
 };
 try { localStorage.setItem('sm_notifs', JSON.stringify(notifs)); } catch(e) { _logErr("script.js", e); }
 toast('Préférences de notifications sauvegardées !', 'success');
}

function mettreAJourApercu() {
 // Mettre à jour l'aperçu en temps réel dans Paramètres
 var getNom = function() { var el = document.getElementById('cfg-nom'); return el ? el.value || CFG.nom : CFG.nom; };
 var getDesc = function() { var el = document.getElementById('cfg-desc'); return el ? el.value || CFG.desc : CFG.desc; };
 var getAdr = function() { var el = document.getElementById('cfg-adresse'); return el ? el.value || CFG.adresse : CFG.adresse; };
 var getTel = function() { var el = document.getElementById('cfg-tel'); return el ? el.value || CFG.tel : CFG.tel; };
 var getEm = function() { var el = document.getElementById('cfg-email'); return el ? el.value || CFG.email : CFG.email; };
 var getAn = function() { var el = document.getElementById('cfg-annee'); return el ? el.value || CFG.annee : CFG.annee; };

 var set = function(id, txt) { var el = document.getElementById(id); if(el) el.innerHTML = txt; };
 set('ap-nom', getNom());
 set('ap-desc', getDesc());
 set('ap-adresse', '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7EC8A0\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"vertical-align:middle;margin-right:5px\"><path d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle></svg> ' + getAdr());
 set('ap-tel', '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7EC8A0\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"vertical-align:middle;margin-right:5px\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z\"></path></svg> ' + getTel());
 set('ap-email', '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7EC8A0\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"vertical-align:middle;margin-right:5px\"><path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"></path><polyline points=\"22,6 12,13 2,6\"></polyline></svg> ' + getEm());
 set('ap-copy', '' + getAn() + '' + getNom() + ' — Tous droits réservés <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7EC8A0\" stroke-width=\"2\" style=\"vertical-align:middle;margin-right:3px\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"18\" fill=\"#007A3D\"></rect><rect x=\"10\" y=\"3\" width=\"4\" height=\"18\" fill=\"#CE1126\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"18\" fill=\"#FCD116\"></rect></svg>');

 // Magasins dans l'aperçu
 var apMag = document.getElementById('ap-magasins');
 if (apMag) apMag.innerHTML = STORES.map(function(s){ return '<div>' + s.nom + '</div>'; }).join('');
}

// Mise à jour en direct pendant la frappe
function initConfigLivePreview() {
 var champs = ['cfg-nom','cfg-desc','cfg-adresse','cfg-tel','cfg-email','cfg-annee'];
 champs.forEach(function(id) {
 var el = document.getElementById(id);
 if (el) el.addEventListener('input', mettreAJourApercu);
 });
}

// ═══════════════ COMPTES ═══════════════

// ═══════════════════════════════════════════════════════
// SYSTÈME CODES D'INVITATION
// ═══════════════════════════════════════════════════════

// Codes actifs — l'admin peut en ajouter depuis le tableau de bord
var CODES_INVITATION = [];
var CODES_CHARGES_SUPABASE = false;

// ── Codes par défaut toujours valides (fallback hors-ligne) ──
var CODES_DEFAUT = [
  { code: 'SM-GERANT-2026', role: 'Gérant(e)',          usages: 0, maxUsages: 50, actif: true, cree: '01/01/2026' },
  { code: 'SM-CAISSIER-26', role: 'Caissier(e)',         usages: 0, maxUsages: 20, actif: true, cree: '01/01/2026' },
  { code: 'SM-LIVREUR-2026',role: 'Livreur',             usages: 0, maxUsages: 20, actif: true, cree: '01/01/2026' },
];

function initCodesInvitation() {
  try {
    // 1. Charger les codes par défaut
    CODES_INVITATION = CODES_DEFAUT.slice();
    // 2. Fusionner avec localStorage
    var saved = JSON.parse(localStorage.getItem('sm_codes_invitation') || 'null');
    if (saved && Array.isArray(saved)) {
      saved.forEach(function(c) {
        var existe = CODES_INVITATION.find(function(x){ return x.code === c.code; });
        if (!existe) CODES_INVITATION.push(c);
        else { existe.usages = c.usages; existe.actif = c.actif; }
      });
    }
    // 3. Charger depuis Supabase en arrière-plan (codes créés depuis d'autres appareils)
    chargerCodesSupabase();
  } catch(e) { CODES_INVITATION = CODES_DEFAUT.slice(); }
}

function saveCodesInvitation() {
  try {
    // Sauvegarder dans localStorage
    localStorage.setItem('sm_codes_invitation', JSON.stringify(CODES_INVITATION));
    // Synchroniser avec Supabase de façon asynchrone
    _syncCodesSupabase();
  } catch(e) { _logErr("script.js", e); }
}

// ── Synchronisation Supabase ──
async function _syncCodesSupabase() {
  try {
    var sb = _sbMain(); if (!sb) return;
    // Upsert tous les codes sauf les codes par défaut (pas besoin de les sync)
    var codesASync = CODES_INVITATION.filter(function(c) {
      return !CODES_DEFAUT.find(function(d){ return d.code === c.code; });
    });
    if (codesASync.length === 0) return;
    for (var i = 0; i < codesASync.length; i++) {
      var c = codesASync[i];
      var res = await sb.from('codes_invitation').upsert({
        code:       c.code,
        role:       c.role,
        usages:     c.usages,
        max_usages: c.maxUsages,
        actif:      c.actif,
        cree_le:    c.cree || new Date().toISOString()
      }, { onConflict: 'code' });
      if (res.error) console.warn('[Codes] Sync erreur:', res.error.message);
    }
    console.log('[Codes] ' + codesASync.length + ' codes synchronisés vers Supabase');
  } catch(e) { console.warn('[Codes] Sync Supabase:', e); }
}

async function chargerCodesSupabase() {
  try {
    var sb = _sbMain(); if (!sb) return;
    var res = await sb.from('codes_invitation').select('*').order('cree_le');
    if (res.data && res.data.length > 0) {
      // Fusionner avec les codes par défaut
      CODES_INVITATION = CODES_DEFAUT.slice();
      res.data.forEach(function(c) {
        var existe = CODES_INVITATION.find(function(x){ return x.code === c.code; });
        if (existe) {
          existe.usages = c.usages;
          existe.actif  = c.actif;
        } else {
          CODES_INVITATION.push({
            code: c.code, role: c.role,
            usages: c.usages, maxUsages: c.max_usages,
            actif: c.actif, cree: c.cree_le
          });
        }
      });
      // Mettre à jour localStorage
      localStorage.setItem('sm_codes_invitation', JSON.stringify(CODES_INVITATION));
      CODES_CHARGES_SUPABASE = true;
      console.log('[Codes] ' + CODES_INVITATION.length + ' codes chargés depuis Supabase');
    }
  } catch(e) { console.warn('[Codes] Supabase:', e); }
}

// ── Vérification code — cherche Supabase + localStorage + codes par défaut ──
async function verifierCodeSupabase(code) {
  try {
    var sb = _sbMain(); if (!sb) return null;
    var res = await sb.from('codes_invitation')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('actif', true)
      .single();
    if (res.data && res.data.usages < res.data.max_usages) {
      return {
        code: res.data.code, role: res.data.role,
        usages: res.data.usages, maxUsages: res.data.max_usages,
        actif: true
      };
    }
  } catch(e) { _logErr("script.js", e); }
  return null;
}

function genererCode() {
 var roles = ['Gérant(e)', 'Directeur(trice)', 'Propriétaire', 'Admin'];
 var role = (document.getElementById('inv-role') || {}).value || 'Gérant(e)';
 var max = parseInt((document.getElementById('inv-max') || {}).value) || 5;
 var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
 var suffix = '';
 for (var i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
 var code = 'SM-' + suffix;
 var newCode = {
 code: code,
 role: role,
 usages: 0,
 maxUsages: max,
 actif: true,
 cree: new Date().toLocaleDateString('fr-FR')
 };
 CODES_INVITATION.push(newCode);
 saveCodesInvitation();
 renderCodesInvitation();
 toast('Code créé : ' + code, 'success');

 // Copier dans le presse-papier
 if (navigator.clipboard) {
 navigator.clipboard.writeText(code).then(function(){
 toast('Code copié : ' + code, 'success');
 });
 }
}

function desactiverCode(index) {
 CODES_INVITATION[index].actif = false;
 saveCodesInvitation();
 renderCodesInvitation();
 toast('Code désactivé', 'success');
}

function supprimerCode(index) {
 if (!confirm('Supprimer ce code ?')) return;
 CODES_INVITATION.splice(index, 1);
 saveCodesInvitation();
 renderCodesInvitation();
}

function renderCodesInvitation() {
 var container = document.getElementById('inv-liste');
 if (!container) return;
 if (CODES_INVITATION.length === 0) {
 container.innerHTML = '<p style="color:#999;text-align:center;padding:12px">Aucun code créé</p>';
 return;
 }
 container.innerHTML = CODES_INVITATION.map(function(c, i) {
 var pct = c.maxUsages > 0 ? Math.round(c.usages / c.maxUsages * 100) : 0;
 return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px;background:' + (c.actif ? '#fff' : '#f9fafb') + '">' +
 '<div>' +
 '<div style="font-family:monospace;font-size:15px;font-weight:800;letter-spacing:2px;color:' + (c.actif ? '#007A3D' : '#999') + '">' + c.code + '</div>' +
 '<div style="font-size:11px;color:#888;margin-top:2px">' + c.role + ' — ' + c.usages + '/' + c.maxUsages + ' utilisations — ' + c.cree + '</div>' +
 '</div>' +
 '<div style="display:flex;gap:6px;align-items:center">' +
 '<span style="font-size:11px;padding:3px 8px;border-radius:20px;background:' + (c.actif ? '#dcfce7' : '#fee2e2') + ';color:' + (c.actif ? '#007A3D' : '#dc2626') + ';font-weight:700">' + (c.actif ? 'Actif' : 'Inactif') + '</span>' +
 (c.actif ? '<button class="btn bd bsm" onclick="desactiverCode(' + i + ')">Désactiver</button>' : '') +
 '<button class="btn bd bsm" onclick="supprimerCode(' + i + ')"></button>' +
 '</div>' +
 '</div>';
 }).join('');
}

function verifierCodeInvitation(code) {
 initCodesInvitation();
 var c = CODES_INVITATION.find(function(c) {
 return c.code.toUpperCase() === code.toUpperCase() && c.actif && c.usages < c.maxUsages;
 });
 return c || null;
}

// Version async qui vérifie aussi Supabase (codes créés depuis un autre appareil)
async function verifierCodeInvitationAsync(code) {
  // 1. Vérifier local d'abord (rapide)
  var local = verifierCodeInvitation(code);
  if (local) return local;

  // 2. Vérifier Supabase directement (codes créés depuis d'autres appareils)
  var remote = await verifierCodeSupabase(code);
  if (remote) {
    var existe = CODES_INVITATION.find(function(c){ return c.code === remote.code; });
    if (!existe) CODES_INVITATION.push(remote);
    return remote;
  }

  // 3. Dernier recours : recharger depuis Supabase et revérifier
  await chargerCodesSupabase();
  return verifierCodeInvitation(code);
}

// ── Détection automatique du rôle depuis le code ──
async function detecterRoleCode(valeur) {
 var code = (valeur || '').trim().toUpperCase();
 var display = document.getElementById('r-role-display');
 var roleInput = document.getElementById('r-role');
 var smWrap = document.getElementById('r-sm-wrap');

 if (code.length < 8) {
 if (display) { display.textContent = 'Entrez votre code d\'invitation ci-dessus'; display.style.color = '#007A3D'; display.style.borderColor = '#d1fae5'; }
 if (roleInput) roleInput.value = '';
 if (smWrap) smWrap.style.display = 'block';
 return;
 }

 var codeValide = await verifierCodeInvitationAsync(code);
 if (!codeValide) {
 if (display) { display.textContent = 'Code invalide ou expiré'; display.style.color = '#dc2626'; display.style.borderColor = '#fecaca'; }
 if (roleInput) roleInput.value = '';
 if (smWrap) smWrap.style.display = 'block';
 return;
 }

 var role = codeValide.role;
 var icones = { 'Caissier(e)':'', 'Livreur':'', 'Gérant(e)':'', 'Directeur(trice)':'', 'Propriétaire':'' };
 var icone = icones[role] || '';

 if (display) {
 display.textContent = icone + '' + role + ' — Code valide ';
 display.style.color = '#007A3D';
 display.style.borderColor = '#6ee7b7';
 display.style.background = '#ecfdf5';
 }
 if (roleInput) roleInput.value = role;

 // Masquer le champ supermarché pour Caissier et Livreur
 var estPersonnel = (role === 'Caissier(e)' || role === 'Livreur');
 if (smWrap) smWrap.style.display = estPersonnel ? 'none' : 'block';
}

function utiliserCode(code) {
 var c = CODES_INVITATION.find(function(c) { return c.code.toUpperCase() === code.toUpperCase(); });
 if (c) { c.usages++; if (c.usages >= c.maxUsages) c.actif = false; saveCodesInvitation(); }
}

// ── URL Backend Railway ──
var BACKEND = 'https://kamer360-backend-production.up.railway.app';


// ── Toggle Sidebar Mobile ──
function toggleSidebar() {
 var sidebar = document.getElementById('sidebar');
 var overlay = document.getElementById('sidebarOverlay');
 var burger = document.getElementById('burgerBtn');
 if (!sidebar) return;
 var isOpen = sidebar.classList.contains('open');
 if (isOpen) {
 sidebar.classList.remove('open');
 overlay && overlay.classList.remove('show');
 burger && burger.classList.remove('open');
 } else {
 sidebar.classList.add('open');
 overlay && overlay.classList.add('show');
 burger && burger.classList.add('open');
 }
}

// Fermer sidebar quand on navigue sur mobile
function closeSidebarMobile() {
 if (window.innerWidth <= 768) {
 var sidebar = document.getElementById('sidebar');
 var overlay = document.getElementById('sidebarOverlay');
 var burger = document.getElementById('burgerBtn');
 sidebar && sidebar.classList.remove('open');
 overlay && overlay.classList.remove('show');
 burger && burger.classList.remove('open');
 }
}

var ACCOUNTS = [
 {email:'lembetiny02@gmail.com', pwd:'Douala@2026#Carlos', nom:'NGAPET LEMBE', prenom:'Carlos', role:'administrateur', sm:'KAMER360'}
];
// Recharger les comptes inscrits depuis localStorage
(function() {
 try {
 var saved = JSON.parse(localStorage.getItem('sm_accounts') || 'null');
 if (saved && Array.isArray(saved) && saved.length > 0) {
 var adminEmail = 'lembetiny02@gmail.com';
 saved.forEach(function(acc) {
 if (acc.email && acc.email.toLowerCase() !== adminEmail.toLowerCase()) {
 if (!ACCOUNTS.find(function(a){ return a.email.toLowerCase() === acc.email.toLowerCase(); })) {
 ACCOUNTS.push(acc);
 }
 }
 });
 }
 } catch(e) { _logErr("script.js", e); }
})();
var currentUser = null;

// Démo désactivée pour des raisons de sécurité
function doDemo() { alert("Accès refusé. Veuillez vous connecter avec vos identifiants."); }

// Vider le cache Service Worker et recharger la page
// Vider le cache Service Worker et recharger la page
function reinitialiserDonnees() {
 if (!confirm('Effacer toutes les commandes et ventes de démonstration ? Vos vrais produits et paramètres seront conservés.')) return;
 try {
 localStorage.removeItem('sm_commandes');
 localStorage.removeItem('sm_notifs_live');
 localStorage.removeItem('sm_notifs_admin');
 } catch(e) { _logErr("script.js", e); }
 CMDS = [];
 updateBadgeCmd();
 renderCmds();
 renderDashboard();
 renderVentes();
 renderRapports();
 toast('Données de démo effacées. Application prête !', 'success');
}

function viderCache() {
 if ('caches' in window) {
 caches.keys().then(function(names) {
 Promise.all(names.map(function(n){ return caches.delete(n); })).then(function(){
 if (navigator.serviceWorker) {
 navigator.serviceWorker.getRegistrations().then(function(regs){
 Promise.all(regs.map(function(r){ return r.unregister(); })).then(function(){
 window.location.reload(true);
 });
 });
 } else {
 window.location.reload(true);
 }
 });
 });
 } else {
 window.location.reload(true);
 }
}


async function preChargerCodesInscription() {
  // Charger les codes depuis Supabase pour que le gérant sur son téléphone
  // puisse utiliser les codes créés par l'admin
  await chargerCodesSupabase();
}

function showScreen(name) {
 document.getElementById('screen-login').classList.toggle('hidden', name !== 'login');
 document.getElementById('screen-register').classList.toggle('hidden', name !== 'register');
 if (name === 'register') { preChargerCodesInscription(); }
}

function doLogin() {
 // Nettoyer les espaces avant/après (problème fréquent sur mobile)
 var email = (document.getElementById('l-email').value || '').trim().toLowerCase();
 var pwd = (document.getElementById('l-pwd').value || '').trim();
 var errEl = document.getElementById('login-err');
 errEl.classList.remove('show');

 if (!email) { showErr(errEl, 'Entrez votre email.'); return; }
 if (!pwd) { showErr(errEl, 'Entrez votre mot de passe.'); return; }

 // Chercher le compte (insensible à la casse pour l'email)
 var acc = ACCOUNTS.find(function(a){
 return a.email.trim().toLowerCase() === email;
 });

 if (!acc) {
   // Pas trouvé localement → chercher dans Supabase
   errEl.textContent = 'Vérification en cours...';
   errEl.classList.add('show');
   _loginDepuisSupabase(email, pwd, errEl);
   return;
 }

 // Vérifier mot de passe
 if (acc.pwd.trim() !== pwd) {
   showErr(errEl, 'Mot de passe incorrect. Vérifiez les majuscules et caractères spéciaux.');
   return;
 }

 currentUser = acc;
 loginSuccess(acc);
}

async function _loginDepuisSupabase(email, pwd, errEl) {
  try {
    var sb = _sbMain();
    if (sb) {
      // Chercher dans sm_users
      var res = await sb.from('sm_users').select('*').eq('email', email).single();
      if (res.data && res.data.pwd === pwd) {
        var acc = { email:res.data.email, pwd:res.data.pwd, nom:res.data.nom||'',
                    prenom:res.data.prenom||'', role:res.data.role||'gerant', sm:res.data.sm||'' };
        ACCOUNTS.push(acc);
        try { localStorage.setItem('sm_accounts', JSON.stringify(ACCOUNTS)); } catch(e2) { _logErr("script.js", e2); }
        errEl.classList.remove('show');
        currentUser = acc;
        loginSuccess(acc);
        return;
      }
      // Chercher dans sm_gestionnaires
      var resG = await sb.from('sm_gestionnaires').select('*').eq('id','all').single();
      if (resG.data && resG.data.data) {
        var gdata = {};
        try { gdata = JSON.parse(resG.data.data); } catch(e3) { _logErr("script.js", e3); }
        var roleMap2 = { societes_energie:'electricien', docteurs:'docteur', pharmacies:'docteur',
                         artisans_btp:'ingenieur_btp', ingenieurs_agri:'ingenieur_agricole',
                         logisticiens:'logisticien', libraires:'libraire', agents_immo:'immobilier',
                         salons_coiffure:'coiffeur', pressings:'blanchisseur', mecaniciens:'mecanicien' };
        var cats = Object.keys(roleMap2);
        for (var i = 0; i < cats.length; i++) {
          var liste = gdata[cats[i]] || [];
          var found = null;
          for (var j = 0; j < liste.length; j++) {
            if (liste[j].email === email && liste[j].pwd === pwd) { found = liste[j]; break; }
          }
          if (found) {
            var acc2 = { email:found.email, pwd:found.pwd, nom:found.nom||'',
                         prenom:'', role:roleMap2[cats[i]]||'gerant', sm:found.nom||'' };
            ACCOUNTS.push(acc2);
            try { localStorage.setItem('sm_accounts', JSON.stringify(ACCOUNTS)); } catch(e4) { _logErr("script.js", e4); }
            errEl.classList.remove('show');
            currentUser = acc2;
            loginSuccess(acc2);
            return;
          }
        }
      }
    }
    showErr(errEl, 'Email ou mot de passe incorrect. Vérifiez vos identifiants.');
  } catch(e) {
    console.warn('Login Supabase:', e);
    showErr(errEl, 'Erreur de connexion réseau. Vérifiez votre connexion internet.');
  }
}


async function doRegister() {
 var code = (val('r-code') || '').trim().toUpperCase();
 var prenom = val('r-prenom'), nom = val('r-nom'), email = val('r-email');
 var tel = val('r-tel'), sm = val('r-sm'), ville = val('r-ville');
 var pwd = val('r-pwd'), pwd2 = val('r-pwd2');
 var cgu = document.getElementById('r-cgu');
 var errEl = document.getElementById('reg-err'), sucEl = document.getElementById('reg-suc');
 errEl.classList.remove('show'); sucEl.classList.remove('show');

 // Vérifier le code d'invitation EN PREMIER (local + Supabase)
 if (!code) { showErr(errEl, 'Code d\'invitation requis. Contactez l\'administrateur.'); return; }
 // Afficher un loader pendant la vérification
 sucEl.textContent = 'Vérification du code...'; sucEl.classList.add('show');
 var codeValide = await verifierCodeInvitationAsync(code);
 sucEl.classList.remove('show');
 if (!codeValide) { showErr(errEl, 'Code invalide ou expiré. Si vous avez un code valide, vérifiez la connexion internet. Code de test disponible : SM-GERANT-2026'); return; }

 if (!prenom || !nom) { showErr(errEl, 'Prénom et nom requis.'); return; }
 if (!email || !email.includes('@')) { showErr(errEl, 'Adresse e-mail invalide.'); return; }

 // Le supermarché est obligatoire seulement pour gérant/directeur/propriétaire
 var estPersonnel = (codeValide.role === 'Caissier(e)' || codeValide.role === 'Livreur');
 if (!estPersonnel && !sm) { showErr(errEl, 'Entrez le nom de votre supermarché.'); return; }
 if (!ville) { showErr(errEl, 'Sélectionnez votre ville.'); return; }
 if (pwd.length < 8) { showErr(errEl, 'Mot de passe trop court (8 caractères minimum).'); return; }
 if (pwd !== pwd2) { showErr(errEl, 'Les mots de passe ne correspondent pas.'); return; }
 if (!cgu || !cgu.checked) { showErr(errEl, "Acceptez les conditions d'utilisation."); return; }
 if (ACCOUNTS.find(function(a){ return a.email.toLowerCase() === email.toLowerCase(); })) { showErr(errEl, 'Un compte existe déjà avec cet e-mail.'); return; }

 // Créer le compte avec le rôle du code
 var smLabel = estPersonnel ? ('Employé — ' + ville) : (sm + ' — ' + ville);
 var newAcc = {email:email, pwd:pwd, nom:nom.toUpperCase(), prenom:prenom, role:codeValide.role, sm:smLabel};
 ACCOUNTS.push(newAcc);

 // Sauvegarder le nouveau compte pour qu'il persiste après rechargement
 try { localStorage.setItem('sm_accounts', JSON.stringify(ACCOUNTS)); } catch(e) { _logErr("script.js", e); }
 utiliserCode(code);

 // Notifier l'admin
 addNotif('Nouveau gérant inscrit : ' + prenom + '' + nom.toUpperCase() + ' (' + codeValide.role + ' — ' + sm + ')', 'blue');

 sucEl.textContent = 'Compte créé avec succès ! Connexion en cours...';
 sucEl.classList.add('show');
 setTimeout(function(){ currentUser = newAcc; loginSuccess(newAcc); }, 1200);
}

function loginSuccess(acc) {
  // Initialiser les images configurées
  setTimeout(function(){ if (typeof initImagesConfig === 'function') initImagesConfig(); }, 500);

  // Fermer tout modal resté ouvert (ex: "Mot de passe oublié" cliqué puis connexion réussie)
  document.querySelectorAll('.mo.open').forEach(function(m) { m.classList.remove('open'); });

 document.getElementById('screen-login').classList.add('hidden');
 document.getElementById('screen-register').classList.add('hidden');
 document.getElementById('app').classList.add('show');

 // Assigner le role administrateur si c'est l'email admin
 if (acc.email && acc.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
 acc.role = 'administrateur';
 }

 // ── Normaliser le rôle (codes invitations créent des rôles avec accents/majuscules) ──
 var roleMap = {
 'gérant(e)': 'gerant', 'gerant(e)': 'gerant', 'gérant': 'gerant', 'gerant': 'gerant',
    'coiffeuse': 'coiffeur', 'coiffeur': 'coiffeur', 'coiffeur/coiffeuse': 'coiffeur',
    'décoratrice': 'decorateur', 'decorateur': 'decorateur', 'décorateur': 'decorateur',
    'mécanicien': 'mecanicien', 'mecanicien': 'mecanicien', 'mécanicienne': 'mecanicien',
    'restaurateur': 'restaurateur', 'restauratrice': 'restaurateur', 'chef': 'restaurateur',
    'docteur': 'docteur', 'médecin': 'docteur',
    'ingenieur_btp': 'ingenieur_btp', 'ingénieur btp': 'ingenieur_btp',
    'electricien': 'electricien', 'électricien': 'electricien',
    'ingenieur_agricole': 'ingenieur_agricole', 'ingénieur agricole': 'ingenieur_agricole',
    'logisticien': 'logisticien',
    'libraire': 'libraire',
    'immobilier': 'immobilier', 'agent immobilier': 'immobilier',
    'decorateur': 'decorateur', 'décoratrice': 'decorateur',
    'menuisier': 'menuisier', 'menuisière': 'menuisier',
 'directeur(trice)': 'gerant', 'directeur': 'gerant',
 'propriétaire': 'gerant', 'proprietaire': 'gerant',
 'admin': 'administrateur', 'administrateur': 'administrateur',
 'caissier(e)': 'caissier', 'caissier': 'caissier', 'caissière': 'caissier',
 'livreur': 'livreur', 'livreuse': 'livreur',
 'coiffeur': 'coiffeur', 'coiffeuse': 'coiffeur', 'coiffeur/coiffeuse': 'coiffeur',
 'blanchisseur': 'blanchisseur', 'blanchisseur/pressing': 'blanchisseur',
 'mecanicien': 'mecanicien', 'mécanicien': 'mecanicien',
 'menuisier': 'menuisier'
 };
 if (acc.role) {
 var roleNorm = roleMap[acc.role.toLowerCase().trim()];
 if (roleNorm) acc.role = roleNorm;
 }
 if (!acc.role) acc.role = 'gerant';

 // Mettre a jour currentUser avec le role
 currentUser = acc;
 USERS.currentUser = acc;

 // Afficher initiales, nom et email dans la sidebar
 var initials = ((acc.prenom||'')[0]||(acc.nom||'')[0]||acc.email[0]).toUpperCase();
 var ava = document.getElementById('user-ava');
 var uname = document.getElementById('user-name');
 var uemail = document.getElementById('user-email');
 if (ava) ava.textContent = initials || 'U';
 if (uname) uname.textContent = (acc.prenom && acc.nom) ? acc.prenom + '' + acc.nom : acc.nom || acc.email.split('@')[0];
 if (uemail) uemail.textContent = acc.email;

 // Afficher le badge de role dans la sidebar
 var roleBadgeEl = document.getElementById('user-role-badge');
 if (roleBadgeEl) roleBadgeEl.innerHTML = getRoleBadge(acc.role);

 toast('Bienvenue ' + (acc.prenom || acc.nom || '') + ' !', 'success');

 // ── Vérifier abonnement si gérant ──
 if (typeof verifierEtBloquerSiExpire === 'function') {
 setTimeout(function() {
 verifierEtBloquerSiExpire(acc);
 }, 800);
 }

 // Appliquer les restrictions de navigation selon le role
 setTimeout(function(){
 applyRoleRestrictions();
 }, 100);

 // Charger toutes les donnees dynamiques au login
 setTimeout(function(){
 if (typeof initGestionnaires === 'function') initGestionnaires();
 if (typeof initImagesConfig === 'function') initImagesConfig();
 if (typeof initCodesInvitationDefaut === 'function') initCodesInvitationDefaut();
 // Charger les comptes gérants depuis Supabase (multi-appareils)
 if (typeof chargerUsersSupabase === 'function') chargerUsersSupabase();
 if (typeof verifierEtNotifierExpirations === 'function') setTimeout(verifierEtNotifierExpirations, 2000);
 if (typeof initRenouvellementAuto === 'function') setTimeout(initRenouvellementAuto, 3000);
 // Rafraîchir le compteur clients toutes les 30 secondes
 if (!window._dashClientsInterval) {
   window._dashClientsInterval = setInterval(function() {
     // Lire localStorage en temps réel
     var cl = [];
     try { cl = JSON.parse(localStorage.getItem('sm_clients') || '[]'); } catch(e) { _logErr("script.js", e); }
     if (cl.length > 0) {
       setDash('dash-clients', cl.length);
       setDash('dash-clients-sub', cl.length + ' inscrits boutique');
     }
   }, 30000);
 }
 if (typeof initHistoriquePaiements === 'function') initHistoriquePaiements();
 if (typeof initGaleries === 'function') initGaleries();
 chargerNotifsClients();
 renderNotifs();
 renderDashboard();
 initEmployes();
 initFournisseurs();
 initCodesInvitation();
 renderVentes();
 chargerProduitsGerant(); // charger les produits depuis Supabase
 }, 600);
}

async function chargerProduitsGerant() {
 try {
 var sb = _sbMain();
 if (!sb) return;
 var res = await sb.from('produits').select('*').order('created_at', { ascending: true });
 if (res.data && res.data.length > 0) {
 PRODS = res.data;
 renderProds();
 renderCat();
 console.log('[Produits] ' + PRODS.length + ' produits charges depuis Supabase');
 // Toujours rafraîchir le dashboard — peu importe si la page est active ou non
 // (PRODS était vide au 1er rendu, maintenant il a les vrais produits)
 if (typeof renderDashboard === 'function') {
   renderDashboard();
 }
 // Mettre à jour le compteur produits dans la sidebar
 var bProd = document.getElementById('b-prod');
 if (bProd) bProd.textContent = PRODS.length;
 // Mettre à jour aussi le compteur dans les stats dashboard si visible
 var statProd = document.getElementById('dash-nb-produits');
 if (statProd) statProd.textContent = PRODS.length;
 }
 } catch(e) { console.warn('[Produits] chargement Supabase:', e); }
}

function doLogout() {
 currentUser = null;
 document.getElementById('app').classList.remove('show');
 document.getElementById('screen-login').classList.remove('hidden');
 document.getElementById('screen-register').classList.add('hidden');
 document.getElementById('l-email').value = '';
 document.getElementById('l-pwd').value = '';
 document.getElementById('login-err').classList.remove('show');
 PANIER = []; updatePanierUI();
 toast('Déconnexion réussie. À bientôt !', 'success');
}

function showErr(el, msg) { el.textContent = msg; el.classList.add('show'); }
function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }

function checkPwd(v) {
 var fill = document.getElementById('pw-fill'), lbl = document.getElementById('pw-lbl');
 if (!fill||!lbl) return;
 var score = 0;
 if (v.length >= 8) score++; if (/[A-Z]/.test(v)) score++; if (/[0-9]/.test(v)) score++; if (/[^A-Za-z0-9]/.test(v)) score++;
 var colors = ['#ccc','var(--r)','#F77737','var(--y)','var(--g)'];
 var labels = ['Entrez un mot de passe','Trop court','Faible','Moyen','Fort'];
 fill.style.width = (score/4*100)+'%'; fill.style.background = colors[score]||colors[4];
 lbl.textContent = v.length===0 ? 'Entrez un mot de passe' : (labels[score]||'Très fort');
 lbl.style.color = colors[score]||colors[4];
}

// ═══════════════ NAVIGATION ═══════════════
var TITLES = {
 dashboard:'Tableau de bord', supermarches:'Supermarchés', produits:'Produits & Stock',
 achats:'Achats', commandes:'Commandes', ventes:'Ventes & Caisse',
 employes:'Employés', fournisseurs:'Fournisseurs', rapports:'Rapports',
 ia:'Assistant IA', parametres:'Paramètres',
 reseaux:'Réseaux Sociaux', livraison:'Conditions de Livraison',
 confidentialite:'Politique de Confidentialité',
 'devis-reservations': 'Devis & Réservations',
 'mon-profil': 'Mon Profil',
 'chiffres-affaires': "Chiffres d'Affaires",
 'gestion-services': 'Devis, Services & RDV',
 faq:'FAQ & Centre d\'aide',
 abonnements:'Gestion des Abonnements',
 menuiserie:'Menuiserie & Bois',
  meubles:'Meubles & Decoration',
 coiffure:'Salon de Coiffure',
 pressing:'Pressing & Blanchisserie',
 automobile:'Automobile & Mécanique',
 'vue-coiffeur': 'Mon Espace — Coiffure',
 'vue-blanchisseur': 'Mon Espace — Pressing',
 'vue-mecanicien': 'Mon Espace — Mécanique',
 'vue-menuisier': 'Mon Espace — Menuiserie'
,
 logistique:'Logistique & Livraison',
 education:'Éducation & Formation',
 immobilier:'Immobilier & Hébergement',
 livraison:'Conditions de Livraison',
 confidentialite:'Politique de Confidentialité'
};

function goPage(p) {
 // Pages toujours accessibles sans vérification (éviter les faux blocages)
 var pagesLibres = ['livraison','confidentialite','faq','dashboard',
                    'chiffres-affaires','gestion-services','devis-reservations'];
 if (pagesLibres.indexOf(p) === -1 && currentUser && typeof hasPermission === 'function') {
   if (!hasPermission(p)) {
     toast('Accès refusé — votre rôle ne permet pas d\'accéder à cette section.', 'error');
     return;
   }
 }
 document.querySelectorAll('.page').forEach(function(x){ x.classList.remove('active'); });
 document.querySelectorAll('.nv').forEach(function(x){ x.classList.remove('active'); });
 var el = document.getElementById('page-'+p); if (el) el.classList.add('active');
 var ttl = document.getElementById('page-title'); if (ttl) ttl.textContent = TITLES[p]||p;
 document.querySelectorAll('.nv').forEach(function(n){
 if (n.getAttribute('onclick')&&n.getAttribute('onclick').indexOf("'"+p+"'")>-1) n.classList.add('active');
 });
 if (p==='supermarches') { renderStores(); refreshAllSMSelects(); remplirSelectSM(); }
 if (p==='achats') {
   // Charger les supermarchés depuis toutes les sources disponibles
   _chargerEtAfficherAchats();
 }
 if (p==='commandes') renderCmds();
 if (p==='produits') renderProds();
 if (p==='ia') { updateAIStats(); if (AI_MSGS.length===0) showWelcomeMsg(); }
  if (p==='kamer-pay') { if(typeof initPageKamerPay==='function') setTimeout(initPageKamerPay,100); }
  if (p==='avis')      { if(typeof initPageAvis==='function') setTimeout(initPageAvis,100); }
  if (p==='tracking')  { if(typeof renderTrackingPage==='function') setTimeout(renderTrackingPage,100); }
  if (p==='chat')          { if(typeof initPageChat==='function') setTimeout(initPageChat,100); }
  if (p==='offline')      { if(typeof initPageOffline==='function') setTimeout(initPageOffline,100); }
  if (p==='notifications'){ if(typeof initPageNotifications==='function') setTimeout(initPageNotifications,100); }
  if (p==='ia-predict'){  if(typeof initPageIAPredict==='function')       setTimeout(initPageIAPredict,100); }
  if (p==='cemac'){       if(typeof initPageCEMAC==='function')            setTimeout(initPageCEMAC,100); }
  if (p==='microcredit'){ if(typeof initPageMicroCredit==='function')     setTimeout(initPageMicroCredit,100); }
  if (p==='api-publique'){if(typeof initPageAPIPublique==='function')     setTimeout(initPageAPIPublique,100); }
  if (p==='social'){      if(typeof initPageSocialCommerce==='function')  setTimeout(initPageSocialCommerce,100); }
  if (p==='b2b'){         if(typeof initPageB2B==='function')             setTimeout(initPageB2B,100); }
  if (p==='editeur'){    if(typeof initPageEditeur==='function')        setTimeout(initPageEditeur,100); }
  if (p==='gestion-marketplace') { if(typeof initPageGestionMarketplace==='function') setTimeout(initPageGestionMarketplace,100); }
 if (p==='dashboard') { renderDashboard(); }
 if (p==='employes') { renderEmployes(); }
 if (p==='fournisseurs'){ renderFournisseurs(); }
 if (p==='rapports') { renderRapports(); }
 if (p==='invitations') { renderCodesInvitation(); renderGerants(); }
 if (p==='abonnements') { initAbonnements(); renderAbonnements(); }
 if (p==='menuiserie')    { if (typeof initPageMenuiserie    === 'function') initPageMenuiserie(); }
 if (p==='restauration')  { if (typeof initPageRestauration === 'function') initPageRestauration(); }
 if (p==='energie')      { if (typeof initPageEnergie      === 'function') initPageEnergie(); }
 if (p==='sante')        { if (typeof initPageSante        === 'function') initPageSante(); }
 if (p==='btp')          { if (typeof initPageBTP          === 'function') initPageBTP(); }
 if (p==='agriculture')  { if (typeof initPageAgriculture  === 'function') initPageAgriculture(); }
 if (p==='logistique')        { if (typeof initPageLogistique  === 'function') initPageLogistique(); }
 if (p==='devis-reservations')    { if (typeof renderPageDevisReservations === 'function') renderPageDevisReservations(); }
 if (p==='vue-docteur')       { if (typeof initVueDocteur==='function') initVueDocteur(); }
 if (p==='vue-electricien')   { if (typeof initVueElectricien==='function') initVueElectricien(); }
 if (p==='vue-btp')           { if (typeof initVueIngenieurBTP==='function') initVueIngenieurBTP(); }
 if (p==='vue-agricole')      { if (typeof initVueIngenieurAgricole==='function') initVueIngenieurAgricole(); }
 if (p==='vue-logisticien')   { if (typeof initVueLogisticien==='function') initVueLogisticien(); }
 if (p==='vue-libraire')      { if (typeof initVueLibraire==='function') initVueLibraire(); }
 if (p==='vue-immo')          { if (typeof initVueAgentImmo==='function') initVueAgentImmo(); }
 if (p==='vue-decorateur')    { if (typeof initVueDecorateur==='function') initVueDecorateur(); }
 if (p==='mon-profil')          { if (typeof initPageProfil === 'function') initPageProfil(); }
 if (p==='chiffres-affaires')    { if (typeof renderPageCA === 'function') renderPageCA(); }
 if (p==='gestion-services')     { if (typeof renderPageGestionServices === 'function') renderPageGestionServices(); }
 if (p==='education')    { if (typeof initPageEducation   === 'function') initPageEducation(); }
 if (p==='immobilier')   { if (typeof initPageImmobilier  === 'function') initPageImmobilier(); }
 if (p==='livraison')    { renderPageLivraison(); }
 if (p==='confidentialite') { renderPageConfidentialite(); }
 if (p==='meubles') { initMeublesV2(); renderMeubles(); renderCommandesMeubles(); updatePanierMeublesUI(); }
 if (p==='coiffure') { if (typeof initPageCoiffure === 'function') initPageCoiffure(); }
 if (p==='pressing') { if (typeof initPagePressing === 'function') initPagePressing(); }
 if (p==='automobile') { if (typeof initPageAuto === 'function') initPageAuto(); }
 if (p==='vue-coiffeur') { if (typeof initVueCoiffeur === 'function') initVueCoiffeur(); }
 if (p==='vue-blanchisseur') { if (typeof initVueBlanchisseur === 'function') initVueBlanchisseur(); }
 if (p==='vue-mecanicien') { if (typeof initVueMecanicien === 'function') initVueMecanicien(); }
 if (p==='vue-menuisier')    { if (typeof initVueMenuisier    === 'function') initVueMenuisier(); }
 if (p==='vue-restaurateur') { if (typeof initVueRestaurateur === 'function') { if(typeof initGerantsResto==='function') initGerantsResto(); initVueRestaurateur(); } }
 if (p==='ventes') { renderVentes(); }
 if (p==='reseaux') { renderReseaux(); }
 if (p==='faq') renderFaq();
 if (p==='rapports') { var e=document.getElementById('rpt-c'); if(e) e.textContent=CMDS.filter(function(c){return['en_attente','confirmee','livraison'].includes(c.statut);}).length; }
 if (p==='livreurs') {
 if (typeof renderLivreurs === 'function') renderLivreurs();
 }
 if (p==='livraisons-admin') { if(typeof initLivreurs==='function') initLivreurs().then(function(){ renderLivraisons(); }); else renderLivraisons(); }
 if (p==='livraisons-livreur') { if (typeof renderVueLivreur === 'function') renderVueLivreur(); }
 if (p==='promotions') { if (typeof renderPromos === 'function') renderPromos(); }
 if (p==='kamer-ads') { if (typeof initPageKamerAds === 'function') initPageKamerAds(); }
 if (p==='fidelite') { if (typeof renderFideliteClients === 'function') renderFideliteClients(); }
 if (p==='retours') { if (typeof renderRetours === 'function') renderRetours(); }
 if (p==='stats-clients') { if (typeof renderStatsClients === 'function') renderStatsClients(); }
 if (p==='utilisateurs') { renderUtilisateurs(); }
 if (p==='parametres') {
    // Initialiser le QR code à l'ouverture des paramètres
    setTimeout(function() {
      if (typeof initQRCode === 'function') initQRCode();
    if (typeof initOfflineManager === 'function') initOfflineManager();
    if (typeof initPushNotifications === 'function') setTimeout(initPushNotifications, 2000);
    }, 300); chargerConfig(); initConfigLivePreview(); }
}


// ── Générer et charger toutes les notifications réelles ──
function chargerNotifsClients() {
 try {
 // 1. Notifications boutique (nouveaux clients, commandes, avis)
 var notifsAdmin = JSON.parse(localStorage.getItem('sm_notifs_admin') || '[]');
 var nonLues = notifsAdmin.filter(function(n){ return !n.lu; });
 nonLues.forEach(function(n) {
 addNotif(n.msg, n.couleur || 'blue');
 n.lu = true;
 });
 if (nonLues.length > 0) localStorage.setItem('sm_notifs_admin', JSON.stringify(notifsAdmin));

 // 2. Ruptures de stock réelles
 if (typeof PRODS !== 'undefined') {
 PRODS.forEach(function(p) {
 if (p.stock === 0) {
 addNotif(' Rupture de stock : ' + p.nom, 'red');
 } else if (p.stock > 0 && p.stock < 10) {
 addNotif('Stock critique : ' + p.nom + ' — ' + p.stock + ' unité(s)', 'yellow');
 }
 });
 }

 // 3. Commandes en attente
 if (typeof CMDS !== 'undefined') {
 var enAttente = CMDS.filter(function(c){ return c.statut === 'en_attente'; });
 if (enAttente.length > 0) {
 addNotif('' + enAttente.length + ' commande(s) en attente de confirmation', 'yellow');
 }
 }

 // 4. Nouveaux clients boutique
 var clients = JSON.parse(localStorage.getItem('sm_clients') || '[]');
 var totalClients = clients.length;
 if (totalClients > 0) {
 var elClients = document.getElementById('stat-clients');
 if (elClients) elClients.textContent = totalClients;
 // Notifier nouveaux clients (inscrits aujourd\'hui)
 var today = new Date().toLocaleDateString('fr-FR');
 var nouveaux = clients.filter(function(c){ return c.date === today; });
 if (nouveaux.length > 0) {
 addNotif('' + nouveaux.length + ' nouveau(x) client(s) aujourd\'hui', 'green');
 }
 }

 // 5. Avis clients non lus
 var avis = JSON.parse(localStorage.getItem('sm_avis') || '[]');
 var avisNonLus = avis.filter(function(a){ return !a.lu; });
 if (avisNonLus.length > 0) {
 addNotif('' + avisNonLus.length + ' nouvel(s) avis client(s) sur les produits', 'blue');
 // Marquer comme lus
 avis.forEach(function(a){ a.lu = true; });
 localStorage.setItem('sm_avis', JSON.stringify(avis));
 }

 // 6. Points fidélité échangés
 var fidelite = JSON.parse(localStorage.getItem('sm_fidelite') || 'null');
 if (fidelite && fidelite.echanges_recents && fidelite.echanges_recents > 0) {
 addNotif('' + fidelite.echanges_recents + ' point(s) fidélité échangé(s)', 'green');
 fidelite.echanges_recents = 0;
 localStorage.setItem('sm_fidelite', JSON.stringify(fidelite));
 }

 // 7. Livreurs disponibles
 if (typeof LIVREURS_DATA !== 'undefined' && LIVREURS_DATA.liste) {
 var dispo = LIVREURS_DATA.liste.filter(function(l){ return l.statut === 'disponible' && l.actif; });
 if (dispo.length === 0 && LIVREURS_DATA.liste.length > 0) {
 addNotif(' Aucun livreur disponible en ce moment', 'red');
 }
 }

 renderNotifs();
 } catch(e) { console.warn('chargerNotifsClients:', e); }
}


// ── Toggle afficher/masquer mot de passe ──
function togglePwd(inputId, btn) {
 var input = document.getElementById(inputId);
 if (!input) return;
 var isHidden = input.type === 'password';
 input.type = isHidden ? 'text' : 'password';

 var svgOuvert = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
 var svgFerme = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

 btn.innerHTML = isHidden ? svgFerme : svgOuvert;
 btn.style.color = isHidden ? '#007A3D' : '#aaa';

 // Afficher l'indicateur "mot de passe visible" uniquement sur le login
 if (inputId === 'l-pwd') {
 var hint = document.getElementById('pwd-visible-hint');
 if (hint) hint.style.display = isHidden ? 'block' : 'none';
 }
 input.focus();
}


// ══ MEUBLES & DÉCORATION ══
function renderMeubles() {
  var grid = document.getElementById('meubles-grid');
  if (!grid) return;
  var srch = ((document.getElementById('meubles-search')||{}).value||'').toLowerCase();
  var sousCat = (document.getElementById('meubles-sous-cat')||{}).value || '';
  var prods = (typeof MENUISERIE_PRODUITS !== 'undefined' ? MENUISERIE_PRODUITS : [])
    .filter(function(p){ return p.cat === 'Meubles'; })
    .filter(function(p){ return (!srch || p.nom.toLowerCase().includes(srch)) && (!sousCat || p.sous_cat === sousCat); });
  
  // Ajouter aussi les produits PRODS de cat Meubles & Décoration
  var prodsGeneral = PRODS.filter(function(p){
    return p.cat === 'Meubles & Décoration'
      && (!srch || p.nom.toLowerCase().includes(srch));
  });
  var tous = prods.concat(prodsGeneral);

  if (tous.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#999;padding:20px;grid-column:1/-1">Aucun meuble trouvé</p>';
    return;
  }
  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">'
    + tous.map(function(p) {
        var stCls = (p.stock||0)===0?'bgr':(p.stock||0)<5?'bgy':'bgg';
        var stLbl = (p.stock||0)===0?'Rupture':(p.stock||0)<5?'Stock faible':'Disponible';
        return '<div class="cd">'
          + '<img src="' + p.img + '" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px">'
          + '<div style="display:flex;justify-content:space-between;margin-bottom:4px">'
          + '<span style="font-size:10px;background:#f0faf5;color:#007A3D;padding:2px 8px;border-radius:20px;font-weight:700">' + (p.sous_cat||p.cat) + '</span>'
          + '<span class="badge ' + stCls + '" style="font-size:10px">' + stLbl + '</span>'
          + '</div>'
          + '<div style="font-weight:700;font-size:13px;margin-bottom:4px">' + p.nom + '</div>'
          + (p.matiere ? '<div style="font-size:11px;color:#666;margin-bottom:4px">' + p.matiere + (p.couleurs?' — '+p.couleurs.join(', '):'') + '</div>' : '')
          + '<div style="font-size:15px;font-weight:800;color:#007A3D">' + (p.prix||0).toLocaleString('fr-FR') + ' FCFA</div>'
          + '<button class="btn bp bsm" style="margin-top:8px" onclick="goPage(\"menuiserie\")">Devis sur mesure</button>'
          + '</div>';
      }).join('')
    + '</div>';
}

// ── Page Livraison — statique mais initialisée ──
function renderPageLivraison() {
  // Page statique HTML — rien à rendre dynamiquement
  // Les tarifs sont affichés en HTML
}

// ── Page Confidentialité — statique mais initialisée ──
function renderPageConfidentialite() {
  // Page statique HTML — contenu fixe
}

// ═══════════════ TOAST ═══════════════
function toast(msg, type) {
 type = type||'success';
 var icons = {success:'<img src="https://img.icons8.com/ios/18/007A3D/checkmark.png" alt="ok" style="width:14px;height:14px;vertical-align:middle">', error:'<img src="https://img.icons8.com/ios/18/CE1126/delete-sign.png" alt="non" style="width:14px;height:14px;vertical-align:middle">', warning:'!'};
 var w = document.getElementById('tw2'); if (!w) return;
 var el = document.createElement('div'); el.className = 'tst '+type;
 el.innerHTML = '<span class="tst-ico">'+icons[type]+'</span> '+msg;
 w.appendChild(el);
 setTimeout(function(){ el.style.opacity='0'; el.style.transform='translateY(14px)'; el.style.transition='all .3s'; setTimeout(function(){ el.remove(); },300); }, 3500);
}

// ═══════════════ MODAL ═══════════════
function openM(id) { document.getElementById(id).classList.add('open'); }
function closeM(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('click', function(e){ if (e.target&&e.target.classList.contains('mo')) e.target.classList.remove('open'); });

// ═══════════════ NOTIFS ═══════════════
function toggleNotif() { document.getElementById('nov').classList.toggle('open'); document.getElementById('nbg2').classList.toggle('open'); }
function closeNotif() { document.getElementById('nov').classList.remove('open'); document.getElementById('nbg2').classList.remove('open'); }
function markRead() {
 try {
 var notifs = JSON.parse(localStorage.getItem('sm_notifs_live') || '[]');
 notifs.forEach(function(n){ n.lu = true; });
 localStorage.setItem('sm_notifs_live', JSON.stringify(notifs));
 // Aussi marquer notifs clients
 var nc = JSON.parse(localStorage.getItem('sm_notifs_admin') || '[]');
 nc.forEach(function(n){ n.lu = true; });
 localStorage.setItem('sm_notifs_admin', JSON.stringify(nc));
 } catch(e) { _logErr("script.js", e); }
 renderNotifs();
 toast('Toutes les notifications lues', 'success');
}
function addNotif(msg, type, icone) {
 // Sauvegarder dans localStorage
 try {
 var notifs = JSON.parse(localStorage.getItem('sm_notifs_live') || '[]');
 notifs.unshift({
 msg: msg,
 type: type || 'green',
 icone: icone || '',
 date: new Date().toISOString(),
 lu: false
 });
 // Garder max 50 notifications
 if (notifs.length > 50) notifs = notifs.slice(0, 50);
 localStorage.setItem('sm_notifs_live', JSON.stringify(notifs));
 } catch(e) { _logErr("script.js", e); }
 renderNotifs();
}

function tempsRelatif(dateStr) {
 try {
 var diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
 if (diff < 60) return 'À l\'instant';
 if (diff < 3600) return 'Il y a ' + Math.floor(diff/60) + ' min';
 if (diff < 86400)return 'Il y a ' + Math.floor(diff/3600) + 'h';
 return 'Il y a ' + Math.floor(diff/86400) + ' jour(s)';
 } catch(e) { return ''; }
}

function renderNotifs() {
 var nl = document.getElementById('nlist');
 if (!nl) return;

 var typeColors = { green:'#007A3D', red:'#ef4444', yellow:'#f59e0b', blue:'#3b82f6' };
 var typeIcones = {
 green: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007A3D" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
 red: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
 yellow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
 blue: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
 };

 try {
 // Fusionner notifs live + notifs clients boutique
 var notifs = JSON.parse(localStorage.getItem('sm_notifs_live') || '[]');
 var notifsClients = JSON.parse(localStorage.getItem('sm_notifs_admin') || '[]');

 // Ajouter les notifs clients non encore dans live
 notifsClients.forEach(function(nc) {
 var existe = notifs.find(function(n){ return n.msg === nc.msg; });
 if (!existe) {
 notifs.push({ msg: nc.msg, type: 'blue', icone: '', date: new Date(nc.date || Date.now()).toISOString(), lu: nc.lu || false });
 }
 });

 // Trier par date décroissante
 notifs.sort(function(a,b){ return new Date(b.date) - new Date(a.date); });

 var nonLues = notifs.filter(function(n){ return !n.lu; }).length;
 var dot = document.getElementById('ndot');
 if (dot) { dot.style.display = nonLues > 0 ? '' : 'none'; dot.textContent = nonLues > 9 ? '9+' : nonLues; }

 if (notifs.length === 0) {
 nl.innerHTML = '<p style="color:#999;text-align:center;padding:30px;font-size:13px">Aucune notification</p>';
 return;
 }

 nl.innerHTML = notifs.map(function(n, i) {
 var icone = typeIcones[n.type] || typeIcones.green;
 var bg = n.lu ? '' : 'background:#f0faf5;';
 return '<div class="ni' + (n.lu ? '' : ' unread') + '" style="' + bg + 'cursor:pointer" onclick="marquerLue(' + i + ')">'
 + '<div class="nico" style="background:' + (n.lu ? '#f5f5f5' : '#e8f5ef') + ';display:flex;align-items:center;justify-content:center;border-radius:50%;width:40px;height:40px;flex-shrink:0">' + icone + '</div>'
 + '<div class="ntxt"><p style="margin:0;font-size:13px;font-weight:' + (n.lu ? '400' : '600') + ';color:#333">' + n.msg + '</p>'
 + '<span style="font-size:11px;color:#999">' + tempsRelatif(n.date) + '</span></div>'
 + (n.lu ? '' : '<div class="ndtxt" style="width:8px;height:8px;background:#007A3D;border-radius:50%;flex-shrink:0;margin-top:6px"></div>')
 + '</div>';
 }).join('');
 } catch(e) {
 nl.innerHTML = '<p style="color:#999;text-align:center;padding:20px;font-size:13px">Erreur chargement</p>';
 }
}

function marquerLue(index) {
 try {
 var notifs = JSON.parse(localStorage.getItem('sm_notifs_live') || '[]');
 if (notifs[index]) { notifs[index].lu = true; localStorage.setItem('sm_notifs_live', JSON.stringify(notifs)); }
 renderNotifs();
 } catch(e) { _logErr("script.js", e); }
}

// ═══════════════ DARK MODE ═══════════════
var dark = false;
function toggleDark() {
 dark = !dark;
 var r = document.documentElement.style;
 r.setProperty('--bg', dark?'#0F1A12':'#F5F7F2'); r.setProperty('--tx', dark?'#E8F5EF':'#1A2A1A');
 r.setProperty('--br', dark?'#1E3A24':'#D8E8D8'); r.setProperty('--mu', dark?'#6B9B7B':'#6B7B6B');
 document.querySelectorAll('.cd,.sc,.smi,.acd,.cmdcd,.pp,.np,.ai-chat,.ai-topics,.ai-stats,.mdl,.ls,.faq-item,.dv,.social-card,.ss-card').forEach(function(el){ el.style.background = dark?'#162B1A':''; });
 toast(dark?'Mode sombre activé':'Mode clair activé', 'success');
}

// ═══════════════ MINI-BARS ═══════════════
function makeBars(id, vals, clrFn) {
 var el = document.getElementById(id); if (!el) return;
 var mx = Math.max.apply(null,vals)||1;
 el.innerHTML = vals.map(function(v,i){ var h=Math.round((v/mx)*100); return '<div class="mbar" style="height:'+h+'%;background:'+(clrFn?clrFn(i,v):'var(--g)')+'"></div>'; }).join('');
}

// ═══════════════ DONNÉES PRODUITS (avec vraies images) ═══════════════
// Charger stocks depuis localStorage si disponible
// Produits chargés depuis Supabase au démarrage (tableau initialement vide)
var PRODS = [];
// Restaurer stocks sauvegardés
(function() {
 try {
 var saved = JSON.parse(localStorage.getItem('sm_prods') || 'null');
 if (saved && Array.isArray(saved)) {
 saved.forEach(function(sp) {
 var p = PRODS.find(function(x){ return x.id === sp.id; });
 if (p) p.stock = sp.stock;
 });
 }
 } catch(e) { _logErr("script.js", e); }
})();



var CMDS = [];


// ═══════════════ SUPERMARCHÉS ═══════════════
var STORES = [
 { id:1, nom:'KAMER360', ville:'Douala', adresse:'Bepanda Casimando, Douala', gerant:'NGAPET LEMBE Carlos', tel:'+237 693 59 14 79', statut:'ouvert', ca:'0', employes:0, img:'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200&h=200&fit=crop' },
];
var smSeq = 5;

// Retourne la liste des noms pour les <select>
function getStoreNames() {
 return STORES.map(function(s){ return s.nom; });
}

// Remplit tous les <select> qui ont l'attribut data-sm-select

// ── Charger les supermarchés depuis Supabase ──
async function chargerStoresSupabase() {
  try {
    var sb = _sbMain(); if (!sb) return;
    var res = await sb.from('supermarchés').select('*');
    if (res.data && res.data.length > 0) {
      STORES = res.data;
      try { localStorage.setItem('sm_stores', JSON.stringify(STORES)); } catch(e) { _logErr("script.js", e); }
    } else {
      // Fallback localStorage
      var saved = JSON.parse(localStorage.getItem('sm_stores') || 'null');
      if (saved && saved.length > 0) STORES = saved;
    }
  } catch(e) {
    var saved = JSON.parse(localStorage.getItem('sm_stores') || 'null');
    if (saved && saved.length > 0) STORES = saved;
  }
}

function refreshAllSMSelects() {
 var selects = document.querySelectorAll('[data-sm-select]');
 selects.forEach(function(sel) {
 var current = sel.value;
 sel.innerHTML = STORES.map(function(s){
 return '<option value="'+s.nom+'"'+(s.nom===current?' selected':'')+'>'+s.nom+'</option>';
 }).join('');
 });
}

// Calcule le CA réel d'un supermarché depuis les commandes livrées
function calculerCA(nomSM) {
 var total = CMDS.filter(function(c){
 return c.statut === 'livree' && (c.sm === nomSM || c.supermarche === nomSM);
 }).reduce(function(s, c){ return s + (c.total || 0); }, 0);
 if (total === 0) return '0';
 if (total >= 1000000) return (total/1000000).toFixed(1) + 'M';
 if (total >= 1000) return (total/1000).toFixed(0) + 'K';
 return total.toLocaleString('fr-FR');
}

// Rendu de la liste des supermarchés
function renderStores() {
 var list = document.getElementById('sml');
 if (!list) return;
 list.innerHTML = STORES.map(function(s){
 var stCls = s.statut==='ouvert' ? 'bgg' : s.statut==='maintenance' ? 'bgy' : 'bgr';
 var stLbl = s.statut==='ouvert' ? 'Ouvert' : s.statut==='maintenance' ? 'Maintenance' : 'Fermé';
 return '<div class="smi" id="smi-'+s.id+'">' +
 '<img src="'+s.img+'" class="sma" alt="'+s.nom+'">' +
 '<div class="sminf">' +
 '<h4>'+s.nom+'</h4>' +
 '<p>'+s.adresse+' — '+s.gerant+'</p>' +
 '<p style="font-size:11px;color:var(--mu)">'+s.tel+'</p>' +
 '<span class="badge '+stCls+'">'+stLbl+'</span>' +
 '</div>' +
 '<div class="smst">' +
 '<div><div class="smv">'+calculerCA(s.nom)+'</div><div class="smlb">CA FCFA</div></div>' +
 '<div><div class="smv">'+s.employes+'</div><div class="smlb">Employés</div></div>' +
 '</div>' +
 '<div style="display:flex;gap:6px;margin-top:8px">' +
 '<button class="btn bo bsm" onclick="editSM('+s.id+')">Modifier</button>' +
 '<button class="btn bd bsm" onclick="supprimerSM('+s.id+')">Supprimer</button>' +
 '</div>' +
 '</div>';
 }).join('');

 // Mettre à jour le badge nb supermarchés dans le dashboard
 var nb = document.getElementById('nb-sm');
 if (nb) nb.textContent = STORES.length;
}

async function ajouterSM() {
 var nom = val('sm-n'); if (!nom) { toast('Entrez le nom du supermarché', 'warning'); return; }
 var ville = document.getElementById('sm-v').value;
 var adresse = val('sm-a') || '';
 var gerant = val('sm-g') || '';
 var tel = val('sm-t') || '';
 var statut = document.getElementById('sm-st').value || 'ouvert';
 var img = val('sm-img') || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200&h=200&fit=crop';
 var empVal = parseInt((document.getElementById('sm-emp')||{}).value) || 0;
 var store = { nom:nom, ville:ville, adresse:adresse, gerant:gerant, tel:tel, statut:statut, ca:'0', employes:empVal, img:img, created_at: new Date().toISOString() };
 try {
 var sb = _sbMain();
 if (sb) {
 var res = await sb.from('supermarchés').insert(store).select().single();
 if (res.data) store = res.data;
 } else { store.id = smSeq++; }
 } catch(e) { console.warn('[Stores] ajouter:', e); store.id = smSeq++; }
 STORES.push(store);
 renderStores(); refreshAllSMSelects(); closeM('m-sm');
 toast('Supermarché "' + nom + '" ajouté !', 'success');
 addNotif('Nouveau supermarché : ' + nom, 'green');
 ['sm-n','sm-a','sm-g','sm-t','sm-img'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

function editSM(id) {
 var s = STORES.find(function(x){ return x.id===id; }); if (!s) return;
 // Pré-remplir le formulaire
 var n=document.getElementById('sm-n'), v=document.getElementById('sm-v'),
 a=document.getElementById('sm-a'), g=document.getElementById('sm-g'),
 t=document.getElementById('sm-t'), st=document.getElementById('sm-st'),
 img=document.getElementById('sm-img');
 var emp = document.getElementById('sm-emp');
 if(n) n.value=s.nom; if(v) v.value=s.ville; if(a) a.value=s.adresse;
 if(g) g.value=s.gerant; if(t) t.value=s.tel; if(st) st.value=s.statut;
 if(img) img.value=s.img;
 if(emp) emp.value=s.employes||0;
 // Changer le bouton pour "Modifier"
 var btn = document.getElementById('sm-save-btn');
 if (btn) { btn.textContent='Enregistrer modifications'; btn.onclick=function(){ saveSM(id); }; }
 var mh = document.querySelector('#m-sm .mh h3');
 if (mh) mh.textContent = 'Modifier le supermarché';
 openM('m-sm');
}

async function saveSM(id) {
 var s = STORES.find(function(x){ return x.id==id; }); if (!s) return;
 s.nom = val('sm-n') || s.nom;
 s.ville = document.getElementById('sm-v').value;
 s.adresse = val('sm-a') || s.adresse;
 s.gerant = val('sm-g') || s.gerant;
 s.tel = val('sm-t') || s.tel;
 s.statut = document.getElementById('sm-st').value;
 s.img = val('sm-img') || s.img;
 var empEl = document.getElementById('sm-emp');
 if (empEl && empEl.value !== '') s.employes = parseInt(empEl.value) || 0;
 try {
 var sb = _sbMain();
 if (sb) await sb.from('supermarchés').update({ nom:s.nom, ville:s.ville, adresse:s.adresse, gerant:s.gerant, tel:s.tel, statut:s.statut, img:s.img, employes:s.employes }).eq('id', id);
 } catch(e) { console.warn('[Stores] save:', e); }
 renderStores(); refreshAllSMSelects();
renderUsers();
renderPromos();
renderFideliteClients();
renderLivraisons();
if(typeof renderLivreurs==="function") renderLivreurs();
renderRetours();
renderStatsClients();
renderVueLivreur();
applyRoleRestrictions();
initConfigLivePreview(); closeM('m-sm');
 toast('Supermarché modifié !', 'success');
 // Réinitialiser le bouton
 var btn = document.getElementById('sm-save-btn');
 if (btn) { btn.textContent='Ajouter'; btn.onclick=ajouterSM; }
 var mh = document.querySelector('#m-sm .mh h3');
 if (mh) mh.textContent = 'Nouveau supermarché';
}

async function supprimerSM(id) {
 var s = STORES.find(function(x){ return x.id==id; }); if (!s) return;
 if (!confirm('Supprimer "'+s.nom+'" ? Cette action est irréversible.')) return;
 try {
 var sb = _sbMain();
 if (sb) await sb.from('supermarchés').delete().eq('id', id);
 } catch(e) { console.warn('[Stores] supprimer:', e); }
 STORES = STORES.filter(function(x){ return x.id != id; });
 renderStores(); refreshAllSMSelects();
renderUsers();
renderPromos();
renderFideliteClients();
renderLivraisons();
if(typeof renderLivreurs==="function") renderLivreurs();
renderRetours();
renderStatsClients();
renderVueLivreur();
applyRoleRestrictions();
initConfigLivePreview();
 toast('Supermarché supprimé', 'error');
}

async function chargerStoresLocalStorage() {
 try {
 var sb = _sbMain();
 if (sb) {
 var res = await sb.from('supermarchés').select('*').order('created_at', { ascending: true });
 if (res.data && res.data.length > 0) {
 STORES = res.data;
 return;
 }
 }
 } catch(e) { console.warn('[Stores] charger:', e); }
 // fallback localStorage
 try {
 var stored = JSON.parse(localStorage.getItem('sm_stores') || 'null');
 if (stored && stored.length > 0) { STORES = stored; }
 } catch(e) { _logErr("script.js", e); }
}

var PANIER = [];
var cSeq = 5, cFilter = '';

// ═══════════════ PRODUITS ═══════════════
function fmt(n) { return n.toLocaleString('fr-FR')+' FCFA'; }

function renderProds() {
 var tb = document.getElementById('prod-tbody'); if (!tb) return;
 tb.innerHTML = PRODS.map(function(p){
 var scls = p.stock===0?'bgr':p.stock<10?'bgy':'bgg';
 var slbl = p.stock===0?'Rupture':p.stock<10?'Critique':'En stock';
 var col = p.stock===0?'var(--r)':p.stock<10?'#B8860B':'var(--tx)';
 var btn = '<div style="display:flex;gap:4px">' + (p.stock<10 ? '<button class="btn bp bsm" onclick="reappro('+p.id+')">Réappro</button>' : '') + '<button class="btn bo bsm" onclick="editProd('+p.id+')">Modifier</button><button class="btn bd bsm" onclick="supprimerProd('+p.id+')">Supprimer</button></div>';
 return '<tr><td><div style="display:flex;align-items:center;gap:9px"><img src="'+p.img+'" alt="'+p.nom+'" style="width:36px;height:36px;border-radius:7px;object-fit:cover;flex-shrink:0"> <span>'+p.nom+'</span></div></td><td>'+p.cat+'</td><td>'+p.prix.toLocaleString('fr-FR')+' FCFA</td><td style="font-weight:700;color:'+col+'">'+p.stock+'</td><td>'+p.sm+'</td><td><span class="badge '+scls+'">'+slbl+'</span></td><td>'+btn+'</td></tr>';
 }).join('');
 updateBadgeProd();
}

async function reappro(id) {
 var p = PRODS.find(function(x){ return x.id===id; }); if (!p) return;
 p.stock += 50;
 try {
 var sb = _sbMain();
 if (sb) await sb.from('produits').update({ stock: p.stock }).eq('id', p.id);
 } catch(e) { console.warn('[Reappro] Supabase:', e); }
 toast('Réappro commandé pour '+p.nom, 'success');
 addNotif('Réappro : '+p.nom, 'green');
 renderProds(); renderCat();
}

function updateBadgeProd() {
 var n = PRODS.filter(function(p){ return p.stock<10; }).length;
 var b = document.getElementById('b-prod'); if (b) b.textContent = n;
 var rb = document.getElementById('rupt-badge'); if (rb) rb.textContent = n+' ruptures';
}

async function supprimerProd(id) {
 var p = PRODS.find(function(x){ return x.id == id; });
 if (!p) return;
 if (!confirm('Supprimer le produit "' + (p.nom||'') + '" ?')) return;
 try {
 var sb = _sbMain();
 if (sb) await sb.from('produits').delete().eq('id', p.id);
 } catch(e) { console.warn('[Produits] supprimer:', e); }
 PRODS = PRODS.filter(function(x){ return x.id != id; });
 renderProds(); renderCat();
 addNotif('Produit supprimé : ' + p.nom, 'red');
 toast('Produit "' + p.nom + '" supprimé', 'success');
}

function editProd(id) {
 var p = PRODS.find(function(x){ return x.id == id; });
 if (!p) return;
 var el = function(i){ return document.getElementById(i); };
 if (el('pn')) el('pn').value = p.nom || '';
 if (el('pp')) el('pp').value = p.prix || 0;
 if (el('ps')) el('ps').value = p.stock || 0;
 if (el('pimg')) el('pimg').value = p.img || '';
 if (el('pc')) el('pc').value = p.cat || '';
 if (el('psm')) el('psm').value = p.sm || '';
 var mh = document.querySelector('#m-prod .mh h3');
 if (mh) mh.textContent = 'Modifier le produit';
 var btn = document.querySelector('#m-prod .btng .btn.bp');
 if (btn) { btn.textContent = 'Enregistrer'; btn.onclick = function(){ saveProd(id); }; }
 openM('m-prod');
}

async function saveProd(id) {
 var p = PRODS.find(function(x){ return x.id == id; });
 if (!p) return;
 p.nom = val('pn') || p.nom;
 p.prix = parseFloat((document.getElementById('pp')||{}).value) || p.prix;
 p.stock = parseInt((document.getElementById('ps')||{}).value) || p.stock;
 p.img = fixUnsplashUrl(val('pimg')) || p.img;
 p.cat = (document.getElementById('pc') ||{}).value || p.cat;
 p.sm = (document.getElementById('psm')||{}).value || p.sm;
 try {
 var sb = _sbMain();
 if (sb) await sb.from('produits').update({
 nom: p.nom, prix: p.prix, stock: p.stock,
 img: p.img, cat: p.cat, sm: p.sm
 }).eq('id', p.id);
 } catch(e) { console.warn('[Produits] modifier:', e); }
 renderProds(); renderCat();
 closeM('m-prod');
 var mh = document.querySelector('#m-prod .mh h3');
 if (mh) mh.textContent = 'Nouveau produit';
 var btn = document.querySelector('#m-prod .btng .btn.bp');
 if (btn) { btn.textContent = 'Ajouter'; btn.onclick = ajouterProd; }
 toast('Produit modifié avec succès', 'success');
}

// ── Prévisualisation image produit ──
function previewProdImg(url) {
 var preview = document.getElementById('pimg-preview');
 var thumb = document.getElementById('pimg-thumb');
 var errDiv = document.getElementById('pimg-error');
 if (!url || url.length < 10) {
 if (preview) preview.style.display = 'none';
 if (errDiv) errDiv.style.display = 'none';
 return;
 }
 // Corriger automatiquement les URLs Unsplash (ajouter paramètres si absents)
 var cleanUrl = fixUnsplashUrl(url);
 var inp = document.getElementById('pimg');
 if (inp && cleanUrl !== url) inp.value = cleanUrl;

 if (thumb) {
 thumb.src = cleanUrl;
 thumb.onload = function() {
 if (preview) preview.style.display = 'flex';
 if (errDiv) errDiv.style.display = 'none';
 };
 thumb.onerror = function() {
 if (preview) preview.style.display = 'none';
 if (errDiv) errDiv.style.display = 'block';
 };
 }
}

// ── Corriger URL Unsplash automatiquement ──
function fixUnsplashUrl(url) {
 if (!url) return url;
 // Si c'est une URL Unsplash sans paramètres de taille, les ajouter
 if (url.includes('unsplash.com') && !url.includes('?')) {
 return url + '?w=120&h=120&fit=crop';
 }
 // Si paramètres présents mais taille différente, normaliser
 if (url.includes('unsplash.com') && url.includes('?')) {
 var base = url.split('?')[0];
 return base + '?w=120&h=120&fit=crop';
 }
 return url;
}

// ═══════════════════════════════════════════════════════
// EXPORT CSV
// ═══════════════════════════════════════════════════════
function telechargerCSV(contenu, nomFichier) {
 var BOM = '\uFEFF'; // Pour que Excel affiche bien les accents
 var blob = new Blob([BOM + contenu], { type: 'text/csv;charset=utf-8;' });
 var url = URL.createObjectURL(blob);
 var a = document.createElement('a');
 a.href = url;
 a.download = nomFichier;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
}

function exporterProdsCSV() {
 var lignes = ['Nom;Categorie;Prix (FCFA);Stock;Supermarche;Statut'];
 PRODS.forEach(function(p) {
 var statut = p.stock === 0 ? 'Rupture' : p.stock < 10 ? 'Stock critique' : 'En stock';
 lignes.push([
 '"' + (p.nom || '') + '"',
 '"' + (p.cat || '') + '"',
 p.prix || 0,
 p.stock || 0,
 '"' + (p.sm || '') + '"',
 '"' + statut + '"'
 ].join(';'));
 });
 var date = new Date().toLocaleDateString('fr-FR').replace(/\//g,'-');
 telechargerCSV(lignes.join('\n'), 'produits-' + date + '.csv');
 toast('CSV téléchargé — ' + PRODS.length + ' produits', 'success');
}

function exporterCmdsCSV() {
 var lignes = ['ID;Date;Client;Telephone;Supermarche;Paiement;Statut;Total (FCFA);Produits'];
 CMDS.forEach(function(c) {
 var produits = c.items ? c.items.map(function(i){ return i.qty + 'x ' + i.nom; }).join(' | ') : '';
 lignes.push([
 '"' + (c.id || '') + '"',
 '"' + (c.date || '') + '"',
 '"' + (c.client || '') + '"',
 '"' + (c.tel || '') + '"',
 '"' + (c.sm || '') + '"',
 '"' + (c.pay || '') + '"',
 '"' + (c.statut || '') + '"',
 c.total || 0,
 '"' + produits + '"'
 ].join(';'));
 });
 var date = new Date().toLocaleDateString('fr-FR').replace(/\//g,'-');
 telechargerCSV(lignes.join('\n'), 'commandes-' + date + '.csv');
 toast('CSV téléchargé — ' + CMDS.length + ' commandes', 'success');
}

function exporterVentesCSV() {
 var livrees = CMDS.filter(function(c){ return c.statut === 'livree' || c.statut === 'confirmee'; });
 var lignes = ['ID;Date;Client;Supermarche;Paiement;Total (FCFA)'];
 livrees.forEach(function(c) {
 lignes.push([
 '"' + (c.id || '') + '"',
 '"' + (c.date || '') + '"',
 '"' + (c.client || '') + '"',
 '"' + (c.sm || '') + '"',
 '"' + (c.pay || '') + '"',
 c.total || 0
 ].join(';'));
 });
 var date = new Date().toLocaleDateString('fr-FR').replace(/\//g,'-');
 telechargerCSV(lignes.join('\n'), 'ventes-' + date + '.csv');
 toast('CSV téléchargé — ' + livrees.length + ' ventes', 'success');
}

async function ajouterProd() {
 var nom = val('pn'), prix = parseFloat((document.getElementById('pp')||{}).value)||0;
 var stock = parseInt((document.getElementById('ps')||{}).value)||0;
 if (!nom||prix<=0) { toast('Nom et prix requis', 'warning'); return; }
 var imgUrl = fixUnsplashUrl(val('pimg')) || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&h=120&fit=crop';
 var prod = {
 nom: nom,
 img: imgUrl,
 cat: (document.getElementById('pc')||{}).value || '',
 prix: prix,
 stock: stock,
 sm: (document.getElementById('psm')||{}).value || '',
 created_at: new Date().toISOString()
 };
 try {
 var sb = _sbMain();
 if (sb) {
 var res = await sb.from('produits').insert(prod).select().single();
 if (res.data) prod = res.data;
 else prod.id = Date.now();
 } else { prod.id = Date.now(); }
 } catch(e) { console.warn('[Produits] ajouter:', e); prod.id = Date.now(); }
 PRODS.push(prod);
 closeM('m-prod'); renderProds(); renderCat();
 addNotif('Nouveau produit : ' + nom, 'green');
 toast('Produit "'+nom+'" ajouté !', 'success');
 ['pn','pp','ps','psl','pimg'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

// ═══════════════ PANIER ═══════════════
function getPanierTotal() { return PANIER.reduce(function(a,item){ var p=PRODS.find(function(x){ return x.id===item.id; }); return a+(p?p.prix*item.qty:0); },0); }
function getPanierCount() { return PANIER.reduce(function(a,i){ return a+i.qty; },0); }
function getPanierItem(id) { return PANIER.find(function(p){ return p.id===id; }); }

function updatePanierUI() {
 var cnt = getPanierCount(), tot = getPanierTotal();
 ['b-pan','pb-cnt','cf-cnt'].forEach(function(id){ var e=document.getElementById(id); if(e) e.textContent=cnt; });
 var fmtTot = fmt(tot);
 ['pb-tot','p-st','p-tot','cf-tot'].forEach(function(id){ var e=document.getElementById(id); if(e) e.textContent=fmtTot; });
 var cf = document.getElementById('cf'); if (cf) { if (cnt>0) cf.classList.add('show'); else cf.classList.remove('show'); }
}

function addToCart(id, qty) {
 qty = qty||1;
 var prod = PRODS.find(function(p){ return p.id===id; }); if (!prod) return;
 if (prod.stock===0) { toast('Rupture de stock !', 'error'); return; }
 var ex = getPanierItem(id);
 if (ex) { if (ex.qty+qty>prod.stock) { toast('Max : '+prod.stock+' unités', 'warning'); return; } ex.qty+=qty; }
 else PANIER.push({id:id, qty:qty});
 updatePanierUI();
 toast(prod.nom+' ajouté au panier', 'success');
}

function removeFromCart(id) { PANIER = PANIER.filter(function(p){ return p.id!==id; }); updatePanierUI(); renderPanier(); renderCat(); }

function updateCartQty(id, d) {
 var prod=PRODS.find(function(p){ return p.id===id; }), item=getPanierItem(id); if (!item) return;
 var nq = item.qty+d;
 if (nq<=0) { removeFromCart(id); return; }
 if (nq>prod.stock) { toast('Max: '+prod.stock, 'warning'); return; }
 item.qty = nq; updatePanierUI(); renderPanier();
}

function viderPanier() {
 if (PANIER.length===0) return;
 PANIER = []; updatePanierUI(); renderPanier(); renderCat();
 toast('Panier vidé', 'warning');
}

function renderPanier() {
 var b = document.getElementById('pbody'); if (!b) return;
 if (PANIER.length===0) {
 b.innerHTML = '<div class="empty"><img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&h=80&fit=crop" style="width:70px;height:70px;border-radius:12px;object-fit:cover;margin-bottom:10px"><h3>Panier vide</h3><p>Parcourez le catalogue pour ajouter des produits</p></div>';
 return;
 }
 b.innerHTML = PANIER.map(function(item){
 var p = PRODS.find(function(x){ return x.id===item.id; }); if (!p) return '';
 return '<div class="pit"><img src="'+p.img+'" alt="'+p.nom+'" class="pit-img"><div class="pinf"><div class="pnm">'+p.nom+'</div><div class="pun">'+p.prix.toLocaleString('fr-FR')+' FCFA/u</div></div>'+
 '<div class="pqt"><div class="qb" onclick="updateCartQty('+p.id+',-1)">−</div><span>'+item.qty+'</span><div class="qb" onclick="updateCartQty('+p.id+',1)">+</div></div>'+
 '<div class="ptot">'+(p.prix*item.qty).toLocaleString('fr-FR')+' FCFA</div><div class="prm" onclick="removeFromCart('+p.id+')"><img src="https://img.icons8.com/ios/18/CE1126/delete-sign.png" alt="fermer" style="width:14px;height:14px;vertical-align:middle"></div></div>';
 }).join('');
}

function openPanier() { renderPanier(); document.getElementById('pov').classList.add('open'); }
function closePanier() { document.getElementById('pov').classList.remove('open'); }

// ═══════════════ CATALOGUE ═══════════════

// ── Page Achats : Supermarché → ses produits ──
function remplirSelectSM() {
  var sel = document.getElementById('f-sm');
  if (!sel) return;
  var cur = sel.value;

  // Aussi essayer de charger depuis localStorage si STORES vide
  if (!STORES || STORES.length === 0) {
    try {
      var saved = JSON.parse(localStorage.getItem('sm_stores') || 'null');
      if (saved && saved.length > 0) STORES = saved;
    } catch(e) { _logErr("script.js", e); }
  }

  sel.innerHTML = '<option value="">Tous les supermarchés</option>';

  if (!STORES || STORES.length === 0) {
    var opt = document.createElement('option');
    opt.value = '__aucun__';
    opt.textContent = '— Aucun supermarché (ajoutez-en dans Supermarchés) —';
    opt.disabled = true;
    sel.appendChild(opt);
    return;
  }

  STORES.forEach(function(s) {
    var opt = document.createElement('option');
    opt.value = s.nom;
    opt.textContent = s.nom + (s.ville ? ' — ' + s.ville : '');
    if (s.nom === cur) opt.selected = true;
    sel.appendChild(opt);
  });
}

function renderCatParSM() {
  var smNom = (document.getElementById('f-sm')||{}).value || '';
  var cat   = (document.getElementById('f-cat')||{}).value || '';
  var srch  = ((document.getElementById('f-srch')||{}).value || '').toLowerCase();

  // Filtrer les produits selon le supermarché sélectionné
  var liste = PRODS.filter(function(p) {
    var matchSM   = !smNom || (p.sm && p.sm === smNom);
    var matchCat  = !cat   || p.cat === cat;
    var matchSrch = !srch  || p.nom.toLowerCase().includes(srch);
    return matchSM && matchCat && matchSrch;
  });

  var grid = document.getElementById('agrid');
  if (!grid) return;

  if (liste.length === 0) {
    grid.innerHTML = '<div class="empty" style="grid-column:1/-1;padding:40px;text-align:center">'
      + '<div style="font-size:48px;margin-bottom:12px">🔍</div>'
      + '<h3>' + (smNom ? 'Aucun produit pour ' + smNom : 'Aucun produit trouvé') + '</h3>'
      + '<p style="color:#999">' + (smNom ? 'Ce supermarché n\'a pas encore de produits' : 'Modifiez vos critères') + '</p>'
      + '</div>';
    return;
  }

  // Afficher les produits avec leur supermarché d'origine
  grid.innerHTML = liste.map(function(p) {
    var inCart = getPanierItem(p.id);
    var qic = inCart ? inCart.qty : 0;
    var stCls = p.stock === 0 ? 'red' : p.stock < 10 ? 'orange' : 'green';
    var stLbl = p.stock === 0 ? 'Rupture' : p.stock < 10 ? 'Stock faible' : 'Disponible';
    var btn;
    if (p.stock === 0) {
      btn = '<button class="acbtn" disabled>Indisponible</button>';
    } else if (inCart) {
      btn = '<div class="qc"><div class="qb" onclick="chQty(' + p.id + ',-1)">−</div>'
          + '<span class="qv" id="lq' + p.id + '">' + (qic||1) + '</span>'
          + '<div class="qb" onclick="chQty(' + p.id + ',1)">+</div></div>'
          + '<button class="acbtn rm" onclick="removeFromCart(' + p.id + ');renderCatParSM()">Retirer (' + qic + ')</button>';
    } else {
      btn = '<div class="qc"><div class="qb" onclick="chQty(' + p.id + ',-1)">−</div>'
          + '<span class="qv" id="lq' + p.id + '">1</span>'
          + '<div class="qb" onclick="chQty(' + p.id + ',1)">+</div></div>'
          + '<button class="acbtn" onclick="addFromCard(' + p.id + ');renderCatParSM()">Ajouter</button>';
    }
    return '<div class="acd' + (inCart ? ' ic' : '') + '">'
      + '<div class="aimg-wrap">'
      + '<img src="' + p.img + '" alt="' + p.nom + '" class="acd-img" onerror=\'this.src=\"https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&h=120&fit=crop\"\' >'
      + '<span class="psbadge ' + stCls + '">' + stLbl + '</span>'
      + '</div>'
      + '<div class="anm">' + p.nom + '</div>'
      + '<div class="acat">' + p.cat + (p.sm ? ' · ' + p.sm : '') + '</div>'
      + '<div class="apr">' + p.prix.toLocaleString('fr-FR') + ' FCFA</div>'
      + btn
      + '</div>';
  }).join('');
}

function renderCat() {
 var sm = (document.getElementById('f-sm')||{}).value||'';
 var cat = (document.getElementById('f-cat')||{}).value||'';
 var srch = ((document.getElementById('f-srch')||{}).value||'').toLowerCase();
 var liste = PRODS.filter(function(p){ return (!sm||p.sm===sm)&&(!cat||p.cat===cat)&&(!srch||p.nom.toLowerCase().includes(srch)); });
 var grid = document.getElementById('agrid'); if (!grid) return;
 if (liste.length===0) {
 grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" style="width:60px;height:60px;border-radius:10px;object-fit:cover;margin-bottom:10px"><h3>Aucun produit trouvé</h3><p>Modifiez vos critères</p></div>';
 return;
 }
 grid.innerHTML = liste.map(function(p){
 var inCart = getPanierItem(p.id); var qic = inCart?inCart.qty:0;
 var sc = p.stock===0?'var(--r)':p.stock<10?'#B8860B':'#6B7B6B';
 var sl = p.stock===0?'Rupture de stock':p.stock<10?p.stock+' restants en stock':p.stock+' en stock';
 var statusBadge = p.stock===0?'<span class="psbadge red">Rupture</span>':p.stock<10?'<span class="psbadge orange">Stock faible</span>':'<span class="psbadge green">Disponible</span>';
 var btn;
 if (p.stock===0) btn = '<button class="acbtn" disabled>Indisponible</button>';
 else if (inCart) btn = '<div class="qc"><div class="qb" onclick="chQty('+p.id+',-1)">−</div><span class="qv" id="lq'+p.id+'">'+(qic||1)+'</span><div class="qb" onclick="chQty('+p.id+',1)">+</div></div><button class="acbtn rm" onclick="removeFromCart('+p.id+');renderCat()">Retirer ('+qic+')</button>';
 else btn = '<div class="qc"><div class="qb" onclick="chQty('+p.id+',-1)">−</div><span class="qv" id="lq'+p.id+'">1</span><div class="qb" onclick="chQty('+p.id+',1)">+</div></div><button class="acbtn" onclick="addFromCard('+p.id+')">Ajouter au panier</button>';
 return '<div class="acd'+(inCart?' ic':'')+'"><div class="aimg-wrap"><img src="'+p.img+'" alt="'+p.nom+'" class="acd-img" onerror="this.src=\'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&h=120&fit=crop\'">'+statusBadge+'</div><div class="anm">'+p.nom+'</div><div class="acat">'+p.cat+'</div><div class="apr">'+p.prix.toLocaleString('fr-FR')+' FCFA</div>'+btn+'</div>';
 }).join('');
}

function chQty(id, d) { var el=document.getElementById('lq'+id); if (!el) return; var p=PRODS.find(function(x){ return x.id===id; }); el.textContent=Math.max(1,Math.min(parseInt(el.textContent)+d,p.stock)); }
function addFromCard(id) { var el=document.getElementById('lq'+id); addToCart(id, el?parseInt(el.textContent):1); renderCat(); }

// ═══════════════ COMMANDES ═══════════════
var ST = {en_attente:{lbl:'En attente',cls:'bgy'}, confirmee:{lbl:'Confirmée',cls:'bgb'}, livraison:{lbl:'En livraison',cls:'bgy'}, livree:{lbl:'Livrée',cls:'bgg'}, annulee:{lbl:'Annulée',cls:'bgr'}};
var TLS = ['En attente','Confirmée','En livraison','Livrée'];
var STS = {en_attente:0, confirmee:1, livraison:2, livree:3, annulee:-1};

function filterCmd(f, btn) {
 cFilter = f;
 document.querySelectorAll('.ft').forEach(function(t){ t.classList.remove('active'); });
 if (btn) btn.classList.add('active');
 renderCmds();
}

function updateBadgeCmd() {
 var n = CMDS.filter(function(c){ return ['en_attente','confirmee','livraison'].includes(c.statut); }).length;
 var b = document.getElementById('b-cmd'); if (b) b.textContent = n;
}

function renderCmds() {
 var list = document.getElementById('cmd-list'); if (!list) return;
 var fil = cFilter ? CMDS.filter(function(c){ return c.statut===cFilter; }) : CMDS;
 if (fil.length===0) {
 list.innerHTML = '<div class="empty"><h3>Aucune commande</h3><p>Aucune commande dans cette catégorie</p><button class="btn bp" onclick="openM(\'m-cmd\')">Créer une commande</button></div>';
 return;
 }
 list.innerHTML = fil.map(function(cmd){
 var st = ST[cmd.statut], step = STS[cmd.statut];
 var tl = cmd.type==='reservation' ? '<span class="badge bgb" style="margin-left:7px">Réservation</span>' : '';
 var tlh = '';
 if (cmd.statut!=='annulee') {
 tlh = '<div class="tl">';
 TLS.forEach(function(s,i){
 if (i>0) tlh += '<div class="tlln'+(i<=step?' done':'')+'"></div>';
 tlh += '<div class="tls"><div class="tld'+(i<step?' done':i===step?' curr':'')+'">'+( i<step?'<img src="https://img.icons8.com/ios/18/007A3D/checkmark.png" alt="ok" style="width:14px;height:14px;vertical-align:middle">':i+1)+'</div><div class="tll">'+s+'</div></div>';
 });
 tlh += '</div>';
 }
 var acts = '';
 if (cmd.statut==='en_attente') acts = '<button class="btn bp bsm" onclick="updSt(\''+cmd.id+'\',\'confirmee\')">Confirmer</button><button class="btn bd bsm" onclick="updSt(\''+cmd.id+'\',\'annulee\')">Annuler</button>';
 else if (cmd.statut==='confirmee') acts = '<button class="btn bp bsm" onclick="updSt(\''+cmd.id+'\',\'livraison\')">Expédier</button><button class="btn bd bsm" onclick="updSt(\''+cmd.id+'\',\'annulee\')">Annuler</button>';
 else if (cmd.statut==='livraison') acts = '<button class="btn bp bsm" onclick="updSt(\''+cmd.id+'\',\'livree\')">Marquer livrée</button>';
 var items = cmd.items.map(function(it){ return '<div class="cmdr"><div style="display:flex;align-items:center;gap:7px"><img src="'+it.img+'" style="width:28px;height:28px;border-radius:5px;object-fit:cover"> <span>'+it.nom+' × '+it.qty+'</span></div><span style="font-weight:700">'+(it.prix*it.qty).toLocaleString('fr-FR')+' FCFA</span></div>'; }).join('');
 if (cmd.notes) items += '<div style="font-size:11px;color:var(--mu);margin-top:4px;font-style:italic">'+cmd.notes+'</div>';
 return '<div class="cmdcd"><div class="cmdh"><div><div class="cmdid">'+cmd.id+''+tl+'</div><div class="cmdm">'+cmd.date+' — '+cmd.sm+' — '+cmd.pay+'</div><div class="cmdm">'+cmd.client+' — '+cmd.tel+'</div></div><span class="badge '+st.cls+'">'+st.lbl+'</span></div>'+tlh+'<div class="cmdi">'+items+'</div><div class="cmdf"><div class="cmdt">'+cmd.total.toLocaleString('fr-FR')+' FCFA</div><div style="display:flex;gap:6px">'+acts+'<button class="btn bo bsm" onclick="imprimerCommande(\''+cmd.id+'\')"> Imprimer</button></div></div></div>';
 }).join('');
}

// ── Impression bon de commande PDF ──
function imprimerCommande(id) {
 var cmd = CMDS.find(function(c){ return c.id===id; });
 if (!cmd) return;

 var ST_LABELS = { en_attente:'En attente', confirmee:'Confirmée', livraison:'En livraison', livree:'Livrée', annulee:'Annulée' };
 var ST_COLORS = { en_attente:'#f59e0b', confirmee:'#3b82f6', livraison:'#f59e0b', livree:'#007A3D', annulee:'#ef4444' };
 var statut = ST_LABELS[cmd.statut] || cmd.statut;
 var couleur = ST_COLORS[cmd.statut] || '#007A3D';

 var lignesItems = cmd.items.map(function(it, i) {
 return '<tr style="background:' + (i%2===0?'#f9fafb':'#fff') + '">'
 + '<td style="padding:10px 14px;border-bottom:1px solid #f0f0f0">' + it.nom + '</td>'
 + '<td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:center">' + it.qty + '</td>'
 + '<td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:right">' + it.prix.toLocaleString('fr-FR') + ' FCFA</td>'
 + '<td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:700">' + (it.prix*it.qty).toLocaleString('fr-FR') + ' FCFA</td>'
 + '</tr>';
 }).join('');

 var sousTtl = cmd.items.reduce(function(s,it){ return s+it.prix*it.qty; }, 0);
 var livraison = cmd.total - sousTtl;
 var smNom = (currentUser && currentUser.sm) ? currentUser.sm.split(' — ')[0] : 'KAMER360';
 var smVille = (currentUser && currentUser.sm) ? (currentUser.sm.split(' — ')[1] || '') : '';

 var html = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">'
 + '<title>Bon de commande ' + cmd.id + '</title>'
 + '<style>'
 + '* { margin:0; padding:0; box-sizing:border-box; }'
 + 'body { font-family: Arial, sans-serif; font-size:13px; color:#333; background:#fff; }'
 + '.page { max-width:720px; margin:0 auto; padding:32px; }'
 + '.header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; padding-bottom:20px; border-bottom:3px solid #007A3D; }'
 + '.logo { font-size:24px; font-weight:900; color:#007A3D; letter-spacing:-0.5px; }'
 + '.logo span { color:#CE1126; }'
 + '.badge { display:inline-block; padding:5px 14px; border-radius:20px; font-size:12px; font-weight:700; color:#fff; }'
 + '.infos { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; }'
 + '.bloc { background:#f9fafb; border-radius:10px; padding:14px 16px; }'
 + '.bloc h4 { font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#999; margin-bottom:8px; }'
 + '.bloc p { font-size:13px; color:#333; line-height:1.7; }'
 + '.bloc strong { color:#111; }'
 + 'table { width:100%; border-collapse:collapse; margin-bottom:16px; }'
 + 'thead th { background:#007A3D; color:#fff; padding:10px 14px; text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:.4px; }'
 + 'thead th:last-child, thead th:nth-child(3), thead th:nth-child(2) { text-align:right; }'
 + 'thead th:nth-child(2) { text-align:center; }'
 + '.totaux { display:flex; justify-content:flex-end; margin-bottom:24px; }'
 + '.totaux-bloc { width:260px; }'
 + '.ligne-tot { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f0f0f0; font-size:13px; }'
 + '.ligne-final { display:flex; justify-content:space-between; padding:10px 14px; background:#007A3D; border-radius:8px; color:#fff; font-weight:700; font-size:15px; margin-top:6px; }'
 + '.footer { border-top:2px solid #e5e7eb; padding-top:16px; display:flex; justify-content:space-between; align-items:center; }'
 + '.footer p { font-size:11px; color:#999; }'
 + '.merci { text-align:center; margin:20px 0; font-size:15px; color:#007A3D; font-weight:700; }'
 + '.note { background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:10px 14px; margin-bottom:20px; font-size:12px; color:#92400e; }'
 + '@media print { body { print-color-adjust:exact; -webkit-print-color-adjust:exact; } }'
 + '</style></head><body><div class="page">'

 // EN-TETE
 + '<div class="header">'
 + '<div><div class="logo">Super<span>Marché</span> CM</div>'
 + '<div style="font-size:12px;color:#666;margin-top:4px">' + smNom + (smVille ? ' — ' + smVille : '') + '</div>'
 + '<div style="font-size:11px;color:#999;margin-top:2px">Tel : +237 683 39 22 68</div></div>'
 + '<div style="text-align:right">'
 + '<div style="font-size:20px;font-weight:800;color:#333">BON DE COMMANDE</div>'
 + '<div style="font-size:16px;font-weight:700;color:#007A3D;margin-top:4px">' + cmd.id + '</div>'
 + '<div style="margin-top:8px"><span class="badge" style="background:'+couleur+'">' + statut + '</span></div>'
 + '<div style="font-size:11px;color:#999;margin-top:6px">Émis le ' + cmd.date + '</div>'
 + '</div></div>'

 // INFOS CLIENT + LIVRAISON
 + '<div class="infos">'
 + '<div class="bloc"><h4>Client</h4><p>'
 + '<strong>' + cmd.client + '</strong><br>'
 + 'Tel : ' + cmd.tel + '<br>'
 + (cmd.adresse ? 'Adresse : ' + cmd.adresse + '<br>' : '')
 + (cmd.ville ? 'Ville : ' + cmd.ville : '')
 + '</p></div>'
 + '<div class="bloc"><h4>Informations commande</h4><p>'
 + 'Mode de paiement : <strong>' + (cmd.pay || '—') + '</strong><br>'
 + 'Type : <strong>' + (cmd.type === 'reservation' ? 'Réservation' : 'Commande standard') + '</strong><br>'
 + 'Supermarché : <strong>' + (cmd.sm || smNom) + '</strong>'
 + '</p></div>'
 + '</div>'

 // NOTE CLIENT
 + (cmd.notes ? '<div class="note">Note : ' + cmd.notes + '</div>' : '')

 // TABLEAU PRODUITS
 + '<table><thead><tr>'
 + '<th>Produit</th><th style="text-align:center">Qté</th><th style="text-align:right">Prix unit.</th><th style="text-align:right">Total</th>'
 + '</tr></thead><tbody>' + lignesItems + '</tbody></table>'

 // TOTAUX
 + '<div class="totaux"><div class="totaux-bloc">'
 + '<div class="ligne-tot"><span>Sous-total</span><span>' + sousTtl.toLocaleString('fr-FR') + ' FCFA</span></div>'
 + '<div class="ligne-tot"><span>Frais de livraison</span><span>' + (livraison > 0 ? livraison.toLocaleString('fr-FR') + ' FCFA' : 'Gratuit') + '</span></div>'
 + '<div class="ligne-final"><span>TOTAL</span><span>' + cmd.total.toLocaleString('fr-FR') + ' FCFA</span></div>'
 + '</div></div>'

 // MERCI + PIED DE PAGE
 + '<div class="merci">Merci pour votre confiance !</div>'
 + '<div class="footer">'
 + '<p>KAMER360 — Votre supermarché en ligne au Cameroun<br>WhatsApp : +237 693 59 14 79 | Service client : +237 683 39 22 68</p>'
 + '<p style="text-align:right">Document généré le<br>' + new Date().toLocaleDateString('fr-FR') + '</p>'
 + '</div>'
 + '</div></body></html>';

 // Lancer l'impression via iframe (sans popup)
 lancerImpression(html);
}

function updSt(id, ns) {
 var cmd = CMDS.find(function(c){ return c.id===id; }); if (!cmd) return;
 cmd.statut = ns; updateBadgeCmd(); renderCmds();

 var msgs = {confirmee:'Commande '+id+' confirmée', livraison:'Commande '+id+' expédiée', livree:'Commande '+id+' livrée', annulee:'Commande '+id+' annulée'};
 var types = {confirmee:'success', livraison:'warning', livree:'success', annulee:'error'};
 toast(msgs[ns], types[ns]);
 addNotif(msgs[ns], types[ns]==='success'?'green':types[ns]==='error'?'red':'yellow');

 // ── Créer automatiquement une livraison quand confirmée ──
 if (ns === 'confirmee' || ns === 'livraison') {
   if (typeof LIVRAISONS !== 'undefined' && typeof creerLivraison === 'function') {
     var dejaCree = LIVRAISONS.liste.find(function(l){ return l.cmd_id === cmd.id; });
     if (!dejaCree) {
       creerLivraison(cmd).then(function(liv) {
         toast('Livraison ' + liv.id + ' créée — assignez un livreur', 'success');
         addNotif('Nouvelle livraison à assigner : ' + cmd.client + ' — ' + (cmd.adresse||cmd.ville||''), 'green');
       }).catch(function(e){ console.warn('creerLivraison:', e); });
     }
   }
 }

 // ── Déstockage automatique quand commande livrée ──
 if (ns === 'livree' && cmd.items) {
 cmd.items.forEach(function(item) {
 var prod = PRODS.find(function(p){ return p.nom === item.nom; });
 if (prod && prod.stock > 0) {
 prod.stock = Math.max(0, prod.stock - (item.qty || 1));
 if (prod.stock === 0) {
 addNotif('Rupture de stock : ' + prod.nom, 'red');
 toast('Rupture : ' + prod.nom, 'error');
 } else if (prod.stock < 10) {
 addNotif('Stock critique : ' + prod.nom + ' — ' + prod.stock + ' unité(s)', 'yellow');
 }
 }
 });
 try { localStorage.setItem('sm_prods', JSON.stringify(PRODS)); } catch(e) { _logErr("script.js", e); }
 }

 renderDashboard();

 // ── SMS automatique via Railway backend ──
 if (cmd.tel && cmd.tel !== '—') {
 var route = '';
 var body = {};
 if (ns === 'confirmee') { route = '/sms/commande'; body = { tel: cmd.tel, client: cmd.prenom || cmd.client, id: cmd.id, total: cmd.total, items: cmd.items ? cmd.items.map(function(i){ return i.qty+'x '+i.nom; }).join(', ') : '' }; }
 else if (ns === 'livraison') { route = '/sms/livraison'; body = { tel: cmd.tel, client: cmd.prenom || cmd.client, id: cmd.id }; }
 else if (ns === 'livree') { route = '/sms/livree'; body = { tel: cmd.tel, client: cmd.prenom || cmd.client, id: cmd.id, total: cmd.total }; }
 else if (ns === 'annulee') { route = '/sms/annulation'; body = { tel: cmd.tel, client: cmd.prenom || cmd.client, id: cmd.id }; }
 if (route) {
 fetch('https://kamer360-backend-production.up.railway.app' + route, {
 method: 'POST', headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(body)
 }).then(function(r){ return r.json(); }).then(function(r){
 if (r.ok) toast('SMS envoyé à ' + (cmd.prenom || cmd.client), 'success');
 }).catch(function(e){ console.warn('SMS non envoyé:', e); });
 }
 }
}

function passerCmd(type) {
 if (PANIER.length===0) { toast('Panier vide !', 'warning'); return; }
 var sm = document.getElementById('p-sm').value;
 var pay = document.getElementById('p-pay').value;
 var client = (document.getElementById('p-cli').value.trim())||'Client Comptoir';
 var tel = (document.getElementById('p-tel').value.trim())||'—';
 var items = PANIER.map(function(item){ var p=PRODS.find(function(x){ return x.id===item.id; }); return {nom:p.nom,img:p.img,qty:item.qty,prix:p.prix}; });
 var total = getPanierTotal();
 var now = new Date();
 var ds = now.toLocaleDateString('fr-FR')+''+now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
 var newCmd = {id:'CMD-00'+cSeq++,date:ds,client:client,tel:tel,sm:sm,pay:pay,statut:'en_attente',type:type,items:items,total:total,notes:''};
 CMDS.unshift(newCmd); viderPanier(); closePanier(); updateBadgeCmd();
 toast((type==='reservation'?'Réservation ':'Commande ')+newCmd.id+' créée !', 'success');
 addNotif(newCmd.id+' — '+client, 'green');
 goPage('commandes');

 // SMS au client + admin
 if (tel && tel !== '—') {
 fetch('https://kamer360-backend-production.up.railway.app/sms/commande', {
 method:'POST', headers:{'Content-Type':'application/json'},
 body: JSON.stringify({ tel: tel, client: client, id: newCmd.id, total: total, items: items.map(function(i){ return i.qty+'x '+i.nom; }).join(', ') })
 }).then(function(r){ return r.json(); }).then(function(r){ if(r.ok) toast(' SMS confirmation envoyé', 'success'); }).catch(function(){});
 }
 // SMS alerte admin
 fetch('https://kamer360-backend-production.up.railway.app/sms/custom', {
 method:'POST', headers:{'Content-Type':'application/json'},
 body: JSON.stringify({ tel: '237693591479', message: ' Nouvelle commande '+newCmd.id+' — '+client+' — '+(total||0).toLocaleString()+' FCFA — '+sm })
 }).catch(function(){});
}

function creerCmdManuelle() {
 var client = val('cc'), produits = val('cprod'), montant = parseFloat((document.getElementById('cmt')||{}).value)||0;
 var type = (document.getElementById('cty')||{}).value||'achat';
 if (!client||!produits||montant<=0) { toast('Remplissez tous les champs', 'warning'); return; }
 var now = new Date();
 var ds = now.toLocaleDateString('fr-FR')+''+now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
 var newCmd = {id:'CMD-00'+cSeq++,date:ds,client:client,tel:val('ctel')||'—',sm:document.getElementById('csm').value,pay:document.getElementById('cpay').value,statut:'en_attente',type:type,items:[{nom:produits,img:'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=40&h=40&fit=crop',qty:1,prix:montant}],total:montant,notes:val('cnotes')};
 CMDS.unshift(newCmd); updateBadgeCmd(); closeM('m-cmd'); renderCmds();
 toast((type==='reservation'?'Réservation ':'Commande ')+newCmd.id+' créée !', 'success');
 ['cc','ctel','cprod','cmt','cnotes'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

// ═══════════════ FORMULAIRES ═══════════════
// ajouterSM moved to STORES section above

// ── Employés : Supabase ──
var EMPLOYES = [];

function _sbMain() {
 if (typeof window.supabase === 'undefined') return null;
 return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
}

async function initEmployes() {
 try {
 var sb = _sbMain(); if (!sb) return;
 var res = await sb.from('employes').select('*').order('created_at', { ascending: false });
 if (res.data) EMPLOYES = res.data;
 } catch(e) { console.warn('[Employes] init:', e); }
 renderEmployes();
}

function renderEmployes() {
 var tb = document.getElementById('emp-tbody');
 if (!tb) return;
 var statEl = document.getElementById('dash-employes');

 if (EMPLOYES.length === 0) {
 tb.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:20px">Aucun employé. Cliquez sur "+ Ajouter un employé".</td></tr>';
 } else {
 tb.innerHTML = EMPLOYES.map(function(e, i) {
 var initiale = (e.prenom || e.nom || '?')[0].toUpperCase();
 var couleurs = ['#007A3D','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#14b8a6'];
 var bg = couleurs[i % couleurs.length];
 return '<tr>' +
 '<td><div style="display:flex;align-items:center;gap:8px">' +
 '<div style="width:30px;height:30px;border-radius:50%;background:' + bg + ';color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0">' + initiale + '</div>' +
 '<span>' + (e.prenom || '') + '' + (e.nom || '') + '</span></div></td>' +
 '<td>' + (e.poste || '—') + '</td>' +
 '<td>' + (e.sm || '—') + '</td>' +
 '<td>' + (e.tel || '—') + '</td>' +
 '<td>' + (e.salaire ? Number(e.salaire).toLocaleString('fr-FR') + ' FCFA' : '—') + '</td>' +
 '<td><span class="badge bgg">Actif</span></td>' +
 '<td><button class="btn bd bsm" onclick="supprimerEmp(' + e.id + ')">Retirer</button></td>' +
 '</tr>';
 }).join('');
 }

 // Mettre à jour stat dashboard
 var dashEmp = document.getElementById('dash-employes');
 if (dashEmp) dashEmp.textContent = EMPLOYES.length;
 renderDashboard();
}

async function ajouterEmp() {
 var prenom = val('ep'), nom = val('en');
 if (!prenom || !nom) { toast('Prénom et nom requis', 'warning'); return; }
 var emp = {
 prenom: prenom,
 nom: nom,
 poste: (document.getElementById('epo') || {}).value || '—',
 sm: (document.getElementById('esm') || {}).value || '—',
 tel: val('et') || '—',
 salaire: (document.getElementById('esal') || {}).value || 0,
 created_at: new Date().toISOString()
 };
 try {
 var sb = _sbMain();
 if (sb) {
 var res = await sb.from('employes').insert(emp).select().single();
 if (res.data) emp = res.data;
 } else { emp.id = Date.now(); }
 } catch(e) { console.warn('[Employes] ajouter:', e); emp.id = Date.now(); }
 EMPLOYES.unshift(emp);
 renderEmployes();
 addNotif('Nouvel employé : ' + prenom + '' + nom + ' (' + emp.poste + ')', 'green');
 closeM('m-emp');
 toast(prenom + '' + nom + ' ajouté !', 'success');
 ['ep','en','et','esal'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

async function supprimerEmp(id) {
 var e = EMPLOYES.find(function(x){ return x.id == id; }) || EMPLOYES[id];
 if (!e) return;
 if (!confirm('Retirer ' + (e.prenom||'') + '' + (e.nom||'') + ' ?')) return;
 try {
 var sb = _sbMain();
 if (sb && e.id) await sb.from('employes').delete().eq('id', e.id);
 } catch(err) { console.warn('[Employes] supprimer:', err); }
 EMPLOYES = EMPLOYES.filter(function(x){ return x.id != e.id; });
 renderEmployes();
 toast('Employé retiré', 'success');
}

// ── Fournisseurs : Supabase ──
var FOURNISSEURS = [];

async function initFournisseurs() {
 try {
 var sb = _sbMain(); if (!sb) return;
 var res = await sb.from('fournisseurs').select('*').order('created_at', { ascending: false });
 if (res.data) FOURNISSEURS = res.data;
 } catch(e) { console.warn('[Fournisseurs] init:', e); }
 renderFournisseurs();
}

function renderFournisseurs() {
 var tb = document.getElementById('four-tbody');
 if (!tb) return;
 if (FOURNISSEURS.length === 0) {
 tb.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:20px">Aucun fournisseur. Cliquez sur "+ Ajouter fournisseur".</td></tr>';
 return;
 }
 tb.innerHTML = FOURNISSEURS.map(function(f, i) {
 var statut = f.statut || 'actif';
 var badgeCls = statut === 'actif' ? 'bgg' : statut === 'retard' ? 'bgy' : 'bgr';
 var badgeLbl = statut === 'actif' ? 'Actif' : statut === 'retard' ? 'En retard' : 'Inactif';
 return '<tr>' +
 '<td><div style="display:flex;align-items:center;gap:8px">' +
 '<div style="width:30px;height:30px;border-radius:7px;background:#007A3D;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px">' + (f.nom||'?')[0].toUpperCase() + '</div>' +
 (f.nom || '—') + '</div></td>' +
 '<td>' + (f.categorie || '—') + '</td>' +
 '<td>' + (f.tel || '—') + '</td>' +
 '<td>' + (f.ville || '—') + '</td>' +
 '<td>' + (f.montant ? Number(f.montant).toLocaleString('fr-FR') + ' FCFA' : '0 FCFA') + '</td>' +
 '<td><span class="badge ' + badgeCls + '">' + badgeLbl + '</span></td>' +
 '<td><div style="display:flex;gap:4px">' +
 '<button class="btn bo bsm" onclick="editFour(' + f.id + ')">Modifier</button>' +
 '<button class="btn bd bsm" onclick="supprimerFour(' + f.id + ')">Retirer</button>' +
 '</div></td>' +
 '</tr>';
 }).join('');
}

async function ajouterFour() {
 var n = val('fn'); if (!n) { toast('Nom requis', 'warning'); return; }
 var four = {
 nom: n,
 categorie: (document.getElementById('fcat') || {}).value || '—',
 tel: val('ftel') || '—',
 ville: (document.getElementById('fville') || {}).value || '—',
 montant: parseInt(val('fmontant')) || 0,
 statut: 'actif',
 created_at: new Date().toISOString()
 };
 try {
 var sb = _sbMain();
 if (sb) {
 var res = await sb.from('fournisseurs').insert(four).select().single();
 if (res.data) four = res.data;
 } else { four.id = Date.now(); }
 } catch(e) { console.warn('[Fournisseurs] ajouter:', e); four.id = Date.now(); }
 FOURNISSEURS.unshift(four);
 renderFournisseurs();
 addNotif('Nouveau fournisseur : ' + n, 'green');
 closeM('m-four');
 toast('Fournisseur "' + n + '" ajouté !', 'success');
 ['fn','ftel','fmontant'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

async function supprimerFour(id) {
 var f = FOURNISSEURS.find(function(x){ return x.id == id; });
 if (!f) return;
 if (!confirm('Supprimer le fournisseur "' + (f.nom||'') + '" ?')) return;
 try {
 var sb = _sbMain();
 if (sb) await sb.from('fournisseurs').delete().eq('id', f.id);
 } catch(e) { console.warn('[Fournisseurs] supprimer:', e); }
 FOURNISSEURS = FOURNISSEURS.filter(function(x){ return x.id != f.id; });
 renderFournisseurs();
 toast('Fournisseur supprimé', 'success');
}

// ── Modifier un fournisseur ──
function editFour(id) {
 var f = FOURNISSEURS.find(function(x){ return x.id == id; });
 if (!f) return;
 // Remplir le formulaire avec les données existantes
 var el = function(i){ return document.getElementById(i); };
 if (el('fn')) el('fn').value = f.nom || '';
 if (el('ftel')) el('ftel').value = f.tel || '';
 if (el('fmontant'))el('fmontant').value= f.montant || 0;
 if (el('fcat')) el('fcat').value = f.categorie|| '';
 if (el('fville')) el('fville').value = f.ville || ''; 
 // Changer le titre et le bouton
 var mh = document.querySelector('#m-four .mh h3');
 if (mh) mh.textContent = 'Modifier le fournisseur';
 var btn = document.querySelector('#m-four .btng .btn.bp');
 if (btn) { btn.textContent = 'Enregistrer'; btn.onclick = function(){ saveFour(id); }; }
 openM('m-four');
}

async function saveFour(id) {
 var f = FOURNISSEURS.find(function(x){ return x.id == id; });
 if (!f) return;
 f.nom = val('fn') || f.nom;
 f.tel = val('ftel') || f.tel;
 f.montant = parseInt(val('fmontant')) || 0;
 f.categorie = (document.getElementById('fcat') || {}).value || f.categorie;
 f.ville = (document.getElementById('fville') || {}).value || f.ville;
 try {
 var sb = _sbMain();
 if (sb) await sb.from('fournisseurs').update({
 nom: f.nom, tel: f.tel, montant: f.montant,
 categorie: f.categorie, ville: f.ville
 }).eq('id', f.id);
 } catch(e) { console.warn('[Fournisseurs] modifier:', e); }
 renderFournisseurs();
 closeM('m-four');
 // Remettre le formulaire en mode "Ajouter"
 var mh = document.querySelector('#m-four .mh h3');
 if (mh) mh.textContent = 'Nouveau fournisseur';
 var btn = document.querySelector('#m-four .btng .btn.bp');
 if (btn) { btn.textContent = 'Ajouter'; btn.onclick = ajouterFour; }
 toast('Fournisseur modifié avec succès', 'success');
}

// ═══════════════════════════════════════════════════════
// VENTES & CAISSE — 100% DYNAMIQUE
// ═══════════════════════════════════════════════════════
function renderVentes() {
 var now = new Date();
 var today = String(now.getDate()).padStart(2,'0') + '/' + String(now.getMonth()+1).padStart(2,'0');

 // Calculs dynamiques depuis CMDS
 var ventesAujourdhui = 0;
 var ventesHier = 0;
 var nbTransactions = 0;
 var nbAttente = 0;
 var totalPanier = 0;

 var yesterday = new Date(now);
 yesterday.setDate(yesterday.getDate() - 1);
 var hier = String(yesterday.getDate()).padStart(2,'0') + '/' + String(yesterday.getMonth()+1).padStart(2,'0');

 CMDS.forEach(function(cmd) {
 var dateStr = (cmd.date || '').substring(0, 5); // "DD/MM"
 if (cmd.statut === 'livree' || cmd.statut === 'confirmee') {
 nbTransactions++;
 totalPanier += cmd.total || 0;
 if (dateStr === today) ventesAujourdhui += cmd.total || 0;
 if (dateStr === hier) ventesHier += cmd.total || 0;
 }
 if (cmd.statut === 'en_attente') nbAttente++;
 });

 var panierMoyen = nbTransactions > 0 ? Math.round(totalPanier / nbTransactions) : 0;
 var evol = ventesHier > 0 ? Math.round((ventesAujourdhui - ventesHier) / ventesHier * 100) : 0;

 // Formater les valeurs
 function fmt(n) {
 if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
 if (n >= 1000) return Math.round(n/1000) + 'K';
 return n.toLocaleString('fr-FR');
 }

 // Mettre à jour les cartes
 var el;
 el = document.getElementById('v-today'); if(el) el.textContent = fmt(ventesAujourdhui) + ' F';
 el = document.getElementById('v-today-sub'); if(el) { el.textContent = (evol >= 0 ? '+' : '') + evol + '% vs hier'; el.className = 'schg ' + (evol >= 0 ? 'sup' : 'sdn'); }
 el = document.getElementById('v-transactions');if(el) el.textContent = nbTransactions;
 el = document.getElementById('v-trans-sub'); if(el) el.textContent = 'livrées / confirmées';
 el = document.getElementById('v-panier'); if(el) el.textContent = fmt(panierMoyen);
 el = document.getElementById('v-attente'); if(el) el.textContent = nbAttente;
 el = document.getElementById('v-attente-sub'); if(el) { el.textContent = nbAttente > 0 ? 'à traiter !' : 'aucune en attente'; el.className = 'schg ' + (nbAttente > 0 ? 'sdn' : 'sup'); }

 // Tableau des commandes filtré
 var filtre = (document.getElementById('v-filtre') || {}).value || 'tout';
 var cmdsFiltrees = filtre === 'tout' ? CMDS : CMDS.filter(function(c){ return c.statut === filtre; });

 var tbody = document.getElementById('v-tbody');
 if (!tbody) return;

 if (cmdsFiltrees.length === 0) {
 tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:20px">Aucune commande</td></tr>';
 return;
 }

 var statutMap = {
 'livree': ['Livrée', 'bgg'],
 'confirmee': ['Confirmée', 'bgg'],
 'livraison': ['En route', 'bgy'],
 'en_attente':['En attente', 'bgy'],
 'annulee': ['Annulée', 'bgr']
 };

 tbody.innerHTML = cmdsFiltrees.slice(0, 50).map(function(cmd, i) {
 var s = statutMap[cmd.statut] || [cmd.statut, 'bgy'];
 var dateAff = (cmd.date || '').substring(0, 14);
 var montant = (cmd.total || 0).toLocaleString('fr-FR') + ' FCFA';
 return '<tr>' +
 '<td style="font-weight:700;color:#007A3D">' + cmd.id + '</td>' +
 '<td>' + dateAff + '</td>' +
 '<td>' + (cmd.client || '—') + '</td>' +
 '<td>' + (cmd.sm || '—') + '</td>' +
 '<td style="font-weight:700">' + montant + '</td>' +
 '<td>' + (cmd.pay || '—') + '</td>' +
 '<td><span class="badge ' + s[1] + '">' + s[0] + '</span></td>' +
 '</tr>';
 }).join('');
}

// ═══════════════════════════════════════════════════════
// RAPPORTS DYNAMIQUES
// ═══════════════════════════════════════════════════════
function renderRapports() {
 var now = new Date();

 // CA mensuel réel
 var caMensuel = 0;
 var nbCmdsMois = 0;
 var caMoisPrec = 0;
 CMDS.forEach(function(cmd) {
 if (cmd.statut === 'livree' || cmd.statut === 'confirmee') {
 try {
 var parts = (cmd.date||'').split('/');
 var mCmd = parseInt(parts[1]) - 1;
 var aCmd = parseInt(parts[2]);
 if (mCmd === now.getMonth() && aCmd === now.getFullYear()) {
 caMensuel += cmd.total || 0; nbCmdsMois++;
 }
 if (mCmd === (now.getMonth() - 1 + 12) % 12) {
 caMoisPrec += cmd.total || 0;
 }
 } catch(e) { _logErr("script.js", e); }
 }
 });

 var evol = caMoisPrec > 0 ? Math.round((caMensuel - caMoisPrec) / caMoisPrec * 100) : 0;
 var caStr = caMensuel >= 1000000 ? (caMensuel/1000000).toFixed(1)+'M' : Math.round(caMensuel/1000)+'K';

 // Mettre à jour cartes rapports
 var el; 
 el = document.getElementById('ventes-ca-mois'); if(el) el.textContent = caStr + ' F';
 el = document.getElementById('ventes-ca-sub'); if(el) el.textContent = nbCmdsMois + ' commande(s) • ' + (evol >= 0 ? '+' : '') + evol + '% vs mois préc.';
 el = document.getElementById('rpt-c'); if(el) el.textContent = CMDS.filter(function(c){ return ['en_attente','confirmee','livraison'].includes(c.statut); }).length;

 // Marge brute dynamique (estimation 25% sur produits alimentaires, 35% autres)
 var margeEl = document.querySelector('#page-rapports .sval:nth-child(2)');

 // Top catégories dynamiques depuis commandes
 var catVentes = {};
 CMDS.forEach(function(cmd) {
 if (cmd.items) cmd.items.forEach(function(item) {
 var prod = PRODS.find(function(p){ return p.nom === item.nom; });
 var cat = prod ? prod.cat : 'Autre';
 catVentes[cat] = (catVentes[cat] || 0) + (item.prix * item.qty);
 });
 });

 var totalVentes = Object.values(catVentes).reduce(function(a,b){ return a+b; }, 0) || 1;
 var topCats = Object.keys(catVentes)
 .sort(function(a,b){ return catVentes[b] - catVentes[a]; })
 .slice(0, 5);

 var catColors = ['var(--g)', 'var(--r)', 'var(--y)', '#8b5cf6', '#14b8a6'];
 var catContainer = document.getElementById('rpt-top-cats');
 if (catContainer) {
 if (topCats.length === 0) {
 catContainer.innerHTML = '<p style="color:#999;font-size:13px;text-align:center;padding:10px">Aucune vente enregistrée</p>';
 } else {
 catContainer.innerHTML = topCats.map(function(cat, i) {
 var pct = Math.round(catVentes[cat] / totalVentes * 100);
 return '<div>' +
 '<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">' +
 '<div style="width:20px;height:20px;border-radius:4px;background:' + catColors[i] + '"></div>' +
 '<span style="font-size:12px;flex:1">' + cat + '</span>' +
 '<span style="font-weight:700;font-size:12px">' + pct + '%</span>' +
 '</div>' +
 '<div class="pb"><div class="pf" style="width:' + pct + '%;background:' + catColors[i] + '"></div></div>' +
 '</div>';
 }).join('');
 }
 }

 // Rotation stock dynamique
 var prodsDispo = PRODS.filter(function(p){ return p.stock > 0; }).length;
 var rotationEl = document.getElementById('rpt-rotation');
 if (rotationEl) {
 var rotation = PRODS.length > 0 ? (nbCmdsMois / PRODS.length).toFixed(1) : '0';
 rotationEl.textContent = rotation + 'x';
 }
}


// ── Impression rapport complet ──
function imprimerRapport() {
 var now = new Date();
 var mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
 var smNom = (currentUser && currentUser.sm) ? currentUser.sm.split(' — ')[0] : 'KAMER360';
 var smVille = (currentUser && currentUser.sm) ? (currentUser.sm.split(' — ')[1] || '') : '';
 var gerantNom = currentUser ? ((currentUser.prenom||'') + '' + (currentUser.nom||'')).trim() : 'Gérant';

 // ── Calculs CA mensuel ──
 var caMensuel = 0, nbCmdsMois = 0, caMoisPrec = 0;
 var caParMois = new Array(12).fill(0);
 CMDS.forEach(function(cmd) {
 if (cmd.statut === 'livree' || cmd.statut === 'confirmee') {
 try {
 var parts = (cmd.date||'').split('/');
 var mCmd = parseInt(parts[1]) - 1;
 var aCmd = parseInt(parts[2]);
 if (!isNaN(mCmd)) caParMois[mCmd] = (caParMois[mCmd] || 0) + (cmd.total || 0);
 if (mCmd === now.getMonth() && aCmd === now.getFullYear()) { caMensuel += cmd.total||0; nbCmdsMois++; }
 if (mCmd === (now.getMonth()-1+12)%12) caMoisPrec += cmd.total||0;
 } catch(e) { _logErr("script.js", e); }
 }
 });
 var evol = caMoisPrec > 0 ? Math.round((caMensuel-caMoisPrec)/caMoisPrec*100) : 0;
 var caTotal = CMDS.filter(function(c){ return c.statut==='livree'||c.statut==='confirmee'; }).reduce(function(s,c){ return s+(c.total||0); }, 0);
 var panierMoyen = nbCmdsMois > 0 ? Math.round(caMensuel/nbCmdsMois) : 0;

 // ── Top catégories ──
 var catVentes = {};
 CMDS.forEach(function(cmd) {
 if (cmd.items) cmd.items.forEach(function(it) {
 var prod = PRODS.find(function(p){ return p.nom===it.nom; });
 var cat = prod ? prod.cat : 'Autre';
 catVentes[cat] = (catVentes[cat]||0) + (it.prix*it.qty);
 });
 });
 var totalVentes = Object.values(catVentes).reduce(function(a,b){ return a+b; }, 0) || 1;
 var topCats = Object.keys(catVentes).sort(function(a,b){ return catVentes[b]-catVentes[a]; }).slice(0,5);

 // ── Stock ──
 var prodsRupture = PRODS.filter(function(p){ return p.stock===0; }).length;
 var prodsCritique = PRODS.filter(function(p){ return p.stock>0 && p.stock<=5; }).length;
 var prodsOk = PRODS.filter(function(p){ return p.stock>5; }).length;
 var stockTotal = PRODS.reduce(function(s,p){ return s+(p.stock||0); }, 0);

 // ── Commandes par statut ──
 var nbAttente = CMDS.filter(function(c){ return c.statut==='en_attente'; }).length;
 var nbConfirm = CMDS.filter(function(c){ return c.statut==='confirmee'; }).length;
 var nbLivraison= CMDS.filter(function(c){ return c.statut==='livraison'; }).length;
 var nbLivrees = CMDS.filter(function(c){ return c.statut==='livree'; }).length;
 var nbAnnulees = CMDS.filter(function(c){ return c.statut==='annulee'; }).length;

 // ── Graphique barres CA mensuel (SVG) ──
 var maxCA = Math.max.apply(null, caParMois) || 1;
 var barWidth = 36, barGap = 8, svgW = (barWidth+barGap)*12, svgH = 120;
 var moisCourts = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
 var bars = caParMois.map(function(v, i) {
 var h = Math.max(4, Math.round(v/maxCA*90));
 var y = svgH - h - 20;
 var fill = i === now.getMonth() ? '#007A3D' : '#d1fae5';
 var x = i*(barWidth+barGap);
 return '<rect x="'+x+'" y="'+y+'" width="'+barWidth+'" height="'+h+'" rx="4" fill="'+fill+'"/>'
 + '<text x="'+(x+barWidth/2)+'" y="'+(svgH-4)+'" text-anchor="middle" font-size="9" fill="#999">'+moisCourts[i]+'</text>'
 + (v>0 ? '<text x="'+(x+barWidth/2)+'" y="'+(y-4)+'" text-anchor="middle" font-size="8" fill="#007A3D">'+(v>=1000000?(v/1000000).toFixed(1)+'M':v>=1000?Math.round(v/1000)+'K':v)+'</text>' : '');
 }).join('');

 // ── Top produits ──
 var prodVentes = {};
 CMDS.forEach(function(cmd) {
 if (cmd.items) cmd.items.forEach(function(it) {
 prodVentes[it.nom] = (prodVentes[it.nom]||0) + (it.prix*it.qty);
 });
 });
 var topProds = Object.keys(prodVentes).sort(function(a,b){ return prodVentes[b]-prodVentes[a]; }).slice(0,8);

 var catColors = ['#007A3D','#CE1126','#f59e0b','#8b5cf6','#14b8a6'];

 var html = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">'
 + '<title>Rapport — ' + smNom + ' — ' + mois[now.getMonth()] + '' + now.getFullYear() + '</title>'
 + '<style>'
 + '* { margin:0; padding:0; box-sizing:border-box; }'
 + 'body { font-family:Arial,sans-serif; font-size:13px; color:#333; background:#fff; }'
 + '.page { max-width:800px; margin:0 auto; padding:32px; }'
 + '.header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; padding-bottom:20px; border-bottom:3px solid #007A3D; }'
 + '.logo { font-size:26px; font-weight:900; color:#007A3D; }'
 + '.logo span { color:#CE1126; }'
 + 'h2 { font-size:16px; color:#111; margin:20px 0 12px; border-left:4px solid #007A3D; padding-left:10px; }'
 + '.kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }'
 + '.kpi { background:#f9fafb; border-radius:10px; padding:14px; text-align:center; border-top:3px solid #007A3D; }'
 + '.kpi.rouge { border-top-color:#CE1126; }'
 + '.kpi.orange { border-top-color:#f59e0b; }'
 + '.kpi.bleu { border-top-color:#3b82f6; }'
 + '.kpi-val { font-size:22px; font-weight:800; color:#111; }'
 + '.kpi-lbl { font-size:11px; color:#999; margin-top:3px; }'
 + '.kpi-sub { font-size:11px; color:#007A3D; font-weight:600; margin-top:2px; }'
 + '.twocols { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }'
 + '.bloc { background:#f9fafb; border-radius:10px; padding:16px; }'
 + '.ligne { display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px solid #f0f0f0; font-size:13px; }'
 + '.ligne:last-child { border-bottom:none; }'
 + '.ligne strong { color:#111; }'
 + '.badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }'
 + '.bar-wrap { margin-bottom:8px; }'
 + '.bar-label { display:flex; justify-content:space-between; font-size:12px; margin-bottom:3px; }'
 + '.bar-bg { background:#e5e7eb; border-radius:4px; height:10px; }'
 + '.bar-fill { border-radius:4px; height:10px; }'
 + 'table { width:100%; border-collapse:collapse; margin-bottom:16px; }'
 + 'thead th { background:#007A3D; color:#fff; padding:9px 12px; text-align:left; font-size:12px; }'
 + 'tbody td { padding:8px 12px; border-bottom:1px solid #f0f0f0; font-size:12px; }'
 + 'tbody tr:nth-child(even) td { background:#f9fafb; }'
 + '.footer { border-top:2px solid #e5e7eb; padding-top:14px; display:flex; justify-content:space-between; align-items:center; margin-top:24px; }'
 + '.footer p { font-size:11px; color:#999; }'
 + '.sign-zone { border:1px dashed #ccc; border-radius:8px; padding:20px; text-align:center; color:#999; font-size:12px; margin-top:20px; }'
 + '@media print { body { print-color-adjust:exact; -webkit-print-color-adjust:exact; } }'
 + '</style></head><body><div class="page">'

 // EN-TETE
 + '<div class="header">'
 + '<div>'
 + '<div class="logo">Super<span>Marché</span> CM</div>'
 + '<div style="font-size:13px;color:#555;margin-top:4px;font-weight:600">' + smNom + (smVille?' — '+smVille:'') + '</div>'
 + '<div style="font-size:11px;color:#999;margin-top:2px">Gérant : ' + gerantNom + '</div>'
 + '</div>'
 + '<div style="text-align:right">'
 + '<div style="font-size:20px;font-weight:800;color:#333">RAPPORT DE GESTION</div>'
 + '<div style="font-size:14px;color:#007A3D;font-weight:700;margin-top:4px">' + mois[now.getMonth()] + '' + now.getFullYear() + '</div>'
 + '<div style="font-size:11px;color:#999;margin-top:4px">Généré le ' + now.toLocaleDateString('fr-FR') + ' à ' + now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) + '</div>'
 + '</div></div>'

 // KPIs
 + '<h2>Indicateurs clés du mois</h2>'
 + '<div class="kpis">'
 + '<div class="kpi"><div class="kpi-val">' + (caMensuel>=1000000?(caMensuel/1000000).toFixed(1)+'M':Math.round(caMensuel/1000)+'K') + ' F</div><div class="kpi-lbl">CA ce mois</div><div class="kpi-sub">'+(evol>=0?'+':'')+evol+'% vs mois préc.</div></div>'
 + '<div class="kpi bleu"><div class="kpi-val">' + nbCmdsMois + '</div><div class="kpi-lbl">Commandes livrées</div><div class="kpi-sub">ce mois</div></div>'
 + '<div class="kpi orange"><div class="kpi-val">' + (panierMoyen>=1000?Math.round(panierMoyen/1000)+'K':panierMoyen) + ' F</div><div class="kpi-lbl">Panier moyen</div><div class="kpi-sub">par commande</div></div>'
 + '<div class="kpi rouge"><div class="kpi-val">' + prodsRupture + '</div><div class="kpi-lbl">Ruptures de stock</div><div class="kpi-sub">' + prodsCritique + ' en stock critique</div></div>'
 + '</div>'

 // GRAPHIQUE CA MENSUEL
 + '<h2>Chiffre d\'affaires mensuel</h2>'
 + '<div class="bloc" style="margin-bottom:20px">'
 + '<svg width="100%" viewBox="0 0 '+(svgW)+''+svgH+'" xmlns="http://www.w3.org/2000/svg">' + bars + '</svg>'
 + '</div>'

 // COMMANDES + STOCK
 + '<div class="twocols">'
 + '<div class="bloc"><div style="font-weight:700;margin-bottom:10px;font-size:14px">Commandes par statut</div>'
 + '<div class="ligne"><span>En attente</span><strong style="color:#f59e0b">'+nbAttente+'</strong></div>'
 + '<div class="ligne"><span>Confirmées</span><strong style="color:#3b82f6">'+nbConfirm+'</strong></div>'
 + '<div class="ligne"><span>En livraison</span><strong style="color:#f59e0b">'+nbLivraison+'</strong></div>'
 + '<div class="ligne"><span>Livrées</span><strong style="color:#007A3D">'+nbLivrees+'</strong></div>'
 + '<div class="ligne"><span>Annulées</span><strong style="color:#ef4444">'+nbAnnulees+'</strong></div>'
 + '<div class="ligne" style="border-top:2px solid #e5e7eb;margin-top:4px;padding-top:8px"><span><strong>Total</strong></span><strong>'+CMDS.length+'</strong></div>'
 + '</div>'
 + '<div class="bloc"><div style="font-weight:700;margin-bottom:10px;font-size:14px">État des stocks</div>'
 + '<div class="ligne"><span>Produits en stock</span><strong style="color:#007A3D">'+prodsOk+'</strong></div>'
 + '<div class="ligne"><span>Stock critique (≤5)</span><strong style="color:#f59e0b">'+prodsCritique+'</strong></div>'
 + '<div class="ligne"><span>Ruptures de stock</span><strong style="color:#ef4444">'+prodsRupture+'</strong></div>'
 + '<div class="ligne"><span>Total produits</span><strong>'+PRODS.length+'</strong></div>'
 + '<div class="ligne"><span>Unités en stock</span><strong>'+stockTotal.toLocaleString('fr-FR')+'</strong></div>'
 + '<div class="ligne" style="border-top:2px solid #e5e7eb;margin-top:4px;padding-top:8px"><span>CA total cumulé</span><strong style="color:#007A3D">'+(caTotal>=1000000?(caTotal/1000000).toFixed(1)+'M':Math.round(caTotal/1000)+'K')+' F</strong></div>'
 + '</div></div>'

 // TOP CATEGORIES
 + (topCats.length > 0 ? '<h2>Top catégories par ventes</h2><div class="bloc" style="margin-bottom:20px">'
 + topCats.map(function(cat, i) {
 var pct = Math.round(catVentes[cat]/totalVentes*100);
 return '<div class="bar-wrap">'
 + '<div class="bar-label"><span>' + cat + '</span><span style="font-weight:700;color:'+catColors[i]+'">' + pct + '% — ' + catVentes[cat].toLocaleString('fr-FR') + ' FCFA</span></div>'
 + '<div class="bar-bg"><div class="bar-fill" style="width:'+pct+'%;background:'+catColors[i]+'"></div></div>'
 + '</div>';
 }).join('')
 + '</div>' : '')

 // TOP PRODUITS
 + (topProds.length > 0 ? '<h2>Top 8 produits les plus vendus</h2>'
 + '<table><thead><tr><th>#</th><th>Produit</th><th style="text-align:right">CA généré</th></tr></thead><tbody>'
 + topProds.map(function(nom, i) {
 return '<tr><td style="color:#007A3D;font-weight:700">' + (i+1) + '</td>'
 + '<td>' + nom + '</td>'
 + '<td style="text-align:right;font-weight:700">' + prodVentes[nom].toLocaleString('fr-FR') + ' FCFA</td></tr>';
 }).join('')
 + '</tbody></table>' : '')

 // ZONE SIGNATURE
 + '<div class="twocols" style="margin-top:20px">'
 + '<div class="sign-zone">Signature du gérant<br><br><br>___________________</div>'
 + '<div class="sign-zone">Cachet du supermarché<br><br><br></div>'
 + '</div>'

 // PIED DE PAGE
 + '<div class="footer">'
 + '<p>KAMER360 — Rapport confidentiel<br>Tel : +237 683 39 22 68 | WhatsApp : +237 693 59 14 79</p>'
 + '<p style="text-align:right">Page 1/1<br>' + now.getFullYear() + ' KAMER360</p>'
 + '</div>'
 + '</div></body></html>';

 // Lancer l'impression via iframe (sans popup)
 lancerImpression(html);
}

// ── Impression via iframe (contourne le blocage popups) ──
function lancerImpression(html) {
 // Supprimer l'iframe précédent s'il existe
 var old = document.getElementById('print-iframe');
 if (old) old.parentNode.removeChild(old);

 var iframe = document.createElement('iframe');
 iframe.id = 'print-iframe';
 iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none;visibility:hidden';
 document.body.appendChild(iframe);

 var doc = iframe.contentWindow.document;
 doc.open();
 doc.write(html);
 doc.close();

 iframe.onload = function() {
 try {
 iframe.contentWindow.focus();
 iframe.contentWindow.print();
 } catch(e) {
 // Fallback : window.open si iframe échoue (Safari)
 var win = window.open('', '_blank');
 if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(function(){ win.print(); }, 400); }
 else { toast('Activez les popups pour imprimer', 'error'); }
 }
 // Nettoyer après impression
 setTimeout(function(){
 if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
 }, 3000);
 };
}

// ── Render Utilisateurs ──
function renderUtilisateurs() {
 var tbody = document.getElementById('users-tbody');
 if (!tbody) return;
 var roleColors = {
 'administrateur': '#CE1126', 'Administrateur': '#CE1126',
 'Gérant(e)': '#007A3D', 'Directeur(trice)': '#007A3D', 'Propriétaire': '#007A3D',
 'Caissier(e)': '#1d4ed8',
 'Livreur': '#b45309'
 };
 var users = ACCOUNTS || [];
 if (users.length === 0) {
 tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#999">Aucun utilisateur enregistré</td></tr>';
 return;
 }
 tbody.innerHTML = users.map(function(u, i) {
 var couleur = roleColors[u.role] || '#6b7280';
 var initiale = ((u.prenom || u.nom || '?')[0]).toUpperCase();
 var isAdmin = u.email && u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
 return '<tr style="border-bottom:1px solid #f0f0f0">'
 + '<td style="padding:10px;display:flex;align-items:center;gap:8px">'
 + '<div style="width:32px;height:32px;border-radius:50%;background:'+couleur+';color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0">'+initiale+'</div>'
 + '<span style="font-weight:600">'+(u.prenom||'')+''+(u.nom||'')+'</span></td>'
 + '<td style="padding:10px;color:#666;font-size:12px">'+(u.email||'—')+'</td>'
 + '<td style="padding:10px"><span style="background:'+couleur+';color:#fff;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700">'+(isAdmin?'Administrateur':u.role||'—')+'</span></td>'
 + '<td style="padding:10px;font-size:12px;color:#555">'+(u.sm||'—')+'</td>'
 + '<td style="padding:10px"><span style="background:#dcfce7;color:#007A3D;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700">Actif</span></td>'
 + '<td style="padding:10px;font-size:12px;color:#999">'+(u.lastLogin || 'Jamais')+'</td>'
 + '<td style="padding:10px">'
 + (!isAdmin ? '<button class="btn bd bsm" onclick="supprimerUtilisateur('+i+')">Supprimer</button>' : '<span style="color:#999;font-size:11px">Admin</span>')
 + '</td></tr>';
 }).join('');
}

function supprimerUtilisateur(index) {
 if (!confirm('Supprimer cet utilisateur ?')) return;
 ACCOUNTS.splice(index, 1);
 try { localStorage.setItem('sm_accounts', JSON.stringify(ACCOUNTS)); } catch(e) { _logErr("script.js", e); }
 renderUtilisateurs();
 toast('Utilisateur supprimé', 'success');
}

function renderGerants() {
 var container = document.getElementById('gerants-liste');
 if (!container) return;
 var gerants = ACCOUNTS.filter(function(a){ return a.email !== 'lembetiny02@gmail.com'; });
 if (gerants.length === 0) {
 container.innerHTML = '<p style="color:#999;text-align:center;padding:12px">Aucun gérant inscrit pour l\'instant</p>';
 return;
 }
 container.innerHTML = gerants.map(function(g, i) {
 var initiale = (g.prenom || g.nom || '?')[0].toUpperCase();
 var couleurs = ['#007A3D','#3b82f6','#f59e0b','#8b5cf6','#ec4899'];
 var bg = couleurs[i % couleurs.length];
 return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px">' +
 '<div style="display:flex;align-items:center;gap:12px">' +
 '<div style="width:38px;height:38px;border-radius:50%;background:' + bg + ';color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px">' + initiale + '</div>' +
 '<div>' +
 '<div style="font-weight:700;font-size:14px">' + (g.prenom||'') + '' + (g.nom||'') + '</div>' +
 '<div style="font-size:12px;color:#888">' + g.email + ' — ' + g.role + '</div>' +
 '<div style="font-size:11px;color:#007A3D">' + (g.sm||'') + '</div>' +
 '</div>' +
 '</div>' +
 '<span style="font-size:11px;padding:3px 10px;border-radius:20px;background:#dcfce7;color:#007A3D;font-weight:700">Actif</span>' +
 '</div>';
 }).join('');
}

// ═══════════════ RÉSEAUX SOCIAUX ═══════════════
function renderReseaux() {
 var clients = [];
 try { clients = JSON.parse(localStorage.getItem('sm_clients') || '[]'); } catch(e) { _logErr("script.js", e); }
 var cmdLivrees = CMDS.filter(function(c){ return c.statut === 'livree'; }).length;
 var villes = STORES ? [...new Set(STORES.map(function(s){ return s.ville; }))].length : 0;

 var el;
 el = document.getElementById('ss-clients'); if(el) el.textContent = clients.length || '0';
 el = document.getElementById('ss-commandes'); if(el) el.textContent = cmdLivrees || '0';
 el = document.getElementById('ss-villes'); if(el) el.textContent = villes || '0';
}

// ═══════════════ ASSISTANT IA ═══════════════
var AI_MSGS = [];
var AI_THINKING = false;

function getAppContext() {
 // Données RÉELLES calculées en temps réel
 var ruptures = PRODS.filter(function(p){ return p.stock === 0; });
 var critiques = PRODS.filter(function(p){ return p.stock > 0 && p.stock < 10; });
 var cmdActives = CMDS.filter(function(c){ return ['en_attente','confirmee','livraison'].includes(c.statut); });
 var cmdAttente = CMDS.filter(function(c){ return c.statut === 'en_attente'; });
 var cmdLivrees = CMDS.filter(function(c){ return c.statut === 'livree'; });

 // CA mensuel réel
 var now = new Date();
 var caMensuel = 0;
 CMDS.forEach(function(cmd) {
 if (cmd.statut === 'livree' || cmd.statut === 'confirmee') {
 try {
 var parts = (cmd.date || '').split('/');
 if (parseInt(parts[1]) - 1 === now.getMonth() && parseInt(parts[2]) === now.getFullYear())
 caMensuel += cmd.total || 0;
 } catch(e) { _logErr("script.js", e); }
 }
 });
 var caStr = caMensuel >= 1000000
 ? (caMensuel / 1000000).toFixed(1) + ' millions'
 : caMensuel >= 1000
 ? Math.round(caMensuel / 1000) + ' milliers'
 : caMensuel + '';

 // Supermarchés réels
 var smActifs = STORES ? STORES.filter(function(s){ return s.statut !== 'ferme'; }).length : 0;
 var smVilles = STORES ? [...new Set(STORES.map(function(s){ return s.ville; }))].join(', ') : '';

 // Employés réels depuis localStorage
 var employes = [];
 try { employes = JSON.parse(localStorage.getItem('sm_employes') || '[]'); } catch(e) { _logErr("script.js", e); }

 // Fournisseurs réels depuis localStorage
 var fournisseurs = [];
 try { fournisseurs = JSON.parse(localStorage.getItem('sm_fournisseurs') || '[]'); } catch(e) { _logErr("script.js", e); }

 // Clients boutique
 var clients = [];
 try { clients = JSON.parse(localStorage.getItem('sm_clients') || '[]'); } catch(e) { _logErr("script.js", e); }

 // Top produits vendus
 var topProds = {};
 CMDS.forEach(function(cmd) {
 if (cmd.items) cmd.items.forEach(function(item) {
 topProds[item.nom] = (topProds[item.nom] || 0) + (item.qty || 1);
 });
 });
 var topList = Object.keys(topProds).sort(function(a,b){ return topProds[b]-topProds[a]; }).slice(0,3);

 return "Tu es l'Assistant IA de KAMER360, expert en gestion de supermarchés au Cameroun." +
 " Réponds toujours en français, de façon concise avec des recommandations pratiques adaptées au contexte camerounais (FCFA, Mobile Money, marchés locaux)." +
 '\n\n=== DONNÉES RÉELLES EN TEMPS RÉEL ===' +
 '\n STOCKS :' +
 '\n- Total produits catalogue : ' + PRODS.length +
 '\n- Ruptures de stock : ' + ruptures.length + (ruptures.length > 0 ? ' (' + ruptures.map(function(p){ return p.nom; }).join(', ') + ')' : '') +
 '\n- Stock critique (<10 unités) : ' + critiques.length + (critiques.length > 0 ? ' (' + critiques.map(function(p){ return p.nom + '(' + p.stock + 'u)'; }).join(', ') + ')' : '') +
 '\n\n COMMANDES :' +
 '\n- Actives : ' + cmdActives.length +
 '\n- En attente confirmation : ' + cmdAttente.length +
 '\n- Livrées total : ' + cmdLivrees.length +
 '\n- CA ce mois : ' + caStr + ' FCFA' +
 '\n\n SUPERMARCHÉS :' +
 '\n- Actifs : ' + smActifs + (smVilles ? ' (' + smVilles + ')' : '') +
 '\n\n ÉQUIPE & CLIENTS :' +
 '\n- Employés enregistrés : ' + (employes.length > 0 ? employes.length : 'non encore ajoutés') +
 '\n- Fournisseurs : ' + (fournisseurs.length > 0 ? fournisseurs.length : 'non encore ajoutés') +
 '\n- Clients boutique inscrits : ' + clients.length +
 (topList.length > 0 ? '\n\n TOP PRODUITS VENDUS : ' + topList.join(', ') : '') +
 '\n\n Réponds en te basant uniquement sur ces données réelles. Si une donnée est à 0 ou manquante, dis-le et propose des actions concrètes.';
}

function showWelcomeMsg() {
 var msgs = document.getElementById('ai-msgs'); if (!msgs) return;
 var now = new Date();
 var timeStr = now.getHours()+':'+String(now.getMinutes()).padStart(2,'0');
 var el = document.createElement('div'); el.className = 'msg ai';
 el.innerHTML = '<div class="msg-ava ai-ava-sm"><img src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=40&h=40&fit=crop" style="width:100%;height:100%;border-radius:50%;object-fit:cover"></div><div><div class="msg-bub">Bonjour ! Je suis votre <strong>Assistant IA KAMER360</strong>, propulsé par Claude.<br><br>Je connais vos données en temps réel — stocks, ventes, commandes — et peux vous aider à prendre de meilleures décisions. Que souhaitez-vous analyser ?</div><div class="msg-time">'+timeStr+'</div></div>';
 msgs.appendChild(el);
 AI_MSGS.push({role:'assistant', content:'Bonjour ! Je suis votre Assistant IA. Que souhaitez-vous analyser ?'});
}

function askAI(question) {
 goPage('ia');
 setTimeout(function(){ var inp=document.getElementById('ai-inp'); if(inp){ inp.value=question; sendAI(); } }, 200);
}

function clearChat() {
 AI_MSGS = [];
 var msgs = document.getElementById('ai-msgs'); if (msgs) msgs.innerHTML = '';
 showWelcomeMsg();
 toast('Conversation effacée', 'success');
}

function aiKeyDown(e) { if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); sendAI(); } }

async function sendAI() {
  var inp     = document.getElementById('ai-inp');
  var sendBtn = document.getElementById('ai-send-btn');
  var msgs    = document.getElementById('ai-msgs');
  if (!inp || !msgs || AI_THINKING) return;

  var question = inp.value.trim();
  if (!question) return;

  // Afficher message utilisateur
  AI_MSGS.push({ role: 'user', content: question });
  var userBubble = '<div style="display:flex;justify-content:flex-end;margin-bottom:12px">'
    + '<div style="max-width:75%;background:#007A3D;color:#fff;padding:10px 14px;border-radius:16px 16px 4px 16px;font-size:13px;line-height:1.5">' + _escHtml(question) + '</div></div>';
  msgs.innerHTML += userBubble;
  msgs.scrollTop = msgs.scrollHeight;
  inp.value = '';

  // Indicateur de frappe
  var thinkId = 'ai-think-' + Date.now();
  msgs.innerHTML += '<div id="' + thinkId + '" style="display:flex;gap:8px;margin-bottom:12px;align-items:flex-end">'
    + '<div style="width:32px;height:32px;background:linear-gradient(135deg,#007A3D,#005C2E);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">🤖</div>'
    + '<div style="background:#f3f4f6;padding:10px 14px;border-radius:16px 16px 16px 4px;font-size:13px;color:#6b7280">⏳ Analyse en cours...</div></div>';
  msgs.scrollTop = msgs.scrollHeight;
  AI_THINKING = true;
  if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = '⏳'; }

  try {
    // Collecter le contexte du gérant
    var contexte = {};
    try {
      var user = JSON.parse(localStorage.getItem('sm_user') || '{}');
      var cmds = JSON.parse(localStorage.getItem('sm_commandes') || '[]');
      var prods = JSON.parse(localStorage.getItem('sm_produits') || '[]');
      contexte = {
        gerant: user.prenom + ' ' + (user.nom || ''),
        supermarche: user.supermarche || user.sm || '',
        ville: user.ville || '',
        nb_commandes: cmds.length,
        nb_produits: prods.length,
        ca_total: cmds.reduce(function(s,c){ return s + (c.total||0); }, 0)
      };
    } catch(e) {}

    // URL backend dynamique
    var backendUrl = 'https://kamer360-backend-production.up.railway.app';
    if (typeof SM_CONFIG !== 'undefined' && SM_CONFIG.backend) {
      backendUrl = typeof SM_CONFIG.backend === 'string' ? SM_CONFIG.backend : (SM_CONFIG.backend.url || backendUrl);
    }

    var response = await fetch(backendUrl + '/ia/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: AI_MSGS.filter(function(m){ return m.content && m.content.trim(); }),
        contexte: contexte
      })
    });

    var data = await response.json();
    var reply = data.reply || data.message || 'Désolé, je n’ai pas pu répondre.';

    // Supprimer indicateur de frappe
    var thinkEl = document.getElementById(thinkId);
    if (thinkEl) thinkEl.remove();

    // Afficher réponse IA
    AI_MSGS.push({ role: 'assistant', content: reply });
    var aiBubble = '<div style="display:flex;gap:8px;margin-bottom:12px;align-items:flex-end">'
      + '<div style="width:32px;height:32px;background:linear-gradient(135deg,#007A3D,#005C2E);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">🤖</div>'
      + '<div style="max-width:80%;background:#f3f4f6;padding:10px 14px;border-radius:16px 16px 16px 4px;font-size:13px;line-height:1.6;color:#111;white-space:pre-wrap">' + _escHtml(reply) + '</div></div>';
    msgs.innerHTML += aiBubble;
    msgs.scrollTop = msgs.scrollHeight;
    updateAIStats();

  } catch(e) {
    var thinkEl = document.getElementById(thinkId);
    if (thinkEl) thinkEl.remove();
    var errBubble = '<div style="display:flex;gap:8px;margin-bottom:12px;align-items:flex-end">'
      + '<div style="width:32px;height:32px;background:#ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">🤖</div>'
      + '<div style="max-width:80%;background:#fee2e2;padding:10px 14px;border-radius:16px 16px 16px 4px;font-size:13px;color:#991b1b">'
      + '❌ Backend indisponible. Vérifiez votre connexion ou déployez le backend Railway.<br>'
      + '<a href="https://railway.app" target="_blank" style="color:#007A3D;font-weight:700">→ Déployer sur Railway</a>'
      + '</div></div>';
    msgs.innerHTML += errBubble;
    msgs.scrollTop = msgs.scrollHeight;
    _logErr('sendAI', e);
  } finally {
    AI_THINKING = false;
    if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = '📤'; }
  }
}


function renderDashboard() {

 // ── 1. Supermarchés actifs ──
 var smActifs = STORES ? STORES.filter(function(s){ return s.statut !== 'ferme'; }).length : 0;
 var smTotal = STORES ? STORES.length : 0;
 setDash('dash-supermarches', smActifs);
 setDash('dash-supermarches-sub', smTotal + ' au total');

 // ── 2. CA mensuel (somme des commandes livrées ce mois) ──
 var maintenant = new Date();
 var moisCourant = maintenant.getMonth();
 var anneeCourante = maintenant.getFullYear();
 var caMensuel = 0;
 var cmdsMois = 0;
 if (typeof CMDS !== 'undefined') {
 CMDS.forEach(function(cmd) {
 if (cmd.statut === 'livree' || cmd.statut === 'confirmee') {
 try {
 var parts = (cmd.date || '').split('/');
 if (parts.length >= 3) {
 var mCmd = parseInt(parts[1]) - 1;
 var aCmd = parseInt(parts[2]);
 if (mCmd === moisCourant && aCmd === anneeCourante) {
 caMensuel += cmd.total || 0;
 cmdsMois++;
 }
 }
 } catch(e) { _logErr("script.js", e); }
 }
 });
 }
 var caStr = caMensuel >= 1000000
 ? (caMensuel / 1000000).toFixed(1) + 'M'
 : caMensuel >= 1000
 ? Math.round(caMensuel / 1000) + 'K'
 : caMensuel.toLocaleString('fr-FR');
 setDash('dash-ca', caStr + ' F');
 setDash('dash-ca-sub', cmdsMois + ' commande(s) ce mois');

 // ── 3. Ruptures de stock ──
 var ruptures = 0;
 var critique = 0;
 if (typeof PRODS !== 'undefined') {
 PRODS.forEach(function(p) {
 if (p.stock === 0) ruptures++;
 else if (p.stock < 10) critique++;
 });
 }
 setDash('dash-ruptures', ruptures);
 var ruptSub = document.getElementById('dash-ruptures-sub');
 var ruptVal = document.getElementById('dash-ruptures');
 if (ruptVal) ruptVal.style.color = ruptures > 0 ? '#ef4444' : '#007A3D';
 if (ruptSub) {
 ruptSub.textContent = ruptures > 0 ? 'Attention requise !' : critique + ' stock(s) critique(s)';
 ruptSub.className = 'schg ' + (ruptures > 0 ? 'sdn' : critique > 0 ? '' : 'sup');
 }

 // ── 4. Commandes actives ──
 var cmdsActives = 0;
 var cmdsAttente = 0;
 if (typeof CMDS !== 'undefined') {
 CMDS.forEach(function(cmd) {
 if (['en_attente','confirmee','livraison'].includes(cmd.statut)) cmdsActives++;
 if (cmd.statut === 'en_attente') cmdsAttente++;
 });
 }
 setDash('dash-commandes', cmdsActives);
 var cmdSub = document.getElementById('dash-commandes-sub');
 if (cmdSub) {
 cmdSub.textContent = cmdsAttente > 0 ? cmdsAttente + ' en attente !' : 'en cours';
 cmdSub.className = 'schg ' + (cmdsAttente > 0 ? 'sdn' : 'sup');
 }

 // ── 5. Clients inscrits — lecture combinée localStorage + Supabase ──
 // Lecture localStorage en temps réel (boutique.html et index.html partagent le même origin)
 var clients = [];
 try { clients = JSON.parse(localStorage.getItem('sm_clients') || '[]'); } catch(e) { _logErr("script.js", e); }
 var nbClients = clients.length;
 setDash('dash-clients', nbClients);
 setDash('dash-clients-sub', nbClients > 0 ? nbClients + ' inscrits boutique' : 'sur la boutique');

 // Vérifier aussi Supabase (source de vérité) — syntaxe correcte v2
 (async function() {
   try {
     var sb = _sbMain(); if (!sb) return;
     // Méthode 1: count exact Supabase
     var res = await sb.from('clients_boutique').select('*', { count: 'exact', head: true });
     var countSb = 0;
     if (res && res.count !== null && res.count !== undefined) {
       countSb = res.count;
     } else {
       // Méthode 2: fallback — compter les lignes retournées
       var res2 = await sb.from('clients_boutique').select('id');
       countSb = (res2.data || []).length;
     }
     // Prendre le max entre localStorage et Supabase (plus fiable)
     var total = Math.max(nbClients, countSb);
     setDash('dash-clients', total);
     setDash('dash-clients-sub', total > 0 ? total + ' inscrits boutique' : 'aucun encore');
   } catch(e) {
     // Si Supabase échoue, garder localStorage
     console.warn('[Dashboard] clients_boutique:', e);
   }
 })();

 // ── 6. Total produits en catalogue ──
 var totalProds = typeof PRODS !== 'undefined' ? PRODS.length : 0;
 var dispo = typeof PRODS !== 'undefined' ? PRODS.filter(function(p){ return p.stock > 0; }).length : 0;
 setDash('dash-produits', totalProds);
 setDash('dash-produits-sub', dispo + ' disponibles');

 // ── 7. Mettre à jour les stats mini dans la page IA ──
 updateAIStats();

 // ── 8. Barres graphiques dynamiques (ventes semaine) ──
 renderVentesGraph();

 // ── 9. Alertes stock dynamiques ──
 var alertes = PRODS.filter(function(p){ return p.stock < 10; }).sort(function(a,b){ return a.stock - b.stock; }).slice(0, 5);
 var alerteBadge = document.getElementById('dash-alerte-badge');
 var alerteList = document.getElementById('dash-alerte-list');
 if (alerteBadge) alerteBadge.textContent = alertes.length + ' alerte' + (alertes.length > 1 ? 's' : '');
 if (alerteList) {
 if (alertes.length === 0) {
 alerteList.innerHTML = '<p style="color:#007A3D;font-size:12px;text-align:center;padding:10px">Tous les stocks sont OK !</p>';
 } else {
 alerteList.innerHTML = alertes.map(function(p) {
 var pct = Math.round(p.stock / 50 * 100);
 var color = p.stock === 0 ? 'var(--r)' : '#B8860B';
 var bar = p.stock === 0 ? 'var(--r)' : 'var(--y)';
 var label = p.stock === 0 ? 'Rupture' : p.stock + ' u.';
 return '<div><div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">'
 + '<img src="' + p.img + '" style="width:22px;height:22px;border-radius:5px;object-fit:cover">'
 + '<span style="font-size:12px;flex:1">' + p.nom + '</span>'
 + '<span style="color:' + color + ';font-weight:700;font-size:12px">' + label + '</span>'
 + '</div><div class="pb"><div class="pf" style="width:' + pct + '%;background:' + bar + '"></div></div></div>';
 }).join('');
 }
 }
}

function setDash(id, val) {
 var el = document.getElementById(id);
 if (el) el.textContent = val;
}

function renderVentesGraph() {
 // Calculer ventes des 7 derniers jours
 var jours = [];
 var maintenant = new Date();
 for (var i = 6; i >= 0; i--) {
 var d = new Date(maintenant);
 d.setDate(d.getDate() - i);
 var dd = String(d.getDate()).padStart(2,'0');
 var mm = String(d.getMonth()+1).padStart(2,'0');
 var yyyy = d.getFullYear();
 var dateStr = dd + '/' + mm + '/' + yyyy;
 var total = 0;
 if (typeof CMDS !== 'undefined') {
 CMDS.forEach(function(cmd) {
 if ((cmd.date||'').startsWith(dd+'/'+mm) && (cmd.statut==='livree'||cmd.statut==='confirmee')) {
 total += cmd.total || 0;
 }
 });
 }
 jours.push(Math.round(total / 1000)); // En milliers
 }
 var max = Math.max.apply(null, jours.concat([1]));
 if (typeof makeBars === 'function') {
 makeBars('weekBars', jours, function(i){ return i===6?'var(--y)':'var(--g)'; });
 }
}

function updateAIStats() {
 // Stats dynamiques dans la page IA
 var ruptures = typeof PRODS !== 'undefined' ? PRODS.filter(function(p){ return p.stock===0; }) : [];
 var critiques = typeof PRODS !== 'undefined' ? PRODS.filter(function(p){ return p.stock>0 && p.stock<10; }) : [];
 var cmdActives = typeof CMDS !== 'undefined' ? CMDS.filter(function(c){ return ['en_attente','confirmee','livraison'].includes(c.statut); }) : [];
 var clients = [];
 try { clients = JSON.parse(localStorage.getItem('sm_clients')||'[]'); } catch(e) { _logErr("script.js", e); }

 // CA mensuel réel
 var maintenant = new Date();
 var caMensuel = 0;
 if (typeof CMDS !== 'undefined') {
 CMDS.forEach(function(cmd) {
 if (cmd.statut==='livree' || cmd.statut==='confirmee') {
 try {
 var parts = (cmd.date||'').split('/');
 if (parseInt(parts[1])-1 === maintenant.getMonth() && parseInt(parts[2]) === maintenant.getFullYear())
 caMensuel += cmd.total||0;
 } catch(e) { _logErr("script.js", e); }
 }
 });
 }
 var caStr = caMensuel >= 1000000 ? (caMensuel/1000000).toFixed(1)+'M' : Math.round(caMensuel/1000)+'K';

 // Mettre à jour l'interface IA
 var els = {
 'ia-ca': caStr + ' FCFA',
 'ia-clients': clients.length + ' inscrit(s)',
 'ventes-ca-mois': caStr,
 'ventes-ca-sub': cmdActives.length + ' commandes actives'
 };
 Object.keys(els).forEach(function(id) {
 var el = document.getElementById(id);
 if (el) el.textContent = els[id];
 });

 // Mettre à jour le contexte IA
 var nbRuptures = document.getElementById('ai-nb-ruptures');
 var nbCritiques = document.getElementById('ai-nb-critiques');
 var nbCmds = document.getElementById('ai-nb-cmds');
 if (nbRuptures) nbRuptures.textContent = ruptures.length;
 if (nbCritiques) nbCritiques.textContent = critiques.length;
 if (nbCmds) nbCmds.textContent = cmdActives.length;
}

document.addEventListener('input', function(e){
 if (e.target&&e.target.classList.contains('ai-inp')) {
 e.target.style.height='44px'; e.target.style.height=Math.min(e.target.scrollHeight,110)+'px';
 }
});

// ═══════════════ FAQ ═══════════════
var FAQ_DATA = [
 {cat:'compte', q:'Comment créer mon compte KAMER360 ?', a:'<p>Cliquez sur <strong>"Créer un compte gratuit"</strong> depuis la page de connexion, remplissez vos informations et choisissez un mot de passe sécurisé. Connexion automatique après validation.</p>'},
 {cat:'compte', q:'Comment me connecter à mon compte ?', a:'<p>Entrez votre <strong>adresse e-mail</strong> et votre <strong>mot de passe</strong>, puis cliquez sur "Se connecter". Pour une démo sans compte, cliquez sur le bouton <strong>"Démo sans inscription"</strong>.</p>'},
 {cat:'compte', q:"J'ai oublié mon mot de passe. Comment le récupérer ?", a:'<p>Cliquez sur "Mot de passe oublié ?" sur la page de connexion. Vous recevrez un lien de réinitialisation par email dans les 5 minutes.</p>'},
 {cat:'compte', q:'Puis-je gérer plusieurs supermarchés avec un seul compte ?', a:'<p>Oui. Depuis votre tableau de bord, administrez plusieurs supermarchés avec leurs propres données. Allez dans <strong>Supermarchés → Ajouter</strong>.</p>'},
 {cat:'commande', q:'Comment passer une commande ?', a:'<p>Via le module <strong>Achats</strong> : parcourez le catalogue avec les vraies photos des produits, ajoutez au panier, confirmez ou réservez. Vous recevez une confirmation par SMS et WhatsApp.</p>'},
 {cat:'commande', q:'Quelle est la différence entre "Achat" et "Réservation" ?', a:'<p><strong>Achat :</strong> paiement immédiat, commande préparée tout de suite.<br><strong>Réservation :</strong> produits mis de côté, paiement à la livraison ou au retrait. Badge bleu dans votre liste.</p>'},
 {cat:'commande', q:'Comment suivre ma commande ?', a:'<p>Page <strong>Commandes</strong>, statuts en temps réel :<br>En attente → Confirmée → En livraison → Livrée</p>'},
 {cat:'commande', q:'Puis-je annuler une commande ?', a:'<ul><li><strong>En attente :</strong> annulation gratuite</li><li><strong>Confirmée :</strong> frais de 1 000 FCFA</li><li><strong>En livraison :</strong> impossible</li></ul>'},
 {cat:'livraison', q:'Quelles sont les zones de livraison ?', a:'<p>8 villes : Yaoundé, Douala (express 2-4h) · Bafoussam, Garoua, Maroua, Ngaoundéré (24h) · Kribi, Limbé (48h). Zones rurales : devis sur demande.</p>'},
 {cat:'livraison', q:'Combien coûte la livraison ?', a:'<ul><li>Zone 1 centre-ville : 2 000 FCFA</li><li>Zone 2 périphérie : 3 500 FCFA</li><li>Zone 3 grandes villes : 5 000 FCFA</li><li>Zone 4 villes secondaires : 7 500 FCFA</li></ul><p style="background:#E8F5EF;padding:8px;border-radius:6px;margin-top:6px"><strong>Gratuit</strong> pour commandes ≥ 50 000 FCFA (zones 1 & 2)</p>'},
 {cat:'livraison', q:'Quels sont les horaires de livraison ?', a:'<ul><li>Lundi — Samedi : 8h à 20h</li><li>Dimanche : 9h à 17h (zones principales)</li><li>Jours fériés : service réduit</li></ul>'},
 {cat:'paiement', q:'Quels modes de paiement acceptez-vous ?', a:'<ul><li>Espèces à la livraison ou en magasin</li><li>MTN Mobile Money</li><li>Orange Money</li><li>Carte bancaire (Visa, Mastercard)</li><li>Virement bancaire (B2B)</li></ul>'},
 {cat:'paiement', q:'Le paiement Mobile Money est-il sécurisé ?', a:'<p>Oui. Nous utilisons les API officielles de MTN Cameroun et Orange Cameroun. Votre numéro n\'est jamais partagé avec des tiers.</p>'},
 {cat:'ia', q:"Comment fonctionne l'Assistant IA ?", a:'<p>Propulsé par <strong>Claude d\'Anthropic</strong>, il connaît vos données en temps réel et peut analyser vos performances, recommander des réapprovisionnements et conseiller sur la gestion.</p>'},
 {cat:'ia', q:'Mes conversations avec l\'IA sont-elles confidentielles ?', a:'<p>Oui : chiffrement HTTPS, suppression automatique après 30 jours, jamais utilisées sans consentement pour entraîner des modèles.</p>'},
 {cat:'stock', q:'Comment gérer les alertes de rupture de stock ?', a:'<p>Le tableau de bord affiche toutes les alertes avec les photos des produits. Dans <strong>Produits & Stock</strong>, cliquez sur <strong>Réappro</strong> pour commander 50 unités supplémentaires.</p>'},
 {cat:'technique', q:"L'application fonctionne-t-elle sur mobile ?", a:'<p>Oui, entièrement responsive sur Android, iOS, tablettes et desktop. Application mobile native prévue au 2ème trimestre 2025.</p>'},
 {cat:'technique', q:"Que faire si l'application est lente ou buggée ?", a:'<p>Rechargez la page (F5), videz le cache navigateur, essayez Chrome. Si le problème persiste : support@supermarche.cm</p>'},
];

var currentFaqCat = 'all';
function filterFaq(cat, btn) {
 currentFaqCat = cat;
 document.querySelectorAll('.faq-cat').forEach(function(b){ b.classList.remove('active'); });
 if (btn) btn.classList.add('active');
 renderFaq();
}
function renderFaq() {
 var list = document.getElementById('faq-list'); if (!list) return;
 // Fusionner les questions par défaut (FAQ_DATA) avec celles ajoutées par le gérant (FAQ_CUSTOM)
 // Normaliser FAQ_CUSTOM : champ "r" (réponse saisie dans le formulaire) -> "a" (utilisé à l'affichage)
 var customNormalized = FAQ_CUSTOM.map(function(f) {
   return { cat: f.cat || 'general', q: f.q, a: f.a || f.r || '', custom: true, id: f.id };
 });
 var toutesLesFaqs = FAQ_DATA.concat(customNormalized);
 var filtered = currentFaqCat==='all' ? toutesLesFaqs : toutesLesFaqs.filter(function(f){ return f.cat===currentFaqCat; });
 var icons = {compte:'<img src="https://img.icons8.com/ios/24/007A3D/user.png" alt="utilisateur" style="width:20px;height:20px;vertical-align:middle">', commande:'<img src="https://img.icons8.com/ios/24/007A3D/clipboard.png" alt="liste" style="width:20px;height:20px;vertical-align:middle">', livraison:'<img src="https://img.icons8.com/ios/24/007A3D/delivery-truck.png" alt="livraison" style="width:20px;height:20px;vertical-align:middle">', paiement:'<img src="https://img.icons8.com/ios/24/007A3D/bank-card.png" alt="paiement" style="width:20px;height:20px;vertical-align:middle">', ia:'<img src="https://img.icons8.com/ios/24/007A3D/robot.png" alt="ia" style="width:20px;height:20px;vertical-align:middle">', stock:'<img src="https://img.icons8.com/ios/24/007A3D/box.png" alt="produit" style="width:20px;height:20px;vertical-align:middle">', technique:'<img src="https://img.icons8.com/ios/24/007A3D/settings.png" alt="parametres" style="width:20px;height:20px;vertical-align:middle">', general:'<img src="https://img.icons8.com/ios/24/007A3D/question-mark.png" alt="question" style="width:20px;height:20px;vertical-align:middle">'};
 list.innerHTML = filtered.map(function(f,i){
 var badge = f.custom ? '<span style="background:#fef3c7;color:#92400e;font-size:9px;font-weight:700;padding:2px 6px;border-radius:8px;margin-left:6px">AJOUTÉE</span>' : '';
 return '<div class="faq-item" id="faq-'+i+'"><div class="faq-q" onclick="toggleFaq('+i+')"><span class="ico">'+(icons[f.cat]||icons.general)+'</span><span style="flex:1">'+f.q+badge+'</span><span class="arr">&#9660;</span></div><div class="faq-a">'+f.a+'</div></div>';
 }).join('');
}
function toggleFaq(i) {
 var el = document.getElementById('faq-'+i); if (!el) return;
 var isOpen = el.classList.contains('open');
 document.querySelectorAll('.faq-item.open').forEach(function(e){ e.classList.remove('open'); });
 if (!isOpen) el.classList.add('open');
}

// ═══════════════ SYNC BOUTIQUE EN LIGNE ═══════════════
// Charge les commandes passées depuis la boutique client (boutique.html)
async function syncBoutiqueOrders() {
 // Charger depuis Supabase si actif
 if (typeof DB !== 'undefined' && DB.estActif()) {
 try {
 var cmdsDb = await DB.chargerCommandes();
 if (cmdsDb && cmdsDb.length > 0) {
 cmdsDb.forEach(function(cmd) {
 var exists = CMDS.find(function(c){ return c.id === cmd.id; });
 if (!exists) {
 var items = (cmd.items || []).map(function(it) {
 return { nom:it.nom, img:it.img||'https://images.unsplash.com/photo-1542838132-92c53300491e?w=40&h=40&fit=crop', qty:it.qte||it.qty||1, prix:it.prix };
 });
 CMDS.unshift({ id:cmd.id, date:cmd.date, client:cmd.client, tel:cmd.tel, sm:cmd.supermarche||'KAMER360', pay:cmd.paiement||'Mobile Money', statut:cmd.statut||'en_attente', type:'achat', items:items, total:cmd.total||0, notes:(cmd.notes||'')+(cmd.source==='boutique_en_ligne'?' | <img src="https://img.icons8.com/ios/24/007A3D/globe.png" alt="web" style="width:20px;height:20px;vertical-align:middle"> En ligne':'') });
 }
 });
 updateBadgeCmd(); renderCmds();
 return;
 }
 } catch(e) { console.warn('Supabase sync error:', e); }
 }

 // Fallback localStorage
 try {
 var stored = JSON.parse(localStorage.getItem('sm_commandes') || '[]');
 stored.forEach(function(cmd) {
 // Vérifier que la commande n'est pas déjà dans CMDS
 var exists = CMDS.find(function(c){ return c.id === cmd.id; });
 if (!exists && cmd.source === 'boutique_en_ligne') {
 // Adapter le format boutique -> format gérant
 var items = (cmd.items || []).map(function(it) {
 return {
 nom: it.nom,
 img: it.img || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=40&h=40&fit=crop',
 qty: it.qte || it.qty || 1,
 prix: it.prix
 };
 });
 CMDS.unshift({
 id: cmd.id,
 date: cmd.date,
 client: cmd.client,
 tel: cmd.tel,
 sm: cmd.supermarche || cmd.sm || 'KAMER360',
 pay: cmd.paiement || cmd.pay || 'Mobile Money',
 statut: cmd.statut || 'en_attente',
 type: 'achat',
 items: items,
 total: cmd.total,
 notes: (cmd.notes ? cmd.notes + ' | ' : '') + '<img src="https://img.icons8.com/ios/24/007A3D/globe.png" alt="web" style="width:20px;height:20px;vertical-align:middle"> Commande en ligne' + (cmd.ville ? ' — ' + cmd.ville : '') + (cmd.adresse ? ' — ' + cmd.adresse : '')
 });
 }
 });
 } catch(e) { console.warn('Sync boutique:', e); }
}

// Écouter les nouvelles commandes en temps réel (autre onglet)
window.addEventListener('storage', function(e) {
  // Signal direct d'un nouveau client (plus fiable)
  if (e.key === 'sm_nouveau_client' && e.newValue) {
    try {
      var info = JSON.parse(e.newValue);
      if (typeof renderDashboard === 'function') {
        setTimeout(renderDashboard, 300);
      }
      if (typeof addNotif === 'function') {
        addNotif('🧑 Nouveau client inscrit : ' + (info.nom || ''), 'blue');
      }
    } catch(err) { _logErr("script.js", err); }
  }
  if (e.key === 'sm_clients') {
    // Rafraîchir le compteur clients inscrit
    var cl = [];
    try { cl = JSON.parse(e.newValue || '[]'); } catch(err) { _logErr("script.js", err); }
    if (typeof setDash === 'function') {
      setDash('dash-clients', cl.length);
      if (cl.length > 0) setDash('dash-clients-sub', cl.length + ' inscrits boutique');
    }
  }
  if (e.key === 'sm_commandes') {
    syncBoutiqueOrders();
    renderCmds();
    updateBadgeCmd();
    toast('Nouvelle commande en ligne reçue !', 'success');
  }
});

// Écoute temps réel Supabase (nouvelles commandes depuis n'importe où)
if (typeof DB !== 'undefined') {
 DB.ecouterNouvellesCommandes(function(nouvelleCmd) {
 toast('<img src="https://img.icons8.com/ios/24/007A3D/shopping-cart.png" alt="panier" style="width:20px;height:20px;vertical-align:middle"> Nouvelle commande en ligne : ' + nouvelleCmd.id, 'success');
 addNotif('Nouvelle commande : ' + nouvelleCmd.client + ' — ' + (nouvelleCmd.total||0).toLocaleString('fr-FR') + ' FCFA', 'green');
 syncBoutiqueOrders();
 });
}

// Lien rapide vers la boutique dans le dashboard
function openBoutique() {
 window.open('boutique.html', '_blank');
}

// ═══════════════════════════════════════════════════════
// NETTOYAGE AUTOMATIQUE DES DONNÉES DE DÉMONSTRATION
// Supprime toutes les commandes dont la date est 2025
// ═══════════════════════════════════════════════════════
(function nettoyerDemoData() {
 try {
 // Nettoyer sm_commandes localStorage
 var cmdsStored = JSON.parse(localStorage.getItem('sm_commandes') || '[]');
 var cmdsClean = cmdsStored.filter(function(c) {
 // Garder seulement les commandes 2026 et après
 var annee = parseInt((c.date || '').split('/')[2]);
 return !isNaN(annee) && annee >= 2026;
 });
 if (cmdsClean.length !== cmdsStored.length) {
 localStorage.setItem('sm_commandes', JSON.stringify(cmdsClean));
 }

 // Nettoyer CMDS en mémoire (supprimer CMD-004 et toute commande 2025)
 CMDS = CMDS.filter(function(c) {
 var annee = parseInt((c.date || '').split('/')[2]);
 return !isNaN(annee) && annee >= 2026;
 });
 } catch(e) { _logErr("script.js", e); }
})();


// ═══════════════════════════════════════════════════════
// PAGE MENUISERIE & BOIS
// ═══════════════════════════════════════════════════════
function renderCatalogueMenuiserie() {
 var srch = ((document.getElementById('men-search')||{}).value||'').toLowerCase();
 var prods = PRODS.filter(function(p){
 return p.cat === 'Menuiserie & Bois' &&
 (!srch || p.nom.toLowerCase().includes(srch));
 });

 // Stats
 var statsEl = document.getElementById('men-stats');
 if (statsEl) {
 var total = prods.length;
 var ruptures = prods.filter(function(p){ return p.stock === 0; }).length;
 var valeur = prods.reduce(function(s,p){ return s + (p.prix * p.stock); }, 0);
 statsEl.innerHTML =
 '<div class="cd" style="text-align:center"><div style="font-size:24px;font-weight:800;color:#007A3D">' + total + '</div><div style="font-size:12px;color:#666">Produits</div></div>' +
 '<div class="cd" style="text-align:center"><div style="font-size:24px;font-weight:800;color:#CE1126">' + ruptures + '</div><div style="font-size:12px;color:#666">Ruptures</div></div>' +
 '<div class="cd" style="text-align:center"><div style="font-size:22px;font-weight:800;color:#007A3D">' + (valeur>=1000000?(valeur/1000000).toFixed(1)+'M':Math.round(valeur/1000)+'K') + '</div><div style="font-size:12px;color:#666">Valeur stock (FCFA)</div></div>';
 }

 // Badge count
 var countEl = document.getElementById('men-count');
 if (countEl) countEl.textContent = prods.length + ' produit' + (prods.length > 1 ? 's' : '');

 // Catalogue
 var cat = document.getElementById('men-catalogue');
 if (!cat) return;
 if (prods.length === 0) {
 cat.innerHTML = '<div class="empty"><h3>Aucun produit trouvé</h3><p>Modifiez votre recherche ou ajoutez un produit</p></div>';
 return;
 }
 cat.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">'
 + prods.map(function(p) {
 var scls = p.stock===0 ? 'bgr' : p.stock<10 ? 'bgy' : 'bgg';
 var slbl = p.stock===0 ? 'Rupture' : p.stock<10 ? 'Stock faible' : 'Disponible';
 var scol = p.stock===0 ? 'var(--r)' : p.stock<10 ? '#B8860B' : '#007A3D';
 return '<div class="cd">'
 + '<div style="position:relative;margin-bottom:10px">'
 + '<img src="' + p.img + '" style="width:100%;height:110px;object-fit:cover;border-radius:10px">'
 + '<span class="badge ' + scls + '" style="position:absolute;top:6px;right:6px;font-size:10px">' + slbl + '</span>'
 + '</div>'
 + '<div style="font-weight:700;font-size:13px;margin-bottom:4px">' + p.nom + '</div>'
 + '<div style="font-size:12px;color:#999;margin-bottom:6px">Stock : <strong style="color:' + scol + '">' + p.stock + ' unité(s)</strong></div>'
 + '<div style="font-size:16px;font-weight:800;color:#007A3D;margin-bottom:8px">' + p.prix.toLocaleString('fr-FR') + ' FCFA</div>'
 + '<div style="display:flex;gap:6px">'
 + (p.stock < 10 ? '<button class="btn bp bsm" onclick="reappro(' + p.id + ')">Réappro</button>' : '')
 + '<button class="btn bo bsm" onclick="editProd(' + p.id + ')">Modifier</button>'
 + '<button class="btn bd bsm" onclick="supprimerProd(' + p.id + ')">Suppr.</button>'
 + '</div>'
 + '</div>';
 }).join('')
 + '</div>';
}

function exporterCSVMenuiserie() {
 var prods = PRODS.filter(function(p){ return p.cat === 'Menuiserie & Bois'; });
 var lignes = ['Nom;Prix (FCFA);Stock;Statut'];
 prods.forEach(function(p) {
 var statut = p.stock===0?'Rupture':p.stock<10?'Stock critique':'En stock';
 lignes.push('"' + p.nom + '";' + p.prix + ';' + p.stock + ';"' + statut + '"');
 });
 telechargerCSV(lignes.join('\n'), 'menuiserie-' + new Date().toLocaleDateString('fr-FR').replace(/\//g,'-') + '.csv');
 toast('CSV Menuiserie téléchargé', 'success');
}

// ═══════════════ INIT ═══════════════
chargerStoresLocalStorage();
chargerConfig();
initUsers();
initPromos();
initFidelite();
initLivraisons();
if(typeof initLivreurs==="function") { initLivreurs(); if(typeof LIVREURS_DATA !== "undefined") LIVREURS_DATA._init = true; }
initRetours();
syncBoutiqueOrders();
makeBars('weekBars',[32,48,41,55,70,88,44],function(i){ return i===5?'var(--y)':'var(--g)'; });
makeBars('monthBars',[68,75,82,78,0,0,0,0,0,0,0,0],function(i,v){ return v>0?'var(--g)':'rgba(0,0,0,.08)'; });
renderProds(); renderCat(); renderCmds(); updatePanierUI(); updateBadgeCmd(); updateBadgeProd();
renderFaq();
renderStores(); refreshAllSMSelects();
renderUsers();
renderPromos();
renderFideliteClients();
renderLivraisons();
if(typeof renderLivreurs==="function") renderLivreurs();
renderRetours();
renderStatsClients();
renderVueLivreur();
applyRoleRestrictions();
initConfigLivePreview();

// ═══════════════════════════════════════════════════════
//  MEUBLES & DÉCORATION v2 — Panier + Commandes
// ═══════════════════════════════════════════════════════

var PANIER_MEUBLES = [];
var COMMANDES_MEUBLES = [];
var meubles_seq = 1;

function initMeublesV2() {
  try {
    var s = JSON.parse(localStorage.getItem('sm_meubles_cmd') || '{}');
    if (s.commandes) COMMANDES_MEUBLES = s.commandes;
    if (s.seq) meubles_seq = s.seq;
  } catch(e) { _logErr("script.js", e); }
}

function ajouterMeubleAuPanier(id) {
  // Chercher dans PRODS et MENUISERIE_PRODUITS
  var p = PRODS.find(function(x){ return String(x.id) === String(id); });
  if (!p && typeof MENUISERIE_PRODUITS !== 'undefined') {
    p = MENUISERIE_PRODUITS.find(function(x){ return String(x.id) === String(id); });
  }
  if (!p) { toast('Produit introuvable', 'error'); return; }
  var ex = PANIER_MEUBLES.find(function(i){ return String(i.id) === String(id); });
  if (ex) ex.qty++;
  else PANIER_MEUBLES.push({ id: String(id), nom: p.nom, prix: p.prix, qty: 1 });
  updatePanierMeublesUI();
  toast(p.nom + ' ajouté au panier !', 'success');
}

function getPanierMeublesTotal() {
  return PANIER_MEUBLES.reduce(function(s,i){
    // Chercher le prix dans l'item lui-même (si stocké) ou dans PRODS
    if (i.prix) return s + i.prix * i.qty;
    var p = PRODS.find(function(x){ return String(x.id) === String(i.id); });
    if (!p && typeof MENUISERIE_PRODUITS !== 'undefined') {
      p = MENUISERIE_PRODUITS.find(function(x){ return String(x.id) === String(i.id); });
    }
    return s + (p ? p.prix * i.qty : 0);
  }, 0);
}

function updatePanierMeublesUI() {
  var cnt = PANIER_MEUBLES.reduce(function(s,i){ return s+i.qty; },0);
  var badge = document.getElementById('meubles-panier-badge');
  var totEl = document.getElementById('meubles-panier-total');
  var btn   = document.getElementById('meubles-panier-btn');
  if (badge) badge.textContent = cnt;
  if (totEl) totEl.textContent = getPanierMeublesTotal().toLocaleString('fr-FR') + ' FCFA';
  if (btn)   btn.style.display = cnt>0 ? 'flex' : 'none';
  // Afficher recap dans modal
  var recap = document.getElementById('meubles-recap-commande');
  if (recap && PANIER_MEUBLES.length > 0) {
    recap.innerHTML = '<div style="background:#f0faf5;border-radius:10px;padding:12px;margin-bottom:12px">'
      + PANIER_MEUBLES.map(function(i){
          var p = PRODS.find(function(x){ return x.id===i.id; });
          if(!p) return '';
          return '<div style="display:flex;justify-content:space-between;font-size:13px;padding:3px 0"><span>'+i.qty+'x '+p.nom+'</span><span style="font-weight:700">'+(p.prix*i.qty).toLocaleString('fr-FR')+' F</span></div>';
        }).join('')
      + '<div style="border-top:1px solid #d1fae5;margin-top:8px;padding-top:8px;font-weight:800;display:flex;justify-content:space-between"><span>Sous-total</span><span style="color:#007A3D">'+getPanierMeublesTotal().toLocaleString('fr-FR')+' FCFA</span></div>'
      + '</div>';
  }
}

function confirmerCommandeMeubles() {
  var client   = (document.getElementById('mbl-client')   || {}).value || '';
  var tel      = (document.getElementById('mbl-tel')      || {}).value || '';
  var adresse  = (document.getElementById('mbl-adresse')  || {}).value || '';
  var montage  = (document.getElementById('mbl-montage')  || {}).checked;
  var paiement = (document.getElementById('mbl-paiement') || {}).value || 'MTN MoMo';
  if (!client) { toast('Nom requis', 'warning'); return; }
  if (!tel)    { toast('Téléphone requis', 'warning'); return; }
  if (PANIER_MEUBLES.length === 0) { toast('Panier vide', 'warning'); return; }
  var items = PANIER_MEUBLES.map(function(i){
    var p = PRODS.find(function(x){ return x.id===i.id; });
    return { nom:p.nom, prix:p.prix, qty:i.qty };
  });
  var fraisMontage = montage ? 5000 * PANIER_MEUBLES.length : 0;
  var cmd = {
    id: 'MBL-' + String(meubles_seq++).padStart(3,'0'),
    client:client, tel:tel, adresse:adresse, montage:montage,
    paiement:paiement, items:items,
    sous_total: getPanierMeublesTotal(), frais_montage: fraisMontage,
    total: getPanierMeublesTotal() + fraisMontage,
    statut:'confirme', cree_le:new Date().toISOString()
  };
  COMMANDES_MEUBLES.unshift(cmd);
  try { localStorage.setItem('sm_meubles_cmd', JSON.stringify({ commandes:COMMANDES_MEUBLES, seq:meubles_seq })); } catch(e) { _logErr("script.js", e); }
  PANIER_MEUBLES = [];
  updatePanierMeublesUI();
  closeM('m-commande-meubles');
  renderCommandesMeubles();
  toast('Commande ' + cmd.id + ' confirmée !', 'success');
  addNotif('Nouvelle commande meubles : ' + client + ' — ' + cmd.total.toLocaleString('fr-FR') + ' FCFA', 'green');
  // SMS
  var msg = 'Bonjour ' + client + ', votre commande de meubles ' + cmd.id + ' est confirmée ! Total : ' + cmd.total.toLocaleString('fr-FR') + ' FCFA. Livraison sous 7 jours.' + (montage?' Montage inclus.':'') + ' KAMER360';
  fetch((typeof BACKEND!=='undefined'?BACKEND:'https://kamer360-backend-production.up.railway.app') + '/sms/custom', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ tel: tel.replace(/[\s+]/g,''), message: msg })
  }).catch(function(){});
  ['mbl-client','mbl-tel','mbl-adresse'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

function retirerMeubleduPanier(id) {
  var ex = PANIER_MEUBLES.find(function(i){ return String(i.id) === String(id); });
  if (!ex) return;
  ex.qty--;
  if (ex.qty <= 0) PANIER_MEUBLES = PANIER_MEUBLES.filter(function(i){ return String(i.id) !== String(id); });
  updatePanierMeublesUI();
  renderMeubles();
}

function renderCommandesMeubles() {
  var liste = document.getElementById('meubles-commandes');
  if (!liste) return;
  if (COMMANDES_MEUBLES.length === 0) { liste.innerHTML = '<p style="text-align:center;color:#999;padding:16px">Aucune commande</p>'; return; }
  var stMap = { confirme:['Confirmée','#007A3D','#dcfce7'], en_livraison:['En livraison','#f59e0b','#fef3c7'], livre:['Livrée','#6b7280','#f3f4f6'], annule:['Annulée','#CE1126','#fee2e2'] };
  liste.innerHTML = COMMANDES_MEUBLES.slice(0,15).map(function(c) {
    var st = stMap[c.statut] || ['—','#999','#f9fafb'];
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">'
      + '<div><span style="font-weight:800;color:#007A3D">'+c.id+'</span> <span style="font-size:11px;padding:2px 8px;border-radius:20px;background:'+st[2]+';color:'+st[1]+';font-weight:700">'+st[0]+'</span>'
      + '<div style="font-weight:700;margin-top:4px">'+c.client+' — '+c.tel+'</div>'
      + '<div style="font-size:12px;color:#555">'+c.items.map(function(i){return i.qty+'x '+i.nom;}).join(', ')+'</div>'
      + (c.montage?'<div style="font-size:11px;color:#007A3D;font-weight:600">Montage inclus</div>':'')
      + '</div>'
      + '<div style="font-size:18px;font-weight:800;color:#007A3D">'+c.total.toLocaleString('fr-FR')+' FCFA</div>'
      + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:8px">'
      + (c.statut==='confirme'?'<button class="btn bp bsm" onclick="changerStatutMeubles(\''+c.id+'\',\'en_livraison\')">Envoyer</button>':'')
      + (c.statut==='en_livraison'?'<button class="btn bp bsm" onclick="changerStatutMeubles(\''+c.id+'\',\'livre\')">Livré</button>':'')
      + (c.statut!=='livre'&&c.statut!=='annule'?'<button class="btn bd bsm" onclick="changerStatutMeubles(\''+c.id+'\',\'annule\')">Annuler</button>':'')
      + '</div></div>';
  }).join('');
}

function changerStatutMeubles(id, statut) {
  var cmd = COMMANDES_MEUBLES.find(function(c){ return c.id===id; });
  if (!cmd) return;
  cmd.statut = statut;
  try { localStorage.setItem('sm_meubles_cmd', JSON.stringify({ commandes:COMMANDES_MEUBLES, seq:meubles_seq })); } catch(e) { _logErr("script.js", e); }
  renderCommandesMeubles();
  toast(id + ' — ' + statut, 'success');
}

// Override renderMeubles pour ajouter bouton panier
var _renderMeublesOrig = renderMeubles;
renderMeubles = function() {
  var grid = document.getElementById('meubles-grid');
  if (!grid) return;
  var srch    = ((document.getElementById('meubles-search')||{}).value||'').toLowerCase();
  var souscat = (document.getElementById('meubles-sous-cat')||{}).value||'';
  var prods = PRODS.filter(function(p){
    return p.cat === 'Meubles & Décoration'
      && (!srch    || p.nom.toLowerCase().includes(srch))
      && (!souscat || (p.sous_cat&&p.sous_cat===souscat));
  });
  if (prods.length === 0) {
    // Utiliser MENUISERIE_PRODUITS filtrés par cat Meubles si disponibles
    if (typeof MENUISERIE_PRODUITS !== 'undefined') {
      prods = MENUISERIE_PRODUITS.filter(function(p){ return p.cat==='Meubles'; });
    }
  }
  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">'
    + prods.map(function(p) {
        var qte = (PANIER_MEUBLES.find(function(i){ return i.id===p.id; })||{}).qty||0;
        return '<div class="cd">'
          + '<img src="' + (p.img||'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop') + '" style="width:100%;height:130px;object-fit:cover;border-radius:8px;margin-bottom:8px">'
          + '<div style="font-weight:700;font-size:13px;margin-bottom:4px">' + p.nom + '</div>'
          + (p.couleurs?'<div style="font-size:11px;color:#666;margin-bottom:4px">Couleurs : ' + (Array.isArray(p.couleurs)?p.couleurs.join(', '):p.couleurs) + '</div>':'')
          + '<div style="font-size:16px;font-weight:800;color:#007A3D;margin-bottom:10px">' + p.prix.toLocaleString('fr-FR') + ' FCFA</div>'
          + '<div style="display:flex;align-items:center;gap:8px">'
          + '<button onclick="retirerMeubleduPanier(' + p.id + ')" style="width:28px;height:28px;border-radius:50%;border:1.5px solid #e5e7eb;background:#fff;cursor:pointer;font-size:16px" ' + (qte===0?'disabled':'') + '>−</button>'
          + '<span style="font-weight:700;min-width:20px;text-align:center">' + qte + '</span>'
          + '<button onclick="ajouterMeubleAuPanier(' + p.id + ')" style="width:28px;height:28px;border-radius:50%;background:#007A3D;border:none;color:#fff;cursor:pointer;font-size:16px">+</button>'
          + '</div></div>';
      }).join('') + '</div>';
};

// Surcharger goPage meubles
var _goPageOrig_meubles = goPage;

// ═══════════════════════════════════════════════════════
//  Fonctions manquantes — Pages sans bouton d'ajout
// ═══════════════════════════════════════════════════════

// ──────────────────────────────────────────
//  1. BON DE COMMANDE FOURNISSEUR (Achats)
// ──────────────────────────────────────────
function ajouterLigneBonCommande() {
  var zone = document.getElementById('bc-lignes');
  if (!zone) return;
  var div = document.createElement('div');
  div.className = 'bc-ligne';
  div.style.cssText = 'display:flex;gap:6px;margin-bottom:6px';
  div.innerHTML = '<input type="text" placeholder="Nom de l\'article" style="flex:2;padding:8px;border:1.5px solid var(--br);border-radius:8px;font-size:12px">'
    + '<input type="number" placeholder="Qté" min="1" style="flex:1;padding:8px;border:1.5px solid var(--br);border-radius:8px;font-size:12px">'
    + '<input type="number" placeholder="Prix unit." min="0" style="flex:1;padding:8px;border:1.5px solid var(--br);border-radius:8px;font-size:12px" oninput="calculerTotalBC()">'
    + '<button onclick="this.parentElement.remove();calculerTotalBC()" style="background:#fee2e2;border:none;border-radius:8px;padding:6px 10px;cursor:pointer;color:#CE1126;font-weight:700">X</button>';
  zone.appendChild(div);
}

function calculerTotalBC() {
  var lignes = document.querySelectorAll('#bc-lignes .bc-ligne, #bc-lignes > div');
  var total = 0;
  lignes.forEach(function(l) {
    var inputs = l.querySelectorAll('input[type="number"]');
    if (inputs.length >= 2) {
      var qty   = parseFloat(inputs[0].value) || 0;
      var prix  = parseFloat(inputs[1].value) || 0;
      total += qty * prix;
    }
  });
  var el = document.getElementById('bc-total');
  if (el) el.textContent = 'Total estimé : ' + total.toLocaleString('fr-FR') + ' FCFA';
}

var BONS_COMMANDE = [];
function creerBonCommande() {
  var fournisseur = (document.getElementById('bc-fournisseur') || {}).value || '';
  var date    = (document.getElementById('bc-date')    || {}).value || '';
  var paiement= (document.getElementById('bc-paiement')|| {}).value || 'Virement';
  var notes   = (document.getElementById('bc-notes')   || {}).value || '';
  var lignes  = document.querySelectorAll('#bc-lignes > div');
  var items = [];
  var total = 0;
  lignes.forEach(function(l) {
    var inputs = l.querySelectorAll('input');
    var nom  = (inputs[0] || {}).value || '';
    var qty  = parseFloat((inputs[1] || {}).value) || 0;
    var prix = parseFloat((inputs[2] || {}).value) || 0;
    if (nom && qty > 0) { items.push({ nom:nom, qty:qty, prix:prix }); total += qty*prix; }
  });
  if (items.length === 0) { toast('Ajoutez au moins un article', 'warning'); return; }
  var bc = {
    id: 'BC-' + Date.now(),
    fournisseur: fournisseur || 'Non spécifié',
    date_souhaitee: date,
    paiement: paiement,
    items: items,
    total: total,
    notes: notes,
    statut: 'en_attente',
    cree_le: new Date().toLocaleDateString('fr-FR')
  };
  BONS_COMMANDE.push(bc);
  try { localStorage.setItem('sm_bons_commande', JSON.stringify(BONS_COMMANDE)); } catch(e) { _logErr("script.js", e); }
  closeM('m-bon-commande');
  toast('Bon de commande ' + bc.id + ' créé — ' + total.toLocaleString('fr-FR') + ' FCFA', 'success');
  addNotif('Bon de commande créé : ' + (fournisseur||'fournisseur') + ' — ' + total.toLocaleString('fr-FR') + ' FCFA', 'green');
}

function exporterBonCommande() {
  try {
    var bons = JSON.parse(localStorage.getItem('sm_bons_commande') || '[]');
    if (bons.length === 0) { toast('Aucun bon de commande à exporter', 'warning'); return; }
    var csv = 'ID;Fournisseur;Date;Articles;Total;Statut\n';
    bons.forEach(function(b) {
      var arts = b.items.map(function(i){ return i.qty+'x'+i.nom; }).join(' | ');
      csv += b.id + ';' + b.fournisseur + ';' + b.date_souhaitee + ';' + arts + ';' + b.total + ';' + b.statut + '\n';
    });
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bons_commande_' + new Date().toLocaleDateString('fr-FR').replace(/\//g,'-') + '.csv';
    a.click();
    toast('CSV exporté !', 'success');
  } catch(e) { toast('Erreur export', 'error'); }
}

// ──────────────────────────────────────────
//  2. VENTE RAPIDE (Ventes)
// ──────────────────────────────────────────
function ajouterLigneVenteRapide() {
  var zone = document.getElementById('vr-lignes');
  if (!zone) return;
  var div = document.createElement('div');
  div.className = 'vr-ligne';
  div.style.cssText = 'display:flex;gap:6px;margin-bottom:6px;align-items:center';
  var options = '<option value="">Choisir...</option>' +
    (typeof PRODS !== 'undefined' ? PRODS.slice(0,50).map(function(p){
      return '<option value="' + p.prix + '" data-nom="' + p.nom + '">' + p.nom + ' — ' + p.prix.toLocaleString('fr-FR') + ' F</option>';
    }).join('') : '');
  div.innerHTML = '<select style="flex:2;padding:8px;border:1.5px solid var(--br);border-radius:8px;font-size:12px" onchange="majPrixVenteRapide(this)">' + options + '</select>'
    + '<input type="number" placeholder="Qté" value="1" min="1" style="flex:1;padding:8px;border:1.5px solid var(--br);border-radius:8px;font-size:12px" oninput="calculerTotalVenteRapide()">'
    + '<span class="prix-vr" style="font-weight:700;color:#007A3D;min-width:70px;font-size:12px">0 F</span>'
    + '<button onclick="this.parentElement.remove();calculerTotalVenteRapide()" style="background:#fee2e2;border:none;border-radius:8px;padding:6px 10px;cursor:pointer;color:#CE1126;font-weight:700">X</button>';
  zone.appendChild(div);
}

function majPrixVenteRapide(sel) {
  var ligne = sel.closest('.vr-ligne') || sel.parentElement;
  if (!ligne) return;
  var qty   = parseFloat((ligne.querySelector('input[type="number"]') || {}).value) || 1;
  var prix  = parseFloat(sel.value) || 0;
  var span  = ligne.querySelector('.prix-vr');
  if (span) span.textContent = (prix * qty).toLocaleString('fr-FR') + ' F';
  calculerTotalVenteRapide();
}

function calculerTotalVenteRapide() {
  var total = 0;
  document.querySelectorAll('#vr-lignes .vr-ligne').forEach(function(l) {
    var sel  = l.querySelector('select');
    var inp  = l.querySelector('input[type="number"]');
    var prix = parseFloat((sel||{}).value) || 0;
    var qty  = parseFloat((inp||{}).value) || 1;
    var span = l.querySelector('.prix-vr');
    if (span) span.textContent = (prix*qty).toLocaleString('fr-FR') + ' F';
    total += prix * qty;
  });
  var el = document.getElementById('vr-total');
  if (el) el.textContent = 'Total : ' + total.toLocaleString('fr-FR') + ' FCFA';
}

function enregistrerVenteRapide() {
  var client   = (document.getElementById('vr-client')  || {}).value || 'Client comptoir';
  var tel      = (document.getElementById('vr-tel')     || {}).value || '—';
  var paiement = (document.getElementById('vr-paiement')|| {}).value || 'Espèces';
  var lignes   = document.querySelectorAll('#vr-lignes .vr-ligne');
  var items = []; var total = 0;
  lignes.forEach(function(l) {
    var sel = l.querySelector('select');
    var inp = l.querySelector('input[type="number"]');
    var prix = parseFloat((sel||{}).value) || 0;
    var qty  = parseFloat((inp||{}).value) || 1;
    var nom  = sel && sel.selectedOptions[0] ? (sel.selectedOptions[0].getAttribute('data-nom')||sel.selectedOptions[0].text.split('—')[0].trim()) : '';
    if (nom && prix > 0) { items.push({ nom:nom, qty:qty, prix:prix }); total += prix*qty; }
  });
  if (items.length === 0) { toast('Ajoutez au moins un produit', 'warning'); return; }

  // Créer la commande
  var cmd = {
    id: 'VR-' + Date.now(),
    date: new Date().toLocaleDateString('fr-FR'),
    client: client, tel: tel,
    paiement: paiement, items: items,
    sous_total: total, livraison: 0, total: total,
    statut: 'livree', sm: currentUser ? currentUser.sm : 'Caisse',
    source: 'vente_directe'
  };
  if (typeof CMDS !== 'undefined') {
    CMDS.unshift(cmd);
    try { localStorage.setItem('sm_commandes', JSON.stringify(CMDS)); } catch(e) { _logErr("script.js", e); }
  }
  // Déduire le stock
  items.forEach(function(item) {
    if (typeof PRODS !== 'undefined') {
      var prod = PRODS.find(function(p){ return p.nom === item.nom; });
      if (prod && prod.stock > 0) prod.stock = Math.max(0, prod.stock - item.qty);
    }
  });
  closeM('m-vente-rapide');
  if (typeof renderVentes === 'function') renderVentes();
  if (typeof renderDashboard === 'function') renderDashboard();
  toast('Vente de ' + total.toLocaleString('fr-FR') + ' FCFA enregistrée !', 'success');
  addNotif('Vente directe : ' + client + ' — ' + total.toLocaleString('fr-FR') + ' FCFA', 'green');
  ['vr-client','vr-tel'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

// ──────────────────────────────────────────
//  3. COMMANDE FOURNITURES (Education)
// ──────────────────────────────────────────
function ajouterLigneFourniture() {
  var zone = document.getElementById('cf-lignes');
  if (!zone) return;
  var div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:6px;margin-bottom:6px';
  div.innerHTML = '<input type="text" placeholder="Ex: Cahiers 200 pages x10" style="flex:1;padding:8px;border:1.5px solid var(--br);border-radius:8px;font-size:12px">'
    + '<input type="number" placeholder="Prix" style="width:90px;padding:8px;border:1.5px solid var(--br);border-radius:8px;font-size:12px">'
    + '<button onclick="this.parentElement.remove()" style="background:#fee2e2;border:none;border-radius:8px;padding:6px 10px;cursor:pointer;color:#CE1126;font-weight:700">X</button>';
  zone.appendChild(div);
}

function commanderFournitures() {
  var client  = (document.getElementById('cf-client')  || {}).value || '';
  var tel     = (document.getElementById('cf-tel')     || {}).value || '';
  var date    = (document.getElementById('cf-date')    || {}).value || '';
  var adresse = (document.getElementById('cf-adresse') || {}).value || '';
  if (!client) { toast('Nom requis', 'warning'); return; }
  if (!tel)    { toast('Téléphone requis', 'warning'); return; }
  var lignes = document.querySelectorAll('#cf-lignes > div');
  var items = []; var total = 0;
  lignes.forEach(function(l) {
    var inputs = l.querySelectorAll('input');
    var desc = (inputs[0]||{}).value || '';
    var prix = parseFloat((inputs[1]||{}).value) || 0;
    if (desc) { items.push({ nom:desc, prix:prix }); total += prix; }
  });
  if (items.length === 0) { toast('Ajoutez au moins un article', 'warning'); return; }
  closeM('m-commande-fournitures');
  toast('Commande fournitures pour ' + client + ' enregistrée !', 'success');
  addNotif('Commande fournitures : ' + client + ' — ' + total.toLocaleString('fr-FR') + ' FCFA', 'green');
  // SMS
  if (tel) {
    fetch((typeof BACKEND!=='undefined'?BACKEND:'') + '/sms/custom', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ tel: tel.replace(/[\s+]/g,''),
        message: 'Bonjour ' + client + ', votre commande de fournitures scolaires a été enregistrée. Livraison ' + (date?'le '+formatDate(date):'sous 48h') + (adresse?' à '+adresse:'') + '. KAMER360 Éducation' })
    }).catch(function(){});
  }
}

// ──────────────────────────────────────────
//  4. LIVRAISON MANUELLE (Livraisons admin)
// ──────────────────────────────────────────
async function creerLivraisonManuelle() {
  var client  = (document.getElementById('lm-client')  || {}).value || '';
  var tel     = (document.getElementById('lm-tel')     || {}).value || '';
  var adresse = (document.getElementById('lm-adresse') || {}).value || '';
  var ville   = (document.getElementById('lm-ville')   || {}).value || '';
  var montant = parseInt((document.getElementById('lm-montant') || {}).value) || 0;
  var notes   = (document.getElementById('lm-notes')   || {}).value || '';
  if (!client)  { toast('Nom client requis', 'warning'); return; }
  if (!tel)     { toast('Téléphone requis', 'warning'); return; }
  if (!adresse) { toast('Adresse requise', 'warning'); return; }
  var liv = {
    id: 'LIV-M-' + Date.now(),
    cmd_id: 'MANUEL',
    client: client, tel: tel,
    adresse: adresse, ville: ville || 'Cameroun',
    total: montant, statut: 'en_attente',
    livreur_id: null, livreur_nom: null,
    creneau: null, notes: notes,
    date_creation: new Date().toISOString()
  };
  if (typeof LIVRAISONS !== 'undefined') {
    LIVRAISONS.liste.unshift(liv);
    if (typeof renderLivraisons === 'function') renderLivraisons();
  }
  if (typeof saveLivraisonSB === 'function') await saveLivraisonSB(liv);
  closeM('m-livraison-manuelle');
  toast('Livraison ' + liv.id + ' créée !', 'success');
  addNotif('Livraison manuelle créée : ' + client + ' — ' + adresse, 'green');
  ['lm-client','lm-tel','lm-adresse','lm-ville','lm-notes'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
  var m = document.getElementById('lm-montant'); if(m) m.value='';
}

// ──────────────────────────────────────────
//  5. POINTS FIDELITE MANUELS
// ──────────────────────────────────────────
function rechercherClientFidelite(tel) {
  var el = document.getElementById('ap-client-info');
  if (!el) return;
  if (!tel || tel.length < 8) { el.style.display='none'; return; }
  var pts = 0;
  try {
    var fid = JSON.parse(localStorage.getItem('sm_fidelite') || '{}');
    var c = Object.values(fid).find(function(x){ return x.tel && x.tel.includes(tel.replace(/[\s+]/g,'')); });
    if (c) { el.textContent = c.nom + ' — ' + (c.points||0) + ' points actuels'; el.style.display='block'; return; }
  } catch(e) { _logErr("script.js", e); }
  el.textContent = 'Nouveau client — 0 points actuels';
  el.style.display = 'block';
}

function ajouterPointsManuellement() {
  var tel    = (document.getElementById('ap-tel')    || {}).value || '';
  var pts    = parseInt((document.getElementById('ap-points') || {}).value) || 0;
  var motif  = (document.getElementById('ap-motif')  || {}).value || 'Manuel';
  if (!tel) { toast('Téléphone requis', 'warning'); return; }
  if (pts <= 0) { toast('Nombre de points invalide', 'warning'); return; }
  if (typeof ajouterPoints === 'function') {
    ajouterPoints(tel, 'Client', 0, 'MANUEL-' + Date.now());
    // Override direct
  }
  try {
    var fid = JSON.parse(localStorage.getItem('sm_fidelite') || '{}');
    var key = tel.replace(/[\s+]/g,'');
    if (!fid[key]) fid[key] = { tel:key, nom:'Client', points:0, historique:[] };
    fid[key].points = (fid[key].points||0) + pts;
    fid[key].historique = fid[key].historique || [];
    fid[key].historique.unshift({ date: new Date().toLocaleDateString('fr-FR'), pts:'+'+pts, motif:motif });
    localStorage.setItem('sm_fidelite', JSON.stringify(fid));
  } catch(e) { _logErr("script.js", e); }
  closeM('m-ajouter-points');
  if (typeof renderFideliteClients === 'function') renderFideliteClients();
  toast('+' + pts + ' points ajoutés pour ' + tel, 'success');
  addNotif('+' + pts + ' points fidélité ajoutés — ' + tel + ' (' + motif + ')', 'green');
  var ep = document.getElementById('ap-tel'); if(ep) ep.value='';
  var epp = document.getElementById('ap-points'); if(epp) epp.value='';
}

function retirerPointsManuellement() {
  var tel  = (document.getElementById('rp-tel')    || {}).value || '';
  var pts  = parseInt((document.getElementById('rp-points') || {}).value) || 0;
  var motif= (document.getElementById('rp-motif')  || {}).value || 'Retrait';
  if (!tel) { toast('Téléphone requis', 'warning'); return; }
  if (pts <= 0) { toast('Nombre de points invalide', 'warning'); return; }
  try {
    var fid = JSON.parse(localStorage.getItem('sm_fidelite') || '{}');
    var key = tel.replace(/[\s+]/g,'');
    if (!fid[key]) { toast('Client non trouvé', 'warning'); return; }
    fid[key].points = Math.max(0, (fid[key].points||0) - pts);
    fid[key].historique = fid[key].historique || [];
    fid[key].historique.unshift({ date: new Date().toLocaleDateString('fr-FR'), pts:'-'+pts, motif:motif });
    localStorage.setItem('sm_fidelite', JSON.stringify(fid));
  } catch(e) { _logErr("script.js", e); }
  closeM('m-retirer-points');
  if (typeof renderFideliteClients === 'function') renderFideliteClients();
  toast('-' + pts + ' points retirés pour ' + tel, 'success');
}

// ──────────────────────────────────────────
//  6. PARAMETRES — Fonctions manquantes
// ──────────────────────────────────────────
function exporterConfigJSON() {
  try {
    var cfg = JSON.parse(localStorage.getItem('sm_config') || '{}');
    var blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'kamer360-config-' + new Date().toLocaleDateString('fr-FR').replace(/\//g,'-') + '.json';
    a.click();
    toast('Configuration exportée !', 'success');
  } catch(e) { toast('Erreur export config', 'error'); }
}

function resetConfig() {
  if (!confirm('Réinitialiser toute la configuration ? Cette action est irréversible.')) return;
  try {
    localStorage.removeItem('sm_config');
    if (typeof chargerConfig === 'function') chargerConfig();
    toast('Configuration réinitialisée', 'success');
  } catch(e) { _logErr("script.js", e); }
}

// Initialiser les bons de commande
try {
  BONS_COMMANDE = JSON.parse(localStorage.getItem('sm_bons_commande') || '[]');
} catch(e) { BONS_COMMANDE = []; }

// Initialiser le select fournisseurs dans m-bon-commande
function initSelectFournisseurs() {
  var sel = document.getElementById('bc-fournisseur');
  if (!sel) return;
  sel.innerHTML = '<option value="">Choisir un fournisseur...</option>';
  try {
    var fours = JSON.parse(localStorage.getItem('sm_fournisseurs') || '[]');
    fours.forEach(function(f) {
      var opt = document.createElement('option');
      opt.value = f.nom || f.id;
      opt.textContent = (f.nom||'') + (f.tel ? ' — ' + f.tel : '');
      sel.appendChild(opt);
    });
  } catch(e) { _logErr("script.js", e); }
}

// Appeler initSelectFournisseurs quand m-bon-commande s'ouvre
var _openMOrig = openM;
openM = function(id) {
  _openMOrig(id);
  if (id === 'm-bon-commande') { initSelectFournisseurs(); calculerTotalBC(); }
  if (id === 'm-vente-rapide') {
    // Remplir le select produits de la première ligne
    var sels = document.querySelectorAll('#vr-lignes select');
    sels.forEach(function(sel) {
      if (sel.options.length <= 1 && typeof PRODS !== 'undefined') {
        PRODS.slice(0,80).forEach(function(p) {
          var opt = document.createElement('option');
          opt.value = p.prix; opt.setAttribute('data-nom', p.nom);
          opt.textContent = p.nom + ' — ' + p.prix.toLocaleString('fr-FR') + ' F';
          sel.appendChild(opt);
        });
      }
    });
  }
};

// ═══════════════════════════════════════════════════════
//  FONCTIONNALITÉS AJOUT — Pages sans gérant corrigées
// ═══════════════════════════════════════════════════════

// ── 1. BON DE COMMANDE FOURNISSEUR (Achats) ──
function ajouterLigneBonCommande() {
  var zone = document.getElementById('bc-lignes');
  if (!zone) return;
  var div = document.createElement('div');
  div.className = 'bc-ligne';
  div.style.cssText = 'display:grid;grid-template-columns:1fr 80px 80px auto;gap:6px;margin-bottom:6px';
  div.innerHTML = '<input type="text" placeholder="Produit" style="padding:8px;border:1.5px solid var(--br);border-radius:6px;font-size:13px">'
    + '<input type="number" placeholder="Qté" min="1" style="padding:8px;border:1.5px solid var(--br);border-radius:6px;font-size:13px">'
    + '<input type="number" placeholder="Prix" min="0" style="padding:8px;border:1.5px solid var(--br);border-radius:6px;font-size:13px">'
    + '<button onclick="this.parentElement.remove();calculerTotalBC()" style="background:#fee2e2;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;color:#CE1126;font-weight:700">X</button>';
  zone.appendChild(div);
}

function calculerTotalBC() {
  var lignes = document.querySelectorAll('.bc-ligne');
  var total = 0;
  lignes.forEach(function(l) {
    var inputs = l.querySelectorAll('input');
    var qty = parseFloat(inputs[1] ? inputs[1].value : 0) || 0;
    var prix = parseFloat(inputs[2] ? inputs[2].value : 0) || 0;
    total += qty * prix;
  });
  var el = document.getElementById('bc-total');
  if (el) el.textContent = 'Total estimé : ' + total.toLocaleString('fr-FR') + ' FCFA';
}

function creerBonCommande() {
  var four = (document.getElementById('bc-four') || {}).value || 'Fournisseur';
  var date = (document.getElementById('bc-date') || {}).value || '';
  var notes = (document.getElementById('bc-notes') || {}).value || '';
  var lignes = document.querySelectorAll('.bc-ligne');
  var items = [];
  var total = 0;
  lignes.forEach(function(l) {
    var inputs = l.querySelectorAll('input');
    var nom = inputs[0] ? inputs[0].value.trim() : '';
    var qty = parseFloat(inputs[1] ? inputs[1].value : 0) || 0;
    var prix = parseFloat(inputs[2] ? inputs[2].value : 0) || 0;
    if (nom && qty > 0) { items.push({ nom:nom, qty:qty, prix:prix }); total += qty*prix; }
  });
  if (items.length === 0) { toast('Ajoutez au moins un produit', 'warning'); return; }
  var id = 'BC-' + Date.now();
  var bc = { id:id, fournisseur:four, date:date, items:items, total:total, notes:notes,
             statut:'en_attente', cree_le:new Date().toLocaleDateString('fr-FR') };
  try {
    var bcs = JSON.parse(localStorage.getItem('sm_bons_commande') || '[]');
    bcs.unshift(bc); localStorage.setItem('sm_bons_commande', JSON.stringify(bcs));
  } catch(e) { _logErr("script.js", e); }
  closeM('m-bon-commande');
  toast('Bon de commande ' + id + ' créé — Total : ' + total.toLocaleString('fr-FR') + ' FCFA', 'success');
  addNotif('Nouveau bon de commande : ' + four + ' — ' + total.toLocaleString('fr-FR') + ' FCFA', 'green');
}

// ── 2. AJOUT PRODUIT AGRICULTURE ──
function ajouterProduitAgri() {
  var nom   = (document.getElementById('agri-p-nom')   || {}).value || '';
  var cat   = (document.getElementById('agri-p-cat')   || {}).value || 'Semences';
  var prix  = parseInt((document.getElementById('agri-p-prix')  || {}).value) || 0;
  var stock = parseInt((document.getElementById('agri-p-stock') || {}).value) || 0;
  var unite = (document.getElementById('agri-p-unite') || {}).value || 'kg';
  var desc  = (document.getElementById('agri-p-desc')  || {}).value || '';
  if (!nom)  { toast('Nom requis', 'warning'); return; }
  if (prix <= 0) { toast('Prix requis', 'warning'); return; }
  if (typeof AGRICULTURE_PRODUITS !== 'undefined') {
    var id = 'ap' + (AGRICULTURE_PRODUITS.length + 1);
    AGRICULTURE_PRODUITS.push({ id:id, nom:nom, cat:cat, prix:prix, stock:stock, unite:unite, desc:desc,
                                 img:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&h=120&fit=crop' });
    if (typeof renderCatalogueAgriculture === 'function') renderCatalogueAgri();
  }
  closeM('m-agri-produit');
  toast(nom + ' ajouté au catalogue agriculture !', 'success');
  ['agri-p-nom','agri-p-prix','agri-p-desc'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

// ── 3. COMMANDE AGRICULTURE MANUELLE ──
function creerCommandeAgriManuelle() {
  var client  = (document.getElementById('agri-cmd-client')  || {}).value || '';
  var tel     = (document.getElementById('agri-cmd-tel')     || {}).value || '';
  var items   = (document.getElementById('agri-cmd-items')   || {}).value || '';
  var total   = parseInt((document.getElementById('agri-cmd-total') || {}).value) || 0;
  var adresse = (document.getElementById('agri-cmd-adresse') || {}).value || '';
  if (!client) { toast('Nom client requis', 'warning'); return; }
  if (!tel)    { toast('Téléphone requis', 'warning'); return; }
  if (!items)  { toast('Décrivez les produits commandés', 'warning'); return; }
  var id = 'AGRI-' + String(Date.now()).slice(-4);
  var cmd = { id:id, client:client, tel:tel, items:items, total:total, adresse:adresse,
              statut:'recu', cree_le:new Date().toLocaleDateString('fr-FR') };
  if (typeof COMMANDES_AGRICULTURE !== 'undefined') {
    COMMANDES_AGRICULTURE.unshift(cmd);
    if (typeof saveAgriculture === 'function') saveAgriculture();
    if (typeof renderCommandesAgriculture === 'function') renderCommandesAgri();
  }
  closeM('m-agri-commande');
  toast('Commande ' + id + ' enregistrée !', 'success');
  addNotif('Commande agriculture : ' + client + ' — ' + items.substring(0,40), 'green');
  ['agri-cmd-client','agri-cmd-tel','agri-cmd-items','agri-cmd-adresse'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

// ── 4. AJOUT FOURNITURE ÉDUCATION ──
function ajouterFournitureEdu() {
  var nom   = (document.getElementById('edu-p-nom')   || {}).value || '';
  var cat   = (document.getElementById('edu-p-cat')   || {}).value || 'Papeterie';
  var prix  = parseInt((document.getElementById('edu-p-prix')  || {}).value) || 0;
  var stock = parseInt((document.getElementById('edu-p-stock') || {}).value) || 0;
  if (!nom)  { toast('Nom requis', 'warning'); return; }
  if (prix <= 0) { toast('Prix requis', 'warning'); return; }
  if (typeof EDUCATION_PRODUITS !== 'undefined') {
    var id = 'ed' + (EDUCATION_PRODUITS.length + 1);
    EDUCATION_PRODUITS.push({ id:id, nom:nom, cat:cat, prix:prix, stock:stock,
                               img:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&h=120&fit=crop' });
    if (typeof renderCatalogueEducation === 'function') renderCatalogueEducation();
  }
  closeM('m-edu-produit');
  toast(nom + ' ajouté au catalogue !', 'success');
  ['edu-p-nom','edu-p-prix','edu-p-stock'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

// ── 5. AJOUT COURS PARTICULIER ──
function ajouterCoursEdu() {
  var matiere    = (document.getElementById('edu-c-matiere')    || {}).value || '';
  var niveaux    = (document.getElementById('edu-c-niveaux')    || {}).value || 'Tous niveaux';
  var tarif      = parseInt((document.getElementById('edu-c-tarif') || {}).value) || 0;
  var enseignant = (document.getElementById('edu-c-enseignant') || {}).value || 'Enseignants diplômés';
  if (!matiere) { toast('Matière requise', 'warning'); return; }
  if (tarif <= 0) { toast('Tarif requis', 'warning'); return; }
  if (typeof COURS_PARTICULIERS !== 'undefined') {
    var id = 'cp' + (COURS_PARTICULIERS.length + 1);
    COURS_PARTICULIERS.push({ id:id, matiere:matiere, niveaux:niveaux, tarif_heure:tarif,
                               enseignant:enseignant, img:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&h=120&fit=crop', dispo:true });
    if (typeof renderCoursParticuliers === 'function') renderCoursParticuliers();
  }
  closeM('m-edu-cours');
  toast('Cours ' + matiere + ' ajouté !', 'success');
  ['edu-c-matiere','edu-c-niveaux','edu-c-enseignant'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

// ── 6. CODE INVITATION PERSONNALISÉ ──
function creerCodeCustom() {
  var code = ((document.getElementById('cc-code') || {}).value || '').trim().toUpperCase();
  var role = (document.getElementById('cc-role') || {}).value || 'Gérant(e)';
  var max  = parseInt((document.getElementById('cc-max') || {}).value) || 5;
  if (!code || code.length < 4) { toast('Code trop court (min 4 caractères)', 'warning'); return; }
  if (typeof CODES_INVITATION !== 'undefined') {
    var ex = CODES_INVITATION.find(function(c){ return c.code === code; });
    if (ex) { toast('Ce code existe déjà', 'error'); return; }
    CODES_INVITATION.push({ code:code, role:role, usages:0, maxUsages:max, actif:true,
                             cree: new Date().toLocaleDateString('fr-FR') });
    if (typeof saveCodesInvitation === 'function') saveCodesInvitation();
    if (typeof renderCodesInvitation === 'function') renderCodesInvitation();
  }
  closeM('m-code-custom');
  toast('Code ' + code + ' créé pour ' + role + ' !', 'success');
  if (navigator.clipboard) navigator.clipboard.writeText(code);
  var el = document.getElementById('cc-code'); if(el) el.value='';
}

// ── 7. AJOUT QUESTION FAQ ──
var FAQ_CUSTOM = (function() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_faq_custom') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch(e) { return []; }
})();
function ajouterFAQ() {
  var cat = (document.getElementById('faq-cat') || {}).value || 'general';
  var q   = (document.getElementById('faq-q')   || {}).value || '';
  var r   = (document.getElementById('faq-r')   || {}).value || '';
  if (!q) { toast('Question requise', 'warning'); return; }
  if (!r) { toast('Réponse requise', 'warning'); return; }
  FAQ_CUSTOM.push({ cat:cat, q:q, r:r, id:'faq_'+Date.now() });
  try { localStorage.setItem('sm_faq_custom', JSON.stringify(FAQ_CUSTOM)); } catch(e) { _logErr("script.js", e); }
  closeM('m-faq-ajout');
  if (typeof renderFaq === 'function') renderFaq();
  toast('Question ajoutée à la FAQ !', 'success');
  ['faq-q','faq-r'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

// ── 8. LIVRAISON MANUELLE ──
function creerLivraisonManuelle() {
  var client  = (document.getElementById('lm-client')  || {}).value || '';
  var tel     = (document.getElementById('lm-tel')     || {}).value || '';
  var adresse = (document.getElementById('lm-adresse') || {}).value || '';
  var ville   = (document.getElementById('lm-ville')   || {}).value || 'Cameroun';
  var total   = parseInt((document.getElementById('lm-total') || {}).value) || 0;
  var notes   = (document.getElementById('lm-notes')   || {}).value || '';
  if (!client)  { toast('Nom client requis', 'warning'); return; }
  if (!tel)     { toast('Téléphone requis', 'warning'); return; }
  if (!adresse) { toast('Adresse requise', 'warning'); return; }
  var cmd = { id:'MAN-' + Date.now(), client:client, tel:tel, adresse:adresse,
              ville:ville, total:total, notes:notes, statut:'en_attente',
              date: new Date().toLocaleDateString('fr-FR') };
  if (typeof creerLivraison === 'function') {
    creerLivraison(cmd).then(function(liv) {
      toast('Livraison ' + liv.id + ' créée !', 'success');
      renderLivraisons();
    });
  } else {
    toast('Livraison enregistrée localement', 'success');
  }
  closeM('m-livraison-manuelle');
  addNotif('Nouvelle livraison manuelle : ' + client + ' — ' + adresse, 'green');
  ['lm-client','lm-tel','lm-adresse','lm-ville','lm-notes'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}


// ═══════════════════════════════════════════════════════
//  CONFIGURATION DES IMAGES — URLs modifiables
// ═══════════════════════════════════════════════════════

var IMAGES_CONFIG = {
  'img-page-dashboard':           'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop',
  'img-page-supermarches':        'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&h=200&fit=crop',
  'img-page-produits':            'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=200&fit=crop',
  'img-page-achats':              'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=400&h=200&fit=crop',
  'img-page-commandes':           'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=400&h=200&fit=crop',
  'img-page-ventes':              'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
  'img-page-coiffure':            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=200&fit=crop/400/200',
  'img-page-pressing':            'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&h=200&fit=crop/400/200',
  'img-page-auto':                'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&h=200&fit=crop/400/200',
  'img-page-menuiserie':          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop',
  'img-page-meubles':             'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop',
  'img-page-resto':               'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop/400/200',
  'img-page-energie':             'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=200&fit=crop/400/200',
  'img-page-sante':               'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop/400/200',
  'img-page-btp':                 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=200&fit=crop/400/200',
  'img-page-agri':                'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=200&fit=crop/400/200',
  'img-page-logistique':          'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=120&h=120&fit=crop/400/200',
  'img-page-edu':                 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=120&fit=crop/400/200',
  'img-page-immo':                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=240&fit=crop/400/200',
  'img-page-devis':               'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop',
  'img-page-abo':                 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=200&fit=crop/400/200',
  'img-page-inv':                 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=200&fit=crop',
  'img-page-emp':                 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=200&fit=crop',
  'img-page-four':                'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=200&fit=crop',
  'img-page-rapports':            'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&h=200&fit=crop',
  'img-page-ia':                  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&h=200&fit=crop',
  'img-page-reseaux':             'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=200&fit=crop',
  'img-page-livraison':           'https://images.unsplash.com/photo-1525480122447-64809d765ec4?w=400&h=200&fit=crop',
  'img-page-conf':                'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&h=200&fit=crop',
  'img-page-faq':                 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop',
  'img-page-params':              'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400&h=200&fit=crop',
  'img-page-livraisons-admin':    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=200&fit=crop/400/200',
  'img-page-livreurs':            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop/400/200',
  'img-page-livraisons-livreur':  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop/400/200',
  'img-page-promotions':          'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop/400/200',
  'img-page-fidelite':            'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop/400/200',
  'img-page-utilisateurs':        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop/400/200',
  'img-page-retours':             'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=200&fit=crop/400/200',
  'img-page-stats':               'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop/400/200',
  'img-page-vue-coiffeur':        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=200&fit=crop/400/200',
  'img-page-vue-blanchisseur':    'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&h=200&fit=crop/400/200',
  'img-page-vue-meca':            'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&h=200&fit=crop/400/200',
  'img-page-vue-menuisier':       'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=200&fit=crop/400/200',
  'img-page-vue-resto':           'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop/400/200',
};

function initImagesConfig() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_images_config') || 'null');
    if (saved) IMAGES_CONFIG = Object.assign(IMAGES_CONFIG, saved);
  } catch(e) { _logErr("script.js", e); }
  // Appliquer toutes les URLs sauvegardées
  Object.keys(IMAGES_CONFIG).forEach(function(imgId) {
    var el = document.getElementById(imgId);
    if (el) el.src = IMAGES_CONFIG[imgId];
  });
}

function modifierImagePage(imgId) {
  // Seul l'admin peut modifier les images
  if (!currentUser || currentUser.role !== 'administrateur') return;
  var currentUrl = IMAGES_CONFIG[imgId] || '';
  var newUrl = prompt('URL de la nouvelle image (400x200 recommandé) :', currentUrl);
  if (!newUrl || newUrl === currentUrl) return;
  
  // Valider l'URL
  if (!newUrl.startsWith('http')) {
    toast('URL invalide — doit commencer par http', 'error');
    return;
  }
  
  // Mettre à jour
  IMAGES_CONFIG[imgId] = newUrl;
  var el = document.getElementById(imgId);
  if (el) el.src = newUrl;
  
  // Sauvegarder
  try { localStorage.setItem('sm_images_config', JSON.stringify(IMAGES_CONFIG)); } catch(e) { _logErr("script.js", e); }
  toast('Image mise à jour !', 'success');
}

function exporterConfigImages() {
  var data = JSON.stringify(IMAGES_CONFIG, null, 2);
  var blob = new Blob([data], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'kamer360-images.json';
  a.click();
}

// ═══════════════════════════════════════════════════════
//  FIX — Chargement page Achats avec supermarchés
// ═══════════════════════════════════════════════════════
async function _chargerEtAfficherAchats() {
  // 1. D'abord essayer depuis localStorage
  try {
    var saved = JSON.parse(localStorage.getItem('sm_stores') || 'null');
    if (saved && Array.isArray(saved) && saved.length > 0) {
      STORES = saved;
    }
  } catch(e) { _logErr("script.js", e); }

  // 2. Toujours essayer Supabase pour avoir les données fraîches
  try {
    var sb = _sbMain();
    if (sb) {
      var res = await sb.from('supermarchés').select('*');
      if (!res.error && res.data && res.data.length > 0) {
        STORES = res.data;
        try { localStorage.setItem('sm_stores', JSON.stringify(STORES)); } catch(e2) { _logErr("script.js", e2); }
      }
    }
  } catch(e) { _logErr("script.js", e); }

  // 3. Si toujours vide, chercher dans localStorage 'sm_data'
  if (!STORES || STORES.length === 0) {
    try {
      var d = JSON.parse(localStorage.getItem('sm_data') || 'null');
      if (d && d.stores) STORES = d.stores;
    } catch(e) { _logErr("script.js", e); }
  }

  // 4. Remplir le select et afficher les produits
  if (typeof remplirSelectSM === 'function') remplirSelectSM();
  if (typeof renderCatParSM  === 'function') renderCatParSM();

  // 5. Afficher un message si aucun supermarché
  if (!STORES || STORES.length === 0) {
    var sel = document.getElementById('f-sm');
    if (sel) {
      sel.innerHTML = '<option value="">Aucun supermarché — Ajoutez-en dans "Supermarchés"</option>';
    }
    var grid = document.getElementById('agrid');
    if (grid) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#999">'
        + '<div style="font-size:48px;margin-bottom:12px">🏪</div>'
        + '<h3 style="margin-bottom:8px">Aucun supermarché enregistré</h3>'
        + '<p>Allez dans <strong>Supermarchés</strong> pour ajouter votre premier supermarché,<br>'
        + 'puis ajoutez des produits pour qu\'ils apparaissent ici.</p>'
        + '</div>';
    }
  }
}

function toggleCarteLivraisons() {
  var z = document.getElementById('carte-livraisons-container');
  if (!z) return;
  if (z.style.display === 'none' || !z.style.display) {
    z.style.display = 'block';
    if (typeof initCarteLivraisons === 'function') initCarteLivraisons();
  } else {
    z.style.display = 'none';
  }
}

// Bouton impression reçu depuis la liste des commandes
function imprimerRecuCmd(id) {
  var cmd = (typeof CMDS !== 'undefined') ? CMDS.find(function(c){ return c.id === id; }) : null;
  if (!cmd) { toast('Commande non trouvée', 'error'); return; }
  if (typeof genererRecuCommande === 'function') {
    genererRecuCommande(cmd);
  } else {
    toast('Module PDF non chargé', 'warning');
  }
}

// Imprimer le ticket de la dernière vente
function imprimerDernierTicket() {
  var ventes = typeof VENTES !== 'undefined' ? VENTES : [];
  if (!ventes.length) { toast('Aucune vente à imprimer', 'warning'); return; }
  var derniere = ventes[0];
  if (typeof imprimerTicketVente === 'function') {
    imprimerTicketVente(derniere);
  }
}

// Ajouter bouton impression après chaque vente confirmée
var _origValiderVente = typeof validerVente !== 'undefined' ? validerVente : null;

function reinitFiltresImmo() {
  ['immo-search','immo-budget-min','immo-budget-max'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value='';
  });
  ['immo-type-filtre','immo-ville-filtre','immo-chambres-filtre','immo-statut-filtre'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.selectedIndex=0;
  });
  var fav = document.getElementById('immo-favoris-only');
  if(fav) fav.checked = false;
  if(typeof renderCatalogueImmo === 'function') renderCatalogueImmo();
}


// ─── Sync clients boutique → dashboard (cross-tab) ───────────
window.addEventListener('storage', function(e) {
  if (e.key === 'sm_nouveau_client' && e.newValue) {
    try {
      var info = JSON.parse(e.newValue);
      setTimeout(function() {
        var cl = [];
        try { cl = JSON.parse(localStorage.getItem('sm_clients') || '[]'); } catch(err) { _logErr("script.js", err); }
        if (typeof setDash === 'function') {
          setDash('dash-clients', cl.length);
          setDash('dash-clients-sub', cl.length + ' inscrits boutique');
        }
        if (typeof addNotif === 'function' && info.nom) {
          addNotif('🧑 Nouveau client : ' + info.nom, 'blue');
        }
      }, 300);
    } catch(err) { _logErr("script.js", err); }
  }
  if (e.key === 'sm_clients' && e.newValue) {
    var cl = [];
    try { cl = JSON.parse(e.newValue || '[]'); } catch(err) { _logErr("script.js", err); }
    if (typeof setDash === 'function' && cl.length > 0) {
      setDash('dash-clients', cl.length);
      setDash('dash-clients-sub', cl.length + ' inscrits boutique');
    }
  }
});

// ═══════════════════════════════════════════════════════
//  REMPLACEMENT D'IMAGES SERVICES — URL personnalisée
// ═══════════════════════════════════════════════════════
function modifierImageService(elemId, callback) {
  var url = prompt('Entrez l\'URL de la nouvelle image:', 'https://images.unsplash.com/photo-...');
  if (!url || !url.startsWith('http')) { toast('URL invalide', 'error'); return; }
  var el = document.getElementById(elemId);
  if (el) {
    el.src = url;
    el.onerror = function() {
      toast('Image introuvable — vérifiez l\'URL', 'error');
      el.src = el.dataset.original || el.src;
    };
    el.dataset.custom = url;
    toast('Image mise à jour !', 'success');
    if (callback) callback(url);
  }
}

// Rendre toutes les images cliquables pour modification (appel dans initPage*)
function rendreImagesModifiables(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('img[data-editable]').forEach(function(img) {
    img.style.cursor = 'pointer';
    img.title = 'Cliquer pour changer l\'image';
    img.onclick = function() {
      var url = prompt('URL de la nouvelle image:', this.src);
      if (url && url.startsWith('http')) {
        this.src = url;
        this.dataset.custom = url;
        toast('Image mise à jour !', 'success');
      }
    };
  });
}

// ═══════════════════════════════════════════════════════
//  QR CODE INSTALLATION PWA
//  Génère un QR code pour installer l'application
// ═══════════════════════════════════════════════════════

var _qrInstance = null;
var _qrGrandInstance = null;
// Auto-détection : utilise le domaine réel d'où l'app est servie, plutôt qu'une URL figée
function _detecterUrlBoutique() {
  try {
    var origin = window.location.origin; // ex: https://mon-vrai-domaine.vercel.app
    var dossier = window.location.pathname.replace(/[^/]*$/, ''); // dossier courant
    return origin + dossier + 'boutique.html';
  } catch(e) {
    return 'https://kamer360.vercel.app/boutique.html'; // fallback si jamais
  }
}
var _qrCurrentUrl = _detecterUrlBoutique();

function initQRCode() {
  var container = document.getElementById('qr-install-container');
  if (!container) return;

  // Lire l'URL personnalisée si déjà saisie, sinon utiliser l'URL auto-détectée
  var input = document.getElementById('qr-url-input');
  if (input) {
    if (!input.value || input.value.includes('kamer360.vercel.app')) {
      input.value = _qrCurrentUrl; // corriger automatiquement l'ancienne valeur figée
    } else {
      _qrCurrentUrl = input.value;
    }
  }

  // Vider et régénérer
  container.innerHTML = '';

  if (typeof QRCode === 'undefined') {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:#999;font-size:12px">Chargement QR...</div>';
    return;
  }

  try {
    _qrInstance = new QRCode(container, {
      text: _qrCurrentUrl,
      width: 200,
      height: 200,
      colorDark: '#007A3D',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
    console.log('[QR] Généré pour:', _qrCurrentUrl);
  } catch(e) {
    console.warn('[QR] Erreur:', e);
    container.innerHTML = '<div style="padding:20px;color:#CE1126;font-size:12px">Erreur génération QR</div>';
  }
}

function regenererQR() {
  var input = document.getElementById('qr-url-input');
  if (!input) return;
  var url = input.value.trim();
  if (!url || !url.startsWith('http')) return;
  _qrCurrentUrl = url;

  // Mettre à jour le petit QR
  var container = document.getElementById('qr-install-container');
  if (container && typeof QRCode !== 'undefined') {
    container.innerHTML = '';
    _qrInstance = new QRCode(container, {
      text: url, width: 200, height: 200,
      colorDark: '#007A3D', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  // Mettre à jour le grand QR si le modal est ouvert
  var grandContainer = document.getElementById('qr-grand-container');
  if (grandContainer && grandContainer.innerHTML !== '') {
    grandContainer.innerHTML = '';
    _qrGrandInstance = new QRCode(grandContainer, {
      text: url, width: 280, height: 280,
      colorDark: '#007A3D', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  // Mettre à jour l'affichage URL
  var urlDisplay = document.getElementById('qr-url-display');
  if (urlDisplay) urlDisplay.textContent = url;

  toast('QR Code mis à jour !', 'success');
}

function ouvrirModalQRGrand() {
  var grandContainer = document.getElementById('qr-grand-container');
  if (!grandContainer) { openM('m-qr-grand'); return; }

  grandContainer.innerHTML = '';
  var url = _qrCurrentUrl;
  var input = document.getElementById('qr-url-input');
  if (input && input.value.startsWith('http')) url = input.value.trim();

  if (typeof QRCode !== 'undefined') {
    _qrGrandInstance = new QRCode(grandContainer, {
      text: url, width: 280, height: 280,
      colorDark: '#007A3D', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  var urlDisplay = document.getElementById('qr-url-display');
  if (urlDisplay) urlDisplay.textContent = url;

  openM('m-qr-grand');
}

function telechargerQR() {
  // Trouver le canvas ou img généré par QRCode.js
  var container = document.getElementById('qr-install-container');
  var grandContainer = document.getElementById('qr-grand-container');
  var source = grandContainer && grandContainer.querySelector('canvas') ? grandContainer : container;

  var canvas = source ? source.querySelector('canvas') : null;
  if (!canvas) {
    // QRCode.js génère parfois une img — convertir en canvas
    var img = source ? source.querySelector('img') : null;
    if (img) {
      var tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = 300; tmpCanvas.height = 300;
      var ctx = tmpCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 10, 10, 280, 280);
      canvas = tmpCanvas;
    }
  }

  if (!canvas) {
    toast('QR Code non disponible — rechargez la page', 'error');
    return;
  }

  // Créer une version avec titre et logo
  var finalCanvas = document.createElement('canvas');
  finalCanvas.width = 360;
  finalCanvas.height = 460;
  var ctx = finalCanvas.getContext('2d');

  // Fond blanc
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 360, 460);

  // Bandeau vert en haut
  ctx.fillStyle = '#007A3D';
  ctx.fillRect(0, 0, 360, 70);

  // Titre
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('KAMER360', 180, 30);
  ctx.font = '13px Arial';
  ctx.fillText('Scannez pour installer gratuitement', 180, 52);

  // QR Code au centre
  ctx.drawImage(canvas, 40, 80, 280, 280);

  // Bordure verte autour du QR
  ctx.strokeStyle = '#007A3D';
  ctx.lineWidth = 3;
  ctx.strokeRect(37, 77, 286, 286);

  // Instructions en bas
  ctx.fillStyle = '#333333';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('1️⃣ Scanner  →  2️⃣ Ouvrir dans Chrome  →  3️⃣ Installer', 180, 390);

  ctx.fillStyle = '#007A3D';
  ctx.font = 'bold 11px Arial';
  ctx.fillText(_qrCurrentUrl, 180, 415);

  ctx.fillStyle = '#999999';
  ctx.font = '10px Arial';
  ctx.fillText('Application gratuite — Sans App Store', 180, 445);

  // Télécharger
  var link = document.createElement('a');
  link.download = 'kamer360-qr-code.png';
  link.href = finalCanvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast('QR Code téléchargé avec succès !', 'success');
}

function imprimerQR() {
  // Ouvrir une fenêtre dédiée pour l'impression avec le QR code en grande taille
  var url = _qrCurrentUrl;
  var input = document.getElementById('qr-url-input');
  if (input && input.value.startsWith('http')) url = input.value.trim();

  var printWin = window.open('', '_blank', 'width=800,height=900');
  printWin.document.write(`
    <!DOCTYPE html><html><head>
    <title>KAMER360 — QR Code d'installation</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
    <style>
      * { margin:0;padding:0;box-sizing:border-box; }
      body { font-family:Arial,sans-serif;background:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px; }
      .affiche { width:420px;border:3px solid #007A3D;border-radius:16px;overflow:hidden;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,.15); }
      .hdr { background:#007A3D;color:#fff;padding:20px; }
      .hdr h1 { font-size:26px;margin-bottom:6px; }
      .hdr p  { font-size:13px;opacity:.85; }
      .body { padding:28px 24px; }
      .qr-wrap { display:inline-block;padding:14px;border:2px solid #007A3D;border-radius:12px;margin-bottom:20px; }
      .steps { background:#f0faf5;border-radius:10px;padding:14px;text-align:left;margin-bottom:16px; }
      .steps h3 { color:#007A3D;font-size:13px;margin-bottom:8px; }
      .steps li { font-size:13px;color:#333;line-height:2;list-style:none; }
      .url { font-size:11px;color:#666;font-family:monospace;margin-bottom:6px;word-break:break-all; }
      .free { background:#007A3D;color:#fff;padding:8px 20px;border-radius:20px;font-size:14px;font-weight:700;display:inline-block; }
      .ftr { border-top:1px solid #e5e7eb;padding:12px;font-size:10px;color:#999; }
      @media print { body { padding:0; } .affiche { box-shadow:none; } button { display:none; } }
    </style></head><body>
    <div class="affiche">
      <div class="hdr">
        <h1>📲 KAMER360</h1>
        <p>Installez notre application gratuitement</p>
      </div>
      <div class="body">
        <div class="qr-wrap"><div id="qr-print"></div></div>
        <div class="steps">
          <h3>Comment installer :</h3>
          <ul>
            <li>1️⃣ Scanner ce QR code</li>
            <li>2️⃣ Ouvrir dans Chrome ou Safari</li>
            <li>3️⃣ Appuyer sur "Ajouter à l'écran d'accueil"</li>
          </ul>
        </div>
        <div class="url">${url}</div>
        <div class="free">✅ 100% Gratuit — Sans App Store</div>
      </div>
      <div class="ftr">Powered by KAMER360 — Cameroun 🇨🇲</div>
    </div>
    <script>
      window.onload = function() {
        new QRCode(document.getElementById('qr-print'), {
          text: '${url}', width: 260, height: 260,
          colorDark: '#007A3D', colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
        setTimeout(function(){ window.print(); }, 800);
      };
    <\/script>
    </body></html>
  `);
  printWin.document.close();
}

// ═══════════════════════════════════════════════════════════════
//  SIGNAUX MARKETPLACE — Sync espace gérant → boutique client
//  Quand le gérant modifie les données, la marketplace se met à
//  jour automatiquement via localStorage cross-tab
// ═══════════════════════════════════════════════════════════════
function signalerMajMarketplace(section) {
  try {
    localStorage.setItem('sm_' + section + '_updated', Date.now().toString());
    setTimeout(function() {
      localStorage.removeItem('sm_' + section + '_updated');
    }, 1000);
  } catch(e) { _logErr("script.js", e); }
}

// ── Gestion Marketplace — onglets internes ──────────────────────
// NB: la version complète est dans marketplace-data.js (chargé avant)
// Cette fonction est intentionnellement supprimée pour éviter l'écrasement


// ══════════════════════════════════════════════════════════════
//  MOTEUR DE RECHERCHE — VILLES DU CAMEROUN
// ══════════════════════════════════════════════════════════════
var VILLES_CM = [
  // Littoral
  'Douala','Nkongsamba','Edéa','Loum','Mbanga','Yabassi','Manjo','Dizangué','Pouma',
  // Centre
  'Yaoundé','Bafia','Mbalmayo','Obala','Nanga Eboko','Esse','Monatélé','Mfou','Akonolinga','Ntui','Soa',
  // Ouest
  'Bafoussam','Dschang','Foumban','Mbouda','Bangangté','Bandjoun','Foumbot','Bafang','Kékem','Tonga',
  // Littoral banlieues Douala
  'Bonabéri','Bassa','Akwa','Bonanjo','Deïdo','Ndokotti','Makepe','Logbaba','Pk8','Pk10','Pk12','Pk14','Pk19',
  // Banlieues Yaoundé
  'Melen','Ngousso','Nkolbisson','Tsinga','Essos','Bastos','Mfandena','Emana','Nkolondom','Ahala','Biyem-Assi','Mvog-Ada','Mendong',
  // Nord
  'Garoua','Ngaoundéré','Maroua','Guider','Lagdo','Figuil','Rey Bouba','Tchollire',
  // Adamaoua
  'Ngaoundéré','Meiganga','Tibati','Banyo','Tignère',
  // Nord-Ouest
  'Bamenda','Kumbo','Wum','Fundong','Mbengwi','Batibo','Ndop','Bali',
  // Sud-Ouest
  'Buea','Limbe','Kumba','Mamfe','Mundemba','Tiko','Muyuka',
  // Sud
  'Ebolowa','Kribi','Sangmélima','Ambam','Mvangué','Lolodorf',
  // Est
  'Bertoua','Abong-Mbang','Batouri','Yokadouma','Bétaré Oya','Doumé',
  // Extrême-Nord
  'Maroua','Kousséri','Mora','Yagoua','Kousseri','Mokolo','Kaélé','Meri',
  // Villes secondaires populaires
  'Mbalmayo','Eséka','Bélabo','Melong','Wouri','Bonabéri',
];

function filtrerVillesCM(inputId, listId, hiddenId) {
  var inp  = document.getElementById(inputId);
  var list = document.getElementById(listId);
  var hid  = document.getElementById(hiddenId);
  if (!inp || !list) return;
  var q = inp.value.trim().toLowerCase();
  var filtrees = q.length === 0 ? VILLES_CM.slice(0,30) : VILLES_CM.filter(function(v){ return v.toLowerCase().indexOf(q) !== -1; });
  if (filtrees.length === 0) { list.style.display = 'none'; if (hid) hid.value = inp.value; return; }
  list.style.display = 'block';
  var html = '';
  filtrees.forEach(function(v) {
    html += '<div style="padding:9px 14px;cursor:pointer;font-size:13px;border-bottom:1px solid #f0f0f0" '
          + 'onmouseover="this.style.background=\'#f0faf5\'" onmouseout="this.style.background=\'#fff\'" '
          + 'onmousedown="choisirVilleCM(\'' + inputId + '\',\'' + listId + '\',\'' + hiddenId + '\',this.getAttribute(\'data-v\'))" '
          + 'data-v="' + v + '">' + v + '</div>';
  });
  list.innerHTML = html;
}

function choisirVilleCM(inputId, listId, hiddenId, ville) {
  var inp  = document.getElementById(inputId);
  var list = document.getElementById(listId);
  var hid  = document.getElementById(hiddenId);
  if (inp)  inp.value  = ville;
  if (hid)  hid.value  = ville;
  if (list) list.style.display = 'none';
}

// ══════════════════════════════════════════════════════════════
//  SYSTÈME SUPPORT CLIENT
// ══════════════════════════════════════════════════════════════

function ouvrirSupportModal() {
  // Pré-remplir avec les infos du gérant connecté si disponible
  try {
    var user = JSON.parse(localStorage.getItem('sm_user') || '{}');
    var nomEl = document.getElementById('sup-nom');
    var telEl = document.getElementById('sup-tel');
    if (nomEl && user.prenom) nomEl.value = (user.prenom + ' ' + (user.nom || '')).trim();
    if (telEl && user.telephone) telEl.value = user.telephone;
  } catch(e) { _logErr("script.js", e); }

  // Configurer les boutons WhatsApp et Tel avec le bon numéro support
  var waNum = (SM_CONFIG && SM_CONFIG.whatsapp && SM_CONFIG.whatsapp.numero) ? SM_CONFIG.whatsapp.numero : '237693591479';
  var telNum = (SM_CONFIG && SM_CONFIG.boutique && SM_CONFIG.boutique.telephone) ? SM_CONFIG.boutique.telephone : '+237683392268';
  var waBtn = document.getElementById('support-wa-btn');
  var telBtn = document.getElementById('support-tel-btn');
  var waMsg = encodeURIComponent('Bonjour, je souhaite contacter le support KAMER360.');
  if (waBtn) waBtn.href = 'https://wa.me/' + waNum + '?text=' + waMsg;
  if (telBtn) telBtn.href = 'tel:' + telNum;

  openM('m-support');
}

function envoyerMessageSupport() {
  var nom     = (document.getElementById('sup-nom')     || {}).value || '';
  var tel     = (document.getElementById('sup-tel')     || {}).value || '';
  var sujet   = (document.getElementById('sup-sujet')   || {}).value || '';
  var message = (document.getElementById('sup-message') || {}).value || '';

  if (!message.trim()) { toast('Veuillez écrire un message', 'warning'); return; }

  var waNum = (SM_CONFIG && SM_CONFIG.whatsapp && SM_CONFIG.whatsapp.numero) ? SM_CONFIG.whatsapp.numero : '237693591479';

  var txt = '🆘 *Demande de support KAMER360*\n\n';
  if (nom)     txt += '👤 *Nom :* ' + nom + '\n';
  if (tel)     txt += '📞 *Tel :* ' + tel + '\n';
  if (sujet)   txt += '📋 *Sujet :* ' + sujet + '\n';
  txt += '\n💬 *Message :*\n' + message;
  txt += '\n\n_Envoyé depuis KAMER360 — ' + new Date().toLocaleString('fr-FR') + '_';

  var waUrl = 'https://wa.me/' + waNum + '?text=' + encodeURIComponent(txt);
  window.open(waUrl, '_blank');
  closeM('m-support');
  toast('Message ouvert dans WhatsApp — envoyez-le pour contacter le support', 'success');

  // Réinitialiser le formulaire
  ['sup-nom','sup-tel','sup-message'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  var sel = document.getElementById('sup-sujet');
  if (sel) sel.value = '';
}

// ── Envoi SMS via backend Railway ──
async function envoyerSMS(telephone, message) {
  try {
    var backendUrl = 'https://kamer360-backend-production.up.railway.app';
    if (typeof SM_CONFIG !== 'undefined' && SM_CONFIG.backend) {
      backendUrl = typeof SM_CONFIG.backend === 'string' ? SM_CONFIG.backend : (SM_CONFIG.backend.url || backendUrl);
    }
    var res = await fetch(backendUrl + '/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: telephone, message: message })
    });
    var data = await res.json();
    return data.success === true;
  } catch(e) { _logErr('envoyerSMS', e); return false; }
}

// ══════════════════════════════════════════════════════════════
//  NOTIFICATIONS PUSH — abonnement côté gérant
// ══════════════════════════════════════════════════════════════
async function activerNotificationsPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    toast('Notifications push non supportées sur ce navigateur', 'warning');
    return;
  }

  try {
    var permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast('Permission refusée — activez les notifications dans les réglages du navigateur', 'warning');
      return;
    }

    var backendUrl = (typeof SM_CONFIG !== 'undefined' && SM_CONFIG.backend)
      ? (typeof SM_CONFIG.backend === 'string' ? SM_CONFIG.backend : SM_CONFIG.backend.url)
      : 'https://kamer360-backend-production.up.railway.app';

    var keyRes = await fetch(backendUrl + '/api/push/vapid-public-key');
    var keyData = await keyRes.json();
    if (!keyData.publicKey) {
      toast('Service de notifications non configuré', 'error');
      return;
    }

    var reg = await navigator.serviceWorker.ready;
    var subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: _urlBase64ToUint8Array(keyData.publicKey)
    });

    var user = JSON.parse(localStorage.getItem('sm_user') || '{}');
    await fetch(backendUrl + '/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: subscription, gerant_email: user.email })
    });

    toast('Notifications activées ! Vous recevrez une alerte à chaque commande.', 'success');
    localStorage.setItem('kamer360_push_active', '1');
  } catch(e) {
    _logErr('activerNotificationsPush', e);
    toast('Erreur lors de l\u2019activation des notifications', 'error');
  }
}

function _urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);
  for (var i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

// ══════════════════════════════════════════════════════════════
//  SUPABASE REALTIME — mise à jour live des commandes
// ══════════════════════════════════════════════════════════════
var _realtimeChannel = null;

function activerRealtimeCommandes() {
  try {
    var sb = typeof _sbMain === 'function' ? _sbMain() : null;
    if (!sb) { console.warn('[Realtime] Supabase non disponible'); return; }

    if (_realtimeChannel) {
      sb.removeChannel(_realtimeChannel);
    }

    _realtimeChannel = sb
      .channel('commandes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commandes' }, function(payload) {
        if (payload.eventType === 'INSERT') {
          CMDS.unshift(payload.new);
          if (typeof toast === 'function') toast('🛒 Nouvelle commande reçue : ' + (payload.new.client_nom || ''), 'success');
          if (typeof playNotifSound === 'function') playNotifSound();
        } else if (payload.eventType === 'UPDATE') {
          var idx = CMDS.findIndex(function(c) { return c.id === payload.new.id; });
          if (idx >= 0) CMDS[idx] = payload.new;
        } else if (payload.eventType === 'DELETE') {
          CMDS = CMDS.filter(function(c) { return c.id !== payload.old.id; });
        }
        // Rafraîchir l'affichage si la page commandes est active
        var page = document.getElementById('page-commandes');
        if (page && page.classList.contains('active') && typeof renderCmds === 'function') {
          renderCmds();
        }
        if (typeof updateDashboardStats === 'function') updateDashboardStats();
      })
      .subscribe();

    console.log('[Realtime] Abonnement actif sur la table commandes');
  } catch(e) { _logErr('activerRealtimeCommandes', e); }
}

// Démarrer l'écoute temps réel après connexion réussie
setTimeout(function() {
  if (typeof currentUser !== 'undefined' && currentUser) activerRealtimeCommandes();
}, 2000);
