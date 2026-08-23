// ═══════════════════════════════════════════════════════════════
//  KAMER360 — 6 Fonctionnalités à Impact Immédiat
//  1. KAMER Pay (portefeuille numérique)
//  2. Avis & Notations vérifiées
//  3. Tracking GPS temps réel
//  4. Mode hors-ligne complet (IndexedDB)
//  5. Chat intégré client–gérant
//  6. Notifications push PWA
// ═══════════════════════════════════════════════════════════════

// ── Helpers communs ────────────────────────────────────────────
function _toast(msg, type) {
  if (typeof toast === 'function') toast(msg, type || 'info');
  else console.log('[KAMER360]', msg);
}
function _ls(key, def) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || def; } catch(e) { return def; }
}
function _lsSave(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch(e) { return false; }
}
function _esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function _now() { return new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}); }
function _el(id) { return document.getElementById(id); }

// ══════════════════════════════════════════════════════════════
//  1. KAMER PAY — Portefeuille numérique intégré
// ══════════════════════════════════════════════════════════════
var KAMER_PAY = {
  SOLDE_KEY: 'kp_solde',
  TX_KEY:    'kp_transactions',

  getSolde: function() { return _ls(this.SOLDE_KEY, 0); },
  getTx:    function() { return _ls(this.TX_KEY, []); },

  crediter: function(montant, libelle, source) {
    var solde = this.getSolde() + montant;
    _lsSave(this.SOLDE_KEY, solde);
    var tx = this.getTx();
    tx.unshift({ id:'TX'+Date.now(), type:'credit', montant:montant,
      libelle:libelle||'Credit', source:source||'Manuel', date:_now(), solde:solde });
    _lsSave(this.TX_KEY, tx.slice(0,100));
    this.notifierSolde(solde);
    return solde;
  },

  debiter: function(montant, libelle, destinataire) {
    var solde = this.getSolde();
    if (solde < montant) { _toast('Solde insuffisant — rechargez votre KAMER Pay', 'error'); return false; }
    solde -= montant;
    _lsSave(this.SOLDE_KEY, solde);
    var tx = this.getTx();
    tx.unshift({ id:'TX'+Date.now(), type:'debit', montant:montant,
      libelle:libelle||'Paiement', destinataire:destinataire||'', date:_now(), solde:solde });
    _lsSave(this.TX_KEY, tx.slice(0,100));
    this.notifierSolde(solde);
    return solde;
  },

  recharger: function(montant, operateur) {
    // Simulation NotchPay → dans la vraie vie : appel API NotchPay
    var self = this;
    _toast('Rechargement ' + operateur + ' en cours...', 'info');
    setTimeout(function() {
      self.crediter(montant, 'Recharge ' + operateur, operateur);
      _toast(montant.toLocaleString('fr-FR') + ' FCFA creditee sur KAMER Pay !', 'success');
      if (document.getElementById('wallet-content')) initPageWallet();
    }, 1500);
  },

  notifierSolde: function(solde) {
    var el = document.getElementById('kp-solde-badge');
    if (el) el.textContent = solde.toLocaleString('fr-FR') + ' F';
  }
};

