const {Strategy, ExtractJwt} = require('passport-jwt')
const keys = require('../keys')

// в самом начале пока MongoDB без данных, мы не сможем найти там коллекцию users (User = model('users')) - будет ошибка, поэтому комментим две строчки и пишем третью
// const {model} = require('mongoose')
// const User = model('users') 
const User = require('../models/user.model') 


const options = {
  // в хедерах у нас будет такой хедер: Autherization: Bearer TOKEN 
  // fromAuthHeaderAsBearerToken поможет в хедерах находить вышеуказанный метод и считывать токен
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  //здесь мы указываем, каким обазом мы будем считывать JWT токен, тоесть где он находиться. С фронтенда мы будем отправлять JWT в хедерах
  // передаем секретный ключ для генерации JWT
  secretOrKey: keys.JWT
}

// данная стратегия будет говорить Пасспорту, что ему делать
module.exports = new Strategy(options, async (payload, done) => {
  try {
    // сначала проверяем, есть ли такой пользователь с данным токеном
    // при создании токена, мы передавали в метод sign логин и id. Эти данные как раз и хранятся в методе payload
    const candidate = await User.findById(payload.userId).select('id')
    if (candidate) {
      done(null, candidate)
    } else {
      done(null, false)
    }
  } catch (e) {
    console.error(e)
  }
}) 