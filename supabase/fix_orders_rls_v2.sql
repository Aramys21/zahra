-- ============================================
-- FIX ORDERS RLS POLICIES - SIMPLIFIED VERSION
-- ============================================

-- Désactiver RLS temporairement
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view all orders" ON orders;

-- Réactiver RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Créer une politique simple : tous les utilisateurs authentifiés peuvent voir toutes les commandes
CREATE POLICY "Authenticated users can view all orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');

-- Les utilisateurs authentifiés peuvent insérer des commandes
CREATE POLICY "Authenticated users can insert orders" ON orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Les utilisateurs authentifiés peuvent mettre à jour leurs propres commandes
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs authentifiés peuvent supprimer leurs propres commandes
CREATE POLICY "Users can delete own orders" ON orders FOR DELETE USING (auth.uid() = user_id);
