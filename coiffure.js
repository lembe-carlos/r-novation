// ═══════════════════════════════════════════════════════
// SuperMarché CM — coiffure.js
// Salon de Coiffure : Réservations + Services + SMS
// ═══════════════════════════════════════════════════════

// ── Services disponibles ──
var COIFFURE_SERVICES = [
 // FEMME
 { id:'cf1', genre:'femme', nom:'Tresses classiques', duree:120, prix:3500, cat:'Tressage' },
 { id:'cf2', genre:'femme', nom:'Tresses collées', duree:180, prix:5000, cat:'Tressage' },
 { id:'cf3', genre:'femme', nom:'Tissage simple', duree:90, prix:8000, cat:'Tissage' },
 { id:'cf4', genre:'femme', nom:'Tissage avec frontal', duree:120, prix:15000, cat:'Tissage' },
 { id:'cf5', genre:'femme', nom:'Défrisage complet', duree:90, prix:6000, cat:'Défrisage'},
 { id:'cf6', genre:'femme', nom:'Coloration cheveux', duree:120, prix:12000, cat:'Couleur' },
 { id:'cf7', genre:'femme', nom:'Soin kératine', duree:150, prix:18000, cat:'Soin' },
 { id:'cf8', genre:'femme', nom:'Coupe + brushing', duree:60, prix:4500, cat:'Coupe' },
 { id:'cf9', genre:'femme', nom:'Forfait mariage', duree:240, prix:45000, cat:'Forfait' },
 { id:'cf10',genre:'femme', nom:'Abonnement mensuel femme', duree:0, prix:25000, cat:'Abonnement'},
 // HOMME
 { id:'ch1', genre:'homme', nom:'Coupe simple', duree:30, prix:1500, cat:'Coupe' },
 { id:'ch2', genre:'homme', nom:'Coupe + barbe', duree:45, prix:2500, cat:'Coupe' },
 { id:'ch3', genre:'homme', nom:'Rasage tête + barbe', duree:45, prix:2000, cat:'Rasage' },
 { id:'ch4', genre:'homme', nom:'Dreadlocks installation', duree:180, prix:20000, cat:'Locks' },
 { id:'ch5', genre:'homme', nom:'Entretien dreadlocks', duree:90, prix:8000, cat:'Locks' },
 { id:'ch6', genre:'homme', nom:'Forfait mariage homme', duree:90, prix:15000, cat:'Forfait' },
 { id:'ch7', genre:'homme', nom:'Abonnement mensuel homme', duree:0, prix:12000, cat:'Abonnement'},
];

// ── Créneaux horaires ──
var COIFFURE_CRENEAUX = ['08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00'];

// ── Réservations ──
var RESERVATIONS_COIFFURE = [];

function initCoiffure() {
 try {
 var saved = JSON.parse(localStorage.getItem('sm_coiffure_resa') || '[]');
 if (saved) RESERVATIONS_COIFFURE = saved;
 } catch(e) { RESERVATIONS_COIFFURE = []; }
}

function saveCoiffure() {
 try { localStorage.setItem('sm_coiffure_resa', JSON.stringify(RESERVATIONS_COIFFURE)); } catch(e) {}
}

// ── Vérifier si un créneau est libre ──
function creneauLibre(date, heure, serviceId) {
 var svc = COIFFURE_SERVICES.find(function(s){ return s.id === serviceId; });
 var duree = svc ? svc.duree : 60;
 return !RESERVATIONS_COIFFURE.some(function(r) {
 if (r.date !== date || ['annulee'].includes(r.statut)) return false;
 var hStart = parseInt(r.heure.replace(':',''));
 var hEnd = hStart + Math.floor(r.duree / 60) * 100;
 var hNew = parseInt(heure.replace(':',''));
 var hNewEnd= hNew + Math.floor(duree / 60) * 100;
 return hNew < hEnd && hNewEnd > hStart;
 });
}

