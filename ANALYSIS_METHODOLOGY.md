# Analysis Methodology

## 1. Data generation and collection approach
The dataset is **synthetic**. It was generated with Python (Pandas, NumPy, Faker) as nine CSV tables covering January 2023 to December 2025. No real company or customer data was used. The generator is not part of this repository; the dashboard uses the exported CSVs. The `raw_data/` folder is intentionally empty in the repository (see its README).

## 2. Data understanding
Every table was loaded and profiled: row counts, column types, key columns, nulls and value ranges. The supplied `data_dictionary.csv`, `validation_report.csv`, `table_inventory.csv`, `null_summary.csv` and `export_manifest.csv` were compared with what the files actually contain.

| Table | Rows |
|---|---|
| customers | 25,000 |
| orders | 1,00,000 |
| order_items | 2,54,331 |
| products | 550 |
| payments | 1,00,000 |
| shipments | 89,681 |
| returns | 12,075 |
| customer_reviews | 77,530 |
| marketing_campaigns | 151 |

(The exact counts differ slightly from the approximate figures in the earlier project brief, so the actual file counts are used everywhere.)

## 3. Data cleaning and validation
No rows were deleted and no missing values were invented. Source data is unchanged. Checks performed:
- Primary keys unique in all nine tables; no duplicate rows.
- Every foreign key resolves (0 orphans), including orders to customers and order_items to products.
- Formula checks: item_revenue = quantity x unit_price x (1 - discount); order subtotal = sum of item revenue; final_amount = subtotal + shipping + tax (all 0 mismatches).
- Missing values exist only where meaningful: campaign_id (82.8% of orders have no campaign), coupon_code (33.7%), last_order_date and actual_delivery_date for non-delivered cases.
- Order dates run from 2023-01-01 to 2025-12-31.
- Known data issues are listed in `LIMITATIONS_AND_ASSUMPTIONS.md` and are reported, not silently fixed.

## 4. Exploratory data analysis
Status mix (Delivered 80.7%, Cancelled 8.1%, Returned 6.7%, Failed 2.9%, Processing 1.7%), yearly and monthly trends, category and product concentration, customer frequency, geography, delivery and return patterns, payments and campaign tagging were explored with Pandas.

## 5. Business questions
See `PROJECT_OBJECTIVES.md`.

## 6. Analytical techniques
Descriptive aggregation, grouping by month, quarter, year, state, city, category and status; share-of-total and concentration (top 10% of buyers); simple rate calculations; year-over-year comparison; reconciliation of totals between sources. No predictive modelling was used.

## 7. Dashboard development
1. A Python script (`dashboard/src/build_data.py`) reads the CSVs and writes compact summaries to `dashboard/data/data.js`.
2. A JavaScript app (`dashboard/assets/app.js`) with Chart.js draws 8 pages (7 analysis sections plus an executive summary).
3. Filters (month range, state, city, category, order status) work on Overview, Sales and Geography using a pre-aggregated cube:
   - **Order cube**: month x city x status giving order count and final_amount (no joins, so no double counting).
   - **Item cube**: month x city x status x category giving distinct orders, item revenue and quantity (built from order_items).
4. Other pages show full-period results and say so.
5. The page was tested in a headless Chromium browser (see below).

## 8. KPI calculations
| KPI | Definition |
|---|---|
| Total revenue | Sum of orders.final_amount, all statuses (matches Power BI card). With a category filter it becomes item revenue for that category. |
| Delivered revenue | Same, status = Delivered only |
| Total orders | Distinct order_id (order_id is unique) |
| Average order value | Total revenue / total orders |
| Purchasing customer | Customer with at least one non-Failed order |
| Repeat / one-time | 2 or more / exactly 1 non-Failed orders |
| Return rate | Orders with at least one return record / orders with status Delivered or Returned (9,510 / 87,360 = 10.9%) |
| Late delivery | actual_delivery_date later than expected_delivery_date, among shipments with status Delivered |
| Attributed revenue | final_amount of orders carrying a campaign_id (not incremental revenue) |

## 9. Testing performed
Headless Chromium (Playwright) loaded the dashboard, applied filters and compared KPI cards with Pandas results: default totals, Maharashtra + Delivered (₹29.10 Cr, 11,388 orders), Electronics (₹122.36 Cr item revenue, 23,018 orders), calendar 2025 (₹119.38 Cr, 46,520 orders) and Mumbai (₹12.32 Cr, 4,803 orders) all matched. All 8 pages drew all their charts with no console errors or failed requests, and there was no horizontal scroll at desktop or 390 px mobile width. Testing was done in one browser engine (Chromium) only.
