"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.GeminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class GeminiService {
    static initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                console.warn('GEMINI_API_KEY not found in .env');
                return;
            }
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
            try {
                const kbPath = path.join(__dirname, '../data/sendbit_knowledge.md');
                if (fs.existsSync(kbPath)) {
                    this.knowledgeBase = fs.readFileSync(kbPath, 'utf-8');
                }
                else {
                    console.warn('Knowledge base file not found:', kbPath);
                }
            }
            catch (error) {
                console.error('Error loading knowledge base:', error);
            }
        });
    }
    static classifyIntent(userQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.model)
                yield this.initialize();
            if (!this.model)
                return { isCommand: false };
            const prompt = `
        Analyze the following user input for a crypto bot.
        Determine if it matches one of these specific commands:
        - "create_wallet" (keywords: create, new wallet, sign up)
        - "view_balance" (keywords: balance, how much i have)
        - "send_crypto" (keywords: send, withdraw, transfer)
        - "receive_crypto" (keywords: receive, deposit, address)
        - "swap_crypto" (keywords: swap, exchange, convert)
        - "update_account" (keywords: update profile, change details)
        - "check_prices" (keywords: price, rate, market)
        - "view_history" (keywords: history, transactions)
        
        Also check if it is a generic greeting (hello, hi, hey).

        User Input: "${userQuery}"

        Return PURE JSON in this format (no markdown):
        {
            "isCommand": boolean,
            "command": string | null, // one of the above keys or null
            "isGreeting": boolean
        }
        `;
            try {
                const result = yield this.model.generateContent(prompt);
                const response = result.response.text();
                const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(cleanJson);
            }
            catch (error) {
                console.error('Gemini classification error:', error);
                return { isCommand: false };
            }
        });
    }
    static generateResponse(userQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.model)
                yield this.initialize();
            if (!this.model)
                return "I'm having trouble connecting to my brain right now.";
            const prompt = `
        You are the AI assistant for Sendbit, a crypto and payment platform.
        Use the following Knowledge Base to answer the user's question.
        If the answer is not in the Knowledge Base, politely say you don't know but offer to show the menu.
        Keep answers concise and friendly (WhatsApp style).

        --- KNOWLEDGE BASE ---
        ${this.knowledgeBase}
        ----------------------

        User Question: "${userQuery}"

        Answer:
        `;
            try {
                const result = yield this.model.generateContent(prompt);
                return result.response.text();
            }
            catch (error) {
                console.error('Gemini response error:', error);
                return "Sorry, I couldn't process that request.";
            }
        });
    }
}
exports.GeminiService = GeminiService;
GeminiService.knowledgeBase = '';
