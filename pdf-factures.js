// ═══════════════════════════════════════════════════════
//  SuperMarché CM — pdf-factures.js
//  Génération PDF : reçus, factures, bons de commande
//  Utilise jsPDF (chargé depuis CDN)
// ═══════════════════════════════════════════════════════

var _jsPDFLoaded = false;

function _chargerJsPDF(callback) {
  if (typeof window.jsPDF !== 'undefined' || (window.jspdf && window.jspdf.jsPDF)) {
    _jsPDFLoaded = true;
    if (callback) callback();
    return;
  }
  var script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  script.onload = function() {
    _jsPDFLoaded = true;
    if (callback) callback();
  };
  document.head.appendChild(script);
}

// ─── Couleurs & constantes ───
var PDF_VERT   = [0, 122, 61];
var PDF_ROUGE  = [206, 17, 38];
var PDF_GRIS   = [100, 100, 100];
var PDF_LGRIS  = [240, 240, 240];
var PDF_NOIR   = [30, 30, 30];

function _getPDF() {
  if (window.jspdf && window.jspdf.jsPDF) return new window.jspdf.jsPDF();
  if (window.jsPDF) return new window.jsPDF();
  return null;
}

// ─── En-tête commun ───
function _enteteDoc(doc, titre, num) {
  var boutique = (typeof SM_CONFIG !== 'undefined') ? SM_CONFIG.boutique : {};

  // Fond vert en-tête
  doc.setFillColor(PDF_VERT[0], PDF_VERT[1], PDF_VERT[2]);
  doc.rect(0, 0, 210, 38, 'F');

  // Nom boutique
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(boutique.nom || 'SuperMarché CM', 14, 16);

  // Contact boutique
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(boutique.adresse || 'Douala, Cameroun', 14, 23);
  doc.text('Tel: ' + (boutique.telephone || '+237 683 39 22 68'), 14, 28);
  doc.text('Email: ' + (boutique.email || 'contact@supermarche.cm'), 14, 33);

  // Titre document (droite)
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(titre, 196, 18, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('N°: ' + num, 196, 26, { align: 'right' });
  doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), 196, 32, { align: 'right' });

  // Ligne séparatrice
  doc.setDrawColor(PDF_VERT[0], PDF_VERT[1], PDF_VERT[2]);
  doc.setLineWidth(0.5);
  doc.line(0, 38, 210, 38);

  doc.setTextColor(PDF_NOIR[0], PDF_NOIR[1], PDF_NOIR[2]);
  return 48; // y de départ après en-tête
}

// ─── Pied de page ───
function _piedPage(doc) {
  var boutique = (typeof SM_CONFIG !== 'undefined') ? SM_CONFIG.boutique : {};
  var pageH = doc.internal.pageSize.height;
  doc.setFillColor(PDF_LGRIS[0], PDF_LGRIS[1], PDF_LGRIS[2]);
  doc.rect(0, pageH - 18, 210, 18, 'F');
  doc.setFontSize(8);
  doc.setTextColor(PDF_GRIS[0], PDF_GRIS[1], PDF_GRIS[2]);
  doc.text('SuperMarché CM — ' + (boutique.adresse || 'Douala, Cameroun'), 105, pageH - 10, { align: 'center' });
  doc.text('WhatsApp: ' + (boutique.whatsapp || '237693591479'), 105, pageH - 5, { align: 'center' });
}

