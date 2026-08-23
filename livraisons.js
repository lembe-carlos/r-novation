// ═══════════════════════════════════════════════════════
// SuperMarché CM — livraisons.js
// Supabase — table : livraisons
// ═══════════════════════════════════════════════════════

var LIVRAISONS = {
 liste: [],
 creneaux: ['08h-10h','10h-12h','12h-14h','14h-16h','16h-18h','18h-20h']
};

function _sbLiv() {
 if (typeof window.supabase === 'undefined') return null;
 return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
}

async function initLivraisons() {
 try {
   var sb = _sbLiv();
   if (sb) {
     var res = await sb.from('livraisons').select('*').order('created_at', { ascending: false });
     if (res.data && res.data.length > 0) LIVRAISONS.liste = res.data;
   }
 } catch(e) { console.warn('[Livraisons] Supabase non disponible, mode local'); }
 // Synchroniser depuis commandes (fonctionne toujours, meme sans Supabase)
 await syncLivraisonsDepuisCommandes();
}

async function saveLivraisonSB(liv) {
 try {
 var sb = _sbLiv(); if (!sb) return;
 if (liv.id && liv.id.toString().startsWith('LIV-')) {
 await sb.from('livraisons').upsert(liv, { onConflict: 'id' });
 } else {
 await sb.from('livraisons').insert(liv);
 }
 } catch(e) { console.warn('[Livraisons] save:', e); }
}

async function updateLivraisonSB(id, changes) {
 try {
 var sb = _sbLiv(); if (!sb) return;
 await sb.from('livraisons').update(changes).eq('id', id);
 } catch(e) { console.warn('[Livraisons] update:', e); }
}

function genIdLiv() {
 return 'LIV-' + Date.now();
}

async function syncLivraisonsDepuisCommandes() {
 // Récupérer toutes les commandes disponibles
 var toutesCommandes = [];
 // 1. CMDS (commandes en mémoire)
 if (typeof CMDS !== 'undefined') toutesCommandes = toutesCommandes.concat(CMDS);
 // 2. Commandes depuis localStorage (boutique en ligne)
 try {
   var cmdsSaved = JSON.parse(localStorage.getItem('sm_commandes') || '[]');
   cmdsSaved.forEach(function(c) {
     if (!toutesCommandes.find(function(x){ return x.id === c.id; }))
       toutesCommandes.push(c);
   });
 } catch(e) {}

 for (var i = 0; i < toutesCommandes.length; i++) {
   var cmd = toutesCommandes[i];
   if (cmd.statut === 'confirmee' || cmd.statut === 'livraison' || cmd.statut === 'en_attente') {
     var existe = LIVRAISONS.liste.find(function(l){ return l.cmd_id === cmd.id; });
     if (!existe) {
       var liv = {
         id: genIdLiv(),
         cmd_id: cmd.id,
         client: cmd.client || cmd.prenom || 'Client',
         tel: cmd.tel || '—',
         adresse: cmd.adresse || cmd.ville || 'A confirmer',
         ville: cmd.ville || (cmd.sm ? cmd.sm.split('—')[1] : '') || 'Cameroun',
         total: cmd.total || 0,
         statut: cmd.statut === 'livraison' ? 'en_route' : 'en_attente',
         livreur_id: null,
         livreur_nom: null,
         creneau: null,
         date_creation: cmd.date ? new Date().toISOString() : new Date().toISOString(),
         notes: cmd.notes || ''
       };
       LIVRAISONS.liste.unshift(liv);
       await saveLivraisonSB(liv);
     }
   }
 }
 renderLivraisons();
}

async function creerLivraison(cmd) {
 var liv = {
 id: genIdLiv(),
 cmd_id: cmd.id,
 client: cmd.client,
 tel: cmd.tel,
 adresse: cmd.adresse || 'A confirmer',
 ville: cmd.ville || cmd.sm || 'Yaounde',
 total: cmd.total || 0,
 statut: 'en_attente',
 livreur_id: null,
 livreur_nom: null,
 creneau: null,
 date_creation: new Date().toISOString(),
 notes: cmd.notes || ''
 };
 LIVRAISONS.liste.unshift(liv);
 await saveLivraisonSB(liv);
 return liv;
}

