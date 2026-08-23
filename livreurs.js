// ═══════════════════════════════════════════════════════
// SuperMarché CM — livreurs.js
// Gestion des livreurs, zones Cameroun, carte GPS
// ═══════════════════════════════════════════════════════

// ── Régions et villes du Cameroun ──
var ZONES_CAMEROUN = [
 // ─── LITTORAL ───
 {
 id:'REG1', region:'Littoral', couleur:'#007A3D',
 villes: [
 { id:'V1', nom:'Douala — Centre', quartiers:['Bonanjo','Akwa','Bali','Bonapriso','Bassa'], frais:1500, delai:'1-2h', lat:4.0511, lng:9.7679 },
 { id:'V2', nom:'Douala — Bepanda', quartiers:['Bepanda','Ndokotti','Nylon','Makepe','Logpom'], frais:2000, delai:'2-3h', lat:4.0600, lng:9.7400 },
 { id:'V3', nom:'Douala — Bonaberi', quartiers:['Bonaberi','Bonassama','Japoma','Manoka'], frais:2500, delai:'2-4h', lat:4.0700, lng:9.6900 },
 { id:'V4', nom:'Douala — PK / Logbaba', quartiers:['PK 14','PK 16','PK 18','PK 20','Logbaba'], frais:3000, delai:'3-4h', lat:4.0200, lng:9.7800 },
 { id:'V5', nom:'Edéa', quartiers:['Centre Edéa','Batanga','Dizangué'], frais:5000, delai:'4-6h', lat:3.7960, lng:10.1340 },
 { id:'V6', nom:'Nkongsamba', quartiers:['Centre','Melong','Mbanga'], frais:6000, delai:'5-7h', lat:4.9530, lng:9.9370 },
 ]
 },
 // ─── CENTRE ───
 {
 id:'REG2', region:'Centre', couleur:'#3b82f6',
 villes: [
 { id:'V7', nom:'Yaoundé — Centre', quartiers:['Nlongkak','Bastos','Mfoundi','Mvog-Mbi'], frais:4000, delai:'5-7h', lat:3.8480, lng:11.5021 },
 { id:'V8', nom:'Yaoundé — Biyem-Assi',quartiers:['Biyem-Assi','Mvog-Ada','Mimboman','Nkomo'], frais:4500, delai:'5-8h', lat:3.8200, lng:11.4800 },
 { id:'V9', nom:'Yaoundé — Essos', quartiers:['Essos','Mendong','Damas','Odza'], frais:4500, delai:'5-8h', lat:3.8700, lng:11.5300 },
 { id:'V10', nom:'Mbalmayo', quartiers:['Centre Mbalmayo','Nkolmelen'], frais:6000, delai:'6-8h', lat:3.5200, lng:11.5000 },
 { id:'V11', nom:'Obala', quartiers:['Centre Obala','Saa'], frais:7000, delai:'7-9h', lat:4.1600, lng:11.5300 },
 ]
 },
 // ─── OUEST ───
 {
 id:'REG3', region:'Ouest', couleur:'#f59e0b',
 villes: [
 { id:'V12', nom:'Bafoussam', quartiers:['Bafoussam Centre','Tamdja','Djeleng','Famla'], frais:6000, delai:'6-8h', lat:5.4737, lng:10.4179 },
 { id:'V13', nom:'Dschang', quartiers:['Dschang Centre','Foto'], frais:7000, delai:'7-9h', lat:5.4462, lng:10.0572 },
 { id:'V14', nom:'Mbouda', quartiers:['Mbouda Centre','Babadjou'], frais:7500, delai:'7-9h', lat:5.6294, lng:10.2531 },
 { id:'V15', nom:'Foumban', quartiers:['Foumban Centre','Koutaba'], frais:8000, delai:'8-10h', lat:5.7264, lng:10.9044 },
 ]
 },
 // ─── NORD-OUEST ───
 {
 id:'REG4', region:'Nord-Ouest', couleur:'#8b5cf6',
 villes: [
 { id:'V16', nom:'Bamenda', quartiers:['Commercial Ave','Up Station','Nkwen','Mile 4'], frais:7000, delai:'7-9h', lat:5.9597, lng:10.1460 },
 { id:'V17', nom:'Kumbo', quartiers:['Kumbo Centre','Nso'], frais:9000, delai:'9-12h', lat:6.2000, lng:10.6800 },
 { id:'V18', nom:'Wum', quartiers:['Wum Centre'], frais:10000, delai:'10-14h', lat:6.3800, lng:10.0700 },
 ]
 },
 // ─── SUD-OUEST ───
 {
 id:'REG5', region:'Sud-Ouest', couleur:'#ec4899',
 villes: [
 { id:'V19', nom:'Buea', quartiers:['Buea Town','Molyko','Bonduma','Great Soppo'], frais:5000, delai:'5-7h', lat:4.1527, lng:9.2417 },
 { id:'V20', nom:'Limbé', quartiers:['Limbé Centre','Down Beach','Bota'], frais:5500, delai:'5-7h', lat:4.0219, lng:9.2056 },
 { id:'V21', nom:'Kumba', quartiers:['Kumba Centre','Fiango','Mbonge'], frais:6000, delai:'6-8h', lat:4.6360, lng:9.4460 },
 { id:'V22', nom:'Mundemba', quartiers:['Mundemba Centre'], frais:12000, delai:'12-16h', lat:4.9700, lng:8.8900 },
 ]
 },
 // ─── SUD ───
 {
 id:'REG6', region:'Sud', couleur:'#14b8a6',
 villes: [
 { id:'V23', nom:'Ebolowa', quartiers:['Ebolowa Centre','Nkoadjap'], frais:7000, delai:'7-9h', lat:2.9000, lng:11.1500 },
 { id:'V24', nom:'Kribi', quartiers:['Kribi Centre','Mpalla','Londji'], frais:7000, delai:'7-9h', lat:2.9400, lng:9.9100 },
 { id:'V25', nom:'Sangmélima', quartiers:['Sangmélima Centre'], frais:8000, delai:'8-10h', lat:2.9400, lng:11.9800 },
 ]
 },
 // ─── EST ───
 {
 id:'REG7', region:'Est', couleur:'#f97316',
 villes: [
 { id:'V26', nom:'Bertoua', quartiers:['Bertoua Centre','Mokolo','Nkolbikon'], frais:9000, delai:'9-12h', lat:4.5833, lng:13.6833 },
 { id:'V27', nom:'Abong-Mbang', quartiers:['Abong-Mbang Centre'], frais:11000, delai:'11-14h', lat:3.9800, lng:13.1800 },
 { id:'V28', nom:'Batouri', quartiers:['Batouri Centre'], frais:12000, delai:'12-15h', lat:4.4386, lng:14.3643 },
 ]
 },
 // ─── ADAMAOUA ───
 {
 id:'REG8', region:'Adamaoua', couleur:'#a855f7',
 villes: [
 { id:'V29', nom:'Ngaoundéré', quartiers:['Centre Commercial','Ngaoundéré Centre','Bamyanga'], frais:10000, delai:'10-14h', lat:7.3167, lng:13.5833 },
 { id:'V30', nom:'Meiganga', quartiers:['Meiganga Centre'], frais:13000, delai:'13-18h', lat:6.5167, lng:14.2833 },
 ]
 },
 // ─── NORD ───
 {
 id:'REG9', region:'Nord', couleur:'#ef4444',
 villes: [
 { id:'V31', nom:'Garoua', quartiers:['Garoua Centre','Poumpoumré','Lopéré'], frais:12000, delai:'12-18h', lat:9.3000, lng:13.3833 },
 { id:'V32', nom:'Guider', quartiers:['Guider Centre'], frais:14000, delai:'14-20h', lat:9.9333, lng:13.9500 },
 { id:'V33', nom:'Figuil', quartiers:['Figuil Centre'], frais:14000, delai:'14-20h', lat:9.7667, lng:13.9667 },
 ]
 },
 // ─── EXTRÊME-NORD ───
 {
 id:'REG10', region:'Extrême-Nord', couleur:'#dc2626',
 villes: [
 { id:'V34', nom:'Maroua', quartiers:['Maroua Centre','Domayo','Kakataré','Palar'], frais:15000, delai:'18-24h', lat:10.5906, lng:14.3153 },
 { id:'V35', nom:'Kousseri', quartiers:['Kousseri Centre'], frais:17000, delai:'20-28h', lat:12.0769, lng:15.0306 },
 { id:'V36', nom:'Mora', quartiers:['Mora Centre'], frais:16000, delai:'20-26h', lat:11.0449, lng:14.1414 },
 ]
 },
];


