// ═══════════════════════════════════════════════════════
//  SuperMarché CM — immobilier.js  (version enrichie)
//  Immobilier & Hébergement — Cameroun complet
//  Nouvelles fonctionnalités :
//  - 25 biens (villes Cameroun étendues)
//  - Recherche budget min/max
//  - Filtre chambres
//  - Statuts Disponible/Loué/Vendu
//  - Favoris localStorage
//  - Carte interactive Leaflet
//  - Formulaire contact sur chaque bien
//  - Gestion agents + commissions
//  - Visite virtuelle (vidéo)
//  - Superficie sur chaque carte
//  - Calculateur crédit amélioré
// ═══════════════════════════════════════════════════════

// ─── Sync Supabase ───────────────────────────────────
function _sbImmo() {
  if (typeof window.supabase === 'undefined') return null;
  try { return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key); } catch(e) { return null; }
}
async function syncImmoSupabase(dem) {
  try {
    var sb = _sbImmo(); if (!sb) return;
    await sb.from('sm_demandes_immo').upsert({
      id: dem.id, client: dem.client, tel: dem.tel,
      type_bien: dem.type||'', ville: dem.ville||'',
      budget: dem.budget||0, description: dem.description||'', statut: dem.statut||'nouveau'
    }, { onConflict: 'id' });
  } catch(e) { console.warn('[Immo] sync:', e); }
}
async function chargerImmoSupabase() {
  try {
    var sb = _sbImmo(); if (!sb) return;
    var res = await sb.from('sm_demandes_immo').select('*').order('created_at', { ascending: false });
    if (res.data && res.data.length > 0) {
      var local = JSON.parse(localStorage.getItem('sm_immo') || '{"demandes":[]}');
      if (!local.demandes) local.demandes = [];
      res.data.forEach(function(r) {
        if (!local.demandes.find(function(x){ return x.id === r.id; })) local.demandes.unshift(r);
      });
      localStorage.setItem('sm_immo', JSON.stringify(local));
    }
  } catch(e) { console.warn('[Immo] charger:', e); }
}

// ═══════════════════════════════════════════════════════
//  CATALOGUE — 25 biens couvrant tout le Cameroun
// ═══════════════════════════════════════════════════════
var BIENS_IMMOBILIER = [];

// ─── Agents immobiliers ──────────────────────────────
var AGENTS_IMMO = [];

var DEMANDES_IMMO = [];
var FAVORIS_IMMO  = [];
var immo_seq = 1;

function initImmobilier() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_immo') || '{}');
    if (saved.demandes) DEMANDES_IMMO = saved.demandes;
    if (saved.seq)      immo_seq = saved.seq;
  } catch(e) { DEMANDES_IMMO = []; }
  // Charger favoris
  try { FAVORIS_IMMO = JSON.parse(localStorage.getItem('sm_immo_favoris') || '[]'); } catch(e) {}
}

function saveImmobilier() {
  try { localStorage.setItem('sm_immo', JSON.stringify({ demandes: DEMANDES_IMMO, seq: immo_seq })); } catch(e) {}
}

function saveFavoris() {
  try { localStorage.setItem('sm_immo_favoris', JSON.stringify(FAVORIS_IMMO)); } catch(e) {}
}

