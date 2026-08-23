// ═══════════════════════════════════════════════════════
// SuperMarché CM — pressing.js
// Pressing & Blanchisserie : Dépôts + Suivi + SMS
// ═══════════════════════════════════════════════════════

var PRESSING_TARIFS = [
 { id:'p1', nom:'Chemise / Blouse', prix_piece:500, prix_kilo:0 },
 { id:'p2', nom:'Pantalon / Jupe', prix_piece:700, prix_kilo:0 },
 { id:'p3', nom:'Costume complet', prix_piece:2500, prix_kilo:0 },
 { id:'p4', nom:'Robe simple', prix_piece:1000, prix_kilo:0 },
 { id:'p5', nom:'Robe de soirée', prix_piece:3500, prix_kilo:0 },
 { id:'p6', nom:'Pagne (2 yards)', prix_piece:800, prix_kilo:0 },
 { id:'p7', nom:'Manteau / Veste', prix_piece:2000, prix_kilo:0 },
 { id:'p8', nom:'Linge de maison (kg)', prix_piece:0, prix_kilo:600 },
 { id:'p9', nom:'Nettoyage à sec kg', prix_piece:0, prix_kilo:1500},
 { id:'p10', nom:'Couverture / Drap (pièce)', prix_piece:1500, prix_kilo:0 },
];

var PRESSING_COMMANDES = [];
var pressing_seq = 1;

function initPressing() {
 try {
 var saved = JSON.parse(localStorage.getItem('sm_pressing') || '{}');
 if (saved.commandes) PRESSING_COMMANDES = saved.commandes;
 if (saved.seq) pressing_seq = saved.seq;
 } catch(e) { PRESSING_COMMANDES = []; }
}

function savePressing() {
 // Notifier la marketplace
 try { localStorage.setItem('sm_pressing_mkt_sync', Date.now().toString()); localStorage.removeItem('sm_pressing_mkt_sync'); } catch(e) {}
 try { localStorage.setItem('sm_pressing', JSON.stringify({ commandes: PRESSING_COMMANDES, seq: pressing_seq })); } catch(e) {}
}

// ── Créer un dépôt ──
function creerDepotPressing() {
 var client = (document.getElementById('press-client') || {}).value || '';
 var tel = (document.getElementById('press-tel') || {}).value || '';
 var pieces = [];
 var total = 0;

 // Récupérer les articles
 document.querySelectorAll('.press-item-row').forEach(function(row) {
 var selEl = row.querySelector('.press-item-sel');
 var qteEl = row.querySelector('.press-item-qte');
 if (!selEl || !qteEl) return;
 var tarif = PRESSING_TARIFS.find(function(t){ return t.id === selEl.value; });
 var qte = parseFloat(qteEl.value) || 0;
 if (!tarif || qte <= 0) return;
 var prix = tarif.prix_piece > 0 ? tarif.prix_piece * qte : tarif.prix_kilo * qte;
 pieces.push({ nom: tarif.nom, qte: qte, unite: tarif.prix_piece > 0 ? 'pièce' : 'kg', prix: prix });
 total += prix;
 });

 if (!client) { toast('Nom client requis', 'warning'); return; }
 if (!tel) { toast('Téléphone requis', 'warning'); return; }
 if (pieces.length === 0) { toast('Ajoutez au moins un article', 'warning'); return; }

 var livraison = (document.getElementById('press-livraison') || {}).checked;
 var cmd = {
 id: 'PRESS-' + String(pressing_seq++).padStart(3,'0'),
 client: client,
 tel: tel,
 pieces: pieces,
 total: total,
 livraison: livraison,
 statut: 'depose',
 date_depot: new Date().toISOString(),
 date_pret: null,
 notes: (document.getElementById('press-notes') || {}).value || ''
 };

 PRESSING_COMMANDES.unshift(cmd);
 savePressing();
 closeM('m-pressing');
 renderPressingCommandes();
 renderStatsPresssing();
 toast('Dépôt ' + cmd.id + ' enregistré !', 'success');
 addNotif('Nouveau dépôt pressing : ' + client + ' — ' + total.toLocaleString('fr-FR') + ' FCFA', 'green');

 // SMS confirmation dépôt
 envoyerSMSPressing('depose', cmd);

 // Reset
 ['press-client','press-tel','press-notes'].forEach(function(id){
 var el = document.getElementById(id); if(el) el.value='';
 });
 renderLignesPressing();
}

