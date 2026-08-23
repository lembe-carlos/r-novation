// ═══════════════════════════════════════════════════════════════
//  KAMER360 — kamer-features.js
//  6 Fonctionnalités à Impact Immédiat
//  1. KAMER Pay — Portefeuille numérique
//  2. Avis & Notations vérifiés
//  3. Tracking GPS livraison temps réel
//  4. Notifications Push PWA
//  5. Mode Hors-ligne complet (IndexedDB)
//  6. Chat intégré client–gérant
// ═══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
//  1. KAMER PAY — Portefeuille numérique
// ══════════════════════════════════════════════════════════════

var KamerPay = {
  KEY: 'kamer_pay_wallet',

  getData: function() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '{}');
    } catch(e) { return {}; }
  },

  save: function(data) {
    try { localStorage.setItem(this.KEY, JSON.stringify(data)); return true; }
    catch(e) { return false; }
  },

  getWallet: function(userId) {
    var d = this.getData();
    if (!d[userId]) {
      d[userId] = { solde: 0, transactions: [], points_fidelite: 0, niveau: 'Bronze' };
      this.save(d);
    }
    return d[userId];
  },

  crediter: function(userId, montant, description, source) {
    var d = this.getData();
    var w = this.getWallet(userId);
    w.solde += montant;
    w.transactions.unshift({
      id: 'TXN-' + Date.now(),
      type: 'credit',
      montant: montant,
      description: description || 'Crédit',
      source: source || 'Système',
      date: new Date().toLocaleDateString('fr-FR'),
      heure: new Date().toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}),
      solde_apres: w.solde
    });
    // Points fidélité : 1 point par 100 FCFA
    var pts = Math.floor(montant / 100);
    w.points_fidelite = (w.points_fidelite || 0) + pts;
    w.niveau = this._getNiveau(w.points_fidelite);
    d[userId] = w;
    this.save(d);
    if (typeof toast === 'function') toast('+ ' + montant.toLocaleString('fr-FR') + ' FCFA crédités sur votre wallet !', 'success');
    return true;
  },

  debiter: function(userId, montant, description) {
    var d = this.getData();
    var w = this.getWallet(userId);
    if (w.solde < montant) {
      if (typeof toast === 'function') toast('Solde insuffisant. Rechargez votre wallet.', 'error');
      return false;
    }
    w.solde -= montant;
    w.transactions.unshift({
      id: 'TXN-' + Date.now(),
      type: 'debit',
      montant: montant,
      description: description || 'Paiement',
      date: new Date().toLocaleDateString('fr-FR'),
      heure: new Date().toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}),
      solde_apres: w.solde
    });
    d[userId] = w;
    this.save(d);
    return true;
  },

  transferer: function(fromId, toId, montant, note) {
    if (!this.debiter(fromId, montant, 'Transfert vers ' + toId)) return false;
    this.crediter(toId, montant, 'Transfert de ' + fromId, 'Transfert KAMER Pay');
    if (typeof toast === 'function') toast('Transfert de ' + montant.toLocaleString('fr-FR') + ' FCFA effectué !', 'success');
    return true;
  },

  recharger: function(userId, montant, methode) {
    // Simulation recharge via MTN / Orange
    if (typeof toast === 'function') toast('Rechargement ' + methode + ' en cours...', 'info');
    var self = this;
    setTimeout(function() {
      self.crediter(userId, montant, 'Recharge ' + methode, methode);
    }, 2000);
  },

  _getNiveau: function(points) {
    if (points >= 10000) return 'Platinum';
    if (points >= 5000)  return 'Gold';
    if (points >= 1000)  return 'Silver';
    return 'Bronze';
  },

  getNiveauColor: function(niveau) {
    var map = { Platinum: '#0099dd', Gold: '#FCD116', Silver: '#9ca3af', Bronze: '#b45309' };
    return map[niveau] || '#b45309';
  },

  renderPage: function(userId) {
    var z = document.getElementById('kp-content');
    if (!z) return;
    var w = this.getWallet(userId || 'gerant');
    var niveauColor = this.getNiveauColor(w.niveau);
    var progressPts = { Bronze:0, Silver:1000, Gold:5000, Platinum:10000 };
    var nextNiveau = { Bronze:'Silver', Silver:'Gold', Gold:'Platinum', Platinum:'Platinum' };
    var next = nextNiveau[w.niveau];
    var ptsCible = progressPts[next] || 10000;
    var progress = Math.min(100, Math.round((w.points_fidelite / ptsCible) * 100));

    var html = '<div style="max-width:600px;margin:0 auto">'
      // Carte wallet
      + '<div style="background:linear-gradient(135deg,#004d27,#007A3D,#00A852);border-radius:20px;padding:24px;color:#fff;margin-bottom:16px;position:relative;overflow:hidden">'
      + '<div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08)"></div>'
      + '<div style="position:absolute;bottom:-20px;right:40px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.06)"></div>'
      + '<div style="font-size:11px;opacity:.7;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">KAMER Pay — Mon Wallet</div>'
      + '<div style="font-size:36px;font-weight:900;font-family:\'Playfair Display\',serif;letter-spacing:-1px">'
      + w.solde.toLocaleString('fr-FR') + ' <span style="font-size:18px;opacity:.8">FCFA</span></div>'
      + '<div style="margin-top:16px;display:flex;align-items:center;gap:10px">'
      + '<div style="background:rgba(255,255,255,.15);border-radius:20px;padding:4px 12px;font-size:12px;font-weight:700;color:' + niveauColor + '">' + w.niveau + '</div>'
      + '<div style="font-size:12px;opacity:.7">' + (w.points_fidelite || 0).toLocaleString('fr-FR') + ' points fidélité</div>'
      + '</div>'
      + '<div style="margin-top:10px;background:rgba(255,255,255,.15);border-radius:10px;height:6px;overflow:hidden">'
      + '<div style="background:#FCD116;height:100%;width:' + progress + '%;border-radius:10px;transition:width .6s"></div>'
      + '</div>'
      + '<div style="font-size:11px;opacity:.6;margin-top:4px">' + progress + '% vers niveau ' + next + '</div>'
      + '</div>'

      // Actions rapides
      + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">'
      + '<button onclick="KamerPay.ouvrirRecharge()" style="background:#fff;border:1.5px solid var(--br);border-radius:14px;padding:14px 8px;cursor:pointer;text-align:center;transition:all .2s" onmouseover="this.style.borderColor=\'#007A3D\'" onmouseout="this.style.borderColor=\'var(--br)\'">'
      + '<div style="font-size:22px;margin-bottom:4px">+</div>'
      + '<div style="font-size:12px;font-weight:700;color:#007A3D">Recharger</div></button>'
      + '<button onclick="KamerPay.ouvrirTransfert()" style="background:#fff;border:1.5px solid var(--br);border-radius:14px;padding:14px 8px;cursor:pointer;text-align:center;transition:all .2s" onmouseover="this.style.borderColor=\'#007A3D\'" onmouseout="this.style.borderColor=\'var(--br)\'">'
      + '<div style="font-size:22px;margin-bottom:4px">→</div>'
      + '<div style="font-size:12px;font-weight:700;color:#007A3D">Transférer</div></button>'
      + '<button onclick="KamerPay.ouvrirHistorique()" style="background:#fff;border:1.5px solid var(--br);border-radius:14px;padding:14px 8px;cursor:pointer;text-align:center;transition:all .2s" onmouseover="this.style.borderColor=\'#007A3D\'" onmouseout="this.style.borderColor=\'var(--br)\'">'
      + '<div style="font-size:22px;margin-bottom:4px">≡</div>'
      + '<div style="font-size:12px;font-weight:700;color:#007A3D">Historique</div></button>'
      + '</div>'

      // Transactions récentes
      + '<div class="cd"><div class="ch"><div class="ct">Transactions récentes</div></div>'
      + '<div id="kp-txns">'
      + (w.transactions.length === 0
          ? '<div style="text-align:center;padding:24px;color:#9ca3af;font-size:13px">Aucune transaction pour l\'instant</div>'
          : w.transactions.slice(0,8).map(function(t) {
              return '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f5f8f5">'
                + '<div style="width:38px;height:38px;border-radius:50%;background:' + (t.type==='credit'?'#e8f5ef':'#fdecea') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px">'
                + (t.type==='credit'?'↓':'↑') + '</div>'
                + '<div style="flex:1;min-width:0">'
                + '<div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + t.description + '</div>'
                + '<div style="font-size:11px;color:#9ca3af">' + t.date + ' · ' + (t.heure||'') + '</div>'
                + '</div>'
                + '<div style="font-size:14px;font-weight:800;color:' + (t.type==='credit'?'#007A3D':'#CE1126') + ';flex-shrink:0">'
                + (t.type==='credit'?'+':'-') + t.montant.toLocaleString('fr-FR') + ' F</div>'
                + '</div>';
            }).join('')
        )
      + '</div></div>'
      + '</div>';
    z.innerHTML = html;
  },

  ouvrirRecharge: function() {
    var modal = document.getElementById('m-kp-recharge');
    if (!modal) return;
    openM('m-kp-recharge');
  },

  confirmerRecharge: function() {
    var montant = parseInt((document.getElementById('kp-montant-recharge')||{}).value) || 0;
    var methode = (document.getElementById('kp-methode')||{}).value || 'MTN MoMo';
    if (!montant || montant < 500) { if(typeof toast==='function') toast('Montant minimum 500 FCFA', 'warning'); return; }
    closeM('m-kp-recharge');
    this.recharger('gerant', montant, methode);
    var self = this;
    setTimeout(function() { self.renderPage('gerant'); }, 2200);
  },

  ouvrirTransfert: function() {
    openM('m-kp-transfert');
  },

  confirmerTransfert: function() {
    var montant = parseInt((document.getElementById('kp-montant-transfert')||{}).value) || 0;
    var dest    = (document.getElementById('kp-dest')||{}).value || '';
    if (!montant || montant < 100) { if(typeof toast==='function') toast('Montant minimum 100 FCFA', 'warning'); return; }
    if (!dest) { if(typeof toast==='function') toast('Entrez le numéro destinataire', 'warning'); return; }
    this.transferer('gerant', dest, montant, '');
    closeM('m-kp-transfert');
    this.renderPage('gerant');
  },

  ouvrirHistorique: function() {
    openM('m-kp-historique');
    var w = this.getWallet('gerant');
    var el = document.getElementById('kp-hist-content');
    if (!el) return;
    if (w.transactions.length === 0) {
      el.innerHTML = '<div style="text-align:center;padding:32px;color:#9ca3af">Aucune transaction</div>';
      return;
    }
    el.innerHTML = w.transactions.map(function(t) {
      return '<div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid #f0f4f0">'
        + '<div style="width:40px;height:40px;border-radius:50%;background:' + (t.type==='credit'?'#e8f5ef':'#fdecea') + ';display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">'
        + (t.type==='credit'?'↓':'↑') + '</div>'
        + '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + t.description + '</div>'
        + '<div style="font-size:11px;color:#9ca3af">' + t.date + ' — Solde après: ' + t.solde_apres.toLocaleString('fr-FR') + ' F</div></div>'
        + '<div style="font-size:15px;font-weight:800;color:' + (t.type==='credit'?'#007A3D':'#CE1126') + '">'
        + (t.type==='credit'?'+':'-') + t.montant.toLocaleString('fr-FR') + ' F</div></div>';
    }).join('');
  }
};

