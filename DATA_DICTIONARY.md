# Data Dictionary

All data is **synthetic** (generated with Python, Pandas, NumPy and Faker). Source: `data_dictionary.csv` shipped with the dataset, plus checks run on the actual CSV files.

## Tables at a glance

| Table | Rows | Columns | Grain (one row =) |
|---|---|---|---|
| `customers` | 25,000 | 19 | one registered customer |
| `orders` | 100,000 | 19 | one order |
| `order_items` | 254,331 | 9 | one product line within an order |
| `products` | 550 | 14 | one product |
| `payments` | 100,000 | 8 | one payment for one order |
| `shipments` | 89,681 | 11 | one shipment for one shipped order |
| `returns` | 12,075 | 8 | one returned item (an order can have up to 5) |
| `customer_reviews` | 77,530 | 8 | one review (an order can have up to 5) |
| `marketing_campaigns` | 151 | 14 | one campaign |

## Relationships (validated on the real data)

| From (one) | To (many) | Key | Notes |
|---|---|---|---|
| customers | orders | customer_id | 0 orphans; 22,820 customers have at least one order |
| orders | order_items | order_id | 2.54 items per order on average |
| products | order_items | product_id | order_items is the only safe grain for product and category revenue |
| orders | payments | order_id | exactly one payment per order |
| orders | shipments | order_id | at most one per order; none for Cancelled, Failed or Processing orders |
| orders | returns | order_id | up to 5 return records per order; 9,510 orders have returns |
| orders | customer_reviews | order_id | up to 5 reviews per order; 54,363 orders have reviews |
| marketing_campaigns | orders | campaign_id | optional; 17,179 orders (17.2%) carry a campaign |

Returns and reviews also carry customer_id and product_id. Use the order link and keep the extra links inactive to avoid ambiguous filter paths and double counting.

## Important metric rules

- `orders.final_amount` = subtotal + shipping_fee + tax_amount. Sum it at **order grain** only.
- `orders.subtotal` = sum of `order_items.item_revenue` for the order (verified, 0 mismatches).
- Category and product revenue must use `order_items.item_revenue` (never join order totals to items).
- `customers.total_orders`, `total_spend` and `average_order_value` **exclude Failed orders**.

## Columns

### customers

| Column | Type | Description | Nullable | Business meaning |
|---|---|---|---|---|
| `customer_id` | string | Unique customer identifier | No | Primary key |
| `customer_signup_date` | date | Date the customer registered | No | Acquisition date |
| `gender` | string | Self-reported gender | No | Demographic |
| `age` | int | Customer age in years | Yes (~1%) | Demographic |
| `age_group` | string | Binned age group | No | Demographic segment |
| `state` | string | Indian state of residence | No | Geography |
| `city` | string | Indian city of residence | No | Geography |
| `pincode_prefix` | int | First 3 digits of postal PIN code (synthetic) | No | Geography proxy |
| `customer_segment` | string | Latent value segment used to drive behavior | No | Marketing segmentation |
| `preferred_device` | string | Most-used shopping device | Yes (~0.5%) | UX analytics |
| `preferred_payment_method` | string | Customer's usual payment method | No | Payments analytics |
| `acquisition_channel` | string | Marketing channel that acquired the customer | No | Marketing attribution |
| `total_orders` | int | Count of non-Failed orders placed (derived) | No | RFM - Frequency |
| `total_spend` | float | Sum of final_amount across non-Failed orders (derived) | No | RFM - Monetary / CLV base |
| `average_order_value` | float | total_spend / total_orders (derived) | No | Spending behavior |
| `last_order_date` | date | Date of most recent non-Failed order (derived) | Yes (never purchased) | RFM - Recency |
| `customer_status` | string | Derived from recency of last_order_date vs 2025-12-31: Active <=90d, At Risk <=180d, Churned >180d, Never Purchased if 0 orders | No | Churn label |
| `loyalty_tier` | string | Derived from total_spend quartile among purchasers | No | Loyalty program tier |

### orders

