
// ═══════════════ RECHERCHE VILLES ═══════════════
function rechercherVilleBoutique(input) {
  var q      = (input.value || '').trim().toLowerCase();
  var list   = document.getElementById('cli-ville-list');
  var hidden = document.getElementById('cli-ville');
  if (hidden) hidden.value = input.value.trim();
  if (!list) return;
  if (q.length < 1) { list.style.display = 'none'; return; }

  var villes = (typeof CAMEROUN_VILLES !== 'undefined') ? CAMEROUN_VILLES : [];
  var resultats = villes.filter(function(v) {
    return v.ville.toLowerCase().includes(q) ||
           v.dept.toLowerCase().includes(q) ||
           v.region.toLowerCase().includes(q);
  }).slice(0, 12);

  if (resultats.length === 0) {
    list.innerHTML = '<div style="padding:10px 14px;color:#999;font-size:13px">Aucune ville trouvée</div>';
    list.style.display = 'block';
    return;
  }
  list.innerHTML = resultats.map(function(v) {
    var safe = v.ville.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return '<div onclick="choisirVilleBoutique(\'' + safe + '\')" '
      + 'style="padding:9px 14px;cursor:pointer;border-bottom:1px solid #f0f0f0;font-size:13px" '
      + 'onmouseover="this.style.background=\'#f9fafb\'" onmouseout="this.style.background=\'#fff\'">'
      + '<span style="font-weight:600;color:#111">' + v.ville + '</span>'
      + ' <span style="font-size:11px;color:#999">' + v.dept + ' — ' + v.region + '</span>'
      + '</div>';
  }).join('');
  list.style.display = 'block';
}

function choisirVilleBoutique(ville) {
  var input  = document.getElementById('cli-ville-search');
  var hidden = document.getElementById('cli-ville');
  var list   = document.getElementById('cli-ville-list');
  if (input)  input.value  = ville;
  if (hidden) hidden.value = ville;
  if (list)   list.style.display = 'none';
}

document.addEventListener('click', function(e) {
  var list = document.getElementById('cli-ville-list');
  var input = document.getElementById('cli-ville-search');
  if (list && input && !input.contains(e.target) && !list.contains(e.target)) {
    list.style.display = 'none';
  }
});

// ═══════════════ CODE PROMO ═══════════════
var promoAppliquee = null;

async function appliquerPromoCode() {
  var code = document.getElementById('promo-input').value.trim().toUpperCase();
  if (!code) { showPromoMsg('Entrez un code promo', 'error'); return; }

  showPromoMsg('Vérification...', 'info');
  var montant = getTotal();
  var promo = null;

  // 1. Chercher dans Supabase (source principale)
  try {
    var sb = null;
    if (typeof window.supabase !== 'undefined' && typeof SM_CONFIG !== 'undefined'
        && SM_CONFIG.supabase && SM_CONFIG.supabase.url) {
      sb = window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
    }
    if (sb) {
      var res = await sb.from('promotions').select('*').eq('code', code).eq('actif', true).single();
      if (res.data) promo = res.data;
    }
  } catch(e) { /* Supabase indisponible */ }

  // 2. Fallback localStorage
  if (!promo) {
    try {
      var saved = JSON.parse(localStorage.getItem('sm_promos') || 'null');
      if (saved && saved.liste) {
        promo = saved.liste.find(function(p){ return p.code === code && p.actif; }) || null;
      }
    } catch(e) { _logErr("boutique.js", e); }
  }

  if (!promo) { showPromoMsg('Code promo invalide ou expiré', 'error'); promoAppliquee = null; updateRecap(); return; }
  if ((promo.uses || 0) >= (promo.max_uses || 999)) { showPromoMsg("Ce code a atteint sa limite d'utilisation", 'error'); return; }
  if (montant < (promo.min_achat || 0)) { showPromoMsg('Achat minimum requis : ' + (promo.min_achat||0).toLocaleString('fr-FR') + ' FCFA', 'error'); return; }
  if (promo.expire && new Date(promo.expire) < new Date()) { showPromoMsg('Code expiré', 'error'); return; }

  var reduction = 0;
  if (promo.type === 'pourcentage') reduction = Math.round(montant * promo.valeur / 100);
  if (promo.type === 'montant')     reduction = Math.min(promo.valeur, montant);
  if (promo.type === 'livraison')   reduction = 0;

  promoAppliquee = { code: code, promo: promo, reduction: reduction };

  var rowEl = document.getElementById('promo-row');
  var redEl = document.getElementById('promo-reduction');
  var livFrais = getLivraisonFrais ? getLivraisonFrais('') : 7500;
  var affReduction = promo.type === 'livraison' ? livFrais : reduction;
  if (rowEl) rowEl.style.display = 'flex';
  if (redEl) redEl.textContent = (promo.type === 'livraison' ? '🎁 Livraison offerte' : '-' + affReduction.toLocaleString('fr-FR') + ' FCFA');
  showPromoMsg('✅ ' + (promo.description || promo.desc || 'Code appliqué !'), 'success');
  buildRecap();
  updateTotal();
}
function showPromoMsg(msg, type) {
  var el = document.getElementById('promo-msg');
  if (!el) return;
  el.style.display = 'block';
  el.style.color = type==='success' ? '#007A3D' : '#ef4444';
  el.textContent = msg;
}

function updateTotal() {
  var sous_total = panier.reduce(function(s,x){ return s+x.prix*x.qte; }, 0);
  var ville = document.getElementById('cli-ville') ? document.getElementById('cli-ville').value : '';
  var liv = getLivraisonFrais(ville);
  var livGratuite = promoAppliquee && promoAppliquee.promo.type === 'livraison';
  var reduction = (!livGratuite && promoAppliquee) ? promoAppliquee.reduction : 0;
  var total = sous_total + (livGratuite ? 0 : liv) - reduction;
  var totEl = document.getElementById('pay-total-val');
  if (totEl) totEl.textContent = total.toLocaleString('fr-FR')+' FCFA';
  var totEl2 = document.getElementById('pay-total-esp');
  if (totEl2) totEl2.textContent = total.toLocaleString('fr-FR')+' FCFA';
}


// ── Charger et appliquer la config depuis localStorage ──
function appliquerConfigBoutique() {
  try {
    var cfg = JSON.parse(localStorage.getItem('sm_config') || 'null');
    if (!cfg) return;

    // Footer
    var set = function(id, txt) { var el = document.getElementById(id); if(el) el.innerHTML = txt; };
    var setHtml = function(id, html) { var el = document.getElementById(id); if(el) el.innerHTML = html; };

    if(cfg.nom)     set('footer-nom', cfg.nom);
    if(cfg.desc)    set('footer-desc', cfg.desc);
    if(cfg.adresse) set('footer-adresse', '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7EC8A0\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"vertical-align:middle;margin-right:5px\"><path d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle></svg> ' + cfg.adresse);
    if(cfg.tel)     set('footer-tel', '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7EC8A0\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"vertical-align:middle;margin-right:5px\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z\"></path></svg> ' + cfg.tel);
    if(cfg.email)   set('footer-email', '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7EC8A0\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"vertical-align:middle;margin-right:5px\"><path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"></path><polyline points=\"22,6 12,13 2,6\"></polyline></svg> ' + cfg.email);
    if(cfg.annee || cfg.nom) {
      var nom = cfg.nom || 'KAMER360';
      var an  = cfg.annee || '2025';
      set('footer-copy', '© ' + an + ' ' + nom + ' — Tous droits réservés <img loading="lazy" src="https://flagcdn.com/w20/cm.png" alt="Cameroun" style="width:20px;height:14px;vertical-align:middle">');
    }

    // Magasins dans footer depuis STORES localStorage
    var stores = JSON.parse(localStorage.getItem('sm_stores') || 'null');
    if (stores && stores.length > 0) {
      var mag = document.getElementById('footer-magasins');
      if (mag) mag.innerHTML = stores.map(function(s){
        return '<a href="#">' + s.nom + '</a>';
      }).join('');
    }

    // Bouton WhatsApp flottant
    if (cfg.wa) {
      var btw = document.getElementById('btw');
      if (btw) btw.innerHTML = '<a href="https://wa.me/'+cfg.wa+'" target="_blank" style="display:flex;align-items:center;gap:8px;color:#fff;text-decoration:none;font-size:13px;font-weight:600"><img loading="lazy" src="https://img.icons8.com/ios/24/007A3D/chat.png" alt="message" style="width:20px;height:20px;vertical-align:middle"> Commander via WhatsApp</a>';
    }

    // Numéros marchands dans instructions paiement
    if (cfg.mtn) {
      document.querySelectorAll('.mtn-num').forEach(function(el){ el.textContent = cfg.mtn; });
    }
    if (cfg.orange) {
      document.querySelectorAll('.orange-num').forEach(function(el){ el.textContent = cfg.orange; });
    }

  } catch(e) { console.warn('Config boutique non disponible:', e); }
}


// ── Charger les supermarchés depuis localStorage (sync avec tableau de bord) ──
function chargerStoresBoutique() {
  try {
    var stored = JSON.parse(localStorage.getItem('sm_stores') || 'null');
    if (stored && stored.length > 0) {
      // Mettre à jour le select du supermarché préféré
      var sel = document.getElementById('cli-sm');
      if (sel) {
        sel.innerHTML = stored.map(function(s){
          return '<option value="'+s.nom+'">'+s.nom+'</option>';
        }).join('');
      }
    }
  } catch(e) { _logErr("boutique.js", e); }
}

// ═══════════════════════════════════════════════════
//  KAMER360 — boutique.js
//  Logique boutique publique client
// ═══════════════════════════════════════════════════

// ── Catalogue produits (synchronisé avec script.js) ──
var PRODUITS = [];

// ── État global ──
var catActif = '';
var searchQ  = '';
var prixMin  = 0;
var prixMax  = 999999999;
var pageCourante = 1;
var PRODUITS_PAR_PAGE = 24;

// ── Panier persistant ──
function _sauvegarderPanier() {
  try { localStorage.setItem('sm_panier', JSON.stringify(panier)); } catch(e) {}
}
function _chargerPanier() {
  try { var s = localStorage.getItem('sm_panier'); if (s) { var p = JSON.parse(s); if (Array.isArray(p)) return p; } } catch(e) {}
  return [];
}
var panier = _chargerPanier();
var step     = 1;
var payMode  = 'mtn';
var cmdNumero = '';

// ── Utilitaire : formater prix ──
function fmt(n){ return Number(n).toLocaleString('fr-FR') + ' FCFA'; }

// ── Statut stock ──
function statutStock(p){
  if(p.stock === 0)  return { lbl:'Rupture',    cls:'rupture', disabled:true };
  if(p.stock < 10)   return { lbl:'Stock limité', cls:'faible',  disabled:false };
  return               { lbl:'Disponible',   cls:'dispo',   disabled:false };
}

// ════════ AFFICHAGE PRODUITS ════════


// ════════ SYSTÈME D'AVIS CLIENTS ════════

function getAvisProduit(prodId) {
  try {
    var avis = JSON.parse(localStorage.getItem('sm_avis') || '[]');
    return avis.filter(function(a){ return a.prodId === prodId; });
  } catch(e) { return []; }
}

function getMoyenneAvis(prodId) {
  var avis = getAvisProduit(prodId);
  if (avis.length === 0) return 0;
  var total = avis.reduce(function(s, a){ return s + a.note; }, 0);
  return Math.round((total / avis.length) * 10) / 10;
}

function etoiles(note) {
  var s = '';
  for (var i = 1; i <= 5; i++) {
    s += '<span style="color:' + (i <= note ? '#F5C000' : '#ddd') + ';font-size:16px"><img loading="lazy" src="https://img.icons8.com/ios/14/FCD116/star.png" alt="Etoile" style="width:12px;height:12px;vertical-align:middle"></span>';
  }
  return s;
}

function ouvrirModalAvis(prodId) {
  var prod = PRODUITS.find(function(p){ return p.id === prodId; });
  if (!prod) return;
  var avis = getAvisProduit(prodId);
  var moy  = getMoyenneAvis(prodId);

  var html = '<div class="bmd-ov" onclick="fermerModalAvis()" style="display:flex">' +
    '<div class="bmd-box" onclick="event.stopPropagation()" style="max-width:480px;width:90%;max-height:90vh;overflow-y:auto;border-radius:20px;padding:24px;background:#fff">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
        '<h3 style="font-size:17px;font-weight:800">Avis sur ' + prod.nom + '</h3>' +
        '<button onclick="fermerModalAvis()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#999">×</button>' +
      '</div>' +
      (avis.length > 0 ?
        '<div style="text-align:center;padding:12px;background:#f8fdf9;border-radius:12px;margin-bottom:16px">' +
          '<div style="font-size:36px;font-weight:900;color:#007A3D">' + moy + '</div>' +
          '<div>' + etoiles(Math.round(moy)) + '</div>' +
          '<div style="font-size:12px;color:#888">' + avis.length + ' avis</div>' +
        '</div>' : '') +
      (CLIENT_COURANT ?
        '<div style="background:#f0faf5;border-radius:14px;padding:16px;margin-bottom:16px">' +
          '<div style="font-size:13px;font-weight:700;margin-bottom:10px">Laisser un avis</div>' +
          '<div style="display:flex;gap:4px;margin-bottom:10px" id="stars-select">' +
            [1,2,3,4,5].map(function(i){
              return '<span onclick="selectEtoile('+i+')" style="font-size:28px;cursor:pointer;color:#ddd" id="star-'+i+'"><img loading="lazy" src="https://img.icons8.com/ios/14/FCD116/star.png" alt="Etoile" style="width:12px;height:12px;vertical-align:middle"></span>';
            }).join('') +
          '</div>' +
          '<textarea id="avis-texte" placeholder="Votre commentaire..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:10px;font-size:13px;resize:vertical;min-height:70px;font-family:inherit;box-sizing:border-box"></textarea>' +
          '<button onclick="soumettraAvis('+prodId+')" style="margin-top:10px;width:100%;padding:11px;background:#007A3D;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px">Publier mon avis</button>' +
        '</div>' :
        '<div style="text-align:center;padding:14px;background:#fff8e1;border-radius:12px;margin-bottom:16px;font-size:13px;color:#856404">Connectez-vous pour laisser un avis</div>'
      ) +
      (avis.length > 0 ?
        '<div>' + avis.slice(0,5).map(function(a){
          return '<div style="border-bottom:1px solid #f0f0f0;padding:12px 0">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
              '<strong style="font-size:13px">' + (a.client || 'Client') + '</strong>' +
              '<span>' + etoiles(a.note) + '</span>' +
            '</div>' +
            '<div style="font-size:12px;color:#555">' + (a.texte || '') + '</div>' +
            '<div style="font-size:11px;color:#bbb;margin-top:4px">' + (a.date || '') + '</div>' +
          '</div>';
        }).join('') + '</div>' :
        '<div style="text-align:center;padding:20px;color:#bbb;font-size:13px">Aucun avis pour ce produit</div>'
      ) +
    '</div>' +
  '</div>';

  var container = document.createElement('div');
  container.id = 'avis-modal';
  container.innerHTML = html;
  document.body.appendChild(container);
  window._noteSelectionnee = 0;
}

function fermerModalAvis() {
  var m = document.getElementById('avis-modal');
  if (m) m.remove();
}

function selectEtoile(n) {
  window._noteSelectionnee = n;
  for (var i = 1; i <= 5; i++) {
    var s = document.getElementById('star-' + i);
    if (s) s.style.color = i <= n ? '#F5C000' : '#ddd';
  }
}

function soumettraAvis(prodId) {
  var note  = window._noteSelectionnee || 0;
  var texte = (document.getElementById('avis-texte') || {}).value || '';
  if (note === 0) { bToast('Sélectionnez une note ⭐', 'warning'); return; }
  if (!CLIENT_COURANT) { bToast('Connectez-vous d\'abord', 'warning'); return; }

  var avis = JSON.parse(localStorage.getItem('sm_avis') || '[]');
  avis.unshift({
    prodId: prodId,
    client: CLIENT_COURANT.prenom || CLIENT_COURANT.nom,
    note:   note,
    texte:  texte,
    date:   new Date().toLocaleDateString('fr-FR'),
    lu:     false
  });
  localStorage.setItem('sm_avis', JSON.stringify(avis));

  // Notifier l'admin
  var notifsAdmin = JSON.parse(localStorage.getItem('sm_notifs_admin') || '[]');
  var prod = PRODUITS.find(function(p){ return p.id === prodId; });
  notifsAdmin.unshift({
    type: 'avis',
    msg:  '⭐ Nouvel avis ' + note + '/5 sur ' + (prod ? prod.nom : 'un produit') + ' par ' + (CLIENT_COURANT.prenom || CLIENT_COURANT.nom),
    couleur: 'blue',
    date: new Date().toLocaleString('fr-FR'),
    lu:   false
  });
  localStorage.setItem('sm_notifs_admin', JSON.stringify(notifsAdmin));

  fermerModalAvis();
  bToast('Merci pour votre avis ! ⭐', 'success');
}

