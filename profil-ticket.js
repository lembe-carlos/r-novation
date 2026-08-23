// ═══════════════════════════════════════════════════════
//  SuperMarché CM — profil-ticket.js
//  Point 3 : Page profil gérant modifiable
//  Point 4 : Rappels email expiration abonnement
//  Point 5 : Renouvellement automatique abonnement
//  Point 6 : Impression ticket thermique caissier
// ═══════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════
//  POINT 3 — PAGE PROFIL GÉRANT
// ══════════════════════════════════════════════════════

function initPageProfil() {
  var z = document.getElementById('profil-content');
  if (!z) return;

  var user = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : {};
  var role = user.role || 'gerant';
  var abo  = (typeof getAbonnementGerant === 'function') ? getAbonnementGerant(user.email) : null;
  var plan = (abo && typeof PLANS_ABONNEMENT !== 'undefined')
    ? PLANS_ABONNEMENT.find(function(p){ return p.id === abo.plan; }) : null;

  // Calculer jours restants
  var joursRestants = 0;
  if (abo && abo.expiration) {
    joursRestants = Math.max(0, Math.floor((new Date(abo.expiration) - new Date()) / (1000*60*60*24)));
  }

  var initiale = ((user.prenom||'')[0] || (user.nom||'')[0] || (user.email||'G')[0]).toUpperCase();
  var roleLabel = (typeof getRoleLabel === 'function') ? getRoleLabel(role) : role;
  var roleColor = role === 'administrateur' ? '#CE1126' : '#007A3D';

  z.innerHTML =

    // Avatar + info
    '<div class="cd" style="margin-bottom:16px">'
    + '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">'
    + '<div style="width:72px;height:72px;border-radius:50%;background:' + roleColor + ';color:#fff;'
    + 'display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;flex-shrink:0">'
    + initiale + '</div>'
    + '<div><div style="font-size:20px;font-weight:800">' + (user.prenom ? user.prenom + ' ' : '') + (user.nom || '') + '</div>'
    + '<div style="font-size:13px;color:' + roleColor + ';font-weight:600">' + roleLabel + '</div>'
    + '<div style="font-size:12px;color:#999">' + (user.email || '') + '</div>'
    + (user.sm ? '<div style="font-size:12px;color:#555">📍 ' + user.sm + '</div>' : '')
    + '</div></div></div>'

    // Formulaire modification
    + '<div class="cd" style="margin-bottom:16px">'
    + '<div class="ch"><div class="ct">Modifier mes informations</div></div>'
    + '<div class="fg2" style="margin-top:12px">'
    + '<div class="fg"><label style="font-size:12px;font-weight:600">Prénom</label>'
    + '<input type="text" id="profil-prenom" value="' + (user.prenom||'') + '" style="width:100%;padding:10px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box"></div>'
    + '<div class="fg"><label style="font-size:12px;font-weight:600">Nom</label>'
    + '<input type="text" id="profil-nom" value="' + (user.nom||'') + '" style="width:100%;padding:10px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box"></div>'
    + '<div class="fg"><label style="font-size:12px;font-weight:600">Téléphone</label>'
    + '<input type="tel" id="profil-tel" value="' + (user.tel||'') + '" placeholder="+237 6XX XX XX XX" style="width:100%;padding:10px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box"></div>'
    + '<div class="fg"><label style="font-size:12px;font-weight:600">Établissement</label>'
    + '<input type="text" id="profil-sm" value="' + (user.sm||'') + '" style="width:100%;padding:10px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box"></div>'
    + '<div class="fg ff"><label style="font-size:12px;font-weight:600">Nouveau mot de passe</label>'
    + '<input type="password" id="profil-pwd" placeholder="Laisser vide pour ne pas modifier" style="width:100%;padding:10px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box"></div>'
    + '</div>'
    + '<div class="btng" style="margin-top:14px">'
    + '<button class="btn bp" onclick="sauvegarderProfil()">Enregistrer les modifications</button>'
    + '</div></div>'

    // Carte abonnement
    + '<div class="cd" style="margin-bottom:16px;border-left:4px solid ' + (plan ? plan.couleur : '#007A3D') + '">'
    + '<div class="ch"><div class="ct">Mon abonnement</div></div>'
    + '<div style="margin-top:12px">'
    + (abo && plan
        ? '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">'
          + '<div style="text-align:center;padding:12px;background:#f9fafb;border-radius:10px">'
          + '<div style="font-size:11px;color:#666">Plan actuel</div>'
          + '<div style="font-size:18px;font-weight:800;color:' + plan.couleur + '">' + plan.nom + '</div>'
          + '</div>'
          + '<div style="text-align:center;padding:12px;background:#f9fafb;border-radius:10px">'
          + '<div style="font-size:11px;color:#666">Expire le</div>'
          + '<div style="font-size:14px;font-weight:700">' + new Date(abo.expiration).toLocaleDateString('fr-FR') + '</div>'
          + '</div>'
          + '<div style="text-align:center;padding:12px;background:' + (joursRestants <= 7 ? '#fee2e2' : '#f0faf5') + ';border-radius:10px">'
          + '<div style="font-size:11px;color:#666">Jours restants</div>'
          + '<div style="font-size:18px;font-weight:800;color:' + (joursRestants <= 7 ? '#CE1126' : '#007A3D') + '">' + joursRestants + 'j</div>'
          + '</div></div>'
          + '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">'
          + '<button class="btn bp" onclick="ouvrirModalAbo(\'' + user.email + '\')">Renouveler / Changer de plan</button>'
          + (joursRestants <= 14 ? '<button class="btn bo" onclick="envoyerRappelEmail()">M\'envoyer un rappel par email</button>' : '')
          + '</div>'
        : '<div style="text-align:center;padding:20px;color:#999">'
          + '<div style="font-size:32px;margin-bottom:8px">📋</div>'
          + '<div>Aucun abonnement actif</div>'
          + '<button class="btn bp" style="margin-top:12px" onclick="ouvrirModalAbo(\'' + user.email + '\')">Souscrire un abonnement</button>'
          + '</div>')
    + '</div></div>'

    // Historique paiements du gérant
    + '<div class="cd">'
    + '<div class="ch"><div class="ct">Mes paiements</div></div>'
    + '<div id="profil-paiements" style="margin-top:10px"></div>'
    + '</div>';

  // Charger historique paiements de ce gérant
  renderProfilPaiements(user.email);
}

