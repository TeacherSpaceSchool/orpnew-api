const Organizator = require('../models/organizator');
const Region = require('../models/region');
const User = require('../models/user');
const randomstring = require('randomstring');

module.exports.reductionToOrganizator = async() => {
    let organizators = await Organizator.find({renew: {$ne: true}})
    console.log(`reductionToOrganizator: ${organizators.length}`)
    if(organizators.length) {
        let _regions = await Region.find().select('guid _id').lean()
        let regions = {}
        for(let i = 0; i<_regions.length;i++){
            regions[_regions[i].guid] = _regions[i]._id
        }
        for (let i = 0; i < organizators.length; i++) {
            if (!regions[organizators[i].guidRegion]) {
                organizators[i].guidRegion = 'lol'
                organizators[i].region = regions['lol']
            }
            else if (regions[organizators[i].guidRegion] != organizators[i].region) {
                organizators[i].region = regions[organizators[i].guidRegion]
            }
            if (!(await User.findOne({_id: organizators[i].user}).select('_id').lean())) {
                let _user = new User({
                    login: randomstring.generate({length: 20, charset: 'alphanumeric'}),
                    role: 'организатор',
                    status: 'active',
                    password: '12345678',
                });
                await User.create(_user);
                organizators[i].user = _user._id
            }
            organizators[i].renew = true
            await organizators[i].save();
        }
    }
}
