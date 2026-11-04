# raw_data

The 9 source CSV files (about 57 MB) are not included in the repository.
Put these files here to rebuild the dashboard data:
customers.csv, orders.csv, order_items.csv, products.csv, payments.csv, shipments.csv, returns.csv, customer_reviews.csv, marketing_campaigns.csv

Then run from the repository root:
```
pip install pandas
python dashboard/src/build_data.py raw_data
```
The dataset is synthetic and can be regenerated with the project's Python (Pandas, NumPy, Faker) generator script.