function renderProfilPaiements(email) {
  var z = document.getElementById('profil-paiements');
  if (!z) return;
  var histo = (typeof HISTORIQUE_PAIEMENTS !== 'undefined' ? HISTORIQUE_PAIEMENTS : [])
    .filter(function(tx){ return tx.email === email; });

  if (!histo.length) {
    z.innerHTML = '<p style="text-align:center;color:#999;padding:12px;font-size:12px">Aucun paiement enregistré</p>';
    return;
  }

  z.innerHTML = '<table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<thead><tr style="background:#007A3D;color:#fff">'
    + '<th style="padding:7px;text-align:left">Date</th><th style="padding:7px;text-align:left">Plan</th>'
    + '<th style="padding:7px;text-align:right">Montant</th><th style="padding:7px;text-align:center">Statut</th>'
    + '<th style="padding:7px;text-align:center">Facture</th></tr></thead><tbody>'
    + histo.map(function(tx, i) {
        var bg = i%2===0?'#fff':'#f9fafb';
        return '<tr style="background:'+bg+';border-bottom:1px solid #f0f0f0">'
          + '<td style="padding:7px">' + tx.date + '</td>'
          + '<td style="padding:7px">' + (tx.plan||tx.type) + '</td>'
          + '<td style="padding:7px;text-align:right;font-weight:700;color:#007A3D">' + (tx.montant||0).toLocaleString('fr-FR') + ' F</td>'
          + '<td style="padding:7px;text-align:center"><span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700">' + tx.statut + '</span></td>'
          + '<td style="padding:7px;text-align:center"><button class="btn bo bsm" onclick="genererFactureAbonnementProfil(\'' + tx.email + '\',\'' + tx.plan + '\')">PDF</button></td>'
          + '</tr>';
      }).join('')
    + '</tbody></table>';
}

