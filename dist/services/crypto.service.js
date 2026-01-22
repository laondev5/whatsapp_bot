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
exports.CryptoService = void 0;
const sendbit_service_1 = require("./sendbit.service");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_FILE = path_1.default.join(__dirname, '../../data/users.json');
// Load mappings
let userMappings = {};
try {
    if (fs_1.default.existsSync(DATA_FILE)) {
        userMappings = JSON.parse(fs_1.default.readFileSync(DATA_FILE, 'utf-8'));
    }
}
catch (error) {
    console.error('Error loading user mappings:', error);
}
const saveMappings = () => {
    try {
        if (!fs_1.default.existsSync(path_1.default.dirname(DATA_FILE))) {
            fs_1.default.mkdirSync(path_1.default.dirname(DATA_FILE), { recursive: true });
        }
        fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(userMappings, null, 2));
    }
    catch (error) {
        console.error('Error saving user mappings:', error);
    }
};
class CryptoService {
    static isUserRegistered(userId) {
        const user = userMappings[userId];
        return !!(user && user.sendbitId);
    }
    static createWallet(userId, email, firstName, lastName, phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const result = yield sendbit_service_1.sendbitService.createWallet(email, firstName, lastName, cleanPhoneNumber);
                if (result && result.success && result.data && result.data.id) {
                    userMappings[userId] = {
                        email: email,
                        firstName,
                        lastName,
                        sendbitId: result.data.id
                    };
                    saveMappings();
                    return result;
                }
                else {
                    throw new Error((result === null || result === void 0 ? void 0 : result.message) || 'Failed to create/update sub-account on Sendbit');
                }
            }
            catch (error) {
                throw new Error(`Wallet Creation Failed: ${error.message}`);
            }
        });
    }
    static getBalance(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // We don't strictly need userMappings to fetch balance if we trust userId matches
            // But checking if they are registered is good practice
            const user = userMappings[userId];
            if (!user || !user.sendbitId) {
                console.error(`User ${userId} not registered or missing Sendbit ID`);
                return null;
            }
            try {
                const [btc, eth, usdt] = yield Promise.all([
                    sendbit_service_1.sendbitService.getBalance(user.sendbitId, 'btc'),
                    sendbit_service_1.sendbitService.getBalance(user.sendbitId, 'eth'),
                    sendbit_service_1.sendbitService.getBalance(user.sendbitId, 'usdt'),
                ]);
                return {
                    BTC: btc,
                    ETH: eth,
                    USDT: usdt
                };
            }
            catch (error) {
                console.error('Error fetching balances:', error);
                return { BTC: '0.0', ETH: '0.0', USDT: '0.0' };
            }
        });
    }
    static getAddress(userId, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = userMappings[userId];
            if (!user || !user.sendbitId)
                return null;
            return yield sendbit_service_1.sendbitService.getAddress(user.sendbitId, currency);
        });
    }
    static createAddress(userId, currency, network) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = userMappings[userId];
            if (!user || !user.sendbitId)
                return null;
            // Default network handling
            if (!network) {
                if (currency === 'usdt')
                    network = 'trc20'; // default to cheap TRC20
                else if (currency === 'btc')
                    network = 'bitcoin';
                else
                    network = currency;
            }
            return yield sendbit_service_1.sendbitService.createPaymentAddress(user.sendbitId, currency, network);
        });
    }
    static sendCrypto(userId, currency, amount, toAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implement withdrawal/send logic via SendbitService later
            return "Feature coming soon: Real crypto withdrawal via Sendbit.";
        });
    }
    static swapCrypto(userId, from, to, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implement swap logic via SendbitService later
            return "Feature coming soon: Real crypto swap via Sendbit.";
        });
    }
}
exports.CryptoService = CryptoService;
