-- ============================================
-- ADD MISSING COLUMNS TO ORDERS TABLE
-- ============================================

-- Ajouter les colonnes si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'shipping_address'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipping_address TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'shipping_wilaya'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipping_wilaya TEXT;
    END IF;
END $$;
