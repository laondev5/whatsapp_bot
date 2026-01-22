import axios from 'axios';

const PORT = 3000;
const WEBHOOK_URL = `http://localhost:${PORT}/api/webhook`;

const samplePayload = {
    object: 'whatsapp_business_account',
    entry: [
        {
            id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
            changes: [
                {
                    value: {
                        messaging_product: 'whatsapp',
                        metadata: {
                            display_phone_number: '1234567890',
                            phone_number_id: '1234567890',
                        },
                        contacts: [
                            {
                                profile: {
                                    name: 'Test User',
                                },
                                wa_id: 'TEST_USER_ID', // Simulating a user ID
                            },
                        ],
                        messages: [
                            {
                                from: 'TEST_USER_ID',
                                id: 'wamid.HBgLM...',
                                timestamp: '1689600000',
                                text: {
                                    body: 'Menu', // The message content
                                },
                                type: 'text',
                            },
                        ],
                    },
                    field: 'messages',
                },
            ],
        },
    ],
};

async function testWebhook() {
    try {
        console.log(`Sending test webhook to ${WEBHOOK_URL}...`);
        const response = await axios.post(WEBHOOK_URL, samplePayload);
        console.log('Response:', response.status, response.data);
    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

testWebhook();
