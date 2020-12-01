require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();

const { exec } = require('child_process');
const fetch = require('node-fetch');

// When bot is ready and connected
client.on('ready', function (evt) {
    console.log('Connected');
});

const helpText =  'commands: ' +
                  '\n!help - shows this text ' +
                  '\n!dynmap - shows webaddress for Dynmap ' +
                  '\n!ip - shows IP-address for MC server' +
                  '\n!wake - wakes up the server (takes a few minutes)' +
                  '\n!shutdown  - shuts down the server (make sure no one else is using it)' +
                  '\n!online  - shows how many and who is playing on the Minecraft server';

client.on('message', (message) => {
    if (message.content.substring(0, 1) === '!') {
        let args = message.content.substring(1).split(' ');
        const cmd = args[0];

        args = args.splice(1);
        switch(cmd) {
            // !help - shows commands
            case 'help': {
                message.reply(helpText);
                break;
            }

            case 'dynmap': {
                message.reply(process.env.DYNMAP_URL);
                break;
            }

            case 'ip': {
                message.reply(process.env.MC_SERVER_URL);
                break;
            }

            // 'wake' & 'shutdown'
            // Uses fetch framework to send REST-API call to software controlling server
            case 'wake': {
                fetch(process.env.HOME_CONTROL_URL + '/wake?username=' + message.author.username, {
                    headers: {
                        'authorization': process.env.HOME_CONTROL_TOKEN
                    }
                })
                    .then(response => response.json())
                    .then(result => {
                        message.reply(result.message);
                    });
                break;
            }
            case 'shutdown': {
                fetch(process.env.HOME_CONTROL_URL + '/shutdown?username=' + message.author.username, {
                    headers: {
                        'authorization': process.env.HOME_CONTROL_TOKEN
                    }
                })
                    .then(response => response.json())
                    .then(result => {
                        message.reply(result.message);
                    });
                break;
            }

            // Executes external python script, which sends RCON package to MC server
            case 'online': {
                exec('python3 rcon.py list', (err, stdout, stderr) => {
                    if(err){
                        message.reply('error in sending command');
                    }
                    if(stdout.includes('errorX')){
                        message.reply('Minecraft server offline.');
                    }else{
                        message.reply(stdout);
                    }
                });
                break;
            }

            default: {
                message.reply('could not understand that command. Type: "!help" to see commands.');
            }
        }
    }
});

client.login(process.env.BOT_TOKEN);
