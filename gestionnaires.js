// ═══════════════════════════════════════════════════════
//  SuperMarché CM — gestionnaires.js
//  Gestion unifiée de tous les gérants métier
//  Sociétés énergie, Docteurs, Artisans BTP, Ingénieurs,
//  Logisticiens, Libraires, Agents immo, Coiffeurs,
//  Pressings, Mécaniciens
// ═══════════════════════════════════════════════════════

var GESTIONNAIRES = {
  societes_energie: [],
  docteurs:         [],
  pharmacies:       [],
  artisans_btp:     [],
  ingenieurs_agri:  [],
  logisticiens:     [],
  libraires:        [],
  agents_immo:      [],
  salons_coiffure:  [],
  pressings:        [],
  mecaniciens:      [],
  seq: 1
};

function initGestionnaires() {
  try {
    var s = JSON.parse(localStorage.getItem('sm_gestionnaires') || 'null');
    if (s) GESTIONNAIRES = Object.assign(GESTIONNAIRES, s);
  } catch(e) {}
}

function saveGestionnaires() {
  try { localStorage.setItem('sm_gestionnaires', JSON.stringify(GESTIONNAIRES)); } catch(e) {}
  _syncGestionnairesSupabase();
}

async function _syncGestionnairesSupabase() {
  try {
    var sb = typeof _sbMain === 'function' ? _sbMain() : null;
    if (!sb) return;
    await sb.from('sm_gestionnaires').upsert({ id: 'all', data: JSON.stringify(GESTIONNAIRES) });
  } catch(e) { console.warn('syncGestionnaires:', e); }
}

// ─────────────────────────────────────────
//  HELPER : créer un compte gérant métier
// ─────────────────────────────────────────
function creerCompteMetier(nom, email, pwd, role, sm) {
  if (!email || !pwd) return;
  var compte = { email:email, pwd:pwd, nom:(nom||'').toUpperCase(), prenom:'', role:role, sm:sm||'' };

  // 1. Sauvegarder en localStorage
  if (typeof ACCOUNTS !== 'undefined') {
    var ex = ACCOUNTS.find(function(a){ return a.email === email; });
    if (!ex) {
      ACCOUNTS.push(compte);
      try { localStorage.setItem('sm_accounts', JSON.stringify(ACCOUNTS)); } catch(e) {}
    }
  }

  // 2. Sauvegarder dans Supabase sm_users (pour accès multi-appareils)
  _syncCompteMetierSupabase(compte);
}

async function _syncCompteMetierSupabase(compte) {
  try {
    if (typeof SM_CONFIG === 'undefined') return;
    var sb = typeof _sbMain === 'function' ? _sbMain() : null;
    if (!sb) return;
    await sb.from('sm_users').upsert({
      email: compte.email,
      pwd:   compte.pwd,
      nom:   compte.nom,
      prenom: compte.prenom || '',
      role:  compte.role,
      sm:    compte.sm || ''
    }, { onConflict: 'email' });
  } catch(e) {
    console.warn('Sync compte Supabase:', e);
  }
}

// ─────────────────────────────────────────
//  1. SOCIÉTÉS ÉNERGIE
// ─────────────────────────────────────────
function ajouterSocieteEnergie() {
  var nom    = v('se-nom'), email = v('se-email'), pwd = v('se-pwd');
  var tel    = v('se-tel'), ville = v('se-ville'), desc = v('se-desc');
  if (!nom)  { toast('Nom requis','warning'); return; }
  if (!email){ toast('Email requis','warning'); return; }
  if (!pwd)  { toast('Mot de passe requis','warning'); return; }
  var soc = {
    id: 'SE'+GESTIONNAIRES.seq++, nom:nom, email:email, pwd:pwd,
    tel:tel, ville:ville, desc:desc, produits:[], actif:true,
    date: new Date().toLocaleDateString('fr-FR')
  };
  GESTIONNAIRES.societes_energie.push(soc);
  saveGestionnaires();
  creerCompteMetier(nom, email, pwd, 'electricien', nom + ' — ' + ville);
  closeM('m-societe-energie');
  renderSocietesEnergie();
  toast(nom + ' ajouté !', 'success');
  addNotif('Nouvelle société énergie : ' + nom, 'green');
  ['se-nom','se-email','se-pwd','se-tel','se-ville','se-desc'].forEach(clearField);
}

