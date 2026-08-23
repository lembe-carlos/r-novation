// ═══════════════════════════════════════════════════════
//  SuperMarché CM — devis-reservations.js
//  Page centrale : tous les devis + réservations + commandes
// ═══════════════════════════════════════════════════════

function renderPageDevisReservations() {
  var z = document.getElementById('devis-resa-content');
  if (!z) return;

  // Collecter TOUS les devis et réservations de tous les modules
  var tousDevis = [];
  var toutesResas = [];
  var toutesCommandes = [];

  // Coiffure
  if (typeof RESERVATIONS_COIFFURE !== 'undefined') {
    RESERVATIONS_COIFFURE.forEach(function(r){ toutesResas.push(Object.assign({}, r, { source:'Coiffure', icon:'✂️' })); });
  }
  // Pressing
  if (typeof PRESSING_COMMANDES !== 'undefined') {
    PRESSING_COMMANDES.forEach(function(c){ toutesCommandes.push(Object.assign({}, c, { source:'Pressing', icon:'👔' })); });
  }
  // Automobile — RDV
  if (typeof RESERVATIONS_AUTO !== 'undefined') {
    RESERVATIONS_AUTO.forEach(function(r){ toutesResas.push(Object.assign({}, r, { source:'Auto RDV', icon:'🚗' })); });
  }
  // Automobile — Devis réparation
  if (typeof DEVIS_REPARATION !== 'undefined') {
    DEVIS_REPARATION.forEach(function(d){ tousDevis.push(Object.assign({}, d, { source:'Auto Devis', icon:'🔧' })); });
  }
  // Menuiserie
  if (typeof DEVIS_MENUISERIE !== 'undefined') {
    DEVIS_MENUISERIE.forEach(function(d){ tousDevis.push(Object.assign({}, d, { source:'Menuiserie', icon:'🪵' })); });
  }
  // Restauration
  if (typeof COMMANDES_RESTO !== 'undefined') {
    COMMANDES_RESTO.forEach(function(c){ toutesCommandes.push(Object.assign({}, c, { source:'Restauration', icon:'🍽️' })); });
  }
  // Énergie
  if (typeof DEVIS_ENERGIE !== 'undefined') {
    DEVIS_ENERGIE.forEach(function(d){ tousDevis.push(Object.assign({}, d, { source:'Énergie', icon:'⚡' })); });
  }
  // Santé — RDV
  if (typeof RDV_MEDECIN !== 'undefined') {
    RDV_MEDECIN.forEach(function(r){ toutesResas.push(Object.assign({}, r, { source:'Santé', icon:'🏥' })); });
  }
  // BTP
  if (typeof DEVIS_BTP !== 'undefined') {
    DEVIS_BTP.forEach(function(d){ tousDevis.push(Object.assign({}, d, { source:'BTP', icon:'🏗️' })); });
  }
  // Agriculture
  if (typeof COMMANDES_AGRI !== 'undefined') {
    COMMANDES_AGRI.forEach(function(c){ toutesCommandes.push(Object.assign({}, c, { source:'Agriculture', icon:'🌱' })); });
  }
  // Logistique
  if (typeof COMMANDES_LOGISTIQUE !== 'undefined') {
    COMMANDES_LOGISTIQUE.forEach(function(c){ toutesCommandes.push(Object.assign({}, c, { source:'Logistique', icon:'📦' })); });
  }
  // Éducation — RDV cours
  if (typeof RDV_COURS !== 'undefined') {
    RDV_COURS.forEach(function(r){ toutesResas.push(Object.assign({}, r, { source:'Éducation', icon:'📚' })); });
  }
  // Immobilier
  if (typeof DEMANDES_IMMO !== 'undefined') {
    DEMANDES_IMMO.forEach(function(d){ tousDevis.push(Object.assign({}, d, { source:'Immobilier', icon:'🏠' })); });
  }
  // Meubles
  if (typeof COMMANDES_MEUBLES !== 'undefined') {
    COMMANDES_MEUBLES.forEach(function(c){ toutesCommandes.push(Object.assign({}, c, { source:'Meubles', icon:'🛋️' })); });
  }
  // Commandes générales boutique
  if (typeof CMDS !== 'undefined') {
    CMDS.filter(function(c){ return c.statut !== 'annulee'; }).forEach(function(c){
      toutesCommandes.push(Object.assign({}, c, { source:'Boutique', icon:'🛒' }));
    });
  }

  // KPIs
  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:20px">'
    + kpiDR('Devis en attente', tousDevis.filter(function(d){ return ['nouveau','en_attente','en_etude'].indexOf(d.statut||'nouveau') !== -1; }).length, '#f59e0b')
    + kpiDR('Réservations', toutesResas.filter(function(r){ return r.statut==='confirme'; }).length, '#3b82f6')
    + kpiDR('Commandes actives', toutesCommandes.filter(function(c){ return ['recu','confirme','en_preparation'].indexOf(c.statut||'recu') !== -1; }).length, '#007A3D')
    + kpiDR('Total dossiers', tousDevis.length + toutesResas.length + toutesCommandes.length, '#8b5cf6')
    + '</div>';

  // Filtre onglets
  html += '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">'
    + '<button class="btn bp bsm" onclick="filtrerDR(\'tous\',this)">Tous</button>'
    + '<button class="btn bo bsm" onclick="filtrerDR(\'devis\',this)">Devis (' + tousDevis.length + ')</button>'
    + '<button class="btn bo bsm" onclick="filtrerDR(\'reservations\',this)">Réservations (' + toutesResas.length + ')</button>'
    + '<button class="btn bo bsm" onclick="filtrerDR(\'commandes\',this)">Commandes (' + toutesCommandes.length + ')</button>'
    + '</div>';

  // ── DEVIS ──
  html += '<div id="dr-devis-section" class="cd" style="margin-bottom:16px">'
    + '<div class="ch"><div class="ct">Devis en cours</div><span class="badge bgy">' + tousDevis.length + '</span></div>'
    + (tousDevis.length === 0
        ? '<p style="text-align:center;color:#999;padding:16px">Aucun devis</p>'
        : '<div style="overflow-x:auto;margin-top:12px"><table style="width:100%;border-collapse:collapse;font-size:13px">'
          + '<thead><tr style="background:#f59e0b;color:#fff"><th style="padding:8px;text-align:left">Module</th><th style="padding:8px;text-align:left">ID</th><th style="padding:8px;text-align:left">Client</th><th style="padding:8px;text-align:left">Détail</th><th style="padding:8px;text-align:center">Montant</th><th style="padding:8px;text-align:center">Statut</th><th style="padding:8px;text-align:center">Action</th></tr></thead><tbody>'
          + tousDevis.slice(0,20).map(function(d, i) {
              var bg = i%2===0?'#fff':'#fafafa';
              var montant = d.total||d.prix||d.budget||0;
              var stColors = { nouveau:'#f59e0b', en_attente:'#f59e0b', en_etude:'#3b82f6', accepte:'#007A3D', refuse:'#CE1126', livre:'#6b7280' };
              var stc = stColors[d.statut||'nouveau']||'#999';
              return '<tr style="background:'+bg+';border-bottom:1px solid #f0f0f0">'
                + '<td style="padding:8px"><span style="font-size:18px">' + d.icon + '</span><br><span style="font-size:11px;color:#555">' + d.source + '</span></td>'
                + '<td style="padding:8px;font-weight:700;color:#007A3D;font-size:12px">' + (d.id||'—') + '</td>'
                + '<td style="padding:8px"><div style="font-weight:600">' + (d.client||d.nom||'—') + '</div><div style="font-size:11px;color:#999">' + (d.tel||'') + '</div></td>'
                + '<td style="padding:8px;font-size:12px;color:#555">' + (d.description||d.panne||d.type||'—').substring(0,40) + '</td>'
                + '<td style="padding:8px;text-align:center;font-weight:700;color:#007A3D">' + (montant>0?montant.toLocaleString('fr-FR')+' F':'—') + '</td>'
                + '<td style="padding:8px;text-align:center"><span style="background:'+stc+'22;color:'+stc+';padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700">' + (d.statut||'nouveau') + '</span></td>'
                + '<td style="padding:8px;text-align:center"><a href="https://wa.me/' + (d.tel||'').replace(/[\s+\-]/g,'') + '" target="_blank" class="btn bo bsm">WA</a></td>'
                + '</tr>';
            }).join('')
          + '</tbody></table></div>')
    + '</div>';

  // ── RÉSERVATIONS ──
  html += '<div id="dr-resa-section" class="cd" style="margin-bottom:16px">'
    + '<div class="ch"><div class="ct">Réservations confirmées</div><span class="badge bgb">' + toutesResas.length + '</span></div>'
    + (toutesResas.length === 0
        ? '<p style="text-align:center;color:#999;padding:16px">Aucune réservation</p>'
        : '<div style="overflow-x:auto;margin-top:12px"><table style="width:100%;border-collapse:collapse;font-size:13px">'
          + '<thead><tr style="background:#3b82f6;color:#fff"><th style="padding:8px;text-align:left">Module</th><th style="padding:8px;text-align:left">ID</th><th style="padding:8px;text-align:left">Client</th><th style="padding:8px;text-align:left">Détail</th><th style="padding:8px;text-align:center">Date</th><th style="padding:8px;text-align:center">Montant</th><th style="padding:8px;text-align:center">Statut</th></tr></thead><tbody>'
          + toutesResas.slice(0,20).map(function(r, i) {
              var bg = i%2===0?'#fff':'#fafafa';
              var montant = r.prix||r.tarif||r.total||0;
              var stc = r.statut==='confirme'?'#007A3D':r.statut==='annulee'?'#CE1126':'#f59e0b';
              return '<tr style="background:'+bg+';border-bottom:1px solid #f0f0f0">'
                + '<td style="padding:8px"><span style="font-size:18px">' + r.icon + '</span><br><span style="font-size:11px;color:#555">' + r.source + '</span></td>'
                + '<td style="padding:8px;font-weight:700;color:#3b82f6;font-size:12px">' + (r.id||'—') + '</td>'
                + '<td style="padding:8px"><div style="font-weight:600">' + (r.client||r.patient||'—') + '</div><div style="font-size:11px;color:#999">' + (r.tel||'') + '</div></td>'
                + '<td style="padding:8px;font-size:12px;color:#555">' + (r.service||r.medecin_nom||r.matiere||r.specialite||'—') + '</td>'
                + '<td style="padding:8px;text-align:center;font-size:12px">' + (r.date||'—') + (r.heure?' '+r.heure:'') + '</td>'
                + '<td style="padding:8px;text-align:center;font-weight:700;color:#007A3D">' + (montant>0?montant.toLocaleString('fr-FR')+' F':'—') + '</td>'
                + '<td style="padding:8px;text-align:center"><span style="background:'+stc+'22;color:'+stc+';padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700">' + (r.statut||'confirme') + '</span></td>'
                + '</tr>';
            }).join('')
          + '</tbody></table></div>')
    + '</div>';

  // ── COMMANDES ──
  html += '<div id="dr-cmd-section" class="cd">'
    + '<div class="ch"><div class="ct">Toutes les commandes</div><span class="badge bgg">' + toutesCommandes.length + '</span></div>'
    + (toutesCommandes.length === 0
        ? '<p style="text-align:center;color:#999;padding:16px">Aucune commande</p>'
        : '<div style="overflow-x:auto;margin-top:12px"><table style="width:100%;border-collapse:collapse;font-size:13px">'
          + '<thead><tr style="background:#007A3D;color:#fff"><th style="padding:8px;text-align:left">Module</th><th style="padding:8px;text-align:left">ID</th><th style="padding:8px;text-align:left">Client</th><th style="padding:8px;text-align:center">Total</th><th style="padding:8px;text-align:center">Statut</th><th style="padding:8px;text-align:center">Livraison</th></tr></thead><tbody>'
          + toutesCommandes.slice(0,30).map(function(c, i) {
              var bg = i%2===0?'#fff':'#fafafa';
              var stColors = { recu:'#f59e0b', confirme:'#3b82f6', en_preparation:'#8b5cf6', pret:'#007A3D', livre:'#6b7280', annule:'#CE1126', en_attente:'#f59e0b', confirmee:'#3b82f6', livraison:'#8b5cf6', livree:'#6b7280' };
              var stc = stColors[c.statut||'recu']||'#999';
              var dejaCree = typeof LIVRAISONS!=='undefined' && LIVRAISONS.liste && LIVRAISONS.liste.find(function(l){ return l.cmd_id===c.id; });
              return '<tr style="background:'+bg+';border-bottom:1px solid #f0f0f0">'
                + '<td style="padding:8px"><span style="font-size:16px">' + c.icon + '</span><br><span style="font-size:10px;color:#555">' + c.source + '</span></td>'
                + '<td style="padding:8px;font-weight:700;color:#007A3D;font-size:12px">' + (c.id||'—') + '</td>'
                + '<td style="padding:8px"><div style="font-weight:600">' + (c.client||'—') + '</div><div style="font-size:11px;color:#999">' + (c.tel||'') + '</div></td>'
                + '<td style="padding:8px;text-align:center;font-weight:700;color:#007A3D">' + ((c.total||0)>0?(c.total||0).toLocaleString('fr-FR')+' F':'—') + '</td>'
                + '<td style="padding:8px;text-align:center"><span style="background:'+stc+'22;color:'+stc+';padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700">' + (c.statut||'recu') + '</span></td>'
                + '<td style="padding:8px;text-align:center">'
                + (dejaCree
                    ? '<span style="color:#007A3D;font-size:11px;font-weight:700">✓ Livraison créée</span>'
                    : '<button class="btn bp bsm" onclick="creerLivraisonDepuisDR(\'' + c.id + '\',\'' + c.source + '\')">+ Créer livraison</button>')
                + '</td>'
                + '</tr>';
            }).join('')
          + '</tbody></table></div>')
    + '</div>';

  z.innerHTML = html;
}

