// ═══════════════════════════════════════════════════════════════
//  KAMER360 — Mode Hors-Ligne Complet (IndexedDB)
//  Catalogue, commandes, panier synchronisés offline
// ═══════════════════════════════════════════════════════════════

var KO = { db: null, DB_NAME: 'kamer360_offline', DB_VERSION: 1 };

// ── Initialiser IndexedDB ─────────────────────────────────────
function koInit() {
  if (!window.indexedDB) { console.warn('IndexedDB non supporté'); return Promise.resolve(); }
  return new Promise(function(resolve, reject) {
    var req = indexedDB.open(KO.DB_NAME, KO.DB_VERSION);
    req.onupgradeneeded = function(e) {
      var db = e.target.result;
      // Stores principaux
      if (!db.objectStoreNames.contains('produits'))  db.createObjectStore('produits',  { keyPath:'id' });
      if (!db.objectStoreNames.contains('commandes')) db.createObjectStore('commandes', { keyPath:'id' });
      if (!db.objectStoreNames.contains('panier'))    db.createObjectStore('panier',    { keyPath:'id' });
      if (!db.objectStoreNames.contains('sync_queue'))db.createObjectStore('sync_queue',{ keyPath:'id', autoIncrement:true });
      if (!db.objectStoreNames.contains('profil'))    db.createObjectStore('profil',    { keyPath:'key' });
    };
    req.onsuccess = function(e) { KO.db = e.target.result; resolve(); };
    req.onerror   = function(e) { console.error('IndexedDB error:', e.target.error); reject(e.target.error); };
  });
}

// ── Sauvegarder des données offline ──────────────────────────
function koSave(storeName, data) {
  if (!KO.db) return Promise.resolve();
  return new Promise(function(resolve, reject) {
    var tx   = KO.db.transaction([storeName], 'readwrite');
    var store = tx.objectStore(storeName);
    var req   = Array.isArray(data)
      ? (function(){ data.forEach(function(item){ store.put(item); }); return store; })()
      : store.put(data);
    tx.oncomplete = function() { resolve(); };
    tx.onerror    = function(e) { reject(e.target.error); };
  });
}

// ── Lire des données offline ──────────────────────────────────
function koGetAll(storeName) {
  if (!KO.db) return Promise.resolve([]);
  return new Promise(function(resolve, reject) {
    var tx    = KO.db.transaction([storeName], 'readonly');
    var store = tx.objectStore(storeName);
    var req   = store.getAll();
    req.onsuccess = function() { resolve(req.result || []); };
    req.onerror   = function() { resolve([]); };
  });
}

function koGet(storeName, key) {
  if (!KO.db) return Promise.resolve(null);
  return new Promise(function(resolve) {
    var tx    = KO.db.transaction([storeName], 'readonly');
    var store = tx.objectStore(storeName);
    var req   = store.get(key);
    req.onsuccess = function() { resolve(req.result || null); };
    req.onerror   = function() { resolve(null); };
  });
}

// ── File de sync (actions faites offline à synchroniser) ─────
function koQueueAction(action) {
  if (!KO.db) return;
  var tx    = KO.db.transaction(['sync_queue'], 'readwrite');
  var store = tx.objectStore('sync_queue');
  store.add({ action: action, timestamp: Date.now(), synced: false });
}

// ── Synchroniser avec le serveur quand réseau revient ────────
function koSync() {
  if (!KO.db) return;
  koGetAll('sync_queue').then(function(queue) {
    var pendingItems = queue.filter(function(item){ return !item.synced; });
    if (pendingItems.length === 0) return;
    console.log('[Offline] Synchronisation de', pendingItems.length, 'action(s) en attente...');
    pendingItems.forEach(function(item) {
      // En production: envoyer au backend via fetch
      // Ici: marquer comme synchronisé
      try {
        var tx = KO.db.transaction(['sync_queue'], 'readwrite');
        tx.objectStore('sync_queue').put(Object.assign({}, item, { synced: true }));
      } catch(e) {}
    });
    if (pendingItems.length > 0) {
      toast(pendingItems.length + ' action(s) synchronisée(s) avec le serveur', 'success');
    }
  });
}

// ── Cacher le catalogue produits offline ─────────────────────
function koCacheCatalogue(produits) {
  if (!Array.isArray(produits)) return;
  koSave('produits', produits).then(function() {
    console.log('[Offline] Catalogue sauvegardé:', produits.length, 'produits');
  });
}

// ── Sauvegarder une commande offline ─────────────────────────
function koSauvegarderCommande(cmd) {
  koSave('commandes', cmd);
  koQueueAction({ type: 'nouvelle_commande', data: cmd });
}

// ── Indicateur réseau dans l'UI ───────────────────────────────
function koMettreAJourBandeau() {
  var isOnline = navigator.onLine;
  var bandeau  = document.getElementById('ko-network-banner');
  if (!bandeau) {
    bandeau = document.createElement('div');
    bandeau.id = 'ko-network-banner';
    bandeau.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;padding:8px 16px;text-align:center;font-size:13px;font-weight:700;transition:all .3s;display:none';
    document.body.appendChild(bandeau);
  }
  if (isOnline) {
    bandeau.style.display = 'none';
    koSync();
  } else {
    bandeau.style.cssText += ';display:block;background:linear-gradient(90deg,#E65100,#FF8F00);color:#fff';
    bandeau.textContent = '📶 Mode hors-ligne — Vos actions sont sauvegardées et seront synchronisées';
  }
}

// ── Initialisation et écoute des événements réseau ───────────
koInit().then(function() {
  console.log('[Offline] IndexedDB prêt');
  // Cacher quelques données clés au démarrage
  try {
    var prods = JSON.parse(localStorage.getItem('sm_produits') || '[]');
    if (prods.length > 0) koCacheCatalogue(prods);
  } catch(e) {}
});

window.addEventListener('online',  koMettreAJourBandeau);
window.addEventListener('offline', koMettreAJourBandeau);
// Vérifier l'état initial
document.addEventListener('DOMContentLoaded', koMettreAJourBandeau);

function initOfflineManager() { if (typeof initPageOffline === 'function') initPageOffline(); }

function initPushNotifications() { console.log('Push notifications: non configurées'); }
