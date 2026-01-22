
import axios from 'axios';
import { config } from 'dotenv';
import path from 'path';

import { v4 as uuidv4 } from 'uuid';

// Load env
config({ path: path.join(__dirname, '../.env') });

const BASE_URL = process.env.SENDBIT_BASE_URL;
const CLIENT_ID = process.env.SENDBIT_CLIENT_ID;
const CLIENT_SECRET = process.env.SENDBIT_CLIENT_SECRET;

if (!BASE_URL || !CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing env vars');
    process.exit(1);
}

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Client-Id': CLIENT_ID,
        'Client-Secret': CLIENT_SECRET,
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use((reqConfig) => {
    if (!reqConfig.headers['Request-ID']) {
        reqConfig.headers['Request-ID'] = uuidv4();
    }
    return reqConfig;
});

async function testCreateUser() {
    console.log('Testing User Creation...');
    const testUser = {
        email: `test_dev_${Date.now()}@example.com`,
        first_name: 'Test',
        last_name: 'Dev',
        // phone_number: '+1234567890'
    };

    try {
        console.log(`Sending POST to ${BASE_URL}/quidax/users with`, testUser);
        const response = await client.post('/quidax/users', testUser);
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        console.error('Error creating user:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testCreateUser();
