"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
//必要なパッケージをインポートする
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const fs = __importStar(require("fs"));
//.envファイルを読み込む
dotenv_1.default.config();
//Botで使うGetwayIntents、partials
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.DirectMessages,
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
    partials: [discord_js_1.Partials.Message, discord_js_1.Partials.Channel],
});
//Botがきちんと起動したか確認
client.once('ready', () => {
    console.log('Ready!');
    if (client.user) {
        console.log(client.user.tag);
    }
});
//!timeと入力すると現在時刻を返信するように
client.on('messageCreate', (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (message.author.bot)
        return;
    if (message.content === '!sleep') {
        const date1 = new Date();
        const name = message.author.username;
        message.channel.send(date1.toLocaleString());
        message.channel.send(name + "が寝ました！");
        saveCommand(name);
    }
    if (message.content === '!doing') {
        const savedUsers = yield getSavedUsers();
        const allUsers = (_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.cache.map(member => member.user.username);
        const nonSleepers = allUsers === null || allUsers === void 0 ? void 0 : allUsers.filter(user => !savedUsers.includes(user));
        message.channel.send('寝てない人: ' + (nonSleepers === null || nonSleepers === void 0 ? void 0 : nonSleepers.join(', ')));
    }
    if (message.content === '!wake') {
        const name = message.author.username;
        removeUserFromSleepList(name);
        message.channel.send(name + 'が起きました！');
    }
}));
function saveCommand(command) {
    fs.appendFile('sleep.txt', command + '\n', (err) => {
        if (err) {
            console.error('Error saving command:', err);
        }
        else {
            console.log(command);
        }
    });
}
function getSavedUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs.readFile('sleep.txt', 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading saved users:', err);
                    reject(err);
                }
                else {
                    const savedUsers = data.split('\n').map(line => line.trim());
                    resolve(savedUsers);
                }
            });
        });
    });
}
function removeUserFromSleepList(name) {
    fs.readFile('sleep.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading saved users:', err);
        }
        else {
            const savedUsers = data.split('\n').map(line => line.trim());
            const updatedUsers = savedUsers.filter(user => user !== name);
            fs.writeFile('sleep.txt', updatedUsers.join('\n'), 'utf8', (err) => {
                if (err) {
                    console.error('Error removing user from sleep list:', err);
                }
                else {
                    console.log('User removed from sleep list!');
                }
            });
        }
    });
}
//ボット作成時のトークンでDiscordと接続
client.login(process.env.TOKEN);
