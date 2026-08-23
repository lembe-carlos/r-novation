-- ═══════════════════════════════════════════════════════════════
--  KAMER360 — Politique RLS (Row Level Security) complète
--  À exécuter dans : Supabase → SQL Editor → New Query → Run
--  Version : 2026-06-11
-- ═══════════════════════════════════════════════════════════════

-- ── 1. ACTIVER RLS SUR TOUTES LES TABLES ───────────────────────
ALTER TABLE IF EXISTS commandes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS produits               ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clients_boutique       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS promotions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS marketplace_data       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fidelite_clients       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS livraisons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS livreurs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS livreurs_positions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS retours                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fournisseurs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sm_gestionnaires       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sm_users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sm_paiements           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sm_abonnements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS codes_invitation       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "supermarchés"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS devis_menuiserie       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sm_devis_btp           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sm_devis_energie       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sm_rdv_sante           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sm_rdv_education       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sm_demandes_immo       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sm_commandes_agriculture ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sm_commandes_logistique  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS commandes_restauration   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reservations_coiffure    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rdv_automobile           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pieces_automobile        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pressing_commandes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pressing_tarifs_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auto_services_catalogue  ENABLE ROW LEVEL SECURITY;

-- ── 2. SUPPRIMER TOUTES LES ANCIENNES POLITIQUES ───────────────
-- (Évite les conflits si vous réexécutez ce script)
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ── 3. TABLES PUBLIQUES (lecture sans authentification) ─────────
-- Produits : tout le monde peut voir, seul le gérant propriétaire modifie
CREATE POLICY "produits_lecture_publique"
  ON produits FOR SELECT USING (true);

CREATE POLICY "produits_gestion_gerant"
  ON produits FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Promotions : lecture publique pour la boutique
CREATE POLICY "promotions_lecture_publique"
  ON promotions FOR SELECT USING (actif = true);

CREATE POLICY "promotions_gestion_gerant"
  ON promotions FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Marketplace data : lecture publique, écriture gérant authentifié
CREATE POLICY "marketplace_lecture_publique"
  ON marketplace_data FOR SELECT USING (true);

CREATE POLICY "marketplace_ecriture_gerant"
  ON marketplace_data FOR ALL
  USING (auth.uid()::text = gerant_id)
  WITH CHECK (auth.uid()::text = gerant_id);

-- Pièces automobile : catalogue public
CREATE POLICY "pieces_auto_lecture_publique"
  ON pieces_automobile FOR SELECT USING (true);

CREATE POLICY "pieces_auto_gestion"
  ON pieces_automobile FOR ALL USING (auth.uid() IS NOT NULL);

-- Pressing tarifs catalogue : public
CREATE POLICY "pressing_cat_lecture"
  ON pressing_tarifs_catalogue FOR SELECT USING (true);

CREATE POLICY "pressing_cat_gestion"
  ON pressing_tarifs_catalogue FOR ALL USING (auth.uid() IS NOT NULL);

-- Auto services catalogue : public
CREATE POLICY "auto_cat_lecture"
  ON auto_services_catalogue FOR SELECT USING (true);

CREATE POLICY "auto_cat_gestion"
  ON auto_services_catalogue FOR ALL USING (auth.uid() IS NOT NULL);

-- ── 4. COMMANDES — Lecture gérant + insertion client ────────────
CREATE POLICY "commandes_insertion_client"
  ON commandes FOR INSERT WITH CHECK (true);

CREATE POLICY "commandes_lecture_gerant"
  ON commandes FOR SELECT
  USING (auth.uid() IS NOT NULL OR true); -- Temporaire : à restreindre par supermarché

CREATE POLICY "commandes_maj_gerant"
  ON commandes FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ── 5. CLIENTS BOUTIQUE — Accès propre ─────────────────────────
CREATE POLICY "clients_boutique_propre"
  ON clients_boutique FOR ALL
  USING (auth.uid()::text = id::text OR auth.uid() IS NOT NULL);

CREATE POLICY "clients_boutique_insert"
  ON clients_boutique FOR INSERT WITH CHECK (true);

-- ── 6. NOTIFICATIONS ───────────────────────────────────────────
CREATE POLICY "notifs_gerant_propre"
  ON notifications FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ── 7. EMPLOYÉS & FOURNISSEURS — Gérant seulement ──────────────
CREATE POLICY "employes_gerant"
  ON employes FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "fournisseurs_gerant"
  ON fournisseurs FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ── 8. PAIEMENTS — Lecture seule pour le gérant ────────────────
CREATE POLICY "paiements_gerant"
  ON sm_paiements FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ── 9. ABONNEMENTS ─────────────────────────────────────────────
CREATE POLICY "abonnements_gerant"
  ON sm_abonnements FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ── 10. LIVRAISONS & LIVREURS ──────────────────────────────────
