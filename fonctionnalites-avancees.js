// ═══════════════════════════════════════════════════════
//  SuperMarché CM — fonctionnalites-avancees.js
//  Toutes les fonctionnalités avancées :
//  - Carte livraisons (Leaflet)
//  - QR codes invitations
//  - SMS notifications livraison
//  - Filtre date commandes
//  - Import CSV produits
//  - Calendrier RDV semaine
//  - Calcul m² menuiserie
//  - Météo agricole Cameroun
//  - Calculateur crédit immobilier
//  - Galerie photos réalisations
//  - Comparaison CA mois/mois
//  - Vidéo consultation/cours (Jitsi)
// ═══════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════
//  1. CARTE GÉOLOCALISATION LIVRAISONS (Leaflet)
// ══════════════════════════════════════════════════════
var _leafletLoaded = false;

function _chargerLeaflet(callback) {
  if (typeof L !== 'undefined') { callback(); return; }
  if (_leafletLoaded) { setTimeout(callback, 500); return; }
  _leafletLoaded = true;

  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
  document.head.appendChild(css);

  var script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
  script.onload = callback;
  document.head.appendChild(script);
}

var _carteMap = null;

function initCarteLivraisons() {
  var z = document.getElementById('carte-livraisons');
  if (!z) return;

  _chargerLeaflet(function() {
    if (_carteMap) { _carteMap.remove(); _carteMap = null; }

    z.style.height = '380px';
    _carteMap = L.map('carte-livraisons').setView([4.05, 9.7], 12); // Douala

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(_carteMap);

    // Icônes couleurs
    function icone(couleur) {
      return L.divIcon({
        html: '<div style="background:' + couleur + ';width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.3)"></div>',
        className: '', iconSize: [14, 14]
      });
    }

    var livraisons = (typeof LIVRAISONS !== 'undefined' && LIVRAISONS.liste) ? LIVRAISONS.liste : [];
    // Villes Cameroun avec coords approximatives
    var coordsVilles = {
      'Douala': [4.05, 9.70], 'Yaoundé': [3.87, 11.52], 'Bafoussam': [5.47, 10.42],
      'Garoua': [9.30, 13.40], 'Bamenda': [5.95, 10.17], 'Maroua': [10.60, 14.32],
      'Ngaoundéré': [7.32, 13.58], 'Bertoua': [4.58, 13.68], 'Ebolowa': [2.90, 11.15],
      'Edéa': [3.80, 10.13], 'Buea': [4.15, 9.23], 'Kribi': [2.94, 9.91],
      'Limbé': [4.02, 9.21], 'Sangmélima': [2.94, 11.98], 'Loum': [4.71, 9.74]
    };

    var stCouleurs = {
      'en_attente': '#f59e0b', 'assignee': '#3b82f6',
      'en_cours': '#8b5cf6', 'livree': '#007A3D', 'echec': '#CE1126'
    };

    livraisons.slice(0, 30).forEach(function(liv) {
      var ville = liv.ville || liv.adresse || 'Douala';
      var coords = null;
      Object.keys(coordsVilles).forEach(function(v) {
        if (ville.includes(v)) coords = coordsVilles[v];
      });
      if (!coords) coords = [4.05 + (Math.random() - 0.5) * 0.15, 9.70 + (Math.random() - 0.5) * 0.15];

      var couleur = stCouleurs[liv.statut || 'en_attente'] || '#999';
      L.marker(coords, { icon: icone(couleur) })
        .addTo(_carteMap)
        .bindPopup(
          '<strong>' + (liv.client || '—') + '</strong><br>'
          + (liv.adresse || ville) + '<br>'
          + '<span style="color:' + couleur + ';font-weight:600">' + (liv.statut || '—') + '</span><br>'
          + (liv.livreur_nom ? '🛵 ' + liv.livreur_nom : '')
        );
    });

    // Légende
    var legende = L.control({ position: 'bottomright' });
    legende.onAdd = function() {
      var div = L.DomUtil.create('div', '');
      div.style.cssText = 'background:#fff;padding:8px;border-radius:8px;font-size:11px;box-shadow:0 2px 8px rgba(0,0,0,.15)';
      div.innerHTML = Object.entries(stCouleurs).map(function(e) {
        return '<div style="display:flex;align-items:center;gap:4px;margin-bottom:3px">'
          + '<div style="width:10px;height:10px;border-radius:50%;background:' + e[1] + '"></div>'
          + '<span>' + e[0].replace('_', ' ') + '</span></div>';
      }).join('');
      return div;
    };
    legende.addTo(_carteMap);
  });
}