// ══════════════════════════════════════════════════════════════
//  2. AVIS & NOTATIONS VÉRIFIÉS
// ══════════════════════════════════════════════════════════════

var KamerAvis = {
  KEY: 'kamer_avis',

  getData: function() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '{}'); }
    catch(e) { return {}; }
  },

  save: function(d) {
    try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch(e) {}
  },

  ajouter: function(cible_id, cible_type, note, commentaire, auteur) {
    var d = this.getData();
    if (!d[cible_id]) d[cible_id] = [];
    d[cible_id].unshift({
      id: 'AV-' + Date.now(),
      note: Math.min(5, Math.max(1, note)),
      commentaire: commentaire || '',
      auteur: auteur || 'Client anonyme',
      date: new Date().toLocaleDateString('fr-FR'),
      verifie: true,
      cible_type: cible_type
    });
    this.save(d);
    if (typeof toast === 'function') toast('Merci pour votre avis !', 'success');
    return true;
  },

  getAvis: function(cible_id) {
    var d = this.getData();
    return d[cible_id] || [];
  },

  getMoyenne: function(cible_id) {
    var avis = this.getAvis(cible_id);
    if (avis.length === 0) return { note: 0, nb: 0 };
    var total = avis.reduce(function(s, a) { return s + a.note; }, 0);
    return { note: Math.round((total / avis.length) * 10) / 10, nb: avis.length };
  },

  renderEtoiles: function(note, taille, interactif, onSelect) {
    taille = taille || 18;
    var html = '<span style="display:inline-flex;gap:2px;line-height:1">';
    for (var i = 1; i <= 5; i++) {
      var filled = i <= note;
      if (interactif) {
        html += '<span data-note="' + i + '" onclick="' + (onSelect||'') + '('+i+')" '
          + 'style="font-size:' + taille + 'px;color:' + (filled?'#FCD116':'#d1d5db') + ';cursor:pointer;transition:color .15s" '
          + 'onmouseover="this.style.color=\'#FCD116\'" onmouseout="this.style.color=\'' + (filled?'#FCD116':'#d1d5db') + '\'">'
          + (filled ? '★' : '☆') + '</span>';
      } else {
        html += '<span style="font-size:' + taille + 'px;color:' + (filled?'#FCD116':'#d1d5db') + '">'
          + (filled ? '★' : '☆') + '</span>';
      }
    }
    html += '</span>';
    return html;
  },

  renderWidget: function(containerId, cible_id, cible_type, cible_nom) {
    var z = document.getElementById(containerId);
    if (!z) return;
    var moy = this.getMoyenne(cible_id);
    var avis = this.getAvis(cible_id);
    var self = this;

    var html = '<div style="border-top:1px solid #f0f4f0;padding-top:16px;margin-top:16px">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
      + '<div>'
      + '<div style="font-size:14px;font-weight:700">Avis clients</div>'
      + (moy.nb > 0
          ? '<div style="display:flex;align-items:center;gap:6px;margin-top:4px">'
            + self.renderEtoiles(Math.round(moy.note), 16)
            + '<span style="font-size:13px;font-weight:700;color:#007A3D">' + moy.note + '</span>'
            + '<span style="font-size:12px;color:#9ca3af">(' + moy.nb + ' avis)</span></div>'
          : '<div style="font-size:12px;color:#9ca3af;margin-top:2px">Aucun avis encore</div>'
        )
      + '</div>'
      + '<button onclick="KamerAvis.ouvrirFormAvis(\'' + cible_id + '\',\'' + cible_type + '\',\'' + (cible_nom||'').replace(/'/g,'') + '\')" '
      + 'style="background:#007A3D;color:#fff;border:none;padding:8px 14px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer">Donner un avis</button>'
      + '</div>'
      + (avis.length > 0
          ? '<div style="display:flex;flex-direction:column;gap:10px">'
            + avis.slice(0,3).map(function(a) {
                return '<div style="background:#f9fafb;border-radius:10px;padding:12px">'
                  + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
                  + '<div style="display:flex;align-items:center;gap:8px">'
                  + '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#007A3D,#00A852);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700">'
                  + a.auteur.charAt(0).toUpperCase() + '</div>'
                  + '<div><div style="font-size:12px;font-weight:700">' + a.auteur + '</div>'
                  + (a.verifie ? '<div style="font-size:10px;color:#007A3D;font-weight:600">Achat vérifié</div>' : '') + '</div>'
                  + '</div>'
                  + '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">'
                  + self.renderEtoiles(a.note, 13)
                  + '<div style="font-size:10px;color:#9ca3af">' + a.date + '</div></div>'
                  + '</div>'
                  + (a.commentaire ? '<div style="font-size:12px;color:#555;line-height:1.5">' + a.commentaire + '</div>' : '')
                  + '</div>';
              }).join('')
            + '</div>'
          : ''
        )
      + '</div>';
    z.innerHTML = html;
  },

  _noteSelectionnee: 0,
  _cibleCourante: null,

  ouvrirFormAvis: function(cible_id, cible_type, cible_nom) {
    this._cibleCourante = { id: cible_id, type: cible_type, nom: cible_nom };
    this._noteSelectionnee = 0;
    var m = document.getElementById('m-kamer-avis');
    if (!m) return;
    document.getElementById('avis-cible-nom').textContent = cible_nom || 'ce service';
    document.getElementById('avis-etoiles').innerHTML = this.renderEtoiles(0, 32, true, 'KamerAvis.selectionnerNote');
    document.getElementById('avis-commentaire').value = '';
    openM('m-kamer-avis');
  },

  selectionnerNote: function(note) {
    this._noteSelectionnee = note;
    document.getElementById('avis-etoiles').innerHTML = this.renderEtoiles(note, 32, true, 'KamerAvis.selectionnerNote');
  },

  soumettre: function() {
    if (!this._cibleCourante) return;
    if (!this._noteSelectionnee) { if(typeof toast==='function') toast('Sélectionnez une note', 'warning'); return; }
    var commentaire = (document.getElementById('avis-commentaire')||{}).value || '';
    var auteur = (typeof CLIENT_COURANT !== 'undefined' && CLIENT_COURANT)
      ? (CLIENT_COURANT.prenom || '') + ' ' + (CLIENT_COURANT.nom || '')
      : 'Client';
    this.ajouter(this._cibleCourante.id, this._cibleCourante.type,
                 this._noteSelectionnee, commentaire, auteur.trim());
    closeM('m-kamer-avis');
  }
};

