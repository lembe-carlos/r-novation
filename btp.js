
function _sbBTP() {
  if (typeof window.supabase === 'undefined') return null;
  try { return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key); } catch(e) { return null; }
}
async function syncBTPSupabase(devis) {
  try {
    var sb = _sbBTP(); if (!sb) return;
    await sb.from('sm_devis_btp').upsert({
      id: devis.id, client: devis.client, tel: devis.tel,
      description: devis.description||'', artisan: devis.artisan||'',
      budget: devis.budget||0, statut: devis.statut||'nouveau'
    }, { onConflict: 'id' });
  } catch(e) { console.warn('[BTP] sync:', e); }
}
async function chargerBTPSupabase() {
  try {
    var sb = _sbBTP(); if (!sb) return;
    var res = await sb.from('sm_devis_btp').select('*').order('created_at', { ascending: false });
    if (res.data && res.data.length > 0) {
      var local = JSON.parse(localStorage.getItem('sm_btp') || '{"devis":[]}');
      if (!local.devis) local.devis = [];
      res.data.forEach(function(r) {
        if (!local.devis.find(function(x){ return x.id === r.id; })) local.devis.unshift(r);
      });
      localStorage.setItem('sm_btp', JSON.stringify(local));
    }
  } catch(e) { console.warn('[BTP] charger:', e); }
}
// ═══════════════════════════════════════════════════════
//  SuperMarché CM — btp.js
//  BTP & Construction : Matériaux + Devis + Artisans
// ═══════════════════════════════════════════════════════