// ── Changer statut pressing ──
function changerStatutPressing(id, statut) {
 var cmd = PRESSING_COMMANDES.find(function(c){ return c.id === id; });
 if (!cmd) return;
 cmd.statut = statut;
 if (statut === 'pret') cmd.date_pret = new Date().toISOString();
 savePressing();
 renderPressingCommandes();
 renderStatsPresssing();
 var msgs = { en_lavage:'En lavage', pret:'Prêt', livre:'Livré', annule:'Annulé' };
 toast(id + ' — ' + (msgs[statut]||statut), 'success');
 envoyerSMSPressing(statut, cmd);
}

// ── SMS Pressing ──
function envoyerSMSPressing(statut, cmd) {
 if (!cmd.tel) return;
 var msgs = {
 depose: 'Bonjour ' + cmd.client + ', votre dépôt pressing ' + cmd.id + ' a bien été enregistré (' + cmd.pieces.length + ' article(s)). Nous vous contacterons dès que c\'est prêt. SuperMarché CM',
 en_lavage: 'Bonjour ' + cmd.client + ', votre commande pressing ' + cmd.id + ' est en cours de traitement. SuperMarché CM',
 pret: 'Bonjour ' + cmd.client + ', vos vêtements sont PRÊTS ! Commande ' + cmd.id + ' — ' + cmd.total.toLocaleString('fr-FR') + ' FCFA. ' + (cmd.livraison ? 'Livraison en cours.' : 'Venez récupérer au magasin.') + ' SuperMarché CM',
 livre: 'Bonjour ' + cmd.client + ', votre commande pressing ' + cmd.id + ' a été livrée. Merci pour votre confiance ! SuperMarché CM',
 annule: 'Bonjour ' + cmd.client + ', votre commande pressing ' + cmd.id + ' a été annulée. Contactez-nous pour plus d\'infos. SuperMarché CM'
 };
 var msg = msgs[statut];
 if (!msg) return;
 fetch((typeof BACKEND !== 'undefined' ? BACKEND : 'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ tel: cmd.tel.replace(/[\s+]/g,''), message: msg })
 }).then(function(r){ return r.json(); })
 .then(function(r){ if(r.ok) toast('SMS pressing envoyé', 'success'); })
 .catch(function(e){ console.warn('SMS pressing:', e); });
}

