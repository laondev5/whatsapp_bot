"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendbitService = exports.SendbitService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const uuid_1 = require("uuid");
class SendbitService {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: env_1.config.sendbitBaseUrl,
            headers: {
                'Client-Id': env_1.config.sendbitClientId,
                'Client-Secret': env_1.config.sendbitClientSecret,
                'Webhook-Signing-Secret': env_1.config.webhookSigningSecret,
                'Content-Type': 'application/json',
            },
        });
        // Add interceptor to inject Request-ID if not present
        this.client.interceptors.request.use((reqConfig) => {
            if (!reqConfig.headers['Request-ID']) {
                reqConfig.headers['Request-ID'] = (0, uuid_1.v4)();
            }
            return reqConfig;
        });
    }
    handleError(error, context) {
        if (error.response) {
            console.error(`Sendbit API Error [${context}]:`, error.response.data);
            throw new Error(`Sendbit Error: ${JSON.stringify(error.response.data)}`);
        }
        else {
            console.error(`Network/Server Error [${context}]:`, error.message);
            throw error;
        }
    }
    // Placeholder methods for User/Wallet/Address mapping
    // Waiting for specific endpoints from documentation
    /**
     * Create a user/sub-account in Sendbit (wrapping Quidax)
     * Maps the local userId to the providerUserId in Sendbit.
     */
    createWallet(email, firstName, lastName, phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.post(`/quidax/users`, {
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: phoneNumber
                });
                return response.data;
            }
            catch (error) {
                this.handleError(error, 'createWallet');
            }
        });
    }
    getWallet(subAccountId, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(`/quidax/users/${subAccountId}/wallets/${currency}`);
                // Depending on response structure: { success: true, data: { ... } } or { success: true, data: [ ... ] }
                // Example response showed data: [ null ], which is weird, but assuming standard 'data' object on success
                return response.data;
            }
            catch (error) {
                this.handleError(error, `getWallet-${currency}`);
            }
        });
    }
    getBalance(subAccountId, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.getWallet(subAccountId, currency);
                if (res && res.data) {
                    // Assuming res.data contains the wallet object directly or in an array
                    const wallet = Array.isArray(res.data) ? res.data[0] : res.data;
                    return wallet ? wallet.balance : '0.0';
                }
                return '0.0';
            }
            catch (error) {
                console.error(`Error fetching balance for ${currency}:`, error);
                return '0.0';
            }
        });
    }
    /**
     * Fetch default payment address
     */
    fetchPaymentAddress(subAccountId, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(`/quidax/users/${subAccountId}/wallets/${currency}/address`);
                return response.data;
            }
            catch (error) {
                // 404 might mean no address exists yet
                return null;
            }
        });
    }
    /**
     * Fetch all payment addresses for a wallet
     */
    fetchPaymentAddresses(subAccountId, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(`/quidax/users/${subAccountId}/wallets/${currency}/addresses`);
                return response.data;
            }
            catch (error) {
                this.handleError(error, 'fetchPaymentAddresses');
            }
        });
    }
    /**
     * Create a new payment address
     * @param network e.g. 'trc20', 'erc20', 'bitcoin'
     */
    createPaymentAddress(subAccountId_1, currency_1) {
        return __awaiter(this, arguments, void 0, function* (subAccountId, currency, network = 'bitcoin') {
            try {
                // For USDT, typically trc20 or erc20. For BTC, 'bitcoin'.
                const response = yield this.client.post(`/quidax/users/${subAccountId}/wallets/${currency}/addresses`, {
                    network
                });
                return response.data;
            }
            catch (error) {
                this.handleError(error, 'createPaymentAddress');
            }
        });
    }
    // Updated getAddress to use the dedicated endpoint
    getAddress(subAccountId, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First try to get the existing default address
                const res = yield this.fetchPaymentAddress(subAccountId, currency);
                if (res && res.data) {
                    const addrObj = Array.isArray(res.data) ? res.data[0] : res.data;
                    if (addrObj && addrObj.address)
                        return addrObj;
                }
                // If no address, we might want to auto-create one for better UX?
                // Or just return null and let the bot prompt creation.
                // For now, return null.
                return null;
            }
            catch (error) {
                console.error(`Error fetching address for ${currency}:`, error);
                return null;
            }
        });
    }
}
exports.SendbitService = SendbitService;
exports.sendbitService = new SendbitService();
