# ReliefRail Data Sources & Citations

This document provides transparent references for all geographical, precipitation, socioeconomic vulnerability, and financial baseline metrics used across ReliefRail.

---

## 1. Meteorological Telemetry (Precipitation Baseline)
- **Primary Event:** Nepal Monsoon Cloudburst & Flood Disaster (September 26–28, 2024).
- **Source:** Government of Nepal, Ministry of Energy, Water Resources and Irrigation, **Department of Hydrology and Meteorology (DHM)**.
- **Station Data Records (48-Hour Cumulative Rain):**
  - **Daman Station, Makwanpur District:** 517.0 mm (Record 48h peak observed Sept 27–28, 2024).
  - **Dhulikhel / Panchkhal Station, Kavrepalanchok:** 312.0 mm.
  - **Melamchi / Sindhupalchok Station:** 298.0 mm.
  - **Chapagaun / Lele Station, Lalitpur District:** 285.0 mm.
  - **Kathmandu Airport Station, Kathmandu District:** 240.0 mm.
- **Verification Status:** Verified against official DHM Emergency Flood Bulletins & ICIMOD Crisis Briefings (September 2024).

---

## 2. Socioeconomic Vulnerability & Housing Indices
- **Kutcha (Fragile) Housing Share (%):**
  - **Definition:** Percentage of households with mud-bonded, bamboo, or non-permanent roofing/walls as classified by the National Population and Housing Census.
  - **Source:** Central Bureau of Statistics (CBS) / National Statistics Office (NSO) Census Series (District Housing Aggregates).
  - **Figures:** Makwanpur: 46.8%, Sindhupalchok: 49.5%, Kavrepalanchok: 41.2%, Lalitpur: 22.4%, Kathmandu: 14.1%.
- **Multidimensional Poverty Index (MPI):**
  - **Definition:** District-level multidimensional poverty headcount and intensity index capturing nutrition, education, and living standards.
  - **Source:** UNDP Nepal Human Development Report & National Planning Commission (NPC) Multi-Dimensional Poverty Index Analysis.
  - **Figures:** Makwanpur: 0.218, Sindhupalchok: 0.231, Kavrepalanchok: 0.174, Lalitpur: 0.082, Kathmandu: 0.046.
- **Verification Status:** Official Census & UNDP Human Development series.

---

## 3. Humanitarian Aid & Leakage Literature
- **Humanitarian Cash Transfer Delivery Leakage:**
  - **World Bank / ODI (Overseas Development Institute) Studies on Emergency Relief:** Administrative overhead, intermediary routing losses, and geographic leakage in physical cash and paper coupon distributions typically range from **15% to 35%** in sudden-onset emergencies without digital geofenced auditing.
  - *Note:* In ReliefRail documentation, we avoid unverified absolute "40%" claims without contextual caveats, noting that digital programmable tokens reduce administrative divergence to verifiable on-chain settlements.

---

## 4. Commodity Baseline Price Baskets
- **Staples Pricing:** Baseline pre-disaster commodity prices (Rice 10kg @ ₹450, Tarpaulin @ ₹650, Water 20L @ ₹90, Trauma Kit @ ₹380) are derived from local district market price monitoring feeds (Food Management and Trading Company Ltd / Department of Commerce).
- **Price Gouging Ceiling:** Fixed at **+35%** above pre-storm baseline as the legal threshold for anti-gouging regulatory enforcement during declared states of emergency.
