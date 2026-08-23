// ═══════════════════════════════════════════════════════════════
//  KAMER360 — impact6.js
//  6 fonctionnalités à impact immédiat
//  1. KAMER Pay Wallet
//  2. Avis & Notations
//  3. Tracking GPS temps réel
//  4. Notifications Push PWA
//  5. Mode hors-ligne complet
//  6. Chat intégré client–gérant
// ═══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
//  UTILITAIRES COMMUNS
// ══════════════════════════════════════════════════════════════
function i6Save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); return true; }
  catch(e) { return false; }
}
function i6Load(key, def) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || def; }
  catch(e) { return def; }
}
function i6Id() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function i6Date(ts) {
  var d = new Date(ts || Date.now());
  return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
}
function i6Stars(n, editable, cb) {
  var html = '<div style="display:inline-flex;gap:3px;cursor:' + (editable?'pointer':'default') + '">';
  for (var i = 1; i <= 5; i++) {
    var filled = i <= n;
    html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="' + (filled?'#FCD116':'none') + '" stroke="' + (filled?'#FCD116':'#d1d5db') + '" stroke-width="2"' +
      (editable ? ' onclick="i6SetStar(' + i + ')" style="transition:.1s"' : '') +
      '><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  }
  html += '</div>';
  return html;
}

// ══════════════════════════════════════════════════════════════
//  1. KAMER PAY — Portefeuille numérique
// ══════════════════════════════════════════════════════════════
var KP_KEY = 'kamer_pay_data';

function kpData() {
  return i6Load(KP_KEY, {
    solde: 0,
    transactions: [],
    numero: (typeof currentUser !== 'undefined' && currentUser) ? (currentUser.tel || '') : '',
    pin_set: false
  });
}
function kpSave(d) { i6Save(KP_KEY, d); }

function kpCredit(montant, desc, ref) {
  var d = kpData();
  d.solde += montant;
  d.transactions.unshift({ id: i6Id(), type: 'credit', montant, desc: desc || 'Crédit', ref: ref || '', ts: Date.now() });
  kpSave(d);
}
function kpDebit(montant, desc, ref) {
  var d = kpData();
  if (d.solde < montant) return false;
  d.solde -= montant;
  d.transactions.unshift({ id: i6Id(), type: 'debit', montant, desc: desc || 'Paiement', ref: ref || '', ts: Date.now() });
  kpSave(d);
  return true;
}

function initPageKamerPay() {
  var z = document.getElementById('kamerpay-content');
  if (!z) return;
  var d = kpData();

  z.innerHTML = [
    // Carte solde principale
    '<div style="background:linear-gradient(135deg,#003d1f,#007A3D,#00A852);border-radius:20px;padding:28px;color:#fff;margin-bottom:16px;position:relative;overflow:hidden">',
      '<div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08)"></div>',
      '<div style="position:absolute;bottom:-20px;left:40%;width:80px;height:80px;border-radius:50%;background:rgba(252,209,22,.1)"></div>',
      '<div style="font-size:12px;opacity:.75;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Solde KAMER Pay</div>',
      '<div style="font-size:38px;font-weight:900;font-family:\'Playfair Display\',serif;margin-bottom:4px" id="kp-solde">' + d.solde.toLocaleString('fr-FR') + ' <span style="font-size:16px;opacity:.8">FCFA</span></div>',
      '<div style="font-size:12px;opacity:.65;margin-bottom:20px">Dernière mise à jour : ' + i6Date() + '</div>',
      '<div style="display:flex;gap:10px;flex-wrap:wrap">',
        '<button onclick="kpOpenModal(\'recharge\')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);color:#fff;padding:9px 18px;border-radius:22px;font-size:13px;font-weight:700;cursor:pointer;backdrop-filter:blur(4px)">+ Recharger</button>',
        '<button onclick="kpOpenModal(\'transfert\')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);color:#fff;padding:9px 18px;border-radius:22px;font-size:13px;font-weight:700;cursor:pointer;backdrop-filter:blur(4px)">Transférer</button>',
        '<button onclick="kpOpenModal(\'paiement\')" style="background:#FCD116;border:none;color:#003d1f;padding:9px 18px;border-radius:22px;font-size:13px;font-weight:700;cursor:pointer">Payer</button>',
      '</div>',
    '</div>',

    // Statistiques rapides
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">',
      kpStatCard('Total reçu', d.transactions.filter(t=>t.type==='credit').reduce((a,t)=>a+t.montant,0), '#007A3D'),
      kpStatCard('Total dépensé', d.transactions.filter(t=>t.type==='debit').reduce((a,t)=>a+t.montant,0), '#CE1126'),
      kpStatCard('Transactions', d.transactions.length, '#1565C0'),
    '</div>',

    // Historique transactions
    '<div class="cd">',
      '<div class="ch"><div class="ct">Historique des transactions</div>',
      '<button onclick="kpOpenModal(\'recharge\')" class="btn bp bsm">+ Recharger</button></div>',
      d.transactions.length === 0
        ? '<div style="text-align:center;padding:36px;color:#9ca3af"><div style="font-size:40px;margin-bottom:12px">💳</div><div style="font-weight:600;color:#374151">Aucune transaction</div><div style="font-size:13px;margin-top:6px">Rechargez votre portefeuille pour commencer</div></div>'
        : '<div style="display:flex;flex-direction:column;gap:1px">' +
          d.transactions.slice(0,20).map(function(t) {
            var isCredit = t.type === 'credit';
            return '<div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;transition:background .15s" onmouseover="this.style.background=\'#f9fafb\'" onmouseout="this.style.background=\'\'">' +
              '<div style="width:40px;height:40px;border-radius:50%;background:' + (isCredit?'#e8f5ef':'#fdecea') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
              '<svg width="16" height="16" fill="none" stroke="' + (isCredit?'#007A3D':'#CE1126') + '" stroke-width="2.5" viewBox="0 0 24 24"><path d="' + (isCredit?'M12 5v14M5 12l7-7 7 7':'M12 19V5M5 12l7 7 7-7') + '"/></svg></div>' +
              '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + t.desc + '</div>' +
              '<div style="font-size:11px;color:#9ca3af">' + i6Date(t.ts) + (t.ref?' · '+t.ref:'') + '</div></div>' +
              '<div style="font-size:15px;font-weight:800;color:' + (isCredit?'#007A3D':'#CE1126') + '">' + (isCredit?'+':'-') + t.montant.toLocaleString('fr-FR') + ' F</div>' +
              '</div>';
          }).join('') + '</div>',
    '</div>'
  ].join('');
}

function kpStatCard(label, val, color) {
  return '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;text-align:center">' +
    '<div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px">' + label + '</div>' +
    '<div style="font-size:18px;font-weight:900;color:' + color + '">' + (typeof val === 'number' ? val.toLocaleString('fr-FR') : val) + '</div>' +
    '</div>';
}

function kpOpenModal(type) {
  var titles = { recharge: 'Recharger le portefeuille', transfert: 'Transférer des fonds', paiement: 'Effectuer un paiement' };
  var m = document.getElementById('m-kamer-pay');
  if (!m) return;
  document.getElementById('kp-modal-title').textContent = titles[type] || 'KAMER Pay';
  document.getElementById('kp-modal-body').innerHTML = kpModalContent(type);
  document.getElementById('kp-modal-type').value = type;
  openM('m-kamer-pay');
}

function kpModalContent(type) {
  if (type === 'recharge') {
    return '<div style="padding:16px">' +
      '<div style="font-size:13px;color:#555;margin-bottom:14px">Choisissez votre opérateur et entrez le montant</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">' +
        ['MTN MoMo', 'Orange Money', 'Express Union', 'CCA Bank'].map(function(op) {
          return '<div onclick="kpSelectOp(this,\'' + op + '\')" style="border:1.5px solid #e5e7eb;border-radius:10px;padding:10px;text-align:center;cursor:pointer;font-size:13px;font-weight:600;transition:.15s">' + op + '</div>';
        }).join('') +
      '</div>' +
      '<input type="hidden" id="kp-operateur" value="">' +
      '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:5px">Montant (FCFA)</label>' +
      '<input type="number" id="kp-montant" placeholder="Ex: 5000" min="500" style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:15px;box-sizing:border-box;margin-bottom:8px">' +
      '<div style="display:flex;gap:6px;margin-bottom:14px">' +
        [500,1000,2000,5000,10000].map(function(v) {
          return '<button onclick="document.getElementById(\'kp-montant\').value=' + v + '" style="border:1px solid #e5e7eb;border-radius:20px;padding:5px 10px;font-size:11px;cursor:pointer;background:#fff">' + v.toLocaleString('fr-FR') + '</button>';
        }).join('') +
      '</div>' +
      '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:5px">Numéro Mobile Money</label>' +
      '<input type="tel" id="kp-numero" placeholder="+237 6XX XX XX XX" style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;margin-bottom:14px">' +
      '<button onclick="kpConfirmer()" class="btn bp" style="width:100%;padding:13px;font-size:15px">Recharger maintenant</button>' +
      '</div>';
  }
  if (type === 'transfert') {
    return '<div style="padding:16px">' +
      '<div style="background:#f0faf5;border-radius:10px;padding:12px;margin-bottom:14px;font-size:13px">Solde disponible : <strong>' + kpData().solde.toLocaleString('fr-FR') + ' FCFA</strong></div>' +
      '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:5px">Téléphone du destinataire *</label>' +
      '<input type="tel" id="kp-dest" placeholder="+237 6XX XX XX XX" style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;margin-bottom:12px">' +
      '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:5px">Montant (FCFA) *</label>' +
      '<input type="number" id="kp-montant" placeholder="Montant" min="100" style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:15px;box-sizing:border-box;margin-bottom:12px">' +
      '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:5px">Motif (optionnel)</label>' +
      '<input type="text" id="kp-motif" placeholder="Ex: Paiement commande #C-001" style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;margin-bottom:14px">' +
      '<button onclick="kpConfirmer()" class="btn bp" style="width:100%;padding:13px;font-size:15px">Transférer</button>' +
      '</div>';
  }
  // Paiement
  return '<div style="padding:16px">' +
    '<div style="background:#f0faf5;border-radius:10px;padding:12px;margin-bottom:14px;font-size:13px">Solde disponible : <strong>' + kpData().solde.toLocaleString('fr-FR') + ' FCFA</strong></div>' +
    '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:5px">Référence commande</label>' +
    '<input type="text" id="kp-ref" placeholder="Ex: CMD-2026-001" style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;margin-bottom:12px">' +
    '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:5px">Montant (FCFA) *</label>' +
    '<input type="number" id="kp-montant" placeholder="Montant à payer" style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:15px;box-sizing:border-box;margin-bottom:14px">' +
    '<button onclick="kpConfirmer()" class="btn bp" style="width:100%;padding:13px;font-size:15px">Payer avec KAMER Pay</button>' +
    '</div>';
}

function kpSelectOp(el, op) {
  document.querySelectorAll('#kp-modal-body [onclick^="kpSelectOp"]').forEach(function(e) {
    e.style.borderColor='#e5e7eb'; e.style.background='';
  });
  el.style.borderColor='#007A3D'; el.style.background='#f0faf5';
  document.getElementById('kp-operateur').value = op;
}

function kpConfirmer() {
  var type = document.getElementById('kp-modal-type').value;
  var montant = parseInt((document.getElementById('kp-montant')||{}).value) || 0;
  if (montant < 100) { if(typeof toast==='function') toast('Montant invalide', 'error'); return; }

  if (type === 'recharge') {
    var op = (document.getElementById('kp-operateur')||{}).value;
    if (!op) { if(typeof toast==='function') toast('Choisissez un opérateur', 'warning'); return; }
    kpCredit(montant, 'Recharge ' + op, op);
    if(typeof toast==='function') toast('Recharge de ' + montant.toLocaleString('fr-FR') + ' FCFA effectuée !', 'success');
  } else if (type === 'transfert') {
    var dest = (document.getElementById('kp-dest')||{}).value;
    var motif = (document.getElementById('kp-motif')||{}).value;
    if (!dest) { if(typeof toast==='function') toast('Entrez le numéro destinataire', 'warning'); return; }
    var ok = kpDebit(montant, 'Transfert vers ' + dest, motif);
    if (!ok) { if(typeof toast==='function') toast('Solde insuffisant', 'error'); return; }
    if(typeof toast==='function') toast('Transfert de ' + montant.toLocaleString('fr-FR') + ' FCFA envoyé !', 'success');
  } else {
    var ref = (document.getElementById('kp-ref')||{}).value;
    var ok2 = kpDebit(montant, 'Paiement' + (ref?' '+ref:''), ref);
    if (!ok2) { if(typeof toast==='function') toast('Solde insuffisant', 'error'); return; }
    if(typeof toast==='function') toast('Paiement de ' + montant.toLocaleString('fr-FR') + ' FCFA effectué !', 'success');
  }
  if(typeof closeM==='function') closeM('m-kamer-pay');
  initPageKamerPay();
  var el = document.getElementById('kp-solde');
  if (el) { el.style.transform='scale(1.08)'; setTimeout(function(){ el.style.transform=''; }, 300); }
}

// ══════════════════════════════════════════════════════════════
//  2. AVIS & NOTATIONS — Système complet
// ══════════════════════════════════════════════════════════════
var AV_KEY = 'kamer_avis_data';
var _kpStarNote = 0;

function avData() { return i6Load(AV_KEY, { avis: [] }); }
function avSave(d) { i6Save(AV_KEY, d); }

function i6SetStar(n) {
  _kpStarNote = n;
  var el = document.getElementById('av-stars-input');
  if (el) el.innerHTML = i6Stars(n, true);
}

function initPageAvis() {
  var z = document.getElementById('avis-content');
  if (!z) return;
  var d = avData();
  var avis = d.avis;

  // Calcul statistiques
  var total = avis.length;
  var moy = total ? (avis.reduce(function(a,av){ return a + av.note; }, 0) / total) : 0;
  var dist = [0,0,0,0,0];
  avis.forEach(function(av) { if(av.note>=1&&av.note<=5) dist[av.note-1]++; });

  z.innerHTML = [
    // Résumé global
    '<div style="display:grid;grid-template-columns:auto 1fr;gap:20px;background:#fff;border-radius:16px;padding:20px;border:1px solid #e5e7eb;margin-bottom:16px;align-items:center">',
      '<div style="text-align:center;padding:0 20px">',
        '<div style="font-size:56px;font-weight:900;font-family:\'Playfair Display\',serif;color:#007A3D;line-height:1">' + moy.toFixed(1) + '</div>',
        '<div style="margin:6px 0">' + i6Stars(Math.round(moy), false) + '</div>',
        '<div style="font-size:12px;color:#9ca3af">' + total + ' avis</div>',
      '</div>',
      '<div>',
        [5,4,3,2,1].map(function(n) {
          var nb = dist[n-1];
          var pct = total ? Math.round(nb/total*100) : 0;
          return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">' +
            '<span style="font-size:12px;color:#555;width:12px">' + n + '</span>' +
            '<svg width="12" height="12" fill="#FCD116" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
            '<div style="flex:1;height:8px;background:#f3f4f6;border-radius:20px;overflow:hidden">' +
              '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#007A3D,#00A852);border-radius:20px;transition:width .5s"></div>' +
            '</div>' +
            '<span style="font-size:11px;color:#9ca3af;width:30px;text-align:right">' + nb + '</span>' +
            '</div>';
        }).join(''),
      '</div>',
    '</div>',

    // Bouton écrire un avis
    '<div style="margin-bottom:16px">',
      '<button onclick="avOpenForm()" class="btn bp" style="padding:11px 24px">Écrire un avis</button>',
    '</div>',

    // Liste des avis
    '<div class="cd">',
      '<div class="ch"><div class="ct">Tous les avis</div></div>',
      avis.length === 0
        ? '<div style="text-align:center;padding:40px;color:#9ca3af"><div style="font-size:44px;margin-bottom:12px">⭐</div><div style="font-weight:600;color:#374151">Aucun avis pour l instant</div><div style="font-size:13px;margin-top:6px">Invitez vos clients à laisser un avis après leur commande</div></div>'
        : avis.slice(0,30).map(function(av) {
            return '<div style="padding:14px 0;border-bottom:1px solid #f5f8f5">' +
              '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">' +
                '<div style="display:flex;align-items:center;gap:10px">' +
                  '<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#007A3D,#00A852);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px">' + (av.auteur||'C')[0].toUpperCase() + '</div>' +
                  '<div><div style="font-size:13px;font-weight:700">' + (av.auteur||'Client anonyme') + '</div>' +
                  '<div style="font-size:11px;color:#9ca3af">' + i6Date(av.ts) + '</div></div>' +
                '</div>' +
                '<div>' + i6Stars(av.note, false) + '</div>' +
              '</div>' +
              '<p style="font-size:13px;color:#555;margin:0;line-height:1.6">' + av.texte + '</p>' +
              (av.reponse ? '<div style="background:#f0faf5;border-left:3px solid #007A3D;padding:8px 12px;margin-top:8px;border-radius:0 8px 8px 0;font-size:12px;color:#374151"><strong>Réponse du gérant :</strong> ' + av.reponse + '</div>' : '') +
              (!av.reponse ? '<button onclick="avOuvrirReponse(\'' + av.id + '\')" style="margin-top:8px;background:none;border:1px solid #d1d5db;padding:5px 12px;border-radius:20px;font-size:11px;cursor:pointer;color:#555">Répondre</button>' : '') +
            '</div>';
          }).join(''),
    '</div>'
  ].join('');
}

function avOpenForm() {
  _kpStarNote = 0;
  var m = document.getElementById('m-avis-form');
  if (!m) return;
  var body = document.getElementById('av-form-body');
  if (body) body.innerHTML = [
    '<div style="padding:16px">',
      '<div style="margin-bottom:14px">',
        '<div style="font-size:12px;font-weight:600;margin-bottom:6px">Note globale *</div>',
        '<div id="av-stars-input">' + i6Stars(0, true) + '</div>',
      '</div>',
      '<div style="margin-bottom:12px">',
        '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:5px">Votre nom</label>',
        '<input type="text" id="av-auteur" placeholder="Ex: Jean-Pierre D." style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box">',
      '</div>',
      '<div style="margin-bottom:12px">',
        '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:5px">Service concerné</label>',
        '<select id="av-service" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">',
          '<option value="">Général</option>',
          ['Boutique','Coiffure','Pressing','Automobile','Restauration','Energie','Santé','BTP','Agriculture','Logistique','Éducation','Immobilier'].map(function(s){ return '<option>' + s + '</option>'; }).join(''),
        '</select>',
      '</div>',
      '<div style="margin-bottom:14px">',
        '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:5px">Votre avis *</label>',
        '<textarea id="av-texte" rows="4" placeholder="Partagez votre expérience..." style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box;resize:vertical"></textarea>',
      '</div>',
      '<button onclick="avSoumettre()" class="btn bp" style="width:100%;padding:12px;font-size:14px">Publier mon avis</button>',
    '</div>'
  ].join('');
  if(typeof openM==='function') openM('m-avis-form');
}

function avSoumettre() {
  if (_kpStarNote === 0) { if(typeof toast==='function') toast('Donnez une note (1-5 étoiles)', 'warning'); return; }
  var texte = (document.getElementById('av-texte')||{}).value || '';
  if (!texte.trim()) { if(typeof toast==='function') toast('Écrivez votre avis', 'warning'); return; }
  var d = avData();
  d.avis.unshift({
    id: i6Id(),
    note: _kpStarNote,
    auteur: (document.getElementById('av-auteur')||{}).value || 'Client anonyme',
    service: (document.getElementById('av-service')||{}).value || 'Général',
    texte: texte,
    ts: Date.now(),
    reponse: ''
  });
  avSave(d);
  if(typeof closeM==='function') closeM('m-avis-form');
  if(typeof toast==='function') toast('Avis publié avec succès !', 'success');
  initPageAvis();
}

function avOuvrirReponse(id) {
  var rep = prompt('Votre réponse à cet avis :');
  if (!rep) return;
  var d = avData();
  var av = d.avis.find(function(a){ return a.id === id; });
  if (av) { av.reponse = rep; avSave(d); initPageAvis(); if(typeof toast==='function') toast('Réponse publiée', 'success'); }
}

// Ajouter un avis depuis boutique (côté client)
function avAjouterDepuisBoutique(service, note, texte, auteur) {
  var d = avData();
  d.avis.unshift({ id: i6Id(), note, auteur: auteur||'Client', service: service||'Boutique', texte, ts: Date.now(), reponse: '' });
  avSave(d);
}

// ══════════════════════════════════════════════════════════════
//  3. TRACKING GPS TEMPS RÉEL
// ══════════════════════════════════════════════════════════════
var TR_KEY = 'kamer_tracking_data';
var _trWatchId = null;
var _trMap = null;
var _trMarkers = {};

function trData() { return i6Load(TR_KEY, { livraisons: [] }); }
function trSave(d) { i6Save(TR_KEY, d); }

function initPageTracking() {
  var z = document.getElementById('tracking-content');
  if (!z) return;
  var d = trData();

  z.innerHTML = [
    // Carte Leaflet
    '<div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;margin-bottom:16px">',
      '<div id="tracking-map" style="height:380px;width:100%;background:#f0f4f1"></div>',
    '</div>',

    // Livraisons en cours
    '<div class="cd">',
      '<div class="ch">',
        '<div class="ct">Livraisons en cours</div>',
        '<button onclick="trSimulerLivraison()" class="btn bo bsm">+ Simuler</button>',
      '</div>',
      d.livraisons.length === 0
        ? '<div style="text-align:center;padding:36px;color:#9ca3af"><div style="font-size:44px;margin-bottom:12px">📦</div><div style="font-weight:600;color:#374151">Aucune livraison en cours</div><div style="font-size:13px;margin-top:6px">Cliquez "Simuler" pour tester le tracking</div></div>'
        : '<div style="display:flex;flex-direction:column;gap:8px">' +
          d.livraisons.map(function(l) {
            var colors = { 'en route':'#007A3D', 'préparation':'#f59e0b', 'livré':'#1565C0' };
            var bgColors = { 'en route':'#e8f5ef', 'préparation':'#fff8e1', 'livré':'#e3f2fd' };
            return '<div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px" id="tr-' + l.id + '">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
                '<div style="font-size:14px;font-weight:700">' + l.ref + '</div>' +
                '<span style="background:' + (bgColors[l.statut]||'#f3f4f6') + ';color:' + (colors[l.statut]||'#374151') + ';font-size:11px;padding:3px 10px;border-radius:20px;font-weight:700">' + (l.statut||'inconnu') + '</span>' +
              '</div>' +
              '<div style="font-size:12px;color:#555;margin-bottom:10px">Client : ' + l.client + ' · ' + (l.adresse||'Douala') + '</div>' +
              '<div style="display:flex;gap:8px">' +
                '<button onclick="trLocate(\'' + l.id + '\')" class="btn bp bsm">Localiser livreur</button>' +
                '<button onclick="trUpdateStatut(\'' + l.id + '\')" class="btn bo bsm">Changer statut</button>' +
                '<button onclick="trEnvoyerSMS(\'' + l.id + '\')" class="btn by bsm">SMS client</button>' +
              '</div>' +
            '</div>';
          }).join('') + '</div>',
    '</div>'
  ].join('');

  // Initialiser la carte Leaflet
  setTimeout(function() {
    if (typeof L === 'undefined') return;
    if (_trMap) { _trMap.remove(); _trMap = null; }
    _trMap = L.map('tracking-map').setView([3.848, 11.5021], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19
    }).addTo(_trMap);

    // Afficher les livraisons sur la carte
    var d2 = trData();
    d2.livraisons.forEach(function(l) {
      if (l.lat && l.lng) {
        var icon = L.divIcon({
          html: '<div style="background:#007A3D;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.3)">🚛</div>',
          iconSize: [32,32], iconAnchor: [16,16], className: ''
        });
        var marker = L.marker([l.lat, l.lng], { icon }).addTo(_trMap);
        marker.bindPopup('<strong>' + l.ref + '</strong><br>' + l.client + '<br><em>' + l.statut + '</em>');
        _trMarkers[l.id] = marker;
      }
    });
  }, 300);
}

