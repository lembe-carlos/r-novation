// ═══════════════════════════════════════════════════════
//  SuperMarché CM — gestion-services.js
//  Page : Gestion unifiée Devis + Services + RDV
// ═══════════════════════════════════════════════════════

var _gsOnglet = 'rdv';

function renderPageGestionServices() {
  var z = document.getElementById('gs-content');
  if (!z) return;

  // ── Collecte unifiée ──
  var tousRDV = [], tousDevis = [], tousServices = [];

  // ── RDV ──
  // Coiffure
  (typeof RESERVATIONS_COIFFURE!=='undefined'?RESERVATIONS_COIFFURE:[]).forEach(function(r){
    tousRDV.push({ id:r.id, client:r.client||r.nom, tel:r.tel, date:r.date, heure:r.heure||'',
      detail:r.service||'Coiffure', prix:r.prix||r.tarif||0, statut:r.statut||'confirme',
      source:'Coiffure', couleur:'#8b5cf6', icon:'✂️' });
  });
  // Automobile RDV
  (typeof RESERVATIONS_AUTO!=='undefined'?RESERVATIONS_AUTO:[]).forEach(function(r){
    tousRDV.push({ id:r.id, client:r.client, tel:r.tel, date:r.date, heure:r.heure||'',
      detail:r.service||r.vehicule, prix:r.prix||0, statut:r.statut||'confirme',
      source:'Automobile', couleur:'#374151', icon:'🚗' });
  });
  // Santé RDV
  (typeof RDV_MEDECIN!=='undefined'?RDV_MEDECIN:[]).forEach(function(r){
    tousRDV.push({ id:r.id, client:r.client||r.patient, tel:r.tel, date:r.date, heure:r.heure||'',
      detail:r.medecin_nom||r.specialite, prix:r.tarif||0, statut:r.statut||'confirme',
      source:'Santé', couleur:'#CE1126', icon:'🏥' });
  });
  // Éducation cours
  (typeof RDV_COURS!=='undefined'?RDV_COURS:[]).forEach(function(r){
    tousRDV.push({ id:r.id, client:r.client, tel:r.tel, date:r.date, heure:r.heure||'',
      detail:r.matiere+(r.niveau?' — '+r.niveau:''), prix:r.prix||0, statut:r.statut||'confirme',
      source:'Éducation', couleur:'#7c3aed', icon:'📚' });
  });
  // Logistique réservations
  (typeof COMMANDES_LOGISTIQUE!=='undefined'?COMMANDES_LOGISTIQUE:[]).filter(function(c){ return c.type==='location'; }).forEach(function(r){
    tousRDV.push({ id:r.id, client:r.client, tel:r.tel||r.tel_exp, date:r.date||'', heure:'',
      detail:r.vehicule, prix:r.prix||0, statut:r.statut||'confirme',
      source:'Logistique', couleur:'#0369a1', icon:'📦' });
  });

  // ── DEVIS ──
  (typeof DEVIS_REPARATION!=='undefined'?DEVIS_REPARATION:[]).forEach(function(d){
    tousDevis.push({ id:d.id, client:d.client, tel:d.tel, date:d.cree_le||'',
      detail:d.panne, montant:d.total||0, statut:d.statut||'en_attente',
      source:'Auto Réparation', couleur:'#6b7280', icon:'🔧' });
  });
  (typeof DEVIS_MENUISERIE!=='undefined'?DEVIS_MENUISERIE:[]).forEach(function(d){
    tousDevis.push({ id:d.id, client:d.client||d.nom, tel:d.tel, date:d.cree_le||d.date||'',
      detail:d.description||d.produit, montant:d.montant||d.budget||0, statut:d.statut||'nouveau',
      source:'Menuiserie', couleur:'#92400e', icon:'🪵' });
  });
  (typeof DEVIS_ENERGIE!=='undefined'?DEVIS_ENERGIE:[]).forEach(function(d){
    tousDevis.push({ id:d.id, client:d.client, tel:d.tel, date:d.cree_le||'',
      detail:d.description||d.solution, montant:d.budget||0, statut:d.statut||'nouveau',
      source:'Énergie', couleur:'#fcd116', icon:'⚡' });
  });
  (typeof DEVIS_BTP!=='undefined'?DEVIS_BTP:[]).forEach(function(d){
    tousDevis.push({ id:d.id, client:d.client, tel:d.tel, date:d.cree_le||'',
      detail:d.description, montant:d.budget||0, statut:d.statut||'nouveau',
      source:'BTP', couleur:'#4b5563', icon:'🏗️' });
  });
  (typeof DEMANDES_IMMO!=='undefined'?DEMANDES_IMMO:[]).forEach(function(d){
    tousDevis.push({ id:d.id, client:d.client, tel:d.tel, date:d.cree_le||'',
      detail:d.type||d.type_bien, montant:d.budget||0, statut:d.statut||'nouveau',
      source:'Immobilier', couleur:'#047857', icon:'🏠' });
  });

  // ── SERVICES (commandes de services) ──
  (typeof PRESSING_COMMANDES!=='undefined'?PRESSING_COMMANDES:[]).forEach(function(c){
    tousServices.push({ id:c.id, client:c.client, tel:c.tel, date:c.date_depot||'',
      detail:'Pressing — '+((c.items||[]).length)+' article(s)', montant:c.total||0,
      statut:c.statut||'depose', source:'Pressing', couleur:'#0891b2', icon:'👔' });
  });
  (typeof COMMANDES_AGRI!=='undefined'?COMMANDES_AGRI:[]).forEach(function(c){
    tousServices.push({ id:c.id, client:c.client, tel:c.tel, date:c.cree_le||'',
      detail:typeof c.items==='string'?c.items:(c.items||[]).map(function(i){ return i.nom; }).join(', '),
      montant:c.total||0, statut:c.statut||'recu', source:'Agriculture', couleur:'#16a34a', icon:'🌱' });
  });
  (typeof COMMANDES_LOGISTIQUE!=='undefined'?COMMANDES_LOGISTIQUE:[]).filter(function(c){ return c.type==='colis'; }).forEach(function(c){
    tousServices.push({ id:c.id, client:c.expediteur||c.client, tel:c.tel_exp||c.tel, date:c.cree_le||'',
      detail:'Colis → '+c.destinataire+' ('+c.trajet+')', montant:c.prix||0,
      statut:c.statut||'recu', source:'Logistique Colis', couleur:'#0369a1', icon:'📦' });
  });
  (typeof COMMANDES_RESTO!=='undefined'?COMMANDES_RESTO:[]).forEach(function(c){
    tousServices.push({ id:c.id, client:c.client, tel:c.tel, date:c.cree_le||'',
      detail:'Resto '+(c.resto_nom||'')+' — '+(c.plats||[]).map(function(p){ return p.nom; }).join(', '),
      montant:c.total||0, statut:c.statut||'recu', source:'Restauration', couleur:'#f59e0b', icon:'🍽️' });
  });

  // ── KPIs ──
  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:20px">'
    + kpiGS('RDV confirmés', tousRDV.filter(function(r){ return r.statut==='confirme'; }).length, '#3b82f6')
    + kpiGS('Devis en attente', tousDevis.filter(function(d){ return ['nouveau','en_attente'].indexOf(d.statut)!==-1; }).length, '#f59e0b')
    + kpiGS('Services actifs', tousServices.filter(function(s){ return ['recu','depose','confirme','en_preparation'].indexOf(s.statut)!==-1; }).length, '#007A3D')
    + kpiGS('Total dossiers', tousRDV.length + tousDevis.length + tousServices.length, '#8b5cf6')
    + '</div>';

  // Onglets
  html += '<div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;border-bottom:2px solid #f0f0f0;padding-bottom:10px">'
    + ['rdv','devis','services'].map(function(ong) {
        var labels = { rdv:'RDV ('+tousRDV.length+')', devis:'Devis ('+tousDevis.length+')', services:'Services ('+tousServices.length+')' };
        var isActive = _gsOnglet === ong;
        return '<button class="btn '+(isActive?'bp':'bo')+' bsm" onclick="changerOngletGS(\''+ong+'\',this)">'+labels[ong]+'</button>';
      }).join('')
    + '<select id="gs-statut-filtre" onchange="renderTableauGS()" style="margin-left:auto;padding:6px 10px;border:1.5px solid var(--br);border-radius:8px;font-size:12px;outline:none">'
    + '<option value="">Tous statuts</option>'
    + '<option value="confirme">Confirmé</option>'
    + '<option value="en_attente">En attente</option>'
    + '<option value="termine">Terminé</option>'
    + '<option value="annule">Annulé</option>'
    + '</select>'
    + '</div>';

  html += '<div id="gs-tableau" class="cd"></div>';
  z.innerHTML = html;

  // Stocker les données pour le filtre
  window._gsData = { rdv: tousRDV, devis: tousDevis, services: tousServices };
  renderTableauGS();
}