async function assignerLivreur(livId, livreurId) {
 if (!livreurId) return;
 var liv = LIVRAISONS.liste.find(function(l){ return l.id === livId; });
 if (!liv) return;

 // Chercher dans LIVREURS_DATA (source principale) ou USERS.comptes (fallback)
 var livreur = null;
 if (typeof LIVREURS_DATA !== 'undefined' && LIVREURS_DATA.liste) {
   livreur = LIVREURS_DATA.liste.find(function(u){ return String(u.id) === String(livreurId); });
 }
 if (!livreur && typeof USERS !== 'undefined') {
   var uc = USERS.comptes.find(function(u){
     return String(u.id) === String(livreurId) &&
            (u.role === 'livreur' || u.role === 'Livreur');
   });
   if (uc) livreur = uc;
 }
 // Chercher aussi dans ACCOUNTS par rôle Livreur
 if (!livreur && typeof ACCOUNTS !== 'undefined') {
   livreur = ACCOUNTS.find(function(a){
     return (a.role === 'Livreur' || a.role === 'livreur') &&
            (String(a.id) === String(livreurId) || a.nom === livreurId || a.email === livreurId);
   });
 }

 if (!livreur) { toast('Livreur introuvable — vérifiez la liste des livreurs', 'error'); return; }

 var nomLivreur = livreur.nom || livreur.prenom || livreur.email || 'Livreur';
 liv.livreur_id = livreurId;
 liv.livreur_nom = nomLivreur;
 liv.statut = 'assignee';
 await updateLivraisonSB(livId, { livreur_id: livreurId, livreur_nom: nomLivreur, statut: 'assignee' });
 renderLivraisons();
 toast('Livraison assignee a ' + nomLivreur, 'success');
 if (typeof addNotif === 'function') addNotif('Livraison ' + livId + ' assignee a ' + nomLivreur, 'green');
}

async function mettreAJourStatutLivraison(livId, statut) {
 var liv = LIVRAISONS.liste.find(function(l){ return l.id === livId; });
 if (!liv) return;
 liv.statut = statut;
 var changes = { statut: statut };
 if (statut === 'livree') {
 changes.date_livraison_reelle = new Date().toISOString();
 liv.date_livraison_reelle = changes.date_livraison_reelle;
 }
 await updateLivraisonSB(livId, changes);
 if (typeof CMDS !== 'undefined') {
 var cmd = CMDS.find(function(c){ return c.id === liv.cmd_id; });
 if (cmd) {
 cmd.statut = statut === 'en_route' ? 'livraison' : statut === 'livree' ? 'livree' : cmd.statut;
 if (typeof updateBadgeCmd === 'function') updateBadgeCmd();
 if (typeof renderCmds === 'function') renderCmds();
 }
 }
 if (statut === 'livree' && typeof ajouterPoints === 'function') {
 ajouterPoints(liv.tel, liv.client, liv.total, liv.cmd_id);
 }
 renderLivraisons();
 var msgs = { assignee:'Assignee', en_route:'En route', livree:'Livree', echec:'Echec livraison' };
 toast('Livraison ' + livId + ' : ' + (msgs[statut] || statut), 'success');
}

