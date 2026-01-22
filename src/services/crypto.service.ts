import { sendbitService } from './sendbit.service';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(__dirname, '../../data/users.json');

interface UserMapping {
    [whatsappId: string]: {
        email: string;
        firstName?: string;
        lastName?: string;
        sendbitId?: string;
    };
}

// Load mappings
let userMappings: UserMapping = {};
try {
    if (fs.existsSync(DATA_FILE)) {
        userMappings = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
} catch (error) {
    console.error('Error loading user mappings:', error);
}

const saveMappings = () => {
    try {
        if (!fs.existsSync(path.dirname(DATA_FILE))) {
            fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(userMappings, null, 2));
    } catch (error) {
        console.error('Error saving user mappings:', error);
    }
};

export class CryptoService {
    static isUserRegistered(userId: string): boolean {
        const user = userMappings[userId];
        return !!(user && user.sendbitId);
    }

    static async createWallet(userId: string, email: string, firstName: string, lastName: string, phoneNumber?: string): Promise<any> {
        // Even if user exists locally, we might want to ensure they are synced/updated in Sendbit
        // But to prevent spamming the API on every check, we can rely on local cache if strictly needed.
        // For now, let's allow updating or check existence.

        if (userMappings[userId]) {
            // Already registered locally
            // We can return a mock success or actual data if we had it.
            // But let's verify with Sendbit or just return success
            console.log(`User ${userId} already registered locally.`);
        }

        try {
            // Sendbit uses the userId (WhatsApp ID) as the providerUserId
            // We need a phone number which is basically the userId (if it's a number)
            const phoneNumber = userId.includes('@') ? userId.split('@')[0] : userId; // crude extraction if userId is JID
            const cleanPhoneNumber = '+' + phoneNumber.replace(/\D/g, '');

            const result = await sendbitService.createWallet(email, firstName, lastName, cleanPhoneNumber);

            if (result && result.success && result.data && result.data.id) {
                userMappings[userId] = {
                    email: email,
                    firstName,
                    lastName,
                    sendbitId: result.data.id
                };
                saveMappings();
                return result;
            } else {
                throw new Error(result?.message || 'Failed to create/update sub-account on Sendbit');
            }
        } catch (error: any) {
            throw new Error(`Wallet Creation Failed: ${error.message}`);
        }
    }

    static async getBalance(userId: string): Promise<{ BTC: string, ETH: string, USDT: string } | null> {
        // We don't strictly need userMappings to fetch balance if we trust userId matches
        // But checking if they are registered is good practice
        const user = userMappings[userId];
        if (!user || !user.sendbitId) {
            console.error(`User ${userId} not registered or missing Sendbit ID`);
            return null;
        }

        try {
            const [btc, eth, usdt] = await Promise.all([
                sendbitService.getBalance(user.sendbitId, 'btc'),
                sendbitService.getBalance(user.sendbitId, 'eth'),
                sendbitService.getBalance(user.sendbitId, 'usdt'),
            ]);

            return {
                BTC: btc,
                ETH: eth,
                USDT: usdt
            };
        } catch (error) {
            console.error('Error fetching balances:', error);
            return { BTC: '0.0', ETH: '0.0', USDT: '0.0' };
        }
    }

    static async getAddress(userId: string, currency: string) {
        const user = userMappings[userId];
        if (!user || !user.sendbitId) return null;
        return await sendbitService.getAddress(user.sendbitId, currency);
    }

    static async createAddress(userId: string, currency: string, network: string) {
        const user = userMappings[userId];
        if (!user || !user.sendbitId) return null;
        // Default network handling
        if (!network) {
            if (currency === 'usdt') network = 'trc20'; // default to cheap TRC20
            else if (currency === 'btc') network = 'bitcoin';
            else network = currency;
        }
        return await sendbitService.createPaymentAddress(user.sendbitId, currency, network);
    }

    static async createSwapQuote(userId: string, from: string, to: string, amount: string) {
        const user = userMappings[userId];
        if (!user || !user.sendbitId) throw new Error('User not registered');
        return await sendbitService.createSwapQuotation(user.sendbitId, from, to, amount);
    }

    static async confirmSwap(userId: string, quoteId: string) {
        const user = userMappings[userId];
        if (!user || !user.sendbitId) throw new Error('User not registered');
        return await sendbitService.confirmSwapQuotation(user.sendbitId, quoteId);
    }

    static async getSwapHistory(userId: string) {
        const user = userMappings[userId];
        if (!user || !user.sendbitId) return [];
        return await sendbitService.getSwapTransactions(user.sendbitId);
    }

    static async createWithdrawal(userId: string, currency: string, amount: string, address: string, network?: string) {
        const user = userMappings[userId];
        if (!user || !user.sendbitId) throw new Error('User not registered');
        return await sendbitService.createWithdrawal(user.sendbitId, currency, amount, address, network);
    }

    static async getWithdrawals(userId: string, currency?: string) {
        const user = userMappings[userId];
        if (!user || !user.sendbitId) return [];
        return await sendbitService.fetchWithdrawals(user.sendbitId, currency);
    }

    static async getDeposits(userId: string, currency?: string) {
        const user = userMappings[userId];
        if (!user || !user.sendbitId) return [];
        return await sendbitService.fetchDeposits(user.sendbitId, currency);
    }

    // Deprecated placeholders, kept for compatibility if needed, or removed if unused.
    // Replaced by specific methods above.
    static async sendCrypto(userId: string, currency: string, amount: number, toAddress: string): Promise<string> {
        return "Use createWithdrawal instead.";
    }

    static async swapCrypto(userId: string, from: string, to: string, amount: number): Promise<string> {
        return "Use createSwapQuote instead.";
    }
}