function trSimulerLivraison() {
  var d = trData();
  var villes = [
    { name:'Akwa', lat:4.0511, lng:9.7679 },
    { name:'Bonanjo', lat:4.0469, lng:9.7014 },
    { name:'Bepanda', lat:4.0667, lng:9.7500 },
    { name:'Makepe', lat:4.0800, lng:9.7400 },
    { name:'Bonapriso', lat:4.0552, lng:9.7200 }
  ];
  var v = villes[Math.floor(Math.random() * villes.length)];
  var ref = 'CMD-' + Date.now().toString().slice(-5);
  d.livraisons.unshift({
    id: i6Id(), ref, client: 'Client Test', adresse: v.name + ', Douala',
    statut: 'en route', lat: v.lat, lng: v.lng, ts: Date.now()
  });
  trSave(d);
  initPageTracking();
  if(typeof toast==='function') toast('Livraison ' + ref + ' ajoutée au tracking', 'success');
}

function trLocate(id) {
  if (!navigator.geolocation) { if(typeof toast==='function') toast('GPS non disponible sur cet appareil', 'error'); return; }
  if(typeof toast==='function') toast('Localisation GPS en cours...', 'info');
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      var d = trData();
      var l = d.livraisons.find(function(x){ return x.id === id; });
      if (l) {
        l.lat = pos.coords.latitude;
        l.lng = pos.coords.longitude;
        l.lat_ts = Date.now();
        trSave(d);
        if (_trMap && _trMarkers[id]) {
          _trMarkers[id].setLatLng([l.lat, l.lng]);
          _trMap.panTo([l.lat, l.lng], { animate: true });
        }
        if(typeof toast==='function') toast('Position mise à jour', 'success');
      }
    },
    function() { if(typeof toast==='function') toast('Impossible d\'obtenir votre position', 'error'); },
    { timeout: 8000, enableHighAccuracy: true }
  );
}