// ── Créer une réservation ──
function creerReservation() {
 var client = (document.getElementById('resa-client') || {}).value || '';
 var tel = (document.getElementById('resa-tel') || {}).value || '';
 var date = (document.getElementById('resa-date') || {}).value || '';
 var heure = (document.getElementById('resa-heure') || {}).value || '';
 var svcId = (document.getElementById('resa-svc') || {}).value || '';
 var notes = (document.getElementById('resa-notes') || {}).value || '';

 if (!client) { toast('Nom du client requis', 'warning'); return; }
 if (!tel) { toast('Téléphone requis', 'warning'); return; }
 if (!date) { toast('Date requise', 'warning'); return; }
 if (!heure) { toast('Heure requise', 'warning'); return; }
 if (!svcId) { toast('Service requis', 'warning'); return; }

 var svc = COIFFURE_SERVICES.find(function(s){ return s.id === svcId; });
 if (!svc) { toast('Service introuvable', 'warning'); return; }

 if (!creneauLibre(date, heure, svcId)) {
 toast('Créneau déjà pris — choisissez une autre heure', 'error');
 return;
 }

 var resa = {
 id: 'RDV-' + Date.now(),
 client: client,
 tel: tel,
 date: date,
 heure: heure,
 service: svc.nom,
 serviceId: svcId,
 genre: svc.genre,
 prix: svc.prix,
 duree: svc.duree,
 notes: notes,
 statut: 'confirme',
 cree_le: new Date().toISOString()
 };

 RESERVATIONS_COIFFURE.unshift(resa);
 saveCoiffure();
 closeM('m-resa-coiffure');
 renderCalendrierCoiffure();
 renderListeResas();
 toast('Réservation ' + resa.id + ' créée !', 'success');
 addNotif('Nouveau RDV coiffure : ' + client + ' — ' + svc.nom, 'green');

 // SMS confirmation
 envoyerSMSCoiffure('confirmation', resa);

 // Reset formulaire
 ['resa-client','resa-tel','resa-notes'].forEach(function(id){
 var el = document.getElementById(id); if(el) el.value = '';
 });
}

// ── Changer statut réservation ──
function changerStatutResa(id, statut) {
 var resa = RESERVATIONS_COIFFURE.find(function(r){ return r.id === id; });
 if (!resa) return;
 resa.statut = statut;
 saveCoiffure();
 renderListeResas();
 renderCalendrierCoiffure();
 var msgs = {
 en_cours: 'En cours',
 termine: 'Terminé',
 annulee: 'Annulé',
 no_show: 'No-show'
 };
 toast('RDV ' + id + ' — ' + (msgs[statut] || statut), 'success');
 if (statut === 'annulee') envoyerSMSCoiffure('annulation', resa);
}

// ── SMS via Railway ──
function envoyerSMSCoiffure(type, resa) {
 if (!resa.tel || resa.tel === '—') return;
 var msgs = {
 confirmation: 'Bonjour ' + resa.client + ', votre RDV coiffure est confirmé le ' + 
 formatDate(resa.date) + ' à ' + resa.heure + ' pour "' + resa.service + 
 '" (' + resa.prix.toLocaleString('fr-FR') + ' FCFA). SuperMarché CM — ' + 
 (typeof CFG !== 'undefined' ? CFG.tel : '+237 683 39 22 68'),
 rappel: 'Rappel RDV : ' + resa.client + ', vous avez rendez-vous DEMAIN à ' + 
 resa.heure + ' pour "' + resa.service + '". SuperMarché CM',
 annulation: 'Bonjour ' + resa.client + ', votre RDV du ' + formatDate(resa.date) + 
 ' à ' + resa.heure + ' a été annulé. Contactez-nous pour replanifier.'
 };
 var msg = msgs[type];
 if (!msg) return;
 fetch((typeof BACKEND !== 'undefined' ? BACKEND : 'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ tel: resa.tel.replace(/[\s+]/g,''), message: msg })
 }).then(function(r){ return r.json(); })
 .then(function(r){ if(r.ok) toast('SMS envoyé à ' + resa.client, 'success'); })
 .catch(function(e){ console.warn('SMS coiffure:', e); });
}

// ── Rappels 24h ──
function envoyerRappels24h() {
 var demain = new Date();
 demain.setDate(demain.getDate() + 1);
 var dateDemain = demain.toISOString().split('T')[0];
 var rdvDemain = RESERVATIONS_COIFFURE.filter(function(r){
 return r.date === dateDemain && r.statut === 'confirme';
 });
 rdvDemain.forEach(function(r){ envoyerSMSCoiffure('rappel', r); });
 toast(rdvDemain.length + ' rappel(s) SMS envoyé(s)', 'success');
}

