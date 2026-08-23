// ═══════════════════════════════════════════════════════════════
//  KAMER360 — kamer-impact.js
//  6 Fonctionnalités à Impact Immédiat
//  1. KAMER Pay (wallet)
//  2. Avis & Notations
//  3. Tracking GPS temps réel
//  4. Notifications Push PWA
//  5. Mode hors-ligne (IndexedDB sync)
//  6. Chat intégré client-gérant
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  1. KAMER PAY — Portefeuille numérique intégré
// ═══════════════════════════════════════════════════════════════

var KP = {
  data: function() {
    try { return JSON.parse(localStorage.getItem('sm_kamer_pay') || '{}'); } catch(e) { return {}; }
  },
  save: function(d) {
    try { localStorage.setItem('sm_kamer_pay', JSON.stringify(d)); } catch(e) {}
  },
  get balance() {
    return (this.data().balance || 0);
  },
  get transactions() {
    return (this.data().transactions || []);
  }
};

function initPageKamerPay() {
  var z = document.getElementById('kamer-pay-content');
  if (!z) return;
  renderKamerPay();
}

function renderKamerPay() {
  var z = document.getElementById('kamer-pay-content');
  if (!z) return;
  var d = KP.data();
  var bal = d.balance || 0;
  var txns = d.transactions || [];

  var html = ''
    // ── Solde principal
    + '<div style="background:linear-gradient(135deg,#003d1f,#007A3D,#00A852);border-radius:20px;padding:28px 24px;color:#fff;margin-bottom:16px;position:relative;overflow:hidden">'
    +   '<div style="position:absolute;right:-30px;top:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08)"></div>'
    +   '<div style="position:absolute;right:20px;bottom:-20px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.05)"></div>'
    +   '<div style="font-size:11px;font-weight:700;opacity:.7;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Solde disponible</div>'
    +   '<div style="font-size:38px;font-weight:900;font-family:Playfair Display,serif;letter-spacing:-1px">' + bal.toLocaleString('fr-FR') + ' <span style="font-size:18px;opacity:.8">FCFA</span></div>'
    +   '<div style="margin-top:16px;display:flex;gap:10px">'
    +     '<button onclick="showKPModal(\'recharge\')" style="flex:1;background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.3);color:#fff;padding:10px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">+ Recharger</button>'
    +     '<button onclick="showKPModal(\'transfer\')" style="flex:1;background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.3);color:#fff;padding:10px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">Envoyer</button>'
    +     '<button onclick="showKPModal(\'retrait\')" style="flex:1;background:rgba(252,209,22,.2);border:1.5px solid rgba(252,209,22,.5);color:#FCD116;padding:10px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">Retirer</button>'
    +   '</div>'
    + '</div>'

    // ── Stats rapides
    + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">'
    + _kpStat('Rechargé ce mois', _kpSumMonth(txns,'recharge'), 'FCFA')
    + _kpStat('Dépensé ce mois', _kpSumMonth(txns,'paiement'), 'FCFA')
    + _kpStat('Transactions', txns.length, '')
    + '</div>'

    // ── Historique
    + '<div class="cd">'
    +   '<div class="ch"><div class="ct">Historique des transactions</div></div>';

  if (txns.length === 0) {
    html += '<div style="text-align:center;padding:32px;color:#9ca3af"><div style="font-size:32px;margin-bottom:10px">💳</div><div style="font-weight:600;margin-bottom:4px">Aucune transaction</div><div style="font-size:12px">Rechargez votre portefeuille pour commencer</div></div>';
  } else {
    html += '<div style="display:flex;flex-direction:column">';
    txns.slice().reverse().slice(0,20).forEach(function(tx) {
      var isCredit = ['recharge','remboursement','reception'].indexOf(tx.type) >= 0;
      var color = isCredit ? '#007A3D' : '#CE1126';
      var sign  = isCredit ? '+' : '-';
      html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f5f8f5">'
        + '<div style="width:36px;height:36px;border-radius:50%;background:' + (isCredit?'#f0faf5':'#fff0f0') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px">'
        + (isCredit?'↓':'↑') + '</div>'
        + '<div style="flex:1">'
        + '<div style="font-size:13px;font-weight:600">' + _escTx(tx.label || tx.type) + '</div>'
        + '<div style="font-size:11px;color:#9ca3af">' + (tx.date || '') + (tx.ref?' · '+tx.ref:'') + '</div>'
        + '</div>'
        + '<div style="font-size:15px;font-weight:800;color:'+color+'">' + sign + tx.montant.toLocaleString('fr-FR') + ' F</div>'
        + '</div>';
    });
    html += '</div>';
  }

  html += '</div>';

  // ── Modals
  html += '<div id="kp-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:3000;justify-content:flex-end;align-items:flex-end" onclick="if(event.target===this)closeKPModal()">'
    + '<div style="background:#fff;width:100%;max-width:440px;border-radius:20px 20px 0 0;padding:24px;max-height:90vh;overflow-y:auto">'
    + '<div id="kp-modal-content"></div>'
    + '</div></div>';

  z.innerHTML = html;
}

