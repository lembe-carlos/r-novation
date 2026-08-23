// ═══════════════════════════════════════════════════════
//  SuperMarché CM — chiffres-affaires.js
//  Page CA global : tous les secteurs qui génèrent des revenus
// ═══════════════════════════════════════════════════════

function renderPageCA() {
  var z = document.getElementById('ca-content');
  if (!z) return;

  // ── Collecter les revenus de tous les modules ──
  var secteurs = [];

  function addSecteur(nom, icon, couleur, commandes, extractTotal) {
    var total = 0, nb = 0, mois = {};
    (commandes||[]).forEach(function(c) {
      if (['annule','annulee','refuse'].indexOf(c.statut||'') !== -1) return;
      var t = extractTotal(c);
      total += t; nb++;
      var d = new Date(c.cree_le || c.date_creation || c.date || new Date());
      var key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
      mois[key] = (mois[key]||0) + t;
    });
    secteurs.push({ nom:nom, icon:icon, couleur:couleur, total:total, nb:nb, mois:mois });
  }

  // Boutique en ligne
  addSecteur('Boutique en ligne',       '🛒', '#007A3D',
    typeof CMDS!=='undefined'?CMDS:[], function(c){ return c.total||0; });
  // Ventes caisse
  addSecteur('Ventes caisse',           '💰', '#16a34a',
    typeof VENTES!=='undefined'?VENTES:[], function(c){ return c.montant||c.total||0; });
  // Coiffure
  addSecteur('Salon de Coiffure',       '✂️', '#8b5cf6',
    typeof RESERVATIONS_COIFFURE!=='undefined'?RESERVATIONS_COIFFURE.filter(function(r){ return r.statut==='termine'; }):[], function(r){ return r.prix||r.tarif||0; });
  // Pressing
  addSecteur('Pressing',                '👔', '#0891b2',
    typeof PRESSING_COMMANDES!=='undefined'?PRESSING_COMMANDES.filter(function(c){ return c.statut==='livre'; }):[], function(c){ return c.total||0; });
  // Automobile
  addSecteur('Automobile',              '🚗', '#374151',
    typeof RESERVATIONS_AUTO!=='undefined'?RESERVATIONS_AUTO.filter(function(r){ return r.statut==='termine'; }):[], function(r){ return r.prix||0; });
  // Devis auto réparés
  addSecteur('Réparations auto',        '🔧', '#6b7280',
    typeof DEVIS_REPARATION!=='undefined'?DEVIS_REPARATION.filter(function(d){ return d.statut==='termine'; }):[], function(d){ return d.total||0; });
  // Menuiserie
  addSecteur('Menuiserie',              '🪵', '#92400e',
    typeof DEVIS_MENUISERIE!=='undefined'?DEVIS_MENUISERIE.filter(function(d){ return d.statut==='livre'; }):[], function(d){ return d.montant||d.budget||0; });
  // Meubles
  addSecteur('Meubles',                 '🛋️', '#db2777',
    typeof COMMANDES_MEUBLES!=='undefined'?COMMANDES_MEUBLES.filter(function(c){ return c.statut==='livre'; }):[], function(c){ return c.total||0; });
  // Restauration
  addSecteur('Restauration',            '🍽️', '#f59e0b',
    typeof COMMANDES_RESTO!=='undefined'?COMMANDES_RESTO.filter(function(c){ return c.statut==='livre'; }):[], function(c){ return c.total||0; });
  // Énergie
  addSecteur('Énergie & Solaire',       '⚡', '#fcd116',
    typeof DEVIS_ENERGIE!=='undefined'?DEVIS_ENERGIE.filter(function(d){ return d.statut==='accepte'||d.statut==='livre'; }):[], function(d){ return d.montant||d.budget||0; });
  // Santé
  addSecteur('Santé & Médical',         '🏥', '#CE1126',
    typeof RDV_MEDECIN!=='undefined'?RDV_MEDECIN.filter(function(r){ return r.statut==='termine'; }):[], function(r){ return r.tarif||0; });
  // BTP
  addSecteur('BTP & Construction',      '🏗️', '#4b5563',
    typeof DEVIS_BTP!=='undefined'?DEVIS_BTP.filter(function(d){ return d.statut==='termine'; }):[], function(d){ return d.budget||0; });
  // Agriculture
  addSecteur('Agriculture',             '🌱', '#16a34a',
    typeof COMMANDES_AGRI!=='undefined'?COMMANDES_AGRI.filter(function(c){ return c.statut==='livre'; }):[], function(c){ return c.total||0; });
  // Logistique
  addSecteur('Logistique',              '📦', '#0369a1',
    typeof COMMANDES_LOGISTIQUE!=='undefined'?COMMANDES_LOGISTIQUE.filter(function(c){ return ['livre','termine'].indexOf(c.statut||'')!==-1; }):[], function(c){ return c.prix||0; });
  // Éducation
  addSecteur('Éducation & Cours',       '📚', '#7c3aed',
    typeof RDV_COURS!=='undefined'?RDV_COURS.filter(function(r){ return r.statut==='confirme'; }):[], function(r){ return r.prix||0; });
  // Immobilier
  addSecteur('Immobilier',              '🏠', '#047857',
    typeof DEMANDES_IMMO!=='undefined'?DEMANDES_IMMO.filter(function(d){ return d.statut==='conclue'; }):[], function(d){ return d.budget||0; });

  // ── Calculs globaux ──
  var totalGeneral = secteurs.reduce(function(s,sec){ return s + sec.total; }, 0);
  var nbOperations = secteurs.reduce(function(s,sec){ return s + sec.nb; }, 0);
  var meilleurSecteur = secteurs.reduce(function(a,b){ return a.total > b.total ? a : b; }, secteurs[0] || {nom:'—',total:0});

  // Mois actuel
  var now = new Date();
  var moisKey = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
  var caMois = secteurs.reduce(function(s,sec){ return s + (sec.mois[moisKey]||0); }, 0);

  // ── Construire le HTML ──
  var html = '';

  // KPIs globaux
  html += '<div id="secteurs-ca-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:20px">'
    + kpiCA('CA Total', totalGeneral.toLocaleString('fr-FR') + ' F', '#007A3D', '📊')
    + kpiCA('Ce mois', caMois.toLocaleString('fr-FR') + ' F', '#3b82f6', '📅')
    + kpiCA('Transactions', nbOperations, '#8b5cf6', '🔢')
    + kpiCA('Meilleur secteur', meilleurSecteur.nom || '—', '#f59e0b', '🏆')
    + '</div>';

  // Sélecteur de période
  html += '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center">'
    + '<select id="ca-periode" onchange="filtrerCA()" style="padding:8px 12px;border:1.5px solid var(--br);border-radius:10px;font-size:13px;outline:none">'
    + '<option value="tout">Toute la période</option>'
    + '<option value="mois" selected>Ce mois</option>'
    + '<option value="trim">Ce trimestre</option>'
    + '<option value="annee">Cette année</option>'
    + '</select>'
    + '<button class="btn bp bsm" onclick="exporterCA()">Exporter CSV</button>'
    + '</div>';

  // Tableau des secteurs
  html += '<div class="cd" style="margin-bottom:16px"><div class="ch"><div class="ct">CA par secteur d\'activité</div></div>'
    + '<div style="overflow-x:auto;margin-top:12px"><table style="width:100%;border-collapse:collapse;font-size:13px">'
    + '<thead><tr style="background:#007A3D;color:#fff">'
    + '<th style="padding:10px;text-align:left">Secteur</th>'
    + '<th style="padding:10px;text-align:center">Transactions</th>'
    + '<th style="padding:10px;text-align:right">CA Total</th>'
    + '<th style="padding:10px;text-align:right">Ce mois</th>'
    + '<th style="padding:10px;text-align:right">Panier moyen</th>'
    + '<th style="padding:10px;text-align:right">Part %</th>'
    + '</tr></thead><tbody id="ca-tbody">'
    + secteurs.filter(function(s){ return s.total > 0 || s.nb > 0; })
              .sort(function(a,b){ return b.total - a.total; })
              .map(function(sec, i) {
        var bg = i%2===0?'#fff':'#f9fafb';
        var panierMoyen = sec.nb > 0 ? Math.round(sec.total/sec.nb) : 0;
        var part = totalGeneral > 0 ? Math.round(sec.total/totalGeneral*100) : 0;
        var caMoisSec = sec.mois[moisKey] || 0;
        return '<tr style="background:'+bg+';border-bottom:1px solid #f0f0f0">'
          + '<td style="padding:10px"><div style="display:flex;align-items:center;gap:8px">'
          + '<div style="width:32px;height:32px;border-radius:8px;background:'+sec.couleur+'22;display:flex;align-items:center;justify-content:center;font-size:18px">'+sec.icon+'</div>'
          + '<span style="font-weight:700">'+sec.nom+'</span></div></td>'
          + '<td style="padding:10px;text-align:center;color:#555">'+sec.nb+'</td>'
          + '<td style="padding:10px;text-align:right;font-weight:800;color:'+sec.couleur+'">'+sec.total.toLocaleString('fr-FR')+' F</td>'
          + '<td style="padding:10px;text-align:right;color:#555">'+caMoisSec.toLocaleString('fr-FR')+' F</td>'
          + '<td style="padding:10px;text-align:right;color:#666">'+panierMoyen.toLocaleString('fr-FR')+' F</td>'
          + '<td style="padding:10px;text-align:right">'
          + '<div style="display:flex;align-items:center;gap:6px;justify-content:flex-end">'
          + '<div style="width:60px;height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden">'
          + '<div style="width:'+part+'%;height:100%;background:'+sec.couleur+';border-radius:4px"></div></div>'
          + '<span style="font-weight:700;color:'+sec.couleur+';min-width:35px;text-align:right">'+part+'%</span>'
          + '</div></td>'
          + '</tr>';
      }).join('')
    + '</tbody></table></div></div>';

  // Graphique barres mensuel
  var moisLabels = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  var annee = now.getFullYear();
  var caParMois = new Array(12).fill(0);
  secteurs.forEach(function(sec) {
    Object.keys(sec.mois).forEach(function(key) {
      var parts = key.split('-');
      if (parseInt(parts[0]) === annee) {
        caParMois[parseInt(parts[1])-1] += sec.mois[key];
      }
    });
  });
  var maxCA = Math.max.apply(null, caParMois) || 1;

  html += '<div class="cd"><div class="ch"><div class="ct">Évolution mensuelle ' + annee + '</div></div>'
    + '<div style="display:flex;align-items:flex-end;gap:4px;height:140px;padding:12px;margin-top:8px">'
    + caParMois.map(function(ca, i) {
        var h = Math.max(4, Math.round((ca/maxCA)*120));
        var isNow = i === now.getMonth();
        return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">'
          + '<div style="font-size:9px;color:#555;font-weight:600">'+(ca>0?Math.round(ca/1000)+'K':'')+'</div>'
          + '<div style="width:100%;height:'+h+'px;background:'+(isNow?'#007A3D':'#d1fae5')+';border-radius:4px 4px 0 0;min-height:4px;cursor:pointer" title="'+moisLabels[i]+': '+ca.toLocaleString('fr-FR')+' FCFA"></div>'
          + '<div style="font-size:10px;color:'+(isNow?'#007A3D':'#999')+';font-weight:'+(isNow?'700':'400')+'">'+moisLabels[i]+'</div>'
          + '</div>';
      }).join('')
    + '</div></div>';

  z.innerHTML = html;
}