// ── Aplatir toutes les villes en liste simple ──
function getZonesList() {
 var liste = [];
 ZONES_CAMEROUN.forEach(function(reg) {
 reg.villes.forEach(function(v) {
 liste.push({
 id: v.id,
 nom: v.nom,
 region: reg.region,
 quartiers: v.quartiers,
 frais: v.frais,
 delai: v.delai,
 couleur: reg.couleur,
 lat: v.lat,
 lng: v.lng
 });
 });
 });
 return liste;
}
var ZONES_CAMEROUN_FLAT = getZonesList();

// ── Livreurs ──
var LIVREURS_DATA = {
 liste: [],
 seq: 1
};

function _sbLiv2() {
 if (typeof window.supabase === 'undefined') return null;
 return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
}

async function initLivreurs() {
 try {
 var sb = _sbLiv2(); if (!sb) return;
 var res = await sb.from('livreurs').select('*').order('created_at', { ascending: false });
 if (res.data) LIVREURS_DATA.liste = res.data;
 } catch(e) { console.warn('[Livreurs] init:', e); }
}

// ── Ajouter un livreur ──
async function ajouterLivreur() {
 var nom = document.getElementById('liv-nom') ? document.getElementById('liv-nom').value.trim() : '';
 var tel = document.getElementById('liv-tel') ? document.getElementById('liv-tel').value.trim() : '';
 var email = document.getElementById('liv-email') ? document.getElementById('liv-email').value.trim() : '';
 var pwd = document.getElementById('liv-pwd') ? document.getElementById('liv-pwd').value.trim() : '';
 var zone = document.getElementById('liv-zone') ? document.getElementById('liv-zone').value : 'Z1';

 if (!nom || !tel || !email || !pwd) {
 if (typeof toast === 'function') toast('Remplissez tous les champs obligatoires', 'error');
 return;
 }

 // Vérifier email unique
 if (LIVREURS_DATA.liste.find(function(l){ return l.email === email; })) {
 if (typeof toast === 'function') toast('Un livreur avec cet email existe déjà', 'error');
 return;
 }

 var livreur = {
 id: LIVREURS_DATA.seq++,
 nom: nom,
 tel: tel,
 email: email,
 pwd: pwd,
 zone: zone,
 statut: 'disponible',
 livraisons: 0,
 note: 5.0,
 photo: '',
 actif: true,
 date_ajout: new Date().toLocaleDateString('fr-FR')
 };

 LIVREURS_DATA.liste.push(livreur);

 // Ajouter aussi dans USERS pour la connexion
 if (typeof USERS !== 'undefined') {
 USERS.comptes.push({
 id: livreur.id + 100,
 nom: nom,
 email: email,
 pwd: pwd,
 role: 'livreur',
 sm: 'Zone ' + zone,
 actif: true,
 derniere_co: null
 });
 if (typeof saveUsers === 'function') saveUsers();
 }

 try {
 var sb = _sbLiv2();
 if (sb) {
 var res = await sb.from('livreurs').insert(livreur).select().single();
 if (res.data) {
 LIVREURS_DATA.liste[LIVREURS_DATA.liste.length - 1] = res.data;
 }
 }
 } catch(e) { console.warn('[Livreurs] ajouter:', e); }

 renderLivreurs();
 fermerModalLivreur();
 if (typeof toast === 'function') toast('Livreur ' + nom + ' ajouté avec succès !', 'success');
 if (typeof addNotif === 'function') addNotif('Nouveau livreur : ' + nom, 'green');
}