function kpiDR(label, val, color) {
  return '<div class="cd" style="text-align:center;border-top:4px solid '+color+'">'
    + '<div style="font-size:26px;font-weight:800;color:'+color+'">' + val + '</div>'
    + '<div style="font-size:11px;color:#666;margin-top:2px">' + label + '</div>'
    + '</div>';
}

function filtrerDR(type, btn) {
  document.querySelectorAll('#dr-devis-section, #dr-resa-section, #dr-cmd-section').forEach(function(el) {
    el.style.display = type==='tous' ? 'block'
      : type==='devis' && el.id==='dr-devis-section' ? 'block'
      : type==='reservations' && el.id==='dr-resa-section' ? 'block'
      : type==='commandes' && el.id==='dr-cmd-section' ? 'block'
      : 'none';
  });
  document.querySelectorAll('[onclick*="filtrerDR"]').forEach(function(b){ b.classList.remove('bp'); b.classList.add('bo'); });
  if (btn) { btn.classList.remove('bo'); btn.classList.add('bp'); }
}

function creerLivraisonDepuisDR(cmdId, source) {
  // Trouver la commande selon la source
  var cmd = null;
  var sources = {
    'Boutique': typeof CMDS!=='undefined'?CMDS:[],
    'Restauration': typeof COMMANDES_RESTO!=='undefined'?COMMANDES_RESTO:[],
    'Agriculture': typeof COMMANDES_AGRI!=='undefined'?COMMANDES_AGRI:[],
    'Logistique': typeof COMMANDES_LOGISTIQUE!=='undefined'?COMMANDES_LOGISTIQUE:[],
    'Meubles': typeof COMMANDES_MEUBLES!=='undefined'?COMMANDES_MEUBLES:[],
    'Pressing': typeof PRESSING_COMMANDES!=='undefined'?PRESSING_COMMANDES:[],
  };
  var liste = sources[source] || [];
  cmd = liste.find(function(c){ return c.id===cmdId; });
  if (!cmd) { toast('Commande non trouvée', 'error'); return; }
  if (typeof creerLivraison === 'function') {
    creerLivraison(cmd).then(function(liv) {
      toast('Livraison ' + liv.id + ' créée — allez dans Gestion Livraisons', 'success');
      renderPageDevisReservations(); // refresh
    });
  }
}
