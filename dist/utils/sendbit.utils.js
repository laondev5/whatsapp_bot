"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySendBitWebhook = verifySendBitWebhook;
const crypto_1 = __importDefault(require("crypto"));
function verifySendBitWebhook(req, res, clientSecret) {
    var _a, _b, _c;
    const timestamp = String((_a = req.header('Webhook-Timestamp')) !== null && _a !== void 0 ? _a : '');
    const signature = String((_b = req.header('Webhook-Signature')) !== null && _b !== void 0 ? _b : '');
    const rawBody = (_c = req.rawBody) !== null && _c !== void 0 ? _c : ''; // capture raw body via express.raw() middleware
    if (!timestamp || !signature) {
        // If headers are missing, it might not be a Sendbit webhook, or it's malformed.
        // Depending on strictness, we might fallback or return false.
        // For now, logging and returning false is safer if this endpoint is exclusive.
        console.warn('Missing Sendbit Webhook headers');
        return false;
    }
    // Recommended: Check timestamp freshness (e.g. 5 mins)
    const now = Math.floor(Date.now() / 1000);
    const ts = parseInt(timestamp, 10);
    if (isNaN(ts) || Math.abs(now - ts) > 300) {
        console.warn('Sendbit Webhook timestamp too old or invalid');
        res.status(401).send('Invalid timestamp');
        return false;
    }
    const expected = crypto_1.default
        .createHmac('sha256', clientSecret)
        .update(`${timestamp}.${rawBody}`)
        .digest('hex');
    const expectedBuf = Buffer.from(expected);
    const signatureBuf = Buffer.from(signature);
    if (expectedBuf.length !== signatureBuf.length) {
        res.status(401).send('Invalid signature');
        return false;
    }
    if (!crypto_1.default.timingSafeEqual(expectedBuf, signatureBuf)) {
        res.status(401).send('Invalid signature');
        return false;
    }
    return true;
}
