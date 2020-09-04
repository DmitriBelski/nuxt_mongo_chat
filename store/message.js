export const state = () => ({
  chatId: '',
  // status: 0/1/2, sender_id: "5e8f612e31d45a4690e3d0fb", text: "", date: 03.04.2020
  messages: {start:{sender_id: 'admin', text: 'Выберите, кому хотели бы написать'}}
})

export const mutations = {
  //*
  setMessage (state, message) {
    // chat_id: "5e9b5135f52ac717c8b24b6d", 
    // sender_id: "5e8619e2bb949346cc52f126", 
    // text: "А ну ка, проверим тут!", 
    // date: "2020-05-27T12:42:00.581Z"
    const mes = {
      sender_id: message.sender_id,
      text: message.text,
      status: 0,
      date: message.date
    } 
    state.messages[message.chat_id].push(mes)
  },
  //*
  deleteMessage (state, message) {
    // chat_id: "5e9b5135f52ac717c8b24b6d"
    // date: "2020-05-28T12:33:07.946Z"
    // sender_id: "5e8619e2bb949346cc52f126"
    const name = this.getters['user/contactNameLoginById'](message.sender_id)
    const mes = {
      sender_id: 'admin',
      text: `Пользователь ${name} удалил сообщение`,
    } 
    const index = state.messages[message.chat_id].findIndex(m => m.sender_id==message.sender_id&&m.date==message.date)
    this._vm.$set(state.messages[message.chat_id], index, mes)
  },
  //*
  updateMessage (state, message) {
    // chat_id: "5e9b5135f52ac717c8b24b6d", 
    // sender_id: "5e88626bdadb912b34b60173", 
    // date: "2020-04-21T14:51:49.321Z", 
    // text: "Не надо было мне это писать", 
    // update: "2020-05-29T00:15:11.685Z"
    const name = this.getters['user/contactNameLoginById'](message.sender_id)
    const mes = {
      sender_id: message.sender_id,
      text: message.text,
      status: 0,
      date: message.date,
      update: message.update
    } 
    const index = state.messages[message.chat_id].findIndex(m => m.sender_id==message.sender_id&&m.date==message.date)
    this._vm.$set(state.messages[message.chat_id], index, mes)
  },
  updateStatus (state, message) {
    // chat_id: "5e9b5135f52ac717c8b24b6d", 
    // date: "2020-04-21T14:51:49.321Z", 
    // status: 2
    const myId = this.getters['user/user'].id
    const index = state.messages[message.chat_id].findIndex(m => m.sender_id==myId&&m.date==message.date)
    const mes = state.messages[message.chat_id][index]
    mes.status = message.status
    this._vm.$set(state.messages[message.chat_id], index, mes)
  },
  //*
  setMessages (state, data) {
    state.messages = {...data, ...state.messages}
  },
  clearMessages (state) {
    state.messages.length = 0
  },
  //*
  setChatId (state, id) {
    state.chatId = id
  }
}

export const actions = {
  //*
  async getMessages ({ commit }, data) {
    let messages
    try {
      messages = await this.$axios.$get(`api/message/messages/${data.id}`)
    } catch (e) {
      commit('setError', e, { root: true })
      throw e
    }
    insertDateToMessageArray(messages, data.name)
    const mesObj = {[data.id]:messages}
    commit('setMessages', mesObj)
  },
  async migrateMessages () {
    try {
      await this.$axios.$post('api/message/messages')
    } catch (e) {
      throw e
    }
  }
}

export const getters = {
  messages: state => {
    if (state.chatId == '') {
      return [state.messages.start]
    } else {
      return state.messages[state.chatId]
    }
  },
  haveBeenOpened: state => id => {
    return !!state.messages[id]
  }
}

// после получения сообщения от сокета, store/index вызывает setMessage - сообщение добавляется
// Но надо, чтобы еще и соощения от 'time' и 'admin' пересматривались, иногда нужно убрать "Отправьте пользователю сообщение"
// иногда нужно просто добавить дату сообщения, иногда ничего не добавлять
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// надо это делать в промежуточный массив, а потом после получения из сокета нового сообщения переделывать этот массив - Важно, что не делая запрос на сервер

// втавляем в массив собщений записи даты, для отображения дат в потоке сообщений
function insertDateToMessageArray (messages, chatName) {
  if (messages.length == 0) {
    messages[0] = {sender_id: 'admin', text: `Отправьте пользователю ${chatName} сообщение`} 
    return
  }
  let date = new Date().toLocaleDateString()
  for (let n=0; n<messages.length; n++) {
    const thisDate = new Date(messages[n].date).toLocaleDateString()
    if (date != thisDate) {
      messages.splice(n, 0, {sender_id: "time", date: messages[n].date, text: ""})
      n++
    } 
    date = thisDate
  }
}












