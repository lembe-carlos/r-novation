// ═══════════════════════════════════════════════════════════════
//  SuperMarché CM — marketplace-auto-pressing.js
//  Sections dynamiques : Automobile + Pressing
//  Chaque modification dans l'espace gérant se reflète ici
//  via Supabase (tables rdv_automobile, pieces_automobile,
//  pressing_commandes) + localStorage fallback
// ═══════════════════════════════════════════════════════════════

// ── Client Supabase (lecture publique, sans auth) ──────────────
function _sbMkt() {
  if (typeof window.supabase === 'undefined') return null;
  try {
    if (typeof SM_CONFIG !== 'undefined' && SM_CONFIG.supabase && SM_CONFIG.supabase.active)
      return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
  } catch(e) {}
  return null;
}

// ── Toast marketplace ──────────────────────────────────────────
function mktMsg(msg, type) {
  var colors = { ok:'#007A3D', warn:'#f59e0b', err:'#CE1126' };
  var bg = colors[type] || colors.ok;
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:' + bg + ';color:#fff;padding:11px 22px;border-radius:30px;font-size:13px;font-weight:700;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.2)';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function(){ t.style.opacity='0';t.style.transition='opacity .4s';setTimeout(function(){t.remove()},400); }, 2800);
}

// ═══════════════════════════════════════════════════════════════
//  SECTION AUTOMOBILE — Dynamique Supabase + localStorage
//  Services lus depuis AUTO_SERVICES (gérant)
//  RDV sauvegardés dans rdv_automobile (Supabase)
//  Pièces lues depuis pieces_automobile + AUTO_PIECES
// ═══════════════════════════════════════════════════════════════

var MKT_AUTO_SERVICES_LOCAL = [];
var MKT_AUTO_PIECES_LOCAL   = [];
var MKT_MECANICIENS = [
  { id:'mec1', nom:'Garage MBARGA Motors',    ville:'Douala',  quartier:'Akwa',     tel:'+237 677 401 001', specialite:'Vidange, freins, moteur', note:4.8, ouvert:true,  img:'https://picsum.photos/seed/mec001/400/200', horaires:'07h-18h' },
  { id:'mec2', nom:'Auto Service NKOULOU',    ville:'Douala',  quartier:'Makepe',   tel:'+237 677 401 002', specialite:'Diagnostic électronique, electricité', note:4.7, ouvert:true, img:'https://picsum.photos/seed/mec002/400/200', horaires:'08h-17h' },
  { id:'mec3', nom:'Garage Rapide Yaoundé',   ville:'Yaoundé', quartier:'Bastos',   tel:'+237 677 401 003', specialite:'Pneus, suspension, géométrie', note:4.6, ouvert:true, img:'https://picsum.photos/seed/mec003/400/200', horaires:'07h-18h' },
  { id:'mec4', nom:'ATEBA Auto Carosserie',   ville:'Douala',  quartier:'Bepanda',  tel:'+237 677 401 004', specialite:'Carrosserie, peinture, débosselage', note:4.5, ouvert:false,img:'https://picsum.photos/seed/mec004/400/200', horaires:'08h-17h' },
  { id:'mec5', nom:'Express Moto Service',    ville:'Yaoundé', quartier:'Mvog-Ada', tel:'+237 677 401 005', specialite:'Motos, scooters, entretien 2-roues', note:4.9, ouvert:true, img:'https://picsum.photos/seed/mec005/400/200', horaires:'06h-20h' },
];