function renderLivraisons() {
 var tbody = document.getElementById('livraisons-tbody');
 if (!tbody) return;
 var filtre = document.getElementById('liv-filtre') ? document.getElementById('liv-filtre').value : 'tous';
 var liste = LIVRAISONS.liste.filter(function(l){ return filtre === 'tous' || l.statut === filtre; });

 var stats = { en_attente:0, assignee:0, en_route:0, livree:0, echec:0 };
 LIVRAISONS.liste.forEach(function(l){ if (stats[l.statut] !== undefined) stats[l.statut]++; });
 ['en_attente','assignee','en_route','livree','echec'].forEach(function(s){
 var el = document.getElementById('liv-stat-' + s); if (el) el.textContent = stats[s];
 });

 var statutColors = { en_attente:'#f59e0b', assignee:'#3b82f6', en_route:'#8b5cf6', livree:'#10b981', echec:'#ef4444' };
 var statutLabels = { en_attente:'En attente', assignee:'Assignee', en_route:'En route', livree:'Livree', echec:'Echec' };

 tbody.innerHTML = liste.length === 0
 ? '<tr><td colspan="8" style="text-align:center;color:#999;padding:20px">Aucune livraison</td></tr>'
 : liste.map(function(l){
 // Récupérer tous les livreurs depuis toutes les sources disponibles
 var livreurs = [];
 // Source 1 : LIVREURS_DATA (liste officielle des livreurs)
 if (typeof LIVREURS_DATA !== 'undefined' && LIVREURS_DATA.liste && LIVREURS_DATA.liste.length > 0) {
   LIVREURS_DATA.liste.filter(function(u){ return u.actif !== false; }).forEach(function(u){
     if (!livreurs.find(function(x){ return String(x.id)===String(u.id); }))
       livreurs.push({ id: String(u.id), nom: u.nom || u.email });
   });
 }
 // Source 2 : USERS.comptes (utilisateurs avec role livreur)
 if (typeof USERS !== 'undefined' && USERS.comptes) {
   USERS.comptes.filter(function(u){ return u.role==='livreur'||u.role==='Livreur'; }).forEach(function(u){
     if (!livreurs.find(function(x){ return String(x.id)===String(u.id); }))
       livreurs.push({ id: String(u.id), nom: u.nom || u.prenom || u.email });
   });
 }
 // Source 3 : ACCOUNTS (comptes avec role Livreur)
 if (typeof ACCOUNTS !== 'undefined') {
   ACCOUNTS.filter(function(a){ return a.role==='Livreur'||a.role==='livreur'; }).forEach(function(a,i){
     var aid = a.id || ('acc_'+i);
     if (!livreurs.find(function(x){ return String(x.id)===String(aid); }))
       livreurs.push({ id: String(aid), nom: a.nom||(a.prenom+' '+a.email)||a.email });
   });
 }
 var selectLiv = '<select onchange="assignerLivreur(\'' + l.id + '\', this.value)" style="font-size:11px;padding:3px;border-radius:6px;border:1px solid #ddd">'
 + '<option value="">'+(livreurs.length===0?'Aucun livreur enregistré':'-- Choisir --')+'</option>'
 + livreurs.map(function(u){ return '<option value="' + u.id + '"' + (String(l.livreur_id)===String(u.id)?' selected':'') + '>' + u.nom + '</option>'; }).join('')
 + '</select>';
 var actions = '';
 if (l.statut === 'assignee') actions += '<button class="btn bo bsm" onclick="mettreAJourStatutLivraison(\'' + l.id + '\',\'en_route\')">En route</button> ';
 if (l.statut === 'en_route') actions += '<button class="btn bp bsm" onclick="mettreAJourStatutLivraison(\'' + l.id + '\',\'livree\')">Livree</button> <button class="btn bd bsm" onclick="mettreAJourStatutLivraison(\'' + l.id + '\',\'echec\')">Echec</button>';
 if (l.statut === 'echec') actions += '<button class="btn bo bsm" onclick="mettreAJourStatutLivraison(\'' + l.id + '\',\'en_attente\')">Reessayer</button>';
 var dateAff = l.date_creation ? new Date(l.date_creation).toLocaleDateString('fr-FR') : '';
 return '<tr>'
 + '<td><strong style="font-size:12px;color:#007A3D">' + l.id + '</strong><br><span style="font-size:10px;color:#999">' + l.cmd_id + '</span></td>'
 + '<td><strong>' + l.client + '</strong><br><span style="font-size:11px;color:#999">' + l.tel + '</span></td>'
 + '<td style="font-size:12px">' + l.adresse + '<br><span style="color:#007A3D;font-weight:600">' + l.ville + '</span></td>'
 + '<td style="font-weight:700;color:#007A3D">' + (l.total||0).toLocaleString('fr-FR') + ' FCFA</td>'
 + '<td>' + selectLiv + '<br><span style="font-size:11px;color:#666">' + (l.livreur_nom || 'Non assigne') + '</span></td>'
 + '<td><span style="background:' + statutColors[l.statut] + ';color:#fff;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:700">' + statutLabels[l.statut] + '</span></td>'
 + '<td style="font-size:11px;color:#999">' + dateAff + '</td>'
 + '<td>' + actions + '</td>'
 + '</tr>';
 }).join('');
}

