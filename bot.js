// Require Modules
const Discord = require("discord.js");
const cron = require('node-cron');
const commands = require('./Commands.js');
const badwordsArray = require('badwords/array');
const AntiSpam = require('discord-anti-spam');
const ReactionRole = require("reaction-role");

//Turn array to full uppercase
const finalBadwordsArray = badwordsArray.map(badwordsArray => badwordsArray.toUpperCase());

//Exports
let basicResponseArray = commands.basicResponses;

prefix = process.env.BOT_PREFIX || "x";

// Create a discord client.
const client = new Discord.Client();

//Make a var for stop reminder.
var stopReminder = false;

//Make a var for Commands Array
var allCommandsArray = [];

// When ready run code.
client.once('ready', () => {
    console.log("Ready!");
});

//Mary Pill Reminder Start
client.once('ready', () => {
    cron.schedule('*/5 7 * * *', () => {
        if(stopReminder == false){ 
            reminderTimer();
        }
    });
});

function reminderTimer(){
    console.log("Sending Reminder..."); 
    client.users.cache.get(process.env.MARY_ID).send("Take ur pills. Its an order.");      
}

client.on('message', msg => {
    if (msg.channel.type == "dm") {
        if (msg.content === "Stop"){
             stopReminder = true;
             msg.reply("Reminder Stopped");
             console.log("Stopping Reminder...");
         }
     }
});

cron.schedule('0 6 * * *', () => {
    stopReminder = false;
    console.log("Stop Reminder Set to false...")
});
//Mary Pill Reminder End

//Welcome msg
client.on('guildMemberAdd', member => {
    var welcomeChannelID = '769280253268459520';
    member.guild.channels.cache.get(welcomeChannelID).send(member.user.toString() + " Welcome to the sever! Read "  + member.guild.channels.cache.find(channel => channel.name === "please-read-first").toString() + " to verify."); 
    const embed = new Discord.MessageEmbed()
        .setColor('#FFD700')
        .setTitle('New Member')
        .setDescription(member.user.toString() + ' has just joined the server!')
        .addField("Member #" + client.guild.members.cache.filter(member => !member.user.bot).size)
        .setImage(member.user.avatarURL())
        member.guild.channels.cache.get(welcomeChannelID).send(embed);

    var roleAdd = member.guild.roles.cache.find(role => role.name === "New Member");
    member.roles.add(roleAdd);
});

//Adding Role when you React to msg
let channel_id = "767608509591846912"; 
let message_id = "767608920134254652";

const system = new ReactionRole(process.env.BOT_TOKEN);

let checkmark = system.createOption("✅", "769276063397838888");

system.createMessage(message_id, channel_id, 999999999, null, checkmark);

system.init();

//Basic Commands
client.on('message', msg => {
    if (msg.author.bot) return;
    if (msg.channel.type == "text") {
        basicResponseArray.forEach(item => {
            if(msg.content === item.question){
                msg.reply(item.answer);
            } 
        });   
        if(msg.content === "xcommands"){
            msg.reply(JSON.stringify(allCommandsArray));
        }            
    }
});

//Answers the "xcommands" Question

function getAllCommands() {

    basicResponseArray.forEach((item) => {
        if(allCommandsArray.length < basicResponseArray.length){
            allCommandsArray.push(item.question);
        }else if(allCommandsArray.length = basicResponseArray.length){
            return;
        }
    });
};

getAllCommands();

// Profanity Filter and ALLCAPS filter and Anti-Spam
client.on("message", msg => {
    if(msg.author.bot) return;
    if(msg.channel.type == "text"){
        if(finalBadwordsArray.includes(msg.content.toUpperCase().trim().replace(/\s/g, ''))){
            msg.delete();
            msg.reply("Hey! Thats a No No Word.");
        }
        if(msg.content === msg.content.toUpperCase()){
            msg.delete();
            msg.reply("Dont type in all caps please");
        }
    }
});

const antiSpam = new AntiSpam({
    warnThreshold: 3, // Amount of messages sent in a row that will cause a warning.
    kickThreshold: 7, // Amount of messages sent in a row that will cause a kick.
    banThreshold: 10, // Amount of messages sent in a row that will cause a ban.
    maxInterval: 2000, // Amount of time (in milliseconds) in which messages are considered spam.
    warnMessage: '{@user}, Please stop spamming.', // Message that will be sent in chat upon warning a user.
    kickMessage: '**{user_tag}** has been kicked for spamming.', // Message that will be sent in chat upon kicking a user.
    banMessage: '**{user_tag}** has been banned for spamming.', // Message that will be sent in chat upon banning a user.
    maxDuplicatesWarning: 7, // Amount of duplicate messages that trigger a warning.
    maxDuplicatesKick: 10, // Amount of duplicate messages that trigger a warning.
    maxDuplicatesBan: 12, // Amount of duplicate messages that trigger a warning.
    exemptPermissions: [ 'ADMINISTRATOR'], // Bypass users with any of these permissions.
    ignoreBots: true, // Ignore bot messages.
    verbose: true, // Extended Logs from module.
    ignoredUsers: [], // Array of User IDs that get ignored.
    // And many more options... See the documentation.
});

client.on('message', (msg) => antiSpam.message(msg)); 


client.once('reconnecting', () => {
 console.log('Reconnecting!');
});
client.once('disconnect', () => {
 console.log('Disconnect!');
});

// Use token to login to the bot.
client.login(process.env.BOT_TOKEN);