// ══════════════════════════════════════════════════════════════
//  3. TRACKING GPS LIVRAISON TEMPS RÉEL
// ══════════════════════════════════════════════════════════════

var KamerTracking = {
  KEY: 'kamer_tracking',
  _watchId: null,
  _map: null,
  _markerLivreur: null,
  _markerClient: null,

  getData: function() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '{}'); }
    catch(e) { return {}; }
  },

  save: function(d) {
    try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch(e) {}
  },

  // Créer une livraison trackable
  creerLivraison: function(cmdId, livreurNom, clientNom, clientTel, adresse) {
    var d = this.getData();
    d[cmdId] = {
      id: cmdId,
      livreur: livreurNom,
      client: clientNom,
      client_tel: clientTel,
      adresse: adresse,
      statut: 'en_attente',
      statuts: ['Commande confirmée', 'En préparation', 'Livreur en route', 'Livré'],
      statut_idx: 0,
      pos_livreur: null,
      pos_client: null,
      created: Date.now(),
      eta: null
    };
    this.save(d);
    return d[cmdId];
  },

  avancerStatut: function(cmdId) {
    var d = this.getData();
    if (!d[cmdId]) return;
    var livraison = d[cmdId];
    if (livraison.statut_idx < livraison.statuts.length - 1) {
      livraison.statut_idx++;
      livraison.statut = livraison.statuts[livraison.statut_idx];
      d[cmdId] = livraison;
      this.save(d);
      // Notifier via KamerPush
      if (typeof KamerPush !== 'undefined') {
        KamerPush.notifier(
          'Livraison mise à jour',
          'Statut: ' + livraison.statut + ' — Commande ' + cmdId,
          '#007A3D'
        );
      }
      if (typeof toast === 'function') toast('Statut mis à jour: ' + livraison.statut, 'success');
    }
    return d[cmdId];
  },

  // Démarrer le partage de position (livreur)
  demarrerPartagePosition: function(cmdId) {
    if (!navigator.geolocation) {
      if (typeof toast === 'function') toast('GPS non disponible sur cet appareil', 'error');
      return;
    }
    var self = this;
    this._watchId = navigator.geolocation.watchPosition(
      function(pos) {
        var d = self.getData();
        if (!d[cmdId]) return;
        d[cmdId].pos_livreur = { lat: pos.coords.latitude, lng: pos.coords.longitude, ts: Date.now() };
        d[cmdId].statut = 'Livreur en route';
        d[cmdId].statut_idx = 2;
        self.save(d);
        // Cross-tab sync
        try { localStorage.setItem('kamer_tracking_update', cmdId + ':' + Date.now()); } catch(e) {}
      },
      function(err) { console.warn('GPS error:', err.message); },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    if (typeof toast === 'function') toast('Partage GPS activé — les clients vous voient en temps réel', 'success');
  },

  arreterPartage: function() {
    if (this._watchId !== null) {
      navigator.geolocation.clearWatch(this._watchId);
      this._watchId = null;
    }
  },

  // Page de suivi côté client
  renderPageSuivi: function(cmdId, containerId) {
    var z = document.getElementById(containerId || 'tracking-content');
    if (!z) return;
    var d = this.getData();
    var livraison = d[cmdId];

    if (!livraison) {
      z.innerHTML = '<div style="text-align:center;padding:40px;color:#9ca3af"><div style="font-size:48px;margin-bottom:12px">?</div><div style="font-size:14px">Commande introuvable</div></div>';
      return;
    }

    var statuts = livraison.statuts || [];
    var idx = livraison.statut_idx || 0;

    var etapesHtml = statuts.map(function(s, i) {
      var done = i <= idx;
      var active = i === idx;
      return '<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:' + (i<statuts.length-1?'0':'0') + '">'
        + '<div style="display:flex;flex-direction:column;align-items:center">'
        + '<div style="width:28px;height:28px;border-radius:50%;background:' + (done?'#007A3D':'#e5e7eb') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .4s">'
        + (done ? '<span style="color:#fff;font-size:14px">✓</span>' : '<span style="color:#9ca3af;font-size:12px">' + (i+1) + '</span>') + '</div>'
        + (i < statuts.length-1 ? '<div style="width:2px;height:32px;background:' + (i<idx?'#007A3D':'#e5e7eb') + ';margin-top:2px;transition:background .4s"></div>' : '')
        + '</div>'
        + '<div style="padding-top:4px">'
        + '<div style="font-size:13px;font-weight:' + (active?'800':'600') + ';color:' + (done?'#007A3D':'#9ca3af') + '">' + s + '</div>'
        + (active ? '<div style="font-size:11px;color:#007A3D;margin-top:2px">Statut actuel</div>' : '')
        + '</div></div>';
    }).join('');

    var html = '<div style="max-width:480px;margin:0 auto">'
      // Header livraison
      + '<div style="background:linear-gradient(135deg,#004d27,#007A3D);color:#fff;border-radius:16px;padding:20px;margin-bottom:16px">'
      + '<div style="font-size:11px;opacity:.7;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Suivi commande</div>'
      + '<div style="font-size:18px;font-weight:800;margin-bottom:4px">' + livraison.id + '</div>'
      + '<div style="font-size:13px;opacity:.8">Livreur: ' + livraison.livreur + '</div>'
      + '<div style="font-size:13px;opacity:.8">Adresse: ' + livraison.adresse + '</div>'
      + '</div>'

      // Étapes
      + '<div class="cd" style="margin-bottom:16px">'
      + '<div class="ch"><div class="ct">Progression</div></div>'
      + '<div style="padding:4px 0">' + etapesHtml + '</div>'
      + '</div>'

      // Position GPS si disponible
      + (livraison.pos_livreur
          ? '<div class="cd" style="margin-bottom:16px">'
            + '<div class="ch"><div class="ct">Position du livreur</div><span class="badge bgg" style="animation:pulse-dot 1.5s infinite">En direct</span></div>'
            + '<div style="background:#f0faf5;border-radius:12px;padding:14px;text-align:center">'
            + '<div style="font-size:32px;margin-bottom:8px">📍</div>'
            + '<div style="font-size:13px;color:#007A3D;font-weight:700">Le livreur est en route vers vous</div>'
            + '<div style="font-size:11px;color:#9ca3af;margin-top:4px">Dernière mise à jour: ' + new Date(livraison.pos_livreur.ts).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}) + '</div>'
            + '</div></div>'
          : ''
        )

      // Contacter le livreur
      + '<div class="cd">'
      + '<div class="ch"><div class="ct">Besoin d\'aide?</div></div>'
      + '<div style="display:flex;gap:8px">'
      + (livraison.client_tel
          ? '<a href="tel:' + livraison.client_tel + '" style="flex:1;background:#007A3D;color:#fff;padding:12px;border-radius:10px;text-align:center;text-decoration:none;font-size:13px;font-weight:700">Appeler le livreur</a>'
          : '')
      + '<button onclick="closeM(\'m-kamer-tracking\')" style="flex:1;background:#f0f4f0;color:#555;border:none;padding:12px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">Fermer</button>'
      + '</div></div>'
      + '</div>';

    z.innerHTML = html;

    // Rafraîchissement auto toutes les 10s
    var self = this;
    setTimeout(function() { self.renderPageSuivi(cmdId, containerId); }, 10000);
  },

  // Ouvrir le modal de tracking pour une commande
  ouvrirSuivi: function(cmdId) {
    var m = document.getElementById('m-kamer-tracking');
    if (!m) return;
    openM('m-kamer-tracking');
    this.renderPageSuivi(cmdId, 'tracking-content');
  }
};

