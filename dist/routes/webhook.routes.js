"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhook_controller_1 = require("../controllers/webhook.controller");
const router = (0, express_1.Router)();
router.get('/webhook', webhook_controller_1.verifyWebhook);
router.post('/webhook', webhook_controller_1.handleMessage);
router.post('/sendbit', webhook_controller_1.handleSendbitWebhook);
exports.default = router;
