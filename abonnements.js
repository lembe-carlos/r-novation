// ═══════════════════════════════════════════════════════
//  SuperMarché CM — abonnements.js
//  4 Plans : Starter / Pro / Business / Super Business
// ═══════════════════════════════════════════════════════

// ── Pages par plan ──
// Pages communes à TOUS les plans (sans abonnement requis)
var PAGES_LIBRES = [
  'dashboard', 'livraison', 'confidentialite', 'faq',
  'livraisons-livreur' // livreur — gratuit
];

// Pages gratuites pour caissier (pas d'abonnement)
var PAGES_CAISSIER_LIBRE = [
  'dashboard', 'ventes', 'achats', 'commandes', 'produits',
  'livraison', 'confidentialite', 'faq', 'parametres'
];

// ── Pages par plan ──
var PAGES_PAR_PLAN = {

  // STARTER — Gestion de base
  starter: [
    'dashboard', 'supermarches', 'produits', 'achats',
    'commandes', 'ventes', 'employes', 'fournisseurs',
    'livraison', 'confidentialite', 'faq', 'parametres',
    'livraisons-admin', 'livreurs', 'livraisons-livreur', 'retours'
  ],

  // PRO — + Services artisanaux (coiffure, pressing, auto, menuiserie, décoration, éducation)
  pro: [
    'dashboard', 'supermarches', 'produits', 'achats',
    'commandes', 'ventes', 'employes', 'fournisseurs',
    'livraison', 'confidentialite', 'faq', 'parametres',
    'livraisons-admin', 'livreurs', 'livraisons-livreur',
    'retours', 'rapports', 'stats-clients', 'fidelite', 'promotions', 'ia',
    'coiffure', 'pressing', 'automobile',
    'menuiserie', 'meubles', 'education',
    'vue-coiffeur', 'vue-blanchisseur', 'vue-mecanicien', 'vue-menuisier'
  ],

  // BUSINESS — + Secteurs lourds (restauration, santé, BTP, énergie, agriculture)
  business: [
    'dashboard', 'supermarches', 'produits', 'achats',
    'commandes', 'ventes', 'employes', 'fournisseurs',
    'livraison', 'confidentialite', 'faq', 'parametres',
    'livraisons-admin', 'livreurs', 'livraisons-livreur',
    'retours', 'rapports', 'stats-clients', 'fidelite', 'promotions', 'ia', 'reseaux',
    'coiffure', 'pressing', 'automobile', 'menuiserie', 'meubles', 'education',
    'vue-coiffeur', 'vue-blanchisseur', 'vue-mecanicien', 'vue-menuisier',
    'restauration', 'sante', 'btp', 'energie', 'agriculture',
    'vue-restaurateur', 'vue-docteur', 'vue-ingenieur-btp', 'vue-electricien', 'vue-agricole'
  ],

  // SUPER BUSINESS — Tout inclus (logistique, immobilier, multi-gérants)
  super_business: [
    'dashboard', 'supermarches', 'produits', 'achats',
    'commandes', 'ventes', 'employes', 'fournisseurs',
    'livraison', 'confidentialite', 'faq', 'parametres',
    'livraisons-admin', 'livreurs', 'livraisons-livreur',
    'retours', 'rapports', 'stats-clients', 'fidelite', 'promotions', 'ia', 'reseaux',
    'utilisateurs', 'invitations', 'abonnements',
    'coiffure', 'pressing', 'automobile', 'menuiserie', 'meubles', 'education',
    'vue-coiffeur', 'vue-blanchisseur', 'vue-mecanicien', 'vue-menuisier',
    'restauration', 'sante', 'btp', 'energie', 'agriculture',
    'vue-restaurateur', 'vue-docteur', 'vue-ingenieur-btp', 'vue-electricien', 'vue-agricole',
    'logistique', 'immobilier',
    'vue-logisticien', 'vue-libraire', 'vue-immobilier'
  ]
};

// ── Pages par rôle métier (gérants spécialisés avec abonnement) ──
var PAGES_PAR_ROLE = {
  'gerant':           null,    // Plan abonnement requis → PAGES_PAR_PLAN
  'coiffeur':         ['dashboard', 'coiffure', 'vue-coiffeur', 'livraison', 'faq', 'parametres'],
  'blanchisseur':     ['dashboard', 'pressing', 'vue-blanchisseur', 'livraison', 'faq', 'parametres'],
  'mecanicien':       ['dashboard', 'automobile', 'vue-mecanicien', 'livraison', 'faq', 'parametres'],
  'menuisier':        ['dashboard', 'menuiserie', 'meubles', 'vue-menuisier', 'livraison', 'faq', 'parametres'],
  'decorateur':       ['dashboard', 'meubles', 'livraison', 'faq', 'parametres'],
  'libraire':         ['dashboard', 'education', 'livraison', 'faq', 'parametres'],
  'restaurateur':     ['dashboard', 'restauration', 'vue-restaurateur', 'livraison', 'faq', 'parametres'],
  'docteur':          ['dashboard', 'sante', 'vue-docteur', 'livraison', 'faq', 'parametres'],
  'ingenieur_btp':    ['dashboard', 'btp', 'vue-ingenieur-btp', 'livraison', 'faq', 'parametres'],
  'electricien':      ['dashboard', 'energie', 'vue-electricien', 'livraison', 'faq', 'parametres'],
  'ingenieur_agricole':['dashboard', 'agriculture', 'vue-agricole', 'livraison', 'faq', 'parametres'],
  'logisticien':      ['dashboard', 'logistique', 'vue-logisticien', 'livraison', 'faq', 'parametres'],
  'immobilier':       ['dashboard', 'immobilier', 'vue-immobilier', 'livraison', 'faq', 'parametres'],
  // Gratuits — pas d'abonnement
  'caissier':         ['dashboard', 'ventes', 'achats', 'commandes', 'produits', 'livraison', 'faq', 'parametres'],
  'livreur':          ['dashboard', 'livraisons-livreur', 'livraison', 'faq'],
};

