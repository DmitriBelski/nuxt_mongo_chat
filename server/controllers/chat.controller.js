const mongoose = require('mongoose')
const User = require('../models/user.model')
const Chat = require('../models/chat.model')
const Message = require('../models/message.model')

module.exports.create = async (req, res) => {
  const idArr = [
    new mongoose.Types.ObjectId(req.body[0].id),
    new mongoose.Types.ObjectId(req.body[1].id)
  ]
  const newChat = new Chat({
    members: [
      {_id: req.body[0].id, seen_date: Date.now()}, // первый это организатор
      {_id: req.body[1].id}
    ]
  })
  try {
    // чат в модели Chat: нужно создать или только обновить?
    // ищем уже созданный чат с данным набором юзеров, если есть чат --> получим _id
    const existChatId = await Chat.aggregate([
      { $match: { "members._id": { "$all": idArr} }},
      { $group: {_id: '$_id'}}
    ])

    if (existChatId) {
      // записываем seen_date: Date.now() в chat/members
      const existChat = await Chat.findById(new mongoose.Types.ObjectId(existChatId[0]._id))
      const memberIndex = existChat.members.findIndex(member => member._id == req.body[0].id)
      existChat.members[memberIndex].seen_date = new Date()
      await existChat.save()
      await createChatForUser(req, existChat._id)
      res.status(201).json(existChat) // Успех 201 Created
    } else {
      await newChat.save()
      await createChatForUser(req, newChat._id)
      res.status(201).json(newChat) // Успех 201 Created
    }
  } catch (e) {
    res.status(500).json(e) // Ошибка сервера 500 Internal Server Error
  }
}

createChatForUser = async (req, chatId) => {
  try {
    // создаем чат в модели User, потому что его точно не было
    const initUser = await User.findById(req.body[0].id) // находим запись инициатора чата
    const mateUser = await User.findById(req.body[1].id, {login: 1, _id: 0}) // находим запись собеседника
    initUser.chat.push({_id: chatId, chat_name: mateUser.login}) // имя чата по умолчанию будет логином собеседника
    await initUser.save()
  } catch (e) {
    res.status(500).json(e) // Ошибка сервера 500 Internal Server Error
  }
}

module.exports.getChats = async (req, res) => {
  try {
    const result = []
    const {chats} = await User.findById(req.params.id, {chats: 1, _id: 0})
    for (n=0;n<chats.length;n++) {
      const joinDate = chats[n].join_date
      const chat_id = new mongoose.Types.ObjectId(chats[n]._id)
      const user_id = new mongoose.Types.ObjectId(req.params.id)
      const message = await Message.aggregate([
        {$match: {chat_id: chat_id}},
        {$match: {date: {$gte: joinDate}}}, // история фильтруется по дате присоединения к чату
        {$match: {filter: {$ne: user_id}}}, // сообщения фильтруется для пользователей из filter[]
        {$project: {_id:0, chat_id:0, __v:0, filter:0}},
        {$sort: {date: -1}},
        {$limit: 1}
      ])
      const {_id, seen_date} = chats[n]
      const chatDetails = await Chat.findById(chat_id, {_id:0, admin_id:1, avatar_url:1, chat_name:1, members:1, former:1})
      let {admin_id, avatar_url, chat_name, members, former} = chatDetails
      former = former.map((item) => item._id) // [{ _id: 5e886... },{ _id: 5e8e2... }] --> [ 5e886... , 5e8e2... ]
      members = members.map((item) => item._id) // [{ _id: 5e886... },{ _id: 5e8e2... }] --> [ 5e886... , 5e8e2... ]
      members = members.filter((item) => item.toString() !== user_id.toString()) // оставим все кроме user_id
      result.push({
        id: _id,
        admin_id: admin_id,
        avatar_url: avatar_url,
        chat_name: chat_name,
        seen_date: seen_date, 
        members: members,
        former: former,
        lastmessage: message[0]
      })
    }
    res.status(200).json(result) // Успех 200 OK
  } catch (e) {
    res.status(500).json(e) // Ошибка сервера 500 Internal Server Error
  }
}

module.exports.getIdbySocketId = async (req) => {
  try {
    // ищем юзера по socket.id в таблице chat
    const findMember = await Chat.findById(req.chatId, {members: {$elemMatch: { socket_id: req.userId }}, _id:0})
    // возвращаем _id: 5e88626bdadb912b34b60173
    return findMember.members[0]._id
  } catch (e) {
    return e
  }
}

module.exports.getIdbyNeSocketId = async (req, chat_id) => {
  try {
    // вытащим список id других участников чата
    const findOtherMember = await Chat.aggregate([
      { $match: {_id: chat_id}},
      { $unwind: '$members'},
      { $match: {'members.socket_id': {$ne: req.userId}}},
      { $group: {_id: '$_id', members: {$push: '$members._id'}}}
    ])
    // findOtherMember[0].members  -->  [ 5e8619e2bb949346cc52f126, 5e8e28266d4fbd3ff0bcb41b ]
    return findOtherMember[0].members
  } catch (e) {
    return e
  }
}

module.exports.haveAChat = async (member_id, chat_id) => {
  try {
    // если у пользователя member_id есть чат chat_id - вернется --> [ { _id: 's' } ]
    const findChat = await User.aggregate([
      {$match: {_id: member_id}},
      {$project: {chat:1, _id:0}},
      {$unwind: '$chat'},
      {$match: {'chat._id': chat_id}},
      {$project: {_id: 's'}}
    ])
    // вернем boolean
    return (findChat.length > 0)
  } catch (e) {
    return e
  }
}


// Формат данных:

// getIdbySocketId
// findMember { 
//   members: [
//   {
//     admin: false,
//     _id: 5e88626bdadb912b34b60173,
//     seen_date: 2020-04-09T17:53:50.630Z,
//     socket_id: 'CRUv-5AnIKnLjr4eAAAC'
//   }
// ]}

// getChats
// 1 /
// chats [
//   {
//     join_date: 2020-04-18T19:12:54.126Z,
//     seen_date: 2020-04-30T00:04:04.179Z,
//     _id: 5e9b5135f52ac717c8b24b6d,
//     chat_name: 'junming'
//   },
//   ...
// ]
// 2 /
// [
//   {
//     id: 5e9b5135f52ac717c8b24b6d,
//     avatar_url: 'http://fotourl.com',
//     chat_name: 'TheBestChat',
//     seen_date: 2020-04-30T18:17:35.663Z,
//     members: [ 5e8619e2bb949346cc52f126 ],
//     lastmessage: {
//       sender_id: 5e88626bdadb912b34b60173,
//       text: 'Я купила тапки кстати',
//       date: 2020-04-18T19:15:01.166Z,
//       status: 0
//     }
//   },
//   ...
// ]