function trUpdateStatut(id) {
  var statuts = ['préparation', 'en route', 'livré'];
  var d = trData();
  var l = d.livraisons.find(function(x){ return x.id === id; });
  if (!l) return;
  var idx = statuts.indexOf(l.statut);
  l.statut = statuts[(idx + 1) % statuts.length];
  trSave(d);
  initPageTracking();
  if(typeof toast==='function') toast('Statut mis à jour : ' + l.statut, 'success');
}

function trEnvoyerSMS(id) {
  var d = trData();
  var l = d.livraisons.find(function(x){ return x.id === id; });
  if (!l) return;
  var msgs = {
    'préparation': 'Votre commande ' + l.ref + ' est en préparation. Livraison prévue dans 2h.',
    'en route': 'Votre commande ' + l.ref + ' est en route ! Le livreur arrive bientôt.',
    'livré': 'Votre commande ' + l.ref + ' a été livrée. Merci pour votre confiance — KAMER360'
  };
  var msg = msgs[l.statut] || 'Mise à jour de votre commande ' + l.ref;
  // Ouvrir WhatsApp avec le message
  window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
  if(typeof toast==='function') toast('Message WhatsApp ouvert', 'success');
}

// ══════════════════════════════════════════════════════════════
//  4. NOTIFICATIONS PUSH PWA
// ══════════════════════════════════════════════════════════════
var NP_GRANTED = false;
var NP_KEY = 'kamer_notifs_prefs';