function kpiCA(label, val, color, icon) {
  return '<div class="cd" style="text-align:center;border-top:4px solid '+color+';padding:14px">'
    + '<div style="font-size:20px;margin-bottom:4px">'+icon+'</div>'
    + '<div style="font-size:18px;font-weight:800;color:'+color+'">'+val+'</div>'
    + '<div style="font-size:11px;color:#666;margin-top:2px">'+label+'</div>'
    + '</div>';
}

function filtrerCA() {
  // Re-render avec le filtre
  renderPageCA();
}

function exporterCA() {
  var rows = [['Secteur','Transactions','CA Total (FCFA)','Ce mois (FCFA)','Panier moyen']];
  var tbody = document.getElementById('ca-tbody');
  if (!tbody) return;
  tbody.querySelectorAll('tr').forEach(function(tr) {
    var cells = tr.querySelectorAll('td');
    if (cells.length >= 5) {
      rows.push([
        cells[0].textContent.trim(),
        cells[1].textContent.trim(),
        cells[2].textContent.replace(/\s*F$/,'').replace(/\s/g,''),
        cells[3].textContent.replace(/\s*F$/,'').replace(/\s/g,''),
        cells[4].textContent.replace(/\s*F$/,'').replace(/\s/g,''),
      ]);
    }
  });
  var csv = rows.map(function(r){ return r.join(';'); }).join('\n');
  var blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'supermarche-cm-ca-' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
}


