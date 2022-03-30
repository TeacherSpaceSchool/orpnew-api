const OtchetRealizatora = require('../models/otchetRealizatora');
const OutXML = require('../models/outXML');
const Price = require('../models/price');
const Tara = require('../models/tara');
const xml = require('xml');

const pdDDMMYYYY = (date) =>
{
    date = new Date(date)
    date = `${date.getDate()<10?'0':''}${date.getDate()}.${date.getMonth()<9?'0':''}${date.getMonth()+1}.${date.getFullYear()}`
    return date
}

const checkDate = (date) => {
    date = new Date(date)
    return date=='Invalid Date'?new Date():date
}

module.exports.prepareXML = async ({guidRegion, guidOrganizator, date})=>{

    let dateStart, dateEnd
    dateStart = checkDate(date)
    dateStart.setHours(0, 0, 0, 0)
    dateEnd = new Date(dateStart)
    dateEnd.setDate(dateEnd.getDate() + 1)

    let findProducts = await Price.find().lean(), products = {}
    for(let i=0;i<findProducts.length;i++){
        products[findProducts[i].name] = findProducts[i].guid
    }
    let findTares = await Tara.find().lean(), tares = {}
    for(let i=0;i<findTares.length;i++){
        tares[findTares[i].size] = findTares[i].guid
    }
    let dateXML = pdDDMMYYYY(dateStart)
    let data = []
    await OutXML.deleteMany({date: dateXML, guidRegion/*, guidOrganizator*/})
    let otchetRealizators = await OtchetRealizatora.find({
        $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
        guidRegion
    }).lean()

    for(let i=0;i<otchetRealizators.length;i++){
        let dataOtchetRealizator = JSON.parse(otchetRealizators[i].dataTable)
        let time_from = ''
        if(dataOtchetRealizator['vydano']['r']['time']){
            time_from = `${dataOtchetRealizator['vydano']['r']['time']}:00`
        }
        else if(dataOtchetRealizator['vydano']['d1']['time']){
            time_from = `${dataOtchetRealizator['vydano']['d1']['time']}:00`
        }
        else if(dataOtchetRealizator['vydano']['d2']['time']){
            time_from = `${dataOtchetRealizator['vydano']['d2']['time']}:00`
        }
        else if(dataOtchetRealizator['vydano']['d3']['time']){
            time_from = `${dataOtchetRealizator['vydano']['d3']['time']}:00`
        }
        let returneds = {
            'ml': (dataOtchetRealizator['vozvrat']['v']['ml']?dataOtchetRealizator['vozvrat']['v']['ml']:0),
            'chl': (dataOtchetRealizator['vozvrat']['v']['chl']?dataOtchetRealizator['vozvrat']['v']['chl']:0),
            'kl': (dataOtchetRealizator['vozvrat']['v']['kl']?dataOtchetRealizator['vozvrat']['v']['kl']:0)
        }
        if(time_from.length===8)
            data.push({
                guid: otchetRealizators[i].guidPoint,
                seller: otchetRealizators[i].guidRealizator,
                time_from: time_from,
                time_to: dataOtchetRealizator['vozvrat']['v']['time']?`${dataOtchetRealizator['vozvrat']['v']['time']}:00`:'00:00:00',
                cash: `${dataOtchetRealizator['i']['fv']}.00`,
                rent: `${dataOtchetRealizator['i']['m']?dataOtchetRealizator['i']['m']:'0'}.00`,
                meal: `${dataOtchetRealizator['i']['o']}.00`,
                products: [
                    {
                        guid: products['Максым'],
                        issued: `${dataOtchetRealizator['vydano']['i']['ml']?dataOtchetRealizator['vydano']['i']['ml']:'0'}.00`,
                        sold: `${dataOtchetRealizator['vozvrat']['p']['ml']?dataOtchetRealizator['vozvrat']['p']['ml']:'0'}.00`,
                        returned: `${returneds['ml']}.00`
                    },
                    {
                        guid: products['Чалап'],
                        issued: `${dataOtchetRealizator['vydano']['i']['chl']?dataOtchetRealizator['vydano']['i']['chl']:'0'}.00`,
                        sold: `${dataOtchetRealizator['vozvrat']['p']['chl']?dataOtchetRealizator['vozvrat']['p']['chl']:'0'}.00`,
                        returned: `${returneds['chl']}.00`
                    },
                    {
                        guid: products['Квас'],
                        issued: `${dataOtchetRealizator['vydano']['i']['kl']?dataOtchetRealizator['vydano']['i']['kl']:'0'}.00`,
                        sold: `${dataOtchetRealizator['vozvrat']['p']['kl']?dataOtchetRealizator['vozvrat']['p']['kl']:'0'}.00`,
                        returned: `${returneds['kl']}.00`
                    },
                    {
                        guid: products['Стакан Легенда'],
                        issued: `${dataOtchetRealizator['vydano']['i']['sl']?dataOtchetRealizator['vydano']['i']['sl']:'0'}.00`,
                        sold: `${dataOtchetRealizator['vozvrat']['p']['sl']?dataOtchetRealizator['vozvrat']['p']['sl']:'0'}.00`,
                        returned: `${dataOtchetRealizator['vozvrat']['v']['sl']?dataOtchetRealizator['vozvrat']['v']['sl']:'0'}.00`
                    },
                ],
                tares: [
                    {
                        guid: tares['0.20'],
                        issued: `${dataOtchetRealizator['vydano']['i']['s02']?dataOtchetRealizator['vydano']['i']['s02']:'0'}.00`,
                        sold: `${dataOtchetRealizator['vozvrat']['p']['s02']?dataOtchetRealizator['vozvrat']['p']['s02']:'0'}.00`,
                        returned: `${dataOtchetRealizator['vozvrat']['v']['s02']?dataOtchetRealizator['vozvrat']['v']['s02']:'0'}.00`
                    },
                    {
                        guid: tares['0.40'],
                        issued: `${dataOtchetRealizator['vydano']['i']['s04']?dataOtchetRealizator['vydano']['i']['s04']:'0'}.00`,
                        sold: `${dataOtchetRealizator['vozvrat']['p']['s04']?dataOtchetRealizator['vozvrat']['p']['s04']:'0'}.00`,
                        returned: `${dataOtchetRealizator['vozvrat']['v']['s04']?dataOtchetRealizator['vozvrat']['v']['s04']:'0'}.00`
                    },
                    {
                        guid: tares['1.00'],
                        issued: `${dataOtchetRealizator['vydano']['i']['b']?dataOtchetRealizator['vydano']['i']['b']:'0'}.00`,
                        sold: `${dataOtchetRealizator['vozvrat']['p']['b']?dataOtchetRealizator['vozvrat']['p']['b']:'0'}.00`,
                        returned: `${dataOtchetRealizator['vozvrat']['v']['b']?dataOtchetRealizator['vozvrat']['v']['b']:'0'}.00`
                    },
                ]
            })
    }

    if(data.length){
        let object = new OutXML({
            data,
            date: dateXML,
            guidRegion,
            guidOrganizator
        });
        await OutXML.create(object);
    }
}

