// ═══════════════════════════════════════════════════════
//  SuperMarché CM — multi-users.js
//  Gestion des roles : Administrateur, Gerant, Caissier, Livreur
//  + Coiffeur, Blanchisseur, Mecanicien, Menuisier
// ═══════════════════════════════════════════════════════

// Email de l'administrateur principal — acces total
var ADMIN_EMAIL = 'lembetiny02@gmail.com';

var USERS = {
  comptes: [],
  seq: 1,
  currentUser: null,

  // Permissions par role
  permissions: {

    // Administrateur : acces total sans restriction
    administrateur: [
      'dashboard','supermarches','produits','achats','commandes','ventes',
      'employes','fournisseurs','rapports','ia','reseaux','livraison',
      'confidentialite','faq','parametres','livraisons-admin','promotions',
      'fidelite','utilisateurs','retours','stats-clients','livreurs','invitations',
      'abonnements','coiffure','pressing','automobile','menuiserie','meubles','restauration','energie','sante','btp','agriculture','logistique','education','immobilier','sante','btp','agriculture',
      'vue-coiffeur','vue-blanchisseur','vue-mecanicien','vue-menuisier',
      'chiffres-affaires','gestion-services','devis-reservations','mon-profil'
    ],

    // Gerant : gestion quotidienne
    gerant: [
      'dashboard','supermarches','produits','achats','commandes','ventes',
      'employes','fournisseurs','rapports','ia','livraison',
      'confidentialite','faq','livraisons-admin','promotions',
      'fidelite','retours','stats-clients','livreurs',
      'coiffure','pressing','automobile','menuiserie','meubles','restauration','energie','sante','btp','agriculture','logistique','education','immobilier','sante','btp','agriculture',
      'chiffres-affaires','gestion-services','devis-reservations'
    ],

    // Caissier : encaissement uniquement
    caissier: [
      'dashboard','achats','commandes','ventes','fidelite'
    ],

    // Livreur : ses livraisons uniquement
    livreur: [
      'livraisons-livreur'
    ],

    // Coiffeur/Coiffeuse : ses RDV du jour/semaine + statuts
    coiffeur: [
      'vue-coiffeur'
    ],

    // Blanchisseur/Pressing : dépôts en attente + statuts
    blanchisseur: [
      'vue-blanchisseur'
    ],

    // Mécanicien : ses RDV + pièces disponibles
    mecanicien: [
      'vue-mecanicien'
    ],

    // Menuisier : commandes bois + chantiers + stock matières
    menuisier: [
      'vue-menuisier', 'menuiserie', 'meubles', 'dashboard', 'faq', 'livraison'
    ],

    // Restaurateur / Chef cuisinier : son restaurant uniquement
    restaurateur: [
      'vue-restaurateur', 'restauration', 'dashboard', 'faq', 'livraison'
    ],

    // Docteur / Médecin : santé + RDV + dossiers patients
    docteur: [
      'sante', 'dashboard', 'faq', 'livraison'
    ],

    // Électricien / Ingénieur énergie
    electricien: [
      'energie', 'dashboard', 'faq', 'livraison'
    ],

    // Ingénieur BTP
    ingenieur_btp: [
      'btp', 'dashboard', 'faq', 'livraison'
    ],

    // Ingénieur agricole
    ingenieur_agricole: [
      'agriculture', 'dashboard', 'faq', 'livraison'
    ],

    // Logisticien / Transporteur
    logisticien: [
      'logistique', 'dashboard', 'faq', 'livraison'
    ],

    // Libraire / Éducation
    libraire: [
      'education', 'dashboard', 'faq', 'livraison'
    ],

    // Agent immobilier
    immobilier: [
      'immobilier', 'dashboard', 'faq', 'livraison'
    ],

    // Décorateur / Meubles
    decorateur: [
      'meubles', 'menuiserie', 'dashboard', 'faq', 'livraison'
    ]
  }
};


// ── Supabase sync comptes ──
function _sbUsers() {
  if (typeof window.supabase === 'undefined') return null;
  try { return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key); } catch(e) { return null; }
}

async function syncUserSupabase(user) {
  try {
    var sb = typeof _sbMain === 'function' ? _sbMain() : null;
    if (!sb) return;
    await sb.from('sm_users').upsert({
      email:  user.email,
      pwd:    user.pwd  || '',
      nom:    user.nom  || '',
      prenom: user.prenom || '',
      role:   user.role || 'gerant',
      sm:     user.sm   || ''
    }, { onConflict: 'email' });
  } catch(e) { console.warn('[Users] sync:', e); }
}

