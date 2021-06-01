const Router = require('@koa/router');
const router = new Router();

router.get('/', (req, res) => {
    res.status(200).json({message: 'connected to api'});
});

module.exports = router;
