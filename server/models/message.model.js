const {model, Schema} = require('mongoose')

const messageSchema = new Schema({
  chat_id: {
    type: Schema.Types.ObjectId, 
    ref: 'chats'
  },
  sender_id: {
    type: Schema.Types.ObjectId, 
    ref: 'users'
  },
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  update: {
    type: Date
  },
  status: {
    type: Number,
    default: 0
  },
  filter: [{
    _id: {
      type: Schema.Types.ObjectId,
      ref: ' users'
    }
  }]
})

module.exports = model('messages', messageSchema)