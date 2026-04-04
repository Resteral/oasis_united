# 🌌 The Oasis United: System Architecture Walkthrough

Oasis United is a decentralized, high-density regional trade network designed for autonomous municipal growth. The system is architected to scale without manual oversight, enabling citizens to provision towns, businesses, and logistics loops in real-time.

---

## 1. 🏗️ The Autonomous Municipal Engine (Triggers)
The core of Oasis is "Zero-Effort Growth." These systems allow the platform to scale instantly when a new town or business is registered.

### A. The "Instant Town" Seeding (`on_town_creation`)
When a new town is added to the `towns` table, a PostgreSQL trigger automatically creates a **"General Store Node."** This ensures that even the newest town in the network has an immediate commerce center.
- **Goal:** Immediate Retail Density.
- **Logic:** `seed_new_town_infrastructure` function handles the creation of a founding business node with a default "Provisioning" stock.

### B. The "Instant Boutique" Stocking (`on_business_creation`)
When a citizen registers a new business, the system analyzes the **category** and automatically stocks it with "Verified Drops" from the `products_template` table.
- **Goal:** Zero-Latency Onboarding.
- **Logic:** `seed_business_products` function performs high-frequency cross-referencing to match industry categories (e.g., Grocery, Hardware) with their respective regional price points.

---

## 2. 🚚 The High-Density Logistics Pulse (Fulfillment)
Oasis shifts from centralized delivery to a **"Citizen Fleet" model.** Logistics are managed as a real-time municipal loop.

### A. Atomic Transit Protocols (`claim_order`)
Deliverers (active Oasis agents) coordinate with the network via an atomic **"Claim"** protocol. 
1. **Queue Tracking:** Unclaimed orders appear in the `LogisticsQueue`.
2. **Atomic Lock:** When an agent claims an order via the `claim_order(p_order_id, p_deliverer_id)` RPC, the system verified ownership and shifts the state from `pending` to `processing`.
3. **Transit Transition:** The order then progresses through `transit` (active GPS) and finally `delivered`.

### B. The Fleet Radar (`deliverer_locations`)
As agents move through regional routes, they broadcast their coordinates to the `deliverer_locations` registry.
- **GPS Synchronization:** The `LiveTracking` UI synchronizes with this registry in real-time, providing customers with absolute visibility into the **"Logistics Pulse."**

---

## 3. 🛰️ Broad Municipal Search (Discovery)
The `api/search` engine is engineered for high-resolution discovery. Unlike traditional search, Oasis uses **Broad Proximity Logic.**

### A. Fuzzy Municipal Matching
Instead of strict string matches, the search engine cross-references:
- **Town Names:** Matches local municipal nodes.
- **Product Names/Categories:** Matches deep SKU data.
- **Industry Categories:** Filters by service type (e.g., "Carpenter" or "Gourmet").

### B. Proximity Scan activator
The "📍 Neighborhood" scan button uses browser geolocation to find the nearest **Town Node** and immediately filters the discovery grid to that territory, prioritizing local independent boutiques.

---

## 4. 🏢 Merchant Node Sovereignty (Merchant Hub)
Each citizen has the autonomy to act as a **Founding Node** for their business.

### A. The "Verified Drop" Protocol
In the **Merchant Dashboard**, owners can "Drop" new items into the regional network.
- **Verified Status:** High-visibility products can be marked as `is_featured`, causing them to appear in the "Oasis Discovery" drops.
- **Sovereign Management:** Merchants maintain full control over pricing, stock, and descriptions via a premium, high-density management interface.

### B. Storefrontless Vanguards
Independent service providers (e.g., Structural repair Nodes, Holistic Homestead Systems) can operate without a physical storefront. They broadcast their presence via **Fleet Ads** with an integrated **Campaign Clock**, ensuring their "Node" is perpetually active on the regional logistics grid.

---

## 🚀 Future Scalability: The Trade Protocol
The current architecture is ready for:
- **Oasis Pay Sync:** Integrating digital wallets for zero-friction regional trade.
- **Multi-Node Expansion:** Allowing citizens to manage multiple businesses from a single dashboard.
- **Logistics Intel:** Visualizing "Fulfillment Heatmaps" to help agents find the most active municipal loops.

> [!IMPORTANT]
> To activate these systems, ensure you run the `supabase/oasis_unified_registry.sql` script. It initializes all triggers, RPCs, and registries described above, ensuring absolute stabilization and atomic growth.
