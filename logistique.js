
function _sbLog() {
  if (typeof window.supabase === 'undefined') return null;
  try { return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key); } catch(e) { return null; }
}
async function syncLogistiqueSupabase(cmd) {
  try {
    var sb = _sbLog(); if (!sb) return;
    await sb.from('sm_commandes_logistique').upsert({
      id: cmd.id, type: cmd.type||'colis',
      client: cmd.client||cmd.expediteur||'', expediteur: cmd.expediteur||'',
      destinataire: cmd.destinataire||'', tel: cmd.tel||cmd.tel_exp||'',
      trajet: cmd.trajet||'', vehicule: cmd.vehicule||'',
      poids: cmd.poids||0, prix: cmd.prix||0, statut: cmd.statut||'recu'
    }, { onConflict: 'id' });
  } catch(e) { console.warn('[Logistique] sync:', e); }
}
async function chargerLogistiqueSupabase() {
  try {
    var sb = _sbLog(); if (!sb) return;
    var res = await sb.from('sm_commandes_logistique').select('*').order('created_at', { ascending: false });
    if (res.data && res.data.length > 0) {
      var local = JSON.parse(localStorage.getItem('sm_logistique') || '{"commandes":[]}');
      if (!local.commandes) local.commandes = [];
      res.data.forEach(function(r) {
        if (!local.commandes.find(function(x){ return x.id === r.id; })) local.commandes.unshift(r);
      });
      localStorage.setItem('sm_logistique', JSON.stringify(local));
    }
  } catch(e) { console.warn('[Logistique] charger:', e); }
}
// ═══════════════════════════════════════════════════════
//  SuperMarché CM — logistique.js
//  Logistique & Livraison : Colis + Déménagement + Location
// ═══════════════════════════════════════════════════════

var TARIFS_COLIS = [
  { id:'lc1', trajet:'Douala → Yaoundé',    delai:'4-6h',  prix_kg:500,  prix_min:2500, img:'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=250&fit=crop' },
  { id:'lc2', trajet:'Douala → Bafoussam',  delai:'3-4h',  prix_kg:600,  prix_min:2500, img:'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=250&fit=crop' },
  { id:'lc3', trajet:'Yaoundé → Douala',    delai:'4-6h',  prix_kg:500,  prix_min:2500, img:'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=250&fit=crop' },
  { id:'lc4', trajet:'Douala → Garoua',     delai:'12-14h',prix_kg:800,  prix_min:4000, img:'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop' },
  { id:'lc5', trajet:'Yaoundé → Bafoussam', delai:'3-4h',  prix_kg:600,  prix_min:2500, img:'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=250&fit=crop' },
  { id:'lc6', trajet:'Livraison locale ville',delai:'2-4h', prix_kg:300,  prix_min:1000, img:'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&h=250&fit=crop' },
];

var VEHICULES_LOCATION = [
  { id:'v1', nom:'Moto-taxi Express', capacite:'5kg max', prix_heure:1500, prix_jour:8000,  img:'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=250&fit=crop', dispo:true },
  { id:'v2', nom:'Tricycle cargo',    capacite:'200kg',   prix_heure:3000, prix_jour:15000, img:'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=250&fit=crop', dispo:true },
  { id:'v3', nom:'Pick-up utilitaire',capacite:'500kg',   prix_heure:5000, prix_jour:25000, img:'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&h=250&fit=crop', dispo:true },
  { id:'v4', nom:'Camion 3 tonnes',   capacite:'3000kg',  prix_heure:0,    prix_jour:60000, img:'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=250&fit=crop', dispo:true },
  { id:'v5', nom:'Camion 10 tonnes',  capacite:'10000kg', prix_heure:0,    prix_jour:120000,img:'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=250&fit=crop', dispo:false },
];

var COMMANDES_LOGISTIQUE = [];
var logistique_seq = 1;

function initLogistique() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_logistique') || '{}');
    if (saved.commandes) COMMANDES_LOGISTIQUE = saved.commandes;
    if (saved.seq) logistique_seq = saved.seq;
  } catch(e) { COMMANDES_LOGISTIQUE = []; }
}

