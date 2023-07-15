//必要なパッケージをインポートする
import { GatewayIntentBits, Client, Partials, Message } from 'discord.js'
import dotenv from 'dotenv'
import * as fs from 'fs';

//.envファイルを読み込む
dotenv.config()

//Botで使うGetwayIntents、partials
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
})

//Botがきちんと起動したか確認
client.once('ready', () => {
    console.log('Ready!')
    if(client.user){
        console.log(client.user.tag)
    }
})

//!timeと入力すると現在時刻を返信するように
client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return
    if (message.content === '!sleep') {
        const date1 = new Date();
        const name = message.author.username;
        message.channel.send(date1.toLocaleString());
        message.channel.send(name + "が寝ました！");
        saveCommand(name);
    }
    if (message.content === '!doing') {
      const savedUsers = await getSavedUsers();
      const allUsers = message.guild?.members.cache.map(member => member.user.username);
      const nonSleepers = allUsers?.filter(user => !savedUsers.includes(user));
      message.channel.send('寝てない人: ' + nonSleepers?.join(', '));
    }
    if (message.content === '!wake') {
      const name = message.author.username;
      removeUserFromSleepList(name);
      message.channel.send(name + 'が起きました！');
    }
})
function saveCommand(command: string) {
  fs.appendFile('sleep.txt', command + '\n', (err) => {
    if (err) {
      console.error('Error saving command:', err);
    } else {
      console.log(command);
    }
  });
}
async function getSavedUsers(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readFile('sleep.txt', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading saved users:', err);
        reject(err);
      } else {
        const savedUsers = data.split('\n').map(line => line.trim());
        resolve(savedUsers);
      }
    });
  });
}
function removeUserFromSleepList(name: string) {
  fs.readFile('sleep.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading saved users:', err);
    } else {
      const savedUsers = data.split('\n').map(line => line.trim());
      const updatedUsers = savedUsers.filter(user => user !== name);
      fs.writeFile('sleep.txt', updatedUsers.join('\n'), 'utf8', (err) => {
        if (err) {
          console.error('Error removing user from sleep list:', err);
        } else {
          console.log('User removed from sleep list!');
        }
      });
    }
  });
}

//ボット作成時のトークンでDiscordと接続
client.login(process.env.TOKEN)