// ── Chargement produits depuis Supabase (sync avec espace gérant) ──
async function chargerProduitsDepuisSupabase() {
  // 1. Afficher localStorage immédiatement (chargement rapide)
  try {
    var local = JSON.parse(localStorage.getItem('sm_produits') || '[]');
    if (local && local.length > 0) {
      PRODUITS = local;
      renderProduits(); renderCats();
    }
  } catch(e) { _logErr("boutique.js", e); }

  // 2. Toujours charger Supabase pour avoir TOUS les produits à jour
  // (source de vérité — ignore localStorage)
  // (même si localStorage avait des données — Supabase est la source de vérité)
  try {
    var sb = null;
    if (typeof SM_CONFIG !== 'undefined' && SM_CONFIG.supabase && SM_CONFIG.supabase.active
        && typeof window.supabase !== 'undefined') {
      sb = window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
    }
    if (sb) {
      // Charger TOUS les produits sans limite (range par batch de 1000 si besoin)
      var allProds = [];
      var from = 0;
      var batchSize = 1000;
      var hasMore = true;

      while (hasMore) {
        var res = await sb.from('produits')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, from + batchSize - 1);

        if (res.error) break;
        if (!res.data || res.data.length === 0) { hasMore = false; break; }

        allProds = allProds.concat(res.data.map(function(p) {
          return {
            id:    p.id,
            nom:   p.nom || p.name || 'Produit',
            prix:  p.prix || p.price || 0,
            cat:   p.categorie || p.cat || 'Divers',
            stock: p.stock || 0,
            img:   p.image || p.img || '',
            sm:    p.supermarche || p.sm || 'KAMER360',
            dispo: p.disponible !== false
          };
        }));

        if (res.data.length < batchSize) hasMore = false;
        else from += batchSize;
      }

      if (allProds.length > 0) {
        PRODUITS = allProds;
        try { localStorage.setItem('sm_produits', JSON.stringify(PRODUITS)); } catch(e) {}
        renderProduits(); renderCats();
        // Afficher un toast si beaucoup de produits
        if (allProds.length >= 50 && typeof btoast === 'function') {
          btoast(allProds.length + ' produits chargés', 'success');
        }
      }
    }
  } catch(e) { _logErr("boutique.js chargerProduits", e); }
}

// ── Mise à jour dynamique des boutons catégories ──
function renderCategories() {
  var cats = [];
  PRODUITS.forEach(function(p) {
    if (p.cat && cats.indexOf(p.cat) === -1) cats.push(p.cat);
  });
  var container = document.getElementById('bcats');
  if (!container) return;
  // Vider complètement et reconstruire pour éviter les doublons
  container.innerHTML = '<button class="bcat active" onclick="filterCat(\'\'  , this)">Tous</button>';
  cats.forEach(function(cat) {
    var btn = document.createElement('button');
    btn.className = 'bcat';
    btn.setAttribute('data-cat', cat);
    btn.onclick = function(){ filterCat(cat, btn); };
    btn.textContent = cat;
    container.appendChild(btn);
  });
}