// ── Calendrier hebdomadaire ──
function renderCalendrierCoiffure() {
 var cal = document.getElementById('coiffure-calendrier');
 if (!cal) return;

 var today = new Date();
 var lundi = new Date(today);
 lundi.setDate(today.getDate() - today.getDay() + 1);

 var jours = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
 var html = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">';

 // En-tête jours
 html += '<tr><th style="padding:8px;background:#007A3D;color:#fff;border-radius:6px 0 0 0;min-width:60px">Heure</th>';
 for (var j = 0; j < 7; j++) {
 var jour = new Date(lundi);
 jour.setDate(lundi.getDate() + j);
 var dd = String(jour.getDate()).padStart(2,'0');
 var mm = String(jour.getMonth()+1).padStart(2,'0');
 var isToday = jour.toDateString() === today.toDateString();
 html += '<th style="padding:8px;background:' + (isToday ? '#CE1126' : '#007A3D') + ';color:#fff;min-width:80px">'
 + jours[j] + '' + dd + '/' + mm + '</th>';
 }
 html += '</tr>';

 // Lignes par créneau
 COIFFURE_CRENEAUX.forEach(function(heure) {
 html += '<tr>';
 html += '<td style="padding:6px 8px;font-weight:700;font-size:11px;color:#007A3D;background:#f0faf5;border:1px solid #e5e7eb">' + heure + '</td>';
 for (var j = 0; j < 7; j++) {
 var jour = new Date(lundi);
 jour.setDate(lundi.getDate() + j);
 var dateStr = jour.toISOString().split('T')[0];
 var isToday = jour.toDateString() === today.toDateString();
 var resas = RESERVATIONS_COIFFURE.filter(function(r){
 return r.date === dateStr && r.heure === heure && r.statut !== 'annulee';
 });
 var bg = isToday ? '#fff9f9' : (j >= 5 ? '#fafafa' : '#fff');
 if (resas.length > 0) {
 var r = resas[0];
 var stColors = { confirme:'#007A3D', en_cours:'#3b82f6', termine:'#999', no_show:'#CE1126' };
 var stColor = stColors[r.statut] || '#007A3D';
 html += '<td style="padding:4px;background:' + bg + ';border:1px solid #e5e7eb">'
 + '<div style="background:' + stColor + '22;border-left:3px solid ' + stColor + ';border-radius:4px;padding:3px 5px;font-size:10px">'
 + '<div style="font-weight:700;color:' + stColor + '">' + r.client + '</div>'
 + '<div style="color:#555">' + r.service.substring(0,14) + '</div>'
 + '<div style="color:#007A3D;font-weight:700">' + r.prix.toLocaleString('fr-FR') + 'F</div>'
 + '</div></td>';
 } else {
 html += '<td style="padding:4px;background:' + bg + ';border:1px solid #e5e7eb;cursor:pointer" '
 + 'onclick="preRemplirResa(\'' + dateStr + '\',\'' + heure + '\')" '
 + 'title="Cliquer pour réserver">'
 + '<div style="text-align:center;color:#ccc;font-size:10px;padding:6px 0">+</div></td>';
 }
 }
 html += '</tr>';
 });
 html += '</table></div>';
 cal.innerHTML = html;
}

// ── Pré-remplir le formulaire depuis le calendrier ──
function preRemplirResa(date, heure) {
 var d = document.getElementById('resa-date');
 var h = document.getElementById('resa-heure');
 if (d) d.value = date;
 if (h) h.value = heure;
 openM('m-resa-coiffure');
}

// ── Liste des réservations ──
function renderListeResas() {
 var liste = document.getElementById('coiffure-liste');
 if (!liste) return;

 var filtre = (document.getElementById('resa-filtre') || {}).value || 'tous';
 var resas = filtre === 'tous' ? RESERVATIONS_COIFFURE
 : RESERVATIONS_COIFFURE.filter(function(r){ return r.statut === filtre; });

 if (resas.length === 0) {
 liste.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucune réservation</p>';
 return;
 }

 var stMap = {
 confirme: ['Confirmé', '#007A3D', '#dcfce7'],
 en_cours: ['En cours', '#3b82f6', '#dbeafe'],
 termine: ['Terminé', '#6b7280', '#f3f4f6'],
 annulee: ['Annulé', '#CE1126', '#fee2e2'],
 no_show: ['No-show', '#f59e0b', '#fef3c7'],
 };

 liste.innerHTML = resas.slice(0,30).map(function(r) {
 var st = stMap[r.statut] || ['—','#999','#f9fafb'];
 var svc = COIFFURE_SERVICES.find(function(s){ return s.id === r.serviceId; });
 var dateAff = formatDate(r.date);
 return '<div class="cd" style="margin-bottom:10px">'
 + '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">'
 + '<div style="width:42px;height:42px;border-radius:50%;background:' + (r.genre==='femme'?'#CE1126':'#007A3D') + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">'
 + (r.genre==='femme'?'':'') + '</div>'
 + '<div style="flex:1;min-width:140px">'
 + '<div style="font-weight:700;font-size:14px">' + r.client + '</div>'
 + '<div style="font-size:12px;color:#666">' + r.tel + '</div>'
 + '</div>'
 + '<div style="text-align:center">'
 + '<div style="font-weight:700;font-size:13px;color:#007A3D">' + dateAff + ' à ' + r.heure + '</div>'
 + '<div style="font-size:12px;color:#555">' + r.service + '</div>'
 + '<div style="font-size:12px;font-weight:700;color:#111">' + r.prix.toLocaleString('fr-FR') + ' FCFA — ' + r.duree + ' min</div>'
 + '</div>'
 + '<span style="font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;background:' + st[2] + ';color:' + st[1] + '">' + st[0] + '</span>'
 + '<div style="display:flex;gap:5px;flex-wrap:wrap">'
 + (r.statut==='confirme' ? '<button class="btn bp bsm" onclick="changerStatutResa(\''+r.id+'\',\'en_cours\')">Démarrer</button>' : '')
 + (r.statut==='en_cours' ? '<button class="btn bp bsm" onclick="changerStatutResa(\''+r.id+'\',\'termine\')">Terminer</button>' : '')
 + (r.statut==='confirme'||r.statut==='en_cours' ? '<button class="btn bd bsm" onclick="changerStatutResa(\''+r.id+'\',\'annulee\')">Annuler</button>' : '')
 + (r.statut==='confirme' ? '<button class="btn bo bsm" onclick="envoyerSMSCoiffure(\'rappel\',RESERVATIONS_COIFFURE.find(function(x){return x.id===\''+r.id+'\'}))">SMS rappel</button>' : '')
 + '</div>'
 + '</div>'
 + (r.notes ? '<div style="font-size:11px;color:#999;margin-top:6px;font-style:italic;padding-top:6px;border-top:1px solid #f0f0f0">Note : ' + r.notes + '</div>' : '')
 + '</div>';
 }).join('');
}

