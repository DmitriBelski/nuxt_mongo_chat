const mongoose = require('mongoose')
const User = require('../models/user.model')

module.exports.getSelfData = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, {avatar_url: 1, name: 1, email: 1, _id: 0})
    res.status(200).json(user) // Успех 200 OK
  } catch (e) {
    res.status(500).json(e) // Ошибка сервера 500 Internal Server Error
  }
}

module.exports.getOneContact = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, {_id: 0, avatar_url: 1, name: 1, last_seen:1, login:1, online:1})
    res.status(200).json(user) // Успех 200 OK
  } catch (e) {
    res.status(500).json(e) // Ошибка сервера 500 Internal Server Error
  }
}

module.exports.getAllContact = async (req, res) => {
  const my_id = new mongoose.Types.ObjectId(req.params.id)
  try {
    // members[
    // { chat_id: 5eb2932fe05af5454e0b07f1,
    //   chat_name: 'Drawing for Everyone',
    //   member_id: 5e88626bdadb912b34b60173 }
    // ,...]
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
      {$project: {_id:0, chat_id:'$chat._id', chat_name:'$chat.chat_name', member_id:'$chat.members._id'}},
      {$match: {member_id: {$ne: my_id}}} // исключаем записи с my_id
    ])
    // получаем полные контактные данные для моих друзей из списка контактов
    // contacts [
    //   {
    //     _id: 5e8619e2bb949346cc52f126,      
    //     contact_name: 'junming',
    //     name: '',
    //     avatar_url: '',
    //     login: 'junming',
    //     last_seen: 2020-04-21T01:35:34.626Z,
    //     online: false
    //   },...
    // ]
    const contacts = await User.aggregate([
      {$match: {_id: my_id}},
      {$unwind: '$contacts'},
      {$project: {_id:'$contacts._id', contact_name:'$contacts.contact_name'}},
      {
        $lookup: {
        "from": "users", // источник - какую модель наблюдаем
        "localField": "_id", // в каком поле ищем ссылку для связи с источником
        "foreignField": "_id", // с каким полем источника сравниваем
        "as": "user" // результат далее как...
        }
      },
      {$unwind: "$user"},
      {$project: {_id:1, contact_name:1, name:'$user.name', avatar_url:'$user.avatar_url', login:'$user.login', last_seen:'$user.last_seen', online:'$user.online'}}
    ])
    // в members все данные переделаем в toString()
    members.forEach(item => {
      item.chat_id = item.chat_id.toString()
      item.member_id = item.member_id.toString()
    })
    // делаем Map уникальных из всех полученных member_id
    // membersMap Map {
    //   '5e8619e2bb949346cc52f126' => [
    //     { id: '5e9b5135f52ac717c8b24b6d', name: 'TheBestChat' },
    //     { id: '5eb2932fe05af5454e0b07f1', name: 'Drawing for Everyone' }
    //   ],...
    // }
    let membersMap = new Map()
    members.forEach(item => {
      if (membersMap.has(item.member_id)) {
        let arr = membersMap.get(item.member_id)
        arr.push({id:item.chat_id,name:item.chat_name})
        membersMap.set(item.member_id,arr)
      } else {
        membersMap.set(item.member_id,[{id:item.chat_id,name:item.chat_name}])
      }
    })
    // делаем set из всех имеющихся contacts
    let contactsSet = new Set()
    contacts.forEach(item => contactsSet.add(item._id.toString()))
    // ищем тех из member, кто еще не contact
    // notContact [ '5eb28face05af5454e0b07f0' ]
    let notContact = []
    for (let member of membersMap.keys()) {
      if (!contactsSet.has(member)) {notContact.push(new mongoose.Types.ObjectId(member))}
    }
    // получаем контактные данные для пользователей из notContact
    // notcontactyet [
    //   {
    //     _id: 5eb28face05af5454e0b07f0,
    //     login: 'yiwan',
    //     avatar_url: '',
    //     name: 'YiWanDrawer',
    //     online: false,
    //     last_seen: 2020-04-10T00:06:50.750Z
    //   },...
    // ]
    const notcontactyet = await User.aggregate([
      {$match: {_id: {$in: notContact}}},
      {$project: {_id:1, name:1, avatar_url:1, login:1, last_seen:1, online:1}}
    ])
    // добавляем массив commonChats[_id, name] если для него есть информация в members
    for (let member of membersMap.keys()) {
      if (contactsSet.has(member)) {
        // в contacts[] найти элемент с _id == member и в этот элемент записать commonchat: membersMap.get(member)
        let index = contacts.findIndex(item => item._id == member)
        contacts[index] = {commonchat: membersMap.get(member), ...contacts[index]}
      } else {
        // в notcontactyet[] найти элемент с _id == member и в этот элемент записать commonchat: membersMap.get(member)
        let index = notcontactyet.findIndex(item => item._id == member)
        notcontactyet[index] = {commonchat: membersMap.get(member), ...notcontactyet[index]}
      }
    }
    // работа с former
    // списко всех former в связанных со мной гуппровых чатах
    const former = await User.aggregate([
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
      {$unwind: "$chat.former"},
      {$project: {_id:0, member_id:'$chat.former._id'}},
    ])    
    // делаем Set из former
    let formerSet = new Set()
    former.forEach(item => formerSet.add(item.member_id.toString()))
    // ищем тех из former кто не в member и не в contact 
    // extraNotContact --> [ 5ec193f6e7b9384014186431 ]
    let extraNotContact = []
    for (let former of formerSet.keys()) {
      if (!contactsSet.has(former) && !membersMap.has(former)) {extraNotContact.push(new mongoose.Types.ObjectId(former))}
    }
    // запрашиваем контактные данные extraNotContact
    await Promise.all(extraNotContact.map(async (item) => {
      const user = await User.findById(item, {_id: 1, avatar_url: 1, name: 1, last_seen:1, login:1, online:1})
      // --> добавляем notcontactyet без коммон чата
      notcontactyet.push(user)
    }));
    // // аналог - тоже работает
    // for (const item of extraNotContact) {
    //   const user = await User.findById(item, {_id: 1, avatar_url: 1, name: 1, last_seen:1, login:1, online:1})
    //   // --> добавляем notcontactyet без коммон чата
    //   notcontactyet.push(user)
    // }
    res.status(200).json({contacts, notcontactyet}) // Успех 200 OK
  } catch (e) {
    res.status(500).json(e) // Ошибка сервера 500 Internal Server Error
  }
}