function renderProduits(){
  var grid = document.getElementById('bpgrid');
  var prods = PRODUITS.filter(function(p){
    var matchCat  = !catActif || p.cat === catActif;
    var matchSrch = !searchQ  || p.nom.toLowerCase().includes(searchQ.toLowerCase()) || (p.cat||'').toLowerCase().includes(searchQ.toLowerCase()) || (p.sm||'').toLowerCase().includes(searchQ.toLowerCase());
    var matchPrix = p.prix >= prixMin && (prixMax >= 999999999 || p.prix <= prixMax);
    return matchCat && matchSrch && matchPrix;
  });

  var compteurEl = document.getElementById('bprod-compteur');
  if (compteurEl) compteurEl.textContent = prods.length + ' produit' + (prods.length > 1 ? 's' : '');

  var totalPages = Math.max(1, Math.ceil(prods.length / PRODUITS_PAR_PAGE));
  if (pageCourante > totalPages) pageCourante = 1;
  var debut = (pageCourante - 1) * PRODUITS_PAR_PAGE;
  var prodPage = prods.slice(debut, debut + PRODUITS_PAR_PAGE);

  var paginEl = document.getElementById('bprod-pagination');
  if (paginEl) {
    if (totalPages <= 1) { paginEl.innerHTML = ''; }
    else {
      var ph = '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;margin-top:20px">';
      ph += '<button onclick="changerPage(' + Math.max(1,pageCourante-1) + ')" ' + (pageCourante===1?'disabled':'') + ' class="tw-transition-all tw-duration-150 hover:tw-bg-gray-50 disabled:tw-opacity-40" style="padding:8px 16px;border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-weight:600">&#8592; Préc.</button>';
      for (var pg=1; pg<=totalPages; pg++) {
        var ia = pg===pageCourante;
        ph += '<button onclick="changerPage('+pg+')" class="tw-transition-all tw-duration-150 hover:tw-scale-105" style="padding:8px 14px;border:1.5px solid '+(ia?'#007A3D':'#e5e7eb')+';border-radius:8px;background:'+(ia?'#007A3D':'#fff')+';color:'+(ia?'#fff':'#374151')+';cursor:pointer;font-weight:'+(ia?'700':'400')+'">'+pg+'</button>';
      }
      ph += '<button onclick="changerPage(' + Math.min(totalPages,pageCourante+1) + ')" ' + (pageCourante===totalPages?'disabled':'') + ' class="tw-transition-all tw-duration-150 hover:tw-bg-gray-50 disabled:tw-opacity-40" style="padding:8px 16px;border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-weight:600">Suiv. &#8594;</button>';
      ph += '</div>';
      paginEl.innerHTML = ph;
    }
  }

  prods = prodPage;

  if(prods.length === 0){
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--mu)"><div style="font-size:48px;margin-bottom:14px"><img loading="lazy" src="https://img.icons8.com/ios/24/007A3D/search.png" alt="recherche" style="width:20px;height:20px;vertical-align:middle"></div><div style="font-size:16px;font-weight:700;color:var(--tx);margin-bottom:6px">Aucun produit trouvé</div><div style="font-size:13px">Essayez une autre catégorie ou un autre mot-clé</div></div>';
    return;
  }

  grid.innerHTML = prods.map(function(p){
    var st  = statutStock(p);
    var qte = getPanierQte(p.id);
    return '<div class="bpc tw-transition-all tw-duration-200 hover:tw-shadow-xl hover:tw--translate-y-1" id="bpc-'+p.id+'">' +
      '<div class="bpc-img-wrap tw-overflow-hidden">' +
        '<img loading="lazy" class="bpc-img tw-transition-transform tw-duration-300 hover:tw-scale-110" src="'+p.img+'" alt="'+p.nom+'" onerror="this.src=\'https://picsum.photos/seed/prod/400/400\'">' +
        '<span class="bpc-badge '+st.cls+'">'+st.lbl+'</span>' +
        (p.id % 4 === 0 ? '<span class="bpc-badge promo">-10%</span>' : '') +
      '</div>' +
      '<div class="bpc-body">' +
        '<div class="bpc-cat">'+p.cat+'</div>' +
        '<div class="bpc-nom">'+p.nom+'</div>' +
        '<div class="bpc-sm">'+p.sm+'</div>' +
        '<div class="bpc-prix">'+fmt(p.prix)+' <span>/ unité</span></div>' +
        '<div class="bpc-qrow">' +
          '<button class="bqb tw-transition-transform tw-duration-100 active:tw-scale-90" onclick="changeQteBoutique('+p.id+',-1)" '+(qte===0?'disabled':'')+'>−</button>' +
          '<span class="bqv" id="bqv-'+p.id+'">'+qte+'</span>' +
          '<button class="bqb tw-transition-transform tw-duration-100 active:tw-scale-90" onclick="changeQteBoutique('+p.id+',1)" '+(st.disabled?'disabled':'')+'>+</button>' +
        '</div>' +
        '<button class="badd-btn tw-transition-all tw-duration-150 active:tw-scale-95 '+(qte>0?'added':'')+'" id="badd-'+p.id+'" onclick="addPanier('+p.id+')" '+(st.disabled?'disabled':'')+'>'+
          (st.disabled ? 'Rupture de stock' : (qte>0 ? 'Ajouté au panier <img loading="lazy" src="https://img.icons8.com/ios/18/007A3D/checkmark.png" alt="ok" style="width:14px;height:14px;vertical-align:middle">' : 'Ajouter au panier')) +
        '</button>' +
        '<button class="tw-transition-all tw-duration-150 hover:tw-bg-emerald-50 active:tw-scale-95" onclick="ouvrirModalAvis('+p.id+')" style="width:100%;margin-top:6px;padding:7px;background:transparent;border:1.5px solid #e0f2e9;border-radius:9px;color:#007A3D;font-size:12px;font-weight:600;cursor:pointer">' +
          (getMoyenneAvis(p.id) > 0 ? '<img loading="lazy" src="https://img.icons8.com/ios/14/FCD116/star.png" alt="Etoile" style="width:12px;height:12px;vertical-align:middle"> ' + getMoyenneAvis(p.id) + ' · ' + getAvisProduit(p.id).length + ' avis' : '<img loading="lazy" src="https://img.icons8.com/ios/14/999999/star.png" alt="Etoile vide" style="width:12px;height:12px;vertical-align:middle"> Laisser un avis') +
        '</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ── Filtrage catégorie ──
function filterCat(cat, el){
  catActif = cat;
  document.querySelectorAll('.bcat').forEach(function(b){ b.classList.remove('active'); });
  if(el) el.classList.add('active');
  renderProduits();
}

// ── Filtrage recherche ──
function filterSearch(){
  searchQ = (document.getElementById('search-input') || {}).value || '';
  pageCourante = 1;
  renderProduits();
}

// ════════ GESTION PANIER ════════
function getPanierQte(id){
  var item = panier.find(function(x){ return x.id===id; });
  return item ? item.qte : 0;
}

function changeQteBoutique(id, delta){
  // String() pour gérer les IDs marketplace (string) et boutique (number)
  var idx = panier.findIndex(function(x){ return String(x.id)===String(id); });
  if(idx === -1){
    if(delta > 0){
      var p = PRODUITS.find(function(x){ return String(x.id)===String(id); });
      if(p) panier.push({ id:p.id, nom:p.nom, prix:p.prix, img:p.img, cat:p.cat, sm:p.sm, qte:1 });
    }
  } else {
    panier[idx].qte += delta;
    if(panier[idx].qte <= 0) panier.splice(idx, 1);
  }
  _sauvegarderPanier();
  updateCart();
  updateProdCard(id);
  _syncBnavBadge();
}

function addPanier(id){
  var idx = panier.findIndex(function(x){ return String(x.id)===String(id); });
  if(idx === -1){
    var p = PRODUITS.find(function(x){ return String(x.id)===String(id); });
    if(p){ panier.push({ id:p.id, nom:p.nom, prix:p.prix, img:p.img, cat:p.cat, sm:p.sm, qte:1 }); }
  } else {
    panier[idx].qte++;
  }
  _sauvegarderPanier();
  updateCart();
  updateProdCard(id);
  _syncBnavBadge();
  var prod = PRODUITS.find(function(p){ return String(p.id)===String(id); });
  if(prod) btoast(prod.nom + ' ajouté au panier', 'success');
}

function retirerItem(id){
  // String() pour gérer articles marketplace (IDs string) et boutique (IDs number)
  panier = panier.filter(function(x){ return String(x.id) !== String(id); });
  _sauvegarderPanier();
  updateCart();
  updateProdCard(id);
  _syncBnavBadge();
}

function viderPanier(){
  if(!confirm('Vider tout le panier ?')) return;
  panier = [];
  _sauvegarderPanier();
  updateCart();
  _syncBnavBadge();
  btoast('Panier vidé', 'info');
}

function _syncBnavBadge(){
  try {
    var total = panier.reduce(function(s,x){ return s+(x.qte||1); }, 0);
    var b = document.getElementById('bnav-cart-badge');
    if(b){ b.textContent = total; b.style.display = total > 0 ? 'block' : 'none'; }
  } catch(e){}
}

function updateProdCard(id){
  var qte = getPanierQte(id);
  var qv  = document.getElementById('bqv-'+id);
  var btn = document.getElementById('badd-'+id);
  var p   = PRODUITS.find(function(x){ return x.id===id; });
  var st  = statutStock(p);
  if(qv)  qv.textContent = qte;
  if(btn && !st.disabled){
    btn.innerHTML = qte > 0 ? 'Ajouté au panier <img loading="lazy" src="https://img.icons8.com/ios/18/007A3D/checkmark.png" alt="ok" style="width:14px;height:14px;vertical-align:middle">' : 'Ajouter au panier';
    btn.className   = 'badd-btn ' + (qte > 0 ? 'added' : '');
  }
}

function updateCart(){
  // Badge header
  var total_qte = panier.reduce(function(s,x){ return s+x.qte; }, 0);
  var total_prix = panier.reduce(function(s,x){ return s+x.prix*x.qte; }, 0);
  document.getElementById('cart-cnt').textContent = total_qte;
  document.getElementById('cart-st').textContent  = fmt(total_prix);
  document.getElementById('cart-tot').textContent = fmt(total_prix);
  document.getElementById('cart-cmd-btn').disabled = panier.length === 0;
  _syncBnavBadge();

  // Liste items panier
  var el = document.getElementById('cart-items');
  if(panier.length === 0){
    el.innerHTML = '<div class="cart-empty"><img loading="lazy" src="https://picsum.photos/seed/kamer360/400/400" alt=""><h4>Votre panier est vide</h4><p>Ajoutez des produits depuis la boutique</p></div>';
    return;
  }

  // Bouton vider le panier
  var viderBtn = '<div style="text-align:right;margin-bottom:8px"><button onclick="viderPanier()" style="background:none;border:1.5px solid #e5e7eb;border-radius:8px;padding:5px 12px;font-size:12px;color:#CE1126;cursor:pointer;font-family:inherit">🗑 Vider le panier</button></div>';

  el.innerHTML = viderBtn + panier.map(function(item){
    // Utiliser String() pour les IDs qui peuvent être string (marketplace) ou number (boutique)
    var idStr = "'" + String(item.id) + "'";
    return '<div class="citem">' +
      '<img loading="lazy" class="citem-img" src="'+item.img+'" alt="'+item.nom+'" onerror="this.src=\'https://picsum.photos/seed/kamer360/400/400\'">' +
      '<div class="citem-inf">' +
        '<div class="citem-nom">'+item.nom+'</div>' +
        '<div class="citem-prix">'+fmt(item.prix)+' / u.</div>' +
        '<div class="citem-qrow">' +
          '<button class="cqb" onclick="changeQteBoutique('+idStr+',-1)">−</button>' +
          '<span class="cqv">'+item.qte+'</span>' +
          '<button class="cqb" onclick="changeQteBoutique('+idStr+',1)">+</button>' +
        '</div>' +
      '</div>' +
      '<div class="citem-tot">'+fmt(item.prix*item.qte)+'</div>' +
      '<div class="citem-del" onclick="retirerItem('+idStr+')"><img loading="lazy" src="https://img.icons8.com/ios/18/CE1126/delete-sign.png" alt="supprimer" style="width:14px;height:14px;vertical-align:middle"></div>' +
    '</div>';
  }).join('');
}


function openCart(){
  document.getElementById('cart-ov').classList.add('open');
  updateCart();
}
function closeCart(){
  document.getElementById('cart-ov').classList.remove('open');
}

// ════════ MODAL COMMANDE — ÉTAPES ════════
function openCmdModal(){
  closeCart();
  step = 1;
  renderStep();
  document.getElementById('cmd-ov').classList.add('open');
}
function closeCmdModal(){
  document.getElementById('cmd-ov').classList.remove('open');
}

function renderStep(){
  // Afficher/cacher sections
  document.getElementById('step-1').style.display = step===1 ? 'block' : 'none';
  document.getElementById('step-2').style.display = step===2 ? 'block' : 'none';
  document.getElementById('step-3').style.display = step===3 ? 'block' : 'none';
  document.getElementById('cmd-foot').style.display = step===3 ? 'none' : 'flex';

  // Titres
  var titres = { 1:'Informations de livraison', 2:'Mode de paiement', 3:'Commande confirmée !' };
  document.getElementById('cmd-modal-title').textContent = titres[step];

  // Dots étapes
  for(var i=1; i<=3; i++){
    var dot  = document.getElementById('step-dot-'+i);
    var line = document.getElementById('step-line-'+i);
    dot.className = 'cmd-step-dot ' + (i<step?'done':i===step?'active':'');
    dot.innerHTML = i < step ? '<img loading="lazy" src="https://img.icons8.com/ios/18/007A3D/checkmark.png" alt="ok" style="width:14px;height:14px;vertical-align:middle">' : i;
    if(line) line.className = 'cmd-step-line ' + (i<step?'done':'');
  }

  // Bouton retour
  var btnRet = document.getElementById('btn-retour');
  if(btnRet) btnRet.style.display = step > 1 ? 'flex' : 'none';

  // Bouton suivant
  var btnSuiv = document.getElementById('btn-suivant');
  if(btnSuiv){
    btnSuiv.textContent = step===2 ? 'Confirmer la commande' : 'Continuer';
  }

  // Montant dans instructions paiement
  if(step === 2){
    var total = getTotal();
    var el1 = document.getElementById('pay-montant');
    var el2 = document.getElementById('pay-montant-esp');
    if(el1) el1.textContent = fmt(total);
    if(el2) el2.textContent = fmt(total);
    buildRecap();
  }
}

function stepNext(){
  if(step === 1){
    // Valider infos client
    var prenom = document.getElementById('cli-prenom').value.trim();
    var nom    = document.getElementById('cli-nom').value.trim();
    var tel    = document.getElementById('cli-tel').value.trim();
    var ville  = document.getElementById('cli-ville').value;
    var adr    = document.getElementById('cli-adresse').value.trim();
    if(!prenom || !nom){ btoast('Entrez votre prénom et nom', 'error'); return; }
    if(!tel){ btoast('Entrez votre numéro de téléphone', 'error'); return; }
    if(!ville){ btoast('Sélectionnez votre ville', 'error'); return; }
    if(!adr && ville !== 'Retrait magasin'){ btoast('Entrez votre adresse de livraison', 'error'); return; }
    step = 2;
    renderStep();
    return;
  }
  if(step === 2){
    // Si Mobile Money, vérifier numéro
    if(payMode !== 'especes'){
      var numWrap = document.getElementById('pay-num-wrap');
      // Vérifier si le champ numéro est visible
      if(numWrap && numWrap.style.display !== 'none'){
        var num = (document.getElementById('pay-num').value || '').trim();
        var numChiffres = num.replace(/[\s\-\+\(\)\.]/g, '');
        if(numChiffres.length < 6){
          var inp = document.getElementById('pay-num');
          if(inp){ inp.style.borderColor='#dc2626'; inp.focus(); }
          btoast('Entrez votre numéro ' + (payMode==='mtn'?'MTN':payMode==='yoomee'?'Yoomee':'Orange') + ' Mobile Money', 'error');
          return;
        }
        var inp2 = document.getElementById('pay-num');
        if(inp2) inp2.style.borderColor='#e6a817';
      }
    }
    confirmerCommande();
    return;
  }
}

function stepBack(){
  if(step > 1){ step--; renderStep(); }
}

// ── Tarif livraison ──
function getTarifLiv(){
  var ville = document.getElementById('cli-ville') ? document.getElementById('cli-ville').value : '';
  if(!ville || ville === 'Retrait magasin') return 0;
  if(ville.includes('Centre') || ville.includes('Akwa')) return 2000;
  if(ville.includes('Banlieue')) return 3500;
  if(ville === 'Bafoussam' || ville === 'Garoua') return 5000;
  return 7500;
}

// Alias — même fonction, deux noms
function getLivraisonFrais(ville){
  if(!ville || ville === 'Retrait magasin') return 0;
  if(ville.includes('Centre') || ville.includes('Akwa')) return 2000;
  if(ville.includes('Banlieue')) return 3500;
  if(ville === 'Bafoussam' || ville === 'Garoua') return 5000;
  return 7500;
}

function getTotal(){
  var sous_total = panier.reduce(function(s,x){ return s+x.prix*x.qte; }, 0);
  var liv = getTarifLiv();
  if(sous_total >= 50000 && (liv === 2000 || liv === 3500)) liv = 0;
  return sous_total + liv;
}

function buildRecap(){
  var sous_total = panier.reduce(function(s,x){ return s+x.prix*x.qte; }, 0);
  var liv = getTarifLiv();
  var gratuit = sous_total >= 50000 && (liv === 2000 || liv === 3500);
  if(gratuit) liv = 0;

  var html = '<h4>Récapitulatif</h4>';
  html += panier.map(function(item){
    return '<div class="recap-item">' +
      '<img loading="lazy" src="'+item.img+'" alt="" onerror="this.src=\'https://picsum.photos/seed/kamer360/400/400\'">' +
      '<span>'+item.nom+' × '+item.qte+'</span>' +
      '<strong>'+fmt(item.prix*item.qte)+'</strong>' +
    '</div>';
  }).join('');
  // Calculer réduction promo
  var red = 0;
  var livGratuite = false;
  if (promoAppliquee) {
    if (promoAppliquee.promo.type === 'livraison') { livGratuite = true; red = liv; }
    else red = promoAppliquee.reduction || 0;
  }
  var livAff = livGratuite ? 0 : liv;
  var total  = sous_total + livAff - (livGratuite ? 0 : red);

  html += '<div style="border-top:1px dashed var(--br);padding-top:8px;margin-top:4px">';
  html += '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px"><span>Sous-total</span><span>'+fmt(sous_total)+'</span></div>';
  html += '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>Livraison</span><span style="color:var(--g);font-weight:700">'+(livAff===0?'GRATUITE':fmt(livAff))+'</span></div>';
  if (red > 0 && !livGratuite) {
    html += '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;color:#007A3D"><span>Réduction ('+promoAppliquee.code+')</span><span>-'+fmt(red)+'</span></div>';
  }
  if (livGratuite) {
    html += '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;color:#007A3D"><span>🎁 Livraison offerte ('+promoAppliquee.code+')</span><span>-'+fmt(liv)+'</span></div>';
  }
  html += '</div>';
  html += '<div class="recap-total"><span>TOTAL À PAYER</span><span style="color:#007A3D">'+fmt(total)+' FCFA</span></div>';
  document.getElementById('recap-items').innerHTML = html;
}

// ── Sélection mode paiement ──
function selectPay(mode){
  payMode = mode;
  ['mtn','orange','yoomee','virement','especes','carte'].forEach(function(m){
    var opt = document.getElementById('opt-'+m);
    var chk = document.getElementById('chk-'+m);
    if(opt) opt.className = 'pay-opt ' + (m===mode?'selected':'');
    if(chk) chk.innerHTML = m===mode ? '<img loading="lazy" src="https://img.icons8.com/ios/18/007A3D/checkmark.png" alt="ok" style="width:14px;height:14px;vertical-align:middle">' : '';
  });
  var numWrap = document.getElementById('pay-num-wrap');
  var payInst = document.getElementById('pay-instruction');
  var espInst = document.getElementById('especes-instruction');
  var carteInst = document.getElementById('carte-instruction');

  if(mode === 'especes'){
    if(numWrap) numWrap.style.display = 'none';
    if(payInst) payInst.style.display = 'none';
    if(espInst) espInst.style.display = 'block';
    if(carteInst) carteInst.style.display = 'none';
  } else if(mode === 'carte'){
    if(numWrap) numWrap.style.display = 'none';
    if(payInst) payInst.style.display = 'none';
    if(espInst) espInst.style.display = 'none';
    if(carteInst) {
      carteInst.style.display = 'block';
      var elMc = document.getElementById('pay-montant-carte');
      if (elMc) elMc.textContent = fmt(getTotal()) + ' FCFA';
    }
  } else if(mode === 'virement'){
    if(numWrap) numWrap.style.display = 'none';
    if(espInst) espInst.style.display = 'none';
    if(carteInst) carteInst.style.display = 'none';
    if(payInst) {
      payInst.style.display = 'block';
      payInst.innerHTML = '<strong>Virement bancaire :</strong><br>'
        + 'Banque : <strong>Afriland First Bank</strong><br>'
        + 'Titulaire : <strong>KAMER360</strong><br>'
        + 'Numéro de compte : <strong>10005 00001 2345678901 45</strong><br>'
        + 'Banques acceptées : Afriland, SCB, UBA, Ecobank, BICEC<br><br>'
        + 'Envoyez la preuve de virement par WhatsApp au <strong>+237 693 59 14 79</strong>';
    }
  } else {
    if(numWrap) numWrap.style.display = 'block';
    if(payInst) payInst.style.display = 'block';
    if(espInst) espInst.style.display = 'none';
    var lbl = document.getElementById('pay-num-label');
    if(lbl) lbl.textContent = mode==='mtn'
      ? 'NUMÉRO MTN MOBILE MONEY OBLIGATOIRE *'
      : mode==='orange' ? 'NUMÉRO ORANGE MONEY OBLIGATOIRE *'
      : 'NUMÉRO YOOMEE MONEY OBLIGATOIRE *';
    var payInst2 = document.getElementById('pay-instruction');
    if(payInst2) {
      if(mode === 'mtn') {
        payInst2.innerHTML = '<strong>Comment payer MTN Mobile Money :</strong><br>'
          + '1. Composez <strong>*126#</strong> sur votre téléphone MTN<br>'
          + '2. Sélectionnez <strong>"Payer marchand"</strong><br>'
          + '3. Entrez le numéro marchand : <strong class="mtn-num">683 39 22 68</strong><br>'
          + '4. Entrez le montant : <strong id="pay-montant">0 FCFA</strong><br>'
          + '5. Entrez votre code secret et validez<br><br>'
          + 'Vous recevrez un <strong>SMS de confirmation</strong> et notre équipe vous contactera.';
      } else if(mode === 'orange') {
        payInst2.innerHTML = '<strong>Comment payer Orange Money :</strong><br>'
          + '1. Composez <strong>#150#</strong> sur votre téléphone Orange<br>'
          + '2. Sélectionnez <strong>"Paiement marchand"</strong><br>'
          + '3. Entrez le numéro marchand : <strong class="orange-num">693 59 14 79</strong><br>'
          + '4. Entrez le montant : <strong id="pay-montant">0 FCFA</strong><br>'
          + '5. Entrez votre code secret et validez<br><br>'
          + 'Vous recevrez un <strong>SMS de confirmation</strong> et notre équipe vous contactera.';
      } else if(mode === 'yoomee') {
        payInst2.innerHTML = '<strong>Comment payer Yoomee Money :</strong><br>'
          + '1. Ouvrez votre application <strong>Yoomee</strong><br>'
          + '2. Sélectionnez <strong>"Envoyer de l\'argent"</strong><br>'
          + '3. Entrez le numéro : <strong>683 39 22 68</strong><br>'
          + '4. Entrez le montant : <strong id="pay-montant">0 FCFA</strong><br>'
          + '5. Validez avec votre code PIN<br><br>'
          + 'Vous recevrez un <strong>SMS de confirmation</strong>.';
      }
      var elM = document.getElementById('pay-montant');
      var total = getTotal();
      if(elM) elM.textContent = fmt(total);
    }
    // Focus automatique sur le champ numéro
    var inp = document.getElementById('pay-num');
    if(inp) setTimeout(function(){ inp.focus(); inp.scrollIntoView({ behavior:'smooth', block:'center' }); }, 200);
  }
  // Mettre à jour montant
  var el1 = document.getElementById('pay-montant');
  var el2 = document.getElementById('pay-montant-esp');
  var total = getTotal();
  if(el1) el1.textContent = fmt(total);
  if(el2) el2.textContent = fmt(total);
}


// Effacer l'erreur quand l'utilisateur commence à taper
function clearPayNumError() {
  var inp = document.getElementById('pay-num');
  var wrap = document.getElementById('pay-num-wrap');
  if(inp) inp.style.borderColor = '#e6a817';
  if(wrap){ wrap.style.borderColor='#e6a817'; wrap.style.background='#fff3cd'; }
}

// ════════ CONFIRMER COMMANDE ════════
function confirmerCommande(){
  try {
  var prenom   = document.getElementById('cli-prenom').value.trim();
  var nom      = document.getElementById('cli-nom').value.trim();
  var tel      = document.getElementById('cli-tel').value.trim();
  var ville    = document.getElementById('cli-ville').value;
  var adresse  = document.getElementById('cli-adresse').value.trim();
  var smChoice = document.getElementById('cli-sm').value;
  var notes    = document.getElementById('cli-notes').value.trim();
  var payNum   = (payMode === 'especes' || payMode === 'carte') ? '' : document.getElementById('pay-num').value.trim();
  var carteEmail = payMode === 'carte' ? document.getElementById('carte-email').value.trim() : '';

  if (payMode === 'carte' && (!carteEmail || !carteEmail.includes('@'))) {
    btoast('Entrez une adresse email valide pour le paiement par carte', 'error');
    var elCE = document.getElementById('carte-email');
    if (elCE) elCE.style.borderColor = '#ef4444';
    return;
  }

  var sous_total = panier.reduce(function(s,x){ return s+x.prix*x.qte; }, 0);
  var liv_tarif  = getTarifLiv();
  var gratuit    = sous_total >= 50000 && (liv_tarif===2000||liv_tarif===3500);
  if(gratuit) liv_tarif = 0;

  // Générer numéro commande
  cmdNumero = '#CM-' + Date.now().toString().slice(-6);
  var maintenant = new Date();
  var dateStr = maintenant.toLocaleDateString('fr-FR') + ' à ' + maintenant.toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'});

  // Créer objet commande
var _livTarif   = (promoAppliquee && promoAppliquee.promo.type === 'livraison') ? 0 : liv_tarif;
  var _reduction  = (promoAppliquee && promoAppliquee.promo.type !== 'livraison') ? (promoAppliquee.reduction || 0) : 0;
  var totalFinal  = sous_total + _livTarif - _reduction;
  // ── Calcul de la commission KAMER360 ──
  var commissionInfo = calculerCommissionKamer360(panier, totalFinal);

  var commande = {
    id:          cmdNumero,
    date:        dateStr,
    client:      prenom + ' ' + nom,
    tel:         tel,
    ville:       ville,
    adresse:     adresse,
    supermarche: smChoice,
    paiement:    payMode === 'mtn' ? 'MTN Mobile Money ('+payNum+')' : payMode === 'orange' ? 'Orange Money ('+payNum+')' : payMode === 'yoomee' ? 'Yoomee Money ('+payNum+')' : payMode === 'virement' ? 'Virement bancaire' : payMode === 'carte' ? 'Carte bancaire ('+carteEmail+')' : 'Espèces à la livraison',
    items:       panier.slice(),
    sous_total:  sous_total,
    livraison:   _livTarif,
    total:       totalFinal,
    statut:      'en_attente',
    notes:       notes,
    source:      'boutique_en_ligne',
    // ── Code promo appliqué ──
    promo_code:      promoAppliquee ? promoAppliquee.code : null,
    promo_reduction: _reduction,
    // ── Commission marketplace ──
    commission_taux:    commissionInfo.taux,
    commission_montant: commissionInfo.montant,
    montant_net_gerant: commissionInfo.montantNet
  };

  // ── Sauvegarder commande en localStorage ──
  try {
    var cmds = JSON.parse(localStorage.getItem('sm_commandes') || '[]');
    cmds.unshift(commande);
    localStorage.setItem('sm_commandes', JSON.stringify(cmds));
  } catch(e) { console.warn('localStorage:', e); }

  // ── Notifier l'admin ──
  try {
    var notifsAdmin = JSON.parse(localStorage.getItem('sm_notifs_admin') || '[]');
    notifsAdmin.unshift({
      type:    'nouvelle_commande',
      msg:     '\uD83D\uDED2 Nouvelle commande ' + commande.id + ' — ' + commande.client + ' — ' + commande.total.toLocaleString('fr-FR') + ' FCFA',
      couleur: 'green',
      date:    new Date().toLocaleString('fr-FR'),
      lu:      false
    });
    localStorage.setItem('sm_notifs_admin', JSON.stringify(notifsAdmin));
  } catch(e) { _logErr("boutique.js", e); }

  // ── SMS via Railway backend ──
  fetch('https://kamer360-backend-production.up.railway.app/sms/commande', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tel:   commande.tel,
      client: commande.client.split(' ')[0],
      id:    commande.id,
      total: commande.total,
      items: commande.items.map(function(i){ return i.qte + 'x ' + i.nom; }).join(', ')
    })
  }).catch(function(){});

  // ── SMS alerte gérant ──
  fetch('https://kamer360-backend-production.up.railway.app/sms/custom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tel: '237693591479',
      message: '\uD83D\uDED2 Nouvelle commande ' + commande.id + ' — ' + commande.client + ' — ' + commande.total.toLocaleString() + ' FCFA — ' + commande.ville
    })
  }).catch(function(){});

  // ── Points fidélité ──
  if (typeof ajouterPoints === 'function' && commande.tel) {
    ajouterPoints(commande.tel, commande.client, commande.total, commande.id);
  }

  // ── Enregistrer la commission KAMER360 pour suivi des revenus ──
  _enregistrerCommissionSupabase(commande);

  // ── Sauvegarder la commande localement (avant tout traitement paiement) ──
  try {
    var mesCmds = JSON.parse(localStorage.getItem('sm_mes_commandes') || '[]');
    mesCmds.unshift(commande);
    localStorage.setItem('sm_mes_commandes', JSON.stringify(mesCmds));
  } catch(e) {}

  // ── Tout le paiement se fait DANS l'app — aucune redirection externe ──
  if (payMode === 'carte') {
    ouvrirPaiementEmbedCarte(commande, carteEmail);
    return;
  }
  if (payMode === 'mtn' || payMode === 'orange' || payMode === 'yoomee') {
    ouvrirPaiementEmbedMobile(commande, payMode, payNum);
    return;
  }

    afficherSucces(commande, payMode);
  } catch(e) {
    console.error('Erreur confirmerCommande:', e);
    btoast('Erreur : ' + e.message, 'error');
    var btnSuiv = document.getElementById('btn-suivant');
    if(btnSuiv){ btnSuiv.disabled = false; btnSuiv.textContent = 'Confirmer la commande'; }
  }
}

// ── Afficher écran de succès ──
function afficherSucces(commande, payMode) {
  // Extraire toutes les données depuis l'objet commande
  var prenom   = commande.client ? commande.client.split(' ')[0] : 'Client';
  var nom      = commande.client ? commande.client.split(' ').slice(1).join(' ') : '';
  var tel      = commande.tel || '';
  var ville    = commande.ville || '';
  var adresse  = commande.adresse || '';
  var total    = commande.total || 0;
  var dateStr  = commande.date || new Date().toLocaleDateString('fr-FR');
  var payLabel = payMode==='mtn' ? 'MTN Mobile Money' : payMode==='orange' ? 'Orange Money' : payMode==='yoomee' ? 'Yoomee Money' : payMode==='virement' ? 'Virement bancaire' : payMode==='carte' ? 'Carte bancaire' : 'Espèces à la livraison';
  cmdNumero    = commande.id;

  // ── Afficher écran succès ──
  var elNum = document.getElementById('success-num');
  if (elNum) elNum.textContent = cmdNumero;

  var elDetails = document.getElementById('success-details');
  if (elDetails) {
    elDetails.innerHTML =
      '<strong>Client :</strong> ' + commande.client + '<br>' +
      '<strong>Téléphone :</strong> ' + tel + '<br>' +
      '<strong>Livraison :</strong> ' + ville + (adresse ? ' — ' + adresse : '') + '<br>' +
      '<strong>Paiement :</strong> ' + payLabel + '<br>' +
      '<strong>Total :</strong> <span style="color:var(--g);font-weight:900">' + fmt(total) + '</span><br>' +
      '<strong>Date :</strong> ' + dateStr;
  }

  // ── Lien WhatsApp pré-rempli ──
  var msgWA = 'Bonjour KAMER360 !\n\nJe viens de passer la commande *' + cmdNumero + '*\n\n';
  msgWA += '*Client :* ' + commande.client + '\n';
  msgWA += '*Téléphone :* ' + tel + '\n';
  msgWA += '*Livraison :* ' + ville + '\n';
  msgWA += '*Produits :*\n';
  commande.items.forEach(function(item){ msgWA += '  • ' + item.nom + ' × ' + item.qte + ' = ' + fmt(item.prix * item.qte) + '\n'; });
  msgWA += '*Total :* ' + fmt(total) + '\n';
  msgWA += '*Paiement :* ' + payLabel + '\n\nMerci !';

  var lienWA = 'https://wa.me/237683392268?text=' + encodeURIComponent(msgWA);
  var elWA = document.getElementById('wa-confirm');
  if (elWA) elWA.href = lienWA;

  step = 3;
  renderStep();
  btoast('<img loading="lazy" src="https://img.icons8.com/ios/16/007A3D/checkmark.png" alt="OK" style="width:14px;height:14px;vertical-align:middle"> Commande ' + commande.id + ' enregistrée avec succès !', 'success');
}

