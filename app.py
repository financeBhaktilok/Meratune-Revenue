import streamlit as st
import pandas as pd

st.set_page_config(
    page_title="Customer Dashboard",
    page_icon="📊",
    layout="wide"
)

# Load Excel file
df = pd.read_excel("customers.xlsx")

# Clean columns
df.columns = df.columns.str.strip()

# Convert data types
df["Amount"] = pd.to_numeric(df["Amount"], errors="coerce")
df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

df = df.dropna(subset=["Amount", "Date"])

# Title
st.title("📊 Customer Payment Dashboard")

# Sidebar
st.sidebar.header("Filters")

# Date filter
min_date = df["Date"].min().date()
max_date = df["Date"].max().date()

date_range = st.sidebar.date_input(
    "Date Range",
    value=(min_date, max_date),
    min_value=min_date,
    max_value=max_date
)

# Mobile search
mobile_search = st.sidebar.text_input(
    "Search Mobile Number"
)

# Apply date filter
filtered = df.copy()

if len(date_range) == 2:
    start_date, end_date = date_range

    filtered = filtered[
        (filtered["Date"].dt.date >= start_date) &
        (filtered["Date"].dt.date <= end_date)
    ]

# Apply mobile filter
if mobile_search:
    filtered = filtered[
        filtered["Mobile Number"]
        .astype(str)
        .str.contains(mobile_search, na=False)
    ]

# Metrics
total_amount = filtered["Amount"].sum()
total_customers = filtered["Mobile Number"].nunique()
total_transactions = len(filtered)

col1, col2, col3 = st.columns(3)

col1.metric(
    "Total Amount",
    f"₹{total_amount:,.2f}"
)

col2.metric(
    "Customers",
    f"{total_customers:,}"
)

col3.metric(
    "Transactions",
    f"{total_transactions:,}"
)

st.divider()

# Daily collection
st.subheader("Daily Collection")

daily = (
    filtered
    .groupby("Date")["Amount"]
    .sum()
    .sort_index()
)

st.line_chart(daily)

# Customer summary
st.subheader("Customer Summary")

summary = (
    filtered
    .groupby("Mobile Number", as_index=False)["Amount"]
    .sum()
    .sort_values("Amount", ascending=False)
)

# Mask mobile numbers
summary["Mobile Number"] = summary["Mobile Number"].astype(str).apply(
    lambda x: "*" * max(0, len(x) - 4) + x[-4:]
)

st.dataframe(
    summary,
    use_container_width=True
)

# Transaction details
st.subheader("Transactions")

display_df = filtered.copy()

display_df["Mobile Number"] = (
    display_df["Mobile Number"]
    .astype(str)
    .apply(lambda x: "*" * max(0, len(x) - 4) + x[-4:])
)

st.dataframe(
    display_df.sort_values("Date", ascending=False),
    use_container_width=True
)
