
import { CryptoService } from '../src/services/crypto.service';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env
config({ path: path.join(__dirname, '../.env') });

async function verifyFlow() {
    console.log('Starting Verification Flow...');

    // Use a unique ID to avoid conflicts
    const userId = `test_user_${Date.now()}`;
    const email = `${userId}@example.com`;
    const firstName = 'Verify';
    const lastName = 'Flow';
    // Mock user mapping behavior by checking the file after run

    try {
        console.log(`1. Creating Wallet for ${userId}...`);
        const result = await CryptoService.createWallet(userId, email, firstName, lastName);
        console.log('Create Wallet Result:', JSON.stringify(result, null, 2));

        if (!result || !result.success) {
            throw new Error('Failed to create wallet');
        }

        console.log('2. Verifying ID storage...');
        // We can't easily check private memory of CryptoService, but we can check the file
        const dataPath = path.join(__dirname, '../data/users.json');
        if (fs.existsSync(dataPath)) {
            const users = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
            if (users[userId] && users[userId].sendbitId) {
                console.log('Success: Sendbit ID stored:', users[userId].sendbitId);
            } else {
                console.error('Failure: Sendbit ID NOT found in users.json for', userId);
            }
        } else {
            console.warn('Warning: users.json not found (maybe first run?)');
        }

        console.log('3. Fetching Balance...');
        const balance = await CryptoService.getBalance(userId);
        console.log('Balance:', balance);

        if (balance) {
            console.log('Verification Successful!');
        } else {
            console.error('Verification Failed: Balance is null');
        }

    } catch (error: any) {
        console.error('Verification Error:', error.message);
    }
}

verifyFlow();
