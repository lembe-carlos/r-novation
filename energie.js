
function _sbdevisenergie() {
  if (typeof window.supabase === 'undefined') return null;
  try { return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key); } catch(e) { return null; }
}
async function syncdevisenergieSupabase(item) {
  try {
    var sb = _sbdevisenergie(); if (!sb) return;
    var row = { id: item.id, client: item.client||item.patient||item.nom||'', tel: item.tel||'', statut: item.statut||'nouveau' };
    if (item.medecin) row.medecin = item.medecin;
    if (item.date)    row.date    = item.date;
    if (item.heure)   row.heure   = item.heure;
    if (item.prix)    row.prix    = item.prix;
    if (item.motif)   row.motif   = item.motif;
    if (item.matiere) row.matiere = item.matiere;
    if (item.duree)   row.duree   = item.duree;
    if (item.niveau)  row.niveau  = item.niveau;
    if (item.description) row.description = item.description;
    if (item.solution)    row.solution    = item.solution;
    if (item.budget)      row.budget      = item.budget;
    await sb.from('sm_devis_energie').upsert(row, { onConflict: 'id' });
  } catch(e) { console.warn('[sm_devis_energie] sync:', e); }
}
async function chargerdevisenergieSupabase() {
  try {
    var sb = _sbdevisenergie(); if (!sb) return;
    var res = await sb.from('sm_devis_energie').select('*').order('created_at', { ascending: false });
    if (res.data && res.data.length > 0) {
      var saved = JSON.parse(localStorage.getItem('sm_energie') || '{}');
      var liste = saved.rdv || saved.devis || saved.commandes || [];
      res.data.forEach(function(r) {
        if (!liste.find(function(x){ return x.id === r.id; })) liste.unshift(r);
      });
      localStorage.setItem('sm_energie', JSON.stringify(saved));
    }
  } catch(e) { console.warn('[sm_devis_energie] charger:', e); }
}
// ═══════════════════════════════════════════════════════
//  SuperMarché CM — energie.js
//  Énergie & Électricité : Produits + Installation + Devis
// ═══════════════════════════════════════════════════════