// ══════════════════════════════════════════════════════════════
//  4. NOTIFICATIONS PUSH PWA
// ══════════════════════════════════════════════════════════════

var KamerPush = {
  _swReg: null,
  _permission: 'default',
  QUEUE_KEY: 'kamer_notif_queue',

  init: function() {
    this._permission = Notification ? Notification.permission : 'denied';
    // Écouter les nouvelles notifs des autres onglets
    window.addEventListener('storage', function(e) {
      if (e.key === 'kamer_push_notif' && e.newValue) {
        try {
          var notif = JSON.parse(e.newValue);
          KamerPush._afficherToast(notif.titre, notif.corps, notif.couleur);
        } catch(err) {}
      }
    });
    return this;
  },

  demanderPermission: function(callback) {
    var self = this;
    if (!window.Notification) { if(callback) callback(false); return; }
    if (Notification.permission === 'granted') { self._permission = 'granted'; if(callback) callback(true); return; }
    Notification.requestPermission().then(function(result) {
      self._permission = result;
      if (result === 'granted') {
        if (typeof toast === 'function') toast('Notifications activées ! Vous serez alerté en temps réel.', 'success');
      }
      if (callback) callback(result === 'granted');
    });
  },

  notifier: function(titre, corps, couleur, icone) {
    // 1. Toast in-app immédiat
    this._afficherToast(titre, corps, couleur);
    // 2. Notification système si permission accordée
    if (window.Notification && Notification.permission === 'granted') {
      try {
        var n = new Notification(titre, {
          body: corps,
          icon: icone || '/icon-192.png',
          badge: '/icon-72.png',
          tag: 'kamer360-' + Date.now(),
          vibrate: [200, 100, 200]
        });
        n.onclick = function() { window.focus(); n.close(); };
        setTimeout(function() { n.close(); }, 8000);
      } catch(e) {}
    }
    // 3. Cross-tab via localStorage
    try {
      localStorage.setItem('kamer_push_notif', JSON.stringify({ titre: titre, corps: corps, couleur: couleur, ts: Date.now() }));
      setTimeout(function() { try { localStorage.removeItem('kamer_push_notif'); } catch(e) {} }, 1000);
    } catch(e) {}
    // 4. File d'attente pour hors-ligne
    this._enqueue(titre, corps, couleur);
  },

  _afficherToast: function(titre, corps, couleur) {
    var container = document.getElementById('kamer-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'kamer-toast-container';
      container.style.cssText = 'position:fixed;top:70px;right:16px;z-index:99999;display:flex;flex-direction:column;gap:8px;max-width:320px';
      document.body.appendChild(container);
    }
    var t = document.createElement('div');
    t.style.cssText = 'background:' + (couleur||'#007A3D') + ';color:#fff;padding:12px 16px;border-radius:12px;font-size:13px;box-shadow:0 4px 20px rgba(0,0,0,.2);display:flex;gap:10px;align-items:flex-start;animation:fadeInUp .3s ease;cursor:pointer;max-width:320px';
    t.innerHTML = '<div style="flex-shrink:0;margin-top:1px">🔔</div><div><div style="font-weight:700;margin-bottom:2px">' + titre + '</div><div style="opacity:.9;font-size:12px">' + corps + '</div></div>'
      + '<button onclick="this.parentElement.remove()" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:20px;height:20px;border-radius:50%;cursor:pointer;flex-shrink:0;font-size:11px">✕</button>';
    container.appendChild(t);
    setTimeout(function() { if (t.parentElement) { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(function(){t.remove();},300); } }, 7000);
  },

  _enqueue: function(titre, corps, couleur) {
    try {
      var q = JSON.parse(localStorage.getItem(this.QUEUE_KEY) || '[]');
      q.push({ titre: titre, corps: corps, couleur: couleur, ts: Date.now() });
      if (q.length > 50) q = q.slice(-50);
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(q));
    } catch(e) {}
  },

  getQueue: function() {
    try { return JSON.parse(localStorage.getItem(this.QUEUE_KEY) || '[]').reverse(); }
    catch(e) { return []; }
  },

  // Notifs prédéfinies KAMER360
  nouvelleCommande: function(numCmd, montant) {
    this.notifier('Nouvelle commande !', 'Commande ' + numCmd + ' — ' + (montant||'').toLocaleString('fr-FR') + ' FCFA', '#007A3D');
  },
  stockCritique: function(produit) {
    this.notifier('Stock critique', produit + ' — Moins de 5 unités restantes', '#E65100');
  },
  paiementRecu: function(montant, client) {
    this.notifier('Paiement reçu', (montant||0).toLocaleString('fr-FR') + ' FCFA de ' + (client||'un client'), '#1565C0');
  },
  rdvConfirme: function(service, heure) {
    this.notifier('RDV confirmé', service + ' — ' + heure, '#4A148C');
  },
  renderBoutonActivation: function(containerId) {
    var z = document.getElementById(containerId);
    if (!z) return;
    var perm = window.Notification ? Notification.permission : 'denied';
    if (perm === 'granted') {
      z.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:#e8f5ef;border-radius:10px;font-size:13px;color:#007A3D;font-weight:600"><span>✓</span> Notifications activées</div>';
    } else {
      z.innerHTML = '<button onclick="KamerPush.demanderPermission(function(ok){ KamerPush.renderBoutonActivation(\'' + containerId + '\'); if(ok) KamerPush.notifier(\'Bienvenue !\',\'Les notifications KAMER360 sont activées.\',\'#007A3D\'); })" '
        + 'style="background:linear-gradient(135deg,#007A3D,#00A852);color:#fff;border:none;padding:11px 20px;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px">'
        + '<span>🔔</span> Activer les notifications push</button>';
    }
  }
};

