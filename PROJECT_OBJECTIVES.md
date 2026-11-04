# Project Objectives

## Business problem
An online retailer selling across India needs one clear view of how the business is performing: how much it sells, to whom, where, through which products and payment methods, how well it delivers, how many orders come back, and whether marketing campaigns appear to help. Without that view, managers cannot decide where to invest stock, delivery effort or marketing budget.

This project builds that view for a **simulated** Indian e-commerce business (January 2023 to December 2025). It is a portfolio project for an entry-level Data Analyst role, so the focus is on correct metrics, clear dashboards and honest reporting of data limits.

## Purpose
- Turn nine linked tables (about 6.6 lakh rows in total) into an interactive, decision-ready dashboard.
- Show practical skills: data auditing, metric definition, avoiding double counting, dashboard design and business storytelling.
- Provide a Power BI handover (DAX, theme, model design) next to a web dashboard.

## Main objectives
1. Audit the data (keys, duplicates, nulls, date ranges, formulas, relationships) before analysing it.
2. Define each KPI precisely, including which order statuses are counted.
3. Build a 7-section interactive dashboard with working filters.
4. Reconcile discrepancies between earlier Python EDA and Power BI figures.
5. Turn results into recommendations a business could act on.
6. Document limits clearly: the data is synthetic.

## Questions the analysis answers
**Overall and sales**
- How much revenue and how many orders did the business make, and what is the average order value?
- How do monthly, quarterly and yearly results change? Is there seasonality?

**Customers**
- How many customers purchased, and how many are repeat, one-time or never purchased?
- How concentrated is revenue among the top customers?
- How many customers are new versus returning each year?

**Products and geography**
- Which categories and products earn the most, and which earn the least?
- Which states and cities lead, and where are the gaps?

**Operations**
- How long does delivery take and how often is it late?
- What share of orders are returned, why, and in which categories?

**Payments and marketing**
- Which payment methods are used and how often do payments fail?
- How many orders and how much revenue are tied to campaigns, and how do channels compare (as attribution, not as proven ROI)?

## Out of scope
Customer lifetime value, true marketing ROI or profitability, forecasting, and anything that needs real company data.
