
const axios = require('axios');

async function testWebhook() {
  try {
    const response = await axios.post('http://localhost:3000/api/webhook', {
      object: 'whatsapp_business_account',
      entry: [{
        id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '1234567890',
              phone_number_id: '1234567890'
            },
            contacts: [{
              profile: {
                name: 'NAME'
              },
              wa_id: 'PHONE_NUMBER'
            }],
            messages: [{
              from: 'PHONE_NUMBER',
              id: 'wamid.ID',
              timestamp: 'TIMESTAMP',
              text: {
                body: 'TEST_MESSAGE'
              },
              type: 'text'
            }]
          },
          field: 'messages'
        }]
      }]
    });
    console.log('Success! Server responded with:', response.status, response.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Server status:', error.response.status);
      console.error('Server data:', error.response.data);
    }
  }
}

testWebhook();