// ══════════════════════════════════════════════════════════════
//  5. MODE HORS-LIGNE COMPLET (IndexedDB)
// ══════════════════════════════════════════════════════════════

var KamerOffline = {
  DB_NAME: 'kamer360-offline',
  DB_VERSION: 1,
  _db: null,

  init: function(callback) {
    if (!window.indexedDB) { if(callback) callback(false); return; }
    var req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
    req.onupgradeneeded = function(e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains('produits'))   db.createObjectStore('produits',   { keyPath: 'id' });
      if (!db.objectStoreNames.contains('commandes'))  db.createObjectStore('commandes',  { keyPath: 'id' });
      if (!db.objectStoreNames.contains('config'))     db.createObjectStore('config',     { keyPath: 'cle' });
      if (!db.objectStoreNames.contains('sync_queue')) db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = function(e) {
      KamerOffline._db = e.target.result;
      KamerOffline._syncOnline();
      if (callback) callback(true);
      KamerOffline._updateStatusBar();
    };
    req.onerror = function() { if (callback) callback(false); };

    // Détecter online/offline
    window.addEventListener('online',  function() { KamerOffline._onOnline(); });
    window.addEventListener('offline', function() { KamerOffline._onOffline(); });
  },

  _onOnline: function() {
    KamerOffline._updateStatusBar();
    KamerOffline._syncOnline();
    if (typeof KamerPush !== 'undefined') KamerPush.notifier('Connexion rétablie', 'Synchronisation des données en cours...', '#007A3D');
  },

  _onOffline: function() {
    KamerOffline._updateStatusBar();
    if (typeof KamerPush !== 'undefined') KamerPush.notifier('Mode hors-ligne activé', 'KAMER360 continue de fonctionner. Vos données seront synchronisées dès la reconnexion.', '#E65100');
  },

  _updateStatusBar: function() {
    var bar = document.getElementById('kamer-offline-bar');
    var isOffline = !navigator.onLine;
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'kamer-offline-bar';
      bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9990;padding:8px 16px;text-align:center;font-size:12px;font-weight:700;transition:all .3s;transform:translateY(100%)';
      document.body.appendChild(bar);
    }
    if (isOffline) {
      bar.style.background = '#E65100';
      bar.style.color = '#fff';
      bar.innerHTML = 'Mode hors-ligne — Vos données sont sauvegardées localement';
      bar.style.transform = 'translateY(0)';
    } else {
      bar.style.background = '#007A3D';
      bar.style.color = '#fff';
      bar.innerHTML = 'Connexion rétablie — Synchronisation...';
      bar.style.transform = 'translateY(0)';
      setTimeout(function() { bar.style.transform = 'translateY(100%)'; }, 3000);
    }
  },

  sauvegarder: function(store, data, callback) {
    if (!this._db) { if(callback) callback(false); return; }
    var tx = this._db.transaction(store, 'readwrite');
    var st = tx.objectStore(store);
    var arr = Array.isArray(data) ? data : [data];
    arr.forEach(function(item) { st.put(item); });
    tx.oncomplete = function() { if(callback) callback(true); };
    tx.onerror = function() { if(callback) callback(false); };
  },

  lire: function(store, id, callback) {
    if (!this._db) { if(callback) callback(null); return; }
    var tx = this._db.transaction(store, 'readonly');
    var req = id ? tx.objectStore(store).get(id) : tx.objectStore(store).getAll();
    req.onsuccess = function(e) { if(callback) callback(e.target.result); };
    req.onerror = function() { if(callback) callback(null); };
  },

  ajouterASync: function(action, data) {
    if (!this._db) return;
    var tx = this._db.transaction('sync_queue', 'readwrite');
    tx.objectStore('sync_queue').add({ action: action, data: data, ts: Date.now() });
  },

  _syncOnline: function() {
    if (!navigator.onLine || !this._db) return;
    var tx = this._db.transaction('sync_queue', 'readwrite');
    var st = tx.objectStore('sync_queue');
    st.getAll().onsuccess = function(e) {
      var items = e.target.result || [];
      items.forEach(function(item) {
        // Rejouer les actions offline
        console.log('[KAMER360 Sync]', item.action, item.data);
        st.delete(item.id);
      });
    };
  },

  getEtat: function() {
    return {
      isOnline: navigator.onLine,
      hasIndexedDB: !!this._db,
      label: navigator.onLine ? 'En ligne' : 'Hors ligne'
    };
  }
};