async function chargerUsersSupabase() {
  try {
    var sb = typeof _sbMain === 'function' ? _sbMain() : null;
    if (!sb) return;
    var res = await sb.from('sm_users').select('*');
    if (res.data && res.data.length > 0) {
      res.data.forEach(function(u) {
        if (!u.email) return;
        var ex = ACCOUNTS.find(function(a){ return a.email === u.email; });
        if (!ex) {
          ACCOUNTS.push({ email:u.email, pwd:u.pwd||'', nom:u.nom||'',
                          prenom:u.prenom||'', role:u.role||'gerant', sm:u.sm||'' });
        }
      });
      try { localStorage.setItem('sm_accounts', JSON.stringify(ACCOUNTS)); } catch(e) {}
    }
  } catch(e) { console.warn('[Users] chargement:', e); }
}

// ── Initialisation ──
function initUsers() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_users') || 'null');
    if (saved && saved.comptes) {
      USERS.comptes = saved.comptes;
      USERS.seq = saved.seq || 1;
    }
    var cu = JSON.parse(sessionStorage.getItem('sm_current_user') || 'null');
    if (cu) USERS.currentUser = cu;
  } catch(e) {}
  chargerUsersSupabase();
}

// ── Sauvegarde ──
function saveUsers() {
  try {
    localStorage.setItem('sm_users', JSON.stringify({
      comptes: USERS.comptes,
      seq: USERS.seq
    }));
  } catch(e) {}
  // Sync Supabase
  USERS.comptes.forEach(function(u){ syncUserSupabase(u); });
}

// ── Determiner le role d'un email ──
function getRoleForEmail(email) {
  if (!email) return null;
  if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) return 'administrateur';
  var user = USERS.comptes.find(function(u){
    return u.email.toLowerCase() === email.toLowerCase();
  });
  return user ? user.role : null;
}

// ── Connexion ──
function loginUser(email, pwd) {
  var normalizedEmail = (email || '').trim().toLowerCase();

  // Verifier si c'est l'administrateur
  if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
    // L'admin est dans ACCOUNTS (script.js), on lui assigne le role administrateur
    var adminUser = {
      id: 0,
      nom: 'Administrateur',
      prenom: '',
      email: ADMIN_EMAIL,
      role: 'administrateur',
      sm: 'Tous',
      actif: true,
      derniere_co: new Date().toLocaleString('fr-FR')
    };
    USERS.currentUser = adminUser;
    try { sessionStorage.setItem('sm_current_user', JSON.stringify(adminUser)); } catch(e) {}
    return adminUser;
  }

  // Chercher dans les comptes enregistres
  var user = USERS.comptes.find(function(u){
    return u.email.toLowerCase() === normalizedEmail && u.pwd === pwd && u.actif;
  });
  if (!user) return null;

  user.derniere_co = new Date().toLocaleString('fr-FR');
  USERS.currentUser = user;
  try { sessionStorage.setItem('sm_current_user', JSON.stringify(user)); } catch(e) {}
  saveUsers();
  return user;
}

// ── Deconnexion ──
function logoutUser() {
  USERS.currentUser = null;
  try { sessionStorage.removeItem('sm_current_user'); } catch(e) {}
}

