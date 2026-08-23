
function _sbAgri() {
  if (typeof window.supabase === 'undefined') return null;
  try { return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key); } catch(e) { return null; }
}
async function syncAgriSupabase(cmd) {
  try {
    var sb = _sbAgri(); if (!sb) return;
    await sb.from('sm_commandes_agriculture').upsert({
      id: cmd.id, client: cmd.client, tel: cmd.tel,
      items: cmd.items || [], total: cmd.total || 0,
      statut: cmd.statut, adresse: cmd.adresse || ''
    }, { onConflict: 'id' });
  } catch(e) { console.warn('[Agri] sync:', e); }
}
async function chargerAgriSupabase() {
  try {
    var sb = _sbAgri(); if (!sb) return;
    var res = await sb.from('sm_commandes_agriculture').select('*').order('created_at', { ascending: false });
    if (res.data && res.data.length > 0) {
      var local = JSON.parse(localStorage.getItem('sm_agri') || '{"commandes":[]}');
      if (!local.commandes) local.commandes = [];
      res.data.forEach(function(r) {
        if (!local.commandes.find(function(x){ return x.id === r.id; })) local.commandes.unshift(r);
      });
      localStorage.setItem('sm_agri', JSON.stringify(local));
    }
  } catch(e) { console.warn('[Agri] charger:', e); }
}
// ═══════════════════════════════════════════════════════
//  SuperMarché CM — agriculture.js
//  Agriculture & Élevage : Intrants + Animaux + Conseils
// ═══════════════════════════════════════════════════════

