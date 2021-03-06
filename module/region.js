const Point = require('../models/point');
const Region = require('../models/region');

module.exports.addReserv = async () => {
    try{
        let find = await Region.findOne({guid: 'lol'});
        if(!find){
            find = new Region({
                name: 'Резерв',
                guid: 'lol'
            });
            find = await Region.create(find);
            find = new Point({
                name: 'Резерв',
                guid: 'lol',
                region: find._id,
                guidRegion: 'lol'
            });
            await Point.create(find);
        }
    } catch(error) {
        console.error(error)
    }
}