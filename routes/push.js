const express = require('express');
const router = express.Router();
const { sendWebPush } = require('../module/webPush');
const User = require('../models/user');
const ModelsError = require('../models/error');

router.get('/admin', async (req, res) => {
    try{
        let user = await User.findOne({role: 'admin'}).select('_id').lean()
        if(user){
            await sendWebPush({title: 'ORP-SHORO', message: 'Не забудьте заполнить накладную', user: user._id})
            res.json('Push triggered');
        }
        else {
            res.json('Push error');
        }
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'push admin'
        });
        await ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.get('/all', async (req, res) => {
    try{
        await sendWebPush({title: 'ORP-SHORO', message: 'Не забудьте заполнить накладную', user: 'all'})
        res.json('Push triggered');
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'push all'
        });
        await ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

module.exports = router;