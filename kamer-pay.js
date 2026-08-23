// ═══════════════════════════════════════════════════════════════
//  KAMER360 — KAMER Pay
//  Portefeuille numérique intégré MTN MoMo + Orange Money
//  Transferts, historique, cashback, recharge
// ═══════════════════════════════════════════════════════════════

var KAMER_PAY_KEY = 'sm_kamer_pay';

function kpLoad() {
  try { return JSON.parse(localStorage.getItem(KAMER_PAY_KEY) || 'null') || kpDefault(); }
  catch(e) { return kpDefault(); }
}

function kpDefault() {
  return {
    solde: 0, cashback: 0, niveau: 'Standard',
    transactions: [], recharges: [],
    mobile: '', operateur: '',
    pin: null, pin_defini: false,
    created_at: new Date().toISOString()
  };
}

function kpSave(data) {
  try { localStorage.setItem(KAMER_PAY_KEY, JSON.stringify(data)); return true; }
  catch(e) { if(typeof toast==='function') toast('Erreur sauvegarde portefeuille', 'error'); return false; }
}

function kpGet() { return kpLoad(); }

// ── Créditer le portefeuille ──────────────────────────────────
function kpCrediter(montant, description, source) {
  var w = kpLoad();
  w.solde += montant;
  // Cashback 2% sur les achats
  if (source === 'achat') w.cashback += Math.round(montant * 0.02);
  w.transactions.unshift({
    id: 'KP' + Date.now(),
    type: 'credit', montant: montant,
    description: description || 'Credit',
    source: source || 'manuel',
    date: new Date().toISOString(),
    solde_apres: w.solde
  });
  // Mettre à jour le niveau
  w.niveau = w.solde >= 500000 ? 'Gold' : w.solde >= 100000 ? 'Silver' : 'Standard';
  kpSave(w);
  return w;
}

// ── Débiter le portefeuille ───────────────────────────────────
function kpDebiter(montant, description) {
  var w = kpLoad();
  if (w.solde < montant) {
    if(typeof toast==='function') toast('Solde insuffisant dans KAMER Pay', 'error');
    return false;
  }
  w.solde -= montant;
  w.transactions.unshift({
    id: 'KP' + Date.now(),
    type: 'debit', montant: montant,
    description: description || 'Paiement',
    date: new Date().toISOString(),
    solde_apres: w.solde
  });
  kpSave(w);
  return w;
}

// ── Recharge via Mobile Money ─────────────────────────────────
function kpInitierRecharge(montant, operateur, numero) {
  if (!montant || montant < 500) { toast('Montant minimum: 500 FCFA', 'error'); return; }
  var w = kpLoad();

  // Simuler la recharge (en production: appel API NotchPay)
  var recharge = {
    id: 'RC' + Date.now(),
    montant: montant, operateur: operateur,
    numero: numero, statut: 'en_cours',
    date: new Date().toISOString()
  };
  w.recharges.unshift(recharge);
  kpSave(w);

  // Simuler confirmation après 3s
  toast('Recharge en cours via ' + operateur + '...', 'info');
  setTimeout(function() {
    kpConfirmerRecharge(recharge.id, montant, operateur);
  }, 3000);
}

function kpConfirmerRecharge(rechargeId, montant, operateur) {
  var w = kpLoad();
  var rc = w.recharges.find(function(r){ return r.id === rechargeId; });
  if (rc) rc.statut = 'confirme';
  kpSave(w);
  kpCrediter(montant, 'Recharge ' + operateur, 'recharge');
  toast('Recharge de ' + montant.toLocaleString('fr-FR') + ' FCFA confirmée!', 'success');
  if (document.getElementById('kp-solde-display')) renderKamerPay();
}