// Rôles exemptés d'abonnement
var ROLES_GRATUITS = ['caissier', 'livreur', 'administrateur'];
// Rôles métier qui paient un abonnement
var ROLES_AVEC_ABONNEMENT = [
  'coiffeur', 'blanchisseur', 'mecanicien', 'menuisier', 'decorateur',
  'libraire', 'restaurateur', 'docteur', 'ingenieur_btp', 'electricien',
  'ingenieur_agricole', 'logisticien', 'immobilier', 'gerant'
];

// ── Définition des 4 plans ──
var PLANS_ABONNEMENT = [
  {
    id: 'starter',
    nom: 'Starter',
    prix: 5000,
    couleur: '#3b82f6',
    badge: 'Démarrage',
    description: 'Idéal pour un petit commerce',
    fonctionnalites: [
      '1 supermarché',
      "Jusqu'à 100 produits",
      'Commandes & ventes',
      'Gestion employés',
      'SMS notifications',
      'Support standard'
    ],
    modules: ['Produits', 'Ventes', 'Commandes', 'Employés', 'Livraisons'],
    limites: { supermarches: 1, produits: 100, ia: false }
  },
  {
    id: 'pro',
    nom: 'Pro',
    prix: 15000,
    couleur: '#007A3D',
    badge: 'Populaire',
    description: 'Pour les commerces en croissance',
    fonctionnalites: [
      '3 supermarchés',
      'Produits illimités',
      'Assistant IA inclus',
      'Rapports & statistiques',
      'Coiffure, Pressing, Auto',
      'Menuiserie, Meubles, Éducation',
      'SMS illimités',
      'Support prioritaire'
    ],
    modules: ['Tout Starter', 'Coiffure', 'Pressing', 'Automobile', 'Menuiserie', 'Meubles', 'Education', 'IA', 'Rapports'],
    limites: { supermarches: 3, produits: -1, ia: true }
  },
  {
    id: 'business',
    nom: 'Business',
    prix: 35000,
    couleur: '#CE1126',
    badge: 'Recommandé',
    description: 'Pour les grandes structures',
    fonctionnalites: [
      'Supermarchés illimités',
      'Tous modules Pro inclus',
      'Restauration & Food',
      'Santé & Médical',
      'BTP & Construction',
      'Énergie & Solaire',
      'Agriculture & Élevage',
      'Export CSV avancé',
      'Support dédié 24h/7j'
    ],
    modules: ['Tout Pro', 'Restauration', 'Santé', 'BTP', 'Énergie', 'Agriculture'],
    limites: { supermarches: -1, produits: -1, ia: true }
  },
  {
    id: 'super_business',
    nom: 'Super Business',
    prix: 75000,
    couleur: '#FCD116',
    couleur_texte: '#1A1A1A',
    badge: 'Tout inclus',
    description: 'La plateforme nationale complète',
    fonctionnalites: [
      'Tout Business inclus',
      'Logistique inter-villes',
      'Immobilier & Hébergement',
      'Gestion multi-gérants',
      'Codes d\'invitation illimités',
      'Tableau de bord global',
      'API & intégrations',
      'Account manager dédié',
      'Personnalisation complète'
    ],
    modules: ['Tout Business', 'Logistique', 'Immobilier', 'Multi-gérants', 'Invitations illimitées'],
    limites: { supermarches: -1, produits: -1, ia: true }
  }
];


// ── Codes d'invitation par défaut pour tous les rôles ──
// ── Codes d'invitation par défaut
// maxUsages : nombre de gérants pouvant s'inscrire avec ce code
// Gratuits   → nombre élevé (personnel de base)
// Artisans   → 5 par secteur (1 salon = 1 code)
// Spécialistes → 3 par domaine (médecin, ingénieur...)
var CODES_INVITATION_DEFAUT = [
  // ─── GRATUITS (personnel sans abonnement) ───
  { code:'SM-CAISSIER-26',      role:'Caissier(e)',         maxUsages:50,  actif:true, desc:'Caissier(e) — Gratuit' },
  { code:'SM-LIVREUR-2026',     role:'Livreur',             maxUsages:50,  actif:true, desc:'Livreur — Gratuit' },
  // ─── GÉRANCE SUPERMARCHÉ ───
  { code:'SM-GERANT-2026',      role:'gerant',              maxUsages:20,  actif:true, desc:'Gérant(e) Supermarché' },
  // ─── ARTISANS & SERVICES (1 code = plusieurs salons/ateliers) ───
  { code:'SM-COIFFEUR-26',      role:'coiffeur',            maxUsages:30,  actif:true, desc:'Coiffeur/Coiffeuse — 30 salons max' },
  { code:'SM-PRESSING-26',      role:'blanchisseur',        maxUsages:30,  actif:true, desc:'Gérant Pressing — 30 pressings max' },
  { code:'SM-MECA-2026',        role:'mecanicien',          maxUsages:25,  actif:true, desc:'Mécanicien — 25 garages max' },
  { code:'SM-MENU-2026',        role:'menuisier',           maxUsages:20,  actif:true, desc:'Menuisier — 20 ateliers max' },
  { code:'SM-DECO-2026',        role:'decorateur',          maxUsages:20,  actif:true, desc:'Décorateur/Décoratrice — 20 max' },
  { code:'SM-RESTO-2026',       role:'restaurateur',        maxUsages:30,  actif:true, desc:'Chef/Restaurateur — 30 restaurants max' },
  // ─── PROFESSIONS SPÉCIALISÉES ───
  { code:'SM-DOCTEUR-26',       role:'docteur',             maxUsages:20,  actif:true, desc:'Docteur/Médecin — 20 médecins max' },
  { code:'SM-BTP-2026',         role:'ingenieur_btp',       maxUsages:25,  actif:true, desc:'Ingénieur BTP — 25 artisans max' },
  { code:'SM-ELEC-2026',        role:'electricien',         maxUsages:20,  actif:true, desc:'Électricien/Société énergie — 20 max' },
  { code:'SM-AGRI-2026',        role:'ingenieur_agricole',  maxUsages:20,  actif:true, desc:'Ingénieur Agricole — 20 max' },
  { code:'SM-LOGIS-26',         role:'logisticien',         maxUsages:25,  actif:true, desc:'Logisticien/Transporteur — 25 max' },
  { code:'SM-LIBRA-26',         role:'libraire',            maxUsages:20,  actif:true, desc:'Libraire — 20 librairies max' },
  { code:'SM-IMMO-2026',        role:'immobilier',          maxUsages:20,  actif:true, desc:'Agent Immobilier — 20 agents max' },
];