// ── Stats coiffure ──
function renderStatsCoiffure() {
 var stats = document.getElementById('coiffure-stats');
 if (!stats) return;
 var today = new Date().toISOString().split('T')[0];
 var rdvAujourdhui = RESERVATIONS_COIFFURE.filter(function(r){ return r.date===today && r.statut!=='annulee'; }).length;
 var rdvTotal = RESERVATIONS_COIFFURE.filter(function(r){ return r.statut!=='annulee'; }).length;
 var caTotal = RESERVATIONS_COIFFURE.filter(function(r){ return r.statut==='termine'; }).reduce(function(s,r){ return s+r.prix; },0);
 var rdvAttente = RESERVATIONS_COIFFURE.filter(function(r){ return r.statut==='confirme'; }).length;
 stats.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">'
 + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#007A3D">'+rdvAujourdhui+'</div><div style="font-size:12px;color:#666">RDV aujourd\'hui</div></div>'
 + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#3b82f6">'+rdvAttente+'</div><div style="font-size:12px;color:#666">En attente</div></div>'
 + '<div class="cd" style="text-align:center"><div style="font-size:26px;font-weight:800;color:#111">'+rdvTotal+'</div><div style="font-size:12px;color:#666">Total RDV</div></div>'
 + '<div class="cd" style="text-align:center"><div style="font-size:22px;font-weight:800;color:#007A3D">'+(caTotal>=1000?Math.round(caTotal/1000)+'K':caTotal.toLocaleString('fr-FR'))+'</div><div style="font-size:12px;color:#666">CA FCFA</div></div>'
 + '</div>';
}

// ── Remplir le select services ──
function remplirSelectServices() {
 var sel = document.getElementById('resa-svc');
 if (!sel) return;
 var grouped = {};
 COIFFURE_SERVICES.forEach(function(s) {
 var key = s.genre + ' — ' + s.cat;
 if (!grouped[key]) grouped[key] = [];
 grouped[key].push(s);
 });
 sel.innerHTML = '<option value="">Choisir un service...</option>';
 Object.keys(grouped).sort().forEach(function(grp) {
 var og = document.createElement('optgroup');
 og.label = grp.charAt(0).toUpperCase() + grp.slice(1);
 grouped[grp].forEach(function(s) {
 var opt = document.createElement('option');
 opt.value = s.id;
 opt.textContent = s.nom + ' — ' + s.prix.toLocaleString('fr-FR') + ' FCFA (' + s.duree + ' min)';
 og.appendChild(opt);
 });
 sel.appendChild(og);
 });
}

