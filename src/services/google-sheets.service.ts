import { google } from 'googleapis';
import { config } from '../config/env';

export class GoogleSheetsService {
    private static auth: any;
    private static sheets: any;

    private static async initialize() {
        if (this.sheets) return;

        this.auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: config.googleServiceAccountEmail,
                private_key: config.googlePrivateKey?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    }

    static async appendTransaction(data: any[]) {
        try {
            await this.initialize();

            const spreadsheetId = config.googleSheetId;
            const range = 'Sheet1!A1'; // Assumes the first sheet is named Sheet1

            await this.sheets.spreadsheets.values.append({
                spreadsheetId,
                range,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [data],
                },
            });
            console.log('Transaction appended to Google Sheets');
        } catch (error) {
            console.error('Error appending to Google Sheets:', error);
        }
    }
}