// ══════════════════════════════════════════════════════
//  2. QR CODE INVITATIONS (qrcode.js)
// ══════════════════════════════════════════════════════
function _chargerQRCode(callback) {
  if (typeof QRCode !== 'undefined') { callback(); return; }
  var script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  script.onload = callback;
  document.head.appendChild(script);
}

function genererQRCode(code, role, containerId) {
  _chargerQRCode(function() {
    var z = document.getElementById(containerId || 'qr-container');
    if (!z) return;
    z.innerHTML = '';

    var texte = 'https://supermarche-cm.vercel.app?code=' + code + '&role=' + role;

    new QRCode(z, {
      text: texte,
      width: 160, height: 160,
      colorDark: '#007A3D', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });

    // Bouton télécharger
    setTimeout(function() {
      var canvas = z.querySelector('canvas');
      if (!canvas) return;
      var btn = document.createElement('button');
      btn.className = 'btn bo bsm';
      btn.style.cssText = 'display:block;margin:8px auto 0;';
      btn.textContent = 'Télécharger QR';
      btn.onclick = function() {
        var a = document.createElement('a');
        a.download = 'qr-' + code + '.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
      };
      z.appendChild(btn);
    }, 300);
  });
}

function ouvrirQRInvitation(code, role) {
  var modal = document.getElementById('m-qr-invitation');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'm-qr-invitation';
    modal.className = 'mo';
    modal.innerHTML = '<div class="mdl" style="max-width:300px;text-align:center">'
      + '<div class="mh"><h3>QR Code invitation</h3><button class="cbtn" onclick="closeM(\'m-qr-invitation\')">X</button></div>'
      + '<div id="qr-code-container" style="margin:16px auto;width:fit-content"></div>'
      + '<div id="qr-code-info" style="font-size:12px;color:#555;margin-bottom:12px"></div>'
      + '<p style="font-size:11px;color:#999;margin:0">Scanner pour rejoindre en tant que <span id="qr-role-label"></span></p>'
      + '</div>';
    document.body.appendChild(modal);
  }

  document.getElementById('qr-code-info').textContent = 'Code : ' + code;
  document.getElementById('qr-role-label').textContent = role;
  openM('m-qr-invitation');
  genererQRCode(code, role, 'qr-code-container');
}

// ══════════════════════════════════════════════════════
//  3. SMS NOTIFICATION LIVRAISON CLIENT
// ══════════════════════════════════════════════════════
async function envoyerSMSLivraisonClient(livraison) {
  if (!livraison || !livraison.tel) return;

  var boutique = (typeof SM_CONFIG !== 'undefined') ? SM_CONFIG.boutique.nom : 'SuperMarché CM';
  var msg = boutique + ' : Votre commande N°' + (livraison.id || '') +
    ' est ' + (livraison.statut === 'livree' ? 'LIVRÉE ! Merci 🎉' :
    livraison.statut === 'en_cours' ? 'en cours de livraison 🛵' :
    livraison.statut === 'assignee' ? 'assignée à un livreur' : 'mise à jour') +
    '. Infos: ' + (SM_CONFIG && SM_CONFIG.boutique ? SM_CONFIG.boutique.telephone : '');

  try {
    var backend = (typeof BACKEND !== 'undefined') ? BACKEND : 'https://supermarche-cm-backend-production.up.railway.app';
    var resp = await fetch(backend + '/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: livraison.tel, message: msg })
    });
    var data = await resp.json();
    if (data.success) {
      toast('SMS envoyé à ' + livraison.client, 'success');
    }
  } catch(e) {
    console.warn('SMS livraison:', e);
    // Fallback WhatsApp
    var wa = 'https://wa.me/' + livraison.tel.replace(/[ +\-]/g, '') +
      '?text=' + encodeURIComponent(msg);
    window.open(wa, '_blank');
  }
}

// ══════════════════════════════════════════════════════
//  4. FILTRE PAR DATE — COMMANDES
// ══════════════════════════════════════════════════════
function filtrerCommandesParDate() {
  var debut  = (document.getElementById('cmd-date-debut') || {}).value || '';
  var fin    = (document.getElementById('cmd-date-fin')   || {}).value || '';
  var statut = (document.getElementById('cmd-statut-f')   || {}).value || '';

  var cmds = (typeof CMDS !== 'undefined') ? CMDS : [];

  if (debut) cmds = cmds.filter(function(c) {
    return (c.date || c.cree_le || '').substring(0, 10) >= debut;
  });
  if (fin) cmds = cmds.filter(function(c) {
    return (c.date || c.cree_le || '').substring(0, 10) <= fin;
  });
  if (statut) cmds = cmds.filter(function(c) {
    return (c.statut || '') === statut;
  });

  // Mettre à jour l'affichage
  var badge = document.getElementById('cmd-filtre-badge');
  if (badge) badge.textContent = cmds.length + ' résultat(s)';

  if (typeof renderCommandesList === 'function') renderCommandesList(cmds);
  else if (typeof renderCmds === 'function') renderCmds(cmds);
}