module.exports.generateXML = async ()=>{
    let result = [ { root: [ { _attr: { mode: 'sales'} }] } ];
    let outXMLs = await OutXML.find().lean()
    for(let i=0;i<outXMLs.length;i++){
        let item = { item: [{ _attr: { date: outXMLs[i].date, manager: outXMLs[i].guidOrganizator, region: outXMLs[i].guidRegion}}]};
        for(let ii=0;ii<outXMLs[i].data.length;ii++){
            let place = { place: [{ _attr: { guid: outXMLs[i].data[ii].guid, seller: outXMLs[i].data[ii].seller, time_from: outXMLs[i].data[ii].time_from, time_to: outXMLs[i].data[ii].time_to, cash: outXMLs[i].data[ii].cash, rent: outXMLs[i].data[ii].rent, meal: outXMLs[i].data[ii].meal}}]};
            for(let iii=0;iii<outXMLs[i].data[ii].products.length;iii++){
                place.place.push({ product: [{ _attr: { guid: outXMLs[i].data[ii].products[iii].guid,  issued: outXMLs[i].data[ii].products[iii].issued,  returned: outXMLs[i].data[ii].products[iii].returned }}]})
            }
            for(let iii=0;iii<outXMLs[i].data[ii].tares.length;iii++){
                place.place.push({ tare: [{ _attr: { guid: outXMLs[i].data[ii].tares[iii].guid,  issued: outXMLs[i].data[ii].tares[iii].issued,  returned: outXMLs[i].data[ii].tares[iii].returned }}]})
            }
            (item.item).push(place)
        }
        (result[0].root).push(item)
    }
    result = xml(result, true)
    return result
}