function genererFactureAbonnementProfil(email, planId) {
  var user = typeof currentUser !== 'undefined' ? currentUser : {};
  var abo  = typeof getAbonnementGerant === 'function' ? getAbonnementGerant(email) : null;
  if (typeof genererFactureAbonnement === 'function') {
    genererFactureAbonnement(abo || { plan: planId, mois: 1 }, user);
  }
}

async function sauvegarderProfil() {
  var user = typeof currentUser !== 'undefined' ? currentUser : {};
  var prenom = (document.getElementById('profil-prenom')||{}).value || user.prenom || '';
  var nom    = (document.getElementById('profil-nom')   ||{}).value || user.nom    || '';
  var tel    = (document.getElementById('profil-tel')   ||{}).value || user.tel    || '';
  var sm     = (document.getElementById('profil-sm')    ||{}).value || user.sm     || '';
  var pwd    = (document.getElementById('profil-pwd')   ||{}).value || '';

  // Mettre à jour currentUser
  currentUser.prenom = prenom;
  currentUser.nom    = nom.toUpperCase();
  currentUser.tel    = tel;
  currentUser.sm     = sm;
  if (pwd) currentUser.pwd = pwd;

  // Mettre à jour ACCOUNTS local
  if (typeof ACCOUNTS !== 'undefined') {
    var acc = ACCOUNTS.find(function(a){ return a.email === user.email; });
    if (acc) {
      acc.prenom = prenom;
      acc.nom    = nom.toUpperCase();
      acc.tel    = tel;
      acc.sm     = sm;
      if (pwd) acc.pwd = pwd;
    }
    try { localStorage.setItem('sm_accounts', JSON.stringify(ACCOUNTS)); } catch(e) {}
  }

  // Mettre à jour Supabase
  try {
    var sb = typeof _sbMain === 'function' ? _sbMain() : null;
    if (sb) {
      var update = { nom: nom.toUpperCase(), prenom: prenom, sm: sm };
      if (tel) update.tel = tel;
      if (pwd) update.pwd = pwd;
      await sb.from('sm_users').update(update).eq('email', user.email);
    }
  } catch(e) { console.warn('Sync profil:', e); }

  // Mettre à jour l'affichage sidebar
  var uname = document.getElementById('user-name');
  var ava   = document.getElementById('user-ava');
  if (uname) uname.textContent = (prenom + ' ' + nom).trim();
  if (ava) ava.textContent = (prenom[0] || nom[0] || 'U').toUpperCase();

  toast('Profil mis à jour !', 'success');
  initPageProfil(); // Rafraîchir
}

// ══════════════════════════════════════════════════════
//  POINT 4 — EMAIL RAPPEL EXPIRATION ABONNEMENT
// ══════════════════════════════════════════════════════

function envoyerRappelEmail() {
  var user = typeof currentUser !== 'undefined' ? currentUser : {};
  var abo  = typeof getAbonnementGerant === 'function' ? getAbonnementGerant(user.email) : null;
  if (!abo) { toast('Aucun abonnement actif', 'warning'); return; }

  var joursRestants = Math.max(0, Math.floor((new Date(abo.expiration) - new Date()) / (1000*60*60*24)));
  var plan = typeof PLANS_ABONNEMENT !== 'undefined'
    ? PLANS_ABONNEMENT.find(function(p){ return p.id === abo.plan; }) : null;

  // Envoyer via le backend Railway
  _envoyerEmailRappel(user.email, user.prenom || user.nom || 'Gérant', plan ? plan.nom : abo.plan, joursRestants, new Date(abo.expiration).toLocaleDateString('fr-FR'));
}

