// ═══════════════════════════════════════════════════════════
//  SuperMarché CM — paiement.js
//  Intégration paiements CinetPay + SMS Africa's Talking
// ═══════════════════════════════════════════════════════════

var PAIEMENT = (function() {

  // ════════════════════════════════════════
  //  CINETPAY — Paiement Mobile Money
  //  Accepte : MTN, Orange, Airtel, Moov
  // ════════════════════════════════════════

  function initierPaiementCinetPay(commande, onSuccess, onError) {
    if (!SM_CONFIG.cinetpay.active) {
      // Mode simulation si CinetPay non configuré
      simulerPaiement(commande, onSuccess);
      return;
    }

    // Charger le SDK CinetPay si pas encore chargé
    if (typeof CinetPay === 'undefined') {
      var script = document.createElement('script');
      script.src = 'https://cdn.cinetpay.com/seamless/main.js';
      script.onload = function() { lancerCheckoutCinetPay(commande, onSuccess, onError); };
      script.onerror = function() {
        console.error('CinetPay SDK non chargé');
        simulerPaiement(commande, onSuccess);
      };
      document.head.appendChild(script);
    } else {
      lancerCheckoutCinetPay(commande, onSuccess, onError);
    }
  }

  function lancerCheckoutCinetPay(commande, onSuccess, onError) {
    var config = SM_CONFIG.cinetpay;
    var boutique = SM_CONFIG.boutique;

    CinetPay.setConfig({
      apikey:      config.apikey,
      site_id:     config.site_id,
      notify_url:  config.notify_url,
      return_url:  window.location.href,
      mode:        'PRODUCTION'  // Changer en 'TEST' pour les tests
    });

    CinetPay.getCheckout({
      transaction_id:  commande.id,
      amount:          commande.total,
      currency:        boutique.currency,   // XAF
      channels:        'MOBILE_MONEY',       // MTN, Orange, etc.
      description:     'Commande ' + commande.id + ' — ' + boutique.nom,
      customer_name:   commande.client,
      customer_surname: '',
      customer_phone_number: commande.tel,
      customer_email:  commande.email || 'client@supermarche.cm',
      customer_address: commande.adresse || '',
      customer_city:   commande.ville || 'Yaoundé',
      customer_country: boutique.pays,      // CM
      customer_state:  boutique.pays,
      customer_zip_code: '00000',
      metadata:        JSON.stringify({ commande_id: commande.id })
    });

    CinetPay.waitResponse(function(data) {
      if (data.status === 'ACCEPTED') {
        console.log('Paiement accepté :', data);
        if (onSuccess) onSuccess({ transaction_id: data.transaction_id, data: data });
      } else {
        console.warn('Paiement refusé :', data);
        if (onError) onError(data.message || 'Paiement refusé');
      }
    });

    CinetPay.onError(function(data) {
      console.error('Erreur CinetPay :', data);
      if (onError) onError('Erreur de paiement. Veuillez réessayer.');
    });
  }

  // ── Simulation paiement (mode démo sans CinetPay) ──
  function simulerPaiement(commande, onSuccess) {
    console.log('Mode simulation — paiement CinetPay non configuré');
    // Simule un délai de traitement
    setTimeout(function() {
      if (onSuccess) onSuccess({
        transaction_id: 'SIM-' + Date.now(),
        simule: true,
        message: 'Simulation paiement réussie'
      });
    }, 1500);
  }

  // ── Vérifier statut paiement (webhook / polling) ──
  async function verifierStatutPaiement(transactionId) {
    if (!SM_CONFIG.cinetpay.active) return { statut: 'simule' };

    try {
      var response = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apikey:         SM_CONFIG.cinetpay.apikey,
          site_id:        SM_CONFIG.cinetpay.site_id,
          transaction_id: transactionId
        })
      });
      var data = await response.json();
      return data;
    } catch(e) {
      console.error('Erreur vérification paiement:', e);
      return { statut: 'erreur', message: e.message };
    }
  }

  // ════════════════════════════════════════
  //  AFRICA'S TALKING — SMS automatiques
  // ════════════════════════════════════════

  async function envoyerSMS(telephone, message) {
    if (!SM_CONFIG.africastalking.active) {
      console.log('SMS (simulation) → ' + telephone + ' : ' + message);
      return { ok: true, simule: true };
    }

    // Africa's Talking nécessite un backend pour masquer la clé API
    // En production, appelez votre propre endpoint serveur
    try {
      var response = await fetch('/api/sms', {  // Votre endpoint backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to:      telephone,
          message: message,
          from:    SM_CONFIG.africastalking.sender
        })
      });
      var data = await response.json();
      return { ok: true, data: data };
    } catch(e) {
      console.error('Erreur envoi SMS:', e);
      return { ok: false, error: e.message };
    }
  }

  // ── Messages SMS types ──
  function smsConfirmationClient(commande) {
    return (
      'SuperMarché CM\n' +
      'Commande ' + commande.id + ' confirmée !\n' +
      'Montant : ' + commande.total.toLocaleString('fr-FR') + ' FCFA\n' +
      'Livraison : ' + (commande.ville || 'À confirmer') + '\n' +
      'Suivi : +237 683 39 22 68\n' +
      'Merci de nous faire confiance !'
    );
  }

  function smsNouvelleCommandeGerant(commande) {
    return (
      'SuperMarché CM — NOUVELLE COMMANDE\n' +
      'N° : ' + commande.id + '\n' +
      'Client : ' + commande.client + '\n' +
      'Tél : ' + commande.tel + '\n' +
      'Total : ' + commande.total.toLocaleString('fr-FR') + ' FCFA\n' +
      'Paiement : ' + (commande.paiement || 'À définir')
    );
  }

  function smsLivraisonEnRoute(commande) {
    return (
      'SuperMarché CM\n' +
      'Votre commande ' + commande.id + ' est en route !\n' +
      'Livraison prévue dans 30 à 60 min.\n' +
      'Contact livreur : +237 693 59 14 79'
    );
  }

  function smsLivraisonEffectuee(commande) {
    return (
      'SuperMarché CM\n' +
      'Commande ' + commande.id + ' livrée !\n' +
      'Merci de votre confiance.\n' +
      'Notez-nous sur WhatsApp : wa.me/' + SM_CONFIG.boutique.whatsapp
    );
  }

  // ════════════════════════════════════════
  //  WHATSAPP — Notifications automatiques
  // ════════════════════════════════════════

  function whatsappLienClient(commande) {
    // Lien WhatsApp pré-rempli pour le client
    var msg = '<img loading="lazy" src="https://img.icons8.com/ios/16/007A3D/shopping-cart.png" alt="Panier" style="width:14px;height:14px;vertical-align:middle"> *SuperMarché CM*\n\n';
    msg += 'Bonjour ' + commande.client.split(' ')[0] + ' !\n\n';
    msg += '<img loading="lazy" src="https://img.icons8.com/ios/16/007A3D/checkmark.png" alt="OK" style="width:14px;height:14px;vertical-align:middle"> Votre commande *' + commande.id + '* a été enregistrée.\n\n';
    msg += '*Récapitulatif :*\n';
    (commande.items || []).forEach(function(item) {
      msg += '• ' + item.nom + ' × ' + (item.qte || item.qty) + ' = ' +
        ((item.prix * (item.qte || item.qty)).toLocaleString('fr-FR')) + ' FCFA\n';
    });
    msg += '\n*Total : ' + commande.total.toLocaleString('fr-FR') + ' FCFA*\n';
    msg += '*Livraison :* ' + (commande.ville || 'À confirmer') + '\n';
    msg += '*Paiement :* ' + (commande.paiement || 'À définir') + '\n\n';
    msg += 'Nous vous contacterons très bientôt. Merci !';
    return 'https://wa.me/' + SM_CONFIG.boutique.whatsapp + '?text=' + encodeURIComponent(msg);
  }

  async function envoyerNotifWhatsAppAPI(telephone, message) {
    if (!SM_CONFIG.whatsapp.active) {
      console.log('WhatsApp API (simulation) → ' + telephone);
      return { ok: true, simule: true };
    }

    try {
      var telFormate = telephone.replace(/[^0-9]/g, '');
      if (!telFormate.startsWith('237')) telFormate = '237' + telFormate;

      var response = await fetch(
        'https://graph.facebook.com/v18.0/' + SM_CONFIG.whatsapp.phone_number_id + '/messages',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + SM_CONFIG.whatsapp.token,
            'Content-Type':  'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to:      telFormate,
            type:    'text',
            text:    { body: message }
          })
        }
      );
      var data = await response.json();
      return { ok: true, data: data };
    } catch(e) {
      console.error('Erreur WhatsApp API:', e);
      return { ok: false, error: e.message };
    }
  }

  // ════════════════════════════════════════
  //  FONCTION PRINCIPALE — Traiter une commande
  //  Appelée après validation panier client
  // ════════════════════════════════════════

  async function traiterCommande(commande, modePaiement, onSuccess, onError) {

    // ÉTAPE 1 : Sauvegarder dans la base de données
    var saveResult = await DB.sauvegarderCommande(commande);
    console.log('Commande sauvegardée :', saveResult);

    // ÉTAPE 2 : Notifier le gérant par SMS
    var telGerant = SM_CONFIG.boutique.telephone.replace(/[^0-9]/g, '');
    await envoyerSMS(telGerant, smsNouvelleCommandeGerant(commande));

    // ÉTAPE 3 : Selon le mode de paiement
    if (modePaiement === 'especes') {
      // Espèces → confirmation directe
      commande.statut = 'en_attente';
      await DB.sauvegarderCommande(commande);
      // SMS de confirmation au client
      await envoyerSMS(commande.tel, smsConfirmationClient(commande));
      if (onSuccess) onSuccess({ mode: 'especes', commande: commande });

    } else if (modePaiement === 'mtn' || modePaiement === 'orange') {
      // Mobile Money → paiement CinetPay
      initierPaiementCinetPay(
        commande,
        // Succès paiement
        async function(paiementData) {
          commande.statut = 'confirmee';
          commande.transaction_id = paiementData.transaction_id;
          await DB.mettreAJourStatut(commande.id, 'confirmee');
          // SMS confirmation client
          await envoyerSMS(commande.tel, smsConfirmationClient(commande));
          // Notif WhatsApp API
          await envoyerNotifWhatsAppAPI(commande.tel, smsConfirmationClient(commande));
          if (onSuccess) onSuccess({ mode: modePaiement, commande: commande, paiement: paiementData });
        },
        // Échec paiement
        function(erreur) {
          if (onError) onError(erreur);
        }
      );
    }
  }

  // ── Notifier lors du changement de statut commande ──
  async function notifierChangementStatut(commande, nouveauStatut) {
    var msgs = {
      confirmee: smsConfirmationClient(commande),
      livraison: smsLivraisonEnRoute(commande),
      livree:    smsLivraisonEffectuee(commande)
    };
    if (msgs[nouveauStatut]) {
      await envoyerSMS(commande.tel, msgs[nouveauStatut]);
      await envoyerNotifWhatsAppAPI(commande.tel, msgs[nouveauStatut]);
    }
  }

  // API publique
  return {
    initierPaiement:          initierPaiementCinetPay,
    traiterCommande:          traiterCommande,
    verifierStatut:           verifierStatutPaiement,
    envoyerSMS:               envoyerSMS,
    notifierChangementStatut: notifierChangementStatut,
    whatsappLienClient:       whatsappLienClient,
    // Messages SMS pour usage externe
    sms: {
      confirmationClient:   smsConfirmationClient,
      nouvelleCommande:     smsNouvelleCommandeGerant,
      livraisonEnRoute:     smsLivraisonEnRoute,
      livraisonEffectuee:   smsLivraisonEffectuee
    }
  };

})();

