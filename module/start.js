const { addReserv } = require('../module/region');
const { Worker, isMainThread } = require('worker_threads');
const { createAdmin } = require('../module/user');
const { reductionToPoint } = require('../module/point');
const { reductionToOrganizator } = require('../module/organizator');
const { reductionToRealizator } = require('../module/realizator');
const ModelsError = require('../models/error');

let startReminderClient = async () => {
    if(isMainThread) {
        let w = new Worker('./thread/reminderClient.js', {workerData: 0});
        w.on('message', (msg) => {
            console.log('ReminderClient: '+msg);
        })
        w.on('error', async (error)=>{
            let err = ''
            if(error&&error.message)
                err = error.message
            console.error(error)
            let object = new ModelsError({
                err: err,
                path: 'ReminderClient'
            });
            await ModelsError.create(object)
        });
        w.on('exit', (code) => {
            if(code !== 0)
                console.error(new Error(`ReminderClient stopped with exit code ${code}`))
        });
        console.log('ReminderClient '+w.threadId+ ' run')
    }
}

let startCheckVTime = async () => {
    if(isMainThread) {
        let w = new Worker('./thread/checkVTime.js', {workerData: 0});
        w.on('message', (msg) => {
            console.log('CheckVTime: '+msg);
        })
        w.on('error', async (error)=>{
            let err = ''
            if(error&&error.message)
                err = error.message
            console.error(error)
            let object = new ModelsError({
                err: err,
                path: 'CheckVTime'
            });
            await ModelsError.create(object)
        });
        w.on('exit', (code) => {
            if(code !== 0)
                console.error(new Error(`CheckVTime stopped with exit code ${code}`))
        });
        console.log('CheckVTime '+w.threadId+ ' run')
    }
}

let start = async () => {
    await createAdmin();
    await startCheckVTime();
    await startReminderClient();
    await addReserv();
    await reductionToPoint();
    await reductionToOrganizator();
    await reductionToRealizator();
}

module.exports.start = start;
