// ═══════════════════════════════════════════════════════
//  SuperMarché CM — stats-clients.js
//  Clients inscrits boutique + statistiques commandes
// ═══════════════════════════════════════════════════════

var STATS_CLIENTS = {};
var CLIENTS_SUPABASE = [];

function _sbStats() {
  if (typeof window.supabase === 'undefined') return null;
  try {
    return window.supabase.createClient(
      SM_CONFIG.supabase.url,
      SM_CONFIG.supabase.key
    );
  } catch(e) { return null; }
}

// ── Charger les clients inscrits depuis Supabase ──
async function chargerClientsBoutique() {
  CLIENTS_SUPABASE = [];
  // 1. Lire d'abord depuis localStorage (fonctionne hors-ligne et en local)
  try {
    var local = JSON.parse(localStorage.getItem('sm_clients_boutique') || '[]');
    if (local.length > 0) {
      CLIENTS_SUPABASE = local;
      console.log('[Clients] ' + local.length + ' clients depuis localStorage');
    }
  } catch(e) {}
  // 2. Essayer Supabase pour mettre à jour
  try {
    var sb = _sbStats(); if (!sb) return;
    sb.from('clients_boutique').select('*').order('created_at', { ascending: false })
      .then(function(res) {
        if (res.data && res.data.length > 0) {
          CLIENTS_SUPABASE = res.data;
          // Synchroniser dans localStorage
          try { localStorage.setItem('sm_clients_boutique', JSON.stringify(res.data)); } catch(e) {}
          calculerStatsClients();
          var z = document.getElementById('stats-clients-content');
          if (z) renderStatsClients();
          console.log('[Clients] ' + res.data.length + ' clients mis à jour depuis Supabase');
        }
      }).catch(function(e) { console.warn('[Clients] Supabase offline:', e.message); });
  } catch(e) {}
}

// ── Stats depuis les commandes (clients acheteurs) ──
function calculerStatsClients() {
  if (typeof CMDS === 'undefined') return;
  var clients = {};
  CMDS.forEach(function(cmd) {
    if (cmd.statut === 'annulee') return;
    var tel = cmd.tel || 'inconnu';
    if (!clients[tel]) clients[tel] = {
      nom: cmd.client, tel: tel, email: cmd.email || '',
      nb_cmd: 0, total: 0, produits: {}, derniere_cmd: ''
    };
    clients[tel].nb_cmd++;
    clients[tel].total += cmd.total || 0;
    clients[tel].derniere_cmd = cmd.date;
    (cmd.items || []).forEach(function(it) {
      clients[tel].produits[it.nom] = (clients[tel].produits[it.nom] || 0) + 1;
    });
  });
  STATS_CLIENTS = clients;
  return clients;
}

