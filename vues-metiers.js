// ═══════════════════════════════════════════════════════
//  SuperMarché CM — vues-metiers.js
//  Vues dédiées : Coiffeur, Blanchisseur, Mécanicien, Menuisier
// ═══════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════
//  VUE COIFFEUR
// ══════════════════════════════════════════════════════
var vc_filtre = 'today';

function initVueCoiffeur() {
  if (typeof initCoiffure === 'function') initCoiffure();
  if (typeof chargerResasSupabase === 'function') {
    chargerResasSupabase().then(function() {
      renderVueCoiffeur();
    });
  } else {
    renderVueCoiffeur();
  }
}

function filtrerVueCoiffeur(filtre, btn) {
  vc_filtre = filtre;
  document.querySelectorAll('#page-vue-coiffeur .btn').forEach(function(b){ b.classList.remove('active'); b.classList.add('bo'); b.classList.remove('bp'); });
  if (btn) { btn.classList.remove('bo'); btn.classList.add('bp'); }
  renderVueCoiffeur();
}

function renderVueCoiffeur() {
  var today = new Date().toISOString().split('T')[0];
  var lundi = new Date();
  lundi.setDate(lundi.getDate() - lundi.getDay() + 1);
  var dimanche = new Date(lundi);
  dimanche.setDate(lundi.getDate() + 6);

  var resas = (typeof RESERVATIONS_COIFFURE !== 'undefined') ? RESERVATIONS_COIFFURE : [];

  var filtrees;
  if (vc_filtre === 'today') {
    filtrees = resas.filter(function(r){ return r.date === today && r.statut !== 'annulee'; });
  } else if (vc_filtre === 'week') {
    filtrees = resas.filter(function(r){
      return r.date >= lundi.toISOString().split('T')[0] &&
             r.date <= dimanche.toISOString().split('T')[0] &&
             r.statut !== 'annulee';
    });
  } else {
    filtrees = resas.filter(function(r){ return r.statut !== 'annulee'; });
  }

  // Stats
  var rdvAujourdhui = resas.filter(function(r){ return r.date===today && r.statut!=='annulee'; }).length;
  var rdvSemaine    = resas.filter(function(r){ return r.date>=lundi.toISOString().split('T')[0] && r.date<=dimanche.toISOString().split('T')[0] && r.statut!=='annulee'; }).length;
  var rdvEnCours    = resas.filter(function(r){ return r.statut==='en_cours'; }).length;

  var stats = document.getElementById('vc-stats');
  if (stats) {
    stats.innerHTML =
      '<div class="cd" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#007A3D">' + rdvAujourdhui + '</div><div style="font-size:12px;color:#666">RDV aujourd\'hui</div></div>'
      + '<div class="cd" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#3b82f6">' + rdvSemaine + '</div><div style="font-size:12px;color:#666">Cette semaine</div></div>'
      + '<div class="cd" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#f59e0b">' + rdvEnCours + '</div><div style="font-size:12px;color:#666">En cours</div></div>';
  }

  var liste = document.getElementById('vc-rdv-liste');
  if (!liste) return;

  if (filtrees.length === 0) {
    liste.innerHTML = '<div class="cd" style="text-align:center;padding:30px;color:#999">'
      + '<div style="font-size:40px;margin-bottom:10px"><img src="https://img.icons8.com/ios/16/007A3D/scissors.png" alt="Coiffure" style="width:14px;height:14px;vertical-align:middle"></div>'
      + '<div style="font-weight:700;margin-bottom:6px">Aucun rendez-vous</div>'
      + '<div style="font-size:13px">Pas de RDV pour cette période</div>'
      + '</div>';
    return;
  }

  var stMap = {
    confirme:  ['Confirmé',  '#007A3D', '#dcfce7'],
    en_cours:  ['En cours',  '#3b82f6', '#dbeafe'],
    termine:   ['Terminé',   '#6b7280', '#f3f4f6'],
    no_show:   ['No-show',   '#f59e0b', '#fef3c7'],
  };

  liste.innerHTML = filtrees.map(function(r) {
    var st = stMap[r.statut] || ['—','#999','#f9fafb'];
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">'
      + '<div style="width:50px;height:50px;border-radius:50%;background:' + (r.genre==='femme'?'#fce7f3':'#dbeafe') + ';display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">' + (r.genre==='femme'?'<img src="https://img.icons8.com/ios/16/CE1126/user-female.png" alt="Femme" style="width:14px;height:14px;vertical-align:middle">':'<img src="https://img.icons8.com/ios/16/007A3D/user-male.png" alt="Homme" style="width:14px;height:14px;vertical-align:middle">') + '</div>'
      + '<div style="flex:1;min-width:140px">'
      + '<div style="font-weight:700;font-size:15px">' + r.client + '</div>'
      + '<div style="font-size:12px;color:#666">' + r.tel + '</div>'
      + (r.notes ? '<div style="font-size:12px;color:#8b5cf6;font-style:italic;margin-top:2px">Note : ' + r.notes + '</div>' : '')
      + '</div>'
      + '<div style="text-align:center">'
      + '<div style="font-size:20px;font-weight:800;color:#007A3D">' + r.heure + '</div>'
      + '<div style="font-size:12px;color:#555">' + (typeof formatDate==='function'?formatDate(r.date):r.date) + '</div>'
      + '<div style="font-size:13px;font-weight:600;color:#111;margin-top:2px">' + r.service + '</div>'
      + '<div style="font-size:12px;color:#007A3D">' + r.duree + ' min — ' + r.prix.toLocaleString('fr-FR') + ' FCFA</div>'
      + '</div>'
      + '<span style="padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;background:' + st[2] + ';color:' + st[1] + '">' + st[0] + '</span>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
      + (r.statut==='confirme' ? '<button class="btn bp bsm" onclick="changerStatutResa(\''+r.id+'\',\'en_cours\');renderVueCoiffeur()">Démarrer</button>' : '')
      + (r.statut==='en_cours' ? '<button class="btn bp bsm" onclick="changerStatutResa(\''+r.id+'\',\'termine\');renderVueCoiffeur()">Terminer</button>' : '')
      + (r.statut==='confirme' ? '<button class="btn bd bsm" onclick="changerStatutResa(\''+r.id+'\',\'no_show\');renderVueCoiffeur()">No-show</button>' : '')
      + '</div>'
      + '</div>'
      + '</div>';
  }).join('');
}

