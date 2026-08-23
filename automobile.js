// ═══════════════════════════════════════════════════════
// SuperMarché CM — automobile.js
// Automobile : Pièces + RDV Mécanicien + SMS
// ═══════════════════════════════════════════════════════

var AUTO_SERVICES = [
 { id:'a1', nom:'Vidange huile moteur', duree:60, prix:15000, cat:'Entretien' },
 { id:'a2', nom:'Changement filtres (air+huile)',duree:45, prix:8000, cat:'Entretien' },
 { id:'a3', nom:'Remplacement plaquettes frein',duree:90, prix:25000, cat:'Freinage' },
 { id:'a4', nom:'Remplacement courroie distribution',duree:180,prix:60000,cat:'Moteur'},
 { id:'a5', nom:'Diagnostic électronique', duree:60, prix:10000, cat:'Diagnostic'},
 { id:'a6', nom:'Remplacement bougies', duree:60, prix:12000, cat:'Moteur' },
 { id:'a7', nom:'Contrôle climatisation', duree:45, prix:8000, cat:'Confort' },
 { id:'a8', nom:'Lavage auto complet', duree:60, prix:5000, cat:'Lavage' },
 { id:'a9', nom:'Lavage moteur', duree:45, prix:8000, cat:'Lavage' },
 { id:'a10', nom:'Changement pneus x4', duree:60, prix:20000, cat:'Pneus' },
 { id:'a11', nom:'Réparation crevaison', duree:30, prix:3000, cat:'Pneus' },
 { id:'a12', nom:'Batterie — pose + fourniture', duree:30, prix:45000, cat:'Électrique'},
];

var AUTO_PIECES = [
 { id:'ap1', nom:'Filtre à huile universel', cat:'Filtres', prix:2500, stock:30 },
 { id:'ap2', nom:'Filtre à air universel', cat:'Filtres', prix:3500, stock:25 },
 { id:'ap3', nom:'Huile moteur Total 5W40 5L', cat:'Lubrifiants', prix:18000, stock:20 },
 { id:'ap4', nom:'Liquide de frein DOT4 500ml', cat:'Lubrifiants', prix:4500, stock:40 },
 { id:'ap5', nom:'Liquide de refroidissement 1L',cat:'Lubrifiants',prix:3500, stock:35 },
 { id:'ap6', nom:'Plaquettes de frein avant', cat:'Freinage', prix:12000, stock:15 },
 { id:'ap7', nom:'Disque de frein avant', cat:'Freinage', prix:25000, stock:8 },
 { id:'ap8', nom:'Bougie NGK x4', cat:'Allumage', prix:8000, stock:20 },
 { id:'ap9', nom:'Batterie 60Ah', cat:'Électrique', prix:55000, stock:5 },
 { id:'ap10', nom:'Alternateur reconditionné', cat:'Électrique', prix:85000, stock:3 },
 { id:'ap11', nom:'Amortisseur avant (unité)', cat:'Suspension', prix:35000, stock:6 },
 { id:'ap12', nom:'Rotule de direction', cat:'Suspension', prix:15000, stock:10 },
 { id:'ap13', nom:'Tapis de sol universels x4', cat:'Accessoires', prix:8500, stock:20 },
 { id:'ap14', nom:'Housse siège universelle', cat:'Accessoires', prix:12000, stock:15 },
 { id:'ap15', nom:'Parfum voiture x3', cat:'Accessoires', prix:2500, stock:50 },
 { id:'ap16', nom:'Câble chargeur USB voiture', cat:'Accessoires', prix:3500, stock:30 },
 { id:'ap17', nom:'Pneu 185/65R14', cat:'Pneus', prix:35000, stock:8 },
 { id:'ap18', nom:'Pneu 195/65R15', cat:'Pneus', prix:42000, stock:6 },
];

var RESERVATIONS_AUTO = [];
var auto_seq = 1;

function initAuto() {
 try {
 var saved = JSON.parse(localStorage.getItem('sm_auto') || '{}');
 if (saved.reservations) RESERVATIONS_AUTO = saved.reservations;
 if (saved.seq) auto_seq = saved.seq;
 } catch(e) { RESERVATIONS_AUTO = []; }
}

function saveAuto() {
 // Notifier la marketplace
 try { localStorage.setItem('sm_auto_mkt_sync', Date.now().toString()); localStorage.removeItem('sm_auto_mkt_sync'); } catch(e) {}
 try { localStorage.setItem('sm_auto', JSON.stringify({ reservations: RESERVATIONS_AUTO, seq: auto_seq })); } catch(e) {}
}