function initCodesInvitationDefaut() {
  if (typeof CODES_INVITATION === 'undefined') return;
  CODES_INVITATION_DEFAUT.forEach(function(code) {
    var ex = CODES_INVITATION.find(function(c){ return c.code === code.code; });
    if (!ex) {
      CODES_INVITATION.push({
        code: code.code, role: code.role,
        usages: 0, maxUsages: code.maxUsages,
        actif: code.actif, cree: '01/01/2026'
      });
    }
  });
  if (typeof saveCodesInvitation === 'function') saveCodesInvitation();
}

// ── Données abonnements ──
var ABONNEMENTS = [];
// ── Helper Supabase abonnements ──
function _sbAbo() {
  if (typeof window.supabase === 'undefined') return null;
  try { return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key); } catch(e) { return null; }
}

async function chargerAbonnementsSupabase() {
  try {
    var sb = _sbAbo(); if (!sb) return;
    var res = await sb.from('sm_abonnements').select('*');
    if (res.data && res.data.length > 0) {
      res.data.forEach(function(a) {
        var ex = ABONNEMENTS.find(function(x){ return x.email === a.email; });
        if (ex) { ex.plan=a.plan; ex.statut=a.statut; ex.expiration=a.expiration; }
        else ABONNEMENTS.push({ email:a.email, plan:a.plan, statut:a.statut, debut:a.debut, expiration:a.expiration, mois:a.mois||1 });
      });
      localStorage.setItem('sm_abonnements', JSON.stringify(ABONNEMENTS));
    }
  } catch(e) { console.warn('[Abonnements] Supabase:', e); }
}

async function syncAbonnementSupabase(abo) {
  try {
    var sb = _sbAbo(); if (!sb) return;
    await sb.from('sm_abonnements').upsert({
      email: abo.email, plan: abo.plan, statut: abo.statut,
      debut: abo.debut, expiration: abo.expiration, mois: abo.mois
    }, { onConflict: 'email' });
  } catch(e) { console.warn('[Abonnements] sync:', e); }
}


function initAbonnements() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_abonnements') || '[]');
    if (saved) ABONNEMENTS = saved;
  } catch(e) { ABONNEMENTS = []; }
  // Charger depuis Supabase (async)
  chargerAbonnementsSupabase();
}

function saveAbonnements() {
  try { localStorage.setItem('sm_abonnements', JSON.stringify(ABONNEMENTS)); } catch(e) {}
  // Sync Supabase
  ABONNEMENTS.forEach(function(a){ syncAbonnementSupabase(a); });
}

function getAbonnementGerant(email) {
  if (!email) return null;
  return ABONNEMENTS.find(function(a) {
    return a.email.toLowerCase() === email.toLowerCase();
  }) || null;
}

function abonnementActif(email) {
  if (!email) return false;
  var user = typeof currentUser !== 'undefined' ? currentUser : null;
  if (user && user.role === 'administrateur') return true;
  var abo = getAbonnementGerant(email);
  if (!abo || abo.statut === 'suspendu') return false;
  return new Date(abo.expiration) >= new Date();
}

// ── Vérifier si une page est accessible selon le plan ──
function pageAccessiblePourPlan(page, planId) {
  if (!planId) return false;
  var pages = PAGES_PAR_PLAN[planId] || [];
  return pages.indexOf(page) !== -1;
}

// ── Vérifier accès page pour le gérant connecté ──
function gerantPeutAccederPage(page) {
  if (!currentUser) return false;
  if (currentUser.role === 'administrateur') return true;
  var abo = getAbonnementGerant(currentUser.email);
  if (!abo || abo.statut === 'suspendu') return false;
  if (new Date(abo.expiration) < new Date()) return false;
  return pageAccessiblePourPlan(page, abo.plan);
}

// ── Activer/Renouveler un abonnement ──
function activerAbonnement(email, planId, mois) {
  mois = mois || 1;
  var abo = getAbonnementGerant(email);
  var debut = new Date();
  var expiration = new Date();
  expiration.setMonth(expiration.getMonth() + mois);

  if (abo) {
    abo.plan       = planId;
    abo.statut     = 'actif';
    abo.debut      = debut.toISOString();
    abo.expiration = expiration.toISOString();
    abo.mois       = mois;
  } else {
    ABONNEMENTS.push({
      email:      email,
      plan:       planId,
      statut:     'actif',
      debut:      debut.toISOString(),
      expiration: expiration.toISOString(),
      mois:       mois
    });
  }
  saveAbonnements();
}

function suspendreAbonnement(email) {
  var abo = getAbonnementGerant(email);
  if (abo) { abo.statut = 'suspendu'; saveAbonnements(); }
}