var BTP_PRODUITS = [
  // GROS ŒUVRE
  { id:'b1',  nom:'Ciment CPA 42.5 sac 50kg',     cat:'Gros œuvre',    prix:6500,  stock:200, unite:'sac',     img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=250&fit=crop' },
  { id:'b2',  nom:'Sable de rivière m3',            cat:'Gros œuvre',    prix:25000, stock:50,  unite:'m3',      img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=250&fit=crop' },
  { id:'b3',  nom:'Gravier concassé m3',            cat:'Gros œuvre',    prix:35000, stock:30,  unite:'m3',      img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=250&fit=crop' },
  { id:'b4',  nom:'Fer à béton 10mm x12m',         cat:'Gros œuvre',    prix:5500,  stock:300, unite:'barre',   img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop' },
  { id:'b5',  nom:'Fer à béton 12mm x12m',         cat:'Gros œuvre',    prix:7500,  stock:200, unite:'barre',   img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop' },
  { id:'b6',  nom:'Parpaing creux 15x20x40cm',     cat:'Gros œuvre',    prix:350,   stock:5000,unite:'pièce',   img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=250&fit=crop' },
  // TOITURE
  { id:'b7',  nom:'Tôle bac acier 3m galvanisée',  cat:'Toiture',       prix:8500,  stock:100, unite:'feuille', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop' },
  { id:'b8',  nom:'Tôle bac acier 4m galvanisée',  cat:'Toiture',       prix:11000, stock:80,  unite:'feuille', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop' },
  { id:'b9',  nom:'Faîtière galvanisée 2m',        cat:'Toiture',       prix:2500,  stock:50,  unite:'pièce',   img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop' },
  // CARRELAGE & SOL
  { id:'b10', nom:'Carrelage sol 60x60cm (m2)',    cat:'Carrelage',     prix:6500,  stock:500, unite:'m2',      img:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=250&fit=crop' },
  { id:'b11', nom:'Carrelage mural 30x60cm (m2)',  cat:'Carrelage',     prix:5500,  stock:300, unite:'m2',      img:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=250&fit=crop' },
  { id:'b12', nom:'Colle carrelage 25kg',          cat:'Carrelage',     prix:4500,  stock:100, unite:'sac',     img:'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&h=250&fit=crop' },
  { id:'b13', nom:'Joint carrelage gris 5kg',      cat:'Carrelage',     prix:2500,  stock:80,  unite:'sac',     img:'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&h=250&fit=crop' },
  // PEINTURE
  { id:'b14', nom:'Peinture intérieure blanc 20L', cat:'Peinture',      prix:25000, stock:30,  unite:'seau',    img:'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=250&fit=crop' },
  { id:'b15', nom:'Peinture façade 20L',           cat:'Peinture',      prix:35000, stock:20,  unite:'seau',    img:'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=250&fit=crop' },
  { id:'b16', nom:'Enduit de façade 25kg',         cat:'Peinture',      prix:8500,  stock:50,  unite:'sac',     img:'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=250&fit=crop' },
  // SANITAIRES & PLOMBERIE
  { id:'b17', nom:'WC céramique complet',          cat:'Sanitaires',    prix:45000, stock:10,  unite:'pièce',   img:'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=250&fit=crop' },
  { id:'b18', nom:'Lavabo céramique 60cm',         cat:'Sanitaires',    prix:25000, stock:12,  unite:'pièce',   img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop' },
  { id:'b19', nom:'Robinet mélangeur inox',        cat:'Sanitaires',    prix:15000, stock:20,  unite:'pièce',   img:'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=120&h=120&fit=crop' },
  { id:'b20', nom:'Tuyau PVC 100mm x3m',          cat:'Plomberie',     prix:4500,  stock:100, unite:'pièce',   img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=120&h=120&fit=crop' },
  { id:'b21', nom:'Tuyau PPR 20mm x4m',           cat:'Plomberie',     prix:3500,  stock:80,  unite:'pièce',   img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop' },
  // PORTES & FENÊTRES
  { id:'b22', nom:'Porte métallique 210x90cm',     cat:'Menuiserie alum.',prix:85000,stock:5,  unite:'pièce',   img:'https://images.unsplash.com/photo-1558997519-4a424ac63f54?w=120&h=120&fit=crop' },
  { id:'b23', nom:'Fenêtre aluminium 120x120cm',   cat:'Menuiserie alum.',prix:65000,stock:6,  unite:'pièce',   img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd/120/120' },
];

var ARTISANS_BTP = [
  { id:'a1', nom:'MBAYE Construction',  metier:'Maçon',        ville:'Douala', tel:'+237 677 201 001', tarif:'Sur devis', note:4.7, img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop' },
  { id:'a2', nom:'EKOTO Carrelage',     metier:'Carreleur',    ville:'Douala', tel:'+237 677 202 002', tarif:'5 000/m2',  note:4.8, img:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=120&h=120&fit=crop' },
  { id:'a3', nom:'BIYA Peinture',       metier:'Peintre',      ville:'Yaoundé',tel:'+237 677 203 003', tarif:'3 000/m2',  note:4.6, img:'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=120&h=120&fit=crop' },
  { id:'a4', nom:'NGUEMA Plomberie',    metier:'Plombier',     ville:'Douala', tel:'+237 677 204 004', tarif:'Sur devis', note:4.9, img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=120&h=120&fit=crop' },
  { id:'a5', nom:'OBAMA Toiture',       metier:'Couvreur',     ville:'Douala', tel:'+237 677 205 005', tarif:'Sur devis', note:4.7, img:'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=120&h=120&fit=crop' },
];

var DEVIS_BTP = [];
var btp_seq = 1;

function initBTP() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_btp') || '{}');
    if (saved.devis) DEVIS_BTP = saved.devis;
    if (saved.seq)   btp_seq = saved.seq;
  } catch(e) { DEVIS_BTP = []; }
}

function saveBTP() {
  try { localStorage.setItem('sm_btp', JSON.stringify({ devis: DEVIS_BTP, seq: btp_seq })); } catch(e) {}
}

function creerDevisBTP() {
  var client = (document.getElementById('btp-client') || {}).value || '';
  var tel    = (document.getElementById('btp-tel')    || {}).value || '';
  var travaux= (document.getElementById('btp-travaux')|| {}).value || '';
  var surface= (document.getElementById('btp-surface')|| {}).value || '';
  var budget = parseInt((document.getElementById('btp-budget')||{}).value) || 0;
  var artisan= (document.getElementById('btp-artisan')|| {}).value || '';

  if (!client)  { toast('Nom requis', 'warning'); return; }
  if (!tel)     { toast('Téléphone requis', 'warning'); return; }
  if (!travaux) { toast('Décrivez les travaux', 'warning'); return; }

  var art = ARTISANS_BTP.find(function(a){ return a.id === artisan; });
  var dv = {
    id: 'BTP-' + String(btp_seq++).padStart(3,'0'),
    client: client, tel: tel, travaux: travaux, surface: surface,
    budget: budget, artisan_id: artisan,
    artisan_nom: art ? art.nom + ' (' + art.metier + ')' : 'À assigner',
    statut: 'nouveau', reponse: '', prix_propose: 0,
    cree_le: new Date().toISOString()
  };
  DEVIS_BTP.unshift(dv);
  saveBTP();
  closeM('m-devis-btp');
  renderDevisBTP();
  renderStatsBTP();
  toast('Devis ' + dv.id + ' créé !', 'success');
  addNotif('Nouveau devis BTP : ' + client, 'green');
  envoyerSMSBTP('nouveau', dv);
  ['btp-client','btp-tel','btp-travaux','btp-surface','btp-budget'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value='';
  });
}

function changerStatutDevisBTP(id, statut) {
  var dv = DEVIS_BTP.find(function(d){ return d.id===id; });
  if (!dv) return;
  if (statut==='devis_envoye') {
    dv.reponse = prompt('Votre proposition :') || '';
    dv.prix_propose = parseFloat(prompt('Prix (FCFA) :')) || 0;
  }
  dv.statut = statut;
  saveBTP();
  renderDevisBTP();
  envoyerSMSBTP(statut, dv);
  toast(id + ' — ' + statut, 'success');
}

function envoyerSMSBTP(statut, dv) {
  if (!dv.tel) return;
  var msgs = {
    nouveau:      'Bonjour ' + dv.client + ', votre demande de devis BTP ' + dv.id + ' a été reçue. Un artisan vous contacte sous 24h. SuperMarché CM BTP',
    devis_envoye: 'Bonjour ' + dv.client + ', votre devis BTP ' + dv.id + ' est prêt ! ' + dv.reponse + ' — ' + (dv.prix_propose||0).toLocaleString('fr-FR') + ' FCFA. SuperMarché CM',
    accepte:      'Bonjour ' + dv.client + ', votre devis BTP ' + dv.id + ' est accepté ! Les travaux démarrent selon le planning convenu. SuperMarché CM',
    termine:      'Bonjour ' + dv.client + ', vos travaux ' + dv.id + ' sont terminés ! Merci pour votre confiance. SuperMarché CM BTP'
  };
  var msg = msgs[statut]; if (!msg) return;
  fetch((typeof BACKEND!=='undefined'?BACKEND:'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ tel: dv.tel.replace(/[\s+]/g,''), message: msg })
  }).catch(function(e){ console.warn('SMS BTP:', e); });
}

function renderCatalogueBTP() {
  var grid = document.getElementById('btp-catalogue');
  if (!grid) return;
  var filtre = (document.getElementById('btp-cat-filtre')||{}).value || '';
  var srch   = ((document.getElementById('btp-search')||{}).value||'').toLowerCase();
  var prods  = BTP_PRODUITS.filter(function(p){
    return (!filtre||p.cat===filtre) && (!srch||p.nom.toLowerCase().includes(srch));
  });
  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px">'
    + prods.map(function(p) {
        var stCls = p.stock===0?'bgr':p.stock<10?'bgy':'bgg';
        return '<div class="cd">'
          + '<img loading="lazy" src="' + p.img + '" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px">'
          + '<div style="display:flex;justify-content:space-between;margin-bottom:4px">'
          + '<span style="font-size:10px;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:20px;font-weight:700">' + p.cat + '</span>'
          + '<span class="badge ' + stCls + '" style="font-size:10px">' + (p.stock===0?'Rupture':'Dispo') + '</span>'
          + '</div>'
          + '<div style="font-weight:700;font-size:13px;margin-bottom:6px">' + p.nom + '</div>'
          + '<div style="font-size:16px;font-weight:800;color:#007A3D">' + p.prix.toLocaleString('fr-FR') + ' FCFA<span style="font-size:11px;color:#999;font-weight:400"> / ' + p.unite + '</span></div>'
          + '</div>';
      }).join('') + '</div>';
}

function renderArtisans() {
  var grid = document.getElementById('artisans-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px">'
    + ARTISANS_BTP.map(function(a) {
        return '<div class="cd">'
          + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'
          + '<img loading="lazy" src="' + a.img + '" style="width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0">'
          + '<div><div style="font-weight:800;font-size:14px">' + a.nom + '</div>'
          + '<div style="font-size:12px;color:#007A3D;font-weight:600">' + a.metier + '</div>'
          + '<div style="font-size:11px;color:#666">' + a.ville + '</div></div>'
          + '</div>'
          + '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px">'
          + '<span style="color:#f59e0b;font-weight:700"><img loading="lazy" src="https://img.icons8.com/ios/14/FCD116/star.png" alt="Etoile" style="width:12px;height:12px;vertical-align:middle"> ' + a.note + '</span>'
          + '<span style="color:#007A3D;font-weight:700">' + a.tarif + '</span>'
          + '</div>'
          + '<button class="btn bp bsm" style="width:100%" onclick="preRemplirDevisBTP(\'' + a.id + '\')">Demander devis</button>'
          + '</div>';
      }).join('') + '</div>';
}

function preRemplirDevisBTP(artisanId) {
  var sel = document.getElementById('btp-artisan');
  if (sel) sel.value = artisanId;
  openM('m-devis-btp');
}

function renderDevisBTP() {
  var liste = document.getElementById('btp-devis-liste');
  if (!liste) return;
  if (DEVIS_BTP.length===0) { liste.innerHTML='<p style="text-align:center;color:#999;padding:20px">Aucun devis</p>'; return; }
  var stMap = { nouveau:['Nouveau','#3b82f6','#dbeafe'], devis_envoye:['Devis envoyé','#8b5cf6','#ede9fe'], accepte:['Accepté','#007A3D','#dcfce7'], en_cours:['En cours','#f59e0b','#fef3c7'], termine:['Terminé','#6b7280','#f3f4f6'], refuse:['Refusé','#CE1126','#fee2e2'] };
  liste.innerHTML = DEVIS_BTP.slice(0,20).map(function(d) {
    var st = stMap[d.statut]||['—','#999','#f9fafb'];
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">'
      + '<div><span style="font-weight:800;color:#007A3D">' + d.id + '</span> <span style="font-size:11px;padding:2px 10px;border-radius:20px;background:'+st[2]+';color:'+st[1]+';font-weight:700">'+st[0]+'</span>'
      + '<div style="font-weight:700;margin-top:4px">' + d.client + ' — ' + d.tel + '</div>'
      + '<div style="font-size:13px;color:#555;font-style:italic">"' + d.travaux + '"</div>'
      + (d.surface?'<div style="font-size:12px;color:#666">Surface : ' + d.surface + '</div>':'')
      + (d.budget>0?'<div style="font-size:12px;color:#007A3D">Budget : ' + d.budget.toLocaleString('fr-FR') + ' FCFA</div>':'')
      + '<div style="font-size:12px;color:#999">Artisan : ' + d.artisan_nom + '</div>'
      + '</div>'
      + (d.prix_propose>0?'<div style="font-size:18px;font-weight:800;color:#007A3D">'+d.prix_propose.toLocaleString('fr-FR')+' FCFA</div>':'')
      + '</div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">'
      + (d.statut==='nouveau'?'<button class="btn bp bsm" onclick="changerStatutDevisBTP(\''+d.id+'\',\'devis_envoye\')">Envoyer devis</button>':'')
      + (d.statut==='devis_envoye'?'<button class="btn bp bsm" onclick="changerStatutDevisBTP(\''+d.id+'\',\'accepte\')">Accepté</button>':'')
      + (d.statut==='accepte'?'<button class="btn bp bsm" onclick="changerStatutDevisBTP(\''+d.id+'\',\'en_cours\')">Démarrer</button>':'')
      + (d.statut==='en_cours'?'<button class="btn bp bsm" onclick="changerStatutDevisBTP(\''+d.id+'\',\'termine\')">Terminé</button>':'')
      + (d.statut!=='termine'&&d.statut!=='refuse'?'<button class="btn bd bsm" onclick="changerStatutDevisBTP(\''+d.id+'\',\'refuse\')">Refuser</button>':'')
      + '<a href="https://wa.me/'+d.tel.replace(/[\s+\-]/g,'')+'" target="_blank" class="btn bo bsm">WhatsApp</a>'
      + '</div></div>';
  }).join('');
}

function renderStatsBTP() {
  var stats = document.getElementById('btp-stats');
  if (!stats) return;
  var nouveaux = DEVIS_BTP.filter(function(d){ return d.statut==='nouveau'; }).length;
  var encours  = DEVIS_BTP.filter(function(d){ return ['devis_envoye','accepte','en_cours'].includes(d.statut); }).length;
  var ca       = DEVIS_BTP.filter(function(d){ return d.statut==='termine'; }).reduce(function(s,d){ return s+(d.prix_propose||0); },0);
  stats.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">'
    + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#3b82f6">'+nouveaux+'</div><div style="font-size:12px;color:#666">Nouveaux devis</div></div>'
    + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#f59e0b">'+encours+'</div><div style="font-size:12px;color:#666">En cours</div></div>'
    + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#111">'+ARTISANS_BTP.length+'</div><div style="font-size:12px;color:#666">Artisans partenaires</div></div>'
    + '<div class="cd" style="text-align:center"><div style="font-size:22px;font-weight:800;color:#007A3D">'+(ca>=1000?Math.round(ca/1000)+'K':ca)+'</div><div style="font-size:12px;color:#666">CA FCFA</div></div>'
    + '</div>';
}

function initPageBTP() {
  initBTP();
  renderStatsBTP();
  renderCatalogueBTP();
  renderArtisans();
  renderDevisBTP();
  // Remplir select artisans
  var sel = document.getElementById('btp-artisan');
  if (sel) {
    sel.innerHTML = '<option value="">Assigner un artisan...</option>';
    ARTISANS_BTP.forEach(function(a){
      var opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = a.nom + ' — ' + a.metier + ' — ' + a.ville;
      sel.appendChild(opt);
    });
  }
}