function reinitialiserFiltresCommandes() {
  ['cmd-date-debut','cmd-date-fin','cmd-statut-f'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  filtrerCommandesParDate();
}

// ══════════════════════════════════════════════════════
//  5. IMPORT CSV PRODUITS EN MASSE
// ══════════════════════════════════════════════════════
function importerCSVProduits(file) {
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var lines = e.target.result.split('\n').filter(function(l){ return l.trim(); });
    if (lines.length < 2) { toast('CSV vide ou invalide', 'error'); return; }

    // Détecter l'en-tête
    var headers = lines[0].split(';').map(function(h){ return h.trim().toLowerCase(); });
    var nomIdx   = headers.indexOf('nom');
    var prixIdx  = headers.indexOf('prix');
    var catIdx   = headers.indexOf('categorie') !== -1 ? headers.indexOf('categorie') : headers.indexOf('cat');
    var stockIdx = headers.indexOf('stock');
    var smIdx    = headers.indexOf('supermarche') !== -1 ? headers.indexOf('supermarche') : headers.indexOf('sm');

    if (nomIdx === -1 || prixIdx === -1) {
      toast('Le CSV doit avoir des colonnes "nom" et "prix"', 'error');
      return;
    }

    var produits_ajoutés = 0;
    for (var i = 1; i < lines.length; i++) {
      var cols = lines[i].split(';').map(function(c){ return c.trim().replace(/^"|"$/g,''); });
      var nom   = cols[nomIdx] || '';
      var prix  = parseInt(cols[prixIdx]) || 0;
      if (!nom || prix <= 0) continue;

      var produit = {
        id:    PRODS ? (PRODS.length + i) : i,
        nom:   nom,
        prix:  prix,
        cat:   catIdx !== -1 ? (cols[catIdx] || 'Alimentation') : 'Alimentation',
        stock: stockIdx !== -1 ? (parseInt(cols[stockIdx]) || 100) : 100,
        sm:    smIdx !== -1 ? cols[smIdx] : (STORES && STORES[0] ? STORES[0].nom : ''),
        img:   'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop',
        seuil: 10, actif: true
      };

      if (typeof PRODS !== 'undefined') PRODS.push(produit);
      produits_ajoutés++;
    }

    // Sauvegarder
    if (typeof saveProds === 'function') saveProds();
    else try { localStorage.setItem('sm_produits_extra', JSON.stringify(PRODS)); } catch(e) {}

    if (typeof renderProds === 'function') renderProds();
    toast(produits_ajoutés + ' produits importés avec succès !', 'success');
    closeM('m-import-csv');
  };
  reader.readAsText(file, 'UTF-8');
}

function telechargerModeleCSV() {
  var csv = 'nom;prix;categorie;stock;supermarche\nTomates fraîches;500;Alimentation;200;Mon Supermarché\nHuile de palme;1200;Alimentation;150;\nSavon Camay;350;Hygiène;300;';
  var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'modele-import-produits.csv';
  a.click();
}