| Column | Type | Description | Nullable | Business meaning |
|---|---|---|---|---|
| `order_id` | string | Unique order identifier | No | Primary key |
| `customer_id` | string | Customer who placed the order | No | Relationship |
| `order_date` | date | Date order was placed | No | Transaction timestamp |
| `order_time` | string | Time of day order was placed (HH:MM:SS) | No | Behavioral analytics |
| `order_status` | string | Final status of the order | No | Order lifecycle / target variable |
| `shipping_method` | string | Selected shipping method | No | Fulfillment |
| `delivery_city` | string | Destination city | No | Geography |
| `delivery_state` | string | Destination state | No | Geography |
| `coupon_code` | string | Coupon applied, if any | Yes (~65%) | Promotions |
| `discount_percentage` | float | Order-level discount percentage applied | No | Pricing |
| `marketing_channel` | string | Channel attributed for this order | No | Marketing attribution |
| `subtotal` | float | Sum of item_revenue across order_items for this order (derived) | No | Revenue base |
| `shipping_fee` | float | Shipping charge (waived above INR499 subtotal) | No | Revenue component |
| `tax_amount` | float | Approximate 5% GST on subtotal | No | Revenue component |
| `final_amount` | float | subtotal + shipping_fee + tax_amount (derived) | No | Order value / revenue target |
| `campaign_id` | string | Marketing campaign active for this channel/date, if any | Yes | Marketing attribution |

### order_items

| Column | Type | Description | Nullable | Business meaning |
|---|---|---|---|---|
| `order_item_id` | string | Unique line-item identifier | No | Primary key |
| `order_id` | string | Parent order | No | Relationship |
| `product_id` | string | Product purchased | No | Relationship |
| `quantity` | int | Units purchased of this product in this order | No | Volume |
| `unit_price` | float | Product list price at time of purchase | No | Pricing |
| `discount_percentage` | float | Line-item discount percentage | No | Pricing |
| `item_revenue` | float | quantity * discounted unit price (derived) | No | Revenue |
| `item_cost` | float | quantity * cost_price (derived) | No | Cost |
| `profit` | float | item_revenue - item_cost (derived) | No | Profitability target |

### products

| Column | Type | Description | Nullable | Business meaning |
|---|---|---|---|---|
| `product_id` | string | Unique product identifier | No | Primary key |
| `product_name` | string | Generated product title | No | Catalog display |
| `category` | string | Top-level product category | No | Catalog taxonomy |
| `subcategory` | string | Product subcategory | No | Catalog taxonomy |
| `brand` | string | Synthetic brand name | No | Catalog attribute |
| `price` | float | Listed selling price (MRP-like) | No | Pricing |
| `cost_price` | float | Internal cost price used for margin calc | No | Profitability |
| `discount_range` | string | Typical discount band shown for this product | No | Merchandising |
| `rating_average` | float | Average product star rating | Yes (~0.8%) | Product quality signal |
| `rating_count` | int | Number of ratings received | No | Popularity proxy |
| `stock_quantity` | int | Units currently in stock (synthetic snapshot) | No | Inventory |
| `product_launch_date` | date | Date product was first listed | No | Catalog lifecycle |
| `product_type` | string | Merchandising tier | No | Merchandising |
| `return_rate_baseline` | float | Underlying (hidden) probability driving return simulation for this product | No | Simulation parameter / leakage risk if used post-hoc |

### payments

| Column | Type | Description | Nullable | Business meaning |
|---|---|---|---|---|
| `payment_id` | string | Unique payment record identifier | No | Primary key |
| `order_id` | string | Order being paid for | No | Relationship |
| `payment_date` | date | Date payment was processed | No | Transaction timestamp |
| `payment_method` | string | Method used | No | Payments analytics |
| `payment_status` | string | Outcome of the payment | No | Fraud/ops target |
| `amount_paid` | float | Amount actually captured | No | Cashflow |
| `transaction_fee` | float | Payment-gateway fee charged to merchant | No | Cost |
| `refund_amount` | float | Amount refunded, if any (<= amount that could be paid) | No | Cashflow |

### shipments

