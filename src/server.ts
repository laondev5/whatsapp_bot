import express from 'express';
import { config } from './config/env';
import webhookRoutes from './routes/webhook.routes';

const app = express();

app.use(express.json({
    verify: (req: any, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use(express.urlencoded({ extended: true }));

app.use('/api', webhookRoutes);

app.get('/', (req, res) => {
    res.send('WhatsApp Bot is running!');
});

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});
