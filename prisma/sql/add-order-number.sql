-- Ajoute orders.order_number (numéro public aléatoire "MC-XXXXXX") et remplit les commandes existantes.
-- Idempotent : peut être relancé sans danger. À exécuter AVANT de déployer le code qui l'utilise.
--   psql "$DATABASE_URL" -f prisma/sql/add-order-number.sql
--   ou : npx prisma db execute --file prisma/sql/add-order-number.sql --schema prisma/schema.prisma
-- (L'historique prisma/migrations est une migration MySQL : inutilisable sur ce PostgreSQL.)
BEGIN;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(20);

-- Même alphabet que src/lib/order-number.ts (sans I, L, O, 0, 1)
CREATE OR REPLACE FUNCTION pg_temp.gen_order_number() RETURNS text AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  res text := 'MC-';
  i int;
BEGIN
  FOR i IN 1..6 LOOP
    res := res || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  END LOOP;
  RETURN res;
END
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  r record;
  n text;
BEGIN
  FOR r IN SELECT id FROM orders WHERE order_number IS NULL ORDER BY id LOOP
    LOOP
      n := pg_temp.gen_order_number();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM orders WHERE order_number = n);
    END LOOP;
    UPDATE orders SET order_number = n WHERE id = r.id;
  END LOOP;
END
$$;

ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_key ON orders (order_number);

COMMIT;