// ══════════════════════════════════════════════════════════════
//  AFFICHAGE COMMISSION KAMER360 — Page Chiffres d'Affaires
// ══════════════════════════════════════════════════════════════
async function renderCommissionKamer360() {
  var z = document.getElementById('commission-content');
  if (!z) return;

  try {
    var sb = null;
    if (typeof window.supabase !== 'undefined' && typeof SM_CONFIG !== 'undefined' && SM_CONFIG.supabase) {
      sb = window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
    }
    if (!sb) {
      z.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Supabase non configuré</p>';
      return;
    }

    var user = JSON.parse(localStorage.getItem('sm_user') || '{}');
    var smNom = user.supermarche || user.sm || '';

    var res = await sb.from('kamer360_revenus')
      .select('*')
      .eq('gerant_sm', smNom)
      .order('created_at', { ascending: false })
      .limit(100);

    if (res.error || !res.data || res.data.length === 0) {
      z.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucune commission enregistrée pour le moment</p>';
      return;
    }

    var rows = res.data;
    var totalCA       = rows.reduce(function(s,r){ return s + (r.sous_total || 0); }, 0);
    var totalCommission = rows.reduce(function(s,r){ return s + (r.commission_montant || 0); }, 0);
    var totalNet       = rows.reduce(function(s,r){ return s + (r.montant_net_gerant || 0); }, 0);
    var tauxMoyen      = totalCA > 0 ? (totalCommission / totalCA * 100) : 0;

    var html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">';
    html += statCard('Chiffre d\'affaires', totalCA.toLocaleString('fr-FR') + ' FCFA', '#007A3D');
    html += statCard('Commission KAMER360', totalCommission.toLocaleString('fr-FR') + ' FCFA', '#ef4444');
    html += statCard('Net pour vous', totalNet.toLocaleString('fr-FR') + ' FCFA', '#1e40af');
    html += statCard('Taux moyen', tauxMoyen.toFixed(1) + ' %', '#f59e0b');
    html += '</div>';

    html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">';
    html += '<thead><tr style="background:#f9fafb;text-align:left">';
    html += '<th style="padding:8px 12px">Commande</th><th style="padding:8px 12px">Date</th><th style="padding:8px 12px">CA</th><th style="padding:8px 12px">Commission</th><th style="padding:8px 12px">Net</th><th style="padding:8px 12px">Statut</th>';
    html += '</tr></thead><tbody>';

    rows.slice(0, 20).forEach(function(r) {
      var date = r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '';
      var statutBadge = r.statut === 'reverse' ? '<span style="color:#059669;font-weight:600">✓ Reversé</span>' : '<span style="color:#d97706;font-weight:600">⏳ En attente</span>';
      html += '<tr style="border-bottom:1px solid #f3f4f6">';
      html += '<td style="padding:8px 12px;font-family:monospace">' + (r.commande_id||'').slice(-8) + '</td>';
      html += '<td style="padding:8px 12px">' + date + '</td>';
      html += '<td style="padding:8px 12px">' + (r.sous_total||0).toLocaleString('fr-FR') + ' FCFA</td>';
      html += '<td style="padding:8px 12px;color:#ef4444">-' + (r.commission_montant||0).toLocaleString('fr-FR') + ' FCFA</td>';
      html += '<td style="padding:8px 12px;font-weight:700;color:#007A3D">' + (r.montant_net_gerant||0).toLocaleString('fr-FR') + ' FCFA</td>';
      html += '<td style="padding:8px 12px">' + statutBadge + '</td>';
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    z.innerHTML = html;

  } catch(e) {
    _logErr('renderCommissionKamer360', e);
    z.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Erreur de chargement</p>';
  }
}

function statCard(label, value, color) {
  return '<div style="background:#f9fafb;border-radius:12px;padding:14px;border:1px solid #e5e7eb">' +
    '<div style="font-size:11px;color:#6b7280;margin-bottom:4px">' + label + '</div>' +
    '<div style="font-size:18px;font-weight:800;color:' + color + '">' + value + '</div></div>';
}

// Appeler automatiquement quand la page CA s'ouvre
var _origRenderPageCA = renderPageCA;
renderPageCA = function() {
  _origRenderPageCA();
  renderCommissionKamer360();
};
