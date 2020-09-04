const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const socketioJwt = require('socketio-jwt'); // аутентификация по JWT для socket.io
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')
const passportStrategy = require('./middleware/passport-strategy')
const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const chatRoutes = require('./routes/chat.routes')
const messageRoutes = require('./routes/message.routes')
const keys = require('./keys')
const Chat = require('./models/chat.model')
const User = require('./models/user.model')
const Message = require('./models/message.model')
const {getIdbySocketId, getIdbyNeSocketId, haveAChat} = require('./controllers/chat.controller')

mongoose.Promise = Promise; // Просим Mongoose использовать стандартные Промисы
// mongoose.set('debug', true);  // Просим Mongoose писать все запросы к базе в консоль. Удобно для отладки кода
mongoose.connect(keys.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}) // useNewUrlParser: true,  useCreateIndex: true - нашел на стаковерфлоу, добавил из-зи предупреждения
  .then(() => console.log('MongoDB connected'))
  .catch(error => console.log(error))

// защищаем роуты - у стратегии passportStrategy, по умолчанию имя "jwt", вызывается в роутах как --- passport.authenticate('jwt', {session: false})
app.use(passport.initialize())
passport.use(passportStrategy) // с помощью этой стратегии, если не авторизованный пользователь зайдет на защищенный роут, выкинется 401 ошибка
// можно задать имя для стратегии явно
// passport.use('simple-jwt', passportStrategy)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)


// будем искать пересечения с друзьями, и находить друзей онлайн, чтобы послать им свой статус online
let idSocket = {} // { '123':['cdevGHa'] , '876':['aeVrga','iOryev']}
// let socketId = {} // { 'cdevGHa':'123' , 'aeVrga':'876' , 'iOryev':'876' }
let idSet = new Set() // '123' , '876'

function whichOnline(friendsSet) {
  let onLinefriendsId = [...friendsSet].filter(item => idSet.has(item))
  // [ [ 'rwPquVPCo8jvvDv4AAAC', 'DszJYpgWgo30RFfbAAAF' ], [FOn1X4HXAY06qK9RAAAH] ]
  let onLinefriendsSocket = onLinefriendsId.map(item => idSocket[item])
  let result = [] 
  // когда дисконектится последний юзер   onLinefriendsSocket --> undefined
  if (onLinefriendsSocket) {
    for (n=0;n<onLinefriendsSocket.length;n++) {
      result = [...result, ...onLinefriendsSocket[n]]
  }}
  // ['7cfj2kwIXcsmdAp_AAAF','Xu8z_AerEW4ixi2uAAAJ','FOn1X4HXAY06qK9RAAAH']
  return result
}

async function findFriendOnline(id) {
  try {
    // [{ _id: 5e8619e2bb949346cc52f126 },{ _id: 5e8e28266d4fbd3ff0bcb41b }]
    const friends = await User.aggregate([                   
      {$match: {_id: new mongoose.Types.ObjectId(id)}},      
      {$unwind: '$contacts'},
      {$project: {_id: "$contacts._id"}}
    ])
    let friendsSet = new Set()
    friends.forEach(item => friendsSet.add(item._id.toString()))
    return whichOnline(friendsSet)
  } catch (e) {
    console.log('findFriendOnline',e) 
  }
}

async function findNotOnlyFriendOnline(id) {
  try {
    const my_id = new mongoose.Types.ObjectId(id)
    // friends --> [{ _id: 5e8619e2bb949346cc52f126 },{ _id: 5e8e28266d4fbd3ff0bcb41b }]
    const friends = await User.aggregate([                   
      {$match: {_id: my_id}},      
      {$unwind: '$contacts'},
      {$project: {_id: "$contacts._id"}}
    ])
    // members --> [{ _id: 5e88626bdadb912b34b60173 },...]
    const members = await User.aggregate([
      {$match: {_id: my_id}},
      {$unwind: '$chats'},
      {$project: {_id:1, chat_id:'$chats._id'}},
      {
        $lookup: {
        "from": "chats", // источник - какую модель наблюдаем
        "localField": "chat_id", // в каком поле ищем ссылку для связи с источником
        "foreignField": "_id", // с каким полем источника сравниваем
        "as": "chat" // результат далее как...
        }
      },
      {$unwind: "$chat"},
      {$match: {'chat.admin_id': {$ne: ''}}},// выбираем только групповые чаты
      {$unwind: "$chat.members"},
      {$project: {_id:'$chat.members._id'}},
      {$match: {_id: {$ne: my_id}}} // исключаем записи с my_id
    ])
    // делаем friendsSet = пересечение(friends и members)
    // {'5e88626bdadb912b34b60173',...}
    let friendsSet = new Set()
    friends.forEach(item => friendsSet.add(item?._id?.toString()))
    members.forEach(item => friendsSet.add(item?._id?.toString()))
    return whichOnline(friendsSet)
  } catch (e) {
    console.log('findNotOnlyFriendOnline',e) 
  }
}