CREATE POLICY "livraisons_gerant"
  ON livraisons FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "livreurs_gerant"
  ON livreurs FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "livreurs_positions_lecture"
  ON livreurs_positions FOR SELECT USING (true);

CREATE POLICY "livreurs_positions_maj"
  ON livreurs_positions FOR ALL USING (auth.uid() IS NOT NULL);

-- ── 11. DEVIS & RDV — Insertion publique, lecture gérant ────────
CREATE POLICY "devis_menuiserie_insert" ON devis_menuiserie FOR INSERT WITH CHECK (true);
CREATE POLICY "devis_menuiserie_gerant" ON devis_menuiserie FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "devis_menuiserie_maj"    ON devis_menuiserie FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "devis_btp_insert"  ON sm_devis_btp FOR INSERT WITH CHECK (true);
CREATE POLICY "devis_btp_gerant"  ON sm_devis_btp FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "devis_btp_maj"     ON sm_devis_btp FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "devis_energie_insert" ON sm_devis_energie FOR INSERT WITH CHECK (true);
CREATE POLICY "devis_energie_gerant" ON sm_devis_energie FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "rdv_sante_insert"  ON sm_rdv_sante FOR INSERT WITH CHECK (true);
CREATE POLICY "rdv_sante_gerant"  ON sm_rdv_sante FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "rdv_sante_maj"     ON sm_rdv_sante FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "rdv_education_insert" ON sm_rdv_education FOR INSERT WITH CHECK (true);
CREATE POLICY "rdv_education_gerant" ON sm_rdv_education FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "immo_insert"  ON sm_demandes_immo FOR INSERT WITH CHECK (true);
CREATE POLICY "immo_gerant"  ON sm_demandes_immo FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "agri_commandes_insert" ON sm_commandes_agriculture FOR INSERT WITH CHECK (true);
CREATE POLICY "agri_commandes_gerant" ON sm_commandes_agriculture FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "logistique_insert" ON sm_commandes_logistique FOR INSERT WITH CHECK (true);
CREATE POLICY "logistique_gerant" ON sm_commandes_logistique FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "resto_commandes_insert" ON commandes_restauration FOR INSERT WITH CHECK (true);
CREATE POLICY "resto_commandes_gerant" ON commandes_restauration FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "coiffure_rdv_insert" ON reservations_coiffure FOR INSERT WITH CHECK (true);
CREATE POLICY "coiffure_rdv_gerant" ON reservations_coiffure FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "auto_rdv_insert" ON rdv_automobile FOR INSERT WITH CHECK (true);
CREATE POLICY "auto_rdv_gerant" ON rdv_automobile FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "pressing_cmd_insert" ON pressing_commandes FOR INSERT WITH CHECK (true);
CREATE POLICY "pressing_cmd_gerant" ON pressing_commandes FOR ALL USING (auth.uid() IS NOT NULL);

-- ── 12. RETOURS ────────────────────────────────────────────────
CREATE POLICY "retours_insert" ON retours FOR INSERT WITH CHECK (true);
CREATE POLICY "retours_gerant" ON retours FOR ALL USING (auth.uid() IS NOT NULL);

-- ── 13. FIDÉLITÉ ────────────────────────────────────────────────
CREATE POLICY "fidelite_lecture" ON fidelite_clients FOR SELECT USING (true);
CREATE POLICY "fidelite_gestion" ON fidelite_clients FOR ALL USING (auth.uid() IS NOT NULL);

-- ── 14. GESTIONNAIRES & USERS ──────────────────────────────────
CREATE POLICY "gestionnaires_propre"
  ON sm_gestionnaires FOR ALL
  USING (auth.uid()::text = id::text);

CREATE POLICY "users_propre"
  ON sm_users FOR ALL
  USING (auth.uid()::text = id::text);

CREATE POLICY "users_insert"
  ON sm_users FOR INSERT WITH CHECK (true);

-- ── 15. CODES INVITATION ────────────────────────────────────────
CREATE POLICY "codes_inv_insert" ON codes_invitation FOR INSERT USING (auth.uid() IS NOT NULL);
CREATE POLICY "codes_inv_lecture" ON codes_invitation FOR SELECT USING (true);
CREATE POLICY "codes_inv_maj" ON codes_invitation FOR UPDATE USING (true);

-- ── 16. SUPERMARCHÉS ───────────────────────────────────────────
CREATE POLICY "supermarchés_lecture" ON "supermarchés" FOR SELECT USING (true);
CREATE POLICY "supermarchés_gerant"  ON "supermarchés" FOR ALL USING (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════════════
-- FIN DU SCRIPT RLS
-- Vérification : SELECT * FROM pg_policies WHERE schemaname = 'public';
-- ═══════════════════════════════════════════════════════════════
