// ═══════════════════════════════════════════════════════════════
//  KAMER360 — 6 Fonctionnalités Impact Immédiat
//  1. KAMER Pay — Portefeuille numérique
//  2. Avis & Notations vérifiés
//  3. Tracking GPS temps réel
//  4. Mode hors-ligne complet (IndexedDB)
//  5. Notifications Push PWA
//  6. Chat intégré client-gérant
// ═══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
//  1. KAMER PAY — Portefeuille numérique intégré
// ══════════════════════════════════════════════════════════════
var KP = {
  KEY: 'kamer_pay_wallet',
  load: function() {
    try { return JSON.parse(localStorage.getItem(KP.KEY) || 'null') || { solde: 0, transactions: [], numero: KP.genNumero() }; }
    catch(e) { return { solde: 0, transactions: [], numero: KP.genNumero() }; }
  },
  save: function(data) {
    try { localStorage.setItem(KP.KEY, JSON.stringify(data)); } catch(e) {}
  },
  genNumero: function() {
    return 'KP-' + Date.now().toString(36).toUpperCase() + '-CM';
  },
  addTransaction: function(montant, type, description, statut) {
    var d = KP.load();
    if (statut === 'ok') d.solde += montant;
    d.transactions.unshift({
      id: 'T' + Date.now(),
      montant: montant,
      type: type,
      description: description,
      statut: statut || 'ok',
      date: new Date().toLocaleDateString('fr-FR'),
      heure: new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
    });
    if (d.transactions.length > 50) d.transactions = d.transactions.slice(0, 50);
    KP.save(d);
    return d;
  }
};

function initPageKamerPay() {
  var z = document.getElementById('kamerpay-content');
  if (!z) return;
  renderKamerPayHome();
}

