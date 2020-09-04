const mongoose = require('mongoose')
const User = mongoose.model('users') // здесь require - не пройдет
const Chat = mongoose.model('chats') // здесь require - не пройдет
const Message = mongoose.model('messages') // здесь require - не пройдет

async function chats({id}) {
  console.log('id',id)
  try {
    const result = []
    const {chats} = await User.findById(id, {chats: 1, _id: 0})
    for (let n=0;n<chats.length;n++) {
      const joinDate = chats[n].join_date
      const chat_id = new mongoose.Types.ObjectId(chats[n]._id)
      const user_id = new mongoose.Types.ObjectId(id)
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
    return result 
  } catch (e) {
    console.error(e)
    throw e
  }
}

export { chats }