// ── Réinitialiser boutique après commande ──
function resetBoutique(){
  panier = [];
  updateCart();
  renderProduits();
  closeCmdModal();
  step = 1;
}

// ════════ TOAST ════════
function btoast(msg, type){
  var tw = document.getElementById('btw');
  var t  = document.createElement('div');
  t.className = 'btst ' + (type||'');
  t.innerHTML = (type==='success'?'<img loading="lazy" src="https://img.icons8.com/ios/18/007A3D/checkmark.png" alt="ok" style="width:14px;height:14px;vertical-align:middle">':type==='error'?'<img loading="lazy" src="https://img.icons8.com/ios/18/CE1126/delete-sign.png" alt="fermer" style="width:14px;height:14px;vertical-align:middle">':'!')+'  '+msg;
  tw.appendChild(t);
  setTimeout(function(){ t.remove(); }, 3500);
}

// ════════ INIT ════════
document.addEventListener('DOMContentLoaded', function(){
  chargerStoresBoutique();
  appliquerConfigBoutique();
  chargerProduitsDepuisSupabase();  // charge Supabase puis appelle renderProduits()
  updateCart();

  // Recalculer livraison si ville change
  var villeEl = document.getElementById('cli-ville');
  if(villeEl){
    villeEl.addEventListener('change', function(){
      var adrWrap = document.getElementById('adresse-wrap');
      if(adrWrap) adrWrap.style.display = this.value==='Retrait magasin' ? 'none' : 'flex';
    });
  }
});

// ═══════════════════════════════════════════════════════
//  COMPTE CLIENT — Connexion, Inscription, Profil
//  Stockage : Supabase (table clients_boutique) + localStorage
// ═══════════════════════════════════════════════════════

var CLIENT_COURANT = null;

function _sbBoutique() {
  if (typeof window.supabase === 'undefined') return null;
  try {
    return window.supabase.createClient(
      'https://mtlvkkhjabqgbohkmajn.supabase.co',
      'sb_publishable_Z_sEmjWwXRe4Kq7NOCb90Q_6VoNQ5OO'
    );
  } catch(e) { return null; }
}

function initCompteClient() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_client_courant') || 'null');
    if (saved) {
      CLIENT_COURANT = saved;
      mettreAJourBoutonCompte();
    }
  } catch(e) { _logErr("boutique.js", e); }
}

// Sauvegarder dans Supabase + localStorage
async function sauvegarderClientSupabase(client) {
  // localStorage toujours
  try {
    var clients = JSON.parse(localStorage.getItem('sm_clients') || '[]');
    var idx = clients.findIndex(function(c){ return c.email === client.email; });
    if (idx >= 0) clients[idx] = client; else clients.push(client);
    localStorage.setItem('sm_clients', JSON.stringify(clients));
  } catch(e) { _logErr("boutique.js", e); }
  // Supabase — inclure le mot de passe pour connexion multi-appareils
  try {
    var sb = _sbBoutique(); if (!sb) return;
    await sb.from('clients_boutique').upsert({
      id:               client.id,
      nom:              client.nom,
      tel:              client.tel,
      email:            client.email,
      pwd_hash:         client.pwd || '',
      adresse:          client.adresse || '',
      ville:            client.ville || '',
      points:           client.points || 0,
      total_achats:     client.total_achats || 0,
      nb_commandes:     client.nb_commandes || 0,
      date_inscription: client.date || new Date().toLocaleDateString('fr-FR')
    }, { onConflict: 'email' });
    console.log('[Client] Sauvegardé dans Supabase:', client.email);
  } catch(e) { console.warn('[Client] Supabase save:', e); }
}

// Chercher un client dans Supabase
async function trouverClientSupabase(email, pwd) {
  try {
    var sb = _sbBoutique(); if (!sb) return null;
    var res = await sb.from('clients_boutique')
      .select('*').eq('email', email).single();
    if (res.data) {
      var data = res.data;
      // Vérifier mot de passe depuis Supabase (multi-appareils)
      if (data.pwd_hash && data.pwd_hash === pwd) {
        // Mettre à jour localStorage avec les données Supabase
        var clients = JSON.parse(localStorage.getItem('sm_clients') || '[]');
        var idx = clients.findIndex(function(c){ return c.email === email; });
        var client = Object.assign({}, data, { pwd: pwd });
        if (idx >= 0) clients[idx] = client; else clients.push(client);
        localStorage.setItem('sm_clients', JSON.stringify(clients));
        return client;
      }
      // Vérifier aussi en localStorage (compatibilité anciens comptes)
      var clients2 = JSON.parse(localStorage.getItem('sm_clients') || '[]');
      var local = clients2.find(function(c){ return c.email === email; });
      if (local && local.pwd === pwd) {
        // Mettre à jour Supabase avec le pwd
        try {
          var sb2 = _sbBoutique();
          if (sb2) await sb2.from('clients_boutique').update({ pwd_hash: pwd }).eq('email', email);
        } catch(e2) { _logErr("boutique.js", e2); }
        return Object.assign({}, data, { pwd: pwd });
      }
    }
  } catch(e) { console.warn('[Client] Supabase find:', e); }
  return null;
}

function sauvegarderClients(clients) {
  try { localStorage.setItem('sm_clients', JSON.stringify(clients)); } catch(e) { _logErr("boutique.js", e); }
}

function getClients() {
  try { return JSON.parse(localStorage.getItem('sm_clients') || '[]'); } catch(e) { return []; }
}

function ouvrirCompteClient() {
  var modal = document.getElementById('modal-compte-client');
  if (modal) modal.style.display = 'flex';
  if (CLIENT_COURANT) {
    afficherVueClient('profil');
  } else {
    afficherVueClient('login');
  }
}

function fermerCompteClient() {
  var modal = document.getElementById('modal-compte-client');
  if (modal) modal.style.display = 'none';
}

function afficherVueClient(vue) {
  var vues = ['login', 'register', 'profil'];
  vues.forEach(function(v) {
    var el = document.getElementById('vue-' + v + '-client');
    if (el) el.style.display = v === vue ? 'block' : 'none';
  });
  var titres = { login: 'Connexion', register: 'Créer un compte', profil: 'Mon Compte' };
  var titre = document.getElementById('modal-compte-titre');
  if (titre) titre.textContent = titres[vue] || 'Mon Compte';

  if (vue === 'profil') chargerProfilClient();
}

async function connecterClient() {
  var email = document.getElementById('cli-login-email').value.trim();
  var pwd   = document.getElementById('cli-login-pwd').value.trim();
  var err   = document.getElementById('cli-login-err');

  if (!email || !pwd) {
    err.textContent = 'Veuillez remplir tous les champs.';
    err.style.display = 'block'; return;
  }

  // 1. Chercher en local d'abord
  var clients = getClients();
  var client = clients.find(function(c) { return c.email === email && c.pwd === pwd; });

  // 2. Si pas trouvé en local, chercher dans Supabase
  if (!client) {
    err.textContent = 'Vérification en cours...';
    err.style.display = 'block';
    client = await trouverClientSupabase(email, pwd);
    if (client) {
      // Sauvegarder en local pour les prochaines fois
      var clients2 = getClients();
      if (!clients2.find(function(c){ return c.email === email; })) {
        clients2.push(client);
        sauvegarderClients(clients2);
      }
    }
  }

  if (!client) {
    err.textContent = 'Email ou mot de passe incorrect.';
    err.style.display = 'block'; return;
  }

  err.style.display = 'none';
  CLIENT_COURANT = client;
  try { localStorage.setItem('sm_client_courant', JSON.stringify(client)); } catch(e) { _logErr("boutique.js", e); }
  mettreAJourBoutonCompte();
  afficherVueClient('profil');
  bToast('Bienvenue ' + client.nom + ' !', 'success');
}

async function inscrireClient() {
  var nom     = document.getElementById('cli-reg-nom').value.trim();
  var tel     = document.getElementById('cli-reg-tel').value.trim();
  var email   = document.getElementById('cli-reg-email').value.trim();
  var adresse = document.getElementById('cli-reg-adresse').value.trim();
  var pwd     = document.getElementById('cli-reg-pwd').value.trim();
  var err     = document.getElementById('cli-reg-err');

  if (!nom || !tel || !email || !pwd) {
    err.textContent = 'Veuillez remplir tous les champs obligatoires (*).';
    err.style.display = 'block'; return;
  }
  if (pwd.length < 6) {
    err.textContent = 'Le mot de passe doit faire au moins 6 caractères.';
    err.style.display = 'block'; return;
  }

  // Vérifier si email déjà utilisé (local + Supabase)
  var clients = getClients();
  if (clients.find(function(c) { return c.email === email; })) {
    err.textContent = 'Un compte existe déjà avec cet email.';
    err.style.display = 'block'; return;
  }

  // Vérifier dans Supabase
  try {
    var sb = _sbBoutique();
    if (sb) {
      var check = await sb.from('clients_boutique').select('email').eq('email', email).single();
      if (check.data) {
        err.textContent = 'Un compte existe déjà avec cet email.';
        err.style.display = 'block'; return;
      }
    }
  } catch(e) { _logErr("boutique.js", e); }

  var newClient = {
    id:       'CLI-' + Date.now(),
    nom:      nom,
    tel:      tel,
    email:    email,
    adresse:  adresse,
    pwd:      pwd,
    points:   0,
    date:     new Date().toLocaleDateString('fr-FR'),
    commandes: []
  };

  // Sauvegarder en local + Supabase
  clients.push(newClient);
  sauvegarderClients(clients);
  await sauvegarderClientSupabase(newClient);

  // Notifier l'admin via Supabase notifications + postMessage cross-tab
  try {
    var sbN = _sbBoutique();
    if (sbN) {
      await sbN.from('notifications').insert({
        message: '🧑 Nouveau client inscrit : ' + nom + ' (' + tel + ') — ' + email,
        type: 'info'
      });
    }
  } catch(e) { _logErr("boutique.js", e); }
  // Signal cross-tab pour que le dashboard se rafraîchisse immédiatement
  try {
    localStorage.setItem('sm_nouveau_client', JSON.stringify({ nom: nom, tel: tel, ts: Date.now() }));
    localStorage.removeItem('sm_nouveau_client');
  } catch(e) { _logErr("boutique.js", e); }

  CLIENT_COURANT = newClient;
  try { localStorage.setItem('sm_client_courant', JSON.stringify(newClient)); } catch(e) { _logErr("boutique.js", e); }
  mettreAJourBoutonCompte();
  afficherVueClient('profil');
  bToast('Compte créé avec succès ! Bienvenue ' + nom, 'success');

  // SMS bienvenue
  if (tel) {
    fetch('https://kamer360-backend-production.up.railway.app/sms/custom', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ tel: tel, message: 'Bienvenue '+nom+' sur KAMER360 ! Profitez de nos offres et livraisons partout au Cameroun. Vos achats = des points fidélité !' })
    }).catch(function(){});
  }
}

function deconnecterClient() {
  CLIENT_COURANT = null;
  try { localStorage.removeItem('sm_client_courant'); } catch(e) { _logErr("boutique.js", e); }
  mettreAJourBoutonCompte();
  fermerCompteClient();
  bToast('Vous êtes déconnecté', 'info');
}

function ouvrirCompteClient() {
  var modal = document.getElementById('modal-compte-client');
  if (modal) modal.style.display = 'flex';
  if (CLIENT_COURANT) {
    afficherVueClient('profil');
  } else {
    afficherVueClient('login');
  }
}

function fermerCompteClient() {
  var modal = document.getElementById('modal-compte-client');
  if (modal) modal.style.display = 'none';
}

function afficherVueClient(vue) {
  var vues = ['login', 'register', 'profil'];
  vues.forEach(function(v) {
    var el = document.getElementById('vue-' + v + '-client');
    if (el) el.style.display = v === vue ? 'block' : 'none';
  });
  var titres = { login: 'Connexion', register: 'Créer un compte', profil: 'Mon Compte' };
  var titre = document.getElementById('modal-compte-titre');
  if (titre) titre.textContent = titres[vue] || 'Mon Compte';

  if (vue === 'profil') chargerProfilClient();
}

function connecterClient() {
  var email = document.getElementById('cli-login-email').value.trim();
  var pwd   = document.getElementById('cli-login-pwd').value.trim();
  var err   = document.getElementById('cli-login-err');

  if (!email || !pwd) {
    err.textContent = 'Veuillez remplir tous les champs.';
    err.style.display = 'block'; return;
  }

  var clients = getClients();
  var client = clients.find(function(c) { return c.email === email && c.pwd === pwd; });

  if (!client) {
    err.textContent = 'Email ou mot de passe incorrect.';
    err.style.display = 'block'; return;
  }

  err.style.display = 'none';
  CLIENT_COURANT = client;
  try { localStorage.setItem('sm_client_courant', JSON.stringify(client)); } catch(e) { _logErr("boutique.js", e); }
  mettreAJourBoutonCompte();
  afficherVueClient('profil');
  bToast('Bienvenue ' + client.nom + ' !', 'success');
}

function inscrireClient() {
  var nom     = document.getElementById('cli-reg-nom').value.trim();
  var tel     = document.getElementById('cli-reg-tel').value.trim();
  var email   = document.getElementById('cli-reg-email').value.trim();
  var adresse = document.getElementById('cli-reg-adresse').value.trim();
  var pwd     = document.getElementById('cli-reg-pwd').value.trim();
  var err     = document.getElementById('cli-reg-err');

  if (!nom || !tel || !email || !pwd) {
    err.textContent = 'Veuillez remplir tous les champs obligatoires (*).';
    err.style.display = 'block'; return;
  }
  if (pwd.length < 6) {
    err.textContent = 'Le mot de passe doit faire au moins 6 caractères.';
    err.style.display = 'block'; return;
  }

  var clients = getClients();
  if (clients.find(function(c) { return c.email === email; })) {
    err.textContent = 'Un compte existe déjà avec cet email.';
    err.style.display = 'block'; return;
  }

  var newClient = {
    id:       'CLI-' + Date.now(),
    nom:      nom,
    tel:      tel,
    email:    email,
    adresse:  adresse,
    pwd:      pwd,
    points:   0,
    date:     new Date().toLocaleDateString('fr-FR'),
    commandes: []
  };

  clients.push(newClient);
  sauvegarderClients(clients);

  // ── Notifier l'admin ──
  try {
    var notifs = JSON.parse(localStorage.getItem('sm_notifs_admin') || '[]');
    notifs.unshift({
      type: 'nouveau_client',
      msg: 'Nouveau client inscrit : ' + nom + ' (' + tel + ')',
      email: email,
      date: new Date().toLocaleString('fr-FR'),
      lu: false
    });
    localStorage.setItem('sm_notifs_admin', JSON.stringify(notifs));
  } catch(e) { _logErr("boutique.js", e); }

  CLIENT_COURANT = newClient;
  try { localStorage.setItem('sm_client_courant', JSON.stringify(newClient)); } catch(e) { _logErr("boutique.js", e); }
  mettreAJourBoutonCompte();
  afficherVueClient('profil');
  bToast('Compte créé avec succès ! Bienvenue ' + nom, 'success');

  // SMS bienvenue
  if (tel) {
    fetch('https://kamer360-backend-production.up.railway.app/sms/custom', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ tel: tel, message: 'Bienvenue '+nom+' sur KAMER360 ! <img loading="lazy" src="https://img.icons8.com/ios/16/007A3D/confetti.png" alt="Celebration" style="width:14px;height:14px;vertical-align:middle"> Profitez de nos offres et livraisons partout au Cameroun. Vos achats = des points fidélité !' })
    }).catch(function(){});
  }
}

function deconnecterClient() {
  CLIENT_COURANT = null;
  try { localStorage.removeItem('sm_client_courant'); } catch(e) { _logErr("boutique.js", e); }
  mettreAJourBoutonCompte();
  fermerCompteClient();
  bToast('Vous êtes déconnecté', 'info');
}

