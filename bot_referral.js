
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Added CORS support
const axios = require('axios');

const token = '6716679212:AAGcvTcekc_V77GIntj_CJYFeHHy78jT4LE'; // Replace with your bot's token
const WEB_APP_URL = "https://elfinmetaverse.com/";
const game_photo_url = 'http://ec2-54-254-221-210.ap-southeast-1.compute.amazonaws.com/public/tg_referral_photo.png'; // Ensure this is correct

// const elfin_api = "https://api-testnet.elfin.games";
const elfin_api = "https://api.elfin.games";
// const elfin_web = "https://testnet.elfin.games";
const elfin_web = "https://elfinmetaverse.com";


const bot = new TelegramBot(token, {
    polling: {
      interval: 1000,
      autoStart: true,
      params: {
        timeout: 10
      }
    }
  });

const app = express();
app.use(cors()); // Enable CORS
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));
// const short_name = 'tggametest';


// Bot command to start the game with an inline keyboard button in a private chat
bot.onText(/\/start/, async(msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    if (msg.chat.type === 'private') {
        let inviteCode = await getInviteCode(userId);
        let captionText = "🎮 How to Participate: 🏆 \n1. 👥 Invite your squad: Get friends to register and finish tasks 📝 \n2. 🤝 Team up and dominate: Play more matches together 🔥 \n3. 📈 Level up your crew: Activate more friends to boost your team 🚀";

        if(inviteCode){
            captionText += `\n\nYour reffral link:\n${elfin_web}/?inviteCode=${inviteCode}`;
        }else{
            captionText += `\n\n🔗 Link your Telegram account to the Elfin website to receive your unique invite code!\nhttps://elfinmetaverse.com/dashboard`;
        }

        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Play Game', url: WEB_APP_URL}],
                    [{ text: 'Twitter', url: 'https://x.com/intent/follow?original_referer=https%3A%2F%2Fdeveloper.x.com%2F&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Efollow%7Ctwgr%5ENASA&screen_name=ElfinGames' }, { text: 'Discord', url: 'https://discord.gg/vZRr3pTDv4' }, { text: 'Galxe', url: 'https://app.galxe.com/quest/ElfinMetaverse?filter=%5B%22Active%22%2C%22NotStarted%22%5D' }],
                    [{ text: '官方中文群', url: 'https://t.me/ElfinKDMCN' }, { text: 'English Group', url: 'https://t.me/ElfinKDM' }],
                ]
            }
        };
        bot.sendPhoto(chatId, game_photo_url, { caption: captionText, reply_markup: options.reply_markup })
            .catch(error => {
                console.error('Error sending game photo:', error);
            });
    } else {
        bot.sendMessage(chatId, "Please start the game in a private chat.");
    }
});
// Callback query handler for the leaderboard button
bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;

    if (callbackQuery.data === 'leaderboard') {
        await fetchAndSendLeaderboard(chatId);
    }
});

async function getInviteCode(telegramId) {
    try {
        const response = await axios.get(`${elfin_api}/public/telegram/users?telegramId=${telegramId}`);
        if (response.data.code === 1 && response.data.data.userExist) {
            return response.data.data.inviteCode;
        }else{
            console.log(`User id ${telegramId} have not connected to Elfin`);
        }
    } catch (error) {
        console.error('Error fetching invite code:', error);
    }
    return null;
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

bot.on('polling_error', (error) => {
    console.error(`Polling error: ${error.code} - ${error.response ? error.response.body.description : ''}`);
});

console.log('Bot is running...');