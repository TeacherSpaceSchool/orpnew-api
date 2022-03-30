const Point = require('../models/point');
const Region = require('../models/region');

module.exports.reductionToPoint = async() => {
    let points = await Point.find({renew: {$ne: true}})
    console.log(`reductionToPoint: ${points.length}`)
    if(points.length) {
        let _regions = await Region.find().select('guid _id').lean()
        let regions = {}
        for (let i = 0; i < _regions.length; i++) {
            regions[_regions[i].guid] = _regions[i]._id
        }
        for (let i = 0; i < points.length; i++) {
            if (!regions[points[i].guidRegion]) {
                points[i].guidRegion = 'lol'
                points[i].region = regions['lol']
            }
            else if (regions[points[i].guidRegion] != points[i].region) {
                points[i].region = regions[points[i].guidRegion]
            }
            points[i].renew = true
            await points[i].save();
        }
    }
}
