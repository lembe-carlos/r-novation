// ═══════════════════════════════════════════════════════
// SuperMarché CM — fidelite.js
// Supabase — table : fidelite_clients
// ═══════════════════════════════════════════════════════

var FIDELITE = {
 taux: 100, // 1 point par 100 FCFA
 niveaux: [
 { nom:'Bronze', min:0, couleur:'#cd7f32', avantage:'5% de reduction sur les prochains achats' },
 { nom:'Argent', min:500, couleur:'#9ca3af', avantage:'8% + livraison gratuite des 10 000 FCFA' },
 { nom:'Or', min:2000, couleur:'#f59e0b', avantage:'12% + livraison gratuite + priorite commande' },
 { nom:'Platine', min:5000, couleur:'#6366f1', avantage:'15% + livreur dedie + support 24h/24' },
 ],
 clients: []
};

function _sbFid() {
 if (typeof window.supabase === 'undefined') return null;
 return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
}

async function initFidelite() {
 try {
 var sb = _sbFid(); if (!sb) return;
 var res = await sb.from('fidelite_clients').select('*').order('points', { ascending: false });
 if (res.data) FIDELITE.clients = res.data;
 if (typeof renderFideliteClients === 'function') renderFideliteClients();
 } catch(e) { console.warn('[Fidelite] init:', e); }
}

function getNiveauClient(points) {
 var niveau = FIDELITE.niveaux[0];
 FIDELITE.niveaux.forEach(function(n){ if (points >= n.min) niveau = n; });
 return niveau;
}

async function getOrCreateClientFid(tel, nom) {
 var client = FIDELITE.clients.find(function(c){ return c.tel === tel; });
 if (client) return client;
 var newClient = {
 nom: nom || 'Client', tel: tel, points: 0,
 total_achats: 0, nb_commandes: 0, historique: [],
 date_inscription: new Date().toLocaleDateString('fr-FR')
 };
 try {
 var sb = _sbFid();
 if (sb) {
 var res = await sb.from('fidelite_clients').insert(newClient).select().single();
 if (res.data) { newClient = res.data; }
 } else {
 newClient.id = Date.now();
 }
 } catch(e) { console.warn('[Fidelite] createClient:', e); newClient.id = Date.now(); }
 FIDELITE.clients.push(newClient);
 return newClient;
}

async function ajouterPoints(tel, nom, montant, cmdId) {
 if (!tel) return;
 var points = Math.floor(montant / FIDELITE.taux);
 if (points <= 0) return;
 var client = await getOrCreateClientFid(tel, nom);
 client.points = (client.points || 0) + points;
 client.total_achats = (client.total_achats || 0) + montant;
 client.nb_commandes = (client.nb_commandes || 0) + 1;
 if (!client.historique) client.historique = [];
 client.historique.unshift({
 date: new Date().toLocaleDateString('fr-FR'),
 action: '+' + points + ' pts',
 detail: 'Commande ' + cmdId + ' — ' + montant.toLocaleString('fr-FR') + ' FCFA',
 solde: client.points
 });
 try {
 var sb = _sbFid();
 if (sb) {
 await sb.from('fidelite_clients').update({
 points: client.points,
 total_achats: client.total_achats,
 nb_commandes: client.nb_commandes,
 historique: client.historique
 }).eq('id', client.id);
 }
 } catch(e) { console.warn('[Fidelite] ajouterPoints:', e); }
 return { client: client, points: points, niveau: getNiveauClient(client.points) };
}

async function utiliserPoints(tel, pointsAUtiliser) {
 var client = FIDELITE.clients.find(function(c){ return c.tel === tel; });
 if (!client || client.points < pointsAUtiliser) return false;
 var valeur = pointsAUtiliser * 10;
 client.points -= pointsAUtiliser;
 if (!client.historique) client.historique = [];
 client.historique.unshift({
 date: new Date().toLocaleDateString('fr-FR'),
 action: '-' + pointsAUtiliser + ' pts',
 detail: 'Remise de ' + valeur.toLocaleString('fr-FR') + ' FCFA utilisee',
 solde: client.points
 });
 try {
 var sb = _sbFid();
 if (sb) {
 await sb.from('fidelite_clients').update({
 points: client.points, historique: client.historique
 }).eq('id', client.id);
 }
 } catch(e) { console.warn('[Fidelite] utiliserPoints:', e); }
 return valeur;
}

