export const state = () => ({
  chat_id: '', // "5e8f612e31d45a4690e3d0fb"
  // socket_id: '', // "e31d45a4690e3d"   -   похоже не нужно
  //*
  chats: []
})

export const mutations = {
  setChatId (state, chat_id) {
    state.chat_id = chat_id
  },
  setSocketId (state, socket_id) {
    state.socket_id = socket_id
  },
  addChat (state, chat) { // пока не используется
    state.chats = state.chats.push(chat)
  },
  //*
  setChats (state, chats) {
    state.chats = chats
  },
  //*
  newChatMember (state, data) {
    const index = state.chats.findIndex(item => item.id == data.chat)
    state.chats[index].members.push(data.member)
  },
  //*
  chatMemberLeave (state, data) {
    const index = state.chats.findIndex(item => item.id == data.chat)
    state.chats[index].members = state.chats[index].members.filter(item => item !== data.member)
    state.chats[index].former.push(data.member)
  },
  //*
  updateAvatar (state, data) {
    const index = state.chats.findIndex(chat=>!chat.admin_id&&chat.members[0]==data.id)
    state.chats[index].avatar_url = data.avatar_url
  },
  //*
  setLastMessage (state, message) {
    const mes = {
      sender_id: message.sender_id,
      text: message.text,
      status: 0,
      date: message.date
    } 
    const index = state.chats.findIndex(chat=>chat.id == message.chat_id)
    state.chats[index].lastmessage = mes
  },
  //*
  deleteLastMessage (state, message) { // если последнее сообщение совпадает по автору и дате - оно заменяется
    const name = this.getters['user/contactNameLoginById'](message.sender_id)
    const mes = {
      date: message.date,
      status: 0,
      sender_id: 'admin',
      text: `Пользователь ${name} удалил сообщение`,
    } 
    const index = state.chats.findIndex(chat=>chat.id == message.chat_id)
    const date1 = new Date(message.date)
    const date2 = new Date(state.chats[index].lastmessage.date)
    if (state.chats[index].lastmessage.sender_id==message.sender_id&&date1.getTime()==date2.getTime()) {
      state.chats[index].lastmessage = mes
    }
  },
  clearChats (state) {
    state.chat_id = ''
    state.socket_id = ''
    state.chats.length = 0
  }
}

export const actions = {
  async createChat ({ commit, dispatch }, chatusers) {
    try {
      await this.$axios.$post('api/chat/create', chatusers)
      const chats = dispatch('getChats', chatusers[0].id) // качаем список чатов
      commit('setChats', chats) // закинули список в стор
      console.log('setChats - after')
      commit('setMenu', 'chat', { root: true })
    } catch (e) {
      commit('setError', e, { root: true })
      throw e
    }
  },
  //**fetch*/
  async getChats ({ commit }, id) {
    try {
      // return await this.$axios.$get(`api/chat/chats/${id}`)
      return await this.$api("chat", "chats", {id: id})
    } catch (e) {
      commit('setError', e, { root: true })
      throw e
    }    
  }
}

export const getters = {
  chats: state => state.chats, // слишком простой геттер
  chat_id: state => state.chat_id, // слишком простой геттер
  socket_id: state => state.socket_id, // слишком простой геттер
  //*
  getIdByName: state => name => {
    const chat = state.chats.find(chat => chat.chat_name == name)
    if (!chat) {return undefined}   //  компонент всегда опрашивает, даже когда в store еще нет
    return chat.id
  },
  //*
  getNameById: state => id => {
    const {chat_name} = state.chats.find(chat => chat.id == id)
    return chat_name
  },
  getChatName: state => {
    const chat = state.chats.find(chat => chat._id == state.chat_id)
    if (!chat) {return undefined}
    return chat.chat_name
  },
  getChatGroup: state => {
    const chat = state.chats.find(chat => chat._id == state.chat_id)
    if (!chat) {return undefined}
    return chat.group
  }
}