// ── Render commandes pressing ──
function renderPressingCommandes() {
 var liste = document.getElementById('pressing-liste');
 if (!liste) return;
 var filtre = (document.getElementById('press-filtre') || {}).value || 'tous';
 var cmds = filtre === 'tous' ? PRESSING_COMMANDES
 : PRESSING_COMMANDES.filter(function(c){ return c.statut === filtre; });
 if (cmds.length === 0) {
 liste.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucun dépôt</p>';
 return;
 }
 var stMap = {
 depose: ['Déposé', '#f59e0b', '#fef3c7'],
 en_lavage: ['En lavage', '#3b82f6', '#dbeafe'],
 pret: ['Prêt', '#007A3D', '#dcfce7'],
 livre: ['Livré', '#6b7280', '#f3f4f6'],
 annule: ['Annulé', '#CE1126', '#fee2e2'],
 };
 liste.innerHTML = cmds.slice(0,30).map(function(c) {
 var st = stMap[c.statut] || ['—','#999','#f9fafb'];
 var dateDepot = c.date_depot ? new Date(c.date_depot).toLocaleDateString('fr-FR') : '—';
 var datePret = c.date_pret ? new Date(c.date_pret).toLocaleDateString('fr-FR') : '—';
 // Barre de progression
 var etapes = ['depose','en_lavage','pret','livre'];
 var step = etapes.indexOf(c.statut);
 var progHtml = '<div style="display:flex;align-items:center;gap:4px;margin:8px 0">'
 + etapes.map(function(e,i){
 var done = i <= step && c.statut !== 'annule';
 var labels = ['Déposé','Lavage','Prêt','Livré'];
 return '<div style="flex:1;text-align:center">'
 + '<div style="width:28px;height:28px;border-radius:50%;margin:0 auto 3px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:' + (done?'#007A3D':'#e5e7eb') + ';color:' + (done?'#fff':'#999') + '">' + (i+1) + '</div>'
 + '<div style="font-size:9px;color:' + (done?'#007A3D':'#999') + '">' + labels[i] + '</div>'
 + '</div>'
 + (i<3 ? '<div style="flex:0.3;height:2px;background:' + (i<step&&c.statut!=='annule'?'#007A3D':'#e5e7eb') + ';margin-bottom:14px"></div>' : '');
 }).join('')
 + '</div>';
 return '<div class="cd" style="margin-bottom:12px">'
 + '<div style="display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap">'
 + '<div style="flex:1;min-width:150px">'
 + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
 + '<span style="font-weight:800;font-size:13px;color:#007A3D">' + c.id + '</span>'
 + '<span style="font-size:12px;font-weight:700;padding:2px 10px;border-radius:20px;background:' + st[2] + ';color:' + st[1] + '">' + st[0] + '</span>'
 + (c.livraison ? '<span style="font-size:11px;background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:20px">Livraison</span>' : '')
 + '</div>'
 + '<div style="font-weight:700">' + c.client + ' — ' + c.tel + '</div>'
 + '<div style="font-size:12px;color:#666">Déposé le ' + dateDepot + (c.date_pret?' — Prêt le '+datePret:'') + '</div>'
 + '</div>'
 + '<div style="text-align:right">'
 + '<div style="font-size:18px;font-weight:800;color:#007A3D">' + c.total.toLocaleString('fr-FR') + ' FCFA</div>'
 + '<div style="font-size:12px;color:#666">' + c.pieces.length + ' article(s)</div>'
 + '</div>'
 + '</div>'
 + progHtml
 + '<div style="font-size:12px;color:#555;margin-bottom:8px">'
 + c.pieces.map(function(p){ return p.qte + '' + p.unite + ' × ' + p.nom + ' = ' + p.prix.toLocaleString('fr-FR') + ' F'; }).join(' | ')
 + '</div>'
 + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
 + (c.statut==='depose' ? '<button class="btn bp bsm" onclick="changerStatutPressing(\''+c.id+'\',\'en_lavage\')">Lancer lavage</button>' : '')
 + (c.statut==='en_lavage'? '<button class="btn bp bsm" onclick="changerStatutPressing(\''+c.id+'\',\'pret\')">Marquer prêt</button>' : '')
 + (c.statut==='pret' ? '<button class="btn bp bsm" onclick="changerStatutPressing(\''+c.id+'\',\'livre\')">Marquer livré</button>' : '')
 + (c.statut!=='livre'&&c.statut!=='annule' ? '<button class="btn bd bsm" onclick="changerStatutPressing(\''+c.id+'\',\'annule\')">Annuler</button>' : '')
 + '</div>'
 + '</div>';
 }).join('');
}

// ── Stats pressing ──
function renderStatsPresssing() {
 var stats = document.getElementById('pressing-stats');
 if (!stats) return;
 var enCours = PRESSING_COMMANDES.filter(function(c){ return ['depose','en_lavage'].includes(c.statut); }).length;
 var prets = PRESSING_COMMANDES.filter(function(c){ return c.statut==='pret'; }).length;
 var livres = PRESSING_COMMANDES.filter(function(c){ return c.statut==='livre'; }).length;
 var ca = PRESSING_COMMANDES.filter(function(c){ return c.statut==='livre'; }).reduce(function(s,c){ return s+c.total; },0);
 stats.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">'
 + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#f59e0b">'+enCours+'</div><div style="font-size:12px;color:#666">En cours</div></div>'
 + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#007A3D">'+prets+'</div><div style="font-size:12px;color:#666">Prêts à récupérer</div></div>'
 + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#6b7280">'+livres+'</div><div style="font-size:12px;color:#666">Livrés</div></div>'
 + '<div class="cd" style="text-align:center"><div style="font-size:22px;font-weight:800;color:#007A3D">'+(ca>=1000?Math.round(ca/1000)+'K':ca.toLocaleString('fr-FR'))+'</div><div style="font-size:12px;color:#666">CA FCFA</div></div>'
 + '</div>';
}