// ── Vérifier expiration et bloquer si nécessaire ──
function verifierEtBloquerSiExpire(user) {
  if (!user) return false;
  var role = (user.role || '').toLowerCase().replace(/[^a-z_]/g, '');

  // Admin → toujours libre
  if (role === 'administrateur') return false;

  // Rôles gratuits (caissier, livreur) → jamais bloqués
  if (typeof ROLES_GRATUITS !== 'undefined' && ROLES_GRATUITS.indexOf(role) !== -1) return false;

  // Vérifier abonnement
  var abo = getAbonnementGerant(user.email);

  if (!abo) {
    afficherBlocageAbonnement(user, 'Aucun abonnement actif');
    return true;
  }
  if (abo.statut === 'suspendu') {
    afficherBlocageAbonnement(user, 'Abonnement suspendu par l\'administrateur');
    return true;
  }
  if (new Date(abo.expiration) < new Date()) {
    afficherBlocageAbonnement(user, 'Votre abonnement a expiré le ' + new Date(abo.expiration).toLocaleDateString('fr-FR'));
    return true;
  }

  // Alerte 5 jours avant expiration
  var joursRestants = Math.floor((new Date(abo.expiration) - new Date()) / (1000*60*60*24));
  if (joursRestants <= 5) {
    if (typeof toast === 'function') toast('Votre abonnement expire dans ' + joursRestants + ' jour(s) !', 'warning');
  }

  return false;
}

// ── Écran de blocage modernisé ──
function afficherBlocageAbonnement(user, raison) {
  var app = document.getElementById('app');
  if (!app) return;

  var html = '<div style="min-height:100vh;background:linear-gradient(135deg,#007A3D,#005a2c);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box">'
    + '<div style="background:#fff;border-radius:24px;padding:32px;max-width:600px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3)">'

    // Logo + titre
    + '<div style="text-align:center;margin-bottom:24px">'
    + '<div style="font-size:28px;font-weight:900;color:#007A3D;margin-bottom:4px">SuperMarché CM</div>'
    + '<div style="font-size:13px;color:#999">Plateforme nationale camerounaise</div>'
    + '</div>'

    // Message blocage
    + '<div style="background:#fee2e2;border:2px solid #CE1126;border-radius:14px;padding:16px;text-align:center;margin-bottom:24px">'
    + '<div style="font-size:32px;margin-bottom:8px"><img loading="lazy" src="https://img.icons8.com/ios/32/CE1126/lock-2.png" alt="Bloque" style="width:32px;height:32px"></div>'
    + '<div style="font-weight:800;font-size:16px;color:#CE1126;margin-bottom:4px">Accès bloqué</div>'
    + '<div style="font-size:13px;color:#CE1126">' + raison + ' — Bonjour ' + (user.email || '') + '</div>'
    + '</div>'

    // Les 4 plans
    + '<div style="font-weight:700;font-size:14px;color:#111;margin-bottom:14px;text-align:center">Choisissez votre plan</div>'
    + '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px">'
    + PLANS_ABONNEMENT.map(function(plan) {
        var couleurTexte = plan.couleur_texte || '#fff';
        return '<div style="border:2px solid ' + plan.couleur + ';border-radius:14px;padding:14px;cursor:pointer;position:relative" onclick="demanderUpgrade(\'' + plan.id + '\')">'
          + '<div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:' + plan.couleur + ';color:' + couleurTexte + ';font-size:10px;font-weight:700;padding:2px 10px;border-radius:20px;white-space:nowrap">' + plan.badge + '</div>'
          + '<div style="font-weight:800;font-size:15px;color:' + plan.couleur + ';margin-bottom:2px;margin-top:4px">' + plan.nom + '</div>'
          + '<div style="font-size:18px;font-weight:900;color:#111;margin-bottom:6px">' + plan.prix.toLocaleString('fr-FR') + ' <span style="font-size:11px;font-weight:400;color:#999">FCFA/mois</span></div>'
          + '<div style="font-size:11px;color:#555;margin-bottom:8px">' + plan.description + '</div>'
          + plan.modules.slice(0,3).map(function(m){
              return '<div style="font-size:10px;color:#007A3D;padding:1px 0"><img loading="lazy" src="https://img.icons8.com/ios/10/007A3D/checkmark.png" style="width:8px;height:8px;vertical-align:middle"> ' + m + '</div>';
            }).join('')
          + (plan.modules.length > 3 ? '<div style="font-size:10px;color:#999">+' + (plan.modules.length-3) + ' modules...</div>' : '')
          + '<button style="width:100%;margin-top:8px;background:' + plan.couleur + ';color:' + couleurTexte + ';border:none;padding:7px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">Activer ' + plan.nom + '</button>'
          + '</div>';
      }).join('')
    + '</div>'

    // Bouton WhatsApp
    + '<a href="https://wa.me/237683392268?text=' + encodeURIComponent('Bonjour, je voudrais activer un abonnement SuperMarché CM pour ' + (user.email||'') + '. Merci !') + '" target="_blank" style="display:block;background:#25D366;color:#fff;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:14px;text-decoration:none;margin-bottom:12px">'
    + '<img loading="lazy" src="https://img.icons8.com/ios/18/ffffff/whatsapp.png" alt="WA" style="width:16px;height:16px;vertical-align:middle;margin-right:6px"> Contacter l\'admin via WhatsApp'
    + '</a>'

    // Se déconnecter
    + '<div style="text-align:center">'
    + '<button onclick="seDeconnecter()" style="background:none;border:none;color:#999;font-size:12px;cursor:pointer;text-decoration:underline">Se déconnecter</button>'
    + '</div>'
    + '</div></div>';

  app.innerHTML = html;
}

// ── Demander upgrade via WhatsApp ──
function demanderUpgrade(planId) {
  var plan = PLANS_ABONNEMENT.find(function(p){ return p.id === planId; });
  if (!plan) return;
  var email = currentUser ? currentUser.email : '';
  var msg = 'Bonjour, je souhaite activer le plan ' + plan.nom + ' (' + plan.prix.toLocaleString('fr-FR') + ' FCFA/mois) pour mon compte SuperMarché CM : ' + email + '. Merci !';
  window.open('https://wa.me/237683392268?text=' + encodeURIComponent(msg), '_blank');
}

