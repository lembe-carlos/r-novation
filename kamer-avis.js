// ═══════════════════════════════════════════════════════════════
//  KAMER360 — Système d'avis & notations vérifiés
//  Fonctionnalité 2/6
// ═══════════════════════════════════════════════════════════════

var KAMER_AVIS = {
  KEY: 'km_avis_data',

  load: function() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '{}'); }
    catch(e) { return {}; }
  },

  save: function(d) {
    try { localStorage.setItem(this.KEY, JSON.stringify(d)); return true; }
    catch(e) { return false; }
  },

  // section = 'coiffure', 'automobile', 'pressing', etc.
  getAvis: function(section, itemId) {
    var d = this.load();
    var key = section + '_' + itemId;
    return d[key] || [];
  },

  addAvis: function(section, itemId, avis) {
    var d    = this.load();
    var key  = section + '_' + itemId;
    if (!d[key]) d[key] = [];
    avis.id   = 'AV' + Date.now();
    avis.date = new Date().toLocaleDateString('fr-FR');
    avis.verifie = true;
    d[key].unshift(avis);
    this.save(d);
    return avis;
  },

  getStats: function(section, itemId) {
    var avis  = this.getAvis(section, itemId);
    if (!avis.length) return { note: 0, total: 0, distribution: [0,0,0,0,0] };
    var sum   = avis.reduce(function(s, a){ return s + (a.note||0); }, 0);
    var dist  = [0,0,0,0,0];
    avis.forEach(function(a){ if (a.note >= 1 && a.note <= 5) dist[a.note-1]++; });
    return { note: Math.round(sum/avis.length*10)/10, total: avis.length, distribution: dist };
  },

  // Avis global pour une page gérant
  getStatsGlobal: function(section) {
    var d = this.load();
    var allAvis = [];
    Object.keys(d).forEach(function(k) {
      if (k.startsWith(section + '_')) allAvis = allAvis.concat(d[k]);
    });
    if (!allAvis.length) return { note: 0, total: 0 };
    var sum = allAvis.reduce(function(s, a){ return s + (a.note||0); }, 0);
    return { note: Math.round(sum/allAvis.length*10)/10, total: allAvis.length };
  }
};

