const { isMainThread } = require('worker_threads');
const connectDB = require('../models/index');
const cron = require('node-cron');
const OtchetRealizatora = require('../models/otchetRealizatora');
const { pdHHMM } = require('../module/const')
const {prepareXML} = require('../module/outXML');
//const {calculateOtchetOrganizatora} = require('../module/otchetOrganizatora');

connectDB.connect();
if(!isMainThread) {
    cron.schedule('28 15 * * *', async() => {
        let checkTime = 0

        let vTime = new Date()
        vTime.setDate(vTime.getDate() - 1)
        vTime.setHours(23, 0, 0, 0)
        vTime = pdHHMM(vTime)

        let dateEnd = new Date()
        dateEnd.setHours(0, 0, 0, 0)
        let dateStart = new Date(dateEnd)
        dateStart.setDate(dateStart.getDate() - 1)

        let findOtchetRealizators = await OtchetRealizatora.find({
            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]
        })
        let otchetRealizators = {}
        for(let i = 0; i<findOtchetRealizators.length; i++){
            if(!otchetRealizators[findOtchetRealizators[i].region]) {
                otchetRealizators[findOtchetRealizators[i].region] = {
                    region: findOtchetRealizators[i].region,
                    guidRegion: findOtchetRealizators[i].guidRegion,
                    organizator: findOtchetRealizators[i].organizator,
                    guidOrganizator: findOtchetRealizators[i].guidOrganizator,
                    otchets: []
                }
            }
            otchetRealizators[findOtchetRealizators[i].region].otchets.push(findOtchetRealizators[i])
        }
        const keys = Object.keys(otchetRealizators)
        for(let i=0; i<keys.length; i++){
            for(let i1 = 0; i1<otchetRealizators[keys[i]].otchets.length; i1++){
                let dataTable = JSON.parse(otchetRealizators[keys[i]].otchets[i1].dataTable)
                if(!dataTable.vozvrat.v.time) {
                    dataTable.vozvrat.v.time = vTime
                    otchetRealizators[keys[i]].otchets[i1].dataTable = JSON.stringify(dataTable)
                    await otchetRealizators[keys[i]].otchets[i1].save()
                    checkTime += 1
                }
            }
            //await calculateOtchetOrganizatora({region: otchetRealizators[keys[i]].region, guidRegion: otchetRealizators[keys[i]].guidRegion, organizator: otchetRealizators[keys[i]].organizator, guidOrganizator: otchetRealizators[keys[i]].guidOrganizator})
            await prepareXML({guidRegion: otchetRealizators[keys[i]].guidRegion, guidOrganizator: otchetRealizators[keys[i]].guidOrganizator})
        }
        console.log(`check ${checkTime}`)
    });
}