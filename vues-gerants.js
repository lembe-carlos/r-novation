// ═══════════════════════════════════════════════════════
//  SuperMarché CM — vues-gerants.js
//  Vues dédiées pour les gérants spécialisés :
//  docteur, électricien, ingénieur BTP, agricole,
//  logisticien, libraire, agent immobilier, décorateur
// ═══════════════════════════════════════════════════════

// ─────────────────────────────────────────
//  Dispatcher — appelé au login de chaque gérant
// ─────────────────────────────────────────
function initVueGerantMetier(role) {
  var fns = {
    'docteur':            initVueDocteur,
    'electricien':        initVueElectricien,
    'ingenieur_btp':      initVueIngenieurBTP,
    'ingenieur_agricole': initVueIngenieurAgricole,
    'logisticien':        initVueLogisticien,
    'libraire':           initVueLibraire,
    'immobilier':         initVueAgentImmo,
    'decorateur':         initVueDecorateur,
  };
  if (fns[role]) fns[role]();
}

// ─────────────────────────────────────────
//  Fonction utilitaire — bloc stats mini
// ─────────────────────────────────────────
function _miniStat(label, val, color) {
  return '<div class="cd" style="text-align:center;border-top:4px solid ' + color + ';padding:12px">'
    + '<div style="font-size:22px;font-weight:800;color:' + color + '">' + val + '</div>'
    + '<div style="font-size:11px;color:#666;margin-top:2px">' + label + '</div></div>';
}

function _enteteVue(nom, icon, couleur, desc) {
  return '<div style="background:linear-gradient(135deg,' + couleur + ',' + couleur + 'cc);color:#fff;'
    + 'border-radius:16px;padding:20px;margin-bottom:16px;display:flex;align-items:center;gap:14px">'
    + '<div style="font-size:36px">' + icon + '</div>'
    + '<div><div style="font-size:20px;font-weight:800">' + nom + '</div>'
    + '<div style="font-size:13px;opacity:.85">' + desc + '</div></div></div>';
}

// ─────────────────────────────────────────
//  1. VUE DOCTEUR
// ─────────────────────────────────────────
function initVueDocteur() {
  var z = document.getElementById('vue-docteur-content'); if (!z) return;
  var email = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.email : '';

  var rdvs = (typeof RDV_MEDECIN !== 'undefined' ? RDV_MEDECIN : [])
    .filter(function(r){ return r.statut !== 'annule'; })
    .sort(function(a,b){ return (a.date||'').localeCompare(b.date||''); });

  var stColors = { confirme:'#007A3D', termine:'#6b7280', annule:'#CE1126', en_attente:'#f59e0b' };

  var html = _enteteVue('Espace Médecin', '🏥', '#CE1126',
    rdvs.length + ' rendez-vous — ' + rdvs.filter(function(r){ return r.statut==='confirme'; }).length + ' à venir');

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:16px">'
    + _miniStat('RDV total', rdvs.length, '#CE1126')
    + _miniStat('À venir', rdvs.filter(function(r){ return r.statut==='confirme'; }).length, '#3b82f6')
    + _miniStat('Terminés', rdvs.filter(function(r){ return r.statut==='termine'; }).length, '#6b7280')
    + _miniStat('CA estimé', rdvs.reduce(function(s,r){ return s+(r.tarif||0); },0).toLocaleString('fr-FR') + ' F', '#007A3D')
    + '</div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'
    + '<button class="btn bp bsm" onclick="openM(\'m-rdv-medecin\')">+ Nouveau RDV</button>'
    + '<button class="btn bo bsm" onclick="openM(\'m-dossier-patient\')">+ Dossier patient</button>'
    + '</div>';

  if (rdvs.length === 0) {
    html += '<div style="text-align:center;padding:40px;color:#999"><div style="font-size:48px;margin-bottom:12px">📅</div>'
      + '<div style="font-size:15px;font-weight:600">Aucun rendez-vous</div>'
      + '<div style="font-size:12px;margin-top:4px">Vos RDV patients apparaîtront ici</div></div>';
  } else {
    html += '<div class="cd"><div class="ch"><div class="ct">Rendez-vous patients</div></div>'
      + '<div style="margin-top:10px">'
      + rdvs.slice(0,20).map(function(r) {
          var stc = stColors[r.statut] || '#999';
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--br);flex-wrap:wrap;gap:8px">'
            + '<div>'
            + '<div style="font-weight:700">' + (r.client||r.patient||'Patient') + '</div>'
            + '<div style="font-size:12px;color:#555">' + (r.medecin_nom||r.specialite||'') + ' — ' + (r.date||'') + (r.heure?' à '+r.heure:'') + '</div>'
            + (r.motif ? '<div style="font-size:11px;color:#999">' + r.motif + '</div>' : '')
            + '</div>'
            + '<div style="display:flex;align-items:center;gap:8px">'
            + '<span style="background:'+stc+'22;color:'+stc+';padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700">'+r.statut+'</span>'
            + (r.tel ? '<a href="https://wa.me/'+r.tel.replace(/[ +\-]/g,'')+'" target="_blank" class="btn bo bsm">WA</a>' : '')
            + (r.statut==='confirme' ? '<button class="btn bp bsm" onclick="changerStatutRdvMedecin(\''+r.id+'\',\'termine\')">Terminé</button>' : '')
            + '</div></div>';
        }).join('')
      + '</div></div>';
  }
  z.innerHTML = html;
}