// ═══════════════════════════════════════════════════════
//  RENDU CATALOGUE — avec tous les filtres
// ═══════════════════════════════════════════════════════
function renderCatalogueImmo() {
  var grid = document.getElementById('immo-catalogue');
  if (!grid) return;

  var typeFiltre    = (document.getElementById('immo-type-filtre')    || {}).value || '';
  var villeFiltre   = (document.getElementById('immo-ville-filtre')   || {}).value || '';
  var chambresFiltre= (document.getElementById('immo-chambres-filtre')|| {}).value || '';
  var statutFiltre  = (document.getElementById('immo-statut-filtre')  || {}).value || '';
  var budgetMin     = parseInt((document.getElementById('immo-budget-min') || {}).value) || 0;
  var budgetMax     = parseInt((document.getElementById('immo-budget-max') || {}).value) || 0;
  var searchText    = ((document.getElementById('immo-search') || {}).value || '').toLowerCase();
  var favorisSeulement = document.getElementById('immo-favoris-only') && document.getElementById('immo-favoris-only').checked;

  var _br = (typeof mktGetRealData==='function') ? (mktGetRealData('immobilier','biens')||[]) : [];
  if (_br.length > 0) {
    BIENS_IMMOBILIER = _br.map(function(b,i) {
      return { id:'im'+i, type:b['f-type']||b.type||'Location',
               cat:b['f-cat']||b.cat||'Appartement', titre:b['f-nom']||b.nom||'Bien',
               ville:b['f-ville']||b.ville||'Douala', quartier:b['f-quartier']||b.quartier||'',
               surface:parseInt(b['f-surface']||b.surface||0),
               chambres:parseInt(b['f-chambres']||b.chambres||0),
               prix:parseInt(b['f-prix']||b.prix||0),
               desc:b['f-desc']||b.desc||'', img:b['f-img']||b.img||'',
               statut:'Disponible', contact:b['f-tel']||b.tel||'' };
    });
  }
  var biens = BIENS_IMMOBILIER.filter(function(b) {
    if (typeFiltre    && b.type  !== typeFiltre)    return false;
    if (villeFiltre   && b.ville !== villeFiltre)   return false;
    if (chambresFiltre && b.chambres !== parseInt(chambresFiltre) && !(chambresFiltre === '5+' && b.chambres >= 5)) return false;
    if (statutFiltre  && b.statut !== statutFiltre) return false;
    if (budgetMin > 0 && b.prix < budgetMin)        return false;
    if (budgetMax > 0 && b.prix > budgetMax)        return false;
    if (favorisSeulement && FAVORIS_IMMO.indexOf(b.id) === -1) return false;
    if (searchText && !(
      b.titre.toLowerCase().includes(searchText) ||
      b.ville.toLowerCase().includes(searchText) ||
      b.quartier.toLowerCase().includes(searchText) ||
      b.cat.toLowerCase().includes(searchText) ||
      b.desc.toLowerCase().includes(searchText)
    )) return false;
    return true;
  });

  // Mettre à jour le compteur
  var badge = document.getElementById('immo-count-badge');
  if (badge) badge.textContent = biens.length + ' bien(s)';

  if (biens.length === 0) {
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:#999"><div style="font-size:48px">🏠</div><div style="font-size:15px;font-weight:600;margin-top:12px">Aucun bien trouvé</div><div style="font-size:12px;margin-top:4px">Modifiez vos critères de recherche</div></div>';
    return;
  }

  var statutColors = { disponible:'#007A3D', loue:'#f59e0b', vendu:'#CE1126' };
  var statutLabels = { disponible:'Disponible', loue:'Loué', vendu:'Vendu' };
  var typeColors   = { Location:'#dbeafe', Vente:'#dcfce7', Hotel:'#fef3c7' };

  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:18px">'
    + biens.map(function(b) {
        var agent = AGENTS_IMMO.find(function(a){ return a.id === b.agent_id; });
        var isFav = FAVORIS_IMMO.indexOf(b.id) !== -1;
        var stCol = statutColors[b.statut] || '#007A3D';
        var stLbl = statutLabels[b.statut] || b.statut;
        var typeCol = typeColors[b.type] || '#f0faf5';
        var prixAff = b.periode
          ? b.prix.toLocaleString('fr-FR') + ' FCFA/' + b.periode
          : b.prix.toLocaleString('fr-FR') + ' FCFA';

        return '<div class="cd" style="padding:0;overflow:hidden;transition:box-shadow .2s" onmouseover="this.style.boxShadow=\'0 4px 20px rgba(0,0,0,.12)\'" onmouseout="this.style.boxShadow=\'\'">'
          // Image
          + '<div style="position:relative">'
          + '<img loading="lazy" src="' + b.img + '" style="width:100%;height:170px;object-fit:cover" onerror="this.src=\'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop?random\'">'
          // Badges
          + '<div style="position:absolute;top:10px;left:10px;display:flex;gap:6px">'
          + '<span style="background:' + typeCol + ';padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">' + b.type + ' · ' + b.cat + '</span>'
          + '<span style="background:' + stCol + ';color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">' + stLbl + '</span>'
          + '</div>'
          // Bouton favori
          + '<button onclick="toggleFavori(\'' + b.id + '\',this)" title="' + (isFav?'Retirer des':'Ajouter aux') + ' favoris" '
          + 'style="position:absolute;top:10px;right:10px;background:rgba(255,255,255,.9);border:none;border-radius:50%;width:34px;height:34px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">'
          + (isFav ? '❤️' : '🤍') + '</button>'
          // Bouton vidéo
          + (b.video ? '<a href="' + b.video + '" target="_blank" style="position:absolute;bottom:10px;left:10px;background:rgba(0,0,0,.65);color:#fff;padding:4px 10px;border-radius:20px;font-size:11px;text-decoration:none">📹 Visite virtuelle</a>' : '')
          + '</div>'

          // Contenu
          + '<div style="padding:14px">'
          + '<div style="font-weight:800;font-size:15px;margin-bottom:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + b.titre + '</div>'
          + '<div style="font-size:12px;color:#555;margin-bottom:4px">📍 ' + b.quartier + ', <strong>' + b.ville + '</strong></div>'
          // Caractéristiques
          + '<div style="display:flex;gap:10px;font-size:11px;color:#666;margin-bottom:8px;flex-wrap:wrap">'
          + (b.superficie > 0 ? '<span>📐 ' + b.superficie + ' m²</span>' : '')
          + (b.chambres > 0 ? '<span>🛏️ ' + b.chambres + ' ch.</span>' : '')
          + (b.chambres === 0 && b.cat === 'Hôtel' ? '<span>🏨 ' + b.cat + '</span>' : '')
          + '</div>'
          + '<div style="font-size:12px;color:#777;font-style:italic;margin-bottom:10px;min-height:32px">' + b.desc + '</div>'
          // Prix
          + '<div style="font-size:19px;font-weight:800;color:#007A3D;margin-bottom:10px">' + prixAff + '</div>'
          // Agent
          + (agent ? '<div style="display:flex;align-items:center;gap:8px;background:#f9fafb;border-radius:8px;padding:7px;margin-bottom:10px">'
            + '<img loading="lazy" src="' + agent.photo + '" style="width:32px;height:32px;border-radius:50%;object-fit:cover">'
            + '<div style="font-size:11px"><div style="font-weight:700">' + agent.nom + '</div>'
            + '<div style="color:#007A3D">' + agent.commission + '% commission</div></div>'
            + '</div>' : '')
          // Actions
          + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
          + (b.statut !== 'vendu' ? '<a href="tel:' + b.tel + '" style="flex:1;background:#007A3D;color:#fff;padding:8px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;text-align:center">📞 Appeler</a>' : '')
          + (b.statut !== 'vendu' ? '<a href="https://wa.me/' + b.tel.replace(/[\s+\-]/g,'') + '?text=' + encodeURIComponent('Bonjour, je suis intéressé par : ' + b.titre + ' — ' + prixAff) + '" target="_blank" style="flex:1;background:#25D366;color:#fff;padding:8px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;text-align:center">WhatsApp</a>' : '')
          + '<button onclick="ouvrirContactBien(\'' + b.id + '\')" style="flex:1;background:#f3f4f6;border:1.5px solid #d1d5db;padding:8px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer">✉️ Contact</button>'
          + '</div>'
          + '</div></div>';
      }).join('') + '</div>';
}

