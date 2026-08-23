
function _sbrdveducation() {
  if (typeof window.supabase === 'undefined') return null;
  try { return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key); } catch(e) { return null; }
}
async function syncrdveducationSupabase(item) {
  try {
    var sb = _sbrdveducation(); if (!sb) return;
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
    await sb.from('sm_rdv_education').upsert(row, { onConflict: 'id' });
  } catch(e) { console.warn('[sm_rdv_education] sync:', e); }
}
async function chargerrdveducationSupabase() {
  try {
    var sb = _sbrdveducation(); if (!sb) return;
    var res = await sb.from('sm_rdv_education').select('*').order('created_at', { ascending: false });
    if (res.data && res.data.length > 0) {
      var saved = JSON.parse(localStorage.getItem('sm_education') || '{}');
      var liste = saved.rdv || saved.devis || saved.commandes || [];
      res.data.forEach(function(r) {
        if (!liste.find(function(x){ return x.id === r.id; })) liste.unshift(r);
      });
      localStorage.setItem('sm_education', JSON.stringify(saved));
    }
  } catch(e) { console.warn('[sm_rdv_education] charger:', e); }
}
// ═══════════════════════════════════════════════════════
//  SuperMarché CM — education.js
//  Éducation & Formation : Fournitures + Cours + Livres
// ═══════════════════════════════════════════════════════

