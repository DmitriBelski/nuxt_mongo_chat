const passport = require('passport')
const {Router} = require('express')
const {create, getChats} = require('../controllers/chat.controller')
const router = Router()

// /api/chat/create
router.post(
  '/create', 
  passport.authenticate('jwt', {session: false}),
  create
)

// /api/chat/chats
router.get(
  '/chats/:id', 
  passport.authenticate('jwt', {session: false}),
  getChats
)

module.exports = router