// ═══════════════════════════════════════════════════════
//  FAVORIS
// ═══════════════════════════════════════════════════════
function toggleFavori(id, btn) {
  var idx = FAVORIS_IMMO.indexOf(id);
  if (idx === -1) {
    FAVORIS_IMMO.push(id);
    if (btn) btn.innerHTML = '❤️';
    toast('Bien ajouté aux favoris !', 'success');
  } else {
    FAVORIS_IMMO.splice(idx, 1);
    if (btn) btn.innerHTML = '🤍';
    toast('Retiré des favoris', 'success');
  }
  saveFavoris();
  // Rafraîchir si filtre favoris actif
  if (document.getElementById('immo-favoris-only') && document.getElementById('immo-favoris-only').checked) {
    renderCatalogueImmo();
  }
}

// ═══════════════════════════════════════════════════════
//  FORMULAIRE CONTACT SUR UN BIEN
// ═══════════════════════════════════════════════════════
function ouvrirContactBien(bienId) {
  var bien = BIENS_IMMOBILIER.find(function(b){ return b.id === bienId; });
  if (!bien) return;

  var modal = document.getElementById('m-contact-bien');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'm-contact-bien';
    modal.className = 'mo';
    modal.innerHTML = '<div class="mdl" style="max-width:440px">'
      + '<div class="mh"><h3 id="contact-bien-titre">Contact — Bien immobilier</h3>'
      + '<button class="cbtn" onclick="closeM(\'m-contact-bien\')">X</button></div>'
      + '<div class="fg2" style="padding:4px 0 12px">'
      + '<div class="fg ff"><label>Votre nom *</label><input type="text" id="cb-nom" placeholder="Votre nom complet" style="width:100%;padding:10px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box"></div>'
      + '<div class="fg"><label>Téléphone *</label><input type="tel" id="cb-tel" placeholder="+237 6XX XX XX XX" style="width:100%;padding:10px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box"></div>'
      + '<div class="fg"><label>Email</label><input type="email" id="cb-email" placeholder="votre@email.com" style="width:100%;padding:10px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box"></div>'
      + '<div class="fg ff"><label>Votre message</label><textarea id="cb-message" rows="3" placeholder="Je suis intéressé par ce bien..." style="width:100%;padding:10px;border:1.5px solid var(--br);border-radius:8px;font-size:13px;box-sizing:border-box;resize:vertical"></textarea></div>'
      + '<div class="fg ff"><label>Disponibilité pour visite</label>'
      + '<select id="cb-visite" style="width:100%;padding:10px;border:1.5px solid var(--br);border-radius:8px;font-size:13px">'
      + '<option value="">Choisir...</option>'
      + '<option>Semaine - Matin</option><option>Semaine - Après-midi</option>'
      + '<option>Weekend - Matin</option><option>Weekend - Après-midi</option>'
      + '<option>Selon disponibilité agent</option>'
      + '</select></div>'
      + '</div>'
      + '<div class="btng">'
      + '<button class="btn bp" id="cb-submit" onclick="envoyerContactBien()">Envoyer ma demande</button>'
      + '<button class="btn bo" onclick="closeM(\'m-contact-bien\')">Annuler</button>'
      + '</div></div>';
    document.body.appendChild(modal);
  }

  modal._bienId = bienId;
  document.getElementById('contact-bien-titre').textContent = 'Contact — ' + bien.titre;
  // Pré-remplir si user connecté
  if (typeof currentUser !== 'undefined' && currentUser) {
    var nom = document.getElementById('cb-nom');
    if (nom && !nom.value) nom.value = (currentUser.prenom || '') + ' ' + (currentUser.nom || '');
    var tel = document.getElementById('cb-tel');
    if (tel && !tel.value) tel.value = currentUser.tel || '';
  }
  openM('m-contact-bien');
}