| Column | Type | Description | Nullable | Business meaning |
|---|---|---|---|---|
| `shipment_id` | string | Unique shipment identifier | No | Primary key |
| `order_id` | string | Associated order | No | Relationship |
| `warehouse_city` | string | Dispatching warehouse hub | No | Fulfillment |
| `delivery_city` | string | Destination city | No | Geography |
| `shipping_method` | string | Method used for this shipment | No | Fulfillment |
| `dispatch_date` | date | Date parcel left warehouse | No | Fulfillment - available pre-delivery |
| `expected_delivery_date` | date | SLA-promised delivery date (available at order time) | No | Feature for delay-prediction (safe, no leakage) |
| `actual_delivery_date` | date | Date parcel was actually delivered | Yes | TARGET / leakage risk - do not use as an input feature to predict delayed_flag |
| `delivery_days` | float | actual_delivery_date - dispatch_date, in days | Yes | Derived from actual date - leakage risk, same caution as actual_delivery_date |
| `delivery_status` | string | Final shipment outcome | No | Fulfillment outcome |
| `delayed_flag` | int (0/1) | 1 if actual_delivery_date > expected_delivery_date | No | TARGET variable for delay prediction |

### returns

| Column | Type | Description | Nullable | Business meaning |
|---|---|---|---|---|
| `return_id` | string | Unique return record identifier | No | Primary key |
| `order_id` | string | Order the return belongs to | No | Relationship |
| `customer_id` | string | Customer who returned the item | No | Relationship |
| `product_id` | string | Product returned | No | Relationship |
| `return_date` | date | Date return was initiated | No | Transaction timestamp |
| `return_reason` | string | Stated reason for return | No | Return-driver analysis |
| `refund_amount` | float | Amount refunded for this return (<= item_revenue) | No | Cashflow |
| `return_status` | string | Current status of the return | No | Ops target |

### customer_reviews

| Column | Type | Description | Nullable | Business meaning |
|---|---|---|---|---|
| `review_id` | string | Unique review identifier | No | Primary key |
| `order_id` | string | Order the review is linked to | No | Relationship |
| `customer_id` | string | Reviewer | No | Relationship |
| `product_id` | string | Product reviewed | No | Relationship |
| `review_date` | date | Date review was posted | No | Transaction timestamp |
| `rating` | int | Star rating given | No | Satisfaction target |
| `review_sentiment` | string | Sentiment label derived from rating | Yes (~0.3%) | NLP / sentiment target |
| `verified_purchase` | bool | Whether review came from a verified purchase | No | Trust signal |

### marketing_campaigns

| Column | Type | Description | Nullable | Business meaning |
|---|---|---|---|---|
| `campaign_id` | string | Unique campaign identifier | No | Primary key |
| `campaign_name` | string | Human-readable campaign name | No | Marketing catalog |
| `channel` | string | Marketing channel used | No | Attribution |
| `campaign_start_date` | date | Campaign start date | No | Campaign window |
| `campaign_end_date` | date | Campaign end date | No | Campaign window |
| `campaign_type` | string | Type of campaign | No | Marketing catalog |
| `target_segment` | string | Intended customer segment | No | Targeting |
| `discount_percentage` | float | Headline discount offered | No | Promotions |
| `impressions` | int | Estimated ad impressions (derived from conversions & channel CTR/CVR assumptions) | No | Marketing funnel |
| `clicks` | int | Estimated clicks (derived) | No | Marketing funnel |
| `conversions` | int | Actual orders attributed to this campaign (from orders table) | No | Marketing funnel - ground truth |
| `campaign_cost` | float | Estimated media spend for the campaign | No | Marketing cost |
| `revenue_generated` | float | Sum of final_amount for attributed orders (from orders table) | No | Marketing ROI - ground truth |
| `roi` | float | (revenue_generated - campaign_cost) / campaign_cost | No | Marketing performance |

## Columns present in the CSVs but missing from the shipped dictionary

- `customers.Purchase_Type` – Repeat Customer / One-time Customer / Never Purchased (added during EDA; based on non-Failed orders).
- `orders.month`, `orders.order_month`, `orders.order_year` – helper date columns derived from `order_date`.
