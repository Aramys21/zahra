-- ============================================
-- ADD ORDER_ITEMS TABLE
-- ============================================

-- Table order_items pour stocker les produits de chaque commande
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    product_price NUMERIC NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Service role can manage order items" ON order_items;

-- Policies for order_items
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM orders WHERE orders.id = order_items.order_id)
);
CREATE POLICY "Service role can manage order items" ON order_items FOR ALL USING (auth.role() = 'service_role');
