const passport = require('passport')
const {Router} = require('express')
const {getAll, migrateAll} = require('../controllers/message.controller')
const router = Router()

// api/message/messages
router.get(
  '/messages/:id', 
  passport.authenticate('jwt', {session: false}),
  getAll
)

router.post(
  '/messages', 
  passport.authenticate('jwt', {session: false}),
  migrateAll
)

module.exports = router


