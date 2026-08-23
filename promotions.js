// ═══════════════════════════════════════════════════════
// SuperMarché CM — promotions.js
// Supabase — table : promotions
// ═══════════════════════════════════════════════════════

var PROMOS = { liste: [] };

function _sbPromo() {
 if (typeof window.supabase === 'undefined') return null;
 return window.supabase.createClient(SM_CONFIG.supabase.url, SM_CONFIG.supabase.key);
}

async function initPromos() {
 try {
 var sb = _sbPromo(); if (!sb) return;
 var res = await sb.from('promotions').select('*').order('created_at', { ascending: false });
 if (res.data) PROMOS.liste = res.data;
 renderPromos();
 } catch(e) { console.warn('[Promos] init:', e); }
}

function validerCodePromo(code, montantPanier) {
 var promo = PROMOS.liste.find(function(p){ return p.code === code.toUpperCase() && p.actif; });
 if (!promo) return { ok:false, msg:'Code promo invalide ou expire' };
 if (promo.uses >= promo.max_uses) return { ok:false, msg:'Ce code a atteint sa limite d\'utilisation' };
 if (montantPanier < promo.min_achat) return { ok:false, msg:'Achat minimum requis : ' + (promo.min_achat||0).toLocaleString('fr-FR') + ' FCFA' };
 var expire = new Date(promo.expire);
 if (expire < new Date()) return { ok:false, msg:'Ce code promo a expire' };
 var reduction = 0;
 if (promo.type === 'pourcentage') reduction = Math.round(montantPanier * promo.valeur / 100);
 if (promo.type === 'montant') reduction = promo.valeur;
 return { ok:true, promo:promo, reduction:reduction, type:promo.type, msg:'Code applique : ' + promo.description };
}

async function utiliserPromo(code) {
 var promo = PROMOS.liste.find(function(p){ return p.code === code; });
 if (!promo) return;
 promo.uses = (promo.uses || 0) + 1;
 try {
 var sb = _sbPromo();
 if (sb) await sb.from('promotions').update({ uses: promo.uses }).eq('id', promo.id);
 } catch(e) { console.warn('[Promos] utiliser:', e); }
}

async function ajouterPromo() {
 var code = document.getElementById('promo-code').value.trim().toUpperCase();
 var desc = document.getElementById('promo-desc').value.trim();
 var type = document.getElementById('promo-type').value;
 var valeur = parseInt(document.getElementById('promo-valeur').value) || 0;
 var min = parseInt(document.getElementById('promo-min').value) || 0;
 var maxu = parseInt(document.getElementById('promo-max').value) || 100;
 var expire = document.getElementById('promo-expire').value;
 if (!code || !desc || !valeur || !expire) { toast('Remplissez tous les champs', 'warning'); return; }
 if (PROMOS.liste.find(function(p){ return p.code === code; })) { toast('Ce code existe deja', 'error'); return; }

 var newPromo = {
 code: code, description: desc, type: type, valeur: valeur,
 min_achat: min, max_uses: maxu, uses: 0, actif: true,
 expire: expire, created_at: new Date().toISOString()
 };

 try {
 var sb = _sbPromo();
 if (sb) {
 var res = await sb.from('promotions').insert(newPromo).select().single();
 if (res.data) { PROMOS.liste.unshift(res.data); }
 } else {
 newPromo.id = Date.now();
 PROMOS.liste.unshift(newPromo);
 }
 } catch(e) { console.warn('[Promos] ajouter:', e); newPromo.id = Date.now(); PROMOS.liste.unshift(newPromo); }

 renderPromos();
 closeM('m-promo');
 toast('Code promo "' + code + '" cree !', 'success');
 ['promo-code','promo-desc','promo-valeur','promo-min','promo-max','promo-expire'].forEach(function(id){
 var el = document.getElementById(id); if (el) el.value = '';
 });
}

async function togglePromo(id) {
 var p = PROMOS.liste.find(function(x){ return x.id == id; }); if (!p) return;
 p.actif = !p.actif;
 try {
 var sb = _sbPromo();
 if (sb) await sb.from('promotions').update({ actif: p.actif }).eq('id', id);
 } catch(e) { console.warn('[Promos] toggle:', e); }
 renderPromos();
 toast('Promo ' + (p.actif ? 'activee' : 'desactivee'), 'success');
}

async function supprimerPromo(id) {
 if (!confirm('Supprimer ce code promo ?')) return;
 try {
 var sb = _sbPromo();
 if (sb) await sb.from('promotions').delete().eq('id', id);
 } catch(e) { console.warn('[Promos] supprimer:', e); }
 PROMOS.liste = PROMOS.liste.filter(function(p){ return p.id != id; });
 renderPromos();
 toast('Code promo supprime', 'error');
}

function renderPromos() {
 var tbody = document.getElementById('promos-tbody');
 if (!tbody) return;

 function fmtP(n) { return (n||0).toLocaleString('fr-FR') + ' FCFA'; }

 tbody.innerHTML = PROMOS.liste.length === 0
 ? '<tr><td colspan="8" style="text-align:center;color:#999;padding:20px">Aucun code promo</td></tr>'
 : PROMOS.liste.map(function(p){
 var typeLabel = { pourcentage:'-' + p.valeur + '%', montant:'-' + fmtP(p.valeur), livraison:'Livraison gratuite' }[p.type] || p.type;
 var expired = p.expire && new Date(p.expire) < new Date();
 return '<tr>'
 + '<td><strong style="font-family:monospace;font-size:14px;color:#007A3D">' + p.code + '</strong></td>'
 + '<td>' + p.descriptionription + '</td>'
 + '<td><span style="background:#e8f5ef;color:#007A3D;padding:2px 8px;border-radius:20px;font-weight:700;font-size:12px">' + typeLabel + '</span></td>'
 + '<td style="font-size:12px">' + (p.min_achat > 0 ? 'Des ' + fmtP(p.min_achat) : 'Sans minimum') + '</td>'
 + '<td style="font-size:12px">' + (p.uses||0) + ' / ' + p.max_uses + '</td>'
 + '<td style="font-size:12px;color:' + (expired ? '#ef4444' : '#666') + '">' + p.expire + (expired ? ' (expire)' : '') + '</td>'
 + '<td><span class="badge ' + (p.actif && !expired ? 'bgg' : 'bgr') + '">' + (p.actif && !expired ? 'Actif' : 'Inactif') + '</span></td>'
 + '<td><div style="display:flex;gap:4px">'
 + '<button class="btn bo bsm" onclick="togglePromo(' + p.id + ')">' + (p.actif ? 'Desactiver' : 'Activer') + '</button>'
 + '<button class="btn bd bsm" onclick="supprimerPromo(' + p.id + ')">Suppr.</button>'
 + '</div></td>'
 + '</tr>';
 }).join('');

 var actifs = PROMOS.liste.filter(function(p){ return p.actif && p.expire && new Date(p.expire) >= new Date(); }).length;
 var totalUses = PROMOS.liste.reduce(function(s,p){ return s + (p.uses||0); }, 0);
 var nb = document.getElementById('promo-nb-actifs'); if (nb) nb.textContent = actifs;
 var tu = document.getElementById('promo-total-uses'); if (tu) tu.textContent = totalUses;
}
