-- ============================================
-- FIX ORDERS RLS POLICIES FOR ADMIN
-- ============================================

-- Supprimer les politiques existantes sur orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;

-- Créer de nouvelles politiques
-- Les utilisateurs peuvent voir leurs propres commandes
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

-- Le service role peut gérer toutes les commandes
CREATE POLICY "Service role can manage orders" ON orders FOR ALL USING (auth.role() = 'service_role');

-- Permettre à tous les utilisateurs authentifiés de voir toutes les commandes (pour l'admin)
CREATE POLICY "Authenticated users can view all orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
