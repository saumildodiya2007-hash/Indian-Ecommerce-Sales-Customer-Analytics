# Limitations and Assumptions

## The data is synthetic
All results come from a simulated dataset made with Python, Pandas, NumPy and Faker. It is **not** actual company transaction data and **must not** be quoted as real Indian e-commerce market statistics. The project demonstrates analytical method, not market facts.

Signs of simulation visible in the data: 2025 has 74% more orders than 2023 or 2024 while average order value stays flat; one product earns about 21% of item revenue; Electronics is about 50% of item revenue.

## Assumptions
- Total revenue means the sum of `orders.final_amount` for all orders (including Failed, Cancelled and Returned) so it matches the Power BI card; a Delivered-only figure is shown next to it.
- A purchase means any order that is not Failed (this matches the customer table's own definition).
- A return rate uses orders with at least one return record divided by Delivered plus Returned orders.
- Late delivery is measured only for shipments with status Delivered.
- Geography for orders uses the delivery state/city; for customers it uses the registered state (93.6% of orders match).
- "New customer in a year" means the year of the customer's first non-Failed order. 2023 "new" is not meaningful for business conclusions because data starts in 2023.

## Resolved discrepancies
1. **97,120 vs 1,00,000 orders:** the 2,880 difference equals the number of Failed orders exactly. The customer table and the earlier EDA exclude them.
2. **Revenue gap between EDA and Power BI:** repeat ₹241.05 Cr + one-time ₹9.03 Cr = ₹250.08 Cr; Power BI total ₹257.26 Cr minus Failed orders ₹7.18 Cr = ₹250.08 Cr.

## Unresolved discrepancies (reported, not changed)
- 2,458 return records belong to orders whose status is Delivered, and 248 / 98 / 63 belong to Cancelled / Failed / Processing orders.
- 6,681 orders have status Returned, but 9,510 orders have return records.
- Refunded payments total ₹26.87 Cr, but the returns table lists ₹10.59 Cr of refunds. Part of the gap may be refunds on cancelled orders (4,009 cancelled orders have a Refunded payment), but this was not fully reconciled.
- 910 of 87,360 delivered shipments have `delivery_days` different from actual delivery date minus dispatch date (flagged by the source validation report as a warning).

## Limitations
- Dashboard data is pre-aggregated; filters cover month, city/state, status and category only. Customer and product level slicing is not available.
- The Customers KPI and the Customers, Products, Operations and Payments & Marketing pages do not react to the global filters.
- With a category filter, revenue is item revenue (shipping and tax cannot be split by category).
- No customer lifetime value, true marketing ROI, profitability or forecast is claimed. Marketing figures are attributed revenue, not incremental revenue.
- Item profit (₹19.73 Cr, 8.1% of item revenue) includes items on cancelled and returned orders, so it is not a net profit figure.
- A native Power BI `.pbix` was not rebuilt. The Power BI folder gives DAX measures, a theme and a model design to rebuild it.
- Browser testing used Chromium only.
