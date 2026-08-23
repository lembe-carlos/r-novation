
function _sbrdvsante() {
  if (typeof window.supabase === 'undefined') return null;
  try { return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key); } catch(e) { return null; }
}
async function syncrdvsanteSupabase(item) {
  try {
    var sb = _sbrdvsante(); if (!sb) return;
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
    await sb.from('sm_rdv_sante').upsert(row, { onConflict: 'id' });
  } catch(e) { console.warn('[sm_rdv_sante] sync:', e); }
}
async function chargerrdvsanteSupabase() {
  try {
    var sb = _sbrdvsante(); if (!sb) return;
    var res = await sb.from('sm_rdv_sante').select('*').order('created_at', { ascending: false });
    if (res.data && res.data.length > 0) {
      var saved = JSON.parse(localStorage.getItem('sm_sante') || '{}');
      var liste = saved.rdv || saved.devis || saved.commandes || [];
      res.data.forEach(function(r) {
        if (!liste.find(function(x){ return x.id === r.id; })) liste.unshift(r);
      });
      localStorage.setItem('sm_sante', JSON.stringify(saved));
    }
  } catch(e) { console.warn('[sm_rdv_sante] charger:', e); }
}
// ═══════════════════════════════════════════════════════
//  SuperMarché CM — sante.js
//  Santé & Médical : Pharmacie + RDV Médecin + Analyses
// ═══════════════════════════════════════════════════════

var MEDECINS = [
  { id:'md1', nom:'Dr. ESSOMBA Paul',       spec:'Médecine générale', ville:'Douala', quartier:'Akwa',      tel:'+237 677 101 001', horaires:'08h-17h', tarif:5000,  disponible:true, img:'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=250&fit=crop' },
  { id:'md2', nom:'Dr. NKOULOU Marie',      spec:'Pédiatrie',         ville:'Douala', quartier:'Bali',       tel:'+237 677 102 002', horaires:'09h-18h', tarif:8000,  disponible:true, img:'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop' },
  { id:'md3', nom:'Dr. MBARGA Jean',        spec:'Gynécologie',       ville:'Yaoundé',quartier:'Bastos',     tel:'+237 677 103 003', horaires:'08h-16h', tarif:10000, disponible:true, img:'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=250&fit=crop' },
  { id:'md4', nom:'Dr. FOUDA Christine',    spec:'Cardiologie',       ville:'Yaoundé',quartier:'Melen',      tel:'+237 677 104 004', horaires:'08h-15h', tarif:15000, disponible:false,img:'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400&h=250&fit=crop' },
  { id:'md5', nom:'Dr. ABENA Samuel',       spec:'Ophtalmologie',     ville:'Douala', quartier:'Bonanjo',    tel:'+237 677 105 005', horaires:'09h-17h', tarif:8000,  disponible:true, img:'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?w=120&h=120&fit=crop' },
  { id:'md6', nom:'Dr. TCHOUPO Alice',      spec:'Dermatologie',      ville:'Douala', quartier:'Makepe',     tel:'+237 677 106 006', horaires:'10h-18h', tarif:7000,  disponible:true, img:'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=120&h=120&fit=crop' },
];