// ══════════════════════════════════════════════════════
//  VUE BLANCHISSEUR
// ══════════════════════════════════════════════════════
var vb_filtre = 'actif';

function initVueBlanchisseur() {
  if (typeof initPressing === 'function') initPressing();
  if (typeof chargerPressingSupabase === 'function') {
    chargerPressingSupabase().then(function() { renderVueBlanchisseur(); });
  } else {
    renderVueBlanchisseur();
  }
}

function filtrerVueBlanchisseur(filtre, btn) {
  vb_filtre = filtre;
  document.querySelectorAll('#page-vue-blanchisseur .btn').forEach(function(b){ b.classList.remove('active','bp'); b.classList.add('bo'); });
  if (btn) { btn.classList.remove('bo'); btn.classList.add('bp'); }
  renderVueBlanchisseur();
}

function renderVueBlanchisseur() {
  var cmds = (typeof PRESSING_COMMANDES !== 'undefined') ? PRESSING_COMMANDES : [];
  var actifs = cmds.filter(function(c){ return ['depose','en_lavage'].includes(c.statut); });
  var prets  = cmds.filter(function(c){ return c.statut === 'pret'; });

  var filtrees;
  if (vb_filtre === 'actif') filtrees = actifs;
  else if (vb_filtre === 'pret') filtrees = prets;
  else filtrees = cmds.filter(function(c){ return c.statut !== 'annule'; });

  var stats = document.getElementById('vb-stats');
  if (stats) {
    stats.innerHTML =
      '<div class="cd" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#f59e0b">' + actifs.length + '</div><div style="font-size:12px;color:#666">En cours de traitement</div></div>'
      + '<div class="cd" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#007A3D">' + prets.length + '</div><div style="font-size:12px;color:#666">Prêts à récupérer</div></div>'
      + '<div class="cd" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#111">' + cmds.length + '</div><div style="font-size:12px;color:#666">Total dépôts</div></div>';
  }

  var liste = document.getElementById('vb-pressing-liste');
  if (!liste) return;

  if (filtrees.length === 0) {
    liste.innerHTML = '<div class="cd" style="text-align:center;padding:30px;color:#999">'
      + '<div style="font-size:40px;margin-bottom:10px"><img src="https://img.icons8.com/ios/16/007A3D/shirt.png" alt="Pressing" style="width:14px;height:14px;vertical-align:middle"></div>'
      + '<div style="font-weight:700">Aucun dépôt en attente</div>'
      + '</div>';
    return;
  }

  var stMap = {
    depose:    ['Déposé',    '#f59e0b', '#fef3c7'],
    en_lavage: ['En lavage', '#3b82f6', '#dbeafe'],
    pret:      ['Prêt',      '#007A3D', '#dcfce7'],
    livre:     ['Livré',     '#6b7280', '#f3f4f6'],
  };

  liste.innerHTML = filtrees.map(function(c) {
    var st = stMap[c.statut] || ['—','#999','#f9fafb'];
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">'
      + '<div style="width:44px;height:44px;border-radius:10px;background:#f0faf5;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0"><img src="https://img.icons8.com/ios/16/007A3D/shirt.png" alt="Pressing" style="width:14px;height:14px;vertical-align:middle"></div>'
      + '<div style="flex:1;min-width:150px">'
      + '<div style="font-weight:700;font-size:14px">' + c.id + ' — ' + c.client + '</div>'
      + '<div style="font-size:12px;color:#666">' + c.tel + '</div>'
      + '<div style="font-size:12px;color:#555;margin-top:2px">' + c.pieces.map(function(p){ return p.qte+' '+p.unite+' '+p.nom; }).join(' · ') + '</div>'
      + (c.notes ? '<div style="font-size:11px;color:#8b5cf6;font-style:italic">Note : ' + c.notes + '</div>' : '')
      + '</div>'
      + '<div style="text-align:center">'
      + '<div style="font-size:18px;font-weight:800;color:#007A3D">' + c.total.toLocaleString('fr-FR') + ' F</div>'
      + (c.livraison ? '<div style="font-size:11px;background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:20px;margin-top:3px">Livraison demandée</div>' : '')
      + '</div>'
      + '<span style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;background:' + st[2] + ';color:' + st[1] + '">' + st[0] + '</span>'
      + '<div style="display:flex;gap:5px;flex-wrap:wrap">'
      + (c.statut==='depose'   ? '<button class="btn bp bsm" onclick="changerStatutPressing(\''+c.id+'\',\'en_lavage\');renderVueBlanchisseur()">Lancer lavage</button>' : '')
      + (c.statut==='en_lavage'? '<button class="btn bp bsm" onclick="changerStatutPressing(\''+c.id+'\',\'pret\');renderVueBlanchisseur()">Marquer prêt</button>' : '')
      + (c.statut==='pret'     ? '<button class="btn bp bsm" onclick="changerStatutPressing(\''+c.id+'\',\'livre\');renderVueBlanchisseur()">Marquer livré</button>' : '')
      + '</div>'
      + '</div>'
      + '</div>';
  }).join('');
}

