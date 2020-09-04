// const bcrypt = require('bcrypt-nodejs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken') // аутентификация по JWT для hhtp
const keys = require('../keys')
const User = require('../models/user.model')

module.exports.createUser = async (req, res) => {
  // есть ли в базе уже такой логин
  const candidate = await User.findOne({login: req.body.login})
  if (candidate) {
    res.status(409).json({message: 'Такой логин уже занят'}) // Ошибка клиента 409 Conflict
  } else {
    const salt = bcrypt.genSaltSync(10)
    const user = new User({
      email: req.body.email,
      login: req.body.login,
      password: bcrypt.hashSync(req.body.password, salt)
    })
    await user.save()
    res.status(201).json(user) // Успех 201 Created
  }
}
module.exports.login = async (req, res) => {
  const candidate = await User.findOne({login: req.body.login})
  if (candidate) {
    const isPasswordCorrect = bcrypt.compareSync(req.body.password, candidate.password)
    if (isPasswordCorrect) {
      // ползователь с правильным пароле найден - формируем токен
      const token = jwt.sign({
        login: candidate.login,
        userId: candidate._id
      }, keys.JWT, {expiresIn: 60 * 60})
      await User.updateOne({login: candidate.login}, {$set: {last_seen: Date.now()}}) // обновим дату последнего посещения, last_seen
      res.status(200).json({token}) //  стаутс 200 идет по умолчанию, поэтому можно его не писать, res.json({token})
    } else {
      res.status(401).json({message: 'Пароль не верен'}) // в реальном приложении лучше писать "Логин или пароль введен не верно" с ошибкой 404
    }
  } else {
    res.status(404).json({message: 'Пользователь не найден'}) // в реальном приложении лучше писать "Логин или пароль введен не верно" с ошибкой 404
  }
}