function saveLogistique() {
  try { localStorage.setItem('sm_logistique', JSON.stringify({ commandes: COMMANDES_LOGISTIQUE, seq: logistique_seq })); } catch(e) {}
}

function calculerPrixColis() {
  var trajetId = (document.getElementById('col-trajet') || {}).value || '';
  var poids    = parseFloat((document.getElementById('col-poids') || {}).value) || 0;
  var tarif = TARIFS_COLIS.find(function(t){ return t.id === trajetId; });
  if (!tarif || poids <= 0) return;
  var prix = Math.max(tarif.prix_min, tarif.prix_kg * poids);
  var el = document.getElementById('col-prix-calcul');
  if (el) el.innerHTML = '<div style="background:#f0faf5;border-radius:10px;padding:12px;margin-top:8px">'
    + '<div style="font-size:13px;color:#666">Trajet : ' + tarif.trajet + ' (' + tarif.delai + ')</div>'
    + '<div style="font-size:22px;font-weight:800;color:#007A3D">' + prix.toLocaleString('fr-FR') + ' FCFA</div>'
    + '<div style="font-size:11px;color:#999">Pour ' + poids + ' kg — délai ' + tarif.delai + '</div>'
    + '</div>';
}

function creerExpeditionColis() {
  var expediteur = (document.getElementById('col-expediteur') || {}).value || '';
  var tel_exp    = (document.getElementById('col-tel-exp')    || {}).value || '';
  var destinataire=(document.getElementById('col-destinataire')|| {}).value || '';
  var tel_dest   = (document.getElementById('col-tel-dest')   || {}).value || '';
  var trajetId   = (document.getElementById('col-trajet')     || {}).value || '';
  var poids      = parseFloat((document.getElementById('col-poids') || {}).value) || 0;
  var description= (document.getElementById('col-desc')       || {}).value || '';
  var paiement   = (document.getElementById('col-paiement')   || {}).value || 'MTN MoMo';

  if (!expediteur) { toast('Nom expéditeur requis', 'warning'); return; }
  if (!tel_exp)    { toast('Téléphone expéditeur requis', 'warning'); return; }
  if (!destinataire){ toast('Nom destinataire requis', 'warning'); return; }
  if (!tel_dest)   { toast('Téléphone destinataire requis', 'warning'); return; }
  if (!trajetId)   { toast('Sélectionnez un trajet', 'warning'); return; }
  if (poids <= 0)  { toast('Poids requis', 'warning'); return; }

  var tarif = TARIFS_COLIS.find(function(t){ return t.id === trajetId; });
  var prix = tarif ? Math.max(tarif.prix_min, tarif.prix_kg * poids) : 0;

  var cmd = {
    id: 'COL-' + String(logistique_seq++).padStart(3,'0'),
    type: 'colis', expediteur: expediteur, tel_exp: tel_exp,
    destinataire: destinataire, tel_dest: tel_dest,
    trajet: tarif ? tarif.trajet : '', delai: tarif ? tarif.delai : '',
    poids: poids, description: description, paiement: paiement,
    prix: prix, statut: 'recu', cree_le: new Date().toISOString()
  };
  COMMANDES_LOGISTIQUE.unshift(cmd);
  saveLogistique();
  closeM('m-colis');
  renderCommandesLogistique();
  renderStatsLogistique();
  toast('Colis ' + cmd.id + ' enregistré !', 'success');
  addNotif('Nouveau colis : ' + expediteur + ' → ' + destinataire, 'green');
  envoyerSMSLogistique('recu', cmd);
  ['col-expediteur','col-tel-exp','col-destinataire','col-tel-dest','col-desc'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value='';
  });
}