// ── Supprimer un livreur ──
async function supprimerLivreur(id) {
 if (!confirm('Voulez-vous vraiment supprimer ce livreur ?')) return;
 try {
 var sb = _sbLiv2();
 if (sb) await sb.from('livreurs').delete().eq('id', id);
 } catch(e) { console.warn('[Livreurs] supprimer:', e); }
 LIVREURS_DATA.liste = LIVREURS_DATA.liste.filter(function(l){ return l.id !== id; });
 renderLivreurs();
 if (typeof toast === 'function') toast('Livreur supprimé', 'warning');
}

async function changerStatutLivreur(id, statut) {
 var liv = LIVREURS_DATA.liste.find(function(l){ return l.id === id; });
 if (!liv) return;
 liv.statut = statut;
 try {
 var sb = _sbLiv2();
 if (sb) await sb.from('livreurs').update({ statut: statut }).eq('id', id);
 } catch(e) { console.warn('[Livreurs] statut:', e); }
 renderLivreurs();
}

// ── Afficher modal ajout livreur ──
function ouvrirModalLivreur() {
 var modal = document.getElementById('modal-livreur');
 if (modal) modal.style.display = 'flex';
}

function fermerModalLivreur() {
 var modal = document.getElementById('modal-livreur');
 if (modal) modal.style.display = 'none';
 // Vider les champs
 ['liv-nom','liv-tel','liv-email','liv-pwd'].forEach(function(id){
 var el = document.getElementById(id); if(el) el.value = '';
 });
}

