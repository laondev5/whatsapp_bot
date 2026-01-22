import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export class GeminiService {
    private static genAI: GoogleGenerativeAI;
    private static model: any;
    private static knowledgeBase: string = '';

    static async initialize() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY not found in .env');
            return;
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        try {
            const kbPath = path.join(__dirname, '../data/sendbit_knowledge.md');
            if (fs.existsSync(kbPath)) {
                this.knowledgeBase = fs.readFileSync(kbPath, 'utf-8');
            } else {
                console.warn('Knowledge base file not found:', kbPath);
            }
        } catch (error) {
            console.error('Error loading knowledge base:', error);
        }
    }

    static async classifyIntent(userQuery: string): Promise<{ isCommand: boolean; command?: string; isGreeting?: boolean }> {
        if (!this.model) await this.initialize();
        if (!this.model) return { isCommand: false };

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
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (error) {
            console.error('Gemini classification error:', error);
            return { isCommand: false };
        }
    }

    static async generateResponse(userQuery: string): Promise<string> {
        if (!this.model) await this.initialize();
        if (!this.model) return "I'm having trouble connecting to my brain right now.";

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
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error('Gemini response error:', error);
            return "Sorry, I couldn't process that request.";
        }
    }
}
