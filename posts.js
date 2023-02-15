const {Router} = require('express') //import Router class
const router = Router()

router.get('/', (req, res) =>{
    res.send(200)
})

router.get('/postTitle/:title', (req, res) => {
    res.json({ title: 'Random Post'})
})

module.exports = router