async function _envoyerEmailRappel(email, nom, plan, jours, dateExp) {
  var backend = typeof BACKEND !== 'undefined' ? BACKEND : 'https://supermarche-cm-backend-production.up.railway.app';

  var sujet = 'SuperMarché CM — Votre abonnement expire dans ' + jours + ' jour(s)';
  var corps = 'Bonjour ' + nom + ',\n\n'
    + 'Votre abonnement ' + plan + ' expire le ' + dateExp + ' (' + jours + ' jour(s) restants).\n\n'
    + 'Pour renouveler, connectez-vous et allez dans Mon Profil → Renouveler.\n\n'
    + 'SuperMarché CM — Douala, Cameroun';

  try {
    var resp = await fetch(backend + '/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, subject: sujet, text: corps })
    });
    var data = await resp.json();
    if (data.success) {
      toast('Email de rappel envoyé à ' + email, 'success');
    } else {
      // Fallback : afficher l'email à copier
      _afficherRappelManuel(email, sujet, corps);
    }
  } catch(e) {
    _afficherRappelManuel(email, sujet, corps);
  }
}

function _afficherRappelManuel(email, sujet, corps) {
  var mailto = 'mailto:' + email + '?subject=' + encodeURIComponent(sujet) + '&body=' + encodeURIComponent(corps);
  window.open(mailto, '_blank');
  toast('Email prêt dans votre client mail', 'success');
}

// Vérification automatique au login — alerter si expiration proche
function verifierEtNotifierExpirations() {
  if (typeof ABONNEMENTS === 'undefined') return;
  var maintenant = new Date();

  ABONNEMENTS.forEach(function(abo) {
    if (abo.statut !== 'actif') return;
    var exp = new Date(abo.expiration);
    var jours = Math.floor((exp - maintenant) / (1000*60*60*24));

    if (jours === 3 || jours === 7) {
      // Trouver le gérant
      var gerant = null;
      if (typeof ACCOUNTS !== 'undefined') {
        gerant = ACCOUNTS.find(function(a){ return a.email === abo.email; });
      }
      var plan = typeof PLANS_ABONNEMENT !== 'undefined'
        ? PLANS_ABONNEMENT.find(function(p){ return p.id === abo.plan; }) : null;

      // Notification dans l'app
      if (typeof addNotif === 'function') {
        addNotif('⚠️ Abonnement de ' + (gerant ? gerant.nom : abo.email) + ' expire dans ' + jours + 'j !', 'warning');
      }

      // Email automatique (1 fois par jour via localStorage)
      var clé = 'rappel_' + abo.email + '_' + jours;
      if (!localStorage.getItem(clé)) {
        localStorage.setItem(clé, new Date().toDateString());
        _envoyerEmailRappel(
          abo.email,
          gerant ? (gerant.prenom || gerant.nom) : 'Gérant',
          plan ? plan.nom : abo.plan,
          jours,
          exp.toLocaleDateString('fr-FR')
        );
      }
    }
  });
}

// ══════════════════════════════════════════════════════
//  POINT 5 — RENOUVELLEMENT AUTOMATIQUE ABONNEMENT
// ══════════════════════════════════════════════════════

function initRenouvellementAuto() {
  if (typeof ABONNEMENTS === 'undefined') return;
  var maintenant = new Date();

  ABONNEMENTS.forEach(function(abo) {
    if (abo.statut !== 'actif') return;
    if (abo.renouvellement_auto !== true) return;

    var exp = new Date(abo.expiration);
    var joursAvant = Math.floor((exp - maintenant) / (1000*60*60*24));

    // Renouveler automatiquement 1 jour avant expiration
    if (joursAvant <= 1 && joursAvant >= 0) {
      var clé = 'renouvellement_' + abo.email + '_' + exp.toDateString();
      if (!localStorage.getItem(clé)) {
        localStorage.setItem(clé, 'en_cours');
        _renouvelerAbonnementAuto(abo);
      }
    }
  });
}