// ── Transfert vers un autre utilisateur ──────────────────────
function kpTransferer(montant, destinataire, description) {
  var w = kpLoad();
  if (w.solde < montant) { toast('Solde insuffisant', 'error'); return false; }
  var result = kpDebiter(montant, 'Transfert vers ' + destinataire);
  if (result) {
    toast('Transfert de ' + montant.toLocaleString('fr-FR') + ' FCFA envoyé!', 'success');
    return true;
  }
  return false;
}

// ── Page KAMER Pay ────────────────────────────────────────────
function initPageKamerPay() {
  var z = document.getElementById('kp-content');
  if (!z) return;
  renderKamerPay();
}

function renderKamerPay() {
  var z = document.getElementById('kp-content');
  if (!z) return;
  var w = kpLoad();
  var niveauColors = { Standard: '#007A3D', Silver: '#6B7B8B', Gold: '#B8860B' };
  var nc = niveauColors[w.niveau] || '#007A3D';

  var html = '';

  // ── Carte portefeuille principale
  html += '<div style="background:linear-gradient(135deg,#003d1f,#007A3D,#00A852);border-radius:20px;padding:24px;color:#fff;margin-bottom:16px;position:relative;overflow:hidden">';
  html += '<div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08)"></div>';
  html += '<div style="position:absolute;bottom:-20px;left:-20px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.05)"></div>';
  html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative">';
  html += '<div>';
  html += '<div style="font-size:12px;opacity:.7;letter-spacing:.5px;text-transform:uppercase;margin-bottom:4px">KAMER Pay — Solde disponible</div>';
  html += '<div id="kp-solde-display" style="font-size:36px;font-weight:900;font-family:\'Playfair Display\',serif">' + w.solde.toLocaleString('fr-FR') + ' FCFA</div>';
  html += '<div style="margin-top:8px;display:flex;gap:10px">';
  html += '<span style="background:rgba(255,255,255,.15);padding:3px 10px;border-radius:20px;font-size:11px">Cashback: ' + w.cashback.toLocaleString('fr-FR') + ' F</span>';
  html += '<span style="background:rgba(252,209,22,.25);border:1px solid rgba(252,209,22,.5);color:#FCD116;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">' + w.niveau + '</span>';
  html += '</div></div>';
  html += '<div style="text-align:right;font-size:24px;opacity:.6">K<span style="color:#FCD116">3</span></div>';
  html += '</div></div>';

  // ── 4 actions rapides
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">';
  var actions = [
    { label:'Recharger', icon:'↑', fn:"ouvrirModalKP('recharge')" },
    { label:'Envoyer', icon:'→', fn:"ouvrirModalKP('transfert')" },
    { label:'Payer', icon:'✓', fn:"ouvrirModalKP('payer')" },
    { label:'Cashback', icon:'★', fn:"utiliserCashback()" },
  ];
  actions.forEach(function(a) {
    html += '<button onclick="' + a.fn + '" style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 8px;text-align:center;cursor:pointer;transition:all .2s;font-family:inherit" onmouseover="this.style.borderColor=\'#007A3D\';this.style.background=\'#f0faf5\'" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.background=\'#fff\'">';
    html += '<div style="font-size:22px;margin-bottom:6px;color:#007A3D">' + a.icon + '</div>';
    html += '<div style="font-size:11px;font-weight:700;color:#374151">' + a.label + '</div>';
    html += '</button>';
  });
  html += '</div>';

  // ── Historique transactions
  html += '<div class="cd">';
  html += '<div class="ch"><div class="ct">Historique des transactions</div>';
  html += '<span style="font-size:11px;color:#666">' + w.transactions.length + ' transactions</span></div>';

  if (w.transactions.length === 0) {
    html += '<div style="text-align:center;padding:32px;color:#9ca3af">';
    html += '<div style="font-size:36px;margin-bottom:8px">💳</div>';
    html += '<div style="font-weight:700;color:#374151;margin-bottom:4px">Aucune transaction</div>';
    html += '<div style="font-size:13px">Rechargez votre portefeuille pour commencer</div></div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:6px">';
    w.transactions.slice(0, 15).forEach(function(t) {
      var isCredit = t.type === 'credit';
      var date = new Date(t.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
      html += '<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:#f9fafb;border-radius:10px;border:1px solid #f0f0f0">';
      html += '<div style="width:36px;height:36px;border-radius:50%;background:' + (isCredit?'#dcfce7':'#fee2e2') + ';display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">' + (isCredit?'↓':'↑') + '</div>';
      html += '<div style="flex:1">';
      html += '<div style="font-size:13px;font-weight:600">' + t.description + '</div>';
      html += '<div style="font-size:11px;color:#666">' + date + '</div>';
      html += '</div>';
      html += '<div style="font-size:15px;font-weight:800;color:' + (isCredit?'#007A3D':'#CE1126') + '">' + (isCredit?'+':'-') + t.montant.toLocaleString('fr-FR') + ' F</div>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  z.innerHTML = html;
}

function ouvrirModalKP(type) {
  var m = document.getElementById('m-kamer-pay');
  if (!m) return;

  var titles = { recharge:'Recharger KAMER Pay', transfert:'Envoyer de l\'argent', payer:'Payer avec KAMER Pay' };
  document.getElementById('kp-modal-titre').textContent = titles[type] || 'KAMER Pay';

  var formEl = document.getElementById('kp-modal-form');
  var w = kpLoad();

  if (type === 'recharge') {
    formEl.innerHTML = ''
      + '<label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;color:#374151">Opérateur</label>'
      + '<div style="display:flex;gap:8px;margin-bottom:12px">'
      + '<button onclick="kpSelectOp(this,\'MTN MoMo\')" style="flex:1;padding:10px;border:2px solid #e5e7eb;border-radius:10px;background:#fff;font-weight:700;cursor:pointer;font-family:inherit;font-size:13px;color:#374151" id="btn-mtn">MTN MoMo</button>'
      + '<button onclick="kpSelectOp(this,\'Orange Money\')" style="flex:1;padding:10px;border:2px solid #e5e7eb;border-radius:10px;background:#fff;font-weight:700;cursor:pointer;font-family:inherit;font-size:13px;color:#374151" id="btn-om">Orange Money</button>'
      + '</div>'
      + '<input type="hidden" id="kp-operateur" value="">'
      + '<label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;color:#374151">Numéro de téléphone</label>'
      + '<input type="tel" id="kp-numero" placeholder="+237 6XX XX XX XX" style="width:100%;padding:11px;border:1.5px solid #d1d5db;border-radius:10px;font-size:14px;box-sizing:border-box;margin-bottom:12px">'
      + '<label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;color:#374151">Montant (FCFA)</label>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">'
      + ['1000','2000','5000','10000','25000','50000'].map(function(m){
          return '<button onclick="document.getElementById(\'kp-montant\').value=\'' + m + '\'" style="padding:6px 12px;border:1.5px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer;font-size:12px;font-weight:600;font-family:inherit">' + parseInt(m).toLocaleString('fr-FR') + '</button>';
        }).join('')
      + '</div>'
      + '<input type="number" id="kp-montant" placeholder="Montant" min="500" style="width:100%;padding:11px;border:1.5px solid #d1d5db;border-radius:10px;font-size:14px;box-sizing:border-box;margin-bottom:16px">'
      + '<button onclick="kpValiderRecharge()" style="width:100%;background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border:none;padding:13px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">Recharger maintenant</button>';

  } else if (type === 'transfert') {
    formEl.innerHTML = ''
      + '<div style="background:#f0faf5;border-radius:10px;padding:10px;margin-bottom:12px;font-size:13px;color:#007A3D;font-weight:600">Solde disponible: ' + w.solde.toLocaleString('fr-FR') + ' FCFA</div>'
      + '<label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;color:#374151">Destinataire (email ou tel)</label>'
      + '<input type="text" id="kp-dest" placeholder="email@exemple.cm ou +237..." style="width:100%;padding:11px;border:1.5px solid #d1d5db;border-radius:10px;font-size:14px;box-sizing:border-box;margin-bottom:12px">'
      + '<label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;color:#374151">Montant (FCFA)</label>'
      + '<input type="number" id="kp-montant" placeholder="Montant" style="width:100%;padding:11px;border:1.5px solid #d1d5db;border-radius:10px;font-size:14px;box-sizing:border-box;margin-bottom:12px">'
      + '<label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;color:#374151">Motif (optionnel)</label>'
      + '<input type="text" id="kp-motif" placeholder="Paiement prestation..." style="width:100%;padding:11px;border:1.5px solid #d1d5db;border-radius:10px;font-size:14px;box-sizing:border-box;margin-bottom:16px">'
      + '<button onclick="kpValiderTransfert()" style="width:100%;background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border:none;padding:13px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">Envoyer</button>';
  }

  openM('m-kamer-pay');
}

function kpSelectOp(btn, operateur) {
  ['btn-mtn','btn-om'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.style.borderColor = '#e5e7eb'; el.style.background = '#fff'; el.style.color = '#374151'; }
  });
  btn.style.borderColor = '#007A3D';
  btn.style.background = '#f0faf5';
  btn.style.color = '#007A3D';
  document.getElementById('kp-operateur').value = operateur;
}

function kpValiderRecharge() {
  var operateur = (document.getElementById('kp-operateur')||{}).value;
  var numero    = (document.getElementById('kp-numero')||{}).value;
  var montant   = parseFloat((document.getElementById('kp-montant')||{}).value) || 0;
  if (!operateur) { toast('Choisissez un operateur', 'warning'); return; }
  if (!numero)    { toast('Entrez votre numero', 'warning'); return; }
  if (montant < 500) { toast('Montant minimum: 500 FCFA', 'warning'); return; }
  closeM('m-kamer-pay');
  kpInitierRecharge(montant, operateur, numero);
}

function kpValiderTransfert() {
  var dest    = (document.getElementById('kp-dest')||{}).value;
  var montant = parseFloat((document.getElementById('kp-montant')||{}).value) || 0;
  var motif   = (document.getElementById('kp-motif')||{}).value || 'Transfert';
  if (!dest)       { toast('Entrez le destinataire', 'warning'); return; }
  if (montant < 1) { toast('Entrez un montant', 'warning'); return; }
  if (kpTransferer(montant, dest, motif)) {
    closeM('m-kamer-pay');
    if (document.getElementById('kp-content')) renderKamerPay();
  }
}

function utiliserCashback() {
  var w = kpLoad();
  if (w.cashback < 100) { toast('Cashback insuffisant (minimum 100 F)', 'warning'); return; }
  var montant = w.cashback;
  w.solde += montant;
  w.cashback = 0;
  w.transactions.unshift({
    id: 'KP' + Date.now(), type: 'credit',
    montant: montant, description: 'Cashback converti en solde',
    source: 'cashback', date: new Date().toISOString(), solde_apres: w.solde
  });
  kpSave(w);
  toast(montant.toLocaleString('fr-FR') + ' FCFA de cashback ajoutés au solde!', 'success');
  if (document.getElementById('kp-content')) renderKamerPay();
}

// Payer une commande boutique avec KAMER Pay
function payerAvecKamerPay(montant, orderId) {
  var w = kpLoad();
  if (w.solde < montant) {
    toast('Solde KAMER Pay insuffisant. Rechargez votre portefeuille.', 'error');
    return false;
  }
  var result = kpDebiter(montant, 'Commande #' + orderId);
  if (result) {
    // Cashback 2%
    kpCrediter(Math.round(montant * 0.02), 'Cashback commande #' + orderId, 'cashback');
    return true;
  }
  return false;
}
