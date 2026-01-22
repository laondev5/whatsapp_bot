import { WhatsAppService } from './whatsapp.service';
import { CryptoService } from './crypto.service';

interface UserState {
    step: 'MAIN_MENU' |
    'CREATE_ACCOUNT_EMAIL' | 'CREATE_ACCOUNT_FIRSTNAME' | 'CREATE_ACCOUNT_LASTNAME' |
    'SEND_AMOUNT' | 'SEND_ADDRESS' |
    'SWAP_FROM_CURRENCY' | 'SWAP_TO_CURRENCY' | 'SWAP_AMOUNT' | 'SWAP_CONFIRM' |
    'WITHDRAW_CURRENCY' | 'WITHDRAW_AMOUNT' | 'WITHDRAW_ADDRESS' | 'WITHDRAW_NETWORK' | 'WITHDRAW_CONFIRM' |
    'SELECT_PAYMENT_ADDRESS_CURRENCY' | 'SELECT_INDIVIDUAL_WALLET_CURRENCY' |
    'RECEIVE_CRYPTO_CURRENCY' | 'HISTORY_MENU' |
    'SELL_CURRENCY' | 'SELL_AMOUNT' | 'SELL_CONFIRM' | 'SELL_PAYMENT_EVIDENCE' |
    'TEST_SELL_AMOUNT' | 'TEST_SELL_ADDRESS' | 'TEST_SELL_CONFIRM';
    data: any;
}

const userStates: Record<string, UserState> = {};

export class BotService {
    static async handleIncomingMessage(from: string, messageBody: any) {
        let text = messageBody.text?.body;
        if (messageBody.interactive) {
            if (messageBody.interactive.type === 'button_reply') {
                text = messageBody.interactive.button_reply.id;
            } else if (messageBody.interactive.type === 'list_reply') {
                text = messageBody.interactive.list_reply.id;
            }
        }

        const input = text?.trim();
        if (!input) return;

        let state = userStates[from] || { step: 'MAIN_MENU', data: {} };

        // Global Cancel Handler
        if (input.toLowerCase() === 'cancel' || input.toLowerCase() === 'menu') {
            state = { step: 'MAIN_MENU', data: {} };
            userStates[from] = state;
            return this.sendMainMenu(from);
        }

        // If in MAIN_MENU and input is NOT a known command/number, use AI -> REMOVED AI
        // Now if unknown, we just re-show menu or ignore. 
        // Let's just default to showing menu if unknown command in MAIN_MENU for better UX without AI.

        switch (state.step) {
            case 'MAIN_MENU':
                await this.handleMainMenu(from, input, state);
                break;
            case 'CREATE_ACCOUNT_EMAIL':
                await this.handleCreateAccountEmail(from, input, state);
                break;
            case 'CREATE_ACCOUNT_FIRSTNAME':
                await this.handleCreateAccountFirstName(from, input, state);
                break;
            case 'CREATE_ACCOUNT_LASTNAME':
                await this.handleCreateAccountLastName(from, input, state);
                break;
            case 'SEND_AMOUNT':
                await this.handleSendAmount(from, input, state);
                break;
            case 'SEND_ADDRESS':
                await this.handleSendAddress(from, input, state);
                break;
            case 'SWAP_FROM_CURRENCY':
                await this.handleSwapFromCurrency(from, input, state);
                break;
            case 'SWAP_TO_CURRENCY':
                await this.handleSwapToCurrency(from, input, state);
                break;
            case 'SWAP_AMOUNT':
                await this.handleSwapAmount(from, input, state);
                break;
            case 'SWAP_CONFIRM':
                await this.handleSwapConfirm(from, input, state);
                break;
            case 'WITHDRAW_CURRENCY':
                await this.handleWithdrawCurrency(from, input, state);
                break;
            case 'WITHDRAW_AMOUNT':
                await this.handleWithdrawAmount(from, input, state);
                break;
            case 'WITHDRAW_ADDRESS':
                await this.handleWithdrawAddress(from, input, state);
                break;
            case 'WITHDRAW_NETWORK':
                await this.handleWithdrawNetwork(from, input, state);
                break;
            case 'WITHDRAW_CONFIRM':
                await this.handleWithdrawConfirm(from, input, state);
                break;
            case 'HISTORY_MENU':
                await this.handleHistoryMenu(from, input, state);
                break;
            case 'SELL_CURRENCY':
                await this.handleSellCurrency(from, input, state);
                break;
            case 'SELL_AMOUNT':
                await this.handleSellAmount(from, input, state);
                break;
            case 'SELL_CONFIRM':
                await this.handleSellConfirm(from, input, state);
                break;
            case 'SELL_PAYMENT_EVIDENCE':
                await this.handleSellPaymentEvidence(from, input, state);
                break;
            case 'TEST_SELL_AMOUNT':
                await this.handleTestSellAmount(from, input, state);
                break;
            case 'TEST_SELL_ADDRESS':
                await this.handleTestSellAddress(from, input, state);
                break;
            case 'TEST_SELL_CONFIRM':
                await this.handleTestSellConfirm(from, input, state);
                break;
        }

    }