var ENERGIE_PRODUITS = [
  // SOLAIRE
  { id:'e1',  nom:'Panneau solaire 100W monocristallin', cat:'Solaire', prix:65000,  stock:15, unite:'pièce', desc:'Panneau haute efficacité pour usage résidentiel', img:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=250&fit=crop' },
  { id:'e2',  nom:'Panneau solaire 200W monocristallin', cat:'Solaire', prix:120000, stock:10, unite:'pièce', desc:'Idéal pour maison ou bureau', img:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=250&fit=crop' },
  { id:'e3',  nom:'Batterie solaire 100Ah 12V',          cat:'Solaire', prix:85000,  stock:8,  unite:'pièce', desc:'Batterie AGM longue durée', img:'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=250&fit=crop' },
  { id:'e4',  nom:'Batterie solaire 200Ah 12V',          cat:'Solaire', prix:150000, stock:5,  unite:'pièce', desc:'Grande capacité pour maison', img:'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=250&fit=crop' },
  { id:'e5',  nom:'Régulateur solaire MPPT 30A',         cat:'Solaire', prix:35000,  stock:12, unite:'pièce', desc:'Régulateur intelligent haute efficacité', img:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop' },
  { id:'e6',  nom:'Onduleur solaire 1000W',              cat:'Solaire', prix:55000,  stock:8,  unite:'pièce', desc:'Onduleur pur sinus 1KVA', img:'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=250&fit=crop' },
  { id:'e7',  nom:'Kit solaire complet 300W maison',     cat:'Solaire', prix:350000, stock:3,  unite:'kit',   desc:'3 panneaux + batterie + régulateur + onduleur', img:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=250&fit=crop' },
  // GROUPES ÉLECTROGÈNES
  { id:'e8',  nom:'Groupe électrogène 2.5KVA essence',   cat:'Groupe électrogène', prix:185000, stock:5, unite:'pièce', desc:'Générateur silencieux usage domestique', img:'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=400&h=250&fit=crop' },
  { id:'e9',  nom:'Groupe électrogène 5KVA essence',     cat:'Groupe électrogène', prix:320000, stock:3, unite:'pièce', desc:'Pour maisons et petits commerces', img:'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=400&h=250&fit=crop' },
  { id:'e10', nom:'Groupe électrogène 10KVA diesel',     cat:'Groupe électrogène', prix:750000, stock:2, unite:'pièce', desc:'Usage commercial et industriel', img:'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=400&h=250&fit=crop' },
  // ONDULEURS & STABILISATEURS
  { id:'e11', nom:'Onduleur UPS 650VA',                  cat:'Onduleurs', prix:35000,  stock:20, unite:'pièce', desc:'Protection PC et équipements électroniques', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop' },
  { id:'e12', nom:'Onduleur UPS 1500VA',                 cat:'Onduleurs', prix:65000,  stock:10, unite:'pièce', desc:'Pour bureau et petite entreprise', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop' },
  { id:'e13', nom:'Stabilisateur 5KVA automatique',      cat:'Onduleurs', prix:45000,  stock:15, unite:'pièce', desc:'Protection contre les surtensions', img:'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=120&h=120&fit=crop' },
  // ÉCLAIRAGE
  { id:'e14', nom:'Ampoule LED 12W E27',                 cat:'Éclairage', prix:1500,   stock:200, unite:'pièce', desc:'Ampoule économique longue durée', img:'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=120&h=120&fit=crop' },
  { id:'e15', nom:'Ampoule LED solaire rechargeable',    cat:'Éclairage', prix:8500,   stock:50,  unite:'pièce', desc:'Fonctionne sans courant ENEO', img:'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=120&h=120&fit=crop' },
  { id:'e16', nom:'Réglette LED 60cm 18W',               cat:'Éclairage', prix:5500,   stock:40,  unite:'pièce', desc:'Éclairage bureau et commerce', img:'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=120&h=120&fit=crop' },
  // CLIMATISATION
  { id:'e17', nom:'Climatiseur split 1CV Gree',          cat:'Climatisation', prix:185000, stock:5, unite:'pièce', desc:'Pompe à chaleur réversible', img:'https://images.unsplash.com/photo-1544724107-6d5e7f0e9e45?w=120&h=120&fit=crop' },
  { id:'e18', nom:'Climatiseur split 1.5CV Samsung',     cat:'Climatisation', prix:250000, stock:3, unite:'pièce', desc:'Inverter économique A++', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop' },
  { id:'e19', nom:'Ventilateur colonne 45W',             cat:'Climatisation', prix:18000,  stock:20, unite:'pièce', desc:'3 vitesses, silencieux', img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop' },
  // CÂBLES & MATÉRIEL
  { id:'e20', nom:'Câble électrique 2.5mm² x100m',       cat:'Câblage', prix:45000,  stock:10, unite:'rouleau', desc:'Câble HO7VVF 2x2.5mm', img:'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=120&h=120&fit=crop' },
  { id:'e21', nom:'Disjoncteur 16A',                     cat:'Câblage', prix:3500,   stock:50, unite:'pièce',   desc:'Protection circuit domestique', img:'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=120&h=120&fit=crop' },
  { id:'e22', nom:'Multiprise parafoudre 5 prises',      cat:'Câblage', prix:8500,   stock:30, unite:'pièce',   desc:'Protection surtension avec USB', img:'https://images.unsplash.com/photo-1544724107-6d5e7f0e9e45?w=120&h=120&fit=crop' },
];

var DEVIS_ENERGIE = [];
var energie_seq = 1;

function initEnergie() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_energie') || '{}');
    if (saved.devis) DEVIS_ENERGIE = saved.devis;
    if (saved.seq)   energie_seq = saved.seq;
  } catch(e) { DEVIS_ENERGIE = []; }
}

function saveEnergie() {
  try { localStorage.setItem('sm_energie', JSON.stringify({ devis: DEVIS_ENERGIE, seq: energie_seq })); } catch(e) {}
}

function creerDevisEnergie() {
  var client  = (document.getElementById('enrg-client')  || {}).value || '';
  var tel     = (document.getElementById('enrg-tel')     || {}).value || '';
  var besoin  = (document.getElementById('enrg-besoin')  || {}).value || '';
  var type    = (document.getElementById('enrg-type')    || {}).value || '';
  var budget  = parseInt((document.getElementById('enrg-budget') || {}).value) || 0;

  if (!client) { toast('Nom requis', 'warning'); return; }
  if (!tel)    { toast('Téléphone requis', 'warning'); return; }
  if (!besoin) { toast('Décrivez votre besoin', 'warning'); return; }

  var dv = {
    id:      'ENRG-' + String(energie_seq++).padStart(3,'0'),
    client:  client, tel: tel, besoin: besoin, type: type, budget: budget,
    statut:  'nouveau', reponse: '', prix_propose: 0,
    cree_le: new Date().toISOString()
  };
  DEVIS_ENERGIE.unshift(dv);
  saveEnergie();
  closeM('m-devis-energie');
  renderDevisEnergie();
  toast('Devis ' + dv.id + ' créé !', 'success');
  addNotif('Nouveau devis énergie : ' + client, 'green');
  envoyerSMSEnergie('nouveau', dv);
  ['enrg-client','enrg-tel','enrg-besoin','enrg-budget'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value='';
  });
}

function envoyerSMSEnergie(type, dv) {
  if (!dv.tel) return;
  var msgs = {
    nouveau:      'Bonjour ' + dv.client + ', votre demande de devis énergie ' + dv.id + ' a été reçue. Nous vous répondons sous 24h. SuperMarché CM Énergie',
    devis_envoye: 'Bonjour ' + dv.client + ', votre devis énergie ' + dv.id + ' est prêt ! ' + dv.reponse + ' — Prix : ' + (dv.prix_propose||0).toLocaleString('fr-FR') + ' FCFA. SuperMarché CM',
    accepte:      'Bonjour ' + dv.client + ', votre devis ' + dv.id + ' est accepté. Notre équipe vous contacte pour planifier l\'installation. SuperMarché CM',
    installe:     'Bonjour ' + dv.client + ', votre installation énergie ' + dv.id + ' est terminée ! Merci pour votre confiance. SuperMarché CM'
  };
  var msg = msgs[type]; if (!msg) return;
  fetch((typeof BACKEND!=='undefined'?BACKEND:'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ tel: dv.tel.replace(/[\s+]/g,''), message: msg })
  }).catch(function(e){ console.warn('SMS energie:', e); });
}

function changerStatutDevisEnergie(id, statut) {
  var dv = DEVIS_ENERGIE.find(function(d){ return d.id===id; });
  if (!dv) return;
  if (statut === 'devis_envoye') {
    dv.reponse     = prompt('Votre proposition :') || '';
    dv.prix_propose= parseFloat(prompt('Prix (FCFA) :')) || 0;
  }
  dv.statut = statut;
  saveEnergie();
  renderDevisEnergie();
  envoyerSMSEnergie(statut, dv);
  toast(id + ' — ' + statut, 'success');
}

function renderCatalogueEnergie() {
  var grid = document.getElementById('energie-catalogue');
  if (!grid) return;
  var filtre = (document.getElementById('enrg-cat-filtre') || {}).value || '';
  var srch   = ((document.getElementById('enrg-search') || {}).value || '').toLowerCase();
  var prods  = ENERGIE_PRODUITS.filter(function(p){
    return (!filtre || p.cat === filtre) && (!srch || p.nom.toLowerCase().includes(srch));
  });
  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">'
    + prods.map(function(p) {
        var stCls = p.stock===0?'bgr':p.stock<5?'bgy':'bgg';
        var stLbl = p.stock===0?'Rupture':p.stock<5?'Faible':'Dispo';
        return '<div class="cd">'
          + '<img loading="lazy" src="' + p.img + '" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px">'
          + '<div style="display:flex;justify-content:space-between;margin-bottom:4px">'
          + '<span style="font-size:10px;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:20px;font-weight:700">' + p.cat + '</span>'
          + '<span class="badge ' + stCls + '" style="font-size:10px">' + stLbl + '</span>'
          + '</div>'
          + '<div style="font-weight:700;font-size:13px;margin-bottom:3px">' + p.nom + '</div>'
          + '<div style="font-size:11px;color:#666;margin-bottom:6px">' + p.desc + '</div>'
          + '<div style="font-size:16px;font-weight:800;color:#007A3D">' + p.prix.toLocaleString('fr-FR') + ' FCFA<span style="font-size:11px;color:#999;font-weight:400"> / ' + p.unite + '</span></div>'
          + '<button class="btn bp bsm" style="width:100%;margin-top:8px" onclick="demanderDevisEnergieProduit(\'' + p.id + '\')">Devis installation</button>'
          + '</div>';
      }).join('')
    + '</div>';
}

function demanderDevisEnergieProduit(prodId) {
  var prod = ENERGIE_PRODUITS.find(function(p){ return p.id === prodId; });
  if (!prod) return;
  var besoin = document.getElementById('enrg-besoin');
  var type   = document.getElementById('enrg-type');
  if (besoin) besoin.value = 'Je souhaite acquérir et installer : ' + prod.nom;
  if (type)   type.value   = prod.cat;
  openM('m-devis-energie');
}

function renderDevisEnergie() {
  var liste = document.getElementById('energie-devis-liste');
  if (!liste) return;
  if (DEVIS_ENERGIE.length === 0) {
    liste.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucun devis</p>'; return;
  }
  var stMap = {
    nouveau:      ['Nouveau',      '#3b82f6','#dbeafe'],
    devis_envoye: ['Devis envoyé', '#8b5cf6','#ede9fe'],
    accepte:      ['Accepté',      '#007A3D','#dcfce7'],
    installe:     ['Installé',     '#6b7280','#f3f4f6'],
    refuse:       ['Refusé',       '#CE1126','#fee2e2'],
  };
  liste.innerHTML = DEVIS_ENERGIE.slice(0,20).map(function(d) {
    var st = stMap[d.statut] || ['—','#999','#f9fafb'];
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">'
      + '<div><span style="font-weight:800;color:#007A3D">' + d.id + '</span>'
      + ' <span style="font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;background:' + st[2] + ';color:' + st[1] + '">' + st[0] + '</span>'
      + '<div style="font-weight:700;margin-top:4px">' + d.client + ' — ' + d.tel + '</div>'
      + '<div style="font-size:13px;color:#555;font-style:italic">"' + d.besoin + '"</div>'
      + (d.type ? '<div style="font-size:12px;color:#f59e0b;font-weight:600">Type : ' + d.type + '</div>' : '')
      + (d.budget > 0 ? '<div style="font-size:12px;color:#007A3D">Budget : ' + d.budget.toLocaleString('fr-FR') + ' FCFA</div>' : '')
      + '</div>'
      + (d.prix_propose > 0 ? '<div style="font-size:18px;font-weight:800;color:#007A3D">' + d.prix_propose.toLocaleString('fr-FR') + ' FCFA</div>' : '')
      + '</div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">'
      + (d.statut==='nouveau'      ? '<button class="btn bp bsm" onclick="changerStatutDevisEnergie(\''+d.id+'\',\'devis_envoye\')">Envoyer devis</button>' : '')
      + (d.statut==='devis_envoye' ? '<button class="btn bp bsm" onclick="changerStatutDevisEnergie(\''+d.id+'\',\'accepte\')">Accepté</button>' : '')
      + (d.statut==='accepte'      ? '<button class="btn bp bsm" onclick="changerStatutDevisEnergie(\''+d.id+'\',\'installe\')">Installé</button>' : '')
      + (d.statut!=='installe'&&d.statut!=='refuse' ? '<button class="btn bd bsm" onclick="changerStatutDevisEnergie(\''+d.id+'\',\'refuse\')">Refuser</button>' : '')
      + '<a href="https://wa.me/' + d.tel.replace(/[\s+\-]/g,'') + '?text=' + encodeURIComponent('Bonjour ' + d.client + ', concernant votre devis énergie ' + d.id + ' :') + '" target="_blank" class="btn bo bsm">WhatsApp</a>'
      + '</div></div>';
  }).join('');
}

function initPageEnergie() {
  initEnergie();
  renderCatalogueEnergie();
  renderDevisEnergie();
}

// ═══════════════════════════════════════════════════════
//  SIMULATEUR KIT SOLAIRE
// ═══════════════════════════════════════════════════════

var APPAREILS_SOLAIRE = [
  { nom:'Ampoule LED 12W',        puissance:12,  label:'Ampoule LED' },
  { nom:'Ventilateur 45W',        puissance:45,  label:'Ventilateur' },
  { nom:'Télévision 32 pouces',   puissance:60,  label:'TV 32"' },
  { nom:'Réfrigérateur 150L',     puissance:150, label:'Frigo 150L' },
  { nom:'Ordinateur portable',    puissance:65,  label:'PC portable' },
  { nom:'Chargeur téléphone',     puissance:10,  label:'Chargeur tél.' },
  { nom:'Décodeur TV',            puissance:25,  label:'Décodeur' },
  { nom:'Perceuse électrique',    puissance:500, label:'Perceuse' },
  { nom:'Micro-ondes',            puissance:800, label:'Micro-ondes' },
  { nom:'Climatiseur 1CV',        puissance:750, label:'Clim 1CV' },
];

function calculerKitSolaire() {
  var heures = parseFloat((document.getElementById('sim-heures') || {}).value) || 8;
  var total_wh = 0;
  var liste_appareils = [];

  APPAREILS_SOLAIRE.forEach(function(app) {
    var qteEl = document.getElementById('sim-app-' + app.nom.replace(/[\s'"]/g,'_'));
    var qte = parseInt((qteEl || {}).value) || 0;
    if (qte > 0) {
      var wh = app.puissance * qte * heures;
      total_wh += wh;
      liste_appareils.push({ nom: app.label, qte: qte, puissance: app.puissance * qte, wh: wh });
    }
  });

  if (total_wh === 0) { toast('Ajoutez au moins un appareil', 'warning'); return; }

  // Calculs avec marge 20% et pertes 25%
  var wh_total_avec_pertes = total_wh * 1.25;
  var nb_panneaux_200w = Math.ceil(wh_total_avec_pertes / (200 * 5)); // 5h d'ensoleillement/jour
  var batterie_ah = Math.ceil(wh_total_avec_pertes / 12 * 1.2); // 12V avec marge
  var puissance_onduleur = Math.ceil(liste_appareils.reduce(function(s,a){ return s+a.puissance; },0) * 1.25 / 100) * 100;

  // Trouver les produits correspondants
  var prix_panneaux = nb_panneaux_200w * 120000;
  var prix_batterie = Math.ceil(batterie_ah / 100) * 85000;
  var prix_regulateur = 35000;
  var prix_onduleur = puissance_onduleur <= 1000 ? 55000 : puissance_onduleur <= 2000 ? 95000 : 150000;
  var prix_total = prix_panneaux + prix_batterie + prix_regulateur + prix_onduleur;

  var result = document.getElementById('sim-result');
  if (!result) return;

  result.innerHTML = '<div style="background:#f0faf5;border-radius:16px;padding:20px;margin-top:16px">'
    + '<div style="font-weight:800;font-size:16px;color:#007A3D;margin-bottom:12px">Résultat de la simulation</div>'
    + '<div style="background:#fff;border-radius:10px;padding:12px;margin-bottom:12px">'
    + '<div style="font-size:13px;color:#666;margin-bottom:8px">Appareils sélectionnés :</div>'
    + liste_appareils.map(function(a){ return '<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0"><span>' + a.qte + 'x ' + a.nom + '</span><span>' + a.puissance + 'W · ' + a.wh.toLocaleString('fr-FR') + ' Wh</span></div>'; }).join('')
    + '<div style="border-top:1px solid #e5e7eb;margin-top:8px;padding-top:8px;font-weight:700;display:flex;justify-content:space-between"><span>Total consommation</span><span>' + total_wh.toLocaleString('fr-FR') + ' Wh/jour</span></div>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">'
    + '<div class="cd" style="text-align:center;padding:12px"><div style="font-size:22px;font-weight:800;color:#007A3D">' + nb_panneaux_200w + '</div><div style="font-size:12px;color:#666">Panneaux 200W nécessaires</div></div>'
    + '<div class="cd" style="text-align:center;padding:12px"><div style="font-size:22px;font-weight:800;color:#007A3D">' + batterie_ah + ' Ah</div><div style="font-size:12px;color:#666">Capacité batterie 12V</div></div>'
    + '<div class="cd" style="text-align:center;padding:12px"><div style="font-size:22px;font-weight:800;color:#007A3D">30A</div><div style="font-size:12px;color:#666">Régulateur MPPT</div></div>'
    + '<div class="cd" style="text-align:center;padding:12px"><div style="font-size:22px;font-weight:800;color:#007A3D">' + puissance_onduleur + 'W</div><div style="font-size:12px;color:#666">Puissance onduleur</div></div>'
    + '</div>'
    + '<div style="background:#007A3D;color:#fff;border-radius:12px;padding:16px;text-align:center">'
    + '<div style="font-size:14px;margin-bottom:4px">Investissement estimé</div>'
    + '<div style="font-size:28px;font-weight:800">' + prix_total.toLocaleString('fr-FR') + ' FCFA</div>'
    + '<div style="font-size:12px;opacity:0.8">Matériel + installation incluse</div>'
    + '</div>'
    + '<button class="btn bp" style="width:100%;margin-top:12px" onclick="openM(\'m-devis-energie\')">Demander un devis d\'installation</button>'
    + '</div>';
}

function renderSimulateurSolaire() {
  var container = document.getElementById('simulateur-solaire');
  if (!container) return;
  container.innerHTML = '<div class="cd" style="margin-bottom:16px">'
    + '<div class="ch"><div class="ct">Simulateur kit solaire</div></div>'
    + '<div style="margin-top:12px">'
    + '<div style="margin-bottom:12px">'
    + '<label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">Heures d\'utilisation par jour</label>'
    + '<input type="number" id="sim-heures" value="8" min="1" max="24" style="padding:8px 12px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;width:120px">'
    + '</div>'
    + '<div style="font-size:13px;font-weight:600;margin-bottom:10px">Vos appareils électriques :</div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-bottom:16px">'
    + APPAREILS_SOLAIRE.map(function(app) {
        var safeId = 'sim-app-' + app.nom.replace(/[\s\'"]/g,'_');
        return '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#f9fafb;border-radius:8px">'
          + '<div><div style="font-size:13px;font-weight:600">' + app.label + '</div><div style="font-size:11px;color:#999">' + app.puissance + 'W</div></div>'
          + '<input type="number" id="' + safeId + '" value="0" min="0" max="20" style="width:55px;padding:6px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;text-align:center">'
          + '</div>';
      }).join('')
    + '</div>'
    + '<button class="btn bp" style="width:100%" onclick="calculerKitSolaire()">Calculer mon kit solaire</button>'
    + '<div id="sim-result"></div>'
    + '</div></div>';
}

var _initPageEnergieOrig = initPageEnergie;
initPageEnergie = function() {
  initEnergie();
  renderCatalogueEnergie();
  renderDevisEnergie();
  renderSimulateurSolaire();
};