// ── Verifier une permission ──
function hasPermission(page) {
  // Utiliser les deux références possibles
  var user = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : USERS.currentUser;
  if (!user) return false;

  var role = (user.role || '').toLowerCase()
    .replace(/[éèêë]/g,'e').replace(/[àâä]/g,'a').replace(/[^a-z_()]/g,'').trim();

  // Admin → tout autorisé, toujours
  if (role === 'administrateur' || role === 'admin') return true;

  // Pages toujours libres pour tous
  var toujours = ['livraison','confidentialite','faq','dashboard'];
  if (toujours.indexOf(page) !== -1) return true;

  // Pages de gestion globale : accessibles à admin et gérant
  var pagesGestion = ['chiffres-affaires','gestion-services','devis-reservations','rapports','stats-clients','mon-profil'];
  if (pagesGestion.indexOf(page) !== -1) {
    return (role === 'gerant' || role === 'gerant(e)' || role === 'administrateur');
  }

  // ── Rôles gratuits ──
  if (role === 'caissier' || role === 'caissiere') {
    var pagesC = ['dashboard','ventes','achats','commandes','produits','parametres'];
    return pagesC.indexOf(page) !== -1;
  }
  if (role === 'livreur') {
    return ['dashboard','livraisons-livreur','livraison'].indexOf(page) !== -1;
  }

  // ── Rôles métier avec abonnement → pages spécifiques ──
  if (typeof PAGES_PAR_ROLE !== 'undefined' && PAGES_PAR_ROLE[role]) {
    var pagesRole = PAGES_PAR_ROLE[role];
    if (pagesRole && pagesRole.indexOf(page) !== -1) return true;
    // Vérifier aussi l'abonnement pour accès étendu
    if (typeof getAbonnementGerant === 'function') {
      var abo = getAbonnementGerant(currentUser.email);
      if (abo && abo.statut === 'actif' && new Date(abo.expiration) >= new Date()) {
        var planPages = (typeof PAGES_PAR_PLAN !== 'undefined' ? PAGES_PAR_PLAN[abo.plan] : null) || [];
        return planPages.indexOf(page) !== -1;
      }
    }
    return false;
  }

  // ── Gérant avec abonnement → pages selon plan ──
  if (role === 'gerant' || role === 'gerant(e)' || role === 'proprietaire' || role === 'directeur') {
    if (typeof PAGES_PAR_PLAN !== 'undefined' && typeof getAbonnementGerant === 'function') {
      var abo2 = getAbonnementGerant(currentUser.email);
      if (abo2 && abo2.statut === 'actif' && new Date(abo2.expiration) >= new Date()) {
        var planPages2 = PAGES_PAR_PLAN[abo2.plan] || [];
        return planPages2.indexOf(page) !== -1 || ['dashboard','parametres'].indexOf(page) !== -1;
      }
    }
  }

  // Fallback : vérifier dans USERS.permissions
  var perms = USERS.permissions[role] || USERS.permissions['gerant'] || [];
  return perms.indexOf(page) !== -1;
}

