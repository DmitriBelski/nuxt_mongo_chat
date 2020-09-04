const {model, Schema} = require('mongoose')

const invitationSchema = new Schema({
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  hash: {
    type: String,
    required: true
  }
})

module.exports = model('invitation', invitationSchema)