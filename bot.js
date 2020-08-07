const { Telegraf } = require('telegraf');
const UnifiAPI = require('node-unifiapi');
var cronJob = require('node-cron');
require('dotenv').config();

var dummyJson = require('./dummy.json')
var cache = require('memory-cache');

const unifi = UnifiAPI({
    baseUrl: process.env.URL, 
    username: process.env.USER,
    password: process.env.PASS
 });


const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) => {
    bot.telegram.sendMessage(ctx.chat.id, ctx.from.first_name + ' Menjalankan Unifi',
    {
        reply_markup: {
            inline_keyboard: 
            [
                [
                    {text: '❌  ALERT', callback_data: 'alarm',
                    },  
                    {text: '⭕️  EVENT', callback_data: 'event',
                    }
                ]
            ]
        }
    })
})

bot.action('alarm', ctx => {
    ctx.deleteMessage();
    if (dummyJson.idUsers.includes(ctx.chat.id) > 0) {
        cronJob.schedule('*/5 * * * * *', () => {
    unifi.list_alarms()
    .then(done => {
        var result = done.data.slice(-1)[0];
        const lastID = cache.get('lastID')
        var msg = result.msg;
        var resultmsg = done.data.slice(-1)[0].key;
        if(resultmsg == 'EVT_IPS_IpsAlert'){
            if (!(lastID == (done.data.slice(-1)[0]._id))) {
                for (var i=0;i<dummyJson.idUsers.length;i++) {
                    bot.telegram.sendMessage(dummyJson.idUsers[i], msg)
                    // if (dummyJson.idUsers[i] == '1155965801') {
                    //     bot.telegram.sendMessage(dummyJson.idUsers[i], "Jancok!")
                    // }
                }
                cache.put('lastID', done.data.slice(-1)[0]._id)
            }
        }
    })
    .catch(err => console.log('Error',err))
});
    }else{
        ctx.reply('ID User tidak terdaftar!')
    }
})

bot.action('event', ctx => {
    ctx.deleteMessage();
    if (dummyJson.idUsers.includes(ctx.chat.id) > 0) {
        cronJob.schedule('*/5 * * * * *', () => {
    unifi.list_events()
    .then(done => {
        var result = done.data.slice(0)[0];
        const lastID = cache.get('lastID')
        var msg = result.msg;
        var resultmsg = done.data.slice(0)[0].key;
            if (!(lastID == (done.data.slice(0)[0]._id))) {
                for (var i=0;i<dummyJson.idUsers.length;i++) {
                    bot.telegram.sendMessage(dummyJson.idUsers[i], msg)
                }
                cache.put('lastID', done.data.slice(0)[0]._id)
            }
    })
    .catch(err => console.log('Error',err))
});
    }else{
        ctx.reply('ID User tidak terdaftar!')
    }
})

bot.launch()