function creerLocationVehicule() {
  var client   = (document.getElementById('loc-client')  || {}).value || '';
  var tel      = (document.getElementById('loc-tel')     || {}).value || '';
  var vehicId  = (document.getElementById('loc-vehicule')|| {}).value || '';
  var date     = (document.getElementById('loc-date')    || {}).value || '';
  var duree    = parseInt((document.getElementById('loc-duree') || {}).value) || 1;
  var adresse  = (document.getElementById('loc-adresse') || {}).value || '';

  if (!client)  { toast('Nom requis', 'warning'); return; }
  if (!tel)     { toast('Téléphone requis', 'warning'); return; }
  if (!vehicId) { toast('Sélectionnez un véhicule', 'warning'); return; }
  if (!date)    { toast('Date requise', 'warning'); return; }

  var vehic = VEHICULES_LOCATION.find(function(v){ return v.id === vehicId; });
  var prix = vehic ? vehic.prix_jour * duree : 0;

  var cmd = {
    id: 'LOC-' + String(logistique_seq++).padStart(3,'0'),
    type: 'location', client: client, tel: tel,
    vehicule: vehic ? vehic.nom : '', vehicule_id: vehicId,
    date: date, duree: duree, adresse: adresse,
    prix: prix, statut: 'confirme', cree_le: new Date().toISOString()
  };
  COMMANDES_LOGISTIQUE.unshift(cmd);
  saveLogistique();
  closeM('m-location-vehicule');
  renderCommandesLogistique();
  renderStatsLogistique();
  toast('Location ' + cmd.id + ' confirmée !', 'success');
  envoyerSMSLogistique('location_confirmee', cmd);
  ['loc-client','loc-tel','loc-adresse'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value='';
  });
}

function changerStatutLogistique(id, statut) {
  var cmd = COMMANDES_LOGISTIQUE.find(function(c){ return c.id === id; });
  if (!cmd) return;
  cmd.statut = statut;
  saveLogistique();
  renderCommandesLogistique();
  envoyerSMSLogistique(statut, cmd);
  toast(id + ' — ' + statut, 'success');
}

function envoyerSMSLogistique(statut, cmd) {
  var tel = cmd.tel_exp || cmd.tel || '';
  if (!tel) return;
  var msgs = {
    recu:              'Bonjour ' + (cmd.expediteur||cmd.client) + ', votre colis ' + cmd.id + ' (' + (cmd.poids||0) + 'kg) a été enregistré. Trajet : ' + cmd.trajet + '. Prix : ' + (cmd.prix||0).toLocaleString('fr-FR') + ' FCFA. SuperMarché CM Logistique',
    en_transit:        'Bonjour, votre colis ' + cmd.id + ' est en transit vers ' + cmd.destinataire + '. Arrivée estimée : ' + cmd.delai + '. SuperMarché CM',
    livre:             'Bonjour, votre colis ' + cmd.id + ' a été livré à ' + cmd.destinataire + ' ! Merci pour votre confiance. SuperMarché CM',
    location_confirmee:'Bonjour ' + cmd.client + ', votre location de ' + cmd.vehicule + ' le ' + formatDate(cmd.date) + ' (' + cmd.duree + ' jour(s)) est confirmée. Prix : ' + (cmd.prix||0).toLocaleString('fr-FR') + ' FCFA. SuperMarché CM',
    en_course:         'Bonjour ' + cmd.client + ', votre véhicule ' + cmd.vehicule + ' est en cours d\'utilisation. SuperMarché CM'
  };
  var msg = msgs[statut]; if (!msg) return;
  fetch((typeof BACKEND!=='undefined'?BACKEND:'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ tel: tel.replace(/[\s+]/g,''), message: msg })
  }).catch(function(e){ console.warn('SMS logistique:', e); });
}