// ── Créer RDV mécanicien ──
function creerRdvAuto() {
 var client = (document.getElementById('auto-client') || {}).value || '';
 var tel = (document.getElementById('auto-tel') || {}).value || '';
 var vehicule= (document.getElementById('auto-vehicule')|| {}).value || '';
 var date = (document.getElementById('auto-date') || {}).value || '';
 var heure = (document.getElementById('auto-heure') || {}).value || '';
 var svcId = (document.getElementById('auto-svc') || {}).value || '';
 var notes = (document.getElementById('auto-notes') || {}).value || '';

 if (!client) { toast('Nom client requis', 'warning'); return; }
 if (!tel) { toast('Téléphone requis', 'warning'); return; }
 if (!vehicule){ toast('Véhicule requis', 'warning'); return; }
 if (!date) { toast('Date requise', 'warning'); return; }
 if (!svcId) { toast('Service requis', 'warning'); return; }

 var svc = AUTO_SERVICES.find(function(s){ return s.id === svcId; });
 if (!svc) { toast('Service introuvable', 'warning'); return; }

 var rdv = {
 id: 'AUTO-' + String(auto_seq++).padStart(3,'0'),
 client: client,
 tel: tel,
 vehicule: vehicule,
 date: date,
 heure: heure || '08:00',
 service: svc.nom,
 serviceId:svcId,
 prix: svc.prix,
 duree: svc.duree,
 notes: notes,
 statut: 'confirme',
 cree_le: new Date().toISOString()
 };

 RESERVATIONS_AUTO.unshift(rdv);
 saveAuto();
 closeM('m-rdv-auto');
 renderRdvAuto();
 renderStatsAuto();
 toast('RDV ' + rdv.id + ' créé !', 'success');
 addNotif('Nouveau RDV mécanicien : ' + client + ' — ' + svc.nom, 'green');
 envoyerSMSAuto('confirmation', rdv);

 ['auto-client','auto-tel','auto-vehicule','auto-notes'].forEach(function(id){
 var el = document.getElementById(id); if(el) el.value='';
 });
}

// ── SMS Auto ──
function envoyerSMSAuto(type, rdv) {
 if (!rdv.tel) return;
 var msgs = {
 confirmation: 'Bonjour ' + rdv.client + ', votre RDV mécanicien ' + rdv.id + ' est confirmé le ' + formatDate(rdv.date) + ' à ' + rdv.heure + ' pour "' + rdv.service + '" — ' + rdv.vehicule + '. Montant estimé : ' + rdv.prix.toLocaleString('fr-FR') + ' FCFA. SuperMarché CM',
 rappel: 'Rappel : ' + rdv.client + ', vous avez un RDV mécanicien DEMAIN à ' + rdv.heure + ' pour "' + rdv.service + '" — ' + rdv.vehicule + '. SuperMarché CM',
 en_cours: 'Bonjour ' + rdv.client + ', votre véhicule (' + rdv.vehicule + ') est actuellement en réparation. Nous vous contactons dès la fin. SuperMarché CM',
 termine: 'Bonjour ' + rdv.client + ', votre véhicule est prêt ! ' + rdv.service + ' terminé. Montant : ' + rdv.prix.toLocaleString('fr-FR') + ' FCFA. Venez récupérer. SuperMarché CM',
 annulee: 'Bonjour ' + rdv.client + ', votre RDV mécanicien ' + rdv.id + ' a été annulé. Contactez-nous pour replanifier. SuperMarché CM'
 };
 var msg = msgs[type];
 if (!msg) return;
 fetch((typeof BACKEND!=='undefined'?BACKEND:'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
 method:'POST', headers:{'Content-Type':'application/json'},
 body: JSON.stringify({ tel: rdv.tel.replace(/[\s+]/g,''), message: msg })
 }).then(function(r){ return r.json(); })
 .then(function(r){ if(r.ok) toast('SMS auto envoyé', 'success'); })
 .catch(function(e){ console.warn('SMS auto:', e); });
}

// ── Changer statut RDV ──
function changerStatutAuto(id, statut) {
 var rdv = RESERVATIONS_AUTO.find(function(r){ return r.id===id; });
 if (!rdv) return;
 rdv.statut = statut;
 saveAuto();
 renderRdvAuto();
 renderStatsAuto();
 envoyerSMSAuto(statut, rdv);
 toast(id + ' — ' + statut, 'success');
}