function npData() { return i6Load(NP_KEY, { actives: true, types: { commandes:true, stock:true, promo:true, avis:true, chat:true } }); }

async function npDemanderPermission() {
  if (!('Notification' in window)) {
    if(typeof toast==='function') toast('Notifications non supportées sur cet appareil', 'error');
    return false;
  }
  if (Notification.permission === 'granted') { NP_GRANTED = true; return true; }
  var perm = await Notification.requestPermission();
  NP_GRANTED = perm === 'granted';
  return NP_GRANTED;
}

async function npEnvoyer(titre, body, icone, donnees) {
  if (!NP_GRANTED && !(await npDemanderPermission())) return;
  var prefs = npData();
  if (!prefs.actives) return;

  // Vérifier le type
  var type = (donnees && donnees.type) || 'general';
  if (type !== 'general' && prefs.types[type] === false) return;

  try {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      var reg = await navigator.serviceWorker.ready;
      reg.showNotification(titre, {
        body: body,
        icon: icone || '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [200, 100, 200],
        data: donnees || {},
        actions: [
          { action: 'ouvrir', title: 'Ouvrir KAMER360' },
          { action: 'ignorer', title: 'Ignorer' }
        ]
      });
    } else {
      new Notification(titre, { body, icon: icone });
    }
  } catch(e) {
    // Fallback toast
    if(typeof toast==='function') toast(titre + ' — ' + body, 'info');
  }
}