// Charger les données depuis Supabase + localStorage
async function chargerDonneesAutoMkt() {
  // 1. Partir des données statiques de l'espace gérant (déjà chargées)
  MKT_AUTO_SERVICES_LOCAL = (typeof AUTO_SERVICES !== 'undefined') ? AUTO_SERVICES.slice() : [];
  MKT_AUTO_PIECES_LOCAL   = (typeof AUTO_PIECES !== 'undefined')   ? AUTO_PIECES.slice()   : [];

  // 2. Enrichir depuis Supabase si disponible
  try {
    var sb = _sbMkt();
    if (sb) {
      var rSvcs = await sb.from('auto_services_catalogue').select('*').eq('actif', true);
      if (rSvcs.data && rSvcs.data.length > 0) {
        MKT_AUTO_SERVICES_LOCAL = rSvcs.data;
      }
      var rPieces = await sb.from('pieces_automobile').select('*').gt('stock', 0);
      if (rPieces.data && rPieces.data.length > 0) {
        MKT_AUTO_PIECES_LOCAL = rPieces.data;
      }
    }
  } catch(e) {
    console.warn('[MktAuto] Supabase indisponible, données locales utilisées');
  }

  // Fallback : si toujours vide, utiliser la liste statique de automobile.js
  if (MKT_AUTO_SERVICES_LOCAL.length === 0 && typeof AUTO_SERVICES !== 'undefined') {
    MKT_AUTO_SERVICES_LOCAL = AUTO_SERVICES.slice();
  }
  if (MKT_AUTO_PIECES_LOCAL.length === 0 && typeof AUTO_PIECES !== 'undefined') {
    MKT_AUTO_PIECES_LOCAL = AUTO_PIECES.slice();
  }
}

function renderMktAutomobile() {
  var el = document.getElementById('mkt-auto-content');
  if (!el) return;
  var tab = (document.getElementById('mkt-auto-tab') || {}).value || 'services';
  if (tab === 'services')   renderMktAutoServices();
  else if (tab === 'pieces') renderMktAutoPieces();
  else renderMktAutoMecaniciens();
}