// ─── Bloc client ───
function _blocClient(doc, y, data) {
  doc.setFillColor(248, 250, 248);
  doc.roundedRect(12, y, 85, 30, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PDF_VERT[0], PDF_VERT[1], PDF_VERT[2]);
  doc.text('CLIENT', 16, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(PDF_NOIR[0], PDF_NOIR[1], PDF_NOIR[2]);
  doc.text(data.client || 'Client', 16, y + 15);
  doc.text('Tél: ' + (data.tel || '—'), 16, y + 21);
  doc.text('Adresse: ' + (data.adresse || data.ville || '—'), 16, y + 27);
  return y + 36;
}

// ─── Tableau articles ───
function _tableauArticles(doc, y, items, hasRemise) {
  // En-tête tableau
  doc.setFillColor(PDF_VERT[0], PDF_VERT[1], PDF_VERT[2]);
  doc.rect(12, y, 186, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Article', 15, y + 5.5);
  doc.text('Qté', 118, y + 5.5, { align: 'center' });
  doc.text('Prix unit.', 148, y + 5.5, { align: 'center' });
  if (hasRemise) doc.text('Remise', 168, y + 5.5, { align: 'center' });
  doc.text('Total', 193, y + 5.5, { align: 'right' });

  y += 8;
  doc.setFont('helvetica', 'normal');
  var totalHT = 0;

  items.forEach(function(item, i) {
    var bg = i % 2 === 0 ? [255,255,255] : [248,248,248];
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(12, y, 186, 7.5, 'F');
    doc.setTextColor(PDF_NOIR[0], PDF_NOIR[1], PDF_NOIR[2]);

    var nom = (item.nom || item.name || '—').substring(0, 42);
    doc.text(nom, 15, y + 5);
    doc.text(String(item.qty || item.qte || 1), 118, y + 5, { align: 'center' });
    doc.text(((item.prix || item.price || 0)).toLocaleString('fr-FR') + ' F', 148, y + 5, { align: 'center' });
    var total = (item.qty || item.qte || 1) * (item.prix || item.price || 0);
    totalHT += total;
    doc.setTextColor(PDF_VERT[0], PDF_VERT[1], PDF_VERT[2]);
    doc.text(total.toLocaleString('fr-FR') + ' F', 193, y + 5, { align: 'right' });
    y += 7.5;

    // Saut de page si nécessaire
    if (y > 250) {
      _piedPage(doc);
      doc.addPage();
      y = 20;
    }
  });

  // Ligne de séparation
  doc.setDrawColor(PDF_VERT[0], PDF_VERT[1], PDF_VERT[2]);
  doc.line(12, y, 198, y);
  return { y: y, totalHT: totalHT };
}

// ─── Bloc totaux ───
function _blocTotaux(doc, y, sousTotal, fraisLiv, total) {
  fraisLiv = fraisLiv || 0;
  var x = 130;
  doc.setFontSize(9);

  doc.setTextColor(PDF_GRIS[0], PDF_GRIS[1], PDF_GRIS[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Sous-total:', x, y + 8);
  doc.text(sousTotal.toLocaleString('fr-FR') + ' FCFA', 193, y + 8, { align: 'right' });

  if (fraisLiv > 0) {
    doc.text('Frais de livraison:', x, y + 15);
    doc.text(fraisLiv.toLocaleString('fr-FR') + ' FCFA', 193, y + 15, { align: 'right' });
  }

  // Total TTC
  doc.setFillColor(PDF_VERT[0], PDF_VERT[1], PDF_VERT[2]);
  doc.roundedRect(x - 4, y + 19, 202 - x, 10, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL:', x, y + 27);
  doc.text(total.toLocaleString('fr-FR') + ' FCFA', 193, y + 27, { align: 'right' });

  return y + 36;
}

// ══════════════════════════════════════════════════════
//  1. REÇU DE COMMANDE
// ══════════════════════════════════════════════════════
function genererRecuCommande(cmd) {
  _chargerJsPDF(function() {
    var doc = _getPDF();
    if (!doc) { toast('Erreur chargement PDF', 'error'); return; }

    var y = _enteteDoc(doc, 'REÇU', cmd.id || 'CMD-' + Date.now());
    y = _blocClient(doc, y, cmd);

    // Info commande
    doc.setFillColor(248, 250, 248);
    doc.roundedRect(105, y - 36, 93, 30, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_VERT[0], PDF_VERT[1], PDF_VERT[2]);
    doc.text('COMMANDE', 152, y - 28, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(PDF_NOIR[0], PDF_NOIR[1], PDF_NOIR[2]);
    doc.text('N°: ' + (cmd.id || '—'), 152, y - 21, { align: 'center' });
    doc.text('Paiement: ' + (cmd.paiement || 'Mobile Money'), 152, y - 14, { align: 'center' });
    doc.text('Statut: ' + (cmd.statut || 'confirmé'), 152, y - 8, { align: 'center' });

    // Articles
    var items = cmd.items || [];
    var res = _tableauArticles(doc, y + 4, items, false);
    y = res.y;

    // Totaux
    _blocTotaux(doc, y, res.totalHT, cmd.livraison || 0, cmd.total || res.totalHT);

    // Message de remerciement
    y += 44;
    doc.setFontSize(9);
    doc.setTextColor(PDF_GRIS[0], PDF_GRIS[1], PDF_GRIS[2]);
    doc.setFont('helvetica', 'italic');
    doc.text('Merci pour votre commande ! Pour toute question, contactez-nous sur WhatsApp.', 105, y, { align: 'center' });

    _piedPage(doc);
    doc.save('recu-' + (cmd.id || 'commande') + '.pdf');
    toast('Reçu PDF généré !', 'success');
  });
}

// ══════════════════════════════════════════════════════
//  2. FACTURE ABONNEMENT GÉRANT
// ══════════════════════════════════════════════════════
function genererFactureAbonnement(abo, gerant) {
  _chargerJsPDF(function() {
    var doc = _getPDF();
    if (!doc) { toast('Erreur chargement PDF', 'error'); return; }

    var num = 'ABO-' + Date.now();
    var y = _enteteDoc(doc, 'FACTURE', num);

    // Client = gérant
    y = _blocClient(doc, y, {
      client: gerant.nom || gerant.email,
      tel: gerant.tel || '—',
      adresse: gerant.sm || gerant.ville || 'Cameroun'
    });

    // Détail abonnement
    var plan = (typeof PLANS_ABONNEMENT !== 'undefined')
      ? PLANS_ABONNEMENT.find(function(p){ return p.id === abo.plan; }) : null;

    var items = [{
      nom: 'Abonnement ' + (plan ? plan.nom : abo.plan) + ' — SuperMarché CM',
      qty: abo.mois || 1,
      prix: plan ? plan.prix : 0
    }];

    var res = _tableauArticles(doc, y + 4, items, false);
    y = res.y;

    // Période
    doc.setFontSize(8);
    doc.setTextColor(PDF_GRIS[0], PDF_GRIS[1], PDF_GRIS[2]);
    y += 6;
    var debut = abo.debut ? new Date(abo.debut).toLocaleDateString('fr-FR') : '—';
    var fin   = abo.expiration ? new Date(abo.expiration).toLocaleDateString('fr-FR') : '—';
    doc.text('Période: ' + debut + ' → ' + fin, 15, y);
    y += 4;

    _blocTotaux(doc, y, res.totalHT, 0, res.totalHT);

    // Mentions légales
    y += 50;
    doc.setFontSize(7.5);
    doc.setTextColor(PDF_GRIS[0], PDF_GRIS[1], PDF_GRIS[2]);
    doc.text('Facture émise par SuperMarché CM — Douala, Cameroun', 105, y, { align: 'center' });
    doc.text('Paiement Mobile Money (MTN / Orange). Accès valable jusqu\'au ' + fin, 105, y + 5, { align: 'center' });

    _piedPage(doc);
    doc.save('facture-abo-' + (gerant.email || 'gerant') + '.pdf');
    toast('Facture PDF générée !', 'success');
  });
}

// ══════════════════════════════════════════════════════
//  3. BON DE COMMANDE FOURNISSEUR
// ══════════════════════════════════════════════════════
function genererBonCommande(bc) {
  _chargerJsPDF(function() {
    var doc = _getPDF();
    if (!doc) { toast('Erreur chargement PDF', 'error'); return; }

    var y = _enteteDoc(doc, 'BON DE COMMANDE', bc.id || 'BC-' + Date.now());

    // Fournisseur
    doc.setFillColor(248, 250, 248);
    doc.roundedRect(12, y, 186, 20, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_VERT[0], PDF_VERT[1], PDF_VERT[2]);
    doc.text('FOURNISSEUR: ' + (bc.fournisseur || '—'), 16, y + 9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(PDF_GRIS[0], PDF_GRIS[1], PDF_GRIS[2]);
    doc.text('Date souhaitée: ' + (bc.date || '—') + '  |  Notes: ' + (bc.notes || 'Aucune'), 16, y + 16);
    y += 26;

    var items = (bc.items || []).map(function(i) {
      return { nom: i.nom, qty: i.qty, prix: i.prix };
    });
    var res = _tableauArticles(doc, y, items, false);
    y = res.y;

    _blocTotaux(doc, y, res.totalHT, 0, bc.total || res.totalHT);

    _piedPage(doc);
    doc.save('bon-commande-' + (bc.id || Date.now()) + '.pdf');
    toast('Bon de commande PDF généré !', 'success');
  });
}

// ══════════════════════════════════════════════════════
//  4. HISTORIQUE TRANSACTIONS PAIEMENT
// ══════════════════════════════════════════════════════
var HISTORIQUE_PAIEMENTS = [];

function enregistrerPaiement(data) {
  var tx = {
    id:        'TX-' + Date.now(),
    date:      new Date().toLocaleDateString('fr-FR'),
    heure:     new Date().toLocaleTimeString('fr-FR'),
    email:     data.email || '',
    type:      data.type || 'abonnement',
    plan:      data.plan || '',
    montant:   data.montant || 0,
    operateur: data.operateur || 'Mobile Money',
    statut:    data.statut || 'success',
    ref:       data.ref || 'SIM-' + Date.now()
  };
  HISTORIQUE_PAIEMENTS.unshift(tx);
  try { localStorage.setItem('sm_paiements', JSON.stringify(HISTORIQUE_PAIEMENTS.slice(0, 200))); } catch(e) {}
  // Sync Supabase
  _syncPaiementSupabase(tx);
  return tx;
}

function initHistoriquePaiements() {
  try {
    var saved = JSON.parse(localStorage.getItem('sm_paiements') || '[]');
    if (Array.isArray(saved)) HISTORIQUE_PAIEMENTS = saved;
  } catch(e) {}
}

async function _syncPaiementSupabase(tx) {
  try {
    var sb = typeof _sbMain === 'function' ? _sbMain() : null;
    if (!sb) return;
    await sb.from('sm_paiements').insert({
      id: tx.id, date: tx.date, email: tx.email, type: tx.type,
      plan: tx.plan, montant: tx.montant, operateur: tx.operateur,
      statut: tx.statut, ref: tx.ref
    });
  } catch(e) {}
}

function renderHistoriquePaiements() {
  var z = document.getElementById('historique-paiements'); if (!z) return;
  initHistoriquePaiements();

  if (HISTORIQUE_PAIEMENTS.length === 0) {
    z.innerHTML = '<p style="text-align:center;color:#999;padding:20px">Aucune transaction</p>';
    return;
  }

  var total = HISTORIQUE_PAIEMENTS.reduce(function(s,t){ return s + (t.montant||0); }, 0);

  z.innerHTML = '<div style="background:#f0faf5;border-radius:10px;padding:12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">'
    + '<div><div style="font-size:11px;color:#666">Total encaissé</div><div style="font-size:20px;font-weight:800;color:#007A3D">' + total.toLocaleString('fr-FR') + ' FCFA</div></div>'
    + '<div><div style="font-size:11px;color:#666">Transactions</div><div style="font-size:20px;font-weight:800">' + HISTORIQUE_PAIEMENTS.length + '</div></div>'
    + '</div>'
    + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<thead><tr style="background:#007A3D;color:#fff">'
    + '<th style="padding:8px;text-align:left">Date</th><th style="padding:8px;text-align:left">Email</th>'
    + '<th style="padding:8px;text-align:left">Plan</th><th style="padding:8px;text-align:right">Montant</th>'
    + '<th style="padding:8px;text-align:center">Opérateur</th><th style="padding:8px;text-align:center">Statut</th>'
    + '<th style="padding:8px;text-align:center">Facture</th></tr></thead><tbody>'
    + HISTORIQUE_PAIEMENTS.slice(0, 50).map(function(tx, i) {
        var bg = i % 2 === 0 ? '#fff' : '#f9fafb';
        var stc = tx.statut === 'success' ? '#007A3D' : '#CE1126';
        return '<tr style="background:' + bg + ';border-bottom:1px solid #f0f0f0">'
          + '<td style="padding:8px">' + tx.date + ' ' + (tx.heure||'') + '</td>'
          + '<td style="padding:8px;font-size:11px">' + tx.email + '</td>'
          + '<td style="padding:8px">' + (tx.plan||tx.type||'—') + '</td>'
          + '<td style="padding:8px;text-align:right;font-weight:700;color:#007A3D">' + (tx.montant||0).toLocaleString('fr-FR') + ' F</td>'
          + '<td style="padding:8px;text-align:center">' + tx.operateur + '</td>'
          + '<td style="padding:8px;text-align:center"><span style="background:' + stc + '22;color:' + stc + ';padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700">' + tx.statut + '</span></td>'
          + '<td style="padding:8px;text-align:center"><button class="btn bo bsm" onclick="genererFactureAbonnement({plan:\'' + tx.plan + '\',mois:1,debut:\''+tx.date+'\',expiration:\'\'},{'
          + 'email:\'' + tx.email + '\',nom:\'' + tx.email.split('@')[0] + '\'})">PDF</button></td>'
          + '</tr>';
      }).join('')
    + '</tbody></table></div>';
}