// ── Render interface admin abonnements ──
function renderAbonnements() {
  // Stats globales
  var stats = document.getElementById('abo-stats');
  if (stats) {
    var actifs    = ABONNEMENTS.filter(function(a){ return a.statut==='actif' && new Date(a.expiration)>=new Date(); }).length;
    var expires   = ABONNEMENTS.filter(function(a){ return new Date(a.expiration)<new Date(); }).length;
    var suspendus = ABONNEMENTS.filter(function(a){ return a.statut==='suspendu'; }).length;
    var revenu    = ABONNEMENTS.filter(function(a){ return a.statut==='actif'; }).reduce(function(s,a){
      var plan = PLANS_ABONNEMENT.find(function(p){ return p.id===a.plan; });
      return s + (plan ? plan.prix : 0);
    }, 0);
    stats.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">'
      + '<div class="cd" style="text-align:center;border-top:4px solid #007A3D"><div style="font-size:28px;font-weight:800;color:#007A3D">'+actifs+'</div><div style="font-size:12px;color:#666">Actifs</div></div>'
      + '<div class="cd" style="text-align:center;border-top:4px solid #CE1126"><div style="font-size:28px;font-weight:800;color:#CE1126">'+expires+'</div><div style="font-size:12px;color:#666">Expirés</div></div>'
      + '<div class="cd" style="text-align:center;border-top:4px solid #f59e0b"><div style="font-size:28px;font-weight:800;color:#f59e0b">'+suspendus+'</div><div style="font-size:12px;color:#666">Suspendus</div></div>'
      + '<div class="cd" style="text-align:center;border-top:4px solid #8b5cf6"><div style="font-size:22px;font-weight:800;color:#8b5cf6">'+(revenu>=1000?Math.round(revenu/1000)+'K':revenu.toLocaleString('fr-FR'))+'</div><div style="font-size:12px;color:#666">Revenu/mois FCFA</div></div>'
      + '</div>';
  }

  // Plans tarifaires horizontaux
  var plansZone = document.getElementById('abo-plans');
  if (plansZone) {
    plansZone.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">'
      + PLANS_ABONNEMENT.map(function(plan) {
          var couleurTexte = plan.couleur_texte || '#fff';
          var nb = ABONNEMENTS.filter(function(a){ return a.plan===plan.id && a.statut==='actif' && new Date(a.expiration)>=new Date(); }).length;
          return '<div style="border:2px solid '+plan.couleur+';border-radius:14px;padding:14px;position:relative">'
            + '<div style="position:absolute;top:-10px;left:12px;background:'+plan.couleur+';color:'+couleurTexte+';font-size:10px;font-weight:700;padding:2px 10px;border-radius:20px">'+plan.badge+'</div>'
            + '<div style="font-weight:800;color:'+plan.couleur+';font-size:14px;margin-top:4px">'+plan.nom+'</div>'
            + '<div style="font-size:18px;font-weight:900;margin:4px 0">'+plan.prix.toLocaleString('fr-FR')+'<span style="font-size:11px;font-weight:400;color:#999"> F/mois</span></div>'
            + '<div style="background:'+plan.couleur+'22;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:700;color:'+plan.couleur+';text-align:center;margin-top:6px">'+nb+' gérant(s) actif(s)</div>'
            + '</div>';
        }).join('')
      + '</div>';
  }

  renderTableauGerants();
}

// ─────────────────────────────────
//  Métiers par catégorie
// ─────────────────────────────────
var METIERS_CATEGORIES = {
  supermarche: { label: 'Supermarché', roles: ['gerant','proprietaire','directeur'], color: '#007A3D' },
  artisan: { label: 'Artisans', roles: ['coiffeur','blanchisseur','mecanicien','menuisier','decorateur','restaurateur'], color: '#f59e0b' },
  sante: { label: 'Santé', roles: ['docteur'], color: '#CE1126' },
  construction: { label: 'Construction', roles: ['ingenieur_btp','electricien'], color: '#8b5cf6' },
  services: { label: 'Services', roles: ['ingenieur_agricole','logisticien','libraire','immobilier'], color: '#3b82f6' },
};

var METIER_LABELS = {
  gerant: 'Gérant(e) Supermarché', proprietaire: 'Propriétaire', directeur: 'Directeur(trice)',
  coiffeur: 'Coiffeur / Coiffeuse', blanchisseur: 'Gérant Pressing', mecanicien: 'Mécanicien',
  menuisier: 'Menuisier', decorateur: 'Décoratrice / Décorateur', restaurateur: 'Chef / Restaurateur',
  docteur: 'Docteur / Médecin', ingenieur_btp: 'Ingénieur BTP', electricien: 'Électricien',
  ingenieur_agricole: 'Ingénieur Agricole', logisticien: 'Logisticien', libraire: 'Libraire',
  immobilier: 'Agent Immobilier'
};

var _aboOngletActif = 'tous';

function filtrerAboOnglet(onglet, btn) {
  _aboOngletActif = onglet;
  document.querySelectorAll('[onclick*="filtrerAboOnglet"]').forEach(function(b){
    b.classList.remove('bp'); b.classList.add('bo');
  });
  if (btn) { btn.classList.remove('bo'); btn.classList.add('bp'); }

  // Afficher/masquer l'historique paiements
  var listeGerants = document.getElementById('abo-gerants-liste');
  var histoPmt = document.getElementById('historique-paiements-container');

  if (onglet === 'paiements') {
    if (listeGerants) listeGerants.parentElement.style.display = 'none';
    if (!histoPmt) {
      var div = document.createElement('div');
      div.id = 'historique-paiements-container';
      div.innerHTML = '<div class="cd"><div class="ch"><div class="ct">Historique des paiements</div>'
        + '<button class="btn bo bsm" onclick="exporterHistoriquePDF()">Export PDF</button></div>'
        + '<div id="historique-paiements" style="margin-top:10px"></div></div>';
      var zone = document.getElementById('abo-gerants-liste');
      if (zone) zone.parentElement.parentElement.appendChild(div);
    } else {
      histoPmt.style.display = 'block';
    }
    if (typeof renderHistoriquePaiements === 'function') renderHistoriquePaiements();
  } else {
    if (histoPmt) histoPmt.style.display = 'none';
    if (listeGerants) listeGerants.parentElement.style.display = '';
    renderTableauGerants();
  }
}

