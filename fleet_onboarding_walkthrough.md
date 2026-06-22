# Fleet Expansion & DoorDash Integration

This update introduces a premium advertising and registration portal for the Oasis United fleet, along with a robust DoorDash Drive API integration to scale regional logistics.

## Key Features

### 1. Fleet Opportunities Landing Page
- **URL**: [/fleet](file:///c:/Users/Sean/.gemini/antigravity/scratch/oasis_united/src/app/fleet/page.tsx)
- **Roles**:
    - **Marketing Time Slots**: Commission-based territory management for local merchants.
    - **Hourly Logistics Pay**: Guaranteed floor rates for scheduled delivery shifts.
- **Registration**: Automated citizen uplink for both roles, saving directly to the municipal registry.

### 2. DoorDash Drive API Service
- **Location**: [doordash.ts](file:///c:/Users/Sean/.gemini/antigravity/scratch/oasis_united/src/services/doordash.ts)
- **Capabilities**:
    - Automated JWT generation for secure authentication.
    - Delivery creation and status tracking via DoorDash Drive v2 protocol.
    - Integrated into the [AutomationService](file:///c:/Users/Sean/.gemini/antigravity/scratch/oasis_united/src/services/automation.ts).

## Technical Implementation

### Database
A new `fleet_registrations` table has been added.
> [!IMPORTANT]
> Apply the registry changes using [fleet_registration_migration.sql](file:///c:/Users/Sean/.gemini/antigravity/scratch/oasis_united/fleet_registration_migration.sql).

### API Routes
- `POST /api/fleet/register`: Handles the secure submission of fleet applications. [View Route](file:///c:/Users/Sean/.gemini/antigravity/scratch/oasis_united/src/app/api/fleet/register/route.ts)

### Automation
The `AutomationService` now includes `dispatchDoorDashDelivery()`, allowing for elastic logistics scaling.

## Getting Started

1. **Environment Variables**: Add DoorDash credentials to `.env.local`.
2. **Registry Migration**: Apply the SQL migration.
3. **Dependencies**: `npm install jsonwebtoken @types/jsonwebtoken`.