// ── Est-ce l'administrateur ? ──
function isAdmin() {
  return USERS.currentUser &&
    USERS.currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// ── Labels des roles ──
function getRoleLabel(role) {
  var labels = {
    administrateur:    'Administrateur',
    gerant:            'Gérant(e)',
    caissier:          'Caissier(e)',
    livreur:           'Livreur',
    coiffeur:          'Coiffeur/Coiffeuse',
    blanchisseur:      'Gérant Pressing',
    mecanicien:        'Mécanicien',
    menuisier:         'Menuisier',
    restaurateur:      'Chef / Restaurateur',
    docteur:           'Docteur / Médecin',
    electricien:       'Électricien',
    ingenieur_btp:     'Ingénieur BTP',
    ingenieur_agricole:'Ingénieur Agricole',
    logisticien:       'Logisticien',
    libraire:          'Libraire',
    immobilier:        'Agent Immobilier',
    decorateur:        'Décorateur/Décoratrice'
  };
  return labels[role] || role || 'Utilisateur';
}

// ── Badge visuel du role ──
function getRoleBadge(role) {
  var colors = {
    administrateur:    '#CE1126',
    gerant:            '#007A3D',
    caissier:          '#1d4ed8',
    livreur:           '#b45309',
    coiffeur:          '#8b5cf6',
    blanchisseur:      '#0891b2',
    mecanicien:        '#374151',
    menuisier:         '#92400e',
    restaurateur:      '#f59e0b',
    docteur:           '#CE1126',
    electricien:       '#fcd116',
    ingenieur_btp:     '#6b7280',
    ingenieur_agricole:'#16a34a',
    logisticien:       '#0369a1',
    libraire:          '#7c3aed',
    immobilier:        '#047857',
    decorateur:        '#db2777'
  };
  var color = colors[role] || '#666';
  return '<span style="background:' + color + ';color:#fff;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700">'
    + getRoleLabel(role) + '</span>';
}

// ── Appliquer les restrictions visuelles selon le role ──
function applyRoleRestrictions() {
  // Utiliser currentUser (global) ou USERS.currentUser
  var user = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : USERS.currentUser;
  if (!user) return;

  // Synchroniser
  USERS.currentUser = user;

  var role = (user.role || 'gerant').toLowerCase().trim();

  // Admin → tout visible, rien à masquer
  if (role === 'administrateur') {
    document.querySelectorAll('.nv').forEach(function(el){ el.style.display = ''; });
    goPage('dashboard');
    return;
  }

  // Construire la liste des pages autorisées
  var perms = USERS.permissions[role] || USERS.permissions['gerant'] || [];

  // Masquer les menus non autorisés
  document.querySelectorAll('.nv').forEach(function(el) {
    var onclick = el.getAttribute('onclick') || '';
    var match = onclick.match(/goPage\(['"]([^'"]+)['"]\)/);
    if (!match) return;
    var page = match[1];
    el.style.display = (perms.indexOf(page) === -1) ? 'none' : '';
  });

  // Livreur : rediriger directement vers ses livraisons
  if (role === 'livreur') {
    goPage('livraisons-livreur');
    return;
  }

  // Caissier : rediriger vers le dashboard
  if (role === 'caissier') {
    goPage('dashboard');
    return;
  }

  // Coiffeur : vue dédiée uniquement
  if (role === 'coiffeur') {
    goPage('vue-coiffeur');
    return;
  }

  // Blanchisseur : vue dédiée uniquement
  if (role === 'blanchisseur') {
    goPage('vue-blanchisseur');
    return;
  }

  // Mécanicien : vue dédiée uniquement
  if (role === 'mecanicien') {
    goPage('vue-mecanicien');
    return;
  }

  // Menuisier : vue dédiée uniquement
  if (role === 'menuisier') {
    goPage('vue-menuisier');
    return;
  }

  // Restaurateur / Chef : vue restaurant uniquement
  if (role === 'restaurateur') {
    if (typeof initGerantsResto === 'function') initGerantsResto();
    goPage('vue-restaurateur');
    return;
  }

  // Rôles avec vue dédiée — redirection vers leur espace
  if (role === 'docteur')            { if (typeof initVueDocteur==='function') initVueDocteur(); goPage('vue-docteur'); return; }
  if (role === 'electricien')        { if (typeof initVueElectricien==='function') initVueElectricien(); goPage('vue-electricien'); return; }
  if (role === 'ingenieur_btp')      { if (typeof initVueIngenieurBTP==='function') initVueIngenieurBTP(); goPage('vue-btp'); return; }
  if (role === 'ingenieur_agricole') { if (typeof initVueIngenieurAgricole==='function') initVueIngenieurAgricole(); goPage('vue-agricole'); return; }
  if (role === 'logisticien')        { if (typeof initVueLogisticien==='function') initVueLogisticien(); goPage('vue-logisticien'); return; }
  if (role === 'libraire')           { if (typeof initVueLibraire==='function') initVueLibraire(); goPage('vue-libraire'); return; }
  if (role === 'immobilier')         { if (typeof initVueAgentImmo==='function') initVueAgentImmo(); goPage('vue-immo'); return; }
  if (role === 'decorateur')         { if (typeof initVueDecorateur==='function') initVueDecorateur(); goPage('vue-decorateur'); return; }

  // Afficher le role dans la sidebar (pied de page)
  var roleEl = document.getElementById('user-role-badge');
  if (roleEl) {
    roleEl.innerHTML = getRoleBadge(role);
  }
}

// ── Bloquer la navigation vers une page non autorisee ──
function goPageSecure(page) {
  if (!USERS.currentUser) return;
  if (!hasPermission(page)) {
    toast('Acces refuse. Vous n\'avez pas les droits pour cette page.', 'error');
    return;
  }
  goPage(page);
}

// ── Affichage du tableau des utilisateurs ──
function renderUsers() {
  var tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  if (USERS.comptes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:20px">Aucun utilisateur enregistre</td></tr>';
    return;
  }

  tbody.innerHTML = USERS.comptes.map(function(u) {
    var isMe = USERS.currentUser && u.id === USERS.currentUser.id;
    return '<tr>'
      + '<td><strong>' + u.nom + '</strong>'
      + (isMe ? ' <span style="color:#007A3D;font-size:11px">(vous)</span>' : '') + '</td>'
      + '<td style="font-size:12px;color:#666">' + u.email + '</td>'
      + '<td>' + getRoleBadge(u.role) + '</td>'
      + '<td style="font-size:12px">' + (u.sm || 'Tous') + '</td>'
      + '<td><span class="badge ' + (u.actif ? 'bgg' : 'bgr') + '">' + (u.actif ? 'Actif' : 'Inactif') + '</span></td>'
      + '<td style="font-size:11px;color:#999">' + (u.derniere_co || 'Jamais') + '</td>'
      + '<td><div style="display:flex;gap:4px">'
      + (!isMe ? '<button class="btn bo bsm" onclick="editUser(' + u.id + ')">Modifier</button>' : '')
      + (!isMe ? '<button class="btn bd bsm" onclick="toggleUser(' + u.id + ')">' + (u.actif ? 'Desactiver' : 'Activer') + '</button>' : '')
      + '</div></td>'
      + '</tr>';
  }).join('');
}

// ── Ajouter un utilisateur ──
function ajouterUser() {
  var nom   = document.getElementById('usr-nom').value.trim();
  var email = document.getElementById('usr-email').value.trim();
  var pwd   = document.getElementById('usr-pwd').value.trim();
  var role  = document.getElementById('usr-role').value;
  var sm    = document.getElementById('usr-sm') ? document.getElementById('usr-sm').value : 'Tous';

  if (!nom || !email || !pwd) {
    toast('Tous les champs obligatoires sont requis', 'warning');
    return;
  }
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    toast('Cet email est reserve a l\'administrateur', 'error');
    return;
  }
  if (USERS.comptes.find(function(u){ return u.email.toLowerCase() === email.toLowerCase(); })) {
    toast('Un compte existe deja avec cet email', 'error');
    return;
  }

  // Empecher la creation d'un autre administrateur
  if (role === 'administrateur') {
    toast('Le role Administrateur est unique et reserve', 'error');
    return;
  }

  var newUser = {
    id: USERS.seq++,
    nom: nom,
    email: email,
    pwd: pwd,
    role: role,
    sm: sm,
    actif: true,
    derniere_co: null
  };
  USERS.comptes.push(newUser);
  saveUsers();
  renderUsers();
  closeM('m-user');
  toast(nom + ' ajoute comme ' + getRoleLabel(role), 'success');
  ['usr-nom','usr-email','usr-pwd'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
}

// ── Modifier un utilisateur ──
function editUser(id) {
  var u = USERS.comptes.find(function(x){ return x.id === id; });
  if (!u) return;
  document.getElementById('usr-nom').value   = u.nom;
  document.getElementById('usr-email').value = u.email;
  document.getElementById('usr-pwd').value   = u.pwd;
  document.getElementById('usr-role').value  = u.role;
  if (document.getElementById('usr-sm')) document.getElementById('usr-sm').value = u.sm;
  var btn = document.getElementById('usr-save-btn');
  if (btn) { btn.textContent = 'Enregistrer'; btn.onclick = function(){ saveEditUser(id); }; }
  var mh = document.querySelector('#m-user .mh h3');
  if (mh) mh.textContent = 'Modifier l\'utilisateur';
  openM('m-user');
}

// ── Sauvegarder modification ──
function saveEditUser(id) {
  var u = USERS.comptes.find(function(x){ return x.id === id; });
  if (!u) return;
  u.nom   = document.getElementById('usr-nom').value.trim()   || u.nom;
  u.email = document.getElementById('usr-email').value.trim() || u.email;
  u.pwd   = document.getElementById('usr-pwd').value.trim()   || u.pwd;
  u.role  = document.getElementById('usr-role').value;
  u.sm    = document.getElementById('usr-sm') ? document.getElementById('usr-sm').value : u.sm;
  saveUsers();
  renderUsers();
  closeM('m-user');
  toast('Utilisateur modifie avec succes', 'success');
  var btn = document.getElementById('usr-save-btn');
  if (btn) { btn.textContent = 'Ajouter'; btn.onclick = ajouterUser; }
  var mh = document.querySelector('#m-user .mh h3');
  if (mh) mh.textContent = 'Nouvel utilisateur';
}

// ── Activer / Desactiver ──
function toggleUser(id) {
  var u = USERS.comptes.find(function(x){ return x.id === id; });
  if (!u) return;
  u.actif = !u.actif;
  saveUsers();
  renderUsers();
  toast(u.nom + ' ' + (u.actif ? 'active' : 'desactive'), 'success');
}