function chargerProfilClient() {
  if (!CLIENT_COURANT) return;
  var c = CLIENT_COURANT;

  var avatar = document.getElementById('cli-avatar');
  if (avatar) avatar.textContent = c.nom.charAt(0).toUpperCase();

  var nom = document.getElementById('cli-profil-nom');
  if (nom) nom.textContent = c.nom;

  var email = document.getElementById('cli-profil-email');
  if (email) email.textContent = c.email;

  var tel = document.getElementById('cli-profil-tel');
  if (tel) tel.textContent = c.tel;

  var points = document.getElementById('cli-profil-points');
  if (points) points.textContent = c.points || 0;

  // Commandes du client
  var cmdEl = document.getElementById('cli-mes-commandes');
  if (cmdEl) {
    var mesCmds = [];
    try {
      var toutes = JSON.parse(localStorage.getItem('sm_commandes') || '[]');
      mesCmds = toutes.filter(function(cmd) {
        return cmd.tel === c.tel || cmd.email === c.email;
      }).slice(0, 5);
    } catch(e) { _logErr("boutique.js", e); }

    if (mesCmds.length === 0) {
      cmdEl.innerHTML = '<p style="color:#999;font-size:13px;text-align:center;padding:10px">Aucune commande pour l\'instant</p>';
    } else {
      var statutColors = { en_attente:'#f59e0b', confirmee:'#3b82f6', livraison:'#8b5cf6', livree:'#007A3D', annulee:'#ef4444' };
      var statutLabels = { en_attente:'En attente', confirmee:'Confirmée', livraison:'En route', livree:'Livrée', annulee:'Annulée' };
      cmdEl.innerHTML = mesCmds.map(function(cmd) {
        var couleur = statutColors[cmd.statut] || '#999';
        var label   = statutLabels[cmd.statut] || cmd.statut;
        return '<div style="border:1px solid #e5e7eb;border-radius:10px;padding:10px;margin-bottom:8px">'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
          + '<div>'
          + '<div style="font-weight:700;font-size:13px">' + cmd.id + '</div>'
          + '<div style="font-size:12px;color:#666">' + cmd.date + '</div>'
          + '</div>'
          + '<div style="text-align:right">'
          + '<div style="font-weight:700;color:#007A3D">' + (cmd.total||0).toLocaleString('fr-FR') + ' FCFA</div>'
          + '<span style="background:' + couleur + ';color:#fff;padding:2px 8px;border-radius:20px;font-size:11px">' + label + '</span>'
          + '</div></div></div>';
      }).join('');
    }
  }
}

function mettreAJourBoutonCompte() {
  var btn = document.getElementById('btn-compte-txt');
  if (!btn) return;
  if (CLIENT_COURANT) {
    btn.textContent = CLIENT_COURANT.nom.split(' ')[0];
  } else {
    btn.textContent = 'Mon compte';
  }
}

function bToast(msg, type) {
  var colors = { success:'#007A3D', error:'#ef4444', info:'#3b82f6', warning:'#f59e0b' };
  var div = document.createElement('div');
  div.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:' + (colors[type]||'#333') + ';color:#fff;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,0.2)';
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(function() { div.style.opacity='0'; div.style.transition='opacity 0.3s'; setTimeout(function(){ div.remove(); }, 300); }, 3000);
}

// Fermer modal en cliquant dehors
document.addEventListener('click', function(e) {
  var modal = document.getElementById('modal-compte-client');
  if (modal && e.target === modal) fermerCompteClient();
});

// Init au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCompteClient);
} else {
  initCompteClient();
}

// ═══════════════════════════════════════════════════════
//  RÉSERVATION SERVICES DEPUIS LA BOUTIQUE
// ═══════════════════════════════════════════════════════
function ouvrirReservationService(type) {
  var modal = document.getElementById('modal-service-boutique');
  var titre = document.getElementById('modal-svc-titre');
  var contenu = document.getElementById('modal-svc-contenu');
  if (!modal || !titre || !contenu) return;

  var configs = {
    coiffure: {
      titre: '<img loading="lazy" src="https://img.icons8.com/ios/16/007A3D/scissors.png" alt="Coiffure" style="width:14px;height:14px;vertical-align:middle"> Réserver — Salon de Coiffure',
      services: [
        { nom:'Tresses classiques', prix:3500, duree:'2h' },
        { nom:'Tresses collées', prix:5000, duree:'3h' },
        { nom:'Tissage simple', prix:8000, duree:'1h30' },
        { nom:'Tissage avec frontal', prix:15000, duree:'2h' },
        { nom:'Défrisage complet', prix:6000, duree:'1h30' },
        { nom:'Coupe simple homme', prix:1500, duree:'30min' },
        { nom:'Coupe + barbe', prix:2500, duree:'45min' },
        { nom:'Coloration', prix:12000, duree:'2h' },
        { nom:'Soin kératine', prix:18000, duree:'2h30' },
        { nom:'Forfait mariage', prix:45000, duree:'4h' },
      ]
    },
    pressing: {
      titre: '<img loading="lazy" src="https://img.icons8.com/ios/16/007A3D/shirt.png" alt="Pressing" style="width:14px;height:14px;vertical-align:middle"> Déposer — Pressing & Blanchisserie',
      services: [
        { nom:'Chemise / Blouse', prix:500, duree:'par pièce' },
        { nom:'Pantalon / Jupe', prix:700, duree:'par pièce' },
        { nom:'Costume complet', prix:2500, duree:'par pièce' },
        { nom:'Robe simple', prix:1000, duree:'par pièce' },
        { nom:'Robe de soirée', prix:3500, duree:'par pièce' },
        { nom:'Pagne (2 yards)', prix:800, duree:'par pièce' },
        { nom:'Manteau / Veste', prix:2000, duree:'par pièce' },
        { nom:'Linge de maison', prix:600, duree:'par kg' },
        { nom:'Nettoyage à sec', prix:1500, duree:'par kg' },
      ]
    },
    auto: {
      titre: '<img loading="lazy" src="https://img.icons8.com/ios/16/007A3D/car.png" alt="Auto" style="width:14px;height:14px;vertical-align:middle"> RDV Mécanicien',
      services: [
        { nom:'Vidange huile moteur', prix:15000, duree:'1h' },
        { nom:'Changement filtres', prix:8000, duree:'45min' },
        { nom:'Remplacement plaquettes frein', prix:25000, duree:'1h30' },
        { nom:'Diagnostic électronique', prix:10000, duree:'1h' },
        { nom:'Lavage auto complet', prix:5000, duree:'1h' },
        { nom:'Remplacement bougies', prix:12000, duree:'1h' },
        { nom:'Réparation crevaison', prix:3000, duree:'30min' },
        { nom:'Changement pneus x4', prix:20000, duree:'1h' },
      ]
    },
    menuiserie: {
      titre: '🪵 Commander — Menuiserie & Bois',
      services: [
        { nom:'Planche bois Okoumé 2m', prix:3500, duree:'unité' },
        { nom:'Contreplaqué 12mm', prix:18000, duree:'feuille' },
        { nom:'Vis à bois x100', prix:1500, duree:'boîte' },
        { nom:'Colle à bois 1L', prix:4500, duree:'litre' },
        { nom:'Vernis bois acajou 1L', prix:6500, duree:'litre' },
        { nom:'Peinture bois blanche 1L', prix:5500, duree:'litre' },
        { nom:'Charnière porte x4', prix:2500, duree:'lot' },
        { nom:'Poignée de porte x2', prix:3500, duree:'lot' },
      ]
    },
    restauration: {
      titre: '<img loading="lazy" src="https://img.icons8.com/ios/20/007A3D/restaurant.png" alt="Restauration" style="width:22px;height:22px;vertical-align:middle"> Commander — Restauration & Food',
      services: [
        { nom:'Ndolé complet', prix:2500, duree:'livraison 30 min' },
        { nom:'Poulet DG', prix:3500, duree:'livraison 30 min' },
        { nom:'Brochettes bœuf x5', prix:1500, duree:'livraison 20 min' },
        { nom:'Soya x5 bâtons', prix:1000, duree:'livraison 20 min' },
        { nom:'Alloco portion', prix:500, duree:'livraison 20 min' },
        { nom:'Gâteau chocolat', prix:800, duree:'livraison 25 min' },
        { nom:'Menu complet traiteur', prix:5000, duree:'sur commande' },
      ]
    },
    energie: {
      titre: '<img loading="lazy" src="https://img.icons8.com/ios/20/007A3D/lightning-bolt.png" alt="Energie" style="width:22px;height:22px;vertical-align:middle"> Devis — Énergie & Solaire',
      services: [
        { nom:'Kit solaire 100W maison', prix:150000, duree:'installation 2 jours' },
        { nom:'Kit solaire 300W complet', prix:350000, duree:'installation 3 jours' },
        { nom:'Groupe électrogène 2.5KVA', prix:185000, duree:'livraison 24h' },
        { nom:'Onduleur UPS 650VA', prix:35000, duree:'livraison 24h' },
        { nom:'Climatiseur 1CV + pose', prix:220000, duree:'installation 1 jour' },
        { nom:'Simulation kit gratuite', prix:0, duree:'en ligne' },
      ]
    },
    sante: {
      titre: '<img loading="lazy" src="https://img.icons8.com/ios/20/CE1126/hospital.png" alt="Sante" style="width:22px;height:22px;vertical-align:middle"> RDV — Santé & Médical',
      services: [
        { nom:'Médecine générale', prix:5000, duree:'RDV même jour' },
        { nom:'Pédiatrie', prix:8000, duree:'RDV sous 24h' },
        { nom:'Gynécologie', prix:10000, duree:'RDV sous 24h' },
        { nom:'Cardiologie', prix:15000, duree:'RDV sous 48h' },
        { nom:'Ophtalmologie', prix:8000, duree:'RDV même jour' },
        { nom:'Urgences (SAMU)', prix:0, duree:'Appel : 15' },
      ]
    },
    btp: {
      titre: '<img loading="lazy" src="https://img.icons8.com/ios/20/007A3D/building-under-construction.png" alt="BTP" style="width:22px;height:22px;vertical-align:middle"> Devis — BTP & Construction',
      services: [
        { nom:'Ciment CPA 42.5 sac 50kg', prix:6500, duree:'livraison 24h' },
        { nom:'Fer à béton 10mm x12m', prix:5500, duree:'livraison 24h' },
        { nom:'Carrelage sol 60x60 (m2)', prix:6500, duree:'livraison 48h' },
        { nom:'Peinture intérieure 20L', prix:25000, duree:'livraison 24h' },
        { nom:'Devis maçonnerie', prix:0, duree:'sous 24h' },
        { nom:'Devis carrelage', prix:0, duree:'sous 24h' },
      ]
    },
    agriculture: {
      titre: '<img loading="lazy" src="https://img.icons8.com/ios/20/007A3D/plant-under-sun.png" alt="Agriculture" style="width:22px;height:22px;vertical-align:middle"> Commander — Agriculture & Élevage',
      services: [
        { nom:'Semences maïs hybride 5kg', prix:8500, duree:'livraison 48h' },
        { nom:'Engrais NPK 50kg', prix:25000, duree:'livraison 48h' },
        { nom:'Poulet chair 1 mois', prix:2500, duree:'livraison 48h' },
        { nom:'Poussin d\'un jour x10', prix:15000, duree:'livraison 48h' },
        { nom:'Pulvérisateur 16L', prix:18000, duree:'livraison 24h' },
        { nom:'Calendrier cultural (conseil)', prix:0, duree:'gratuit' },
      ]
    },
    logistique: {
      titre: '<img loading="lazy" src="https://img.icons8.com/ios/20/007A3D/box.png" alt="Logistique" style="width:22px;height:22px;vertical-align:middle"> Logistique & Livraison',
      services: [
        { nom:'Colis Douala → Yaoundé', prix:2500, duree:'4-6h' },
        { nom:'Colis Douala → Bafoussam', prix:2500, duree:'3-4h' },
        { nom:'Livraison locale ville', prix:1000, duree:'2-4h' },
        { nom:'Moto-taxi Express', prix:1500, duree:'par heure' },
        { nom:'Tricycle cargo', prix:15000, duree:'par jour' },
        { nom:'Pick-up utilitaire', prix:25000, duree:'par jour' },
      ]
    },
    education: {
      titre: '<img loading="lazy" src="https://img.icons8.com/ios/20/007A3D/book.png" alt="Education" style="width:22px;height:22px;vertical-align:middle"> Éducation & Formation',
      services: [
        { nom:'Cours Mathématiques', prix:3000, duree:'par heure' },
        { nom:'Cours Physique-Chimie', prix:3500, duree:'par heure' },
        { nom:'Cours Anglais', prix:3000, duree:'par heure' },
        { nom:'Cours Informatique', prix:5000, duree:'par heure' },
        { nom:'Fournitures scolaires', prix:0, duree:'catalogue' },
        { nom:'Uniformes scolaires', prix:8500, duree:'complet' },
      ]
    },
    immobilier: {
      titre: '<img loading="lazy" src="https://img.icons8.com/ios/20/007A3D/home.png" alt="Immobilier" style="width:22px;height:22px;vertical-align:middle"> Immobilier & Hébergement',
      services: [
        { nom:'Location appartement Douala', prix:80000, duree:'par mois' },
        { nom:'Location studio Yaoundé', prix:35000, duree:'par mois' },
        { nom:'Hôtel Le Wouri Douala', prix:35000, duree:'par nuit' },
        { nom:'Terrain à vendre Douala', prix:15000000, duree:'achat' },
        { nom:'Déposer ma recherche', prix:0, duree:'gratuit' },
      ]
    },
    meubles: {
      titre: '<img loading="lazy" src="https://img.icons8.com/ios/20/007A3D/sofa.png" alt="Meubles" style="width:22px;height:22px;vertical-align:middle"> Commander — Meubles & Décoration',
      services: [
        { nom:'Chaise plastique robuste', prix:5500, duree:'pièce' },
        { nom:'Table basse salon', prix:35000, duree:'pièce' },
        { nom:'Étagère murale 3 niveaux', prix:18000, duree:'pièce' },
        { nom:'Cadre photo 30x40cm', prix:3500, duree:'pièce' },
        { nom:'Rideau occultant 2m', prix:12000, duree:'2 pans' },
        { nom:'Coussin décoratif 45x45cm', prix:4500, duree:'pièce' },
        { nom:'Tapis salon 160x230cm', prix:28000, duree:'pièce' },
        { nom:'Miroir mural 60x80cm', prix:15000, duree:'pièce' },
        { nom:'Vase décoratif céramique', prix:6500, duree:'pièce' },
        { nom:'Lampe de chevet LED', prix:8500, duree:'pièce' },
        { nom:'Devis meuble sur mesure', prix:0, duree:'gratuit' },
      ]
    }
  };

  var cfg = configs[type];
  if (!cfg) return;
  titre.innerHTML = cfg.titre;

  contenu.innerHTML = '<div style="margin-bottom:16px">'
    + '<label style="font-size:13px;font-weight:600;color:#333;display:block;margin-bottom:6px">Votre nom *</label>'
    + '<input type="text" id="svc-nom" placeholder="Prénom et nom" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:13px;outline:none;box-sizing:border-box">'
    + '</div>'
    + '<div style="margin-bottom:16px">'
    + '<label style="font-size:13px;font-weight:600;color:#333;display:block;margin-bottom:6px">Téléphone *</label>'
    + '<input type="tel" id="svc-tel" placeholder="+237 6XX XX XX XX" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:13px;outline:none;box-sizing:border-box">'
    + '</div>'
    + (type === 'auto' ? '<div style="margin-bottom:16px"><label style="font-size:13px;font-weight:600;color:#333;display:block;margin-bottom:6px">Véhicule *</label><input type="text" id="svc-vehicule" placeholder="Ex: Toyota Corolla 2018" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:13px;outline:none;box-sizing:border-box"></div>' : '')
    + '<div style="margin-bottom:16px">'
    + '<label style="font-size:13px;font-weight:600;color:#333;display:block;margin-bottom:8px">Choisir le service *</label>'
    + '<div style="display:flex;flex-direction:column;gap:6px" id="svc-liste">'
    + cfg.services.map(function(s, i) {
        return '<label style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:10px;cursor:pointer" onclick="selectionnerSvc(this)">'
          + '<div style="display:flex;align-items:center;gap:10px">'
          + '<input type="radio" name="svc-radio" value="' + s.nom + '" style="accent-color:#007A3D">'
          + '<div><div style="font-weight:600;font-size:13px">' + s.nom + '</div><div style="font-size:11px;color:#999">' + s.duree + '</div></div>'
          + '</div>'
          + '<span style="font-weight:700;color:#007A3D;font-size:13px">' + s.prix.toLocaleString('fr-FR') + ' F</span>'
          + '</label>';
      }).join('')
    + '</div></div>'
    + '<div style="margin-bottom:20px">'
    + '<label style="font-size:13px;font-weight:600;color:#333;display:block;margin-bottom:6px">Message / Notes</label>'
    + '<textarea id="svc-notes" placeholder="Précisions, demandes spéciales..." style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:13px;outline:none;box-sizing:border-box;min-height:70px;resize:none"></textarea>'
    + '</div>'
    + '<button onclick="envoyerDemandeService(\'' + type + '\')" style="width:100%;background:#007A3D;color:#fff;border:none;padding:14px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer">Envoyer ma demande via WhatsApp</button>'
    + '<p style="text-align:center;font-size:11px;color:#999;margin-top:10px">Vous serez contacté dans les 2h pour confirmation</p>';

  modal.style.display = 'flex';
}

function selectionnerSvc(label) {
  document.querySelectorAll('#svc-liste label').forEach(function(l){
    l.style.border = '1.5px solid #e5e7eb';
    l.style.background = '#fff';
  });
  label.style.border = '1.5px solid #007A3D';
  label.style.background = '#f0faf5';
  var radio = label.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
}

function fermerModalService() {
  var modal = document.getElementById('modal-service-boutique');
  if (modal) modal.style.display = 'none';
}