// Notifications automatiques intégrées à l'app
function npNouvelleCommande(cmd) {
  npEnvoyer('Nouvelle commande !', 'Commande #' + (cmd.ref||'') + ' de ' + (cmd.client||'un client'), null, {type:'commandes', url:'commandes'});
}
function npStockCritique(produit) {
  npEnvoyer('Stock critique', produit + ' — stock faible, réapprovisionnez', null, {type:'stock', url:'produits'});
}
function npPromoExpire(promo) {
  npEnvoyer('Promo expire bientôt', 'La promotion "' + promo + '" expire dans 24h', null, {type:'promo'});
}
function npNouvelAvis() {
  npEnvoyer('Nouvel avis client', 'Un client vient de laisser un avis sur KAMER360', null, {type:'avis', url:'avis'});
}
function npNouvelMessage(exp) {
  npEnvoyer('Nouveau message', exp + ' vous a envoyé un message', null, {type:'chat', url:'chat'});
}

function initPageNotifications() {
  var z = document.getElementById('notifs-content');
  if (!z) return;
  var prefs = npData();
  var granted = 'Notification' in window ? Notification.permission : 'non supporté';

  z.innerHTML = [
    // Statut permission
    '<div class="cd" style="margin-bottom:16px">',
      '<div class="ch"><div class="ct">Statut des notifications</div></div>',
      '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">',
        '<div style="flex:1;min-width:200px">',
          '<div style="font-size:14px;font-weight:600;margin-bottom:4px">Permission navigateur</div>',
          '<div style="font-size:13px;color:#555">Statut actuel : <strong style="color:' + (granted==='granted'?'#007A3D':'#CE1126') + '">' + granted + '</strong></div>',
        '</div>',
        granted !== 'granted' ?
          '<button onclick="npDemanderPermission().then(function(ok){ if(ok) { toast(\'Notifications activées !\',\'success\'); initPageNotifications(); } else { toast(\'Permission refusée\',\'error\'); } })" class="btn bp">Activer les notifications</button>' :
          '<div style="background:#e8f5ef;color:#007A3D;padding:8px 16px;border-radius:20px;font-size:13px;font-weight:600">Actives</div>',
      '</div>',
    '</div>',

    // Types de notifications
    '<div class="cd" style="margin-bottom:16px">',
      '<div class="ch"><div class="ct">Types de notifications</div></div>',
      '<div style="display:flex;flex-direction:column;gap:1px">',
        [
          { key:'commandes', label:'Nouvelles commandes', desc:'Alerte dès qu\'un client passe une commande' },
          { key:'stock', label:'Stock critique', desc:'Alerte quand un produit est presque épuisé' },
          { key:'promo', label:'Promotions', desc:'Rappels d\'expiration des offres' },
          { key:'avis', label:'Nouveaux avis', desc:'Notification pour chaque avis client' },
          { key:'chat', label:'Messages chat', desc:'Nouveaux messages de vos clients' },
        ].map(function(t) {
          var active = prefs.types[t.key] !== false;
          return '<div style="display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid #f5f8f5">' +
            '<div style="flex:1">' +
              '<div style="font-size:13px;font-weight:600">' + t.label + '</div>' +
              '<div style="font-size:12px;color:#9ca3af">' + t.desc + '</div>' +
            '</div>' +
            '<label style="position:relative;width:44px;height:24px;cursor:pointer;flex-shrink:0">' +
              '<input type="checkbox" ' + (active?'checked':'') + ' onchange="npToggle(\'' + t.key + '\',this.checked)" style="opacity:0;width:0;height:0">' +
              '<span style="position:absolute;inset:0;background:' + (active?'#007A3D':'#d1d5db') + ';border-radius:24px;transition:.3s"></span>' +
              '<span style="position:absolute;top:2px;left:' + (active?'22':'2') + 'px;width:20px;height:20px;background:#fff;border-radius:50%;transition:.3s;box-shadow:0 1px 4px rgba(0,0,0,.2)"></span>' +
            '</label>' +
          '</div>';
        }).join(''),
      '</div>',
    '</div>',

    // Test notifications
    '<div class="cd">',
      '<div class="ch"><div class="ct">Tester les notifications</div></div>',
      '<div style="display:flex;flex-wrap:wrap;gap:8px">',
        '<button onclick="npEnvoyer(\'Nouvelle commande !\',\'Commande #C-001 reçue — 15 000 FCFA\',null,{type:\'commandes\'})" class="btn bo bsm">Test Commande</button>',
        '<button onclick="npEnvoyer(\'Stock critique\',\'Riz 5kg — plus que 2 en stock\',null,{type:\'stock\'})" class="btn bo bsm">Test Stock</button>',
        '<button onclick="npEnvoyer(\'Nouvel avis\',\'Un client a donné 5 étoiles !\',null,{type:\'avis\'})" class="btn bo bsm">Test Avis</button>',
        '<button onclick="npEnvoyer(\'Nouveau message\',\'Jean-Pierre vous a écrit\',null,{type:\'chat\'})" class="btn bo bsm">Test Chat</button>',
      '</div>',
    '</div>'
  ].join('');
}