// ── Render RDV ──
function renderRdvAuto() {
 var liste = document.getElementById('auto-rdv-liste');
 if (!liste) return;
 var filtre = (document.getElementById('auto-filtre')||{}).value || 'tous';
 var rdvs = filtre==='tous' ? RESERVATIONS_AUTO
 : RESERVATIONS_AUTO.filter(function(r){ return r.statut===filtre; });
 if (rdvs.length===0) {
 liste.innerHTML='<p style="text-align:center;color:#999;padding:20px">Aucun RDV</p>'; return;
 }
 var stMap = {
 confirme: ['Confirmé', '#007A3D','#dcfce7'],
 en_cours: ['En cours', '#3b82f6','#dbeafe'],
 termine: ['Terminé', '#6b7280','#f3f4f6'],
 annulee: ['Annulé', '#CE1126','#fee2e2'],
 };
 liste.innerHTML = rdvs.slice(0,20).map(function(r) {
 var st = stMap[r.statut]||['—','#999','#f9fafb'];
 return '<div class="cd" style="margin-bottom:10px">'
 + '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">'
 + '<div style="width:44px;height:44px;border-radius:10px;background:#007A3D22;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0"></div>'
 + '<div style="flex:1;min-width:140px">'
 + '<div style="font-weight:700">' + r.client + ' — ' + r.tel + '</div>'
 + '<div style="font-size:12px;color:#007A3D;font-weight:600"> ' + r.vehicule + '</div>'
 + '<div style="font-size:12px;color:#666">' + r.service + '</div>'
 + '</div>'
 + '<div style="text-align:center">'
 + '<div style="font-weight:700;color:#007A3D">' + formatDate(r.date) + ' à ' + r.heure + '</div>'
 + '<div style="font-size:13px;font-weight:800">' + r.prix.toLocaleString('fr-FR') + ' FCFA</div>'
 + '</div>'
 + '<span style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;background:'+st[2]+';color:'+st[1]+'">' + st[0] + '</span>'
 + '<div style="display:flex;gap:5px">'
 + (r.statut==='confirme' ? '<button class="btn bp bsm" onclick="changerStatutAuto(\''+r.id+'\',\'en_cours\')">Démarrer</button>' : '')
 + (r.statut==='en_cours' ? '<button class="btn bp bsm" onclick="changerStatutAuto(\''+r.id+'\',\'termine\')">Terminé</button>' : '')
 + (r.statut==='confirme'||r.statut==='en_cours' ? '<button class="btn bd bsm" onclick="changerStatutAuto(\''+r.id+'\',\'annulee\')">Annuler</button>' : '')
 + (r.statut==='confirme' ? '<button class="btn bo bsm" onclick="envoyerSMSAuto(\'rappel\',RESERVATIONS_AUTO.find(function(x){return x.id===\''+r.id+'\'}))">SMS rappel</button>' : '')
 + '</div></div></div>';
 }).join('');
}

// ── Render pièces catalogue ──
function renderPiecesAuto() {
 var grid = document.getElementById('auto-pieces-grid');
 if (!grid) return;
 var filtreCat = (document.getElementById('auto-cat-filtre')||{}).value || '';
 var srch = ((document.getElementById('auto-search')||{}).value||'').toLowerCase();
 var pieces = AUTO_PIECES.filter(function(p){
 return (!filtreCat || p.cat===filtreCat) && (!srch || p.nom.toLowerCase().includes(srch));
 });
 grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px">'
 + pieces.map(function(p) {
 var stCls = p.stock===0?'bgr':p.stock<5?'bgy':'bgg';
 var stLbl = p.stock===0?'Rupture':p.stock<5?'Stock faible':'Disponible';
 return '<div class="cd">'
 + '<div style="display:flex;justify-content:space-between;margin-bottom:6px">'
 + '<span style="font-size:10px;background:#f0faf5;color:#007A3D;padding:2px 8px;border-radius:20px;font-weight:700">' + p.cat + '</span>'
 + '<span class="badge ' + stCls + '" style="font-size:10px">' + stLbl + '</span>'
 + '</div>'
 + '<div style="font-weight:700;font-size:13px;margin-bottom:4px">' + p.nom + '</div>'
 + '<div style="font-size:11px;color:#999;margin-bottom:6px">Stock : ' + p.stock + ' unité(s)</div>'
 + '<div style="font-size:16px;font-weight:800;color:#007A3D">' + p.prix.toLocaleString('fr-FR') + ' FCFA</div>'
 + '</div>';
 }).join('')
 + '</div>';
}