function envoyerContactBien() {
  var modal  = document.getElementById('m-contact-bien');
  var bienId = modal ? modal._bienId : '';
  var bien   = BIENS_IMMOBILIER.find(function(b){ return b.id === bienId; });
  var nom    = (document.getElementById('cb-nom')    || {}).value || '';
  var tel    = (document.getElementById('cb-tel')    || {}).value || '';
  var email  = (document.getElementById('cb-email')  || {}).value || '';
  var msg    = (document.getElementById('cb-message')|| {}).value || '';
  var visite = (document.getElementById('cb-visite') || {}).value || '';

  if (!nom || !tel) { toast('Nom et téléphone requis', 'warning'); return; }

  // Enregistrer comme demande
  var dem = {
    id: 'IMMO-' + String(immo_seq++).padStart(3,'0'),
    client: nom, tel: tel, email: email, type: bien ? bien.type : '',
    ville: bien ? bien.ville : '', budget: bien ? bien.prix : 0,
    description: (bien ? 'Intéressé par : ' + bien.titre : '') + (msg ? '\n' + msg : '') + (visite ? '\nDisponible : ' + visite : ''),
    bien_id: bienId, statut: 'nouveau', cree_le: new Date().toISOString()
  };
  DEMANDES_IMMO.unshift(dem);
  saveImmobilier();
  closeM('m-contact-bien');
  renderDemandesImmo();

  // WhatsApp vers l'agent
  if (bien) {
    var texteWA = 'Bonjour, je m\'appelle ' + nom + ' (' + tel + ').'
      + '\nJe suis intéressé par : ' + bien.titre + ' (' + bien.ville + ')'
      + (msg ? '\nMessage : ' + msg : '')
      + (visite ? '\nDisponible pour visite : ' + visite : '')
      + '\nréf : ' + dem.id;
    window.open('https://wa.me/' + bien.tel.replace(/[\s+\-]/g,'') + '?text=' + encodeURIComponent(texteWA), '_blank');
  }

  if (typeof addNotif === 'function') addNotif('Nouveau contact immo : ' + nom + ' — ' + (bien ? bien.titre : ''), 'green');
  toast('Demande envoyée ! L\'agent vous contacte sous 24h.', 'success');
  syncImmoSupabase(dem);

  // Vider le formulaire
  ['cb-nom','cb-tel','cb-email','cb-message','cb-visite'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

// ═══════════════════════════════════════════════════════
//  DEMANDE GÉNÉRIQUE (formulaire "Ma recherche")
// ═══════════════════════════════════════════════════════
function soumettreDemandeImmo() {
  var client  = (document.getElementById('immo-client')  || {}).value || '';
  var tel     = (document.getElementById('immo-tel')     || {}).value || '';
  var type    = (document.getElementById('immo-type')    || {}).value || '';
  var ville   = (document.getElementById('immo-ville')   || {}).value || '';
  var budget  = parseInt((document.getElementById('immo-budget') || {}).value) || 0;
  var desc    = (document.getElementById('immo-desc')    || {}).value || '';

  if (!client) { toast('Nom requis', 'warning'); return; }
  if (!tel)    { toast('Téléphone requis', 'warning'); return; }
  if (!type)   { toast('Type de bien requis', 'warning'); return; }

  var dem = {
    id: 'IMMO-' + String(immo_seq++).padStart(3,'0'),
    client: client, tel: tel, type: type, ville: ville,
    budget: budget, description: desc, statut: 'nouveau',
    cree_le: new Date().toISOString()
  };
  DEMANDES_IMMO.unshift(dem);
  saveImmobilier();
  closeM('m-demande-immo');
  renderDemandesImmo();
  toast('Demande ' + dem.id + ' enregistrée !', 'success');
  if (typeof addNotif === 'function') addNotif('Nouvelle demande immo : ' + client + ' — ' + type, 'green');

  var msg = 'Bonjour ' + client + ', votre recherche immobilière ' + dem.id + ' a été enregistrée. Nos agents vous contactent sous 24h. SuperMarché CM Immo';
  fetch((typeof BACKEND!=='undefined'?BACKEND:'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ tel: tel.replace(/[\s+]/g,''), message: msg })
  }).catch(function(){});

  ['immo-client','immo-tel','immo-desc','immo-budget'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

// ═══════════════════════════════════════════════════════
//  CARTE INTERACTIVE DES BIENS (Leaflet)
// ═══════════════════════════════════════════════════════
var _immoMap = null;

var COORDS_VILLES_IMMO = {
  'Douala':      [4.05,   9.70],
  'Yaoundé':     [3.87,  11.52],
  'Bafoussam':   [5.47,  10.42],
  'Garoua':      [9.30,  13.40],
  'Ngaoundéré':  [7.32,  13.58],
  'Kribi':       [2.94,   9.91],
  'Buea':        [4.15,   9.23],
  'Limbé':       [4.02,   9.21],
  'Bertoua':     [4.58,  13.68],
};

function toggleCarteImmo() {
  var container = document.getElementById('immo-carte-container');
  if (!container) return;
  var visible = container.style.display !== 'none' && container.style.display !== '';
  if (visible) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'block';
  initCarteImmo();
}

function initCarteImmo() {
  if (typeof L === 'undefined') {
    // Charger Leaflet si pas encore chargé
    if (!document.getElementById('leaflet-css')) {
      var css = document.createElement('link');
      css.id = 'leaflet-css'; css.rel = 'stylesheet';
      css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(css);
    }
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = function() { _initCarteImmoMap(); };
    document.head.appendChild(script);
  } else {
    _initCarteImmoMap();
  }
}

function _initCarteImmoMap() {
  var mapDiv = document.getElementById('immo-carte');
  if (!mapDiv) return;
  if (_immoMap) { _immoMap.remove(); _immoMap = null; }
  mapDiv.style.height = '360px';

  _immoMap = L.map('immo-carte').setView([4.05, 9.70], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(_immoMap);

  var typeColors = { Location:'#3b82f6', Vente:'#007A3D', Hotel:'#f59e0b' };

  BIENS_IMMOBILIER.forEach(function(b) {
    var coords = COORDS_VILLES_IMMO[b.ville];
    if (!coords) return;
    // Décaler légèrement pour éviter superposition
    var lat = coords[0] + (Math.random()-0.5)*0.08;
    var lng = coords[1] + (Math.random()-0.5)*0.08;
    var couleur = typeColors[b.type] || '#007A3D';

    var icon = L.divIcon({
      html: '<div style="background:' + couleur + ';color:#fff;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3)">'
        + (b.prix/1000 >= 1000 ? Math.round(b.prix/1000000) + 'M' : Math.round(b.prix/1000) + 'K') + ' F'
        + '</div>',
      className: '', iconAnchor: [25, 10]
    });

    var prixAff = b.periode ? b.prix.toLocaleString('fr-FR') + ' FCFA/' + b.periode : b.prix.toLocaleString('fr-FR') + ' FCFA';
    L.marker([lat, lng], { icon: icon }).addTo(_immoMap).bindPopup(
      '<div style="min-width:180px">'
      + '<img loading="lazy" src="' + b.img + '" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:8px">'
      + '<div style="font-weight:700;font-size:13px">' + b.titre + '</div>'
      + '<div style="font-size:11px;color:#555;margin:3px 0">📍 ' + b.quartier + ', ' + b.ville + '</div>'
      + (b.superficie > 0 ? '<div style="font-size:11px">📐 ' + b.superficie + ' m²' + (b.chambres > 0 ? ' · 🛏️ ' + b.chambres + ' ch.' : '') + '</div>' : '')
      + '<div style="font-weight:800;color:#007A3D;margin-top:5px">' + prixAff + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:8px">'
      + '<a href="https://wa.me/' + b.tel.replace(/[\s+\-]/g,'') + '" target="_blank" style="flex:1;background:#25D366;color:#fff;padding:5px;border-radius:8px;text-decoration:none;font-size:11px;text-align:center;font-weight:700">WhatsApp</a>'
      + '<button onclick="ouvrirContactBien(\'' + b.id + '\')" style="flex:1;background:#007A3D;color:#fff;border:none;padding:5px;border-radius:8px;font-size:11px;cursor:pointer;font-weight:700">Contact</button>'
      + '</div></div>'
    );
  });

  // Légende
  var legende = L.control({ position: 'bottomright' });
  legende.onAdd = function() {
    var div = L.DomUtil.create('div', '');
    div.style.cssText = 'background:#fff;padding:8px;border-radius:8px;font-size:11px;box-shadow:0 2px 8px rgba(0,0,0,.15)';
    div.innerHTML = [
      ['#3b82f6','Location'],['#007A3D','Vente'],['#f59e0b','Hôtel']
    ].map(function(e){
      return '<div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">'
        + '<div style="width:12px;height:12px;border-radius:2px;background:' + e[0] + '"></div>'
        + '<span>' + e[1] + '</span></div>';
    }).join('');
    return div;
  };
  legende.addTo(_immoMap);
}

// ═══════════════════════════════════════════════════════
//  GESTION AGENTS — RENDER
// ═══════════════════════════════════════════════════════
function renderAgentsImmo() {
  var z = document.getElementById('agents-immo-liste');
  if (!z) return;

  z.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">'
    + AGENTS_IMMO.map(function(a) {
        var biens_agent = BIENS_IMMOBILIER.filter(function(b){ return b.agent_id === a.id; });
        var ca_agent = biens_agent.filter(function(b){ return b.statut === 'vendu'; })
          .reduce(function(s,b){ return s + b.prix * a.commission / 100; }, 0);

        return '<div class="cd" style="text-align:center;padding:16px">'
          + '<img loading="lazy" src="' + a.photo + '" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:3px solid #007A3D;margin:0 auto 10px">'
          + '<div style="font-weight:800;font-size:14px">' + a.nom + '</div>'
          + '<div style="font-size:11px;color:#007A3D;margin:3px 0">' + a.specialite + '</div>'
          + '<div style="font-size:11px;color:#555">📍 ' + a.ville + '</div>'
          + '<div style="display:flex;justify-content:center;gap:12px;margin:10px 0;font-size:11px">'
          + '<div><div style="font-weight:700;color:#007A3D">' + biens_agent.length + '</div><div style="color:#999">Biens</div></div>'
          + '<div><div style="font-weight:700;color:#007A3D">' + a.commission + '%</div><div style="color:#999">Commission</div></div>'
          + '<div><div style="font-weight:700;color:#007A3D">' + (ca_agent > 0 ? Math.round(ca_agent/1000) + 'K' : '0') + '</div><div style="color:#999">CA (F)</div></div>'
          + '</div>'
          + '<div style="display:flex;gap:6px">'
          + '<a href="tel:' + a.tel + '" style="flex:1;background:#007A3D;color:#fff;padding:7px;border-radius:8px;text-decoration:none;font-size:11px;font-weight:700;text-align:center">Appeler</a>'
          + '<a href="https://wa.me/' + a.tel.replace(/[\s+\-]/g,'') + '" target="_blank" style="flex:1;background:#25D366;color:#fff;padding:7px;border-radius:8px;text-decoration:none;font-size:11px;font-weight:700;text-align:center">WA</a>'
          + '</div>'
          + '</div>';
      }).join('')
    + '</div>';
}

// ═══════════════════════════════════════════════════════
//  AJOUT AGENT (formulaire)
// ═══════════════════════════════════════════════════════
function ajouterAgentImmo() {
  var nom    = (document.getElementById('ai-nom')         || {}).value || '';
  var tel    = (document.getElementById('ai-tel')         || {}).value || '';
  var email  = (document.getElementById('ai-email')       || {}).value || '';
  var ville  = (document.getElementById('ai-ville-agent') || {}).value || '';
  var spec   = (document.getElementById('ai-specialite')  || {}).value || '';
  var comm   = parseInt((document.getElementById('ai-commission') || {}).value) || 5;

  if (!nom || !tel) { toast('Nom et téléphone requis', 'warning'); return; }

  var newAgent = {
    id: 'ag' + Date.now(), nom: nom, tel: tel, email: email,
    ville: ville, specialite: spec, commission: comm, ventes: 0,
    photo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=120&h=120&fit=crop'
  };
  AGENTS_IMMO.push(newAgent);
  closeM('m-agent-immo');
  renderAgentsImmo();
  toast('Agent ' + nom + ' ajouté !', 'success');
  ['ai-nom','ai-tel','ai-email','ai-specialite'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

// ═══════════════════════════════════════════════════════
//  DEMANDES — RENDER
// ═══════════════════════════════════════════════════════
function renderDemandesImmo() {
  var liste = document.getElementById('immo-demandes');
  if (!liste) return;
  if (DEMANDES_IMMO.length === 0) {
    liste.innerHTML = '<p style="text-align:center;color:#999;padding:20px;font-size:13px">Aucune demande reçue</p>';
    return;
  }
  var stColors = { nouveau:'#f59e0b', en_cours:'#3b82f6', conclue:'#007A3D', annulee:'#CE1126' };
  liste.innerHTML = DEMANDES_IMMO.slice(0,20).map(function(d) {
    var stc = stColors[d.statut] || '#999';
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:flex-start">'
      + '<div><span style="font-weight:800;color:#007A3D;font-size:13px">' + d.id + '</span>'
      + '<div style="font-weight:700;margin-top:4px;font-size:14px">' + d.client + ' — ' + d.tel + '</div>'
      + '<div style="font-size:12px;color:#555">' + d.type + (d.ville?' — '+d.ville:'') + '</div>'
      + (d.budget>0?'<div style="font-size:12px;color:#007A3D;font-weight:600">Budget : ' + d.budget.toLocaleString('fr-FR') + ' FCFA</div>':'')
      + (d.description?'<div style="font-size:11px;color:#999;font-style:italic;max-width:300px;overflow:hidden;text-overflow:ellipsis">"' + d.description.substring(0,100) + (d.description.length>100?'...':'') + '"</div>':'')
      + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">'
      + '<span style="background:'+stc+'22;color:'+stc+';padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700">'+d.statut+'</span>'
      + (d.tel?'<a href="https://wa.me/'+d.tel.replace(/[\s+\-]/g,'')+'?text=Bonjour+'+encodeURIComponent(d.client)+',+suite+à+votre+demande+'+d.id+'+..." target="_blank" class="btn bo bsm">WhatsApp</a>':'')
      + '</div></div></div>';
  }).join('');
}

// ═══════════════════════════════════════════════════════
//  INIT PAGE
// ═══════════════════════════════════════════════════════
function initPageImmobilier() {
  initImmobilier();
  renderCatalogueImmo();
  renderDemandesImmo();
  renderAgentsImmo();
}