var AGRI_PRODUITS = [
  // SEMENCES
  { id:'ag1',  nom:'Semences maïs hybride 5kg',      cat:'Semences',   prix:8500,  stock:50,  img:'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=250&fit=crop', desc:'Rendement 8-10T/ha' },
  { id:'ag2',  nom:'Semences tomate cerises 100g',    cat:'Semences',   prix:5000,  stock:30,  img:'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=250&fit=crop', desc:'Variété résistante' },
  { id:'ag3',  nom:'Semences plantain 10 plants',     cat:'Semences',   prix:15000, stock:20,  img:'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=250&fit=crop', desc:'Plants sélectionnés' },
  { id:'ag4',  nom:'Semences piment 50g',             cat:'Semences',   prix:3500,  stock:40,  img:'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=250&fit=crop', desc:'Piment fort camerounais' },
  // ENGRAIS
  { id:'ag5',  nom:'Engrais NPK 20-10-10 50kg',      cat:'Engrais',    prix:25000, stock:100, img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop', desc:'Pour céréales et légumes' },
  { id:'ag6',  nom:'Urée 46% azote 50kg',            cat:'Engrais',    prix:22000, stock:80,  img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop', desc:'Engrais azoté puissant' },
  { id:'ag7',  nom:'Compost organique 20kg',         cat:'Engrais',    prix:5000,  stock:200, img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop', desc:'Agriculture biologique' },
  // PESTICIDES
  { id:'ag8',  nom:'Herbicide Glyphosate 1L',        cat:'Pesticides', prix:8500,  stock:60,  img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop', desc:'Désherbant total' },
  { id:'ag9',  nom:'Insecticide Lambda-cyhalothrine',cat:'Pesticides', prix:6500,  stock:40,  img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop', desc:'Anti-insectes polyvalent' },
  { id:'ag10', nom:'Fongicide Mancozèbe 500g',       cat:'Pesticides', prix:4500,  stock:50,  img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop', desc:'Prévention maladies' },
  // OUTILLAGE
  { id:'ag11', nom:'Pulvérisateur dorsal 16L',       cat:'Outillage',  prix:18000, stock:25,  img:'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=250&fit=crop', desc:'Traitement phytosanitaire' },
  { id:'ag12', nom:'Houe rotative acier',            cat:'Outillage',  prix:8500,  stock:30,  img:'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=250&fit=crop', desc:'Binage et désherbage' },
  { id:'ag13', nom:'Arrosoir 10L galvanisé',         cat:'Outillage',  prix:5500,  stock:40,  img:'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=250&fit=crop', desc:'Arrosage précis' },
  { id:'ag14', nom:'Machette forestière + fourreau', cat:'Outillage',  prix:6500,  stock:50,  img:'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=250&fit=crop', desc:'Défrichage et taille' },
  // ALIMENTATION ANIMAUX
  { id:'ag15', nom:'Aliment poulet de chair 50kg',   cat:'Élevage',    prix:18000, stock:100, img:'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=400&h=250&fit=crop', desc:'Croissance rapide' },
  { id:'ag16', nom:'Aliment pondeuses 50kg',         cat:'Élevage',    prix:17000, stock:80,  img:'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=400&h=250&fit=crop', desc:'Production optimale' },
  { id:'ag17', nom:'Son de blé 50kg',                cat:'Élevage',    prix:8500,  stock:150, img:'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=250&fit=crop', desc:'Porcs et ruminants' },
  { id:'ag18', nom:'Complément minéral bovins 25kg', cat:'Élevage',    prix:12000, stock:40,  img:'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=250&fit=crop', desc:'Santé et croissance bovins' },
  // ANIMAUX VIVANTS
  { id:'ag19', nom:'Poulet chair (1 mois)',          cat:'Animaux',    prix:2500,  stock:50,  img:'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=250&fit=crop', desc:'Prêt à l\'engraissement' },
  { id:'ag20', nom:'Poussin d\'un jour x10',         cat:'Animaux',    prix:15000, stock:20,  img:'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=250&fit=crop', desc:'Souche chair améliorée' },
  { id:'ag21', nom:'Lapins x2 (couple)',             cat:'Animaux',    prix:8000,  stock:15,  img:'https://images.unsplash.com/photo-1495476479092-6ece2898a4d5?w=400&h=250&fit=crop', desc:'Race néo-zélandaise' },
  { id:'ag22', nom:'Cochon d\'Inde x2',              cat:'Animaux',    prix:5000,  stock:20,  img:'https://images.unsplash.com/photo-1495476479092-6ece2898a4d5?w=400&h=250&fit=crop', desc:'Élevage rentable' },
];

var COMMANDES_AGRI = [];
var agri_seq = 1;
var PANIER_AGRI = [];

function initAgriculture() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_agri') || '{}');
    if (saved.commandes) COMMANDES_AGRI = saved.commandes;
    if (saved.seq) agri_seq = saved.seq;
  } catch(e) { COMMANDES_AGRI = []; }
}

function saveAgriculture() {
  try { localStorage.setItem('sm_agri', JSON.stringify({ commandes: COMMANDES_AGRI, seq: agri_seq })); } catch(e) {}
}

function ajouterAgri(id) {
  var prod = AGRI_PRODUITS.find(function(p){ return p.id===id; });
  if (!prod || prod.stock===0) { toast('Produit indisponible', 'error'); return; }
  var ex = PANIER_AGRI.find(function(i){ return i.id===id; });
  if (ex) ex.qty++;
  else PANIER_AGRI.push({ id:id, qty:1 });
  updatePanierAgriUI();
  toast(prod.nom + ' ajouté !', 'success');
}

function getPanierAgriTotal() {
  return PANIER_AGRI.reduce(function(s,i){
    var p = AGRI_PRODUITS.find(function(x){ return x.id===i.id; });
    return s + (p?p.prix*i.qty:0);
  }, 0);
}

function updatePanierAgriUI() {
  var cnt = PANIER_AGRI.reduce(function(s,i){ return s+i.qty; }, 0);
  var badge = document.getElementById('agri-panier-badge');
  var totEl = document.getElementById('agri-panier-total');
  var btn   = document.getElementById('agri-panier-btn');
  if (badge) badge.textContent = cnt;
  if (totEl) totEl.textContent = getPanierAgriTotal().toLocaleString('fr-FR') + ' FCFA';
  if (btn)   btn.style.display = cnt>0 ? 'flex' : 'none';
}

function passerCommandeAgri() {
  if (PANIER_AGRI.length===0) { toast('Panier vide !', 'warning'); return; }
  openM('m-commande-agri');
  // Afficher récap
  var recap = document.getElementById('agri-recap');
  if (recap) {
    recap.innerHTML = '<div style="background:#f0faf5;border-radius:10px;padding:12px;margin-bottom:12px">'
      + PANIER_AGRI.map(function(i){
          var p = AGRI_PRODUITS.find(function(x){ return x.id===i.id; });
          if (!p) return '';
          return '<div style="display:flex;justify-content:space-between;font-size:13px;padding:3px 0"><span>'+i.qty+'x '+p.nom+'</span><span style="font-weight:700">'+(p.prix*i.qty).toLocaleString('fr-FR')+' F</span></div>';
        }).join('')
      + '<div style="border-top:1px solid #d1fae5;margin-top:8px;padding-top:8px;font-weight:800;display:flex;justify-content:space-between"><span>Total</span><span style="color:#007A3D">'+getPanierAgriTotal().toLocaleString('fr-FR')+' FCFA</span></div>'
      + '</div>';
  }
}

function confirmerCommandeAgri() {
  var client  = (document.getElementById('agri-client')  || {}).value || '';
  var tel     = (document.getElementById('agri-tel')     || {}).value || '';
  var adresse = (document.getElementById('agri-adresse') || {}).value || '';
  var paiement= (document.getElementById('agri-paiement')|| {}).value || 'MTN MoMo';
  if (!client)  { toast('Nom requis', 'warning'); return; }
  if (!tel)     { toast('Téléphone requis', 'warning'); return; }
  var items = PANIER_AGRI.map(function(i){
    var p = AGRI_PRODUITS.find(function(x){ return x.id===i.id; });
    return { nom:p.nom, prix:p.prix, qty:i.qty };
  });
  var cmd = {
    id: 'AGRI-' + String(agri_seq++).padStart(3,'0'),
    client:client, tel:tel, adresse:adresse, paiement:paiement,
    items:items, total:getPanierAgriTotal(), statut:'recu',
    cree_le:new Date().toISOString()
  };
  COMMANDES_AGRI.unshift(cmd);
  saveAgriculture();
  PANIER_AGRI = [];
  updatePanierAgriUI();
  closeM('m-commande-agri');
  renderCommandesAgri();
  toast('Commande ' + cmd.id + ' passée !', 'success');
  addNotif('Nouvelle commande agri : ' + client, 'green');
  envoyerSMSAgri('recu', cmd);
  ['agri-client','agri-tel','agri-adresse'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

function changerStatutAgri(id, statut) {
  var cmd = COMMANDES_AGRI.find(function(c){ return c.id===id; });
  if (!cmd) return;
  cmd.statut = statut;
  saveAgriculture();
  renderCommandesAgri();
  envoyerSMSAgri(statut, cmd);
  toast(id + ' — ' + statut, 'success');
}

function envoyerSMSAgri(statut, cmd) {
  if (!cmd.tel) return;
  var msgs = {
    recu:        'Bonjour ' + cmd.client + ', votre commande agricole ' + cmd.id + ' (' + cmd.total.toLocaleString('fr-FR') + ' FCFA) a été reçue. Livraison sous 48h. SuperMarché CM Agri',
    en_livraison:'Bonjour ' + cmd.client + ', votre commande agricole ' + cmd.id + ' est en route ! SuperMarché CM',
    livre:       'Bonjour ' + cmd.client + ', votre commande agricole ' + cmd.id + ' a été livrée. Bonne récolte ! SuperMarché CM'
  };
  var msg = msgs[statut]; if (!msg) return;
  fetch((typeof BACKEND!=='undefined'?BACKEND:'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ tel: cmd.tel.replace(/[\s+]/g,''), message: msg })
  }).catch(function(e){ console.warn('SMS agri:', e); });
}

function renderCatalogueAgri() {
  var grid = document.getElementById('agri-catalogue');
  if (!grid) return;
  var filtre = (document.getElementById('agri-cat-filtre')||{}).value || '';
  var srch   = ((document.getElementById('agri-search')||{}).value||'').toLowerCase();
  var prods  = AGRI_PRODUITS.filter(function(p){
    return (!filtre||p.cat===filtre) && (!srch||p.nom.toLowerCase().includes(srch));
  });
  grid.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px">'
    + prods.map(function(p) {
        var cats_colors = { Semences:'#dcfce7', Engrais:'#fef3c7', Pesticides:'#fee2e2', Outillage:'#dbeafe', Elevage:'#ede9fe', Animaux:'#fff3cd' };
        var col = cats_colors[p.cat] || '#f0faf5';
        return '<div class="cd">'
          + '<img loading="lazy" src="' + p.img + '" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px">'
          + '<span style="font-size:10px;background:'+col+';padding:2px 8px;border-radius:20px;font-weight:700;color:#333">' + p.cat + '</span>'
          + '<div style="font-weight:700;font-size:13px;margin:6px 0 2px">' + p.nom + '</div>'
          + '<div style="font-size:11px;color:#666;margin-bottom:6px">' + p.desc + '</div>'
          + '<div style="font-size:15px;font-weight:800;color:#007A3D;margin-bottom:8px">' + p.prix.toLocaleString('fr-FR') + ' FCFA</div>'
          + '<button class="btn bp bsm" style="width:100%" onclick="ajouterAgri(\'' + p.id + '\')" '+(p.stock===0?'disabled':'')+'>Ajouter au panier</button>'
          + '</div>';
      }).join('') + '</div>';
}

function renderCommandesAgri() {
  var liste = document.getElementById('agri-commandes');
  if (!liste) return;
  if (COMMANDES_AGRI.length===0) { liste.innerHTML='<p style="text-align:center;color:#999;padding:20px">Aucune commande</p>'; return; }
  var stMap = { recu:['Reçue','#3b82f6','#dbeafe'], en_livraison:['En livraison','#f59e0b','#fef3c7'], livre:['Livrée','#007A3D','#dcfce7'], annule:['Annulée','#CE1126','#fee2e2'] };
  liste.innerHTML = COMMANDES_AGRI.slice(0,20).map(function(c){
    var st = stMap[c.statut]||['—','#999','#f9fafb'];
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">'
      + '<div><span style="font-weight:800;color:#007A3D">'+c.id+'</span> <span style="font-size:11px;padding:2px 10px;border-radius:20px;background:'+st[2]+';color:'+st[1]+';font-weight:700">'+st[0]+'</span>'
      + '<div style="font-weight:700;margin-top:4px">'+c.client+' — '+c.tel+'</div>'
      + '<div style="font-size:12px;color:#555">'+c.items.map(function(i){return i.qty+'x '+i.nom;}).join(' · ')+'</div>'
      + '</div>'
      + '<div style="font-size:18px;font-weight:800;color:#007A3D">'+c.total.toLocaleString('fr-FR')+' FCFA</div>'
      + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
      + (c.statut==='recu'?'<button class="btn bp bsm" onclick="changerStatutAgri(\''+c.id+'\',\'en_livraison\')">Envoyer</button>':'')
      + (c.statut==='en_livraison'?'<button class="btn bp bsm" onclick="changerStatutAgri(\''+c.id+'\',\'livre\')">Livré</button>':'')
      + (c.statut!=='livre'&&c.statut!=='annule'?'<button class="btn bd bsm" onclick="changerStatutAgri(\''+c.id+'\',\'annule\')">Annuler</button>':'')
      + '</div></div>';
  }).join('');
}

function initPageAgriculture() {
  initAgriculture();
  renderCatalogueAgri();
  renderCommandesAgri();
  updatePanierAgriUI();
}

// ═══════════════════════════════════════════════════════
//  CALENDRIER CULTURAL CAMEROUN
// ═══════════════════════════════════════════════════════

var CALENDRIER_CULTURAL = [
  { culture:'Maïs',         saison1_debut:3, saison1_fin:7, saison2_debut:8, saison2_fin:11, region:'Toutes', conseil:'Planter en début de saison des pluies. Espacer de 75cm x 25cm.' },
  { culture:'Plantain',     saison1_debut:3, saison1_fin:5, saison2_debut:9, saison2_fin:11, region:'Sud, Littoral, Ouest', conseil:'Planter les rejets en saison des pluies. Paillez le sol.' },
  { culture:'Tomate',       saison1_debut:10,saison1_fin:1,  saison2_debut:3, saison2_fin:6,  region:'Adamaoua, Ouest', conseil:'Arrosage régulier. Tuteurage recommandé.' },
  { culture:'Manioc',       saison1_debut:3, saison1_fin:12, saison2_debut:null,saison2_fin:null, region:'Toutes', conseil:'Culture toute l\'année si humidité suffisante.' },
  { culture:'Arachide',     saison1_debut:3, saison1_fin:7, saison2_debut:8, saison2_fin:11, region:'Centre, Sud, Est', conseil:'Sol bien drainé. Éviter les zones inondables.' },
  { culture:'Cacao',        saison1_debut:5, saison1_fin:7, saison2_debut:9, saison2_fin:11, region:'Centre, Sud, SW', conseil:'Plantation sous ombrage. Fertilisation organique.' },
  { culture:'Café Robusta', saison1_debut:4, saison1_fin:6, saison2_debut:9, saison2_fin:11, region:'Littoral, SW, NW', conseil:'Sol légèrement acide. Taille après récolte.' },
  { culture:'Piment',       saison1_debut:3, saison1_fin:6, saison2_debut:9, saison2_fin:12, region:'Toutes', conseil:'Arrosage modéré. Traitement anti-pucerons préventif.' },
  { culture:'Légumes feuilles',saison1_debut:1,saison1_fin:12,saison2_debut:null,saison2_fin:null, region:'Toutes', conseil:'Culture possible toute l\'année avec irrigation.' },
  { culture:'Igname',       saison1_debut:2, saison1_fin:5, saison2_debut:null,saison2_fin:null, region:'Nord, Adamaoua', conseil:'Billons de 30cm minimum. Semence de 300g.' },
];

var MOIS_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

function renderCalendrierCultural() {
  var container = document.getElementById('calendrier-cultural');
  if (!container) return;
  var moisActuel = new Date().getMonth() + 1; // 1-12

  container.innerHTML = '<div class="cd" style="margin-bottom:16px">'
    + '<div class="ch"><div class="ct">Calendrier cultural — Cameroun</div>'
    + '<span style="font-size:12px;background:#dcfce7;color:#007A3D;padding:4px 12px;border-radius:20px;font-weight:700">Mois actuel : ' + MOIS_LABELS[moisActuel-1] + '</span>'
    + '</div>'
    + '<div style="overflow-x:auto;margin-top:12px">'
    + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<tr style="background:#007A3D;color:#fff">'
    + '<th style="padding:8px 12px;text-align:left;min-width:120px">Culture</th>'
    + MOIS_LABELS.map(function(m, i) {
        var isCurrent = i + 1 === moisActuel;
        return '<th style="padding:8px 6px;min-width:35px;text-align:center;background:' + (isCurrent ? '#CE1126' : '#007A3D') + '">' + m + '</th>';
      }).join('')
    + '<th style="padding:8px 12px;text-align:left;min-width:200px">Conseils</th>'
    + '</tr>'
    + CALENDRIER_CULTURAL.map(function(c, idx) {
        var bg = idx % 2 === 0 ? '#fff' : '#f9fafb';
        var moisHtml = '';
        for (var m = 1; m <= 12; m++) {
          var enSaison1 = c.saison1_debut && c.saison1_fin &&
            (c.saison1_debut <= c.saison1_fin
              ? m >= c.saison1_debut && m <= c.saison1_fin
              : m >= c.saison1_debut || m <= c.saison1_fin);
          var enSaison2 = c.saison2_debut && c.saison2_fin &&
            (c.saison2_debut <= c.saison2_fin
              ? m >= c.saison2_debut && m <= c.saison2_fin
              : m >= c.saison2_debut || m <= c.saison2_fin);
          var enSaison = enSaison1 || enSaison2;
          var isCurrent = m === moisActuel;
          moisHtml += '<td style="padding:6px;text-align:center;background:'
            + (isCurrent && enSaison ? '#CE1126' : isCurrent ? '#fff3cd' : enSaison ? '#dcfce7' : bg) + '">'
            + (enSaison ? '<div style="width:20px;height:20px;border-radius:50%;background:' + (isCurrent ? '#CE1126' : '#007A3D') + ';margin:0 auto"></div>' : '')
            + '</td>';
        }
        return '<tr style="background:' + bg + '">'
          + '<td style="padding:8px 12px;font-weight:700">' + c.culture + '<div style="font-size:10px;color:#999;font-weight:400">' + c.region + '</div></td>'
          + moisHtml
          + '<td style="padding:8px 12px;font-size:11px;color:#555">' + c.conseil + '</td>'
          + '</tr>';
      }).join('')
    + '</table>'
    + '<div style="display:flex;gap:16px;margin-top:10px;font-size:11px;color:#666">'
    + '<div style="display:flex;align-items:center;gap:4px"><div style="width:14px;height:14px;border-radius:50%;background:#007A3D"></div> Période de plantation</div>'
    + '<div style="display:flex;align-items:center;gap:4px"><div style="width:14px;height:14px;border-radius:50%;background:#CE1126"></div> Ce mois</div>'
    + '</div>'
    + '</div></div>';
}

var _initPageAgriOrig = initPageAgriculture;
initPageAgriculture = function() {
  initAgriculture();
  renderCatalogueAgri();
  renderCommandesAgri();
  updatePanierAgriUI();
  renderCalendrierCultural();
};