// ── Stats auto ──
function renderStatsAuto() {
 var stats = document.getElementById('auto-stats');
 if (!stats) return;
 var rdvAujourdhui = RESERVATIONS_AUTO.filter(function(r){
 return r.date===new Date().toISOString().split('T')[0] && r.statut!=='annulee';
 }).length;
 var enCours = RESERVATIONS_AUTO.filter(function(r){ return r.statut==='en_cours'; }).length;
 var total = RESERVATIONS_AUTO.filter(function(r){ return r.statut!=='annulee'; }).length;
 var ca = RESERVATIONS_AUTO.filter(function(r){ return r.statut==='termine'; }).reduce(function(s,r){ return s+r.prix; },0);
 stats.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">'
 + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#007A3D">'+rdvAujourdhui+'</div><div style="font-size:12px;color:#666">RDV aujourd\'hui</div></div>'
 + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#3b82f6">'+enCours+'</div><div style="font-size:12px;color:#666">En cours</div></div>'
 + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#111">'+total+'</div><div style="font-size:12px;color:#666">Total RDV</div></div>'
 + '<div class="cd" style="text-align:center"><div style="font-size:22px;font-weight:800;color:#007A3D">'+(ca>=1000?Math.round(ca/1000)+'K':ca)+'</div><div style="font-size:12px;color:#666">CA FCFA</div></div>'
 + '</div>';
}

// ── Init page auto ──
function initPageAuto() {
 initAuto();
 renderStatsAuto();
 renderRdvAuto();
 renderPiecesAuto();
 // Remplir select services auto
 var sel = document.getElementById('auto-svc');
 if (sel) {
 sel.innerHTML = '<option value="">Choisir un service...</option>';
 var grouped = {};
 AUTO_SERVICES.forEach(function(s){
 if (!grouped[s.cat]) grouped[s.cat] = [];
 grouped[s.cat].push(s);
 });
 Object.keys(grouped).forEach(function(cat){
 var og = document.createElement('optgroup');
 og.label = cat;
 grouped[cat].forEach(function(s){
 var opt = document.createElement('option');
 opt.value = s.id;
 opt.textContent = s.nom + ' — ' + s.prix.toLocaleString('fr-FR') + ' FCFA (' + s.duree + ' min)';
 og.appendChild(opt);
 });
 sel.appendChild(og);
 });
 }
 // Date min
 var d = document.getElementById('auto-date');
 if (d) d.min = new Date().toISOString().split('T')[0];
}

// ═══════════════════════════════════════════════════════
// SUPABASE SYNC — Automobile
// ═══════════════════════════════════════════════════════

async function chargerRdvAutoSupabase() {
 try {
 var sb = _sbMain(); if (!sb) return;
 var res = await sb.from('rdv_automobile')
 .select('*').order('date', { ascending: false }).limit(200);
 if (res.data && res.data.length > 0) {
 RESERVATIONS_AUTO = res.data.map(function(r) {
 return {
 id: r.id, client: r.client, tel: r.tel, vehicule: r.vehicule,
 date: r.date, heure: r.heure, service: r.service, serviceId: r.service_id,
 prix: r.prix || 0, duree: r.duree || 60, notes: r.notes || '',
 statut: r.statut || 'confirme', cree_le: r.cree_le
 };
 });
 console.log('[Auto] ' + RESERVATIONS_AUTO.length + ' RDV chargés');
 }
 // Charger aussi les pièces depuis Supabase
 var resPieces = await sb.from('pieces_automobile').select('*').order('cat');
 if (resPieces.data && resPieces.data.length > 0) {
 AUTO_PIECES = resPieces.data.map(function(p) {
 return { id: p.id, nom: p.nom, cat: p.cat, prix: p.prix || 0, stock: p.stock || 0 };
 });
 }
 } catch(e) { console.warn('[Auto] Supabase:', e); }
}

async function sauvegarderRdvAutoSupabase(rdv) {
 try {
 var sb = _sbMain(); if (!sb) return;
 await sb.from('rdv_automobile').upsert({
 id: rdv.id, client: rdv.client, tel: rdv.tel, vehicule: rdv.vehicule,
 date: rdv.date, heure: rdv.heure, service: rdv.service, service_id: rdv.serviceId,
 prix: rdv.prix, duree: rdv.duree, notes: rdv.notes, statut: rdv.statut
 });
 } catch(e) { console.warn('[Auto] save:', e); }
}

async function mettreAJourStatutAutoSupabase(id, statut) {
 try {
 var sb = _sbMain(); if (!sb) return;
 await sb.from('rdv_automobile').update({ statut: statut }).eq('id', id);
 } catch(e) { console.warn('[Auto] update:', e); }
}

