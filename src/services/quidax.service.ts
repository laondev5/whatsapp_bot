import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';

export class QuidaxService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: 'https://www.quidax.com/api/v1',
            headers: {
                'Authorization': `Bearer ${config.quidaxSecretKey}`,
                'Content-Type': 'application/json',
            },
        });
    }

    // Helper to handle API errors
    private handleError(error: any, context: string) {
        if (error.response) {
            console.error(`Quidax API Error [${context}]:`, error.response.data);
            throw new Error(`Quidax Error: ${error.response.data.message || error.message}`);
        } else {
            console.error(`Network/Server Error [${context}]:`, error.message);
            throw error;
        }
    }

    /**
     * Create a sub-account for a user
     * @param email User's email
     * @param firstName User's first name
     * @param lastName User's last name
     */
    async createSubAccount(email: string, firstName: string, lastName: string) {
        try {
            const response = await this.client.post('/users', {
                email,
                first_name: firstName,
                last_name: lastName,
            });
            return response.data.data;
        } catch (error) {
            this.handleError(error, 'createSubAccount');
        }
    }

    /**
     * Get user details by ID (meant for sub-accounts)
     * @param userId Quidax user ID
     */
    async getUser(userId: string) {
        try {
            const response = await this.client.get(`/users/${userId}`);
            return response.data.data;
        } catch (error) {
            this.handleError(error, 'getUser');
        }
    }
    /**
     * Get user wallet for specific currency
     * @param userId Quidax user ID
     * @param currency e.g., 'btc', 'eth', 'usdt'
     */
    async getWallet(userId: string, currency: string) {
        try {
            const response = await this.client.get(`/users/${userId}/wallets/${currency}`);
            return response.data.data;
        } catch (error) {
            this.handleError(error, `getWallet-${currency}`);
        }
    }

    /**
     * Get deposit address for a user's wallet
     * @param userId Quidax user ID
     * @param currency e.g., 'btc', 'eth'
     */
    async getAddress(userId: string, currency: string) {
        try {
            const response = await this.client.get(`/users/${userId}/wallets/${currency}/address`);
            return response.data.data;
        } catch (error) {
            // Some wallets might not have an address generated yet, handle creation if API requires explicit generation
            // Quidax usually generates address on wallet access or via specific endpoint.
            // If 404, we might need to create it.
            this.handleError(error, `getAddress-${currency}`);
        }
    }

    /**
     * Fetch user's crypto balance (from their specific wallet)
     * @param userId Quidax user ID
     * @param currency e.g., 'btc'
     */
    async fetchBalance(userId: string, currency: string): Promise<string> {
        const wallet = await this.getWallet(userId, currency);
        return wallet ? wallet.balance : '0.0';
    }
}

export const quidaxService = new QuidaxService();
