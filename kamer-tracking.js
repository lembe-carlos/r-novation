// ═══════════════════════════════════════════════════════════════
//  KAMER360 — Tracking GPS Temps Réel
//  Suivi livraison en direct + carte Leaflet
// ═══════════════════════════════════════════════════════════════

var KT = {
  map: null, livreurMarker: null, clientMarker: null,
  routeLine: null, watchId: null, ordreActif: null,
  livreurPos: null, simulInterval: null
};

// ── Initialiser la page de tracking ──────────────────────────
function initPageTracking() {
  var z = document.getElementById('tracking-content');
  if (!z) return;
  renderTrackingPage();
}

function renderTrackingPage() {
  var z = document.getElementById('tracking-content');
  if (!z) return;

  // Chercher les commandes en cours de livraison
  var cmdsEnCours = [];
  try {
    var cmds = JSON.parse(localStorage.getItem('sm_commandes') || '[]');
    cmdsEnCours = cmds.filter(function(c) {
      return c.statut === 'en_livraison' || c.statut === 'expedie' || c.statut === 'collecte';
    });
  } catch(e) {}

  var html = '';

  if (cmdsEnCours.length === 0) {
    html += '<div style="text-align:center;padding:48px 20px;color:#9ca3af">';
    html += '<div style="width:72px;height:72px;background:linear-gradient(135deg,#f0faf5,#e0f0e8);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px">📦</div>';
    html += '<div style="font-size:16px;font-weight:700;color:#374151;margin-bottom:8px">Aucune livraison en cours</div>';
    html += '<div style="font-size:13px;line-height:1.6">Vos commandes en cours de livraison<br>apparaissent ici avec leur position GPS.</div>';
    html += '<button onclick="ktDemoTracking()" style="margin-top:20px;background:#007A3D;color:#fff;border:none;padding:11px 24px;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Demo — Voir un tracking en direct</button>';
    html += '</div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px">';
    cmdsEnCours.forEach(function(cmd) {
      html += '<div onclick="ktOuvrirTracking(\'' + cmd.id + '\')" style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'#007A3D\'" onmouseout="this.style.borderColor=\'#e5e7eb\'">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
      html += '<div style="font-weight:700">Commande #' + (cmd.id||'').slice(-8) + '</div>';
      html += '<span style="background:#dcfce7;color:#007A3D;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">En livraison</span>';
      html += '</div>';
      html += '<div style="font-size:12px;color:#666">Livreur: ' + (cmd.livreur || 'Assigné') + '</div>';
      html += '<div style="font-size:12px;color:#007A3D;margin-top:6px;font-weight:600">Voir sur la carte →</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  z.innerHTML = html;
}

// ── Ouvrir le tracking d'une commande ────────────────────────
function ktOuvrirTracking(ordreId) {
  KT.ordreActif = ordreId;
  openM('m-tracking');
  setTimeout(function() { ktInitMap(); }, 300);
}

function ktDemoTracking() {
  KT.ordreActif = 'DEMO-001';
  openM('m-tracking');
  setTimeout(function() {
    ktInitMap();
    // Simuler mouvement livreur
    ktSimulerLivreur();
  }, 300);
}

function ktInitMap() {
  var container = document.getElementById('kt-map');
  if (!container) return;
  if (!window.L) { container.innerHTML = '<div style="padding:20px;text-align:center;color:#666">Chargement de la carte...</div>'; return; }

  // Douala comme centre par défaut
  var centerLat = 4.0511, centerLng = 9.7679;

  if (KT.map) { KT.map.remove(); KT.map = null; }

  KT.map = L.map('kt-map', { zoomControl: true }).setView([centerLat, centerLng], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(KT.map);

  // Icône livreur
  var livreurIcon = L.divIcon({
    html: '<div style="background:#007A3D;color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #fff;box-shadow:0 3px 12px rgba(0,0,0,.3)">🛵</div>',
    iconSize: [36, 36], iconAnchor: [18, 18], className: ''
  });

  // Icône client
  var clientIcon = L.divIcon({
    html: '<div style="background:#CE1126;color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #fff;box-shadow:0 3px 12px rgba(0,0,0,.3)">🏠</div>',
    iconSize: [36, 36], iconAnchor: [18, 18], className: ''
  });

  // Position livreur (simulée près de Bonanjo)
  KT.livreurPos = { lat: 4.0480, lng: 9.7005 };
  KT.livreurMarker = L.marker([KT.livreurPos.lat, KT.livreurPos.lng], { icon: livreurIcon })
    .addTo(KT.map).bindPopup('<b>Votre livreur</b><br>En route vers vous');

  // Position client (simulée Akwa)
  KT.clientMarker = L.marker([4.0511, 9.7679], { icon: clientIcon })
    .addTo(KT.map).bindPopup('<b>Adresse de livraison</b><br>Akwa, Douala');

  // Tracer la route
  KT.routeLine = L.polyline([
    [KT.livreurPos.lat, KT.livreurPos.lng],
    [4.0511, 9.7679]
  ], { color: '#007A3D', weight: 4, dashArray: '8, 8', opacity: 0.7 }).addTo(KT.map);

  // Ajuster la vue pour voir les deux points
  KT.map.fitBounds([
    [KT.livreurPos.lat, KT.livreurPos.lng],
    [4.0511, 9.7679]
  ], { padding: [40, 40] });

  ktMettreAJourInfo();
}

function ktSimulerLivreur() {
  // Simuler le mouvement du livreur vers le client
  var steps = 20, step = 0;
  var startLat = 4.0480, startLng = 9.7005;
  var endLat   = 4.0511, endLng   = 9.7679;

  if (KT.simulInterval) clearInterval(KT.simulInterval);

  KT.simulInterval = setInterval(function() {
    step++;
    if (step >= steps) { clearInterval(KT.simulInterval); ktArrivee(); return; }
    var progress = step / steps;
    var newLat = startLat + (endLat - startLat) * progress;
    var newLng = startLng + (endLng - startLng) * progress;
    KT.livreurPos = { lat: newLat, lng: newLng };

    if (KT.livreurMarker) KT.livreurMarker.setLatLng([newLat, newLng]);
    if (KT.routeLine) KT.routeLine.setLatLngs([[newLat, newLng], [endLat, endLng]]);

    // Mettre à jour les infos
    var dist = Math.round((1 - progress) * 3.2 * 10) / 10;
    var eta = Math.round((1 - progress) * 12);
    var infoEl = document.getElementById('kt-eta');
    var distEl = document.getElementById('kt-dist');
    if (infoEl) infoEl.textContent = eta + ' min';
    if (distEl) distEl.textContent = dist + ' km';
  }, 800);
}

function ktArrivee() {
  toast('🎉 Votre livreur est arrivé!', 'success');
  var infoEl = document.getElementById('kt-eta');
  var distEl = document.getElementById('kt-dist');
  if (infoEl) infoEl.textContent = 'Arrivé!';
  if (distEl) distEl.textContent = '0 km';
  if (KT.livreurMarker) KT.livreurMarker.setLatLng([4.0511, 9.7679]).openPopup();
}

function ktMettreAJourInfo() {
  var statuts = ['Livreur assigné', 'Collecte en cours', 'En route vers vous', 'Presque arrivé'];
  var randomStatut = statuts[Math.floor(Math.random() * 2) + 1];
  var etaEl = document.getElementById('kt-eta');
  var statutEl = document.getElementById('kt-statut');
  if (etaEl) etaEl.textContent = '12 min';
  if (statutEl) statutEl.textContent = randomStatut;
}

// ── Géolocalisation du client (pour livraisons) ──────────────
function ktGeoLocaliserClient(callback) {
  if (!navigator.geolocation) { callback(null, 'Géolocalisation non supportée'); return; }
  navigator.geolocation.getCurrentPosition(
    function(pos) { callback({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
    function(err) { callback(null, err.message); },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ── Tracking livreur (côté livreur) ──────────────────────────
function ktDemarrerTrackingLivreur(ordreId) {
  if (!navigator.geolocation) { toast('GPS non disponible', 'error'); return; }
  toast('Tracking GPS démarré — votre position est partagée avec le client', 'success');
  KT.watchId = navigator.geolocation.watchPosition(function(pos) {
    var posData = { lat: pos.coords.latitude, lng: pos.coords.longitude, ts: Date.now() };
    try {
      localStorage.setItem('sm_livreur_pos_' + ordreId, JSON.stringify(posData));
    } catch(e) {}
  }, function(err) {
    console.warn('GPS error:', err);
  }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 });
}

function ktArreterTracking() {
  if (KT.watchId) navigator.geolocation.clearWatch(KT.watchId);
  if (KT.simulInterval) clearInterval(KT.simulInterval);
  KT.watchId = null;
  if (KT.map) { KT.map.remove(); KT.map = null; }
}
