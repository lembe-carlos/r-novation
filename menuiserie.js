// ═══════════════════════════════════════════════════════
//  SuperMarché CM — menuiserie.js
//  Menuiserie & Bois : Produits + Devis sur mesure + Suivi
// ═══════════════════════════════════════════════════════

// ── Catalogue produits menuiserie ──
var MENUISERIE_PRODUITS = [
  // BOIS & PANNEAUX
  { id:'mb1',  nom:'Contreplaqué Okoumé 5mm',   cat:'Panneaux',    sous_cat:'Contreplaqué', prix:8500,   unite:'feuille', dimensions:'2440x1220mm', matiere:'Okoumé',      epaisseur:'5mm',  couleurs:['naturel'],                    stock:30, img:'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=400&h=250&fit=crop' },
  { id:'mb2',  nom:'Contreplaqué Okoumé 12mm',  cat:'Panneaux',    sous_cat:'Contreplaqué', prix:14000,  unite:'feuille', dimensions:'2440x1220mm', matiere:'Okoumé',      epaisseur:'12mm', couleurs:['naturel'],                    stock:25, img:'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=400&h=250&fit=crop' },
  { id:'mb3',  nom:'Contreplaqué Okoumé 18mm',  cat:'Panneaux',    sous_cat:'Contreplaqué', prix:18000,  unite:'feuille', dimensions:'2440x1220mm', matiere:'Okoumé',      epaisseur:'18mm', couleurs:['naturel'],                    stock:20, img:'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=400&h=250&fit=crop' },
  { id:'mb4',  nom:'MDF 16mm',                  cat:'Panneaux',    sous_cat:'MDF',          prix:16000,  unite:'feuille', dimensions:'2440x1220mm', matiere:'MDF',         epaisseur:'16mm', couleurs:['blanc','gris','naturel'],      stock:15, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop' },
  { id:'mb5',  nom:'MDF 18mm',                  cat:'Panneaux',    sous_cat:'MDF',          prix:20000,  unite:'feuille', dimensions:'2440x1220mm', matiere:'MDF',         epaisseur:'18mm', couleurs:['blanc','gris','naturel'],      stock:12, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop' },
  { id:'mb6',  nom:'Planche Iroko 3m',          cat:'Bois massif', sous_cat:'Planches',     prix:12000,  unite:'pièce',   dimensions:'3000x200mm',  matiere:'Iroko',       epaisseur:'25mm', couleurs:['naturel'],                    stock:40, img:'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop' },
  { id:'mb7',  nom:'Planche Sapelli 3m',        cat:'Bois massif', sous_cat:'Planches',     prix:15000,  unite:'pièce',   dimensions:'3000x200mm',  matiere:'Sapelli',     epaisseur:'25mm', couleurs:['naturel'],                    stock:30, img:'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop' },
  { id:'mb8',  nom:'Lambourde pin 3m',          cat:'Bois massif', sous_cat:'Lambourdes',   prix:3500,   unite:'pièce',   dimensions:'3000x45mm',   matiere:'Pin',         epaisseur:'45mm', couleurs:['naturel'],                    stock:80, img:'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop' },
  // MEUBLES
  { id:'mm1',  nom:'Lit 1 place sur mesure',    cat:'Meubles',     sous_cat:'Lits',         prix:85000,  unite:'pièce',   dimensions:'Sur mesure',  matiere:'Contreplaqué',epaisseur:'18mm', couleurs:['blanc','chêne','noyer','wengé'], stock:5, img:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=250&fit=crop' },
  { id:'mm2',  nom:'Lit 2 places sur mesure',   cat:'Meubles',     sous_cat:'Lits',         prix:150000, unite:'pièce',   dimensions:'Sur mesure',  matiere:'Contreplaqué',epaisseur:'18mm', couleurs:['blanc','chêne','noyer','wengé'], stock:3, img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=250&fit=crop' },
  { id:'mm3',  nom:'Armoire 3 portes',          cat:'Meubles',     sous_cat:'Armoires',     prix:180000, unite:'pièce',   dimensions:'Sur mesure',  matiere:'MDF',         epaisseur:'18mm', couleurs:['blanc','gris','chêne'],         stock:2, img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=250&fit=crop' },
  { id:'mm4',  nom:'Bibliothèque 5 étagères',   cat:'Meubles',     sous_cat:'Rangements',   prix:95000,  unite:'pièce',   dimensions:'Sur mesure',  matiere:'MDF',         epaisseur:'16mm', couleurs:['blanc','chêne','noyer'],        stock:3, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop' },
  { id:'mm5',  nom:'Bureau simple',             cat:'Meubles',     sous_cat:'Bureaux',      prix:65000,  unite:'pièce',   dimensions:'Sur mesure',  matiere:'MDF',         epaisseur:'18mm', couleurs:['blanc','chêne','gris'],         stock:4, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop' },
  { id:'mm6',  nom:'Table à manger 6 places',   cat:'Meubles',     sous_cat:'Tables',       prix:200000, unite:'pièce',   dimensions:'Sur mesure',  matiere:'Bois massif', epaisseur:'40mm', couleurs:['naturel','vernis','laqué'],     stock:2, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop' },
  { id:'mm7',  nom:'Cuisine sur mesure (ml)',   cat:'Meubles',     sous_cat:'Cuisines',     prix:120000, unite:'mètre linéaire', dimensions:'Sur mesure', matiere:'MDF', epaisseur:'18mm', couleurs:['blanc','gris','chêne'],    stock:999, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop' },
  { id:'mm8',  nom:'Meuble TV sur mesure',      cat:'Meubles',     sous_cat:'Salons',       prix:75000,  unite:'pièce',   dimensions:'Sur mesure',  matiere:'MDF',         epaisseur:'18mm', couleurs:['blanc','gris','chêne','noyer'], stock:4, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop' },
  // PORTES & FENÊTRES
  { id:'mp1',  nom:'Porte intérieure panneau',  cat:'Portes',      sous_cat:'Intérieures',  prix:45000,  unite:'pièce',   dimensions:'210x90cm',   matiere:'Contreplaqué',epaisseur:'35mm', couleurs:['naturel','laqué blanc','chêne'], stock:8, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop' },
  { id:'mp2',  nom:'Porte blindée bois',        cat:'Portes',      sous_cat:'Blindées',     prix:180000, unite:'pièce',   dimensions:'210x90cm',   matiere:'Bois massif', epaisseur:'60mm', couleurs:['naturel','laqué','chêne'],      stock:3, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop' },
  { id:'mp3',  nom:'Fenêtre bois 2 vantaux',    cat:'Portes',      sous_cat:'Fenêtres',     prix:55000,  unite:'pièce',   dimensions:'120x110cm',  matiere:'Pin',         epaisseur:'45mm', couleurs:['blanc','naturel'],              stock:5, img:'https://images.unsplash.com/photo-1490750967868-88df5691f2c6?w=120&h=120&fit=crop' },
  // ACCESSOIRES
  { id:'ma1',  nom:'Charnière piano 1m',        cat:'Accessoires', sous_cat:'Quincaillerie',prix:3500,   unite:'pièce',   dimensions:'1000mm',     matiere:'Acier',       epaisseur:'—',    couleurs:['chromé','doré','noir'],         stock:50, img:'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=120&h=120&fit=crop' },
  { id:'ma2',  nom:'Coulisse tiroir 45cm x2',   cat:'Accessoires', sous_cat:'Quincaillerie',prix:4500,   unite:'paire',   dimensions:'450mm',      matiere:'Acier',       epaisseur:'—',    couleurs:['chromé'],                      stock:40, img:'https://images.unsplash.com/photo-1558997519-4a424ac63f54?w=120&h=120&fit=crop' },
  { id:'ma3',  nom:'Poignée meuble x10',        cat:'Accessoires', sous_cat:'Quincaillerie',prix:5000,   unite:'lot',     dimensions:'96mm entraxe',matiere:'Acier',      epaisseur:'—',    couleurs:['chromé','doré','noir','inox'],  stock:30, img:'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1/120/120' },
];

// ── Devis sur mesure ──
var DEVIS_MENUISERIE = [];
var devis_seq = 1;

function initMenuiserie() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_menuiserie') || '{}');
    if (saved.devis) DEVIS_MENUISERIE = saved.devis;
    if (saved.seq)   devis_seq = saved.seq;
  } catch(e) { DEVIS_MENUISERIE = []; }
}

function saveMenuiserie() {
  try { localStorage.setItem('sm_menuiserie', JSON.stringify({ devis: DEVIS_MENUISERIE, seq: devis_seq })); } catch(e) {}
}

// ── Créer un devis ──
function creerDevis() {
  var client  = (document.getElementById('devis-client')  || {}).value || '';
  var tel     = (document.getElementById('devis-tel')     || {}).value || '';
  var desc    = (document.getElementById('devis-desc')    || {}).value || '';
  var dims    = (document.getElementById('devis-dims')    || {}).value || '';
  var mat     = (document.getElementById('devis-mat')     || {}).value || '';
  var budget  = parseInt((document.getElementById('devis-budget') || {}).value) || 0;

  if (!client) { toast('Nom client requis', 'warning'); return; }
  if (!tel)    { toast('Téléphone requis', 'warning'); return; }
  if (!desc)   { toast('Décrivez le meuble souhaité', 'warning'); return; }

  var devis = {
    id:       'DEVIS-' + String(devis_seq++).padStart(3,'0'),
    client:   client,
    tel:      tel,
    description: desc,
    dimensions:  dims,
    materiau:    mat,
    budget:      budget,
    statut:      'nouveau',
    reponse:     '',
    prix_propose: 0,
    cree_le:  new Date().toISOString()
  };

  DEVIS_MENUISERIE.unshift(devis);
  saveMenuiserie();
  closeM('m-devis');
  renderDevis();
  renderStatsMenuiserie();
  toast('Devis ' + devis.id + ' créé !', 'success');
  addNotif('Nouveau devis menuiserie : ' + client + ' — ' + desc.substring(0,30), 'green');

  // SMS au client
  envoyerSMSMenuiserie('nouveau', devis);

  ['devis-client','devis-tel','devis-desc','devis-dims','devis-budget'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value = '';
  });
}

// ── Répondre à un devis ──
function repondreDevis(id) {
  var devis = DEVIS_MENUISERIE.find(function(d){ return d.id === id; });
  if (!devis) return;
  var reponse = prompt('Votre réponse / description du devis :');
  if (!reponse) return;
  var prix = parseFloat(prompt('Prix proposé (FCFA) :')) || 0;
  devis.reponse      = reponse;
  devis.prix_propose = prix;
  devis.statut       = 'devis_envoye';
  saveMenuiserie();
  renderDevis();
  envoyerSMSMenuiserie('devis_envoye', devis);
  toast('Réponse envoyée à ' + devis.client, 'success');
}

// ── Changer statut devis ──
function changerStatutDevis(id, statut) {
  var devis = DEVIS_MENUISERIE.find(function(d){ return d.id === id; });
  if (!devis) return;
  devis.statut = statut;
  saveMenuiserie();
  renderDevis();
  renderStatsMenuiserie();
  envoyerSMSMenuiserie(statut, devis);
  toast(id + ' — ' + statut, 'success');
}

// ── SMS Menuiserie ──
function envoyerSMSMenuiserie(type, devis) {
  if (!devis.tel) return;
  var msgs = {
    nouveau:        'Bonjour ' + devis.client + ', votre demande de devis ' + devis.id + ' a bien été reçue. Nous vous répondons sous 24h. SuperMarché CM Menuiserie',
    devis_envoye:   'Bonjour ' + devis.client + ', votre devis ' + devis.id + ' est prêt ! ' + devis.reponse + ' — Prix : ' + (devis.prix_propose||0).toLocaleString('fr-FR') + ' FCFA. Répondez pour valider. SuperMarché CM',
    accepte:        'Bonjour ' + devis.client + ', votre devis ' + devis.id + ' est accepté ! Nous commençons la fabrication. Délai : 7 à 14 jours. SuperMarché CM',
    en_fabrication: 'Bonjour ' + devis.client + ', la fabrication de votre meuble (' + devis.id + ') est en cours. Nous vous prévenons dès que c\'est prêt. SuperMarché CM',
    livre:          'Bonjour ' + devis.client + ', votre commande ' + devis.id + ' est prête et livrée ! Merci pour votre confiance. SuperMarché CM Menuiserie'
  };
  var msg = msgs[type];
  if (!msg) return;
  fetch((typeof BACKEND!=='undefined'?BACKEND:'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ tel: devis.tel.replace(/[\s+]/g,''), message: msg })
  }).then(function(r){ return r.json(); })
    .then(function(r){ if(r.ok) toast('SMS envoyé à ' + devis.client, 'success'); })
    .catch(function(e){ console.warn('SMS menuiserie:', e); });
}

// ── Render catalogue produits ──
function renderCatalogueMenuiserie() {
  var grid = document.getElementById('menu-produits-grid');
  if (!grid) return;

  var filtreCat  = (document.getElementById('menu-cat-filtre')  || {}).value || '';
  var filtreMat  = (document.getElementById('menu-mat-filtre')  || {}).value || '';
  var filtreEp   = (document.getElementById('menu-ep-filtre')   || {}).value || '';
  var srch       = ((document.getElementById('menu-search')     || {}).value || '').toLowerCase();

  var prods = MENUISERIE_PRODUITS.filter(function(p) {
    return (!filtreCat || p.cat === filtreCat)
        && (!filtreMat || p.matiere === filtreMat)
        && (!filtreEp  || p.epaisseur === filtreEp)
        && (!srch      || p.nom.toLowerCase().includes(srch));
  });

  if (prods.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#999;padding:20px;grid-column:1/-1">Aucun produit trouvé</p>';
    return;
  }

  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px">'
    + prods.map(function(p) {
        var stCls = p.stock===0?'bgr':p.stock<5?'bgy':'bgg';
        var stLbl = p.stock===0?'Rupture':p.stock<5?'Stock faible':'Disponible';
        var couleurs = Array.isArray(p.couleurs) ? p.couleurs.join(', ') : p.couleurs;
        return '<div class="cd">'
          + '<img loading="lazy" src="' + p.img + '" alt="' + p.nom + '" style="width:100%;height:130px;object-fit:cover;border-radius:10px;margin-bottom:10px">'
          + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">'
          + '<span style="font-size:10px;background:#f0faf5;color:#007A3D;padding:2px 8px;border-radius:20px;font-weight:700">' + p.sous_cat + '</span>'
          + '<span class="badge ' + stCls + '" style="font-size:10px">' + stLbl + '</span>'
          + '</div>'
          + '<div style="font-weight:700;font-size:14px;margin-bottom:4px">' + p.nom + '</div>'
          + '<div style="font-size:11px;color:#666;margin-bottom:2px">' + p.matiere + ' — ' + p.epaisseur + ' — ' + p.dimensions + '</div>'
          + '<div style="font-size:11px;color:#999;margin-bottom:8px">Couleurs : ' + couleurs + '</div>'
          + '<div style="font-size:16px;font-weight:800;color:#007A3D">' + p.prix.toLocaleString('fr-FR') + ' FCFA<span style="font-size:11px;color:#999;font-weight:400"> / ' + p.unite + '</span></div>'
          + '<div style="display:flex;gap:6px;margin-top:10px">'
          + '<button class="btn bp bsm" style="flex:1" onclick="demanderDevisProduit(\'' + p.id + '\')">Devis sur mesure</button>'
          + '</div>'
          + '</div>';
      }).join('')
    + '</div>';
}

// ── Pré-remplir devis depuis produit ──
function demanderDevisProduit(prodId) {
  // Chercher dans les produits ET dans les réalisations
  var prod = MENUISERIE_PRODUITS.find(function(p){ return p.id === prodId; });
  var real = REALISATIONS_MENUISERIE.find(function(r){ return r.id === prodId; });
  var item = prod || real;
  if (!item) { openM('m-devis'); return; } // Ouvrir quand même si non trouvé

  var desc = document.getElementById('devis-desc');
  var mat  = document.getElementById('devis-mat');
  var bud  = document.getElementById('devis-budget');

  if (prod) {
    if (desc) desc.value = 'Je souhaite commander : ' + prod.nom + (prod.dimensions ? ' (' + prod.dimensions + ')' : '');
    if (mat)  mat.value  = prod.matiere || '';
    if (bud)  bud.value  = prod.prix || '';
  } else if (real) {
    if (desc) desc.value = 'Je souhaite commander un meuble similaire à : ' + real.titre + ' (matière : ' + real.matiere + ', délai estimé : ' + real.duree + ')';
    if (mat)  mat.value  = real.matiere || '';
    if (bud)  bud.value  = real.prix || '';
  }
  openM('m-devis');
}

// ── Render devis ──
function renderDevis() {
  var liste = document.getElementById('menu-devis-liste');
  if (!liste) return;

  var filtre = (document.getElementById('devis-filtre') || {}).value || 'tous';
  var devis = filtre === 'tous' ? DEVIS_MENUISERIE
    : DEVIS_MENUISERIE.filter(function(d){ return d.statut === filtre; });

  if (devis.length === 0) {
    liste.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucun devis</p>';
    return;
  }

  var stMap = {
    nouveau:        ['Nouveau',          '#3b82f6', '#dbeafe'],
    en_etude:       ['En étude',         '#f59e0b', '#fef3c7'],
    devis_envoye:   ['Devis envoyé',     '#8b5cf6', '#ede9fe'],
    accepte:        ['Accepté',          '#007A3D', '#dcfce7'],
    en_fabrication: ['En fabrication',   '#007A3D', '#dcfce7'],
    livre:          ['Livré',            '#6b7280', '#f3f4f6'],
    refuse:         ['Refusé',           '#CE1126', '#fee2e2'],
  };

  // Barre progression
  var etapes = ['nouveau','en_etude','devis_envoye','accepte','en_fabrication','livre'];
  var etapesLbl = ['Reçu','En étude','Devis','Accepté','Fabrication','Livré'];

  liste.innerHTML = devis.map(function(d) {
    var st = stMap[d.statut] || ['—','#999','#f9fafb'];
    var step = etapes.indexOf(d.statut);
    var dateAff = d.cree_le ? new Date(d.cree_le).toLocaleDateString('fr-FR') : '—';

    var progHtml = '<div style="display:flex;align-items:center;gap:2px;margin:10px 0;overflow-x:auto">'
      + etapes.map(function(e,i){
          var done = i <= step && d.statut !== 'refuse';
          return '<div style="flex:1;text-align:center;min-width:50px">'
            + '<div style="width:24px;height:24px;border-radius:50%;margin:0 auto 2px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;background:' + (done?'#007A3D':'#e5e7eb') + ';color:' + (done?'#fff':'#999') + '">' + (i+1) + '</div>'
            + '<div style="font-size:9px;color:' + (done?'#007A3D':'#999') + '">' + etapesLbl[i] + '</div>'
            + '</div>'
            + (i<5?'<div style="flex:0.3;height:2px;background:' + (i<step&&d.statut!=='refuse'?'#007A3D':'#e5e7eb') + ';margin-bottom:14px"></div>':'');
        }).join('')
      + '</div>';

    return '<div class="cd" style="margin-bottom:14px">'
      + '<div style="display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap">'
      + '<div style="flex:1;min-width:160px">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
      + '<span style="font-weight:800;color:#007A3D;font-size:14px">' + d.id + '</span>'
      + '<span style="font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;background:' + st[2] + ';color:' + st[1] + '">' + st[0] + '</span>'
      + '</div>'
      + '<div style="font-weight:700;font-size:14px">' + d.client + ' — ' + d.tel + '</div>'
      + '<div style="font-size:13px;color:#555;margin-top:4px;font-style:italic">"' + d.description + '"</div>'
      + (d.dimensions ? '<div style="font-size:12px;color:#666;margin-top:2px">Dimensions : ' + d.dimensions + '</div>' : '')
      + (d.materiau   ? '<div style="font-size:12px;color:#666">Matériau préféré : ' + d.materiau + '</div>' : '')
      + (d.budget > 0 ? '<div style="font-size:12px;color:#007A3D;font-weight:600">Budget : ' + d.budget.toLocaleString('fr-FR') + ' FCFA</div>' : '')
      + '</div>'
      + '<div style="text-align:right;min-width:120px">'
      + '<div style="font-size:11px;color:#999">' + dateAff + '</div>'
      + (d.prix_propose > 0 ? '<div style="font-size:18px;font-weight:800;color:#007A3D">' + d.prix_propose.toLocaleString('fr-FR') + ' FCFA</div>' : '')
      + (d.reponse ? '<div style="font-size:11px;color:#555;margin-top:4px;max-width:140px;text-align:right">' + d.reponse + '</div>' : '')
      + '</div>'
      + '</div>'
      + progHtml
      + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
      + (d.statut==='nouveau'        ? '<button class="btn bo bsm" onclick="changerStatutDevis(\''+d.id+'\',\'en_etude\')">Prendre en charge</button>' : '')
      + (d.statut==='en_etude'       ? '<button class="btn bp bsm" onclick="repondreDevis(\''+d.id+'\')">Envoyer devis</button>' : '')
      + (d.statut==='devis_envoye'   ? '<button class="btn bp bsm" onclick="changerStatutDevis(\''+d.id+'\',\'accepte\')">Marquer accepté</button>' : '')
      + (d.statut==='accepte'        ? '<button class="btn bp bsm" onclick="changerStatutDevis(\''+d.id+'\',\'en_fabrication\')">Lancer fabrication</button>' : '')
      + (d.statut==='en_fabrication' ? '<button class="btn bp bsm" onclick="changerStatutDevis(\''+d.id+'\',\'livre\')">Marquer livré</button>' : '')
      + (d.statut!=='livre'&&d.statut!=='refuse' ? '<button class="btn bd bsm" onclick="changerStatutDevis(\''+d.id+'\',\'refuse\')">Refuser</button>' : '')
      + '<a href="https://wa.me/' + d.tel.replace(/[\s+\-]/g,'') + '?text=' + encodeURIComponent('Bonjour ' + d.client + ', concernant votre devis ' + d.id + ' :') + '" target="_blank" class="btn bo bsm">WhatsApp</a>'
      + '</div>'
      + '</div>';
  }).join('');
}

// ── Stats menuiserie ──
function renderStatsMenuiserie() {
  var stats = document.getElementById('menu-stats');
  if (!stats) return;
  var nouveaux  = DEVIS_MENUISERIE.filter(function(d){ return d.statut==='nouveau'; }).length;
  var enCours   = DEVIS_MENUISERIE.filter(function(d){ return ['en_etude','devis_envoye','accepte','en_fabrication'].includes(d.statut); }).length;
  var livres    = DEVIS_MENUISERIE.filter(function(d){ return d.statut==='livre'; }).length;
  var ca        = DEVIS_MENUISERIE.filter(function(d){ return d.statut==='livre'; }).reduce(function(s,d){ return s+(d.prix_propose||0); },0);
  stats.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">'
    + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#3b82f6">'+nouveaux+'</div><div style="font-size:12px;color:#666">Nouveaux devis</div></div>'
    + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#f59e0b">'+enCours+'</div><div style="font-size:12px;color:#666">En cours</div></div>'
    + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#6b7280">'+livres+'</div><div style="font-size:12px;color:#666">Livrés</div></div>'
    + '<div class="cd" style="text-align:center"><div style="font-size:22px;font-weight:800;color:#007A3D">'+(ca>=1000?Math.round(ca/1000)+'K':ca.toLocaleString('fr-FR'))+'</div><div style="font-size:12px;color:#666">CA FCFA</div></div>'
    + '</div>';
}

// ── Init page menuiserie ──
function initPageMenuiserie() {
  initMenuiserie();
  renderStatsMenuiserie();
  renderCatalogueMenuiserie();
  renderDevis();
}

// ═══════════════════════════════════════════════════════
//  SUPABASE SYNC — Menuiserie
// ═══════════════════════════════════════════════════════
async function chargerDevisSupabase() {
  try {
    var sb = _sbMain(); if (!sb) return;
    var res = await sb.from('devis_menuiserie').select('*').order('created_at', { ascending: false }).limit(200);
    if (res.data && res.data.length > 0) {
      DEVIS_MENUISERIE = res.data.map(function(d) {
        return {
          id: d.id, client: d.client, tel: d.tel,
          description: d.description, dimensions: d.dimensions,
          materiau: d.materiau, budget: d.budget || 0,
          statut: d.statut, reponse: d.reponse || '',
          prix_propose: d.prix_propose || 0, cree_le: d.created_at
        };
      });
    }
  } catch(e) { console.warn('[Menuiserie] Supabase:', e); }
}

async function sauvegarderDevisSupabase(devis) {
  try {
    var sb = _sbMain(); if (!sb) return;
    await sb.from('devis_menuiserie').upsert({
      id: devis.id, client: devis.client, tel: devis.tel,
      description: devis.description, dimensions: devis.dimensions,
      materiau: devis.materiau, budget: devis.budget,
      statut: devis.statut, reponse: devis.reponse,
      prix_propose: devis.prix_propose
    });
  } catch(e) { console.warn('[Menuiserie] save:', e); }
}

initPageMenuiserie = async function() {
  initMenuiserie();
  await chargerDevisSupabase();
  renderStatsMenuiserie();
  renderCatalogueMenuiserie();
  renderDevis();
};

// ═══════════════════════════════════════════════════════
//  AMÉLIORATIONS MENUISERIE v2
//  1. Configurateur de lit/meuble
//  2. Galerie réalisations
//  3. Suivi chantier
//  4. Calculateur matériaux
// ═══════════════════════════════════════════════════════

var REALISATIONS_MENUISERIE = [
  { id:'real1', titre:'Lit 2 places avec tête sculptée', cat:'Lits',     img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=250&fit=crop', matiere:'Iroko massif', duree:'7 jours',  prix:180000 },
  { id:'real2', titre:'Armoire 3 portes miroir',         cat:'Armoires', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop', matiere:'MDF 18mm',     duree:'5 jours',  prix:200000 },
  { id:'real3', titre:'Cuisine moderne 4m linéaires',    cat:'Cuisines', img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop', matiere:'MDF + Chêne',  duree:'12 jours', prix:480000 },
  { id:'real4', titre:'Bibliothèque sur mesure',          cat:'Rangements',img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',matiere:'MDF 16mm',   duree:'4 jours',  prix:95000  },
  { id:'real5', titre:'Bureau direction',                 cat:'Bureaux',  img:'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=250&fit=crop', matiere:'Sapelli',     duree:'8 jours',  prix:150000 },
  { id:'real6', titre:'Table à manger 8 places',         cat:'Tables',   img:'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=400&h=250&fit=crop', matiere:'Iroko massif', duree:'10 jours', prix:250000 },
];

var CHANTIERS_MENUISERIE = [];
var chantier_seq = 1;

function initMenuiserieV2() {
  try {
    var s = JSON.parse(localStorage.getItem('sm_men_v2') || '{}');
    if (s.chantiers) CHANTIERS_MENUISERIE = s.chantiers;
    if (s.seq) chantier_seq = s.seq;
  } catch(e) {}
}

function saveMenuiserieV2() {
  try { localStorage.setItem('sm_men_v2', JSON.stringify({ chantiers: CHANTIERS_MENUISERIE, seq: chantier_seq })); } catch(e) {}
}

// ── Configurateur meuble ──
function calculerConfigurateur() {
  var type    = (document.getElementById('conf-type')    || {}).value || '';
  var larg    = parseFloat((document.getElementById('conf-largeur')  || {}).value) || 0;
  var haut    = parseFloat((document.getElementById('conf-hauteur')  || {}).value) || 0;
  var prof    = parseFloat((document.getElementById('conf-profond')  || {}).value) || 0;
  var matiere = (document.getElementById('conf-matiere') || {}).value || 'MDF 18mm';
  var couleur = (document.getElementById('conf-couleur') || {}).value || 'Blanc';
  var options = Array.from(document.querySelectorAll('.conf-option:checked')).map(function(el){ return el.value; });

  if (!type || !larg || !haut || !prof) { toast('Remplissez toutes les dimensions', 'warning'); return; }

  // Calcul surface de panneaux nécessaire
  var surfaces = {
    'Armoire':    { panneau: (larg*haut*2 + larg*prof*2 + haut*prof*2) / 10000 },
    'Bibliothèque':{ panneau: (larg*haut*2 + larg*prof*5 + haut*prof*2) / 10000 },
    'Bureau':     { panneau: (larg*prof + larg*haut*2 + haut*prof*2) / 10000 },
    'Lit':        { panneau: (larg*prof*2 + larg*haut*2 + haut*prof*2) / 10000 }
  };
  var s = surfaces[type] || { panneau: (larg*haut*2 + larg*prof*2 + haut*prof*2) / 10000 };
  var m2Panneaux = Math.ceil(s.panneau * 1.2); // marge 20%
  var nbFeuilles = Math.ceil(m2Panneaux / (2.44*1.22)); // feuille standard 2440x1220

  var prixFeuille = matiere.includes('MDF') ? 18000 : matiere.includes('Okoumé') ? 14000 : 16000;
  var prixPanneaux = nbFeuilles * prixFeuille;
  var prixMO = type === 'Cuisine' ? larg * 100000 : Math.ceil((larg+haut+prof)/10) * 15000;
  var prixOptions = options.reduce(function(s, o){
    var optPrix = { 'Miroir':15000, 'Serrure':5000, 'Lumières LED':12000, 'Tiroirs x2':8000, 'Étagères x2':3000 };
    return s + (optPrix[o]||0);
  }, 0);
  var prixTotal = prixPanneaux + prixMO + prixOptions;

  var result = document.getElementById('conf-result');
  if (!result) return;
  result.innerHTML = '<div style="background:#f0faf5;border-radius:14px;padding:20px;margin-top:16px">'
    + '<div style="font-weight:800;font-size:16px;color:#007A3D;margin-bottom:12px">Estimation — ' + type + ' ' + larg + 'cm × ' + haut + 'cm × ' + prof + 'cm</div>'
    + '<div style="background:#fff;border-radius:10px;padding:12px;margin-bottom:12px">'
    + '<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0"><span>Matière : ' + matiere + ' (' + nbFeuilles + ' feuilles)</span><span style="font-weight:700">' + prixPanneaux.toLocaleString('fr-FR') + ' F</span></div>'
    + '<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0"><span>Main d\'œuvre</span><span style="font-weight:700">' + prixMO.toLocaleString('fr-FR') + ' F</span></div>'
    + (prixOptions>0 ? '<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0"><span>Options : ' + options.join(', ') + '</span><span style="font-weight:700">' + prixOptions.toLocaleString('fr-FR') + ' F</span></div>' : '')
    + '<div style="border-top:1px solid #e5e7eb;margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-weight:800;font-size:15px"><span>Total estimé</span><span style="color:#007A3D">' + prixTotal.toLocaleString('fr-FR') + ' FCFA</span></div>'
    + '</div>'
    + '<div style="font-size:12px;color:#666;margin-bottom:12px">Finition : ' + couleur + ' · Délai estimé : ' + Math.ceil(prixMO/20000) + '-' + Math.ceil(prixMO/15000) + ' jours ouvrables</div>'
    + '<button class="btn bp" style="width:100%" onclick="openM(\'m-devis\')">Demander ce devis</button>'
    + '</div>';
}

// ── Galerie réalisations ──
function renderGalerieMenuiserie() {
  var grid = document.getElementById('menuiserie-galerie');
  if (!grid) return;
  var filtre = (document.getElementById('gal-cat-filtre') || {}).value || '';
  var items = filtre ? REALISATIONS_MENUISERIE.filter(function(r){ return r.cat===filtre; }) : REALISATIONS_MENUISERIE;
  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">'
    + items.map(function(r) {
        return '<div class="cd" style="padding:0;overflow:hidden;cursor:pointer">'
          + '<img loading="lazy" src="' + r.img + '" style="width:100%;height:160px;object-fit:cover">'
          + '<div style="padding:12px">'
          + '<span style="font-size:10px;background:#f0faf5;color:#007A3D;padding:2px 8px;border-radius:20px;font-weight:700">' + r.cat + '</span>'
          + '<div style="font-weight:700;font-size:14px;margin:6px 0 2px">' + r.titre + '</div>'
          + '<div style="font-size:12px;color:#666">' + r.matiere + ' · ' + r.duree + '</div>'
          + '<div style="font-size:15px;font-weight:800;color:#007A3D;margin-top:6px">' + r.prix.toLocaleString('fr-FR') + ' FCFA</div>'
          + '<button class="btn bp bsm" style="width:100%;margin-top:8px" onclick="demanderDevisProduit(\'' + r.id + '\')">Commander similaire</button>'
          + '</div></div>';
      }).join('') + '</div>';
}

// ── Calculateur matériaux BTP/Menuiserie ──
function calculerMateriauxMenuiserie() {
  var surface = parseFloat((document.getElementById('calc-surface') || {}).value) || 0;
  var type    = (document.getElementById('calc-type-travaux') || {}).value || 'cloison';
  if (!surface) { toast('Entrez une surface', 'warning'); return; }

  var calculs = {
    cloison: {
      label: 'Cloison en MDF 18mm',
      items: [
        { nom:'Panneaux MDF 18mm', qte: Math.ceil(surface / (2.44*1.22)), unite:'feuilles', prix:18000 },
        { nom:'Tasseaux bois 3x5cm', qte: Math.ceil(surface * 3), unite:'mètres linéaires', prix:800 },
        { nom:'Vis à bois x100', qte: Math.ceil(surface * 0.5), unite:'boîtes', prix:1500 },
        { nom:'Main d\'œuvre', qte: Math.ceil(surface * 8000), unite:'FCFA', prix:1 },
      ]
    },
    plancher: {
      label: 'Plancher bois',
      items: [
        { nom:'Lambourdes pin 3m', qte: Math.ceil(surface * 0.8), unite:'pièces', prix:3500 },
        { nom:'Panneaux contreplaqué 18mm', qte: Math.ceil(surface / (2.44*1.22)), unite:'feuilles', prix:18000 },
        { nom:'Vis plancher x100', qte: Math.ceil(surface * 0.3), unite:'boîtes', prix:1500 },
        { nom:'Colle parquet 10kg', qte: Math.ceil(surface * 0.15), unite:'seaux', prix:12000 },
      ]
    },
    placard: {
      label: 'Placard encastré',
      items: [
        { nom:'MDF 18mm', qte: Math.ceil(surface * 2.5 / (2.44*1.22)), unite:'feuilles', prix:18000 },
        { nom:'Charnières piano', qte: Math.ceil(surface * 0.5), unite:'mètres', prix:3500 },
        { nom:'Coulisses tiroir x2', qte: Math.ceil(surface * 1.5), unite:'paires', prix:4500 },
        { nom:'Poignées x10', qte: Math.ceil(surface * 0.8), unite:'lots', prix:5000 },
      ]
    }
  };

  var calc = calculs[type];
  if (!calc) return;
  var total = calc.items.reduce(function(s,i){ return s + i.prix * i.qte; },0);

  var result = document.getElementById('calc-result');
  if (!result) return;
  result.innerHTML = '<div style="background:#f0faf5;border-radius:12px;padding:16px;margin-top:12px">'
    + '<div style="font-weight:700;color:#007A3D;margin-bottom:10px">' + calc.label + ' — ' + surface + 'm²</div>'
    + calc.items.map(function(i){
        return '<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;border-bottom:1px solid #e5e7eb">'
          + '<span>' + i.nom + ' : <strong>' + i.qte + '</strong> ' + i.unite + '</span>'
          + (i.unite!=='FCFA' ? '<span style="color:#007A3D;font-weight:700">' + (i.prix*i.qte).toLocaleString('fr-FR') + ' F</span>' : '<span style="color:#007A3D;font-weight:700">' + i.qte.toLocaleString('fr-FR') + ' F</span>')
          + '</div>';
      }).join('')
    + '<div style="font-weight:800;font-size:15px;margin-top:10px;display:flex;justify-content:space-between">'
    + '<span>Estimation totale</span><span style="color:#007A3D">' + total.toLocaleString('fr-FR') + ' FCFA</span></div>'
    + '</div>';
}

// Surcharger initPageMenuiserie
initPageMenuiserie = async function() {
  initMenuiserie();
  initMenuiserieV2();
  await chargerDevisSupabase();
  renderStatsMenuiserie();
  renderCatalogueMenuiserie();
  renderDevis();
  renderGalerieMenuiserie();
};

// ═══════════════════════════════════════════════════════
//  AJOUT MENUISIER — Gestion des artisans menuisiers
// ═══════════════════════════════════════════════════════

var MENUISIERS = [];
var menuisier_seq = 1;

function initMenuisiers() {
  try {
    var s = JSON.parse(localStorage.getItem('sm_menuisiers') || '[]');
    if (Array.isArray(s)) { MENUISIERS = s; menuisier_seq = s.length + 1; }
  } catch(e) { MENUISIERS = []; }
}

function saveMenuisiers() {
  try { localStorage.setItem('sm_menuisiers', JSON.stringify(MENUISIERS)); } catch(e) {}
}

function ajouterMenuisier() {
  var nom      = (document.getElementById('mn-nom')      || {}).value || '';
  var tel      = (document.getElementById('mn-tel')      || {}).value || '';
  var email    = (document.getElementById('mn-email')    || {}).value || '';
  var pwd      = (document.getElementById('mn-pwd')      || {}).value || '';
  var specialite = (document.getElementById('mn-specialite') || {}).value || 'Menuiserie générale';
  var zone     = (document.getElementById('mn-zone')     || {}).value || 'Douala';
  var tarif    = parseInt((document.getElementById('mn-tarif') || {}).value) || 0;

  if (!nom)   { if (typeof toast === 'function') toast('Nom requis', 'warning'); return; }
  if (!tel)   { if (typeof toast === 'function') toast('Téléphone requis', 'warning'); return; }
  if (!email) { if (typeof toast === 'function') toast('Email requis', 'warning'); return; }
  if (!pwd)   { if (typeof toast === 'function') toast('Mot de passe requis', 'warning'); return; }

  var menuisier = {
    id: menuisier_seq++,
    nom: nom, tel: tel, email: email, pwd: pwd,
    specialite: specialite, zone: zone,
    tarif_jour: tarif, actif: true, note: 5.0,
    services: [], chantiers_actifs: 0,
    date_ajout: new Date().toLocaleDateString('fr-FR')
  };
  MENUISIERS.push(menuisier);
  saveMenuisiers();

  // Créer compte gérant menuisier
  if (typeof ACCOUNTS !== 'undefined') {
    ACCOUNTS.push({ email: email, pwd: pwd, nom: nom.toUpperCase(), prenom: '', role: 'menuisier', sm: 'Atelier — ' + zone });
    try { localStorage.setItem('sm_accounts', JSON.stringify(ACCOUNTS)); } catch(e) {}
  }

  if (typeof closeM === 'function') closeM('m-nouveau-menuisier');
  renderMenuisiersListe();
  if (typeof toast === 'function') toast(nom + ' ajouté comme menuisier !', 'success');
  if (typeof addNotif === 'function') addNotif('Nouveau menuisier : ' + nom + ' — ' + specialite, 'green');
  ['mn-nom','mn-tel','mn-email','mn-pwd','mn-zone'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

function renderMenuisiersListe() {
  var zone = document.getElementById('menuisiers-liste');
  if (!zone) return;
  if (MENUISIERS.length === 0) {
    zone.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucun menuisier enregistré</p>';
    return;
  }
  zone.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">'
    + MENUISIERS.map(function(m) {
        return '<div class="cd">'
          + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">'
          + '<div style="width:44px;height:44px;border-radius:50%;background:#007A3D;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;flex-shrink:0">' + (m.nom[0]||'M').toUpperCase() + '</div>'
          + '<div><div style="font-weight:800;font-size:15px">' + m.nom + '</div>'
          + '<div style="font-size:12px;color:#007A3D;font-weight:600">' + m.specialite + '</div>'
          + '</div></div>'
          + '<div style="font-size:12px;color:#666;margin-bottom:4px">📞 ' + m.tel + ' — 📍 ' + m.zone + '</div>'
          + (m.tarif_jour > 0 ? '<div style="font-size:13px;font-weight:700;color:#007A3D;margin-bottom:8px">' + m.tarif_jour.toLocaleString('fr-FR') + ' FCFA/jour</div>' : '')
          + '<div style="display:flex;gap:6px">'
          + '<a href="https://wa.me/' + m.tel.replace(/[\s+\-]/g,'') + '" target="_blank" class="btn bo bsm">WhatsApp</a>'
          + '<button class="btn bd bsm" onclick="supprimerMenuisier(' + m.id + ')">Retirer</button>'
          + '</div></div>';
      }).join('')
    + '</div>';
}

function supprimerMenuisier(id) {
  MENUISIERS = MENUISIERS.filter(function(m){ return m.id !== id; });
  saveMenuisiers();
  renderMenuisiersListe();
  if (typeof toast === 'function') toast('Menuisier retiré', 'success');
}
