const Realizator = require('../models/realizator');
const Region = require('../models/region');
const Point = require('../models/point');
const User = require('../models/user');
const randomstring = require('randomstring');

module.exports.reductionToRealizator = async() => {
    let realizators = await Realizator.find({renew: {$ne: true}})
    console.log(`reductionToRealizator: ${realizators.length}`)
    if(realizators.length) {
        let _regions = await Region.find().select('guid _id').lean()
        let regions = {}
        for (let i = 0; i < _regions.length; i++) {
            regions[_regions[i].guid] = _regions[i]._id
        }
        let _points = await Point.find().select('guid _id').lean()
        let points = {}
        for (let i = 0; i < _points.length; i++) {
            points[_points[i].guid] = _points[i]._id
        }
        for (let i = 0; i < realizators.length; i++) {
            if (!regions[realizators[i].guidRegion]) {
                realizators[i].guidRegion = 'lol'
                realizators[i].region = regions['lol']
            }
            else if (regions[realizators[i].guidRegion] != realizators[i].region)
                realizators[i].region = regions[realizators[i].guidRegion]
            if (!points[realizators[i].guidPoint]) {
                realizators[i].guidPoint = 'lol'
                realizators[i].point = points['lol']
            }
            else if (points[realizators[i].guidPoint] != realizators[i].point)
                realizators[i].point = points[realizators[i].guidPoint]
            if (!(await User.findOne({_id: realizators[i].user}).select('_id').lean())) {
                let _user = new User({
                    login: randomstring.generate({length: 20, charset: 'alphanumeric'}),
                    role: 'реализатор',
                    status: 'active',
                    password: '12345678',
                });
                await User.create(_user);
                realizators[i].user = _user._id
            }
            realizators[i].renew = true
            await realizators[i].save();
        }
    }
}
