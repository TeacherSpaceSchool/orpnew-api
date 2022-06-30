const { isMainThread } = require('worker_threads');
const connectDB = require('../models/index');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage }  = require('telegram/events');
const input = require('input');
const nameGroup = 'Дублирование сигнала'
const mainPhone = '+996559188780'
const testPhone = '+996770041746'
const apiId = 17966152
const apiHash = '8fb146452351a96c412328d75a954018'
const mainSession = '1AgAOMTQ5LjE1NC4xNjcuNDEBu2M+5zMO3olfBh409mlrsAJNGVRROg1D1SZemlCTA77mhwFr4XxF43OSPzb9tVaGT+HLKdNiJGc067Kz+uv8VB4315DcfdqHXUJg0NJrhND7GQuNiqFJQCA3HF3sUbcd+URvDakCfHyyim3qvqqse+SCiRmm2REG6VXep6hpn1rvNb9zy/P/3nmlEce0t/8yJiieR1udtDuxOVFmYKFIygMoTLqiRhSDmKVCEB9B98/1//zkQ4MFM4Ko8x2CFuOHIBbdaE3ubQXrIuTVqLiXwtjnH0v0EmJs4P5lAwT7833QbLpMdBdnglYDYePiV45NGKZiTWEOHEgra2O44rGG5gs='
const stringSession = new StringSession(mainSession);

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
                    phoneNumber: mainPhone,
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
                phoneNumber: async () => mainPhone,
                phoneCode: async () =>
                    await input.text('Please enter the code you received: '),
                onError: (err) => console.log(err),
            });

            console.log('telegram connect');
            const newMessageEvent = async (event)=>{
                let message = event.message
                if(!groupId) {
                    const dialogs = await client.getDialogs()
                    for(let i=0; i<dialogs.length; i++) {
                        if(dialogs[i].name===nameGroup||dialogs[i].title===nameGroup){
                            groupId = dialogs[i].id
                        }
                    }
                }
                if(groupId){
                    setTimeout(async ()=>{
                        await client.sendMessage(groupId, {message: `Сигнал!!!\n${message.media?'Изображение':''}\n${message.message?JSON.stringify(message.message):''}`});
                    }, 1000)
                }
            }
            client.addEventHandler(newMessageEvent, new NewMessage({}));

        }
    )()
}