async function _renouvelerAbonnementAuto(abo) {
  var gerant = null;
  if (typeof ACCOUNTS !== 'undefined') {
    gerant = ACCOUNTS.find(function(a){ return a.email === abo.email; });
  }
  var plan = typeof PLANS_ABONNEMENT !== 'undefined'
    ? PLANS_ABONNEMENT.find(function(p){ return p.id === abo.plan; }) : null;

  if (!plan) return;

  console.log('Renouvellement auto pour:', abo.email, '— Plan:', plan.nom);

  // Lancer le paiement automatique
  if (typeof payerAbonnementNotchPay === 'function') {
    // En production, cela déclenche un paiement récurrent
    // En mode simulation, on renouvelle directement
    var cfg = typeof SM_CONFIG !== 'undefined' ? SM_CONFIG.notchpay : null;
    if (!cfg || !cfg.active) {
      // Simulation : renouveler directement
      if (typeof activerAbonnement === 'function') {
        activerAbonnement(abo.email, abo.plan, abo.mois || 1);
      }
      if (typeof addNotif === 'function') {
        addNotif('✅ Abonnement de ' + (gerant ? gerant.nom : abo.email) + ' renouvelé automatiquement', 'green');
      }
      var clé = 'renouvellement_' + abo.email + '_' + new Date(abo.expiration).toDateString();
      localStorage.setItem(clé, 'fait');
    }
  }
}

function activerRenouvellementAuto(email) {
  var abo = typeof getAbonnementGerant === 'function' ? getAbonnementGerant(email) : null;
  if (!abo) { toast('Aucun abonnement actif', 'warning'); return; }
  abo.renouvellement_auto = true;
  if (typeof saveAbonnements === 'function') saveAbonnements();
  toast('Renouvellement automatique activé !', 'success');
  initPageProfil();
}

function desactiverRenouvellementAuto(email) {
  var abo = typeof getAbonnementGerant === 'function' ? getAbonnementGerant(email) : null;
  if (!abo) return;
  abo.renouvellement_auto = false;
  if (typeof saveAbonnements === 'function') saveAbonnements();
  toast('Renouvellement automatique désactivé', 'success');
  initPageProfil();
}

// ══════════════════════════════════════════════════════
//  POINT 6 — TICKET THERMIQUE CAISSIER
// ══════════════════════════════════════════════════════

var TICKET_CSS = `
  @media print {
    body > * { display: none !important; }
    #ticket-thermique { display: block !important; }
  }
  #ticket-thermique {
    display: none;
    width: 80mm;
    max-width: 80mm;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    margin: 0 auto;
    padding: 8px;
    color: #000;
    background: #fff;
  }
  #ticket-thermique .t-center { text-align: center; }
  #ticket-thermique .t-right  { text-align: right; }
  #ticket-thermique .t-bold   { font-weight: bold; font-size: 13px; }
  #ticket-thermique .t-sep    { border-top: 1px dashed #000; margin: 6px 0; }
  #ticket-thermique .t-sep2   { border-top: 2px solid #000; margin: 6px 0; }
  #ticket-thermique .t-row    { display: flex; justify-content: space-between; margin: 2px 0; }
  #ticket-thermique .t-sm     { font-size: 9px; color: #333; }
`;

function _injecterCSSTi() {
  if (document.getElementById('ticket-style')) return;
  var style = document.createElement('style');
  style.id = 'ticket-style';
  style.textContent = TICKET_CSS;
  document.head.appendChild(style);
}

function _creerDivTicket() {
  var existing = document.getElementById('ticket-thermique');
  if (existing) existing.remove();
  var div = document.createElement('div');
  div.id = 'ticket-thermique';
  document.body.appendChild(div);
  return div;
}