// ── Render tableau livreurs ──
function renderLivreurs() {
 var container = document.getElementById('livreurs-container');
 if (!container) return;

 // Afficher le chargement puis charger Supabase
 container.innerHTML = '<div style="text-align:center;padding:40px;color:#999">Chargement...</div>';

 initLivreurs().then(function() {
 _renderLivreursUI();
 }).catch(function() {
 _renderLivreursUI();
 });
}

function _renderLivreursUI() {
 var container = document.getElementById('livreurs-container');
 if (!container) return;

 var statutColors = { disponible:'#007A3D', en_livraison:'#f59e0b', indisponible:'#ef4444', repos:'#6b7280' };
 var statutLabels = { disponible:'Disponible', en_livraison:'En livraison', indisponible:'Indisponible', repos:'En repos' };

 // Stats globales
 var dispo = LIVREURS_DATA.liste.filter(function(l){ return l.statut==='disponible' && l.actif; }).length;
 var enCours = LIVREURS_DATA.liste.filter(function(l){ return l.statut==='en_livraison'; }).length;
 var total = LIVREURS_DATA.liste.length;

 container.innerHTML =

 // ── Stats ──
 '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px">'
 + '<div class="cd" style="text-align:center;border-left:4px solid #007A3D;flex:1;min-width:80px"><div style="font-size:28px;font-weight:800;color:#007A3D">'+dispo+'</div><div style="font-size:12px;color:#999">Disponibles</div></div>'
 + '<div class="cd" style="text-align:center;border-left:4px solid #f59e0b;flex:1;min-width:80px"><div style="font-size:28px;font-weight:800;color:#f59e0b">'+enCours+'</div><div style="font-size:12px;color:#999">En livraison</div></div>'
 + '<div class="cd" style="text-align:center;border-left:4px solid #3b82f6;flex:1;min-width:80px"><div style="font-size:28px;font-weight:800;color:#3b82f6">'+total+'</div><div style="font-size:12px;color:#999">Total livreurs</div></div>'
 + '</div>'

 // ── Bouton ajouter ──
 + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'
 + '<h3 style="margin:0">Mes Livreurs</h3>'
 + '<button class="btn bp" onclick="ouvrirModalLivreur()" style="padding:8px 16px">'
 + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:5px"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>'
 + 'Ajouter un livreur</button>'
 + '</div>'

 // ── Carte des régions du Cameroun ──
 + '<div class="cd" style="margin-bottom:20px">'
 + '<h4 style="margin-bottom:12px"> Zones de livraison — Tout le Cameroun</h4>'
 + '<div style="display:flex;flex-wrap:wrap;gap:10px">'
 + ZONES_CAMEROUN.map(function(reg){
 var livsReg = LIVREURS_DATA.liste.filter(function(l){
 return reg.villes.some(function(v){ return v.id===l.zone; }) && l.actif;
 }).length;
 var totalVilles = reg.villes.length;
 return '<div style="border:2px solid '+reg.couleur+';border-radius:10px;padding:12px;flex:1;min-width:180px;max-width:280px">'
 + '<div style="font-weight:700;color:'+reg.couleur+';font-size:14px;margin-bottom:6px">'+reg.region+'</div>'
 + reg.villes.map(function(v){
 return '<div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid #f0f0f0">'
 + '<span>'+v.nom+'</span>'
 + '<span style="font-weight:600;color:#007A3D">'+v.frais.toLocaleString('fr-FR')+' F</span>'
 + '</div>';
 }).join('')
 + '<div style="font-size:11px;color:#999;margin-top:6px">'+livsReg+' livreur(s) • '+totalVilles+' ville(s)</div>'
 + '</div>';
 }).join('')
 + '</div></div>'

 // ── Liste des livreurs ──
 + (LIVREURS_DATA.liste.length === 0
 ? '<div class="cd" style="text-align:center;padding:40px;color:#999">Aucun livreur. Cliquez "Ajouter un livreur" pour commencer.</div>'
 : '<div style="display:flex;flex-direction:column;gap:12px">'
 + LIVREURS_DATA.liste.map(function(l){
 var zone = ZONES_CAMEROUN_FLAT.find(function(z){ return z.id===l.zone; }) || ZONES_CAMEROUN_FLAT[0];
 var etoiles = '';
 for(var i=0;i<5;i++) etoiles += i < Math.round(l.note) ? '' : '';
 return '<div class="cd" style="border-left:4px solid '+statutColors[l.statut || "disponible"]+'">'
 + '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">'
 + '<div style="display:flex;align-items:center;gap:12px">'
 + '<div style="width:48px;height:48px;border-radius:50%;background:'+zone.couleur+';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:18px">'
 + l.nom.charAt(0)
 + '</div>'
 + '<div>'
 + '<div style="font-weight:700;font-size:15px">'+l.nom+'</div>'
 + '<div style="font-size:12px;color:#666">'+l.tel+' • '+l.email+'</div>'
 + '<div style="font-size:12px;color:'+zone.couleur+';font-weight:600">Zone : '+zone.nom+'</div>'
 + '<div style="font-size:12px;color:#f59e0b">'+etoiles+' ('+l.note+')</div>'
 + '</div></div>'
 + '<div style="text-align:right">'
 + '<span style="background:'+statutColors[l.statut || "disponible"]+';color:#fff;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700">'+statutLabels[l.statut || 'disponible']+'</span>'
 + '<div style="font-size:12px;color:#999;margin-top:4px">'+l.livraisons+' livraisons</div>'
 + '</div></div>'
 + '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">'
 + '<a href="tel:'+l.tel+'" class="btn bo bsm"> Appeler</a>'
 + '<a href="https://wa.me/'+l.tel.replace(/\D/g,'')+'" target="_blank" class="btn bo bsm"> WhatsApp</a>'
 + (l.statut==='disponible'
 ? '<button class="btn bsm" style="background:#f59e0b;color:#fff" onclick="changerStatutLivreur('+l.id+',\'indisponible\')"> Pause</button>'
 : '<button class="btn bp bsm" onclick="changerStatutLivreur('+l.id+',"disponible")"> Activer</button>')
 + '<button class="btn bd bsm" onclick="supprimerLivreur('+l.id+')"> Supprimer</button>'
 + '</div></div>';
 }).join('')
 + '</div>')

 // ── Modal GPS ──
 + '<div class="cd" style="margin-top:20px">'
 + '<h4 style="margin-bottom:8px">Suivi GPS en temps réel</h4>'
 + '<div id="carte-gps" style="width:100%;height:300px;border-radius:10px;overflow:hidden;border:1px solid #ddd"></div>'
 + '<p style="font-size:12px;color:#999;margin-top:8px;text-align:center">Carte OpenStreetMap — Positions des livreurs en temps réel</p>'
 + '</div>'

 // ── Modal ajout livreur ──
 + '<div id="modal-livreur" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;padding:16px">'
 + '<div style="background:#fff;border-radius:16px;padding:24px;width:100%;max-width:400px;max-height:90vh;overflow-y:auto">'
 + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">'
 + '<h3 style="margin:0;color:#007A3D">Nouveau Livreur</h3>'
 + '<button onclick="fermerModalLivreur()" style="border:none;background:none;font-size:24px;cursor:pointer;color:#999">×</button>'
 + '</div>'
 + '<div style="display:flex;flex-direction:column;gap:14px">'
 + '<div><label style="font-size:13px;font-weight:600;color:#555;display:block;margin-bottom:4px">Nom complet *</label>'
 + '<input id="liv-nom" type="text" placeholder="Ex: Kamdem Paul" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box"></div>'
 + '<div><label style="font-size:13px;font-weight:600;color:#555;display:block;margin-bottom:4px">Téléphone *</label>'
 + '<input id="liv-tel" type="tel" placeholder="+237 6XX XX XX XX" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box"></div>'
 + '<div><label style="font-size:13px;font-weight:600;color:#555;display:block;margin-bottom:4px">Email *</label>'
 + '<input id="liv-email" type="email" placeholder="livreur@email.com" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box"></div>'
 + '<div><label style="font-size:13px;font-weight:600;color:#555;display:block;margin-bottom:4px">Mot de passe *</label>'
 + '<input id="liv-pwd" type="password" placeholder="Mot de passe pour connexion" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box"></div>'
 + '<div><label style="font-size:13px;font-weight:600;color:#555;display:block;margin-bottom:4px">Zone de livraison</label>'
 + '<select id="liv-zone" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box">'
 + ZONES_CAMEROUN.map(function(reg){
 return '<optgroup label="── '+reg.region+' ──">'
 + reg.villes.map(function(v){
 return '<option value="'+v.id+'">'+v.nom+' — '+v.frais.toLocaleString('fr-FR')+' FCFA ('+v.delai+')</option>';
 }).join('')
 + '</optgroup>';
 }).join('')
 + '</select></div>'
 + '<button onclick="ajouterLivreur()" class="btn bp" style="width:100%;padding:12px;font-size:15px;margin-top:4px">Enregistrer le livreur</button>'
 + '</div></div></div>';

 // Initialiser la carte GPS
 setTimeout(initCarteGPS, 100);
}