// ─────────────────────────────────────────
//  2. VUE ÉLECTRICIEN / SOCIÉTÉ ÉNERGIE
// ─────────────────────────────────────────
function initVueElectricien() {
  var z = document.getElementById('vue-electricien-content'); if (!z) return;
  var email = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.email : '';

  var devis = (typeof DEVIS_ENERGIE !== 'undefined' ? DEVIS_ENERGIE : []);
  var societe = (typeof GESTIONNAIRES !== 'undefined' && GESTIONNAIRES.societes_energie)
    ? GESTIONNAIRES.societes_energie.find(function(s){ return s.email === email; }) : null;

  var html = _enteteVue('Espace Énergie', '⚡', '#fcd116',
    (societe ? societe.nom : 'Ma société') + ' — ' + devis.length + ' devis');

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:16px">'
    + _miniStat('Devis total', devis.length, '#fcd116')
    + _miniStat('En attente', devis.filter(function(d){ return d.statut==='nouveau'||d.statut==='en_attente'; }).length, '#f59e0b')
    + _miniStat('Acceptés', devis.filter(function(d){ return d.statut==='accepte'; }).length, '#007A3D')
    + _miniStat('CA', devis.filter(function(d){ return d.statut==='accepte'; }).reduce(function(s,d){ return s+(d.budget||0); },0).toLocaleString('fr-FR') + ' F', '#007A3D')
    + '</div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:12px">'
    + '<button class="btn bp bsm" onclick="openM(\'m-devis-energie\')">+ Nouveau devis</button>'
    + '</div>';

  if (societe && societe.produits && societe.produits.length > 0) {
    html += '<div class="cd" style="margin-bottom:12px"><div class="ch"><div class="ct">Mes produits</div></div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:8px;padding:10px">'
      + societe.produits.map(function(p) {
          return '<div style="background:#fefce8;border:1px solid #fcd116;border-radius:8px;padding:8px 12px;font-size:12px">'
            + '<div style="font-weight:700">' + p.nom + '</div>'
            + '<div style="color:#007A3D;font-weight:600">' + (p.prix||0).toLocaleString('fr-FR') + ' FCFA</div></div>';
        }).join('')
      + '</div></div>';
  }

  html += _tableauDevis(devis, { rouge: '#fcd116' });
  z.innerHTML = html;
}

// ─────────────────────────────────────────
//  3. VUE INGÉNIEUR BTP
// ─────────────────────────────────────────
function initVueIngenieurBTP() {
  var z = document.getElementById('vue-btp-content'); if (!z) return;
  var devis = (typeof DEVIS_BTP !== 'undefined' ? DEVIS_BTP : []);
  var artisans = (typeof GESTIONNAIRES !== 'undefined' && GESTIONNAIRES.artisans_btp)
    ? GESTIONNAIRES.artisans_btp : [];

  var html = _enteteVue('Espace BTP & Construction', '🏗️', '#4b5563',
    devis.length + ' devis — ' + artisans.length + ' artisans');

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:16px">'
    + _miniStat('Devis total', devis.length, '#4b5563')
    + _miniStat('En cours', devis.filter(function(d){ return d.statut==='en_etude'; }).length, '#3b82f6')
    + _miniStat('Terminés', devis.filter(function(d){ return d.statut==='termine'; }).length, '#007A3D')
    + _miniStat('CA chantiers', devis.filter(function(d){ return d.statut==='termine'; }).reduce(function(s,d){ return s+(d.budget||0); },0).toLocaleString('fr-FR') + ' F', '#007A3D')
    + '</div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:12px">'
    + '<button class="btn bp bsm" onclick="openM(\'m-devis-btp\')">+ Nouveau devis BTP</button>'
    + '<button class="btn bo bsm" onclick="openM(\'m-artisan-btp\')">+ Ajouter artisan</button>'
    + '</div>';

  html += _tableauDevis(devis, { rouge: '#4b5563' });
  z.innerHTML = html;
}

