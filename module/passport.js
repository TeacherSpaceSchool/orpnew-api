const passport = require('passport');
const LocalStrategy = require('passport-local');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtsecret = '@615141ViDiK141516@';
const User = require('../models/user');
const Organizator = require('../models/organizator');
const Realizator = require('../models/realizator');
//const { setProfile, getProfile } = require('../redis/profile');
const jwt = require('jsonwebtoken');

let start = () => {
//настройка паспорта
    passport.use(new LocalStrategy({
            usernameField: 'login',
            passwordField: 'password',
            session: false
        },
        function (login, password, done) {
            User.findOne({login: login}, (err, user) => {
                if (err) {
                    return done(err);
                }
                if (!user || !user.checkPassword(password) || user.status!=='active') {
                    return done(null, false, {message: 'Нет такого пользователя или пароль неверен.'});
                }
                return done(null, user);
            })
        })
    );
    const jwtOptions = {};
    jwtOptions.jwtFromRequest= ExtractJwt.fromAuthHeaderAsBearerToken();
    jwtOptions.secretOrKey=jwtsecret;
    passport.use(new JwtStrategy(jwtOptions, function (payload, done) {
        User.findOne({login:payload.login}, (err, user) => {
            if (err) {
                return done(err)
            }
            if (user) {
                return done(null, user)
            } else {
                return done(null, false)
            }}
        ).lean()
    }));
}

const verifydeuserGQL = async (req, res) => {
    return new Promise((resolve) => { passport.authenticate('jwt', async function (err, user) {
        try{
            if (user&&user.status==='active') {
                if('организатор'===user.role) {
                    let organizator = await Organizator.findOne({user: user._id})
                        .select('region guidRegion guid')
                        .populate({
                            path: 'region',
                            select: '_id name'
                        })
                        .lean()
                    if(organizator.guidRegion==='lol')
                        resolve({})
                    user.region = organizator.region._id
                    user.guid = organizator.guid
                    user.nameRegion = organizator.region.name
                    user.guidRegion = organizator.guidRegion
                    user.organizator = organizator._id
                }
                else if('реализатор'===user.role) {
                    let realizator = await Realizator.findOne({user: user._id})
                        .select('region guidRegion guid point guidPoint')
                        .populate({
                            path: 'region',
                            select: '_id name'
                        })
                        .populate({
                            path: 'point',
                            select: '_id name'
                        })
                        .lean()
                    if(realizator.guidRegion==='lol'||realizator.guidPoint==='lol')
                        resolve({})
                    user.realizator = realizator._id
                    user.guid = realizator.guid
                    user.region = realizator.region._id
                    user.nameRegion = realizator.region.name
                    user.guidRegion = realizator.guidRegion
                    user.point = realizator.point._id
                    user.namePoint = realizator.point.name
                    user.guidPoint = realizator.guidPoint
                }
                resolve(user)
            }
            else {
                resolve({})
            }
        } catch (err) {
            console.error(err)
            resolve({})
        }
    } )(req, res)
    })


}

const signinuserGQL = (req, res) => {
    return new Promise((resolve) => {
        passport.authenticate('local', async function (err, user) {
            try{
                if (user&&user.status==='active') {
                    const payload = {
                        id: user._id,
                        login: user.login,
                        status: user.status,
                        role: user.role
                    };
                    const token = await jwt.sign(payload, jwtsecret); //здесь создается JWT
                    await res.clearCookie('jwt');
                    await res.cookie('jwt', token, {maxAge: 10000*24*60*60*1000 });
                    resolve(user)
                } else {
                    resolve({role: 'Проверьте данные'})
                }
            } catch (err) {
                console.error(err)
                resolve({role: 'Проверьте данные'})
            }
        })(req, res);
    })
}

const getuser = async (req, res, func) => {
    await passport.authenticate('jwt', async function (err, user) {
        try{
            await func(user)

        } catch (err) {
            console.error(err)
            res.status(401);
            res.end('err')
        }
    } )(req, res)
}

module.exports.getuser = getuser;
module.exports.verifydeuserGQL = verifydeuserGQL;
module.exports.start = start;
module.exports.signinuserGQL = signinuserGQL;