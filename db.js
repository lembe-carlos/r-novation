// ═══════════════════════════════════════════════════════════
//  SuperMarché CM — db.js
//  Couche base de données Supabase
//  Gère : commandes, produits, notifications
// ═══════════════════════════════════════════════════════════

var DB = (function() {

  // ── Client Supabase (chargé dynamiquement) ──
  var _supabase = null;

  function getClient() {
    if (_supabase) return _supabase;
    if (!SM_CONFIG.supabase.active) return null;
    if (typeof window.supabase === 'undefined') {
      console.warn('Supabase SDK non chargé');
      return null;
    }
    _supabase = window.supabase.createClient(
      SM_CONFIG.supabase.url,
      SM_CONFIG.supabase.key
    );
    return _supabase;
  }

  // ════════════════════════════════════════
  //  COMMANDES
  // ════════════════════════════════════════

  async function sauvegarderCommande(commande) {
    // Toujours sauvegarder dans localStorage (backup local)
    try {
      var local = JSON.parse(localStorage.getItem('sm_commandes') || '[]');
      local.unshift(commande);
      localStorage.setItem('sm_commandes', JSON.stringify(local));
    } catch(e) {}

    // Sauvegarder dans Supabase si actif
    var client = getClient();
    if (!client) return { ok: true, source: 'local' };

    try {
      var { data, error } = await client
        .from('commandes')
        .insert([{
          id:          commande.id,
          date:        commande.date,
          client:      commande.client,
          tel:         commande.tel,
          ville:       commande.ville || '',
          adresse:     commande.adresse || '',
          supermarche: commande.supermarche || '',
          paiement:    commande.paiement || '',
          statut:      commande.statut || 'en_attente',
          items:       commande.items,
          sous_total:  commande.sous_total || 0,
          livraison:   commande.livraison || 0,
          total:       commande.total || 0,
          notes:       commande.notes || '',
          source:      commande.source || 'boutique_en_ligne'
        }]);

      if (error) throw error;
      console.log('Commande sauvegardée dans Supabase :', commande.id);
      return { ok: true, source: 'supabase', data: data };
    } catch(e) {
      console.error('Erreur Supabase:', e);
      return { ok: true, source: 'local', error: e.message };
    }
  }

  async function chargerCommandes() {
    var client = getClient();
    if (!client) {
      // Fallback : localStorage
      try {
        return JSON.parse(localStorage.getItem('sm_commandes') || '[]');
      } catch(e) { return []; }
    }

    try {
      var { data, error } = await client
        .from('commandes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data || [];
    } catch(e) {
      console.error('Erreur chargement commandes:', e);
      try { return JSON.parse(localStorage.getItem('sm_commandes') || '[]'); }
      catch(e2) { return []; }
    }
  }

  async function mettreAJourStatut(cmdId, nouveauStatut) {
    // Mise à jour locale
    try {
      var local = JSON.parse(localStorage.getItem('sm_commandes') || '[]');
      var idx = local.findIndex(function(c){ return c.id === cmdId; });
      if (idx !== -1) { local[idx].statut = nouveauStatut; }
      localStorage.setItem('sm_commandes', JSON.stringify(local));
    } catch(e) {}

    // Mise à jour Supabase
    var client = getClient();
    if (!client) return { ok: true };

    try {
      var { error } = await client
        .from('commandes')
        .update({ statut: nouveauStatut })
        .eq('id', cmdId);
      if (error) throw error;
      return { ok: true };
    } catch(e) {
      console.error('Erreur MAJ statut:', e);
      return { ok: false, error: e.message };
    }
  }

  // ════════════════════════════════════════
  //  PRODUITS
  // ════════════════════════════════════════

  async function chargerProduits() {
    var client = getClient();
    if (!client) return null; // Utilise les produits locaux

    try {
      var { data, error } = await client
        .from('produits')
        .select('*')
        .eq('actif', true)
        .order('nom');
      if (error) throw error;
      return data;
    } catch(e) {
      console.error('Erreur chargement produits:', e);
      return null;
    }
  }

  async function mettreAJourStock(prodId, nouveauStock) {
    var client = getClient();
    if (!client) return { ok: true };

    try {
      var { error } = await client
        .from('produits')
        .update({ stock: nouveauStock })
        .eq('id', prodId);
      if (error) throw error;
      return { ok: true };
    } catch(e) {
      return { ok: false, error: e.message };
    }
  }

  async function ajouterProduit(produit) {
    var client = getClient();
    if (!client) return { ok: true };

    try {
      var { data, error } = await client
        .from('produits')
        .insert([produit]);
      if (error) throw error;
      return { ok: true, data: data };
    } catch(e) {
      return { ok: false, error: e.message };
    }
  }

  // ════════════════════════════════════════
  //  NOTIFICATIONS TEMPS RÉEL
  // ════════════════════════════════════════

  function ecouterNouvellesCommandes(callback) {
    var client = getClient();
    if (!client) return null;

    var channel = client
      .channel('commandes-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'commandes'
      }, function(payload) {
        console.log('Nouvelle commande reçue :', payload.new);
        if (callback) callback(payload.new);
      })
      .subscribe();

    return channel;
  }

  // ════════════════════════════════════════
  //  STATISTIQUES
  // ════════════════════════════════════════

  async function getStats() {
    var client = getClient();
    if (!client) return null;

    try {
      var today = new Date().toISOString().split('T')[0];

      var { data: allCmds } = await client
        .from('commandes')
        .select('total, statut, created_at')
        .neq('statut', 'annulee');

      if (!allCmds) return null;

      var totalCA = allCmds.reduce(function(s, c){ return s + (c.total||0); }, 0);
      var nbCmds  = allCmds.length;
      var livrees = allCmds.filter(function(c){ return c.statut === 'livree'; }).length;

      return { totalCA: totalCA, nbCmds: nbCmds, livrees: livrees };
    } catch(e) {
      return null;
    }
  }

  // API publique
  return {
    sauvegarderCommande:    sauvegarderCommande,
    chargerCommandes:       chargerCommandes,
    mettreAJourStatut:      mettreAJourStatut,
    chargerProduits:        chargerProduits,
    mettreAJourStock:       mettreAJourStock,
    ajouterProduit:         ajouterProduit,
    ecouterNouvellesCommandes: ecouterNouvellesCommandes,
    getStats:               getStats,
    estActif: function()    { return SM_CONFIG.supabase.active; }
  };

})();
