import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';
import { v4 as uuidv4 } from 'uuid';

export class SendbitService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: config.sendbitBaseUrl,
            headers: {
                'Client-Id': config.sendbitClientId,
                'Client-Secret': config.sendbitClientSecret,
                'Webhook-Signing-Secret': config.webhookSigningSecret,
                'Content-Type': 'application/json',
            },
        });

        // Add interceptor to inject Request-ID if not present
        this.client.interceptors.request.use((reqConfig) => {
            if (!reqConfig.headers['Request-ID']) {
                reqConfig.headers['Request-ID'] = uuidv4();
            }
            return reqConfig;
        });
    }

    private handleError(error: any, context: string) {
        if (error.response) {
            console.error(`Sendbit API Error [${context}]:`, error.response.data);
            throw new Error(`Sendbit Error: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(`Network/Server Error [${context}]:`, error.message);
            throw error;
        }
    }

    /**
     * Fetch the system wallet for a given currency (btc, eth, usdt).
     * Uses the /quidax/wallets/{currency} endpoint (no sub-account needed).
     */
    async fetchSystemWallet(currency: string) {
        try {
            const response = await this.client.get(`/quidax/wallets/${currency}`, {
                params: { currency }
            });
            return response.data;
        } catch (error) {
            this.handleError(error, `fetchSystemWallet-${currency}`);
        }
    }

    /**
     * Get the system deposit address for a given currency.
     * Returns the deposit_address from the system wallet, or null if not available.
     */
    async getSystemDepositAddress(currency: string): Promise<{ address: string | null; network: string | null }> {
        try {
            const res = await this.fetchSystemWallet(currency.toLowerCase());
            if (res && res.data) {
                return {
                    address: res.data.deposit_address || null,
                    network: res.data.default_network || null
                };
            }
            return { address: null, network: null };
        } catch (error) {
            console.error(`Error fetching system deposit address for ${currency}:`, error);
            return { address: null, network: null };
        }
    }

    /**
     * Create a user/sub-account in Sendbit (wrapping Quidax)
     * Maps the local userId to the providerUserId in Sendbit.
     */
    async createWallet(email: string, firstName: string, lastName: string, phoneNumber: string) {
        try {
            const response = await this.client.post(`/quidax/users`, {
                email,
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber
            });
            return response.data;
        } catch (error) {
            this.handleError(error, 'createWallet');
        }
    }

    async getWallet(subAccountId: string, currency: string) {
        try {
            const response = await this.client.get(`/quidax/users/${subAccountId}/wallets/${currency}`);
            // Depending on response structure: { success: true, data: { ... } } or { success: true, data: [ ... ] }
            // Example response showed data: [ null ], which is weird, but assuming standard 'data' object on success
            return response.data;
        } catch (error) {
            this.handleError(error, `getWallet-${currency}`);
        }
    }

    async getBalance(subAccountId: string, currency: string) {
        try {
            const res = await this.getWallet(subAccountId, currency);
            if (res && res.data) {
                // Assuming res.data contains the wallet object directly or in an array
                const wallet = Array.isArray(res.data) ? res.data[0] : res.data;
                return wallet ? wallet.balance : '0.0';
            }
            return '0.0';
        } catch (error) {
            console.error(`Error fetching balance for ${currency}:`, error);
            return '0.0';
        }
    }

    /**
     * Fetch default payment address
     */
    async fetchPaymentAddress(subAccountId: string, currency: string) {
        try {
            const response = await this.client.get(`/quidax/users/${subAccountId}/wallets/${currency}/address`);
            return response.data;
        } catch (error) {
            // 404 might mean no address exists yet
            return null;
        }
    }

    /**
     * Fetch all payment addresses for a wallet
     */
    async fetchPaymentAddresses(subAccountId: string, currency: string) {
        try {
            const response = await this.client.get(`/quidax/users/${subAccountId}/wallets/${currency}/addresses`);
            return response.data;
        } catch (error) {
            this.handleError(error, 'fetchPaymentAddresses');
        }
    }

    /**
     * Create a new payment address
     * @param network e.g. 'trc20', 'erc20', 'bitcoin'
     */
    async createPaymentAddress(subAccountId: string, currency: string, network: string = 'bitcoin') {
        try {
            // For USDT, typically trc20 or erc20. For BTC, 'bitcoin'.
            const response = await this.client.post(`/quidax/users/${subAccountId}/wallets/${currency}/addresses`, {
                network
            });
            return response.data;
        } catch (error) {
            this.handleError(error, 'createPaymentAddress');
        }
    }

    // Updated getAddress to use the dedicated endpoint
    async getAddress(subAccountId: string, currency: string) {
        try {
            // First try to get the existing default address
            const res = await this.fetchPaymentAddress(subAccountId, currency);
            if (res && res.data) {
                const addrObj = Array.isArray(res.data) ? res.data[0] : res.data;
                if (addrObj && addrObj.address) return addrObj;
            }

            // If no address, we might want to auto-create one for better UX?
            // Or just return null and let the bot prompt creation.
            // For now, return null.
            return null;
        } catch (error) {
            console.error(`Error fetching address for ${currency}:`, error);
            return null;
        }
    }

    // --- SWAP METHODS ---

    async createSwapQuotation(subAccountId: string, fromCurrency: string, toCurrency: string, fromAmount: string) {
        try {
            const response = await this.client.post(`/quidax/users/${subAccountId}/swap_quotation`, {
                from_currency: fromCurrency,
                to_currency: toCurrency,
                from_amount: fromAmount
            });
            return response.data;
        } catch (error) {
            this.handleError(error, 'createSwapQuotation');
        }
    }

    async confirmSwapQuotation(subAccountId: string, quotationId: string) {
        try {
            const response = await this.client.post(`/quidax/users/${subAccountId}/swap_quotation/${quotationId}/confirm`);
            return response.data;
        } catch (error) {
            this.handleError(error, 'confirmSwapQuotation');
        }
    }

    async getSwapTransactions(subAccountId: string) {
        try {
            const response = await this.client.get(`/quidax/users/${subAccountId}/swap_transactions`);
            return response.data;
        } catch (error) {
            this.handleError(error, 'getSwapTransactions');
            return null;
        }
    }

    // --- DRAWAL (WITHDRAWAL) METHODS ---

    async fetchWithdrawals(subAccountId: string, currency?: string) {
        try {
            let url = `/quidax/users/${subAccountId}/withdraws`;
            if (currency) url += `?currency=${currency}`;
            const response = await this.client.get(url);
            return response.data;
        } catch (error) {
            this.handleError(error, 'fetchWithdrawals');
            return null;
        }
    }

    async createWithdrawal(subAccountId: string, currency: string, amount: string, fundUid: string, network: string = 'bitcoin') {
        try {
            const response = await this.client.post(`/quidax/users/${subAccountId}/withdraws`, {
                currency,
                amount,
                fund_uid: fundUid, // The destination address or fund UID
                transaction_note: 'Withdrawal via Bot',
                network
            });
            return response.data;
        } catch (error) {
            this.handleError(error, 'createWithdrawal');
        }
    }

    // --- DEPOSIT METHODS ---

    async fetchDeposits(subAccountId: string, currency?: string) {
        try {
            let url = `/quidax/users/${subAccountId}/deposits`;
            if (currency) url += `?currency=${currency}`;
            const response = await this.client.get(url);
            return response.data;
        } catch (error) {
            this.handleError(error, 'fetchDeposits');
            return null;
        }
    }
}

export const sendbitService = new SendbitService();