// ── Lignes articles dynamiques ──
var press_lignes = 1;
function renderLignesPressing() {
 var container = document.getElementById('press-items');
 if (!container) return;
 var rows = '';
 for (var i = 0; i < press_lignes; i++) {
 rows += '<div class="press-item-row" style="display:flex;gap:8px;margin-bottom:8px;align-items:center">'
 + '<select class="press-item-sel" style="flex:2;padding:8px;border:1.5px solid var(--br);border-radius:8px;font-size:13px">'
 + '<option value="">Choisir article...</option>'
 + PRESSING_TARIFS.map(function(t){
 var unite = t.prix_piece > 0 ? 'pièce — ' + t.prix_piece.toLocaleString('fr-FR') + ' F' : 'kg — ' + t.prix_kilo.toLocaleString('fr-FR') + ' F/kg';
 return '<option value="'+t.id+'">'+t.nom+' ('+unite+')</option>';
 }).join('')
 + '</select>'
 + '<input type="number" class="press-item-qte" placeholder="Qté/kg" min="0.5" step="0.5" value="1" style="flex:1;padding:8px;border:1.5px solid var(--br);border-radius:8px;font-size:13px">'
 + (i > 0 ? '<button onclick="retirerLignePressing(this)" style="background:#fee2e2;border:none;border-radius:8px;padding:6px 10px;cursor:pointer;color:#CE1126;font-weight:700"></button>' : '<div style="width:36px"></div>')
 + '</div>';
 }
 container.innerHTML = rows;
}

function ajouterLignePressing() {
 press_lignes++;
 renderLignesPressing();
}

function retirerLignePressing(btn) {
 btn.parentElement.remove();
}

// ── Init page pressing ──
function initPagePressing() {
 initPressing();
 renderStatsPresssing();
 renderPressingCommandes();
 press_lignes = 1;
 renderLignesPressing();
}

// ═══════════════════════════════════════════════════════
// SUPABASE SYNC — Pressing
// ═══════════════════════════════════════════════════════

async function chargerPressingSupabase() {
 try {
 var sb = _sbMain(); if (!sb) return;
 var res = await sb.from('pressing_commandes')
 .select('*').order('date_depot', { ascending: false }).limit(200);
 if (res.data && res.data.length > 0) {
 PRESSING_COMMANDES = res.data.map(function(c) {
 return {
 id: c.id,
 client: c.client,
 tel: c.tel,
 pieces: typeof c.pieces === 'string' ? JSON.parse(c.pieces) : (c.pieces || []),
 total: c.total || 0,
 livraison: c.livraison || false,
 statut: c.statut || 'depose',
 notes: c.notes || '',
 date_depot: c.date_depot,
 date_pret: c.date_pret
 };
 });
 console.log('[Pressing] ' + PRESSING_COMMANDES.length + ' commandes chargées');
 }
 } catch(e) { console.warn('[Pressing] Supabase:', e); }
}

async function sauvegarderPressingSupabase(cmd) {
 try {
 var sb = _sbMain(); if (!sb) return;
 await sb.from('pressing_commandes').upsert({
 id: cmd.id,
 client: cmd.client,
 tel: cmd.tel,
 pieces: JSON.stringify(cmd.pieces),
 total: cmd.total,
 livraison: cmd.livraison,
 statut: cmd.statut,
 notes: cmd.notes,
 date_depot: cmd.date_depot,
 date_pret: cmd.date_pret || null
 });
 } catch(e) { console.warn('[Pressing] save:', e); }
}

async function mettreAJourStatutPressingSupabase(id, statut, datePret) {
 try {
 var sb = _sbMain(); if (!sb) return;
 var update = { statut: statut };
 if (datePret) update.date_pret = datePret;
 await sb.from('pressing_commandes').update(update).eq('id', id);
 } catch(e) { console.warn('[Pressing] update:', e); }
}

