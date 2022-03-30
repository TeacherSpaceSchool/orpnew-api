const Subscriber = require('../models/subscriber');
const q = require('q');
const webPush = require('web-push');
const keys = require((process.env.URL).trim()==='https://orp-shoro.site'?'./../config/keys_prod':'./../config/keys_dev');

module.exports.sendWebPush = async({title, message, tag, url, icon, user}) => {
    const payload = {
        title: title?title:title,
        message: message?message:message,
        url: url?url:'https://orp-shoro.site',
        icon: icon?icon:'https://orp-shoro.site/static/192x192.png',
        tag: tag?tag:'ORP-SHORO'
    };
    if(user==='all'){
        Subscriber.find({}, (err, subscriptions) => {
            if (err) {
                console.error('Error occurred while getting subscriptions');
            } else {
                let parallelSubscriberCalls = subscriptions.map((subscription) => {
                    return new Promise((resolve, reject) => {
                        const pushSubscriber = {
                            endpoint: subscription.endpoint,
                            keys: {
                                p256dh: subscription.keys.p256dh,
                                auth: subscription.keys.auth
                            }
                        };

                        const pushPayload = JSON.stringify(payload);
                        const pushOptions = {
                            vapidDetails: {
                                subject: 'https://orp-shoro.site',
                                privateKey: keys.privateKey,
                                publicKey: keys.publicKey
                            },
                            headers: {}
                        };
                        webPush.sendNotification(
                            pushSubscriber,
                            pushPayload,
                            pushOptions
                        ).then((value) => {
                            resolve({
                                status: true,
                                endpoint: subscription.endpoint,
                                data: value
                            });
                        }).catch((err) => {
                            reject({
                                status: false,
                                endpoint: subscription.endpoint,
                                data: err
                            });
                        });
                    });
                });
                q.allSettled(parallelSubscriberCalls).then(async(pushResults) => {
                    try{
                        let done = 0, error = 0
                        for(let i=0; i<pushResults.length; i++){
                            if(pushResults[i].state === 'rejected'||pushResults[i].reason){
                                error += 1
                            }
                            else {
                                done += 1
                            }
                        }
                        console.log(`done pushed: ${done} | error pushed ${error}`)
                    } catch (err) {
                        console.error(err)
                    }
                });
            }
        }).lean();
    }
    else {
        Subscriber.find({user: user}, (err, subscriptions) => {
            if (err) {
                console.error('Error occurred while getting subscriptions');
            } else {
                let parallelSubscriberCalls = subscriptions.map((subscription) => {
                    return new Promise((resolve, reject) => {
                        const pushSubscriber = {
                            endpoint: subscription.endpoint,
                            keys: {
                                p256dh: subscription.keys.p256dh,
                                auth: subscription.keys.auth
                            }
                        };

                        const pushPayload = JSON.stringify(payload);
                        const pushOptions = {
                            vapidDetails: {
                                subject: 'https://orp-shoro.site',
                                privateKey: keys.privateKey,
                                publicKey: keys.publicKey
                            },
                            headers: {}
                        };
                        webPush.sendNotification(
                            pushSubscriber,
                            pushPayload,
                            pushOptions
                        ).then((value) => {
                            resolve({
                                status: true,
                                endpoint: subscription.endpoint,
                                data: value
                            });
                        }).catch((err) => {
                            reject({
                                status: false,
                                endpoint: subscription.endpoint,
                                data: err
                            });
                        });
                    });
                });
                q.allSettled(parallelSubscriberCalls).then(async (pushResults) => {
                    try{
                        let done = 0, error = 0
                        for(let i=0; i<pushResults.length; i++){
                            if(pushResults[i].state === 'rejected'||pushResults[i].reason){
                                error += 1
                            }
                            else {
                                done += 1
                            }
                        }
                        console.log(`done pushed: ${done} | error pushed ${error}`)
                    } catch (err) {
                        console.error(err)
                    }
                });
            }
        }).lean();
    }

 }