// ═══════════════════════════════════════════════════════
//  NOTCHPAY — Paiement abonnements gérants
//  API paiement Mobile Money Cameroun (MTN + Orange)
// ═══════════════════════════════════════════════════════

async function payerAbonnementNotchPay(email, planId, mois) {
  var plan = (typeof PLANS_ABONNEMENT !== 'undefined')
    ? PLANS_ABONNEMENT.find(function(p){ return p.id === planId; })
    : null;
  if (!plan) { toast('Plan introuvable', 'error'); return; }

  var montant = plan.prix * (mois || 1);
  var cfg = SM_CONFIG.notchpay;

  // Mode simulation si NotchPay non configuré
  if (!cfg || !cfg.active || !cfg.public_key || cfg.public_key.startsWith('YOUR_')) {
    _simulerPaiementAbo(email, planId, mois, montant, plan.nom);
    return;
  }

  // Appel API NotchPay
  try {
    toast('Initialisation du paiement...', 'info');
    var resp = await fetch('https://api.notchpay.co/payments/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': cfg.public_key
      },
      body: JSON.stringify({
        amount:      montant,
        currency:    'XAF',
        email:       email,
        phone:       '',
        reference:   'ABO-' + Date.now(),
        description: 'Abonnement ' + plan.nom + ' — ' + mois + ' mois — SuperMarché CM',
        callback:    cfg.callback_url
      })
    });

    var data = await resp.json();

    if (data && data.authorization_url) {
      // Ouvrir la page de paiement NotchPay
      window.open(data.authorization_url, '_blank');
      // Écouter le retour (polling)
      _attendreConfirmationNotchPay(data.transaction.reference, email, planId, mois);
    } else {
      console.warn('NotchPay:', data);
      _simulerPaiementAbo(email, planId, mois, montant, plan.nom);
    }
  } catch(e) {
    console.warn('Erreur NotchPay:', e);
    _simulerPaiementAbo(email, planId, mois, montant, plan.nom);
  }
}