module.exports.getAllRequest = async (req, res) => {
  try {
    const contactrequest = await User.findById(req.params.id, {_id:0, incoming_request:1, outgoing_request:1})
    res.status(200).json(contactrequest) // Успех 200 OK
  } catch (e) {
    res.status(500).json(e) // Ошибка сервера 500 Internal Server Error
  }
}

// getAllContact
// result [
//   {
//     online: false,
//     _id: 5e8619e2bb949346cc52f126,
//     name: '',
//     avatar_url: '',
//     login: 'junming',
//     last_seen: 2020-04-21T01:35:34.626Z,
//     contact_name: 'junming'
//   },
//   ...
// ]

// module.exports.getAllContact = async (req, res) => {
//   try {
//     const {contacts} = await User.findById(req.params.id, {_id: 0, contacts: 1})
//     const id_arr = contacts.map(item => item._id)
//     const id_name_obj = {}
//     for (n=0;n<contacts.length;n++) {
//       const id = contacts[n]._id
//       const name = contacts[n].contact_name
//       id_name_obj[id] = name
//     }
//     const user = await User.find({_id: {$in: id_arr}}, {_id: 1, avatar_url: 1, login: 1, name: 1, last_seen: 1, online: 1})
//     const result = user.map(item => {
//       const res = item.toObject()
//       res['contact_name'] = id_name_obj[item._id]
//       return res
//     })
//     res.status(200).json(result) // Успех 200 OK
//   } catch (e) {
//     res.status(500).json(e) // Ошибка сервера 500 Internal Server Error
//   }
// }