// Override creerDepotPressing
var _creerDepotOrig = creerDepotPressing;
creerDepotPressing = async function() {
 var client = (document.getElementById('press-client') || {}).value || '';
 var tel = (document.getElementById('press-tel') || {}).value || '';
 var pieces = []; var total = 0;
 document.querySelectorAll('.press-item-row').forEach(function(row) {
 var selEl = row.querySelector('.press-item-sel');
 var qteEl = row.querySelector('.press-item-qte');
 if (!selEl || !qteEl) return;
 var tarif = PRESSING_TARIFS.find(function(t){ return t.id === selEl.value; });
 var qte = parseFloat(qteEl.value) || 0;
 if (!tarif || qte <= 0) return;
 var prix = tarif.prix_piece > 0 ? tarif.prix_piece * qte : tarif.prix_kilo * qte;
 pieces.push({ nom: tarif.nom, qte: qte, unite: tarif.prix_piece > 0 ? 'pièce' : 'kg', prix: prix });
 total += prix;
 });
 if (!client) { toast('Nom client requis', 'warning'); return; }
 if (!tel) { toast('Téléphone requis', 'warning'); return; }
 if (pieces.length === 0) { toast('Ajoutez au moins un article', 'warning'); return; }
 var livraison = (document.getElementById('press-livraison') || {}).checked;
 var cmd = {
 id: 'PRESS-' + String(pressing_seq++).padStart(3,'0'),
 client: client, tel: tel, pieces: pieces, total: total,
 livraison: livraison, statut: 'depose', notes: (document.getElementById('press-notes')||{}).value||'',
 date_depot: new Date().toISOString(), date_pret: null
 };
 PRESSING_COMMANDES.unshift(cmd);
 savePressing();
 await sauvegarderPressingSupabase(cmd);
 closeM('m-pressing');
 renderPressingCommandes(); renderStatsPresssing();
 toast('Dépôt ' + cmd.id + ' enregistré !', 'success');
 addNotif('Nouveau dépôt pressing : ' + client + ' — ' + total.toLocaleString('fr-FR') + ' FCFA', 'green');
 envoyerSMSPressing('depose', cmd);
 ['press-client','press-tel','press-notes'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
 press_lignes = 1; renderLignesPressing();
};

// Override changerStatutPressing
var _changerStatutPressingOrig = changerStatutPressing;
changerStatutPressing = async function(id, statut) {
 var cmd = PRESSING_COMMANDES.find(function(c){ return c.id === id; });
 if (!cmd) return;
 cmd.statut = statut;
 var datePret = null;
 if (statut === 'pret') { datePret = new Date().toISOString(); cmd.date_pret = datePret; }
 savePressing();
 await mettreAJourStatutPressingSupabase(id, statut, datePret);
 renderPressingCommandes(); renderStatsPresssing();
 envoyerSMSPressing(statut, cmd);
 toast(id + ' — ' + statut, 'success');
};

// Override initPagePressing
initPagePressing = async function() {
 initPressing();
 await chargerPressingSupabase();
 renderStatsPresssing();
 renderPressingCommandes();
 press_lignes = 1;
 renderLignesPressing();
};

// ═══════════════════════════════════════════════════════
//  AMÉLIORATIONS PRESSING v2
//  1. Recherche client
//  2. Statistiques CA mensuel
//  3. Export CSV
//  4. Tarifs affichés
//  5. Abonnements clients pressing
// ═══════════════════════════════════════════════════════

var ABONNEMENTS_PRESSING = [];

function initAbonnementsPressing() {
  try {
    var s = JSON.parse(localStorage.getItem('sm_press_abo') || '[]');
    if (Array.isArray(s)) ABONNEMENTS_PRESSING = s;
  } catch(e) {}
}

function saveAbonnementsPressing() {
  try { localStorage.setItem('sm_press_abo', JSON.stringify(ABONNEMENTS_PRESSING)); } catch(e) {}
}

// ── Abonnement pressing mensuel ──
function creerAbonnementPressing() {
  var client = (document.getElementById('press-abo-client') || {}).value || '';
  var tel    = (document.getElementById('press-abo-tel')    || {}).value || '';
  var plan   = (document.getElementById('press-abo-plan')   || {}).value || 'basic';
  if (!client || !tel) { toast('Nom et téléphone requis', 'warning'); return; }
  var plans = { basic:{nom:'Basique',pieces:10,prix:8000}, standard:{nom:'Standard',pieces:20,prix:15000}, premium:{nom:'Premium',pieces:40,prix:25000} };
  var p = plans[plan];
  var abo = {
    id: 'ABO-' + Date.now(), client: client, tel: tel,
    plan: p.nom, pieces_restantes: p.pieces, pieces_total: p.pieces,
    prix: p.prix, actif: true,
    date_debut: new Date().toISOString(),
    date_fin: new Date(Date.now() + 30*24*3600*1000).toISOString()
  };
  ABONNEMENTS_PRESSING.push(abo);
  saveAbonnementsPressing();
  closeM('m-press-abonnement');
  renderAbonnementsPressing();
  toast('Abonnement ' + p.nom + ' créé pour ' + client, 'success');
  envoyerSMSPressing('depose', { client: client, tel: tel, id: abo.id, pieces: [], total: p.prix });
  ['press-abo-client','press-abo-tel'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

function renderAbonnementsPressing() {
  var liste = document.getElementById('pressing-abonnements');
  if (!liste) return;
  if (ABONNEMENTS_PRESSING.length === 0) {
    liste.innerHTML = '<p style="text-align:center;color:#999;padding:16px">Aucun abonnement actif</p>';
    return;
  }
  liste.innerHTML = ABONNEMENTS_PRESSING.map(function(a) {
    var pct = Math.round((a.pieces_restantes / a.pieces_total) * 100);
    var dateFin = new Date(a.date_fin).toLocaleDateString('fr-FR');
    var joursRestants = Math.ceil((new Date(a.date_fin) - Date.now()) / (24*3600*1000));
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">'
      + '<div>'
      + '<div style="font-weight:700">' + a.client + ' — ' + a.tel + '</div>'
      + '<div style="font-size:12px;color:#007A3D;font-weight:600">Plan ' + a.plan + ' — ' + a.prix.toLocaleString('fr-FR') + ' FCFA/mois</div>'
      + '<div style="font-size:11px;color:#999">Expire le ' + dateFin + ' (' + joursRestants + ' jours)</div>'
      + '</div>'
      + '<div style="text-align:center">'
      + '<div style="font-size:22px;font-weight:800;color:' + (pct<20?'#CE1126':'#007A3D') + '">' + a.pieces_restantes + '</div>'
      + '<div style="font-size:11px;color:#666">pièces restantes</div>'
      + '</div>'
      + '</div>'
      + '<div style="background:#e5e7eb;border-radius:20px;height:6px;margin:8px 0">'
      + '<div style="background:' + (pct<20?'#CE1126':'#007A3D') + ';width:' + pct + '%;height:100%;border-radius:20px"></div>'
      + '</div>'
      + '<div style="display:flex;gap:6px">'
      + '<button class="btn bp bsm" onclick="utiliserPieceAbonnement(\'' + a.id + '\')">Utiliser 1 pièce</button>'
      + '<button class="btn bd bsm" onclick="suspendreAbonnement(\'' + a.id + '\')">Suspendre</button>'
      + '</div></div>';
  }).join('');
}

function utiliserPieceAbonnement(id) {
  var abo = ABONNEMENTS_PRESSING.find(function(a){ return a.id===id; });
  if (!abo || abo.pieces_restantes <= 0) { toast('Plus de pièces disponibles !', 'error'); return; }
  abo.pieces_restantes--;
  saveAbonnementsPressing();
  renderAbonnementsPressing();
  toast('1 pièce utilisée — ' + abo.pieces_restantes + ' restantes', 'success');
}

function suspendreAbonnement(id) {
  var abo = ABONNEMENTS_PRESSING.find(function(a){ return a.id===id; });
  if (!abo) return;
  abo.actif = false;
  saveAbonnementsPressing();
  renderAbonnementsPressing();
  toast('Abonnement suspendu', 'warning');
}

// ── Recherche client ──
function rechercherClientPressing() {
  var srch = ((document.getElementById('press-client-search') || {}).value || '').toLowerCase();
  var result = document.getElementById('press-client-result');
  if (!result) return;
  if (!srch) { result.innerHTML = ''; return; }
  var cmds = PRESSING_COMMANDES.filter(function(c){ return c.client.toLowerCase().includes(srch) || c.tel.includes(srch); });
  if (cmds.length === 0) { result.innerHTML = '<p style="color:#999;font-size:12px;padding:8px">Aucun résultat</p>'; return; }
  var total = cmds.reduce(function(s,c){ return s+c.total; },0);
  var livrees = cmds.filter(function(c){ return c.statut==='livre'; }).length;
  result.innerHTML = '<div style="background:#f0faf5;border-radius:10px;padding:12px;margin-top:8px">'
    + '<div style="font-weight:700">' + cmds[0].client + ' — ' + cmds[0].tel + '</div>'
    + '<div style="font-size:13px;color:#007A3D">' + cmds.length + ' dépôt(s) — ' + livrees + ' livré(s) — ' + total.toLocaleString('fr-FR') + ' FCFA total</div>'
    + cmds.slice(0,3).map(function(c){ return '<div style="font-size:11px;color:#666;padding:3px 0">' + c.id + ' — ' + c.total.toLocaleString('fr-FR') + ' F — ' + c.statut + '</div>'; }).join('')
    + '</div>';
}

// ── Stats CA mensuel ──
function renderStatsCAMensuelPressing() {
  var zone = document.getElementById('pressing-ca-mensuel');
  if (!zone) return;
  var maintenant = new Date();
  var moisActuel = maintenant.getMonth();
  var anneeActuelle = maintenant.getFullYear();
  var moisLabels = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  var caParMois = new Array(12).fill(0);
  PRESSING_COMMANDES.filter(function(c){ return c.statut==='livre'; }).forEach(function(c) {
    var d = new Date(c.date_depot);
    if (d.getFullYear() === anneeActuelle) caParMois[d.getMonth()] += c.total;
  });
  var maxCA = Math.max.apply(null, caParMois) || 1;
  var html = '<div style="display:flex;align-items:flex-end;gap:4px;height:80px;margin-bottom:4px">';
  caParMois.forEach(function(ca, i) {
    var h = Math.round((ca / maxCA) * 70);
    var isActuel = i === moisActuel;
    html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">'
      + '<div title="' + ca.toLocaleString('fr-FR') + ' FCFA" style="width:100%;background:' + (isActuel?'#007A3D':'#d1fae5') + ';height:' + h + 'px;border-radius:4px 4px 0 0;min-height:2px"></div>'
      + '<div style="font-size:9px;color:' + (isActuel?'#007A3D':'#999') + ';font-weight:' + (isActuel?'700':'400') + '">' + moisLabels[i] + '</div>'
      + '</div>';
  });
  html += '</div>';
  var caMois = caParMois[moisActuel];
  html += '<div style="font-size:12px;color:#666;text-align:center">'
    + 'Ce mois : <span style="font-weight:700;color:#007A3D">' + caMois.toLocaleString('fr-FR') + ' FCFA</span></div>';
  zone.innerHTML = html;
}

// ── Export CSV Pressing ──
function exporterCSVPressing() {
  if (PRESSING_COMMANDES.length === 0) { toast('Aucune commande à exporter', 'warning'); return; }
  var lignes = ['\uFEFFID;Client;Téléphone;Articles;Total (FCFA);Livraison;Statut;Date dépôt;Date prêt'];
  PRESSING_COMMANDES.forEach(function(c) {
    var articles = c.pieces.map(function(p){ return p.qte + ' ' + p.unite + ' ' + p.nom; }).join(' | ');
    lignes.push([
      c.id, c.client, c.tel, '"' + articles + '"', c.total,
      c.livraison ? 'Oui' : 'Non', c.statut,
      c.date_depot ? new Date(c.date_depot).toLocaleDateString('fr-FR') : '—',
      c.date_pret  ? new Date(c.date_pret).toLocaleDateString('fr-FR')  : '—'
    ].join(';'));
  });
  telechargerCSV(lignes.join('\n'), 'pressing-' + new Date().toLocaleDateString('fr-FR').replace(/\//g,'-') + '.csv');
  toast('Export CSV pressing OK', 'success');
}

// Surcharger initPagePressing
initPagePressing = async function() {
  initPressing();
  initAbonnementsPressing();
  await chargerPressingSupabase();
  renderStatsPresssing();
  renderPressingCommandes();
  renderAbonnementsPressing();
  renderStatsCAMensuelPressing();
  press_lignes = 1;
  renderLignesPressing();
};
