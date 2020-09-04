const {model, Schema} = require('mongoose')

const chatSchema = new Schema({
  admin_id: {
    type: Schema.Types.ObjectId, 
    ref: 'users'
  },
  avatar_url: {
    type: String
  },
  chat_name: {
    type: String,
    required: true
  },
  members: [{
    _id: {
      type: Schema.Types.ObjectId, 
      ref: 'users'
    }
  }],
  former: [{
    _id: {
      type: Schema.Types.ObjectId, 
      ref: 'users'
    }
  }]
})

module.exports = model('chats', chatSchema)