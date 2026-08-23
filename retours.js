// ═══════════════════════════════════════════════════════
// SuperMarché CM — retours.js
// Supabase — table : retours
// ═══════════════════════════════════════════════════════

var RETOURS = { liste: [] };

function _sbRet() {
 if (typeof window.supabase === 'undefined') return null;
 return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
}

async function initRetours() {
 try {
 var sb = _sbRet(); if (!sb) return;
 var res = await sb.from('retours').select('*').order('created_at', { ascending: false });
 if (res.data) RETOURS.liste = res.data;
 renderRetours();
 } catch(e) { console.warn('[Retours] init:', e); }
}

function demanderRetour(cmdId) {
 var cmd = typeof CMDS !== 'undefined' ? CMDS.find(function(c){ return c.id === cmdId; }) : null;
 if (cmd) {
 var el = document.getElementById('ret-cmd'); if (el) el.value = cmdId;
 var el2 = document.getElementById('ret-client'); if (el2) el2.value = cmd.client || '';
 var el3 = document.getElementById('ret-montant'); if (el3) el3.value = cmd.total || 0;
 }
 openM('m-retour');
}

async function creerRetour() {
 var cmdId = document.getElementById('ret-cmd').value.trim();
 var client = document.getElementById('ret-client').value.trim();
 var raison = document.getElementById('ret-raison').value;
 var detail = document.getElementById('ret-detail').value.trim();
 var montant = parseInt(document.getElementById('ret-montant').value) || 0;
 var mode = document.getElementById('ret-mode').value;
 if (!cmdId || !raison || !montant) { toast('Remplissez les champs obligatoires', 'warning'); return; }

 var ret = {
 cmd_id: cmdId, client: client, raison: raison, detail: detail,
 montant: montant, mode_remb: mode, statut: 'en_attente',
 created_at: new Date().toISOString(), date_traitement: null
 };

 try {
 var sb = _sbRet();
 if (sb) {
 var res = await sb.from('retours').insert(ret).select().single();
 if (res.data) { RETOURS.liste.unshift(res.data); }
 } else {
 ret.id = Date.now();
 RETOURS.liste.unshift(ret);
 }
 } catch(e) { console.warn('[Retours] creer:', e); ret.id = Date.now(); RETOURS.liste.unshift(ret); }

 renderRetours();
 closeM('m-retour');
 toast('Demande de retour creee pour la commande ' + cmdId, 'success');
 ['ret-cmd','ret-client','ret-detail','ret-montant'].forEach(function(id){
 var el = document.getElementById(id); if (el) el.value = '';
 });
}

async function traiterRetour(id, statut) {
 var r = RETOURS.liste.find(function(x){ return x.id == id; });
 if (!r) return;
 r.statut = statut;
 r.date_traitement = new Date().toLocaleDateString('fr-FR');
 try {
 var sb = _sbRet();
 if (sb) await sb.from('retours').update({ statut: statut, date_traitement: r.date_traitement }).eq('id', id);
 } catch(e) { console.warn('[Retours] traiter:', e); }
 if (statut === 'approuve' && typeof CMDS !== 'undefined') {
 var cmd = CMDS.find(function(c){ return c.id === r.cmd_id; });
 if (cmd) { cmd.statut = 'annulee'; if (typeof renderCmds === 'function') renderCmds(); }
 }
 renderRetours();
 var msgs = { approuve:'Retour approuve — remboursement en cours', rejete:'Retour rejete', traite:'Remboursement effectue' };
 toast(msgs[statut] || 'Retour mis a jour', 'success');
}

function renderRetours() {
 var tbody = document.getElementById('retours-tbody');
 if (!tbody) return;
 var statutColors = { en_attente:'#f59e0b', approuve:'#3b82f6', traite:'#10b981', rejete:'#ef4444' };
 var statutLabels = { en_attente:'En attente', approuve:'Approuve', traite:'Rembourse', rejete:'Rejete' };
 var raisonsLabels = { defectueux:'Produit defectueux', mauvais_produit:'Mauvais produit livre', non_livre:'Non livre', qualite:'Qualite insuffisante', autre:'Autre raison' };

 var total = RETOURS.liste.length;
 var attente = RETOURS.liste.filter(function(r){ return r.statut === 'en_attente'; }).length;
 var montantTotal = RETOURS.liste.filter(function(r){ return r.statut === 'traite'; }).reduce(function(s,r){ return s + (r.montant||0); }, 0);
 var nbEl = document.getElementById('ret-nb-total'); if (nbEl) nbEl.textContent = total;
 var atEl = document.getElementById('ret-nb-attente'); if (atEl) atEl.textContent = attente;
 var moEl = document.getElementById('ret-montant-total'); if (moEl) moEl.textContent = montantTotal.toLocaleString('fr-FR') + ' FCFA';

 tbody.innerHTML = RETOURS.liste.length === 0
 ? '<tr><td colspan="8" style="text-align:center;color:#999;padding:20px">Aucun retour enregistre</td></tr>'
 : RETOURS.liste.map(function(r){
 var actions = '';
 if (r.statut === 'en_attente') {
 actions = '<button class="btn bp bsm" onclick="traiterRetour(' + r.id + ',\'approuve\')">Approuver</button> '
 + '<button class="btn bd bsm" onclick="traiterRetour(' + r.id + ',\'rejete\')">Rejeter</button>';
 } else if (r.statut === 'approuve') {
 actions = '<button class="btn bp bsm" onclick="traiterRetour(' + r.id + ',\'traite\')">Marquer rembourse</button>';
 }
 var dateAff = r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : (r.date || '');
 return '<tr>'
 + '<td><strong style="color:#007A3D">RET-' + r.id + '</strong></td>'
 + '<td><strong>' + r.client + '</strong><br><span style="font-size:11px;color:#999">' + r.cmd_id + '</span></td>'
 + '<td style="font-size:12px">' + (raisonsLabels[r.raison] || r.raison) + (r.detail ? '<br><span style="color:#999">' + r.detail + '</span>' : '') + '</td>'
 + '<td style="font-weight:700;color:#ef4444">' + (r.montant||0).toLocaleString('fr-FR') + ' FCFA</td>'
 + '<td style="font-size:12px">' + r.mode_remb + '</td>'
 + '<td><span style="background:' + statutColors[r.statut] + ';color:#fff;padding:3px 8px;border-radius:20px;font-size:11px">' + statutLabels[r.statut] + '</span></td>'
 + '<td style="font-size:11px;color:#999">' + dateAff + '</td>'
 + '<td>' + actions + '</td>'
 + '</tr>';
 }).join('');
}
