"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const webhook_routes_1 = __importDefault(require("./routes/webhook.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api', webhook_routes_1.default);
app.get('/', (req, res) => {
    res.send('WhatsApp Bot is running!');
});
app.listen(env_1.config.port, () => {
    console.log(`Server is running on port ${env_1.config.port}`);
});