// ── Carte GPS Leaflet — Suivi temps réel ──
var _carteLeaflet = null;
var _carteMarkers = {};
var _carteInterval = null;

function initCarteGPS() {
 var carteEl = document.getElementById('carte-gps');
 if (!carteEl) return;

 // Détruire l'ancienne carte si elle existe
 if (_carteLeaflet) {
 _carteLeaflet.remove();
 _carteLeaflet = null;
 }
 if (_carteInterval) { clearInterval(_carteInterval); _carteInterval = null; }
 _carteMarkers = {};

 // Créer la carte Leaflet centrée sur Douala
 _carteLeaflet = L.map('carte-gps').setView([4.0511, 9.7679], 10);

 // Tuiles OpenStreetMap (gratuites)
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 attribution: 'OpenStreetMap',
 maxZoom: 18
 }).addTo(_carteLeaflet);

 // Charger les positions immédiatement puis toutes les 10 secondes
 chargerPositionsLivreurs();
 _carteInterval = setInterval(chargerPositionsLivreurs, 10000);
}

async function chargerPositionsLivreurs() {
 try {
 var sb = _sbLiv2(); if (!sb) return;
 var res = await sb.from('livreurs_positions').select('*');
 if (!res.data || res.data.length === 0) return;

 var statutColors = { disponible:'#007A3D', en_livraison:'#f59e0b', indisponible:'#ef4444', repos:'#6b7280' };

 res.data.forEach(function(pos) {
 if (!pos.lat || !pos.lng) return;
 var couleur = statutColors[pos.statut] || '#007A3D';

 // Icône personnalisée
 var icon = L.divIcon({
 html: '<div style="background:' + couleur + ';color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)">'
 + (pos.nom || '?')[0].toUpperCase()
 + '</div>',
 className: '',
 iconSize: [32, 32],
 iconAnchor: [16, 16]
 });

 if (_carteMarkers[pos.livreur_id]) {
 // Mettre à jour la position existante
 _carteMarkers[pos.livreur_id].setLatLng([pos.lat, pos.lng]);
 _carteMarkers[pos.livreur_id].setIcon(icon);
 } else {
 // Créer un nouveau marqueur
 var marker = L.marker([pos.lat, pos.lng], { icon: icon })
 .addTo(_carteLeaflet)
 .bindPopup(
 '<strong>' + (pos.nom || 'Livreur') + '</strong><br>'
 + 'Tel : ' + (pos.tel || '-') + '<br>'
 + 'Statut : ' + (pos.statut || 'inconnu') + '<br>'
 + '<small style="color:#999">Mis à jour : ' + new Date(pos.updated_at).toLocaleTimeString('fr-FR') + '</small>'
 );
 _carteMarkers[pos.livreur_id] = marker;
 }
 });
 } catch(e) { console.warn('[GPS] charger positions:', e); }
}

