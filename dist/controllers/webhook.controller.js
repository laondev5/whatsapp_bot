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
exports.handleSendbitWebhook = exports.handleMessage = exports.verifyWebhook = void 0;
const env_1 = require("../config/env");
const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode === 'subscribe' && token === env_1.config.webhookVerifyToken) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        }
        else {
            res.sendStatus(403);
        }
    }
    else {
        res.sendStatus(400);
    }
};
exports.verifyWebhook = verifyWebhook;
const bot_service_1 = require("../services/bot.service");
const handleMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    // Check if this is an event from a WhatsApp API subscription
    if (body.object) {
        // console.log('Incoming webhook:', JSON.stringify(body, null, 2));
        if (body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0] &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]) {
            const message = body.entry[0].changes[0].value.messages[0];
            const from = message.from;
            // Process message asynchronously so we don't block the 200 OK response
            bot_service_1.BotService.handleIncomingMessage(from, message).catch(err => console.error('Error handling message:', err));
        }
        res.status(200).send('EVENT_RECEIVED');
    }
    else {
        res.sendStatus(404);
    }
});
exports.handleMessage = handleMessage;
const sendbit_utils_1 = require("../utils/sendbit.utils");
const handleSendbitWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify signature
    if (!env_1.config.sendbitClientSecret) {
        console.error('Sendbit Client Secret not configured');
        res.status(500).send('Server Configuration Error');
        return;
    }
    const isValid = (0, sendbit_utils_1.verifySendBitWebhook)(req, res, env_1.config.sendbitClientSecret);
    if (!isValid)
        return; // verifySendBitWebhook handles the error response
    console.log('Received valid Sendbit Webhook:', JSON.stringify(req.body, null, 2));
    // TODO: Handle specific events from Sendbit (Deposit, etc.)
    res.status(200).send('Event Received');
});
exports.handleSendbitWebhook = handleSendbitWebhook;