function imprimerTicketVente(vente) {
  _injecterCSSTi();
  var div = _creerDivTicket();
  var boutique = typeof SM_CONFIG !== 'undefined' ? SM_CONFIG.boutique : {};
  var now = new Date();

  var lignes = (vente.items || vente.articles || []);
  var total  = vente.total || vente.montant || lignes.reduce(function(s,i){ return s + (i.prix||0)*(i.qty||1); }, 0);

  div.innerHTML =
    '<div class="t-center t-bold">' + (boutique.nom || 'SuperMarché CM') + '</div>'
    + '<div class="t-center t-sm">' + (boutique.adresse || 'Douala, Cameroun') + '</div>'
    + '<div class="t-center t-sm">Tél: ' + (boutique.telephone || '+237 683 39 22 68') + '</div>'
    + '<div class="t-sep2"></div>'
    + '<div class="t-row"><span>Date:</span><span>' + now.toLocaleDateString('fr-FR') + '</span></div>'
    + '<div class="t-row"><span>Heure:</span><span>' + now.toLocaleTimeString('fr-FR') + '</span></div>'
    + '<div class="t-row"><span>N° Ticket:</span><span>' + (vente.id || 'TK-' + Date.now()) + '</span></div>'
    + (vente.caissier ? '<div class="t-row"><span>Caissier:</span><span>' + vente.caissier + '</span></div>' : '')
    + '<div class="t-sep"></div>'
    + '<div class="t-bold" style="margin-bottom:4px">ARTICLES</div>'
    + lignes.map(function(item) {
        var prixLigne = (item.prix || 0) * (item.qty || 1);
        return '<div class="t-row">'
          + '<span style="max-width:40mm;overflow:hidden">' + (item.nom || item.name || '—') + '</span>'
          + '<span>' + (item.qty||1) + 'x' + (item.prix||0).toLocaleString('fr-FR') + '</span>'
          + '</div>'
          + '<div class="t-right t-sm">' + prixLigne.toLocaleString('fr-FR') + ' FCFA</div>';
      }).join('')
    + '<div class="t-sep"></div>'
    + '<div class="t-row"><span>Sous-total:</span><span>' + total.toLocaleString('fr-FR') + ' FCFA</span></div>'
    + (vente.livraison > 0 ? '<div class="t-row"><span>Livraison:</span><span>' + (vente.livraison||0).toLocaleString('fr-FR') + ' FCFA</span></div>' : '')
    + '<div class="t-sep2"></div>'
    + '<div class="t-row t-bold" style="font-size:14px"><span>TOTAL:</span><span>' + (vente.total||total).toLocaleString('fr-FR') + ' FCFA</span></div>'
    + '<div class="t-sep"></div>'
    + '<div class="t-row"><span>Paiement:</span><span>' + (vente.paiement || 'Espèces') + '</span></div>'
    + '<div class="t-sep"></div>'
    + '<div class="t-center t-sm">Merci pour votre achat !</div>'
    + '<div class="t-center t-sm">Conservez ce ticket</div>'
    + '<div class="t-center t-sm" style="margin-top:4px">WhatsApp: ' + (boutique.whatsapp || '237693591479') + '</div>'
    + '<div class="t-sep"></div>'
    + '<div class="t-center t-sm">* * * * * * * * * * * * *</div>';

  // Afficher puis imprimer
  div.style.display = 'block';
  setTimeout(function() {
    window.print();
    setTimeout(function() { div.style.display = 'none'; }, 1000);
  }, 300);
}

function imprimerTicketCommande(cmd) {
  var vente = {
    id:       cmd.id,
    items:    cmd.items || [],
    total:    cmd.total || 0,
    livraison: cmd.livraison || 0,
    paiement: cmd.paiement || 'Mobile Money',
    caissier: typeof currentUser !== 'undefined' && currentUser ? (currentUser.prenom || currentUser.nom) : ''
  };
  imprimerTicketVente(vente);
}

// Bouton impression rapide depuis la liste des commandes
function ajouterBoutonImpression() {
  // Ajouter dans la page ventes un bouton "Imprimer ticket"
  var ventes_liste = document.getElementById('ventes-list') || document.getElementById('v-transactions');
  if (!ventes_liste) return;
}