var EDUCATION_PRODUITS = [
  { id:'ed1',  nom:'Cahier 200 pages Séyès',     cat:'Papeterie',   prix:900,   stock:500, img:'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&h=250&fit=crop' },
  { id:'ed2',  nom:'Cahier 100 pages petits carr.',cat:'Papeterie',  prix:600,   stock:600, img:'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&h=250&fit=crop' },
  { id:'ed3',  nom:'Stylos bille Bic x10',        cat:'Papeterie',   prix:800,   stock:400, img:'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=250&fit=crop' },
  { id:'ed4',  nom:'Crayon HB x12',               cat:'Papeterie',   prix:500,   stock:300, img:'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=250&fit=crop' },
  { id:'ed5',  nom:'Règle + équerre + rapporteur', cat:'Papeterie',  prix:1200,  stock:200, img:'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=250&fit=crop' },
  { id:'ed6',  nom:'Calculatrice scientifique',    cat:'Matériel',   prix:8500,  stock:50,  img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=250&fit=crop' },
  { id:'ed7',  nom:'Cartable scolaire grand',      cat:'Matériel',   prix:9500,  stock:40,  img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=250&fit=crop' },
  { id:'ed8',  nom:'Uniforme primaire garçon',     cat:'Uniformes',  prix:8500,  stock:60,  img:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop' },
  { id:'ed9',  nom:'Uniforme primaire fille',      cat:'Uniformes',  prix:8500,  stock:60,  img:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop' },
  { id:'ed10', nom:'Uniforme lycée complet',        cat:'Uniformes', prix:15000, stock:40,  img:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop' },
  { id:'ed11', nom:'Dictionnaire Larousse 2024',    cat:'Livres',    prix:12000, stock:30,  img:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop' },
  { id:'ed12', nom:'Mathématiques Terminale C/D',   cat:'Livres',    prix:6500,  stock:40,  img:'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=250&fit=crop' },
  { id:'ed13', nom:'Manuel Physique-Chimie Tle',    cat:'Livres',    prix:6000,  stock:35,  img:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop' },
  { id:'ed14', nom:'Grammaire française complète',  cat:'Livres',    prix:7500,  stock:25,  img:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop' },
  { id:'ed15', nom:'Ramette papier A4 80g x500',    cat:'Imprimerie',prix:4500,  stock:100, img:'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop' },
  { id:'ed16', nom:'Impression couleur A4 (unité)', cat:'Imprimerie',prix:200,   stock:9999,img:'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop' },
  { id:'ed17', nom:'Plastification A4',             cat:'Imprimerie',prix:500,   stock:9999,img:'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&h=250&fit=crop' },
];

var COURS_PARTICULIERS = [
  { id:'cp1', matiere:'Mathématiques',       niveaux:'6e → Tle', tarif_heure:3000, enseignant:'Plusieurs enseignants', img:'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=120&h=120&fit=crop', dispo:true },
  { id:'cp2', matiere:'Physique-Chimie',     niveaux:'3e → Tle', tarif_heure:3500, enseignant:'Plusieurs enseignants', img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=120&fit=crop', dispo:true },
  { id:'cp3', matiere:'Anglais',             niveaux:'Tous niveaux', tarif_heure:3000, enseignant:'Locuteurs natifs',  img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=120&fit=crop', dispo:true },
  { id:'cp4', matiere:'Français & Littérat.',niveaux:'Tous niveaux', tarif_heure:2500, enseignant:'Professeurs CAPES',img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c/120/120', dispo:true },
  { id:'cp5', matiere:'Informatique',        niveaux:'Débutant → Avancé', tarif_heure:5000, enseignant:'Développeurs certifiés', img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=120&h=120&fit=crop', dispo:true },
  { id:'cp6', matiere:'Comptabilité',        niveaux:'BTS → Licence', tarif_heure:5000, enseignant:'Experts-comptables', img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c/120/120', dispo:true },
  { id:'cp7', matiere:'SVT / Biologie',      niveaux:'6e → Tle', tarif_heure:3000, enseignant:'Enseignants diplômés', img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c/120/120', dispo:true },
];

var RDV_COURS = [];
var COMMANDES_EDUCATION = [];
var education_seq = 1;
var PANIER_EDUCATION = [];

function initEducation() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_education') || '{}');
    if (saved.rdv) RDV_COURS = saved.rdv;
    if (saved.commandes) COMMANDES_EDUCATION = saved.commandes;
    if (saved.seq) education_seq = saved.seq;
  } catch(e) { RDV_COURS = []; COMMANDES_EDUCATION = []; }
}

function saveEducation() {
  try { localStorage.setItem('sm_education', JSON.stringify({ rdv: RDV_COURS, commandes: COMMANDES_EDUCATION, seq: education_seq })); } catch(e) {}
}

function reserverCours() {
  var client  = (document.getElementById('cours-client')  || {}).value || '';
  var tel     = (document.getElementById('cours-tel')     || {}).value || '';
  var coursId = (document.getElementById('cours-matiere') || {}).value || '';
  var date    = (document.getElementById('cours-date')    || {}).value || '';
  var heure   = (document.getElementById('cours-heure')   || {}).value || '17:00';
  var duree   = parseInt((document.getElementById('cours-duree') || {}).value) || 1;
  var niveau  = (document.getElementById('cours-niveau')  || {}).value || '';

  if (!client)  { toast('Nom requis', 'warning'); return; }
  if (!tel)     { toast('Téléphone requis', 'warning'); return; }
  if (!coursId) { toast('Choisissez une matière', 'warning'); return; }
  if (!date)    { toast('Date requise', 'warning'); return; }

  var cours = COURS_PARTICULIERS.find(function(c){ return c.id === coursId; });
  if (!cours) return;
  var prix = cours.tarif_heure * duree;

  var rdv = {
    id: 'COURS-' + String(education_seq++).padStart(3,'0'),
    client: client, tel: tel, matiere: cours.matiere,
    cours_id: coursId, date: date, heure: heure,
    duree: duree, niveau: niveau, prix: prix,
    statut: 'confirme', cree_le: new Date().toISOString()
  };
  RDV_COURS.unshift(rdv);
  saveEducation();
  closeM('m-cours');
  renderRdvCours();
  toast('Cours ' + rdv.id + ' réservé !', 'success');
  addNotif('Nouveau cours : ' + client + ' — ' + cours.matiere, 'green');
  envoyerSMSEducation('confirme', rdv);
  ['cours-client','cours-tel','cours-niveau'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

function envoyerSMSEducation(statut, rdv) {
  if (!rdv.tel) return;
  var msgs = {
    confirme: 'Bonjour ' + rdv.client + ', votre cours de ' + rdv.matiere + ' (' + rdv.cours_id + ') est confirmé le ' + formatDate(rdv.date) + ' à ' + rdv.heure + ' (' + rdv.duree + 'h). Prix : ' + rdv.prix.toLocaleString('fr-FR') + ' FCFA. SuperMarché CM Éducation',
    rappel:   'Rappel : ' + rdv.client + ', cours de ' + rdv.matiere + ' DEMAIN à ' + rdv.heure + '. Préparez votre matériel ! SuperMarché CM',
    annule:   'Bonjour ' + rdv.client + ', votre cours ' + rdv.id + ' a été annulé. Contactez-nous pour replanifier. SuperMarché CM'
  };
  var msg = msgs[statut]; if (!msg) return;
  fetch((typeof BACKEND!=='undefined'?BACKEND:'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ tel: rdv.tel.replace(/[\s+]/g,''), message: msg })
  }).catch(function(e){ console.warn('SMS education:', e); });
}

// Panier fournitures
function ajouterEducation(id) {
  var prod = EDUCATION_PRODUITS.find(function(p){ return p.id===id; });
  if (!prod) return;
  var ex = PANIER_EDUCATION.find(function(i){ return i.id===id; });
  if (ex) ex.qty++;
  else PANIER_EDUCATION.push({ id:id, qty:1 });
  updatePanierEducationUI();
  toast(prod.nom + ' ajouté !', 'success');
}

function getPanierEducationTotal() {
  return PANIER_EDUCATION.reduce(function(s,i){
    var p = EDUCATION_PRODUITS.find(function(x){ return x.id===i.id; });
    return s+(p?p.prix*i.qty:0);
  },0);
}

function updatePanierEducationUI() {
  var cnt = PANIER_EDUCATION.reduce(function(s,i){ return s+i.qty; },0);
  var badge = document.getElementById('edu-panier-badge');
  var totEl = document.getElementById('edu-panier-total');
  var btn   = document.getElementById('edu-panier-btn');
  if (badge) badge.textContent = cnt;
  if (totEl) totEl.textContent = getPanierEducationTotal().toLocaleString('fr-FR') + ' FCFA';
  if (btn)   btn.style.display = cnt>0 ? 'flex' : 'none';
}

function renderCatalogueEducation() {
  var grid = document.getElementById('education-catalogue');
  if (!grid) return;
  var filtre = (document.getElementById('edu-cat-filtre')||{}).value || '';
  var srch   = ((document.getElementById('edu-search')||{}).value||'').toLowerCase();
  var prods  = EDUCATION_PRODUITS.filter(function(p){
    return (!filtre||p.cat===filtre) && (!srch||p.nom.toLowerCase().includes(srch));
  });
  var cats_colors = { Papeterie:'#dbeafe', Materiel:'#dcfce7', Uniformes:'#ede9fe', Livres:'#fef3c7', Imprimerie:'#fee2e2' };
  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:12px">'
    + prods.map(function(p) {
        var col = cats_colors[p.cat] || '#f0faf5';
        return '<div class="cd">'
          + '<img loading="lazy" src="' + p.img + '" style="width:100%;height:95px;object-fit:cover;border-radius:8px;margin-bottom:8px">'
          + '<span style="font-size:10px;background:'+col+';padding:2px 8px;border-radius:20px;font-weight:700;color:#333">' + p.cat + '</span>'
          + '<div style="font-weight:700;font-size:13px;margin:6px 0 2px">' + p.nom + '</div>'
          + '<div style="font-size:15px;font-weight:800;color:#007A3D;margin-bottom:8px">' + p.prix.toLocaleString('fr-FR') + ' FCFA</div>'
          + '<button class="btn bp bsm" style="width:100%" onclick="ajouterEducation(\'' + p.id + '\')">Ajouter</button>'
          + '</div>';
      }).join('') + '</div>';
}

function renderCoursParticuliers() {
  var grid = document.getElementById('cours-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px">'
    + COURS_PARTICULIERS.map(function(c) {
        return '<div class="cd">'
          + '<img loading="lazy" src="' + c.img + '" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:10px">'
          + '<div style="font-weight:800;font-size:15px;margin-bottom:4px">' + c.matiere + '</div>'
          + '<div style="font-size:12px;color:#666;margin-bottom:2px">Niveaux : ' + c.niveaux + '</div>'
          + '<div style="font-size:12px;color:#555;margin-bottom:8px">' + c.enseignant + '</div>'
          + '<div style="font-size:16px;font-weight:800;color:#007A3D;margin-bottom:8px">' + c.tarif_heure.toLocaleString('fr-FR') + ' FCFA/heure</div>'
          + '<button class="btn bp bsm" style="width:100%" onclick="preRemplirCours(\'' + c.id + '\')">Réserver un cours</button>'
          + '</div>';
      }).join('') + '</div>';
}

function preRemplirCours(coursId) {
  var sel = document.getElementById('cours-matiere');
  if (sel) sel.value = coursId;
  var d = document.getElementById('cours-date');
  if (d && !d.value) d.value = new Date().toISOString().split('T')[0];
  openM('m-cours');
}

function renderRdvCours() {
  var liste = document.getElementById('cours-rdv-liste');
  if (!liste) return;
  if (RDV_COURS.length===0) { liste.innerHTML='<p style="text-align:center;color:#999;padding:20px">Aucun cours réservé</p>'; return; }
  liste.innerHTML = RDV_COURS.slice(0,15).map(function(r) {
    var stColors = { confirme:'#007A3D', annule:'#CE1126' };
    var st = stColors[r.statut] || '#999';
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">'
      + '<div><span style="font-weight:800;color:#007A3D">' + r.id + '</span>'
      + '<div style="font-weight:700;margin-top:4px">' + r.client + ' — ' + r.tel + '</div>'
      + '<div style="font-size:13px;color:#007A3D;font-weight:600">' + r.matiere + (r.niveau?' — '+r.niveau:'') + '</div>'
      + '<div style="font-size:12px;color:#666">' + formatDate(r.date) + ' à ' + r.heure + ' · ' + r.duree + 'h</div>'
      + '</div>'
      + '<div style="text-align:right">'
      + '<div style="font-size:16px;font-weight:800;color:#007A3D">' + r.prix.toLocaleString('fr-FR') + ' FCFA</div>'
      + '<span style="font-size:11px;padding:2px 10px;border-radius:20px;background:' + st + '22;color:' + st + ';font-weight:700">' + r.statut + '</span>'
      + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:8px">'
      + (r.statut==='confirme'?'<button class="btn bo bsm" onclick="envoyerSMSEducation(\'rappel\',RDV_COURS.find(function(x){return x.id===\''+r.id+'\'}))">SMS rappel</button>':'')
      + (r.statut==='confirme'?'<button class="btn bd bsm" onclick="changerStatutCours(\''+r.id+'\',\'annule\')">Annuler</button>':'')
      + '</div></div>';
  }).join('');
}

function changerStatutCours(id, statut) {
  var rdv = RDV_COURS.find(function(r){ return r.id===id; });
  if (!rdv) return;
  rdv.statut = statut;
  saveEducation();
  renderRdvCours();
  envoyerSMSEducation(statut, rdv);
  toast(id + ' — ' + statut, 'success');
}

function initPageEducation() {
  initEducation();
  renderCatalogueEducation();
  renderCoursParticuliers();
  renderRdvCours();
  updatePanierEducationUI();
  // Select matières
  var sel = document.getElementById('cours-matiere');
  if (sel) {
    sel.innerHTML = '<option value="">Choisir une matière...</option>';
    COURS_PARTICULIERS.forEach(function(c){
      var opt = document.createElement('option'); opt.value = c.id;
      opt.textContent = c.matiere + ' — ' + c.tarif_heure.toLocaleString('fr-FR') + ' F/h';
      sel.appendChild(opt);
    });
  }
  var d = document.getElementById('cours-date');
  if (d) d.min = new Date().toISOString().split('T')[0];
}
