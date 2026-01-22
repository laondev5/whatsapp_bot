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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotService = void 0;
const whatsapp_service_1 = require("./whatsapp.service");
const crypto_service_1 = require("./crypto.service");
const gemini_service_1 = require("./gemini.service");
const userStates = {};
class BotService {
    static handleIncomingMessage(from, messageBody) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let text = (_a = messageBody.text) === null || _a === void 0 ? void 0 : _a.body;
            if (messageBody.interactive) {
                if (messageBody.interactive.type === 'button_reply') {
                    text = messageBody.interactive.button_reply.id;
                }
                else if (messageBody.interactive.type === 'list_reply') {
                    text = messageBody.interactive.list_reply.id;
                }
            }
            const input = text === null || text === void 0 ? void 0 : text.trim();
            if (!input)
                return;
            let state = userStates[from] || { step: 'MAIN_MENU', data: {} };
            // Global Cancel Handler
            if (input.toLowerCase() === 'cancel' || input.toLowerCase() === 'menu') {
                state = { step: 'MAIN_MENU', data: {} };
                userStates[from] = state;
                return this.sendMainMenu(from);
            }
            // If in MAIN_MENU and input is NOT a known command/number, use AI
            if (state.step === 'MAIN_MENU') {
                const isNumber = /^\d+$/.test(input);
                const isKnownCommand = [
                    'create_wallet', 'view_balance', 'send_crypto', 'receive_crypto',
                    'view_wallet_address', 'create_payment_address', 'view_individual_wallet',
                    'swap_crypto', 'update_account', 'check_prices', 'view_guide', 'view_history',
                    'view_help', 'cancel'
                ].some(cmd => input.toLowerCase().includes(cmd) || cmd.includes(input.toLowerCase()));
                if (!isNumber && !isKnownCommand) {
                    // AI Intent Detection
                    const aiResult = yield gemini_service_1.GeminiService.classifyIntent(input);
                    if (aiResult.isCommand && aiResult.command) {
                        yield this.handleMainMenu(from, aiResult.command, state);
                        return;
                    }
                    else if (aiResult.isGreeting) {
                        yield whatsapp_service_1.WhatsAppService.sendMessage(from, "Hello! 👋 I'm your Sendbit AI assistant. How can I help you today?");
                        return; // Don't show menu immediately, let them ask
                    }
                    else {
                        // AI Q&A
                        const aiResponse = yield gemini_service_1.GeminiService.generateResponse(input);
                        yield whatsapp_service_1.WhatsAppService.sendMessage(from, aiResponse);
                        // Optionally show menu prompt after
                        yield whatsapp_service_1.WhatsAppService.sendMessage(from, "Enter 'menu' to see options.");
                        return;
                    }
                }
            }
            switch (state.step) {
                case 'MAIN_MENU':
                    yield this.handleMainMenu(from, input, state);
                    break;
                case 'CREATE_ACCOUNT_EMAIL':
                    yield this.handleCreateAccountEmail(from, input, state);
                    break;
                case 'CREATE_ACCOUNT_FIRSTNAME':
                    yield this.handleCreateAccountFirstName(from, input, state);
                    break;
                case 'CREATE_ACCOUNT_LASTNAME':
                    yield this.handleCreateAccountLastName(from, input, state);
                    break;
                case 'SEND_AMOUNT':
                    yield this.handleSendAmount(from, input, state);
                    break;
                case 'SEND_ADDRESS':
                    yield this.handleSendAddress(from, input, state);
                    break;
                case 'SWAP_AMOUNT':
                    yield this.handleSwapAmount(from, input, state);
                    break;
                case 'SELECT_PAYMENT_ADDRESS_CURRENCY':
                    yield this.handleSelectPaymentAddressCurrency(from, input, state);
                    break;
                case 'SELECT_INDIVIDUAL_WALLET_CURRENCY':
                    yield this.handleSelectIndividualWalletCurrency(from, input, state);
                    break;
                case 'RECEIVE_CRYPTO_CURRENCY':
                    yield this.handleReceiveCryptoCurrency(from, input, state);
                    break;
            }
        });
    }
    static sendMainMenu(to) {
        return __awaiter(this, void 0, void 0, function* () {
            const isRegistered = crypto_service_1.CryptoService.isUserRegistered(to);
            const menuText = isRegistered
                ? `Welcome back! 🤖\n\n1️⃣ View Balances\n2️⃣ View Coin Balance\n3️⃣ Send Crypto\n4️⃣ Receive Crypto\n5️⃣ Create Address\n6️⃣ Swap Crypto\n7️⃣ Update Account\n8️⃣ Help\n9️⃣ History\n🔟 Cancel\n\n_Reply with a number or select below._`
                : `Welcome to CryptoBot! 🤖\n\n1️⃣ Create Wallet\n2️⃣ Check Prices\n3️⃣ Guide\n\n_Reply with a number or select below._`;
            let sections = [];
            if (isRegistered) {
                // MAX 10 ROWS ALLOWED
                sections = [
                    {
                        title: 'Wallet',
                        rows: [
                            { id: 'view_balance', title: 'View Balances', description: 'Check all balances' },
                            { id: 'view_individual_wallet', title: 'View Coin Balance', description: 'Check specifics (BTC/ETH/USDT)' }
                        ]
                    },
                    {
                        title: 'Actions',
                        rows: [
                            { id: 'send_crypto', title: 'Send Crypto', description: 'Withdraw funds' },
                            { id: 'receive_crypto', title: 'Receive Crypto', description: 'Get payment address' },
                            { id: 'create_payment_address', title: 'Create Address', description: 'Generate new address' },
                            { id: 'swap_crypto', title: 'Swap Crypto', description: 'Exchange coins' },
                            { id: 'update_account', title: 'Update Account', description: 'Update profile' }
                        ]
                    },
                    {
                        title: 'More',
                        rows: [
                            { id: 'view_help', title: 'Help', description: 'How to use' },
                            { id: 'view_history', title: 'History', description: 'Recent transactions' },
                            { id: 'cancel', title: 'Cancel' }
                        ]
                    }
                ];
            }
            else {
                sections = [
                    {
                        title: 'Get Started',
                        rows: [
                            { id: 'create_wallet', title: 'Create Wallet', description: 'Start your crypto journey' }
                        ]
                    },
                    {
                        title: 'Info',
                        rows: [
                            { id: 'check_prices', title: 'Check Prices' },
                            { id: 'view_guide', title: 'Guide' }
                        ]
                    }
                ];
            }
            yield whatsapp_service_1.WhatsAppService.sendListMessage(to, 'CryptoBot Menu', menuText, 'Open Menu', sections);
            userStates[to] = { step: 'MAIN_MENU', data: {} };
        });
    }
    static handleMainMenu(from, input, state) {
        return __awaiter(this, void 0, void 0, function* () {
            let command = input.toLowerCase();
            const isRegistered = crypto_service_1.CryptoService.isUserRegistered(from);
            // Numeric Mapping
            if (isRegistered) {
                const map = {
                    '1': 'view_balance',
                    '2': 'view_individual_wallet',
                    '3': 'send_crypto',
                    '4': 'receive_crypto',
                    '5': 'create_payment_address',
                    '6': 'swap_crypto',
                    '7': 'update_account',
                    '8': 'view_help',
                    '9': 'view_history',
                    '10': 'cancel',
                    '0': 'cancel'
                };
                if (map[command])
                    command = map[command];
            }
            else {
                const map = {
                    '1': 'create_wallet',
                    '2': 'check_prices',
                    '3': 'view_guide'
                };
                if (map[command])
                    command = map[command];
            }
            // --- COMMAND HANDLING ---
            if (command === 'create_wallet' || command.includes('create wallet')) {
                if (isRegistered && command !== 'update_account') {
                    return whatsapp_service_1.WhatsAppService.sendMessage(from, '✅ You already have a wallet! Use "Update Account" if needed.');
                }
                state.step = 'CREATE_ACCOUNT_EMAIL';
                userStates[from] = state;
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, 'To create/update your account, please enter your *Email Address*:');
            }
            else if (command === 'update_account') {
                state.step = 'CREATE_ACCOUNT_EMAIL';
                userStates[from] = state;
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, '🔄 Update Mode\nPlease enter your *Email Address*:');
            }
            else if (command === 'view_balance') {
                const balance = yield crypto_service_1.CryptoService.getBalance(from);
                if (!balance)
                    return whatsapp_service_1.WhatsAppService.sendMessage(from, '❌ Fetch failed.');
                const text = `💰 *Your Balances:*\nBTC: ${balance.BTC}\nETH: ${balance.ETH}\nUSDT: ${balance.USDT}`;
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, text);
            }
            else if (command === 'view_individual_wallet') {
                state.step = 'SELECT_INDIVIDUAL_WALLET_CURRENCY';
                userStates[from] = state;
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, 'Which wallet? (Reply "BTC", "ETH", "USDT")');
            }
            else if (command === 'receive_crypto') {
                // New specific receive flow
                state.step = 'RECEIVE_CRYPTO_CURRENCY';
                userStates[from] = state;
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, '📥 Which currency would you like to receive? (Reply "BTC" or "USDT")');
            }
            else if (command === 'create_payment_address') {
                state.step = 'SELECT_PAYMENT_ADDRESS_CURRENCY';
                userStates[from] = state;
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, 'Which currency to create address for? (Reply "BTC" or "USDT")');
            }
            else if (command === 'send_crypto') {
                userStates[from] = { step: 'SEND_AMOUNT', data: { currency: 'USDT' } };
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, 'Enter the amount of USDT to send:');
            }
            else if (command === 'swap_crypto') {
                userStates[from] = { step: 'SWAP_AMOUNT', data: { from: 'USDT', to: 'BTC' } };
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, 'Enter amount of USDT to swap to BTC:');
            }
            else if (command === 'check_prices') {
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, '📈 *Current Prices:*\nBTC: $50,000\nETH: $3,000\nUSDT: $1.00');
            }
            else if (command === 'view_help' || command === 'view_guide') {
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, 'ℹ️ *Guide:*\n\n1. Use *View Balances* to check funds.\n2. *Receive Crypto* gets you an address to deposit.\n3. *Send Crypto* to withdraw.\n4. *Create Address* if you need a new one.');
            }
            else if (command === 'view_history') {
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, '📜 *Transaction History:*\n(No recent transactions found)');
            }
            else if (command === 'cancel') {
                yield this.sendMainMenu(from);
            }
            else {
                yield this.sendMainMenu(from);
            }
        });
    }
    // --- Sub-handlers ---
    static handleCreateAccountEmail(from, input, state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!input.includes('@') || !input.includes('.')) {
                return whatsapp_service_1.WhatsAppService.sendMessage(from, '❌ Invalid email. Try again or type "cancel".');
            }
            state.data.email = input;
            state.step = 'CREATE_ACCOUNT_FIRSTNAME';
            userStates[from] = state;
            yield whatsapp_service_1.WhatsAppService.sendMessage(from, 'Enter your *First Name*:');
        });
    }
    static handleCreateAccountFirstName(from, input, state) {
        return __awaiter(this, void 0, void 0, function* () {
            state.data.firstName = input;
            state.step = 'CREATE_ACCOUNT_LASTNAME';
            userStates[from] = state;
            yield whatsapp_service_1.WhatsAppService.sendMessage(from, 'Enter your *Last Name*:');
        });
    }
    static handleCreateAccountLastName(from, input, state) {
        return __awaiter(this, void 0, void 0, function* () {
            state.data.lastName = input;
            yield whatsapp_service_1.WhatsAppService.sendMessage(from, '⏳ Processing account...');
            try {
                yield crypto_service_1.CryptoService.createWallet(from, state.data.email, state.data.firstName, state.data.lastName);
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, `✅ Account ready! Welcome, ${state.data.firstName}.`);
                yield this.sendMainMenu(from);
            }
            catch (err) {
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, `❌ Error: ${err.message}`);
                yield this.sendMainMenu(from);
            }
        });
    }
    static handleSelectPaymentAddressCurrency(from, input, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const currency = input.toLowerCase();
            let network = 'bitcoin';
            if (currency === 'usdt')
                network = 'trc20';
            else if (currency === 'btc')
                network = 'bitcoin';
            else {
                return whatsapp_service_1.WhatsAppService.sendMessage(from, '❌ Invalid currency. Reply "BTC" or "USDT" or "cancel".');
            }
            yield whatsapp_service_1.WhatsAppService.sendMessage(from, `⏳ Generating ${currency.toUpperCase()} address...`);
            try {
                const res = yield crypto_service_1.CryptoService.createAddress(from, currency, network);
                if (res && res.data && res.data.address) {
                    yield whatsapp_service_1.WhatsAppService.sendMessage(from, `✅ New ${currency.toUpperCase()} Address:\n${res.data.address}`);
                }
                else {
                    yield whatsapp_service_1.WhatsAppService.sendMessage(from, '❌ Failed to generate address (might already exist).');
                }
            }
            catch (e) {
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, `❌ Error: ${e.message}`);
            }
            yield this.sendMainMenu(from);
        });
    }
    static handleReceiveCryptoCurrency(from, input, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const currency = input.toLowerCase();
            if (!['btc', 'usdt'].includes(currency)) {
                return whatsapp_service_1.WhatsAppService.sendMessage(from, '❌ Supported: BTC, USDT. Try again or "cancel".');
            }
            yield whatsapp_service_1.WhatsAppService.sendMessage(from, `⏳ Fetching ${currency.toUpperCase()} address...`);
            try {
                const addrObj = yield crypto_service_1.CryptoService.getAddress(from, currency);
                if (addrObj && addrObj.address) {
                    yield whatsapp_service_1.WhatsAppService.sendMessage(from, `📥 *Your ${currency.toUpperCase()} Address:*\n\n${addrObj.address}`);
                }
                else {
                    yield whatsapp_service_1.WhatsAppService.sendMessage(from, `❌ No address found for ${currency.toUpperCase()}.\nPlease use "Create Address" option first.`);
                }
            }
            catch (err) {
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, '❌ Error fetching address.');
            }
            yield this.sendMainMenu(from);
        });
    }
    static handleSelectIndividualWalletCurrency(from, input, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const currency = input.toLowerCase();
            if (!['btc', 'eth', 'usdt'].includes(currency)) {
                return whatsapp_service_1.WhatsAppService.sendMessage(from, '❌ Supported: BTC, ETH, USDT. Try again or "cancel".');
            }
            try {
                const balances = yield crypto_service_1.CryptoService.getBalance(from);
                if (balances) {
                    const val = balances[currency.toUpperCase()] || '0.0';
                    yield whatsapp_service_1.WhatsAppService.sendMessage(from, `💰 *${currency.toUpperCase()} Wallet*\nBalance: ${val}`);
                }
                else {
                    yield whatsapp_service_1.WhatsAppService.sendMessage(from, '❌ Could not load wallet.');
                }
            }
            catch (e) {
                yield whatsapp_service_1.WhatsAppService.sendMessage(from, '❌ Error loading wallet.');
            }
            yield this.sendMainMenu(from);
        });
    }
    static handleSendAmount(from, input, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const amount = parseFloat(input);
            if (isNaN(amount) || amount <= 0)
                return whatsapp_service_1.WhatsAppService.sendMessage(from, '❌ Invalid amount.');
            state.data.amount = amount;
            state.step = 'SEND_ADDRESS';
            userStates[from] = state;
            yield whatsapp_service_1.WhatsAppService.sendMessage(from, 'Enter recipient address:');
        });
    }
    static handleSendAddress(from, input, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = input;
            const result = yield crypto_service_1.CryptoService.sendCrypto(from, state.data.currency, state.data.amount, address);
            yield whatsapp_service_1.WhatsAppService.sendMessage(from, result);
            yield this.sendMainMenu(from);
        });
    }
    static handleSwapAmount(from, input, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const amount = parseFloat(input);
            if (isNaN(amount) || amount <= 0)
                return whatsapp_service_1.WhatsAppService.sendMessage(from, '❌ Invalid amount.');
            const result = yield crypto_service_1.CryptoService.swapCrypto(from, state.data.from, state.data.to, amount);
            yield whatsapp_service_1.WhatsAppService.sendMessage(from, result);
            yield this.sendMainMenu(from);
        });
    }
}
exports.BotService = BotService;
