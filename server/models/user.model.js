const {model, Schema} = require('mongoose')

const userSchema = new Schema({
  avatar_url: {
    type: String
  },
  login: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  last_seen: {
    type: Date,
    default: Date.now
  },
  online: {
    type: Boolean,
    default: false
  },
  contacts: [{
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    contact_name: {
      type: String
    }
  }],
  incoming_request: [{
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    login: {
      type: String,
      required: true
    }
  }],
  outgoing_request: [{
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    login: {
      type: String,
      required: true
    },
    status: {
      type: Number, // 0,1,2,3
      default: 0
    }
  }],
  chats: [{
    _id: {
      type: Schema.Types.ObjectId,
      ref: ' chats'
    },
    socket_id: {
      type: String
    },
    join_date: {  // показываются только сообщения позже этой даты - если удалил чат, а потом добавил, то старые сообщения уже не увидишь
      type: Date,
      default: Date.now
    },
    seen_date: {
      type: Date,
      default: Date.now
    }
  }]
})

module.exports = model('users', userSchema)

// about seen_date:
// пользователь открыл чат, сообщения какой даты ему показать, а какие он еще не видел, будут внизу
// если пользователь удаляет у себя чат, seen_date обнуляется и удаляется у него из чатов
// если у всех пользователей обнулился seen_date, то чат вообще удаляется и все его сообщения
// когда создается чат из двух человек, он создается в базе только при первом сообщении, тогда же и seen_date 