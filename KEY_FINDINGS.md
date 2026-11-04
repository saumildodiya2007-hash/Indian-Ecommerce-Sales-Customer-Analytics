# Key Findings

All figures were recalculated from the source CSV files and are results from a **synthetic dataset**. 1 Cr (crore) = 10 million rupees.

## Headline numbers
| Metric | Value |
|---|---|
| Total order value (all statuses) | ₹257.26 Cr (₹2,572,592,369) |
| Delivered orders only | ₹208.43 Cr |
| Orders | 1,00,000 |
| Average order value | ₹25,726 |
| Registered / purchasing customers | 25,000 / 22,700 |

## Sales trends
- Revenue by year: ₹69.41 Cr (2023), ₹68.48 Cr (2024), ₹119.38 Cr (2025). Orders: 26,750 / 26,730 / 46,520.
- 2025 is +74% above 2024 in revenue because order count grew; average order value stayed between ₹25.6K and ₹25.9K.
- Q4 is the strongest quarter every year (31.1%, 30.5%, 46.4% of annual revenue). December 2025 is the highest month at ₹24.78 Cr; January 2023 the lowest at ₹1.07 Cr.
- Order status: Delivered 80.7%, Cancelled 8.1%, Returned 6.7%, Failed 2.9%, Processing 1.7%. Value by status: Delivered ₹208.43 Cr, Cancelled ₹20.26 Cr, Returned ₹16.99 Cr, Failed ₹7.18 Cr, Processing ₹4.40 Cr.

## Customer behaviour
- 18,695 repeat customers (82.4% of buyers), 4,005 one-time customers, 2,300 never purchased (120 of them had only Failed orders).
- Top 10% of buyers contribute 38.6% of order value.
- Dataset labels: 13,365 Churned, 7,234 Active, 2,101 At Risk, 2,300 Never Purchased.
- Segments: Regular 11,002, Budget 7,713, New 3,294, Premium 2,991.
- New customers by first valid order year: 8,126 (2023), 6,121 (2024), 8,453 (2025). Returning customers: 3,438 (2024), 4,156 (2025).

## Product performance
- Item revenue total: ₹244.99 Cr. Electronics ₹122.36 Cr (~50%), Appliances ₹40.52 Cr, Home & Kitchen ₹15.81 Cr, Furniture ₹14.70 Cr, Fashion ₹13.94 Cr.
- Top product "Chaudhry, Advanced Smartwatche": ₹52.07 Cr (~21% of item revenue).
- Weakest products are low-priced Grocery, Personal Care, Stationery and Health items with under ₹20K item revenue each.
- 155 of 550 products cost under ₹500; 7 cost above ₹50,000.

## Geographic performance
- Maharashtra ₹35.99 Cr (14.0%), Uttar Pradesh ₹27.97 Cr, Gujarat ₹27.25 Cr, Karnataka ₹20.52 Cr.
- Top cities: Mumbai ₹12.32 Cr, Pune ₹12.04 Cr, New Delhi ₹11.68 Cr, Nagpur ₹11.62 Cr, Mysuru ₹10.66 Cr.
- Smallest state: Bihar ₹4.69 Cr and 431 customers.

## Delivery and returns
- 89,681 shipments: 80,679 delivered, 6,681 delivered then returned, 2,321 cancelled in transit. Average 4.11 days dispatch to delivery.
- 42.8% of delivered shipments are late. Late share by method: Same-Day 57.4%, Standard 54.8%, Express 39.7%, Economy 38.3%, Next-Day 10.8%.
- 12,075 return records on 9,510 orders; return rate 10.9% of Delivered or Returned orders.
- Reasons: Size issue 2,201; Changed mind 1,984; Product damaged 1,933; Quality issue 1,692; Not as expected 1,442; Wrong product 1,394; Late delivery 960; Other 469.
- Most return records: Fashion 3,185; Electronics 1,232; Footwear 1,205. Highest per item sold: Footwear 8.5%, Fashion 7.4%.
- Return records jump to 740, 770 and 874 in Oct to Dec 2025 (about 300 earlier).

## Payments
- UPI 31,971 payments (₹78.06 Cr), Cash on Delivery 17,274 (₹39.88 Cr), Credit Card 15,063 (₹36.63 Cr), Debit Card 12,682, Net Banking 8,322.
- Status: Success 82,137 (82.1%), Refunded 10,690, Failed 5,068, Not Charged 1,876, Pending 229. Failed, Not Charged and Pending payments carry ₹0 amount.

## Marketing (attribution only)
- 151 campaigns; 17,179 attributed orders (17.2%) with ₹43.63 Cr revenue; ₹18.71 Cr campaign cost in the data.
- Attributed revenue per rupee of cost: Organic Search 5.3x, Email 2.1x, Paid Search 1.9x, Influencer 1.3x, Facebook 1.1x. These ratios are not true ROI.
- 66.3% of orders used a coupon; average order discount 12.0%.

## Data discrepancies
Resolved: 2,880-order gap = Failed orders; revenue gap = Failed orders (₹7.18 Cr). Unresolved: see `LIMITATIONS_AND_ASSUMPTIONS.md`.