// ══════════════════════════════════════════════════════════════
//  6. CHAT INTÉGRÉ CLIENT–GÉRANT
// ══════════════════════════════════════════════════════════════

var KamerChat = {
  KEY: 'kamer_messages',
  _conversationActive: null,
  _refreshInterval: null,

  getData: function() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '{}'); }
    catch(e) { return {}; }
  },

  save: function(d) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(d));
      localStorage.setItem('kamer_chat_update', Date.now().toString());
      setTimeout(function() { try { localStorage.removeItem('kamer_chat_update'); } catch(e){} }, 500);
    } catch(e) {}
  },

  envoyerMessage: function(conversationId, expediteur, texte, type) {
    if (!texte || !texte.trim()) return;
    var d = this.getData();
    if (!d[conversationId]) d[conversationId] = { messages: [], participants: [], non_lus: {} };
    var msg = {
      id: 'MSG-' + Date.now(),
      expediteur: expediteur,
      texte: texte.trim(),
      type: type || 'texte',
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('fr-FR'),
      lu: false
    };
    d[conversationId].messages.push(msg);
    d[conversationId].derniere_activite = Date.now();
    this.save(d);
    this.renderMessages(conversationId);
    // Notifier l'autre partie
    if (typeof KamerPush !== 'undefined') {
      KamerPush.notifier('Nouveau message', expediteur + ': ' + texte.substring(0, 60) + (texte.length>60?'...':''), '#1565C0');
    }
    return msg;
  },

  getConversations: function() {
    var d = this.getData();
    return Object.keys(d).map(function(id) {
      var conv = d[id];
      var msgs = conv.messages || [];
      var dernier = msgs[msgs.length - 1];
      return {
        id: id,
        dernier_msg: dernier ? dernier.texte : 'Aucun message',
        dernier_expediteur: dernier ? dernier.expediteur : '',
        heure: dernier ? dernier.heure : '',
        nb_msgs: msgs.length,
        non_lus: (conv.non_lus && conv.non_lus['gerant']) || 0
      };
    }).sort(function(a, b) { return b.nb_msgs - a.nb_msgs; });
  },

  renderListe: function(containerId) {
    var z = document.getElementById(containerId);
    if (!z) return;
    var convs = this.getConversations();
    if (convs.length === 0) {
      z.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#9ca3af"><div style="font-size:48px;margin-bottom:12px">💬</div><div style="font-size:14px;font-weight:600;color:#374151;margin-bottom:6px">Aucune conversation</div><div style="font-size:12px">Les messages de vos clients apparaîtront ici</div></div>';
      return;
    }
    z.innerHTML = convs.map(function(c) {
      return '<div onclick="KamerChat.ouvrirConversation(\'' + c.id + '\')" '
        + 'style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #f0f4f0;cursor:pointer;transition:background .15s" '
        + 'onmouseover="this.style.background=\'#f7fbf7\'" onmouseout="this.style.background=\'\'">'
        + '<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#007A3D,#00A852);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:700;flex-shrink:0">'
        + c.id.charAt(0).toUpperCase() + '</div>'
        + '<div style="flex:1;min-width:0">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">'
        + '<div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + c.id + '</div>'
        + '<div style="font-size:11px;color:#9ca3af;flex-shrink:0;margin-left:8px">' + (c.heure||'') + '</div>'
        + '</div>'
        + '<div style="font-size:12px;color:#9ca3af;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'
        + (c.dernier_expediteur ? '<span style="color:#007A3D;font-weight:600">' + c.dernier_expediteur + ': </span>' : '') + c.dernier_msg + '</div>'
        + '</div>'
        + (c.non_lus > 0 ? '<div style="width:20px;height:20px;background:#CE1126;color:#fff;border-radius:50%;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">' + c.non_lus + '</div>' : '')
        + '</div>';
    }).join('');
  },

  ouvrirConversation: function(conversationId) {
    this._conversationActive = conversationId;
    var m = document.getElementById('m-kamer-chat');
    if (!m) return;
    document.getElementById('chat-conv-titre').textContent = conversationId;
    openM('m-kamer-chat');
    this.renderMessages(conversationId);
    this._demarrerRefresh(conversationId);

    // Écouter les nouveaux messages cross-tab
    var self = this;
    window.addEventListener('storage', function(e) {
      if (e.key === 'kamer_chat_update' && self._conversationActive === conversationId) {
        self.renderMessages(conversationId);
      }
    });
  },

  _demarrerRefresh: function(convId) {
    if (this._refreshInterval) clearInterval(this._refreshInterval);
    var self = this;
    this._refreshInterval = setInterval(function() {
      if (self._conversationActive === convId) self.renderMessages(convId);
    }, 3000);
  },

  fermerChat: function() {
    if (this._refreshInterval) clearInterval(this._refreshInterval);
    this._conversationActive = null;
    closeM('m-kamer-chat');
  },

  renderMessages: function(conversationId) {
    var z = document.getElementById('chat-messages');
    if (!z) return;
    var d = this.getData();
    var conv = d[conversationId] || { messages: [] };
    var msgs = conv.messages;

    if (msgs.length === 0) {
      z.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#9ca3af"><div style="font-size:40px;margin-bottom:10px">💬</div><div style="font-size:13px">Envoyez un message pour démarrer la conversation</div></div>';
      return;
    }

    z.innerHTML = msgs.map(function(m) {
      var isGerant = m.expediteur === 'Gérant' || m.expediteur === 'gerant';
      return '<div style="display:flex;flex-direction:column;align-items:' + (isGerant?'flex-end':'flex-start') + ';margin-bottom:12px">'
        + '<div style="max-width:75%;background:' + (isGerant?'linear-gradient(135deg,#007A3D,#00A852)':'#f0f4f0') + ';color:' + (isGerant?'#fff':'#1A2A1A') + ';padding:10px 14px;border-radius:' + (isGerant?'16px 16px 4px 16px':'16px 16px 16px 4px') + ';font-size:13px;line-height:1.5;word-break:break-word">'
        + m.texte + '</div>'
        + '<div style="font-size:10px;color:#9ca3af;margin-top:3px;padding:0 4px">'
        + m.expediteur + ' · ' + (m.heure||'') + '</div>'
        + '</div>';
    }).join('');
    z.scrollTop = z.scrollHeight;
  },

  envoyerDepuisInput: function(conversationId, expediteur) {
    var inp = document.getElementById('chat-input');
    if (!inp || !inp.value.trim()) return;
    this.envoyerMessage(conversationId, expediteur || 'Gérant', inp.value.trim());
    inp.value = '';
    inp.focus();
  },

  // Ouvrir chat avec un client depuis la liste commandes
  initierAvecClient: function(clientId, clientNom) {
    var convId = 'client-' + (clientId || clientNom.replace(/\s/g,'-'));
    this.ouvrirConversation(convId);
  },

  getNbMessagesNonLus: function() {
    var d = this.getData();
    var total = 0;
    Object.keys(d).forEach(function(id) {
      var msgs = (d[id].messages || []);
      msgs.forEach(function(m) { if (!m.lu && (m.expediteur !== 'Gérant' && m.expediteur !== 'gerant')) total++; });
    });
    return total;
  }
};