function npToggle(key, val) {
  var d = npData();
  d.types[key] = val;
  i6Save(NP_KEY, d);
  if(typeof toast==='function') toast(val ? 'Notification "' + key + '" activée' : 'Notification "' + key + '" désactivée', 'info');
}

// ══════════════════════════════════════════════════════════════
//  5. MODE HORS-LIGNE — IndexedDB + Cache stratégique
// ══════════════════════════════════════════════════════════════
var IDB_NAME = 'kamer360_offline';
var IDB_VER  = 1;
var _idb = null;

function idbOpen() {
  return new Promise(function(resolve, reject) {
    if (_idb) { resolve(_idb); return; }
    var req = indexedDB.open(IDB_NAME, IDB_VER);
    req.onupgradeneeded = function(e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains('produits'))   db.createObjectStore('produits',   { keyPath:'id' });
      if (!db.objectStoreNames.contains('commandes'))  db.createObjectStore('commandes',  { keyPath:'id' });
      if (!db.objectStoreNames.contains('panier'))     db.createObjectStore('panier',     { keyPath:'id' });
      if (!db.objectStoreNames.contains('sync_queue')) db.createObjectStore('sync_queue', { keyPath:'id' });
    };
    req.onsuccess = function(e) { _idb = e.target.result; resolve(_idb); };
    req.onerror   = function(e) { reject(e.target.error); };
  });
}

function idbPut(store, data) {
  return idbOpen().then(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(store, 'readwrite');
      var req = tx.objectStore(store).put(data);
      req.onsuccess = function() { resolve(req.result); };
      req.onerror   = function(e) { reject(e.target.error); };
    });
  });
}

function idbGetAll(store) {
  return idbOpen().then(function(db) {
    return new Promise(function(resolve, reject) {
      var tx  = db.transaction(store, 'readonly');
      var req = tx.objectStore(store).getAll();
      req.onsuccess = function() { resolve(req.result); };
      req.onerror   = function(e) { reject(e.target.error); };
    });
  });
}

function idbDelete(store, id) {
  return idbOpen().then(function(db) {
    return new Promise(function(resolve, reject) {
      var tx  = db.transaction(store, 'readwrite');
      var req = tx.objectStore(store).delete(id);
      req.onsuccess = resolve;
      req.onerror   = function(e) { reject(e.target.error); };
    });
  });
}

// Détecter la connexion et synchroniser
window.addEventListener('online', function() {
  if(typeof toast==='function') toast('Connexion rétablie — synchronisation en cours...', 'success');
  olSyncQueue();
  npEnvoyer('Connexion rétablie', 'Vos données hors-ligne ont été synchronisées', null, {});
});
window.addEventListener('offline', function() {
  if(typeof toast==='function') toast('Mode hors-ligne activé — l\'app continue de fonctionner', 'info');
});

// File d'attente de synchronisation
function olAddToQueue(action, data) {
  idbPut('sync_queue', { id: i6Id(), action, data, ts: Date.now() });
}