// ── Livreur : envoyer sa position en temps réel ──
var _gpsWatchId = null;

async function activerGPSLivreur() {
 if (!navigator.geolocation) {
 if (typeof toast === 'function') toast('GPS non supporté sur cet appareil', 'error');
 return;
 }
 if (typeof USERS === 'undefined' || !USERS.currentUser) return;

 var livreur = USERS.currentUser;
 if (typeof toast === 'function') toast('GPS activé — position en cours d\'envoi', 'success');

 var btn = document.getElementById('btn-gps-livreur');
 if (btn) { btn.textContent = 'GPS actif'; btn.style.background = '#10b981'; }

 _gpsWatchId = navigator.geolocation.watchPosition(
 async function(pos) {
 try {
 var sb = _sbLiv2(); if (!sb) return;
 await sb.from('livreurs_positions').upsert({
 livreur_id: livreur.id,
 nom: livreur.nom,
 tel: livreur.tel || '',
 statut: livreur.role || 'livreur',
 lat: pos.coords.latitude,
 lng: pos.coords.longitude,
 updated_at: new Date().toISOString()
 }, { onConflict: 'livreur_id' });
 } catch(e) { console.warn('[GPS] envoi position:', e); }
 },
 function(err) { console.warn('[GPS] erreur:', err); },
 { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
 );
}

function desactiverGPSLivreur() {
 if (_gpsWatchId !== null) {
 navigator.geolocation.clearWatch(_gpsWatchId);
 _gpsWatchId = null;
 }
 var btn = document.getElementById('btn-gps-livreur');
 if (btn) { btn.textContent = 'Activer GPS'; btn.style.background = ''; }
 if (typeof toast === 'function') toast('GPS désactivé', 'warning');
}

// ── Obtenir livreurs disponibles pour une zone ──
function getLivreursDisponibles(zoneId) {
 return LIVREURS_DATA.liste.filter(function(l){
 return l.actif && l.statut === 'disponible' && (!zoneId || l.zone === zoneId);
 });
}

// ── Calculer frais de livraison selon quartier ──
function getFraisLivraison(quartier) {
 for (var i = 0; i < ZONES_CAMEROUN_FLAT.length; i++) {
 var z = ZONES_CAMEROUN_FLAT[i];
 if (z.quartiers.some(function(q){ return quartier.toLowerCase().includes(q.toLowerCase()); })) {
 return { zone: z, frais: z.frais, delai: z.delai };
 }
 }
 return { zone: ZONES_CAMEROUN_FLAT[1], frais: 2000, delai: '2-3h' };
}
