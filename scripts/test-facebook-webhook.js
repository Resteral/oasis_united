const fetch = require('node-fetch'); // Ensure you have node-fetch or use Node 18+

const BASE_URL = 'http://localhost:3000'; // Change if running on a different port
const VERIFY_TOKEN = 'test_token'; // MUST match process.env.FACEBOOK_VERIFY_TOKEN in .env.local

async function testWebhookVerification() {
    console.log('--- Testing Webhook Verification (GET) ---');
    const params = new URLSearchParams({
        'hub.mode': 'subscribe',
        'hub.verify_token': VERIFY_TOKEN,
        'hub.challenge': '1234567890'
    });

    try {
        const res = await fetch(`${BASE_URL}/api/webhooks/facebook?${params}`);
        const text = await res.text();

        if (res.status === 200 && text === '1234567890') {
            console.log('✅ Verification SUCCESS');
        } else {
            console.log('❌ Verification FAILED');
            console.log('Status:', res.status);
            console.log('Response:', text);
        }
    } catch (error) {
        console.error('❌ Error connecting to webhook:', error.message);
    }
}

async function testInboundMessage() {
    console.log('\n--- Testing Inbound Message (POST) ---');

    // Payload mimicking a Facebook Page Message Event
    const payload = {
        object: 'page',
        entry: [
            {
                id: '123456789', // Mock Page ID - Must match a Business Integration in DB for logic to run fully
                time: Date.now(),
                messaging: [
                    {
                        sender: { id: '987654321' }, // Mock User ID
                        recipient: { id: '123456789' },
                        timestamp: Date.now(),
                        message: {
                            mid: 'mid.1234567890',
                            text: 'Is this store open right now?'
                        }
                    }
                ]
            }
        ]
    };

    try {
        const res = await fetch(`${BASE_URL}/api/webhooks/facebook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await res.text();

        if (res.status === 200) {
            console.log('✅ Event Received SUCCESS');
            console.log('Response:', text);
            console.log('Check your database "messages" table for the new entry.');
        } else {
            console.log('❌ Event Processing FAILED');
            console.log('Status:', res.status);
            console.log('Response:', text);
        }
    } catch (error) {
        console.error('❌ Error sending event:', error.message);
    }
}

async function run() {
    await testWebhookVerification();
    // process.env.FACEBOOK_VERIFY_TOKEN needs to be set in .env.local for verification to pass on server side
    // For the POST test to fully work and insert into DB, you need a Business in the DB with:
    // integrations: { facebook: { id: '123456789' } }

    await testInboundMessage();
}

run();