var PHARMACIE_PRODUITS = [
  { id:'ph1',  nom:'Paracétamol 500mg x16',        cat:'Médicaments', prix:500,   stock:200, prescription:false, img:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=250&fit=crop' },
  { id:'ph2',  nom:'Amoxicilline 500mg x21',        cat:'Médicaments', prix:3500,  stock:80,  prescription:true,  img:'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop' },
  { id:'ph3',  nom:'Artémether 20mg (antipaludéen)',cat:'Médicaments', prix:2500,  stock:120, prescription:false, img:'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=250&fit=crop' },
  { id:'ph4',  nom:'Vitamine C 1000mg x30',         cat:'Vitamines',   prix:2000,  stock:100, prescription:false, img:'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=250&fit=crop' },
  { id:'ph5',  nom:'Zinc + Magnésium x60',          cat:'Vitamines',   prix:3500,  stock:80,  prescription:false, img:'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=250&fit=crop' },
  { id:'ph6',  nom:'Huile de nigelle 250ml',         cat:'Naturel',     prix:5000,  stock:50,  prescription:false, img:'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=250&fit=crop' },
  { id:'ph7',  nom:'Moringa en poudre 200g',         cat:'Naturel',     prix:3500,  stock:60,  prescription:false, img:'https://images.unsplash.com/photo-1615485290382-441e4aa8a399?w=400&h=250&fit=crop' },
  { id:'ph8',  nom:'Tensiomètre digital',            cat:'Matériel',    prix:18000, stock:15,  prescription:false, img:'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=250&fit=crop' },
  { id:'ph9',  nom:'Thermomètre infrarouge',         cat:'Matériel',    prix:12000, stock:20,  prescription:false, img:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=250&fit=crop' },
  { id:'ph10', nom:'Glucomètre + 25 bandelettes',    cat:'Matériel',    prix:22000, stock:10,  prescription:false, img:'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=250&fit=crop' },
  { id:'ph11', nom:'Masques chirurgicaux x50',       cat:'Hygiène méd.',prix:2500,  stock:200, prescription:false, img:'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?w=400&h=250&fit=crop' },
  { id:'ph12', nom:'Gants latex x100',               cat:'Hygiène méd.',prix:3500,  stock:150, prescription:false, img:'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?w=400&h=250&fit=crop' },
  { id:'ph13', nom:'Solution hydroalcoolique 500ml', cat:'Hygiène méd.',prix:1500,  stock:100, prescription:false, img:'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=250&fit=crop' },
];

var RDV_MEDECIN = [];
var sante_seq = 1;

function initSante() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_sante') || '{}');
    if (saved.rdv) RDV_MEDECIN = saved.rdv;
    if (saved.seq) sante_seq = saved.seq;
  } catch(e) { RDV_MEDECIN = []; }
}

function saveSante() {
  try { localStorage.setItem('sm_sante', JSON.stringify({ rdv: RDV_MEDECIN, seq: sante_seq })); } catch(e) {}
}

function prendreRdvMedecin() {
  var client = (document.getElementById('rdv-patient') || {}).value || '';
  var tel    = (document.getElementById('rdv-patient-tel') || {}).value || '';
  var date   = (document.getElementById('rdv-date-medecin') || {}).value || '';
  var heure  = (document.getElementById('sante-heure')  || {}).value || '';
  var mdId   = (document.getElementById('rdv-medecin-id')  || {}).value || '';
  var motif  = (document.getElementById('rdv-motif-medecin') || {}).value || '';

  if (!client) { toast('Nom requis', 'warning'); return; }
  if (!tel)    { toast('Téléphone requis', 'warning'); return; }
  if (!date)   { toast('Date requise', 'warning'); return; }
  if (!mdId)   { toast('Sélectionnez un médecin', 'warning'); return; }

  var md = MEDECINS.find(function(m){ return m.id === mdId; });
  if (!md) return;

  var rdv = {
    id: 'RDV-MD-' + String(sante_seq++).padStart(3,'0'),
    client: client, tel: tel, date: date, heure: heure || '09:00',
    medecin_id: mdId, medecin_nom: md.nom, specialite: md.spec,
    tarif: md.tarif, motif: motif, statut: 'confirme',
    cree_le: new Date().toISOString()
  };

  RDV_MEDECIN.unshift(rdv);
  saveSante();
  closeM('m-rdv-medecin');
  renderRdvMedecin();
  renderStatsSante();
  toast('RDV ' + rdv.id + ' confirmé !', 'success');
  addNotif('Nouveau RDV médecin : ' + client + ' — ' + md.nom, 'green');
  envoyerSMSSante('confirme', rdv);

  ['sante-client','sante-tel','sante-motif'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value='';
  });
}

function changerStatutRdvMedecin(id, statut) {
  var rdv = RDV_MEDECIN.find(function(r){ return r.id===id; });
  if (!rdv) return;
  rdv.statut = statut;
  saveSante();
  renderRdvMedecin();
  renderStatsSante();
  envoyerSMSSante(statut, rdv);
  toast(id + ' — ' + statut, 'success');
}