// ══════════════════════════════════════════════════════
//  VUE MÉCANICIEN
// ══════════════════════════════════════════════════════
var vm_filtre = 'today';

function initVueMecanicien() {
  if (typeof initAuto === 'function') initAuto();
  if (typeof chargerRdvAutoSupabase === 'function') {
    chargerRdvAutoSupabase().then(function() { renderVueMecanicien(); });
  } else {
    renderVueMecanicien();
  }
}

function filtrerVueMecanicien(filtre, btn) {
  vm_filtre = filtre;
  document.querySelectorAll('#page-vue-mecanicien .btn.bsm').forEach(function(b){ b.classList.remove('bp'); b.classList.add('bo'); });
  if (btn) { btn.classList.remove('bo'); btn.classList.add('bp'); }
  renderVueMecanicien();
}

function renderVueMecanicien() {
  var today = new Date().toISOString().split('T')[0];
  var rdvs  = (typeof RESERVATIONS_AUTO !== 'undefined') ? RESERVATIONS_AUTO : [];

  var filtrees = vm_filtre === 'today'
    ? rdvs.filter(function(r){ return r.date===today && r.statut!=='annulee'; })
    : rdvs.filter(function(r){ return r.statut!=='annulee'; });

  var rdvAujourdhui = rdvs.filter(function(r){ return r.date===today && r.statut!=='annulee'; }).length;
  var enCours       = rdvs.filter(function(r){ return r.statut==='en_cours'; }).length;
  var termines      = rdvs.filter(function(r){ return r.statut==='termine'; }).length;

  var stats = document.getElementById('vm-stats');
  if (stats) {
    stats.innerHTML =
      '<div class="cd" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#007A3D">' + rdvAujourdhui + '</div><div style="font-size:12px;color:#666">RDV aujourd\'hui</div></div>'
      + '<div class="cd" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#3b82f6">' + enCours + '</div><div style="font-size:12px;color:#666">En cours</div></div>'
      + '<div class="cd" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#6b7280">' + termines + '</div><div style="font-size:12px;color:#666">Terminés</div></div>';
  }

  var liste = document.getElementById('vm-rdv-liste');
  if (liste) {
    if (filtrees.length === 0) {
      liste.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucun RDV pour cette période</p>';
    } else {
      var stMap = { confirme:['Confirmé','#007A3D','#dcfce7'], en_cours:['En cours','#3b82f6','#dbeafe'], termine:['Terminé','#6b7280','#f3f4f6'] };
      liste.innerHTML = filtrees.map(function(r) {
        var st = stMap[r.statut] || ['—','#999','#f9fafb'];
        return '<div class="cd" style="margin-bottom:10px">'
          + '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">'
          + '<div style="font-size:30px"><img src="https://img.icons8.com/ios/16/007A3D/car.png" alt="Auto" style="width:14px;height:14px;vertical-align:middle"></div>'
          + '<div style="flex:1;min-width:150px">'
          + '<div style="font-weight:700">' + r.client + ' — ' + r.tel + '</div>'
          + '<div style="font-size:13px;color:#007A3D;font-weight:600">' + r.vehicule + '</div>'
          + '<div style="font-size:12px;color:#555">' + r.service + ' — ' + r.duree + ' min</div>'
          + (r.notes ? '<div style="font-size:11px;color:#8b5cf6;font-style:italic">Note : ' + r.notes + '</div>' : '')
          + '</div>'
          + '<div style="text-align:center">'
          + '<div style="font-size:20px;font-weight:800;color:#007A3D">' + r.heure + '</div>'
          + '<div style="font-size:12px">' + (typeof formatDate==='function'?formatDate(r.date):r.date) + '</div>'
          + '<div style="font-size:14px;font-weight:700">' + r.prix.toLocaleString('fr-FR') + ' FCFA</div>'
          + '</div>'
          + '<span style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;background:' + st[2] + ';color:' + st[1] + '">' + st[0] + '</span>'
          + '<div style="display:flex;gap:5px">'
          + (r.statut==='confirme' ? '<button class="btn bp bsm" onclick="changerStatutAuto(\''+r.id+'\',\'en_cours\');renderVueMecanicien()">Démarrer</button>' : '')
          + (r.statut==='en_cours' ? '<button class="btn bp bsm" onclick="changerStatutAuto(\''+r.id+'\',\'termine\');renderVueMecanicien()">Terminer</button>' : '')
          + '</div>'
          + '</div></div>';
      }).join('');
    }
  }

  // Pièces disponibles (stock > 0 uniquement)
  var pieces = document.getElementById('vm-pieces');
  if (pieces) {
    var dispos = (typeof AUTO_PIECES !== 'undefined') ? AUTO_PIECES.filter(function(p){ return p.stock > 0; }) : [];
    if (dispos.length === 0) {
      pieces.innerHTML = '<p style="text-align:center;color:#999;padding:10px">Aucune pièce en stock</p>';
    } else {
      pieces.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px">'
        + dispos.map(function(p) {
            var stCls = p.stock < 3 ? 'bgy' : 'bgg';
            return '<div class="cd" style="padding:10px">'
              + '<div style="font-size:10px;background:#f0faf5;color:#007A3D;padding:2px 6px;border-radius:20px;font-weight:700;display:inline-block;margin-bottom:4px">' + p.cat + '</div>'
              + '<div style="font-weight:700;font-size:12px;margin-bottom:4px">' + p.nom + '</div>'
              + '<div style="display:flex;justify-content:space-between;align-items:center">'
              + '<span class="badge ' + stCls + '" style="font-size:10px">' + p.stock + ' unité(s)</span>'
              + '<span style="font-weight:700;font-size:12px;color:#007A3D">' + p.prix.toLocaleString('fr-FR') + 'F</span>'
              + '</div></div>';
          }).join('')
        + '</div>';
    }
  }
}

