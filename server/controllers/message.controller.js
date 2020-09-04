const mongoose = require('mongoose')
const Message = require('../models/message.model')

//*
module.exports.getAll = async (req, res) => {
  try {
    const chat_id = new mongoose.Types.ObjectId(req.params.id)
    const message = await Message.aggregate([
      {$match: {chat_id: chat_id}},
      {$project: {_id:0, sender_id:1, text:1, date:1, update:1, status:1}},
      {$sort: {date: 1}}
    ])
    res.status(200).json(message) // Успех 200 OK     можно писать res.json(posts)
  } catch (e) {
    res.status(500).json(e) // Ошибка сервера 500 Internal Server Error
  }
}

module.exports.migrateAll = async (req, res) => {
  try {
    const message = await Message.aggregate([
      {$project: {_id:1}}
    ])
    for (let i=0;i<message.length;i++) {
      // console.log('id', message[i]._id)
      const onemessage = await Message.findById(message[i]._id)
      // onemessage.status = 0
      // onemessage.date = onemessage.updated_at
      onemessage['update'] = 0
      await onemessage.save()
    }


    // for (let i=0;i<message.length;i++) {
    //   const {_id, read, chat_id, sender_id, text, updated_at, date, filter} = message[i]
    //   const id = new mongoose.Types.ObjectId(_id)
    //   const chatid = new mongoose.Types.ObjectId(chat_id)
    //   const senderid = new mongoose.Types.ObjectId(sender_id)
    //   message[i] = {_id: id, chat_id: chatid, sender_id: senderid, text: text, date:updated_at, update:0, status:0, filter:filter}
    // }
    // await message.save()
    // // console.log('message',message)

    res.status(200).json(message) // Успех 200 OK     можно писать res.json(posts)
  } catch (e) {
    res.status(500).json(e) // Ошибка сервера 500 Internal Server Error
  }
}


