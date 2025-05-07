const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

class WhatsAppService {
    constructor() {
        this.sock = null;
        this.csStatus = {
            isAvailable: true,
            lastActivity: null
        };
        this.userStates = new Map();
        this.csChats = new Map(); // Track ongoing CS chats: userId -> { startTime, timeoutId }
    }

    async initialize(messageHandler) {
        try {
            // Create auth folder if it doesn't exist
            const AUTH_FOLDER = './auth';
            if (!fs.existsSync(AUTH_FOLDER)) {
                fs.mkdirSync(AUTH_FOLDER);
            }

            // Load or create auth state
            const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

            // Create WhatsApp socket connection
            this.sock = makeWASocket({
                printQRInTerminal: true,
                auth: state,
                logger: logger
            });

            // Handle connection updates
            this.sock.ev.on('connection.update', this.handleConnectionUpdate.bind(this));

            // Handle credentials updates
            this.sock.ev.on('creds.update', saveCreds);

            // Handle incoming messages
            this.sock.ev.on('messages.upsert', async ({ messages }) => {
                for (const message of messages) {
                    await this.handleIncomingMessage(message, messageHandler);
                }
            });

        } catch (error) {
            logger.errorWithContext(error, {
                service: 'WhatsAppService',
                method: 'initialize'
            });
            throw error;
        }
    }

    handleConnectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            logger.info({
                type: 'connection_update',
                status: 'closed',
                shouldReconnect,
                error: lastDisconnect?.error
            });
            
            if (shouldReconnect) {
                this.initialize();
            }
        } else if (connection === 'open') {
            logger.info({
                type: 'connection_update',
                status: 'opened'
            });
        }

        if (qr) {
            qrcode.generate(qr, { small: true });
        }
    }

    async handleIncomingMessage(message, messageHandler) {
        try {
            const { remoteJid, fromMe, id } = message.key;
            const messageText = message?.message?.conversation || 
                              message?.message?.extendedTextMessage?.text || '';
            const messageType = Object.keys(message.message)[0];

            // Ignore messages from self unless they're from CS
            if (fromMe && remoteJid !== config.CS_CONTACT_ID) return;

            // Handle CS messages differently
            if (remoteJid === config.CS_CONTACT_ID) {
                await this.handleCSMessage(messageText);
                return;
            }

            // Handle user messages
            if (this.userStates.get(remoteJid) === config.STATES.CHATTING_CS) {
                await this.forwardToCS(remoteJid, messageText);
            } else {
                await messageHandler(this.sock, message);
            }

        } catch (error) {
            logger.errorWithContext(error, {
                service: 'WhatsAppService',
                method: 'handleIncomingMessage'
            });
        }
    }

    async handleCSMessage(messageText) {
        try {
            // Expected format: "User: <user_id>; Reply: <message>"
            const match = messageText.match(/User: (.+?); Reply: (.+)/);
            if (!match) {
                await this.sock.sendMessage(config.CS_CONTACT_ID, {
                    text: 'Format pesan salah. Gunakan format: "User: <user_id>; Reply: <pesan>"'
                });
                return;
            }

            const [, userId, reply] = match;
            
            // Send reply to user
            await this.sock.sendMessage(userId, { text: reply });
            
            logger.csInteraction('cs_to_user', userId, config.CS_CONTACT_ID, reply);

        } catch (error) {
            logger.errorWithContext(error, {
                service: 'WhatsAppService',
                method: 'handleCSMessage'
            });
        }
    }

    async forwardToCS(userId, message) {
        try {
            const formattedMessage = `[Pesan dari ${userId}]: ${message}`;
            await this.sock.sendMessage(config.CS_CONTACT_ID, { text: formattedMessage });
            
            logger.csInteraction('user_to_cs', userId, config.CS_CONTACT_ID, message);

        } catch (error) {
            logger.errorWithContext(error, {
                service: 'WhatsAppService',
                method: 'forwardToCS'
            });
        }
    }

    async startCSChat(userId) {
        try {
            // Set user state to waiting for CS
            this.userStates.set(userId, config.STATES.WAITING_CS);
            
            // Notify user
            await this.sock.sendMessage(userId, { text: config.MESSAGES.WAITING_CS });
            
            // Notify CS
            await this.sock.sendMessage(config.CS_CONTACT_ID, {
                text: `⚡ Ada permintaan chat baru dari ${userId}`
            });

            // Set timeout for CS response
            const timeoutId = setTimeout(async () => {
                if (this.userStates.get(userId) === config.STATES.WAITING_CS) {
                    await this.handleCSTimeout(userId);
                }
            }, config.CS_TIMEOUT);

            // Track CS chat
            this.csChats.set(userId, {
                startTime: Date.now(),
                timeoutId
            });

            logger.csInteraction('chat_request', userId, config.CS_CONTACT_ID, 'Chat request initiated');

        } catch (error) {
            logger.errorWithContext(error, {
                service: 'WhatsAppService',
                method: 'startCSChat'
            });
        }
    }

    async handleCSTimeout(userId) {
        try {
            // Send timeout message to user
            await this.sock.sendMessage(userId, { text: config.MESSAGES.CS_TIMEOUT });
            
            // Reset user state
            this.userStates.set(userId, config.STATES.MAIN_MENU);
            
            // Clean up CS chat tracking
            const chatInfo = this.csChats.get(userId);
            if (chatInfo) {
                clearTimeout(chatInfo.timeoutId);
                this.csChats.delete(userId);
            }

            logger.csInteraction('cs_timeout', userId, config.CS_CONTACT_ID, 'CS response timeout');

        } catch (error) {
            logger.errorWithContext(error, {
                service: 'WhatsAppService',
                method: 'handleCSTimeout'
            });
        }
    }

    // Getter for user states
    getUserState(userId) {
        return this.userStates.get(userId) || config.STATES.MAIN_MENU;
    }

    // Setter for user states
    setUserState(userId, state) {
        const oldState = this.getUserState(userId);
        this.userStates.set(userId, state);
        logger.stateChange(userId, oldState, state);
    }
}

module.exports = new WhatsAppService();