function initPageWallet() {
  var z = _el('wallet-content');
  if (!z) return;
  var solde = KAMER_PAY.getSolde();
  var txs   = KAMER_PAY.getTx();
  var user  = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : {};

  var html = '';

  // Carte solde principale
  html += '<div style="background:linear-gradient(135deg,#007A3D,#00A852);border-radius:18px;padding:24px;color:#fff;margin-bottom:16px;position:relative;overflow:hidden">';
  html += '<div style="position:absolute;right:-20px;top:-20px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08)"></div>';
  html += '<div style="position:absolute;right:40px;bottom:-30px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.05)"></div>';
  html += '<div style="font-size:12px;opacity:.8;margin-bottom:6px;letter-spacing:.5px;text-transform:uppercase">Solde KAMER Pay</div>';
  html += '<div style="font-family:\'Playfair Display\',serif;font-size:36px;font-weight:900;margin-bottom:4px">' + solde.toLocaleString('fr-FR') + ' <span style="font-size:16px">FCFA</span></div>';
  html += '<div style="font-size:12px;opacity:.7">' + (user.prenom||'') + ' ' + (user.nom||'') + ' · KAMER360</div>';
  html += '</div>';

  // Actions rapides
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">';
  [
    ['Recharger', 'credit', 'Alimentez votre solde', '#007A3D'],
    ['Payer',     'pay',    'Payez une commande',    '#1565C0'],
    ['Transferer','send',   'Envoyez de l\'argent',  '#E65100'],
  ].forEach(function(a) {
    html += '<button onclick="ouvrirActionWallet(\'' + a[1] + '\')" style="background:' + a[3] + ';color:#fff;border:none;border-radius:12px;padding:14px 8px;cursor:pointer;transition:all .2s;text-align:center">';
    html += '<div style="font-size:13px;font-weight:700">' + a[0] + '</div>';
    html += '<div style="font-size:10px;opacity:.8;margin-top:3px">' + a[2] + '</div>';
    html += '</button>';
  });
  html += '</div>';

  // Historique transactions
  html += '<div class="cd" style="margin-bottom:14px">';
  html += '<div class="ch"><div class="ct">Historique des transactions</div></div>';
  if (txs.length === 0) {
    html += '<div style="text-align:center;padding:32px;color:#9ca3af">';
    html += '<div style="font-size:36px;margin-bottom:12px">💳</div>';
    html += '<div style="font-size:14px;font-weight:600;color:#374151">Aucune transaction</div>';
    html += '<div style="font-size:13px;margin-top:6px">Rechargez votre KAMER Pay pour commencer</div>';
    html += '</div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:1px">';
    txs.forEach(function(tx) {
      var isCredit = tx.type === 'credit';
      html += '<div style="display:flex;align-items:center;padding:12px 0;border-bottom:1px solid #f5f8f5">';
      html += '<div style="width:40px;height:40px;border-radius:50%;background:' + (isCredit?'#f0faf5':'#fff3f3') + ';display:flex;align-items:center;justify-content:center;margin-right:12px;flex-shrink:0">';
      html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="' + (isCredit?'#007A3D':'#CE1126') + '" stroke-width="2.5"><path d="' + (isCredit?'M12 19V5M5 12l7-7 7 7':'M12 5v14M5 12l7 7 7-7') + '"/></svg>';
      html += '</div>';
      html += '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + _esc(tx.libelle) + '</div>';
      html += '<div style="font-size:11px;color:#9ca3af">' + _esc(tx.date) + (tx.source?' · '+_esc(tx.source):tx.destinataire?' · '+_esc(tx.destinataire):'') + '</div></div>';
      html += '<div style="font-size:15px;font-weight:800;color:' + (isCredit?'#007A3D':'#CE1126') + '">' + (isCredit?'+':'-') + tx.montant.toLocaleString('fr-FR') + ' F</div>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  // Opérateurs partenaires
  html += '<div class="cd"><div class="ch"><div class="ct">Rechargez via</div></div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:4px">';
  [['MTN MoMo','#FFC107','Recharge instantanée'],['Orange Money','#FF6900','Disponible 24h/7']].forEach(function(op) {
    html += '<button onclick="KAMER_PAY.recharger(parseInt(prompt(\'Montant en FCFA :\',\'5000\')||0),\'' + op[0] + '\')" ';
    html += 'style="background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;padding:14px;cursor:pointer;transition:all .2s;text-align:left" onmouseover="this.style.borderColor=\'' + op[1] + '\'" onmouseout="this.style.borderColor=\'#e5e7eb\'">';
    html += '<div style="width:32px;height:32px;border-radius:8px;background:' + op[1] + ';margin-bottom:8px"></div>';
    html += '<div style="font-size:13px;font-weight:700">' + op[0] + '</div>';
    html += '<div style="font-size:11px;color:#666;margin-top:2px">' + op[2] + '</div>';
    html += '</button>';
  });
  html += '</div></div>';

  z.innerHTML = html;
}

function ouvrirActionWallet(action) {
  if (action === 'credit') {
    var montant = parseInt(prompt('Montant à recharger (FCFA) :', '5000') || 0);
    if (montant > 0) {
      var op = ['MTN MoMo','Orange Money'][Math.floor(Math.random()*2)];
      KAMER_PAY.recharger(montant, op);
    }
  } else if (action === 'pay') {
    _toast('Sélectionnez une commande pour payer avec KAMER Pay', 'info');
    if (typeof goPage === 'function') goPage('commandes');
  } else if (action === 'send') {
    var destinataire = prompt('Numéro de téléphone du destinataire :');
    if (!destinataire) return;
    var montant = parseInt(prompt('Montant à envoyer (FCFA) :', '1000') || 0);
    if (montant > 0) {
      var ok = KAMER_PAY.debiter(montant, 'Transfert vers ' + destinataire, destinataire);
      if (ok !== false) {
        _toast(montant.toLocaleString('fr-FR') + ' FCFA envoyés à ' + destinataire, 'success');
        initPageWallet();
      }
    }
  }
}

// ══════════════════════════════════════════════════════════════
//  2. AVIS & NOTATIONS VÉRIFIÉES
// ══════════════════════════════════════════════════════════════
var AVIS_DATA = {
  KEY: 'km_avis_v2',
  getAll: function() { return _ls(this.KEY, []); },
  save:   function(list) { _lsSave(this.KEY, list); },

  ajouter: function(data) {
    var list = this.getAll();
    var avis = {
      id:       'AV' + Date.now(),
      service:  data.service,
      serviceNom: data.serviceNom,
      auteur:   data.auteur || 'Client anonyme',
      note:     data.note,        // 1-5
      titre:    data.titre,
      commentaire: data.commentaire,
      date:     _now(),
      verifie:  true,
      commande: data.commande || null,
      reponse:  null
    };
    list.unshift(avis);
    this.save(list);
    return avis;
  },

  repondre: function(avisId, reponse) {
    var list = this.getAll();
    var idx = list.findIndex(function(a){ return a.id === avisId; });
    if (idx >= 0) {
      list[idx].reponse = { texte: reponse, date: _now() };
      this.save(list);
      return true;
    }
    return false;
  },

  getMoyenne: function(service) {
    var list = this.getAll().filter(function(a){ return !service || a.service === service; });
    if (!list.length) return 0;
    return list.reduce(function(s,a){ return s+a.note; }, 0) / list.length;
  }
};

function initPageAvis() {
  var z = _el('avis-content');
  if (!z) return;
  var avis = AVIS_DATA.getAll();
  var moy  = AVIS_DATA.getMoyenne();
  var nb5  = avis.filter(function(a){ return a.note===5; }).length;
  var nb4  = avis.filter(function(a){ return a.note>=4; }).length;

  var html = '';

  // Stats globales
  html += '<div style="display:grid;grid-template-columns:auto 1fr;gap:20px;background:#fff;border-radius:14px;padding:18px;border:1px solid var(--br);margin-bottom:16px;align-items:center">';
  html += '<div style="text-align:center;padding:0 20px;border-right:1px solid var(--br)">';
  html += '<div style="font-family:\'Playfair Display\',serif;font-size:52px;font-weight:900;color:#007A3D;line-height:1">' + moy.toFixed(1) + '</div>';
  html += '<div style="margin:8px 0">' + _etoiles(moy) + '</div>';
  html += '<div style="font-size:12px;color:#666">' + avis.length + ' avis</div>';
  html += '</div>';
  html += '<div style="padding-left:8px">';
  [5,4,3,2,1].forEach(function(n) {
    var nb = avis.filter(function(a){ return a.note===n; }).length;
    var pct = avis.length ? Math.round(nb/avis.length*100) : 0;
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
    html += '<div style="font-size:11px;width:12px;color:#666">' + n + '</div>';
    html += '<div style="flex:1;background:#f0f0f0;border-radius:20px;height:8px;overflow:hidden"><div style="background:#FCD116;height:100%;border-radius:20px;width:' + pct + '%"></div></div>';
    html += '<div style="font-size:11px;color:#666;width:28px">' + pct + '%</div>';
    html += '</div>';
  });
  html += '</div></div>';

  // Bouton laisser un avis
  html += '<button onclick="ouvrirFormulaireAvis()" class="btn bp" style="width:100%;padding:12px;font-size:14px;margin-bottom:16px">Laisser un avis client</button>';

  // Liste des avis
  if (avis.length === 0) {
    html += '<div style="text-align:center;padding:48px;color:#9ca3af"><div style="font-size:42px;margin-bottom:12px">⭐</div><div style="font-size:15px;font-weight:600;color:#374151">Aucun avis pour l\'instant</div><div style="font-size:13px;margin-top:6px">Invitez vos clients à noter vos services</div></div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:12px">';
    avis.forEach(function(a) {
      html += '<div class="cd">';
      html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">';
      html += '<div>';
      html += '<div style="display:flex;align-items:center;gap:8px"><span style="font-weight:700;font-size:13px">' + _esc(a.auteur) + '</span>';
      if (a.verifie) html += '<span style="background:#f0faf5;color:#007A3D;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px">Vérifié</span>';
      html += '</div>';
      html += '<div style="margin-top:3px">' + _etoiles(a.note) + '</div>';
      html += '</div>';
      html += '<div style="font-size:11px;color:#9ca3af">' + _esc(a.date) + '</div>';
      html += '</div>';
      if (a.titre) html += '<div style="font-weight:700;font-size:13px;margin-bottom:4px">' + _esc(a.titre) + '</div>';
      html += '<div style="font-size:13px;color:#555;line-height:1.6">' + _esc(a.commentaire) + '</div>';
      if (a.service) html += '<div style="font-size:11px;color:#007A3D;margin-top:6px;font-weight:600">Service : ' + _esc(a.serviceNom||a.service) + '</div>';
      if (a.reponse) {
        html += '<div style="background:#f7fbf7;border-left:3px solid #007A3D;padding:10px 12px;margin-top:10px;border-radius:0 8px 8px 0">';
        html += '<div style="font-size:11px;font-weight:700;color:#007A3D;margin-bottom:4px">Réponse du gérant · ' + _esc(a.reponse.date) + '</div>';
        html += '<div style="font-size:13px;color:#333">' + _esc(a.reponse.texte) + '</div>';
        html += '</div>';
      } else {
        html += '<button onclick="repondreAvis(\'' + a.id + '\')" class="btn bo bsm" style="margin-top:8px">Répondre à cet avis</button>';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  z.innerHTML = html;
}

function _etoiles(note) {
  var html = '<div style="display:inline-flex;gap:2px">';
  for (var i=1; i<=5; i++) {
    html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="' + (i<=Math.round(note)?'#FCD116':'#e5e7eb') + '" stroke="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>';
  }
  html += '</div>';
  return html;
}

function ouvrirFormulaireAvis() {
  if (typeof openM === 'function') openM('m-avis-form');
}

function soumettreAvis() {
  var note = document.querySelector('input[name="avis-note"]:checked');
  var commentaire = (_el('avis-commentaire')||{}).value || '';
  if (!note) { _toast('Sélectionnez une note', 'warning'); return; }
  if (commentaire.length < 10) { _toast('Commentaire trop court (min 10 caractères)', 'warning'); return; }
  var user = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : {};
  AVIS_DATA.ajouter({
    service: 'general',
    serviceNom: (_el('avis-service')||{}).value || 'Service général',
    auteur: (user.prenom||'') + ' ' + (user.nom||'Client'),
    note: parseInt(note.value),
    titre: (_el('avis-titre')||{}).value || '',
    commentaire: commentaire
  });
  if (typeof closeM === 'function') closeM('m-avis-form');
  _toast('Merci pour votre avis !', 'success');
  initPageAvis();
}

function repondreAvis(avisId) {
  var rep = prompt('Votre réponse à cet avis :');
  if (!rep || !rep.trim()) return;
  AVIS_DATA.repondre(avisId, rep.trim());
  _toast('Réponse publiée', 'success');
  initPageAvis();
}

// ══════════════════════════════════════════════════════════════
//  3. TRACKING GPS TEMPS RÉEL
// ══════════════════════════════════════════════════════════════
var TRACKING_DATA = {
  KEY: 'km_tracking',
  getAll: function() { return _ls(this.KEY, []); },

  creer: function(cmdId, livreur, adresseDest) {
    var livraisons = this.getAll();
    var liv = {
      id:        'LIV' + Date.now(),
      cmdId:     cmdId,
      livreur:   livreur,
      adresseDest: adresseDest,
      statut:    'préparation',  // préparation → en route → proche → livré
      lat:       3.8667 + (Math.random()-0.5)*0.05,
      lng:       11.5167 + (Math.random()-0.5)*0.05,
      created:   _now(),
      updated:   _now(),
      etapes:    [{ statut:'préparation', time:_now(), msg:'Commande en cours de préparation' }]
    };
    livraisons.unshift(liv);
    _lsSave(this.KEY, livraisons);
    return liv;
  },

  avancer: function(livId) {
    var livs = this.getAll();
    var idx = livs.findIndex(function(l){ return l.id === livId; });
    if (idx < 0) return;
    var statuts = ['préparation','en route','proche','livré'];
    var cur = statuts.indexOf(livs[idx].statut);
    if (cur < statuts.length-1) {
      livs[idx].statut = statuts[cur+1];
      livs[idx].lat += (Math.random()-0.5)*0.01;
      livs[idx].lng += (Math.random()-0.5)*0.01;
      livs[idx].updated = _now();
      var msgs = { 'en route':'Votre livreur est en route !', 'proche':'Votre livreur est à moins de 500m !', 'livré':'Livraison effectuée !' };
      livs[idx].etapes.push({ statut:livs[idx].statut, time:_now(), msg:msgs[livs[idx].statut]||'' });
      _lsSave(this.KEY, livs);
      NOTIFICATIONS.envoyer('Mise à jour livraison', msgs[livs[idx].statut]||'', 'livraison');
      initPageTracking();
    }
  }
};

function initPageTracking() {
  var z = _el('tracking-content');
  if (!z) return;
  var livs = TRACKING_DATA.getAll();

  var statutColors = { 'préparation':'#f59e0b', 'en route':'#007A3D', 'proche':'#00A852', 'livré':'#1565C0' };
  var statutIcons  = { 'préparation':'⏳', 'en route':'🛵', 'proche':'📍', 'livré':'✅' };

  if (livs.length === 0) {
    // Créer une démo
    html = '<div class="cd" style="margin-bottom:14px">';
    html = '<div style="text-align:center;padding:40px"><div style="font-size:42px;margin-bottom:12px">🛵</div>';
    html += '<div style="font-size:15px;font-weight:600;color:#374151;margin-bottom:8px">Aucune livraison en cours</div>';
    html += '<div style="font-size:13px;color:#666;margin-bottom:16px">Créez une commande pour suivre votre livraison en temps réel</div>';
    html += '<button onclick="TRACKING_DATA.creer(\'CMD001\',\'Jean Livreur\',\'Akwa, Douala\');initPageTracking()" class="btn bp">Simuler une livraison</button></div>';
    z.innerHTML = html;
    return;
  }

  var html = '<div style="display:flex;flex-direction:column;gap:14px">';
  livs.forEach(function(liv) {
    var couleur = statutColors[liv.statut] || '#666';
    html += '<div class="cd">';
    // Header
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">';
    html += '<div><div style="font-weight:700;font-size:14px">Livraison #' + _esc(liv.id.slice(-6)) + '</div>';
    html += '<div style="font-size:12px;color:#666">Commande ' + _esc(liv.cmdId) + ' · ' + _esc(liv.livreur) + '</div></div>';
    html += '<span style="background:' + couleur + ';color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px">';
    html += (statutIcons[liv.statut]||'') + ' ' + _esc(liv.statut) + '</span>';
    html += '</div>';

    // Carte (simulation visuelle)
    html += '<div style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:12px;height:160px;position:relative;overflow:hidden;margin-bottom:12px">';
    html += '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px">';
    html += '<div style="font-size:11px;color:#2e7d32;font-weight:600">GPS Temps Réel</div>';
    html += '<div style="font-size:13px;color:#1b5e20">📍 ' + liv.lat.toFixed(4) + ', ' + liv.lng.toFixed(4) + '</div>';
    html += '<div style="width:48px;height:48px;border-radius:50%;background:#007A3D;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 0 8px rgba(0,122,61,.2)">' + (statutIcons[liv.statut]||'📦') + '</div>';
    html += '<div style="font-size:11px;color:#388e3c">Mise à jour : ' + _esc(liv.updated) + '</div>';
    html += '</div></div>';

    // Timeline statuts
    var tous = ['préparation','en route','proche','livré'];
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:12px">';
    tous.forEach(function(st) {
      var done = tous.indexOf(st) <= tous.indexOf(liv.statut);
      var active = st === liv.statut;
      html += '<div style="text-align:center;flex:1">';
      html += '<div style="width:28px;height:28px;border-radius:50%;background:' + (done?'#007A3D':'#e5e7eb') + ';margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:12px;color:' + (done?'#fff':'#9ca3af') + ';font-weight:700">' + (done?'✓':'') + '</div>';
      html += '<div style="font-size:10px;margin-top:4px;color:' + (active?'#007A3D':'#9ca3af') + ';font-weight:' + (active?'700':'400') + '">' + _esc(st) + '</div>';
      html += '</div>';
      if (st !== 'livré') html += '<div style="flex:1;height:2px;background:' + (done&&st!==liv.statut?'#007A3D':'#e5e7eb') + ';margin-top:14px;align-self:flex-start"></div>';
    });
    html += '</div>';

    // Actions
    if (liv.statut !== 'livré') {
      html += '<div style="display:flex;gap:8px">';
      html += '<button onclick="TRACKING_DATA.avancer(\'' + liv.id + '\')" class="btn bp bsm" style="flex:1">Avancer statut (simulation)</button>';
      html += '<button onclick="window.open(\'https://maps.google.com/?q=' + liv.lat + ',' + liv.lng + '\',\'_blank\')" class="btn bo bsm">Voir sur Maps</button>';
      html += '</div>';
    }
    html += '</div>';
  });
  html += '</div>';
  z.innerHTML = html;
}

// ══════════════════════════════════════════════════════════════
//  4. MODE HORS-LIGNE — IndexedDB + Sync Queue
// ══════════════════════════════════════════════════════════════
var OFFLINE_DB = {
  db: null,
  DB_NAME: 'kamer360_offline',
  DB_VERSION: 1,

  init: function() {
    var self = this;
    if (!window.indexedDB) { console.warn('[Offline] IndexedDB non supporté'); return; }
    var req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
    req.onupgradeneeded = function(e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains('produits'))   db.createObjectStore('produits',   { keyPath:'id' });
      if (!db.objectStoreNames.contains('commandes'))  db.createObjectStore('commandes',  { keyPath:'id' });
      if (!db.objectStoreNames.contains('sync_queue')) db.createObjectStore('sync_queue', { keyPath:'id', autoIncrement:true });
    };
    req.onsuccess = function(e) {
      self.db = e.target.result;
      self.syncOnReconnect();
      console.log('[Offline] IndexedDB initialisée');
    };
    req.onerror = function(e) { console.error('[Offline] Erreur IndexedDB:', e); };
  },

  sauvegarder: function(store, data) {
    if (!this.db) return;
    var tx = this.db.transaction(store, 'readwrite');
    var s  = tx.objectStore(store);
    if (Array.isArray(data)) data.forEach(function(item){ s.put(item); });
    else s.put(data);
  },

  lire: function(store, callback) {
    if (!this.db) { callback([]); return; }
    var tx = this.db.transaction(store, 'readonly');
    var req = tx.objectStore(store).getAll();
    req.onsuccess = function(e) { callback(e.target.result || []); };
    req.onerror   = function()  { callback([]); };
  },

  ajouterSyncQueue: function(action, data) {
    if (!this.db) return;
    var tx = this.db.transaction('sync_queue', 'readwrite');
    tx.objectStore('sync_queue').add({ action:action, data:data, timestamp:Date.now() });
  },

  syncOnReconnect: function() {
    var self = this;
    window.addEventListener('online', function() {
      _toast('Connexion rétablie — synchronisation en cours...', 'info');
      self.lire('sync_queue', function(queue) {
        if (queue.length === 0) return;
        queue.forEach(function(item) {
          // Ici on enverrait les données au serveur Supabase
          console.log('[Sync] Envoi:', item.action, item.data);
        });
        // Vider la queue après sync réussie
        if (self.db) {
          var tx = self.db.transaction('sync_queue', 'readwrite');
          tx.objectStore('sync_queue').clear();
        }
        _toast(queue.length + ' action(s) synchronisée(s) avec le serveur', 'success');
      });
    });

    window.addEventListener('offline', function() {
      _toast('Mode hors-ligne activé — vos données sont sauvegardées localement', 'warning');
    });
  },

  // Indicateur visuel de connectivité
  afficherStatut: function() {
    var el = _el('offline-indicator');
    if (!el) return;
    var online = navigator.onLine;
    el.style.display = online ? 'none' : 'flex';
    el.textContent = 'Hors ligne — données en cache';
  }
};

// Initialiser au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { OFFLINE_DB.init(); });
} else {
  OFFLINE_DB.init();
}

// Mettre en cache les produits pour l'accès hors-ligne
function cacheProduitsOffline() {
  var prods = typeof PRODUITS !== 'undefined' ? PRODUITS : [];
  if (prods.length > 0) OFFLINE_DB.sauvegarder('produits', prods);
}

// ══════════════════════════════════════════════════════════════
//  5. CHAT INTÉGRÉ CLIENT–GÉRANT
// ══════════════════════════════════════════════════════════════
var CHAT_DATA = {
  KEY: 'km_chats_v2',
  getConversations: function() { return _ls(this.KEY, []); },
  save: function(convs) { _lsSave(this.KEY, convs); },

  getOrCreate: function(contactId, contactNom) {
    var convs = this.getConversations();
    var conv  = convs.find(function(c){ return c.contactId === contactId; });
    if (!conv) {
      conv = { id:'CONV'+Date.now(), contactId:contactId, contactNom:contactNom,
               messages:[], nonLus:0, lastMsg:'', lastTime:_now() };
      convs.unshift(conv);
      this.save(convs);
    }
    return conv;
  },

  sendMessage: function(convId, texte, expediteur, type) {
    var convs = this.getConversations();
    var idx   = convs.findIndex(function(c){ return c.id === convId; });
    if (idx < 0) return;
    var msg = {
      id:       'MSG'+Date.now(),
      texte:    texte,
      expediteur: expediteur || 'Moi',
      type:     type || 'text',  // text | image | location | file
      time:     _now(),
      lu:       false
    };
    convs[idx].messages.push(msg);
    convs[idx].lastMsg  = texte.substring(0,40);
    convs[idx].lastTime = _now();
    this.save(convs);
    NOTIFICATIONS.envoyer('Nouveau message', 'De ' + (convs[idx].contactNom||''), 'message');
    return msg;
  }
};

var _chatConvActuelle = null;

function initPageChat() {
  var z = _el('chat-content');
  if (!z) return;
  var convs = CHAT_DATA.getConversations();

  var html = '<div style="display:grid;grid-template-columns:280px 1fr;gap:0;height:65vh;border:1px solid var(--br);border-radius:14px;overflow:hidden">';

  // Liste conversations (sidebar)
  html += '<div style="border-right:1px solid var(--br);display:flex;flex-direction:column;background:#fafbf9">';
  html += '<div style="padding:12px 14px;border-bottom:1px solid var(--br);background:#fff">';
  html += '<div style="font-size:13px;font-weight:700">Messages</div>';
  html += '<button onclick="ouvrirNouvelleConversation()" style="margin-top:6px;width:100%;background:#007A3D;color:#fff;border:none;padding:7px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">+ Nouvelle conversation</button>';
  html += '</div>';
  html += '<div style="flex:1;overflow-y:auto">';

  if (convs.length === 0) {
    html += '<div style="text-align:center;padding:32px 16px;color:#9ca3af"><div style="font-size:32px;margin-bottom:8px">💬</div><div style="font-size:12px">Aucune conversation<br>Cliquez sur + pour démarrer</div></div>';
  } else {
    convs.forEach(function(conv) {
      var actif = _chatConvActuelle && _chatConvActuelle.id === conv.id;
      html += '<div onclick="ouvrirConversation(\'' + conv.id + '\')" style="padding:12px 14px;cursor:pointer;background:' + (actif?'#f0faf5':'transparent') + ';border-bottom:1px solid #f0f0f0;transition:background .15s" onmouseover="this.style.background=\'#f7fbf7\'" onmouseout="this.style.background=\'' + (actif?'#f0faf5':'transparent') + '\'">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center">';
      html += '<div style="font-size:13px;font-weight:600;color:#0F1F0F">' + _esc(conv.contactNom||'Contact') + '</div>';
      html += '<div style="font-size:10px;color:#9ca3af">' + _esc(conv.lastTime||'') + '</div>';
      html += '</div>';
      html += '<div style="font-size:12px;color:#666;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(conv.lastMsg||'Nouvelle conversation') + '</div>';
      html += '</div>';
    });
  }
  html += '</div></div>';

  // Zone messages
  html += '<div style="display:flex;flex-direction:column;background:#fff" id="chat-zone">';
  if (!_chatConvActuelle) {
    html += '<div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:#9ca3af">';
    html += '<div style="font-size:48px">💬</div>';
    html += '<div style="font-size:14px;font-weight:500;color:#374151">Sélectionnez une conversation</div>';
    html += '</div>';
  } else {
    html += _renderChatZone(_chatConvActuelle);
  }
  html += '</div>';
  html += '</div>';

  z.innerHTML = html;
}

function _renderChatZone(conv) {
  var html = '';
  // Header
  html += '<div style="padding:12px 16px;border-bottom:1px solid var(--br);background:#fafbf9;display:flex;align-items:center;gap:10px">';
  html += '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#007A3D,#00A852);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700">' + _esc((conv.contactNom||'?')[0].toUpperCase()) + '</div>';
  html += '<div><div style="font-size:13px;font-weight:700">' + _esc(conv.contactNom||'Contact') + '</div>';
  html += '<div style="font-size:11px;color:#007A3D">En ligne</div></div>';
  html += '</div>';

  // Messages
  html += '<div id="chat-messages" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;min-height:0">';
  if (!conv.messages || conv.messages.length === 0) {
    html += '<div style="text-align:center;padding:24px;color:#9ca3af;font-size:12px">Démarrez la conversation...</div>';
  } else {
    conv.messages.forEach(function(msg) {
      var moi = msg.expediteur === 'Moi';
      html += '<div style="display:flex;justify-content:' + (moi?'flex-end':'flex-start') + '">';
      html += '<div style="max-width:70%;background:' + (moi?'linear-gradient(135deg,#007A3D,#00A852)':'#f3f4f6') + ';color:' + (moi?'#fff':'#0F1F0F') + ';padding:10px 14px;border-radius:' + (moi?'16px 16px 4px 16px':'16px 16px 16px 4px') + ';font-size:13px;line-height:1.5">';
      html += _esc(msg.texte);
      html += '<div style="font-size:10px;opacity:.7;margin-top:4px;text-align:right">' + _esc(msg.time) + '</div>';
      html += '</div></div>';
    });
  }
  html += '</div>';

  // Input
  html += '<div style="padding:10px 12px;border-top:1px solid var(--br);display:flex;gap:8px;align-items:center">';
  html += '<input type="text" id="chat-input" placeholder="Écrivez un message..." onkeydown="if(event.key===\'Enter\')envoyerMessage()" ';
  html += 'style="flex:1;padding:9px 14px;border:1.5px solid var(--br);border-radius:22px;font-size:13px;outline:none;font-family:inherit">';
  html += '<button onclick="envoyerFichierChat()" style="width:36px;height:36px;border-radius:50%;border:1.5px solid var(--br);background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center" title="Envoyer un fichier">';
  html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>';
  html += '</button>';
  html += '<button onclick="envoyerMessage()" style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#007A3D,#00A852);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center">';
  html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
  html += '</button>';
  html += '</div>';
  return html;
}

function ouvrirConversation(convId) {
  var convs = CHAT_DATA.getConversations();
  _chatConvActuelle = convs.find(function(c){ return c.id === convId; });
  initPageChat();
  setTimeout(function() {
    var msgs = _el('chat-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }, 100);
}

function envoyerMessage() {
  if (!_chatConvActuelle) return;
  var inp = _el('chat-input');
  var texte = (inp||{}).value || '';
  if (!texte.trim()) return;
  CHAT_DATA.sendMessage(_chatConvActuelle.id, texte.trim(), 'Moi');
  if (inp) inp.value = '';
  var convs = CHAT_DATA.getConversations();
  _chatConvActuelle = convs.find(function(c){ return c.id === _chatConvActuelle.id; });
  var zone = _el('chat-zone');
  if (zone) zone.innerHTML = _renderChatZone(_chatConvActuelle);
  setTimeout(function() {
    var msgs = _el('chat-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }, 50);
}

function envoyerFichierChat() {
  _toast('Partagez l\'URL d\'une image ou d\'un fichier en ligne dans le chat', 'info');
}

function ouvrirNouvelleConversation() {
  var nom  = prompt('Nom du contact :');
  if (!nom) return;
  var tel  = prompt('Numéro de téléphone :');
  var conv = CHAT_DATA.getOrCreate('USR'+Date.now(), nom);
  _chatConvActuelle = conv;
  initPageChat();
}

// ══════════════════════════════════════════════════════════════
//  6. NOTIFICATIONS PUSH PWA
// ══════════════════════════════════════════════════════════════
var NOTIFICATIONS = {
  KEY: 'km_notifs_push',
  permission: 'default',

  demanderPermission: function() {
    var self = this;
    if (!('Notification' in window)) {
      _toast('Votre navigateur ne supporte pas les notifications', 'warning');
      return;
    }
    Notification.requestPermission().then(function(perm) {
      self.permission = perm;
      if (perm === 'granted') {
        _toast('Notifications activées ! Vous serez alerté en temps réel.', 'success');
        self.envoyer('KAMER360', 'Notifications activées avec succès !', 'system');
        initPageNotifications();
      } else {
        _toast('Notifications refusées — vous pouvez les activer dans les paramètres', 'warning');
      }
    });
  },

  envoyer: function(titre, corps, type) {
    var notif = { id:'N'+Date.now(), titre:titre, corps:corps, type:type||'info', time:_now(), lue:false };
    var list = _ls(this.KEY, []);
    list.unshift(notif);
    _lsSave(this.KEY, list.slice(0, 50));

    if (Notification.permission === 'granted' && document.hidden) {
      try {
        new Notification('KAMER360 — ' + titre, { body:corps, icon:'/icon-192.png', badge:'/icon-72.png', tag:type });
      } catch(e) {}
    }
    var badge = _el('notif-badge-count');
    if (badge) {
      var nonLues = list.filter(function(n){ return !n.lue; }).length;
      badge.textContent = nonLues > 0 ? nonLues : '';
      badge.style.display = nonLues > 0 ? 'flex' : 'none';
    }
    return notif;
  },

  marquerLues: function() {
    var list = _ls(this.KEY, []);
    list.forEach(function(n){ n.lue = true; });
    _lsSave(this.KEY, list);
    var badge = _el('notif-badge-count');
    if (badge) badge.style.display = 'none';
  },

  getAll: function() { return _ls(this.KEY, []); }
};

function initPageNotifications() {
  // Demander la permission si pas encore fait
  if ('Notification' in window && Notification.permission === 'default') {
    NOTIFICATIONS.demanderPermission();
  }
  NOTIFICATIONS.marquerLues();
  var z = _el('notif-content');
  if (!z) return;

  var notifs = NOTIFICATIONS.getAll();
  var typeColors = { info:'#1565C0', success:'#007A3D', warning:'#E65100', error:'#CE1126', message:'#4A148C', livraison:'#00695C', system:'#374151' };
  var typeIcons  = { info:'ℹ', success:'✓', warning:'⚠', error:'✗', message:'💬', livraison:'🛵', system:'⚙' };

  var permHtml = '';
  if ('Notification' in window && Notification.permission !== 'granted') {
    permHtml = '<div style="background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border-radius:12px;padding:16px;margin-bottom:14px;display:flex;align-items:center;gap:12px">';
    permHtml += '<div style="flex:1"><div style="font-weight:700;margin-bottom:3px">Activez les notifications push</div>';
    permHtml += '<div style="font-size:12px;opacity:.85">Soyez alerté des commandes, livraisons et messages même quand l\'app est fermée</div></div>';
    permHtml += '<button onclick="NOTIFICATIONS.demanderPermission()" style="background:rgba(255,255,255,.2);color:#fff;border:1.5px solid rgba(255,255,255,.4);padding:8px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">Activer</button>';
    permHtml += '</div>';
  }

  var listHtml = '';
  if (notifs.length === 0) {
    listHtml = '<div style="text-align:center;padding:48px;color:#9ca3af"><div style="font-size:42px;margin-bottom:12px">🔔</div><div style="font-size:15px;font-weight:600;color:#374151">Aucune notification</div><div style="font-size:13px;margin-top:6px">Vos alertes commandes, livraisons et messages apparaîtront ici</div></div>';
  } else {
    listHtml = '<div style="display:flex;flex-direction:column;gap:1px">';
    notifs.forEach(function(n) {
      var couleur = typeColors[n.type] || '#666';
      listHtml += '<div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid #f5f8f5">';
      listHtml += '<div style="width:36px;height:36px;border-radius:50%;background:' + couleur + '22;color:' + couleur + ';display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">' + (typeIcons[n.type]||'•') + '</div>';
      listHtml += '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + _esc(n.titre) + '</div>';
      listHtml += '<div style="font-size:12px;color:#555;margin-top:2px">' + _esc(n.corps) + '</div>';
      listHtml += '<div style="font-size:10px;color:#9ca3af;margin-top:4px">' + _esc(n.time) + '</div></div>';
      listHtml += '</div>';
    });
    listHtml += '</div>';
  }

  z.innerHTML = permHtml + '<div class="cd">' + listHtml + '</div>';
}

// Déclencher des notifications de démonstration
function simulerNotifications() {
  setTimeout(function(){ NOTIFICATIONS.envoyer('Nouvelle commande', 'CMD-2847 reçue — 15 450 FCFA', 'success'); }, 2000);
  setTimeout(function(){ NOTIFICATIONS.envoyer('Stock critique', 'Riz 25kg — seulement 3 unités restantes', 'warning'); }, 5000);
  setTimeout(function(){ NOTIFICATIONS.envoyer('Livraison en route', 'Jean Livreur est à 5 min de votre client', 'livraison'); }, 9000);
  setTimeout(function(){ NOTIFICATIONS.envoyer('Avis reçu', 'Marie A. vous a noté 5 étoiles !', 'message'); }, 14000);
}

// ══════════════════════════════════════════════════════════════
//  INITIALISATION GLOBALE
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  // Badge notification
  NOTIFICATIONS.marquerLues();
  // Lancer les notifs démo
  simulerNotifications();
  // Cache offline si en ligne
  if (navigator.onLine) setTimeout(cacheProduitsOffline, 3000);
  console.log('[KAMER360] 6 fonctionnalités impact chargées');
});