function renderVueLivreur() {
 var container = document.getElementById('vue-livreur');
 if (!container || typeof USERS === 'undefined' || !USERS.currentUser) return;
 var livId = USERS.currentUser.id;
 var mesCours = LIVRAISONS.liste.filter(function(l){ return l.livreur_id == livId && l.statut !== 'livree'; });
 var historique = LIVRAISONS.liste.filter(function(l){ return l.livreur_id == livId && l.statut === 'livree'; });
 container.innerHTML = '<div style="padding:16px">'
 + '<div style="background:#007A3D;color:#fff;border-radius:12px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'
 + '<div><div style="font-weight:700;font-size:14px">Mon GPS</div><div style="font-size:12px;opacity:0.8">Partager ma position en temps reel</div></div>'
 + '<button id="btn-gps-livreur" class="btn" style="background:#fff;color:#007A3D;font-weight:700;padding:8px 14px;border-radius:8px;font-size:13px" onclick="typeof activerGPSLivreur===\'function\'?activerGPSLivreur():null">Activer GPS</button>'
 + '</div>'
 + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">'
 + '<div class="cd" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#007A3D">' + mesCours.length + '</div><div style="font-size:12px;color:#999">En cours</div></div>'
 + '<div class="cd" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#10b981">' + historique.length + '</div><div style="font-size:12px;color:#999">Livrees</div></div>'
 + '<div class="cd" style="text-align:center"><div style="font-size:28px;font-weight:800;color:#f59e0b">' + mesCours.filter(function(l){ return l.statut === 'assignee'; }).length + '</div><div style="font-size:12px;color:#999">En attente</div></div>'
 + '</div>'
 + '<h3 style="margin-bottom:12px">Mes livraisons du jour</h3>'
 + (mesCours.length === 0 ? '<p style="color:#999;text-align:center;padding:20px">Aucune livraison assignee</p>' :
 mesCours.map(function(l){
 return '<div class="cd" style="margin-bottom:12px">'
 + '<div style="display:flex;justify-content:space-between;align-items:flex-start">'
 + '<div><strong>' + l.client + '</strong> — ' + l.tel
 + '<br><span style="color:#007A3D">' + l.adresse + ', ' + l.ville + '</span>'
 + '<br><span style="color:#666;font-size:12px">' + (l.total||0).toLocaleString('fr-FR') + ' FCFA</span></div>'
 + '<span style="background:' + (l.statut==='en_route'?'#8b5cf6':'#3b82f6') + ';color:#fff;padding:3px 8px;border-radius:20px;font-size:11px">' + (l.statut==='en_route'?'En route':'Assignee') + '</span>'
 + '</div>'
 + '<div style="display:flex;gap:8px;margin-top:10px">'
 + '<a href="tel:' + l.tel + '" class="btn bo bsm">Appeler</a>'
 + '<a href="https://wa.me/' + (l.tel||'').replace(/\D/g,'') + '" target="_blank" class="btn bo bsm">WhatsApp</a>'
 + (l.statut==='assignee' ? '<button class="btn bp bsm" onclick="mettreAJourStatutLivraison(\'' + l.id + '\',\'en_route\')">Demarrer</button>' : '')
 + (l.statut==='en_route' ? '<button class="btn bp bsm" onclick="mettreAJourStatutLivraison(\'' + l.id + '\',\'livree\')">Livre</button>' : '')
 + '</div></div>';
 }).join(''))
 + '</div>';
}