function envoyerDemandeService(type) {
  var nom      = (document.getElementById('svc-nom')     || {}).value || '';
  var tel      = (document.getElementById('svc-tel')     || {}).value || '';
  var vehicule = (document.getElementById('svc-vehicule')|| {}).value || '';
  var notes    = (document.getElementById('svc-notes')   || {}).value || '';
  var radio    = document.querySelector('input[name="svc-radio"]:checked');
  var service  = radio ? radio.value : '';

  if (!nom)     { alert('Veuillez entrer votre nom'); return; }
  if (!tel)     { alert('Veuillez entrer votre téléphone'); return; }
  if (!service) { alert('Veuillez choisir un service'); return; }

  var typeLabels = { coiffure:'Coiffure', pressing:'Pressing', auto:'Mécanicien', menuiserie:'Menuiserie' };
  var msg = 'Bonjour KAMER360, je souhaite réserver un service.\n\n'
    + 'Service : *' + typeLabels[type] + ' — ' + service + '*\n'
    + 'Nom : ' + nom + '\n'
    + 'Téléphone : ' + tel + '\n'
    + (vehicule ? 'Véhicule : ' + vehicule + '\n' : '')
    + (notes ? 'Notes : ' + notes + '\n' : '')
    + '\nMerci !';

  var waUrl = 'https://wa.me/237683392268?text=' + encodeURIComponent(msg);
  window.open(waUrl, '_blank');
  fermerModalService();
}

// Fermer modal si clic extérieur
document.addEventListener('click', function(e) {
  var modal = document.getElementById('modal-service-boutique');
  if (modal && e.target === modal) fermerModalService();
});

// ═══════════════════════════════════════════════════════════════
//  MARKETPLACE — Ouvrir / Fermer
// ═══════════════════════════════════════════════════════════════
function ouvrirMarketplace() {
  var overlay = document.getElementById('marketplace-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  requestAnimationFrame(function() { overlay.classList.add('active'); });
  document.body.style.overflow = 'hidden';
  // Initialiser ou rafraichir la marketplace
  if (typeof initMarketplace === 'function') initMarketplace();
  if (typeof refreshMarketplace === 'function') setTimeout(refreshMarketplace, 100);
  // Activer le premier onglet
  switchMktTab('energie');
}

function fermerMarketplace() {
  var overlay = document.getElementById('marketplace-overlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  setTimeout(function() { overlay.style.display = 'none'; }, 200);
  document.body.style.overflow = '';
}

// Fermer avec la touche Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    fermerMarketplace();
    if (typeof closeMkt === 'function') {
      closeMkt('mkt-modal-devis');
      closeMkt('mkt-menu-modal');
    }
  }
});


// ════════════════════════════════════════════════════════════════
//  6 FONCTIONNALITÉS CLIENT — Navigation & Rendu
// ════════════════════════════════════════════════════════════════

function ouvrirVueClient(vue) {
  // Mettre à jour les vues disponibles
  var toutes = ['login','register','profil','wallet','tracking','avis','chat','notif','offline'];
  toutes.forEach(function(v) {
    var el = document.getElementById('vue-' + v + '-client');
    if (el) el.style.display = (v === vue) ? 'block' : 'none';
  });

  // Titre du modal
  var titres = { wallet:'KAMER Pay', tracking:'Mes Livraisons', avis:'Mes Avis',
                 chat:'Messages', notif:'Notifications', offline:'Mode Hors-ligne' };
  var titre = document.getElementById('modal-compte-titre');
  if (titre && titres[vue]) titre.textContent = titres[vue];

  // Back button
  var header = document.querySelector('#modal-compte-client .modal-back');
  if (!header) {
    // Ajouter bouton retour si absent
    var headerEl = document.querySelector('#modal-compte-client [style*="linear-gradient"]');
    if (headerEl) {
      var backBtn = document.createElement('button');
      backBtn.className = 'modal-back';
      backBtn.innerHTML = '← Retour';
      backBtn.style.cssText = 'background:rgba(255,255,255,.2);border:none;color:#fff;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;margin-right:10px';
      backBtn.onclick = function(){ ouvrirVueClient('profil'); };
      headerEl.insertBefore(backBtn, headerEl.firstChild);
    }
  }

  // Rendre le contenu de la vue
  switch(vue) {
    case 'wallet':   renderClientWallet(); break;
    case 'tracking': renderClientTracking(); break;
    case 'avis':     renderClientAvis(); break;
    case 'chat':     renderClientChat(); break;
    case 'notif':    renderClientNotif(); break;
    case 'offline':  renderClientOffline(); break;
  }
}

// ── 1. KAMER PAY CLIENT ──────────────────────────────────────
function renderClientWallet() {
  var z = document.getElementById('vue-wallet-client');
  if (!z) return;
  var solde = 0;
  var txs   = [];
  try {
    var kpData = JSON.parse(localStorage.getItem('sm_kamer_pay') || '{}');
    solde = kpData.balance || 0;
    txs   = kpData.transactions || [];
  } catch(e) { _logErr("boutique.js", e); }

  var html = "";
  // Carte solde
  html += "<div style='background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border-radius:16px;padding:20px;margin-bottom:14px'>";
  html += "<div style='font-size:12px;opacity:.8;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px'>Votre solde KAMER Pay</div>";
  html += "<div style='font-size:34px;font-weight:900;font-family:Playfair Display,serif'>" + solde.toLocaleString('fr-FR') + " <span style='font-size:16px'>FCFA</span></div>";
  html += "<div style='font-size:11px;opacity:.7;margin-top:6px'>" + (CLIENT_COURANT ? CLIENT_COURANT.nom : 'Client') + " · KAMER360</div>";
  html += "</div>";

  // Actions
  html += "<div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px'>";
  html += "<button onclick='clientRechargerWallet()' style='background:#007A3D;color:#fff;border:none;border-radius:12px;padding:14px;font-size:13px;font-weight:700;cursor:pointer'>Recharger<br><span style='font-size:10px;opacity:.8;font-weight:400'>MTN / Orange</span></button>";
  html += "<button onclick='clientPayerWallet()' style='background:#1565C0;color:#fff;border:none;border-radius:12px;padding:14px;font-size:13px;font-weight:700;cursor:pointer'>Payer<br><span style='font-size:10px;opacity:.8;font-weight:400'>Commande en cours</span></button>";
  html += "<button onclick='clientTransfererWallet()' style='background:#E65100;color:#fff;border:none;border-radius:12px;padding:14px;font-size:13px;font-weight:700;cursor:pointer;grid-column:1/-1'>Transférer à un ami ou proche</button>";
  html += "</div>";

  // Historique
  html += "<div style='font-size:13px;font-weight:700;margin-bottom:10px;color:#0F1F0F'>Historique</div>";
  if (txs.length === 0) {
    html += "<div style='text-align:center;padding:24px;color:#9ca3af'><div style='font-size:32px;margin-bottom:8px'>💳</div><div style='font-size:13px'>Aucune transaction</div></div>";
  } else {
    txs.slice(0,10).forEach(function(tx) {
      var isC = tx.type === 'credit';
      html += "<div style='display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f5f8f5'>";
      html += "<div style='width:36px;height:36px;border-radius:50%;background:" + (isC?"#f0faf5":"#fff3f3") + ";display:flex;align-items:center;justify-content:center;flex-shrink:0'>" + (isC?"↑":"↓") + "</div>";
      html += "<div style='flex:1'><div style='font-size:13px;font-weight:600'>" + (tx.libelle||tx.type) + "</div>";
      html += "<div style='font-size:11px;color:#9ca3af'>" + (tx.date||"") + "</div></div>";
      html += "<div style='font-weight:800;color:" + (isC?"#007A3D":"#CE1126") + "'>" + (isC?"+":"-") + (tx.montant||0).toLocaleString('fr-FR') + " F</div>";
      html += "</div>";
    });
  }
  z.innerHTML = html;
}

function clientRechargerWallet() {
  var montant = parseInt(prompt('Montant à recharger (FCFA):', '5000') || 0);
  if (montant <= 0) return;
  var ops = ['MTN MoMo','Orange Money'];
  var op  = ops[Math.floor(Math.random()*2)];
  bToast('Recharge ' + op + ' en cours...', 'info');
  setTimeout(function() {
    try {
      var kp = JSON.parse(localStorage.getItem('sm_kamer_pay') || '{}');
      kp.balance = (kp.balance || 0) + montant;
      if (!kp.transactions) kp.transactions = [];
      kp.transactions.unshift({ type:'credit', montant:montant, libelle:'Recharge '+op, date:new Date().toLocaleDateString('fr-FR') });
      localStorage.setItem('sm_kamer_pay', JSON.stringify(kp));
    } catch(e) { _logErr("boutique.js", e); }
    bToast(montant.toLocaleString('fr-FR') + ' FCFA rechargés !', 'success');
    renderClientWallet();
  }, 1500);
}

function clientPayerWallet() {
  var panier = typeof getPanierItems === 'function' ? getPanierItems() : [];
  var total  = panier.reduce(function(s,p){ return s + (p.prix||0)*(p.qte||1); }, 0);
  if (total === 0) { bToast('Votre panier est vide', 'warning'); return; }
  try {
    var kp = JSON.parse(localStorage.getItem('sm_kamer_pay') || '{}');
    if ((kp.balance||0) < total) { bToast('Solde insuffisant — rechargez KAMER Pay', 'error'); return; }
    kp.balance -= total;
    if (!kp.transactions) kp.transactions = [];
    kp.transactions.unshift({ type:'debit', montant:total, libelle:'Paiement commande', date:new Date().toLocaleDateString('fr-FR') });
    localStorage.setItem('sm_kamer_pay', JSON.stringify(kp));
    bToast(total.toLocaleString('fr-FR') + ' FCFA débités — Commande payée !', 'success');
    renderClientWallet();
  } catch(e) { _logErr("boutique.js", e); }
}

function clientTransfererWallet() {
  var dest    = prompt('Numéro de téléphone du destinataire:');
  if (!dest) return;
  var montant = parseInt(prompt('Montant à envoyer (FCFA):', '1000') || 0);
  if (montant <= 0) return;
  try {
    var kp = JSON.parse(localStorage.getItem('sm_kamer_pay') || '{}');
    if ((kp.balance||0) < montant) { bToast('Solde insuffisant', 'error'); return; }
    kp.balance -= montant;
    if (!kp.transactions) kp.transactions = [];
    kp.transactions.unshift({ type:'debit', montant:montant, libelle:'Transfert vers ' + dest, date:new Date().toLocaleDateString('fr-FR') });
    localStorage.setItem('sm_kamer_pay', JSON.stringify(kp));
    bToast(montant.toLocaleString('fr-FR') + ' FCFA envoyés à ' + dest, 'success');
    renderClientWallet();
  } catch(e) { _logErr("boutique.js", e); }
}

// ── 2. TRACKING CLIENT ───────────────────────────────────────
function renderClientTracking() {
  var z = document.getElementById('vue-tracking-client');
  if (!z) return;
  var livs = [];
  try { livs = JSON.parse(localStorage.getItem('km_tracking') || '[]'); } catch(e) { _logErr("boutique.js", e); }
  // Filtrer par client courant si possible
  var mesCmds = [];
  try {
    var cmds = JSON.parse(localStorage.getItem('sm_commandes') || '[]');
    var c = CLIENT_COURANT;
    mesCmds = cmds.filter(function(cmd){ return c && (cmd.tel===c.tel||cmd.email===c.email); }).map(function(cmd){ return cmd.id; });
  } catch(e) { _logErr("boutique.js", e); }

  var mes_livs = livs.filter(function(l){ return mesCmds.indexOf(l.cmdId) >= 0; });
  var html = "";

  if (mes_livs.length === 0) {
    html += "<div style='text-align:center;padding:40px 20px'>";
    html += "<div style='font-size:48px;margin-bottom:12px'>🛵</div>";
    html += "<div style='font-size:15px;font-weight:700;color:#374151;margin-bottom:8px'>Aucune livraison en cours</div>";
    html += "<div style='font-size:13px;color:#666;margin-bottom:16px'>Passez une commande pour suivre votre livreur en temps réel</div>";
    html += "<button onclick='fermerCompteClient()' style='background:#007A3D;color:#fff;border:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer'>Commander maintenant</button>";
    html += "</div>";
  } else {
    var statIcons = { preparation:"⏳", "en route":"🛵", proche:"📍", livre:"✅" };
    var statColors = { preparation:"#f59e0b", "en route":"#007A3D", proche:"#00A852", livre:"#1565C0" };
    mes_livs.forEach(function(liv) {
      var col = statColors[liv.statut] || "#666";
      html += "<div style='border:1px solid #e5e7eb;border-radius:14px;padding:16px;margin-bottom:12px'>";
      html += "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:12px'>";
      html += "<div style='font-weight:700;font-size:14px'>Commande " + liv.cmdId + "</div>";
      html += "<span style='background:" + col + ";color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px'>" + (statIcons[liv.statut]||"") + " " + liv.statut + "</span>";
      html += "</div>";
      // Carte stylisée
      html += "<div style='background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:10px;height:120px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;flex-direction:column;gap:6px'>";
      html += "<div style='font-size:32px'>" + (statIcons[liv.statut]||"📦") + "</div>";
      html += "<div style='font-size:11px;color:#2e7d32;font-weight:600'>" + liv.lat.toFixed(4) + ", " + liv.lng.toFixed(4) + "</div>";
      html += "<button onclick='window.open(\"https://maps.google.com/?q=" + liv.lat + "," + liv.lng + "\",\"_blank\")' style='background:#007A3D;color:#fff;border:none;padding:5px 12px;border-radius:20px;font-size:11px;cursor:pointer;font-weight:600'>Voir sur Google Maps</button>";
      html += "</div>";
      html += "<div style='font-size:12px;color:#666'>Livreur: " + liv.livreur + " · Mis à jour: " + liv.updated + "</div>";
      html += "</div>";
    });
  }
  z.innerHTML = html;
}

// ── 3. AVIS CLIENT ───────────────────────────────────────────
function renderClientAvis() {
  var z = document.getElementById('vue-avis-client');
  if (!z) return;
  var avis = [];
  try { avis = JSON.parse(localStorage.getItem('sm_avis_v2') || '[]'); } catch(e) { _logErr("boutique.js", e); }
  var c = CLIENT_COURANT;
  var mesAvis = c ? avis.filter(function(a){ return a.auteur && a.auteur.indexOf(c.nom) >= 0; }) : [];

  var html = "";
  html += "<button onclick='clientDonnerAvis()' style='width:100%;background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border:none;padding:14px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:16px'>+ Laisser un avis sur un service</button>";

  // Stats globales
  var moy = avis.length ? avis.reduce(function(s,a){return s+a.note;},0)/avis.length : 0;
  html += "<div style='background:#f9fafb;border-radius:12px;padding:14px;margin-bottom:14px;display:flex;align-items:center;gap:14px'>";
  html += "<div style='text-align:center'><div style='font-size:36px;font-weight:900;color:#007A3D'>" + moy.toFixed(1) + "</div>";
  html += "<div style='font-size:20px;color:#FCD116'>" + "★".repeat(Math.round(moy)) + "☆".repeat(5-Math.round(moy)) + "</div>";
  html += "<div style='font-size:11px;color:#666'>" + avis.length + " avis total</div></div>";
  html += "<div><div style='font-size:13px;font-weight:700'>Note globale des services</div>";
  html += "<div style='font-size:12px;color:#666;margin-top:4px'>Vos avis aident les autres clients à faire le bon choix.</div></div>";
  html += "</div>";

  // Mes avis
  if (mesAvis.length > 0) {
    html += "<div style='font-size:13px;font-weight:700;margin-bottom:8px'>Vos avis publiés</div>";
    mesAvis.forEach(function(a) {
      html += "<div style='border:1px solid #e5e7eb;border-radius:10px;padding:12px;margin-bottom:8px'>";
      html += "<div style='color:#FCD116;font-size:16px;margin-bottom:4px'>" + "★".repeat(a.note) + "☆".repeat(5-a.note) + "</div>";
      if (a.titre) html += "<div style='font-weight:700;font-size:13px'>" + a.titre + "</div>";
      html += "<div style='font-size:12px;color:#555;margin-top:4px'>" + a.commentaire + "</div>";
      html += "<div style='font-size:11px;color:#9ca3af;margin-top:6px'>" + a.date + " · " + (a.serviceNom||a.service||"Service") + "</div>";
      html += "</div>";
    });
  }

  // Tous les avis récents
  html += "<div style='font-size:13px;font-weight:700;margin-bottom:8px;margin-top:8px'>Avis récents</div>";
  avis.slice(0,5).forEach(function(a) {
    html += "<div style='border:1px solid #e5e7eb;border-radius:10px;padding:12px;margin-bottom:8px'>";
    html += "<div style='display:flex;justify-content:space-between'><span style='font-weight:700;font-size:12px'>" + (a.auteur||"Client") + "</span><span style='color:#FCD116'>" + "★".repeat(a.note) + "</span></div>";
    if (a.commentaire) html += "<div style='font-size:12px;color:#555;margin-top:4px'>" + a.commentaire + "</div>";
    html += "</div>";
  });

  z.innerHTML = html;
}

function clientDonnerAvis() {
  // Ouvrir le modal d'avis s'il existe, sinon utiliser une version simplifiée
  var modalAvis = document.getElementById('modal-avis');
  if (modalAvis) {
    modalAvis.style.display = 'flex';
  } else {
    var note = prompt('Votre note de 1 à 5 étoiles:');
    var comm = prompt('Votre commentaire:');
    if (!note || !comm) return;
    var avis = [];
    try { avis = JSON.parse(localStorage.getItem('sm_avis_v2') || '[]'); } catch(e) { _logErr("boutique.js", e); }
    avis.unshift({ id:'AV'+Date.now(), note:parseInt(note)||5, commentaire:comm,
      auteur:CLIENT_COURANT?CLIENT_COURANT.nom:'Client', service:'general', serviceNom:'Service général',
      date:new Date().toLocaleDateString('fr-FR'), verifie:true });
    try { localStorage.setItem('sm_avis_v2', JSON.stringify(avis)); } catch(e) { _logErr("boutique.js", e); }
    bToast('Avis publié — merci !', 'success');
    renderClientAvis();
  }
}