function envoyerSMSSante(statut, rdv) {
  if (!rdv.tel) return;
  var msgs = {
    confirme:  'Bonjour ' + rdv.client + ', votre RDV avec ' + rdv.medecin_nom + ' (' + rdv.specialite + ') est confirmé le ' + formatDate(rdv.date) + ' à ' + rdv.heure + '. Tarif : ' + rdv.tarif.toLocaleString('fr-FR') + ' FCFA. SuperMarché CM Santé',
    rappel:    'Rappel : ' + rdv.client + ', vous avez RDV DEMAIN à ' + rdv.heure + ' avec ' + rdv.medecin_nom + '. N\'oubliez pas votre carnet de santé. SuperMarché CM',
    termine:   'Bonjour ' + rdv.client + ', votre consultation avec ' + rdv.medecin_nom + ' est terminée. Prenez soin de vous ! SuperMarché CM Santé',
    annule:    'Bonjour ' + rdv.client + ', votre RDV ' + rdv.id + ' avec ' + rdv.medecin_nom + ' a été annulé. Contactez-nous pour replanifier. SuperMarché CM'
  };
  var msg = msgs[statut]; if (!msg) return;
  fetch((typeof BACKEND!=='undefined'?BACKEND:'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ tel: rdv.tel.replace(/[\s+]/g,''), message: msg })
  }).catch(function(e){ console.warn('SMS sante:', e); });
}

function renderMedecins() {
  var grid = document.getElementById('medecins-grid');
  if (!grid) return;
  var filtre = (document.getElementById('sante-spec-filtre') || {}).value || '';
  var mds = filtre ? MEDECINS.filter(function(m){ return m.spec === filtre; }) : MEDECINS;
  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px">'
    + mds.map(function(m) {
        return '<div class="cd">'
          + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">'
          + '<img loading="lazy" src="' + m.img + '" style="width:56px;height:56px;border-radius:50%;object-fit:cover;flex-shrink:0">'
          + '<div>'
          + '<div style="font-weight:800;font-size:14px">' + m.nom + '</div>'
          + '<div style="font-size:12px;color:#007A3D;font-weight:600">' + m.spec + '</div>'
          + '<div style="font-size:11px;color:#666">' + m.quartier + ', ' + m.ville + '</div>'
          + '</div>'
          + '</div>'
          + '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:10px">'
          + '<span style="color:#666">⏰ ' + m.horaires + '</span>'
          + '<span style="font-weight:700;color:#007A3D">' + m.tarif.toLocaleString('fr-FR') + ' FCFA</span>'
          + '</div>'
          + '<span style="font-size:11px;padding:2px 10px;border-radius:20px;background:' + (m.disponible?'#dcfce7':'#fee2e2') + ';color:' + (m.disponible?'#007A3D':'#CE1126') + ';font-weight:700">' + (m.disponible?'Disponible':'Complet') + '</span>'
          + (m.disponible ? '<button class="btn bp bsm" style="width:100%;margin-top:10px" onclick="preRemplirRdvMedecin(\'' + m.id + '\')">Prendre RDV</button>' : '')
          + '</div>';
      }).join('') + '</div>';
}

function preRemplirRdvMedecin(mdId) {
  var sel = document.getElementById('sante-medecin');
  if (sel) sel.value = mdId;
  var d = document.getElementById('sante-date');
  if (d && !d.value) d.value = new Date().toISOString().split('T')[0];
  openM('m-rdv-medecin');
}

function renderPharmacie() {
  var grid = document.getElementById('pharmacie-grid');
  if (!grid) return;
  var filtre = (document.getElementById('pharma-cat-filtre') || {}).value || '';
  var srch   = ((document.getElementById('pharma-search') || {}).value || '').toLowerCase();
  var prods  = PHARMACIE_PRODUITS.filter(function(p){
    return (!filtre || p.cat === filtre) && (!srch || p.nom.toLowerCase().includes(srch));
  });
  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px">'
    + prods.map(function(p) {
        var stCls = p.stock===0?'bgr':p.stock<10?'bgy':'bgg';
        return '<div class="cd">'
          + '<img loading="lazy" src="' + p.img + '" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px">'
          + '<div style="display:flex;justify-content:space-between;margin-bottom:4px">'
          + '<span style="font-size:10px;background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:20px;font-weight:700">' + p.cat + '</span>'
          + '<span class="badge ' + stCls + '" style="font-size:10px">' + (p.stock===0?'Rupture':'Dispo') + '</span>'
          + '</div>'
          + (p.prescription ? '<div style="font-size:10px;background:#fee2e2;color:#CE1126;padding:2px 8px;border-radius:20px;display:inline-block;margin-bottom:4px;font-weight:700">Ordonnance requise</div>' : '')
          + '<div style="font-weight:700;font-size:13px;margin-bottom:4px">' + p.nom + '</div>'
          + '<div style="font-size:16px;font-weight:800;color:#007A3D">' + p.prix.toLocaleString('fr-FR') + ' FCFA</div>'
          + '</div>';
      }).join('') + '</div>';
}