function renderMktAutoServices() {
  var el = document.getElementById('mkt-auto-content');
  if (!el) return;

  var svcs = MKT_AUTO_SERVICES_LOCAL;
  var catF = (document.getElementById('mkt-auto-cat') || {}).value || '';
  if (catF) svcs = svcs.filter(function(s){ return s.cat === catF; });

  var catColors = {
    'Entretien':'#d1fae5','Freinage':'#fee2e2','Moteur':'#fef3c7',
    'Diagnostic':'#dbeafe','Confort':'#ede9fe','Lavage':'#f0f9ff',
    'Pneus':'#fce7f3','Electrique':'#fff7ed','Électrique':'#fff7ed'
  };
  var catTC = {
    'Entretien':'#065f46','Freinage':'#991b1b','Moteur':'#b45309',
    'Diagnostic':'#1d4ed8','Confort':'#5b21b6','Lavage':'#0369a1',
    'Pneus':'#be185d','Electrique':'#c2410c','Électrique':'#c2410c'
  };

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">';
  svcs.forEach(function(s) {
    var cat = s.cat || 'Entretien';
    var bg  = catColors[cat] || '#f9fafb';
    var tc  = catTC[cat]  || '#374151';
    var dureeStr = s.duree ? s.duree + ' min' : '';
    html += '<div style="background:#fff;border-radius:14px;border:1.5px solid #e5e7eb;padding:18px" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">';
    html += '<span style="background:' + bg + ';color:' + tc + ';font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">' + cat + '</span>';
    if (dureeStr) html += '<span style="font-size:11px;color:#666;font-weight:600">' + dureeStr + '</span>';
    html += '</div>';
    html += '<div style="font-weight:800;font-size:15px;margin-bottom:8px;line-height:1.3">' + (s.nom || '') + '</div>';
    if (s.desc) html += '<div style="font-size:12px;color:#666;margin-bottom:10px">' + s.desc + '</div>';
    html += '<div style="font-size:20px;font-weight:800;color:#007A3D;margin-bottom:12px">' + (s.prix||0).toLocaleString('fr-FR') + ' FCFA</div>';
    html += '<button onclick="ouvrirRdvAuto(\'' + (s.id||'') + '\',\'' + (s.nom||'').replace(/'/g,'') + '\',' + (s.prix||0) + ')" ';
    html += 'style="width:100%;background:#007A3D;color:#fff;border:none;padding:11px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">Prendre un RDV</button>';
    html += '</div>';
  });

  if (svcs.length === 0) {
    html += '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#999"><div style="font-size:40px;margin-bottom:10px">🔧</div><div>Aucun service disponible</div></div>';
  }
  html += '</div>';
  el.innerHTML = html;
}

function renderMktAutoPieces() {
  var el = document.getElementById('mkt-auto-content');
  if (!el) return;

  var pieces = MKT_AUTO_PIECES_LOCAL;
  var catF   = (document.getElementById('mkt-auto-cat') || {}).value || '';
  var searchF = ((document.getElementById('mkt-auto-search') || {}).value || '').toLowerCase();
  if (catF)    pieces = pieces.filter(function(p){ return p.cat === catF; });
  if (searchF) pieces = pieces.filter(function(p){ return (p.nom||'').toLowerCase().includes(searchF); });

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">';
  pieces.forEach(function(p) {
    var stock = p.stock || 0;
    var stockColor = stock === 0 ? '#CE1126' : stock < 5 ? '#f59e0b' : '#007A3D';
    var stockTxt   = stock === 0 ? 'Rupture' : stock < 5 ? 'Stock limité (' + stock + ')' : 'En stock';
    html += '<div style="background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<img loading="lazy" src="' + (p.img || 'https://picsum.photos/seed/auto' + p.id + '/300/200') + '" style="width:100%;height:130px;object-fit:cover" onerror="imgFallback(this)">';
    html += '<div style="padding:11px">';
    html += '<span style="background:#f3f4f6;color:#374151;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px">' + (p.cat||'') + '</span>';
    html += '<div style="font-weight:700;font-size:13px;margin:6px 0 4px;line-height:1.3">' + (p.nom||'') + '</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">';
    html += '<div style="font-size:17px;font-weight:800;color:#007A3D">' + (p.prix||0).toLocaleString('fr-FR') + ' F</div>';
    html += '<div style="font-size:10px;font-weight:700;color:' + stockColor + '">' + stockTxt + '</div>';
    html += '</div>';
    if (stock > 0) {
      html += '<button onclick="mktAddPanier({id:\'auto_' + (p.id||'') + '\',nom:\'' + (p.nom||'').replace(/'/g,'') + '\',prix:' + (p.prix||0) + ',img:\'' + (p.img||'https://picsum.photos/300/200') + '\',source:\'Automobile\',type:\'piece\'})" ';
      html += 'style="width:100%;background:#007A3D;color:#fff;border:none;padding:8px;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer;margin-top:6px">Commander</button>';
    }
    html += '</div></div>';
  });
  if (pieces.length === 0) {
    html += '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#999"><div style="font-size:40px;margin-bottom:10px">🔩</div><div>Aucune pièce trouvée</div></div>';
  }
  html += '</div>';
  el.innerHTML = html;
}

function renderMktAutoMecaniciens() {
  var el = document.getElementById('mkt-auto-content');
  if (!el) return;
  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px">';
  MKT_MECANICIENS.forEach(function(m) {
    html += '<div style="background:#fff;border-radius:14px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<div style="position:relative"><img loading="lazy" src="' + m.img + '" style="width:100%;height:160px;object-fit:cover" onerror="imgFallback(this)">';
    html += '<span style="position:absolute;top:10px;right:10px;background:' + (m.ouvert?'#007A3D':'#CE1126') + ';color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">' + (m.ouvert?'Ouvert':'Fermé') + '</span>';
    html += '</div>';
    html += '<div style="padding:14px">';
    html += '<div style="font-weight:800;font-size:15px;margin-bottom:3px">' + m.nom + '</div>';
    html += '<div style="font-size:12px;color:#007A3D;font-weight:600;margin-bottom:4px">' + m.specialite + '</div>';
    html += '<div style="font-size:11px;color:#666;margin-bottom:4px">Adresse: ' + m.quartier + ', ' + m.ville + '</div>';
    html += '<div style="font-size:11px;color:#666;margin-bottom:10px">Horaires: ' + m.horaires + ' — Note: ' + m.note + '/5</div>';
    html += '<div style="display:flex;gap:7px">';
    html += '<button onclick="ouvrirRdvMecanicien(\'' + m.id + '\',\'' + m.nom.replace(/'/g,'') + '\')" style="flex:2;background:#007A3D;color:#fff;border:none;padding:9px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer">Prendre RDV</button>';
    html += '<a href="https://wa.me/' + m.tel.replace(/[\s+\-]/g,'') + '" target="_blank" style="flex:1;background:#25D366;color:#fff;padding:9px;border-radius:10px;font-size:12px;font-weight:700;text-align:center;text-decoration:none">WhatsApp</a>';
    html += '</div></div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function ouvrirRdvAuto(svcId, svcNom, svcPrix) {
  document.getElementById('mkt-devis-titre').textContent = 'RDV Mecanicien — ' + svcNom;
  document.getElementById('mkt-devis-produit').value = svcNom;
  document.getElementById('mkt-devis-type').value = 'rdv_auto';
  var extra = document.getElementById('mkt-devis-extra');
  if (extra) {
    extra.innerHTML = '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Votre vehicule</label>'
      + '<input type="text" id="mkt-auto-vehicule" placeholder="Ex: Toyota Corolla 2018, blanche" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box;margin-bottom:8px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Garage prefere</label>'
      + '<select id="mkt-auto-garage" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;margin-bottom:8px">'
      + MKT_MECANICIENS.filter(function(m){return m.ouvert;}).map(function(m){ return '<option value="' + m.tel + '">' + m.nom + ' — ' + m.ville + '</option>'; }).join('')
      + '</select>'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Date souhaitee</label>'
      + '<input type="date" id="mkt-auto-date" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">';
  }
  openMkt('mkt-modal-devis');
}

function ouvrirRdvMecanicien(mecId, mecNom) {
  document.getElementById('mkt-devis-titre').textContent = 'RDV — ' + mecNom;
  document.getElementById('mkt-devis-produit').value = 'RDV garage: ' + mecNom;
  document.getElementById('mkt-devis-type').value = 'rdv_mecanicien';
  var extra = document.getElementById('mkt-devis-extra');
  if (extra) {
    extra.innerHTML = '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Votre vehicule</label>'
      + '<input type="text" id="mkt-rdv-vehicule" placeholder="Marque, modele, annee, couleur" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box;margin-bottom:8px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Service souhaite</label>'
      + '<select id="mkt-rdv-service" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;margin-bottom:8px">'
      + MKT_AUTO_SERVICES_LOCAL.map(function(s){ return '<option>' + s.nom + ' — ' + s.prix.toLocaleString('fr-FR') + ' FCFA</option>'; }).join('')
      + '</select>'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Date souhaitee</label>'
      + '<input type="date" id="mkt-rdv-date2" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">';
  }
  openMkt('mkt-modal-devis');
}

// Soumettre un RDV Auto → sauvegarde Supabase
async function soumettreRdvAutoMkt() {
  var nom     = (document.getElementById('mkt-nom')  ||{}).value||'';
  var tel     = (document.getElementById('mkt-tel')  ||{}).value||'';
  var svc     = (document.getElementById('mkt-devis-produit')||{}).value||'';
  var vehicule= (document.getElementById('mkt-auto-vehicule')||document.getElementById('mkt-rdv-vehicule')||{}).value||'';
  var garage  = (document.getElementById('mkt-auto-garage')  ||{}).value||'';
  var date    = (document.getElementById('mkt-auto-date')||document.getElementById('mkt-rdv-date2')||{}).value||'';

  if (!nom||!tel) { mktMsg('Nom et telephone requis','warn'); return; }

  var rdv = {
    id: 'RDV-MKT-' + Date.now(),
    client: nom, tel: tel, vehicule: vehicule,
    service: svc, service_id: '', prix: 0, duree: 60,
    date: date, heure: '08:00', notes: 'Via Marketplace',
    statut: 'en_attente'
  };

  // Sauvegarder dans Supabase
  try {
    var sb = _sbMkt();
    if (sb) {
      await sb.from('rdv_automobile').upsert({
        id: rdv.id, client: rdv.client, tel: rdv.tel,
        vehicule: rdv.vehicule, service: rdv.service,
        date: rdv.date, heure: rdv.heure,
        statut: rdv.statut, notes: rdv.notes
      });
    }
  } catch(e) { console.warn('[MktAuto] RDV Supabase:', e); }

  // WhatsApp vers le garage choisi
  var waNum = (garage || '+237677401001').replace(/[\s+\-]/g,'');
  var waTxt = 'Nouveau RDV SuperMarche CM\nClient: ' + nom + ' (' + tel + ')\nVehicule: ' + vehicule + '\nService: ' + svc + '\nDate: ' + date;
  window.open('https://wa.me/' + waNum + '?text=' + encodeURIComponent(waTxt), '_blank');

  closeMkt('mkt-modal-devis');
  mktMsg('RDV enregistre ! Le garage vous confirme sous 2h.', 'ok');
}

// ═══════════════════════════════════════════════════════════════
//  SECTION PRESSING — Dynamique Supabase + localStorage
//  Tarifs lus depuis PRESSING_TARIFS (espace gérant)
//  Depots sauvegardés dans pressing_commandes (Supabase)
//  Depots affichés et statut visible en temps réel
// ═══════════════════════════════════════════════════════════════

var MKT_PRESSING_TARIFS_LOCAL = [];
var MKT_PRESSING_POINTS = [
  { id:'pp1', nom:'Point Pressing Akwa',      ville:'Douala',  quartier:'Akwa',       tel:'+237 677 501 001', horaires:'07h-19h', collect:true,  img:'https://picsum.photos/seed/press01/400/200', note:4.8 },
  { id:'pp2', nom:'Pressing Central Bali',    ville:'Douala',  quartier:'Bali',        tel:'+237 677 501 002', horaires:'08h-18h', collect:true,  img:'https://picsum.photos/seed/press02/400/200', note:4.7 },
  { id:'pp3', nom:'Blanchisserie Bastos',     ville:'Yaoundé', quartier:'Bastos',      tel:'+237 677 501 003', horaires:'07h-20h', collect:true,  img:'https://picsum.photos/seed/press03/400/200', note:4.9 },
  { id:'pp4', nom:'Pressing Express Melen',   ville:'Yaoundé', quartier:'Melen',       tel:'+237 677 501 004', horaires:'08h-18h', collect:false, img:'https://picsum.photos/seed/press04/400/200', note:4.6 },
  { id:'pp5', nom:'Pressing Bonapriso',       ville:'Douala',  quartier:'Bonapriso',   tel:'+237 677 501 005', horaires:'08h-19h', collect:true,  img:'https://picsum.photos/seed/press05/400/200', note:4.7 },
];

async function chargerDonneesPressingMkt() {
  MKT_PRESSING_TARIFS_LOCAL = (typeof PRESSING_TARIFS !== 'undefined') ? PRESSING_TARIFS.slice() : [];
  try {
    var sb = _sbMkt();
    if (sb) {
      var r = await sb.from('pressing_tarifs_catalogue').select('*').eq('actif', true);
      if (r.data && r.data.length > 0) MKT_PRESSING_TARIFS_LOCAL = r.data;
    }
  } catch(e) {}
  if (MKT_PRESSING_TARIFS_LOCAL.length === 0 && typeof PRESSING_TARIFS !== 'undefined') {
    MKT_PRESSING_TARIFS_LOCAL = PRESSING_TARIFS.slice();
  }
}

function renderMktPressing() {
  var el = document.getElementById('mkt-pressing-content');
  if (!el) return;
  var tab = (document.getElementById('mkt-pressing-tab')||{}).value || 'tarifs';
  if (tab === 'tarifs')  renderMktPressingTarifs();
  else if (tab === 'depot') renderMktPressingDepot();
  else renderMktPressingPoints();
}

function renderMktPressingTarifs() {
  var el = document.getElementById('mkt-pressing-content');
  if (!el) return;

  var tarifs = MKT_PRESSING_TARIFS_LOCAL;
  var html = '';

  // Calculateur de prix
  html += '<div style="background:#f0faf5;border-radius:12px;padding:16px;margin-bottom:16px">';
  html += '<div style="font-weight:800;font-size:14px;margin-bottom:12px;color:#007A3D">Calculateur de prix</div>';
  html += '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">';
  html += '<select id="mkt-press-item" onchange="calculerPrixPressing()" style="flex:2;min-width:160px;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">';
  html += '<option value="">Choisir un article...</option>';
  tarifs.forEach(function(t) {
    var label = t.nom + (t.prix_piece > 0 ? ' — ' + t.prix_piece.toLocaleString('fr-FR') + ' F/pce' : ' — ' + t.prix_kilo.toLocaleString('fr-FR') + ' F/kg');
    html += '<option value="' + (t.prix_piece||0) + '_' + (t.prix_kilo||0) + '">' + label + '</option>';
  });
  html += '</select>';
  html += '<input type="number" id="mkt-press-qte" placeholder="Qte / Kg" min="1" step="0.5" oninput="calculerPrixPressing()" style="flex:1;min-width:100px;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">';
  html += '<div id="mkt-press-prix" style="font-size:20px;font-weight:800;color:#007A3D;min-width:120px;text-align:right">0 FCFA</div>';
  html += '</div></div>';

  // Tableau des tarifs
  html += '<div style="background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb">';
  html += '<table style="width:100%;border-collapse:collapse">';
  html += '<thead><tr style="background:#007A3D;color:#fff">';
  html += '<th style="padding:12px 16px;text-align:left;font-size:13px">Article</th>';
  html += '<th style="padding:12px;font-size:13px;text-align:center">Prix / piece</th>';
  html += '<th style="padding:12px;font-size:13px;text-align:center">Prix / kg</th>';
  html += '</tr></thead><tbody>';
  tarifs.forEach(function(t, i) {
    var rowBg = i % 2 === 0 ? '#fff' : '#f9fafb';
    html += '<tr style="background:' + rowBg + '">';
    html += '<td style="padding:12px 16px;font-weight:600;font-size:13px">' + (t.nom||'') + '</td>';
    html += '<td style="padding:12px;text-align:center;font-size:13px;color:' + (t.prix_piece > 0 ? '#007A3D' : '#ccc') + ';font-weight:' + (t.prix_piece > 0 ? '700' : '400') + '">';
    html += t.prix_piece > 0 ? t.prix_piece.toLocaleString('fr-FR') + ' FCFA' : '—';
    html += '</td>';
    html += '<td style="padding:12px;text-align:center;font-size:13px;color:' + (t.prix_kilo > 0 ? '#007A3D' : '#ccc') + ';font-weight:' + (t.prix_kilo > 0 ? '700' : '400') + '">';
    html += t.prix_kilo > 0 ? t.prix_kilo.toLocaleString('fr-FR') + ' FCFA/kg' : '—';
    html += '</td></tr>';
  });
  html += '</tbody></table></div>';

  html += '<div style="display:flex;gap:8px;margin-top:14px">';
  html += '<button onclick="document.getElementById(\'mkt-pressing-tab\').value=\'depot\';renderMktPressing()" style="flex:1;background:#007A3D;color:#fff;border:none;padding:12px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">Deposer mes vetements</button>';
  html += '<button onclick="document.getElementById(\'mkt-pressing-tab\').value=\'points\';renderMktPressing()" style="flex:1;background:#f0faf5;color:#007A3D;border:1.5px solid #007A3D;padding:12px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">Nos points de depot</button>';
  html += '</div>';

  el.innerHTML = html;
}

function calculerPrixPressing() {
  var item  = (document.getElementById('mkt-press-item')||{}).value || '';
  var qte   = parseFloat((document.getElementById('mkt-press-qte')||{}).value) || 0;
  var el    = document.getElementById('mkt-press-prix');
  if (!el) return;
  if (!item || !qte) { el.textContent = '0 FCFA'; return; }
  var parts  = item.split('_');
  var pPiece = parseFloat(parts[0]) || 0;
  var pKilo  = parseFloat(parts[1]) || 0;
  var prix   = pPiece > 0 ? pPiece * qte : pKilo * qte;
  el.textContent = prix.toLocaleString('fr-FR') + ' FCFA';
}

function renderMktPressingDepot() {
  var el = document.getElementById('mkt-pressing-content');
  if (!el) return;

  var tarifs = MKT_PRESSING_TARIFS_LOCAL;
  var html = '<div style="background:#fff;border-radius:14px;border:1.5px solid #e5e7eb;padding:20px">';
  html += '<div style="font-weight:800;font-size:16px;color:#007A3D;margin-bottom:4px">Nouveau depot pressing</div>';
  html += '<div style="font-size:12px;color:#666;margin-bottom:16px">Selectionnez vos articles, choisissez un point de depot — nous nous occupons du reste.</div>';

  // Articles à déposer
  html += '<div style="font-weight:700;font-size:13px;margin-bottom:8px">Vos articles</div>';
  html += '<div id="mkt-press-articles">';
  html += '<div class="mkt-press-row" style="display:flex;gap:8px;align-items:center;margin-bottom:8px">';
  html += '<select class="mkt-press-sel" style="flex:3;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">';
  html += tarifs.map(function(t){
    var type = t.prix_piece > 0 ? 'piece' : 'kilo';
    return '<option value="' + t.id + '_' + (t.prix_piece||t.prix_kilo) + '_' + type + '">' + t.nom + '</option>';
  }).join('');
  html += '</select>';
  html += '<input type="number" class="mkt-press-nb" value="1" min="1" placeholder="Qte" style="width:70px;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;text-align:center">';
  html += '</div></div>';
  html += '<button onclick="ajouterArticlePressing()" style="margin-bottom:16px;background:#f0faf5;color:#007A3D;border:1.5px solid #007A3D;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">+ Ajouter un article</button>';

  // Options
  html += '<div style="font-weight:700;font-size:13px;margin-bottom:8px">Point de depot</div>';
  html += '<select id="mkt-press-point" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;margin-bottom:10px">';
  MKT_PRESSING_POINTS.forEach(function(p){
    html += '<option value="' + p.tel + '">' + p.nom + ' — ' + p.quartier + ', ' + p.ville + '</option>';
  });
  html += '</select>';
  html += '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-bottom:12px">';
  html += '<input type="checkbox" id="mkt-press-collect"> Collecte a domicile (+1 000 FCFA)</label>';
  html += '<div style="font-weight:700;font-size:13px;margin-bottom:4px">Votre nom *</div>';
  html += '<input type="text" id="mkt-press-client" placeholder="Nom complet" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box;margin-bottom:8px">';
  html += '<div style="font-weight:700;font-size:13px;margin-bottom:4px">Telephone *</div>';
  html += '<input type="tel" id="mkt-press-tel" placeholder="+237 6XX XX XX XX" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box;margin-bottom:16px">';

  html += '<div id="mkt-press-total" style="font-size:18px;font-weight:800;color:#007A3D;margin-bottom:12px;text-align:right">Total: 0 FCFA</div>';
  html += '<button onclick="soumettreDepotPressing()" style="width:100%;background:#007A3D;color:#fff;border:none;padding:14px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer">Valider mon depot</button>';
  html += '</div>';
  el.innerHTML = html;
}

function ajouterArticlePressing() {
  var container = document.getElementById('mkt-press-articles');
  if (!container) return;
  var tarifs = MKT_PRESSING_TARIFS_LOCAL;
  var row = document.createElement('div');
  row.className = 'mkt-press-row';
  row.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:8px';
  var opts = tarifs.map(function(t){
    var tp = t.prix_piece > 0 ? 'piece' : 'kilo';
    return '<option value="' + t.id + '_' + (t.prix_piece||t.prix_kilo) + '_' + tp + '">' + t.nom + '</option>';
  }).join('');
  row.innerHTML = '<select class="mkt-press-sel" style="flex:3;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">' + opts + '</select>'
    + '<input type="number" class="mkt-press-nb" value="1" min="1" style="width:70px;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;text-align:center">'
    + '<button onclick="this.parentElement.remove()" style="background:#fee2e2;color:#CE1126;border:none;padding:9px 12px;border-radius:8px;font-size:13px;cursor:pointer;font-weight:700">X</button>';
  container.appendChild(row);
}

async function soumettreDepotPressing() {
  var client  = (document.getElementById('mkt-press-client')||{}).value||'';
  var tel     = (document.getElementById('mkt-press-tel')||{}).value||'';
  var point   = (document.getElementById('mkt-press-point')||{}).value||'';
  var collect = document.getElementById('mkt-press-collect') && document.getElementById('mkt-press-collect').checked;

  if (!client||!tel) { mktMsg('Nom et telephone requis','warn'); return; }

  // Calculer les articles
  var pieces = [];
  var total  = 0;
  document.querySelectorAll('.mkt-press-row').forEach(function(row) {
    var sel = row.querySelector('.mkt-press-sel');
    var nb  = row.querySelector('.mkt-press-nb');
    if (!sel||!nb) return;
    var parts = sel.value.split('_');
    var tarif = PRESSING_TARIFS ? PRESSING_TARIFS.find(function(t){return t.id===parts[0];})||null : null;
    var prix  = parseFloat(parts[1])||0;
    var qte   = parseFloat(nb.value)||1;
    var ligne = { article: sel.options[sel.selectedIndex].text, qte: qte, prix_unit: prix, sous_total: prix*qte };
    pieces.push(ligne);
    total += prix * qte;
  });
  if (collect) total += 1000;
  if (pieces.length === 0) { mktMsg('Ajoutez au moins un article','warn'); return; }

  var cmd = {
    id: 'PRESS-MKT-' + Date.now(),
    client: client, tel: tel,
    pieces: pieces, total: total,
    livraison: collect, statut: 'depose',
    notes: 'Depot via Marketplace. Point: ' + point,
    date_depot: new Date().toISOString().split('T')[0]
  };

  // Sauvegarder dans Supabase
  try {
    var sb = _sbMkt();
    if (sb) {
      await sb.from('pressing_commandes').upsert({
        id: cmd.id, client: cmd.client, tel: cmd.tel,
        pieces: JSON.stringify(cmd.pieces), total: cmd.total,
        livraison: cmd.livraison, statut: cmd.statut,
        notes: cmd.notes, date_depot: cmd.date_depot
      });
    }
  } catch(e) { console.warn('[MktPress] Supabase:', e); }

  // WhatsApp vers le pressing choisi
  var waTxt = 'Nouveau depot pressing SuperMarche CM\nRef: ' + cmd.id + '\nClient: ' + client + ' (' + tel + ')'
    + '\nArticles: ' + pieces.map(function(p){ return p.qte + 'x ' + p.article; }).join(', ')
    + '\nTotal: ' + total.toLocaleString('fr-FR') + ' FCFA'
    + (collect ? '\nCollecte a domicile demandee' : '');
  window.open('https://wa.me/' + (point||'237677501001').replace(/[\s+\-]/g,'') + '?text=' + encodeURIComponent(waTxt), '_blank');

  closeMkt('mkt-modal-devis');
  mktMsg('Depot enregistre ! Reference: ' + cmd.id + '. Delai 48h.', 'ok');
}

function renderMktPressingPoints() {
  var el = document.getElementById('mkt-pressing-content');
  if (!el) return;
  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">';
  MKT_PRESSING_POINTS.forEach(function(p) {
    html += '<div style="background:#fff;border-radius:14px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<div style="position:relative"><img loading="lazy" src="' + p.img + '" style="width:100%;height:150px;object-fit:cover" onerror="imgFallback(this)">';
    html += '<span style="position:absolute;top:10px;right:10px;background:' + (p.collect?'#007A3D':'#f59e0b') + ';color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">' + (p.collect?'Collecte dispo':'Depot uniquement') + '</span>';
    html += '</div>';
    html += '<div style="padding:14px">';
    html += '<div style="font-weight:800;font-size:15px;margin-bottom:3px">' + p.nom + '</div>';
    html += '<div style="font-size:12px;color:#555;margin-bottom:3px">Adresse: ' + p.quartier + ', ' + p.ville + '</div>';
    html += '<div style="font-size:12px;color:#555;margin-bottom:3px">Horaires: ' + p.horaires + '</div>';
    html += '<div style="font-size:12px;color:#f59e0b;font-weight:600;margin-bottom:10px">Note: ' + p.note + '/5</div>';
    html += '<div style="display:flex;gap:7px">';
    html += '<a href="tel:' + p.tel + '" style="flex:1;background:#007A3D;color:#fff;padding:9px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;text-align:center">Appeler</a>';
    html += '<a href="https://wa.me/' + p.tel.replace(/[\s+\-]/g,'') + '" target="_blank" style="flex:1;background:#25D366;color:#fff;padding:9px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;text-align:center">WhatsApp</a>';
    html += '</div></div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════
//  SYNCHRONISATION TEMPS REEL — Espace Gerant -> Marketplace
//  Toutes les sections reliees a Supabase
// ═══════════════════════════════════════════════════════════════

// Rechargement marketplace quand le gérant modifie les données
async function rafraichirMktDepuisGerant() {
  await chargerDonneesAutoMkt();
  await chargerDonneesPressingMkt();
  var tab = document.querySelector('.mkt-tab-btn.active');
  if (tab) {
    var tabId = tab.id ? tab.id.replace('tab-','') : '';
    if (tabId === 'automobile') renderMktAutomobile();
    if (tabId === 'pressing')   renderMktPressing();
  }
}

// Ecouter les changements localStorage (sync entre espace gérant et boutique)
window.addEventListener('storage', function(e) {
  var mktKeys = ['sm_auto_updated','sm_pressing_updated','sm_agri_updated',
                 'sm_energie_updated','sm_immo_updated','sm_btp_updated'];
  if (mktKeys.includes(e.key)) {
    rafraichirMktDepuisGerant();
  }
});