function renderFideliteClients() {
 var tbody = document.getElementById('fidelite-tbody');
 if (!tbody) return;
 var sorted = FIDELITE.clients.slice().sort(function(a,b){ return b.points - a.points; });

 tbody.innerHTML = sorted.length === 0
 ? '<tr><td colspan="7" style="text-align:center;color:#999;padding:20px">Aucun client fidelite enregistre</td></tr>'
 : sorted.map(function(c, i){
 var niveau = getNiveauClient(c.points || 0);
 var prochainNiveau = FIDELITE.niveaux.find(function(n){ return n.min > c.points; });
 var progressPct = prochainNiveau ? Math.min(100, Math.round(((c.points||0) / prochainNiveau.min) * 100)) : 100;
 return '<tr>'
 + '<td style="font-weight:700;color:#007A3D">#' + (i+1) + '</td>'
 + '<td><strong>' + c.nom + '</strong><br><span style="font-size:11px;color:#999">' + c.tel + '</span></td>'
 + '<td><div style="display:flex;align-items:center;gap:6px">'
 + '<div style="width:10px;height:10px;border-radius:50%;background:' + niveau.couleur + '"></div>'
 + '<span style="font-weight:700;color:' + niveau.couleur + '">' + niveau.nom + '</span>'
 + '</div></td>'
 + '<td><strong style="color:#007A3D;font-size:15px">' + (c.points||0).toLocaleString('fr-FR') + '</strong> pts'
 + (prochainNiveau ? '<br><div style="background:#e5e7eb;border-radius:4px;height:4px;margin-top:4px"><div style="background:' + niveau.couleur + ';width:' + progressPct + '%;height:4px;border-radius:4px"></div></div>' : '<br><span style="font-size:10px;color:#f59e0b">Niveau max</span>')
 + '</td>'
 + '<td style="font-size:12px">' + (c.nb_commandes||0) + ' cmd<br>' + (c.total_achats||0).toLocaleString('fr-FR') + ' FCFA</td>'
 + '<td style="font-size:11px;color:#999">' + c.date_inscription + '</td>'
 + '<td><button class="btn bo bsm" onclick="voirHistoriqueClient(\'' + c.tel + '\')">Historique</button></td>'
 + '</tr>';
 }).join('');

 var totalPts = FIDELITE.clients.reduce(function(s,c){ return s + (c.points||0); }, 0);
 var nbEl = document.getElementById('fidel-nb'); if (nbEl) nbEl.textContent = FIDELITE.clients.length;
 var ptEl = document.getElementById('fidel-pts'); if (ptEl) ptEl.textContent = totalPts.toLocaleString('fr-FR');
}

function voirHistoriqueClient(tel) {
 var client = FIDELITE.clients.find(function(c){ return c.tel === tel; });
 if (!client) return;
 var niveau = getNiveauClient(client.points || 0);
 var historique = client.historique || [];
 var html = '<div style="padding:16px">'
 + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">'
 + '<div style="background:' + niveau.couleur + ';color:#fff;padding:8px 14px;border-radius:30px;font-weight:700">' + niveau.nom + '</div>'
 + '<div><strong>' + client.nom + '</strong><br><span style="color:#999;font-size:12px">' + client.tel + '</span></div>'
 + '<div style="margin-left:auto;text-align:right"><div style="font-size:22px;font-weight:800;color:#007A3D">' + (client.points||0) + '</div><div style="font-size:11px;color:#999">points</div></div>'
 + '</div>';
 html += '<div style="font-size:12px;font-weight:600;color:#999;margin-bottom:8px;text-transform:uppercase">Historique</div>';
 html += '<div style="max-height:300px;overflow-y:auto">';
 if (historique.length === 0) {
 html += '<p style="color:#999;text-align:center;padding:16px">Aucune transaction</p>';
 } else {
 historique.forEach(function(h){
 var isPlus = h.action && h.action.startsWith('+');
 html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f0f0f0">'
 + '<div><div style="font-weight:600;font-size:13px">' + h.detail + '</div><div style="font-size:11px;color:#999">' + h.date + '</div></div>'
 + '<div style="font-weight:700;color:' + (isPlus ? '#007A3D' : '#ef4444') + ';font-size:14px">' + h.action + '</div>'
 + '</div>';
 });
 }
 html += '</div></div>';
 var modal = document.getElementById('m-fidelite-histo');
 if (modal) {
 modal.querySelector('.mdl').innerHTML = '<div class="mh"><h3>Fiche client</h3><button class="cbtn" onclick="closeM(\'m-fidelite-histo\')">X</button></div>' + html;
 openM('m-fidelite-histo');
 }
}
