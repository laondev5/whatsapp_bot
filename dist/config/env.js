"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 3000,
    webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN,
    whatsappToken: process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    quidaxSecretKey: process.env.QUIDAX_SECRET_KEY,
    sendbitClientId: process.env.SENDBIT_CLIENT_ID,
    sendbitClientSecret: process.env.SENDBIT_CLIENT_SECRET,
    sendbitBaseUrl: process.env.SENDBIT_BASE_URL || 'https://sendbitdevenv.otybtechnologies.com/api/integrations/v1',
    webhookSigningSecret: process.env.WEBHOOK_SIGNING_SECRET,
};