// Override creerRdvAuto
var _creerRdvAutoOrig = creerRdvAuto;
creerRdvAuto = async function() {
 var client = (document.getElementById('auto-client') || {}).value || '';
 var tel = (document.getElementById('auto-tel') || {}).value || '';
 var vehicule = (document.getElementById('auto-vehicule')|| {}).value || '';
 var date = (document.getElementById('auto-date') || {}).value || '';
 var heure = (document.getElementById('auto-heure') || {}).value || '08:00';
 var svcId = (document.getElementById('auto-svc') || {}).value || '';
 var notes = (document.getElementById('auto-notes') || {}).value || '';
 if (!client) { toast('Nom client requis', 'warning'); return; }
 if (!tel) { toast('Téléphone requis', 'warning'); return; }
 if (!vehicule) { toast('Véhicule requis', 'warning'); return; }
 if (!date) { toast('Date requise', 'warning'); return; }
 if (!svcId) { toast('Service requis', 'warning'); return; }
 var svc = AUTO_SERVICES.find(function(s){ return s.id === svcId; });
 if (!svc) { toast('Service introuvable', 'warning'); return; }
 var rdv = {
 id: 'AUTO-' + String(auto_seq++).padStart(3,'0'),
 client: client, tel: tel, vehicule: vehicule, date: date, heure: heure,
 service: svc.nom, serviceId: svcId, prix: svc.prix, duree: svc.duree,
 notes: notes, statut: 'confirme', cree_le: new Date().toISOString()
 };
 RESERVATIONS_AUTO.unshift(rdv);
 saveAuto();
 await sauvegarderRdvAutoSupabase(rdv);
 closeM('m-rdv-auto');
 renderRdvAuto(); renderStatsAuto();
 toast('RDV ' + rdv.id + ' créé !', 'success');
 addNotif('Nouveau RDV mécanicien : ' + client + ' — ' + svc.nom, 'green');
 envoyerSMSAuto('confirmation', rdv);
 ['auto-client','auto-tel','auto-vehicule','auto-notes'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
};

// Override changerStatutAuto
var _changerStatutAutoOrig = changerStatutAuto;
changerStatutAuto = async function(id, statut) {
 var rdv = RESERVATIONS_AUTO.find(function(r){ return r.id===id; });
 if (!rdv) return;
 rdv.statut = statut;
 saveAuto();
 await mettreAJourStatutAutoSupabase(id, statut);
 renderRdvAuto(); renderStatsAuto();
 envoyerSMSAuto(statut, rdv);
 toast(id + ' — ' + statut, 'success');
};

// Override initPageAuto
initPageAuto = async function() {
 initAuto();
 await chargerRdvAutoSupabase();
 renderStatsAuto();
 renderRdvAuto();
 renderPiecesAuto();
 var sel = document.getElementById('auto-svc');
 if (sel) {
 sel.innerHTML = '<option value="">Choisir un service...</option>';
 var grouped = {};
 AUTO_SERVICES.forEach(function(s){ if(!grouped[s.cat]) grouped[s.cat]=[]; grouped[s.cat].push(s); });
 Object.keys(grouped).forEach(function(cat){
 var og = document.createElement('optgroup'); og.label = cat;
 grouped[cat].forEach(function(s){
 var opt = document.createElement('option');
 opt.value = s.id;
 opt.textContent = s.nom + ' — ' + s.prix.toLocaleString('fr-FR') + ' FCFA (' + s.duree + 'min)';
 og.appendChild(opt);
 });
 sel.appendChild(og);
 });
 }
 var d = document.getElementById('auto-date');
 if (d) d.min = new Date().toISOString().split('T')[0];
};

// ═══════════════════════════════════════════════════════
//  AMÉLIORATIONS AUTOMOBILE v2
//  1. Gestion stock pièces (entrées/sorties)
//  2. Devis de réparation
//  3. Historique par véhicule
//  4. Export CSV
//  5. Alerte stock pièces
// ═══════════════════════════════════════════════════════

var DEVIS_REPARATION = [];
var HISTORIQUE_VEHICULES = [];
var auto_devis_seq = 1;

function initAutoV2() {
  try {
    var s = JSON.parse(localStorage.getItem('sm_auto_v2') || '{}');
    if (s.devis) DEVIS_REPARATION = s.devis;
    if (s.historique) HISTORIQUE_VEHICULES = s.historique;
    if (s.seq) auto_devis_seq = s.seq;
  } catch(e) {}
}

function saveAutoV2() {
  try { localStorage.setItem('sm_auto_v2', JSON.stringify({ devis: DEVIS_REPARATION, historique: HISTORIQUE_VEHICULES, seq: auto_devis_seq })); } catch(e) {}
}

// ── Créer devis réparation ──
function creerDevisReparation() {
  var client   = (document.getElementById('drep-client')   || {}).value || '';
  var tel      = (document.getElementById('drep-tel')      || {}).value || '';
  var vehicule = (document.getElementById('drep-vehicule') || {}).value || '';
  var panne    = (document.getElementById('drep-panne')    || {}).value || '';
  var pieces   = (document.getElementById('drep-pieces')   || {}).value || '';
  var mo       = parseInt((document.getElementById('drep-mo') || {}).value) || 0;

  if (!client || !vehicule || !panne) { toast('Client, véhicule et panne requis', 'warning'); return; }

  // Calculer prix pièces sélectionnées
  var prixPieces = 0;
  if (pieces) {
    pieces.split(',').forEach(function(pid) {
      var p = AUTO_PIECES.find(function(x){ return x.id === pid.trim(); });
      if (p) prixPieces += p.prix;
    });
  }
  var total = prixPieces + mo;

  var dv = {
    id: 'DREP-' + String(auto_devis_seq++).padStart(3,'0'),
    client: client, tel: tel, vehicule: vehicule,
    panne: panne, pieces_ids: pieces, prix_pieces: prixPieces,
    main_oeuvre: mo, total: total, statut: 'en_attente',
    cree_le: new Date().toISOString()
  };
  DEVIS_REPARATION.unshift(dv);

  // Ajouter à l'historique véhicule
  var histo = HISTORIQUE_VEHICULES.find(function(h){ return h.vehicule === vehicule && h.tel === tel; });
  if (!histo) {
    HISTORIQUE_VEHICULES.push({ vehicule: vehicule, client: client, tel: tel, interventions: [dv.id] });
  } else {
    histo.interventions.unshift(dv.id);
  }

  saveAutoV2();
  closeM('m-devis-reparation');
  renderDevisReparation();
  toast('Devis ' + dv.id + ' créé — Total : ' + total.toLocaleString('fr-FR') + ' FCFA', 'success');

  var msg = 'Bonjour ' + client + ', votre devis de réparation ' + dv.id + ' pour votre ' + vehicule + ' est prêt. Montant estimé : ' + total.toLocaleString('fr-FR') + ' FCFA. SuperMarché CM Auto';
  fetch((typeof BACKEND!=='undefined'?BACKEND:'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ tel: tel.replace(/[\s+]/g,''), message: msg })
  }).catch(function(){});

  ['drep-client','drep-tel','drep-vehicule','drep-panne'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

function validerDevisReparation(id) {
  var dv = DEVIS_REPARATION.find(function(d){ return d.id===id; });
  if (!dv) return;
  dv.statut = 'accepte';
  // Déduire les pièces du stock
  if (dv.pieces_ids) {
    dv.pieces_ids.split(',').forEach(function(pid) {
      var p = AUTO_PIECES.find(function(x){ return x.id === pid.trim(); });
      if (p && p.stock > 0) p.stock--;
    });
  }
  saveAutoV2();
  renderDevisReparation();
  renderPiecesAuto();
  renderAlertesStockAuto();
  toast('Devis ' + id + ' accepté — stock mis à jour', 'success');
}

function renderDevisReparation() {
  var liste = document.getElementById('auto-devis-liste');
  if (!liste) return;
  if (DEVIS_REPARATION.length === 0) { liste.innerHTML = '<p style="text-align:center;color:#999;padding:16px">Aucun devis</p>'; return; }
  var stMap = { en_attente:['En attente','#f59e0b','#fef3c7'], accepte:['Accepté','#007A3D','#dcfce7'], refuse:['Refusé','#CE1126','#fee2e2'], termine:['Terminé','#6b7280','#f3f4f6'] };
  liste.innerHTML = DEVIS_REPARATION.slice(0,15).map(function(d) {
    var st = stMap[d.statut] || ['—','#999','#f9fafb'];
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">'
      + '<div><span style="font-weight:800;color:#007A3D">' + d.id + '</span> <span style="font-size:11px;padding:2px 8px;border-radius:20px;background:'+st[2]+';color:'+st[1]+';font-weight:700">'+st[0]+'</span>'
      + '<div style="font-weight:700;margin-top:4px">' + d.client + ' — ' + d.vehicule + '</div>'
      + '<div style="font-size:12px;color:#CE1126">' + d.panne + '</div>'
      + '<div style="font-size:12px;color:#666">Pièces : ' + d.prix_pieces.toLocaleString('fr-FR') + ' F · Main d\'œuvre : ' + d.main_oeuvre.toLocaleString('fr-FR') + ' F</div>'
      + '</div>'
      + '<div style="font-size:18px;font-weight:800;color:#007A3D">' + d.total.toLocaleString('fr-FR') + ' FCFA</div>'
      + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:8px">'
      + (d.statut==='en_attente' ? '<button class="btn bp bsm" onclick="validerDevisReparation(\''+d.id+'\')">Valider et déduire stock</button>' : '')
      + (d.statut==='accepte' ? '<button class="btn bp bsm" onclick="terminerReparation(\''+d.id+'\')">Marquer terminé</button>' : '')
      + (d.statut!=='termine'&&d.statut!=='refuse' ? '<button class="btn bd bsm" onclick="refuserDevisRep(\''+d.id+'\')">Refuser</button>' : '')
      + '</div></div>';
  }).join('');
}

function terminerReparation(id) {
  var dv = DEVIS_REPARATION.find(function(d){ return d.id===id; });
  if (!dv) return;
  dv.statut = 'termine';
  saveAutoV2();
  renderDevisReparation();
  var msg = 'Bonjour ' + dv.client + ', votre ' + dv.vehicule + ' est prêt ! Réparation terminée. Montant : ' + dv.total.toLocaleString('fr-FR') + ' FCFA. SuperMarché CM Auto';
  fetch((typeof BACKEND!=='undefined'?BACKEND:'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ tel: dv.tel.replace(/[\s+]/g,''), message: msg })
  }).catch(function(){});
  toast(id + ' — Réparation terminée, SMS envoyé', 'success');
}

function refuserDevisRep(id) {
  var dv = DEVIS_REPARATION.find(function(d){ return d.id===id; });
  if (!dv) return;
  dv.statut = 'refuse';
  saveAutoV2();
  renderDevisReparation();
}

// ── Alertes stock pièces ──
function renderAlertesStockAuto() {
  var zone = document.getElementById('auto-alertes');
  if (!zone) return;
  var alertes = AUTO_PIECES.filter(function(p){ return p.stock <= 3; });
  if (alertes.length === 0) { zone.innerHTML = ''; return; }
  zone.innerHTML = '<div style="background:#fee2e2;border:1.5px solid #CE1126;border-radius:12px;padding:12px;margin-bottom:16px">'
    + '<div style="font-weight:700;color:#CE1126;margin-bottom:8px"><img loading="lazy" src="https://img.icons8.com/ios/16/CE1126/warning-shield.png" alt="Attention" style="width:14px;height:14px;vertical-align:middle"> ' + alertes.length + ' pièce(s) en rupture ou stock faible</div>'
    + alertes.map(function(p){ return '<div style="font-size:12px;color:#555;padding:2px 0">• ' + p.nom + ' — ' + p.stock + ' en stock</div>'; }).join('')
    + '</div>';
}

// ── Historique par véhicule ──
function rechercherHistoriqueVehicule() {
  var srch = ((document.getElementById('auto-histo-search') || {}).value || '').toLowerCase();
  var result = document.getElementById('auto-histo-result');
  if (!result || !srch) { if(result) result.innerHTML=''; return; }
  var rdvs = RESERVATIONS_AUTO.filter(function(r){ return r.vehicule.toLowerCase().includes(srch) || r.client.toLowerCase().includes(srch); });
  var devs = DEVIS_REPARATION.filter(function(d){ return d.vehicule.toLowerCase().includes(srch) || d.client.toLowerCase().includes(srch); });
  if (rdvs.length===0 && devs.length===0) { result.innerHTML='<p style="color:#999;font-size:12px;padding:8px">Aucun historique</p>'; return; }
  result.innerHTML = '<div style="background:#f0faf5;border-radius:10px;padding:12px;margin-top:8px">'
    + '<div style="font-weight:700;margin-bottom:8px">Historique — ' + (rdvs[0]||devs[0]).vehicule + '</div>'
    + (rdvs.length>0 ? '<div style="font-size:12px;font-weight:600;color:#007A3D;margin-bottom:4px">RDV mécanicien (' + rdvs.length + ')</div>' + rdvs.slice(0,3).map(function(r){ return '<div style="font-size:11px;color:#555;padding:2px 0">' + formatDate(r.date) + ' — ' + r.service + ' — ' + r.prix.toLocaleString('fr-FR') + ' F</div>'; }).join('') : '')
    + (devs.length>0 ? '<div style="font-size:12px;font-weight:600;color:#CE1126;margin-bottom:4px;margin-top:8px">Devis réparation (' + devs.length + ')</div>' + devs.slice(0,3).map(function(d){ return '<div style="font-size:11px;color:#555;padding:2px 0">' + d.id + ' — ' + d.panne + ' — ' + d.total.toLocaleString('fr-FR') + ' F</div>'; }).join('') : '')
    + '</div>';
}

// ── Mouvement stock pièces ──
function ajusterStockPiece(pieceId, delta) {
  var p = AUTO_PIECES.find(function(x){ return x.id === pieceId; });
  if (!p) return;
  p.stock = Math.max(0, p.stock + delta);
  renderPiecesAuto();
  renderAlertesStockAuto();
  toast(p.nom + ' — stock : ' + p.stock, 'success');
}

// ── Export CSV ──
function exporterCSVAuto() {
  var lignes = ['\uFEFFID;Client;Téléphone;Véhicule;Service;Date;Prix (FCFA);Statut'];
  RESERVATIONS_AUTO.forEach(function(r) {
    lignes.push([r.id, r.client, r.tel, '"'+r.vehicule+'"', '"'+r.service+'"', r.date, r.prix, r.statut].join(';'));
  });
  telechargerCSV(lignes.join('\n'), 'auto-' + new Date().toLocaleDateString('fr-FR').replace(/\//g,'-') + '.csv');
  toast('Export CSV auto OK', 'success');
}

// Surcharger renderPiecesAuto pour ajouter boutons stock
var _renderPiecesAutoOrig = renderPiecesAuto;
renderPiecesAuto = function() {
  var grid = document.getElementById('auto-pieces-grid');
  if (!grid) return;
  var filtreCat = (document.getElementById('auto-cat-filtre')||{}).value || '';
  var srch = ((document.getElementById('auto-search')||{}).value||'').toLowerCase();
  var pieces = AUTO_PIECES.filter(function(p){
    return (!filtreCat || p.cat===filtreCat) && (!srch || p.nom.toLowerCase().includes(srch));
  });
  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px">'
    + pieces.map(function(p) {
        var stCls = p.stock===0?'bgr':p.stock<=3?'bgy':'bgg';
        var stLbl = p.stock===0?'Rupture':p.stock<=3?'Stock faible':'Disponible';
        return '<div class="cd">'
          + '<div style="display:flex;justify-content:space-between;margin-bottom:6px">'
          + '<span style="font-size:10px;background:#f0faf5;color:#007A3D;padding:2px 8px;border-radius:20px;font-weight:700">' + p.cat + '</span>'
          + '<span class="badge ' + stCls + '" style="font-size:10px">' + stLbl + '</span>'
          + '</div>'
          + '<div style="font-weight:700;font-size:13px;margin-bottom:4px">' + p.nom + '</div>'
          + '<div style="font-size:16px;font-weight:800;color:#007A3D;margin-bottom:8px">' + p.prix.toLocaleString('fr-FR') + ' FCFA</div>'
          + '<div style="display:flex;align-items:center;justify-content:space-between">'
          + '<span style="font-size:13px;font-weight:700">Stock : ' + p.stock + '</span>'
          + '<div style="display:flex;gap:4px">'
          + '<button onclick="ajusterStockPiece(\'' + p.id + '\',-1)" style="width:26px;height:26px;border-radius:50%;border:1.5px solid #e5e7eb;background:#fff;cursor:pointer;font-size:14px">−</button>'
          + '<button onclick="ajusterStockPiece(\'' + p.id + '\',1)" style="width:26px;height:26px;border-radius:50%;background:#007A3D;border:none;color:#fff;cursor:pointer;font-size:14px">+</button>'
          + '</div>'
          + '</div></div>';
      }).join('')
    + '</div>';
};

// Surcharger initPageAuto
initPageAuto = async function() {
  initAuto();
  initAutoV2();
  await chargerRdvAutoSupabase();
  renderStatsAuto();
  renderRdvAuto();
  renderPiecesAuto();
  renderAlertesStockAuto();
  renderDevisReparation();
  var sel = document.getElementById('auto-svc');
  if (sel) {
    sel.innerHTML = '<option value="">Choisir un service...</option>';
    var grouped = {};
    AUTO_SERVICES.forEach(function(s){ if(!grouped[s.cat]) grouped[s.cat]=[]; grouped[s.cat].push(s); });
    Object.keys(grouped).forEach(function(cat){
      var og = document.createElement('optgroup'); og.label = cat;
      grouped[cat].forEach(function(s){
        var opt = document.createElement('option');
        opt.value = s.id; opt.textContent = s.nom + ' — ' + s.prix.toLocaleString('fr-FR') + ' FCFA (' + s.duree + 'min)';
        og.appendChild(opt);
      });
      sel.appendChild(og);
    });
  }
  var d = document.getElementById('auto-date');
  if (d) d.min = new Date().toISOString().split('T')[0];
};
