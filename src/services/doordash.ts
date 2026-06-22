/**
 * DoorDash Drive API Service
 * Handles delivery creation and tracking via DoorDash API.
 */

import jwt from 'jsonwebtoken';

const DOORDASH_DEVELOPER_ID = process.env.DOORDASH_DEVELOPER_ID;
const DOORDASH_KEY_ID = process.env.DOORDASH_KEY_ID;
const DOORDASH_SIGNING_SECRET = process.env.DOORDASH_SIGNING_SECRET;

/**
 * Generate a JWT for DoorDash API authentication
 */
function generateToken() {
    if (!DOORDASH_DEVELOPER_ID || !DOORDASH_KEY_ID || !DOORDASH_SIGNING_SECRET) {
        throw new Error('DoorDash credentials missing in environment variables');
    }

    const payload = {
        aud: 'doordash',
        iss: DOORDASH_DEVELOPER_ID,
        kid: DOORDASH_KEY_ID,
        exp: Math.floor(Date.now() / 1000) + 300, // 5 minute expiry
        iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, Buffer.from(DOORDASH_SIGNING_SECRET, 'base64'), {
        algorithm: 'HS256',
        header: {
            kid: DOORDASH_KEY_ID,
            typ: 'JWT',
        },
    });
}

/**
 * Interface for DoorDash Delivery Request
 */
interface DoorDashDeliveryRequest {
    external_delivery_id: string;
    pickup_address: string;
    pickup_business_name: string;
    pickup_phone_number: string;
    dropoff_address: string;
    dropoff_contact_given_name: string;
    dropoff_contact_family_name: string;
    dropoff_phone_number: string;
    order_value: number; // in cents
    items?: any[];
}

/**
 * Create a delivery request in DoorDash
 */
export async function createDoorDashDelivery(request: DoorDashDeliveryRequest) {
    try {
        const token = generateToken();
        const response = await fetch('https://openapi.doordash.com/drive/v2/deliveries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(request),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(`DoorDash API Error: ${data.message || response.statusText}`);
        }

        return data;
    } catch (error: any) {
        console.error('Error creating DoorDash delivery:', error);
        throw error;
    }
}

/**
 * Get delivery status from DoorDash
 */
export async function getDoorDashDeliveryStatus(deliveryId: string) {
    try {
        const token = generateToken();
        const response = await fetch(`https://openapi.doordash.com/drive/v2/deliveries/${deliveryId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(`DoorDash API Error: ${data.message || response.statusText}`);
        }

        return data;
    } catch (error: any) {
        console.error('Error fetching DoorDash delivery status:', error);
        throw error;
    }
}