// ── Render services catalogue ──
function renderServicesCoiffure() {
 var container = document.getElementById('coiffure-services-list');
 if (!container) return;
 var filtre = (document.getElementById('svc-genre-filtre') || {}).value || 'tous';
 var svcs = filtre === 'tous' ? COIFFURE_SERVICES
 : COIFFURE_SERVICES.filter(function(s){ return s.genre === filtre; });
 container.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">'
 + svcs.map(function(s) {
 return '<div class="cd" style="cursor:pointer" onclick="preRemplirService(\''+s.id+'\')">'
 + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">'
 + '<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:' + (s.genre==='femme'?'#fee2e2':'#dbeafe') + ';color:' + (s.genre==='femme'?'#CE1126':'#1d4ed8') + ';font-weight:700">' + s.genre.toUpperCase() + '</span>'
 + '<span style="font-size:10px;color:#999">' + s.duree + ' min</span>'
 + '</div>'
 + '<div style="font-weight:700;font-size:14px;margin-bottom:4px">' + s.nom + '</div>'
 + '<div style="font-size:12px;color:#666;margin-bottom:8px">' + s.cat + '</div>'
 + '<div style="font-size:16px;font-weight:800;color:#007A3D">' + s.prix.toLocaleString('fr-FR') + ' FCFA</div>'
 + '<button class="btn bp bsm" style="width:100%;margin-top:8px" onclick="event.stopPropagation();preRemplirService(\''+s.id+'\')">Réserver</button>'
 + '</div>';
 }).join('')
 + '</div>';
}

function preRemplirService(svcId) {
 var sel = document.getElementById('resa-svc');
 if (sel) sel.value = svcId;
 // Date = aujourd'hui par défaut
 var d = document.getElementById('resa-date');
 if (d && !d.value) d.value = new Date().toISOString().split('T')[0];
 openM('m-resa-coiffure');
}

// ── Initialisation page coiffure ──
function initPageCoiffure() {
 initCoiffure();
 renderStatsCoiffure();
 renderCalendrierCoiffure();
 renderListeResas();
 renderServicesCoiffure();
 remplirSelectServices();
 // Définir date min = aujourd'hui
 var d = document.getElementById('resa-date');
 if (d) d.min = new Date().toISOString().split('T')[0];
}

// ── Utilitaire ──
function formatDate(dateStr) {
 if (!dateStr) return '—';
 try {
 var parts = dateStr.split('-');
 return parts[2] + '/' + parts[1] + '/' + parts[0];
 } catch(e) { return dateStr; }
}

// ═══════════════════════════════════════════════════════
// SUPABASE SYNC — Coiffure
// ═══════════════════════════════════════════════════════

async function chargerResasSupabase() {
 try {
 var sb = _sbMain(); if (!sb) return;
 var res = await sb.from('reservations_coiffure')
 .select('*').order('date', { ascending: false }).limit(200);
 if (res.data && res.data.length > 0) {
 RESERVATIONS_COIFFURE = res.data.map(function(r) {
 return {
 id: r.id,
 client: r.client,
 tel: r.tel,
 date: r.date,
 heure: r.heure,
 service: r.service,
 serviceId: r.service_id,
 genre: r.genre || 'femme',
 prix: r.prix || 0,
 duree: r.duree || 60,
 notes: r.notes || '',
 statut: r.statut || 'confirme',
 cree_le: r.cree_le
 };
 });
 console.log('[Coiffure] ' + RESERVATIONS_COIFFURE.length + ' RDV chargés depuis Supabase');
 }
 } catch(e) { console.warn('[Coiffure] Supabase:', e); }
}

async function sauvegarderResaSupabase(resa) {
 try {
 var sb = _sbMain(); if (!sb) return;
 await sb.from('reservations_coiffure').upsert({
 id: resa.id,
 client: resa.client,
 tel: resa.tel,
 date: resa.date,
 heure: resa.heure,
 service: resa.service,
 service_id: resa.serviceId,
 genre: resa.genre,
 prix: resa.prix,
 duree: resa.duree,
 notes: resa.notes,
 statut: resa.statut
 });
 } catch(e) { console.warn('[Coiffure] save Supabase:', e); }
}

async function mettreAJourStatutResaSupabase(id, statut) {
 try {
 var sb = _sbMain(); if (!sb) return;
 await sb.from('reservations_coiffure').update({ statut: statut }).eq('id', id);
 } catch(e) { console.warn('[Coiffure] update Supabase:', e); }
}