// ─────────────────────────────────────────
//  4. VUE INGÉNIEUR AGRICOLE
// ─────────────────────────────────────────
function initVueIngenieurAgricole() {
  var z = document.getElementById('vue-agricole-content'); if (!z) return;
  var cmds = (typeof COMMANDES_AGRI !== 'undefined' ? COMMANDES_AGRI : []);
  var produits = (typeof AGRI_PRODUITS !== 'undefined' ? AGRI_PRODUITS : []);

  var html = _enteteVue('Espace Agriculture', '🌱', '#16a34a',
    cmds.length + ' commandes — ' + produits.length + ' produits');

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:16px">'
    + _miniStat('Commandes', cmds.length, '#16a34a')
    + _miniStat('À traiter', cmds.filter(function(c){ return c.statut==='recu'; }).length, '#f59e0b')
    + _miniStat('Livrées', cmds.filter(function(c){ return c.statut==='livre'; }).length, '#6b7280')
    + _miniStat('CA', cmds.reduce(function(s,c){ return s+(c.total||0); },0).toLocaleString('fr-FR') + ' F', '#007A3D')
    + '</div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:12px">'
    + '<button class="btn bp bsm" onclick="openM(\'m-agri-produit\')">+ Ajouter produit</button>'
    + '<button class="btn bo bsm" onclick="openM(\'m-agri-commande\')">+ Commande manuelle</button>'
    + '</div>';

  html += _tableauCommandes(cmds, '#16a34a');
  z.innerHTML = html;
}

// ─────────────────────────────────────────
//  5. VUE LOGISTICIEN
// ─────────────────────────────────────────
function initVueLogisticien() {
  var z = document.getElementById('vue-logisticien-content'); if (!z) return;
  var cmds = (typeof COMMANDES_LOGISTIQUE !== 'undefined' ? COMMANDES_LOGISTIQUE : []);

  var html = _enteteVue('Espace Logistique & Transport', '📦', '#0369a1',
    cmds.length + ' expéditions');

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:16px">'
    + _miniStat('Expéditions', cmds.length, '#0369a1')
    + _miniStat('En transit', cmds.filter(function(c){ return c.statut==='en_transit'; }).length, '#f59e0b')
    + _miniStat('Livrées', cmds.filter(function(c){ return c.statut==='livre'; }).length, '#007A3D')
    + _miniStat('CA', cmds.reduce(function(s,c){ return s+(c.prix||0); },0).toLocaleString('fr-FR') + ' F', '#007A3D')
    + '</div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:12px">'
    + '<button class="btn bp bsm" onclick="openM(\'m-colis\')">+ Nouvelle expédition</button>'
    + '<button class="btn bo bsm" onclick="openM(\'m-location-vehicule\')">+ Location véhicule</button>'
    + '<button class="btn bo bsm" onclick="openM(\'m-tarif-trajet\')">+ Tarif trajet</button>'
    + '</div>';

  html += _tableauCommandes(cmds, '#0369a1');
  z.innerHTML = html;
}

// ─────────────────────────────────────────
//  6. VUE LIBRAIRE
// ─────────────────────────────────────────
function initVueLibraire() {
  var z = document.getElementById('vue-libraire-content'); if (!z) return;
  var email = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.email : '';
  var librairie = (typeof GESTIONNAIRES !== 'undefined' && GESTIONNAIRES.libraires)
    ? GESTIONNAIRES.libraires.find(function(l){ return l.email === email; }) : null;
  var cmds = (typeof COMMANDES_EDUCATION !== 'undefined' ? COMMANDES_EDUCATION : []);

  var html = _enteteVue('Espace Librairie', '📚', '#7c3aed',
    (librairie ? librairie.nom : 'Ma librairie') + ' — ' + (librairie && librairie.produits ? librairie.produits.length : 0) + ' fournitures');

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:16px">'
    + _miniStat('Fournitures', librairie && librairie.produits ? librairie.produits.length : 0, '#7c3aed')
    + _miniStat('Commandes', cmds.length, '#3b82f6')
    + _miniStat('CA', cmds.reduce(function(s,c){ return s+(c.total||0); },0).toLocaleString('fr-FR') + ' F', '#007A3D')
    + '</div>';

  if (librairie) {
    html += '<div style="display:flex;gap:8px;margin-bottom:12px">'
      + '<button class="btn bp bsm" onclick="ajouterFournitureLibrairie(\'' + librairie.id + '\')">+ Ajouter fourniture</button>'
      + '</div>';

    if (librairie.produits && librairie.produits.length > 0) {
      html += '<div class="cd" style="margin-bottom:12px"><div class="ch"><div class="ct">Mon catalogue</div></div>'
        + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;padding:10px">'
        + librairie.produits.map(function(p) {
            return '<div style="background:#f5f3ff;border:1px solid #7c3aed;border-radius:8px;padding:10px">'
              + '<div style="font-weight:700;font-size:13px">' + p.nom + '</div>'
              + '<div style="color:#7c3aed;font-weight:700;font-size:15px;margin-top:4px">' + (p.prix||0).toLocaleString('fr-FR') + ' FCFA</div></div>';
          }).join('')
        + '</div></div>';
    }
  }
  z.innerHTML = html;
}