// ══════════════════════════════════════════════════════
//  VUE MENUISIER
// ══════════════════════════════════════════════════════
var CHANTIERS = [];
var MATIERES  = [];
var chantier_seq = 1;

function initVueMenuisier() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_menuisier') || '{}');
    if (saved.chantiers) CHANTIERS = saved.chantiers;
    if (saved.matieres)  MATIERES  = saved.matieres;
    if (saved.seq)       chantier_seq = saved.seq;
  } catch(e) {}
  renderVueMenuisier();
}

function saveMenuisier() {
  try { localStorage.setItem('sm_menuisier', JSON.stringify({ chantiers: CHANTIERS, matieres: MATIERES, seq: chantier_seq })); } catch(e) {}
}

function renderVueMenuisier() {
  var enCours  = CHANTIERS.filter(function(c){ return c.statut==='en_cours'; }).length;
  var termines = CHANTIERS.filter(function(c){ return c.statut==='termine'; }).length;
  var alertesMatieres = MATIERES.filter(function(m){ return m.stock < m.stock_min; }).length;

  var stats = document.getElementById('vmen-stats');
  if (stats) {
    stats.innerHTML =
      '<div class="cd" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#007A3D">' + enCours + '</div><div style="font-size:12px;color:#666">Chantiers en cours</div></div>'
      + '<div class="cd" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#6b7280">' + termines + '</div><div style="font-size:12px;color:#666">Terminés</div></div>'
      + '<div class="cd" style="text-align:center"><div style="font-size:28px;font-weight:800;color:' + (alertesMatieres>0?'#CE1126':'#007A3D') + '">' + alertesMatieres + '</div><div style="font-size:12px;color:#666">Alertes stock</div></div>';
  }

  // Chantiers
  var liste = document.getElementById('vmen-chantiers');
  if (liste) {
    if (CHANTIERS.length === 0) {
      liste.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucun chantier. Cliquez sur "+ Nouveau chantier".</p>';
    } else {
      var stMap = { en_cours:['En cours','#3b82f6','#dbeafe'], termine:['Terminé','#007A3D','#dcfce7'], en_attente:['En attente','#f59e0b','#fef3c7'] };
      liste.innerHTML = CHANTIERS.map(function(c) {
        var st = stMap[c.statut] || ['—','#999','#f9fafb'];
        return '<div class="cd" style="margin-bottom:10px">'
          + '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">'
          + '<div style="font-size:30px"><img src="https://img.icons8.com/ios/16/007A3D/hammer.png" alt="Menuiserie" style="width:14px;height:14px;vertical-align:middle"></div>'
          + '<div style="flex:1;min-width:150px">'
          + '<div style="font-weight:700;font-size:14px">' + c.nom + '</div>'
          + '<div style="font-size:12px;color:#666">Client : ' + c.client + ' — ' + c.tel + '</div>'
          + '<div style="font-size:12px;color:#555">' + c.description + '</div>'
          + '<div style="font-size:12px;color:#007A3D;font-weight:600">Budget : ' + (c.budget||0).toLocaleString('fr-FR') + ' FCFA</div>'
          + '</div>'
          + '<span style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;background:' + st[2] + ';color:' + st[1] + '">' + st[0] + '</span>'
          + '<div style="display:flex;gap:5px">'
          + (c.statut==='en_attente' ? '<button class="btn bp bsm" onclick="changerStatutChantier(\''+c.id+'\',\'en_cours\')">Démarrer</button>' : '')
          + (c.statut==='en_cours'   ? '<button class="btn bp bsm" onclick="changerStatutChantier(\''+c.id+'\',\'termine\')">Terminer</button>' : '')
          + '</div>'
          + '</div></div>';
      }).join('');
    }
  }

  // Matières premières
  var stock = document.getElementById('vmen-stock');
  if (stock) {
    if (MATIERES.length === 0) {
      stock.innerHTML = '<p style="text-align:center;color:#999;padding:10px">Aucune matière enregistrée.</p>';
    } else {
      stock.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px">'
        + MATIERES.map(function(m) {
            var alerte = m.stock < m.stock_min;
            return '<div class="cd" style="padding:10px;border-left:3px solid ' + (alerte?'#CE1126':'#007A3D') + '">'
              + '<div style="font-weight:700;font-size:13px;margin-bottom:4px">' + m.nom + '</div>'
              + '<div style="font-size:12px;color:#666;margin-bottom:6px">' + m.unite + '</div>'
              + '<div style="display:flex;justify-content:space-between;align-items:center">'
              + '<div><div style="font-size:22px;font-weight:800;color:' + (alerte?'#CE1126':'#007A3D') + '">' + m.stock + '</div><div style="font-size:10px;color:#999">min: ' + m.stock_min + '</div></div>'
              + (alerte ? '<span style="background:#fee2e2;color:#CE1126;font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px">Réappro</span>' : '')
              + '</div>'
              + '<div style="font-size:11px;color:#007A3D;margin-top:4px">' + (m.prix||0).toLocaleString('fr-FR') + ' FCFA/' + m.unite + '</div>'
              + '</div>';
          }).join('')
        + '</div>';
    }
  }
}

