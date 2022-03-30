const { isMainThread } = require('worker_threads');
const connectDB = require('../models/index');
const {sendWebPush} = require('../module/webPush');
const cron = require('node-cron');
const ModelsError = require('../models/error');
connectDB.connect()
if(!isMainThread) {
    cron.schedule('1 20 * * *', async() => {
        try{
            sendWebPush({title: 'ORP-SHORO', message: 'Не забудьте заполнить накладную', user: 'all'})
        } catch (err) {
            let _object = new ModelsError({
                err: err.message,
                path: 'thread reminderClient'
            });
            await ModelsError.create(_object)
            console.error(err)
        }
    });
}