function renderRdvMedecin() {
  var liste = document.getElementById('sante-rdv-liste');
  if (!liste) return;
  if (RDV_MEDECIN.length === 0) { liste.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucun RDV</p>'; return; }
  var stMap = { confirme:['Confirmé','#007A3D','#dcfce7'], termine:['Terminé','#6b7280','#f3f4f6'], annule:['Annulé','#CE1126','#fee2e2'] };
  liste.innerHTML = RDV_MEDECIN.slice(0,20).map(function(r) {
    var st = stMap[r.statut] || ['—','#999','#f9fafb'];
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">'
      + '<div style="width:44px;height:44px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0"><img loading="lazy" src="https://img.icons8.com/ios/20/CE1126/hospital.png" alt="Sante" style="width:22px;height:22px;vertical-align:middle"></div>'
      + '<div style="flex:1">'
      + '<div style="font-weight:700">' + r.client + ' — ' + r.tel + '</div>'
      + '<div style="font-size:12px;color:#007A3D;font-weight:600">' + r.medecin_nom + ' (' + r.specialite + ')</div>'
      + '<div style="font-size:12px;color:#666">' + formatDate(r.date) + ' à ' + r.heure + '</div>'
      + (r.motif ? '<div style="font-size:11px;color:#999;font-style:italic">' + r.motif + '</div>' : '')
      + '</div>'
      + '<div style="text-align:right">'
      + '<div style="font-size:16px;font-weight:800;color:#007A3D">' + r.tarif.toLocaleString('fr-FR') + ' FCFA</div>'
      + '<span style="font-size:11px;padding:2px 10px;border-radius:20px;background:' + st[2] + ';color:' + st[1] + ';font-weight:700">' + st[0] + '</span>'
      + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
      + (r.statut==='confirme' ? '<button class="btn bp bsm" onclick="changerStatutRdvMedecin(\''+r.id+'\',\'termine\')">Terminé</button>' : '')
      + (r.statut==='confirme' ? '<button class="btn bo bsm" onclick="envoyerSMSSante(\'rappel\',RDV_MEDECIN.find(function(x){return x.id===\''+r.id+'\'}))">SMS rappel</button>' : '')
      + (r.statut==='confirme' ? '<button class="btn bd bsm" onclick="changerStatutRdvMedecin(\''+r.id+'\',\'annule\')">Annuler</button>' : '')
      + '</div></div>';
  }).join('');
}

function renderStatsSante() {
  var stats = document.getElementById('sante-stats');
  if (!stats) return;
  var rdvAujourd = RDV_MEDECIN.filter(function(r){ return r.date===new Date().toISOString().split('T')[0]&&r.statut!=='annule'; }).length;
  var total = RDV_MEDECIN.filter(function(r){ return r.statut!=='annule'; }).length;
  var ca    = RDV_MEDECIN.filter(function(r){ return r.statut==='termine'; }).reduce(function(s,r){ return s+r.tarif; },0);
  var medsDispo = MEDECINS.filter(function(m){ return m.disponible; }).length;
  stats.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">'
    + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#3b82f6">'+medsDispo+'</div><div style="font-size:12px;color:#666">Médecins disponibles</div></div>'
    + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#007A3D">'+rdvAujourd+'</div><div style="font-size:12px;color:#666">RDV aujourd\'hui</div></div>'
    + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#111">'+total+'</div><div style="font-size:12px;color:#666">Total RDV</div></div>'
    + '<div class="cd" style="text-align:center"><div style="font-size:22px;font-weight:800;color:#007A3D">'+(ca>=1000?Math.round(ca/1000)+'K':ca)+'</div><div style="font-size:12px;color:#666">CA FCFA</div></div>'
    + '</div>';
}

function initPageSante() {
  initSante();
  renderStatsSante();
  renderMedecins();
  renderPharmacie();
  renderRdvMedecin();
  // Remplir select médecins
  var sel = document.getElementById('sante-medecin');
  if (sel) {
    sel.innerHTML = '<option value="">Choisir un médecin...</option>';
    MEDECINS.forEach(function(m){
      var opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.nom + ' — ' + m.spec + ' (' + m.tarif.toLocaleString('fr-FR') + ' F)';
      opt.disabled = !m.disponible;
      sel.appendChild(opt);
    });
  }
  var d = document.getElementById('sante-date');
  if (d) d.min = new Date().toISOString().split('T')[0];
}

// ═══════════════════════════════════════════════════════
//  AMÉLIORATIONS SANTÉ
//  1. Dossier patient + historique consultations
//  2. Bouton urgence hôpitaux
//  3. Rappel médicament par SMS
// ═══════════════════════════════════════════════════════

var HOPITAUX_URGENCE = [
  { nom:'CHU de Douala',            tel:'233 42 76 26', ville:'Douala',  type:'CHU' },
  { nom:'Hôpital Laquintinie',      tel:'233 42 64 14', ville:'Douala',  type:'CHU' },
  { nom:'Polyclinique La Caiman',   tel:'233 43 20 20', ville:'Douala',  type:'Privé' },
  { nom:'CHU de Yaoundé',           tel:'222 23 10 59', ville:'Yaoundé', type:'CHU' },
  { nom:'Hôpital Central Yaoundé',  tel:'222 23 40 40', ville:'Yaoundé', type:'CHU' },
  { nom:'Hôpital Gynéco-Obstétrique',tel:'222 20 08 02',ville:'Yaoundé', type:'Spécialisé' },
  { nom:'SAMU Cameroun',            tel:'15',           ville:'National',type:'Urgences' },
  { nom:'Croix-Rouge Cameroun',     tel:'222 22 15 66', ville:'National',type:'Urgences' },
];

var DOSSIERS_PATIENTS = [];
var RAPPELS_MEDICAMENTS = [];

function initDossiersSante() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_dossiers') || '{}');
    if (saved.dossiers)  DOSSIERS_PATIENTS     = saved.dossiers;
    if (saved.rappels)   RAPPELS_MEDICAMENTS   = saved.rappels;
  } catch(e) {}
}