function ajouterProduitSocieteEnergie(socId) {
  var nom  = v('sep-nom-'+socId);
  var prix = parseInt(v('sep-prix-'+socId)) || 0;
  if (!nom || prix <= 0) { toast('Nom et prix requis','warning'); return; }
  var soc = GESTIONNAIRES.societes_energie.find(function(s){ return s.id === socId; });
  if (!soc) return;
  if (!soc.produits) soc.produits = [];
  soc.produits.push({ id:'p'+Date.now(), nom:nom, prix:prix, stock:100, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop' });
  saveGestionnaires();
  renderSocietesEnergie();
  toast(nom + ' ajouté à ' + soc.nom, 'success');
}

function renderSocietesEnergie() {
  var z = document.getElementById('societes-energie-liste'); if (!z) return;
  if (!GESTIONNAIRES.societes_energie.length) {
    z.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucune société enregistrée</p>'; return;
  }
  z.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px">'
    + GESTIONNAIRES.societes_energie.map(function(s) {
        return '<div class="cd">'
          + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'
          + '<div><div style="font-weight:800;font-size:15px;color:#007A3D">' + s.nom + '</div>'
          + '<div style="font-size:12px;color:#666">' + (s.ville||'') + ' — ' + (s.tel||'') + '</div>'
          + '<div style="font-size:11px;color:#555;font-style:italic">' + (s.desc||'') + '</div></div>'
          + '<button class="btn bd bsm" onclick="supprimerGestionnaire(\'societes_energie\',\'' + s.id + '\')">X</button>'
          + '</div>'
          + '<div style="font-size:12px;font-weight:700;color:#555;margin-bottom:6px">Produits (' + (s.produits||[]).length + ')</div>'
          + '<div style="margin-bottom:8px">'
          + (s.produits||[]).map(function(p){ return '<span style="background:#f0faf5;border-radius:6px;padding:2px 8px;font-size:11px;margin:2px;display:inline-block">' + p.nom + ' — ' + p.prix.toLocaleString('fr-FR') + ' F</span>'; }).join('')
          + '</div>'
          + '<div style="display:flex;gap:4px">'
          + '<input type="text" id="sep-nom-' + s.id + '" placeholder="Produit" style="flex:1;padding:6px;border:1px solid var(--br);border-radius:6px;font-size:12px">'
          + '<input type="number" id="sep-prix-' + s.id + '" placeholder="Prix" style="width:80px;padding:6px;border:1px solid var(--br);border-radius:6px;font-size:12px">'
          + '<button class="btn bp bsm" onclick="ajouterProduitSocieteEnergie(\'' + s.id + '\')">+</button>'
          + '</div></div>';
      }).join('') + '</div>';
}

// ─────────────────────────────────────────
//  2. DOCTEURS & PHARMACIES (Santé)
// ─────────────────────────────────────────
function ajouterDocteur() {
  var nom   = v('doc-nom'),  email = v('doc-email'), pwd = v('doc-pwd');
  var tel   = v('doc-tel'),  spec  = v('doc-spec'), tarif = parseInt(v('doc-tarif'))||0;
  var ville = v('doc-ville'), horaires = v('doc-horaires');
  if (!nom)  { toast('Nom requis','warning'); return; }
  if (!email){ toast('Email requis','warning'); return; }
  if (!pwd)  { toast('Mot de passe requis','warning'); return; }
  var doc = {
    id: 'DOC'+GESTIONNAIRES.seq++, nom:'Dr. '+nom, email:email, pwd:pwd,
    tel:tel, spec:spec||'Médecine générale', tarif:tarif||5000,
    ville:ville||'Douala', horaires:horaires||'Lun-Ven 8h-18h',
    services:[], dispo:true, date:new Date().toLocaleDateString('fr-FR')
  };
  GESTIONNAIRES.docteurs.push(doc);
  // Aussi dans MEDECINS pour le catalogue
  if (typeof MEDECINS !== 'undefined') {
    MEDECINS.push({ id:doc.id, nom:doc.nom, spec:doc.spec, tarif:doc.tarif, dispo:true,
                    img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop', ville:doc.ville });
  }
  saveGestionnaires();
  creerCompteMetier('Dr. '+nom, email, pwd, 'docteur', doc.spec + ' — ' + ville);
  closeM('m-nouveau-docteur');
  renderDocteurs();
  if (typeof renderMedecins==='function') renderMedecins();
  toast('Dr. ' + nom + ' ajouté !', 'success');
  ['doc-nom','doc-email','doc-pwd','doc-tel','doc-horaires'].forEach(clearField);
}

function ajouterServiceDocteur(docId) {
  var svc = v('dsvc-'+docId);
  if (!svc) return;
  var doc = GESTIONNAIRES.docteurs.find(function(d){ return d.id===docId; });
  if (!doc) return;
  if (!doc.services) doc.services = [];
  doc.services.push(svc);
  saveGestionnaires();
  renderDocteurs();
}

function renderDocteurs() {
  var z = document.getElementById('docteurs-liste'); if (!z) return;
  if (!GESTIONNAIRES.docteurs.length) {
    z.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucun docteur enregistré</p>'; return;
  }
  z.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">'
    + GESTIONNAIRES.docteurs.map(function(d) {
        return '<div class="cd">'
          + '<div style="display:flex;justify-content:space-between;margin-bottom:8px">'
          + '<div><div style="font-weight:800;color:#007A3D">' + d.nom + '</div>'
          + '<div style="font-size:12px;color:#555">' + d.spec + ' — ' + d.tarif.toLocaleString('fr-FR') + ' F</div>'
          + '<div style="font-size:11px;color:#666">' + d.ville + ' · ' + d.horaires + '</div></div>'
          + '<button class="btn bd bsm" onclick="supprimerGestionnaire(\'docteurs\',\'' + d.id + '\')">X</button>'
          + '</div>'
          + '<div style="margin-bottom:6px">' + (d.services||[]).map(function(s){ return '<span style="background:#dbeafe;border-radius:6px;padding:2px 8px;font-size:10px;margin:2px;display:inline-block">' + s + '</span>'; }).join('') + '</div>'
          + '<div style="display:flex;gap:4px;margin-bottom:8px">'
          + '<input type="text" id="dsvc-' + d.id + '" placeholder="Ajouter service..." style="flex:1;padding:6px;border:1px solid var(--br);border-radius:6px;font-size:12px">'
          + '<button class="btn bp bsm" onclick="ajouterServiceDocteur(\'' + d.id + '\')">+</button>'
          + '</div>'
          + '<a href="https://wa.me/' + (d.tel||'').replace(/[\s+\-]/g,'') + '" target="_blank" class="btn bo bsm">WhatsApp</a>'
          + '</div>';
      }).join('') + '</div>';
}

function ajouterPharmacie() {
  var nom   = v('ph-nom'), email = v('ph-email'), pwd = v('ph-pwd');
  var tel   = v('ph-tel'), ville = v('ph-ville'), adresse = v('ph-adresse');
  if (!nom)  { toast('Nom requis','warning'); return; }
  if (!email){ toast('Email requis','warning'); return; }
  if (!pwd)  { toast('Mot de passe requis','warning'); return; }
  var ph = {
    id:'PH'+GESTIONNAIRES.seq++, nom:nom, email:email, pwd:pwd,
    tel:tel, ville:ville, adresse:adresse, produits:[],
    date:new Date().toLocaleDateString('fr-FR')
  };
  GESTIONNAIRES.pharmacies.push(ph);
  saveGestionnaires();
  creerCompteMetier(nom, email, pwd, 'docteur', nom + ' — ' + ville);
  closeM('m-nouvelle-pharmacie');
  renderPharmacies();
  toast(nom + ' ajoutée !', 'success');
  ['ph-nom','ph-email','ph-pwd','ph-tel','ph-ville','ph-adresse'].forEach(clearField);
}

function renderPharmacies() {
  var z = document.getElementById('pharmacies-liste'); if (!z) return;
  if (!GESTIONNAIRES.pharmacies.length) {
    z.innerHTML = '<p style="text-align:center;color:#999;padding:16px">Aucune pharmacie enregistrée</p>'; return;
  }
  z.innerHTML = GESTIONNAIRES.pharmacies.map(function(p) {
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;justify-content:space-between;align-items:center">'
      + '<div><div style="font-weight:800">' + p.nom + '</div>'
      + '<div style="font-size:12px;color:#666">' + (p.ville||'') + ' — ' + (p.adresse||'') + ' — ' + (p.tel||'') + '</div></div>'
      + '<div style="display:flex;gap:6px">'
      + '<a href="https://wa.me/' + (p.tel||'').replace(/[\s+\-]/g,'') + '" target="_blank" class="btn bo bsm">WA</a>'
      + '<button class="btn bd bsm" onclick="supprimerGestionnaire(\'pharmacies\',\'' + p.id + '\')">X</button>'
      + '</div></div></div>';
  }).join('');
}

// ─────────────────────────────────────────
//  3. ARTISANS BTP & INGÉNIEURS
// ─────────────────────────────────────────
function ajouterArtisanBTP() {
  var nom   = v('ab-nom'), email = v('ab-email'), pwd = v('ab-pwd');
  var tel   = v('ab-tel'), metier = v('ab-metier')||'Maçon', tarif = parseInt(v('ab-tarif'))||0;
  var ville = v('ab-ville'), desc = v('ab-desc');
  if (!nom)  { toast('Nom requis','warning'); return; }
  if (!email){ toast('Email requis','warning'); return; }
  if (!pwd)  { toast('Mot de passe requis','warning'); return; }
  var artisan = {
    id:'AB'+GESTIONNAIRES.seq++, nom:nom, email:email, pwd:pwd, tel:tel,
    metier:metier, tarif:tarif, ville:ville||'Douala', desc:desc,
    services:[], projets_actifs:0, actif:true,
    date:new Date().toLocaleDateString('fr-FR')
  };
  GESTIONNAIRES.artisans_btp.push(artisan);
  // Ajouter dans ARTISANS_BTP catalogue
  if (typeof ARTISANS_BTP !== 'undefined') {
    ARTISANS_BTP.push({ id:artisan.id, nom:nom, metier:metier, tarif_jour:tarif,
                        ville:ville, tel:tel, note:5.0, dispo:true });
  }
  saveGestionnaires();
  creerCompteMetier(nom, email, pwd, 'ingenieur_btp', metier + ' — ' + ville);
  closeM('m-artisan-btp');
  renderArtisansBTP();
  if (typeof renderArtisans==='function') renderArtisans();
  toast(nom + ' ajouté comme artisan BTP !', 'success');
  ['ab-nom','ab-email','ab-pwd','ab-tel','ab-ville','ab-desc'].forEach(clearField);
}

function renderArtisansBTP() {
  var z = document.getElementById('artisans-btp-liste'); if (!z) return;
  if (!GESTIONNAIRES.artisans_btp.length) {
    z.innerHTML = '<p style="text-align:center;color:#999;padding:16px">Aucun artisan enregistré</p>'; return;
  }
  z.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">'
    + GESTIONNAIRES.artisans_btp.map(function(a) {
        return '<div class="cd">'
          + '<div style="font-weight:800;color:#CE1126">' + a.nom + '</div>'
          + '<div style="font-size:12px;color:#555">' + a.metier + (a.tarif?' — '+a.tarif.toLocaleString('fr-FR')+' F/j':'') + '</div>'
          + '<div style="font-size:11px;color:#666">' + (a.ville||'') + (a.tel?' — '+a.tel:'') + '</div>'
          + '<div style="margin-top:8px;display:flex;gap:6px">'
          + '<a href="https://wa.me/' + (a.tel||'').replace(/[\s+\-]/g,'') + '" target="_blank" class="btn bo bsm">WA</a>'
          + '<button class="btn bd bsm" onclick="supprimerGestionnaire(\'artisans_btp\',\'' + a.id + '\')">X</button>'
          + '</div></div>';
      }).join('') + '</div>';
}

// ─────────────────────────────────────────
//  4. INGÉNIEURS AGRICOLES
// ─────────────────────────────────────────
function ajouterIngenieurAgricole() {
  var nom   = v('ia-nom'), email = v('ia-email'), pwd = v('ia-pwd');
  var tel   = v('ia-tel'), spec  = v('ia-spec')||'Agronomie', ville = v('ia-ville');
  if (!nom||!email||!pwd) { toast('Nom, email et mot de passe requis','warning'); return; }
  var ing = {
    id:'IA'+GESTIONNAIRES.seq++, nom:nom, email:email, pwd:pwd,
    tel:tel, spec:spec, ville:ville||'Cameroun',
    services:[], actif:true, date:new Date().toLocaleDateString('fr-FR')
  };
  GESTIONNAIRES.ingenieurs_agri.push(ing);
  saveGestionnaires();
  creerCompteMetier(nom, email, pwd, 'ingenieur_agricole', spec + ' — ' + ville);
  closeM('m-ingenieur-agri');
  renderIngenieursAgri();
  toast(nom + ' ajouté !', 'success');
  ['ia-nom','ia-email','ia-pwd','ia-tel'].forEach(clearField);
}

function renderIngenieursAgri() {
  var z = document.getElementById('ingenieurs-agri-liste'); if (!z) return;
  if (!GESTIONNAIRES.ingenieurs_agri.length) {
    z.innerHTML = '<p style="text-align:center;color:#999;padding:16px">Aucun ingénieur agricole</p>'; return;
  }
  z.innerHTML = GESTIONNAIRES.ingenieurs_agri.map(function(i) {
    return '<div class="cd" style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">'
      + '<div><div style="font-weight:800">' + i.nom + '</div>'
      + '<div style="font-size:12px;color:#007A3D">' + i.spec + '</div>'
      + '<div style="font-size:11px;color:#666">' + (i.ville||'') + (i.tel?' — '+i.tel:'') + '</div></div>'
      + '<div style="display:flex;gap:6px">'
      + '<a href="https://wa.me/' + (i.tel||'').replace(/[\s+\-]/g,'') + '" target="_blank" class="btn bo bsm">WA</a>'
      + '<button class="btn bd bsm" onclick="supprimerGestionnaire(\'ingenieurs_agri\',\'' + i.id + '\')">X</button>'
      + '</div></div>';
  }).join('');
}

// ─────────────────────────────────────────
//  5. LOGISTICIENS
// ─────────────────────────────────────────
function ajouterLogisticien() {
  var nom   = v('lg-nom'), email = v('lg-email'), pwd = v('lg-pwd');
  var tel   = v('lg-tel'), vehicule = v('lg-vehicule'), zone = v('lg-zone');
  var tarif = parseInt(v('lg-tarif'))||0;
  if (!nom||!email||!pwd) { toast('Nom, email et mot de passe requis','warning'); return; }
  var log = {
    id:'LG'+GESTIONNAIRES.seq++, nom:nom, email:email, pwd:pwd,
    tel:tel, vehicule:vehicule||'Pick-up', zone:zone||'Douala',
    tarif_jour:tarif, services:[], actif:true, date:new Date().toLocaleDateString('fr-FR')
  };
  GESTIONNAIRES.logisticiens.push(log);
  saveGestionnaires();
  creerCompteMetier(nom, email, pwd, 'logisticien', vehicule + ' — ' + zone);
  closeM('m-logisticien');
  renderLogisticiens();
  toast(nom + ' ajouté comme logisticien !', 'success');
  ['lg-nom','lg-email','lg-pwd','lg-tel'].forEach(clearField);
}

function ajouterTarifTrajet() {
  var depart  = v('tj-depart');
  var arrivee = v('tj-arrivee');
  var prix    = parseInt(v('tj-prix'))||0;
  var delai   = v('tj-delai');
  if (!depart||!arrivee||prix<=0) { toast('Départ, arrivée et prix requis','warning'); return; }
  if (typeof TARIFS_COLIS !== 'undefined') {
    TARIFS_COLIS.push({
      id: 'tc'+Date.now(),
      trajet: depart + ' → ' + arrivee,
      delai: delai||'4-6h',
      prix_kg: Math.round(prix/5),
      prix_min: prix
    });
    if (typeof renderTarifsColisGrid==='function') renderTarifsColisGrid();
    if (typeof initPageLogistique==='function') {
      var sel = document.getElementById('col-trajet');
      if (sel) {
        var opt = document.createElement('option');
        opt.value = TARIFS_COLIS[TARIFS_COLIS.length-1].id;
        opt.textContent = depart + ' → ' + arrivee + ' (' + (delai||'4-6h') + ')';
        sel.appendChild(opt);
      }
    }
  }
  closeM('m-tarif-trajet');
  toast('Trajet ' + depart + ' → ' + arrivee + ' ajouté !', 'success');
  ['tj-depart','tj-arrivee','tj-delai'].forEach(clearField);
}

function renderLogisticiens() {
  var z = document.getElementById('logisticiens-liste'); if (!z) return;
  if (!GESTIONNAIRES.logisticiens.length) {
    z.innerHTML = '<p style="text-align:center;color:#999;padding:16px">Aucun logisticien</p>'; return;
  }
  z.innerHTML = GESTIONNAIRES.logisticiens.map(function(l) {
    return '<div class="cd" style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">'
      + '<div><div style="font-weight:800">' + l.nom + '</div>'
      + '<div style="font-size:12px;color:#007A3D">' + l.vehicule + ' — ' + l.zone + '</div>'
      + (l.tarif_jour?'<div style="font-size:11px;color:#555">' + l.tarif_jour.toLocaleString('fr-FR') + ' F/jour</div>':'')
      + '</div>'
      + '<div style="display:flex;gap:6px">'
      + '<a href="https://wa.me/' + (l.tel||'').replace(/[\s+\-]/g,'') + '" target="_blank" class="btn bo bsm">WA</a>'
      + '<button class="btn bd bsm" onclick="supprimerGestionnaire(\'logisticiens\',\'' + l.id + '\')">X</button>'
      + '</div></div>';
  }).join('');
}

// ─────────────────────────────────────────
//  6. LIBRAIRES & LIBRAIRIES
// ─────────────────────────────────────────
function ajouterLibrairie() {
  var nom   = v('lib-nom'), email = v('lib-email'), pwd = v('lib-pwd');
  var tel   = v('lib-tel'), ville = v('lib-ville'), adresse = v('lib-adresse');
  if (!nom||!email||!pwd) { toast('Nom, email et mot de passe requis','warning'); return; }
  var lib = {
    id:'LB'+GESTIONNAIRES.seq++, nom:nom, email:email, pwd:pwd,
    tel:tel, ville:ville||'Douala', adresse:adresse,
    produits:[], actif:true, date:new Date().toLocaleDateString('fr-FR')
  };
  GESTIONNAIRES.libraires.push(lib);
  saveGestionnaires();
  creerCompteMetier(nom, email, pwd, 'libraire', nom + ' — ' + ville);
  closeM('m-librairie');
  renderLibrairies();
  toast(nom + ' ajoutée !', 'success');
  ['lib-nom','lib-email','lib-pwd','lib-tel','lib-ville','lib-adresse'].forEach(clearField);
}

function ajouterFournitureLibrairie(libId) {
  var nom  = v('lp-nom-'+libId);
  var prix = parseInt(v('lp-prix-'+libId))||0;
  if (!nom||prix<=0) return;
  var lib = GESTIONNAIRES.libraires.find(function(l){ return l.id===libId; });
  if (!lib) return;
  lib.produits.push({ id:'lp'+Date.now(), nom:nom, prix:prix });
  // Ajouter aussi dans EDUCATION_PRODUITS
  if (typeof EDUCATION_PRODUITS !== 'undefined') {
    EDUCATION_PRODUITS.push({ id:'ed'+Date.now(), nom:nom, cat:'Papeterie', prix:prix, stock:100, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop' });
    if (typeof renderCatalogueEducation==='function') renderCatalogueEducation();
  }
  saveGestionnaires();
  renderLibrairies();
  toast(nom + ' ajouté !', 'success');
}

function renderLibrairies() {
  var z = document.getElementById('librairies-liste'); if (!z) return;
  if (!GESTIONNAIRES.libraires.length) {
    z.innerHTML = '<p style="text-align:center;color:#999;padding:16px">Aucune librairie</p>'; return;
  }
  z.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">'
    + GESTIONNAIRES.libraires.map(function(l) {
        return '<div class="cd">'
          + '<div style="display:flex;justify-content:space-between;margin-bottom:8px">'
          + '<div><div style="font-weight:800;color:#007A3D">' + l.nom + '</div>'
          + '<div style="font-size:12px;color:#666">' + (l.ville||'') + (l.adresse?' — '+l.adresse:'') + '</div></div>'
          + '<button class="btn bd bsm" onclick="supprimerGestionnaire(\'libraires\',\'' + l.id + '\')">X</button>'
          + '</div>'
          + '<div style="font-size:12px;font-weight:600;margin-bottom:4px">' + (l.produits||[]).length + ' fourniture(s)</div>'
          + '<div style="display:flex;gap:4px">'
          + '<input type="text" id="lp-nom-' + l.id + '" placeholder="Fourniture..." style="flex:1;padding:6px;border:1px solid var(--br);border-radius:6px;font-size:12px">'
          + '<input type="number" id="lp-prix-' + l.id + '" placeholder="Prix" style="width:70px;padding:6px;border:1px solid var(--br);border-radius:6px;font-size:12px">'
          + '<button class="btn bp bsm" onclick="ajouterFournitureLibrairie(\'' + l.id + '\')">+</button>'
          + '</div></div>';
      }).join('') + '</div>';
}

// ─────────────────────────────────────────
//  7. AGENTS IMMOBILIER
// ─────────────────────────────────────────
function ajouterAgentImmobilier() {
  var nom   = v('ai-nom'), email = v('ai-email'), pwd = v('ai-pwd');
  var tel   = v('ai-tel'), ville = v('ai-ville'), desc = v('ai-desc');
  if (!nom||!email||!pwd) { toast('Nom, email et mot de passe requis','warning'); return; }
  var agent = {
    id:'AG'+GESTIONNAIRES.seq++, nom:nom, email:email, pwd:pwd,
    tel:tel, ville:ville||'Douala', desc:desc, annonces:[], actif:true,
    date:new Date().toLocaleDateString('fr-FR')
  };
  GESTIONNAIRES.agents_immo.push(agent);
  saveGestionnaires();
  creerCompteMetier(nom, email, pwd, 'immobilier', 'Agent — ' + ville);
  closeM('m-agent-immo');
  renderAgentsImmo();
  toast(nom + ' ajouté comme agent immobilier !', 'success');
  ['ai-nom','ai-email','ai-pwd','ai-tel','ai-ville','ai-desc'].forEach(clearField);
}

function ajouterAnnonce(agentId) {
  var titre   = v('ann-titre-'+agentId);
  var type    = v('ann-type-'+agentId)||'Location';
  var prix    = parseInt(v('ann-prix-'+agentId))||0;
  var adresse = v('ann-adresse-'+agentId);
  var imgUrl  = v('ann-img-'+agentId);
  var videoUrl= v('ann-video-'+agentId);
  if (!titre||prix<=0) { toast('Titre et prix requis','warning'); return; }
  var agent = GESTIONNAIRES.agents_immo.find(function(a){ return a.id===agentId; });
  if (!agent) return;
  var ann = { id:'AN'+Date.now(), titre:titre, type:type, prix:prix, adresse:adresse,
               img:imgUrl||'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop',
               video:videoUrl||'', ville:agent.ville, tel:agent.tel, dispo:true };
  agent.annonces.push(ann);
  // Ajouter dans BIENS_IMMOBILIER
  if (typeof BIENS_IMMOBILIER !== 'undefined') {
    BIENS_IMMOBILIER.unshift({ id:ann.id, type:type, cat:type==='Hotel'?'Hôtel':'Appartement',
      titre:titre, ville:agent.ville, quartier:adresse, prix:prix, img:ann.img,
      tel:agent.tel, dispo:true, desc:'Agent: '+agent.nom });
    if (typeof renderCatalogueImmo==='function') renderCatalogueImmo();
  }
  saveGestionnaires();
  renderAgentsImmo();
  toast('Annonce "' + titre + '" ajoutée !', 'success');
}

function renderAgentsImmo() {
  var z = document.getElementById('agents-immo-liste'); if (!z) return;
  if (!GESTIONNAIRES.agents_immo.length) {
    z.innerHTML = '<p style="text-align:center;color:#999;padding:16px">Aucun agent immobilier</p>'; return;
  }
  z.innerHTML = GESTIONNAIRES.agents_immo.map(function(a) {
    return '<div class="cd" style="margin-bottom:14px">'
      + '<div style="display:flex;justify-content:space-between;margin-bottom:10px">'
      + '<div><div style="font-weight:800;color:#007A3D">' + a.nom + '</div>'
      + '<div style="font-size:12px;color:#666">' + (a.ville||'') + ' — ' + (a.tel||'') + '</div>'
      + '<div style="font-size:11px;color:#555">' + (a.annonces||[]).length + ' annonce(s)</div></div>'
      + '<button class="btn bd bsm" onclick="supprimerGestionnaire(\'agents_immo\',\'' + a.id + '\')">X</button>'
      + '</div>'
      + '<div style="background:#f9fafb;border-radius:10px;padding:10px;margin-bottom:8px">'
      + '<div style="font-size:12px;font-weight:700;margin-bottom:6px">Ajouter une annonce</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:4px">'
      + '<input type="text" id="ann-titre-'+a.id+'" placeholder="Titre annonce" style="padding:6px;border:1px solid var(--br);border-radius:6px;font-size:12px">'
      + '<select id="ann-type-'+a.id+'" style="padding:6px;border:1px solid var(--br);border-radius:6px;font-size:12px"><option>Location</option><option>Vente</option><option>Hotel</option></select>'
      + '<input type="number" id="ann-prix-'+a.id+'" placeholder="Prix FCFA" style="padding:6px;border:1px solid var(--br);border-radius:6px;font-size:12px">'
      + '<input type="text" id="ann-adresse-'+a.id+'" placeholder="Quartier/adresse" style="padding:6px;border:1px solid var(--br);border-radius:6px;font-size:12px">'
      + '<input type="text" id="ann-img-'+a.id+'" placeholder="URL image" style="padding:6px;border:1px solid var(--br);border-radius:6px;font-size:12px">'
      + '<input type="text" id="ann-video-'+a.id+'" placeholder="URL vidéo (optionnel)" style="padding:6px;border:1px solid var(--br);border-radius:6px;font-size:12px">'
      + '</div>'
      + '<button class="btn bp bsm" style="width:100%" onclick="ajouterAnnonce(\'' + a.id + '\')">+ Publier annonce</button>'
      + '</div>'
      + (a.annonces||[]).slice(0,3).map(function(an){ return '<div style="font-size:11px;background:#f0faf5;padding:4px 8px;border-radius:6px;margin-bottom:3px">' + an.type + ' — ' + an.titre + ' — ' + an.prix.toLocaleString('fr-FR') + ' FCFA</div>'; }).join('')
      + '</div>';
  }).join('');
}

// ─────────────────────────────────────────
//  8. SALONS DE COIFFURE
// ─────────────────────────────────────────
function ajouterSalonCoiffure() {
  var nom    = v('sc-nom'), email = v('sc-email'), pwd = v('sc-pwd');
  var tel    = v('sc-tel'), ville = v('sc-ville'), coiffeur = v('sc-coiffeur');
  if (!nom||!email||!pwd) { toast('Nom, email et mot de passe requis','warning'); return; }
  var salon = {
    id:'SC'+GESTIONNAIRES.seq++, nom:nom, email:email, pwd:pwd,
    tel:tel, ville:ville||'Douala', coiffeur_principal:coiffeur,
    services:[], actif:true, date:new Date().toLocaleDateString('fr-FR')
  };
  GESTIONNAIRES.salons_coiffure.push(salon);
  saveGestionnaires();
  creerCompteMetier(coiffeur||nom, email, pwd, 'coiffeur', nom + ' — ' + ville);
  closeM('m-salon-coiffure');
  renderSalonsCoiffure();
  toast(nom + ' ajouté !', 'success');
  ['sc-nom','sc-email','sc-pwd','sc-tel','sc-ville','sc-coiffeur'].forEach(clearField);
}

function renderSalonsCoiffure() {
  var z = document.getElementById('salons-coiffure-liste'); if (!z) return;
  if (!GESTIONNAIRES.salons_coiffure.length) {
    z.innerHTML = '<p style="text-align:center;color:#999;padding:16px">Aucun salon de coiffure</p>'; return;
  }
  z.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px">'
    + GESTIONNAIRES.salons_coiffure.map(function(s) {
        return '<div class="cd">'
          + '<div style="font-weight:800;color:#007A3D">' + s.nom + '</div>'
          + '<div style="font-size:12px;color:#555">Coiffeur : ' + (s.coiffeur_principal||'—') + '</div>'
          + '<div style="font-size:11px;color:#666">' + (s.ville||'') + ' — ' + (s.tel||'') + '</div>'
          + '<div style="margin-top:8px;display:flex;gap:6px">'
          + '<a href="https://wa.me/' + (s.tel||'').replace(/[\s+\-]/g,'') + '" target="_blank" class="btn bo bsm">WA</a>'
          + '<button class="btn bd bsm" onclick="supprimerGestionnaire(\'salons_coiffure\',\'' + s.id + '\')">X</button>'
          + '</div></div>';
      }).join('') + '</div>';
}

// ─────────────────────────────────────────
//  9. PRESSINGS
// ─────────────────────────────────────────
function ajouterPressing() {
  var nom   = v('pr-nom'), email = v('pr-email'), pwd = v('pr-pwd');
  var tel   = v('pr-tel'), ville = v('pr-ville'), blanchisseur = v('pr-blanchisseur');
  if (!nom||!email||!pwd) { toast('Nom, email et mot de passe requis','warning'); return; }
  var press = {
    id:'PR'+GESTIONNAIRES.seq++, nom:nom, email:email, pwd:pwd,
    tel:tel, ville:ville||'Douala', blanchisseur_principal:blanchisseur,
    tarifs:[], actif:true, date:new Date().toLocaleDateString('fr-FR')
  };
  GESTIONNAIRES.pressings.push(press);
  saveGestionnaires();
  creerCompteMetier(blanchisseur||nom, email, pwd, 'blanchisseur', nom + ' — ' + ville);
  closeM('m-pressing-ajout');
  renderPressings();
  toast(nom + ' ajouté !', 'success');
  ['pr-nom','pr-email','pr-pwd','pr-tel','pr-ville','pr-blanchisseur'].forEach(clearField);
}

function renderPressings() {
  var z = document.getElementById('pressings-liste'); if (!z) return;
  if (!GESTIONNAIRES.pressings.length) {
    z.innerHTML = '<p style="text-align:center;color:#999;padding:16px">Aucun pressing</p>'; return;
  }
  z.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px">'
    + GESTIONNAIRES.pressings.map(function(p) {
        return '<div class="cd">'
          + '<div style="font-weight:800;color:#007A3D">' + p.nom + '</div>'
          + '<div style="font-size:12px;color:#555">Blanchisseur : ' + (p.blanchisseur_principal||'—') + '</div>'
          + '<div style="font-size:11px;color:#666">' + (p.ville||'') + ' — ' + (p.tel||'') + '</div>'
          + '<div style="margin-top:8px;display:flex;gap:6px">'
          + '<a href="https://wa.me/' + (p.tel||'').replace(/[\s+\-]/g,'') + '" target="_blank" class="btn bo bsm">WA</a>'
          + '<button class="btn bd bsm" onclick="supprimerGestionnaire(\'pressings\',\'' + p.id + '\')">X</button>'
          + '</div></div>';
      }).join('') + '</div>';
}

// ─────────────────────────────────────────
//  10. MÉCANICIENS
// ─────────────────────────────────────────
function ajouterMecanicien() {
  var nom    = v('mc-nom'), email = v('mc-email'), pwd = v('mc-pwd');
  var tel    = v('mc-tel'), spec  = v('mc-spec')||'Mécanique générale';
  var garage = v('mc-garage'), ville = v('mc-ville');
  if (!nom||!email||!pwd) { toast('Nom, email et mot de passe requis','warning'); return; }
  var mec = {
    id:'MC'+GESTIONNAIRES.seq++, nom:nom, email:email, pwd:pwd,
    tel:tel, spec:spec, garage:garage||nom, ville:ville||'Douala',
    services:[], rdv:[], devis:[], historique:[], actif:true,
    date:new Date().toLocaleDateString('fr-FR')
  };
  GESTIONNAIRES.mecaniciens.push(mec);
  saveGestionnaires();
  creerCompteMetier(nom, email, pwd, 'mecanicien', (garage||nom) + ' — ' + ville);
  closeM('m-mecanicien-ajout');
  renderMecaniciens();
  toast(nom + ' ajouté comme mécanicien !', 'success');
  ['mc-nom','mc-email','mc-pwd','mc-tel','mc-garage','mc-ville'].forEach(clearField);
}

function renderMecaniciens() {
  var z = document.getElementById('mecaniciens-liste'); if (!z) return;
  if (!GESTIONNAIRES.mecaniciens.length) {
    z.innerHTML = '<p style="text-align:center;color:#999;padding:16px">Aucun mécanicien</p>'; return;
  }
  z.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px">'
    + GESTIONNAIRES.mecaniciens.map(function(m) {
        var rdvs   = (typeof RESERVATIONS_AUTO!=='undefined'?RESERVATIONS_AUTO:[]).filter(function(r){ return r.email_mec===m.email; });
        var devisList = (typeof DEVIS_REPARATION!=='undefined'?DEVIS_REPARATION:[]).filter(function(d){ return d.email_mec===m.email; });
        return '<div class="cd">'
          + '<div style="display:flex;justify-content:space-between;margin-bottom:8px">'
          + '<div><div style="font-weight:800">' + m.nom + '</div>'
          + '<div style="font-size:12px;color:#007A3D">' + m.spec + '</div>'
          + '<div style="font-size:11px;color:#666">' + (m.garage||'') + ' — ' + (m.ville||'') + '</div></div>'
          + '<button class="btn bd bsm" onclick="supprimerGestionnaire(\'mecaniciens\',\'' + m.id + '\')">X</button>'
          + '</div>'
          + '<div style="display:flex;gap:8px;margin-bottom:8px">'
          + '<span style="background:#dbeafe;border-radius:6px;padding:2px 8px;font-size:11px">' + rdvs.length + ' RDV</span>'
          + '<span style="background:#dcfce7;border-radius:6px;padding:2px 8px;font-size:11px">' + devisList.length + ' devis</span>'
          + '</div>'
          + '<div style="display:flex;gap:6px">'
          + '<a href="https://wa.me/' + (m.tel||'').replace(/[\s+\-]/g,'') + '" target="_blank" class="btn bo bsm">WA</a>'
          + '</div></div>';
      }).join('') + '</div>';
}

// ─────────────────────────────────────────
//  HELPER GLOBAL
// ─────────────────────────────────────────
function supprimerGestionnaire(type, id) {
  if (!confirm('Supprimer cet élément ?')) return;
  GESTIONNAIRES[type] = GESTIONNAIRES[type].filter(function(g){ return g.id !== id; });
  saveGestionnaires();
  // Re-render selon le type
  var fns = {
    societes_energie: renderSocietesEnergie,
    docteurs: renderDocteurs,
    pharmacies: renderPharmacies,
    artisans_btp: renderArtisansBTP,
    ingenieurs_agri: renderIngenieursAgri,
    logisticiens: renderLogisticiens,
    libraires: renderLibrairies,
    agents_immo: renderAgentsImmo,
    salons_coiffure: renderSalonsCoiffure,
    pressings: renderPressings,
    mecaniciens: renderMecaniciens
  };
  if (fns[type]) fns[type]();
  toast('Élément supprimé', 'success');
}

function v(id) {
  var el = document.getElementById(id);
  return el ? (el.value || '').trim() : '';
}

function clearField(id) {
  var el = document.getElementById(id);
  if (el) el.value = '';
}
