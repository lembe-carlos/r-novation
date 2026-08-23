// ═══════════════════════════════════════════════════════
//  SuperMarché CM — restauration.js
//  Restauration & Food : Menus + Commandes + Livraison
// ═══════════════════════════════════════════════════════

// ── Restaurants partenaires ──
var RESTAURANTS = [
  { id:'r1', nom:'Maquis Chez Mama Africa', type:'Maquis', ville:'Douala', quartier:'Bepanda', tel:'+237 677 001 001', horaires:'07h-23h', livraison:true, delai:30, frais:500, note:4.8, img:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=200&fit=crop', specialite:'Ndolé, Eru, Poulet DG', ouvert:true },
  { id:'r2', nom:'Fast Food Le Plateau',    type:'Fast Food', ville:'Douala', quartier:'Akwa', tel:'+237 677 002 002', horaires:'08h-22h', livraison:true, delai:20, frais:500, note:4.5, img:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=200&fit=crop', specialite:'Brochettes, Alloco, Soya', ouvert:true },
  { id:'r3', nom:'Pâtisserie Douceurs CM',  type:'Pâtisserie', ville:'Douala', quartier:'Bonapriso', tel:'+237 677 003 003', horaires:'07h-20h', livraison:true, delai:25, frais:500, note:4.9, img:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=200&fit=crop', specialite:'Gâteaux, Croissants, Café', ouvert:true },
  { id:'r4', nom:'Traiteur Excellence',     type:'Traiteur', ville:'Yaoundé', quartier:'Bastos', tel:'+237 677 004 004', horaires:'09h-21h', livraison:true, delai:45, frais:1000, note:4.7, img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop', specialite:'Cuisine camerounaise, Buffets', ouvert:true },
];

// ── Menus par restaurant ──
var MENUS = [
  // Maquis Chez Mama Africa
  { id:'m1', resto:'r1', cat:'Plats', nom:'Ndolé complet', desc:'Ndolé avec viande de bœuf, crevettes et miondo', prix:2500, temps:20, img:'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=120&h=120&fit=crop', dispo:true },
  { id:'m2', resto:'r1', cat:'Plats', nom:'Eru + waterfufu', desc:'Eru préparé à la camerounaise avec fufu', prix:2000, temps:15, img:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&h=120&fit=crop', dispo:true },
  { id:'m3', resto:'r1', cat:'Plats', nom:'Poulet DG', desc:'Poulet Director General aux plantains et légumes', prix:3500, temps:25, img:'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=120&h=120&fit=crop', dispo:true },
  { id:'m4', resto:'r1', cat:'Plats', nom:'Koki haricot', desc:'Koki traditionnel aux haricots blancs', prix:1500, temps:10, img:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&h=120&fit=crop', dispo:true },
  { id:'m5', resto:'r1', cat:'Boissons', nom:'Jus de bissap maison', desc:'Jus d\'hibiscus frais sucré', prix:500, temps:5, img:'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=120&h=120&fit=crop', dispo:true },
  { id:'m6', resto:'r1', cat:'Boissons', nom:'Malta Guinness', desc:'Malta fraîche', prix:400, temps:2, img:'https://images.unsplash.com/photo-1566633806827-5c9b1e9e7bfe?w=120&h=120&fit=crop', dispo:true },
  // Fast Food Le Plateau
  { id:'m7', resto:'r2', cat:'Grillades', nom:'Brochettes bœuf x5', desc:'Brochettes grillées au charbon avec piment', prix:1500, temps:15, img:'https://images.unsplash.com/photo-1598679253544-2c97992403cd?w=120&h=120&fit=crop', dispo:true },
  { id:'m8', resto:'r2', cat:'Grillades', nom:'Soya x5 bâtons', desc:'Soya épicé grillé', prix:1000, temps:10, img:'https://images.unsplash.com/photo-1598679253544-2c97992403cd?w=120&h=120&fit=crop', dispo:true },
  { id:'m9', resto:'r2', cat:'Accompagnements', nom:'Alloco portion', desc:'Banane plantain frite avec sauce tomate', prix:500, temps:8, img:'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=120&h=120&fit=crop', dispo:true },
  { id:'m10',resto:'r2', cat:'Accompagnements', nom:'Beignets haricot x6', desc:'Accra de haricot croustillants', prix:400, temps:5, img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=120&h=120&fit=crop', dispo:true },
  // Pâtisserie
  { id:'m11',resto:'r3', cat:'Pâtisserie', nom:'Gâteau chocolat tranche', desc:'Gâteau moelleux au chocolat noir', prix:800, temps:3, img:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=120&h=120&fit=crop', dispo:true },
  { id:'m12',resto:'r3', cat:'Pâtisserie', nom:'Croissant beurre', desc:'Croissant pur beurre doré', prix:400, temps:2, img:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=120&h=120&fit=crop', dispo:true },
  { id:'m13',resto:'r3', cat:'Boissons', nom:'Café noir express', desc:'Café arabica camerounais', prix:300, temps:3, img:'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=120&h=120&fit=crop', dispo:true },
  { id:'m14',resto:'r3', cat:'Boissons', nom:'Chocolat chaud', desc:'Chocolat chaud au lait entier', prix:500, temps:5, img:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=120&h=120&fit=crop', dispo:true },
  // Traiteur
  { id:'m15',resto:'r4', cat:'Formules', nom:'Menu complet standard', desc:'Entrée + plat + dessert pour 1 personne', prix:5000, temps:30, img:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop', dispo:true },
  { id:'m16',resto:'r4', cat:'Formules', nom:'Buffet froid 10 pers.', desc:'Assortiment froid pour 10 personnes', prix:45000, temps:60, img:'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=120&h=120&fit=crop', dispo:true },
];

// ── Commandes restauration ──
var COMMANDES_RESTO = [];
var resto_seq = 1;

function initRestauration() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_resto') || '{}');
    if (saved.commandes) COMMANDES_RESTO = saved.commandes;
    if (saved.seq)       resto_seq = saved.seq;
  } catch(e) { COMMANDES_RESTO = []; }
}

function saveRestauration() {
  try { localStorage.setItem('sm_resto', JSON.stringify({ commandes: COMMANDES_RESTO, seq: resto_seq })); } catch(e) {}
}

// ── Panier restauration ──
var PANIER_RESTO = [];
var RESTO_ACTIF  = null;

function ajouterAuPanierResto(menuId) {
  var menu = MENUS.find(function(m){ return m.id === menuId; });
  if (!menu) return;
  // Un seul restaurant par panier
  if (PANIER_RESTO.length > 0 && RESTO_ACTIF !== menu.resto) {
    if (!confirm('Votre panier contient des articles d\'un autre restaurant. Vider et recommencer ?')) return;
    PANIER_RESTO = [];
  }
  RESTO_ACTIF = menu.resto;
  var existing = PANIER_RESTO.find(function(i){ return i.id === menuId; });
  if (existing) { existing.qty++; }
  else { PANIER_RESTO.push({ id: menuId, qty: 1 }); }
  updatePanierRestoUI();
  toast(menu.nom + ' ajouté !', 'success');
  renderMenuResto(RESTO_ACTIF);
}

function retirerDuPanierResto(menuId) {
  var existing = PANIER_RESTO.find(function(i){ return i.id === menuId; });
  if (!existing) return;
  existing.qty--;
  if (existing.qty <= 0) PANIER_RESTO = PANIER_RESTO.filter(function(i){ return i.id !== menuId; });
  if (PANIER_RESTO.length === 0) RESTO_ACTIF = null;
  updatePanierRestoUI();
  renderMenuResto(RESTO_ACTIF || '');
}

function getPanierRestoTotal() {
  return PANIER_RESTO.reduce(function(s, i) {
    var m = MENUS.find(function(x){ return x.id === i.id; });
    return s + (m ? m.prix * i.qty : 0);
  }, 0);
}

function updatePanierRestoUI() {
  var cnt = PANIER_RESTO.reduce(function(s,i){ return s+i.qty; }, 0);
  var tot = getPanierRestoTotal();
  var badge = document.getElementById('resto-panier-badge');
  var totEl = document.getElementById('resto-panier-total');
  var btn   = document.getElementById('resto-panier-btn');
  if (badge) badge.textContent = cnt;
  if (totEl) totEl.textContent = tot.toLocaleString('fr-FR') + ' FCFA';
  if (btn)   btn.style.display = cnt > 0 ? 'flex' : 'none';
}

// ── Passer une commande resto ──
function passerCommandeResto() {
  if (PANIER_RESTO.length === 0) { toast('Panier vide !', 'warning'); return; }
  openM('m-commande-resto');
  renderRecapResto();
}

function renderRecapResto() {
  var recap = document.getElementById('recap-resto');
  if (!recap) return;
  var resto = RESTAURANTS.find(function(r){ return r.id === RESTO_ACTIF; });
  var html = '<div style="background:#f0faf5;border-radius:10px;padding:12px;margin-bottom:12px">'
    + '<div style="font-weight:700;font-size:14px;margin-bottom:6px">' + (resto ? resto.nom : '') + '</div>'
    + PANIER_RESTO.map(function(i) {
        var m = MENUS.find(function(x){ return x.id === i.id; });
        if (!m) return '';
        return '<div style="display:flex;justify-content:space-between;font-size:13px;padding:3px 0">'
          + '<span>' + i.qty + 'x ' + m.nom + '</span>'
          + '<span style="font-weight:700">' + (m.prix * i.qty).toLocaleString('fr-FR') + ' F</span>'
          + '</div>';
      }).join('')
    + '<div style="border-top:1px solid #d1fae5;margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-weight:800">'
    + '<span>Total</span><span style="color:#007A3D">' + getPanierRestoTotal().toLocaleString('fr-FR') + ' FCFA</span>'
    + '</div></div>';
  recap.innerHTML = html;
}

function confirmerCommandeResto() {
  var client  = (document.getElementById('resto-client')  || {}).value || '';
  var tel     = (document.getElementById('resto-tel')     || {}).value || '';
  var adresse = (document.getElementById('resto-adresse') || {}).value || '';
  var paiement= (document.getElementById('resto-paiement')|| {}).value || 'MTN MoMo';
  var notes   = (document.getElementById('resto-notes')   || {}).value || '';

  if (!client)  { toast('Nom requis', 'warning'); return; }
  if (!tel)     { toast('Téléphone requis', 'warning'); return; }
  if (!adresse) { toast('Adresse de livraison requise', 'warning'); return; }

  var resto = RESTAURANTS.find(function(r){ return r.id === RESTO_ACTIF; });
  var items = PANIER_RESTO.map(function(i) {
    var m = MENUS.find(function(x){ return x.id === i.id; });
    return { nom: m.nom, prix: m.prix, qty: i.qty, img: m.img };
  });
  var total = getPanierRestoTotal() + (resto ? resto.frais : 0);

  var cmd = {
    id:       'FOOD-' + String(resto_seq++).padStart(3,'0'),
    client:   client,
    tel:      tel,
    adresse:  adresse,
    paiement: paiement,
    notes:    notes,
    resto_id: RESTO_ACTIF,
    resto_nom: resto ? resto.nom : '',
    items:    items,
    sous_total: getPanierRestoTotal(),
    frais_livraison: resto ? resto.frais : 0,
    total:    total,
    statut:   'recu',
    cree_le:  new Date().toISOString()
  };

  COMMANDES_RESTO.unshift(cmd);
  saveRestauration();
  PANIER_RESTO = [];
  RESTO_ACTIF  = null;
  updatePanierRestoUI();
  closeM('m-commande-resto');
  renderCommandesResto();
  renderStatsResto();
  toast('Commande ' + cmd.id + ' passée !', 'success');
  addNotif('Nouvelle commande food : ' + client + ' — ' + cmd.resto_nom, 'green');
  envoyerSMSResto('recu', cmd);

  ['resto-client','resto-tel','resto-adresse','resto-notes'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value='';
  });
}

// ── Changer statut commande ──
function changerStatutResto(id, statut) {
  var cmd = COMMANDES_RESTO.find(function(c){ return c.id === id; });
  if (!cmd) return;
  cmd.statut = statut;
  saveRestauration();
  renderCommandesResto();
  renderStatsResto();
  envoyerSMSResto(statut, cmd);
  toast(id + ' — ' + statut, 'success');
}

// ── SMS Restauration ──
function envoyerSMSResto(statut, cmd) {
  if (!cmd.tel) return;
  var msgs = {
    recu:        'Bonjour ' + cmd.client + ', votre commande ' + cmd.id + ' chez ' + cmd.resto_nom + ' a bien été reçue ! Total : ' + cmd.total.toLocaleString('fr-FR') + ' FCFA. Nous préparons votre repas. SuperMarché CM',
    en_prep:     'Bonjour ' + cmd.client + ', votre commande ' + cmd.id + ' est en cours de préparation. Livraison estimée dans ' + (cmd.delai||30) + ' min. SuperMarché CM',
    en_livraison:'Bonjour ' + cmd.client + ', votre commande ' + cmd.id + ' est en route ! Le livreur arrive bientôt à ' + cmd.adresse + '. SuperMarché CM',
    livre:       'Bonjour ' + cmd.client + ', votre commande ' + cmd.id + ' a été livrée. Bon appétit ! Merci de nous faire confiance. SuperMarché CM',
    annule:      'Bonjour ' + cmd.client + ', votre commande ' + cmd.id + ' a été annulée. Contactez-nous pour plus d\'infos. SuperMarché CM'
  };
  var msg = msgs[statut];
  if (!msg) return;
  fetch((typeof BACKEND!=='undefined'?BACKEND:'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ tel: cmd.tel.replace(/[\s+]/g,''), message: msg })
  }).then(function(r){ return r.json(); })
    .then(function(r){ if(r.ok) toast('SMS envoyé à ' + cmd.client, 'success'); })
    .catch(function(e){ console.warn('SMS resto:', e); });
}

// ── Render liste restaurants ──
function renderListeRestaurants() {
  var grid = document.getElementById('resto-liste');
  if (!grid) return;
  var filtre = (document.getElementById('resto-type-filtre') || {}).value || '';
  var restos = filtre ? RESTAURANTS.filter(function(r){ return r.type === filtre; }) : RESTAURANTS;
  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">'
    + restos.map(function(r) {
        var stars = '<img loading="lazy" src="https://img.icons8.com/ios/14/FCD116/star.png" alt="Etoile" style="width:12px;height:12px;vertical-align:middle">'.repeat(Math.floor(r.note)) + (r.note % 1 >= 0.5 ? '½' : '');
        return '<div class="cd" style="cursor:pointer;overflow:hidden;padding:0" onclick="ouvrirMenuResto(\'' + r.id + '\')">'
          + '<img loading="lazy" src="' + r.img + '" style="width:100%;height:140px;object-fit:cover">'
          + '<div style="padding:14px">'
          + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">'
          + '<div>'
          + '<div style="font-weight:800;font-size:15px">' + r.nom + '</div>'
          + '<div style="font-size:12px;color:#666">' + r.type + ' — ' + r.quartier + ', ' + r.ville + '</div>'
          + '</div>'
          + '<span style="background:' + (r.ouvert?'#dcfce7':'#fee2e2') + ';color:' + (r.ouvert?'#007A3D':'#CE1126') + ';font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px">' + (r.ouvert?'Ouvert':'Fermé') + '</span>'
          + '</div>'
          + '<div style="font-size:12px;color:#555;margin-bottom:8px;font-style:italic">' + r.specialite + '</div>'
          + '<div style="display:flex;gap:12px;font-size:12px;color:#666">'
          + '<span style="color:#f59e0b;font-weight:700">' + stars + ' ' + r.note + '</span>'
          + '<span>⏱ ' + r.delai + ' min</span>'
          + '<span>' + (r.frais===0?'Livraison gratuite':'Livraison ' + r.frais + ' F') + '</span>'
          + '</div>'
          + '<button class="btn bp" style="width:100%;margin-top:10px" onclick="event.stopPropagation();ouvrirMenuResto(\'' + r.id + '\')">Voir le menu</button>'
          + '</div></div>';
      }).join('')
    + '</div>';
}

// ── Ouvrir menu d'un restaurant ──
function ouvrirMenuResto(restoId) {
  RESTO_ACTIF = restoId;
  var resto = RESTAURANTS.find(function(r){ return r.id === restoId; });
  var panel = document.getElementById('resto-menu-panel');
  var titre = document.getElementById('resto-menu-titre');
  if (!panel || !resto) return;
  if (titre) titre.textContent = resto.nom + ' — Menu';
  renderMenuResto(restoId);
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior:'smooth' });
}

function renderMenuResto(restoId) {
  var grid = document.getElementById('resto-menu-grid');
  if (!grid || !restoId) return;
  var items = MENUS.filter(function(m){ return m.resto === restoId; });
  var cats = [];
  items.forEach(function(m){ if (cats.indexOf(m.cat) === -1) cats.push(m.cat); });
  var html = '';
  cats.forEach(function(cat) {
    html += '<div style="font-weight:700;font-size:14px;color:#007A3D;margin:14px 0 8px;padding-bottom:4px;border-bottom:2px solid #d1fae5">' + cat + '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">';
    items.filter(function(m){ return m.cat === cat; }).forEach(function(m) {
      var qte = (PANIER_RESTO.find(function(i){ return i.id === m.id; }) || {}).qty || 0;
      html += '<div class="cd" style="padding:10px">'
        + '<img loading="lazy" src="' + m.img + '" style="width:100%;height:90px;object-fit:cover;border-radius:8px;margin-bottom:8px">'
        + '<div style="font-weight:700;font-size:13px">' + m.nom + '</div>'
        + '<div style="font-size:11px;color:#666;margin-bottom:6px">' + m.desc + '</div>'
        + '<div style="font-size:11px;color:#999;margin-bottom:6px">⏱ ' + m.temps + ' min</div>'
        + '<div style="font-size:15px;font-weight:800;color:#007A3D;margin-bottom:8px">' + m.prix.toLocaleString('fr-FR') + ' FCFA</div>'
        + '<div style="display:flex;align-items:center;gap:8px">'
        + '<button onclick="retirerDuPanierResto(\'' + m.id + '\')" style="width:28px;height:28px;border-radius:50%;border:2px solid #e5e7eb;background:#fff;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center" ' + (qte===0?'disabled':'') + '>−</button>'
        + '<span style="font-weight:700;min-width:20px;text-align:center">' + qte + '</span>'
        + '<button onclick="ajouterAuPanierResto(\'' + m.id + '\')" style="width:28px;height:28px;border-radius:50%;background:#007A3D;border:none;color:#fff;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">+</button>'
        + '</div></div>';
    });
    html += '</div>';
  });
  grid.innerHTML = html;
}

// ── Render commandes ──
function renderCommandesResto() {
  var liste = document.getElementById('resto-commandes-liste');
  if (!liste) return;
  var filtre = (document.getElementById('resto-cmd-filtre') || {}).value || 'tous';
  var cmds = filtre==='tous' ? COMMANDES_RESTO : COMMANDES_RESTO.filter(function(c){ return c.statut===filtre; });
  if (cmds.length === 0) {
    liste.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucune commande</p>';
    return;
  }
  var stMap = {
    recu:         ['Reçu',          '#3b82f6','#dbeafe'],
    en_prep:      ['En préparation','#f59e0b','#fef3c7'],
    en_livraison: ['En livraison',  '#8b5cf6','#ede9fe'],
    livre:        ['Livré',         '#007A3D','#dcfce7'],
    annule:       ['Annulé',        '#CE1126','#fee2e2'],
  };
  liste.innerHTML = cmds.slice(0,30).map(function(c) {
    var st = stMap[c.statut] || ['—','#999','#f9fafb'];
    var dateAff = c.cree_le ? new Date(c.cree_le).toLocaleString('fr-FR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}) : '—';
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap">'
      + '<div style="flex:1;min-width:150px">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
      + '<span style="font-weight:800;color:#007A3D">' + c.id + '</span>'
      + '<span style="font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;background:' + st[2] + ';color:' + st[1] + '">' + st[0] + '</span>'
      + '</div>'
      + '<div style="font-weight:700">' + c.client + ' — ' + c.tel + '</div>'
      + '<div style="font-size:12px;color:#007A3D">' + c.resto_nom + '</div>'
      + '<div style="font-size:12px;color:#666"><img loading="lazy" src="https://img.icons8.com/ios/16/007A3D/map-pin.png" alt="Lieu" style="width:14px;height:14px;vertical-align:middle"> ' + c.adresse + '</div>'
      + '<div style="font-size:12px;color:#999">' + dateAff + ' — ' + c.paiement + '</div>'
      + '</div>'
      + '<div style="text-align:right">'
      + '<div style="font-size:18px;font-weight:800;color:#007A3D">' + c.total.toLocaleString('fr-FR') + ' FCFA</div>'
      + '<div style="font-size:11px;color:#999">' + c.items.length + ' article(s)</div>'
      + '</div>'
      + '</div>'
      + '<div style="font-size:12px;color:#555;margin:6px 0">'
      + c.items.map(function(i){ return i.qty + 'x ' + i.nom; }).join(' · ')
      + '</div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
      + (c.statut==='recu'         ? '<button class="btn bp bsm" onclick="changerStatutResto(\''+c.id+'\',\'en_prep\')">Préparer</button>' : '')
      + (c.statut==='en_prep'      ? '<button class="btn bp bsm" onclick="changerStatutResto(\''+c.id+'\',\'en_livraison\')">Envoyer livreur</button>' : '')
      + (c.statut==='en_livraison' ? '<button class="btn bp bsm" onclick="changerStatutResto(\''+c.id+'\',\'livre\')">Marquer livré</button>' : '')
      + (c.statut!=='livre'&&c.statut!=='annule' ? '<button class="btn bd bsm" onclick="changerStatutResto(\''+c.id+'\',\'annule\')">Annuler</button>' : '')
      + '</div>'
      + '</div>';
  }).join('');
}

// ── Stats ──
function renderStatsResto() {
  var stats = document.getElementById('resto-stats');
  if (!stats) return;
  var encours = COMMANDES_RESTO.filter(function(c){ return ['recu','en_prep','en_livraison'].includes(c.statut); }).length;
  var livrees = COMMANDES_RESTO.filter(function(c){ return c.statut==='livre'; }).length;
  var ca = COMMANDES_RESTO.filter(function(c){ return c.statut==='livre'; }).reduce(function(s,c){ return s+c.total; },0);
  var restos = RESTAURANTS.filter(function(r){ return r.ouvert; }).length;
  stats.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">'
    + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#007A3D">'+restos+'</div><div style="font-size:12px;color:#666">Restaurants ouverts</div></div>'
    + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#f59e0b">'+encours+'</div><div style="font-size:12px;color:#666">En cours</div></div>'
    + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#6b7280">'+livrees+'</div><div style="font-size:12px;color:#666">Livrées</div></div>'
    + '<div class="cd" style="text-align:center"><div style="font-size:22px;font-weight:800;color:#007A3D">'+(ca>=1000?Math.round(ca/1000)+'K':ca.toLocaleString('fr-FR'))+'</div><div style="font-size:12px;color:#666">CA FCFA</div></div>'
    + '</div>';
}

// ── Init page ──
function initPageRestauration() {
  initRestauration();
  renderStatsResto();
  renderListeRestaurants();
  renderCommandesResto();
  updatePanierRestoUI();
}

// ── Supabase sync ──
async function chargerCommandesRestoSupabase() {
  try {
    var sb = _sbMain(); if (!sb) return;
    var res = await sb.from('commandes_restauration').select('*').order('created_at', { ascending: false }).limit(200);
    if (res.data && res.data.length > 0) {
      COMMANDES_RESTO = res.data.map(function(c) {
        return {
          id: c.id, client: c.client, tel: c.tel, adresse: c.adresse,
          paiement: c.paiement, notes: c.notes || '',
          resto_id: c.resto_id, resto_nom: c.resto_nom,
          items: typeof c.items === 'string' ? JSON.parse(c.items) : (c.items || []),
          sous_total: c.sous_total || 0, frais_livraison: c.frais_livraison || 0,
          total: c.total || 0, statut: c.statut, cree_le: c.created_at
        };
      });
    }
  } catch(e) { console.warn('[Resto] Supabase:', e); }
}

async function sauvegarderCommandeRestoSupabase(cmd) {
  try {
    var sb = _sbMain(); if (!sb) return;
    await sb.from('commandes_restauration').upsert({
      id: cmd.id, client: cmd.client, tel: cmd.tel, adresse: cmd.adresse,
      paiement: cmd.paiement, notes: cmd.notes,
      resto_id: cmd.resto_id, resto_nom: cmd.resto_nom,
      items: JSON.stringify(cmd.items),
      sous_total: cmd.sous_total, frais_livraison: cmd.frais_livraison,
      total: cmd.total, statut: cmd.statut
    });
  } catch(e) { console.warn('[Resto] save:', e); }
}

initPageRestauration = async function() {
  initRestauration();
  await chargerCommandesRestoSupabase();
  renderStatsResto();
  renderListeRestaurants();
  renderCommandesResto();
  updatePanierRestoUI();
};


// ═══════════════════════════════════════════════════════
//  AMÉLIORATIONS RESTAURATION
//  1. Barre de progression commande
//  2. Ajout restaurant depuis admin
//  3. Historique client par téléphone
// ═══════════════════════════════════════════════════════

// ── Barre de progression visuelle ──
function renderProgressionResto(statut) {
  var etapes = ['recu', 'en_prep', 'en_livraison', 'livre'];
  var labels  = ['Reçu', 'Préparation', 'En route', 'Livré'];
  var icons   = ['<img loading="lazy" src="https://img.icons8.com/ios/14/007A3D/checkmark.png" alt="OK" style="width:12px;height:12px;vertical-align:middle">', '<img loading="lazy" src="https://img.icons8.com/ios/16/007A3D/frying-pan.png" alt="Cuisine" style="width:14px;height:14px;vertical-align:middle">', '<img loading="lazy" src="https://img.icons8.com/ios/16/007A3D/moped.png" alt="Livraison" style="width:14px;height:14px;vertical-align:middle">', '<img loading="lazy" src="https://img.icons8.com/ios/16/007A3D/checkmark.png" alt="OK" style="width:14px;height:14px;vertical-align:middle">'];
  var step = etapes.indexOf(statut);
  var html = '<div style="display:flex;align-items:center;gap:4px;margin:10px 0;overflow-x:auto">';
  etapes.forEach(function(e, i) {
    var done    = i <= step && statut !== 'annule';
    var current = i === step && statut !== 'annule';
    html += '<div style="flex:1;text-align:center;min-width:55px">'
      + '<div style="width:32px;height:32px;border-radius:50%;margin:0 auto 4px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;'
      + 'background:' + (current ? '#CE1126' : done ? '#007A3D' : '#e5e7eb') + ';'
      + 'color:' + (done || current ? '#fff' : '#999') + ';'
      + (current ? 'box-shadow:0 0 0 3px #CE112633' : '') + '">'
      + (done && !current ? '<img loading="lazy" src="https://img.icons8.com/ios/14/007A3D/checkmark.png" alt="OK" style="width:12px;height:12px;vertical-align:middle">' : icons[i]) + '</div>'
      + '<div style="font-size:10px;color:' + (done || current ? '#007A3D' : '#999') + ';font-weight:' + (current ? '700' : '400') + '">' + labels[i] + '</div>'
      + '</div>'
      + (i < 3 ? '<div style="flex:0.3;height:2px;background:' + (i < step && statut !== 'annule' ? '#007A3D' : '#e5e7eb') + ';margin-bottom:14px"></div>' : '');
  });
  html += '</div>';
  return html;
}

// ── Override renderCommandesResto pour inclure la barre ──
var _renderCommandesRestoOrig = renderCommandesResto;
renderCommandesResto = function() {
  var liste = document.getElementById('resto-commandes-liste');
  if (!liste) return;
  var filtre = (document.getElementById('resto-cmd-filtre') || {}).value || 'tous';
  var cmds = filtre === 'tous' ? COMMANDES_RESTO : COMMANDES_RESTO.filter(function(c){ return c.statut === filtre; });
  if (cmds.length === 0) {
    liste.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucune commande</p>';
    return;
  }
  var stMap = {
    recu:         ['Reçu',          '#3b82f6', '#dbeafe'],
    en_prep:      ['En préparation','#f59e0b', '#fef3c7'],
    en_livraison: ['En livraison',  '#8b5cf6', '#ede9fe'],
    livre:        ['Livré',         '#007A3D', '#dcfce7'],
    annule:       ['Annulé',        '#CE1126', '#fee2e2'],
  };
  liste.innerHTML = cmds.slice(0, 30).map(function(c) {
    var st = stMap[c.statut] || ['—', '#999', '#f9fafb'];
    var dateAff = c.cree_le ? new Date(c.cree_le).toLocaleString('fr-FR', {hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}) : '—';
    var resto = RESTAURANTS.find(function(r){ return r.id === c.resto_id; });
    var delai = resto ? resto.delai : 30;
    var tempsEcoule = c.cree_le ? Math.floor((Date.now() - new Date(c.cree_le).getTime()) / 60000) : 0;
    var tempsRestant = Math.max(0, delai - tempsEcoule);
    return '<div class="cd" style="margin-bottom:12px">'
      + '<div style="display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap">'
      + '<div style="flex:1;min-width:150px">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
      + '<span style="font-weight:800;color:#007A3D">' + c.id + '</span>'
      + '<span style="font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;background:' + st[2] + ';color:' + st[1] + '">' + st[0] + '</span>'
      + (c.statut === 'en_livraison' ? '<span style="font-size:11px;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:20px;font-weight:700">⏱ ~' + tempsRestant + ' min</span>' : '')
      + '</div>'
      + '<div style="font-weight:700">' + c.client + ' — ' + c.tel + '</div>'
      + '<div style="font-size:12px;color:#007A3D">' + c.resto_nom + '</div>'
      + '<div style="font-size:12px;color:#666"><img loading="lazy" src="https://img.icons8.com/ios/16/007A3D/map-pin.png" alt="Lieu" style="width:14px;height:14px;vertical-align:middle"> ' + c.adresse + '</div>'
      + '<div style="font-size:12px;color:#999">' + dateAff + ' — ' + c.paiement + '</div>'
      + '</div>'
      + '<div style="text-align:right">'
      + '<div style="font-size:18px;font-weight:800;color:#007A3D">' + c.total.toLocaleString('fr-FR') + ' FCFA</div>'
      + '<div style="font-size:11px;color:#999">' + c.items.length + ' article(s)</div>'
      + '</div>'
      + '</div>'
      + renderProgressionResto(c.statut)
      + '<div style="font-size:12px;color:#555;margin:4px 0">' + c.items.map(function(i){ return i.qty + 'x ' + i.nom; }).join(' · ') + '</div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
      + (c.statut === 'recu'         ? '<button class="btn bp bsm" onclick="changerStatutResto(\'' + c.id + '\',\'en_prep\')">Préparer</button>' : '')
      + (c.statut === 'en_prep'      ? '<button class="btn bp bsm" onclick="changerStatutResto(\'' + c.id + '\',\'en_livraison\')">Envoyer livreur</button>' : '')
      + (c.statut === 'en_livraison' ? '<button class="btn bp bsm" onclick="changerStatutResto(\'' + c.id + '\',\'livre\')">Marquer livré</button>' : '')
      + (c.statut !== 'livre' && c.statut !== 'annule' ? '<button class="btn bd bsm" onclick="changerStatutResto(\'' + c.id + '\',\'annule\')">Annuler</button>' : '')
      + '</div>'
      + '</div>';
  }).join('');
};

// ── Ajouter un restaurant ──
function ajouterRestaurant() {
  var nom      = (document.getElementById('new-resto-nom')      || {}).value || '';
  var type     = (document.getElementById('new-resto-type')     || {}).value || 'Maquis';
  var ville    = (document.getElementById('new-resto-ville')    || {}).value || 'Douala';
  var quartier = (document.getElementById('new-resto-quartier') || {}).value || '';
  var tel      = (document.getElementById('new-resto-tel')      || {}).value || '';
  var spec     = (document.getElementById('new-resto-spec')     || {}).value || '';
  var delai    = parseInt((document.getElementById('new-resto-delai') || {}).value) || 30;
  var frais    = parseInt((document.getElementById('new-resto-frais') || {}).value) || 500;

  if (!nom)     { toast('Nom du restaurant requis', 'warning'); return; }
  if (!quartier){ toast('Quartier requis', 'warning'); return; }
  if (!tel)     { toast('Téléphone requis', 'warning'); return; }

  var newResto = {
    id:        'r' + (RESTAURANTS.length + 1),
    nom:       nom, type: type, ville: ville, quartier: quartier,
    tel:       tel, horaires: '08h-22h', livraison: true,
    delai:     delai, frais: frais, note: 4.5,
    img:       'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop' + Date.now() + '/400/200',
    specialite:spec, ouvert: true
  };
  RESTAURANTS.push(newResto);
  // Sauvegarder dans localStorage
  try { localStorage.setItem('sm_restaurants', JSON.stringify(RESTAURANTS)); } catch(e) {}
  closeM('m-ajouter-resto');
  renderListeRestaurants();
  renderStatsResto();
  toast('Restaurant "' + nom + '" ajouté !', 'success');
  addNotif('Nouveau restaurant partenaire : ' + nom, 'green');
  ['new-resto-nom','new-resto-quartier','new-resto-tel','new-resto-spec'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value='';
  });
}

// ── Charger restaurants sauvegardés ──
function chargerRestaurantsSauvegardes() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_restaurants') || 'null');
    if (saved && Array.isArray(saved) && saved.length > RESTAURANTS.length) {
      RESTAURANTS = saved;
    }
  } catch(e) {}
}

// ── Historique commandes par téléphone ──
function rechercherHistoriqueClient() {
  var tel = (document.getElementById('histo-tel') || {}).value || '';
  if (!tel) { toast('Entrez un numéro de téléphone', 'warning'); return; }
  var cmds = COMMANDES_RESTO.filter(function(c){ return c.tel.replace(/[\s]/g,'').includes(tel.replace(/[\s]/g,'')); });
  var zone = document.getElementById('histo-result');
  if (!zone) return;
  if (cmds.length === 0) {
    zone.innerHTML = '<p style="color:#999;font-size:13px">Aucune commande pour ce numéro</p>';
    return;
  }
  var total = cmds.reduce(function(s,c){ return s + c.total; }, 0);
  zone.innerHTML = '<div style="background:#f0faf5;border-radius:10px;padding:12px;margin-bottom:10px">'
    + '<div style="font-weight:700">' + cmds[0].client + ' — ' + cmds.length + ' commande(s)</div>'
    + '<div style="font-size:13px;color:#007A3D;font-weight:700">Total dépensé : ' + total.toLocaleString('fr-FR') + ' FCFA</div>'
    + '</div>'
    + cmds.map(function(c){
        return '<div style="font-size:12px;padding:6px 0;border-bottom:1px solid #f0f0f0">'
          + '<span style="font-weight:700;color:#007A3D">' + c.id + '</span> — '
          + c.resto_nom + ' — ' + c.total.toLocaleString('fr-FR') + ' F — ' + c.statut
          + '</div>';
      }).join('');
}

// Surcharger initPageRestauration pour charger les restaurants sauvegardés
var _initPageRestoOrig = initPageRestauration;
initPageRestauration = async function() {
  chargerRestaurantsSauvegardes();
  initRestauration();
  initGerantsResto();
  await chargerCommandesRestoSupabase();
  renderStatsResto();
  renderListeRestaurants();
  renderCommandesResto();
  renderGerantsResto();
  updatePanierRestoUI();
};

// ═══════════════════════════════════════════════════════
//  GÉRANTS RESTAURANT — Ajout gérant + menu + vue chef
// ═══════════════════════════════════════════════════════

var GERANTS_RESTO = [];
var gerant_resto_seq = 1;

function initGerantsResto() {
  try {
    var s = JSON.parse(localStorage.getItem('sm_gerants_resto') || '[]');
    if (Array.isArray(s)) { GERANTS_RESTO = s; gerant_resto_seq = s.length + 1; }
  } catch(e) { GERANTS_RESTO = []; }
}

function saveGerantsResto() {
  try { localStorage.setItem('sm_gerants_resto', JSON.stringify(GERANTS_RESTO)); } catch(e) {}
}

// ── Ajouter un gérant restaurant ──
function ajouterGerantResto() {
  var nom    = (document.getElementById('gr-nom')    || {}).value || '';
  var tel    = (document.getElementById('gr-tel')    || {}).value || '';
  var email  = (document.getElementById('gr-email')  || {}).value || '';
  var pwd    = (document.getElementById('gr-pwd')    || {}).value || '';
  var restoId= (document.getElementById('gr-resto')  || {}).value || '';

  if (!nom)    { if (typeof toast==='function') toast('Nom requis','warning'); return; }
  if (!email)  { if (typeof toast==='function') toast('Email requis','warning'); return; }
  if (!pwd)    { if (typeof toast==='function') toast('Mot de passe requis','warning'); return; }
  if (!restoId){ if (typeof toast==='function') toast('Choisissez un restaurant','warning'); return; }

  var resto = RESTAURANTS.find(function(r){ return r.id === restoId; });
  if (!resto) return;

  var gerant = {
    id: 'GR' + (gerant_resto_seq++),
    nom: nom, tel: tel, email: email, pwd: pwd,
    resto_id: restoId, resto_nom: resto.nom,
    date_ajout: new Date().toLocaleDateString('fr-FR')
  };
  GERANTS_RESTO.push(gerant);
  saveGerantsResto();

  // Créer compte restaurateur dans ACCOUNTS
  if (typeof ACCOUNTS !== 'undefined') {
    ACCOUNTS.push({
      email: email, pwd: pwd,
      nom: nom.toUpperCase(), prenom: '',
      role: 'restaurateur',
      sm: resto.nom + ' — ' + (resto.ville || 'Cameroun'),
      resto_id: restoId
    });
    try { localStorage.setItem('sm_accounts', JSON.stringify(ACCOUNTS)); } catch(e) {}
  }

  if (typeof closeM==='function') closeM('m-gerant-resto');
  renderGerantsResto();
  if (typeof toast==='function') toast(nom + ' assigné à ' + resto.nom + ' !', 'success');
  if (typeof addNotif==='function') addNotif('Nouveau chef : ' + nom + ' → ' + resto.nom, 'green');
  ['gr-nom','gr-tel','gr-email','gr-pwd'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

function renderGerantsResto() {
  var zone = document.getElementById('gerants-resto-liste');
  if (!zone) return;
  if (GERANTS_RESTO.length === 0) {
    zone.innerHTML = '<p style="text-align:center;color:#999;padding:16px">Aucun gérant assigné</p>';
    return;
  }
  zone.innerHTML = GERANTS_RESTO.map(function(g) {
    var resto = RESTAURANTS.find(function(r){ return r.id === g.resto_id; });
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">'
      + '<div>'
      + '<div style="font-weight:800;font-size:14px">' + g.nom + '</div>'
      + '<div style="font-size:12px;color:#007A3D;font-weight:600">' + (resto ? resto.nom : g.resto_nom) + '</div>'
      + '<div style="font-size:11px;color:#666">' + g.email + ' — ' + (g.tel||'') + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:6px">'
      + '<a href="https://wa.me/' + (g.tel||'').replace(/[\s+\-]/g,'') + '" target="_blank" class="btn bo bsm">WhatsApp</a>'
      + '<button class="btn bd bsm" onclick="retirerGerantResto(\'' + g.id + '\')">Retirer</button>'
      + '</div></div></div>';
  }).join('');
}

function retirerGerantResto(id) {
  GERANTS_RESTO = GERANTS_RESTO.filter(function(g){ return g.id !== id; });
  saveGerantsResto();
  renderGerantsResto();
  if (typeof toast==='function') toast('Gérant retiré', 'success');
}

// ── Ajouter un menu dans un restaurant ──
function ajouterMenuResto() {
  var restoId = (document.getElementById('menu-resto') || {}).value || '';
  var nom     = (document.getElementById('menu-nom')   || {}).value || '';
  var cat     = (document.getElementById('menu-cat')   || {}).value || 'Plat';
  var prix    = parseInt((document.getElementById('menu-prix') || {}).value) || 0;
  var desc    = (document.getElementById('menu-desc')  || {}).value || '';
  var delai   = parseInt((document.getElementById('menu-delai')|| {}).value) || 20;

  if (!restoId) { if (typeof toast==='function') toast('Choisissez un restaurant','warning'); return; }
  if (!nom)     { if (typeof toast==='function') toast('Nom du plat requis','warning'); return; }
  if (prix <= 0){ if (typeof toast==='function') toast('Prix requis','warning'); return; }

  var resto = RESTAURANTS.find(function(r){ return r.id === restoId; });
  if (!resto) return;

  var plat = {
    id: 'PLT' + Date.now(),
    nom: nom, cat: cat, prix: prix, desc: desc,
    delai: delai, dispo: true,
    img: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=120&h=120&fit=crop'
  };

  if (!resto.menu) resto.menu = [];
  resto.menu.push(plat);

  // Sauvegarder
  try { localStorage.setItem('sm_restaurants', JSON.stringify(RESTAURANTS)); } catch(e) {}

  if (typeof closeM==='function') closeM('m-menu-resto');
  if (typeof renderListeRestaurants==='function') renderListeRestaurants();
  if (typeof toast==='function') toast(nom + ' ajouté au menu de ' + resto.nom + ' !', 'success');
  ['menu-nom','menu-desc'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

// ── Vue restaurateur : commandes de son restaurant uniquement ──
function initVueRestaurateur() {
  if (typeof currentUser === 'undefined' || !currentUser) return;
  var restoId = currentUser.resto_id || '';

  // Si restaurateur, trouver son restaurant
  if (!restoId && currentUser.role === 'restaurateur') {
    var gerant = GERANTS_RESTO.find(function(g){ return g.email === currentUser.email; });
    if (gerant) restoId = gerant.resto_id;
  }

  var zone = document.getElementById('vue-restaurateur-content');
  if (!zone) return;

  if (!restoId) {
    zone.innerHTML = '<div style="text-align:center;padding:30px;color:#999">Aucun restaurant assigné à votre compte.<br>Contactez l\'administrateur.</div>';
    return;
  }

  var resto = RESTAURANTS.find(function(r){ return r.id === restoId; });
  var commandes = (typeof COMMANDES_RESTO !== 'undefined' ? COMMANDES_RESTO : [])
    .filter(function(c){ return c.resto_id === restoId && c.statut !== 'livre' && c.statut !== 'annule'; });

  var html = '<div style="background:linear-gradient(135deg,#007A3D,#005a2c);color:#fff;border-radius:16px;padding:20px;margin-bottom:16px">'
    + '<div style="font-size:22px;font-weight:800;margin-bottom:4px">' + (resto ? resto.nom : 'Mon restaurant') + '</div>'
    + '<div style="font-size:13px;opacity:.85">' + commandes.length + ' commande(s) à traiter</div>'
    + '</div>';

  if (commandes.length === 0) {
    html += '<div style="text-align:center;padding:40px;color:#999">'
      + '<img loading="lazy" src="https://img.icons8.com/ios/48/999999/restaurant.png" style="width:40px;height:40px;display:block;margin:0 auto 12px">'
      + '<div style="font-size:15px;font-weight:600">Aucune commande en attente</div>'
      + '<div style="font-size:12px;margin-top:4px">Les nouvelles commandes apparaîtront ici</div>'
      + '</div>';
  } else {
    var stColors = { recu:'#f59e0b', en_preparation:'#3b82f6', pret:'#007A3D', en_livraison:'#8b5cf6' };
    var stLabels = { recu:'Reçue', en_preparation:'En préparation', pret:'Prêt à livrer', en_livraison:'En livraison' };
    html += commandes.map(function(c) {
      var st = stColors[c.statut] || '#999';
      var stL = stLabels[c.statut] || c.statut;
      return '<div class="cd" style="margin-bottom:10px">'
        + '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">'
        + '<div>'
        + '<span style="font-weight:800;color:#007A3D">' + c.id + '</span>'
        + ' <span style="font-size:11px;background:' + st + '22;color:' + st + ';padding:2px 10px;border-radius:20px;font-weight:700">' + stL + '</span>'
        + '<div style="font-weight:700;margin-top:4px">' + c.client + ' — ' + c.tel + '</div>'
        + '<div style="font-size:12px;color:#555">' + (c.plats||[]).map(function(p){ return p.qty+'x '+p.nom; }).join(', ') + '</div>'
        + (c.adresse ? '<div style="font-size:11px;color:#007A3D;font-weight:600">📍 ' + c.adresse + '</div>' : '')
        + '</div>'
        + '<div style="font-size:18px;font-weight:800;color:#007A3D">' + (c.total||0).toLocaleString('fr-FR') + ' F</div>'
        + '</div>'
        + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
        + (c.statut==='recu' ? '<button class="btn bp bsm" onclick="changerStatutRestoChef(\'' + c.id + '\',\'en_preparation\')">Commencer préparation</button>' : '')
        + (c.statut==='en_preparation' ? '<button class="btn bp bsm" onclick="changerStatutRestoChef(\'' + c.id + '\',\'pret\')">Marquer prêt</button>' : '')
        + (c.statut==='pret' ? '<button class="btn bo bsm" onclick="envoyerALivraison(\'' + c.id + '\')">Envoyer en livraison</button>' : '')
        + '</div></div>';
    }).join('');
  }
  zone.innerHTML = html;
}

function changerStatutRestoChef(id, statut) {
  if (typeof COMMANDES_RESTO !== 'undefined') {
    var cmd = COMMANDES_RESTO.find(function(c){ return c.id === id; });
    if (cmd) {
      cmd.statut = statut;
      try { localStorage.setItem('sm_resto', JSON.stringify({ commandes: COMMANDES_RESTO })); } catch(e) {}
    }
  }
  initVueRestaurateur();
  if (typeof toast==='function') toast('Commande ' + id + ' — ' + statut, 'success');
}

function envoyerALivraison(cmdId) {
  if (typeof COMMANDES_RESTO === 'undefined') return;
  var cmd = COMMANDES_RESTO.find(function(c){ return c.id === cmdId; });
  if (!cmd) return;
  cmd.statut = 'en_livraison';
  try { localStorage.setItem('sm_resto', JSON.stringify({ commandes: COMMANDES_RESTO })); } catch(e) {}

  // Créer une livraison dans le module livraisons
  if (typeof creerLivraison === 'function') {
    creerLivraison({
      id: cmdId,
      client: cmd.client, tel: cmd.tel,
      adresse: cmd.adresse || 'A confirmer',
      ville: cmd.ville || 'Cameroun',
      total: cmd.total || 0,
      notes: 'Commande restaurant : ' + (cmd.plats||[]).map(function(p){ return p.nom; }).join(', ')
    });
  }

  initVueRestaurateur();
  if (typeof toast==='function') toast('Commande envoyée en livraison !', 'success');
  if (typeof addNotif==='function') addNotif('Commande ' + cmdId + ' prête — assignez un livreur', 'green');
}

// Initialiser les selects dans les modals restaurant
function remplirSelectsResto() {
  ['gr-resto', 'menu-resto'].forEach(function(selId) {
    var sel = document.getElementById(selId);
    if (!sel) return;
    sel.innerHTML = '<option value="">Choisir un restaurant...</option>';
    RESTAURANTS.forEach(function(r) {
      var opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.nom + ' (' + (r.type||'') + ')';
      sel.appendChild(opt);
    });
  });
}