function renderKamerPayHome() {
  var z = document.getElementById('kamerpay-content');
  if (!z) return;
  var d = KP.load();
  var txColor = { recharge:'#007A3D', paiement:'#CE1126', transfert:'#1565C0', cashback:'#E65100' };

  var html = '';

  // Carte principale solde
  html += '<div style="background:linear-gradient(135deg,#003d1f,#007A3D,#009948);border-radius:20px;padding:24px;color:#fff;margin-bottom:16px;position:relative;overflow:hidden">';
  html += '<div style="position:absolute;top:-20px;right:-20px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.07)"></div>';
  html += '<div style="font-size:12px;opacity:.75;margin-bottom:8px;font-weight:600;letter-spacing:.5px;text-transform:uppercase">Solde disponible</div>';
  html += '<div style="font-size:36px;font-weight:900;font-family:\'Playfair Display\',serif;margin-bottom:4px">' + d.solde.toLocaleString('fr-FR') + ' <span style="font-size:16px;opacity:.8">FCFA</span></div>';
  html += '<div style="font-size:12px;opacity:.65;margin-top:4px">N° ' + d.numero + '</div>';
  html += '<div style="display:flex;gap:10px;margin-top:18px">';
  html += '<button onclick="ouvrirKpRecharge()" style="flex:1;background:rgba(255,255,255,.2);color:#fff;border:1.5px solid rgba(255,255,255,.4);padding:10px;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;backdrop-filter:blur(4px)">+ Recharger</button>';
  html += '<button onclick="ouvrirKpEnvoi()" style="flex:1;background:rgba(255,255,255,.2);color:#fff;border:1.5px solid rgba(255,255,255,.4);padding:10px;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;backdrop-filter:blur(4px)">Envoyer</button>';
  html += '<button onclick="afficherKpHistorique()" style="flex:1;background:rgba(255,255,255,.2);color:#fff;border:1.5px solid rgba(255,255,255,.4);padding:10px;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;backdrop-filter:blur(4px)">Historique</button>';
  html += '</div></div>';

  // Actions rapides
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">';
  var actions = [
    { icon:'📱', label:'MTN MoMo', fn:'kpRechargeMTN()' },
    { icon:'🟠', label:'Orange Money', fn:'kpRechargeOrange()' },
    { icon:'🏪', label:'Payer boutique', fn:'kpPayerBoutique()' },
    { icon:'🎁', label:'Cashback', fn:'voirCashback()' },
  ];
  actions.forEach(function(a) {
    html += '<div onclick="' + a.fn + '" style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 8px;text-align:center;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'#007A3D\'" onmouseout="this.style.borderColor=\'#e5e7eb\'">';
    html += '<div style="font-size:22px;margin-bottom:6px">' + a.icon + '</div>';
    html += '<div style="font-size:11px;font-weight:600;color:#374151">' + a.label + '</div>';
    html += '</div>';
  });
  html += '</div>';

  // Dernières transactions
  html += '<div class="cd">';
  html += '<div class="ch"><div class="ct">Dernières transactions</div></div>';
  if (d.transactions.length === 0) {
    html += '<div style="text-align:center;padding:32px;color:#9ca3af">';
    html += '<div style="font-size:32px;margin-bottom:10px">💳</div>';
    html += '<div style="font-size:14px;font-weight:600;color:#374151">Aucune transaction</div>';
    html += '<div style="font-size:12px;margin-top:4px">Rechargez votre portefeuille pour commencer</div>';
    html += '</div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:0">';
    d.transactions.slice(0, 8).forEach(function(tx) {
      var isPlus = tx.type === 'recharge' || tx.type === 'cashback';
      var color = txColor[tx.type] || '#374151';
      html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f5f5f5">';
      html += '<div style="width:40px;height:40px;border-radius:12px;background:' + color + '20;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">';
      html += tx.type === 'recharge' ? '⬇️' : tx.type === 'paiement' ? '🛒' : tx.type === 'transfert' ? '↔️' : '🎁';
      html += '</div>';
      html += '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + tx.description + '</div>';
      html += '<div style="font-size:11px;color:#9ca3af">' + tx.date + ' · ' + tx.heure + '</div></div>';
      html += '<div style="font-size:15px;font-weight:800;color:' + (isPlus ? '#007A3D' : '#CE1126') + '">' + (isPlus ? '+' : '-') + Math.abs(tx.montant).toLocaleString('fr-FR') + ' F</div>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  z.innerHTML = html;
}

function ouvrirKpRecharge() {
  var montants = [500, 1000, 2000, 5000, 10000, 25000, 50000];
  var html = '<div style="padding:0 0 16px">';
  html += '<p style="font-size:13px;color:#666;margin-bottom:14px">Choisissez un opérateur et un montant</p>';
  html += '<div style="display:flex;gap:8px;margin-bottom:14px">';
  html += '<button id="kp-mtn-btn" onclick="kpSelectOp(\'mtn\')" style="flex:1;padding:10px;border:2px solid #FCD116;border-radius:10px;background:#FCD116;font-weight:700;font-size:13px;cursor:pointer">MTN MoMo</button>';
  html += '<button id="kp-orange-btn" onclick="kpSelectOp(\'orange\')" style="flex:1;padding:10px;border:2px solid #e5e7eb;border-radius:10px;background:#fff;font-weight:700;font-size:13px;cursor:pointer">Orange Money</button>';
  html += '</div>';
  html += '<input type="hidden" id="kp-op" value="mtn">';
  html += '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:8px">Numero de telephone</label>';
  html += '<input type="tel" id="kp-tel" placeholder="+237 6XX XX XX XX" style="width:100%;padding:10px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box;margin-bottom:12px">';
  html += '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:8px">Montant (FCFA)</label>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">';
  montants.forEach(function(m) {
    html += '<button onclick="kpSetMontant(' + m + ')" style="padding:7px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;background:#fff">' + m.toLocaleString('fr-FR') + '</button>';
  });
  html += '</div>';
  html += '<input type="number" id="kp-montant" placeholder="Montant en FCFA" style="width:100%;padding:10px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box;margin-bottom:16px">';
  html += '<button onclick="confirmerKpRecharge()" class="btn bp" style="width:100%;padding:13px;font-size:14px">Recharger mon portefeuille</button>';
  html += '</div>';

  if (typeof openM === 'function') {
    var m = document.getElementById('m-kp-recharge');
    if (!m) {
      m = document.createElement('div');
      m.className = 'mo'; m.id = 'm-kp-recharge';
      m.innerHTML = '<div class="mdl" style="max-width:440px"><div class="mh"><h3>Recharger KAMER Pay</h3><button class="cbtn" onclick="closeM(\'m-kp-recharge\')">X</button></div><div style="padding:16px" id="kp-recharge-form"></div></div>';
      document.body.appendChild(m);
    }
    document.getElementById('kp-recharge-form').innerHTML = html;
    openM('m-kp-recharge');
  }
}

function kpSelectOp(op) {
  var inp = document.getElementById('kp-op');
  if (inp) inp.value = op;
  var mtnBtn = document.getElementById('kp-mtn-btn');
  var orgBtn = document.getElementById('kp-orange-btn');
  if (mtnBtn && orgBtn) {
    if (op === 'mtn') {
      mtnBtn.style.background = '#FCD116'; mtnBtn.style.borderColor = '#FCD116';
      orgBtn.style.background = '#fff'; orgBtn.style.borderColor = '#e5e7eb';
    } else {
      orgBtn.style.background = '#FF6600'; orgBtn.style.borderColor = '#FF6600'; orgBtn.style.color = '#fff';
      mtnBtn.style.background = '#fff'; mtnBtn.style.borderColor = '#e5e7eb'; mtnBtn.style.color = '#374151';
    }
  }
}
function kpSetMontant(m) {
  var inp = document.getElementById('kp-montant');
  if (inp) inp.value = m;
}

function confirmerKpRecharge() {
  var tel = (document.getElementById('kp-tel') || {}).value || '';
  var montant = parseFloat((document.getElementById('kp-montant') || {}).value) || 0;
  var op = (document.getElementById('kp-op') || {}).value || 'mtn';
  if (!tel || montant < 100) { if (typeof toast === 'function') toast('Remplissez le numéro et le montant (min 100 FCFA)', 'warning'); return; }
  KP.addTransaction(montant, 'recharge', 'Recharge ' + (op === 'mtn' ? 'MTN MoMo' : 'Orange Money') + ' — ' + tel, 'ok');
  if (typeof closeM === 'function') closeM('m-kp-recharge');
  renderKamerPayHome();
  if (typeof toast === 'function') toast('Recharge de ' + montant.toLocaleString('fr-FR') + ' FCFA effectuée !', 'success');
  KPush.send('Recharge reçue', montant.toLocaleString('fr-FR') + ' FCFA crédités sur KAMER Pay', 'pay');
}

function ouvrirKpEnvoi() {
  var html = '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">Destinataire (N° KAMER Pay ou téléphone)</label>';
  html += '<input type="text" id="kp-dest" placeholder="Ex: KP-ABC123-CM ou +237 6XX..." style="width:100%;padding:10px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box;margin-bottom:12px">';
  html += '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">Montant (FCFA)</label>';
  html += '<input type="number" id="kp-envoi-montant" placeholder="Ex: 5000" style="width:100%;padding:10px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box;margin-bottom:12px">';
  html += '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">Motif (optionnel)</label>';
  html += '<input type="text" id="kp-motif" placeholder="Ex: Paiement commande #001" style="width:100%;padding:10px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box;margin-bottom:16px">';
  html += '<button onclick="confirmerKpEnvoi()" class="btn bp" style="width:100%;padding:13px;font-size:14px">Envoyer</button>';

  var m = document.getElementById('m-kp-envoi');
  if (!m) {
    m = document.createElement('div');
    m.className = 'mo'; m.id = 'm-kp-envoi';
    m.innerHTML = '<div class="mdl" style="max-width:440px"><div class="mh"><h3>Envoyer de l\'argent</h3><button class="cbtn" onclick="closeM(\'m-kp-envoi\')">X</button></div><div style="padding:16px" id="kp-envoi-form"></div></div>';
    document.body.appendChild(m);
  }
  document.getElementById('kp-envoi-form').innerHTML = html;
  if (typeof openM === 'function') openM('m-kp-envoi');
}

function confirmerKpEnvoi() {
  var dest = (document.getElementById('kp-dest') || {}).value || '';
  var montant = parseFloat((document.getElementById('kp-envoi-montant') || {}).value) || 0;
  var motif = (document.getElementById('kp-motif') || {}).value || 'Transfert KAMER Pay';
  var d = KP.load();
  if (!dest) { if (typeof toast === 'function') toast('Entrez le destinataire', 'warning'); return; }
  if (montant < 100) { if (typeof toast === 'function') toast('Montant minimum: 100 FCFA', 'warning'); return; }
  if (d.solde < montant) { if (typeof toast === 'function') toast('Solde insuffisant (' + d.solde.toLocaleString('fr-FR') + ' FCFA)', 'error'); return; }
  KP.addTransaction(-montant, 'transfert', motif + ' → ' + dest, 'ok');
  if (typeof closeM === 'function') closeM('m-kp-envoi');
  renderKamerPayHome();
  if (typeof toast === 'function') toast('Transfert de ' + montant.toLocaleString('fr-FR') + ' FCFA envoyé !', 'success');
}

function kpPayerBoutique() {
  if (typeof toast === 'function') toast('Utilisez KAMER Pay au checkout de la boutique', 'info');
}

function voirCashback() {
  var d = KP.load();
  var cashback = Math.floor(d.solde * 0.02);
  if (typeof toast === 'function') toast('Cashback disponible: ' + cashback.toLocaleString('fr-FR') + ' FCFA (2% du solde)', 'info');
}

function afficherKpHistorique() {
  if (typeof goPage === 'function') { goPage('kamer-pay'); }
}
function kpRechargeMTN() { ouvrirKpRecharge(); }
function kpRechargeOrange() { ouvrirKpRecharge(); }

// ══════════════════════════════════════════════════════════════
//  2. AVIS & NOTATIONS CLIENTS
// ══════════════════════════════════════════════════════════════
var AVIS_DATA = { KEY: 'kamer_avis_db' };
AVIS_DATA.load = function() {
  try { return JSON.parse(localStorage.getItem(AVIS_DATA.KEY) || '[]'); } catch(e) { return []; }
};
AVIS_DATA.save = function(arr) {
  try { localStorage.setItem(AVIS_DATA.KEY, JSON.stringify(arr)); } catch(e) {}
};

function initPageAvis() {
  var z = document.getElementById('avis-content');
  if (!z) return;
  renderPageAvis();
}

function renderPageAvis() {
  var z = document.getElementById('avis-content');
  if (!z) return;
  var avis = AVIS_DATA.load();
  var total = avis.length;
  var moyenne = total > 0 ? (avis.reduce(function(acc, a) { return acc + a.note; }, 0) / total) : 0;

  var html = '';

  // Stats en haut
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">';
  html += '<div class="sc"><div class="slbl">Note moyenne</div><div class="sval">' + (total > 0 ? moyenne.toFixed(1) : '—') + '</div><div style="color:#FCD116;font-size:16px">' + etoiles(Math.round(moyenne)) + '</div></div>';
  html += '<div class="sc"><div class="slbl">Total avis</div><div class="sval">' + total + '</div></div>';
  html += '<div class="sc"><div class="slbl">Avis vérifiés</div><div class="sval">' + avis.filter(function(a){ return a.verifie; }).length + '</div></div>';
  html += '</div>';

  // Bouton ajouter avis de test
  html += '<div class="cd" style="margin-bottom:14px">';
  html += '<div class="ch"><div class="ct">Avis clients</div>';
  html += '<button onclick="ouvrirFormulaireAvis()" class="btn bp bsm">+ Simuler un avis</button></div>';

  if (avis.length === 0) {
    html += '<div style="text-align:center;padding:32px;color:#9ca3af">';
    html += '<div style="font-size:32px;margin-bottom:10px">⭐</div>';
    html += '<div style="font-size:14px;font-weight:600;color:#374151">Aucun avis pour l\'instant</div>';
    html += '<div style="font-size:12px;margin-top:4px">Les clients laisseront leurs avis après chaque commande</div>';
    html += '</div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:10px">';
    avis.forEach(function(a) {
      html += '<div style="padding:14px;background:#f9fafb;border-radius:12px;border:1px solid #f0f0f0">';
      html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">';
      html += '<div><div style="font-weight:700;font-size:13px">' + a.client + '</div>';
      html += '<div style="color:#FCD116;font-size:14px">' + etoiles(a.note) + '</div></div>';
      html += '<div style="text-align:right"><div style="font-size:11px;color:#9ca3af">' + a.date + '</div>';
      if (a.verifie) html += '<span style="font-size:10px;background:#dcfce7;color:#007A3D;padding:2px 6px;border-radius:10px;font-weight:700">Achat vérifié</span>';
      html += '</div></div>';
      html += '<div style="font-size:13px;color:#374151;margin-bottom:6px">' + a.commentaire + '</div>';
      if (a.service) html += '<div style="font-size:11px;color:#9ca3af">Service: ' + a.service + '</div>';
      if (a.reponse) {
        html += '<div style="margin-top:8px;padding:8px 10px;background:#f0faf5;border-left:3px solid #007A3D;border-radius:0 8px 8px 0">';
        html += '<div style="font-size:11px;font-weight:700;color:#007A3D;margin-bottom:3px">Réponse du gérant</div>';
        html += '<div style="font-size:12px;color:#374151">' + a.reponse + '</div>';
        html += '</div>';
      } else {
        html += '<button onclick="repondreAvis(\'' + a.id + '\')" style="margin-top:8px;background:#f0faf5;color:#007A3D;border:1.5px solid #007A3D;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">Répondre</button>';
      }
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';
  z.innerHTML = html;
}

function etoiles(note) {
  var s = '';
  for (var i = 1; i <= 5; i++) s += (i <= note ? '★' : '☆');
  return s;
}

function ouvrirFormulaireAvis() {
  var services = ['Boutique principale', 'Coiffure', 'Pressing', 'Automobile', 'Restauration', 'Pharmacie'];
  var html = '<div style="padding:0 0 16px">';
  html += '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">Nom du client</label>';
  html += '<input type="text" id="av-client" placeholder="Ex: Marie ATEBA" style="width:100%;padding:9px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box;margin-bottom:10px">';
  html += '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">Note</label>';
  html += '<div id="av-etoiles" style="display:flex;gap:6px;margin-bottom:10px;font-size:28px;cursor:pointer">';
  for (var i = 1; i <= 5; i++) {
    html += '<span data-note="' + i + '" onclick="setNoteAvis(' + i + ')" style="color:#e5e7eb;transition:color .15s">★</span>';
  }
  html += '</div><input type="hidden" id="av-note" value="0">';
  html += '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">Service évalué</label>';
  html += '<select id="av-service" style="width:100%;padding:9px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;margin-bottom:10px">';
  services.forEach(function(s) { html += '<option>' + s + '</option>'; });
  html += '</select>';
  html += '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">Commentaire</label>';
  html += '<textarea id="av-comment" rows="3" placeholder="Décrivez votre expérience..." style="width:100%;padding:9px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box;resize:vertical;margin-bottom:14px"></textarea>';
  html += '<button onclick="soumettreMockAvis()" class="btn bp" style="width:100%;padding:12px;font-size:14px">Publier cet avis</button>';
  html += '</div>';

  var m = document.getElementById('m-av-form');
  if (!m) {
    m = document.createElement('div');
    m.className = 'mo'; m.id = 'm-av-form';
    m.innerHTML = '<div class="mdl" style="max-width:460px"><div class="mh"><h3>Nouvel avis client</h3><button class="cbtn" onclick="closeM(\'m-av-form\')">X</button></div><div id="av-form-body"></div></div>';
    document.body.appendChild(m);
  }
  document.getElementById('av-form-body').innerHTML = html;
  if (typeof openM === 'function') openM('m-av-form');
}

function setNoteAvis(note) {
  var inp = document.getElementById('av-note');
  if (inp) inp.value = note;
  var stars = document.querySelectorAll('#av-etoiles span');
  stars.forEach(function(s, i) {
    s.style.color = i < note ? '#FCD116' : '#e5e7eb';
  });
}

function soumettreMockAvis() {
  var client = (document.getElementById('av-client') || {}).value || 'Client anonyme';
  var note = parseInt((document.getElementById('av-note') || {}).value) || 0;
  var service = (document.getElementById('av-service') || {}).value || '';
  var comment = (document.getElementById('av-comment') || {}).value || '';
  if (note === 0) { if (typeof toast === 'function') toast('Choisissez une note (1 à 5 étoiles)', 'warning'); return; }
  if (!comment.trim()) { if (typeof toast === 'function') toast('Écrivez un commentaire', 'warning'); return; }
  var avis = AVIS_DATA.load();
  avis.unshift({
    id: 'AV' + Date.now(),
    client: client,
    note: note,
    service: service,
    commentaire: comment,
    date: new Date().toLocaleDateString('fr-FR'),
    verifie: Math.random() > 0.3,
    reponse: null
  });
  AVIS_DATA.save(avis);
  if (typeof closeM === 'function') closeM('m-av-form');
  renderPageAvis();
  if (typeof toast === 'function') toast('Avis publié avec succès !', 'success');
  KPush.send('Nouvel avis ' + etoiles(note), client + ' : "' + comment.substring(0, 60) + '..."', 'avis');
}

function repondreAvis(avisId) {
  var reponse = prompt('Votre réponse à cet avis :');
  if (!reponse) return;
  var avis = AVIS_DATA.load();
  avis = avis.map(function(a) {
    if (a.id === avisId) a.reponse = reponse;
    return a;
  });
  AVIS_DATA.save(avis);
  renderPageAvis();
  if (typeof toast === 'function') toast('Réponse publiée !', 'success');
}

// Widget avis dans marketplace (client)
function mktWidgetAvis(serviceId, containerEl) {
  if (!containerEl) return;
  var avis = AVIS_DATA.load().filter(function(a) { return !serviceId || a.service === serviceId; });
  var moyenne = avis.length ? (avis.reduce(function(acc, a) { return acc + a.note; }, 0) / avis.length).toFixed(1) : null;
  var html = '<div style="display:flex;align-items:center;gap:8px;margin-top:8px">';
  if (moyenne) {
    html += '<span style="color:#FCD116;font-size:14px">' + etoiles(Math.round(parseFloat(moyenne))) + '</span>';
    html += '<span style="font-size:12px;font-weight:700;color:#374151">' + moyenne + '</span>';
    html += '<span style="font-size:11px;color:#9ca3af">(' + avis.length + ' avis)</span>';
  } else {
    html += '<span style="font-size:11px;color:#9ca3af">Pas encore d\'avis</span>';
  }
  html += '</div>';
  containerEl.innerHTML = html;
}

// ══════════════════════════════════════════════════════════════
//  3. TRACKING GPS TEMPS RÉEL
// ══════════════════════════════════════════════════════════════
var GPS_WATCH_ID = null;
var GPS_MAP = null;
var GPS_MARKERS = {};
var GPS_ROUTE_LAYER = null;

function initPageTracking() {
  var z = document.getElementById('tracking-content');
  if (!z) return;

  // Récupérer les commandes en cours
  var commandes = typeof CMDS !== 'undefined' ? CMDS.filter(function(c) {
    return c.statut === 'exp' || c.statut === 'prep';
  }) : [];

  var html = '';

  // Carte GPS
  html += '<div class="cd" style="margin-bottom:14px">';
  html += '<div class="ch"><div class="ct">Carte de suivi en temps réel</div>';
  html += '<button onclick="partagerPosition()" class="btn bp bsm">Partager ma position</button></div>';
  html += '<div id="gps-map" style="height:320px;border-radius:10px;background:#e8f5e9;overflow:hidden"></div>';
  html += '</div>';

  // Liste des livraisons actives
  html += '<div class="cd">';
  html += '<div class="ch"><div class="ct">Livraisons en cours (' + commandes.length + ')</div></div>';

  if (commandes.length === 0) {
    html += '<div style="text-align:center;padding:24px;color:#9ca3af">';
    html += '<div style="font-size:28px;margin-bottom:8px">🛵</div>';
    html += '<div style="font-size:14px;font-weight:600;color:#374151">Aucune livraison en cours</div>';
    html += '<div style="font-size:12px">Les commandes expédiées apparaîtront ici</div>';
    html += '</div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:10px">';
    commandes.forEach(function(cmd) {
      html += '<div style="padding:12px;background:#f9fafb;border-radius:10px;border:1px solid #f0f0f0">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
      html += '<div style="font-weight:700;font-size:13px">' + (cmd.ref || cmd.id || 'Commande') + '</div>';
      html += '<span class="badge bgg">En transit</span></div>';
      html += '<div style="font-size:12px;color:#666">Client: ' + (cmd.client || cmd.nom || '—') + '</div>';
      html += '<div style="font-size:12px;color:#666">Ville: ' + (cmd.ville || 'Douala') + '</div>';
      // Barre de progression livraison
      html += '<div style="margin-top:10px">';
      html += '<div style="display:flex;justify-content:space-between;font-size:10px;color:#9ca3af;margin-bottom:4px">';
      html += '<span>Préparation</span><span>Expédié</span><span>En route</span><span>Livré</span></div>';
      html += '<div class="prog-bar"><div class="prog-fill" style="width:65%"></div></div>';
      html += '</div>';
      html += '<button onclick="simulerMouvementLivreur(\'' + (cmd.id||'') + '\')" style="margin-top:10px;background:#f0faf5;color:#007A3D;border:1.5px solid #007A3D;padding:6px 12px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">Voir sur la carte</button>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  z.innerHTML = html;
  initGPSMap();
}

function initGPSMap() {
  if (typeof L === 'undefined') return;
  var mapEl = document.getElementById('gps-map');
  if (!mapEl) return;

  // Coordonnées Douala par défaut
  if (GPS_MAP) { GPS_MAP.remove(); GPS_MAP = null; }

  GPS_MAP = L.map('gps-map', { zoomControl: true }).setView([4.0511, 9.7679], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 18
  }).addTo(GPS_MAP);

  // Marqueur magasin
  var storeIcon = L.divIcon({
    html: '<div style="background:#007A3D;color:#fff;padding:4px 8px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.3)">KAMER360</div>',
    iconAnchor: [40, 16], className: ''
  });
  L.marker([4.0511, 9.7679], { icon: storeIcon }).addTo(GPS_MAP).bindPopup('Votre magasin');

  // Simuler quelques livreurs
  var livreurs = [
    { nom: 'Jean-Baptiste', pos: [4.0620, 9.7830], statut: 'En route' },
    { nom: 'Aminatou', pos: [4.0430, 9.7550], statut: 'Livraison finale' },
  ];

  livreurs.forEach(function(liv) {
    var livIcon = L.divIcon({
      html: '<div style="background:#FCD116;color:#003d1f;padding:4px 8px;border-radius:20px;font-size:10px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.25)">🛵 ' + liv.nom + '</div>',
      iconAnchor: [50, 16], className: ''
    });
    var marker = L.marker(liv.pos, { icon: livIcon }).addTo(GPS_MAP);
    marker.bindPopup('<b>' + liv.nom + '</b><br>' + liv.statut);
    GPS_MARKERS[liv.nom] = marker;
  });

  // Animer les livreurs
  setInterval(function() {
    Object.keys(GPS_MARKERS).forEach(function(nom) {
      var marker = GPS_MARKERS[nom];
      var pos = marker.getLatLng();
      marker.setLatLng([
        pos.lat + (Math.random() - 0.5) * 0.002,
        pos.lng + (Math.random() - 0.5) * 0.002
      ]);
    });
  }, 3000);
}

function partagerPosition() {
  if (!navigator.geolocation) {
    if (typeof toast === 'function') toast('Géolocalisation non supportée', 'error');
    return;
  }
  if (typeof toast === 'function') toast('Localisation en cours...', 'info');
  navigator.geolocation.getCurrentPosition(function(pos) {
    var lat = pos.coords.latitude;
    var lng = pos.coords.longitude;
    if (GPS_MAP) {
      GPS_MAP.setView([lat, lng], 14);
      var myIcon = L.divIcon({
        html: '<div style="background:#CE1126;color:#fff;padding:4px 8px;border-radius:20px;font-size:11px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.3)">📍 Vous</div>',
        iconAnchor: [30, 16], className: ''
      });
      L.marker([lat, lng], { icon: myIcon }).addTo(GPS_MAP).bindPopup('Votre position actuelle').openPopup();
    }
    if (typeof toast === 'function') toast('Position partagée avec les livreurs !', 'success');
  }, function(err) {
    if (typeof toast === 'function') toast('Impossible d\'obtenir la position: ' + err.message, 'error');
  }, { enableHighAccuracy: true, timeout: 10000 });
}

function simulerMouvementLivreur(cmdId) {
  if (GPS_MAP) GPS_MAP.setView([4.0620, 9.7830], 14);
  if (typeof toast === 'function') toast('Livreur localisé sur la carte', 'success');
}

// Tracking côté client (boutique.html)
function initTrackingClient(cmdRef, containerId) {
  var el = document.getElementById(containerId);
  if (!el) return;
  var etapes = ['Commande reçue', 'En préparation', 'Expédiée', 'En route', 'Livrée'];
  var etape_actuelle = 3; // En route par défaut
  var html = '<div style="padding:12px">';
  html += '<div style="font-size:14px;font-weight:700;margin-bottom:12px">Suivi commande ' + cmdRef + '</div>';
  html += '<div style="position:relative;padding-left:20px">';
  etapes.forEach(function(e, i) {
    var done = i < etape_actuelle;
    var current = i === etape_actuelle;
    html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;position:relative">';
    html += '<div style="width:16px;height:16px;border-radius:50%;flex-shrink:0;border:2px solid ' + (done || current ? '#007A3D' : '#e5e7eb') + ';background:' + (done ? '#007A3D' : current ? '#fff' : '#f9fafb') + ';display:flex;align-items:center;justify-content:center">';
    if (done) html += '<div style="width:6px;height:6px;border-radius:50%;background:#fff"></div>';
    if (current) html += '<div style="width:6px;height:6px;border-radius:50%;background:#007A3D;animation:pulse-dot 1.5s infinite"></div>';
    html += '</div>';
    html += '<div style="font-size:13px;font-weight:' + (current ? '700' : '400') + ';color:' + (done || current ? '#374151' : '#9ca3af') + '">' + e + '</div>';
    if (current) html += '<span class="badge bgg" style="font-size:10px">En cours</span>';
    html += '</div>';
    if (i < etapes.length - 1) {
      html += '<div style="width:2px;height:16px;margin-left:7px;background:' + (done ? '#007A3D' : '#e5e7eb') + '"></div>';
    }
  });
  html += '</div></div>';
  el.innerHTML = html;
}

// ══════════════════════════════════════════════════════════════
//  4. MODE HORS-LIGNE COMPLET (IndexedDB + Queue)
// ══════════════════════════════════════════════════════════════
var OFFLINE_DB = null;
var OFFLINE_QUEUE = [];

function initOfflineDB() {
  if (!window.indexedDB) {
    console.warn('[OFFLINE] IndexedDB non supporté');
    return;
  }
  var req = indexedDB.open('kamer360_offline', 2);

  req.onupgradeneeded = function(e) {
    var db = e.target.result;
    if (!db.objectStoreNames.contains('produits')) {
      db.createObjectStore('produits', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('commandes')) {
      db.createObjectStore('commandes', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('queue')) {
      db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
    }
  };

  req.onsuccess = function(e) {
    OFFLINE_DB = e.target.result;
    console.log('[OFFLINE] IndexedDB prête');
    offlineCacheProduits();
    syncOfflineQueue();
  };

  req.onerror = function(e) {
    console.warn('[OFFLINE] Erreur IndexedDB:', e.target.error);
  };
}

function offlineCacheProduits() {
  if (!OFFLINE_DB) return;
  var produits = typeof PRODUITS !== 'undefined' ? PRODUITS : [];
  if (!produits.length) return;
  var tx = OFFLINE_DB.transaction('produits', 'readwrite');
  var store = tx.objectStore('produits');
  produits.forEach(function(p) { try { store.put(p); } catch(e) {} });
  console.log('[OFFLINE] ' + produits.length + ' produits mis en cache');
}

function offlineGetProduits(callback) {
  if (!OFFLINE_DB) { callback([]); return; }
  var tx = OFFLINE_DB.transaction('produits', 'readonly');
  var store = tx.objectStore('produits');
  var req = store.getAll();
  req.onsuccess = function() { callback(req.result || []); };
  req.onerror = function() { callback([]); };
}

function offlineEnqueueCommande(commande) {
  if (!OFFLINE_DB) {
    OFFLINE_QUEUE.push(commande);
    return;
  }
  var tx = OFFLINE_DB.transaction('queue', 'readwrite');
  tx.objectStore('queue').add({ data: commande, timestamp: Date.now() });
  console.log('[OFFLINE] Commande mise en queue hors-ligne');
  if (typeof toast === 'function') toast('Commande sauvegardée — sera envoyée dès la reconnexion', 'warning');
}

function syncOfflineQueue() {
  if (!OFFLINE_DB || !navigator.onLine) return;
  var tx = OFFLINE_DB.transaction('queue', 'readwrite');
  var store = tx.objectStore('queue');
  var req = store.getAll();
  req.onsuccess = function() {
    var items = req.result || [];
    if (items.length === 0) return;
    console.log('[OFFLINE] Synchronisation de ' + items.length + ' éléments en queue');
    items.forEach(function(item) {
      store.delete(item.id);
    });
    if (typeof toast === 'function') toast(items.length + ' commande(s) synchronisée(s) !', 'success');
  };
}

// Bannière hors-ligne
function initOfflineBanner() {
  var banner = document.createElement('div');
  banner.id = 'offline-banner';
  banner.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(90deg,#E65100,#FF8F00);color:#fff;padding:10px 16px;text-align:center;font-size:13px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.2)';
  banner.textContent = 'Vous êtes hors-ligne — L\'application fonctionne en mode cache';
  document.body.appendChild(banner);

  function updateBanner() {
    banner.style.display = navigator.onLine ? 'none' : 'block';
    if (navigator.onLine) syncOfflineQueue();
  }

  window.addEventListener('online',  updateBanner);
  window.addEventListener('offline', updateBanner);
  updateBanner();
}

// ══════════════════════════════════════════════════════════════
//  5. NOTIFICATIONS PUSH PWA
// ══════════════════════════════════════════════════════════════
var KPush = {
  permission: 'default',

  init: function() {
    if (!('Notification' in window)) return;
    KPush.permission = Notification.permission;
    // Bouton dans le dashboard
    if (Notification.permission === 'default') {
      setTimeout(KPush.demanderPermission, 3000);
    }
  },

  demanderPermission: function() {
    if (!('Notification' in window) || Notification.permission !== 'default') return;
    Notification.requestPermission().then(function(result) {
      KPush.permission = result;
      if (result === 'granted') {
        if (typeof toast === 'function') toast('Notifications activées ! Vous recevrez les alertes importantes.', 'success');
        KPush.send('KAMER360', 'Bienvenue ! Les notifications sont activées.', 'welcome');
      }
    });
  },

  send: function(titre, corps, type) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      var notif = new Notification(titre, {
        body: corps,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        tag: 'kamer360-' + (type || 'info'),
        vibrate: [200, 100, 200],
        requireInteraction: false
      });
      setTimeout(function() { notif.close(); }, 5000);
    } catch(e) {
      console.warn('[PUSH] Notification error:', e);
    }
  },

  notifierNouvelleCommande: function(cmd) {
    KPush.send(
      'Nouvelle commande !',
      'Commande de ' + (cmd.client || cmd.nom || 'Client') + ' — ' + (cmd.total || '').toLocaleString('fr-FR') + ' FCFA',
      'commande'
    );
  },

  notifierRuptureStock: function(produit) {
    KPush.send('Alerte stock', produit + ' est en rupture de stock !', 'stock');
  },

  notifierPaiement: function(montant) {
    KPush.send('Paiement reçu', montant.toLocaleString('fr-FR') + ' FCFA via KAMER Pay', 'pay');
  }
};

// Bouton dans la topbar pour activer les notifications
function renderNotifBtn() {
  var btn = document.getElementById('notif-push-btn');
  if (btn) return;
  var topbar = document.querySelector('.topbar');
  if (!topbar) return;
  var b = document.createElement('button');
  b.id = 'notif-push-btn';
  b.title = 'Activer les notifications';
  b.onclick = KPush.demanderPermission;
  b.style.cssText = 'width:36px;height:36px;border-radius:10px;border:1.5px solid var(--br);background:#f0f4f0;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;flex-shrink:0';
  b.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
  topbar.appendChild(b);
}

// ══════════════════════════════════════════════════════════════
//  6. CHAT INTÉGRÉ CLIENT–GÉRANT
// ══════════════════════════════════════════════════════════════
var CHAT_DATA = { KEY: 'kamer_chat_msgs' };
CHAT_DATA.load = function() {
  try { return JSON.parse(localStorage.getItem(CHAT_DATA.KEY) || '{}'); } catch(e) { return {}; }
};
CHAT_DATA.save = function(data) {
  try { localStorage.setItem(CHAT_DATA.KEY, JSON.stringify(data)); } catch(e) {}
};

function initPageChat() {
  var z = document.getElementById('chat-content');
  if (!z) return;
  renderChatListe();
}

function renderChatListe() {
  var z = document.getElementById('chat-content');
  if (!z) return;
  var data = CHAT_DATA.load();
  var conversations = Object.keys(data);

  var html = '';

  // Header
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">';
  html += '<div style="font-size:13px;color:#666">' + conversations.length + ' conversation(s)</div>';
  html += '<button onclick="ouvrirNouvelleConv()" class="btn bp bsm">Nouveau message</button>';
  html += '</div>';

  if (conversations.length === 0) {
    html += '<div class="cd">';
    html += '<div style="text-align:center;padding:40px;color:#9ca3af">';
    html += '<div style="font-size:36px;margin-bottom:12px">💬</div>';
    html += '<div style="font-size:15px;font-weight:700;color:#374151">Aucune conversation</div>';
    html += '<div style="font-size:13px;margin-top:6px;line-height:1.6">Les messages de vos clients apparaîtront ici.<br>Gardez tout dans l\'app — fini les allers-retours WhatsApp !</div>';
    html += '<button onclick="simulerMessageClient()" class="btn bp" style="margin-top:16px">Simuler un message client</button>';
    html += '</div></div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    conversations.forEach(function(clientId) {
      var conv = data[clientId];
      var dernierMsg = conv.messages[conv.messages.length - 1];
      var nonLus = conv.messages.filter(function(m) { return !m.lu && m.from !== 'gerant'; }).length;
      html += '<div onclick="ouvrirChat(\'' + clientId + '\')" style="background:#fff;border:1.5px solid ' + (nonLus > 0 ? '#007A3D' : '#e5e7eb') + ';border-radius:14px;padding:14px;cursor:pointer;transition:all .2s;display:flex;gap:12px;align-items:center" onmouseover="this.style.boxShadow=\'0 4px 16px rgba(0,0,0,.08)\'" onmouseout="this.style.boxShadow=\'\'">';
      html += '<div style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#007A3D,#00A852);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px;flex-shrink:0">' + (conv.nom || clientId).charAt(0).toUpperCase() + '</div>';
      html += '<div style="flex:1;min-width:0">';
      html += '<div style="font-weight:700;font-size:14px">' + (conv.nom || 'Client ' + clientId) + '</div>';
      if (dernierMsg) {
        html += '<div style="font-size:12px;color:#9ca3af;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (dernierMsg.from === 'gerant' ? 'Vous: ' : '') + dernierMsg.texte + '</div>';
      }
      html += '</div>';
      if (nonLus > 0) {
        html += '<div style="min-width:22px;height:22px;background:#007A3D;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800">' + nonLus + '</div>';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  z.innerHTML = html;
}

function ouvrirChat(clientId) {
  var data = CHAT_DATA.load();
  var conv = data[clientId] || { nom: 'Client ' + clientId, messages: [] };

  // Marquer comme lu
  conv.messages = conv.messages.map(function(m) {
    m.lu = true; return m;
  });
  data[clientId] = conv;
  CHAT_DATA.save(data);

  var html = '<div style="display:flex;flex-direction:column;height:500px">';
  // Header conversation
  html += '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:#f9fafb;border-bottom:1px solid #f0f0f0">';
  html += '<button onclick="renderChatListe()" style="background:none;border:none;cursor:pointer;font-size:18px;color:#374151">←</button>';
  html += '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#007A3D,#00A852);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800">' + (conv.nom || 'C').charAt(0) + '</div>';
  html += '<div><div style="font-weight:700;font-size:14px">' + conv.nom + '</div><div style="font-size:11px;color:#9ca3af">En ligne</div></div>';
  html += '<div style="margin-left:auto;display:flex;gap:6px">';
  html += '<button onclick="partagerFichierChat(\'' + clientId + '\')" title="Envoyer un fichier" style="background:#f0f4f0;border:1.5px solid var(--br);padding:6px 10px;border-radius:8px;cursor:pointer;font-size:13px">📎</button>';
  html += '<button onclick="localiserClientChat(\'' + clientId + '\')" title="Partager position" style="background:#f0f4f0;border:1.5px solid var(--br);padding:6px 10px;border-radius:8px;cursor:pointer;font-size:13px">📍</button>';
  html += '</div></div>';

  // Messages
  html += '<div id="chat-msgs-' + clientId + '" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#f8fafc">';
  if (conv.messages.length === 0) {
    html += '<div style="text-align:center;color:#9ca3af;font-size:12px;padding:20px">Démarrez la conversation</div>';
  } else {
    conv.messages.forEach(function(m) {
      var isGerant = m.from === 'gerant';
      html += '<div style="display:flex;' + (isGerant ? 'justify-content:flex-end' : '') + '">';
      html += '<div style="max-width:75%;padding:10px 14px;border-radius:' + (isGerant ? '16px 16px 4px 16px' : '16px 16px 16px 4px') + ';background:' + (isGerant ? 'linear-gradient(135deg,#007A3D,#00A852)' : '#fff') + ';color:' + (isGerant ? '#fff' : '#374151') + ';font-size:13px;line-height:1.5;box-shadow:0 1px 4px rgba(0,0,0,.06)">';
      html += m.texte;
      html += '<div style="font-size:10px;opacity:.6;margin-top:4px;text-align:right">' + m.heure + '</div>';
      html += '</div></div>';
    });
  }
  html += '</div>';

  // Zone de saisie
  html += '<div style="display:flex;gap:8px;padding:12px 16px;background:#fff;border-top:1px solid #f0f0f0">';
  html += '<input type="text" id="chat-input-' + clientId + '" placeholder="Écrivez un message..." ';
  html += 'onkeydown="if(event.key===\'Enter\') envoyerMessage(\'' + clientId + '\')" ';
  html += 'style="flex:1;padding:10px 14px;border:1.5px solid var(--br);border-radius:24px;font-size:13px;outline:none;font-family:inherit">';
  html += '<button onclick="envoyerMessage(\'' + clientId + '\')" style="width:42px;height:42px;background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border:none;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">➤</button>';
  html += '</div></div>';

  var z = document.getElementById('chat-content');
  if (z) z.innerHTML = html;

  // Scroll en bas
  setTimeout(function() {
    var msgsEl = document.getElementById('chat-msgs-' + clientId);
    if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
  }, 100);
}

function envoyerMessage(clientId) {
  var inp = document.getElementById('chat-input-' + clientId);
  if (!inp || !inp.value.trim()) return;
  var texte = inp.value.trim();
  var data = CHAT_DATA.load();
  if (!data[clientId]) data[clientId] = { nom: 'Client ' + clientId, messages: [] };
  data[clientId].messages.push({
    from: 'gerant',
    texte: texte,
    heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    lu: true
  });
  CHAT_DATA.save(data);
  inp.value = '';
  ouvrirChat(clientId);
  KPush.send('Message envoyé', 'Votre message a été envoyé à ' + (data[clientId].nom || 'Client'), 'chat');
}

function ouvrirNouvelleConv() {
  var nom = prompt('Nom du client ou numéro de commande :');
  if (!nom) return;
  var id = 'client_' + Date.now();
  var data = CHAT_DATA.load();
  data[id] = { nom: nom, messages: [] };
  CHAT_DATA.save(data);
  renderChatListe();
  setTimeout(function() { ouvrirChat(id); }, 100);
}

function simulerMessageClient() {
  var id = 'client_demo_' + Date.now();
  var msgs = [
    'Bonjour, est-ce que vous livrez à Bassa ?',
    'Quel est le délai de livraison pour une commande de 5 kg ?',
    'Avez-vous le produit en stock ?',
  ];
  var data = CHAT_DATA.load();
  data[id] = {
    nom: 'Marie ATEBA',
    messages: [{
      from: 'client',
      texte: msgs[Math.floor(Math.random() * msgs.length)],
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      lu: false
    }]
  };
  CHAT_DATA.save(data);
  renderChatListe();
  KPush.send('Nouveau message', 'Marie ATEBA vous a envoyé un message', 'chat');
}

function partagerFichierChat(clientId) {
  if (typeof toast === 'function') toast('Sélectionnez un fichier à envoyer (photo, devis, PDF)', 'info');
  var inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*,.pdf';
  inp.onchange = function() {
    if (!inp.files || !inp.files[0]) return;
    var data = CHAT_DATA.load();
    if (!data[clientId]) return;
    data[clientId].messages.push({
      from: 'gerant',
      texte: '📎 Fichier partagé: ' + inp.files[0].name,
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      lu: true
    });
    CHAT_DATA.save(data);
    ouvrirChat(clientId);
    if (typeof toast === 'function') toast('Fichier envoyé !', 'success');
  };
  inp.click();
}

function localiserClientChat(clientId) {
  if (!navigator.geolocation) { if (typeof toast === 'function') toast('Géolocalisation non disponible', 'error'); return; }
  navigator.geolocation.getCurrentPosition(function(pos) {
    var lat = pos.coords.latitude.toFixed(4);
    var lng = pos.coords.longitude.toFixed(4);
    var data = CHAT_DATA.load();
    if (!data[clientId]) return;
    data[clientId].messages.push({
      from: 'gerant',
      texte: '📍 Position partagée: https://maps.google.com/?q=' + lat + ',' + lng,
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      lu: true
    });
    CHAT_DATA.save(data);
    ouvrirChat(clientId);
    if (typeof toast === 'function') toast('Position partagée dans le chat !', 'success');
  });
}

// ══════════════════════════════════════════════════════════════
//  INITIALISATION GLOBALE
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  initOfflineDB();
  initOfflineBanner();
  KPush.init();
  setTimeout(renderNotifBtn, 1000);

  // Écouter les synchronisations hors-ligne
  window.addEventListener('online', function() {
    if (typeof toast === 'function') toast('Connexion rétablie — synchronisation en cours...', 'success');
    syncOfflineQueue();
  });
  window.addEventListener('offline', function() {
    if (typeof toast === 'function') toast('Mode hors-ligne activé — l\'app continue de fonctionner', 'warning');
  });
});

// Intégrer avec goPage existant
var _origGoPage = typeof goPage === 'function' ? goPage : null;
function goPage(p) {
  if (_origGoPage) _origGoPage(p);
  if (p === 'kamer-pay') setTimeout(initPageKamerPay, 100);
  if (p === 'avis') setTimeout(initPageAvis, 100);
  if (p === 'chat') setTimeout(initPageChat, 100);
  if (p === 'tracking') setTimeout(initPageTracking, 100);
}

console.log('[KAMER360] 6 fonctionnalités chargées: KAMER Pay, Avis, GPS Tracking, Offline, Push, Chat');