function saveDossiersSante() {
  try { localStorage.setItem('sm_dossiers', JSON.stringify({ dossiers: DOSSIERS_PATIENTS, rappels: RAPPELS_MEDICAMENTS })); } catch(e) {}
}

// ── Créer/mettre à jour dossier patient ──
function creerDossierPatient() {
  var nom      = (document.getElementById('dos-nom')    || {}).value || '';
  var tel      = (document.getElementById('dos-tel')    || {}).value || '';
  var naissance= (document.getElementById('dos-naissance')||{}).value|| '';
  var groupe   = (document.getElementById('dos-groupe') || {}).value || '';
  var allergies= (document.getElementById('dos-allergies')||{}).value||'';
  var antecedents=(document.getElementById('dos-antecedents')||{}).value||'';

  if (!nom) { toast('Nom requis', 'warning'); return; }
  if (!tel) { toast('Téléphone requis', 'warning'); return; }

  var existing = DOSSIERS_PATIENTS.find(function(d){ return d.tel === tel; });
  if (existing) {
    existing.nom = nom; existing.naissance = naissance;
    existing.groupe = groupe; existing.allergies = allergies;
    existing.antecedents = antecedents;
    existing.maj = new Date().toISOString();
    toast('Dossier mis à jour !', 'success');
  } else {
    DOSSIERS_PATIENTS.push({
      id: 'DOS-' + Date.now(), nom: nom, tel: tel,
      naissance: naissance, groupe: groupe, allergies: allergies,
      antecedents: antecedents, consultations: [],
      cree_le: new Date().toISOString(), maj: new Date().toISOString()
    });
    toast('Dossier créé pour ' + nom, 'success');
  }
  saveDossiersSante();
  closeM('m-dossier-patient');
  renderDossiersPatients();
  ['dos-nom','dos-tel','dos-allergies','dos-antecedents'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value='';
  });
}