    static async sendMainMenu(to: string) {
        const isRegistered = CryptoService.isUserRegistered(to);
        const menuText = isRegistered
            ? `Welcome back! 🤖\n\n1️⃣ View Balances\n2️⃣ View Coin Balance\n3️⃣ Send Crypto\n4️⃣ Receive Crypto\n5️⃣ Create Address\n6️⃣ Swap Crypto\n7️⃣ Sell Crypto\n8️⃣ Help\n9️⃣ History\n🔟 Cancel\n\n_Reply with a number or select below._`
            : `Hello there! 👋 Welcome to CryptoBot!\n\nI can help you create a wallet, check prices, and more.\n\n1️⃣ Create Wallet\n2️⃣ Get Rate\n3️⃣ Check Prices\n4️⃣ Guide\n\n_Reply with a number or select below._`;

        let sections = [];

        if (isRegistered) {
            // MAX 10 ROWS ALLOWED - Currently 10 rows total
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
                        { id: 'swap_crypto', title: 'Swap Crypto', description: 'Instant Swap' },
                        { id: 'sell_crypto', title: 'Sell Crypto', description: 'Sell your crypto' }
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
        } else {
            sections = [
                {
                    title: 'Get Started',
                    rows: [
                        { id: 'create_wallet', title: 'Create Wallet', description: 'Start your crypto journey' },
                        { id: 'get_rate', title: 'Get Rate', description: 'Check current rates' }
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

        await WhatsAppService.sendListMessage(to, 'CryptoBot Menu', menuText, 'Open Menu', sections);
        userStates[to] = { step: 'MAIN_MENU', data: {} };
    }

    private static async handleMainMenu(from: string, input: string, state: UserState) {
        let command = input.toLowerCase();
        const isRegistered = CryptoService.isUserRegistered(from);

        // Numeric Mapping
        if (isRegistered) {
            const map: Record<string, string> = {
                '1': 'view_balance',
                '2': 'view_individual_wallet',
                '3': 'send_crypto',
                '4': 'receive_crypto',
                '5': 'create_payment_address',
                '6': 'swap_crypto',
                '7': 'sell_crypto',
                '8': 'view_help',
                '9': 'view_history',
                '10': 'cancel',
                '0': 'cancel'
            };
            if (map[command]) command = map[command];
        } else {
            const map: Record<string, string> = {
                '1': 'create_wallet',
                '2': 'get_rate',
                '3': 'check_prices',
                '4': 'view_guide'
            };
            if (map[command]) command = map[command];
        }

        // --- COMMAND HANDLING ---

        if (command === 'create_wallet' || command.includes('create wallet')) {
            if (isRegistered && command !== 'update_account') {
                return WhatsAppService.sendMessage(from, '✅ You already have a wallet! Use "Update Account" if needed.');
            }
            state.step = 'CREATE_ACCOUNT_EMAIL';
            userStates[from] = state;
            await WhatsAppService.sendMessage(from, 'To create/update your account, please enter your *Email Address*:');
        }
        else if (command === 'update_account') {
            state.step = 'CREATE_ACCOUNT_EMAIL';
            userStates[from] = state;
            await WhatsAppService.sendMessage(from, '🔄 Update Mode\nPlease enter your *Email Address*:');
        }
        else if (command === 'view_balance') {
            const balance = await CryptoService.getBalance(from);
            if (!balance) return WhatsAppService.sendMessage(from, '❌ Fetch failed.');
            const text = `💰 *Your Balances:*\nBTC: ${balance.BTC}\nETH: ${balance.ETH}\nUSDT: ${balance.USDT}`;
            await WhatsAppService.sendMessage(from, text);
        }
        else if (command === 'view_individual_wallet') {
            state.step = 'SELECT_INDIVIDUAL_WALLET_CURRENCY';
            userStates[from] = state;
            await WhatsAppService.sendMessage(from, 'Which wallet? (Reply "BTC", "ETH", "USDT")');
        }
        else if (command === 'receive_crypto') {
            // New specific receive flow
            state.step = 'RECEIVE_CRYPTO_CURRENCY';
            userStates[from] = state;
            await WhatsAppService.sendMessage(from, '📥 Which currency would you like to receive? (Reply "BTC", "USDT" or "ETH")');
        }
        else if (command === 'create_payment_address') {
            state.step = 'SELECT_PAYMENT_ADDRESS_CURRENCY';
            userStates[from] = state;
            await WhatsAppService.sendMessage(from, 'Which currency to create address for? (Reply "BTC", "USDT" or "ETH")');
        }
        else if (command === 'send_crypto') {
            state.step = 'WITHDRAW_CURRENCY';
            userStates[from] = state;
            await WhatsAppService.sendListMessage(from, 'Withdrawal', 'Select Currency to Withdraw:', 'Select Currency', [
                { title: 'Currencies', rows: [{ id: 'BTC', title: 'Bitcoin (BTC)' }, { id: 'USDT', title: 'Tether (USDT)' }, { id: 'ETH', title: 'Ethereum (ETH)' }] }
            ]);
        }
        else if (command === 'swap_crypto') {
            state.step = 'SWAP_FROM_CURRENCY';
            userStates[from] = state;
            await WhatsAppService.sendListMessage(from, 'Instant Swap', 'Select Currency to Swap FROM:', 'Select Currency', [
                { title: 'Currencies', rows: [{ id: 'BTC', title: 'Bitcoin (BTC)' }, { id: 'USDT', title: 'Tether (USDT)' }, { id: 'ETH', title: 'Ethereum (ETH)' }] }
            ]);
        }
        else if (command === 'sell_crypto') {
            state.step = 'SELL_CURRENCY';
            userStates[from] = state;
            await WhatsAppService.sendListMessage(from, 'Sell Crypto', 'Select Asset to Sell:', 'Select Asset', [
                { title: 'Assets', rows: [{ id: 'BTC', title: 'Bitcoin (BTC)' }, { id: 'USDT', title: 'Tether (USDT)' }, { id: 'ETH', title: 'Ethereum (ETH)' }] }
            ]);
        }
        else if (command === 'check_prices') {
            await WhatsAppService.sendMessage(from, '📈 *Current Prices:*\nBTC: $50,000\nETH: $3,000\nUSDT: $1.00');
        }
        else if (command === 'view_help' || command === 'view_guide') {
            await WhatsAppService.sendMessage(from, 'ℹ️ *Guide:*\n\n1. Use *View Balances* to check funds.\n2. *Receive Crypto* gets you an address to deposit.\n3. *Send Crypto* to withdraw funds to external wallet.\n4. *Swap Crypto* to convert between BTC and USDT.\n5. *Sell Crypto* to sell your assets for fiat.\n6. *History* to view past transactions.');
        }
        else if (command === 'view_history') {
            state.step = 'HISTORY_MENU';
            userStates[from] = state;
            await WhatsAppService.sendListMessage(from, 'Transaction History', 'Select History Type:', 'View History', [
                {
                    title: 'Types', rows: [
                        { id: 'swaps', title: 'Swap Transactions' },
                        { id: 'withdrawals', title: 'Withdrawals' },
                        { id: 'deposits', title: 'Deposits' }
                    ]
                }
            ]);
        }
        else if (command === 'get_rate') {
            // Mock rates for now, typically fetched from API
            const rates = {
                BTC: { buy: '105,000,000', sell: '102,000,000' },
                ETH: { buy: '4,500,000', sell: '4,200,000' },
                USDT: { buy: '1,650', sell: '1,630' }
            };

            const msg = `💰 *Current Rates (NGN):*\n\n` +
                `*BTC:*\nBuy: ₦${rates.BTC.buy} | Sell: ₦${rates.BTC.sell}\n\n` +
                `*ETH:*\nBuy: ₦${rates.ETH.buy} | Sell: ₦${rates.ETH.sell}\n\n` +
                `*USDT:*\nBuy: ₦${rates.USDT.buy} | Sell: ₦${rates.USDT.sell}\n\n` +
                `_Note: Transactions above $500 attract a 0.2% fee._`;

            await WhatsAppService.sendMessage(from, msg);
            // Show menu again? Or let them type menu.
            // Maybe better to show the message and return
        }
        else if (command === 'test_sell') {
            await WhatsAppService.sendMessage(from, '⚠️ *THIS IS FOR TESTING PURPOSES ONLY* ⚠️\n\nThis will simulate a sell transaction. Nothing will actually be deducted.\n\nEnter amount to "sell":');
            state.step = 'TEST_SELL_AMOUNT';
            userStates[from] = state;
        }
        else if (command === 'cancel') {
            await this.sendMainMenu(from);
        }
        else {
            await this.sendMainMenu(from);
        }
    }

    // --- SELL CRYPTO HANDLERS ---

    private static async handleSellCurrency(from: string, input: string, state: UserState) {
        const currency = input.toUpperCase();
        if (!['BTC', 'USDT', 'ETH'].includes(currency)) {
            return WhatsAppService.sendMessage(from, '❌ Invalid Asset. Reply BTC, USDT, or ETH.');
        }

        state.data.sellCurrency = currency;
        state.step = 'SELL_AMOUNT';
        userStates[from] = state;
        await WhatsAppService.sendMessage(from, `Enter amount of ${currency} you want to sell:`);
    }

    private static async handleSellAmount(from: string, input: string, state: UserState) {
        const amount = parseFloat(input);
        if (isNaN(amount) || amount <= 0) return WhatsAppService.sendMessage(from, '❌ Invalid amount.');

        state.data.sellAmount = amount;

        // Calculate Charges
        // 2% fixed
        // + 0.5% if > $500 (Assuming USDT value approx for logic, or just raw amount if stable)
        // For simplicity let's assume raw amount > 500 triggers extra charge or we need price.
        // Let's assume price is $1 for USDT, and mock others or just apply logic on raw value if user meant $ value.
        // The prompt asked "transactions more that 500$".
        // We'd ideally need to convert amount to USD.
        // For now, let's assume 1 unit = $1 for simple logic OR fetching real price.
        // Let's use a mock price for calculation.

        let price = 0;
        if (state.data.sellCurrency === 'USDT') price = 1;
        else if (state.data.sellCurrency === 'BTC') price = 50000;
        else if (state.data.sellCurrency === 'ETH') price = 3000;

        const totalValueUsd = amount * price;

        const baseCharge = totalValueUsd * 0.02; // 2%
        const extraCharge = totalValueUsd > 500 ? totalValueUsd * 0.005 : 0; // 0.5%
        const totalCharge = baseCharge + extraCharge;
        const totalReceivable = totalValueUsd - totalCharge;
        // Note: Receivable usually in Fiat (NGN), but let's show USD deduction first.

        state.data.totalCharge = totalCharge;
        state.data.totalValueUsd = totalValueUsd;

        const msg = `🧾 *Sell Confirmation*\n\n` +
            `Selling: ${amount} ${state.data.sellCurrency}\n` +
            `Value: $${totalValueUsd.toFixed(2)}\n` +
            `Charges: $${totalCharge.toFixed(2)} (2%${totalValueUsd > 500 ? ' + 0.5%' : ''})\n` +
            `Net Est. Value: $${totalReceivable.toFixed(2)}\n\n` +
            `_Reply 'yes' to confirm or 'cancel'._`;

        state.step = 'SELL_CONFIRM';
        userStates[from] = state;

        await WhatsAppService.sendInteractiveMessage(from, msg, [
            { id: 'confirm_sell', title: 'Yes, Proceed' },
            { id: 'cancel', title: 'Cancel' }
        ]);
    }

    private static async handleSellConfirm(from: string, input: string, state: UserState) {
        if (input.toLowerCase() !== 'confirm_sell' && input.toLowerCase() !== 'yes') {
            await WhatsAppService.sendMessage(from, '❌ Sell cancelled.');
            return this.sendMainMenu(from);
        }

        // Display Wallet for payment
        // In a real app, we'd generate a unique address or providing a pool address.
        // Using static addresses for demo.
        let walletAddress = '';
        if (state.data.sellCurrency === 'BTC') walletAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
        else if (state.data.sellCurrency === 'ETH') walletAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
        else if (state.data.sellCurrency === 'USDT') walletAddress = 'T9yD14Nj9j7xAB4dbGeiX9h8unkkhxn\n(TRC20)';

        state.step = 'SELL_PAYMENT_EVIDENCE';
        userStates[from] = state;

        const msg = `✅ Transfer Funds Here:\n\n` +
            `*${state.data.sellCurrency} Address:*\n${walletAddress}\n\n` +
            `Amount: ${state.data.sellAmount} ${state.data.sellCurrency}\n\n` +
            `PLEASE Upload payment evidence (screenshot/image) or type 'done' after transfer.`;

        await WhatsAppService.sendMessage(from, msg);
    }

    private static async handleSellPaymentEvidence(from: string, input: string, state: UserState) {
        // Here we would handle image processing if Twilio/WhatsApp API sends media urls.
        // For this text-based bot logic, we assume user types 'done' or message contains text.
        // If actual image handling is needed, `handleIncomingMessage` needs media parsing.

        // Simulating success
        await WhatsAppService.sendMessage(from, `✅ *Evidence Received!*\n\nVerfication in progress. Your account will be credited shortly.\n\nThank you for using Sendbit!`);
        await this.sendMainMenu(from);
    }

    // --- Sub-handlers ---

    private static async handleCreateAccountEmail(from: string, input: string, state: UserState) {
        if (!input.includes('@') || !input.includes('.')) {
            return WhatsAppService.sendMessage(from, '❌ Invalid email. Try again or type "cancel".');
        }
        state.data.email = input;
        state.step = 'CREATE_ACCOUNT_FIRSTNAME';
        userStates[from] = state;
        await WhatsAppService.sendMessage(from, 'Enter your *First Name*:');
    }

    private static async handleCreateAccountFirstName(from: string, input: string, state: UserState) {
        state.data.firstName = input;
        state.step = 'CREATE_ACCOUNT_LASTNAME';
        userStates[from] = state;
        await WhatsAppService.sendMessage(from, 'Enter your *Last Name*:');
    }

    private static async handleCreateAccountLastName(from: string, input: string, state: UserState) {
        state.data.lastName = input;
        await WhatsAppService.sendMessage(from, '⏳ Processing account...');
        try {
            await CryptoService.createWallet(from, state.data.email, state.data.firstName, state.data.lastName);
            await WhatsAppService.sendMessage(from, `✅ Account ready! Welcome, ${state.data.firstName}.`);
            await this.sendMainMenu(from);
        } catch (err: any) {
            await WhatsAppService.sendMessage(from, `❌ Error: ${err.message}`);
            await this.sendMainMenu(from);
        }
    }

    private static async handleSelectPaymentAddressCurrency(from: string, input: string, state: UserState) {
        const currency = input.toLowerCase();
        let network = 'bitcoin';
        if (currency === 'usdt') network = 'trc20';
        else if (currency === 'btc') network = 'bitcoin';
        else if (currency === 'eth') network = 'ethereum';
        else {
            return WhatsAppService.sendMessage(from, '❌ Invalid currency. Reply "BTC", "USDT", "ETH" or "cancel".');
        }

        await WhatsAppService.sendMessage(from, `⏳ Generating ${currency.toUpperCase()} address...`);
        try {
            const res = await CryptoService.createAddress(from, currency, network);
            if (res && res.data && res.data.address) {
                await WhatsAppService.sendMessage(from, `✅ New ${currency.toUpperCase()} Address:\n${res.data.address}`);
            } else {
                await WhatsAppService.sendMessage(from, '❌ Failed to generate address (might already exist).');
            }
        } catch (e: any) {
            await WhatsAppService.sendMessage(from, `❌ Error: ${e.message}`);
        }
        await this.sendMainMenu(from);
    }

    private static async handleReceiveCryptoCurrency(from: string, input: string, state: UserState) {
        const currency = input.toLowerCase();
        if (!['btc', 'usdt', 'eth'].includes(currency)) {
            return WhatsAppService.sendMessage(from, '❌ Supported: BTC, USDT, ETH. Try again or "cancel".');
        }

        await WhatsAppService.sendMessage(from, `⏳ Fetching ${currency.toUpperCase()} address...`);
        try {
            const addrObj = await CryptoService.getAddress(from, currency);
            if (addrObj && addrObj.address) {
                await WhatsAppService.sendMessage(from, `📥 *Your ${currency.toUpperCase()} Address:*\n\n${addrObj.address}`);
            } else {
                await WhatsAppService.sendMessage(from, `❌ No address found for ${currency.toUpperCase()}.\nPlease use "Create Address" option first.`);
            }
        } catch (err: any) {
            await WhatsAppService.sendMessage(from, '❌ Error fetching address.');
        }
        await this.sendMainMenu(from);
    }

    private static async handleSelectIndividualWalletCurrency(from: string, input: string, state: UserState) {
        const currency = input.toLowerCase();
        if (!['btc', 'eth', 'usdt'].includes(currency)) {
            return WhatsAppService.sendMessage(from, '❌ Supported: BTC, ETH, USDT. Try again or "cancel".');
        }

        try {
            const balances = await CryptoService.getBalance(from);
            if (balances) {
                const val = (balances as any)[currency.toUpperCase()] || '0.0';
                await WhatsAppService.sendMessage(from, `💰 *${currency.toUpperCase()} Wallet*\nBalance: ${val}`);
            } else {
                await WhatsAppService.sendMessage(from, '❌ Could not load wallet.');
            }
        } catch (e) {
            await WhatsAppService.sendMessage(from, '❌ Error loading wallet.');
        }
        await this.sendMainMenu(from);
    }

    private static async handleSendAmount(from: string, input: string, state: UserState) {
        const amount = parseFloat(input);
        if (isNaN(amount) || amount <= 0) return WhatsAppService.sendMessage(from, '❌ Invalid amount.');
        state.data.amount = amount;
        state.step = 'SEND_ADDRESS';
        userStates[from] = state;
        await WhatsAppService.sendMessage(from, 'Enter recipient address:');
    }

    private static async handleSendAddress(from: string, input: string, state: UserState) {
        const address = input;
        const result = await CryptoService.sendCrypto(from, state.data.currency, state.data.amount, address);
        await WhatsAppService.sendMessage(from, result);
        await this.sendMainMenu(from);
    }

    private static async handleSwapFromCurrency(from: string, input: string, state: UserState) {
        const currency = input.toUpperCase();
        if (!['BTC', 'USDT', 'ETH'].includes(currency)) return WhatsAppService.sendMessage(from, '❌ Invalid. Reply BTC, USDT, or ETH.');

        state.data.from = currency;
        // Default target currency (simple logic found in many apps: if from BTC, to USDT, and vice versa)
        // But let's ask for TO currency to be explicit, or just auto-set.
        // Let's ask.
        state.step = 'SWAP_TO_CURRENCY';
        userStates[from] = state;

        await WhatsAppService.sendListMessage(from, 'Instant Swap', `Swapping FROM ${currency}. Select TO currency:`, 'Select Currency', [
            { title: 'Currencies', rows: [{ id: 'BTC', title: 'Bitcoin (BTC)' }, { id: 'USDT', title: 'Tether (USDT)' }, { id: 'ETH', title: 'Ethereum (ETH)' }] }
        ]);
    }

    private static async handleSwapToCurrency(from: string, input: string, state: UserState) {
        const currency = input.toUpperCase();
        if (!['BTC', 'USDT', 'ETH'].includes(currency)) return WhatsAppService.sendMessage(from, '❌ Invalid. Reply BTC, USDT, or ETH.');
        if (currency === state.data.from) return WhatsAppService.sendMessage(from, '❌ Cannot swap to same currency. Choose different.');

        state.data.to = currency;
        state.step = 'SWAP_AMOUNT';
        userStates[from] = state;

        await WhatsAppService.sendMessage(from, `Enter amount of ${state.data.from} to swap to ${state.data.to}:`);
    }

    private static async handleSwapAmount(from: string, input: string, state: UserState) {
        const amount = parseFloat(input);
        if (isNaN(amount) || amount <= 0) return WhatsAppService.sendMessage(from, '❌ Invalid amount.');

        state.data.amount = input; // Keep as string for API consistency
        await WhatsAppService.sendMessage(from, '⏳ Generating quote...');

        try {
            const quote = await CryptoService.createSwapQuote(from, state.data.from, state.data.to, state.data.amount);
            if (quote && quote.success && quote.data) {
                // Store quote ID
                state.data.quoteId = quote.data.id;
                state.data.quotation = quote.data; // Store full quote for display

                // Display Quote
                const receivedAmount = quote.data.to_amount;
                const rate = quote.data.exchange_rate; // Assuming field name
                const msg = `🧾 *Swap Quote*\n\nFrom: ${state.data.amount} ${state.data.from}\nTo: ${receivedAmount} ${state.data.to}\n\n_Valid for 15s_`;

                state.step = 'SWAP_CONFIRM';
                userStates[from] = state;

                // Send Interactive Button to Confirm
                await WhatsAppService.sendInteractiveMessage(from, msg, [
                    { id: 'confirm_swap', title: 'Confirm Swap' },
                    { id: 'cancel', title: 'Cancel' }
                ]);
            } else {
                await WhatsAppService.sendMessage(from, `❌ Quote Failed: ${quote?.message || 'Unknown error'}`);
                await this.sendMainMenu(from);
            }
        } catch (e: any) {
            await WhatsAppService.sendMessage(from, `❌ Error: ${e.message}`);
            await this.sendMainMenu(from);
        }
    }

    private static async handleSwapConfirm(from: string, input: string, state: UserState) {
        if (input.toLowerCase() !== 'confirm_swap') {
            await WhatsAppService.sendMessage(from, '❌ Swap cancelled.');
            return this.sendMainMenu(from);
        }

        await WhatsAppService.sendMessage(from, '⏳ Confirming swap...');
        try {
            const res = await CryptoService.confirmSwap(from, state.data.quoteId);
            if (res && res.success) {
                await WhatsAppService.sendMessage(from, '✅ Swap Successful! Check your balances.');
            } else {
                await WhatsAppService.sendMessage(from, `❌ Swap Confirmation Failed: ${res?.message || 'Expired?'}`);
            }
        } catch (e: any) {
            await WhatsAppService.sendMessage(from, `❌ Error: ${e.message}`);
        }
        await this.sendMainMenu(from);
    }

    // --- WITHDRAWAL HANDLERS ---

    private static async handleWithdrawCurrency(from: string, input: string, state: UserState) {
        const currency = input.toUpperCase();
        if (!['BTC', 'USDT', 'ETH'].includes(currency)) return WhatsAppService.sendMessage(from, '❌ Invalid. Reply BTC, USDT, or ETH.');

        state.data.currency = currency;
        state.step = 'WITHDRAW_AMOUNT';
        userStates[from] = state;
        await WhatsAppService.sendMessage(from, `Enter ${currency} amount to withdraw:`);
    }

    private static async handleWithdrawAmount(from: string, input: string, state: UserState) {
        const amount = parseFloat(input);
        if (isNaN(amount) || amount <= 0) return WhatsAppService.sendMessage(from, '❌ Invalid amount.');

        state.data.amount = input;
        state.step = 'WITHDRAW_ADDRESS';
        userStates[from] = state;
        await WhatsAppService.sendMessage(from, `Enter recipient ${state.data.currency} wallet address:`);
    }

    private static async handleWithdrawAddress(from: string, input: string, state: UserState) {
        if (input.length < 10) return WhatsAppService.sendMessage(from, '❌ Invalid address length. Try again.');

        state.data.address = input;

        // Ask for Network if USDT?
        if (state.data.currency === 'USDT') {
            state.step = 'WITHDRAW_NETWORK';
            userStates[from] = state;
            await WhatsAppService.sendListMessage(from, 'Withdrawal Network', 'Select Network:', 'Select Network', [
                { title: 'Networks', rows: [{ id: 'trc20', title: 'TRC20 (Tron)' }, { id: 'erc20', title: 'ERC20 (Ethereum)' }, { id: 'bep20', title: 'BEP20 (BSC)' }] }
            ]);
        } else {
            // Default networks
            state.data.network = state.data.currency === 'ETH' ? 'ethereum' : 'bitcoin';
            await this.askWithdrawConfirmation(from, state);
        }
    }

    private static async handleWithdrawNetwork(from: string, input: string, state: UserState) {
        state.data.network = input.toLowerCase();
        await this.askWithdrawConfirmation(from, state);
    }

    private static async askWithdrawConfirmation(from: string, state: UserState) {
        const msg = `Please Confirm Withdrawal:\n\nAmount: ${state.data.amount} ${state.data.currency}\nTo: ${state.data.address}\nNetwork: ${state.data.network}\n\n_Reply 'yes' to confirm or 'cancel'._`;
        state.step = 'WITHDRAW_CONFIRM';
        userStates[from] = state;
        await WhatsAppService.sendInteractiveMessage(from, msg, [
            { id: 'confirm_withdraw', title: 'Confirm' },
            { id: 'cancel', title: 'Cancel' }
        ]);
    }

    private static async handleWithdrawConfirm(from: string, input: string, state: UserState) {
        if (input.toLowerCase() !== 'confirm_withdraw' && input.toLowerCase() !== 'yes') {
            await WhatsAppService.sendMessage(from, '❌ Withdrawal cancelled.');
            return this.sendMainMenu(from);
        }

        await WhatsAppService.sendMessage(from, '⏳ Processing withdrawal...');
        try {
            const res = await CryptoService.createWithdrawal(from, state.data.currency, state.data.amount, state.data.address, state.data.network);
            if (res && res.success) {
                await WhatsAppService.sendMessage(from, '✅ Withdrawal request submitted successfully!');
            } else {
                await WhatsAppService.sendMessage(from, `❌ Withdrawal Failed: ${res?.message || 'Unknown error'}`);
            }
        } catch (e: any) {
            await WhatsAppService.sendMessage(from, `❌ Error: ${e.message}`);
        }
        await this.sendMainMenu(from);
    }

    // --- HISTORY HANDLER ---

    private static async handleHistoryMenu(from: string, input: string, state: UserState) {
        const type = input.toLowerCase();
        await WhatsAppService.sendMessage(from, `⏳ Fetching ${type} history...`);

        try {
            let data: any[] = [];
            let msg = '';

            if (type.includes('swap')) {
                const res = await CryptoService.getSwapHistory(from);
                data = res && res.success ? res.data : [];
                msg = `🔄 *Swap History:*\n\n`;
                if (!data.length) msg += 'No swaps found.';
                else {
                    data.slice(0, 5).forEach((item: any) => {
                        msg += `- ${item.from_amount} ${item.from_currency} ➡️ ${item.to_amount} ${item.to_currency} (${item.status})\n`;
                    });
                }
            } else if (type.includes('withdraw')) {
                const res = await CryptoService.getWithdrawals(from);
                data = res && res.success ? res.data : [];
                msg = `📤 *Withdrawal History:*\n\n`;
                if (!data.length) msg += 'No withdrawals found.';
                else {
                    data.slice(0, 5).forEach((item: any) => {
                        msg += `- ${item.amount} ${item.currency} to ...${item.fund_uid?.slice(-4) || ''} (${item.state})\n`;
                    });
                }
            } else if (type.includes('deposit')) {
                const res = await CryptoService.getDeposits(from);
                data = res && res.success ? res.data : [];
                msg = `📥 *Deposit History:*\n\n`;
                if (!data.length) msg += 'No deposits found.';
                else {
                    data.slice(0, 5).forEach((item: any) => {
                        msg += `- ${item.amount} ${item.currency} (${item.state})\n`;
                    });
                }
            } else {
                msg = '❌ Unknown history type.';
            }

            await WhatsAppService.sendMessage(from, msg);
        } catch (e: any) {
            await WhatsAppService.sendMessage(from, `❌ Error fetching history: ${e.message}`);
        }
        await this.sendMainMenu(from);
    }

    private static async handleTestSellAmount(from: string, input: string, state: UserState) {
        state.data.amount = input;
        state.step = 'TEST_SELL_ADDRESS';
        userStates[from] = state;
        await WhatsAppService.sendMessage(from, 'Enter bank/wallet address to receive funds (Mock):');
    }

    private static async handleTestSellAddress(from: string, input: string, state: UserState) {
        state.data.address = input;

        const msg = `⚠️ *TEST TRANSACTION* ⚠️\n\nSelling: ${state.data.amount}\nTo: ${state.data.address}\n\n_Reply 'yes' to confirm or 'cancel'._`;
        state.step = 'TEST_SELL_CONFIRM';
        userStates[from] = state;

        await WhatsAppService.sendInteractiveMessage(from, msg, [
            { id: 'confirm_test', title: 'Confirm Test' },
            { id: 'cancel', title: 'Cancel' }
        ]);
    }

    private static async handleTestSellConfirm(from: string, input: string, state: UserState) {
        if (input.toLowerCase() !== 'confirm_test' && input.toLowerCase() !== 'yes') {
            await WhatsAppService.sendMessage(from, '❌ Test cancelled.');
            return this.sendMainMenu(from);
        }
        await WhatsAppService.sendMessage(from, '✅ *TEST SUCCESSFUL*\n\nThis was a simulation. No real assets were moved.');
        await this.sendMainMenu(from);
    }
}
