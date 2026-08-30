# Meratune Customer & Revenue Dashboard

A static dashboard built from `Meratune_Customer_data.xlsx`, ready to publish
on GitHub Pages **as a private site** (requires GitHub Enterprise Cloud).

## Files
- `index.html` — the dashboard (KPIs, daily revenue/invoice trend, invoice tier
  breakdown, searchable top-100-customer table)
- `data.json` — pre-aggregated data the page reads at load time

The 41K raw rows were aggregated down to daily totals + a top-100 customer
list (by spend) so the page stays fast. Full customer-level phone numbers
only appear in that top-100 table — see the privacy note below before you
publish.

## Deploy steps

1. **Create a new *private* repository** on GitHub (e.g. `meratune-dashboard`).
2. Upload `index.html` and `data.json` to the repo root (or `git push` them).
3. Go to **Settings → Pages**.
4. Under **Source**, choose **Deploy from a branch**, pick your default
   branch and `/ (root)`.
5. Once it deploys, you'll see a **Visibility** dropdown on that same Pages
   settings screen (this only appears because your org is on Enterprise
   Cloud). Set it to **Private**.
6. Only people with read access to the repo will be able to open the
   published URL — everyone else gets a 404/login wall.

## Privacy note

Even with private Pages access control, treat this repo like any other
store of customer PII:
- Only grant repo access to people who actually need to see customer-level
  data.
- Don't fork or mirror this repo into a public one.
- If you ever want to share the dashboard more broadly, swap `data.json`
  for a version with the `top_customers` section removed or replaced with
  fully anonymized IDs.

## Updating the data

Re-run the aggregation whenever you get a new export, then replace
`data.json` in the repo (the page has no build step — it just fetches
`data.json` at load time).