function _simulerPaiementAbo(email, planId, mois, montant, nomPlan) {
  // Afficher modal de simulation paiement
  var html = '<div style="text-align:center;padding:20px">'
    + '<div style="font-size:36px;margin-bottom:12px">💳</div>'
    + '<div style="font-weight:800;font-size:16px;margin-bottom:8px">Paiement abonnement</div>'
    + '<div style="font-size:14px;color:#555;margin-bottom:16px">Plan <strong>' + nomPlan + '</strong> — ' + mois + ' mois</div>'
    + '<div style="font-size:24px;font-weight:800;color:#007A3D;margin-bottom:20px">' + montant.toLocaleString('fr-FR') + ' FCFA</div>'
    + '<div style="display:flex;flex-direction:column;gap:10px;max-width:280px;margin:0 auto">'
    + '<button class="btn bp" style="padding:14px;font-size:14px" onclick="_confirmerPaiementAbo(\'' + email + '\',\'' + planId + '\',' + mois + ',\'mtn\')">'
    + '<img loading="lazy" src="https://img.icons8.com/color/20/mtn.png" style="vertical-align:middle;margin-right:6px"> MTN Mobile Money</button>'
    + '<button class="btn bo" style="padding:14px;font-size:14px;border-color:#FF6600;color:#FF6600" onclick="_confirmerPaiementAbo(\'' + email + '\',\'' + planId + '\',' + mois + ',\'orange\')">'
    + '<img loading="lazy" src="https://img.icons8.com/color/20/orange-telecom.png" style="vertical-align:middle;margin-right:6px"> Orange Money</button>'
    + '</div>'
    + '<div style="margin-top:16px;font-size:11px;color:#999">Mode démonstration — NotchPay sera activé en production</div>'
    + '</div>';

  var modal = document.getElementById('m-paiement-abo');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'm-paiement-abo';
    modal.className = 'mo';
    modal.innerHTML = '<div class="mdl" style="max-width:360px">'
      + '<div class="mh"><h3>Paiement Mobile Money</h3>'
      + '<button class="cbtn" onclick="closeM(\'m-paiement-abo\')">X</button></div>'
      + '<div id="paiement-abo-body"></div></div>';
    document.body.appendChild(modal);
  }
  document.getElementById('paiement-abo-body').innerHTML = html;
  openM('m-paiement-abo');
}

