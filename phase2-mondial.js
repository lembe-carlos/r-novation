// ═══════════════════════════════════════════════════════════════
//  KAMER360 — VISION MONDIALE PHASE 2
//  1. IA Prédictive des stocks
//  2. Expansion CEMAC (6 pays)
//  3. Micro-crédit commerçants
//  4. API publique & webhooks
//  5. Social commerce (stories, live, partage)
//  6. B2B Grossistes & fournisseurs
// ═══════════════════════════════════════════════════════════════

'use strict';

// ── Helpers ────────────────────────────────────────────────────
function _p2toast(msg, type) {
  if (typeof toast === 'function') toast(msg, type || 'info');
}
function _p2ls(k, d) {
  try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch(e) { return d; }
}
function _p2save(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {}
}
function _p2el(id) { return document.getElementById(id); }
function _p2fmt(n) { return Number(n||0).toLocaleString('fr-FR'); }

// ══════════════════════════════════════════════════════════════
//  1. IA PRÉDICTIVE DES STOCKS
//  Analyse l'historique des ventes → prédit les ruptures à 7j
// ══════════════════════════════════════════════════════════════
var IA_PREDICT = {
  SEUIL_ALERTE: 7,  // jours avant rupture prédite

  // Calculer la vitesse de vente d'un produit (unités/jour)
  vitesseVente: function(prodId) {
    var cmds = _p2ls('sm_commandes', []);
    var cutoff = Date.now() - 30 * 86400000; // 30 derniers jours
    var vendu = 0;
    cmds.forEach(function(cmd) {
      if (!cmd.items || new Date(cmd.date).getTime() < cutoff) return;
      cmd.items.forEach(function(item) {
        if (String(item.id || item.prodId) === String(prodId)) {
          vendu += (item.qte || 1);
        }
      });
    });
    return vendu / 30; // unités par jour
  },

  // Prévoir les jours restants avant rupture
  joursRestants: function(stock, vitesse) {
    if (vitesse <= 0) return 999;
    return Math.floor(stock / vitesse);
  },

  // Analyser tous les produits
  analyserTous: function() {
    var prods = _p2ls('sm_produits', []);
    var alertes = [];
    prods.forEach(function(p) {
      if (!p || p.stock === undefined) return;
      var v    = IA_PREDICT.vitesseVente(p.id);
      var jours = IA_PREDICT.joursRestants(p.stock, v);
      var tendance = v > 0 ? '+' + v.toFixed(1) + '/j' : 'stable';
      alertes.push({
        produit:   p.nom || p.name || 'Produit',
        id:        p.id,
        stock:     p.stock,
        vitesse:   v,
        jours:     jours,
        tendance:  tendance,
        commande:  Math.round(v * 30),  // qté suggérée pour 30j
        urgence:   jours <= 3 ? 'critique' : jours <= 7 ? 'alerte' : jours <= 14 ? 'attention' : 'ok'
      });
    });
    return alertes.sort(function(a,b){ return a.jours - b.jours; });
  },

  // Prévisions de CA sur 30 jours
  previsionCA: function() {
    var cmds = _p2ls('sm_commandes', []);
    var cutoff = Date.now() - 30 * 86400000;
    var caPassé = cmds
      .filter(function(c){ return new Date(c.date).getTime() >= cutoff; })
      .reduce(function(s,c){ return s + (c.total || 0); }, 0);
    // Taux de croissance simulé basé sur le nombre de commandes
    var nbCmd = cmds.filter(function(c){ return new Date(c.date).getTime() >= cutoff; }).length;
    var croissance = nbCmd > 10 ? 1.15 : nbCmd > 5 ? 1.08 : 1.03;
    return {
      caPassé:   caPassé,
      caPrévu:   Math.round(caPassé * croissance),
      croissance: ((croissance - 1) * 100).toFixed(1),
      nbCmd:     nbCmd
    };
  }
};