// ── 4. CHAT CLIENT ───────────────────────────────────────────
function renderClientChat() {
  var z = document.getElementById('vue-chat-client');
  if (!z) return;
  var c = CLIENT_COURANT;
  if (!c) { z.innerHTML = "<div style='text-align:center;padding:32px;color:#666'>Connectez-vous pour accéder au chat</div>"; return; }

  // Charger ou créer une conv avec le gérant
  var chats = [];
  try { chats = JSON.parse(localStorage.getItem('sm_chats') || '[]'); } catch(e) { _logErr("boutique.js", e); }
  var conv = chats.find(function(ch){ return ch.clientId === c.id; });
  if (!conv) {
    conv = { id:'CONV'+Date.now(), clientId:c.id, clientNom:c.nom, messages:[], lastTime:'' };
    chats.push(conv);
    try { localStorage.setItem('sm_chats', JSON.stringify(chats)); } catch(e) { _logErr("boutique.js", e); }
  }

  var html = "";
  // Header contact gérant
  html += "<div style='display:flex;align-items:center;gap:10px;padding:12px;background:#f0faf5;border-radius:12px;margin-bottom:14px'>";
  html += "<div style='width:40px;height:40px;border-radius:50%;background:#007A3D;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px'>K</div>";
  html += "<div><div style='font-weight:700;font-size:13px'>KAMER360</div><div style='font-size:11px;color:#007A3D'>Support & Gérant</div></div>";
  html += "<div style='margin-left:auto;width:8px;height:8px;border-radius:50%;background:#00A852'></div></div>";

  // Messages
  html += "<div id='cli-chat-msgs' style='height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:10px'>";
  if (!conv.messages || conv.messages.length === 0) {
    html += "<div style='text-align:center;padding:24px;color:#9ca3af;font-size:12px'>Envoyez un message au gérant — réponse rapide garantie !</div>";
  } else {
    conv.messages.forEach(function(msg) {
      var estMoi = msg.expediteur === c.nom;
      html += "<div style='display:flex;justify-content:" + (estMoi?"flex-end":"flex-start") + "'>";
      html += "<div style='max-width:75%;background:" + (estMoi?"linear-gradient(135deg,#007A3D,#00A852)":"#f3f4f6") + ";color:" + (estMoi?"#fff":"#0F1F0F") + ";padding:9px 13px;border-radius:" + (estMoi?"14px 14px 4px 14px":"14px 14px 14px 4px") + ";font-size:13px'>";
      html += msg.texte;
      html += "<div style='font-size:10px;opacity:.6;margin-top:3px'>" + (msg.time||"") + "</div>";
      html += "</div></div>";
    });
  }
  html += "</div>";

  // Input
  html += "<div style='display:flex;gap:8px'>";
  html += "<input type='text' id='cli-chat-input' placeholder='Votre message...' onkeydown='if(event.key==\'Enter\')envoyerMessageClient()' style='flex:1;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:22px;font-size:13px;outline:none;font-family:inherit'>";
  html += "<button onclick='envoyerMessageClient()' style='background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center'>";
  html += "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#fff' stroke-width='2.5'><line x1='22' y1='2' x2='11' y2='13'/><polygon points='22 2 15 22 11 13 2 9 22 2'/></svg>";
  html += "</button></div>";

  z.innerHTML = html;
  // Scroll en bas
  setTimeout(function(){ var el=document.getElementById('cli-chat-msgs'); if(el) el.scrollTop=el.scrollHeight; }, 100);
}

function envoyerMessageClient() {
  var inp = document.getElementById('cli-chat-input');
  var texte = (inp||{}).value || '';
  if (!texte.trim() || !CLIENT_COURANT) return;
  var c = CLIENT_COURANT;
  var chats = [];
  try { chats = JSON.parse(localStorage.getItem('sm_chats') || '[]'); } catch(e) { _logErr("boutique.js", e); }
  var idx = chats.findIndex(function(ch){ return ch.clientId === c.id; });
  if (idx < 0) return;
  var msg = { id:'MSG'+Date.now(), texte:texte.trim(), expediteur:c.nom,
    time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) };
  chats[idx].messages.push(msg);
  chats[idx].lastTime = msg.time;
  try { localStorage.setItem('sm_chats', JSON.stringify(chats)); } catch(e) { _logErr("boutique.js", e); }
  if (inp) inp.value = '';
  renderClientChat();
}

// ── 5. NOTIFICATIONS CLIENT ──────────────────────────────────
function renderClientNotif() {
  var z = document.getElementById('vue-notif-client');
  if (!z) return;
  var granted = (typeof Notification !== 'undefined') && Notification.permission === 'granted';
  var notifs  = [];
  try { notifs = JSON.parse(localStorage.getItem('km_notif_history') || '[]'); } catch(e) { _logErr("boutique.js", e); }

  var html = "";
  if (!granted) {
    html += "<div style='background:linear-gradient(135deg,#1565C0,#1E88E5);color:#fff;border-radius:14px;padding:18px;margin-bottom:14px;text-align:center'>";
    html += "<div style='font-size:32px;margin-bottom:8px'>🔔</div>";
    html += "<div style='font-weight:800;font-size:15px;margin-bottom:6px'>Activez les notifications push</div>";
    html += "<div style='font-size:12px;opacity:.85;margin-bottom:14px'>Soyez alerté de vos commandes, livraisons et offres spéciales</div>";
    html += "<button onclick='activerNotifsClient()' style='background:rgba(255,255,255,.2);color:#fff;border:1.5px solid rgba(255,255,255,.5);padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer'>Activer maintenant</button>";
    html += "</div>";
  } else {
    html += "<div style='background:#f0faf5;border-radius:12px;padding:12px;margin-bottom:14px;display:flex;align-items:center;gap:10px'>";
    html += "<span style='font-size:24px'>🔔</span><div><div style='font-size:13px;font-weight:700;color:#007A3D'>Notifications activées</div>";
    html += "<div style='font-size:11px;color:#666;margin-top:2px'>Vous recevez les alertes en temps réel</div></div>";
    html += "</div>";
  }

  if (notifs.length === 0) {
    html += "<div style='text-align:center;padding:32px;color:#9ca3af'><div style='font-size:36px;margin-bottom:8px'>📬</div><div style='font-size:13px'>Aucune notification</div></div>";
  } else {
    html += "<div style='font-size:13px;font-weight:700;margin-bottom:10px'>Vos notifications récentes</div>";
    var colors = { commande:'#007A3D', livraison:'#1565C0', avis:'#b8860b', promo:'#E65100', info:'#555' };
    notifs.slice(0,10).forEach(function(n) {
      var col = colors[n.type] || '#555';
      html += "<div style='display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #f5f8f5'>";
      html += "<div style='width:34px;height:34px;border-radius:50%;background:" + col + "22;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0'>" + (n.icon||"🔔") + "</div>";
      html += "<div style='flex:1'><div style='font-size:13px;font-weight:600'>" + (n.titre||"") + "</div>";
      html += "<div style='font-size:11px;color:#555;margin-top:2px'>" + (n.corps||"") + "</div>";
      html += "<div style='font-size:10px;color:#9ca3af;margin-top:3px'>" + (n.date||"") + "</div></div>";
      html += "</div>";
    });
  }
  z.innerHTML = html;
}

function activerNotifsClient() {
  if (!('Notification' in window)) { bToast('Votre navigateur ne supporte pas les notifications', 'warning'); return; }
  Notification.requestPermission().then(function(p) {
    if (p === 'granted') {
      bToast('Notifications activées !', 'success');
      new Notification('KAMER360', { body:'Vous serez alerté de vos commandes et livraisons !' });
      renderClientNotif();
    } else {
      bToast('Permission refusée — activez dans les paramètres du navigateur', 'warning');
    }
  });
}

// ── 6. MODE HORS-LIGNE CLIENT ────────────────────────────────
function renderClientOffline() {
  var z = document.getElementById('vue-offline-client');
  if (!z) return;
  var online = navigator.onLine;
  var html = "";

  html += "<div style='background:linear-gradient(135deg," + (online?"#007A3D,#00A852":"#E65100,#FF8F00") + ");color:#fff;border-radius:14px;padding:18px;margin-bottom:14px;text-align:center'>";
  html += "<div style='font-size:36px;margin-bottom:8px'>" + (online?"🟢":"🔴") + "</div>";
  html += "<div style='font-weight:800;font-size:15px'>" + (online?"Connecté à internet":"Mode hors-ligne") + "</div>";
  html += "<div style='font-size:12px;opacity:.85;margin-top:4px'>" + (online?"Toutes les fonctionnalités sont disponibles":"Accès aux données en cache") + "</div>";
  html += "</div>";

  // Ce qui est accessible hors-ligne pour le client
  var items = [
    { icon:"🛒", label:"Catalogue produits", ok:true },
    { icon:"📦", label:"Mes commandes", ok:true },
    { icon:"💳", label:"Solde KAMER Pay", ok:true },
    { icon:"💬", label:"Historique messages", ok:true },
    { icon:"🛵", label:"Tracking livraison", ok:!!online },
    { icon:"💸", label:"Passer une commande", ok:!!online },
  ];

  html += "<div style='font-size:13px;font-weight:700;margin-bottom:10px'>Ce qui est accessible sans connexion</div>";
  items.forEach(function(item) {
    html += "<div style='display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f5f8f5'>";
    html += "<span style='font-size:20px'>" + item.icon + "</span>";
    html += "<span style='flex:1;font-size:13px'>" + item.label + "</span>";
    html += "<span style='font-size:18px'>" + (item.ok?"✅":"⏳") + "</span>";
    html += "</div>";
  });

  html += "<button onclick='installerAppClient()' style='width:100%;background:#007A3D;color:#fff;border:none;padding:13px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;margin-top:14px'>📲 Installer KAMER360 sur mon téléphone</button>";
  z.innerHTML = html;
}

function installerAppClient() {
  if (window._pwaPrompt) {
    window._pwaPrompt.prompt();
  } else {
    bToast('Menu navigateur > Ajouter a l&#39;ecran d&#39;accueil', 'info');
  }
}

// PWA install prompt
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  window._pwaPrompt = e;
});

// ── Bottom Nav — affichage sur mobile ────────────────────────
window.addEventListener('DOMContentLoaded', function() {
  var bnav = document.getElementById('boutique-bottom-nav');
  if (bnav && window.innerWidth <= 768) bnav.style.display = 'block';
  // Ajouter du padding en bas sur mobile
  if (window.innerWidth <= 768) {
    document.body.style.paddingBottom = '70px';
  }
});

window.addEventListener('resize', function() {
  var bnav = document.getElementById('boutique-bottom-nav');
  if (bnav) bnav.style.display = window.innerWidth <= 768 ? 'block' : 'none';
});

// ── Fonctions utilitaires manquantes ──────────────────────────
function ouvrirPanier() {
  var panel = document.getElementById('panier-panel');
  if (panel) panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
  renderPanier();
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ══════════════════════════════════════════════════════════════
//  PAGINATION
// ══════════════════════════════════════════════════════════════
function changerPage(n) {
  pageCourante = n;
  renderProduits();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ══════════════════════════════════════════════════════════════
//  FILTRES PRIX
// ══════════════════════════════════════════════════════════════
function appliquerFiltrePrix() {
  prixMin = parseInt((document.getElementById('filtre-prix-min') || {}).value) || 0;
  prixMax = parseInt((document.getElementById('filtre-prix-max') || {}).value) || 999999999;
  pageCourante = 1;
  renderProduits();
}

function reinitialiserFiltres() {
  prixMin = 0; prixMax = 999999999;
  catActif = ''; searchQ = ''; pageCourante = 1;
  // Vider les champs
  ['filtre-prix-min','filtre-prix-max','search-input'].forEach(function(id){
    var el = document.getElementById(id); if (el) el.value = '';
  });
  document.querySelectorAll('.bcat-btn').forEach(function(b){ b.classList.remove('active'); });
  // Effacer le cache localStorage pour forcer rechargement Supabase
  try { localStorage.removeItem('sm_produits'); } catch(e) {}
  // Recharger TOUS les produits depuis Supabase
  if (typeof btoast === 'function') btoast('Rechargement de tous les produits...', 'info');
  chargerProduitsDepuisSupabase();
}

// ══════════════════════════════════════════════════════════════
//  SUIVI COMMANDE CLIENT
// ══════════════════════════════════════════════════════════════
async function ouvrirSuiviCommande() {
  var modal = document.getElementById('m-suivi-commande');
  if (!modal) return;
  modal.style.display = 'flex';
  var cont = document.getElementById('suivi-content');
  cont.innerHTML = '<div style="text-align:center;padding:30px;color:#6b7280">&#8987; Chargement...</div>';

  var cmdLocales = [];
  try { cmdLocales = JSON.parse(localStorage.getItem('sm_mes_commandes') || '[]'); } catch(e) {}

  var cmdSupa = [];
  try {
    var user = JSON.parse(localStorage.getItem('sm_client_user') || '{}');
    var sb = null;
    if (typeof window.supabase !== 'undefined' && typeof SM_CONFIG !== 'undefined' && SM_CONFIG.supabase)
      sb = window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
    if (sb && user.telephone) {
      var res = await sb.from('commandes').select('*').eq('client_tel', user.telephone).order('created_at',{ascending:false}).limit(20);
      if (res.data) cmdSupa = res.data;
    }
  } catch(e) {}

  var toutes = cmdSupa.length > 0 ? cmdSupa : cmdLocales;
  if (toutes.length === 0) {
    cont.innerHTML = '<div style="text-align:center;padding:40px 20px"><div style="font-size:48px;margin-bottom:12px">&#128230;</div><div style="font-size:16px;font-weight:700;color:#111;margin-bottom:6px">Aucune commande</div><div style="font-size:13px;color:#6b7280">Vous n’avez pas encore passé de commande.</div></div>';
    return;
  }

  var sts = {
    'en_attente':    {bg:'#fef3c7',tx:'#92400e',lb:'&#9203; En attente'},
    'confirmee':     {bg:'#d1fae5',tx:'#065f46',lb:'&#10003; Confirmée'},
    'en_preparation':{bg:'#dbeafe',tx:'#1e40af',lb:'&#127859; En préparation'},
    'en_livraison':  {bg:'#ede9fe',tx:'#5b21b6',lb:'&#128640; En livraison'},
    'livree':        {bg:'#d1fae5',tx:'#065f46',lb:'&#10003; Livrée'},
    'annulee':       {bg:'#fee2e2',tx:'#991b1b',lb:'&#10007; Annulée'},
  };

  cont.innerHTML = toutes.map(function(cmd){
    var st = sts[cmd.statut] || {bg:'#f3f4f6',tx:'#374151',lb: cmd.statut||'En cours'};
    var date = cmd.created_at ? new Date(cmd.created_at).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'}) : '';
    var items = [];
    try { items = typeof cmd.items==='string' ? JSON.parse(cmd.items) : (cmd.items||[]); } catch(e){}
    var wa = 'https://wa.me/237693591479?text='+encodeURIComponent('Suivi commande #'+(cmd.id||'').toString().slice(-6).toUpperCase());
    return '<div style="border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;margin-bottom:12px">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'
      +'<div><div style="font-size:12px;color:#6b7280">Commande #'+(cmd.id||'').toString().slice(-6).toUpperCase()+'</div>'
      +'<div style="font-size:11px;color:#9ca3af">'+date+'</div></div>'
      +'<span style="background:'+st.bg+';color:'+st.tx+';font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px">'+st.lb+'</span></div>'
      +(items.length>0?'<div style="font-size:12px;color:#374151;margin-bottom:8px">'+items.slice(0,3).map(function(it){return(it.nom||it.name||'Produit')+' x'+(it.qte||it.quantite||1);}).join(', ')+(items.length>3?'...':'')+'</div>':'')
      +'<div style="display:flex;justify-content:space-between;align-items:center">'
      +'<div style="font-size:14px;font-weight:800;color:#007A3D">'+Number(cmd.total||cmd.montant||0).toLocaleString('fr-FR')+' FCFA</div>'
      +'<a href="'+wa+'" target="_blank" style="font-size:12px;color:#007A3D;font-weight:600;text-decoration:underline">&#128222; Contacter</a>'
      +'</div></div>';
  }).join('');
}

function fermerSuiviCommande() {
  var m = document.getElementById('m-suivi-commande');
  if (m) m.style.display = 'none';
}

// ══════════════════════════════════════════════════════════════
//  MOT DE PASSE OUBLIÉ CLIENT
// ══════════════════════════════════════════════════════════════
function ouvrirForgotClient() {
  var emailLogin = document.getElementById('cli-login-email');
  var emailForgot = document.getElementById('fc-email');
  if (emailLogin && emailForgot && emailLogin.value) emailForgot.value = emailLogin.value;
  document.getElementById('fc-step1').style.display = 'block';
  document.getElementById('fc-step2').style.display = 'none';
  var msg = document.getElementById('fc-msg');
  if (msg) { msg.style.display = 'none'; msg.innerHTML = ''; }
  document.getElementById('m-forgot-client').style.display = 'flex';
}

function fermerForgotClient() {
  document.getElementById('m-forgot-client').style.display = 'none';
}

async function envoyerResetClient() {
  var email = ((document.getElementById('fc-email') || {}).value || '').trim();
  var btn = document.getElementById('fc-btn');
  var msg = document.getElementById('fc-msg');

  if (!email || !email.includes('@')) {
    msg.style.display = 'block';
    msg.style.background = '#fee2e2'; msg.style.color = '#991b1b';
    msg.textContent = 'Veuillez entrer une adresse email valide.';
    return;
  }

  if (btn) { btn.textContent = '&#9203; Envoi...'; btn.disabled = true; }
  if (msg) msg.style.display = 'none';

  try {
    var sb = null;
    if (typeof window.supabase !== 'undefined' && typeof SM_CONFIG !== 'undefined' && SM_CONFIG.supabase)
      sb = window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
    if (!sb) throw new Error('Supabase indisponible');

    var res = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/boutique.html?reset=1'
    });
    if (res.error) throw new Error(res.error.message);

    document.getElementById('fc-email-confirm').textContent = email;
    document.getElementById('fc-step1').style.display = 'none';
    document.getElementById('fc-step2').style.display = 'block';

  } catch(e) {
    var wa = 'https://wa.me/237693591479?text=' + encodeURIComponent('Reinitialisation mot de passe client KAMER360 - Email : ' + email);
    msg.style.display = 'block';
    msg.style.background = '#fef3c7'; msg.style.color = '#92400e';
    msg.innerHTML = 'Service indisponible. <a href="'+wa+'" target="_blank" style="color:#007A3D;font-weight:700;text-decoration:underline">Demander via WhatsApp</a>.';
    if (btn) { btn.textContent = '&#128232; Envoyer le lien'; btn.disabled = false; }
  }
}