function olSyncQueue() {
  if (!navigator.onLine) return;
  idbGetAll('sync_queue').then(function(items) {
    if (!items.length) return;
    items.forEach(function(item) {
      // Simuler la sync (en prod: appel API Supabase)
      console.log('[KAMER360] Sync:', item.action, item.data);
      idbDelete('sync_queue', item.id);
    });
    if(typeof toast==='function') toast(items.length + ' action(s) synchronisée(s)', 'success');
  });
}

// Statut mode hors-ligne dans le dashboard
function olStatut() {
  return {
    online: navigator.onLine,
    label: navigator.onLine ? 'En ligne' : 'Hors-ligne',
    color: navigator.onLine ? '#007A3D' : '#f59e0b'
  };
}

// ══════════════════════════════════════════════════════════════
//  6. CHAT INTÉGRÉ — Client ↔ Gérant temps réel
// ══════════════════════════════════════════════════════════════
var CH_KEY = 'kamer_chat_data';
var _chConvActive = null;

function chData() {
  return i6Load(CH_KEY, {
    conversations: [
      { id:'conv_demo', contact:'Jean-Pierre MBARGA', role:'Client', avatar:'J', dernierMsg:'Bonjour, ma commande est-elle prête ?', ts: Date.now()-3600000, non_lus:1, messages: [
        { id:'m1', auteur:'Jean-Pierre MBARGA', moi:false, texte:'Bonjour ! Ma commande CMD-001 est-elle prête ?', ts: Date.now()-3600000 },
        { id:'m2', auteur:'Vous', moi:true, texte:'Bonjour Jean-Pierre ! Votre commande est en préparation, livraison estimée à 14h.', ts: Date.now()-3000000 },
        { id:'m3', auteur:'Jean-Pierre MBARGA', moi:false, texte:'Parfait, merci ! Je serai disponible.', ts: Date.now()-2400000 },
        { id:'m4', auteur:'Jean-Pierre MBARGA', moi:false, texte:'Bonjour, ma commande est-elle prête ?', ts: Date.now()-1200000 },
      ]},
      { id:'conv_demo2', contact:'Marie FOUDA', role:'Cliente', avatar:'M', dernierMsg:'Avez-vous des produits bio ?', ts: Date.now()-7200000, non_lus:0, messages: [
        { id:'m5', auteur:'Marie FOUDA', moi:false, texte:'Bonjour ! Avez-vous des produits bio ?', ts: Date.now()-7200000 },
      ]},
    ]
  });
}
function chSave(d) { i6Save(CH_KEY, d); }

