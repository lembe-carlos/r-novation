
// ── Lecture des VRAIES données du gérant ──────────────────────
// Lit d'abord sm_marketplace_data (données réelles) 
// Fallback sur les données statiques si rien n'est configuré

function mktGetRealData(section, key) {
  try {
    var d = JSON.parse(localStorage.getItem('sm_marketplace_data') || '{}');
    var items = d[section] && d[section][key];
    return items || [];
  } catch(e) { return []; }
}

// Message vide quand aucune donnée réelle n'est configurée
function mktEmptyState(sectionLabel) {
  return '<div style="text-align:center;padding:48px 20px;color:#9ca3af">'
    + '<div style="font-size:48px;margin-bottom:16px">🏪</div>'
    + '<div style="font-size:16px;font-weight:700;color:#374151;margin-bottom:8px">Aucun contenu pour l instant</div>'
    + '<div style="font-size:13px;line-height:1.6">Le gerant n a pas encore configure ce service.<br>'
    + 'Rendez-vous dans <strong>Ma Marketplace → Mes Services</strong><br>pour ajouter vos vrais ' + sectionLabel + '.</div>'
    + '</div>';
}

function mktGetRealProfil() {
  try {
    var d = JSON.parse(localStorage.getItem('sm_marketplace_data') || '{}');
    return d.profil || null;
  } catch(e) { return null; }
}

// Rendu d'une image: base64 ou URL picsum
function mktImg(item, fallbackUrl) {
  return item && item.img_base64 ? item.img_base64 : (item && item.img ? item.img : (fallbackUrl || 'https://picsum.photos/id/1/400/240'));
}

// Rendu contact réel
function mktTel(item) {
  return item.tel || item.telephone || item.whatsapp || '';
}

// 
//  KAMER360 — marketplace.js
//  Marketplace intégrée dans la boutique client
//  Sections : Énergie | Menuiserie | Restauration | Santé | BTP
// 

//  Panier Marketplace (unifié avec panier boutique) 
// Les items de la marketplace s'ajoutent au panier existant de boutique.js
// avec un champ "source" pour identifier l'origine

function mktAddPanier(item) {
  // String() pour éviter les erreurs de comparaison string vs number
  var idx = panier.findIndex(function(x){ return String(x.id) === String(item.id); });
  if (idx === -1) {
    panier.push({ id:String(item.id), nom:item.nom, prix:item.prix, img:item.img,
                  cat:item.source||'Marketplace', sm:'Marketplace', qte:1,
                  source:item.source, type:item.type, extra:item.extra||'' });
  } else {
    panier[idx].qte++;
  }
  if (typeof _sauvegarderPanier === 'function') _sauvegarderPanier();
  if (typeof updateCart === 'function') updateCart();
  if (typeof _syncBnavBadge === 'function') _syncBnavBadge();
  mktToast('✅ ' + item.nom + ' ajouté au panier !');
}

function mktToast(msg) {
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#007A3D;color:#fff;padding:10px 20px;border-radius:30px;font-size:13px;font-weight:700;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.2);animation:fadeInUp .3s ease';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function(){ t.style.opacity='0'; t.style.transition='opacity .4s'; setTimeout(function(){ t.remove(); }, 400); }, 2500);
}

// 
//  SECTION 1 — ÉNERGIE SOLAIRE
//  Catalogue produits + demande devis installation
// 

var MKT_ENERGIE_PRODUITS = [];

var MKT_DEVIS_ENERGIE = [];

