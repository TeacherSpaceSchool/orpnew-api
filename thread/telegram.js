const { isMainThread } = require('worker_threads');
const connectDB = require('../models/index');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage }  = require('telegram/events');
const input = require('input');
const nameGroup = 'Дублирование сигнала'
const apiId = 17966152
const apiHash = '8fb146452351a96c412328d75a954018'
const mainPhone = '+996559188780'
const mainSession = '1AgAOMTQ5LjE1NC4xNjcuNDEBu2M+5zMO3olfBh409mlrsAJNGVRROg1D1SZemlCTA77mhwFr4XxF43OSPzb9tVaGT+HLKdNiJGc067Kz+uv8VB4315DcfdqHXUJg0NJrhND7GQuNiqFJQCA3HF3sUbcd+URvDakCfHyyim3qvqqse+SCiRmm2REG6VXep6hpn1rvNb9zy/P/3nmlEce0t/8yJiieR1udtDuxOVFmYKFIygMoTLqiRhSDmKVCEB9B98/1//zkQ4MFM4Ko8x2CFuOHIBbdaE3ubQXrIuTVqLiXwtjnH0v0EmJs4P5lAwT7833QbLpMdBdnglYDYePiV45NGKZiTWEOHEgra2O44rGG5gs='
const testPhone = '+996770041746'
const testSession = '1AgAOMTQ5LjE1NC4xNjcuNDEBu3IpVsS2GKDVJkhveEy8C4Sp+YPil3gv67c+Z+uVQzZVOiv5fPGR6NYoarkoUJxjkY5H2ihzttcDQWRiFnk4O2NXq22bPnxOrolkVWqCppBXz3//LHYiGt3jO3AhrO/MWYBmdNI0ICW4Z3D9s88y61bs7UQmFf3QR4fU1jyD76jSUpqbSlGbiE/lgH22i4mKiPPLGsC6HF76b+PkxNJ/+t3cR8+YUd2U7o++KdxJ0CE5K6c8SVe2eL17e2QnKdgOmoYDicSMBmjjdSq5ZiRjbdHzycu4fZX//cjtrfmxvaB/dYN1rV1mS18Eb9QALVXTDwGkb7A538p6F66AME/kAWc='
const stringSession = new StringSession(process.env.URL.trim()==='https://orp-shoro.site'?mainSession:testSession);

connectDB.connect();
if(!isMainThread) {
    (
        async ()=>{
            let groupId
            const client_options = {
                connectionRetries: 5,
                systemLanguage: 'en',
                systemVersion: 'Windows 15',
                deviceType: 'Desktop',
                appVersion: '2.8.3',
            }
            const client = new TelegramClient(stringSession, apiId, apiHash, client_options);

            //QR
            /*await client.connect();
            await client.signInUserWithQrCode(
                { apiId: Number(apiId), apiHash },
                {
                    phoneNumber: process.env.URL.trim()==='https://orp-shoro.site'?mainPhone:testPhone,
                    onError: (err) => console.log(`LOGIN ERROR => ${err}`),
                    qrCode: async (qr) => {
                        console.log(qr.token);
                        console.log(`tg://login?token=${qr.token.toString('base64')}`);
                    },
                },
            );
            console.log(client.session.save());*/

            //session
            await client.start({
                phoneNumber: async () => process.env.URL.trim()==='https://orp-shoro.site'?mainPhone:testPhone,
                phoneCode: async () =>
                    await input.text('Please enter the code you received: '),
                onError: (err) => console.log(err),
            });

            console.log('telegram connect');
            const newMessageEvent = async (event)=>{
                const dialogs = await client.getDialogs()
                let dialog
                for(let i=0; i<dialogs.length; i++) {
                    if(!groupId&&(dialogs[i].name===nameGroup||dialogs[i].title===nameGroup)){
                        groupId = dialogs[i].id
                    }
                    if(!dialog&&dialogs[i].message&&dialogs[i].message.id===event.message.id&&dialogs[i].message.date===event.message.date) {
                        dialog = dialogs[i]
                    }
                    if(dialog&&groupId)
                        break
                }
                if(groupId)
                    await client.sendMessage(groupId, {message: `${dialog?dialog.title:'Сигнал!!!'}\n${event.message.media?'Изображение\n':''}${event.message.message?event.message.message:''}`});
            }
            client.addEventHandler(newMessageEvent, new NewMessage({}));

        }
    )()
}