// ── Ajouter consultation au dossier ──
function ajouterConsultation(dossierId) {
  var dossier = DOSSIERS_PATIENTS.find(function(d){ return d.id === dossierId; });
  if (!dossier) return;
  var notes   = prompt('Notes de consultation :');
  if (!notes) return;
  var medecin = prompt('Médecin :') || 'Non précisé';
  dossier.consultations.unshift({
    date: new Date().toISOString(), medecin: medecin, notes: notes
  });
  dossier.maj = new Date().toISOString();
  saveDossiersSante();
  renderDossiersPatients();
  toast('Consultation ajoutée', 'success');
}

// ── Render dossiers ──
function renderDossiersPatients() {
  var liste = document.getElementById('dossiers-liste');
  if (!liste) return;
  var srch = ((document.getElementById('dos-search') || {}).value || '').toLowerCase();
  var dossiers = srch
    ? DOSSIERS_PATIENTS.filter(function(d){ return d.nom.toLowerCase().includes(srch) || d.tel.includes(srch); })
    : DOSSIERS_PATIENTS;
  if (dossiers.length === 0) {
    liste.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucun dossier patient</p>';
    return;
  }
  liste.innerHTML = dossiers.map(function(d) {
    var age = d.naissance ? Math.floor((Date.now() - new Date(d.naissance)) / (365.25*24*3600*1000)) : '—';
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap">'
      + '<div style="width:44px;height:44px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0"><img loading="lazy" src="https://img.icons8.com/ios/20/CE1126/hospital.png" alt="Sante" style="width:22px;height:22px;vertical-align:middle"></div>'
      + '<div style="flex:1">'
      + '<div style="font-weight:800;font-size:14px">' + d.nom + '</div>'
      + '<div style="font-size:12px;color:#666">' + d.tel + ' · ' + (age !== '—' ? age + ' ans' : '') + (d.groupe ? ' · Groupe ' + d.groupe : '') + '</div>'
      + (d.allergies ? '<div style="font-size:11px;background:#fee2e2;color:#CE1126;padding:2px 8px;border-radius:20px;display:inline-block;margin-top:4px"><img loading="lazy" src="https://img.icons8.com/ios/16/CE1126/warning-shield.png" alt="Attention" style="width:14px;height:14px;vertical-align:middle"> ' + d.allergies + '</div>' : '')
      + '<div style="font-size:12px;color:#666;margin-top:4px">' + d.consultations.length + ' consultation(s)</div>'
      + (d.consultations.length > 0 ? '<div style="font-size:11px;color:#999;font-style:italic;margin-top:2px">Dernière : ' + new Date(d.consultations[0].date).toLocaleDateString('fr-FR') + ' — ' + d.consultations[0].medecin + '</div>' : '')
      + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
      + '<button class="btn bp bsm" onclick="ajouterConsultation(\'' + d.id + '\')">+ Consultation</button>'
      + '<button class="btn bo bsm" onclick="afficherConsultations(\'' + d.id + '\')">Historique</button>'
      + '<button class="btn bo bsm" onclick="ajouterRappelMedicament(\'' + d.id + '\')">+ Rappel médicament</button>'
      + '</div>'
      + '</div>';
  }).join('');
}

// ── Afficher historique consultations ──
function afficherConsultations(dossierId) {
  var dossier = DOSSIERS_PATIENTS.find(function(d){ return d.id === dossierId; });
  if (!dossier || dossier.consultations.length === 0) { toast('Aucune consultation enregistrée', 'warning'); return; }
  var html = dossier.consultations.map(function(c) {
    return '<div style="padding:10px;border-left:3px solid #007A3D;margin-bottom:8px;background:#f9fafb;border-radius:0 8px 8px 0">'
      + '<div style="font-size:12px;color:#666">' + new Date(c.date).toLocaleDateString('fr-FR') + ' — ' + c.medecin + '</div>'
      + '<div style="font-size:13px;margin-top:4px">' + c.notes + '</div>'
      + '</div>';
  }).join('');
  var zone = document.getElementById('histo-consultations');
  if (zone) { zone.innerHTML = html; zone.style.display = 'block'; }
}