// ── Afficher les étoiles en HTML ──────────────────────────────
function renderEtoiles(note, size) {
  size = size || 16;
  var html = '<div style="display:inline-flex;gap:2px">';
  for (var i = 1; i <= 5; i++) {
    var filled = i <= Math.round(note);
    html += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="' + (filled?'#FCD116':'#e5e7eb') + '" stroke="' + (filled?'#e6a800':'#d1d5db') + '" stroke-width="1">'
      + '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  }
  return html + '</div>';
}

// ── Widget avis complet pour la marketplace ───────────────────
function renderWidgetAvis(section, itemId, containerEl) {
  if (!containerEl) return;
  var stats = KAMER_AVIS.getStats(section, itemId);
  var avis  = KAMER_AVIS.getAvis(section, itemId);
  var maxDist = Math.max.apply(null, stats.distribution.concat([1]));

  var html = '<div style="border-top:1px solid #f0f0f0;padding:16px 0 8px">';

  // En-tête stats
  html += '<div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap">'
    + '<div style="text-align:center;min-width:80px">'
    + '<div style="font-size:36px;font-weight:900;color:#007A3D;font-family:\'Playfair Display\',serif;line-height:1">' + (stats.note || '—') + '</div>'
    + renderEtoiles(stats.note, 14)
    + '<div style="font-size:11px;color:#999;margin-top:4px">' + stats.total + ' avis</div>'
    + '</div>'
    + '<div style="flex:1;min-width:150px">';

  // Barres de distribution
  [5,4,3,2,1].forEach(function(n) {
    var nb  = stats.distribution[n-1] || 0;
    var pct = maxDist > 0 ? Math.round(nb/maxDist*100) : 0;
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
      + '<div style="font-size:11px;color:#666;width:12px">' + n + '</div>'
      + '<div style="flex:1;height:6px;background:#f0f0f0;border-radius:20px;overflow:hidden">'
      + '<div style="height:100%;width:' + pct + '%;background:' + (n>=4?'#007A3D':n===3?'#f59e0b':'#CE1126') + ';border-radius:20px;transition:width .4s"></div>'
      + '</div>'
      + '<div style="font-size:11px;color:#999;width:20px">' + nb + '</div>'
      + '</div>';
  });
  html += '</div></div>';

  // Bouton laisser un avis
  html += '<button onclick="ouvrirFormAvis(\'' + section + '\',\'' + itemId + '\')" '
    + 'style="width:100%;background:#f0faf5;color:#007A3D;border:1.5px solid #007A3D;padding:10px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:14px">'
    + 'Laisser un avis</button>';

  // Afficher les avis récents
  avis.slice(0, 3).forEach(function(a) {
    html += '<div style="padding:12px;background:#fafafa;border-radius:10px;margin-bottom:8px">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
      + '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#007A3D,#00A852);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff;flex-shrink:0">'
      + (a.auteur||'?').charAt(0).toUpperCase() + '</div>'
      + '<div><div style="font-size:13px;font-weight:600">' + (a.auteur||'Client anonyme')
      + (a.verifie ? ' <span style="background:#e8f5ef;color:#007A3D;font-size:9px;padding:1px 5px;border-radius:10px;font-weight:700;vertical-align:middle">Vérifié</span>' : '') + '</div>'
      + '<div style="display:flex;align-items:center;gap:6px">' + renderEtoiles(a.note, 12)
      + '<span style="font-size:11px;color:#999">' + (a.date||'') + '</span></div></div></div>'
      + '<div style="font-size:13px;color:#555;line-height:1.5">' + (a.commentaire||'') + '</div>'
      + '</div>';
  });

  if (avis.length > 3) {
    html += '<div style="text-align:center;font-size:12px;color:#007A3D;cursor:pointer;font-weight:600" onclick="voirTousAvis(\'' + section + '\',\'' + itemId + '\')">Voir les ' + avis.length + ' avis →</div>';
  }

  html += '</div>';
  containerEl.innerHTML = html;
}

// ── Formulaire de dépôt d'avis ────────────────────────────────
var _avisContext = {};

function ouvrirFormAvis(section, itemId) {
  _avisContext = { section: section, itemId: itemId };
  var m = document.getElementById('m-kamer-avis');
  if (!m) return;
  document.getElementById('avis-form-content').innerHTML = ''
    + '<div style="margin-bottom:14px">'
    + '<div style="font-size:13px;font-weight:600;margin-bottom:8px;text-align:center">Votre note</div>'
    + '<div id="avis-etoiles" style="display:flex;justify-content:center;gap:6px;cursor:pointer">'
    + [1,2,3,4,5].map(function(n){
        return '<span onclick="selectEtoile(' + n + ')" onmouseover="hoverEtoile(' + n + ')" onmouseout="resetEtoiles()" data-note="' + n + '" '
          + 'style="font-size:36px;color:#e5e7eb;transition:color .15s">★</span>';
      }).join('') + '</div>'
    + '<div id="avis-note-txt" style="text-align:center;font-size:12px;color:#999;margin-top:4px">Cliquez pour noter</div>'
    + '</div>'
    + '<div style="margin-bottom:12px">'
    + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Votre prénom *</label>'
    + '<input type="text" id="avis-auteur" placeholder="Ex: Marie" style="width:100%;padding:9px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box">'
    + '</div>'
    + '<div style="margin-bottom:14px">'
    + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Votre commentaire</label>'
    + '<textarea id="avis-commentaire" rows="3" placeholder="Partagez votre expérience..." style="width:100%;padding:9px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;resize:vertical"></textarea>'
    + '</div>'
    + '<button onclick="soumettreAvis()" style="width:100%;background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border:none;padding:13px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">Publier mon avis</button>';
  openM('m-kamer-avis');
}

var _noteSelectionnee = 0;
var _noteLabels = ['','Très mauvais','Mauvais','Correct','Bien','Excellent !'];

function selectEtoile(n) {
  _noteSelectionnee = n;
  var stars = document.querySelectorAll('#avis-etoiles span');
  stars.forEach(function(s, i) { s.style.color = i < n ? '#FCD116' : '#e5e7eb'; });
  var txt = document.getElementById('avis-note-txt');
  if (txt) txt.textContent = _noteLabels[n] || '';
}
function hoverEtoile(n) {
  var stars = document.querySelectorAll('#avis-etoiles span');
  stars.forEach(function(s, i) { s.style.color = i < n ? '#FCD116' : '#e5e7eb'; });
}
function resetEtoiles() {
  selectEtoile(_noteSelectionnee);
}

function soumettreAvis() {
  if (!_noteSelectionnee) { if(typeof toast==='function') toast('Sélectionnez une note', 'warning'); return; }
  var auteur  = (document.getElementById('avis-auteur')||{}).value || '';
  var comment = (document.getElementById('avis-commentaire')||{}).value || '';
  if (!auteur.trim()) { if(typeof toast==='function') toast('Entrez votre prénom', 'warning'); return; }

  var avis = KAMER_AVIS.addAvis(_avisContext.section, _avisContext.itemId, {
    note: _noteSelectionnee,
    auteur: auteur.trim(),
    commentaire: comment.trim()
  });

  _noteSelectionnee = 0;
  if(typeof closeM==='function') closeM('m-kamer-avis');
  if(typeof toast==='function') toast('Merci pour votre avis !', 'success');
}

// ── Badge note compact pour les cartes marketplace ────────────
function badgeNote(section, itemId) {
  var s = KAMER_AVIS.getStats(section, itemId);
  if (!s.total) return '';
  return '<span style="display:inline-flex;align-items:center;gap:3px;background:#fff9e6;color:#b8860b;font-size:11px;font-weight:700;padding:2px 7px;border-radius:20px;border:1px solid #fcd116">'
    + '<svg width="10" height="10" viewBox="0 0 24 24" fill="#FCD116" stroke="#e6a800" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
    + s.note + ' (' + s.total + ')</span>';
}