function exporterHistoriquePDF() {
  // Export CSV de l'historique
  var rows = [['Date','Email','Plan','Montant (FCFA)','Opérateur','Statut','Référence']];
  (typeof HISTORIQUE_PAIEMENTS !== 'undefined' ? HISTORIQUE_PAIEMENTS : []).forEach(function(tx) {
    rows.push([tx.date||'', tx.email||'', tx.plan||'', tx.montant||0, tx.operateur||'', tx.statut||'', tx.ref||'']);
  });
  var csv = rows.map(function(r){ return r.join(';'); }).join('\n');
  var blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'historique-paiements-' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
}

function filtrerTableauAbo() {
  renderTableauGerants();
}


function renderTableauGerants() {
  var liste = document.getElementById('abo-gerants-liste');
  if (!liste) return;

  var srch = ((document.getElementById('abo-search')||{}).value||'').toLowerCase();

  // Récupérer TOUS les comptes gérants (tous rôles avec abonnement)
  var accounts = [];
  try { accounts = JSON.parse(localStorage.getItem('sm_accounts') || '[]'); } catch(e) {}
  
  // Filtrer selon l'onglet actif
  var rolesAutorises = ROLES_AVEC_ABONNEMENT || [];
  var gerants = accounts.filter(function(a) {
    var role = (a.role||'').toLowerCase();
    if (!rolesAutorises.includes(role)) return false;
    if (_aboOngletActif !== 'tous') {
      var cat = METIERS_CATEGORIES[_aboOngletActif];
      if (!cat || !cat.roles.includes(role)) return false;
    }
    if (srch && !(a.email||'').toLowerCase().includes(srch) && !(a.nom||'').toLowerCase().includes(srch)) return false;
    return true;
  });

  if (gerants.length === 0) {
    var msg = _aboOngletActif === 'tous'
      ? 'Aucun gérant enregistré — Ajoutez des gérants via les pages métier'
      : 'Aucun gérant dans cette catégorie';
    liste.innerHTML = '<div style="text-align:center;padding:30px;color:#999">'
      + '<img loading="lazy" src="https://img.icons8.com/ios/48/999999/conference-call.png" style="width:40px;height:40px;display:block;margin:0 auto 10px">'
      + '<div style="font-size:14px;font-weight:600">' + msg + '</div>'
      + '</div>';
    return;
  }

  // Grouper par catégorie métier
  var groupes = {};
  gerants.forEach(function(g) {
    var role = (g.role||'gerant').toLowerCase();
    var catKey = 'autres';
    Object.keys(METIERS_CATEGORIES).forEach(function(k) {
      if ((METIERS_CATEGORIES[k].roles||[]).includes(role)) catKey = k;
    });
    if (!groupes[catKey]) groupes[catKey] = [];
    groupes[catKey].push(g);
  });

  var html = '';

  Object.keys(_aboOngletActif === 'tous' ? groupes : { [_aboOngletActif]: groupes[_aboOngletActif]||[] }).forEach(function(catKey) {
    var cat = METIERS_CATEGORIES[catKey] || { label: catKey, color: '#999' };
    var gList = groupes[catKey] || [];
    if (!gList.length) return;

    html += '<div style="margin-bottom:20px">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:2px solid '+cat.color+'">'
      + '<div style="width:12px;height:12px;border-radius:50%;background:'+cat.color+'"></div>'
      + '<span style="font-weight:800;font-size:14px;color:'+cat.color+'">' + cat.label + '</span>'
      + '<span style="font-size:12px;color:#999">('+gList.length+' gérant(s))</span>'
      + '</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px">'
      + gList.map(function(g) {
          var abo = getAbonnementGerant(g.email);
          var plan = abo ? PLANS_ABONNEMENT.find(function(p){ return p.id===abo.plan; }) : null;
          var actif = abo && abo.statut==='actif' && new Date(abo.expiration)>=new Date();
          var expir = abo ? new Date(abo.expiration) : null;
          var joursR = expir ? Math.floor((expir-new Date())/(1000*60*60*24)) : 0;
          var role = (g.role||'gerant').toLowerCase();
          var roleLabel = METIER_LABELS[role] || g.role;
          var initiale = (g.nom||g.email||'G')[0].toUpperCase();

          return '<div class="cd" style="border-left:4px solid '+(actif?cat.color:'#e5e7eb')+'">'
            // En-tête
            + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'
            + '<div style="width:44px;height:44px;border-radius:50%;background:'+(actif?cat.color:'#e5e7eb')+';color:'+(actif?'#fff':'#999')+';display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;flex-shrink:0">'+initiale+'</div>'
            + '<div style="flex:1;min-width:0">'
            + '<div style="font-weight:800;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+(g.nom||g.email.split('@')[0])+'</div>'
            + '<div style="font-size:11px;color:#007A3D;font-weight:600">'+roleLabel+'</div>'
            + '<div style="font-size:11px;color:#999;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+g.email+'</div>'
            + '</div></div>'
            // Abonnement actuel
            + '<div style="background:#f9fafb;border-radius:10px;padding:10px;margin-bottom:10px">'
            + (abo
                ? '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px">'
                  + '<div>'
                  + (plan ? '<div style="font-weight:800;color:'+(plan.couleur||'#007A3D')+'">Plan '+plan.nom+'</div>' : '')
                  + '<div style="font-size:11px;color:#555">Expire le '+expir.toLocaleDateString('fr-FR')+'</div>'
                  + '</div>'
                  + '<div>'
                  + (actif
                      ? '<span style="background:#dcfce7;color:#007A3D;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">'+(joursR<=5?'⚠ ':'')+joursR+'j restants</span>'
                      : abo.statut==='suspendu'
                        ? '<span style="background:#fef3c7;color:#d97706;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">Suspendu</span>'
                        : '<span style="background:#fee2e2;color:#CE1126;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">Expiré</span>')
                  + '</div></div>'
                : '<div style="text-align:center;color:#CE1126;font-size:12px;font-weight:700">Aucun abonnement actif</div>')
            + '</div>'
            // Actions
            + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
            + '<button class="btn bp bsm" style="flex:1" data-email="'+g.email+'" onclick="ouvrirModalAboFromBtn(this)">Gérer abonnement</button>'
            + (actif && abo.statut==='actif' ? '<button class="btn bd bsm" data-email="'+g.email+'" onclick="suspendreAboFromBtn(this)">Suspendre</button>' : '')
            + (g.tel ? '<a href="https://wa.me/'+g.tel.replace(/[ +\-]/g,'')+'" target="_blank" class="btn bo bsm">WA</a>' : '')
            + '</div></div>';
        }).join('')
      + '</div></div>';
  });

  liste.innerHTML = html || '<p style="text-align:center;color:#999;padding:20px">Aucun résultat</p>';
}


