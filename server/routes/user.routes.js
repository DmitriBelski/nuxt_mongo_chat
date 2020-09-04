const passport = require('passport')
const {Router} = require('express')
const {getSelfData, getOneContact, getAllContact, getAllRequest} = require('../controllers/user.controller')
const router = Router()

// /api/user/self
router.get(
  '/self/:id', 
  passport.authenticate('jwt', {session: false}),
  getSelfData)

// /api/user/user
router.get(
  '/user/:id', 
  passport.authenticate('jwt', {session: false}),
  getOneContact)

// /api/user/users
router.get(
  '/users/:id',  
  passport.authenticate('jwt', {session: false}),
  getAllContact)

// /api/user/request
router.get(
  '/request/:id', 
  passport.authenticate('jwt', {session: false}),
  getAllRequest)

module.exports = router