function renderTarifsColisGrid() {
  var grid = document.getElementById('tarifs-colis-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">'
    + TARIFS_COLIS.map(function(t) {
        return '<div class="cd" style="cursor:pointer" onclick="document.getElementById(\'col-trajet\').value=\'' + t.id + '\';calculerPrixColis()">'
          + '<div style="font-weight:700;font-size:14px;margin-bottom:4px">' + t.trajet + '</div>'
          + '<div style="font-size:12px;color:#666;margin-bottom:8px">⏱ Délai : ' + t.delai + '</div>'
          + '<div style="font-size:15px;font-weight:800;color:#007A3D">À partir de ' + t.prix_min.toLocaleString('fr-FR') + ' FCFA</div>'
          + '<div style="font-size:11px;color:#999">' + t.prix_kg + ' FCFA/kg</div>'
          + '</div>';
      }).join('') + '</div>';
}

function renderVehiculesLocation() {
  var grid = document.getElementById('vehicules-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">'
    + VEHICULES_LOCATION.map(function(v) {
        return '<div class="cd">'
          + '<img loading="lazy" src="' + v.img + '" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px">'
          + '<div style="display:flex;justify-content:space-between;margin-bottom:6px">'
          + '<span style="font-weight:700;font-size:14px">' + v.nom + '</span>'
          + '<span style="font-size:11px;padding:2px 8px;border-radius:20px;background:' + (v.dispo?'#dcfce7':'#fee2e2') + ';color:' + (v.dispo?'#007A3D':'#CE1126') + ';font-weight:700">' + (v.dispo?'Disponible':'Indispo') + '</span>'
          + '</div>'
          + '<div style="font-size:12px;color:#666;margin-bottom:4px">Capacité : ' + v.capacite + '</div>'
          + (v.prix_heure > 0 ? '<div style="font-size:12px;color:#555">' + v.prix_heure.toLocaleString('fr-FR') + ' F/heure</div>' : '')
          + '<div style="font-size:15px;font-weight:800;color:#007A3D;margin-bottom:8px">' + v.prix_jour.toLocaleString('fr-FR') + ' FCFA/jour</div>'
          + (v.dispo ? '<button class="btn bp bsm" style="width:100%" onclick="preRemplirLocation(\'' + v.id + '\')">Réserver</button>' : '')
          + '</div>';
      }).join('') + '</div>';
}

function preRemplirLocation(vehicId) {
  var sel = document.getElementById('loc-vehicule');
  if (sel) sel.value = vehicId;
  var d = document.getElementById('loc-date');
  if (d && !d.value) d.value = new Date().toISOString().split('T')[0];
  openM('m-location-vehicule');
}

function renderCommandesLogistique() {
  var liste = document.getElementById('logistique-commandes');
  if (!liste) return;
  var filtre = (document.getElementById('log-filtre') || {}).value || 'tous';
  var cmds = filtre === 'tous' ? COMMANDES_LOGISTIQUE
    : COMMANDES_LOGISTIQUE.filter(function(c){ return c.statut === filtre; });
  if (cmds.length === 0) { liste.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucune commande</p>'; return; }
  var stMap = {
    recu:              ['Reçu',           '#3b82f6','#dbeafe'],
    en_transit:        ['En transit',     '#f59e0b','#fef3c7'],
    livre:             ['Livré',          '#007A3D','#dcfce7'],
    confirme:          ['Confirmé',       '#007A3D','#dcfce7'],
    en_course:         ['En course',      '#8b5cf6','#ede9fe'],
    termine:           ['Terminé',        '#6b7280','#f3f4f6'],
    annule:            ['Annulé',         '#CE1126','#fee2e2'],
  };
  liste.innerHTML = cmds.slice(0,20).map(function(c) {
    var st = stMap[c.statut] || ['—','#999','#f9fafb'];
    var isColis = c.type === 'colis';
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap">'
      + '<div style="width:42px;height:42px;border-radius:10px;background:' + (isColis?'#dbeafe':'#dcfce7') + ';display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">' + (isColis?'<img loading="lazy" src="https://img.icons8.com/ios/20/007A3D/box.png" alt="Logistique" style="width:22px;height:22px;vertical-align:middle">':'<img loading="lazy" src="https://img.icons8.com/ios/16/007A3D/car.png" alt="Auto" style="width:14px;height:14px;vertical-align:middle">') + '</div>'
      + '<div style="flex:1">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
      + '<span style="font-weight:800;color:#007A3D">' + c.id + '</span>'
      + '<span style="font-size:11px;padding:2px 10px;border-radius:20px;background:' + st[2] + ';color:' + st[1] + ';font-weight:700">' + st[0] + '</span>'
      + '</div>'
      + (isColis
          ? '<div style="font-weight:700">' + c.expediteur + ' → ' + c.destinataire + '</div><div style="font-size:12px;color:#007A3D">' + c.trajet + ' · ' + c.poids + 'kg · ' + c.delai + '</div>'
          : '<div style="font-weight:700">' + c.client + ' — ' + (c.tel||'') + '</div><div style="font-size:12px;color:#007A3D">' + c.vehicule + ' · ' + c.duree + ' jour(s) · ' + formatDate(c.date) + '</div>')
      + '</div>'
      + '<div style="font-size:18px;font-weight:800;color:#007A3D">' + (c.prix||0).toLocaleString('fr-FR') + ' FCFA</div>'
      + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
      + (isColis && c.statut==='recu'        ? '<button class="btn bp bsm" onclick="changerStatutLogistique(\''+c.id+'\',\'en_transit\')">Mettre en transit</button>' : '')
      + (isColis && c.statut==='en_transit'  ? '<button class="btn bp bsm" onclick="changerStatutLogistique(\''+c.id+'\',\'livre\')">Marquer livré</button>' : '')
      + (!isColis && c.statut==='confirme'   ? '<button class="btn bp bsm" onclick="changerStatutLogistique(\''+c.id+'\',\'en_course\')">Démarrer course</button>' : '')
      + (!isColis && c.statut==='en_course'  ? '<button class="btn bp bsm" onclick="changerStatutLogistique(\''+c.id+'\',\'termine\')">Terminé</button>' : '')
      + (c.statut!=='livre'&&c.statut!=='termine'&&c.statut!=='annule' ? '<button class="btn bd bsm" onclick="changerStatutLogistique(\''+c.id+'\',\'annule\')">Annuler</button>' : '')
      + '</div></div>';
  }).join('');
}

function renderStatsLogistique() {
  var stats = document.getElementById('logistique-stats');
  if (!stats) return;
  var encours = COMMANDES_LOGISTIQUE.filter(function(c){ return ['recu','en_transit','confirme','en_course'].includes(c.statut); }).length;
  var total   = COMMANDES_LOGISTIQUE.length;
  var ca      = COMMANDES_LOGISTIQUE.filter(function(c){ return ['livre','termine'].includes(c.statut); }).reduce(function(s,c){ return s+(c.prix||0); },0);
  stats.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">'
    + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#f59e0b">'+encours+'</div><div style="font-size:12px;color:#666">En cours</div></div>'
    + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#111">'+total+'</div><div style="font-size:12px;color:#666">Total commandes</div></div>'
    + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#007A3D">'+VEHICULES_LOCATION.filter(function(v){return v.dispo;}).length+'</div><div style="font-size:12px;color:#666">Véhicules dispo</div></div>'
    + '<div class="cd" style="text-align:center"><div style="font-size:22px;font-weight:800;color:#007A3D">'+(ca>=1000?Math.round(ca/1000)+'K':ca.toLocaleString('fr-FR'))+'</div><div style="font-size:12px;color:#666">CA FCFA</div></div>'
    + '</div>';
}

function initPageLogistique() {
  initLogistique();
  renderStatsLogistique();
  renderTarifsColisGrid();
  renderVehiculesLocation();
  renderCommandesLogistique();
  // Remplir selects
  var selTrajet = document.getElementById('col-trajet');
  if (selTrajet) {
    selTrajet.innerHTML = '<option value="">Choisir un trajet...</option>';
    TARIFS_COLIS.forEach(function(t){
      var opt = document.createElement('option'); opt.value = t.id;
      opt.textContent = t.trajet + ' (' + t.delai + ')';
      selTrajet.appendChild(opt);
    });
  }
  var selVehic = document.getElementById('loc-vehicule');
  if (selVehic) {
    selVehic.innerHTML = '<option value="">Choisir un véhicule...</option>';
    VEHICULES_LOCATION.filter(function(v){return v.dispo;}).forEach(function(v){
      var opt = document.createElement('option'); opt.value = v.id;
      opt.textContent = v.nom + ' — ' + v.prix_jour.toLocaleString('fr-FR') + ' F/jour';
      selVehic.appendChild(opt);
    });
  }
  var d = document.getElementById('loc-date');
  if (d) d.min = new Date().toISOString().split('T')[0];
}