// ── Rendu principal ──
async function renderStatsClients() {
  var container = document.getElementById('stats-clients-content');
  if (!container) return;

  // Loader
  container.innerHTML = '<div style="text-align:center;padding:30px;color:#007A3D">Chargement des clients...</div>';

  // Charger depuis Supabase
  chargerClientsBoutique();
  calculerStatsClients();

  var acheteurs = Object.values(STATS_CLIENTS).sort(function(a,b){ return b.total - a.total; });
  var inscrits  = CLIENTS_SUPABASE;

  // ── KPIs ──
  var totalInscrits  = inscrits.length;
  var totalAcheteurs = acheteurs.length;
  var totalCA        = acheteurs.reduce(function(s,c){ return s + c.total; }, 0);
  var panierMoyen    = totalAcheteurs > 0
    ? Math.round(acheteurs.reduce(function(s,c){ return s + c.total / c.nb_cmd; }, 0) / totalAcheteurs)
    : 0;
  var fideles = acheteurs.filter(function(c){ return c.nb_cmd >= 3; }).length;

  var html = '';

  // KPIs
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:20px">';
  html += kpiCard('Inscrits boutique', totalInscrits,   '<img src="https://img.icons8.com/ios/20/007A3D/add-user-male.png" style="width:18px;height:18px;vertical-align:middle">');
  html += kpiCard('Acheteurs uniques', totalAcheteurs,  '<img src="https://img.icons8.com/ios/20/007A3D/conference-call.png" style="width:18px;height:18px;vertical-align:middle">');
  html += kpiCard('CA total',          totalCA.toLocaleString('fr-FR') + ' F', '<img src="https://img.icons8.com/ios/20/007A3D/money.png" style="width:18px;height:18px;vertical-align:middle">');
  html += kpiCard('Panier moyen',      panierMoyen.toLocaleString('fr-FR') + ' F', '<img src="https://img.icons8.com/ios/20/007A3D/shopping-cart.png" style="width:18px;height:18px;vertical-align:middle">');
  html += kpiCard('Fidèles (3+ cmd)',  fideles, '<img src="https://img.icons8.com/ios/20/FCD116/star.png" style="width:18px;height:18px;vertical-align:middle">');
  html += '</div>';

  // ── TABLEAU : Clients inscrits (depuis Supabase) ──
  html += '<div class="cd" style="margin-bottom:16px">';
  html += '<div class="ch"><div class="ct">Clients inscrits boutique en ligne</div>';
  html += '<span class="badge bgg">' + totalInscrits + ' clients</span></div>';

  if (inscrits.length === 0) {
    html += '<div style="text-align:center;color:#999;padding:24px">';
    html += '<img src="https://img.icons8.com/ios/40/999999/add-user-male.png" style="width:36px;height:36px;display:block;margin:0 auto 8px">';
    html += '<div style="font-size:14px;font-weight:600">Aucun client inscrit pour l\'instant</div>';
    html += '<div style="font-size:12px;margin-top:4px">Les clients qui créent un compte sur la boutique apparaîtront ici</div>';
  } else {
    html += '<div style="overflow-x:auto;margin-top:12px"><table style="width:100%;border-collapse:collapse;font-size:13px">';
    html += '<thead><tr style="background:#007A3D;color:#fff">';
    html += '<th style="padding:10px;text-align:left">Client</th>';
    html += '<th style="padding:10px;text-align:center">Commandes</th>';
    html += '<th style="padding:10px;text-align:right">Total dépensé</th>';
    html += '<th style="padding:10px;text-align:left">Produit favori</th>';
    html += '<th style="padding:10px;text-align:left">Dernière commande</th>';
    html += '</tr></thead><tbody>';

    acheteurs.slice(0, 20).forEach(function(c, i) {
      var bg = i % 2 === 0 ? '#fff' : '#f9fafb';
      var prodFav = Object.entries(c.produits).sort(function(a,b){ return b[1]-a[1]; })[0];
      var medaille = i === 0 ? '<img src="https://img.icons8.com/ios/16/FFD700/trophy.png" style="width:14px;height:14px;vertical-align:middle"> '
                  : i === 1 ? '<img src="https://img.icons8.com/ios/16/C0C0C0/trophy.png" style="width:14px;height:14px;vertical-align:middle"> '
                  : i === 2 ? '<img src="https://img.icons8.com/ios/16/cd7f32/trophy.png" style="width:14px;height:14px;vertical-align:middle"> ' : '';
      html += '<tr style="background:' + bg + ';border-bottom:1px solid #f0f0f0">';
      html += '<td style="padding:10px"><strong>' + medaille + (c.nom || '—') + '</strong><br><span style="font-size:11px;color:#999">' + c.tel + '</span></td>';
      html += '<td style="padding:10px;text-align:center;font-weight:700;color:#007A3D">' + c.nb_cmd + '</td>';
      html += '<td style="padding:10px;text-align:right;font-weight:800;color:#007A3D">' + c.total.toLocaleString('fr-FR') + ' F</td>';
      html += '<td style="padding:10px;font-size:12px;color:#555">' + (prodFav ? prodFav[0] : '—') + '</td>';
      html += '<td style="padding:10px;font-size:12px;color:#666">' + (c.derniere_cmd || '—') + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';

  container.innerHTML = html;
}

function formatDateSC(iso) {
  if (!iso) return '—';
  try {
    var d = new Date(iso);
    return d.toLocaleDateString('fr-FR');
  } catch(e) { return iso; }
}

function kpiCard(label, valeur, icone) {
  return '<div class="cd" style="text-align:center;padding:14px">'
    + (icone ? '<div style="margin-bottom:6px">' + icone + '</div>' : '')
    + '<div style="font-size:20px;font-weight:800;color:#007A3D">' + valeur + '</div>'
    + '<div style="font-size:11px;color:#666;margin-top:2px">' + label + '</div>'
    + '</div>';
}