// ══════════════════════════════════════════════════════
//  6. CALENDRIER VISUEL RDV — SEMAINE
// ══════════════════════════════════════════════════════
function renderCalendrierSemaine(rdvs, containerId) {
  var z = document.getElementById(containerId || 'calendrier-semaine');
  if (!z) return;

  var aujourd = new Date();
  var lundiSem = new Date(aujourd);
  lundiSem.setDate(aujourd.getDate() - aujourd.getDay() + 1);

  var jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  var heures = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
  var couleurs = { confirme:'#007A3D', termine:'#6b7280', annule:'#CE1126', en_attente:'#f59e0b' };

  // Construire grille
  var html = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px;min-width:600px">'
    + '<thead><tr>'
    + '<th style="width:50px;padding:6px;background:#f9fafb;border:1px solid var(--br)">Heure</th>'
    + jours.map(function(j, idx) {
        var date = new Date(lundiSem); date.setDate(lundiSem.getDate() + idx);
        var isToday = date.toDateString() === aujourd.toDateString();
        return '<th style="padding:6px;background:' + (isToday?'#007A3D':'#f9fafb') + ';color:' + (isToday?'#fff':'inherit') + ';border:1px solid var(--br);min-width:70px">'
          + j + '<br><span style="font-size:10px;font-weight:400">' + date.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}) + '</span></th>';
      }).join('')
    + '</tr></thead><tbody>';

  heures.forEach(function(h) {
    html += '<tr><td style="padding:4px 6px;background:#f9fafb;border:1px solid var(--br);font-weight:600;color:#555">' + h + '</td>';
    for (var d = 0; d < 7; d++) {
      var date = new Date(lundiSem); date.setDate(lundiSem.getDate() + d);
      var dateStr = date.toISOString().slice(0, 10);
      var rdvDuSlot = (rdvs || []).filter(function(r) {
        return r.date === dateStr && (r.heure || '').startsWith(h.slice(0,2));
      });

      html += '<td style="padding:2px;border:1px solid var(--br);vertical-align:top;min-height:36px">';
      rdvDuSlot.forEach(function(r) {
        var c = couleurs[r.statut||'confirme'] || '#007A3D';
        html += '<div style="background:' + c + '22;border-left:2px solid ' + c + ';border-radius:3px;padding:2px 4px;margin-bottom:2px;cursor:pointer;font-size:10px" title="' + (r.client||r.patient||'') + '">'
          + '<div style="font-weight:600;color:' + c + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (r.client||r.patient||'RDV') + '</div>'
          + (r.service||r.medecin_nom||r.specialite ? '<div style="color:#555">' + (r.service||r.medecin_nom||'').substring(0,15) + '</div>' : '')
          + '</div>';
      });
      if (rdvDuSlot.length === 0) html += '<div style="height:28px"></div>';
      html += '</td>';
    }
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  html += '<div style="display:flex;gap:8px;margin-top:8px;font-size:11px">'
    + Object.entries(couleurs).map(function(e) {
        return '<span style="display:flex;align-items:center;gap:4px">'
          + '<span style="width:10px;height:10px;border-radius:2px;background:' + e[1] + ';display:inline-block"></span>' + e[0] + '</span>';
      }).join('')
    + '</div>';
  z.innerHTML = html;
}

// ══════════════════════════════════════════════════════
//  7. CALCUL AUTOMATIQUE PRIX M² — MENUISERIE
// ══════════════════════════════════════════════════════
function calculerPrixMenuiserie() {
  var longueur = parseFloat((document.getElementById('men-longueur')||{}).value) || 0;
  var largeur  = parseFloat((document.getElementById('men-largeur') ||{}).value) || 0;
  var epaisseur= parseFloat((document.getElementById('men-epaisseur')||{}).value) || 0.02;
  var essence  = (document.getElementById('men-essence')||{}).value || 'Fraké';
  var finition = (document.getElementById('men-finition')||{}).value || 'brut';

  // Prix au m³ selon essence (FCFA)
  var prixM3 = {
    'Fraké': 250000, 'Sapelli': 350000, 'Iroko': 300000,
    'Ayous': 180000, 'Wengé': 500000, 'Movingui': 280000,
    'Acajou': 420000, 'Pin': 120000
  };
  var coeffFinition = { 'brut': 1, 'poncé': 1.15, 'verni': 1.35, 'laqué': 1.5 };

  var volume = longueur * largeur * epaisseur;
  var surface = longueur * largeur;
  var prixBois = volume * (prixM3[essence] || 250000);
  var mainOeuvre = surface * 15000; // 15 000 FCFA/m²
  var total = prixBois * (coeffFinition[finition] || 1) + mainOeuvre;

  var z = document.getElementById('men-calcul-result');
  if (!z) return;

  z.innerHTML = surface > 0
    ? '<div style="background:#f0faf5;border-radius:10px;padding:14px;margin-top:8px">'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">'
      + '<div>Surface : <strong>' + surface.toFixed(2) + ' m²</strong></div>'
      + '<div>Volume : <strong>' + volume.toFixed(3) + ' m³</strong></div>'
      + '<div>Coût bois : <strong>' + prixBois.toLocaleString('fr-FR') + ' F</strong></div>'
      + '<div>Main d\'œuvre : <strong>' + mainOeuvre.toLocaleString('fr-FR') + ' F</strong></div>'
      + '</div>'
      + '<div style="font-size:18px;font-weight:800;color:#007A3D;margin-top:10px;text-align:center">'
      + 'Total estimé : ' + total.toLocaleString('fr-FR') + ' FCFA'
      + '</div>'
      + '<div style="font-size:10px;color:#999;text-align:center;margin-top:4px">Estimation indicative — devis précis sur demande</div>'
      + '</div>'
    : '<p style="color:#999;font-size:12px">Entrez les dimensions pour calculer</p>';
}

// ══════════════════════════════════════════════════════
//  8. MÉTÉO AGRICOLE — CAMEROUN (OpenWeatherMap)
// ══════════════════════════════════════════════════════
var VILLES_AGRI_CAMEROUN = {
  'Douala':     { lat: 4.05, lon: 9.70 },
  'Yaoundé':    { lat: 3.87, lon: 11.52 },
  'Bafoussam':  { lat: 5.47, lon: 10.42 },
  'Garoua':     { lat: 9.30, lon: 13.40 },
  'Maroua':     { lat: 10.60, lon: 14.32 },
  'Bertoua':    { lat: 4.58, lon: 13.68 },
  'Ebolowa':    { lat: 2.90, lon: 11.15 },
  'Kribi':      { lat: 2.94, lon: 9.91 }
};

async function chargerMeteoAgri(ville) {
  ville = ville || 'Douala';
  var z = document.getElementById('meteo-agri');
  if (!z) return;
  z.innerHTML = '<p style="text-align:center;color:#999;padding:10px">Chargement météo...</p>';

  // API gratuite sans clé (wttr.in)
  try {
    var resp = await fetch('https://wttr.in/' + encodeURIComponent(ville + ',Cameroon') + '?format=j1');
    var data = await resp.json();
    var cur = data.current_condition[0];
    var temp  = cur.temp_C;
    var hum   = cur.humidity;
    var desc  = cur.weatherDesc[0].value;
    var vent  = cur.windspeedKmph;
    var pluie = cur.precipMM;

    // Conseils agricoles selon météo
    var conseils = [];
    if (parseInt(temp) > 30) conseils.push('🌡️ Forte chaleur — arrosez tôt le matin');
    if (parseInt(hum) > 80)  conseils.push('💧 Humidité élevée — risque de champignons');
    if (parseFloat(pluie) > 10) conseils.push('🌧️ Pluies importantes — retardez les traitements');
    if (parseInt(vent) > 30) conseils.push('💨 Vent fort — évitez les traitements phyto');
    if (parseInt(temp) < 18) conseils.push('❄️ Températures fraîches — protégez les jeunes plants');

    z.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;margin-bottom:12px">'
      + _meteoStat('🌡️ Température', temp + '°C', parseInt(temp) > 32 ? '#CE1126' : '#007A3D')
      + _meteoStat('💧 Humidité', hum + '%', '#3b82f6')
      + _meteoStat('💨 Vent', vent + ' km/h', '#8b5cf6')
      + _meteoStat('🌧️ Précip.', pluie + ' mm', '#0891b2')
      + '</div>'
      + '<div style="background:#f0faf5;border-radius:10px;padding:10px;margin-bottom:8px">'
      + '<div style="font-size:13px;font-weight:600;margin-bottom:6px">📋 Conditions : ' + desc + '</div>'
      + (conseils.length > 0
          ? conseils.map(function(c){ return '<div style="font-size:12px;color:#555;padding:2px 0">' + c + '</div>'; }).join('')
          : '<div style="font-size:12px;color:#007A3D">✅ Conditions favorables à l\'agriculture</div>')
      + '</div>';

    // Prévisions 3 jours
    if (data.weather && data.weather.length > 0) {
      z.innerHTML += '<div style="font-size:12px;font-weight:700;margin-bottom:6px;color:#555">Prévisions 3 jours :</div>'
        + '<div style="display:flex;gap:8px">'
        + data.weather.slice(0, 3).map(function(w) {
            return '<div style="flex:1;background:#f9fafb;border-radius:8px;padding:8px;text-align:center;border:1px solid var(--br)">'
              + '<div style="font-size:10px;color:#666">' + new Date(w.date).toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit'}) + '</div>'
              + '<div style="font-size:14px;font-weight:700;color:#007A3D">' + w.maxtempC + '°/' + w.mintempC + '°</div>'
              + '<div style="font-size:10px;color:#3b82f6">' + w.hourly[4].precipMM + 'mm</div>'
              + '</div>';
          }).join('')
        + '</div>';
    }
  } catch(e) {
    z.innerHTML = '<p style="text-align:center;color:#CE1126;padding:10px">Météo indisponible — vérifiez votre connexion</p>';
  }
}

function _meteoStat(label, val, color) {
  return '<div style="background:#fff;border:1px solid var(--br);border-radius:8px;padding:8px;text-align:center">'
    + '<div style="font-size:11px;color:#666">' + label + '</div>'
    + '<div style="font-size:18px;font-weight:800;color:' + color + '">' + val + '</div>'
    + '</div>';
}

// ══════════════════════════════════════════════════════
//  9. CALCULATEUR CRÉDIT IMMOBILIER
// ══════════════════════════════════════════════════════
function calculerCreditImmo() {
  var montant = parseInt((document.getElementById('ci-montant')||{}).value) || 0;
  var apport  = parseInt((document.getElementById('ci-apport') ||{}).value) || 0;
  var taux    = parseFloat((document.getElementById('ci-taux')  ||{}).value) || 7;
  var duree   = parseInt((document.getElementById('ci-duree')  ||{}).value) || 20;

  var z = document.getElementById('ci-result'); if (!z) return;
  if (montant <= 0) { z.innerHTML = ''; return; }

  var capital = montant - apport;
  var tauxMens = taux / 100 / 12;
  var nbMens = duree * 12;
  var mensualite = capital * tauxMens * Math.pow(1 + tauxMens, nbMens) / (Math.pow(1 + tauxMens, nbMens) - 1);
  var totalRembourse = mensualite * nbMens;
  var totalInterets = totalRembourse - capital;

  // Tableau amortissement (3 premières lignes + dernière)
  var tableau = [];
  var restant = capital;
  for (var i = 1; i <= nbMens; i++) {
    var interets = restant * tauxMens;
    var principal = mensualite - interets;
    restant -= principal;
    if (i <= 3 || i === nbMens) tableau.push({ mois: i, mensualite: mensualite, interets: interets, principal: principal, restant: Math.max(0, restant) });
    if (i === 3 && nbMens > 4) tableau.push({ mois: '...', mensualite: null });
  }

  z.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:14px">'
    + '<div style="background:#f0faf5;border-radius:10px;padding:12px;text-align:center"><div style="font-size:11px;color:#666">Mensualité</div><div style="font-size:18px;font-weight:800;color:#007A3D">' + Math.round(mensualite).toLocaleString('fr-FR') + ' F</div></div>'
    + '<div style="background:#fff3cd;border-radius:10px;padding:12px;text-align:center"><div style="font-size:11px;color:#666">Total intérêts</div><div style="font-size:18px;font-weight:800;color:#f59e0b">' + Math.round(totalInterets).toLocaleString('fr-FR') + ' F</div></div>'
    + '<div style="background:#fef3f2;border-radius:10px;padding:12px;text-align:center"><div style="font-size:11px;color:#666">Coût total</div><div style="font-size:18px;font-weight:800;color:#CE1126">' + Math.round(totalRembourse).toLocaleString('fr-FR') + ' F</div></div>'
    + '</div>'
    + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px">'
    + '<thead><tr style="background:#007A3D;color:#fff"><th style="padding:6px">Mois</th><th style="padding:6px;text-align:right">Mensualité</th><th style="padding:6px;text-align:right">Intérêts</th><th style="padding:6px;text-align:right">Capital</th><th style="padding:6px;text-align:right">Restant</th></tr></thead><tbody>'
    + tableau.map(function(r, i) {
        if (r.mensualite === null) return '<tr><td colspan="5" style="text-align:center;padding:4px;color:#999">...</td></tr>';
        return '<tr style="background:' + (i%2===0?'#fff':'#f9fafb') + ';border-bottom:1px solid #f0f0f0">'
          + '<td style="padding:5px;text-align:center">' + r.mois + '</td>'
          + '<td style="padding:5px;text-align:right;font-weight:600">' + Math.round(r.mensualite).toLocaleString('fr-FR') + ' F</td>'
          + '<td style="padding:5px;text-align:right;color:#CE1126">' + Math.round(r.interets).toLocaleString('fr-FR') + ' F</td>'
          + '<td style="padding:5px;text-align:right;color:#007A3D">' + Math.round(r.principal).toLocaleString('fr-FR') + ' F</td>'
          + '<td style="padding:5px;text-align:right">' + Math.round(r.restant).toLocaleString('fr-FR') + ' F</td></tr>';
      }).join('')
    + '</tbody></table></div>';
}

// ══════════════════════════════════════════════════════
//  10. GALERIE PHOTOS RÉALISATIONS
// ══════════════════════════════════════════════════════
var GALERIES = { coiffure: [], menuiserie: [], btp: [] };

function initGaleries() {
  try {
    var s = JSON.parse(localStorage.getItem('sm_galeries') || 'null');
    if (s) GALERIES = Object.assign(GALERIES, s);
  } catch(e) {}
}

function sauvegarderGaleries() {
  try { localStorage.setItem('sm_galeries', JSON.stringify(GALERIES)); } catch(e) {}
}

function ajouterPhotoRealisation(secteur, urlPhoto, titre, desc) {
  if (!urlPhoto) { toast('URL de la photo requise', 'warning'); return; }
  if (!GALERIES[secteur]) GALERIES[secteur] = [];
  GALERIES[secteur].push({ id: Date.now(), url: urlPhoto, titre: titre || 'Réalisation', desc: desc || '', date: new Date().toLocaleDateString('fr-FR') });
  sauvegarderGaleries();
  renderGalerie(secteur);
  toast('Photo ajoutée à la galerie !', 'success');
}

function renderGalerie(secteur, containerId) {
  var id = containerId || ('galerie-' + secteur);
  var z = document.getElementById(id); if (!z) return;
  var photos = GALERIES[secteur] || [];

  if (photos.length === 0) {
    z.innerHTML = '<div style="text-align:center;padding:20px;color:#999"><div style="font-size:32px;margin-bottom:8px">📷</div><div>Aucune photo — ajoutez vos réalisations</div></div>';
    return;
  }

  z.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px">'
    + photos.map(function(p) {
        return '<div style="border-radius:10px;overflow:hidden;border:1px solid var(--br);cursor:pointer" onclick="ouvrirPhotoPleinEcran(\'' + p.url + '\',\'' + p.titre + '\')">'
          + '<img loading="lazy" src="' + p.url + '" style="width:100%;height:120px;object-fit:cover" onerror="this.src=\'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=160&h=120&fit=crop/160/120\'">'
          + '<div style="padding:6px 8px">'
          + '<div style="font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + p.titre + '</div>'
          + '<div style="font-size:10px;color:#999">' + p.date + '</div>'
          + '</div></div>';
      }).join('')
    + '</div>';
}

function ouvrirPhotoPleinEcran(url, titre) {
  var m = document.getElementById('m-photo-plein-ecran');
  if (!m) {
    m = document.createElement('div');
    m.id = 'm-photo-plein-ecran';
    m.className = 'mo';
    m.style.background = 'rgba(0,0,0,.85)';
    m.innerHTML = '<div style="text-align:center;padding:20px;max-width:90vw">'
      + '<button onclick="closeM(\'m-photo-plein-ecran\')" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,.2);border:none;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:18px">×</button>'
      + '<img loading="lazy" id="photo-pe-img" style="max-width:100%;max-height:80vh;border-radius:12px;object-fit:contain">'
      + '<div id="photo-pe-titre" style="color:#fff;font-size:16px;font-weight:700;margin-top:12px"></div>'
      + '</div>';
    document.body.appendChild(m);
  }
  document.getElementById('photo-pe-img').src = url;
  document.getElementById('photo-pe-titre').textContent = titre;
  openM('m-photo-plein-ecran');
}

// ══════════════════════════════════════════════════════
//  11. COMPARAISON CA MOIS PAR MOIS
// ══════════════════════════════════════════════════════
function renderComparaisonCA() {
  var z = document.getElementById('ca-comparaison'); if (!z) return;

  var now = new Date();
  var moisActuel = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  var moisPrec = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  var moisPrecedent = moisPrec.getFullYear() + '-' + String(moisPrec.getMonth() + 1).padStart(2, '0');

  function caParMois(key) {
    var total = 0;
    var sources = [
      typeof CMDS !== 'undefined' ? CMDS : [],
      typeof COMMANDES_RESTO !== 'undefined' ? COMMANDES_RESTO : [],
      typeof COMMANDES_AGRI !== 'undefined' ? COMMANDES_AGRI : [],
      typeof COMMANDES_LOGISTIQUE !== 'undefined' ? COMMANDES_LOGISTIQUE : [],
      typeof COMMANDES_MEUBLES !== 'undefined' ? COMMANDES_MEUBLES : [],
    ];
    sources.forEach(function(liste) {
      liste.forEach(function(c) {
        var d = (c.cree_le || c.date || '').substring(0, 7);
        if (d === key) total += (c.total || c.prix || 0);
      });
    });
    return total;
  }

  var caActuel = caParMois(moisActuel);
  var caPrecedent = caParMois(moisPrecedent);
  var variation = caPrecedent > 0 ? Math.round((caActuel - caPrecedent) / caPrecedent * 100) : 0;
  var hausse = caActuel >= caPrecedent;

  // 12 derniers mois
  var donnees12mois = [];
  for (var i = 11; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    donnees12mois.push({
      mois: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      ca: caParMois(key),
      isCurrent: i === 0
    });
  }
  var maxCA = Math.max.apply(null, donnees12mois.map(function(d){ return d.ca; })) || 1;

  z.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">'
    + '<div class="cd" style="text-align:center;border-top:4px solid #007A3D">'
    + '<div style="font-size:11px;color:#666">Ce mois</div>'
    + '<div style="font-size:18px;font-weight:800;color:#007A3D">' + caActuel.toLocaleString('fr-FR') + ' F</div>'
    + '</div>'
    + '<div class="cd" style="text-align:center;border-top:4px solid #6b7280">'
    + '<div style="font-size:11px;color:#666">Mois précédent</div>'
    + '<div style="font-size:18px;font-weight:800;color:#6b7280">' + caPrecedent.toLocaleString('fr-FR') + ' F</div>'
    + '</div>'
    + '<div class="cd" style="text-align:center;border-top:4px solid ' + (hausse?'#007A3D':'#CE1126') + '">'
    + '<div style="font-size:11px;color:#666">Variation</div>'
    + '<div style="font-size:18px;font-weight:800;color:' + (hausse?'#007A3D':'#CE1126') + '">' + (hausse?'+':'') + variation + '%</div>'
    + '<div style="font-size:10px">' + (hausse?'↑ En hausse':'↓ En baisse') + '</div>'
    + '</div>'
    + '</div>'
    // Graphique barres 12 mois
    + '<div class="cd"><div class="ch"><div class="ct">Évolution 12 mois</div></div>'
    + '<div style="display:flex;align-items:flex-end;gap:3px;height:120px;padding:12px 4px 0;margin-top:8px">'
    + donnees12mois.map(function(d) {
        var h = Math.max(4, Math.round((d.ca / maxCA) * 100));
        return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">'
          + '<div style="font-size:9px;color:#555">' + (d.ca > 0 ? Math.round(d.ca/1000) + 'K' : '') + '</div>'
          + '<div style="width:100%;height:' + h + 'px;background:' + (d.isCurrent?'#007A3D':'#d1fae5') + ';border-radius:3px 3px 0 0;min-height:4px"></div>'
          + '<div style="font-size:9px;color:' + (d.isCurrent?'#007A3D':'#999') + ';font-weight:' + (d.isCurrent?'700':'400') + '">' + d.mois + '</div>'
          + '</div>';
      }).join('')
    + '</div></div>';
}

// ══════════════════════════════════════════════════════
//  12. CONSULTATION / COURS EN LIGNE (Jitsi Meet)
// ══════════════════════════════════════════════════════
function lancerVisioConference(roomName, titre) {
  var modal = document.getElementById('m-visio');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'm-visio';
    modal.className = 'mo';
    modal.innerHTML = '<div class="mdl" style="max-width:700px;width:95vw">'
      + '<div class="mh"><h3 id="visio-titre">Vidéo consultation</h3>'
      + '<button class="cbtn" onclick="stopperVisio()">X</button></div>'
      + '<div id="visio-container" style="width:100%;height:400px;border-radius:12px;overflow:hidden;background:#111"></div>'
      + '<div style="text-align:center;margin-top:8px;font-size:11px;color:#999">Powered by Jitsi Meet — Sécurisé et gratuit</div>'
      + '</div>';
    document.body.appendChild(modal);
  }

  document.getElementById('visio-titre').textContent = titre || 'Vidéo consultation';
  openM('m-visio');

  // Charger Jitsi
  if (typeof JitsiMeetExternalAPI === 'undefined') {
    var script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.onload = function() { _initJitsi(roomName); };
    document.head.appendChild(script);
  } else {
    _initJitsi(roomName);
  }
}