function _confirmerPaiementAbo(email, planId, mois, operateur) {
  // Simuler traitement
  var body = document.getElementById('paiement-abo-body');
  if (body) {
    body.innerHTML = '<div style="text-align:center;padding:30px">'
      + '<div style="font-size:36px;margin-bottom:12px">⏳</div>'
      + '<div style="font-weight:600">Traitement en cours...</div>'
      + '<div style="font-size:12px;color:#999;margin-top:8px">Vérification paiement ' + operateur.toUpperCase() + '</div>'
      + '</div>';
  }

  setTimeout(function() {
    // Activer l'abonnement après paiement
    if (typeof activerAbonnement === 'function') activerAbonnement(email, planId, mois);
    // Enregistrer dans l'historique des paiements
    var plan = typeof PLANS_ABONNEMENT !== 'undefined' ? PLANS_ABONNEMENT.find(function(p){ return p.id === planId; }) : null;
    if (typeof enregistrerPaiement === 'function') {
      enregistrerPaiement({ email: email, plan: planId, type: 'abonnement',
        montant: (plan ? plan.prix : 0) * (mois||1), operateur: operateur.toUpperCase(), statut: 'success' });
    }
    closeM('m-paiement-abo');
    if (typeof renderAbonnements === 'function') renderAbonnements();
    var plan = typeof PLANS_ABONNEMENT !== 'undefined'
      ? PLANS_ABONNEMENT.find(function(p){ return p.id === planId; }) : null;
    toast('✅ Abonnement ' + (plan ? plan.nom : planId) + ' activé !', 'success');
    if (typeof addNotif === 'function') addNotif('Paiement reçu : ' + email + ' — ' + (plan ? plan.nom : planId), 'green');
  }, 2000);
}

async function _attendreConfirmationNotchPay(reference, email, planId, mois) {
  // Polling toutes les 5s pendant 2 min
  var tentatives = 0;
  var interval = setInterval(async function() {
    tentatives++;
    if (tentatives > 24) { clearInterval(interval); return; }
    try {
      var cfg = SM_CONFIG.notchpay;
      var resp = await fetch('https://api.notchpay.co/payments/' + reference, {
        headers: { 'Authorization': cfg.public_key }
      });
      var data = await resp.json();
      if (data && data.transaction && data.transaction.status === 'complete') {
        clearInterval(interval);
        if (typeof activerAbonnement === 'function') activerAbonnement(email, planId, mois);
        if (typeof renderAbonnements === 'function') renderAbonnements();
        toast('✅ Paiement confirmé ! Abonnement activé.', 'success');
      }
    } catch(e) {}
  }, 5000);
}
