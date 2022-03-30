const User = require('../models/user');
const adminLogin = require('./const').adminLogin,
    adminPass = require('./const').adminPass;


module.exports.createAdmin = async () => {
    await User.deleteMany({$or:[{login: 'admin', role: {$ne: 'admin'}}, {role: 'admin', login: {$ne: 'admin'}}]});
    let findAdmin = await User.findOne({login: adminLogin}).lean();
    if(!findAdmin){
        const _user = new User({
            login: adminLogin,
            role: 'admin',
            status: 'active',
            password: adminPass,
        });
        await User.create(_user);
    }
}

module.exports.reductionToUser = async() => {
    let users = await User.find({login: null})
    console.log(`reductionToUser: ${users.length}`)
    for(let i = 0; i<users.length;i++){
        users[i].login = users[i].phone
        await users[i].save();
    }
}