function ouvrirModalAbo(email) {
  var el = document.getElementById('m-abo-email');
  if (el) el.value = email;
  // Pré-sélectionner le plan actuel
  var abo = getAbonnementGerant(email);
  var selPlan = document.getElementById('m-abo-plan');
  if (selPlan && abo) selPlan.value = abo.plan;
  // Afficher les modules du plan sélectionné
  renderModulesPlan();
  openM('m-abo');
}

function renderModulesPlan() {
  var planId = (document.getElementById('m-abo-plan')||{}).value || '';
  var zone = document.getElementById('m-abo-modules');
  if (!zone) return;
  if (!planId) { zone.innerHTML = ''; return; }
  var pages = PAGES_PAR_PLAN[planId] || [];
  var plan = PLANS_ABONNEMENT.find(function(p){ return p.id===planId; });
  zone.innerHTML = '<div style="margin-top:10px;background:#f0faf5;border-radius:10px;padding:12px">'
    + '<div style="font-size:12px;font-weight:700;color:#007A3D;margin-bottom:8px">Modules inclus dans ' + (plan?plan.nom:'') + ' (' + pages.length + ' pages) :</div>'
    + (plan ? plan.fonctionnalites.map(function(f){
        return '<div style="font-size:11px;color:#555;padding:2px 0"><img loading="lazy" src="https://img.icons8.com/ios/10/007A3D/checkmark.png" style="width:9px;height:9px;vertical-align:middle"> '+f+'</div>';
      }).join('') : '')
    + '<div style="margin-top:8px;font-size:11px;font-weight:700;color:#007A3D">'+(plan?plan.prix.toLocaleString('fr-FR')+' FCFA/mois':'')+'</div>'
    + '</div>';
}

function confirmerActivationAbo() {
  var email  = (document.getElementById('m-abo-email') || {}).value || '';
  var planId = (document.getElementById('m-abo-plan')  || {}).value || '';
  var mois   = parseInt((document.getElementById('m-abo-mois') || {}).value) || 1;
  if (!email)  { toast('Email requis', 'warning'); return; }
  if (!planId) { toast('Sélectionnez un plan', 'warning'); return; }
  closeM('m-abo');
  // Passer par le paiement NotchPay (ou simulation si non configuré)
  if (typeof payerAbonnementNotchPay === 'function') {
    payerAbonnementNotchPay(email, planId, mois);
  } else {
    activerAbonnement(email, planId, mois);
    renderAbonnements();
    var plan = PLANS_ABONNEMENT.find(function(p){ return p.id===planId; });
    toast('Abonnement ' + (plan?plan.nom:'') + ' activé pour ' + email, 'success');
    addNotif('Abonnement activé : ' + email + ' — Plan ' + (plan?plan.nom:''), 'green');
  }
}


function ouvrirModalAboFromBtn(btn) {
  var email = btn ? btn.getAttribute('data-email') : '';
  ouvrirModalAbo(email);
}

function suspendreAboFromBtn(btn) {
  var email = btn ? btn.getAttribute('data-email') : '';
  if (!email) return;
  suspendreAbonnement(email);
  renderAbonnements();
}

// ══════════════════════════════════════════════════════════════
//  FACTURATION RÉCURRENTE — Paiement réel via NotchPay
// ══════════════════════════════════════════════════════════════

function _aboBackendUrl() {
  var url = 'https://kamer360-backend-production.up.railway.app';
  if (typeof SM_CONFIG !== 'undefined' && SM_CONFIG.backend) {
    url = typeof SM_CONFIG.backend === 'string' ? SM_CONFIG.backend : (SM_CONFIG.backend.url || url);
  }
  return url;
}