function changerStatutChantier(id, statut) {
  var c = CHANTIERS.find(function(x){ return x.id===id; });
  if (!c) return;
  c.statut = statut;
  saveMenuisier();
  renderVueMenuisier();
  toast('Chantier ' + (statut==='en_cours'?'démarré':'terminé'), 'success');
}

function creerChantier() {
  var nom    = (document.getElementById('ch-nom')    || {}).value || '';
  var client = (document.getElementById('ch-client') || {}).value || '';
  var tel    = (document.getElementById('ch-tel')    || {}).value || '';
  var desc   = (document.getElementById('ch-desc')   || {}).value || '';
  var budget = parseFloat((document.getElementById('ch-budget')||{}).value) || 0;
  if (!nom || !client) { toast('Nom du chantier et client requis', 'warning'); return; }
  var c = { id:'CH-'+String(chantier_seq++).padStart(3,'0'), nom:nom, client:client, tel:tel, description:desc, budget:budget, statut:'en_attente', cree_le:new Date().toISOString() };
  CHANTIERS.unshift(c);
  saveMenuisier();
  closeM('m-chantier');
  renderVueMenuisier();
  toast('Chantier ' + c.id + ' créé !', 'success');
  ['ch-nom','ch-client','ch-tel','ch-desc','ch-budget'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

function ajouterMatiere() {
  var nom      = (document.getElementById('mat-nom')  || {}).value || '';
  var unite    = (document.getElementById('mat-unite')|| {}).value || 'unité';
  var stock    = parseFloat((document.getElementById('mat-stock')    ||{}).value) || 0;
  var stockMin = parseFloat((document.getElementById('mat-stockmin') ||{}).value) || 5;
  var prix     = parseFloat((document.getElementById('mat-prix')     ||{}).value) || 0;
  if (!nom) { toast('Nom requis', 'warning'); return; }
  MATIERES.push({ id:'MAT-'+Date.now(), nom:nom, unite:unite, stock:stock, stock_min:stockMin, prix:prix });
  saveMenuisier();
  closeM('m-matiere');
  renderVueMenuisier();
  toast('Matière "' + nom + '" ajoutée', 'success');
  ['mat-nom','mat-stock','mat-stockmin','mat-prix'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}