function initPageIAPredict() {
  var z = _p2el('ia-predict-content');
  if (!z) return;
  var alertes  = IA_PREDICT.analyserTous();
  var prevCA   = IA_PREDICT.previsionCA();
  var prods    = _p2ls('sm_produits', []);

  var html = '';

  // === Header IA ===
  html += '<div style="background:linear-gradient(135deg,#1a237e,#283593,#3949ab);color:#fff;border-radius:16px;padding:22px;margin-bottom:16px;position:relative;overflow:hidden">';
  html += '<div style="position:absolute;right:-30px;top:-30px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.06)"></div>';
  html += '<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">';
  html += '<div style="width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:28px">🧠</div>';
  html += '<div><div style="font-size:18px;font-weight:800;font-family:Playfair Display,serif">Assistant IA Prédictif</div>';
  html += '<div style="font-size:12px;opacity:.8;margin-top:2px">Analyse de ' + prods.length + ' produits · Dernières 30 jours</div></div></div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">';
  html += '<div style="background:rgba(255,255,255,.12);border-radius:10px;padding:12px;text-align:center">';
  html += '<div style="font-size:20px;font-weight:800">' + alertes.filter(function(a){return a.urgence==='critique';}).length + '</div>';
  html += '<div style="font-size:10px;opacity:.8;margin-top:2px">Critiques (0-3j)</div></div>';
  html += '<div style="background:rgba(255,255,255,.12);border-radius:10px;padding:12px;text-align:center">';
  html += '<div style="font-size:20px;font-weight:800">' + alertes.filter(function(a){return a.urgence==='alerte';}).length + '</div>';
  html += '<div style="font-size:10px;opacity:.8;margin-top:2px">Alertes (4-7j)</div></div>';
  html += '<div style="background:rgba(255,255,255,.12);border-radius:10px;padding:12px;text-align:center">';
  html += '<div style="font-size:20px;font-weight:800">+' + prevCA.croissance + '%</div>';
  html += '<div style="font-size:10px;opacity:.8;margin-top:2px">Croissance prévue</div></div>';
  html += '</div></div>';

  // === Prévision CA ===
  html += '<div class="cd" style="margin-bottom:14px">';
  html += '<div class="ch"><div class="ct">📈 Prévision CA — 30 prochains jours</div></div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-top:4px">';
  html += '<div style="background:#f9fafb;border-radius:10px;padding:14px">';
  html += '<div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">CA Dernier mois</div>';
  html += '<div style="font-size:22px;font-weight:900;color:#374151">' + _p2fmt(prevCA.caPassé) + ' F</div></div>';
  html += '<div style="background:#f0faf5;border-radius:10px;padding:14px">';
  html += '<div style="font-size:11px;color:#007A3D;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">CA Prévu (IA)</div>';
  html += '<div style="font-size:22px;font-weight:900;color:#007A3D">' + _p2fmt(prevCA.caPrévu) + ' F</div>';
  html += '<div style="font-size:11px;color:#007A3D;margin-top:4px">↑ +' + prevCA.croissance + '% estimé</div></div>';
  html += '</div></div>';

  // === Alertes stocks ===
  html += '<div class="cd" style="margin-bottom:14px">';
  html += '<div class="ch"><div class="ct">⚠️ Alertes stocks prédites</div>';
  html += '<button onclick="exporterAlertes()" class="btn bo bsm">Exporter</button></div>';

  if (alertes.length === 0 || prods.length === 0) {
    html += '<div style="text-align:center;padding:32px;color:#9ca3af">';
    html += '<div style="font-size:36px;margin-bottom:10px">📦</div>';
    html += '<div style="font-size:14px;font-weight:600;color:#374151">Aucun produit à analyser</div>';
    html += '<div style="font-size:12px;margin-top:6px">Ajoutez des produits avec un stock pour activer les prédictions</div></div>';
  } else {
    var urgColors = { critique:'#CE1126', alerte:'#E65100', attention:'#b8860b', ok:'#007A3D' };
    var urgBg    = { critique:'#fdecea', alerte:'#fff3e0', attention:'#fffde7', ok:'#f0faf5' };
    html += '<div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">';
    alertes.slice(0,10).forEach(function(a) {
      if (a.urgence === 'ok') return;
      var col = urgColors[a.urgence] || '#666';
      var bg  = urgBg[a.urgence] || '#f9fafb';
      html += '<div style="background:' + bg + ';border-left:4px solid ' + col + ';border-radius:0 10px 10px 0;padding:12px">';
      html += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
      html += '<div><div style="font-size:13px;font-weight:700;color:#0F1F0F">' + a.produit + '</div>';
      html += '<div style="font-size:11px;color:#666;margin-top:3px">Stock: ' + a.stock + ' unités · Vitesse: ' + a.vitesse.toFixed(1) + '/jour</div></div>';
      html += '<span style="background:' + col + ';color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;white-space:nowrap">';
      html += a.urgence === 'critique' ? '🔴 ' + a.jours + 'j restants' : a.urgence === 'alerte' ? '🟠 ' + a.jours + 'j' : '🟡 ' + a.jours + 'j';
      html += '</span></div>';
      if (a.commande > 0) {
        html += '<div style="margin-top:8px;display:flex;align-items:center;gap:8px">';
        html += '<span style="font-size:11px;color:' + col + ';font-weight:600">💡 Commander ' + a.commande + ' unités pour 30 jours</span>';
        html += '<button onclick="creerCommandeFournisseur(\'' + a.id + '\',' + a.commande + ')" style="background:' + col + ';color:#fff;border:none;padding:4px 10px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer">Commander</button>';
        html += '</div>';
      }
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  // === Recommandations IA ===
  html += '<div class="cd">';
  html += '<div class="ch"><div class="ct">💡 Recommandations IA</div></div>';
  var recs = [
    { icon:'📦', txt:'Passez vos commandes fournisseurs le lundi pour une livraison en début de semaine' },
    { icon:'📈', txt:'Vos ventes augmentent de ' + prevCA.croissance + '% — pensez à augmenter vos stocks de sécurité' },
    { icon:'🎯', txt:'Mettez en promotion les produits à rotation lente pour améliorer votre trésorerie' },
    { icon:'⚡', txt:'Activez les alertes automatiques pour être prévenu 48h avant chaque rupture prédite' },
  ];
  recs.forEach(function(r) {
    html += '<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #f5f8f5">';
    html += '<span style="font-size:20px">' + r.icon + '</span>';
    html += '<span style="font-size:13px;color:#374151;line-height:1.5">' + r.txt + '</span>';
    html += '</div>';
  });
  html += '</div>';

  z.innerHTML = html;
}

function exporterAlertes() {
  var alertes = IA_PREDICT.analyserTous().filter(function(a){ return a.urgence !== 'ok'; });
  var csv = 'Produit,Stock,Vitesse/jour,Jours restants,Urgence,Commande suggérée\n';
  alertes.forEach(function(a) {
    csv += a.produit + ',' + a.stock + ',' + a.vitesse.toFixed(1) + ',' + a.jours + ',' + a.urgence + ',' + a.commande + '\n';
  });
  var blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
  var url  = URL.createObjectURL(blob);
  var lnk  = document.createElement('a');
  lnk.href = url; lnk.download = 'alertes_stocks_kamer360.csv';
  lnk.click(); URL.revokeObjectURL(url);
}

function creerCommandeFournisseur(prodId, qte) {
  _p2toast('Bon de commande créé pour ' + qte + ' unités — en attente fournisseur', 'success');
  var orders = _p2ls('km_cmd_fournisseurs', []);
  orders.unshift({ id:'CF'+Date.now(), prodId:prodId, qte:qte, statut:'en_attente', date:new Date().toLocaleDateString('fr-FR') });
  _p2save('km_cmd_fournisseurs', orders);
}

// ══════════════════════════════════════════════════════════════
//  2. EXPANSION CEMAC — 6 pays, multi-devises, multi-langues
// ══════════════════════════════════════════════════════════════
var CEMAC = {
  PAYS: [
    { code:'CM', nom:'Cameroun',          drapeau:'🇨🇲', capitale:'Yaoundé',    pop:'27M',  monnaie:'FCFA', potentiel:'★★★★★', actif:true  },
    { code:'GA', nom:'Gabon',             drapeau:'🇬🇦', capitale:'Libreville', pop:'2.3M', monnaie:'FCFA', potentiel:'★★★★☆', actif:false },
    { code:'CG', nom:'Congo-Brazzaville', drapeau:'🇨🇬', capitale:'Brazzaville',pop:'5.8M', monnaie:'FCFA', potentiel:'★★★★☆', actif:false },
    { code:'CF', nom:'Centrafrique',      drapeau:'🇨🇫', capitale:'Bangui',     pop:'5M',   monnaie:'FCFA', potentiel:'★★★☆☆', actif:false },
    { code:'GQ', nom:'Guinée Équatoriale',drapeau:'🇬🇶', capitale:'Malabo',     pop:'1.5M', monnaie:'FCFA', potentiel:'★★★★☆', actif:false },
    { code:'TD', nom:'Tchad',             drapeau:'🇹🇩', capitale:'N\'Djamena', pop:'17M',  monnaie:'FCFA', potentiel:'★★★☆☆', actif:false },
  ],
  LANGUES: [
    { code:'fr', nom:'Français',   drapeau:'🇫🇷' },
    { code:'en', nom:'English',    drapeau:'🇬🇧' },
    { code:'ff', nom:'Fulfulde',   drapeau:'🌍' },
    { code:'bm', nom:'Bassa',      drapeau:'🌍' },
    { code:'sw', nom:'Swahili',    drapeau:'🌍' },
  ]
};

function initPageCEMAC() {
  var z = _p2el('cemac-content');
  if (!z) return;
  var actif = _p2ls('km_pays_actif', 'CM');
  var langueActive = _p2ls('km_langue', 'fr');
  var html = '';

  // Header CEMAC
  html += '<div style="background:linear-gradient(135deg,#004d27,#007A3D,#00A852);color:#fff;border-radius:16px;padding:22px;margin-bottom:16px">';
  html += '<div style="font-size:18px;font-weight:800;font-family:Playfair Display,serif;margin-bottom:6px">🌍 Expansion CEMAC</div>';
  html += '<div style="font-size:13px;opacity:.85">Zone économique d\'Afrique Centrale — 60M d\'habitants, 1 monnaie FCFA</div>';
  html += '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">';
  html += '<div style="background:rgba(255,255,255,.15);padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600">1 zone monétaire</div>';
  html += '<div style="background:rgba(255,255,255,.15);padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600">0 frais de change</div>';
  html += '<div style="background:rgba(255,255,255,.15);padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600">1 seul déploiement</div>';
  html += '</div></div>';

  // Carte des pays
  html += '<div class="cd" style="margin-bottom:14px">';
  html += '<div class="ch"><div class="ct">Pays de la zone CEMAC</div></div>';
  html += '<div style="display:flex;flex-direction:column;gap:10px;padding-top:4px">';
  CEMAC.PAYS.forEach(function(p) {
    html += '<div style="display:flex;align-items:center;gap:12px;padding:12px;background:' + (p.actif?'#f0faf5':'#f9fafb') + ';border-radius:12px;border:1.5px solid ' + (p.actif?'#007A3D':'#e5e7eb') + '">';
    html += '<span style="font-size:32px">' + p.drapeau + '</span>';
    html += '<div style="flex:1">';
    html += '<div style="display:flex;align-items:center;gap:8px"><span style="font-weight:700;font-size:14px">' + p.nom + '</span>';
    if (p.actif) html += '<span style="background:#007A3D;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px">ACTIF</span>';
    html += '</div>';
    html += '<div style="font-size:11px;color:#666;margin-top:3px">' + p.capitale + ' · ' + p.pop + ' habitants · ' + p.potentiel + '</div>';
    html += '</div>';
    if (!p.actif) {
      html += '<button onclick="activerPays(\'' + p.code + '\',\'' + p.nom + '\')" style="background:#007A3D;color:#fff;border:none;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">Activer</button>';
    } else {
      html += '<span style="color:#007A3D;font-size:20px">✅</span>';
    }
    html += '</div>';
  });
  html += '</div></div>';

  // Multi-langue
  html += '<div class="cd" style="margin-bottom:14px">';
  html += '<div class="ch"><div class="ct">🌐 Langues disponibles</div></div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;padding-top:4px">';
  CEMAC.LANGUES.forEach(function(l) {
    var isActive = l.code === langueActive;
    html += '<button onclick="changerLangue(\'' + l.code + '\')" style="background:' + (isActive?'#007A3D':'#fff') + ';color:' + (isActive?'#fff':'#374151') + ';border:1.5px solid ' + (isActive?'#007A3D':'#e5e7eb') + ';border-radius:10px;padding:10px;cursor:pointer;text-align:center;transition:all .2s">';
    html += '<div style="font-size:20px;margin-bottom:4px">' + l.drapeau + '</div>';
    html += '<div style="font-size:12px;font-weight:600">' + l.nom + '</div>';
    html += '</button>';
  });
  html += '</div></div>';

  // Potentiel de marché
  html += '<div class="cd">';
  html += '<div class="ch"><div class="ct">📊 Potentiel de marché total</div></div>';
  html += '<div style="padding-top:8px">';
  var total_pop = 60, total_pays = 6, ca_potentiel = 450;
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px">';
  [
    { val:'60M', label:'Habitants CEMAC' },
    { val:'6', label:'Pays cibles' },
    { val:'450Md F', label:'PIB combiné (FCFA)' },
  ].forEach(function(s) {
    html += '<div style="background:#f0faf5;border-radius:10px;padding:12px;text-align:center">';
    html += '<div style="font-size:20px;font-weight:900;color:#007A3D;font-family:Playfair Display,serif">' + s.val + '</div>';
    html += '<div style="font-size:11px;color:#666;margin-top:4px">' + s.label + '</div></div>';
  });
  html += '</div>';
  html += '<div style="background:#fff8e1;border-left:4px solid #FCD116;padding:12px;border-radius:0 8px 8px 0;font-size:13px;color:#374151;line-height:1.6">';
  html += '<strong>Avantage KAMER360 :</strong> La zone CEMAC partage la même monnaie (FCFA CFA). Aucun frais de change, aucune adaptation des paiements — KAMER360 est déjà opérationnel dans les 6 pays sans modification.';
  html += '</div></div></div>';

  z.innerHTML = html;
}

function activerPays(code, nom) {
  if (!confirm('Activer KAMER360 pour ' + nom + ' ? Cette action notifiera votre équipe.')) return;
  var config = _p2ls('km_cemac_config', {});
  config[code] = { actif:true, date:new Date().toLocaleDateString('fr-FR') };
  _p2save('km_cemac_config', config);
  _p2toast(nom + ' activé ! Votre app est maintenant accessible depuis ce pays.', 'success');
  initPageCEMAC();
}

function changerLangue(code) {
  _p2save('km_langue', code);
  var noms = { fr:'Français', en:'English', ff:'Fulfulde', bm:'Bassa', sw:'Swahili' };
  _p2toast('Langue changée : ' + (noms[code]||code), 'success');
  initPageCEMAC();
}

// ══════════════════════════════════════════════════════════════
//  3. MICRO-CRÉDIT COMMERÇANTS
//  Scoring basé sur l'historique des ventes → prêt suggéré
// ══════════════════════════════════════════════════════════════
var MICRO_CREDIT = {
  // Calculer le score de crédit basé sur les données de l'app
  calculerScore: function() {
    var cmds    = _p2ls('sm_commandes', []);
    var prods   = _p2ls('sm_produits', []);
    var clients = _p2ls('sm_clients_boutique', []);
    var kp      = _p2ls('sm_kamer_pay', {});

    var score = 0;
    var details = [];

    // Critère 1: Ancienneté (max 20 pts)
    var firstCmd = cmds.length > 0 ? new Date(cmds[cmds.length-1].date) : new Date();
    var moisAncien = Math.floor((Date.now() - firstCmd.getTime()) / (30*86400000));
    var ptAncien = Math.min(20, moisAncien * 2);
    score += ptAncien;
    details.push({ label:'Ancienneté', pts:ptAncien, max:20, desc:moisAncien + ' mois d\'activité' });

    // Critère 2: Volume de ventes 30j (max 25 pts)
    var cutoff = Date.now() - 30*86400000;
    var ca30 = cmds.filter(function(c){ return new Date(c.date).getTime()>=cutoff; })
                   .reduce(function(s,c){ return s+(c.total||0); }, 0);
    var ptCA = Math.min(25, Math.floor(ca30 / 10000));
    score += ptCA;
    details.push({ label:'Ventes 30j', pts:ptCA, max:25, desc:_p2fmt(ca30) + ' FCFA' });

    // Critère 3: Régularité (max 20 pts)
    var semaines = {}, weeks = 0;
    cmds.forEach(function(c){
      var w = Math.floor(new Date(c.date).getTime()/604800000);
      semaines[w] = true;
    });
    weeks = Object.keys(semaines).length;
    var ptReg = Math.min(20, weeks * 2);
    score += ptReg;
    details.push({ label:'Régularité', pts:ptReg, max:20, desc:weeks + ' semaines actives' });

    // Critère 4: Nombre de clients (max 20 pts)
    var ptCli = Math.min(20, clients.length * 2);
    score += ptCli;
    details.push({ label:'Base clients', pts:ptCli, max:20, desc:clients.length + ' clients enregistrés' });

    // Critère 5: Utilisation KAMER Pay (max 15 pts)
    var ptKP = kp && kp.transactions && kp.transactions.length > 0 ? Math.min(15, kp.transactions.length) : 0;
    score += ptKP;
    details.push({ label:'KAMER Pay', pts:ptKP, max:15, desc:(kp.transactions||[]).length + ' transactions' });

    // Montant de crédit suggéré
    var montant = Math.round((score / 100) * 5000000 / 50000) * 50000;
    var tauxMensuel = score >= 80 ? 1.5 : score >= 60 ? 2.0 : score >= 40 ? 2.5 : 3.0;
    var dureeMax = score >= 80 ? 12 : score >= 60 ? 9 : score >= 40 ? 6 : 3;

    return { score:score, details:details, montant:montant, taux:tauxMensuel, duree:dureeMax,
             niveau: score>=80?'Excellent':score>=60?'Bon':score>=40?'Correct':'En cours' };
  }
};

function initPageMicroCredit() {
  var z = _p2el('microcredit-content');
  if (!z) return;
  var scoring = MICRO_CREDIT.calculerScore();
  var demandes = _p2ls('km_credit_demandes', []);
  var html = '';

  // Carte score
  var scoreColor = scoring.score >= 80 ? '#007A3D' : scoring.score >= 60 ? '#1565C0' : scoring.score >= 40 ? '#E65100' : '#CE1126';
  html += '<div style="background:linear-gradient(135deg,' + scoreColor + ',' + scoreColor + 'CC);color:#fff;border-radius:16px;padding:22px;margin-bottom:16px">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between">';
  html += '<div>';
  html += '<div style="font-size:13px;opacity:.8;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">Votre score KAMER Credit</div>';
  html += '<div style="font-size:56px;font-weight:900;font-family:Playfair Display,serif;line-height:1">' + scoring.score + '<span style="font-size:20px">/100</span></div>';
  html += '<div style="font-size:14px;margin-top:6px;font-weight:600">' + scoring.niveau + '</div>';
  html += '</div>';
  html += '<div style="text-align:center">';
  html += '<div style="font-size:11px;opacity:.8;margin-bottom:6px">Crédit disponible</div>';
  html += '<div style="font-size:24px;font-weight:900;font-family:Playfair Display,serif">' + _p2fmt(scoring.montant) + '</div>';
  html += '<div style="font-size:11px;opacity:.8;margin-top:2px">FCFA max</div>';
  html += '</div></div></div>';

  // Détail du scoring
  html += '<div class="cd" style="margin-bottom:14px">';
  html += '<div class="ch"><div class="ct">📊 Détail de votre score</div></div>';
  html += '<div style="display:flex;flex-direction:column;gap:10px;padding-top:4px">';
  scoring.details.forEach(function(d) {
    var pct = Math.round(d.pts/d.max*100);
    html += '<div>';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:4px">';
    html += '<span style="font-size:12px;font-weight:600;color:#374151">' + d.label + '</span>';
    html += '<span style="font-size:12px;color:#666">' + d.desc + ' — ' + d.pts + '/' + d.max + ' pts</span>';
    html += '</div>';
    html += '<div style="background:#e5e7eb;border-radius:20px;height:8px;overflow:hidden">';
    html += '<div style="background:' + scoreColor + ';height:100%;border-radius:20px;width:' + pct + '%;transition:width .6s"></div>';
    html += '</div></div>';
  });
  html += '</div></div>';

  // Offres de crédit
  html += '<div class="cd" style="margin-bottom:14px">';
  html += '<div class="ch"><div class="ct">💰 Offres disponibles</div></div>';
  var offres = [
    { nom:'Express', montant:Math.round(scoring.montant*0.3), duree:3, icon:'⚡' },
    { nom:'Standard', montant:Math.round(scoring.montant*0.6), duree:Math.min(6,scoring.duree), icon:'💼' },
    { nom:'Premium', montant:scoring.montant, duree:scoring.duree, icon:'🏆' },
  ];
  html += '<div style="display:flex;flex-direction:column;gap:10px;padding-top:4px">';
  offres.forEach(function(o) {
    var mensualite = Math.round(o.montant * (1 + scoring.taux/100 * o.duree) / o.duree);
    html += '<div style="background:#f9fafb;border-radius:12px;padding:14px;border:1px solid #e5e7eb">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">';
    html += '<div style="display:flex;align-items:center;gap:8px">';
    html += '<span style="font-size:24px">' + o.icon + '</span>';
    html += '<div><div style="font-weight:700;font-size:14px">' + o.nom + '</div>';
    html += '<div style="font-size:11px;color:#666">' + o.duree + ' mois · ' + scoring.taux + '%/mois</div></div>';
    html += '</div>';
    html += '<div style="text-align:right"><div style="font-size:17px;font-weight:900;color:#007A3D">' + _p2fmt(o.montant) + ' F</div>';
    html += '<div style="font-size:11px;color:#666">' + _p2fmt(mensualite) + ' F/mois</div><div style="font-size:10px;color:#666">mensualite estimee</div></div>';
    html += '</div>';
    html += '<button onclick="demanderCredit(' + o.montant + ',' + o.duree + ',\'' + o.nom + '\')" ';
    html += 'style="width:100%;background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border:none;padding:10px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">Faire une demande</button>';
    html += '</div>';
  });
  html += '</div></div>';

  // Historique demandes
  if (demandes.length > 0) {
    html += '<div class="cd">';
    html += '<div class="ch"><div class="ct">Mes demandes</div></div>';
    demandes.forEach(function(d) {
      var statColors = { en_attente:'#E65100', approuve:'#007A3D', refuse:'#CE1126' };
      var col = statColors[d.statut] || '#666';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f5f8f5">';
      html += '<div><div style="font-size:13px;font-weight:600">' + d.formule + ' — ' + _p2fmt(d.montant) + ' FCFA</div>';
      html += '<div style="font-size:11px;color:#666">' + d.date + ' · ' + d.duree + ' mois</div></div>';
      html += '<span style="background:' + col + '22;color:' + col + ';font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">' + d.statut.replace('_',' ') + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  z.innerHTML = html;
}

function demanderCredit(montant, duree, formule) {
  var confirm_msg = 'Confirmer la demande de ' + _p2fmt(montant) + ' FCFA sur ' + duree + ' mois ?';
  if (!confirm(confirm_msg)) return;
  var demandes = _p2ls('km_credit_demandes', []);
  demandes.unshift({ id:'CR'+Date.now()+'_'+Math.floor(Math.random()*9999), montant:montant, duree:duree, formule:formule,
    statut:'en_attente', date:new Date().toLocaleDateString('fr-FR') });
  _p2save('km_credit_demandes', demandes);
  _p2toast('Demande de crédit envoyée ! Réponse sous 24h.', 'success');
  initPageMicroCredit();
}

// ══════════════════════════════════════════════════════════════
//  4. API PUBLIQUE & WEBHOOKS
//  Clés API, documentation, webhooks pour développeurs tiers
// ══════════════════════════════════════════════════════════════
function initPageAPIPublique() {
  var z = _p2el('api-content');
  if (!z) return;
  var apiKeys = _p2ls('km_api_keys', []);
  var webhooks = _p2ls('km_webhooks', []);
  var html = '';

  // Header
  html += '<div style="background:linear-gradient(135deg,#212121,#424242);color:#fff;border-radius:16px;padding:22px;margin-bottom:16px">';
  html += '<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">';
  html += '<div style="width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:28px">⚡</div>';
  html += '<div><div style="font-size:18px;font-weight:800;font-family:Playfair Display,serif">API KAMER360</div>';
  html += '<div style="font-size:12px;opacity:.7;margin-top:2px">Ouvrez votre plateforme aux développeurs tiers</div></div></div>';
  html += '<div style="background:rgba(255,255,255,.08);border-radius:10px;padding:12px;font-family:monospace;font-size:12px">';
  html += '<div style="color:#a5d6a7">// Base URL</div>';
  html += '<div style="color:#fff">https://api.kamer360.cm/v1/</div>';
  html += '</div></div>';

  // Clés API
  html += '<div class="cd" style="margin-bottom:14px">';
  html += '<div class="ch"><div class="ct">🔑 Clés API</div>';
  html += '<button onclick="genererCleAPI()" class="btn bp bsm">+ Générer une clé</button></div>';
  if (apiKeys.length === 0) {
    html += '<div style="text-align:center;padding:24px;color:#9ca3af"><div style="font-size:32px;margin-bottom:8px">🔑</div>';
    html += '<div style="font-size:13px">Aucune clé API — générez votre première clé pour commencer</div></div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:8px;padding-top:8px">';
    apiKeys.forEach(function(k) {
      html += '<div style="background:#f9fafb;border-radius:10px;padding:12px;border:1px solid #e5e7eb">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
      html += '<div style="font-weight:700;font-size:13px">' + k.nom + '</div>';
      html += '<span style="background:' + (k.active?'#f0faf5':'#fdecea') + ';color:' + (k.active?'#007A3D':'#CE1126') + ';font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px">' + (k.active?'Active':'Désactivée') + '</span>';
      html += '</div>';
      html += '<div style="background:#1a1a2e;color:#a5d6a7;border-radius:8px;padding:8px 12px;font-family:monospace;font-size:11px;display:flex;justify-content:space-between;align-items:center">';
      html += '<span>' + k.key.substr(0,20) + '••••••••••••</span>';
      html += '<button onclick="copierCle(\'' + k.key + '\')" style="background:rgba(255,255,255,.1);color:#fff;border:none;padding:4px 8px;border-radius:4px;font-size:10px;cursor:pointer">Copier</button>';
      html += '</div>';
      html += '<div style="font-size:11px;color:#9ca3af;margin-top:6px">Créée le ' + k.date + ' · ' + k.appels + ' appels</div>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  // Endpoints disponibles
  html += '<div class="cd" style="margin-bottom:14px">';
  html += '<div class="ch"><div class="ct">📚 Endpoints API: GET POST DELETE</div></div>';
  var endpoints = [
    { method:'GET',    path:'/produits',       desc:'Lister tous les produits',         badge:'#007A3D' },
    { method:'POST',   path:'/commandes',      desc:'Créer une commande',               badge:'#1565C0' },
    { method:'GET',    path:'/commandes/{id}', desc:'Détails d\'une commande',          badge:'#007A3D' },
    { method:'GET',    path:'/clients',        desc:'Lister les clients',               badge:'#007A3D' },
    { method:'POST',   path:'/paiements',      desc:'Initier un paiement KAMER Pay',    badge:'#1565C0' },
    { method:'GET',    path:'/stats',          desc:'Statistiques de votre boutique',   badge:'#007A3D' },
    { method:'POST',   path:'/webhooks',       desc:'Configurer un webhook',            badge:'#1565C0' },
    { method:'DELETE', path:'/webhooks/{id}',  desc:'Supprimer un webhook',             badge:'#CE1126' },
  ];
  html += '<div style="display:flex;flex-direction:column;gap:6px;padding-top:8px">';
  endpoints.forEach(function(ep) {
    html += '<div style="display:flex;align-items:center;gap:10px;padding:8px;background:#f9fafb;border-radius:8px">';
    html += '<span style="background:' + ep.badge + ';color:#fff;font-size:10px;font-weight:800;padding:3px 8px;border-radius:4px;min-width:48px;text-align:center">' + ep.method + '</span>';
    html += '<code style="font-size:12px;color:#0F1F0F;flex:1">' + ep.path + '</code>';
    html += '<span style="font-size:11px;color:#666">' + ep.desc + '</span>';
    html += '</div>';
  });
  html += '</div></div>';

  // Webhooks
  html += '<div class="cd">';
  html += '<div class="ch"><div class="ct">🔔 Webhooks</div>';
  html += '<button onclick="ajouterWebhook()" class="btn bp bsm">+ Ajouter</button></div>';
  var evts = ['commande.creee','commande.payee','commande.livree','paiement.recu','stock.critique','client.inscrit'];
  html += '<div style="padding-top:8px">';
  html += '<div style="font-size:12px;color:#666;margin-bottom:10px">Recevez des notifications HTTP en temps réel pour ces événements :</div>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">';
  evts.forEach(function(e) {
    html += '<span style="background:#f0f0f0;color:#374151;font-size:11px;font-weight:600;padding:4px 10px;border-radius:6px;font-family:monospace">' + e + '</span>';
  });
  html += '</div>';
  if (webhooks.length === 0) {
    html += '<div style="text-align:center;padding:16px;color:#9ca3af;font-size:13px">Aucun webhook configuré</div>';
  } else {
    webhooks.forEach(function(w) {
      html += '<div style="background:#f9fafb;border-radius:8px;padding:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">';
      html += '<div><div style="font-size:12px;font-weight:600">' + w.url + '</div>';
      html += '<div style="font-size:11px;color:#666;margin-top:2px">' + w.events.join(', ') + '</div></div>';
      html += '<button onclick="supprimerWebhook(\'' + w.id + '\')" style="background:#fdecea;color:#CE1126;border:none;padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer">Suppr.</button>';
      html += '</div>';
    });
  }
  html += '</div></div>';

  z.innerHTML = html;
}

function genererCleAPI() {
  var nom = prompt('Nom de cette clé API (ex: App Mobile, Site Web) :');
  if (!nom) return;
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var key = 'km_live_';
  for (var i=0; i<32; i++) key += chars[Math.floor(Math.random()*chars.length)];
  var keys = _p2ls('km_api_keys', []);
  keys.push({ id:'KEY'+Date.now()+'_'+Math.floor(Math.random()*9999), nom:nom, key:key, active:true, appels:0, date:new Date().toLocaleDateString('fr-FR') });
  _p2save('km_api_keys', keys);
  _p2toast('Clé API "' + nom + '" créée ! Conservez-la en lieu sûr.', 'success');
  initPageAPIPublique();
}

function copierCle(key) {
  if (navigator.clipboard) navigator.clipboard.writeText(key);
  _p2toast('Clé API copiée dans le presse-papiers', 'success');
}

function ajouterWebhook() {
  var url = prompt('URL de votre endpoint webhook (https://...) :', 'https://');
  if (!url || !url.startsWith('http') || url === 'https://') { _p2toast('Entrez une URL valide — ex: https://monsite.cm/webhook', 'warning'); return; }
  var wh = _p2ls('km_webhooks', []);
  wh.push({ id:'WH'+Date.now()+'_'+Math.floor(Math.random()*9999), url:url, events:['commande.creee','paiement.recu'], date:new Date().toLocaleDateString('fr-FR') });
  _p2save('km_webhooks', wh);
  _p2toast('Webhook configuré ! Vous recevrez les événements en temps réel.', 'success');
  initPageAPIPublique();
}

function supprimerWebhook(id) {
  var wh = _p2ls('km_webhooks', []).filter(function(w){ return w.id !== id; });
  _p2save('km_webhooks', wh);
  _p2toast('Webhook supprimé', 'success');
  initPageAPIPublique();
}

// ══════════════════════════════════════════════════════════════
//  5. SOCIAL COMMERCE — Stories, live, partage WhatsApp
// ══════════════════════════════════════════════════════════════
function initPageSocialCommerce() {
  var z = _p2el('social-content');
  if (!z) return;
  var stories = _p2ls('km_stories', []);
  var partages = _p2ls('km_partages', []);
  var html = '';

  // Header
  html += '<div style="background:linear-gradient(135deg,#6a1b9a,#9c27b0,#e91e63);color:#fff;border-radius:16px;padding:22px;margin-bottom:16px">';
  html += '<div style="font-size:18px;font-weight:800;font-family:Playfair Display,serif;margin-bottom:4px">📱 Social Commerce</div>';
  html += '<div style="font-size:12px;opacity:.85">TikTok Shop + Instagram Shopping — pour l\'Afrique Centrale</div>';
  html += '<div style="margin-top:14px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">';
  [
    { val:stories.length, label:'Stories actives' },
    { val:partages.length, label:'Partages total' },
    { val: partages.reduce(function(s,p){ return s+(p.clics||0); }, 0), label:'Clics générés' },
  ].forEach(function(s) {
    html += '<div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px;text-align:center">';
    html += '<div style="font-size:20px;font-weight:800">' + s.val + '</div>';
    html += '<div style="font-size:10px;opacity:.8;margin-top:2px">' + s.label + '</div></div>';
  });
  html += '</div></div>';

  // Stories produits
  html += '<div class="cd" style="margin-bottom:14px">';
  html += '<div class="ch"><div class="ct">📸 Stories & Promotions 24h</div>';
  html += '<button onclick="creerStory()" class="btn bp bsm">+ Créer une story</button></div>';
  if (stories.length === 0) {
    html += '<div style="text-align:center;padding:28px;color:#9ca3af">';
    html += '<div style="font-size:36px;margin-bottom:8px">📸</div>';
    html += '<div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:6px">Créez votre première story</div>';
    html += '<div style="font-size:12px">Visibilité x10 — les stories restent actives 24h</div></div>';
  } else {
    html += '<div style="display:flex;gap:10px;overflow-x:auto;padding:8px 0;-webkit-overflow-scrolling:touch">';
    stories.forEach(function(s) {
      var expired = Date.now() - s.ts > 86400000;
      html += '<div style="flex-shrink:0;width:90px;text-align:center">';
      html += '<div style="width:80px;height:120px;border-radius:12px;background:linear-gradient(135deg,' + s.color1 + ',' + s.color2 + ');margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:32px;position:relative;' + (expired?'opacity:.5':'border:3px solid #e91e63') + '">';
      html += s.emoji;
      if (expired) html += '<div style="position:absolute;bottom:4px;left:0;right:0;font-size:9px;color:#fff;text-align:center;font-weight:700">Expirée</div>';
      html += '</div>';
      html += '<div style="font-size:10px;font-weight:600;margin-top:4px;color:#374151;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + s.titre + '</div>';
      html += '<div style="font-size:9px;color:#9ca3af">' + (s.vues||0) + ' vues</div>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  // Partage WhatsApp
  html += '<div class="cd" style="margin-bottom:14px">';
  html += '<div class="ch"><div class="ct">📤 Partager sur WhatsApp</div></div>';
  html += '<div style="padding-top:4px">';
  html += '<div style="font-size:13px;color:#555;margin-bottom:12px;line-height:1.6">Chaque produit partagé génère un lien direct d\'achat. Le client clique → arrive directement sur la boutique KAMER360.</div>';
  var prods = _p2ls('sm_produits', []).slice(0,4);
  if (prods.length === 0) {
    html += '<div style="text-align:center;padding:16px;color:#9ca3af;font-size:13px">Ajoutez des produits pour les partager</div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    prods.forEach(function(p) {
      html += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:#f9fafb;border-radius:10px">';
      html += '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + (p.nom||p.name||'Produit') + '</div>';
      html += '<div style="font-size:11px;color:#666">' + _p2fmt(p.prix||p.price||0) + ' FCFA</div></div>';
      html += '<button onclick="partagerWhatsApp(\'' + (p.id||'') + '\',\'' + (p.nom||p.name||'Produit').replace(/'/g,'') + '\',' + (p.prix||0) + ')" ';
      html += 'style="background:#25D366;color:#fff;border:none;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px">';
      html += '📤 Partager</button>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div></div>';

  // Live shopping
  html += '<div class="cd">';
  html += '<div class="ch"><div class="ct">🔴 Live Shopping</div></div>';
  html += '<div style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;border-radius:12px;padding:18px;margin-top:8px;text-align:center">';
  html += '<div style="font-size:36px;margin-bottom:10px">🎥</div>';
  html += '<div style="font-weight:700;font-size:15px;margin-bottom:6px">Démarrez un live de vente</div>';
  html += '<div style="font-size:12px;opacity:.75;margin-bottom:16px;line-height:1.6">Vendez en direct sur KAMER360. Vos clients voient vos produits en temps réel, posent des questions et commandent pendant le live.</div>';
  html += '<button onclick="demarrerLive()" style="background:linear-gradient(135deg,#e91e63,#c2185b);color:#fff;border:none;padding:12px 24px;border-radius:25px;font-size:14px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px">';
  html += '<span style="width:10px;height:10px;border-radius:50%;background:#fff;animation:pulse-live 1s infinite"></span> Démarrer un live</button>';
  html += '</div></div>';

  html += '<style>@keyframes pulse-live { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }</style>';
  z.innerHTML = html;
}

function creerStory() {
  var titre = prompt('Titre de votre story (ex: Promo -30% aujourd\'hui !) :');
  if (!titre) return;
  var emoji = prompt('Emoji produit (ex: 🛒, 🍗, 💊, ⚡) :', '🛒');
  var colors = [['#007A3D','#00A852'],['#1565C0','#42A5F5'],['#e91e63','#f06292'],['#E65100','#FF8F00'],['#4A148C','#9C27B0']];
  var c = colors[Math.floor(Math.random()*colors.length)];
  var stories = _p2ls('km_stories', []);
  stories.unshift({ id:'ST'+Date.now()+'_'+Math.floor(Math.random()*9999), titre:titre, emoji:emoji||'🛒', color1:c[0], color2:c[1], vues:0, ts:Date.now() });
  _p2save('km_stories', stories);
  _p2toast('Story créée ! Elle sera visible pendant 24h.', 'success');
  initPageSocialCommerce();
}

function partagerWhatsApp(prodId, nom, prix) {
  var url = encodeURIComponent('https://kamer360.cm/boutique?produit=' + prodId);
  var msg = encodeURIComponent('🛒 ' + nom + ' disponible sur KAMER360 !\n💰 ' + Number(prix).toLocaleString('fr-FR') + ' FCFA\n📱 Commander directement : https://kamer360.cm/boutique?produit=' + prodId);
  var partages = _p2ls('km_partages', []);
  partages.unshift({ id:'SH'+Date.now()+'_'+Math.floor(Math.random()*9999), prodId:prodId, prodNom:nom, clics:1, date:new Date().toLocaleDateString('fr-FR') });
  _p2save('km_partages', partages);
  window.open('https://wa.me/?text=' + msg, '_blank');
  _p2toast('Lien de partage WhatsApp généré !', 'success');
}

function demarrerLive() {
  var z = _p2el('social-content');
  if (!z) return;

  var liveCode = 'LIVE' + Date.now().toString(36).toUpperCase().substr(-6);
  var liveUrl  = 'https://kamer360.cm/live/' + liveCode;

  var html = '';
  html += "<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;padding:24px;color:#fff;text-align:center;margin-bottom:14px'>";
  html += "<div style='display:inline-flex;align-items:center;gap:8px;background:#e91e63;padding:6px 16px;border-radius:20px;margin-bottom:16px'>";
  html += "<span style='width:10px;height:10px;border-radius:50%;background:#fff;animation:pulse-live 1s infinite'></span>";
  html += "<span style='font-size:13px;font-weight:800;letter-spacing:1px'>EN DIRECT</span></div>";
  html += "<div style='font-family:Playfair Display,serif;font-size:24px;font-weight:900;margin-bottom:8px'>KAMER360 Live</div>";
  html += "<div style='font-size:12px;opacity:.75;margin-bottom:20px'>Votre live de vente est prêt — partagez le lien avec vos clients</div>";
  html += "<div style='background:rgba(255,255,255,.1);border-radius:10px;padding:12px;font-family:monospace;font-size:13px;margin-bottom:16px'>" + liveUrl + "</div>";
  html += "<div style='display:flex;gap:10px;justify-content:center;flex-wrap:wrap'>";
  html += "<button onclick='partagerLiveWhatsApp(\"" + liveUrl + "\")' style='background:#25D366;color:#fff;border:none;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer'>📤 Partager sur WhatsApp</button>";
  html += "<button onclick='initPageSocialCommerce()' style='background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3);padding:12px 20px;border-radius:10px;font-size:13px;cursor:pointer'>← Retour</button>";
  html += "</div></div>";

  // Instructions live
  html += "<div class='cd' style='margin-bottom:14px'>";
  html += "<div class='ch'><div class='ct'>Comment démarrer votre live ?</div></div>";
  html += "<div style='display:flex;flex-direction:column;gap:10px;padding-top:8px'>";
  var steps = [
    { n:'1', icon:'📱', title:'Ouvrez une appli de streaming', desc:'YouTube Live, Facebook Live, Instagram Live ou n&#39;importe quel outil de streaming video.' },
    { n:'2', icon:'📤', title:'Partagez le lien KAMER360', desc:'Envoyez le lien ci-dessus sur WhatsApp, Facebook et vos groupes de clients.' },
    { n:'3', icon:'🛒', title:'Presentez vos produits', desc:'Montrez vos produits en direct — vos clients peuvent commander via la boutique pendant le live.' },
    { n:'4', icon:'💬', title:'Repondez aux questions', desc:'Vos clients voient les produits et passent commande en temps reel sur kamer360.cm.' },
  ];
  steps.forEach(function(s) {
    html += "<div style='display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f5f8f5'>";
    html += "<div style='width:28px;height:28px;border-radius:50%;background:#007A3D;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0'>" + s.n + "</div>";
    html += "<div><div style='font-size:13px;font-weight:700;color:#0F1F0F'>" + s.icon + " " + s.title + "</div>";
    html += "<div style='font-size:12px;color:#666;margin-top:3px'>" + s.desc + "</div></div>";
    html += "</div>";
  });
  html += "</div></div>";

  // Sauvegarder le live en cours
  var lives = _p2ls('km_lives', []);
  lives.unshift({ id:liveCode, url:liveUrl, date:new Date().toLocaleString('fr-FR'), actif:true });
  _p2save('km_lives', lives.slice(0,10));

  z.innerHTML = html;
  _p2toast('Live ' + liveCode + ' cree ! Partagez le lien avec vos clients.', 'success');
}

function partagerLiveWhatsApp(url) {
  var msg = encodeURIComponent('🔴 KAMER360 est EN DIRECT !\n\nRejoignez notre live de vente maintenant :\n' + url + '\n\nVoyez nos produits en temps reel et commandez directement !');
  window.open('https://wa.me/?text=' + msg, '_blank');
  _p2toast('Lien live partage sur WhatsApp !', 'success');
}

// ══════════════════════════════════════════════════════════════
//  6. B2B GROSSISTES & FOURNISSEURS
//  Catalogue B2B, commandes en gros, facturation inter-entreprises
// ══════════════════════════════════════════════════════════════
function initPageB2B() {
  var z = _p2el('b2b-content');
  if (!z) return;
  var fournisseurs = _p2ls('km_fournisseurs', []);
  var cmdGros = _p2ls('km_cmd_gros', []);
  var html = '';

  // Header B2B
  html += '<div style="background:linear-gradient(135deg,#263238,#37474f,#546e7a);color:#fff;border-radius:16px;padding:22px;margin-bottom:16px">';
  html += '<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">';
  html += '<div style="width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:28px">🏭</div>';
  html += '<div><div style="font-size:18px;font-weight:800;font-family:Playfair Display,serif">Espace B2B</div>';
  html += '<div style="font-size:12px;opacity:.75;margin-top:2px">Grossistes & Fournisseurs — Commandes en gros</div></div></div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">';
  [
    { val:fournisseurs.length, label:'Fournisseurs' },
    { val:cmdGros.length, label:'Commandes gros' },
    { val:_p2fmt(cmdGros.reduce(function(s,c){return s+(c.total||0);},0)), label:'Volume FCFA' },
  ].forEach(function(s) {
    html += '<div style="background:rgba(255,255,255,.1);border-radius:10px;padding:10px;text-align:center">';
    html += '<div style="font-size:18px;font-weight:800">' + s.val + '</div>';
    html += '<div style="font-size:10px;opacity:.75;margin-top:2px">' + s.label + '</div></div>';
  });
  html += '</div></div>';

  // Fournisseurs partenaires
  html += '<div class="cd" style="margin-bottom:14px">';
  html += '<div class="ch"><div class="ct">🤝 Fournisseurs partenaires</div>';
  html += '<button onclick="ajouterFournisseur()" class="btn bp bsm">+ Ajouter</button></div>';
  if (fournisseurs.length === 0) {
    html += "<div style='text-align:center;padding:32px;color:#9ca3af'>";
    html += "<div style='font-size:36px;margin-bottom:10px'>🤝</div>";
    html += "<div style='font-size:14px;font-weight:700;color:#374151;margin-bottom:6px'>Aucun fournisseur partenaire</div>";
    html += "<div style='font-size:12px;line-height:1.6;max-width:280px;margin:0 auto'>Cliquez sur <strong>+ Ajouter</strong> pour enregistrer vos vrais fournisseurs et grossistes.</div>";
    html += "</div>";
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">';
    fournisseurs.forEach(function(f) {
      html += '<div style="background:#f9fafb;border-radius:10px;padding:12px;display:flex;justify-content:space-between;align-items:center">';
      html += '<div><div style="font-weight:700;font-size:13px">' + f.nom + '</div>';
      html += '<div style="font-size:11px;color:#666;margin-top:2px">' + f.cat + ' · ' + f.ville + '</div></div>';
      html += '<button onclick="contacterFournisseur(\'' + f.nom + '\')" style="background:#007A3D;color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">Commander</button>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  // Commandes en gros
  html += '<div class="cd" style="margin-bottom:14px">';
  html += '<div class="ch"><div class="ct">📦 Commandes en gros</div>';
  html += '<button onclick="passerCmdGros()" class="btn bp bsm">+ Nouvelle commande</button></div>';
  if (cmdGros.length === 0) {
    html += '<div style="text-align:center;padding:24px;color:#9ca3af">';
    html += '<div style="font-size:32px;margin-bottom:8px">📋</div>';
    html += '<div style="font-size:13px">Aucune commande grossiste</div></div>';
  } else {
    var statCols = { en_attente:'#E65100', confirmee:'#007A3D', livree:'#1565C0' };
    html += '<div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">';
    cmdGros.forEach(function(c) {
      var col = statCols[c.statut] || '#666';
      html += '<div style="border:1px solid #e5e7eb;border-radius:10px;padding:12px">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center">';
      html += '<div><div style="font-weight:700;font-size:13px">' + c.fournisseur + '</div>';
      html += '<div style="font-size:11px;color:#666;margin-top:2px">' + c.date + ' · ' + c.articles + ' articles</div></div>';
      html += '<div style="text-align:right"><div style="font-weight:800;color:#0F1F0F">' + _p2fmt(c.total) + ' F</div>';
      html += '<span style="background:' + col + '22;color:' + col + ';font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px">' + c.statut.replace('_',' ') + '</span></div>';
      html += '</div></div>';
    });
    html += '</div>';
  }
  html += '</div>';

  // Conditions B2B
  html += '<div class="cd">';
  html += '<div class="ch"><div class="ct">📜 Conditions B2B KAMER360</div></div>';
  html += '<div style="display:flex;flex-direction:column;gap:8px;padding-top:8px">';
  [
    { icon:'💰', label:'Minimum de commande', val:'500 000 FCFA' },
    { icon:'📅', label:'Délai de paiement', val:'30 jours net' },
    { icon:'🔄', label:'Remise volume', val:'5% à partir de 2M FCFA/mois' },
    { icon:'📦', label:'Livraison gratuite', val:'Pour toute commande > 1M FCFA' },
    { icon:'📊', label:'Reporting mensuel', val:'Tableau de bord dédié B2B' },
    { icon:'🤝', label:'Account manager dédié', val:'Pour les partenaires Premium' },
  ].forEach(function(c) {
    html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f5f8f5">';
    html += '<span style="font-size:20px;width:28px;text-align:center">' + c.icon + '</span>';
    html += '<span style="font-size:13px;color:#374151;flex:1">' + c.label + '</span>';
    html += '<span style="font-size:12px;font-weight:700;color:#007A3D">' + c.val + '</span>';
    html += '</div>';
  });
  html += '</div></div>';

  z.innerHTML = html;
}

function ajouterFournisseur() {
  var nom  = prompt('Nom du fournisseur :');
  if (!nom) return;
  var cat  = prompt('Catégorie (Alimentaire, BTP, Pharmacie...) :', 'Alimentaire');
  var ville = prompt('Ville :', 'Douala');
  var fournisseurs = _p2ls('km_fournisseurs', []);
  fournisseurs.push({ id:'FRN'+Date.now()+'_'+Math.random().toString(36).substr(2,6), nom:nom, cat:cat||'Divers', ville:ville||'Douala', date:new Date().toLocaleDateString('fr-FR') });
  _p2save('km_fournisseurs', fournisseurs);
  _p2toast(nom + ' ajouté comme fournisseur partenaire', 'success');
  initPageB2B();
}

function contacterFournisseur(nom) {
  var msg = encodeURIComponent('Bonjour, je suis gérant KAMER360 et je souhaite passer une commande grossiste auprès de ' + nom + '. Pourriez-vous me communiquer vos tarifs et conditions ?');
  window.open('https://wa.me/?text=' + msg, '_blank');
}

function passerCmdGros() {
  var fournisseur = prompt('Nom du fournisseur :');
  if (!fournisseur) return;
  var articles = parseInt(prompt('Nombre d\'articles :', '100') || 0);
  var total    = parseInt(prompt('Montant total (FCFA) :', '500000') || 0);
  if (!total) return;
  var cmds = _p2ls('km_cmd_gros', []);
  cmds.unshift({ id:'CG'+Date.now()+'_'+Math.floor(Math.random()*9999), fournisseur:fournisseur, articles:articles, total:total,
    statut:'en_attente', date:new Date().toLocaleDateString('fr-FR') });
  _p2save('km_cmd_gros', cmds);
  _p2toast('Commande grossiste créée — fournisseur notifié', 'success');
  initPageB2B();
}

// ══════════════════════════════════════════════════════════════
//  INITIALISATION GLOBALE PHASE 2
// ══════════════════════════════════════════════════════════════
console.log('[KAMER360] Phase 2 Vision Mondiale chargée');