const m = (id, text, date) => ({id, text, date})

io.sockets
  .on('connection', socketioJwt.authorize({
    secret: keys.JWT,
    timeout: 15000 // 15 seconds to send the authentication message
  }))
  .on('authenticated', async (socket) => {
    console.log(`hello! ${socket.decoded_token.login}`) // socket.id, socket.handshake.headers.cookie, socket.handshake.time, socket.handshake.issued
    // РЕГИСТРАЦИЯ в ВСЕОБЩЕЙ КОМНАТЕ
    const user_id = socket.decoded_token.userId
    // добавим в "Всеобщую Комнату Всех Кто Онлайн"
    socket.join('ZxarHSk')
    const socket_id = socket.id
    // send socket_id to client
    let mySocket = io.sockets.sockets[socket_id]
    mySocket.emit('mySocketId', {socket_id: socket_id}) 
    
    
    try {
      // РЕГИСТРАЦИЯ в ЧАТАХ
      const user = await User.findById(user_id)
      if (user.chats) {
      for (i=0;i<user.chats.length;i++) {
        socket.join(user.chats[i]._id.toString()) // регистрируемся в каждом чате
      }}

      // пользователь уже онлайн?
      if (idSet.has(user_id)) { 
        idSocket[user_id] = [...idSocket[user_id], socket_id] 
      } else { 
        idSocket[user_id] = [socket_id] 
        //user_id --> DB: online: true
        user.online = true
        await user.save()
        // ищем друзей онлайн и посылаем им наш статус онлайн
        emitForOnlineFriends('updateStatus', user_id, {id: user_id, online: true}) 
      }
      // socketId[socket_id] = user_id
      idSet.add(user_id)

      console.log('idSocket', idSocket)
      console.log('idSet', idSet)
      // console.log('socketId', socketId)
      
    } catch (e) {
      console.log('authenticated',e) 
    }




    

    socket.on('Testing', (data, cb) => {
      // мы посмотрели сообщение - посылаем автору сообщение о смене статуса сообщения, по дате сообщения
      emitForOneFriend('updateStatus',{chat_id:data.chatId,date:data.date,status:2},data.user_id) // посылаем junming'у
    })

    // // пользователь сменил имя
    // socket.on('newName', (data, cb) => {
    //   emitForNotOnlyFriendOnline('updateName', data.user_id, {id: data.user_id, name: data.name})
    //   cb()
    // })

    // // пользователь удалил аккаунт
    // socket.on('deleteAccount', (data, cb) => {
    //   emitForNotOnlyFriendOnline('deleteContact', data.user_id, {id: data.user_id})
    //   cb()
    // })

    // =========================================================================
    // Добавляем нового юзера в комнату чата
    socket.on('userJoined', async (data, cb) => {

      try {
        // подсоединяем пользователя в комнату
        socket.join(data.chat_id)

        // записываем socket.id в chat/members
        const chat = await Chat.findById(data.chat_id)
        const memberIndex = chat.members.findIndex(member => member._id == data.user_id)
        chat.members[memberIndex].socket_id = socket.id // добавляем socket.id в участника чата
        await chat.save()

        // возвращаем socket.id
        cb({userId: socket.id})
        // io.to(data.room).emit('updateUsers', users.getByRoom(data.room)) // чтобы обновить список пользователей у тех кто находиться в чате
        // socket.emit('newMessage', m('admin', `Добро пожаловать ${data.name}.`))// id пока не передаем, не нужно
        // socket.broadcast.to(data.room) // отправляем сообщение всем в данной комнате кроме данного юзера
        //   .emit('newMessage', m('admin', `Пользователь ${data.name} зашел.`))
      } catch (e) {
        return cb(e)
      }
    })
  
    // =========================================================================
    // Посылаем сообщение
    socket.on('createMessage', async (data, cb) => {
      // start = new Date().getTime()
      if (!data.text) {
        return cb('Текст не может быть пустым')
      }
      try {
        // проверим SocketId на подлинность - если есть - вернет _id
        const user_id = await getIdbySocketId(data)
        // если юзер найден по сокету
        if (user_id) {
          // по _id находим его имя/логин
          const {login} = await User.findById(user_id, {login: 1, _id: 0})
          // сохраняем сообщение в базу
          const message = new Message({
            chat_id: data.chatId,
            sender_id: user_id,
            text: data.text
          })
          await message.save() 
          // создадим чат у участников чата, если еще не создан
          // вытащим список id других участников чата
          var chat_id = new mongoose.Types.ObjectId(data.chatId)
          const otherMembers = await getIdbyNeSocketId(data, chat_id)
          // пройдемся по участникам
          for (let n = 0; n < otherMembers.length; n++) {
            var member_id = new mongoose.Types.ObjectId(otherMembers[n])
            // проверим - в модели User создан данный чат?
            const haveChat = await haveAChat(member_id, chat_id)
            // если нет, то создать
            if (!haveChat) {
              const $set = {
                chat: {
                  _id: data.chatId,
                  chat_name: login  // login в последствии заменить на имя, которое ему дал пользователь !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                }
              }
              await User.findByIdAndUpdate({
                _id: member_id
              }, {$set}, {new: true})
            }
          }
          // io.to() - сообщение получают все пользователи в комнате data.chatId
          const now = new Date()
          // console.log('формируем сокет', m(user_id, data.text, now.toJSON()))
          io.to(data.chatId).emit('newMessage', m(user_id, data.text, now.toJSON()))

        }
        cb() //  колбэком мы очищаем текст на фронте
      } catch (e) {
        return cb(e)
      }
      // end = new Date().getTime()
      // time = end - start
      // console.log(time)
    })


    // =========================================================================
    // Пользователь разлогинился - пользовательское событие - сами назначаем в logout.vue
    socket.on('userLeft', async () => { // id можно передать и сюда

      try {
        socket.leave('ZxarHSk') // может пропобовать это сделать
        // server помнит user_id и socket_id
        // const id = socketId[socket_id]  //  если будет работать от user_id, то посмотреть нужно ли иметь socketId !!!!!!!!!!!!!!!
        const id = user_id

        if (idSocket[id].length==1) { // нет других подключений
          delete idSocket[id]
          idSet.delete(id)
        } else { 
          let sId = socket_id.toString();
          [sId, ...idSocket[id]] = idSocket[id] 
        }
        // delete socketId[socket_id]
        
        // у пользователя нет других подключений?
        if (!idSet.has(id)) { 
          //id --> DB: online: false, last_seen: new Date()
          const user = await User.findById(id)
          user.online = false
          user.last_seen = new Date()
          await user.save()
          // ищем друзей онлайн и посылаем им наш статус оффлайн
          const friendsOnline = await findFriendOnline(id, idSet, idSocket) 
          friendsOnline.forEach(socketId => {
            var socket = io.sockets.sockets[socketId]
            socket.emit('updateStatus', {id: user_id, online: false})
          })
        } 

        console.log('userLeft')
        console.log('idSocket', idSocket)
        console.log('idSet', idSet)

      } catch (e) {
        console.log('userLeft',e) 
      }

    })

    // =========================================================================
    // Пользователь закрыл вкладку, logout не причем
    socket.on('disconnect', async () => {

      try {
        socket.leave('ZxarHSk') // может пропобовать это сделать
        console.log('socket ', socket_id, ' disconnected')

        // const id = socketId[socket_id]  //  если будет работать от user_id, то посмотреть нужно ли иметь socketId !!!!!!!!!!!!!!!
        const id = user_id
 
        if (idSocket[id]) { // может уже нет подключения - например когда разлогинился, все отключили уже
          if (idSocket[id].length==1) { // нет других подключений
            delete idSocket[id]
            idSet.delete(id)
          } else { 
            let sId = socket_id.toString();
            [ sId, ...idSocket[id]] = idSocket[id] 
          }
          // delete socketId[socket_id]
          
          // у пользователя нет других подключений?
          if (!idSet.has(id)) { 
            //id --> DB: online: false, last_seen: new Date()
            const user = await User.findById(id)
            user.online = false
            user.last_seen = new Date()
            await user.save()
            // ищем друзей оффлайн и посылаем им наш статус онлайн
            const friendsOnline = await findFriendOnline(id, idSet, idSocket) 
            friendsOnline.forEach(socketId => {
              var socket = io.sockets.sockets[socketId]
              socket.emit('updateStatus', {id: user_id, online: false})
            })
          } 

        }
        
        console.log('disconnect')
        console.log('idSocket', idSocket)
        console.log('idSet', idSet)

      } catch (e) {
        console.log('disconnect',e) 
      }

    })
    
    // .on('unauthorized', () => {
    //   console.log('server - INNER unauthorized', new Date())
    // })
    
  })

  // .on('unauthorized', (socket) => {
  //   console.log('server - OUTER unauthorized', new Date())
  // })

// io.sockets    
//   .on('disconnect', () => {
//     console.log('server - OUTER disconnect', new Date())
//   })

module.exports = {
  app,
  server
}


async function emitForNotOnlyFriendOnline(emitedFunction, user_id, data) {
  let friendsOnline = []
  try {
    friendsOnline = await findNotOnlyFriendOnline(user_id) 
  } catch (e) {
    console.log('emitForNotOnlyFriendOnline',e)
  }
  friendsOnline.forEach(socketId => {
    let socket = io.sockets.sockets[socketId]
    socket.emit(emitedFunction, data)
  })
}

async function emitForOnlineFriends(emitedFunction, user_id, data) {
  let friendsOnline = []
  try {
    friendsOnline = await findFriendOnline(user_id) 
  } catch (e) {
    console.log('emitForOnlineFriends',e)
  }
  friendsOnline.forEach(socketId => {
    let socket = io.sockets.sockets[socketId]
    socket.emit(emitedFunction, data)
  })
}

// // ищем друзей онлайн и инициируем у них удаления нашего аккунта
// emitForNotOnlyFriendOnline('deleteContact', user_id, {id: user_id}) 

function emitForOneFriend(emitedFunction, data, toWhomId) {
  let toWhomSocketId = idSocket[toWhomId] // массив - изредка, когда один аккунт подключился несколько раз
  toWhomSocketId.forEach(socketId => {
  let socket = io.sockets.sockets[socketId]
  socket.emit(emitedFunction, data)
  })
}


// // мы приняли приглашение друга --> добавляем акаунт тому, кто слал запрос на добавление в друзья
// // сюда входит _id нового друга --> newFriendId
// let myContactData = {}
// try {
//   myContactData = await User.findById(user_id,{_id:1, name:1, avatar_url:1, login:1, last_seen:1, online:1})
// } catch (e) {
//   console.log('sendMyContactToNewFriend',e) 
// }
// emitForOneFriend('addContact',myContactData,'5e8619e2bb949346cc52f126') // посылаем junming'у


// // я посылаю пользователю _id запрос в друзья, передаю мой _id & login
// let myContactData = {}
// try {
//   myContactData = await User.findById(user_id,{_id:1, login:1})
// } catch (e) {
//   console.log('sendMyRequestToNewFriend',e) 
// }
// emitForOneFriend('addIncomingRequest',myContactData,'5e8619e2bb949346cc52f126') // посылаем junming'у


// // я могу отправить кому-нибудь рекомендацию на новый контакт, она попадает в OutgoingRequest
// // принимает whom_id & to_whom --> отправляет _id & login
// const whom_id = '5e88626bdadb912b34b60173' // посылаем dasha
// let whomData = {}
// try {
//   whomData = await User.findById(whom_id,{_id:1, login:1})
// } catch (e) {
//   console.log('sendRecomendationToFriend',e) 
// }
// emitForOneFriend('addOutgoingRequest',whomData,'5e8619e2bb949346cc52f126') // посылаем junming'у


// // я могу принять или оклонить чей-то запрос в друзья, меняем статус в OutgoingRequest
// // принимает user_id & to_whom --> отправляет _id & status = 2 || 3
// emitForOneFriend('responseOutgoingRequest',{_id:user_id,status:2},'5e8619e2bb949346cc52f126') // посылаем junming'у


// // если в групповой чат, добавляется новый мембер, всем мемберам чата посылается _id нового мембера и chat_id
// // на клиенте - в чат по chat_id добавляется новый мембер с _id
// // ищем нового мембера в контактах --> 3 варианта
// // он есть в контактах --> добавляем в commonchat - chat_id
// // он есть в notcontactyet --> добавляем в commonchat  - chat_id
// // его нигде нет --> запрашиваем его контактные данные + commonchat с одной записью chat_id
// let chat_id = '5eb2932fe05af5454e0b07f1' // "Drawing for Everyone"
// let _id = '5eb28face05af5454e0b07f0' // "yiwan"
// io.to(chat_id).emit('newChatMember', {chat:chat_id,member:_id})

// // если из группового чата исключается/удаляется мембер, всем мемберам чата посылается _id нового мембера и chat_id
// // на клиенте -  _id исключается из member и записывается в former
// // ищем исключенного в контактах --> 2 варианта
// // он есть в контактах --> изключаем из commonchat - chat_id
// // он есть в notcontactyet --> изключаем из commonchat  - chat_id
// let chat_id = '5eb2932fe05af5454e0b07f1' // "Drawing for Everyone"
// let _id = '5eb28face05af5454e0b07f0' // "yiwan"
// io.to(chat_id).emit('chatMemberLeave', {chat:chat_id,member:_id})


// // мы поменяли себе аватарку
// // ищем друзей онлайн и инициируем у них изменение аватарки в контакте и не групповом чате
// emitForNotOnlyFriendOnline('updateAvatar', user_id, {id: user_id, avatar_url: 'http//:newfoto.com'})

// // мы поменяли себе имя 
// // ищем друзей онлайн и инициируем у них изменение имени в карточке нашего контакта
// emitForNotOnlyFriendOnline('updateName', user_id, {id: user_id, name: 'Vasya'})

// // мы залогинились/разлогинились - посылаем всем наш статус online:true || online:false
// // ищем друзей онлайн и инициируем у них изменение имени в карточке нашего контакта
// emitForNotOnlyFriendOnline('updateOnline', user_id, {id: user_id, online: true})
// emitForNotOnlyFriendOnline('updateOnline', user_id, {id: user_id, online: false})

// // мы разлогинились - посылаем всем наш last_seen:new Date()
// // ищем друзей онлайн и инициируем у них изменение имени в карточке нашего контакта
// emitForNotOnlyFriendOnline('updateLastseen', user_id, {id: user_id, last_seen: new Date()})

// // новое сообщение попадает в последние сообщения и в стэк сообщений
// // chatId: '5e9b5135f52ac717c8b24b6d',
// // user_id: '5e8619e2bb949346cc52f126',
// // text: 'А ну ка, проверим тут!',
// // date: '2020-05-26T18:55:09.671Z'
// io.to(data.chatId).emit('newMessage', {chat_id: data.chatId, sender_id: data.user_id, text: data.text, date: data.date})

// // удаление сообщения - ищется по совпадению автора и даты - заменяется на 
// // text: "пользователь ... удалил сообщение", sender_id: "admin", date: data.date
// io.to(data.chatId).emit('deleteMessage', {chat_id: data.chatId, sender_id: data.user_id, date: data.date})

// // редактирование сообщение - ищется по совпадению автора и даты - заменяется на 
// // text: "новый текст", sender_id: "data.sender_id", date: data.date, update: data.updatedate
// io.to(data.chatId).emit('updateMessage', {chat_id: data.chatId, sender_id: data.user_id, date: data.date, text: data.text, update: data.update})