function renderMktEnergie() {
  var el = document.getElementById('mkt-energie-content');
  if (!el) return;

  var catFiltre = (document.getElementById('mkt-energie-cat') || {}).value || '';
  var prods = (mktGetRealData('energie','produits')).filter(function(p){

  if (!prods || prods.length === 0) { el.innerHTML = mktEmptyState('produits energetiques'); return; }
    return !catFiltre || p.cat === catFiltre;
  });

  el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">'
    + prods.map(function(p) {
        return '<div style="background:#fff;border-radius:14px;overflow:hidden;border:1.5px solid #e5e7eb;transition:box-shadow .2s" onmouseover="this.style.boxShadow=\'0 4px 20px rgba(0,0,0,.1)\'" onmouseout="this.style.boxShadow=\'\'">'
          + '<img loading="lazy" src="' + p.img + '" style="width:100%;height:160px;object-fit:cover" onerror="this.src=\'https://picsum.photos/300/160\'">'
          + '<div style="padding:14px">'
          + '<span style="background:#fef3c7;color:#b45309;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px">' + p.cat + '</span>'
          + '<div style="font-weight:800;font-size:14px;margin:8px 0 4px">' + p.nom + '</div>'
          + '<div style="font-size:12px;color:#666;margin-bottom:10px;min-height:30px">' + p.desc + '</div>'
          + '<div style="font-size:18px;font-weight:800;color:#007A3D;margin-bottom:10px">' + p.prix.toLocaleString('fr-FR') + ' FCFA</div>'
          + '<div style="display:flex;gap:8px">'
          + '<button onclick="mktAddPanier({id:\'' + p.id + '\',nom:\'' + p.nom.replace(/'/g,"\\'") + '\',prix:' + p.prix + ',img:\'' + p.img + '\',source:\'Énergie Solaire\',type:\'produit\'})" style="flex:1;background:#007A3D;color:#fff;border:none;padding:9px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer"> Ajouter</button>'
          + '<button onclick="ouvrirDevisEnergie(\'' + p.id + '\',\'' + p.nom.replace(/'/g,"\\'") + '\')" style="flex:1;background:#f0faf5;color:#007A3D;border:1.5px solid #007A3D;padding:9px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer"> Devis install.</button>'
          + (p.video_base64 || p.video ? '<div style="padding:8px 13px 10px;background:#f9fafb;border-top:1px solid #f0f0f0">' + mktVideoPlayer(p.video_base64 || p.video) + '</div>' : '')
          + '</div></div></div>';
      }).join('') + '</div>';
}

function ouvrirDevisEnergie(prodId, prodNom) {
  var m = document.getElementById('mkt-modal-devis');
  document.getElementById('mkt-devis-titre').textContent = 'Devis installation — ' + prodNom;
  document.getElementById('mkt-devis-produit').value = prodNom;
  document.getElementById('mkt-devis-type').value = 'energie';
  openMkt('mkt-modal-devis');
}

// 
//  SECTION 2 — MENUISERIE
//  Galerie réalisations + commander similaire
// 

var MKT_REALISATIONS = [];

function renderMktMenuiserie() {
  var el = document.getElementById('mkt-menuiserie-content');
  if (!el) return;

  var catFiltre = (document.getElementById('mkt-menu-cat') || {}).value || '';
  var reals = (mktGetRealData('menuiserie','realisations')).filter(function(r){

  if (!reals || reals.length === 0) { el.innerHTML = mktEmptyState('realisations menuiserie'); return; }
    return !catFiltre || r.cat === catFiltre;
  });

  el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">'
    + reals.map(function(r) {
        return '<div style="background:#fff;border-radius:14px;overflow:hidden;border:1.5px solid #e5e7eb;transition:box-shadow .2s" onmouseover="this.style.boxShadow=\'0 4px 20px rgba(0,0,0,.1)\'" onmouseout="this.style.boxShadow=\'\'">'
          + '<div style="position:relative">'
          + '<img loading="lazy" src="' + r.img + '" style="width:100%;height:180px;object-fit:cover">'
          + '<span style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,.6);color:#fff;font-size:11px;padding:3px 10px;border-radius:20px;font-weight:700">' + r.cat + '</span>'
          + '<span style="position:absolute;top:10px;right:10px;background:#007A3D;color:#fff;font-size:11px;padding:3px 10px;border-radius:20px;font-weight:700">' + r.matiere + '</span>'
          + '</div>'
          + '<div style="padding:14px">'
          + '<div style="font-weight:800;font-size:14px;margin-bottom:5px">' + r.titre + '</div>'
          + '<div style="font-size:12px;color:#666;margin-bottom:8px;min-height:30px">' + r.desc + '</div>'
          + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
          + '<div style="font-size:17px;font-weight:800;color:#007A3D">À partir de<br>' + r.prix.toLocaleString('fr-FR') + ' FCFA</div>'
          + '<div style="text-align:right;font-size:11px;color:#666">⏱ ' + r.duree + '</div>'
          + '</div>'
          + '<button onclick="ouvrirCommandeSimilaire(\'' + r.id + '\',\'' + r.titre.replace(/'/g,"\\'") + '\')" style="width:100%;background:#007A3D;color:#fff;border:none;padding:10px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer"> Commander similaire</button>'
          + 
        + (item.video_base64 || item.video ? '<div style="margin:8px -1px -1px;padding:10px;background:#f9fafb;border-top:1px solid #f0f0f0">' + mktVideoPlayer(item.video_base64 || item.video) + '</div>' : '') + '</div></div>';
      }).join('') + '</div>';
}

function ouvrirCommandeSimilaire(realId, realTitre) {
  var real = MKT_REALISATIONS.find(function(r){ return r.id === realId; });
  if (!real) return;
  document.getElementById('mkt-devis-titre').textContent = 'Commander similaire — ' + realTitre;
  document.getElementById('mkt-devis-produit').value = realTitre + ' (bois : ' + (real ? real.matiere : '') + ')';
  document.getElementById('mkt-devis-type').value = 'menuiserie';
  var extraDiv = document.getElementById('mkt-devis-extra');
  if (extraDiv) {
    extraDiv.innerHTML = '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Dimensions souhaitées</label>'
      + '<input type="text" id="mkt-dim" placeholder="Ex: L200 x H100 x P60 cm" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin:8px 0 4px">Essence de bois préférée</label>'
      + '<select id="mkt-bois" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">'
      + '<option>Fraké</option><option>Sapelli</option><option>Acajou</option><option>Iroko</option><option>Wengé</option><option>MDF (économique)</option>'
      + '</select>';
  }
  openMkt('mkt-modal-devis');
}

// 
//  SECTION 3 — RESTAURATION
//  Restaurants + menus  panier unifié  commande
// 

var MKT_RESTO_ACTIF = null; // restaurant sélectionné

// Données restaurants enrichies pour marketplace
var MKT_RESTAURANTS = [];

var MKT_MENUS = [];

function renderMktRestaurants() {
  var el = document.getElementById('mkt-resto-liste');
  if (!el) return;

  var villeFiltre = (document.getElementById('mkt-resto-ville') || {}).value || '';

  // Lire restaurants ET menus/plats depuis localStorage
  var restos = mktGetRealData('restauration', 'restaurants') || [];
  var menus  = mktGetRealData('restauration', 'menus') || [];

  // Filtrer par ville si demandé
  if (villeFiltre) {
    restos = restos.filter(function(r){ return r.ville === villeFiltre; });
    menus  = menus.filter(function(m){ return (m.ville || '') === villeFiltre; });
  }

  var html = '';

  // Afficher les restaurants si configurés
  if (restos.length > 0) {
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">'
      + restos.map(function(r) {
          return '<div onclick="ouvrirMenuResto(\'' + r.id + '\')" style="background:#fff;border-radius:14px;overflow:hidden;border:1.5px solid #e5e7eb;cursor:pointer;transition:all .2s" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 6px 24px rgba(0,0,0,.12)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'"><div style="position:relative"><img loading="lazy" src="' + (r.img||'https://picsum.photos/seed/resto/400/200') + '" style="width:100%;height:160px;object-fit:cover"><div style="position:absolute;top:10px;right:10px;background:' + (r.ouvert?'#007A3D':'#CE1126') + ';color:#fff;font-size:11px;padding:3px 10px;border-radius:20px;font-weight:700">' + (r.ouvert?'Ouvert':'Fermé') + '</div></div><div style="padding:14px"><div style="font-weight:800;font-size:15px;margin-bottom:3px">' + (r.nom||'') + '</div><div style="font-size:11px;color:#666;margin-bottom:6px">' + (r.quartier||'') + ', ' + (r.ville||'') + ' · ⏰ ' + (r.horaires||'') + '</div><div style="font-size:12px;color:#555;margin-bottom:8px;font-style:italic">' + (r.specialite||'') + '</div><button style="width:100%;margin-top:10px;background:#007A3D;color:#fff;border:none;padding:10px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">🍽 Voir le menu</button></div></div>';
        }).join('') + '</div>';
  }

  // Afficher les menus/plats directement si configurés (même sans restaurant)
  if (menus.length > 0) {
    html += '<h3 style="margin:24px 0 12px;font-size:16px;font-weight:800;color:#111">🍽 Menus & Plats</h3>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">'
      + menus.map(function(m) {
          var prix = m.prix ? Number(m.prix).toLocaleString('fr-FR') + ' FCFA' : '';
          var img  = m.img || ('https://picsum.photos/seed/' + (m.id||'menu') + '/300/200');
          return '<div style="background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb">'
            + '<img loading="lazy" src="' + img + '" data-fallback="1" style="width:100%;height:130px;object-fit:cover" onerror="if(!this.dataset.fb){this.dataset.fb=1;this.src=\'https://picsum.photos/seed/food/300/200\'}">'
            + '<div style="padding:12px">'
            + '<div style="font-weight:700;font-size:14px;margin-bottom:4px">' + (m.nom||m.name||'Plat') + '</div>'
            + (m.cat ? '<div style="font-size:11px;color:#007A3D;font-weight:600;margin-bottom:4px;text-transform:uppercase">' + m.cat + '</div>' : '')
            + (m.desc||m.description ? '<div style="font-size:12px;color:#666;margin-bottom:6px">' + (m.desc||m.description) + '</div>' : '')
            + (m.temps ? '<div style="font-size:11px;color:#888;margin-bottom:6px">⏱ ' + m.temps + ' min de préparation</div>' : '')
            + (prix ? '<div style="font-weight:800;color:#007A3D;font-size:15px;margin-bottom:10px">' + prix + '</div>' : '')
            + (m.tel
                ? '<div style="display:flex;gap:6px">'
                  + '<a href="https://wa.me/' + (m.tel||'').replace(/[\s+\-]/g,'') + '?text=' + encodeURIComponent('Bonjour, je souhaite commander: ' + (m.nom||'') + (m.prix ? ' (' + m.prix + ' FCFA)' : '')) + '" target="_blank" style="flex:1;display:block;text-align:center;background:#25D366;color:#fff;padding:9px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none">📲 Commander</a>'
                  + '<a href="tel:' + m.tel + '" style="flex:1;display:block;text-align:center;background:#007A3D;color:#fff;padding:9px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none">📞 Appeler</a>'
                  + '</div>'
                : '<a href="https://wa.me/237683392268?text=' + encodeURIComponent('Bonjour, je veux commander: ' + (m.nom||'')) + '" target="_blank" style="display:block;text-align:center;background:#25D366;color:#fff;padding:9px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none">📲 Commander via WhatsApp</a>'
              )
            + '</div></div>';
        }).join('') + '</div>';
  }

  if (!html) { el.innerHTML = mktEmptyState('restaurants'); return; }
  el.innerHTML = html;
}
function ouvrirMenuResto(restoId) {
  MKT_RESTO_ACTIF = MKT_RESTAURANTS.find(function(r){ return r.id === restoId; });
  if (!MKT_RESTO_ACTIF) return;

  var el = document.getElementById('mkt-menu-modal');
  if (!el) return;

  document.getElementById('mkt-menu-nom').textContent = MKT_RESTO_ACTIF.nom;
  document.getElementById('mkt-menu-info').textContent = MKT_RESTO_ACTIF.quartier + ', ' + MKT_RESTO_ACTIF.ville + ' · ' + MKT_RESTO_ACTIF.horaires;

  var menus = (mktGetRealData('restauration','menus') || MKT_MENUS).filter(function(m){ return m.resto === restoId; });
  var cats = [...new Set(menus.map(function(m){ return m.cat; }))];

  var html = cats.map(function(cat) {
    var catMenus = menus.filter(function(m){ return m.cat === cat; });
    return '<div style="margin-bottom:20px">'
      + '<div style="font-weight:800;font-size:13px;color:#007A3D;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #f0faf5;text-transform:uppercase;letter-spacing:.5px">' + cat + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:10px">'
      + catMenus.map(function(m) {
          return '<div style="display:flex;gap:12px;align-items:center;padding:10px;border:1px solid #f0f0f0;border-radius:10px;background:#fafafa">'
            + '<img loading="lazy" src="' + m.img + '" style="width:72px;height:72px;border-radius:8px;object-fit:cover;flex-shrink:0">'
            + '<div style="flex:1">'
            + '<div style="font-weight:700;font-size:13px">' + m.nom + '</div>'
            + '<div style="font-size:11px;color:#666;margin:2px 0">' + m.desc + '</div>'
            + '<div style="font-size:11px;color:#999">⏱ ' + m.temps + ' min</div>'
            + '</div>'
            + '<div style="text-align:right;flex-shrink:0">'
            + '<div style="font-weight:800;color:#007A3D;font-size:15px">' + m.prix.toLocaleString('fr-FR') + ' F</div>'
            + '<button onclick="mktAddPanier({id:\'resto_' + m.id + '\',nom:\'' + m.nom.replace(/'/g,"\\'") + ' (' + MKT_RESTO_ACTIF.nom.replace(/'/g,"\\'") + ')\',prix:' + m.prix + ',img:\'' + m.img + '\',source:\'Restauration\',type:\'menu\',extra:\'' + MKT_RESTO_ACTIF.nom.replace(/'/g,"\\'") + '\'})" style="margin-top:6px;background:#007A3D;color:#fff;border:none;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer">+ Panier</button>'
            + '</div></div>';
        }).join('')
      + '</div></div>';
  }).join('');

  document.getElementById('mkt-menu-content').innerHTML = html;
  openMkt('mkt-menu-modal');
}

// 
//  SECTION 4 — SANTÉ
//  Médecins + RDV + téléconsultation + Pharmacie en ligne
// 

var MKT_MEDECINS = [];

var MKT_PHARMA_PRODUITS = [];

function renderMktSante() {
  var el = document.getElementById('mkt-sante-content');
  if (!el) return;

  var tab = (document.getElementById('mkt-sante-tab') || {}).value || 'medecins';

  if (tab === 'medecins') {
    el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">'
      + (mktGetRealData('sante','medecins')||MKT_MEDECINS).map(function(m) {
          return '<div style="background:#fff;border-radius:14px;border:1.5px solid #e5e7eb;padding:16px;transition:box-shadow .2s" onmouseover="this.style.boxShadow=\'0 4px 20px rgba(0,0,0,.1)\'" onmouseout="this.style.boxShadow=\'\'">'
            + '<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">'
            + '<img loading="lazy" src="' + m.img + '" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:3px solid #007A3D">'
            + '<div>'
            + '<div style="font-weight:800;font-size:14px">' + m.nom + '</div>'
            + '<div style="font-size:12px;color:#007A3D;font-weight:600">' + m.spec + '</div>'
            + '<div style="font-size:11px;color:#666"> ' + m.quartier + ', ' + m.ville + '</div>'
            + '</div></div>'
            + '<div style="display:flex;justify-content:space-between;font-size:12px;color:#666;margin-bottom:10px">'
            + '<span>⏰ ' + m.horaires + '</span>'
            + '<span style="font-weight:700;color:#007A3D">' + m.tarif.toLocaleString('fr-FR') + ' FCFA</span>'
            + '</div>'
            + '<div style="display:flex;gap:4px;margin-bottom:10px">'
            + '<span style="background:' + (m.disponible?'#dcfce7':'#fee2e2') + ';color:' + (m.disponible?'#007A3D':'#CE1126') + ';font-size:11px;padding:2px 8px;border-radius:20px;font-weight:700">'
            + (m.disponible?'Disponible':'Complet') + '</span>'
            + (m.teleconsult?'<span style="background:#dbeafe;color:#1d4ed8;font-size:11px;padding:2px 8px;border-radius:20px;font-weight:700"> Téléconsultation</span>':'')
            + '</div>'
            + '<div style="display:flex;gap:6px">'
            + '<button onclick="ouvrirRDVMedecin(\'' + m.id + '\',\'' + m.nom.replace(/'/g,"\\'") + '\')" style="flex:1;background:#007A3D;color:#fff;border:none;padding:8px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;' + (m.disponible?'':'opacity:.5;') + '"> RDV</button>'
            + (m.teleconsult?'<button onclick="lancerTeleconsult(\'' + m.id + '\',\'' + m.nom.replace(/'/g,"\\'") + '\')" style="flex:1;background:#1d4ed8;color:#fff;border:none;padding:8px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer"> Téléconsult</button>':'')
            + '<a href="tel:' + m.tel + '" style="flex:1;background:#f0faf5;color:#007A3D;border:1.5px solid #007A3D;padding:8px;border-radius:10px;font-size:12px;font-weight:700;text-align:center;text-decoration:none"></a>'
            + '</div></div>';
        }).join('') + '</div>';
  } else {
    // Pharmacie en ligne
    el.innerHTML = '<div style="margin-bottom:12px;padding:10px;background:#fff3cd;border-radius:8px;font-size:12px;color:#856404"> Les médicaments sur ordonnance nécessitent une prescription valide. Livraison sous 24h.</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">'
      + (mktGetRealData('sante','pharmacie')||MKT_PHARMA_PRODUITS).map(function(p) {
          return '<div style="background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb">'
            + '<img loading="lazy" src="' + p.img + '" style="width:100%;height:130px;object-fit:cover">'
            + '<div style="padding:12px">'
            + '<span style="background:#f0faf5;color:#007A3D;font-size:10px;font-weight:700;padding:2px 6px;border-radius:20px">' + p.cat + '</span>'
            + (p.prescription?'<span style="background:#fee2e2;color:#CE1126;font-size:10px;font-weight:700;padding:2px 6px;border-radius:20px;margin-left:4px">Ordonnance</span>':'')
            + '<div style="font-weight:700;font-size:13px;margin:6px 0 4px">' + p.nom + '</div>'
            + '<div style="font-size:16px;font-weight:800;color:#007A3D;margin-bottom:8px">' + p.prix.toLocaleString('fr-FR') + ' FCFA</div>'
            + '<button onclick="' + (p.prescription?'alertOrdonnance()':'mktAddPanier({id:\'ph_' + p.id + '\',nom:\'' + p.nom.replace(/'/g,"\\'") + '\',prix:' + p.prix + ',img:\'' + p.img + '\',source:\'Pharmacie\',type:\'medicament\'})') + '" style="width:100%;background:' + (p.prescription?'#CE1126':'#007A3D') + ';color:#fff;border:none;padding:8px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">'
            + (p.prescription?' Ordonnance requise':' Commander') + '</button>'
            + 
        + (item.video_base64 || item.video ? '<div style="margin:8px -1px -1px;padding:10px;background:#f9fafb;border-top:1px solid #f0f0f0">' + mktVideoPlayer(item.video_base64 || item.video) + '</div>' : '') + '</div></div>';
        }).join('') + '</div>';
  }
}

function alertOrdonnance() {
  mktToast(' Envoyez votre ordonnance par WhatsApp avant commande');
}

function ouvrirRDVMedecin(medId, medNom) {
  document.getElementById('mkt-devis-titre').textContent = ' Prendre RDV — ' + medNom;
  document.getElementById('mkt-devis-produit').value = 'Consultation avec ' + medNom;
  document.getElementById('mkt-devis-type').value = 'sante_rdv';
  var extra = document.getElementById('mkt-devis-extra');
  if (extra) {
    extra.innerHTML = '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Motif de la consultation</label>'
      + '<input type="text" id="mkt-motif" placeholder="Ex: Fièvre, Contrôle, Bilan..." style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin:8px 0 4px">Date souhaitée</label>'
      + '<input type="date" id="mkt-date-rdv" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin:8px 0 4px">Créneau préféré</label>'
      + '<select id="mkt-creneau" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">'
      + '<option>Matin (08h-12h)</option><option>Après-midi (12h-17h)</option><option>Soir (17h-20h)</option>'
      + '</select>';
  }
  openMkt('mkt-modal-devis');
}

function lancerTeleconsult(medId, medNom) {
  var med = MKT_MEDECINS.find(function(m){ return m.id === medId; });
  if (!med) return;
  // Ouvrir Jitsi Meet avec un room dédié au médecin
  var room = 'kamer360-' + medNom.replace(/\s+/g,'-').replace(/[^a-zA-Z0-9-]/g,'').toLowerCase();
  var url = 'https://meet.jit.si/' + room;
  window.open(url, '_blank');
  mktToast(' Téléconsultation avec ' + medNom + ' — Partagez ce lien avec le médecin');
}

// 
//  SECTION 5 — BTP
//  Catalogue matériaux + Artisans partenaires  devis
// 

var MKT_BTP_MATERIAUX = [];

var MKT_ARTISANS = [];

function renderMktBTP() {
  var el = document.getElementById('mkt-btp-content');
  if (!el) return;

  var tab = (document.getElementById('mkt-btp-tab') || {}).value || 'materiaux';

  if (tab === 'materiaux') {
    var catFiltre = (document.getElementById('mkt-btp-cat') || {}).value || '';
    var mats = (mktGetRealData('btp','produits')||MKT_BTP_MATERIAUX).filter(function(m){ return !catFiltre || m.cat === catFiltre; });

    el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px">'
      + mats.map(function(m) {
          return '<div style="background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb">'
            + '<img loading="lazy" src="' + m.img + '" style="width:100%;height:130px;object-fit:cover">'
            + '<div style="padding:12px">'
            + '<span style="background:#fef3c7;color:#b45309;font-size:10px;font-weight:700;padding:2px 6px;border-radius:20px">' + m.cat + '</span>'
            + '<div style="font-weight:700;font-size:13px;margin:6px 0 4px">' + m.nom + '</div>'
            + '<div style="font-size:16px;font-weight:800;color:#007A3D;margin-bottom:4px">' + m.prix.toLocaleString('fr-FR') + ' FCFA</div>'
            + '<div style="font-size:11px;color:#666;margin-bottom:8px">par ' + m.unite + ' · Stock: ' + m.stock + '</div>'
            + '<div style="display:flex;gap:6px">'
            + '<button onclick="mktAddPanier({id:\'btp_' + m.id + '\',nom:\'' + m.nom.replace(/'/g,"\\'") + '\',prix:' + m.prix + ',img:\'' + m.img + '\',source:\'BTP\',type:\'materiau\'})" style="flex:1;background:#007A3D;color:#fff;border:none;padding:7px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer"> Ajouter</button>'
            + '<button onclick="ouvrirDevisBTP(\'mat\',\'' + m.nom.replace(/'/g,"\\'") + '\')" style="flex:1;background:#f0faf5;color:#007A3D;border:1.5px solid #007A3D;padding:7px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer"> Devis</button>'
            + '</div></div></div>';
        }).join('') + '</div>';
  } else {
    // Artisans
    el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">'
      + (mktGetRealData('btp','artisans')||MKT_ARTISANS).map(function(a) {
          return '<div style="background:#fff;border-radius:14px;border:1.5px solid #e5e7eb;padding:16px;transition:box-shadow .2s" onmouseover="this.style.boxShadow=\'0 4px 20px rgba(0,0,0,.1)\'" onmouseout="this.style.boxShadow=\'\'">'
            + '<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">'
            + '<img loading="lazy" src="' + a.img + '" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:3px solid #007A3D">'
            + '<div>'
            + '<div style="font-weight:800;font-size:14px">' + a.nom + '</div>'
            + '<div style="font-size:12px;color:#007A3D;font-weight:600"> ' + a.metier + '</div>'
            + '<div style="font-size:11px;color:#666"> ' + a.ville + ' ·  ' + a.note + '</div>'
            + '</div></div>'
            + '<div style="font-size:12px;color:#555;margin-bottom:8px;font-style:italic">' + a.specialite + '</div>'
            + '<div style="display:flex;justify-content:space-between;font-size:12px;color:#666;margin-bottom:10px">'
            + '<span> ' + a.chantiers + ' chantiers réalisés</span>'
            + '<span style="font-weight:700;color:#007A3D">' + a.tarif + '</span>'
            + '</div>'
            + '<div style="display:flex;gap:6px">'
            + '<button onclick="ouvrirDevisBTP(\'artisan\',\'' + a.nom.replace(/'/g,"\\'") + ' — ' + a.metier + '\')" style="flex:2;background:#007A3D;color:#fff;border:none;padding:9px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer"> Demander un devis</button>'
            + '<a href="https://wa.me/' + a.tel.replace(/[\s+\-]/g,'') + '?text=Bonjour+' + encodeURIComponent(a.nom) + ',+je+souhaite+un+devis+pour+des+travaux." target="_blank" style="flex:1;background:#25D366;color:#fff;padding:9px;border-radius:10px;font-size:12px;font-weight:700;text-align:center;text-decoration:none">WhatsApp</a>'
            + 
      + (m.video_base64 || m.video ? '<div style="padding:8px 13px 10px;background:#f9fafb;border-top:1px solid #f0f0f0">' + mktVideoPlayer(m.video_base64 || m.video) + '</div>' : '')
      + '</div></div>';
        }).join('') + '</div>';
  }
}

function ouvrirDevisBTP(type, nom) {
  document.getElementById('mkt-devis-titre').textContent = (type === 'artisan' ? ' Devis — ' : ' Devis commande — ') + nom;
  document.getElementById('mkt-devis-produit').value = nom;
  document.getElementById('mkt-devis-type').value = 'btp_' + type;
  var extra = document.getElementById('mkt-devis-extra');
  if (extra) {
    extra.innerHTML = type === 'materiau'
      ? '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Quantité souhaitée</label>'
        + '<input type="number" id="mkt-qte" placeholder="Ex: 50 sacs" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box">'
        + '<label style="font-size:12px;font-weight:600;display:block;margin:8px 0 4px">Adresse de livraison</label>'
        + '<input type="text" id="mkt-livraison" placeholder="Quartier, ville..." style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box">'
      : '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Description des travaux</label>'
        + '<textarea id="mkt-travaux" rows="3" placeholder="Ex: Peinture intérieure 3 chambres + salon, 120m²..." style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box;resize:vertical"></textarea>'
        + '<label style="font-size:12px;font-weight:600;display:block;margin:8px 0 4px">Date de début souhaitée</label>'
        + '<input type="date" id="mkt-debut" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">';
  }
  openMkt('mkt-modal-devis');
}

// 
//  FORMULAIRE DEVIS GÉNÉRIQUE (partagé par tous les modules)
// 

var MKT_DEVIS = [];
var mkt_seq = 1;

function soumettreDevisMkt() {
  var nom    = (document.getElementById('mkt-nom')    || {}).value || '';
  var tel    = (document.getElementById('mkt-tel')    || {}).value || '';
  var produit= (document.getElementById('mkt-devis-produit') || {}).value || '';
  var type   = (document.getElementById('mkt-devis-type') || {}).value || '';
  var message= (document.getElementById('mkt-message') || {}).value || '';

  if (!nom || !tel) { mktToast(' Nom et téléphone requis !'); return; }

  var devis = {
    id: 'MKT-' + String(mkt_seq++).padStart(4,'0'),
    nom: nom, tel: tel, produit: produit, type: type, message: message,
    date: new Date().toLocaleDateString('fr-FR')
  };
  MKT_DEVIS.push(devis);

  // Envoyer via WhatsApp au gérant/service concerné
  var texteWA = ' Demande de devis KAMER360\n'
    + 'Réf: ' + devis.id + '\n'
    + 'Client: ' + nom + ' (' + tel + ')\n'
    + 'Service: ' + produit + '\n'
    + (message ? 'Détails: ' + message : '');

  // Ouvrir WhatsApp pour envoyer au service
  var waNum = '237677000000'; // numéro principal KAMER360
  window.open('https://wa.me/' + waNum + '?text=' + encodeURIComponent(texteWA), '_blank');

  closeMkt('mkt-modal-devis');
  mktToast(' Devis ' + devis.id + ' envoyé ! Réponse sous 2h.');

  // Reset form
  ['mkt-nom','mkt-tel','mkt-message','mkt-devis-extra'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.value !== undefined ? el.value = '' : el.innerHTML = '';
  });
}

// 
//  UTILITAIRES — Ouvrir/Fermer modals marketplace
// 

function openMkt(id) {
  var el = document.getElementById(id);
  if (el) { el.style.display = 'flex'; el.classList.add('active'); }
}
function closeMkt(id) {
  var el = document.getElementById(id);
  if (el) { el.style.display = 'none'; el.classList.remove('active'); }
}

// Initialiser la marketplace
function initMarketplace() {
  // Sync Supabase si disponible, puis render
  if (typeof mktSyncFromSupabase === 'function') {
    mktSyncFromSupabase().then(function() { _renderAllMktSections(); });
  } else {
    _renderAllMktSections();
  }
}
function _renderAllMktSections() {
  renderMktEnergie();
  renderMktEducation();
  renderMktImmobilier();
  renderMktCoiffure();
  renderMktLogistique();
  renderMktAgriculture();
  renderMktAutomobile();
  renderMktPressing();
  renderMktMenuiserie();
  renderMktRestaurants();
  renderMktSante();
  renderMktBTP();
  // Sections dynamiques Supabase — chargement async
  if (typeof chargerDonneesAutoMkt === 'function') {
    chargerDonneesAutoMkt().then(renderMktAutomobile);
  }
  if (typeof chargerDonneesPressingMkt === 'function') {
    chargerDonneesPressingMkt().then(renderMktPressing);
  }
}

function switchMktTab(tab) {
  // Recharger les donnees dynamiques Supabase si necessaire
  if (tab === 'automobile' && typeof renderMktAutomobile === 'function') {
    if (typeof chargerDonneesAutoMkt === 'function') chargerDonneesAutoMkt().then(renderMktAutomobile);
    else renderMktAutomobile();
  }
  if (tab === 'pressing' && typeof renderMktPressing === 'function') {
    if (typeof chargerDonneesPressingMkt === 'function') chargerDonneesPressingMkt().then(renderMktPressing);
    else renderMktPressing();
  }
  // Reinitialiser le sous-onglet Education au changement d'onglet principal
  if (tab !== 'education') {
    var eduTab = document.getElementById('mkt-edu-tab');
    if (eduTab) eduTab.value = 'fournitures';
  }
  document.querySelectorAll('.mkt-tab-btn').forEach(function(btn) {
    btn.classList.remove('active');
    btn.style.background = '';
    btn.style.color = '';
  });
  document.querySelectorAll('.mkt-section').forEach(function(s){ s.style.display = 'none'; });
  
  var activeBtn = document.getElementById('tab-' + tab);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.style.background = '#007A3D';
    activeBtn.style.color = '#fff';
  }
  
  var section = document.getElementById('mkt-' + tab);
  if (section) section.style.display = 'block';
}

// 
//  SECTION 6 — ÉDUCATION
//  Fournitures scolaires | Cours particuliers | Librairie
// 

//  Fournitures scolaires (enrichies) 
var MKT_FOURNITURES = [];

//  Cours particuliers (enrichis) 
var MKT_COURS = [];

//  Librairie (livres scolaires + romans + BD) 
var MKT_LIVRES = [];

//  Render Éducation 
function renderMktEducation() {
  var sousTab = (document.getElementById('mkt-edu-tab') || {}).value || 'fournitures';

  if (sousTab === 'fournitures') {
    renderMktFournitures();
  } else if (sousTab === 'cours') {
    renderMktCours();
  } else {
    renderMktLivres();
  }
}

//  Render Fournitures 
function renderMktFournitures() {
  var el = document.getElementById('mkt-edu-content');
  if (!el) return;

  var catF = (document.getElementById('mkt-edu-cat') || {}).value || '';
  var searchF = ((document.getElementById('mkt-edu-search') || {}).value || '').toLowerCase();
  var prods = mktGetRealData('education','fournitures') || MKT_FOURNITURES(function(p) {

  if (!prods || prods.length === 0) { el.innerHTML = mktEmptyState('fournitures scolaires'); return; }
    return (!catF || p.cat === catF)
        && (!searchF || p.nom.toLowerCase().includes(searchF));
  });

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">';
  prods.forEach(function(p) {
    var stockColor = p.stock < 20 ? '#CE1126' : p.stock < 100 ? '#f59e0b' : '#007A3D';
    var stockTxt   = p.stock === 9999 ? 'Illimité' : 'Stock: ' + p.stock;
    html += '<div style="background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
            + '<img loading="lazy" src="' + img + '" data-fallback="1" style="width:100%;height:130px;object-fit:cover" onerror="if(!this.dataset.fb){this.dataset.fb=1;this.src=\'https://picsum.photos/seed/food/300/200\'}">'
    html += '<div style="padding:11px">';
    html += '<span style="background:#dbeafe;color:#1d4ed8;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px">' + p.cat + '</span>';
    html += '<div style="font-weight:700;font-size:13px;margin:6px 0 3px;line-height:1.3">' + p.nom + '</div>';
    html += '<div style="font-size:11px;color:#666;margin-bottom:7px">' + p.desc + '</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    html += '<div style="font-size:17px;font-weight:800;color:#007A3D">' + p.prix.toLocaleString('fr-FR') + ' F</div>';
    html += '<div style="font-size:10px;color:' + stockColor + ';font-weight:600">' + stockTxt + '</div>';
    html += '</div>';
    html += '<button onclick="mktAddPanier({id:\'' + p.id + '\',nom:\'' + p.nom.replace(/'/g, '') + '\',prix:' + p.prix + ',img:\'' + p.img + '\',source:\'Education\',type:\'fourniture\'})" ';
    html += 'style="width:100%;background:#007A3D;color:#fff;border:none;padding:8px;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer"> Ajouter au panier</button>';
    html += 
        + (item.video_base64 || item.video ? '<div style="margin:8px -1px -1px;padding:10px;background:#f9fafb;border-top:1px solid #f0f0f0">' + mktVideoPlayer(item.video_base64 || item.video) + '</div>' : '') + '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function renderMktCours() {
  var el = document.getElementById('mkt-edu-content');
  if (!el) return;

  var searchF = ((document.getElementById('mkt-edu-search') || {}).value || '').toLowerCase();
  var cours = (mktGetRealData('education','cours')||MKT_COURS).filter(function(c) {

  if (!cours || cours.length === 0) { el.innerHTML = mktEmptyState('cours particuliers'); return; }
    return !searchF || c.matiere.toLowerCase().includes(searchF) || c.desc.toLowerCase().includes(searchF);
  });

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px">';
  cours.forEach(function(c) {
    var dispoBg  = c.dispo ? '#007A3D' : '#CE1126';
    var dispoTxt = c.dispo ? 'Disponible' : 'Complet';
    var waNum    = c.tel.replace(/[\s+\-]/g, '');
    var waTxt    = encodeURIComponent('Bonjour, cours de ' + c.matiere);

    html += '<div style="background:#fff;border-radius:14px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<div style="position:relative">';
    html += '<img loading="lazy" src="' + c.img + '" style="width:100%;height:140px;object-fit:cover" onerror="imgFallback(this)">';
    html += '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 60%)">';
    html += '<div style="position:absolute;bottom:10px;left:12px">';
    html += '<div style="font-size:26px">' + c.icon + '</div>';
    html += '<div style="color:#fff;font-weight:800;font-size:16px">' + c.matiere + '</div>';
    html += '<div style="color:rgba(255,255,255,.8);font-size:11px">' + c.niveaux + '</div>';
    html += '</div>';
    html += '<div style="position:absolute;top:10px;right:10px;background:' + dispoBg + ';color:#fff;font-size:11px;padding:3px 10px;border-radius:20px;font-weight:700">' + dispoTxt + '</div>';
    html += '</div></div>';
    html += '<div style="padding:14px">';
    html += '<div style="font-size:12px;color:#555;margin-bottom:8px;line-height:1.5">' + c.desc + '</div>';
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">';
    var modeIcons = {'Domicile':'','En ligne':'','Groupe':'','Présentiel':''};
    c.modes.forEach(function(m) {
      html += '<span style="background:#f0faf5;color:#007A3D;font-size:11px;padding:3px 9px;border-radius:20px;font-weight:600">' + (modeIcons[m]||'') + ' ' + m + '</span>';
    });
    html += '</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
    html += '<div><div style="font-size:11px;color:#666"> ' + c.enseignant + '</div>';
    html += '<div style="font-size:11px;color:#666;margin-top:2px"> ' + c.ville + '</div></div>';
    html += '<div style="text-align:right"><div style="font-size:18px;font-weight:800;color:#007A3D">' + c.tarif_heure.toLocaleString('fr-FR') + ' F</div>';
    html += '<div style="font-size:10px;color:#999">par heure</div></div>';
    html += '</div>';
    html += '<div style="display:flex;gap:7px">';
    html += '<button onclick="ouvrirReservCours(\'' + c.id + '\',\'' + c.matiere.replace(/'/g,'').replace(/&/g,'et') + '\')" style="flex:2;background:#007A3D;color:#fff;border:none;padding:9px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer"> Réserver un cours</button>';
    html += '<a href="https://wa.me/' + waNum + '?text=' + waTxt + '" target="_blank" style="flex:1;background:#25D366;color:#fff;padding:9px;border-radius:10px;font-size:12px;font-weight:700;text-align:center;text-decoration:none">WhatsApp</a>';
    html += '</div></div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function renderMktLivres() {
  var el = document.getElementById('mkt-edu-content');
  if (!el) return;

  var catF    = (document.getElementById('mkt-edu-cat') || {}).value || '';
  var searchF = ((document.getElementById('mkt-edu-search') || {}).value || '').toLowerCase();
  var livres  = mktGetRealData('education','livres') || MKT_LIVRES(function(l) {

  if (!livres || livres.length === 0) { el.innerHTML = mktEmptyState('livres'); return; }
    return (!catF || l.cat === catF)
        && (!searchF || l.nom.toLowerCase().includes(searchF) || l.auteur.toLowerCase().includes(searchF));
  });

  var catColors     = {'Scolaire':'#dbeafe','Roman':'#fce7f3','Développement':'#d1fae5','BD/Jeunesse':'#fef3c7'};
  var catTextColors = {'Scolaire':'#1d4ed8','Roman':'#be185d','Développement':'#007A3D','BD/Jeunesse':'#b45309'};

  var stats = '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">';
  ['Scolaire','Roman','Développement','BD/Jeunesse'].forEach(function(cat) {
    var nb = (mktGetRealData('education','livres')||MKT_LIVRES).filter(function(l){ return l.cat === cat; }).length;
    stats += '<button onclick="document.getElementById(\'mkt-edu-cat\').value=\'' + cat + '\';renderMktLivres()" ';
    stats += 'style="background:#fff;border:1.5px solid #e5e7eb;border-radius:10px;padding:7px 12px;font-size:12px;font-weight:700;color:#555;cursor:pointer">';
    stats += cat + ' <span style="color:#007A3D">(' + nb + ')</span></button>';
  });
  stats += '</div>';

  var html = stats + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">';
  livres.forEach(function(l) {
    var bg = catColors[l.cat] || '#f3f4f6';
    var tc = catTextColors[l.cat] || '#374151';
    html += '<div style="background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<img loading="lazy" src="' + l.img + '" style="width:100%;height:140px;object-fit:cover" onerror="imgFallback(this)">';
    html += '<div style="padding:11px">';
    html += '<span style="background:' + bg + ';color:' + tc + ';font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px">' + l.cat + '</span>';
    if (l.niveau) html += '<span style="background:#f3f4f6;color:#555;font-size:10px;padding:2px 7px;border-radius:20px;margin-left:4px">' + l.niveau + '</span>';
    html += '<div style="font-weight:700;font-size:13px;margin:6px 0 2px;line-height:1.3">' + l.nom + '</div>';
    html += '<div style="font-size:11px;color:#007A3D;font-weight:600;margin-bottom:3px"> ' + l.auteur + '</div>';
    html += '<div style="font-size:11px;color:#666;margin-bottom:8px;line-height:1.4">' + l.desc + '</div>';
    html += '<div style="font-size:17px;font-weight:800;color:#007A3D;margin-bottom:8px">' + l.prix.toLocaleString('fr-FR') + ' FCFA</div>';
    html += '<button onclick="mktAddPanier({id:\'' + l.id + '\',nom:\'' + l.nom.replace(/'/g,'').replace(/[()]/g,'') + '\',prix:' + l.prix + ',img:\'' + l.img + '\',source:\'Librairie\',type:\'livre\'})" ';
    html += 'style="width:100%;background:#007A3D;color:#fff;border:none;padding:8px;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer"> Commander</button>';
    html += '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function ouvrirReservCours(coursId, matiere) {
  var cours = MKT_COURS.find(function(c){ return c.id === coursId; });
  document.getElementById('mkt-devis-titre').textContent = ' Réserver — Cours de ' + matiere;
  document.getElementById('mkt-devis-produit').value = 'Cours particulier : ' + matiere;
  document.getElementById('mkt-devis-type').value = 'cours_particulier';

  var extra = document.getElementById('mkt-devis-extra');
  if (extra && cours) {
    extra.innerHTML = ''
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Niveau scolaire</label>'
      + '<select id="mkt-niveau" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;margin-bottom:10px">'
      + '<option>Primaire (CE1-CM2)</option>'
      + '<option>Collège (6e-3e)</option>'
      + '<option>Lycée (2nde-Tle)</option>'
      + '<option>Université / Grandes Écoles</option>'
      + '</select>'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Mode de cours souhaité</label>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">'
      + cours.modes.map(function(m) {
          return '<label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer">'
            + '<input type="radio" name="mkt-mode" value="' + m + '"> ' + m + '</label>';
        }).join('')
      + '</div>'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Disponibilités</label>'
      + '<select id="mkt-dispo" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">'
      + '<option>Semaine — Matin (08h-12h)</option>'
      + '<option>Semaine — Après-midi (12h-17h)</option>'
      + '<option>Semaine — Soir (17h-20h)</option>'
      + '<option>Weekend — Matin</option>'
      + '<option>Weekend — Après-midi</option>'
      + '</select>';
  }
  openMkt('mkt-modal-devis');
}

function mktHover(el, on) {
  el.style.boxShadow = on ? '0 4px 20px rgba(0,0,0,.1)' : '';
  if (on) el.style.transform = 'translateY(-1px)';
  else el.style.transform = '';
}

// 
//  SECTION 7 — IMMOBILIER
//  Annonces immobilières + Agents immobiliers
// 

var MKT_BIENS_IMMO = [];

var MKT_AGENTS_IMMO = [];

function renderMktImmobilier() {
  var el = document.getElementById('mkt-immo-content');
  if (!el) return;
  var tab = (document.getElementById('mkt-immo-tab') || {}).value || 'annonces';
  if (tab === 'annonces') renderMktAnnonces();
  else renderMktAgentsImmo();
}

function renderMktAnnonces() {
  var el = document.getElementById('mkt-immo-content');
  if (!el) return;
  var typeF  = (document.getElementById('mkt-immo-type')  || {}).value || '';
  var villeF = (document.getElementById('mkt-immo-ville') || {}).value || '';
  var realBiens = mktGetRealData('immobilier','biens');
  var biens  = (realBiens || MKT_BIENS_IMMO).filter(function(b) {

  if (!biens || biens.length === 0) { el.innerHTML = mktEmptyState('biens immobiliers'); return; }
    return (!typeF  || b.type  === typeF)
        && (!villeF || b.ville === villeF);
  });

  var typeColors = { Location:'#dbeafe', Vente:'#dcfce7', Hotel:'#fef3c7' };
  var statutColors = { disponible:'#007A3D', loue:'#f59e0b', vendu:'#CE1126' };
  var statutLabels = { disponible:'Disponible', loue:'Loué', vendu:'Vendu' };

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">';
  biens.forEach(function(b) {
    var prixAff = b.periode ? b.prix.toLocaleString('fr-FR') + ' FCFA/' + b.periode : b.prix.toLocaleString('fr-FR') + ' FCFA';
    var tc = typeColors[b.type] || '#f0faf5';
    var sc = statutColors[b.statut] || '#007A3D';
    var sl = statutLabels[b.statut] || b.statut;
    html += '<div style="background:#fff;border-radius:14px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<div style="position:relative">';
    html += '<img loading="lazy" src="' + b.img + '" style="width:100%;height:170px;object-fit:cover" onerror="imgFallback(this)">';
    html += '<div style="position:absolute;top:10px;left:10px;display:flex;gap:6px">';
    html += '<span style="background:' + tc + ';font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">' + b.type + ' · ' + b.cat + '</span>';
    html += '<span style="background:' + sc + ';color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">' + sl + '</span>';
    html += 
      + (s.video_base64 || s.video ? '<div style="padding:8px 13px 10px;background:#f9fafb;border-top:1px solid #f0f0f0">' + mktVideoPlayer(s.video_base64 || s.video) + '</div>' : '')
      + '</div></div>';
    html += '<div style="padding:14px">';
    html += '<div style="font-weight:800;font-size:14px;margin-bottom:4px">' + b.titre + '</div>';
    html += '<div style="font-size:12px;color:#555;margin-bottom:4px"> ' + b.quartier + ', <strong>' + b.ville + '</strong></div>';
    html += '<div style="display:flex;gap:10px;font-size:11px;color:#666;margin-bottom:6px">';
    if (b.superficie > 0) html += '<span> ' + b.superficie + ' m²</span>';
    if (b.chambres > 0)   html += '<span> ' + b.chambres + ' ch.</span>';
    html += '</div>';
    html += '<div style="font-size:12px;color:#777;font-style:italic;margin-bottom:8px">' + b.desc + '</div>';
    html += '<div style="font-size:19px;font-weight:800;color:#007A3D;margin-bottom:10px">' + prixAff + '</div>';
    html += '<div style="font-size:11px;color:#666;margin-bottom:10px"> Agent: <strong>' + b.agent + '</strong></div>';
    html += '<div style="display:flex;gap:7px">';
    html += '<a href="tel:' + b.tel + '" style="flex:1;background:#007A3D;color:#fff;padding:9px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;text-align:center"> Appeler</a>';
    html += '<a href="https://wa.me/' + b.tel.replace(/[\s+\-]/g,'') + '?text=' + encodeURIComponent('Bonjour, je suis intéressé par: ' + b.titre) + '" target="_blank" style="flex:1;background:#25D366;color:#fff;padding:9px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;text-align:center">WhatsApp</a>';
    html += '<button onclick="ouvrirDevisImmo(\'' + b.id + '\',\'' + b.titre.replace(/'/g,'') + '\')" style="flex:1;background:#f0faf5;color:#007A3D;border:1.5px solid #007A3D;padding:9px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer"> Contact</button>';
    html += '</div></div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function renderMktAgentsImmo() {
  var el = document.getElementById('mkt-immo-content');
  if (!el) return;
  var realAgents = mktGetRealData('immobilier','agents');
  var AGENTS_SOURCE = realAgents || MKT_AGENTS_IMMO;
  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">';
  AGENTS_SOURCE.forEach(function(a) {
    var biens_a = MKT_BIENS_IMMO.filter(function(b){ return b.agent === a.nom; }).length;

  if (!biens || biens.length === 0) { el.innerHTML = mktEmptyState('agents immobiliers'); return; }
    html += '<div style="background:#fff;border-radius:14px;border:1.5px solid #e5e7eb;padding:18px;text-align:center" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<img loading="lazy" src="' + a.photo + '" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:3px solid #007A3D;margin:0 auto 10px" onerror="imgFallback(this)">';
    html += '<div style="font-weight:800;font-size:15px">' + a.nom + '</div>';
    html += '<div style="font-size:12px;color:#007A3D;font-weight:600;margin:3px 0">' + a.specialite + '</div>';
    html += '<div style="font-size:11px;color:#666;margin-bottom:10px"> ' + a.ville + ' ·  ' + a.note + '</div>';
    html += '<div style="display:flex;justify-content:center;gap:16px;margin-bottom:12px">';
    html += '<div><div style="font-weight:800;color:#007A3D;font-size:18px">' + biens_a + '</div><div style="font-size:11px;color:#999">Biens</div></div>';
    html += '<div><div style="font-weight:800;color:#007A3D;font-size:18px">' + a.commission + '%</div><div style="font-size:11px;color:#999">Commission</div></div>';
    html += '<div><div style="font-weight:800;color:#007A3D;font-size:18px">' + a.ventes + '</div><div style="font-size:11px;color:#999">Ventes</div></div>';
    html += '</div>';
    html += '<div style="display:flex;gap:7px">';
    html += '<a href="tel:' + a.tel + '" style="flex:1;background:#007A3D;color:#fff;padding:9px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;text-align:center"> Appeler</a>';
    html += '<a href="https://wa.me/' + a.tel.replace(/[\s+\-]/g,'') + '" target="_blank" style="flex:1;background:#25D366;color:#fff;padding:9px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;text-align:center">WhatsApp</a>';
    html += '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function ouvrirDevisImmo(bienId, bienTitre) {
  document.getElementById('mkt-devis-titre').textContent = 'Contact — ' + bienTitre;
  document.getElementById('mkt-devis-produit').value = bienTitre;
  document.getElementById('mkt-devis-type').value = 'immobilier';
  var extra = document.getElementById('mkt-devis-extra');
  if (extra) {
    extra.innerHTML = '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Disponibilité visite</label>'
      + '<select id="mkt-visite" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">'
      + '<option>Semaine matin</option><option>Semaine après-midi</option><option>Weekend</option><option>Selon disponibilité</option>'
      + '</select>';
  }
  openMkt('mkt-modal-devis');
}

// 
//  SECTION 8 — COIFFURE
//  Services + Galerie photos + Réservation
// 

var MKT_COIFFURE_SERVICES = [];

var MKT_GALERIE_COIFFURE = [];

function renderMktCoiffure() {
  var el = document.getElementById('mkt-coif-content');
  if (!el) return;
  var tab = (document.getElementById('mkt-coif-tab') || {}).value || 'services';
  if (tab === 'services') renderMktCoifServices();
  else renderMktCoifGalerie();
}

function renderMktCoifServices() {
  var el = document.getElementById('mkt-coif-content');
  if (!el) return;
  var genreF = (document.getElementById('mkt-coif-genre') || {}).value || '';
  var catF   = (document.getElementById('mkt-coif-cat') || {}).value || '';
  // Lire les vraies données du gérant en priorité
  var realServices = mktGetRealData('coiffure','services');
  var SOURCE = realServices || MKT_COIFFURE_SERVICES;
  var svcs   = SOURCE.filter(function(s) {

  if (!svcs || svcs.length === 0) { el.innerHTML = mktEmptyState('services coiffure'); return; }
    return (!genreF || s.genre === genreF) && (!catF || s.cat === catF);
  });

  var catColors = {'Tressage':'#fce7f3','Tissage':'#e0e7ff','Défrisage':'#d1fae5','Couleur':'#fef3c7','Soin':'#dbeafe','Coupe':'#f3f4f6','Locks':'#ede9fe','Forfait':'#fee2e2','Ongles':'#fdf2f8','Abonnement':'#d1fae5','Rasage':'#f9fafb'};
  var catTC = {'Tressage':'#be185d','Tissage':'#3730a3','Défrisage':'#007A3D','Couleur':'#b45309','Soin':'#1d4ed8','Coupe':'#374151','Locks':'#5b21b6','Forfait':'#991b1b','Ongles':'#86198f','Abonnement':'#065f46','Rasage':'#374151'};

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">';
  svcs.forEach(function(s) {
    var dureeStr = s.duree > 0 ? '⏱ ' + s.duree + ' min' : ' Mensuel';
    var bg = catColors[s.cat] || '#f9fafb';
    var tc = catTC[s.cat] || '#374151';
    html += '<div style="background:#fff;border-radius:14px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<div style="position:relative">';
    html += '<img loading="lazy" src="' + s.img + '" style="width:100%;height:160px;object-fit:cover" onerror="imgFallback(this)">';
    html += '<span style="position:absolute;top:10px;left:10px;background:' + bg + ';color:' + tc + ';font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">' + s.cat + '</span>';
    html += '<span style="position:absolute;top:10px;right:10px;background:' + (s.genre === 'femme' ? '#fce7f3' : '#dbeafe') + ';color:' + (s.genre === 'femme' ? '#be185d' : '#1d4ed8') + ';font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">' + (s.genre === 'femme' ? ' Femme' : ' Homme') + '</span>';
    html += '</div>';
    html += '<div style="padding:13px">';
    html += '<div style="font-weight:800;font-size:14px;margin-bottom:4px">' + s.nom + '</div>';
    html += '<div style="font-size:12px;color:#555;margin-bottom:8px">' + s.desc + '</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
    html += '<div style="font-size:19px;font-weight:800;color:#007A3D">' + s.prix.toLocaleString('fr-FR') + ' F</div>';
    html += '<div style="font-size:11px;color:#666">' + dureeStr + '</div>';
    html += '</div>';
    if (s.galerie && s.galerie.length > 0) {
      html += '<div style="display:flex;gap:4px;margin-bottom:10px">';
      s.galerie.slice(0,3).forEach(function(gimg) {
        html += '<img loading="lazy" src="' + gimg + '" style="width:48px;height:48px;border-radius:6px;object-fit:cover;cursor:pointer" onerror="imgFallback(this)" onclick="agrandirPhoto(this.src,\'' + s.nom + '\')" title="Voir photo">';
      });
      if (s.galerie.length > 3) html += '<div style="width:48px;height:48px;border-radius:6px;background:#f0faf5;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#007A3D;cursor:pointer" onclick="renderMktCoifGalerie()">+' + (s.galerie.length-3) + '</div>';
      html += '</div>';
    }
    html += '<button onclick="ouvrirRdvCoiffure(\'' + s.id + '\',\'' + s.nom.replace(/'/g,'') + '\')" style="width:100%;background:#007A3D;color:#fff;border:none;padding:10px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer"> Réserver ce service</button>';
    html += 
      + (s.video_base64 || s.video ? '<div style="padding:8px 13px 10px;background:#f9fafb;border-top:1px solid #f0f0f0">' + mktVideoPlayer(s.video_base64 || s.video) + '</div>' : '')
      + '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function renderMktCoifGalerie() {
  var el = document.getElementById('mkt-coif-content');
  if (!el) return;
  var catF = (document.getElementById('mkt-coif-cat') || {}).value || '';
  var photos = (mktGetRealData('coiffure','galerie') || MKT_GALERIE_COIFFURE)(function(g){ return !catF || g.cat === catF; });
  var html = '<div style="margin-bottom:12px;font-size:13px;color:#666"> ' + photos.length + ' réalisations dans notre galerie — cliquez pour agrandir</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px">';
  photos.forEach(function(g) {
    html += '<div style="border-radius:12px;overflow:hidden;cursor:pointer;aspect-ratio:1;position:relative" onclick="agrandirPhoto(\'' + g.img + '\',\'' + g.label + '\')">';
    html += '<img loading="lazy" src="' + g.img + '" style="width:100%;height:100%;object-fit:cover;transition:transform .3s" onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'\'" onerror="imgFallback(this)">';
    html += '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.6));padding:8px;color:#fff;font-size:11px;font-weight:600">' + g.label + '</div>';
    html += '</div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function agrandirPhoto(src, label) {
  var m = document.getElementById('mkt-photo-modal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'mkt-photo-modal';
    m.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:5000;justify-content:center;align-items:center;flex-direction:column;cursor:pointer';
    m.onclick = function(){ this.style.display='none'; };
    m.innerHTML = '<img loading="lazy" id="mkt-photo-grande" style="max-width:90vw;max-height:80vh;border-radius:12px;object-fit:contain"><div id="mkt-photo-label" style="color:#fff;font-size:14px;font-weight:600;margin-top:12px;text-align:center"></div><div style="color:rgba(255,255,255,.6);font-size:12px;margin-top:6px">Cliquer pour fermer</div>';
    document.body.appendChild(m);
  }
  document.getElementById('mkt-photo-grande').src = src;
  document.getElementById('mkt-photo-label').textContent = label || '';
  m.style.display = 'flex';
}

function ouvrirRdvCoiffure(svcId, svcNom) {
  document.getElementById('mkt-devis-titre').textContent = ' Réserver — ' + svcNom;
  document.getElementById('mkt-devis-produit').value = svcNom;
  document.getElementById('mkt-devis-type').value = 'coiffure_rdv';
  var extra = document.getElementById('mkt-devis-extra');
  if (extra) {
    extra.innerHTML = '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Date souhaitée</label>'
      + '<input type="date" id="mkt-rdv-date" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;margin-bottom:8px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Créneau</label>'
      + '<select id="mkt-rdv-creneau" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">'
      + '<option>Matin (08h-12h)</option><option>Après-midi (12h-17h)</option><option>Soir (17h-19h)</option>'
      + '</select>';
  }
  openMkt('mkt-modal-devis');
}

// 
//  SECTION 9 — LOGISTIQUE
//  Tarifs colis intervilles + Flotte de véhicules
// 

var MKT_TARIFS_COLIS = [];

var MKT_FLOTTE_VEHICULES = [];

function renderMktLogistique() {
  var el = document.getElementById('mkt-log-content');
  if (!el) return;
  var tab = (document.getElementById('mkt-log-tab') || {}).value || 'tarifs';
  if (tab === 'tarifs') renderMktTarifsColis();
  else renderMktFlotteVehicules();
}

function renderMktTarifsColis() {
  var el = document.getElementById('mkt-log-content');
  if (!el) return;
  var _real_render = mktGetRealData('logistique','tarifs');
  if (!_real_render || _real_render.length === 0) { el.innerHTML = mktEmptyState('tarifs de livraison'); return; }

  var header = '<div style="background:linear-gradient(135deg,#007A3D,#005a2d);color:#fff;border-radius:12px;padding:14px;margin-bottom:16px">'
    + '<div style="font-size:13px;font-weight:700;margin-bottom:4px"> Calculateur de prix</div>'
    + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'
    + '<input type="number" id="mkt-poids-colis" placeholder="Poids en kg" min="0.1" step="0.1" oninput="calculerPrixColis()" style="flex:1;min-width:120px;padding:8px;border:none;border-radius:8px;font-size:13px">'
    + '<select id="mkt-trajet-calc" onchange="calculerPrixColis()" style="flex:2;min-width:160px;padding:8px;border:none;border-radius:8px;font-size:13px">'
    + '<option value="">Choisir un trajet...</option>'
    + MKT_TARIFS_COLIS.map(function(t){ return '<option value="' + t.prix_kg + '_' + t.prix_min + '">' + t.trajet + '</option>'; }).join('')
    + '</select>'
    + '<div id="mkt-prix-calc" style="font-size:18px;font-weight:800;color:#FCD116;min-width:120px;text-align:right">— FCFA</div>'
    + '</div></div>';

  var html = header + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">';
  MKT_TARIFS_COLIS.forEach(function(t) {
    html += '<div style="background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<img loading="lazy" src="' + t.img + '" style="width:100%;height:120px;object-fit:cover" onerror="imgFallback(this)">';
    html += '<div style="padding:12px">';
    html += '<div style="font-weight:800;font-size:14px;margin-bottom:4px">' + t.trajet + '</div>';
    html += '<div style="display:flex;gap:12px;font-size:12px;color:#555;margin-bottom:8px">';
    html += '<span> ' + t.distance + '</span><span>⏱ ' + t.delai + '</span><span> ' + t.vehicule + '</span>';
    html += '</div>';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:10px">';
    html += '<div><div style="font-size:11px;color:#666">Prix / kg</div><div style="font-size:17px;font-weight:800;color:#007A3D">' + t.prix_kg.toLocaleString('fr-FR') + ' F</div></div>';
    html += '<div style="text-align:right"><div style="font-size:11px;color:#666">Minimum</div><div style="font-size:17px;font-weight:800;color:#007A3D">' + t.prix_min.toLocaleString('fr-FR') + ' F</div></div>';
    html += '</div>';
    html += '<button onclick="ouvrirDevisLog(\'' + t.trajet.replace(/'/g,'') + '\')" style="width:100%;background:#007A3D;color:#fff;border:none;padding:9px;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer"> Commander cette livraison</button>';
    html += '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function calculerPrixColis() {
  var poids  = parseFloat((document.getElementById('mkt-poids-colis') || {}).value) || 0;
  var trajet = (document.getElementById('mkt-trajet-calc') || {}).value || '';
  var el     = document.getElementById('mkt-prix-calc');
  if (!el) return;
  if (!poids || !trajet) { el.textContent = '— FCFA'; return; }
  var parts  = trajet.split('_');
  var pkHour = parseFloat(parts[0]) || 0;
  var min    = parseFloat(parts[1]) || 0;
  var prix   = Math.max(poids * pkHour, min);
  el.textContent = prix.toLocaleString('fr-FR') + ' FCFA';
}

function renderMktFlotteVehicules() {
  var el = document.getElementById('mkt-log-content');
  if (!el) return;
  var _real_render = mktGetRealData('logistique', 'vehicules');
  if (!_real_render || _real_render.length === 0) { el.innerHTML = mktEmptyState('vehicules disponibles'); return; }
  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px">';
  (mktGetRealData('logistique','vehicules') || MKT_FLOTTE_VEHICULES).forEach(function(v) {
    var dispo = v.dispo;
    html += '<div style="background:#fff;border-radius:14px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<div style="position:relative"><img loading="lazy" src="' + v.img + '" style="width:100%;height:170px;object-fit:cover" onerror="imgFallback(this)">';
    html += '<span style="position:absolute;top:10px;right:10px;background:' + (dispo?'#007A3D':'#CE1126') + ';color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">' + (dispo?'Disponible':'Indisponible') + '</span>';
    html += '<span style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,.65);color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">' + v.type + '</span>';
    html += '</div>';
    html += '<div style="padding:14px">';
    html += '<div style="font-weight:800;font-size:15px;margin-bottom:3px">' + v.nom + '</div>';
    html += '<div style="font-size:12px;color:#007A3D;font-weight:600;margin-bottom:6px"> ' + v.capacite + '</div>';
    html += '<div style="font-size:12px;color:#555;margin-bottom:8px;line-height:1.5">' + v.desc + '</div>';
    html += '<div style="font-size:11px;color:#666;margin-bottom:10px"> ' + v.zones + '</div>';
    html += '<div style="display:flex;gap:12px;margin-bottom:12px">';
    if (v.prix_heure) html += '<div><div style="font-size:11px;color:#666">Par heure</div><div style="font-size:16px;font-weight:800;color:#007A3D">' + v.prix_heure.toLocaleString('fr-FR') + ' F</div></div>';
    html += '<div><div style="font-size:11px;color:#666">Par jour</div><div style="font-size:16px;font-weight:800;color:#007A3D">' + v.prix_jour.toLocaleString('fr-FR') + ' F</div></div>';
    html += '</div>';
    html += '<button onclick="ouvrirDevisLog(\'' + v.nom.replace(/'/g,'') + '\')" ' + (dispo ? '' : 'disabled ') + 'style="width:100%;background:' + (dispo?'#007A3D':'#9ca3af') + ';color:#fff;border:none;padding:10px;border-radius:10px;font-size:13px;font-weight:700;cursor:' + (dispo?'pointer':'default') + '"> ' + (dispo ? 'Réserver ce véhicule' : 'Indisponible') + '</button>';
    html += '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function ouvrirDevisLog(info) {
  document.getElementById('mkt-devis-titre').textContent = ' Réservation — ' + info;
  document.getElementById('mkt-devis-produit').value = info;
  document.getElementById('mkt-devis-type').value = 'logistique';
  var extra = document.getElementById('mkt-devis-extra');
  if (extra) {
    extra.innerHTML = '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Date de collecte</label>'
      + '<input type="date" id="mkt-log-date" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;margin-bottom:8px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Adresse de collecte</label>'
      + '<input type="text" id="mkt-log-adresse" placeholder="Quartier, ville..." style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;margin-bottom:8px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Poids estimé (kg)</label>'
      + '<input type="number" id="mkt-log-poids" placeholder="Ex: 15" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">';
  }
  openMkt('mkt-modal-devis');
}

// 
//  SECTION 10 — AGRICULTURE
//  Catalogue + Commander + Calendrier cultural
// 

var MKT_AGRI = [];

var MKT_CALENDRIER = [
  { culture:'Maïs',          emoji:'', saison1:[3,7],  saison2:[8,11], region:'Toutes régions',        conseil:'Espacer 75x25cm. Engrais NPK au semis, urée en couverture à 45j.' },
  { culture:'Plantain',      emoji:'', saison1:[3,5],  saison2:[9,11], region:'Sud, Littoral, Ouest',  conseil:'Planter les rejets sains. Paillez abondamment.' },
  { culture:'Tomate',        emoji:'', saison1:[10,1], saison2:[3,6],  region:'Ouest, Adamaoua',       conseil:'Tuteurage indispensable. Irrigation régulière. Anti-mildiou.' },
  { culture:'Manioc',        emoji:'', saison1:[3,12], saison2:null,   region:'Toutes régions',        conseil:'Culture possible toute l\'année. Sols bien drainés.' },
  { culture:'Arachide',      emoji:'', saison1:[3,7],  saison2:[8,11], region:'Centre, Sud, Est',      conseil:'Sol léger et drainé. Inoculer avec rhizobium.' },
  { culture:'Cacao',         emoji:'', saison1:[5,7],  saison2:[9,11], region:'Centre, Sud, SW',       conseil:'Sous ombrage. Fertilisation organique. Taille sanitaire.' },
  { culture:'Café Robusta',  emoji:'', saison1:[4,6],  saison2:[9,11], region:'Littoral, SW, NW',      conseil:'Sol acide. Taille après récolte. Paillage du sol.' },
  { culture:'Piment',        emoji:'', saison1:[3,6],  saison2:[9,12], region:'Toutes régions',        conseil:'Arrosage modéré. Anti-pucerons préventif.' },
  { culture:'Igname',        emoji:'', saison1:[2,5],  saison2:null,   region:'Nord, Adamaoua',        conseil:'Billons 30cm. Semence 300g. Éviter l\'humidité excessive.' },
  { culture:'Haricot',       emoji:'', saison1:[3,6],  saison2:[9,11], region:'Ouest, Adamaoua',       conseil:'Sol bien préparé. Inoculant rhizobium recommandé.' },
];

var MOIS_NOMS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

function renderMktAgriculture() {
  var el = document.getElementById('mkt-agri-content');
  if (!el) return;
  var tab = (document.getElementById('mkt-agri-tab') || {}).value || 'catalogue';
  if (tab === 'catalogue') renderMktCatalogueAgri();
  else renderMktCalendrierAgri();
}

function renderMktCatalogueAgri() {
  var el = document.getElementById('mkt-agri-content');
  if (!el) return;
  var catF    = (document.getElementById('mkt-agri-cat') || {}).value || '';
  var searchF = ((document.getElementById('mkt-agri-search') || {}).value || '').toLowerCase();
  var realAgri = mktGetRealData('agriculture','produits');
  var prods   = (realAgri || MKT_AGRI).filter(function(p) {

  if (!prods || prods.length === 0) { el.innerHTML = mktEmptyState('produits agricoles'); return; }
    return (!catF || p.cat === catF) && (!searchF || p.nom.toLowerCase().includes(searchF));
  });

  var catColors = {'Semences':'#d1fae5','Engrais':'#fef3c7','Pesticides':'#fee2e2','Outillage':'#dbeafe','Elevage':'#ede9fe','Animaux':'#fce7f3','Analyse':'#f3f4f6','Protection':'#d1fae5'};
  var catTC     = {'Semences':'#065f46','Engrais':'#b45309','Pesticides':'#991b1b','Outillage':'#1d4ed8','Elevage':'#5b21b6','Animaux':'#be185d','Analyse':'#374151','Protection':'#065f46'};

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px">';
  prods.forEach(function(p) {
    var bg = catColors[p.cat] || '#f9fafb';
    var tc = catTC[p.cat] || '#374151';
    var stockBadge = p.stock < 15 ? '<span style="background:#fee2e2;color:#CE1126;font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;margin-left:6px">Stock limité</span>' : '';
    html += '<div style="background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<img loading="lazy" src="' + p.img + '" style="width:100%;height:140px;object-fit:cover" onerror="imgFallback(this)">';
    html += '<div style="padding:11px">';
    html += '<div style="display:flex;align-items:center;margin-bottom:6px">';
    html += '<span style="background:' + bg + ';color:' + tc + ';font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px">' + p.cat + '</span>' + stockBadge;
    html += '</div>';
    html += '<div style="font-weight:700;font-size:13px;margin-bottom:3px;line-height:1.3">' + p.nom + '</div>';
    html += '<div style="font-size:11px;color:#666;margin-bottom:8px;line-height:1.4">' + p.desc + '</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    html += '<div style="font-size:17px;font-weight:800;color:#007A3D">' + p.prix.toLocaleString('fr-FR') + ' F</div>';
    html += '<div style="font-size:11px;color:#666">/ ' + p.unite + '</div>';
    html += '</div>';
    html += '<button onclick="mktAddPanier({id:\'' + p.id + '\',nom:\'' + p.nom.replace(/'/g,'').replace(/\n/g,'') + '\',prix:' + p.prix + ',img:\'' + p.img + '\',source:\'Agriculture\',type:\'agri\'})" ';
    html += 'style="width:100%;background:#007A3D;color:#fff;border:none;padding:8px;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer"> Commander</button>';
    html += 
        + (item.video_base64 || item.video ? '<div style="margin:8px -1px -1px;padding:10px;background:#f9fafb;border-top:1px solid #f0f0f0">' + mktVideoPlayer(item.video_base64 || item.video) + '</div>' : '') + '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function renderMktCalendrierAgri() {
  var el = document.getElementById('mkt-agri-content');
  if (!el) return;
  var moisCourant = new Date().getMonth() + 1;

  var html = '<div style="margin-bottom:16px;padding:12px;background:#f0faf5;border-radius:10px;font-size:13px;color:#007A3D;font-weight:600">';
  html += ' Mois en cours : <strong>' + MOIS_NOMS[moisCourant-1] + '</strong> — Cultures recommandées affichées en vert</div>';
  html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">';
  html += '<thead><tr style="background:#007A3D;color:#fff">';
  html += '<th style="padding:10px 14px;text-align:left;font-size:13px;font-weight:700;white-space:nowrap">Culture</th>';
  MOIS_NOMS.forEach(function(m, i) {
    var isCurrent = (i+1) === moisCourant;
    html += '<th style="padding:8px 6px;font-size:11px;font-weight:700;text-align:center;min-width:40px;' + (isCurrent?'background:#FCD116;color:#007A3D;':'') + '">' + m + '</th>';
  });
  html += '<th style="padding:10px 14px;text-align:left;font-size:12px">Conseil</th>';
  html += '</tr></thead><tbody>';

  MKT_CALENDRIER.forEach(function(c, idx) {
    var rowBg = idx % 2 === 0 ? '#fff' : '#f9fafb';
    var s1 = c.saison1 || [];
    var s2 = c.saison2 || [];
    html += '<tr style="background:' + rowBg + '">';
    html += '<td style="padding:10px 14px;font-weight:700;font-size:13px;white-space:nowrap">' + c.emoji + ' ' + c.culture + '</td>';
    for (var m = 1; m <= 12; m++) {
      var inS1 = s1.length && (s1[0] <= s1[1] ? m >= s1[0] && m <= s1[1] : m >= s1[0] || m <= s1[1]);
      var inS2 = s2 && s2.length && (s2[0] <= s2[1] ? m >= s2[0] && m <= s2[1] : m >= s2[0] || m <= s2[1]);
      var active = inS1 || inS2;
      var isCurrent = m === moisCourant;
      var cellBg = active ? '#007A3D' : (isCurrent ? '#fff9c4' : 'transparent');
      var cellTxt = active ? '#fff' : '#e5e7eb';
      html += '<td style="text-align:center;padding:8px 4px;border-left:1px solid #f0f0f0;' + (isCurrent ? 'border-left:2px solid #FCD116;' : '') + '">';
      html += '<div style="width:28px;height:28px;border-radius:50%;background:' + cellBg + ';margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:14px">';
      html += active ? '' : '';
      html += '</div></td>';
    }
    html += '<td style="padding:10px 14px;font-size:11px;color:#555;max-width:220px;line-height:1.5">' + c.conseil + '</td>';
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  html += '<div style="margin-top:12px;display:flex;align-items:center;gap:12px;font-size:12px;color:#666">';
  html += '<div style="display:flex;align-items:center;gap:5px"><div style="width:20px;height:20px;border-radius:50%;background:#007A3D"></div>Période de plantation</div>';
  html += '<div style="display:flex;align-items:center;gap:5px"><div style="width:20px;height:20px;border-radius:50%;background:#fff9c4;border:1px solid #e5e7eb"></div>Mois en cours</div>';
  html += '</div>';
  el.innerHTML = html;
}


// 
//  DYNAMICITE — Chargement depuis localStorage (memes sources
//  que l'espace gerant). Toute modification gerant = visible
//  immediatement dans la marketplace.
// 

function mktLire(cle, fallback) {
  try {
    var d = JSON.parse(localStorage.getItem(cle) || 'null');
    return d || fallback;
  } catch(e) { return fallback; }
}

// Rechargement automatique quand le gerant modifie les donnees
window.addEventListener('storage', function(e) {
  var keysMap = {
    'sm_coif_services':       function() { if (document.getElementById('mkt-coiffure') && document.getElementById('mkt-coiffure').style.display !== 'none') renderMktCoiffure(); },
    'sm_restaurants':         function() { renderMktRestaurants(); },
    'sm_auto':                function() { renderMktAutomobile(); },
    'sm_auto_v2':             function() { renderMktAutomobile(); },
    'sm_pressing':            function() { renderMktPressing(); },
    'sm_energie':             function() { renderMktEnergie(); },
    'sm_agri':                function() { renderMktAgriculture(); },
    'sm_immo':                function() { renderMktImmobilier(); },
    'sm_logistique':          function() { renderMktLogistique(); },
    'sm_btp':                 function() { renderMktBTP(); },
    'sm_education':           function() { renderMktEducation(); },
    'sm_sante':               function() { renderMktSante(); },
  };
  if (e.key && keysMap[e.key]) {
    try { keysMap[e.key](); } catch(err) {}
  }
});

// 
//  SECTION AUTOMOBILE — RDV Mecanicien + Pieces
// 

// Donnees de base (enrichies depuis localStorage si gerant a modifie)
var MKT_AUTO_SERVICES_BASE = [];

var MKT_AUTO_PIECES_BASE = [];

var MKT_GARAGES = [];

function renderMktAutomobile() {
  var el = document.getElementById('mkt-auto-content');
  if (!el) return;
  var tab = (document.getElementById('mkt-auto-tab') || {}).value || 'services';

  // Lire donnees dynamiques depuis localStorage (memes que l'espace gerant)
  var autoData = mktLire('sm_auto', {});
  var autoDataV2 = mktLire('sm_auto_v2', {});

  // Fusionner les pieces sauvegardees par le gerant avec les donnees de base
  var piecesGerant = mktLire('sm_auto_pieces', null);
  var pieces = piecesGerant ? piecesGerant : MKT_AUTO_PIECES_BASE;

  if (tab === 'services')    renderMktAutoServices(autoData);
  else if (tab === 'pieces') renderMktAutoPieces(pieces);
  else                       renderMktGarages();
}

function renderMktAutoServices(autoData) {
  var el = document.getElementById('mkt-auto-content');
  if (!el) return;

  var catF    = (document.getElementById('mkt-auto-cat')    || {}).value || '';
  var searchF = ((document.getElementById('mkt-auto-search')|| {}).value || '').toLowerCase();

  var services = MKT_AUTO_SERVICES_BASE.filter(function(s) {
    return (!catF || s.cat === catF)
        && (!searchF || s.nom.toLowerCase().includes(searchF));
  });

  var catBg = {
    'Entretien':'#d1fae5','Freinage':'#fee2e2','Moteur':'#fef3c7','Diagnostic':'#dbeafe',
    'Confort':'#ede9fe','Lavage':'#f0fdfa','Pneus':'#f9fafb','Electrique':'#fef9c3'
  };
  var catTc = {
    'Entretien':'#065f46','Freinage':'#991b1b','Moteur':'#b45309','Diagnostic':'#1d4ed8',
    'Confort':'#5b21b6','Lavage':'#0f766e','Pneus':'#374151','Electrique':'#854d0e'
  };

  // Banniere RDV urgent
  var html = '<div style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;border-radius:12px;padding:14px 18px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">'
    + '<div><div style="font-size:14px;font-weight:700">Besoin d\'une reparation urgente ?</div><div style="font-size:12px;opacity:.75;margin-top:3px">Disponible 7j/7 de 07h a 20h — Deplacement possible</div></div>'
    + '<button onclick="ouvrirRdvAuto(\'Urgence\',\'\')" style="background:#CE1126;color:#fff;border:none;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">RDV Urgent</button>'
    + '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">';
  services.forEach(function(s) {
    var bg = catBg[s.cat] || '#f9fafb';
    var tc = catTc[s.cat] || '#374151';
    html += '<div style="background:#fff;border-radius:14px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<img loading="lazy" src="' + s.img + '" style="width:100%;height:150px;object-fit:cover" onerror="imgFallback(this)">';
    html += '<div style="padding:13px">';
    html += '<span style="background:' + bg + ';color:' + tc + ';font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px">' + s.cat + '</span>';
    html += '<div style="font-weight:800;font-size:14px;margin:7px 0 3px">' + s.nom + '</div>';
    html += '<div style="font-size:11px;color:#555;margin-bottom:8px;line-height:1.4">' + s.desc + '</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
    html += '<div style="font-size:18px;font-weight:800;color:#007A3D">' + s.prix.toLocaleString('fr-FR') + ' FCFA</div>';
    html += '<div style="font-size:11px;color:#666;background:#f3f4f6;padding:4px 8px;border-radius:8px">~' + s.duree + ' min</div>';
    html += '</div>';
    html += '<button onclick="ouvrirRdvAuto(\'' + s.id + '\',\'' + s.nom.replace(/'/g,'') + '\')" style="width:100%;background:#007A3D;color:#fff;border:none;padding:10px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">Prendre RDV</button>';
    html += '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function renderMktAutoPieces(pieces) {
  var el = document.getElementById('mkt-auto-content');
  if (!el) return;
  var catF    = (document.getElementById('mkt-auto-cat')    || {}).value || '';
  var searchF = ((document.getElementById('mkt-auto-search')|| {}).value || '').toLowerCase();

  var filtered = pieces.filter(function(p) {
    return (!catF || p.cat === catF)
        && (!searchF || p.nom.toLowerCase().includes(searchF));
  });

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px">';
  filtered.forEach(function(p) {
    var stockOk = p.stock > 0;
    html += '<div style="background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
            + '<img loading="lazy" src="' + img + '" data-fallback="1" style="width:100%;height:130px;object-fit:cover" onerror="if(!this.dataset.fb){this.dataset.fb=1;this.src=\'https://picsum.photos/seed/food/300/200\'}">'
    html += '<div style="padding:11px">';
    html += '<span style="background:#f3f4f6;color:#374151;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px">' + p.cat + '</span>';
    if (!stockOk) html += '<span style="background:#fee2e2;color:#CE1126;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;margin-left:4px">Rupture</span>';
    html += '<div style="font-weight:700;font-size:13px;margin:6px 0 3px;line-height:1.3">' + p.nom + '</div>';
    html += '<div style="font-size:11px;color:#666;margin-bottom:8px">' + (p.desc || '') + '</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    html += '<div style="font-size:17px;font-weight:800;color:#007A3D">' + p.prix.toLocaleString('fr-FR') + ' F</div>';
    html += '<div style="font-size:11px;color:#666">/' + (p.unite || 'piece') + '</div>';
    html += '</div>';
    html += '<button onclick="mktAddPanier({id:\'auto_' + p.id + '\',nom:\'' + p.nom.replace(/'/g,'') + '\',prix:' + p.prix + ',img:\'' + (p.img || '') + '\',source:\'Automobile\',type:\'piece\'})" '
          + (stockOk ? '' : 'disabled ');
    html += 'style="width:100%;background:' + (stockOk?'#007A3D':'#9ca3af') + ';color:#fff;border:none;padding:8px;border-radius:9px;font-size:12px;font-weight:700;cursor:' + (stockOk?'pointer':'default') + '">Commander</button>';
    html += '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function renderMktGarages() {
  var el = document.getElementById('mkt-auto-content');
  if (!el) return;
  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px">';
  MKT_GARAGES.forEach(function(g) {
    html += '<div style="background:#fff;border-radius:14px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<div style="position:relative"><img loading="lazy" src="' + g.img + '" style="width:100%;height:170px;object-fit:cover" onerror="imgFallback(this)">';
    if (g.certifie) html += '<span style="position:absolute;top:10px;right:10px;background:#007A3D;color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">Certifie</span>';
    html += '</div>';
    html += '<div style="padding:14px">';
    html += '<div style="font-weight:800;font-size:15px;margin-bottom:3px">' + g.nom + '</div>';
    html += '<div style="font-size:12px;color:#007A3D;font-weight:600;margin-bottom:4px">' + g.specialite + '</div>';
    html += '<div style="font-size:11px;color:#666;margin-bottom:4px">Adresse: ' + g.quartier + ', ' + g.ville + '</div>';
    html += '<div style="font-size:11px;color:#666;margin-bottom:6px">Horaires: ' + g.horaires + ' — Note: ' + g.note + '/5</div>';
    html += '<div style="font-size:12px;color:#555;margin-bottom:10px;line-height:1.5">' + g.desc + '</div>';
    html += '<div style="display:flex;gap:7px">';
    html += '<a href="tel:' + g.tel + '" style="flex:1;background:#007A3D;color:#fff;padding:9px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;text-align:center">Appeler</a>';
    html += '<a href="https://wa.me/' + g.tel.replace(/[\s+\-]/g,'') + '" target="_blank" style="flex:1;background:#25D366;color:#fff;padding:9px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;text-align:center">WhatsApp</a>';
    html += '<button onclick="ouvrirRdvAuto(\'' + g.id + '\',\'' + g.nom.replace(/'/g,'') + '\')" style="flex:1;background:#f0faf5;color:#007A3D;border:1.5px solid #007A3D;padding:9px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer">RDV</button>';
    html += '</div></div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function ouvrirRdvAuto(svcId, svcNom) {
  document.getElementById('mkt-devis-titre').textContent = 'RDV Mecanicien — ' + (svcNom || 'Service automobile');
  document.getElementById('mkt-devis-produit').value = svcNom || svcId;
  document.getElementById('mkt-devis-type').value = 'rdv_auto';
  var extra = document.getElementById('mkt-devis-extra');
  if (extra) {
    extra.innerHTML = '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Marque et modele du vehicule</label>'
      + '<input type="text" id="mkt-vehicule" placeholder="Ex: Toyota Corolla 2018" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;margin-bottom:8px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Date souhaitee</label>'
      + '<input type="date" id="mkt-auto-date" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;margin-bottom:8px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Description du probleme</label>'
      + '<textarea id="mkt-auto-prob" rows="2" placeholder="Decrivez le probleme ou le service souhaite..." style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box;resize:vertical"></textarea>';
  }
  openMkt('mkt-modal-devis');
}

// 
//  SECTION PRESSING — Tarifs + Nouveau depot + Points de depot
// 

var MKT_PRESSING_TARIFS_BASE = [];

var MKT_POINTS_DEPOT = [];

function renderMktPressing() {
  var el = document.getElementById('mkt-press-content');
  if (!el) return;
  var tab = (document.getElementById('mkt-press-tab') || {}).value || 'tarifs';

  // Dynamicite : lire les commandes et tarifs depuis localStorage gerant
  var pressingData = mktLire('sm_pressing', { commandes:[], seq:1 });
  var tarifs = MKT_PRESSING_TARIFS_BASE; // Base + eventuellement modifie par gerant

  if (tab === 'tarifs')   renderMktPressingTarifs(tarifs);
  else if (tab === 'depot') renderMktNouveauDepot();
  else                    renderMktPointsDepot();
}

function renderMktPressingTarifs(tarifs) {
  var el = document.getElementById('mkt-press-content');
  if (!el) return;
  var searchF = ((document.getElementById('mkt-press-search') || {}).value || '').toLowerCase();
  var filtered = tarifs.filter(function(t) {
    return !searchF || t.nom.toLowerCase().includes(searchF);
  });

  // Bandeau info
  var html = '<div style="background:#f0faf5;border:1px solid #d1fae5;border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:13px;color:#065f46">'
    + '<strong>Delai de traitement :</strong> 24h pour entretien courant — 48-72h pour nettoyage a sec. '
    + 'Livraison a domicile disponible sur Douala et Yaounde.'
    + '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px">';
  filtered.forEach(function(t) {
    var prixAff = t.prix_piece > 0 ? t.prix_piece.toLocaleString('fr-FR') + ' F/piece' : t.prix_kilo.toLocaleString('fr-FR') + ' F/kg';
    html += '<div style="background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
            + '<img loading="lazy" src="' + img + '" data-fallback="1" style="width:100%;height:130px;object-fit:cover" onerror="if(!this.dataset.fb){this.dataset.fb=1;this.src=\'https://picsum.photos/seed/food/300/200\'}">'
    html += '<div style="padding:12px">';
    html += '<div style="font-weight:700;font-size:14px;margin-bottom:3px">' + t.nom + '</div>';
    html += '<div style="font-size:11px;color:#555;margin-bottom:7px;line-height:1.4">' + t.desc + '</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    html += '<div style="font-size:18px;font-weight:800;color:#007A3D">' + prixAff + '</div>';
    html += '<div style="font-size:11px;color:#666;background:#f0faf5;padding:3px 8px;border-radius:8px">Delai: ' + t.delai + '</div>';
    html += '</div>';
    html += '<button onclick="ouvrirDepotPressing(\'' + t.id + '\',\'' + t.nom.replace(/'/g,'') + '\')" style="width:100%;background:#007A3D;color:#fff;border:none;padding:8px;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer">Deposer ce vetement</button>';
    html += '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function renderMktNouveauDepot() {
  var el = document.getElementById('mkt-press-content');
  if (!el) return;

  var html = '<div style="max-width:500px;margin:0 auto">';
  html += '<div style="background:#f0faf5;border:1px solid #d1fae5;border-radius:10px;padding:14px;margin-bottom:16px;font-size:13px;color:#065f46">';
  html += '<strong>Comment deposer votre linge ?</strong><br>'
    + '1. Remplissez ce formulaire<br>2. Choisissez le point de depot le plus proche<br>'
    + '3. Deplacez-vous avec vos vetements<br>4. Recevez un SMS de confirmation avec votre numero de suivi';
  html += '</div>';

  html += '<div class="mkt-field"><label>Votre nom complet *</label><input type="text" id="dep-nom" placeholder="Nom et prenom" style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:10px;font-size:13px;box-sizing:border-box"></div>';
  html += '<div class="mkt-field"><label>Telephone *</label><input type="tel" id="dep-tel" placeholder="+237 6XX XX XX XX" style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:10px;font-size:13px;box-sizing:border-box"></div>';
  html += '<div class="mkt-field"><label>Point de depot *</label><select id="dep-point" style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:10px;font-size:13px">';
  MKT_POINTS_DEPOT.forEach(function(d) {
    html += '<option value="' + d.nom + '">' + d.nom + ' — ' + d.horaires + '</option>';
  });
  html += '</select></div>';
  html += '<div class="mkt-field"><label>Articles (liste)</label><textarea id="dep-articles" rows="4" placeholder="Ex: 2 chemises, 1 pantalon, 1 costume..." style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:10px;font-size:13px;box-sizing:border-box;resize:vertical"></textarea></div>';
  html += '<div class="mkt-field"><label>Service souhaite</label><select id="dep-service" style="width:100%;padding:10px;border:1.5px solid #d1d5db;border-radius:10px;font-size:13px">';
  html += '<option>Lavage + repassage standard</option><option>Nettoyage a sec</option><option>Blanchisserie (linge de maison)</option><option>Service express 24h</option>';
  html += '</select></div>';
  html += '<button onclick="soumettreDepotPressing()" style="width:100%;background:#007A3D;color:#fff;border:none;padding:14px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;margin-top:8px">Confirmer le depot</button>';
  html += '</div>';
  el.innerHTML = html;
}

function renderMktPointsDepot() {
  var el = document.getElementById('mkt-press-content');
  if (!el) return;
  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px">';
  MKT_POINTS_DEPOT.forEach(function(d) {
    html += '<div style="background:#fff;border-radius:14px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<img loading="lazy" src="' + d.img + '" style="width:100%;height:150px;object-fit:cover" onerror="imgFallback(this)">';
    html += '<div style="padding:13px">';
    html += '<div style="font-weight:800;font-size:14px;margin-bottom:3px">' + d.nom + '</div>';
    html += '<div style="font-size:12px;color:#555;margin-bottom:4px">Adresse: ' + d.quartier + ', ' + d.ville + '</div>';
    html += '<div style="font-size:12px;color:#555;margin-bottom:4px">Horaires: ' + d.horaires + '</div>';
    html += '<div style="font-size:12px;color:#555;margin-bottom:10px;line-height:1.5">' + d.desc + '</div>';
    html += '<div style="display:flex;gap:7px">';
    html += '<a href="tel:' + d.tel + '" style="flex:1;background:#007A3D;color:#fff;padding:9px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;text-align:center">Appeler</a>';
    html += '<button onclick="document.getElementById(\'mkt-press-tab\').value=\'depot\';renderMktPressing()" style="flex:1;background:#f0faf5;color:#007A3D;border:1.5px solid #007A3D;padding:9px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer">Deposer ici</button>';
    html += '</div></div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function soumettreDepotPressing() {
  var nom     = (document.getElementById('dep-nom')      || {}).value || '';
  var tel     = (document.getElementById('dep-tel')      || {}).value || '';
  var point   = (document.getElementById('dep-point')    || {}).value || '';
  var articles= (document.getElementById('dep-articles') || {}).value || '';
  var service = (document.getElementById('dep-service')  || {}).value || '';
  if (!nom || !tel) { mktToast('Nom et telephone requis'); return; }

  var waMsg = 'Nouveau depot pressing\nClient: ' + nom + ' (' + tel + ')\nPoint: ' + point
    + '\nArticles: ' + articles + '\nService: ' + service;
  window.open('https://wa.me/237677000000?text=' + encodeURIComponent(waMsg), '_blank');
  mktToast('Depot confirme ! Dirigez-vous vers le point choisi.');

  // Reinitialiser
  ['dep-nom','dep-tel','dep-articles'].forEach(function(id){ var e=document.getElementById(id); if(e) e.value=''; });
}

function ouvrirDepotPressing(tarId, tarNom) {
  document.getElementById('mkt-devis-titre').textContent = 'Deposer — ' + tarNom;
  document.getElementById('mkt-devis-produit').value = tarNom;
  document.getElementById('mkt-devis-type').value = 'pressing_depot';
  var extra = document.getElementById('mkt-devis-extra');
  if (extra) {
    extra.innerHTML = '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Quantite</label>'
      + '<input type="number" id="mkt-qte-press" value="1" min="1" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;margin-bottom:8px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Point de depot</label>'
      + '<select id="mkt-depot-point" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">'
      + MKT_POINTS_DEPOT.map(function(d){ return '<option>' + d.nom + ' (' + d.ville + ')</option>'; }).join('')
      + '</select>';
  }
  openMkt('mkt-modal-devis');
}

// Mettre a jour initMarketplace avec auto + pressing
var _oldInit = initMarketplace;
initMarketplace = function() {
  _oldInit();
  renderMktAutomobile();
  renderMktPressing();
};


// ===============================================================
//  SECTION AUTOMOBILE — RDV Mécanicien + Pièces & Accessoires
//  Données DYNAMIQUES: lit localStorage sm_coif_services, sm_auto
// ===============================================================

// Images thématiques réelles (picsum IDs stables et thématiques)
// ── Lecteur video pour les items marketplace ────────────────────
function mktVideoPlayer(videoUrl) {
  if (!videoUrl || !videoUrl.trim()) return '';
  var url = videoUrl.trim();

  // YouTube
  var ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (ytMatch) {
    return '<div style="margin-top:10px;border-radius:10px;overflow:hidden;aspect-ratio:16/9">'
      + '<iframe src="https://www.youtube.com/embed/' + ytMatch[1] + '?rel=0" '
      + 'style="width:100%;height:100%;border:none;display:block" allowfullscreen loading="lazy"></iframe></div>';
  }

  // Vimeo
  var vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return '<div style="margin-top:10px;border-radius:10px;overflow:hidden;aspect-ratio:16/9">'
      + '<iframe src="https://player.vimeo.com/video/' + vimeoMatch[1] + '" '
      + 'style="width:100%;height:100%;border:none;display:block" allowfullscreen loading="lazy"></iframe></div>';
  }

  // Lien direct MP4
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return '<video controls style="width:100%;border-radius:10px;margin-top:10px;max-height:220px" preload="metadata">'
      + '<source src="' + url + '"><p style="font-size:12px;color:#999">Video non supportée — <a href="' + url + '" target="_blank">ouvrir le lien</a></p>'
      + '</video>';
  }

  // Autre URL
  return '<div style="margin-top:8px"><a href="' + url + '" target="_blank" rel="noopener" '
    + 'style="display:inline-flex;align-items:center;gap:6px;background:#f0faf5;color:#007A3D;padding:7px 14px;border-radius:20px;font-size:12px;font-weight:700;text-decoration:none">'
    + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
    + 'Voir la video</a></div>';
}

var IMG = {
  auto:     'https://picsum.photos/id/111/400/240',
  mecano:   'https://picsum.photos/id/237/400/240',
  pneu:     'https://picsum.photos/id/116/400/240',
  voiture:  'https://picsum.photos/id/133/400/240',
  piece:    'https://picsum.photos/id/159/400/240',
  pressing: 'https://picsum.photos/id/279/400/240',
  linge:    'https://picsum.photos/id/355/400/240',
  costume:  'https://picsum.photos/id/91/400/240',
  immo:     'https://picsum.photos/id/164/400/240',
  villa:    'https://picsum.photos/id/186/400/240',
  appart:   'https://picsum.photos/id/271/400/240',
  bureau:   'https://picsum.photos/id/260/400/240',
  terrain:  'https://picsum.photos/id/155/400/240',
  hotel:    'https://picsum.photos/id/225/400/240',
  coiffure: 'https://picsum.photos/id/325/400/240',
  salon:    'https://picsum.photos/id/342/400/240',
  camion:   'https://picsum.photos/id/431/400/240',
  moto:     'https://picsum.photos/id/206/400/240',
  agri:     'https://picsum.photos/id/139/400/240',
  plante:   'https://picsum.photos/id/145/400/240',
  sante:    'https://picsum.photos/id/452/400/240',
  educ:     'https://picsum.photos/id/20/400/240',
  btp:      'https://picsum.photos/id/175/400/240',
  energie:  'https://picsum.photos/id/149/400/240',
  cuisine:  'https://picsum.photos/id/292/400/240',
  defaut:   'https://picsum.photos/id/1/400/240',
};

// Fallback image handler
function imgErr(el) { el.onerror=null; el.src=IMG.defaut; }

// ── Lecture dynamique localStorage ────────────────────────────
function lsRead(key, defaut) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || defaut; }
  catch(e) { return defaut; }
}

// Services auto depuis localStorage (gérant) ou données statiques
function getAutoServices() {
  var real = mktGetRealData('automobile', 'services');
  return real || [];
}

function getAutoPieces() {
  var real = mktGetRealData('automobile', 'pieces');
  return real || [];
}

function renderMktAutomobile() {
  var el = document.getElementById('mkt-auto-content');
  if (!el) return;
  var tab = (document.getElementById('mkt-auto-tab') || {}).value || 'rdv';
  if (tab === 'rdv') renderMktAutoRDV();
  else renderMktAutoPieces();
}

function renderMktAutoRDV() {
  var el = document.getElementById('mkt-auto-content');
  if (!el) return;
  var catF = (document.getElementById('mkt-auto-cat') || {}).value || '';
  var realAutoSvcs = mktGetRealData('automobile','services');
  var svcs = (realAutoSvcs || getAutoServices()).filter(function(s){ return !catF || s.cat === catF; });

  if (!svcs || svcs.length === 0) { el.innerHTML = mktEmptyState('services mecanicien'); return; }
  var cats = [...new Set(getAutoServices().map(function(s){ return s.cat; }))];

  // Mettre à jour le select categories
  var catSel = document.getElementById('mkt-auto-cat');
  if (catSel && catSel.children.length <= 1) {
    cats.forEach(function(c) {
      var opt = document.createElement('option'); opt.value=c; opt.textContent=c; catSel.appendChild(opt);
    });
  }

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">';
  svcs.forEach(function(s) {
    var imgUrl = s.img || IMG.auto;
    var dureeStr = s.duree + ' min';
    html += '<div style="background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<img loading="lazy" src="' + imgUrl + '" style="width:100%;height:150px;object-fit:cover" onerror="imgErr(this)">';
    html += '<div style="padding:13px">';
    html += '<span style="background:#f3f4f6;color:#374151;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px">' + s.cat + '</span>';
    html += '<div style="font-weight:700;font-size:14px;margin:7px 0 4px;line-height:1.3">' + s.nom + '</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
    html += '<div style="font-size:18px;font-weight:800;color:#007A3D">' + s.prix.toLocaleString('fr-FR') + ' FCFA</div>';
    html += '<div style="font-size:11px;color:#666">Duree: ' + dureeStr + '</div>';
    html += '</div>';
    html += '<button onclick="ouvrirRdvAuto(\'' + s.id + '\',\'' + s.nom.replace(/'/g,'').replace(/\n/g,'') + '\')" style="width:100%;background:#007A3D;color:#fff;border:none;padding:10px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer">Prendre RDV</button>';
    html += 
        + (item.video_base64 || item.video ? '<div style="margin:8px -1px -1px;padding:10px;background:#f9fafb;border-top:1px solid #f0f0f0">' + mktVideoPlayer(item.video_base64 || item.video) + '</div>' : '') + '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function renderMktAutoPieces() {
  var el = document.getElementById('mkt-auto-content');
  if (!el) return;
  var catF    = (document.getElementById('mkt-auto-cat') || {}).value || '';
  var searchF = ((document.getElementById('mkt-auto-search') || {}).value || '').toLowerCase();
  var realPieces = mktGetRealData('automobile','pieces');
  var pieces  = (realPieces || getAutoPieces()).filter(function(p) {

  if (!pieces || pieces.length === 0) { el.innerHTML = mktEmptyState('pieces et accessoires'); return; }
    return (!catF || p.cat === catF) && (!searchF || p.nom.toLowerCase().includes(searchF));
  });

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px">';
  pieces.forEach(function(p) {
    var stockColor = p.stock < 5 ? '#CE1126' : p.stock < 15 ? '#f59e0b' : '#007A3D';
    html += '<div style="background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
            + '<img loading="lazy" src="' + img + '" data-fallback="1" style="width:100%;height:130px;object-fit:cover" onerror="if(!this.dataset.fb){this.dataset.fb=1;this.src=\'https://picsum.photos/seed/food/300/200\'}">'
    html += '<div style="padding:11px">';
    html += '<span style="background:#f3f4f6;color:#374151;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px">' + p.cat + '</span>';
    html += '<div style="font-weight:700;font-size:13px;margin:6px 0 3px;line-height:1.3">' + p.nom + '</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    html += '<div style="font-size:17px;font-weight:800;color:#007A3D">' + p.prix.toLocaleString('fr-FR') + ' F</div>';
    html += '<div style="font-size:10px;color:' + stockColor + ';font-weight:600">Stock: ' + p.stock + '</div>';
    html += '</div>';
    html += '<button onclick="mktAddPanier({id:\'auto_' + p.id + '\',nom:\'' + p.nom.replace(/'/g,'') + '\',prix:' + p.prix + ',img:\'' + (p.img||IMG.piece) + '\',source:\'Automobile\',type:\'piece\'})" ';
    html += 'style="width:100%;background:#007A3D;color:#fff;border:none;padding:8px;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer">Ajouter au panier</button>';
    html += 
        + (item.video_base64 || item.video ? '<div style="margin:8px -1px -1px;padding:10px;background:#f9fafb;border-top:1px solid #f0f0f0">' + mktVideoPlayer(item.video_base64 || item.video) + '</div>' : '') + '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function ouvrirRdvAuto(svcId, svcNom) {
  document.getElementById('mkt-devis-titre').textContent = 'Prendre RDV - ' + svcNom;
  document.getElementById('mkt-devis-produit').value = svcNom;
  document.getElementById('mkt-devis-type').value = 'rdv_auto';
  var extra = document.getElementById('mkt-devis-extra');
  if (extra) {
    extra.innerHTML = '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Marque et modele du vehicule</label>'
      + '<input type="text" id="mkt-vehicule" placeholder="Ex: Toyota Corolla 2018" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box;margin-bottom:8px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Date souhaitee</label>'
      + '<input type="date" id="mkt-auto-date" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;margin-bottom:8px">'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Creneau</label>'
      + '<select id="mkt-auto-creneau" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">'
      + '<option>Matin (08h-12h)</option><option>Apres-midi (12h-17h)</option>'
      + '</select>';
  }
  openMkt('mkt-modal-devis');
}

// ===============================================================
//  SECTION PRESSING — Tarifs + Depot de linge
//  Données DYNAMIQUES: lit localStorage sm_pressing_tarifs_mkt
// ===============================================================

function getPressingTarifs() {
  var real = mktGetRealData('pressing', 'tarifs');
  return real || [];
}

// Depots pressing depuis localStorage
function getPressingDepots() {
  var real = mktGetRealData('pressing', 'depots');
  return real || [];
}

function renderMktPressing() {
  var el = document.getElementById('mkt-press-content');
  if (!el) return;
  var tab = (document.getElementById('mkt-press-tab') || {}).value || 'tarifs';
  if (tab === 'tarifs') renderMktPressingTarifs();
  else renderMktPressingDepots();
}

function renderMktPressingTarifs() {
  var el = document.getElementById('mkt-press-content');
  if (!el) return;
  var catF = (document.getElementById('mkt-press-cat') || {}).value || '';
  var realTarifs = mktGetRealData('pressing','tarifs');
  var tarifs = (realTarifs || getPressingTarifs()).filter(function(t){ return !catF || t.cat === catF; });

  if (!tarifs || tarifs.length === 0) { el.innerHTML = mktEmptyState('tarifs pressing'); return; }

  var html = '<div style="background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:12px;padding:14px;margin-bottom:16px">'
    + '<div style="font-size:13px;font-weight:700;margin-bottom:12px">Calculateur de devis</div>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
    + '<select id="mkt-press-item" onchange="calcPress()" style="flex:2;min-width:180px;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">'
    + '<option value="">Choisir un article...</option>'
    + tarifs.map(function(t){ return '<option value="' + t.prix_piece + '_' + t.prix_kilo + '">' + t.nom + '</option>'; }).join('')
    + '</select>'
    + '<input type="number" id="mkt-press-qte" placeholder="Qte / Poids (kg)" min="1" step="0.5" oninput="calcPress()" style="flex:1;min-width:120px;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">'
    + '<div id="mkt-press-result" style="font-size:18px;font-weight:800;color:#007A3D;min-width:130px;text-align:right">— FCFA</div>'
    + '</div></div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px">';
  tarifs.forEach(function(t) {
    var prixAff = t.prix_piece > 0 ? t.prix_piece.toLocaleString('fr-FR') + ' F/piece' : t.prix_kilo.toLocaleString('fr-FR') + ' F/kg';
    html += '<div style="background:#fff;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
            + '<img loading="lazy" src="' + img + '" data-fallback="1" style="width:100%;height:130px;object-fit:cover" onerror="if(!this.dataset.fb){this.dataset.fb=1;this.src=\'https://picsum.photos/seed/food/300/200\'}">'
    html += '<div style="padding:12px">';
    html += '<span style="background:#e0e7ff;color:#3730a3;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px">' + (t.cat||'Pressing') + '</span>';
    html += '<div style="font-weight:700;font-size:14px;margin:7px 0 6px">' + t.nom + '</div>';
    html += '<div style="font-size:18px;font-weight:800;color:#007A3D;margin-bottom:10px">' + prixAff + '</div>';
    html += '<button onclick="ouvrirDepotPressing(\'' + t.nom.replace(/'/g,'') + '\')" style="width:100%;background:#007A3D;color:#fff;border:none;padding:9px;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer">Deposer cet article</button>';
    html += 
        + (item.video_base64 || item.video ? '<div style="margin:8px -1px -1px;padding:10px;background:#f9fafb;border-top:1px solid #f0f0f0">' + mktVideoPlayer(item.video_base64 || item.video) + '</div>' : '') + '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function calcPress() {
  var sel    = (document.getElementById('mkt-press-item') || {}).value || '';
  var qte    = parseFloat((document.getElementById('mkt-press-qte') || {}).value) || 0;
  var el     = document.getElementById('mkt-press-result');
  if (!el) return;
  if (!sel || !qte) { el.textContent = '— FCFA'; return; }
  var parts  = sel.split('_');
  var pp     = parseFloat(parts[0]) || 0;
  var pk     = parseFloat(parts[1]) || 0;
  var prix   = pp > 0 ? pp * qte : pk * qte;
  el.textContent = prix.toLocaleString('fr-FR') + ' FCFA';
}

function renderMktPressingDepots() {
  var el = document.getElementById('mkt-press-content');
  if (!el) return;
  var realDepots = mktGetRealData('pressing','depots');
  var depots = realDepots || getPressingDepots();

  if (!depots || depots.length === 0) { el.innerHTML = mktEmptyState('points de depot'); return; }
  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">';
  depots.forEach(function(d) {
    html += '<div style="background:#fff;border-radius:14px;overflow:hidden;border:1.5px solid #e5e7eb" onmouseover="mktHover(this,true)" onmouseout="mktHover(this,false)">';
    html += '<img loading="lazy" src="' + (d.img||IMG.pressing) + '" style="width:100%;height:150px;object-fit:cover" onerror="imgErr(this)">';
    html += '<div style="padding:14px">';
    html += '<div style="font-weight:800;font-size:15px;margin-bottom:5px">' + d.nom + '</div>';
    html += '<div style="font-size:12px;color:#555;margin-bottom:4px">Adresse: ' + d.adresse + '</div>';
    html += '<div style="font-size:12px;color:#555;margin-bottom:4px">Horaires: ' + d.horaires + '</div>';
    html += '<div style="font-size:12px;margin-bottom:10px">';
    html += '<span style="background:' + (d.livraison?'#dcfce7':'#fee2e2') + ';color:' + (d.livraison?'#007A3D':'#CE1126') + ';font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px">' + (d.livraison?'Livraison disponible':'Sur place uniquement') + '</span>';
    html += ' <span style="font-size:11px;color:#666">Delai: ' + d.delai + '</span>';
    html += '</div>';
    html += '<div style="display:flex;gap:7px">';
    html += '<a href="tel:' + d.tel + '" style="flex:1;background:#007A3D;color:#fff;padding:9px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;text-align:center">Appeler</a>';
    html += '<a href="https://wa.me/' + d.tel.replace(/[\s+\-]/g,'') + '" target="_blank" style="flex:1;background:#25D366;color:#fff;padding:9px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;text-align:center">WhatsApp</a>';
    html += '<button onclick="ouvrirDepotPressing(\'\',\'' + d.id + '\')" style="flex:1;background:#f0faf5;color:#007A3D;border:1.5px solid #007A3D;padding:9px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer">Deposer</button>';
    html += '</div></div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function ouvrirDepotPressing(articleNom, depotId) {
  var depots = getPressingDepots();
  document.getElementById('mkt-devis-titre').textContent = 'Nouveau depot de linge';
  document.getElementById('mkt-devis-produit').value = articleNom || 'Depot pressing';
  document.getElementById('mkt-devis-type').value = 'pressing_depot';
  var extra = document.getElementById('mkt-devis-extra');
  if (extra) {
    extra.innerHTML = '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Choisir le depot</label>'
      + '<select id="mkt-depot-id" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;margin-bottom:8px">'
      + depots.map(function(d){ return '<option value="' + d.id + '" ' + (depotId===d.id?'selected':'') + '>' + d.nom + ' — ' + d.adresse.split(',')[0] + '</option>'; }).join('')
      + '</select>'
      + '<label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Description des articles</label>'
      + '<textarea id="mkt-press-articles" rows="3" placeholder="Ex: 5 chemises, 2 pantalons, 1 costume..." style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;box-sizing:border-box;resize:vertical"></textarea>'
      + '<label style="font-size:12px;font-weight:600;display:block;margin:8px 0 4px">Date de depot souhaitee</label>'
      + '<input type="date" id="mkt-press-date" style="width:100%;padding:9px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">';
  }
  openMkt('mkt-modal-devis');
}

// ===============================================================
//  PONT DYNAMIQUE — Synchronisation Gerant → Marketplace
//  Ecoute localStorage pour mettre a jour la marketplace en temps reel
// ===============================================================

// Cles localStorage que le gerant utilise pour chaque module
var MKT_SYNC_KEYS = {
  'sm_mkt_data_updated': function(){ if(typeof initMarketplace==='function') initMarketplace(); },
  'sm_marketplace_data': function(){ if(typeof initMarketplace==='function') initMarketplace(); },
  'sm_coif_services':    function(){ if(document.getElementById('mkt-coiffure')) renderMktCoiffure(); },
  'sm_pressing':         function(){ if(document.getElementById('mkt-pressing')) renderMktPressing(); },
  'sm_auto':             function(){ if(document.getElementById('mkt-auto-content')) renderMktAutomobile(); },
  'sm_immo':             function(){ if(document.getElementById('mkt-immo-content')) renderMktImmobilier(); },
  'sm_energie_prods':    function(){ if(document.getElementById('mkt-energie-content')) renderMktEnergie(); },
  'sm_agri':             function(){ if(document.getElementById('mkt-agri-content')) renderMktAgriculture(); },
  'sm_log':              function(){ if(document.getElementById('mkt-log-content')) renderMktLogistique(); },
  'sm_sante_prods':      function(){ if(document.getElementById('mkt-sante-content')) renderMktSante(); },
  'sm_btp_prods':        function(){ if(document.getElementById('mkt-btp-content')) renderMktBTP(); },
  'sm_edu_prods':        function(){ if(document.getElementById('mkt-edu-content')) renderMktEducation(); },
};

// Ecouter les changements localStorage du gerant
window.addEventListener('storage', function(e) {
  if (e.key && MKT_SYNC_KEYS[e.key]) {
    // Petite pause pour laisser le write se finaliser
    setTimeout(MKT_SYNC_KEYS[e.key], 200);
  }
});

// Fonction de rafraichissement manuel complet (appelee apres ouverture marketplace)
function refreshMarketplace() {
  var tabActif = document.querySelector('.mkt-tab-btn.active');
  if (!tabActif) return;
  var tabId = tabActif.id.replace('tab-','');
  switchMktTab(tabId);
}
