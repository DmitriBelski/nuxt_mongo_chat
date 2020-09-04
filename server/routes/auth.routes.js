const {Router} = require('express')
const {login, createUser} = require('../controllers/auth.controller')
const router = Router()

//  /api/auth/register
router.post('/create', createUser)

//  /api/auth/login
router.post('/login', login)

module.exports = router
