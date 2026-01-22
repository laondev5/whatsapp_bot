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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
class WhatsAppService {
    static sendMessage(to, text) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!env_1.config.phoneNumberId || !env_1.config.whatsappToken) {
                    console.error('Missing WhatsApp config');
                    return;
                }
                yield axios_1.default.post(`https://graph.facebook.com/v17.0/${env_1.config.phoneNumberId}/messages`, {
                    messaging_product: 'whatsapp',
                    to: to,
                    text: { body: text },
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${env_1.config.whatsappToken}`,
                    },
                });
            }
            catch (error) {
                console.error('Error sending message:', error.response ? error.response.data : error.message);
            }
        });
    }
    static sendInteractiveMessage(to, bodyText, buttons) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!env_1.config.phoneNumberId || !env_1.config.whatsappToken)
                    return;
                yield axios_1.default.post(`https://graph.facebook.com/v17.0/${env_1.config.phoneNumberId}/messages`, {
                    messaging_product: 'whatsapp',
                    to: to,
                    type: 'interactive',
                    interactive: {
                        type: 'button',
                        body: { text: bodyText },
                        action: {
                            buttons: buttons.map(btn => ({
                                type: 'reply',
                                reply: {
                                    id: btn.id,
                                    title: btn.title
                                }
                            }))
                        }
                    },
                }, {
                    headers: {
                        Authorization: `Bearer ${env_1.config.whatsappToken}`,
                    }
                });
            }
            catch (error) {
                console.error('Error sending interactive msg:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            }
        });
    }
    static sendListMessage(to, headerText, bodyText, buttonText, sections) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!env_1.config.phoneNumberId || !env_1.config.whatsappToken)
                    return;
                yield axios_1.default.post(`https://graph.facebook.com/v17.0/${env_1.config.phoneNumberId}/messages`, {
                    messaging_product: 'whatsapp',
                    to: to,
                    type: 'interactive',
                    interactive: {
                        type: 'list',
                        header: {
                            type: 'text',
                            text: headerText
                        },
                        body: {
                            text: bodyText
                        },
                        footer: {
                            text: 'Select an option'
                        },
                        action: {
                            button: buttonText,
                            sections: sections
                        }
                    }
                }, {
                    headers: {
                        Authorization: `Bearer ${env_1.config.whatsappToken}`,
                    }
                });
            }
            catch (error) {
                console.error('Error sending list msg:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            }
        });
    }
}
exports.WhatsAppService = WhatsAppService;
