import axios from 'axios';
import { config } from '../config/env';

export class WhatsAppService {
    static async sendMessage(to: string, text: string) {
        try {
            if (!config.phoneNumberId || !config.whatsappToken) {
                console.error('Missing WhatsApp config');
                return;
            }

            await axios.post(
                `https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    to: to,
                    text: { body: text },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${config.whatsappToken}`,
                    },
                }
            );
        } catch (error: any) {
            console.error('Error sending message:', error.response ? error.response.data : error.message);
        }
    }

    static async sendInteractiveMessage(to: string, bodyText: string, buttons: { id: string, title: string }[]) {
        try {
            if (!config.phoneNumberId || !config.whatsappToken) return;

            await axios.post(
                `https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages`,
                {
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
                },
                {
                    headers: {
                        Authorization: `Bearer ${config.whatsappToken}`,
                    }
                }
            );
        } catch (error: any) {
            console.error('Error sending interactive msg:', error.response?.data || error.message);
        }
    }

    static async sendListMessage(to: string, headerText: string, bodyText: string, buttonText: string, sections: { title: string, rows: { id: string, title: string, description?: string }[] }[]) {
        try {
            if (!config.phoneNumberId || !config.whatsappToken) return;

            await axios.post(
                `https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages`,
                {
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
                },
                {
                    headers: {
                        Authorization: `Bearer ${config.whatsappToken}`,
                    }
                }
            );
        } catch (error: any) {
            console.error('Error sending list msg:', error.response?.data || error.message);
        }
    }
}
