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
exports.quidaxService = exports.QuidaxService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
class QuidaxService {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: 'https://www.quidax.com/api/v1',
            headers: {
                'Authorization': `Bearer ${env_1.config.quidaxSecretKey}`,
                'Content-Type': 'application/json',
            },
        });
    }
    // Helper to handle API errors
    handleError(error, context) {
        if (error.response) {
            console.error(`Quidax API Error [${context}]:`, error.response.data);
            throw new Error(`Quidax Error: ${error.response.data.message || error.message}`);
        }
        else {
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
    createSubAccount(email, firstName, lastName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.post('/users', {
                    email,
                    first_name: firstName,
                    last_name: lastName,
                });
                return response.data.data;
            }
            catch (error) {
                this.handleError(error, 'createSubAccount');
            }
        });
    }
    /**
     * Get user details by ID (meant for sub-accounts)
     * @param userId Quidax user ID
     */
    getUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(`/users/${userId}`);
                return response.data.data;
            }
            catch (error) {
                this.handleError(error, 'getUser');
            }
        });
    }
    /**
     * Get user wallet for specific currency
     * @param userId Quidax user ID
     * @param currency e.g., 'btc', 'eth', 'usdt'
     */
    getWallet(userId, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(`/users/${userId}/wallets/${currency}`);
                return response.data.data;
            }
            catch (error) {
                this.handleError(error, `getWallet-${currency}`);
            }
        });
    }
    /**
     * Get deposit address for a user's wallet
     * @param userId Quidax user ID
     * @param currency e.g., 'btc', 'eth'
     */
    getAddress(userId, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(`/users/${userId}/wallets/${currency}/address`);
                return response.data.data;
            }
            catch (error) {
                // Some wallets might not have an address generated yet, handle creation if API requires explicit generation
                // Quidax usually generates address on wallet access or via specific endpoint.
                // If 404, we might need to create it.
                this.handleError(error, `getAddress-${currency}`);
            }
        });
    }
    /**
     * Fetch user's crypto balance (from their specific wallet)
     * @param userId Quidax user ID
     * @param currency e.g., 'btc'
     */
    fetchBalance(userId, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.getWallet(userId, currency);
            return wallet ? wallet.balance : '0.0';
        });
    }
}
exports.QuidaxService = QuidaxService;
exports.quidaxService = new QuidaxService();