// ─────────────────────────────────────────
//  7. VUE AGENT IMMOBILIER
// ─────────────────────────────────────────
function initVueAgentImmo() {
  var z = document.getElementById('vue-immo-content'); if (!z) return;
  var email = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.email : '';
  var agent = (typeof GESTIONNAIRES !== 'undefined' && GESTIONNAIRES.agents_immo)
    ? GESTIONNAIRES.agents_immo.find(function(a){ return a.email === email; }) : null;
  var demandes = (typeof DEMANDES_IMMO !== 'undefined' ? DEMANDES_IMMO : []);

  var annonces = agent ? (agent.annonces || []) : [];

  var html = _enteteVue('Espace Immobilier', '🏠', '#047857',
    annonces.length + ' annonces — ' + demandes.length + ' demandes');

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:16px">'
    + _miniStat('Annonces', annonces.length, '#047857')
    + _miniStat('Demandes', demandes.length, '#3b82f6')
    + _miniStat('Conclues', demandes.filter(function(d){ return d.statut==='conclue'; }).length, '#007A3D')
    + '</div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:12px">'
    + '<button class="btn bp bsm" onclick="openM(\'m-agent-immo\')">+ Nouvelle annonce</button>'
    + '</div>';

  if (annonces.length > 0) {
    html += '<div class="cd" style="margin-bottom:12px"><div class="ch"><div class="ct">Mes annonces</div></div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;padding:10px">'
      + annonces.map(function(a) {
          return '<div style="border:1px solid var(--br);border-radius:10px;overflow:hidden">'
            + '<img src="' + (a.img||'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=260&h=120&fit=crop/260/120') + '" style="width:100%;height:120px;object-fit:cover">'
            + '<div style="padding:10px">'
            + '<div style="font-weight:800;font-size:13px">' + a.titre + '</div>'
            + '<div style="font-size:11px;color:#047857;font-weight:600">' + a.type + ' — ' + (a.adresse||a.ville||'') + '</div>'
            + '<div style="font-size:15px;font-weight:800;color:#007A3D;margin-top:4px">' + (a.prix||0).toLocaleString('fr-FR') + ' FCFA</div>'
            + (a.video ? '<a href="' + a.video + '" target="_blank" class="btn bo bsm" style="margin-top:6px">Voir vidéo</a>' : '')
            + '</div></div>';
        }).join('')
      + '</div></div>';
  }
  z.innerHTML = html;
}

// ─────────────────────────────────────────
//  8. VUE DÉCORATEUR / MEUBLES
// ─────────────────────────────────────────
function initVueDecorateur() {
  var z = document.getElementById('vue-decorateur-content'); if (!z) return;
  var cmds = (typeof COMMANDES_MEUBLES !== 'undefined' ? COMMANDES_MEUBLES : []);

  var html = _enteteVue('Espace Décoration & Meubles', '🛋️', '#db2777',
    cmds.length + ' commandes meubles');

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:16px">'
    + _miniStat('Commandes', cmds.length, '#db2877')
    + _miniStat('En cours', cmds.filter(function(c){ return c.statut==='confirme'||c.statut==='en_attente'; }).length, '#f59e0b')
    + _miniStat('Livrées', cmds.filter(function(c){ return c.statut==='livre'; }).length, '#007A3D')
    + _miniStat('CA', cmds.reduce(function(s,c){ return s+(c.total||0); },0).toLocaleString('fr-FR') + ' F', '#007A3D')
    + '</div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:12px">'
    + '<button class="btn bp bsm" onclick="openM(\'m-commande-meubles\')">+ Commande meubles</button>'
    + '<button class="btn bo bsm" onclick="openM(\'m-devis\')">+ Devis meuble</button>'
    + '</div>';

  html += _tableauCommandes(cmds, '#db2877');
  z.innerHTML = html;
}

