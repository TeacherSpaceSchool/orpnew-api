const User = require('../models/user');
const adminLogin = require('./const').adminLogin,
    adminPass = require('./const').adminPass,
    mainInspectorLogin = require('./const').mainInspectorLogin,
    mainInspectorPass = require('./const').mainInspectorPass;


module.exports.createAdmin = async () => {
    await User.deleteMany({$or:[{login: adminLogin, role: {$ne: 'admin'}}, {role: 'admin', login: {$ne: adminLogin}}]});
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
    await User.deleteMany({$or:[{login: mainInspectorLogin, role: {$ne: 'главинспектор'}}, {role: 'главинспектор', login: {$ne: mainInspectorLogin}}]});
    let findMainInspector = await User.findOne({login: mainInspectorLogin}).lean();
    if(!findMainInspector){
        const _user = new User({
            login: mainInspectorLogin,
            role: 'главинспектор',
            status: 'active',
            password: mainInspectorPass,
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