function kpiGS(label, val, color) {
  return '<div class="cd" style="text-align:center;border-top:4px solid '+color+'">'
    + '<div style="font-size:24px;font-weight:800;color:'+color+'">'+val+'</div>'
    + '<div style="font-size:11px;color:#666;margin-top:2px">'+label+'</div>'
    + '</div>';
}

function changerOngletGS(ong, btn) {
  _gsOnglet = ong;
  document.querySelectorAll('[onclick*="changerOngletGS"]').forEach(function(b){
    b.classList.remove('bp'); b.classList.add('bo');
  });
  if (btn) { btn.classList.remove('bo'); btn.classList.add('bp'); }
  renderTableauGS();
}

function renderTableauGS() {
  var z = document.getElementById('gs-tableau'); if (!z) return;
  var data = (window._gsData || {})[_gsOnglet] || [];
  var filtreStatut = (document.getElementById('gs-statut-filtre')||{}).value || '';
  if (filtreStatut) data = data.filter(function(d){ return (d.statut||'').includes(filtreStatut); });

  var titres = { rdv:'Rendez-vous', devis:'Devis', services:'Services & Commandes' };
  var cols_rdv    = ['Module','ID','Client','Détail','Date & Heure','Montant','Statut','Action'];
  var cols_devis  = ['Module','ID','Client','Détail','Montant','Statut','Action'];
  var cols_serv   = ['Module','ID','Client','Détail','Montant','Statut','Action'];
  var cols = _gsOnglet==='rdv' ? cols_rdv : cols_devis;

  var stColors = {
    confirme:'#007A3D', en_attente:'#f59e0b', nouveau:'#f59e0b',
    termine:'#6b7280', annule:'#CE1126', refuse:'#CE1126',
    en_etude:'#3b82f6', livre:'#6b7280', depose:'#3b82f6',
    en_lavage:'#8b5cf6', pret:'#007A3D', recu:'#f59e0b',
    en_preparation:'#8b5cf6'
  };

  if (data.length === 0) {
    z.innerHTML = '<p style="text-align:center;color:#999;padding:30px">Aucun élément dans cette catégorie</p>';
    return;
  }

  var tableHtml = '<div class="ch" style="margin-bottom:10px">'
    + '<div class="ct">' + titres[_gsOnglet] + ' (' + data.length + ')</div>'
    + '<button class="btn bo bsm" onclick="exporterGS()">Exporter CSV</button>'
    + '</div>'
    + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<thead><tr style="background:#3b82f6;color:#fff">'
    + cols.map(function(c){ return '<th style="padding:8px;text-align:left;white-space:nowrap">'+c+'</th>'; }).join('')
    + '</tr></thead><tbody>'
    + data.slice(0,50).map(function(d, i) {
        var bg = i%2===0?'#fff':'#fafafa';
        var stc = stColors[d.statut||''] || '#999';
        var badge = '<span style="background:'+stc+'22;color:'+stc+';padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;white-space:nowrap">'+(d.statut||'—')+'</span>';
        var wa = d.tel ? '<a href="https://wa.me/'+(d.tel||'').replace(/[ +\-]/g,'')+'" target="_blank" style="background:#25D366;color:#fff;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;text-decoration:none">WA</a>' : '';
        var baseRow = '<tr style="background:'+bg+';border-bottom:1px solid #f0f0f0">'
          + '<td style="padding:8px"><span style="font-size:16px">'+d.icon+'</span><br><span style="font-size:10px;color:'+d.couleur+';font-weight:700">'+d.source+'</span></td>'
          + '<td style="padding:8px;font-weight:700;color:'+d.couleur+';font-size:11px">'+(d.id||'—')+'</td>'
          + '<td style="padding:8px"><div style="font-weight:600;white-space:nowrap">'+(d.client||'—')+'</div><div style="font-size:10px;color:#999">'+(d.tel||'')+'</div></td>'
          + '<td style="padding:8px;font-size:11px;color:#555;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+(d.detail||'')+'">'+(d.detail||'—')+'</td>';
        if (_gsOnglet === 'rdv') {
          baseRow += '<td style="padding:8px;font-size:11px;white-space:nowrap">'+(d.date||'—')+(d.heure?' à '+d.heure:'')+'</td>';
        }
        baseRow += '<td style="padding:8px;text-align:right;font-weight:700;color:#007A3D;white-space:nowrap">'+((d.montant||d.prix||0)>0?((d.montant||d.prix||0).toLocaleString('fr-FR')+' F'):'—')+'</td>'
          + '<td style="padding:8px">'+badge+'</td>'
          + '<td style="padding:8px">'+wa+'</td>'
          + '</tr>';
        return baseRow;
      }).join('')
    + '</tbody></table></div>';

  z.innerHTML = tableHtml;
}

function exporterGS() {
  var data = (window._gsData || {})[_gsOnglet] || [];
  var rows = [['Module','ID','Client','Téléphone','Détail','Montant (F)','Statut','Date']];
  data.forEach(function(d) {
    rows.push([d.source, d.id||'', d.client||'', d.tel||'', d.detail||'', d.montant||d.prix||0, d.statut||'', d.date||'']);
  });
  var csv = rows.map(function(r){ return r.map(function(v){ return '"'+(v||'').toString().replace(/"/g,'""')+'"'; }).join(';'); }).join('\n');
  var blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
  var a = document.createElement('a'); 
  a.href = URL.createObjectURL(blob);
  a.download = 'gs-'+_gsOnglet+'-'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();
}