// ─────────────────────────────────────────
//  Helpers tableaux communs
// ─────────────────────────────────────────
function _tableauDevis(devis, opts) {
  if (!devis.length) return '<div style="text-align:center;padding:30px;color:#999"><div style="font-size:40px">📋</div><div>Aucun devis pour l\'instant</div></div>';
  var stColors = { nouveau:'#f59e0b', en_attente:'#f59e0b', en_etude:'#3b82f6', accepte:'#007A3D', refuse:'#CE1126', termine:'#6b7280', livre:'#6b7280' };
  return '<div class="cd"><div class="ch"><div class="ct">Mes devis</div></div>'
    + '<div style="overflow-x:auto;margin-top:8px"><table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<thead><tr style="background:' + (opts&&opts.rouge?opts.rouge:'#007A3D') + ';color:#fff">'
    + '<th style="padding:8px;text-align:left">Client</th><th style="padding:8px;text-align:left">Détail</th>'
    + '<th style="padding:8px;text-align:right">Montant</th><th style="padding:8px;text-align:center">Statut</th><th style="padding:8px">Contact</th></tr></thead><tbody>'
    + devis.slice(0,20).map(function(d, i) {
        var bg = i%2===0?'#fff':'#f9fafb';
        var stc = stColors[d.statut||'nouveau'] || '#999';
        return '<tr style="background:'+bg+';border-bottom:1px solid #f0f0f0">'
          + '<td style="padding:8px;font-weight:600">' + (d.client||d.nom||'—') + '</td>'
          + '<td style="padding:8px;color:#555;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (d.description||d.panne||d.type||'—') + '</td>'
          + '<td style="padding:8px;text-align:right;font-weight:700;color:#007A3D">' + ((d.budget||d.total||d.montant||0)>0?(d.budget||d.total||d.montant||0).toLocaleString('fr-FR')+' F':'—') + '</td>'
          + '<td style="padding:8px;text-align:center"><span style="background:'+stc+'22;color:'+stc+';padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700">' + (d.statut||'nouveau') + '</span></td>'
          + '<td style="padding:8px">' + (d.tel?'<a href="https://wa.me/'+d.tel.replace(/[ +\-]/g,'')+'" target="_blank" class="btn bo bsm">WA</a>':'—') + '</td>'
          + '</tr>';
      }).join('')
    + '</tbody></table></div></div>';
}

function _tableauCommandes(cmds, color) {
  if (!cmds.length) return '<div style="text-align:center;padding:30px;color:#999"><div style="font-size:40px">📦</div><div>Aucune commande pour l\'instant</div></div>';
  var stColors = { recu:'#f59e0b', confirme:'#3b82f6', en_preparation:'#8b5cf6', livre:'#6b7280', annule:'#CE1126' };
  return '<div class="cd"><div class="ch"><div class="ct">Mes commandes</div></div>'
    + '<div style="overflow-x:auto;margin-top:8px"><table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<thead><tr style="background:' + (color||'#007A3D') + ';color:#fff">'
    + '<th style="padding:8px;text-align:left">Client</th><th style="padding:8px;text-align:right">Total</th>'
    + '<th style="padding:8px;text-align:center">Statut</th><th style="padding:8px;text-align:center">Actions</th></tr></thead><tbody>'
    + cmds.slice(0,20).map(function(c, i) {
        var bg = i%2===0?'#fff':'#f9fafb';
        var stc = stColors[c.statut||'recu'] || '#999';
        return '<tr style="background:'+bg+';border-bottom:1px solid #f0f0f0">'
          + '<td style="padding:8px"><div style="font-weight:600">' + (c.client||'—') + '</div>'
          + '<div style="font-size:10px;color:#999">' + (c.tel||'') + '</div></td>'
          + '<td style="padding:8px;text-align:right;font-weight:700;color:#007A3D">' + ((c.total||c.prix||0)>0?(c.total||c.prix||0).toLocaleString('fr-FR')+' F':'—') + '</td>'
          + '<td style="padding:8px;text-align:center"><span style="background:'+stc+'22;color:'+stc+';padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700">' + (c.statut||'recu') + '</span></td>'
          + '<td style="padding:8px;text-align:center">' + (c.tel?'<a href="https://wa.me/'+c.tel.replace(/[ +\-]/g,'')+'" target="_blank" class="btn bo bsm">WA</a>':'—') + '</td>'
          + '</tr>';
      }).join('')
    + '</tbody></table></div></div>';
}