var _jitsiApi = null;
function _initJitsi(roomName) {
  var container = document.getElementById('visio-container');
  if (!container) return;
  if (_jitsiApi) { _jitsiApi.dispose(); _jitsiApi = null; }

  var boutique = (typeof SM_CONFIG !== 'undefined') ? SM_CONFIG.boutique : {};
  _jitsiApi = new JitsiMeetExternalAPI('meet.jit.si', {
    roomName: 'SuperMarcheCM-' + (roomName || 'consultation-' + Date.now()),
    width: '100%', height: 400,
    parentNode: container,
    configOverwrite: { startWithAudioMuted: false, startWithVideoMuted: false },
    interfaceConfigOverwrite: { TOOLBAR_ALWAYS_VISIBLE: true },
    userInfo: { displayName: boutique.nom || 'SuperMarché CM' }
  });
}

function stopperVisio() {
  if (_jitsiApi) { _jitsiApi.dispose(); _jitsiApi = null; }
  closeM('m-visio');
}

function lancerConsultationMedicale(docteur) {
  var room = 'medecin-' + (docteur ? docteur.replace(/\s/g, '') : 'consultation') + '-' + Date.now();
  lancerVisioConference(room, 'Consultation — ' + (docteur || 'Médecin'));
}

function lancerCourEnLigne(cours) {
  var room = 'cours-' + (cours ? cours.replace(/\s/g, '') : 'session') + '-' + Date.now();
  lancerVisioConference(room, 'Cours en ligne — ' + (cours || 'Formation'));
}