// ── Rappel médicament par SMS ──
function ajouterRappelMedicament(dossierId) {
  var dossier = DOSSIERS_PATIENTS.find(function(d){ return d.id === dossierId; });
  if (!dossier) return;
  var med    = prompt('Médicament et dosage (ex: Paracétamol 500mg) :');
  if (!med) return;
  var heure  = prompt('Heure de prise (ex: 08:00, 14:00, 20:00) :') || '08:00';
  var rappel = {
    id: 'RAP-' + Date.now(), dossier_id: dossierId,
    patient: dossier.nom, tel: dossier.tel,
    medicament: med, heure: heure, actif: true,
    cree_le: new Date().toISOString()
  };
  RAPPELS_MEDICAMENTS.push(rappel);
  saveDossiersSante();
  toast('Rappel créé — SMS envoyé à ' + dossier.tel, 'success');
  // SMS immédiat de confirmation
  envoyerSMSRappelMed(rappel, true);
}

function envoyerSMSRappelMed(rappel, confirmation) {
  if (!rappel.tel) return;
  var msg = confirmation
    ? 'Bonjour ' + rappel.patient + ', rappel médicament activé : ' + rappel.medicament + ' chaque jour à ' + rappel.heure + '. SuperMarché CM Santé'
    : 'Rappel : ' + rappel.patient + ', pensez à prendre votre ' + rappel.medicament + '. Bonne santé ! SuperMarché CM';
  fetch((typeof BACKEND!=='undefined'?BACKEND:'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ tel: rappel.tel.replace(/[\s+]/g,''), message: msg })
  }).catch(function(e){ console.warn('SMS rappel:', e); });
}

// ── Bouton urgence ──
function renderBoutonUrgence() {
  var zone = document.getElementById('urgences-zone');
  if (!zone) return;
  zone.innerHTML = '<div style="background:#fee2e2;border:2px solid #CE1126;border-radius:16px;padding:16px;margin-bottom:16px">'
    + '<div style="font-weight:800;font-size:16px;color:#CE1126;margin-bottom:12px"><img loading="lazy" src="https://img.icons8.com/ios/20/CE1126/siren.png" alt="Urgence" style="width:22px;height:22px;vertical-align:middle"> NUMÉROS D\'URGENCE — Cameroun</div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">'
    + HOPITAUX_URGENCE.map(function(h) {
        return '<div style="background:#fff;border-radius:10px;padding:12px;border:1px solid #fecaca">'
          + '<div style="font-weight:700;font-size:13px">' + h.nom + '</div>'
          + '<div style="font-size:11px;color:#666;margin-bottom:8px">' + h.ville + ' · ' + h.type + '</div>'
          + '<a href="tel:' + h.tel + '" style="display:flex;align-items:center;gap:8px;background:#CE1126;color:#fff;padding:8px 14px;border-radius:20px;text-decoration:none;font-weight:700;font-size:13px;width:fit-content">'
          + '<img loading="lazy" src="https://img.icons8.com/ios/16/007A3D/phone.png" alt="Appel" style="width:14px;height:14px;vertical-align:middle"> ' + h.tel + '</a>'
          + '</div>';
      }).join('')
    + '</div></div>';
}

// Override initPageSante
var _initPageSanteOrig = initPageSante;
initPageSante = function() {
  initSante();
  initDossiersSante();
  renderStatsSante();
  renderMedecins();
  renderPharmacie();
  renderRdvMedecin();
  renderBoutonUrgence();
  renderDossiersPatients();
  var sel = document.getElementById('sante-medecin');
  if (sel) {
    sel.innerHTML = '<option value="">Choisir...</option>';
    MEDECINS.forEach(function(m){
      var opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.nom + ' — ' + m.spec + ' (' + m.tarif.toLocaleString('fr-FR') + ' F)';
      opt.disabled = !m.disponible;
      sel.appendChild(opt);
    });
  }
  var d = document.getElementById('sante-date');
  if (d) d.min = new Date().toISOString().split('T')[0];
};

// Alias pour compatibilité onclick
function creerRdvSante() { prendreRdvMedecin(); }