// ── Force le rechargement complet depuis Supabase ──
function forceRechargerProduits() {
  try {
    localStorage.removeItem('sm_produits');
    PRODUITS = [];
    prixMin = 0; prixMax = 999999999;
    catActif = ''; searchQ = ''; pageCourante = 1;
    ['filtre-prix-min','filtre-prix-max','search-input'].forEach(function(id){
      var el = document.getElementById(id); if (el) el.value = '';
    });
    document.querySelectorAll('.bcat-btn').forEach(function(b){ b.classList.remove('active'); });
  } catch(e) {}

  // Afficher état de chargement
  var grid = document.getElementById('bpgrid');
  if (grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#6b7280"><div style="font-size:32px;margin-bottom:12px">&#9654;</div><div style="font-size:14px;font-weight:600">Chargement de tous les produits...</div></div>';

  if (typeof btoast === 'function') btoast('Rechargement en cours...', 'info');
  chargerProduitsDepuisSupabase();
}

// ══════════════════════════════════════════════════════════════
//  COMMISSION MARKETPLACE — KAMER360
//  Barème par catégorie (taux par défaut si catégorie inconnue)
// ══════════════════════════════════════════════════════════════
var TAUX_COMMISSION = {
  'alimentation':    0.04,  // 4%
  'electronique':    0.06,  // 6%
  'mode':            0.07,  // 7%
  'beaute':          0.06,
  'maison':          0.05,
  'sante':           0.03,
  'energie':         0.03,
  'btp':             0.03,
  'agriculture':     0.03,
  'default':         0.05   // 5% par défaut
};

function calculerCommissionKamer360(items, totalCommande) {
  var montantCommission = 0;

  items.forEach(function(item) {
    var cat = (item.cat || 'default').toLowerCase();
    var taux = TAUX_COMMISSION[cat] !== undefined ? TAUX_COMMISSION[cat] : TAUX_COMMISSION['default'];
    var sousTotalItem = (item.prix || 0) * (item.qte || 1);
    montantCommission += sousTotalItem * taux;
  });

  montantCommission = Math.round(montantCommission);
  var tauxMoyen = totalCommande > 0 ? (montantCommission / totalCommande) : TAUX_COMMISSION['default'];

  return {
    taux:       Math.round(tauxMoyen * 1000) / 10, // en %, ex: 5.2
    montant:    montantCommission,
    montantNet: totalCommande - montantCommission
  };
}

// ── Enregistrer la commission dans Supabase pour suivi des revenus ──
async function _enregistrerCommissionSupabase(commande) {
  try {
    var sb = null;
    if (typeof window.supabase !== 'undefined' && typeof SM_CONFIG !== 'undefined' && SM_CONFIG.supabase) {
      sb = window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
    }
    if (!sb) return;

    await sb.from('kamer360_revenus').insert({
      commande_id:     commande.id,
      gerant_sm:       commande.supermarche || '',
      sous_total:      commande.sous_total || 0,
      commission_taux: commande.commission_taux || 0,
      commission_montant: commande.commission_montant || 0,
      montant_net_gerant: commande.montant_net_gerant || 0,
      statut:          'en_attente',
      created_at:      new Date().toISOString()
    });
  } catch(e) { _logErr('enregistrerCommission', e); }
}

// ══════════════════════════════════════════════════════════════
//  PAIEMENT INTÉGRÉ — 100% dans l'app, aucune redirection externe
// ══════════════════════════════════════════════════════════════

function _peBackendUrl() {
  var url = 'https://kamer360-backend-production.up.railway.app';
  if (typeof SM_CONFIG !== 'undefined' && SM_CONFIG.backend) {
    url = typeof SM_CONFIG.backend === 'string' ? SM_CONFIG.backend : (SM_CONFIG.backend.url || url);
  }
  return url;
}

function _peReset() {
  ['pe-view-mobile', 'pe-view-carte', 'pe-view-resultat'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  var iframe = document.getElementById('pe-carte-iframe');
  if (iframe) { iframe.style.display = 'none'; iframe.src = ''; }
  var loading = document.getElementById('pe-carte-loading');
  if (loading) loading.style.display = 'block';
  if (window._peInterval) { clearInterval(window._peInterval); window._peInterval = null; }
}

function fermerPaiementEmbed() {
  var modal = document.getElementById('m-paiement-embed');
  if (modal) modal.style.display = 'none';
  if (window._peInterval) { clearInterval(window._peInterval); window._peInterval = null; }
}

function _peAfficherResultat(success, titre, msg, commande, payMode) {
  _peReset();
  document.getElementById('pe-view-resultat').style.display = 'block';
  document.getElementById('pe-resultat-icon').textContent = success ? '✅' : '❌';
  document.getElementById('pe-resultat-icon').style.color = success ? '#007A3D' : '#ef4444';
  document.getElementById('pe-resultat-titre').textContent = titre;
  document.getElementById('pe-resultat-titre').style.color = success ? '#007A3D' : '#ef4444';
  document.getElementById('pe-resultat-msg').textContent = msg;
  document.getElementById('pe-close-btn').style.display = 'flex';

  document.getElementById('pe-resultat-btn').onclick = function() {
    fermerPaiementEmbed();
    if (success && commande) afficherSucces(commande, payMode);
  };
}

// ── CARTE BANCAIRE : iframe NotchPay invisible, jamais de redirection ──
async function ouvrirPaiementEmbedCarte(commande, email) {
  var modal = document.getElementById('m-paiement-embed');
  _peReset();
  document.getElementById('pe-titre').textContent = '💳 Paiement par carte';
  document.getElementById('pe-cmd-num').textContent = commande.id;
  document.getElementById('pe-montant').textContent = Number(commande.total).toLocaleString('fr-FR') + ' FCFA';
  document.getElementById('pe-view-carte').style.display = 'flex';
  document.getElementById('pe-close-btn').style.display = 'flex';
  modal.style.display = 'flex';

  try {
    var res = await fetch(_peBackendUrl() + '/api/paiement/initier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        montant: commande.total, email: email, nom: commande.client,
        description: 'Commande KAMER360 ' + commande.id,
        reference: commande.id, canal: 'card'
      })
    });
    var data = await res.json();

    if (data.success && data.payment_url) {
      if (data.mode === 'test') {
        setTimeout(function() {
          _peAfficherResultat(true, 'Paiement confirmé !', 'Mode test — paiement carte simulé avec succès.', commande, 'carte');
        }, 1200);
        return;
      }
      // Charger le formulaire NotchPay DANS l'iframe — le client ne quitte jamais KAMER360
      var iframe = document.getElementById('pe-carte-iframe');
      var iframeLoaded = false;
      iframe.src = data.payment_url;
      iframe.onload = function() {
        iframeLoaded = true;
        document.getElementById('pe-carte-loading').style.display = 'none';
        iframe.style.display = 'block';
      };
      // Si NotchPay bloque l'affichage en iframe (X-Frame-Options), informer après 6s
      setTimeout(function() {
        if (!iframeLoaded) {
          _peAfficherResultat(false, 'Affichage indisponible', 'Le formulaire de carte n\u2019a pas pu s\u2019afficher. Veuillez réessayer ou utiliser Mobile Money.', null);
        }
      }, 6000);
      // Vérifier le statut périodiquement (la confirmation arrive via webhook backend)
      window._peInterval = setInterval(function() { _peVerifierStatut(data.transaction_reference, commande, 'carte'); }, 4000);
    } else {
      throw new Error(data.error || 'Erreur initialisation paiement');
    }
  } catch(e) {
    _logErr('ouvrirPaiementEmbedCarte', e);
    _peAfficherResultat(false, 'Paiement indisponible', 'Le service de paiement par carte est momentanément indisponible. Réessayez ou choisissez Mobile Money.', null);
  }
}

// ── MOBILE MONEY : push de paiement direct, sans USSD manuel ──
async function ouvrirPaiementEmbedMobile(commande, payMode, telephone) {
  var modal = document.getElementById('m-paiement-embed');
  _peReset();
  var labels = { mtn: 'MTN Mobile Money', orange: 'Orange Money', yoomee: 'Yoomee Money' };
  document.getElementById('pe-titre').textContent = '📱 ' + (labels[payMode] || 'Mobile Money');
  document.getElementById('pe-cmd-num').textContent = commande.id;
  document.getElementById('pe-montant').textContent = Number(commande.total).toLocaleString('fr-FR') + ' FCFA';
  document.getElementById('pe-mobile-num').textContent = telephone;
  document.getElementById('pe-mobile-statut').textContent = 'Envoi de la demande de paiement...';
  document.getElementById('pe-view-mobile').style.display = 'block';
  document.getElementById('pe-close-btn').style.display = 'none'; // éviter de fermer pendant le traitement
  modal.style.display = 'flex';

  try {
    var res = await fetch(_peBackendUrl() + '/api/paiement/initier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        montant: commande.total, telephone: telephone, nom: commande.client,
        description: 'Commande KAMER360 ' + commande.id,
        reference: commande.id, canal: 'cm.mobile'
      })
    });
    var data = await res.json();

    if (data.success) {
      if (data.mode === 'test') {
        document.getElementById('pe-mobile-statut').textContent = 'Mode test — confirmation simulée...';
        setTimeout(function() {
          _peAfficherResultat(true, 'Paiement confirmé !', 'Mode test — paiement Mobile Money simulé avec succès.', commande, payMode);
        }, 2000);
        return;
      }
      document.getElementById('pe-mobile-statut').textContent = 'En attente de confirmation...';
      document.getElementById('pe-mobile-instr').textContent = 'Validez avec votre code secret sur votre téléphone';
      window._peInterval = setInterval(function() { _peVerifierStatut(data.transaction_reference, commande, payMode); }, 4000);
      // Timeout de sécurité après 2 minutes
      setTimeout(function() {
        if (window._peInterval) {
          clearInterval(window._peInterval); window._peInterval = null;
          _peAfficherResultat(false, 'Délai dépassé', 'Aucune confirmation reçue. Vérifiez votre téléphone ou contactez le support.', null);
        }
      }, 120000);
    } else {
      throw new Error(data.error || 'Erreur initialisation paiement');
    }
  } catch(e) {
    _logErr('ouvrirPaiementEmbedMobile', e);
    _peAfficherResultat(false, 'Paiement indisponible', 'Service Mobile Money momentanément indisponible. Réessayez dans un instant.', null);
  }
}

// ── Vérifier le statut auprès du backend (polling) ──
async function _peVerifierStatut(reference, commande, payMode) {
  if (!reference) return;
  try {
    var res = await fetch(_peBackendUrl() + '/api/paiement/statut/' + reference);
    var data = await res.json();
    var statut = data.status || (data.data && data.data.transaction && data.data.transaction.status);

    if (statut === 'complete' || statut === 'success' || statut === 'successful') {
      if (window._peInterval) { clearInterval(window._peInterval); window._peInterval = null; }
      _peAfficherResultat(true, 'Paiement confirmé !', 'Votre paiement a été reçu avec succès. Votre commande est en cours de préparation.', commande, payMode);
    } else if (statut === 'failed' || statut === 'canceled' || statut === 'declined') {
      if (window._peInterval) { clearInterval(window._peInterval); window._peInterval = null; }
      _peAfficherResultat(false, 'Paiement refusé', 'Le paiement n\u2019a pas pu être validé. Veuillez réessayer.', null);
    }
    // Sinon : on continue d'attendre (statut pending)
  } catch(e) { _logErr('_peVerifierStatut', e); }
}


// ══════════════════════════════════════════════════════════════
//  KAMER ADS — Affichage des annonces sponsorisées (boutique)
// ══════════════════════════════════════════════════════════════
async function chargerKamerAdsBoutique() {
  var z = document.getElementById('kamer-ads-banner');
  if (!z) return;

  try {
    var sb = null;
    if (typeof window.supabase !== 'undefined' && typeof SM_CONFIG !== 'undefined' && SM_CONFIG.supabase) {
      sb = window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
    }
    if (!sb) return;

    var res = await sb.from('kamer360_ads')
      .select('*')
      .eq('statut', 'active')
      .eq('emplacement', 'boutique_accueil')
      .order('created_at', { ascending: false })
      .limit(3);

    if (res.error || !res.data || res.data.length === 0) return;

    // Filtrer les annonces dont le budget n'est pas épuisé
    var adsValides = res.data.filter(function(a) {
      return (a.budget_depense || 0) < a.budget_total;
    });
    if (adsValides.length === 0) return;

    z.innerHTML = adsValides.map(function(ad) {
      return '<div onclick="trackKamerAdsClic(\'' + ad.id + '\')" style="cursor:pointer;background:linear-gradient(135deg,#007A3D,#005C2E);border-radius:14px;padding:16px 20px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;color:#fff;box-shadow:0 4px 14px rgba(0,122,61,.25)">'
        + '<div>'
        +   '<div style="font-size:9px;background:rgba(255,255,255,.2);display:inline-block;padding:2px 8px;border-radius:10px;margin-bottom:6px;font-weight:700">SPONSORISÉ</div>'
        +   '<div style="font-weight:800;font-size:15px">' + (ad.titre||'') + '</div>'
        +   (ad.description ? '<div style="font-size:12px;opacity:.85;margin-top:2px">' + ad.description + '</div>' : '')
        + '</div>'
        + '<div style="font-size:20px">→</div>'
        + '</div>';
    }).join('');
    z.style.display = 'block';

    // Tracker les vues (une fois par session pour éviter le gonflement artificiel)
    adsValides.forEach(function(ad) {
      var vusKey = 'kamer_ads_vu_' + ad.id;
      if (!sessionStorage.getItem(vusKey)) {
        sessionStorage.setItem(vusKey, '1');
        trackKamerAdsVue(ad.id);
      }
    });

  } catch(e) { _logErr('chargerKamerAdsBoutique', e); }
}

async function trackKamerAdsVue(adId) {
  try {
    var sb = window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
    var ad = await sb.from('kamer360_ads').select('nb_vues,budget_depense,cout_par_vue').eq('id', adId).single();
    if (ad.data) {
      var nouvellesVues = (ad.data.nb_vues || 0) + 1;
      var coutVue = (ad.data.cout_par_vue || 5) / 1000; // CPM : coût pour 1 vue
      var nouveauDepense = (ad.data.budget_depense || 0) + coutVue;
      await sb.from('kamer360_ads').update({ nb_vues: nouvellesVues, budget_depense: nouveauDepense }).eq('id', adId);
    }
  } catch(e) { _logErr('trackKamerAdsVue', e); }
}

async function trackKamerAdsClic(adId) {
  try {
    var sb = window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
    var ad = await sb.from('kamer360_ads').select('nb_clics,budget_depense,cout_par_clic,lien_produit').eq('id', adId).single();
    if (ad.data) {
      var nouveauxClics = (ad.data.nb_clics || 0) + 1;
      var nouveauDepense = (ad.data.budget_depense || 0) + (ad.data.cout_par_clic || 50);
      await sb.from('kamer360_ads').update({ nb_clics: nouveauxClics, budget_depense: nouveauDepense }).eq('id', adId);

      // Rediriger vers le produit si un lien est défini
      if (ad.data.lien_produit) {
        var prodId = ad.data.lien_produit;
        searchQ = '';
        var prod = PRODUITS.find(function(p){ return String(p.id) === String(prodId); });
        if (prod) {
          searchQ = prod.nom;
          var srchEl = document.getElementById('search-input');
          if (srchEl) srchEl.value = prod.nom;
          renderProduits();
          document.getElementById('bpgrid').scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  } catch(e) { _logErr('trackKamerAdsClic', e); }
}

// Charger les annonces au démarrage de la boutique
setTimeout(chargerKamerAdsBoutique, 1500);

// ══════════════════════════════════════════════════════════════
//  BOTTOM NAV — état actif + badge panier synchronisé
// ══════════════════════════════════════════════════════════════
function setNavActive(btn) {
  document.querySelectorAll('#boutique-bottom-nav button').forEach(function(b) {
    b.style.color = '#6b7280';
    b.style.background = 'none';
  });
  if (btn) {
    btn.style.color = '#007A3D';
    btn.style.background = '#f0fdf4';
  }
}

// Synchroniser le badge panier de la bottom nav
var _origUpdatePanierBadge = typeof updatePanierBadge === 'function' ? updatePanierBadge : null;
function updatePanierBadge() {
  if (_origUpdatePanierBadge) _origUpdatePanierBadge();
  // Mettre à jour aussi le badge de la bottom nav
  try {
    var total = panier.reduce(function(s, x) { return s + (x.qte || 1); }, 0);
    var badge = document.getElementById('bnav-cart-badge');
    if (badge) {
      badge.textContent = total;
      badge.style.display = total > 0 ? 'block' : 'none';
    }
  } catch(e) {}
}

// Activer "Accueil" par défaut au chargement
document.addEventListener('DOMContentLoaded', function() {
  var accueil = document.getElementById('bnav-accueil');
  if (accueil) setNavActive(accueil);
});