// ── Lancer le paiement d'un abonnement (1er paiement ou renouvellement manuel) ──
async function payerAbonnementNotchPay(email, planId, mois) {
  var plan = PLANS_ABONNEMENT.find(function(p){ return p.id === planId; });
  if (!plan) { toast('Plan introuvable', 'error'); return; }

  var montant = plan.prix * mois;
  var modal = document.getElementById('m-paiement-embed');

  if (!modal) {
    // Fallback si le modal de paiement intégré n'est pas disponible sur cette page
    if (confirm('Activer "' + plan.nom + '" pour ' + mois + ' mois (' + montant.toLocaleString('fr-FR') + ' FCFA) ?\nMode test : aucun vrai paiement ne sera prélevé.')) {
      activerAbonnement(email, planId, mois);
      _enregistrerFacture(email, planId, mois, montant, 'test_sans_modal');
      renderAbonnements();
      toast('Abonnement ' + plan.nom + ' activé (mode test)', 'success');
    }
    return;
  }

  // Utiliser le système de paiement intégré déjà en place dans la boutique
  document.getElementById('pe-titre').textContent = '📋 Abonnement ' + plan.nom;
  document.getElementById('pe-cmd-num').textContent = 'ABO-' + Date.now().toString().slice(-6);
  document.getElementById('pe-montant').textContent = montant.toLocaleString('fr-FR') + ' FCFA';

  ['pe-view-mobile', 'pe-view-carte', 'pe-view-resultat'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.style.display = 'none';
  });
  document.getElementById('pe-view-carte').style.display = 'flex';
  document.getElementById('pe-close-btn').style.display = 'flex';
  modal.style.display = 'flex';

  var reference = 'ABO-' + email.replace(/[^a-zA-Z0-9]/g, '') + '-' + Date.now();

  try {
    var res = await fetch(_aboBackendUrl() + '/api/paiement/initier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        montant: montant, email: email, nom: email,
        description: 'Abonnement KAMER360 — ' + plan.nom + ' (' + mois + ' mois)',
        reference: reference, canal: 'card'
      })
    });
    var data = await res.json();

    if (data.success && data.payment_url) {
      if (data.mode === 'test') {
        setTimeout(function() {
          activerAbonnement(email, planId, mois);
          _enregistrerFacture(email, planId, mois, montant, reference);
          _peAfficherResultatAbo(true, 'Abonnement activé !', plan.nom + ' actif pour ' + mois + ' mois (mode test).', email);
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
        _aboVerifierStatut(reference, email, planId, mois, montant);
      }, 4000);
    } else {
      throw new Error(data.error || 'Erreur initialisation paiement');
    }
  } catch(e) {
    _logErr('payerAbonnementNotchPay', e);
    _peAfficherResultatAbo(false, 'Paiement indisponible', 'Le service de paiement est momentanément indisponible.', null);
  }
}

async function _aboVerifierStatut(reference, email, planId, mois, montant) {
  try {
    var res = await fetch(_aboBackendUrl() + '/api/paiement/statut/' + reference);
    var data = await res.json();
    var statut = data.status;

    if (statut === 'complete' || statut === 'success' || statut === 'successful') {
      if (window._peInterval) { clearInterval(window._peInterval); window._peInterval = null; }
      activerAbonnement(email, planId, mois);
      _enregistrerFacture(email, planId, mois, montant, reference);
      var plan = PLANS_ABONNEMENT.find(function(p){ return p.id === planId; });
      _peAfficherResultatAbo(true, 'Abonnement activé !', plan.nom + ' actif pour ' + mois + ' mois.', email);
    } else if (statut === 'failed' || statut === 'canceled' || statut === 'declined') {
      if (window._peInterval) { clearInterval(window._peInterval); window._peInterval = null; }
      _peAfficherResultatAbo(false, 'Paiement refusé', 'Le paiement n\u2019a pas pu \u00eatre valid\u00e9.', null);
    }
  } catch(e) { _logErr('_aboVerifierStatut', e); }
}

function _peAfficherResultatAbo(success, titre, msg, email) {
  ['pe-view-mobile', 'pe-view-carte'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.style.display = 'none';
  });
  var resEl = document.getElementById('pe-view-resultat');
  if (!resEl) return;
  resEl.style.display = 'block';
  document.getElementById('pe-resultat-icon').textContent = success ? '✅' : '❌';
  document.getElementById('pe-resultat-titre').textContent = titre;
  document.getElementById('pe-resultat-titre').style.color = success ? '#007A3D' : '#ef4444';
  document.getElementById('pe-resultat-msg').textContent = msg;
  document.getElementById('pe-resultat-btn').onclick = function() {
    document.getElementById('m-paiement-embed').style.display = 'none';
    if (success) renderAbonnements();
  };
}

// ── Enregistrer chaque facture pour historique et comptabilité ──
function _enregistrerFacture(email, planId, mois, montant, reference) {
  try {
    var factures = JSON.parse(localStorage.getItem('sm_factures_abonnements') || '[]');
    factures.unshift({
      email: email, plan: planId, mois: mois, montant: montant,
      reference: reference, date: new Date().toISOString(), statut: 'payee'
    });
    localStorage.setItem('sm_factures_abonnements', JSON.stringify(factures));
  } catch(e) {}

  // Sync Supabase pour comptabilité centralisée
  try {
    var sb = typeof _sbMain === 'function' ? _sbMain() : null;
    if (sb) {
      sb.from('kamer360_factures').insert({
        gerant_email: email, plan: planId, mois: mois, montant: montant,
        reference: reference, statut: 'payee', created_at: new Date().toISOString()
      });
    }
  } catch(e) { _logErr('_enregistrerFacture', e); }
}

// ══════════════════════════════════════════════════════════════
//  RENOUVELLEMENT AUTOMATIQUE — Vérification au chargement de l'app
// ══════════════════════════════════════════════════════════════
function verifierRenouvellementsDus() {
  var maintenant = new Date();
  ABONNEMENTS.forEach(function(abo) {
    if (abo.statut !== 'actif') return;
    var expiration = new Date(abo.expiration);
    var joursRestants = Math.ceil((expiration - maintenant) / (1000*60*60*24));

    // Alerte 5 jours avant expiration
    if (joursRestants === 5 || joursRestants === 1) {
      if (typeof addNotif === 'function') {
        addNotif('⏳ Abonnement de ' + abo.email + ' expire dans ' + joursRestants + ' jour(s)', 'orange');
      }
    }
    // Marquer comme expiré le jour J (le gérant devra renouveler manuellement
    // — pas de prélèvement automatique sans consentement explicite à chaque fois)
    if (joursRestants <= 0 && abo.statut === 'actif') {
      abo.statut = 'expire';
      saveAbonnements();
      if (typeof addNotif === 'function') {
        addNotif('❌ Abonnement de ' + abo.email + ' a expiré', 'red');
      }
    }
  });
}

// Lancer la vérification au chargement et toutes les 6 heures
setTimeout(verifierRenouvellementsDus, 3000);
setInterval(verifierRenouvellementsDus, 6 * 60 * 60 * 1000);