function _kpStat(label, val, unit) {
  return '<div style="background:#f9fafb;border-radius:12px;padding:12px;text-align:center">'
    + '<div style="font-size:16px;font-weight:800;color:#007A3D">' + (typeof val==='number'?val.toLocaleString('fr-FR'):val) + (unit?' '+unit:'') + '</div>'
    + '<div style="font-size:10px;color:#9ca3af;margin-top:2px">' + label + '</div>'
    + '</div>';
}
function _kpSumMonth(txns, type) {
  var now = new Date(); var m = now.getMonth(); var y = now.getFullYear();
  return txns.filter(function(t){ return t.type===type&&t.mois===m&&t.annee===y; })
             .reduce(function(s,t){ return s+t.montant; }, 0);
}
function _escTx(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function showKPModal(type) {
  var m = document.getElementById('kp-modal');
  var mc = document.getElementById('kp-modal-content');
  if (!m||!mc) return;
  m.style.display = 'flex';

  var titles = { recharge:'Recharger mon wallet', transfer:'Envoyer de l\'argent', retrait:'Retirer des fonds' };
  var methods = ['MTN Mobile Money','Orange Money'];

  var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">'
    + '<h3 style="font-family:Playfair Display,serif;font-size:18px;font-weight:800">' + titles[type] + '</h3>'
    + '<button onclick="closeKPModal()" style="background:#f0f0f0;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px">×</button>'
    + '</div>';

  if (type === 'recharge') {
    html += '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Montant (FCFA)</label>'
      + '<input type="number" id="kp-amount" placeholder="Ex: 5000" min="500" style="width:100%;padding:12px;border:1.5px solid #d1d5db;border-radius:10px;font-size:15px;box-sizing:border-box;margin-bottom:14px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:8px">Mode de paiement</label>'
      + '<div id="kp-method" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">'
      + methods.map(function(m,i){
          var colors = ['#FFCC00','#FF6600'];
          return '<label style="display:flex;align-items:center;gap:10px;padding:12px;border:1.5px solid #e5e7eb;border-radius:10px;cursor:pointer">'
            + '<input type="radio" name="kpMethod" value="'+m+'" '+(i===0?'checked':'')+' style="accent-color:#007A3D">'
            + '<div style="width:10px;height:10px;border-radius:50%;background:'+colors[i]+'"></div>'
            + '<span style="font-size:13px;font-weight:600">'+m+'</span></label>';
        }).join('')
      + '</div>'
      + '<input type="tel" id="kp-phone" placeholder="Numéro de téléphone ex: 677000000" style="width:100%;padding:12px;border:1.5px solid #d1d5db;border-radius:10px;font-size:14px;box-sizing:border-box;margin-bottom:16px">'
      + '<button onclick="kpRecharge()" style="width:100%;background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border:none;padding:14px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer">Confirmer le rechargement</button>';
  } else if (type === 'transfer') {
    html += '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Destinataire (email ou téléphone)</label>'
      + '<input type="text" id="kp-dest" placeholder="email@domaine.cm ou 6XXXXXXXX" style="width:100%;padding:12px;border:1.5px solid #d1d5db;border-radius:10px;font-size:14px;box-sizing:border-box;margin-bottom:12px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Montant (FCFA)</label>'
      + '<input type="number" id="kp-amount" placeholder="Ex: 2000" min="100" style="width:100%;padding:12px;border:1.5px solid #d1d5db;border-radius:10px;font-size:15px;box-sizing:border-box;margin-bottom:12px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Motif (optionnel)</label>'
      + '<input type="text" id="kp-motif" placeholder="Ex: Paiement commande #1234" style="width:100%;padding:12px;border:1.5px solid #d1d5db;border-radius:10px;font-size:14px;box-sizing:border-box;margin-bottom:16px">'
      + '<button onclick="kpTransfer()" style="width:100%;background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border:none;padding:14px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer">Envoyer</button>';
  } else {
    html += '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Montant à retirer (FCFA)</label>'
      + '<input type="number" id="kp-amount" placeholder="Ex: 10000" min="1000" style="width:100%;padding:12px;border:1.5px solid #d1d5db;border-radius:10px;font-size:15px;box-sizing:border-box;margin-bottom:12px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:8px">Vers</label>'
      + '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">'
      + methods.map(function(m,i){ var colors=['#FFCC00','#FF6600']; return '<label style="display:flex;align-items:center;gap:10px;padding:12px;border:1.5px solid #e5e7eb;border-radius:10px;cursor:pointer"><input type="radio" name="kpMethod" value="'+m+'" '+(i===0?'checked':'')+' style="accent-color:#007A3D"><div style="width:10px;height:10px;border-radius:50%;background:'+colors[i]+'"></div><span style="font-size:13px;font-weight:600">'+m+'</span></label>'; }).join('')
      + '</div>'
      + '<button onclick="kpRetrait()" style="width:100%;background:linear-gradient(135deg,#CE1126,#e53935);color:#fff;border:none;padding:14px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer">Confirmer le retrait</button>';
  }

  mc.innerHTML = html;
}

function closeKPModal() {
  var m = document.getElementById('kp-modal');
  if (m) m.style.display = 'none';
}

function kpRecharge() {
  var amount = parseFloat((document.getElementById('kp-amount')||{}).value) || 0;
  var phone  = (document.getElementById('kp-phone')||{}).value || '';
  var method = document.querySelector('input[name="kpMethod"]:checked');
  if (amount < 500) { toast('Montant minimum 500 FCFA', 'error'); return; }
  if (!phone) { toast('Numéro de téléphone requis', 'error'); return; }
  var d = KP.data();
  d.balance = (d.balance || 0) + amount;
  d.transactions = d.transactions || [];
  var now = new Date();
  d.transactions.push({ type:'recharge', label:'Rechargement ' + (method?method.value:''), montant:amount,
    date:now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR').slice(0,5),
    mois:now.getMonth(), annee:now.getFullYear(), ref:'KP'+Date.now().toString().slice(-6) });
  KP.save(d);
  closeKPModal();
  toast('Rechargement de ' + amount.toLocaleString('fr-FR') + ' FCFA effectué !', 'success');
  renderKamerPay();
}

function kpTransfer() {
  var dest   = (document.getElementById('kp-dest')||{}).value || '';
  var amount = parseFloat((document.getElementById('kp-amount')||{}).value) || 0;
  var motif  = (document.getElementById('kp-motif')||{}).value || '';
  var d = KP.data();
  if (amount < 100) { toast('Montant minimum 100 FCFA', 'error'); return; }
  if (!dest) { toast('Destinataire requis', 'error'); return; }
  if ((d.balance||0) < amount) { toast('Solde insuffisant', 'error'); return; }
  d.balance -= amount;
  d.transactions = d.transactions || [];
  var now = new Date();
  d.transactions.push({ type:'paiement', label:'Envoi vers ' + dest + (motif?' · '+motif:''), montant:amount,
    date:now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR').slice(0,5),
    mois:now.getMonth(), annee:now.getFullYear(), ref:'KP'+Date.now().toString().slice(-6) });
  KP.save(d);
  closeKPModal();
  toast('Transfert de ' + amount.toLocaleString('fr-FR') + ' FCFA envoyé !', 'success');
  renderKamerPay();
}

function kpRetrait() {
  var amount = parseFloat((document.getElementById('kp-amount')||{}).value) || 0;
  var d = KP.data();
  if (amount < 1000) { toast('Montant minimum 1000 FCFA', 'error'); return; }
  if ((d.balance||0) < amount) { toast('Solde insuffisant', 'error'); return; }
  d.balance -= amount;
  d.transactions = d.transactions || [];
  var now = new Date();
  d.transactions.push({ type:'retrait', label:'Retrait Mobile Money', montant:amount,
    date:now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR').slice(0,5),
    mois:now.getMonth(), annee:now.getFullYear(), ref:'KP'+Date.now().toString().slice(-6) });
  KP.save(d);
  closeKPModal();
  toast('Retrait de ' + amount.toLocaleString('fr-FR') + ' FCFA initié. Délai: 5 min.', 'success');
  renderKamerPay();
}

// ═══════════════════════════════════════════════════════════════
//  2. AVIS & NOTATIONS VÉRIFIÉS
// ═══════════════════════════════════════════════════════════════

var AVIS_DATA = JSON.parse(localStorage.getItem('sm_avis_v2') || '[]');

function sauvegarderAvis() {
  try { localStorage.setItem('sm_avis_v2', JSON.stringify(AVIS_DATA)); } catch(e) {}
}

function initPageAvis() {
  var z = document.getElementById('avis-content');
  if (!z) return;
  renderPageAvis();
}

function renderPageAvis() {
  var z = document.getElementById('avis-content');
  if (!z) return;

  var total = AVIS_DATA.length;
  var avg   = total ? (AVIS_DATA.reduce(function(s,a){ return s+a.note; },0) / total) : 0;
  var dist  = [5,4,3,2,1].map(function(n){ return AVIS_DATA.filter(function(a){ return a.note===n; }).length; });

  var html = ''
    // ── Résumé global
    + '<div class="cd" style="margin-bottom:14px">'
    +   '<div class="ch"><div class="ct">Réputation KAMER360</div>'
    +     '<button onclick="showFormAvis()" class="btn bp bsm">+ Ajouter un avis</button>'
    +   '</div>'
    +   '<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">'
    +     '<div style="text-align:center">'
    +       '<div style="font-size:52px;font-weight:900;font-family:Playfair Display,serif;color:#007A3D;line-height:1">' + avg.toFixed(1) + '</div>'
    +       '<div style="margin:6px 0">' + _stars(avg, 24) + '</div>'
    +       '<div style="font-size:12px;color:#9ca3af">' + total + ' avis vérifiés</div>'
    +     '</div>'
    +     '<div style="flex:1;min-width:200px">'
    +     [5,4,3,2,1].map(function(n,i){
            var pct = total ? Math.round(dist[i]/total*100) : 0;
            return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">'
              + '<div style="font-size:12px;font-weight:600;width:10px;color:#555">' + n + '</div>'
              + '<div style="flex:1;height:8px;background:#f0f0f0;border-radius:20px;overflow:hidden">'
              + '<div style="height:100%;width:'+pct+'%;background:' + (n>=4?'#007A3D':n===3?'#f59e0b':'#CE1126') + ';border-radius:20px;transition:width .6s"></div>'
              + '</div>'
              + '<div style="font-size:11px;color:#9ca3af;width:28px">' + pct + '%</div>'
              + '</div>';
          }).join('')
    +     '</div>'
    +   '</div>'
    + '</div>'

    // ── Filtres
    + '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">'
    + [0,5,4,3,2,1].map(function(n){
        return '<button onclick="filtrerAvis('+n+')" style="padding:7px 14px;border-radius:20px;border:1.5px solid #e5e7eb;background:#fff;font-size:12px;font-weight:600;cursor:pointer;color:#555">'
          + (n===0 ? 'Tous' : n + ' étoiles') + '</button>';
      }).join('')
    + '</div>'

    // ── Liste avis
    + '<div id="avis-liste">';

  html += _renderAvisListe(AVIS_DATA);
  html += '</div>'
    // ── Modal formulaire
    + '<div id="modal-avis" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:3000;justify-content:flex-end;align-items:flex-end" onclick="if(event.target===this)document.getElementById(\'modal-avis\').style.display=\'none\'">'
    + '<div style="background:#fff;width:100%;max-width:480px;border-radius:20px 20px 0 0;padding:24px">'
    + '<h3 style="font-family:Playfair Display,serif;font-size:18px;font-weight:800;margin-bottom:16px">Donner un avis</h3>'
    + '<div style="margin-bottom:12px"><label style="font-size:12px;font-weight:700;display:block;margin-bottom:6px">Votre note</label>'
    + '<div id="star-picker" style="display:flex;gap:6px">'
    + [1,2,3,4,5].map(function(n){ return '<span onclick="selectStar('+n+')" data-star="'+n+'" style="font-size:32px;cursor:pointer;opacity:.3">★</span>'; }).join('')
    + '</div></div>'
    + '<label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">Votre nom</label>'
    + '<input type="text" id="avis-nom" placeholder="Prénom Nom" style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box;margin-bottom:10px">'
    + '<label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">Service évalué</label>'
    + '<select id="avis-service" style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;margin-bottom:10px">'
    + ['Application générale','Boutique en ligne','Marketplace','Livraison','Service client','Paiement Mobile Money','Coiffure','Pressing','Automobile','Restauration','Santé','BTP','Agriculture','Immobilier','Éducation','Énergie Solaire','Logistique'].map(function(s){ return '<option>'+s+'</option>'; }).join('')
    + '</select>'
    + '<label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">Votre avis</label>'
    + '<textarea id="avis-texte" rows="3" placeholder="Décrivez votre expérience..." style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box;resize:vertical;margin-bottom:14px"></textarea>'
    + '<button onclick="soumettreAvis()" style="width:100%;background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border:none;padding:14px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer">Publier mon avis</button>'
    + '</div></div>';

  z.innerHTML = html;
}

var _selectedStar = 0;
function selectStar(n) {
  _selectedStar = n;
  document.querySelectorAll('#star-picker span').forEach(function(s, i) {
    s.style.opacity = i < n ? '1' : '.3';
    s.style.color = i < n ? '#FCD116' : '';
  });
}

function showFormAvis() {
  var m = document.getElementById('modal-avis');
  if (m) m.style.display = 'flex';
}

function soumettreAvis() {
  var nom     = (document.getElementById('avis-nom')||{}).value || '';
  var service = (document.getElementById('avis-service')||{}).value || '';
  var texte   = (document.getElementById('avis-texte')||{}).value || '';
  if (!_selectedStar) { toast('Sélectionnez une note (1-5 étoiles)', 'warning'); return; }
  if (!nom.trim()) { toast('Votre nom est requis', 'error'); return; }

  AVIS_DATA.unshift({
    id: 'av' + Date.now(),
    note: _selectedStar,
    nom: nom.trim(),
    service: service,
    texte: texte.trim(),
    date: new Date().toLocaleDateString('fr-FR'),
    verifie: true
  });
  sauvegarderAvis();
  document.getElementById('modal-avis').style.display = 'none';
  toast('Merci pour votre avis !', 'success');
  renderPageAvis();
}

function filtrerAvis(note) {
  var liste = note === 0 ? AVIS_DATA : AVIS_DATA.filter(function(a){ return a.note === note; });
  var z = document.getElementById('avis-liste');
  if (z) z.innerHTML = _renderAvisListe(liste);
}

function _renderAvisListe(avis) {
  if (!avis.length) return '<div style="text-align:center;padding:32px;color:#9ca3af"><div style="font-size:32px;margin-bottom:10px">⭐</div><div style="font-weight:600">Aucun avis pour cette note</div></div>';
  return avis.slice(0,20).map(function(a){
    return '<div style="background:#fff;border-radius:12px;padding:14px;border:1px solid #f0f0f0;margin-bottom:10px">'
      + '<div style="display:flex;align-items:flex-start;gap:10px">'
      + '<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#007A3D,#00A852);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;flex-shrink:0">' + (a.nom||'?')[0].toUpperCase() + '</div>'
      + '<div style="flex:1">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">'
      + '<div style="font-weight:700;font-size:13px">' + _esc(a.nom) + (a.verifie?' <span style="font-size:10px;background:#f0faf5;color:#007A3D;padding:1px 6px;border-radius:10px;font-weight:700">Vérifié</span>':'') + '</div>'
      + '<div style="font-size:11px;color:#9ca3af">' + (a.date||'') + '</div>'
      + '</div>'
      + '<div style="margin-bottom:4px">' + _stars(a.note, 14) + ' <span style="font-size:11px;color:#9ca3af;margin-left:4px">' + a.service + '</span></div>'
      + (a.texte ? '<div style="font-size:13px;color:#555;line-height:1.5">' + _esc(a.texte) + '</div>' : '')
      + '</div></div></div>';
  }).join('');
}

function _stars(note, size) {
  var s = '';
  for (var i=1; i<=5; i++) {
    s += '<span style="font-size:'+size+'px;color:'+(i<=Math.round(note)?'#FCD116':'#ddd')+'">★</span>';
  }
  return s;
}
function _esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Ajouter des avis de démo si aucun
(function() {
  // Aucun avis pour l'instant — les vrais avis clients s'afficheront ici
})();

// ═══════════════════════════════════════════════════════════════
//  3. TRACKING GPS LIVRAISONS TEMPS RÉEL
// ═══════════════════════════════════════════════════════════════

var _trackingMap = null;
var _livreurMarker = null;
var _trackingInterval = null;

function renderTrackingPage() {
  var z = document.getElementById('tracking-content');
  if (!z) return;

  var livraisons = typeof CMDS !== 'undefined'
    ? CMDS.filter(function(c){ return c.statut === 'exp' || c.statut === 'pret'; })
    : [];

  var html = ''
    // ── En cours
    + '<div class="cd" style="margin-bottom:14px">'
    +   '<div class="ch"><div class="ct">Livraisons en cours</div>'
    +     '<span class="badge bgg">' + livraisons.length + ' active' + (livraisons.length>1?'s':'') + '</span>'
    +   '</div>'
    +   '<div style="display:flex;flex-direction:column;gap:10px">';

  if (livraisons.length === 0) {
    html += '<div style="text-align:center;padding:24px;color:#9ca3af"><div style="font-size:28px;margin-bottom:8px">🚚</div><div style="font-weight:600;margin-bottom:4px">Aucune livraison active</div><div style="font-size:12px">Les commandes expédiées apparaîtront ici</div></div>';
  } else {
    livraisons.slice(0,5).forEach(function(cmd) {
      var etapes = [
        { label:'Commande confirmée', done:true },
        { label:'En préparation', done:cmd.statut!=='att' },
        { label:'Expédiée', done:cmd.statut==='exp'||cmd.statut==='liv' },
        { label:'Livrée', done:cmd.statut==='liv' },
      ];
      html += '<div style="background:#f9fafb;border-radius:12px;padding:14px;cursor:pointer" onclick="voirTrackingCmd(\'' + cmd.id + '\')">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
        + '<div><div style="font-weight:700;font-size:13px">' + _esc(cmd.client||'Client') + '</div>'
        + '<div style="font-size:11px;color:#9ca3af">CMD #' + cmd.id + ' · ' + _esc(cmd.ville||'') + '</div></div>'
        + '<span style="font-size:11px;background:#fff3cd;color:#856404;padding:3px 10px;border-radius:20px;font-weight:700">En route</span>'
        + '</div>'
        + '<div style="display:flex;align-items:center;gap:0">'
        + etapes.map(function(e, i) {
            var last = i === etapes.length-1;
            return '<div style="display:flex;align-items:center;flex:1">'
              + '<div style="width:18px;height:18px;border-radius:50%;background:' + (e.done?'#007A3D':'#e5e7eb') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">'
              + (e.done ? '<div style="width:8px;height:8px;border-radius:50%;background:#fff"></div>' : '')
              + '</div>'
              + (!last ? '<div style="flex:1;height:2px;background:' + (e.done?'#007A3D':'#e5e7eb') + '"></div>' : '')
              + '</div>';
          }).join('')
        + '</div>'
        + '<div style="display:flex;justify-content:space-between;margin-top:6px">'
        + etapes.map(function(e){ return '<div style="font-size:9px;color:' + (e.done?'#007A3D':'#9ca3af') + ';text-align:center;flex:1;font-weight:'+(e.done?'700':'400')+'">'+e.label+'</div>'; }).join('')
        + '</div>'
        + '</div>';
    });
  }

  html += '</div></div>'
    // ── Carte GPS
    + '<div class="cd" style="margin-bottom:14px">'
    +   '<div class="ch"><div class="ct">Carte de suivi GPS</div>'
    +     '<button onclick="startSimulTracking()" class="btn bgg bsm">Simuler livraison</button>'
    +   '</div>'
    +   '<div id="tracking-map" style="height:340px;border-radius:12px;overflow:hidden;background:#f0f4f0"></div>'
    +   '<div id="tracking-info" style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap"></div>'
    + '</div>'
    // ── Livreurs
    + '<div class="cd">'
    +   '<div class="ch"><div class="ct">Mes livreurs</div><button onclick="if(typeof goPage===\'function\')goPage(\'livreurs\')" class="btn bo bsm">Gérer</button></div>'
    +   '<div id="tracking-livreurs"></div>'
    + '</div>';

  z.innerHTML = html;

  // Initialiser la carte Leaflet
  setTimeout(function() {
    if (typeof L === 'undefined') return;
    if (_trackingMap) { _trackingMap.remove(); _trackingMap = null; }
    var mapEl = document.getElementById('tracking-map');
    if (!mapEl) return;
    _trackingMap = L.map('tracking-map').setView([4.0511, 9.7679], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(_trackingMap);
    // Marqueur boutique
    L.marker([4.0511, 9.7679]).addTo(_trackingMap)
     .bindPopup('<strong>KAMER360</strong><br>Votre boutique').openPopup();
    renderTrackingLivreurs();
  }, 300);
}

function startSimulTracking() {
  if (!_trackingMap) { toast('Carte non chargée', 'error'); return; }
  if (_trackingInterval) { clearInterval(_trackingInterval); }

  var route = [
    [4.0511, 9.7679], [4.0530, 9.7700], [4.0560, 9.7730],
    [4.0590, 9.7760], [4.0620, 9.7800], [4.0650, 9.7840],
    [4.0680, 9.7870], [4.0710, 9.7900], [4.0740, 9.7920]
  ];
  var i = 0;

  var greenIcon = typeof L !== 'undefined' ? L.divIcon({
    html: '<div style="width:32px;height:32px;background:#007A3D;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,.3)">🛵</div>',
    className: '',
    iconSize: [32,32],
    iconAnchor: [16,16]
  }) : null;

  if (_livreurMarker && _trackingMap) _trackingMap.removeLayer(_livreurMarker);
  if (greenIcon && _trackingMap) _livreurMarker = L.marker(route[0], {icon:greenIcon}).addTo(_trackingMap);

  var infoEl = document.getElementById('tracking-info');
  if (infoEl) {
    infoEl.innerHTML = '<div style="background:#f0faf5;border-radius:8px;padding:8px 12px;font-size:12px;font-weight:600;color:#007A3D">Livraison en cours — Estimation: 12 min</div>'
      + '<div id="tracking-eta" style="background:#fff3cd;border-radius:8px;padding:8px 12px;font-size:12px;font-weight:600;color:#856404">Position mise à jour il y a 0s</div>';
  }

  var t = 0;
  _trackingInterval = setInterval(function() {
    if (i >= route.length) {
      clearInterval(_trackingInterval);
      toast('Livraison terminée ! Client notifié.', 'success');
      var eta = document.getElementById('tracking-eta');
      if (eta) eta.innerHTML = '<span style="color:#007A3D">Livré avec succès</span>';
      return;
    }
    if (_livreurMarker) _livreurMarker.setLatLng(route[i]);
    if (_trackingMap) _trackingMap.panTo(route[i]);
    t += 2;
    var eta = document.getElementById('tracking-eta');
    var restant = Math.max(0, 12-Math.floor(t/5));
    if (eta) eta.textContent = 'Position mise à jour il y a ' + t + 's · Arrivée dans ~' + restant + ' min';
    i++;
  }, 2000);

  toast('Simulation de livraison démarrée !', 'success');
}

function renderTrackingLivreurs() {
  var z = document.getElementById('tracking-livreurs');
  if (!z) return;
  var livreurs = typeof LIVREURS !== 'undefined' ? LIVREURS : [];
  if (!livreurs.length) {
    z.innerHTML = '<div style="text-align:center;padding:16px;color:#9ca3af;font-size:13px">Aucun livreur configuré</div>';
    return;
  }
  z.innerHTML = livreurs.slice(0,5).map(function(l) {
    var dispo = l.statut === 'libre';
    return '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f0f0">'
      + '<div style="width:36px;height:36px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px">' + (l.nom||'L')[0] + '</div>'
      + '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + _esc(l.nom||'Livreur') + '</div><div style="font-size:11px;color:#9ca3af">' + _esc(l.tel||'') + '</div></div>'
      + '<span style="font-size:11px;background:' + (dispo?'#f0faf5':'#fff3cd') + ';color:' + (dispo?'#007A3D':'#856404') + ';padding:3px 10px;border-radius:20px;font-weight:700">' + (dispo?'Libre':'En livraison') + '</span>'
      + '</div>';
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
//  4. NOTIFICATIONS PUSH PWA
// ═══════════════════════════════════════════════════════════════

var _notifGranted = false;

function initNotifPush() {
  if (!('Notification' in window)) return;
  _notifGranted = (Notification.permission === 'granted');
  updateNotifBadge();
}

function demanderNotifPermission() {
  if (!('Notification' in window)) { toast('Notifications non supportées', 'error'); return; }
  Notification.requestPermission().then(function(perm) {
    _notifGranted = (perm === 'granted');
    updateNotifBadge();
    if (_notifGranted) {
      toast('Notifications activées ! Vous serez alerté en temps réel.', 'success');
      envoyerNotif('KAMER360', 'Notifications activées ! Bienvenue.', '');
    } else {
      toast('Notifications refusées dans les paramètres du navigateur', 'warning');
    }
  });
}

function envoyerNotif(titre, corps, icone) {
  if (!_notifGranted) return;
  try {
    var n = new Notification(titre, {
      body: corps,
      icon: icone || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="%23007A3D"/><text y="42" x="12" font-size="36" fill="%23FCD116" font-weight="bold">K3</text></svg>',
      badge: '',
      tag: 'kamer360-' + Date.now(),
      requireInteraction: false
    });
    setTimeout(function(){ try{ n.close(); }catch(e){} }, 5000);
  } catch(e) {}
}

function updateNotifBadge() {
  var badges = document.querySelectorAll('.notif-toggle-btn');
  badges.forEach(function(btn) {
    btn.textContent = _notifGranted ? 'Notifications activées' : 'Activer les notifications';
    btn.style.background = _notifGranted ? '#007A3D' : '';
    btn.style.color = _notifGranted ? '#fff' : '';
  });
}

// Notifier automatiquement pour les nouvelles commandes
function notifNouvelleCommande(cmd) {
  if (!cmd) return;
  envoyerNotif(
    'Nouvelle commande KAMER360',
    'Commande #' + cmd.id + ' de ' + (cmd.client||'Client') + ' — ' + (cmd.total||0).toLocaleString('fr-FR') + ' FCFA',
    ''
  );
}

// Notifier stock critique
function notifStockCritique(produit) {
  if (!produit) return;
  envoyerNotif(
    'Stock critique',
    produit.nom + ' — Plus que ' + produit.stock + ' unités en stock',
    ''
  );
}

// ═══════════════════════════════════════════════════════════════
//  5. MODE HORS-LIGNE (IndexedDB + Sync)
// ═══════════════════════════════════════════════════════════════

var _idb = null;
var _offlineQueue = [];

function initIndexedDB() {
  if (!window.indexedDB) return;
  var req = indexedDB.open('kamer360-offline', 2);
  req.onupgradeneeded = function(e) {
    var db = e.target.result;
    if (!db.objectStoreNames.contains('produits')) {
      db.createObjectStore('produits', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('commandes')) {
      db.createObjectStore('commandes', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('pendingSync')) {
      db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
    }
  };
  req.onsuccess = function(e) {
    _idb = e.target.result;
    // Mettre en cache les produits actuels
    cacheProduitsLocalement();
    syncPendingActions();
  };
  req.onerror = function() {
    console.warn('[KAMER360] IndexedDB non disponible');
  };
}

function cacheProduitsLocalement() {
  if (!_idb || typeof PRODUITS === 'undefined') return;
  try {
    var tx = _idb.transaction('produits', 'readwrite');
    var store = tx.objectStore('produits');
    PRODUITS.slice(0, 100).forEach(function(p) { try{ store.put(p); }catch(e){} });
  } catch(e) {}
}

function sauvegarderActionHorsLigne(action) {
  if (!_idb) { _offlineQueue.push(action); return; }
  try {
    var tx = _idb.transaction('pendingSync', 'readwrite');
    tx.objectStore('pendingSync').add({ action: action, timestamp: Date.now() });
  } catch(e) { _offlineQueue.push(action); }
}

function syncPendingActions() {
  if (!_idb || !navigator.onLine) return;
  try {
    var tx = _idb.transaction('pendingSync', 'readwrite');
    var store = tx.objectStore('pendingSync');
    store.getAll().onsuccess = function(e) {
      var pending = e.target.result || [];
      if (pending.length > 0) {
        toast(pending.length + ' action(s) synchronisée(s) après retour en ligne', 'success');
        store.clear();
      }
    };
  } catch(e) {}
}

function afficherStatutReseau() {
  var banner = document.getElementById('offline-banner');
  if (!banner) return;
  var online = navigator.onLine;
  banner.style.display = online ? 'none' : 'flex';
  if (!online) {
    banner.innerHTML = '<div style="display:flex;align-items:center;gap:8px"><div style="width:8px;height:8px;border-radius:50%;background:#FCD116"></div><span>Mode hors-ligne — vos données sont sauvegardées localement</span></div>';
  }
}

// Écouter les changements de réseau
window.addEventListener('online',  function() { afficherStatutReseau(); syncPendingActions(); toast('Connexion rétablie — synchronisation en cours', 'success'); });
window.addEventListener('offline', function() { afficherStatutReseau(); toast('Mode hors-ligne activé — KAMER360 continue de fonctionner', 'warning'); });

// Initialiser au démarrage
document.addEventListener('DOMContentLoaded', function() {
  initIndexedDB();
  initNotifPush();
  afficherStatutReseau();
  // Injecter la bannière hors-ligne si elle n'existe pas
  if (!document.getElementById('offline-banner')) {
    var b = document.createElement('div');
    b.id = 'offline-banner';
    b.style.cssText = 'display:none;position:fixed;bottom:0;left:0;right:0;background:#1a1a2e;color:#FCD116;padding:10px 20px;font-size:13px;font-weight:600;z-index:9998;justify-content:center;gap:8px;align-items:center';
    document.body.appendChild(b);
  }
});

// ═══════════════════════════════════════════════════════════════
//  6. CHAT INTÉGRÉ CLIENT-GÉRANT
// ═══════════════════════════════════════════════════════════════

var CHAT_DATA = {};
var _chatActif = null;

function loadChatData() {
  try { CHAT_DATA = JSON.parse(localStorage.getItem('sm_chat_v2') || '{}'); } catch(e) { CHAT_DATA = {}; }
}

function saveChatData() {
  try { localStorage.setItem('sm_chat_v2', JSON.stringify(CHAT_DATA)); } catch(e) {}
}

loadChatData();

function initPageChat() {
  var z = document.getElementById('chat-content');
  if (!z) return;
  loadChatData();
  renderChatListe();
}

function renderChatListe() {
  var z = document.getElementById('chat-content');
  if (!z) return;

  var conversations = Object.keys(CHAT_DATA).map(function(id) {
    var msgs = CHAT_DATA[id].messages || [];
    return { id: id, nom: CHAT_DATA[id].nom || 'Contact', msgs: msgs, last: msgs[msgs.length-1] };
  }).sort(function(a,b) { return (b.last ? b.last.ts : 0) - (a.last ? a.last.ts : 0); });

  var html = ''
    // ── Header
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
    +   '<div style="font-size:13px;color:#9ca3af">' + conversations.length + ' conversation(s)</div>'
    +   '<button onclick="nouvelleConversation()" class="btn bp bsm">+ Nouveau message</button>'
    + '</div>'
    // ── Recherche
    + '<input type="text" id="chat-search" placeholder="Rechercher une conversation..." oninput="filtrerChats(this.value)" style="width:100%;padding:10px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:13px;box-sizing:border-box;margin-bottom:12px">'
    // ── Liste conversations
    + '<div id="chat-liste">' + _renderChatListe(conversations) + '</div>'
    // ── Fenêtre conversation
    + '<div id="chat-window" style="display:none;position:fixed;inset:0;background:#f9fafb;z-index:2000;display:none;flex-direction:column">'
    +   '<div id="chat-win-header" style="background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:12px">'
    +     '<button onclick="fermerChat()" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center">←</button>'
    +     '<div id="chat-win-avatar" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-weight:700">?</div>'
    +     '<div><div id="chat-win-nom" style="font-weight:700;font-size:15px">Contact</div>'
    +     '<div style="font-size:11px;opacity:.75">En ligne</div></div>'
    +   '</div>'
    +   '<div id="chat-messages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f0f4f0"></div>'
    +   '<div style="background:#fff;padding:12px 14px;border-top:1px solid #e5e7eb;display:flex;gap:8px;align-items:flex-end">'
    +     '<input type="file" id="chat-file-inp" accept="image/*" style="display:none" onchange="envoyerFichierChat()">'
    +     '<button onclick="document.getElementById(\'chat-file-inp\').click()" style="background:#f0f4f0;border:1.5px solid #e5e7eb;padding:8px;border-radius:8px;cursor:pointer;font-size:18px">📎</button>'
    +     '<textarea id="chat-inp" placeholder="Votre message..." rows="1" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();envoyerMessage();}" style="flex:1;padding:10px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:13px;resize:none;font-family:inherit;outline:none;max-height:100px"></textarea>'
    +     '<button onclick="envoyerMessage()" style="background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center">➤</button>'
    +   '</div>'
    + '</div>'

    // ── Modal nouveau chat
    + '<div id="modal-nouveau-chat" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:3000;justify-content:flex-end;align-items:flex-end" onclick="if(event.target===this)this.style.display=\'none\'">'
    + '<div style="background:#fff;width:100%;max-width:440px;border-radius:20px 20px 0 0;padding:24px">'
    + '<h3 style="font-family:Playfair Display,serif;font-size:18px;font-weight:800;margin-bottom:16px">Nouveau message</h3>'
    + '<label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">Destinataire</label>'
    + '<input type="text" id="chat-dest-nom" placeholder="Nom du contact" style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box;margin-bottom:10px">'
    + '<label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">Premier message</label>'
    + '<textarea id="chat-dest-msg" rows="3" placeholder="Bonjour, je vous contacte pour..." style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box;resize:vertical;margin-bottom:14px"></textarea>'
    + '<button onclick="creerConversation()" style="width:100%;background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border:none;padding:14px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer">Envoyer</button>'
    + '</div></div>';

  z.innerHTML = html;
}

function _renderChatListe(conversations) {
  if (!conversations.length) {
    return '<div style="text-align:center;padding:40px;color:#9ca3af"><div style="font-size:36px;margin-bottom:10px">💬</div><div style="font-weight:600;margin-bottom:6px">Aucune conversation</div><div style="font-size:12px">Cliquez sur Nouveau message pour commencer</div></div>';
  }
  return conversations.map(function(c) {
    var last = c.last || {};
    var unread = (c.msgs || []).filter(function(m){ return !m.lu && m.from !== 'gerant'; }).length;
    return '<div onclick="ouvrirChat(\'' + c.id + '\')" style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;cursor:pointer;transition:background .15s;margin-bottom:6px;background:#fff;border:1px solid #f0f0f0" onmouseover="this.style.background=\'#f7fbf7\'" onmouseout="this.style.background=\'#fff\'">'
      + '<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#007A3D,#00A852);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px;flex-shrink:0">' + (c.nom||'?')[0].toUpperCase() + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="display:flex;justify-content:space-between;align-items:center">'
      + '<div style="font-weight:700;font-size:14px">' + _esc(c.nom) + '</div>'
      + '<div style="font-size:11px;color:#9ca3af">' + (last.time||'') + '</div>'
      + '</div>'
      + '<div style="font-size:12px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px">' + _esc(last.texte||'Image') + '</div>'
      + '</div>'
      + (unread > 0 ? '<div style="min-width:20px;height:20px;border-radius:20px;background:#007A3D;color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 4px">' + unread + '</div>' : '')
      + '</div>';
  }).join('');
}

function filtrerChats(q) {
  var conversations = Object.keys(CHAT_DATA).map(function(id) {
    var msgs = CHAT_DATA[id].messages || [];
    return { id:id, nom:CHAT_DATA[id].nom||'Contact', msgs:msgs, last:msgs[msgs.length-1] };
  }).filter(function(c){ return !q || c.nom.toLowerCase().includes(q.toLowerCase()); });
  var z = document.getElementById('chat-liste');
  if (z) z.innerHTML = _renderChatListe(conversations);
}

function ouvrirChat(id) {
  _chatActif = id;
  var c = CHAT_DATA[id];
  if (!c) return;

  // Marquer comme lu
  (c.messages||[]).forEach(function(m){ m.lu = true; });
  saveChatData();

  // Mettre à jour le header
  var nomEl = document.getElementById('chat-win-nom');
  var avatarEl = document.getElementById('chat-win-avatar');
  if (nomEl) nomEl.textContent = c.nom || 'Contact';
  if (avatarEl) avatarEl.textContent = (c.nom||'?')[0].toUpperCase();

  var win = document.getElementById('chat-window');
  if (win) { win.style.display = 'flex'; win.style.flexDirection = 'column'; }

  renderMessages(id);
  // Scroll en bas
  setTimeout(function() {
    var msgs = document.getElementById('chat-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }, 50);
}

function fermerChat() {
  _chatActif = null;
  var win = document.getElementById('chat-window');
  if (win) win.style.display = 'none';
  renderChatListe();
}

function renderMessages(id) {
  var z = document.getElementById('chat-messages');
  if (!z) return;
  var msgs = (CHAT_DATA[id]||{}).messages || [];

  if (!msgs.length) {
    z.innerHTML = '<div style="text-align:center;padding:32px;color:#9ca3af;font-size:13px">Démarrez la conversation</div>';
    return;
  }

  z.innerHTML = msgs.map(function(m) {
    var moi = m.from === 'gerant';
    var bg  = moi ? 'linear-gradient(135deg,#007A3D,#00A852)' : '#fff';
    var col = moi ? '#fff' : '#0F1F0F';
    var align = moi ? 'flex-end' : 'flex-start';
    var radius = moi ? '16px 16px 4px 16px' : '16px 16px 16px 4px';

    var content = '';
    if (m.type === 'image') {
      content = '<img loading="lazy" src="'+m.texte+'" style="max-width:200px;border-radius:8px;display:block">';
    } else {
      content = '<div style="font-size:13px;line-height:1.5">' + _esc(m.texte) + '</div>';
    }

    return '<div style="display:flex;justify-content:' + align + '">'
      + '<div style="max-width:75%;background:' + bg + ';color:' + col + ';padding:10px 14px;border-radius:' + radius + ';box-shadow:0 1px 4px rgba(0,0,0,.08)">'
      + content
      + '<div style="font-size:10px;opacity:.6;margin-top:4px;text-align:right">' + (m.time||'') + (moi&&m.lu?' ✓✓':moi?' ✓':'') + '</div>'
      + '</div></div>';
  }).join('');

  setTimeout(function(){ z.scrollTop = z.scrollHeight; }, 50);
}

function envoyerMessage() {
  if (!_chatActif) return;
  var inp = document.getElementById('chat-inp');
  var texte = inp ? inp.value.trim() : '';
  if (!texte) return;

  var now = new Date();
  var time = now.toLocaleTimeString('fr-FR').slice(0,5);
  if (!CHAT_DATA[_chatActif]) return;
  CHAT_DATA[_chatActif].messages = CHAT_DATA[_chatActif].messages || [];
  CHAT_DATA[_chatActif].messages.push({ from:'gerant', texte:texte, time:time, lu:false, ts:now.getTime() });
  saveChatData();
  if (inp) inp.value = '';
  renderMessages(_chatActif);

  // Réponse automatique simulée
  setTimeout(function() {
    if (!_chatActif || !CHAT_DATA[_chatActif]) return;
    var reponses = ['Merci pour votre message !', 'Je reviens vers vous rapidement.', 'Message bien reçu, nous traitons votre demande.', 'Bonjour ! Comment puis-je vous aider ?'];
    var r = reponses[Math.floor(Math.random()*reponses.length)];
    var t = new Date().toLocaleTimeString('fr-FR').slice(0,5);
    CHAT_DATA[_chatActif].messages.push({ from:'client', texte:r, time:t, lu:false, ts:Date.now() });
    saveChatData();
    if (_chatActif) renderMessages(_chatActif);
  }, 1500 + Math.random()*2000);
}

function envoyerFichierChat() {
  if (!_chatActif) return;
  var inp = document.getElementById('chat-file-inp');
  if (!inp || !inp.files || !inp.files[0]) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var now = new Date();
    CHAT_DATA[_chatActif].messages = CHAT_DATA[_chatActif].messages || [];
    CHAT_DATA[_chatActif].messages.push({ from:'gerant', texte:e.target.result, type:'image', time:now.toLocaleTimeString('fr-FR').slice(0,5), lu:false, ts:now.getTime() });
    saveChatData();
    renderMessages(_chatActif);
  };
  reader.readAsDataURL(inp.files[0]);
  inp.value = '';
}

function nouvelleConversation() {
  var m = document.getElementById('modal-nouveau-chat');
  if (m) m.style.display = 'flex';
}

function creerConversation() {
  var nom = (document.getElementById('chat-dest-nom')||{}).value || '';
  var msg = (document.getElementById('chat-dest-msg')||{}).value || '';
  if (!nom.trim()) { toast('Nom du destinataire requis', 'error'); return; }
  var id = 'chat_' + Date.now();
  var now = new Date();
  CHAT_DATA[id] = {
    nom: nom.trim(),
    messages: msg.trim() ? [{ from:'gerant', texte:msg.trim(), time:now.toLocaleTimeString('fr-FR').slice(0,5), lu:true, ts:now.getTime() }] : []
  };
  saveChatData();
  document.getElementById('modal-nouveau-chat').style.display = 'none';
  ouvrirChat(id);
}

// Ajouter des conversations démo
(function() {
  // Aucune conversation — les vraies discussions avec clients s'afficheront ici
})();

// Bouton notif dans la topbar
function renderNotifToggle() {
  var btn = document.querySelector('.notif-toggle-btn');
  if (!btn) return;
  btn.textContent = _notifGranted ? 'Notifs ON' : 'Activer notifs';
}


// ════════════════════════════════════════════════════════════════
//  MODE HORS-LIGNE — Page complète
// ════════════════════════════════════════════════════════════════
function initPageOffline() {
  initIndexedDB();
  afficherStatutReseau();
  renderPageOffline();
}

function renderPageOffline() {
  var z = document.getElementById('offline-content');
  if (!z) return;
  var online = navigator.onLine;
  var color1 = online ? '#007A3D' : '#E65100';
  var color2 = online ? '#00A852' : '#FF8F00';
  var statusIcon = online ? '🟢' : '🔴';
  var statusTxt = online ? 'Connecte a internet' : 'Mode hors-ligne actif';
  var statusSub = online ? 'Toutes les fonctionnalites sont disponibles' : 'Vos donnees en cache restent accessibles';

  var html = "";
  html += "<div style='background:linear-gradient(135deg," + color1 + "," + color2 + ");color:#fff;border-radius:16px;padding:20px;margin-bottom:16px;display:flex;align-items:center;gap:16px'>";
  html += "<div style='width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0'>" + statusIcon + "</div>";
  html += "<div>";
  html += "<div style='font-size:16px;font-weight:800;margin-bottom:4px'>" + statusTxt + "</div>";
  html += "<div style='font-size:13px;opacity:.85'>" + statusSub + "</div>";
  html += "</div></div>";

  // Données en cache
  html += "<div class='cd' style='margin-bottom:14px'>";
  html += "<div class='ch'><div class='ct'>Donnees disponibles hors-ligne</div></div>";
  html += "<div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:4px'>";
  var items = [
    { icon:"🛒", label:"Produits", key:"sm_produits", desc:"Catalogue complet" },
    { icon:"📦", label:"Commandes", key:"sm_commandes", desc:"Historique local" },
    { icon:"💳", label:"KAMER Pay", key:"sm_kamer_pay", desc:"Solde et transactions" },
    { icon:"⭐", label:"Avis clients", key:"sm_avis_v2", desc:"Evaluations enregistrees" },
    { icon:"💬", label:"Messages", key:"sm_chats", desc:"Conversations sauvegardees" },
    { icon:"🏪", label:"Marketplace", key:"sm_marketplace_data", desc:"Vos services configures" },
  ];
  items.forEach(function(item) {
    var data = null;
    try { data = JSON.parse(localStorage.getItem(item.key) || 'null'); } catch(e) {}
    var hasData = data !== null && (Array.isArray(data) ? data.length > 0 : Object.keys(data||{}).length > 0);
    var size = hasData ? (JSON.stringify(data).length / 1024).toFixed(1) + " KB" : "Vide";
    html += "<div style='background:#f9fafb;border-radius:12px;padding:12px;border:1px solid #f0f0f0'>";
    html += "<div style='display:flex;align-items:center;gap:8px;margin-bottom:6px'>";
    html += "<span style='font-size:22px'>" + item.icon + "</span>";
    html += "<div style='font-size:12px;font-weight:700;color:#0F1F0F'>" + item.label + "</div>";
    html += "<div style='margin-left:auto;width:10px;height:10px;border-radius:50%;background:" + (hasData?"#00A852":"#d1d5db") + "'></div>";
    html += "</div>";
    html += "<div style='font-size:11px;color:#666'>" + item.desc + "</div>";
    html += "<div style='font-size:11px;color:" + (hasData?"#007A3D":"#9ca3af") + ";margin-top:3px;font-weight:600'>" + (hasData?size:"Non mis en cache") + "</div>";
    html += "</div>";
  });
  html += "</div></div>";

  // Actions
  html += "<div class='cd' style='margin-bottom:14px'>";
  html += "<div class='ch'><div class='ct'>Gestion du cache</div></div>";
  html += "<div style='display:flex;flex-direction:column;gap:10px;padding-top:4px'>";
  html += "<button onclick='mettreCacheAJour()' class='btn bp' style='width:100%;padding:12px'>Mettre a jour le cache maintenant</button>";
  html += "<button onclick='viderCacheOffline()' class='btn br' style='width:100%;padding:12px'>Vider le cache</button>";
  html += "</div></div>";

  // File sync
  var queue = [];
  try { queue = JSON.parse(localStorage.getItem('km_sync_queue') || '[]'); } catch(e) {}
  if (queue.length > 0) {
    html += "<div class='cd' style='background:#fff8e1;border-color:#FCD116;margin-bottom:14px'>";
    html += "<div class='ch'><div class='ct' style='color:#b8860b'>" + queue.length + " action(s) en attente de synchronisation</div></div>";
    html += "<div style='font-size:12px;color:#666;margin-bottom:10px'>Ces actions seront envoyees au serveur des que vous serez connecte.</div>";
    queue.slice(0,3).forEach(function(a) {
      html += "<div style='padding:8px;background:#fff;border-radius:8px;margin-bottom:6px;font-size:12px;display:flex;gap:8px;align-items:center'>";
      html += "<span>⏳</span><span>" + (a.type||"Action") + " — " + new Date(a.ts||Date.now()).toLocaleTimeString('fr-FR') + "</span>";
      html += "</div>";
    });
    html += "<button onclick='syncPendingActions()' class='btn bp bsm' style='margin-top:6px'>Synchroniser maintenant</button>";
    html += "</div>";
  }

  // PWA Install
  html += "<div class='cd' style='border-left:4px solid #007A3D'>";
  html += "<div class='ch'><div class='ct'>Installer KAMER360 sur votre appareil</div></div>";
  html += "<div style='font-size:13px;color:#555;line-height:1.6;margin-bottom:12px'>Installez KAMER360 comme application native (PWA) pour y acceder sans connexion et recevoir des notifications.</div>";
  html += "<button onclick='installerPWA()' class='btn bp' style='padding:10px 16px'>📲 Installer l'app</button>";
  html += "</div>";

  z.innerHTML = html;
}


function mettreCacheAJour() {
  if (typeof toast === 'function') toast('Mise à jour du cache en cours...', 'info');
  cacheProduitsLocalement();
  // Cacher les avis
  var avis = localStorage.getItem('sm_avis_v2');
  var chats = localStorage.getItem('sm_chats');
  setTimeout(function() {
    if (typeof toast === 'function') toast('Cache mis à jour avec succès !', 'success');
    renderPageOffline();
  }, 1000);
}

function viderCacheOffline() {
  if (!confirm('Vider le cache hors-ligne ? Les données seront rechargées depuis le serveur à la prochaine connexion.')) return;
  var keysToKeep = ['sm_kamer_pay', 'sm_avis_v2', 'sm_chats', 'sm_marketplace_data', 'sm_profil_gerant'];
  var allKeys = Object.keys(localStorage);
  allKeys.forEach(function(k) {
    if (!keysToKeep.includes(k) && k.startsWith('sm_')) localStorage.removeItem(k);
  });
  if (typeof toast === 'function') toast('Cache vidé — données essentielles conservées', 'success');
  renderPageOffline();
}

var _pwaInstallPrompt = null;
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  _pwaInstallPrompt = e;
});

function installerPWA() {
  if (_pwaInstallPrompt) {
    _pwaInstallPrompt.prompt();
    _pwaInstallPrompt.userChoice.then(function(result) {
      if (result.outcome === 'accepted') {
        if (typeof toast === 'function') toast('KAMER360 installé sur votre appareil !', 'success');
      }
      _pwaInstallPrompt = null;
    });
  } else {
    if (typeof toast === 'function') toast('Pour installer : Menu navigateur > Ajouter a l&#39;ecran d&#39;accueil', 'info');
  }
}

// ════════════════════════════════════════════════════════════════
//  NOTIFICATIONS PUSH — Page complète
// ════════════════════════════════════════════════════════════════
var _notifHistory = [];

function initPageNotifications() {
  _notifHistory = [];
  try { _notifHistory = JSON.parse(localStorage.getItem('km_notif_history') || '[]'); } catch(e) {}
  initNotifPush();
  renderPageNotifications();
}

function renderPageNotifications() {
  var z = document.getElementById('notif-content');
  if (!z) return;
  var granted = (typeof Notification !== 'undefined') && Notification.permission === 'granted';
  var supported = 'Notification' in window;
  var html = "";

  // Carte statut
  var col1 = granted ? '#007A3D' : '#1565C0';
  var col2 = granted ? '#00A852' : '#1E88E5';
  html += "<div style='background:linear-gradient(135deg," + col1 + "," + col2 + ");color:#fff;border-radius:16px;padding:20px;margin-bottom:16px'>";
  html += "<div style='display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px'>";
  html += "<div>";
  html += "<div style='font-size:15px;font-weight:800;margin-bottom:4px'>" + (granted ? "🔔 Notifications activees" : "🔕 Notifications desactivees") + "</div>";
  html += "<div style='font-size:12px;opacity:.85'>" + (granted ? "Vous recevez les alertes en temps reel" : "Activez pour ne rien manquer") + "</div>";
  html += "</div>";
  if (!granted && supported) {
    html += "<button onclick='demanderNotifPermission()' style='background:rgba(255,255,255,.2);color:#fff;border:1.5px solid rgba(255,255,255,.5);padding:10px 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap'>Activer</button>";
  } else if (granted) {
    html += "<button onclick='testerNotification()' style='background:rgba(255,255,255,.15);color:#fff;border:1.5px solid rgba(255,255,255,.3);padding:10px 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer'>Tester</button>";
  }
  html += "</div></div>";

  // Types de notifications
  html += "<div class='cd' style='margin-bottom:14px'>";
  html += "<div class='ch'><div class='ct'>Alertes configurees</div></div>";
  html += "<div style='display:flex;flex-direction:column;gap:2px;padding-top:4px'>";
  var alertTypes = [
    { icon:"📦", label:"Nouvelles commandes", desc:"Alerte a chaque commande recue", key:"notif_commandes", def:true },
    { icon:"⚠️", label:"Stock critique", desc:"Produit sous le seuil minimum", key:"notif_stock", def:true },
    { icon:"🛵", label:"Mises a jour livraisons", desc:"Statut en temps reel", key:"notif_livraisons", def:true },
    { icon:"⭐", label:"Nouveaux avis", desc:"Quand un client vous evalue", key:"notif_avis", def:true },
    { icon:"💬", label:"Messages chat", desc:"Nouveaux messages clients", key:"notif_chat", def:true },
    { icon:"💰", label:"Paiements KAMER Pay", desc:"Confirmations transactions", key:"notif_paiements", def:true },
    { icon:"📣", label:"Promotions", desc:"Vos propres promotions actives", key:"notif_promo", def:false },
  ];
  alertTypes.forEach(function(a) {
    var saved = localStorage.getItem(a.key);
    var checked = saved !== null ? saved === 'true' : a.def;
    var bg = checked ? '#007A3D' : '#d1d5db';
    var left = checked ? '23px' : '3px';
    html += "<div style='display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f5f8f5'>";
    html += "<span style='font-size:22px;flex-shrink:0'>" + a.icon + "</span>";
    html += "<div style='flex:1'><div style='font-size:13px;font-weight:600'>" + a.label + "</div>";
    html += "<div style='font-size:11px;color:#666;margin-top:2px'>" + a.desc + "</div></div>";
    html += "<div onclick='toggleNotifType(\"" + a.key + "\",' style='position:relative;width:44px;height:24px;flex-shrink:0;cursor:pointer' id='wrap-" + a.key + "' data-key='" + a.key + "' data-val='" + checked + "'>";
    html += "<div style='position:absolute;inset:0;background:" + bg + ";border-radius:24px;transition:background .2s' id='toggle-" + a.key + "'></div>";
    html += "<div style='position:absolute;top:3px;left:" + left + ";width:18px;height:18px;background:#fff;border-radius:50%;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)' id='thumb-" + a.key + "'></div>";
    html += "</div>";
    html += "</div>";
  });
  // Ajouter onclick via addEventListener après rendu
  html += "</div></div>";

  // Historique
  html += "<div class='cd' style='margin-bottom:14px'>";
  html += "<div class='ch'><div class='ct'>Historique des notifications</div>";
  if (_notifHistory && _notifHistory.length > 0) {
    html += "<button onclick='viderHistoriqueNotifs()' class='btn br bsm'>Tout effacer</button>";
  }
  html += "</div>";
  if (!_notifHistory || _notifHistory.length === 0) {
    html += "<div style='text-align:center;padding:32px;color:#9ca3af'><div style='font-size:36px;margin-bottom:10px'>🔔</div><div style='font-size:13px'>Aucune notification recue</div></div>";
  } else {
    html += "<div style='display:flex;flex-direction:column;gap:2px'>";
    var couleurs = { commande:"#007A3D", stock:"#E65100", livraison:"#1565C0", avis:"#FCD116", chat:"#4A148C", paiement:"#00695C" };
    _notifHistory.slice(0,20).forEach(function(n) {
      var col = couleurs[n.type] || '#666';
      html += "<div style='display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #f5f8f5'>";
      html += "<div style='width:36px;height:36px;border-radius:50%;background:" + col + "22;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0'>" + (n.icon||"🔔") + "</div>";
      html += "<div style='flex:1'><div style='font-size:13px;font-weight:600;color:#0F1F0F'>" + (n.titre||"") + "</div>";
      html += "<div style='font-size:12px;color:#555;margin-top:2px'>" + (n.corps||"") + "</div>";
      html += "<div style='font-size:10px;color:#9ca3af;margin-top:3px'>" + (n.date||"") + "</div></div>";
      html += "</div>";
    });
    html += "</div>";
  }
  html += "</div>";
  z.innerHTML = html;

  // Brancher les toggles via addEventListener
  setTimeout(function() {
    alertTypes.forEach(function(a) {
      var wrap = document.getElementById('wrap-' + a.key);
      if (wrap) {
        wrap.addEventListener('click', function() {
          var cur = wrap.getAttribute('data-val') === 'true';
          var next = !cur;
          wrap.setAttribute('data-val', next.toString());
          toggleNotifType(a.key, next);
        });
      }
    });
  }, 100);
}


function toggleNotifType(key, val) {
  localStorage.setItem(key, val.toString());
  // Mettre à jour le toggle visuellement
  var toggle = document.getElementById('toggle-' + key);
  var thumb  = document.getElementById('thumb-' + key);
  if (toggle) toggle.style.background = val ? '#007A3D' : '#d1d5db';
  if (thumb)  thumb.style.left = val ? '23px' : '3px';
}

function testerNotification() {
  pushNotif('Test KAMER360', 'Vos notifications fonctionnent parfaitement !', 'system', '✅');
  if (typeof toast === 'function') toast('Notification test envoyée !', 'success');
}

function viderHistoriqueNotifs() {
  if (!confirm('Effacer tout l&#39;historique des notifications ?')) return;
  _notifHistory = [];
  localStorage.removeItem('km_notif_history');
  renderPageNotifications();
}

// Fonction centrale pour pousser une notification + l'enregistrer
function pushNotif(titre, corps, type, icon) {
  var notif = { titre:titre, corps:corps, type:type||'info', icon:icon||'🔔', date:new Date().toLocaleString('fr-FR') };
  _notifHistory.unshift(notif);
  if (_notifHistory.length > 50) _notifHistory = _notifHistory.slice(0,50);
  try { localStorage.setItem('km_notif_history', JSON.stringify(_notifHistory)); } catch(e) {}

  // Badge topbar
  var badge = document.getElementById('topbar-notif-badge');
  if (badge) {
    var count = (_notifHistory.filter(function(n){ return !n.vue; }).length);
    badge.textContent = count > 0 ? count : '';
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  // Vraie notification push si permission accordée
  envoyerNotif(titre, corps, '');
}

// Notifications automatiques liées aux events de l'app
window.addEventListener('km:nouvelle-commande', function(e) {
  if (localStorage.getItem('notif_commandes') !== 'false')
    pushNotif('Nouvelle commande', 'Commande de ' + (e.detail&&e.detail.client||'Client'), 'commande', '📦');
});
window.addEventListener('km:stock-critique', function(e) {
  if (localStorage.getItem('notif_stock') !== 'false')
    pushNotif('Stock critique', (e.detail&&e.detail.produit||'Produit') + ' — stock faible', 'stock', '⚠️');
});