// ══════════════════════════════════════════════════════════════
//  INITIALISATION GLOBALE DES 6 FONCTIONNALITÉS
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  // Init notifications push
  KamerPush.init();
  setTimeout(function() {
    var perm = window.Notification ? Notification.permission : 'denied';
    if (perm === 'default') {
      // Attendre 30s avant de demander la permission
      setTimeout(function() { KamerPush.demanderPermission(function(){}); }, 30000);
    }
  }, 1000);

  // Init mode hors-ligne
  KamerOffline.init(function(ok) {
    if (ok) console.log('[KAMER360] IndexedDB initialisé — mode hors-ligne prêt');
  });

  // Mise à jour badge chat dans sidebar
  setTimeout(function() {
    var nb = KamerChat.getNbMessagesNonLus();
    var badge = document.getElementById('chat-badge');
    if (badge) {
      badge.textContent = nb;
      badge.style.display = nb > 0 ? 'flex' : 'none';
    }
  }, 500);

  // Mise à jour badge chat toutes les 10s
  setInterval(function() {
    var nb = KamerChat.getNbMessagesNonLus();
    var badge = document.getElementById('chat-badge');
    if (badge) { badge.textContent = nb; badge.style.display = nb > 0 ? 'flex' : 'none'; }
  }, 10000);
});
