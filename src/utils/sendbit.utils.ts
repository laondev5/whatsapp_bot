import crypto from 'crypto';
import type { Request, Response } from 'express';

export function verifySendBitWebhook(req: Request, res: Response, clientSecret: string): boolean {
    const timestamp = String(req.header('Webhook-Timestamp') ?? '');
    const signature = String(req.header('Webhook-Signature') ?? '');
    const rawBody = (req as any).rawBody ?? ''; // capture raw body via express.raw() middleware

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

    const expected = crypto
        .createHmac('sha256', clientSecret)
        .update(`${timestamp}.${rawBody}`)
        .digest('hex');

    const expectedBuf = Buffer.from(expected);
    const signatureBuf = Buffer.from(signature);

    if (expectedBuf.length !== signatureBuf.length) {
        res.status(401).send('Invalid signature');
        return false;
    }

    if (!crypto.timingSafeEqual(expectedBuf, signatureBuf)) {
        res.status(401).send('Invalid signature');
        return false;
    }

    return true;
}
