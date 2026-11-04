# Indian E-Commerce Sales & Customer Analytics (synthetic data)
All data is synthetic (Python/Faker). Do not present as real market statistics.

## Files
- dashboard/index.html – standalone dashboard (open in any browser, data embedded, needs internet only for Chart.js from cdnjs)
- dashboard/build_data.py – rebuilds the summary data from the CSVs
- powerbi/measures.dax, powerbi/theme.json – Power BI handover

## Audit findings (from the real CSVs)
- All 9 tables read. PKs unique, no orphan keys, no duplicate rows. Row counts: customers 25,000; orders 100,000; order_items 254,331; products 550; payments 100,000; shipments 89,681; returns 12,075; reviews 77,530; campaigns 151.
- 2,880 order gap = Failed orders exactly (97,120 valid + 2,880 failed = 100,000). Customer table total_orders and earlier EDA exclude Failed.
- Revenue: all orders ₹2,572,592,369 (your Power BI cards: 2.57bn, AOV 25.73K, confirmed). Excluding Failed ₹2,500,777,756 (= repeat 2,410,522,335 + one-time 90,255,421). Delivered only ₹2,084,310,000.
- Order subtotal = sum of item_revenue (₹2.4499bn); final_amount = subtotal + shipping + tax.
- Payments and shipments: one row per order max (shipments missing for Cancelled/Failed/Processing). Returns (max 5) and reviews (max 5) are many per order.
- Issues: 2,458 return records sit on orders with status Delivered; 6,681 Returned-status orders vs 9,510 orders with returns; payment refunds (₹26.9 Cr) are far above return-table refunds (₹10.6 Cr); 910 delivery_days differ from dates; one product = 21% of item revenue; 2025 orders +74% vs 2024.
- 120 customers have only Failed orders.

## Power BI model (star-like)
customers 1→* orders; orders 1→* order_items; products 1→* order_items; orders 1→1 payments; orders 1→1 shipments (optional); orders 1→* returns; orders 1→* customer_reviews; marketing_campaigns 1→* orders. Single direction (one side filters many). Add a Date table related to orders[order_date]. Keep Customers→Returns/Reviews and Products→Returns/Reviews inactive or remove them (they create ambiguous paths); filter returns/reviews through orders. Use order_items for category/product measures, never orders[final_amount].
