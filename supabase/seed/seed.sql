-- ====================================================================
-- CANDI SUPER STORE PLATFORM: SEED DATA
-- ====================================================================

-- 1. ROLES
insert into public.staff_roles (id, name, description) values
  ('a1000000-0000-0000-0000-000000000001', 'super_admin', 'Full platform operational governance and security control'),
  ('a1000000-0000-0000-0000-000000000002', 'admin_manager', 'Operational administration, customer approvals and delivery zones'),
  ('a1000000-0000-0000-0000-000000000003', 'sales_agent', 'Customer onboarding, order booking and customer relationship management'),
  ('a1000000-0000-0000-0000-000000000004', 'warehouse_manager', 'Inventory control, pick-list issuance, and stock transfers'),
  ('a1000000-0000-0000-0000-000000000005', 'delivery_manager', 'Delivery dispatch, driver manifests, and route clustering'),
  ('a1000000-0000-0000-0000-000000000006', 'accounts_staff', 'Cashier reconciliation, customer khata ledger, and invoicing')
on conflict (name) do nothing;

-- 2. DELIVERY ZONES (Karachi Clusters)
insert into public.delivery_zones (id, name, city, description, is_active, serviceable) values
  ('b1000000-0000-0000-0000-000000000001', 'North Nazimabad & Buffer Zone', 'Karachi', 'Zone 1: Key wholesale hub', true, true),
  ('b1000000-0000-0000-0000-000000000002', 'Gulshan-e-Iqbal & Johar', 'Karachi', 'Zone 2: Dense retail network', true, true),
  ('b1000000-0000-0000-0000-000000000003', 'Saddar & Jodia Bazaar', 'Karachi', 'Zone 3: Central market & sub-wholesalers', true, true),
  ('b1000000-0000-0000-0000-000000000004', 'Korangi & Landhi', 'Karachi', 'Zone 4: Industrial and retail fringe', true, true)
on conflict do nothing;

-- 3. PRODUCTS (Wholesale Confectionery & FMCG)
insert into public.products (sku, name, category, brand, description, base_unit, base_price, retailer_price, sub_wholesaler_price, units_available, reserved_units, is_active) values
  ('CND-CHOC-01', 'Choco Dream Truffle Bites (24x50g)', 'Chocolates & Bars', 'Candi Delights', 'Wholesale carton containing 24 display boxes of rich cocoa chocolate bites.', 'carton', 2800.00, 3100.00, 2900.00, 450, 25, true),
  ('CND-CHOC-02', 'Velvet Caramel Bar Bulk Pack (48 pcs)', 'Chocolates & Bars', 'Candi Delights', 'Smooth milk chocolate with molten caramel center, retail counter display.', 'box', 1450.00, 1600.00, 1500.00, 800, 50, true),
  ('CND-WAF-01', 'Crispy Hazelnut Wafers (36 packets)', 'Biscuits & Wafers', 'Golden Crunch', 'Crisp multi-layered wafer biscuits filled with roasted hazelnut cream.', 'carton', 1950.00, 2200.00, 2050.00, 620, 30, true),
  ('CND-GUM-01', 'Fruity Blast Chewy Candies (100 packets)', 'Candies & Gummies', 'Jolly Pops', 'Assorted fruit chew candies packaged for high-turnover corner retail shops.', 'carton', 1200.00, 1400.00, 1280.00, 1200, 100, true),
  ('CND-FMCG-01', 'Dairy Rich Powdered Milk Sachets (50x25g)', 'Dairy & Beverages', 'Pure Dairy', 'Wholesale bulk box of tea-whitening dairy milk sachets.', 'box', 980.00, 1120.00, 1040.00, 950, 40, true),
  ('CND-JELL-01', 'Sour Berry Gummy Bears Dispenser (12 tubs)', 'Candies & Gummies', 'Jolly Pops', 'High-margin confectionery counter tubs for supermarkets and tuck shops.', 'carton', 3400.00, 3850.00, 3550.00, 300, 15, true)
on conflict (sku) do nothing;

-- 4. SUPPLIERS
insert into public.suppliers (name, contact_person, phone, email, address, city, payment_terms, category) values
  ('National Confectionery Industries Ltd.', 'Sohail Mansoor', '+923218889999', 'procurement@nationalconfectionery.pk', 'Plot 45, Sector 15, Korangi Industrial Area', 'Karachi', 'Net 30', 'Chocolates & Confectionery'),
  ('Golden Wheat Milling & Bakery Supplies', 'Riaz Ul Haq', '+923334445555', 'sales@goldenwheat.pk', '12 Hub River Road, S.I.T.E', 'Karachi', 'Net 15', 'Flour, Wafers & Ingredients'),
  ('FMCG Premier Packaging Group', 'Adnan Sheikh', '+923012223333', 'info@premierpkg.pk', 'Industrial Estate Phase 2', 'Hub', 'Cash on Delivery', 'Cartons & Flexible Packaging')
on conflict do nothing;