function initPageChat() {
  var z = document.getElementById('chat-content');
  if (!z) return;
  var d = chData();

  z.innerHTML = '<div style="display:grid;grid-template-columns:280px 1fr;gap:0;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;height:560px;background:#fff">' +
    // Panel gauche — liste conversations
    '<div style="border-right:1px solid #e5e7eb;display:flex;flex-direction:column">' +
      '<div style="padding:14px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between">' +
        '<div style="font-size:14px;font-weight:700">Messages</div>' +
        '<button onclick="chNouvConv()" style="background:#007A3D;color:#fff;border:none;width:28px;height:28px;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1">+</button>' +
      '</div>' +
      '<div id="ch-liste" style="flex:1;overflow-y:auto">' +
        d.conversations.map(function(c) {
          return '<div id="ch-item-' + c.id + '" onclick="chOuvrirConv(\'' + c.id + '\')" style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;transition:background .15s;border-bottom:1px solid #f5f8f5" onmouseover="this.style.background=\'#f9fafb\'" onmouseout="this.style.background=\'\'">' +
            '<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#007A3D,#00A852);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:15px;flex-shrink:0">' + c.avatar + '</div>' +
            '<div style="flex:1;min-width:0">' +
              '<div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + c.contact + '</div>' +
              '<div style="font-size:11px;color:#9ca3af;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + c.dernierMsg + '</div>' +
            '</div>' +
            (c.non_lus > 0 ? '<span style="background:#007A3D;color:#fff;font-size:10px;font-weight:800;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">' + c.non_lus + '</span>' : '') +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>' +

    // Panel droit — zone de chat
    '<div style="display:flex;flex-direction:column" id="ch-panel">' +
      '<div style="flex:1;display:flex;align-items:center;justify-content:center;color:#9ca3af;flex-direction:column;gap:12px">' +
        '<svg width="48" height="48" fill="none" stroke="#d1d5db" stroke-width="1.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
        '<div style="font-size:14px;font-weight:500;color:#9ca3af">Sélectionnez une conversation</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  // Ouvrir la première conversation automatiquement
  if (d.conversations.length > 0) chOuvrirConv(d.conversations[0].id);
}

function chOuvrirConv(id) {
  _chConvActive = id;
  var d = chData();
  var conv = d.conversations.find(function(c){ return c.id === id; });
  if (!conv) return;

  // Marquer comme lus
  conv.non_lus = 0;
  chSave(d);

  // Mettre à jour le badge
  var item = document.getElementById('ch-item-' + id);
  if (item) {
    var badge = item.querySelector('span[style*="background:#007A3D"]');
    if (badge) badge.remove();
  }

  var panel = document.getElementById('ch-panel');
  if (!panel) return;

  panel.innerHTML =
    // Header conversation
    '<div style="padding:12px 16px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:12px">' +
      '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#007A3D,#00A852);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px">' + conv.avatar + '</div>' +
      '<div><div style="font-size:14px;font-weight:700">' + conv.contact + '</div><div style="font-size:11px;color:#9ca3af">' + (conv.role||'Client') + '</div></div>' +
      '<div style="margin-left:auto;display:flex;gap:8px">' +
        '<button onclick="chAppeler(\'' + conv.id + '\')" style="background:#f0faf5;color:#007A3D;border:1px solid #d0e4d0;padding:6px 12px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer">Appeler</button>' +
      '</div>' +
    '</div>' +

    // Messages
    '<div id="ch-messages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;background:#f8fafc">' +
      conv.messages.map(function(m) {
        return '<div style="display:flex;justify-content:' + (m.moi?'flex-end':'flex-start') + '">' +
          '<div style="max-width:75%;padding:10px 14px;border-radius:' + (m.moi?'18px 18px 4px 18px':'18px 18px 18px 4px') + ';background:' + (m.moi?'linear-gradient(135deg,#007A3D,#00A852)':'#fff') + ';color:' + (m.moi?'#fff':'#0F1F0F') + ';font-size:13px;line-height:1.5;box-shadow:0 1px 3px rgba(0,0,0,.08)">' +
            m.texte +
            '<div style="font-size:10px;opacity:.6;margin-top:4px;text-align:right">' + i6Date(m.ts) + '</div>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>' +

    // Barre d'envoi
    '<div style="padding:12px 16px;border-top:1px solid #e5e7eb;display:flex;gap:8px;align-items:flex-end">' +
      '<button onclick="chJoindrePhoto()" style="background:none;border:none;padding:6px;cursor:pointer;color:#9ca3af;flex-shrink:0">' +
        '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>' +
      '</button>' +
      '<textarea id="ch-input" placeholder="Écrivez un message..." rows="1" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();chEnvoyer()}" style="flex:1;border:1.5px solid #e5e7eb;border-radius:20px;padding:8px 14px;font-size:13px;resize:none;outline:none;font-family:inherit;line-height:1.5;transition:border-color .2s;max-height:100px" onfocus="this.style.borderColor=\'#007A3D\'" onblur="this.style.borderColor=\'#e5e7eb\'"></textarea>' +
      '<button onclick="chEnvoyer()" style="background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 3px 10px rgba(0,122,61,.3)">' +
        '<svg width="18" height="18" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>' +
      '</button>' +
    '</div>';

  // Scroll en bas
  setTimeout(function() {
    var msgs = document.getElementById('ch-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }, 50);
}

function chEnvoyer() {
  if (!_chConvActive) return;
  var input = document.getElementById('ch-input');
  var texte = input ? input.value.trim() : '';
  if (!texte) return;
  var d = chData();
  var conv = d.conversations.find(function(c){ return c.id === _chConvActive; });
  if (!conv) return;
  var msg = { id: i6Id(), auteur:'Vous', moi:true, texte, ts: Date.now() };
  conv.messages.push(msg);
  conv.dernierMsg = texte;
  conv.ts = Date.now();
  chSave(d);
  if (input) input.value = '';

  // Ajouter le message à l'affichage
  var msgs = document.getElementById('ch-messages');
  if (msgs) {
    var el = document.createElement('div');
    el.style.display = 'flex';
    el.style.justifyContent = 'flex-end';
    el.innerHTML = '<div style="max-width:75%;padding:10px 14px;border-radius:18px 18px 4px 18px;background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;font-size:13px;line-height:1.5;box-shadow:0 1px 3px rgba(0,0,0,.08)">' + texte + '<div style="font-size:10px;opacity:.6;margin-top:4px;text-align:right">' + i6Date() + '</div></div>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // Mettre à jour le dernier message dans la liste
  var item = document.getElementById('ch-item-' + _chConvActive);
  if (item) {
    var dernierEl = item.querySelector('div:last-child > div:last-child');
    if (dernierEl) dernierEl.textContent = texte;
  }

  npNouvelMessage('Vous');
}

function chNouvConv() {
  var contact = prompt('Nom du contact ou numéro téléphone :');
  if (!contact) return;
  var d = chData();
  var conv = {
    id: 'conv_' + i6Id(),
    contact: contact,
    role: 'Nouveau contact',
    avatar: contact[0].toUpperCase(),
    dernierMsg: '',
    ts: Date.now(),
    non_lus: 0,
    messages: []
  };
  d.conversations.unshift(conv);
  chSave(d);
  initPageChat();
  chOuvrirConv(conv.id);
}

function chJoindrePhoto() {
  var inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = function() {
    if (!inp.files[0]) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var d = chData();
      var conv = d.conversations.find(function(c){ return c.id === _chConvActive; });
      if (!conv) return;
      var msg = { id: i6Id(), auteur:'Vous', moi:true, texte:'📸 Photo envoyée', image: e.target.result, ts: Date.now() };
      conv.messages.push(msg);
      conv.dernierMsg = '📸 Photo';
      chSave(d);
      var msgs = document.getElementById('ch-messages');
      if (msgs) {
        var el = document.createElement('div');
        el.style.display = 'flex';
        el.style.justifyContent = 'flex-end';
        el.innerHTML = '<div style="max-width:75%"><img loading="lazy" src="' + e.target.result + '" style="border-radius:12px;max-width:200px;max-height:160px;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,.15)"></div>';
        msgs.appendChild(el);
        msgs.scrollTop = msgs.scrollHeight;
      }
      if(typeof toast==='function') toast('Photo envoyée', 'success');
    };
    reader.readAsDataURL(inp.files[0]);
  };
  inp.click();
}

function chAppeler(convId) {
  var d = chData();
  var conv = d.conversations.find(function(c){ return c.id === convId; });
  if (!conv) return;
  // Ouvrir Jitsi Meet pour appel vidéo
  var room = 'kamer360-' + convId;
  window.open('https://meet.jit.si/' + room, '_blank');
  if(typeof toast==='function') toast('Appel vidéo ouvert avec ' + conv.contact, 'success');
}

// ══════════════════════════════════════════════════════════════
//  INITIALISATION GLOBALE — Branchement sur goPage()
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser le mode hors-ligne
  idbOpen().catch(function(e){ console.warn('[KAMER360] IndexedDB indispo:', e); });

  // Demander permission notifications au démarrage (après interaction)
  setTimeout(function() {
    if ('Notification' in window && Notification.permission === 'default') {
      npDemanderPermission();
    }
  }, 5000);

  // Sync si online
  if (navigator.onLine) olSyncQueue();

  // Indicateur connexion dans topbar
  var statusEl = document.getElementById('topbar-status');
  if (statusEl) {
    var s = olStatut();
    statusEl.style.background = s.color;
    statusEl.title = s.label;
  }
});

// Accrocher sur goPage
var _origGoPage = typeof goPage === 'function' ? goPage : null;
function goPage(p) {
  if (_origGoPage) _origGoPage(p);
  setTimeout(function() {
    if (p === 'kamer-pay')  initPageKamerPay();
    if (p === 'avis')       initPageAvis();
    if (p === 'tracking')   initPageTracking();
    if (p === 'notifications') initPageNotifications();
    if (p === 'chat')       initPageChat();
  }, 100);
}