// Override fonctions pour utiliser Supabase
var _creerReservationOrig = creerReservation;
creerReservation = async function() {
 var client = (document.getElementById('resa-client') || {}).value || '';
 var tel = (document.getElementById('resa-tel') || {}).value || '';
 var date = (document.getElementById('resa-date') || {}).value || '';
 var heure = (document.getElementById('resa-heure') || {}).value || '';
 var svcId = (document.getElementById('resa-svc') || {}).value || '';
 var notes = (document.getElementById('resa-notes') || {}).value || '';
 if (!client) { toast('Nom du client requis', 'warning'); return; }
 if (!tel) { toast('Téléphone requis', 'warning'); return; }
 if (!date) { toast('Date requise', 'warning'); return; }
 if (!heure) { toast('Heure requise', 'warning'); return; }
 if (!svcId) { toast('Service requis', 'warning'); return; }
 var svc = COIFFURE_SERVICES.find(function(s){ return s.id === svcId; });
 if (!svc) { toast('Service introuvable', 'warning'); return; }
 if (!creneauLibre(date, heure, svcId)) { toast('Créneau déjà pris', 'error'); return; }
 var resa = {
 id: 'RDV-' + Date.now(), client: client, tel: tel, date: date,
 heure: heure, service: svc.nom, serviceId: svcId, genre: svc.genre,
 prix: svc.prix, duree: svc.duree, notes: notes, statut: 'confirme',
 cree_le: new Date().toISOString()
 };
 RESERVATIONS_COIFFURE.unshift(resa);
 saveCoiffure();
 await sauvegarderResaSupabase(resa);
 closeM('m-resa-coiffure');
 renderCalendrierCoiffure(); renderListeResas(); renderStatsCoiffure();
 toast('RDV ' + resa.id + ' créé !', 'success');
 addNotif('Nouveau RDV coiffure : ' + client + ' — ' + svc.nom, 'green');
 envoyerSMSCoiffure('confirmation', resa);
 ['resa-client','resa-tel','resa-notes'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
};

var _changerStatutResaOrig = changerStatutResa;
changerStatutResa = async function(id, statut) {
 var resa = RESERVATIONS_COIFFURE.find(function(r){ return r.id === id; });
 if (!resa) return;
 resa.statut = statut;
 saveCoiffure();
 await mettreAJourStatutResaSupabase(id, statut);
 renderListeResas(); renderCalendrierCoiffure(); renderStatsCoiffure();
 if (statut === 'annulee') envoyerSMSCoiffure('annulation', resa);
 toast('RDV mis à jour : ' + statut, 'success');
};

// Charger depuis Supabase au démarrage
var _initPageCoiffureOrig = initPageCoiffure;
initPageCoiffure = async function() {
 initCoiffure();
 await chargerResasSupabase();
 renderStatsCoiffure();
 renderCalendrierCoiffure();
 renderListeResas();
 renderServicesCoiffure();
 remplirSelectServices();
 var d = document.getElementById('resa-date');
 if (d) d.min = new Date().toISOString().split('T')[0];
};

// ═══════════════════════════════════════════════════════
//  AMÉLIORATIONS COIFFURE v2
//  1. Gestion services (ajout/modification/suppression)
//  2. Abonnements clients
//  3. Stats CA mensuel
//  4. Export CSV
//  5. Fiche client
// ═══════════════════════════════════════════════════════

var ABONNEMENTS_COIFFURE = [];

function initAbonnementsCoiffure() {
  try {
    var s = JSON.parse(localStorage.getItem('sm_coif_abo') || '[]');
    if (Array.isArray(s)) ABONNEMENTS_COIFFURE = s;
  } catch(e) {}
}

function saveAbonnementsCoiffure() {
  try { localStorage.setItem('sm_coif_abo', JSON.stringify(ABONNEMENTS_COIFFURE)); } catch(e) {}
}

// ── Ajouter un service personnalisé ──
function ajouterServiceCoiffure() {
  var genre = (document.getElementById('nsvc-genre')  || {}).value || 'femme';
  var nom   = (document.getElementById('nsvc-nom')    || {}).value || '';
  var cat   = (document.getElementById('nsvc-cat')    || {}).value || 'Coupe';
  var prix  = parseInt((document.getElementById('nsvc-prix')  || {}).value) || 0;
  var duree = parseInt((document.getElementById('nsvc-duree') || {}).value) || 60;
  if (!nom)  { toast('Nom du service requis', 'warning'); return; }
  if (!prix) { toast('Prix requis', 'warning'); return; }
  var newId = 'cx' + Date.now();
  COIFFURE_SERVICES.push({ id: newId, genre: genre, nom: nom, cat: cat, prix: prix, duree: duree });
  try { localStorage.setItem('sm_coif_services', JSON.stringify(COIFFURE_SERVICES)); } catch(e) {}
  closeM('m-nouveau-service');
  renderServicesCoiffure();
  remplirSelectServices();
  toast('Service "' + nom + '" ajouté !', 'success');
  ['nsvc-nom','nsvc-prix','nsvc-duree'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

function supprimerServiceCoiffure(id) {
  if (!confirm('Supprimer ce service ?')) return;
  COIFFURE_SERVICES = COIFFURE_SERVICES.filter(function(s){ return s.id !== id; });
  try { localStorage.setItem('sm_coif_services', JSON.stringify(COIFFURE_SERVICES)); } catch(e) {}
  renderServicesCoiffure();
  remplirSelectServices();
  toast('Service supprimé', 'warning');
}

function chargerServicesPersonnalises() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_coif_services') || 'null');
    if (saved && Array.isArray(saved)) COIFFURE_SERVICES = saved;
  } catch(e) {}
}

// ── Abonnement mensuel coiffure ──
function creerAbonnementCoiffure() {
  var client = (document.getElementById('coif-abo-client') || {}).value || '';
  var tel    = (document.getElementById('coif-abo-tel')    || {}).value || '';
  var plan   = (document.getElementById('coif-abo-plan')   || {}).value || 'femme';
  if (!client || !tel) { toast('Nom et téléphone requis', 'warning'); return; }
  var plans = {
    femme:  { nom:'Abonnement Femme', services:4, prix:25000 },
    homme:  { nom:'Abonnement Homme', services:8, prix:12000 },
    famille:{ nom:'Abonnement Famille', services:12, prix:35000 }
  };
  var p = plans[plan];
  var abo = {
    id: 'ACOIF-' + Date.now(), client: client, tel: tel,
    plan: p.nom, services_restants: p.services, services_total: p.services,
    prix: p.prix, actif: true,
    date_debut: new Date().toISOString(),
    date_fin: new Date(Date.now() + 30*24*3600*1000).toISOString()
  };
  ABONNEMENTS_COIFFURE.push(abo);
  saveAbonnementsCoiffure();
  closeM('m-coif-abonnement');
  renderAbonnementsCoiffure();
  toast('Abonnement coiffure créé pour ' + client, 'success');
  var msg = 'Bonjour ' + client + ', votre abonnement coiffure ' + p.nom + ' est activé ! ' + p.services + ' services disponibles ce mois. SuperMarché CM Coiffure';
  fetch((typeof BACKEND!=='undefined'?BACKEND:'https://supermarche-cm-backend-production.up.railway.app') + '/sms/custom', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ tel: tel.replace(/[\s+]/g,''), message: msg })
  }).catch(function(){});
  ['coif-abo-client','coif-abo-tel'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

function renderAbonnementsCoiffure() {
  var liste = document.getElementById('coiffure-abonnements');
  if (!liste) return;
  if (ABONNEMENTS_COIFFURE.length === 0) {
    liste.innerHTML = '<p style="text-align:center;color:#999;padding:16px">Aucun abonnement actif</p>';
    return;
  }
  liste.innerHTML = ABONNEMENTS_COIFFURE.filter(function(a){ return a.actif; }).map(function(a) {
    var pct = Math.round((a.services_restants / a.services_total) * 100);
    var joursRestants = Math.ceil((new Date(a.date_fin) - Date.now()) / (24*3600*1000));
    return '<div class="cd" style="margin-bottom:10px">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">'
      + '<div>'
      + '<div style="font-weight:700">' + a.client + ' — ' + a.tel + '</div>'
      + '<div style="font-size:12px;color:#CE1126;font-weight:600">' + a.plan + ' — ' + a.prix.toLocaleString('fr-FR') + ' FCFA/mois</div>'
      + '<div style="font-size:11px;color:#999">' + joursRestants + ' jours restants</div>'
      + '</div>'
      + '<div style="text-align:center">'
      + '<div style="font-size:22px;font-weight:800;color:' + (pct<25?'#CE1126':'#007A3D') + '">' + a.services_restants + '</div>'
      + '<div style="font-size:11px;color:#666">services restants</div>'
      + '</div>'
      + '</div>'
      + '<div style="background:#e5e7eb;border-radius:20px;height:6px;margin:8px 0">'
      + '<div style="background:' + (pct<25?'#CE1126':'#CE1126') + ';width:' + pct + '%;height:100%;border-radius:20px"></div>'
      + '</div>'
      + '<div style="display:flex;gap:6px">'
      + '<button class="btn bp bsm" onclick="utiliserServiceAbonnementCoif(\'' + a.id + '\')">Utiliser 1 service</button>'
      + '</div></div>';
  }).join('');
}

function utiliserServiceAbonnementCoif(id) {
  var abo = ABONNEMENTS_COIFFURE.find(function(a){ return a.id===id; });
  if (!abo || abo.services_restants <= 0) { toast('Plus de services disponibles !', 'error'); return; }
  abo.services_restants--;
  if (abo.services_restants === 0) abo.actif = false;
  saveAbonnementsCoiffure();
  renderAbonnementsCoiffure();
  toast('1 service utilisé — ' + abo.services_restants + ' restants', 'success');
}

// ── CA mensuel coiffure ──
function renderStatsCAMensuelCoiffure() {
  var zone = document.getElementById('coiffure-ca-mensuel');
  if (!zone) return;
  var maintenant = new Date();
  var moisActuel = maintenant.getMonth();
  var anneeActuelle = maintenant.getFullYear();
  var moisLabels = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  var caParMois = new Array(12).fill(0);
  RESERVATIONS_COIFFURE.filter(function(r){ return r.statut==='termine'; }).forEach(function(r) {
    var d = new Date(r.date);
    if (d.getFullYear() === anneeActuelle) caParMois[d.getMonth()] += r.prix;
  });
  var maxCA = Math.max.apply(null, caParMois) || 1;
  var html = '<div style="display:flex;align-items:flex-end;gap:3px;height:70px;margin-bottom:4px">';
  caParMois.forEach(function(ca, i) {
    var h = Math.round((ca / maxCA) * 60);
    var isActuel = i === moisActuel;
    html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">'
      + '<div title="' + ca.toLocaleString('fr-FR') + ' FCFA" style="width:100%;background:' + (isActuel?'#CE1126':'#fecdd3') + ';height:' + h + 'px;border-radius:3px 3px 0 0;min-height:2px"></div>'
      + '<div style="font-size:9px;color:' + (isActuel?'#CE1126':'#999') + '">' + moisLabels[i] + '</div>'
      + '</div>';
  });
  html += '</div><div style="font-size:12px;color:#666;text-align:center">Ce mois : <span style="font-weight:700;color:#CE1126">' + caParMois[moisActuel].toLocaleString('fr-FR') + ' FCFA</span></div>';
  zone.innerHTML = html;
}

// ── Fiche client coiffure ──
function rechercherFicheClientCoiffure() {
  var srch = ((document.getElementById('coif-client-search') || {}).value || '').toLowerCase();
  var result = document.getElementById('coif-fiche-client');
  if (!result || !srch) { if(result) result.innerHTML=''; return; }
  var resas = RESERVATIONS_COIFFURE.filter(function(r){ return r.client.toLowerCase().includes(srch) || r.tel.includes(srch); });
  if (resas.length === 0) { result.innerHTML = '<p style="color:#999;font-size:12px;padding:8px">Aucun client trouvé</p>'; return; }
  var total = resas.filter(function(r){ return r.statut==='termine'; }).reduce(function(s,r){ return s+r.prix; },0);
  var prefService = {};
  resas.forEach(function(r){ prefService[r.service] = (prefService[r.service]||0)+1; });
  var topService = Object.keys(prefService).sort(function(a,b){ return prefService[b]-prefService[a]; })[0] || '—';
  result.innerHTML = '<div style="background:#fff0f3;border-radius:10px;padding:12px;margin-top:8px">'
    + '<div style="font-weight:800">' + resas[0].client + '</div>'
    + '<div style="font-size:12px;color:#666">' + resas[0].tel + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px">'
    + '<div style="text-align:center"><div style="font-size:18px;font-weight:800;color:#CE1126">' + resas.length + '</div><div style="font-size:11px;color:#666">RDV total</div></div>'
    + '<div style="text-align:center"><div style="font-size:14px;font-weight:800;color:#007A3D">' + Math.round(total/1000) + 'K</div><div style="font-size:11px;color:#666">FCFA dépensé</div></div>'
    + '<div style="text-align:center"><div style="font-size:10px;font-weight:700;color:#555">' + topService.substring(0,12) + '</div><div style="font-size:11px;color:#666">Service favori</div></div>'
    + '</div></div>';
}

// ── Export CSV ──
function exporterCSVCoiffure() {
  if (RESERVATIONS_COIFFURE.length === 0) { toast('Aucun RDV à exporter', 'warning'); return; }
  var lignes = ['\uFEFFID;Client;Téléphone;Date;Heure;Service;Genre;Prix (FCFA);Durée (min);Statut'];
  RESERVATIONS_COIFFURE.forEach(function(r) {
    lignes.push([r.id, r.client, r.tel, r.date, r.heure, '"'+r.service+'"', r.genre, r.prix, r.duree, r.statut].join(';'));
  });
  telechargerCSV(lignes.join('\n'), 'coiffure-' + new Date().toLocaleDateString('fr-FR').replace(/\//g,'-') + '.csv');
  toast('Export CSV coiffure OK', 'success');
}

// Surcharger initPageCoiffure
initPageCoiffure = async function() {
  chargerServicesPersonnalises();
  initCoiffure();
  initAbonnementsCoiffure();
  await chargerResasSupabase();
  renderStatsCoiffure();
  renderCalendrierCoiffure();
  renderListeResas();
  renderServicesCoiffure();
  remplirSelectServices();
  renderAbonnementsCoiffure();
  renderStatsCAMensuelCoiffure();
  rechercherFicheClientCoiffure(); // init vide
  var d = document.getElementById('resa-date');
  if (d) d.min = new Date().toISOString().split('T')[0];
};
