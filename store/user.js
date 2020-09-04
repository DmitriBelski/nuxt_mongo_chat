export const state = () => ({
  //*
  user: {},
  //*
  contacts: [],
  //*
  notcontactyet: [],
  //*
  incoming_request: [],
  //*
  outgoing_request: []
})

export const mutations = {
  //*
  addToUser (state, user) {
    state.user = {...state.user, ...user}
  },
  //*
  setUser (state, user) {
    state.user = user
  },
  //*
  setContacts (state, contacts) {
    state.contacts = contacts
  },
  //*
  setNotContactsYet (state, notcontactyet) {
    state.notcontactyet = notcontactyet
  },
  //*
  addNotContactsYet (state, notcontactyet) {
    state.notcontactyet = [notcontactyet, ...state.notcontactyet]
  },
  //*
  setRequest (state, request) {
    state.incoming_request = request.incoming_request
    state.outgoing_request = request.outgoing_request
  },
  //*
  deleteOneContact (state, id){
    state.contacts = state.contacts.filter(user => user._id !== id)
  },
  //*
  deleteOneNotContact (state, id){
    state.notcontactyet = state.notcontactyet.filter(user => user._id !== id)
  },
  //*
  addOneContact (state, data){
    const index = state.notcontactyet.findIndex(item => item._id == data._id)
    console.log('index',index)
    // если этот контакт есть в notcontactyet, то мы возьмем оттуда commonchat
    if (index>-1) {
      const commonchat = state.notcontactyet[index].commonchat
      data = {commonchat,...data}
    }
    state.contacts.push(data)
  },
  //*
  addOneIncomingRequest (state, data){
    state.incoming_request.push(data)
  },
  //*
  addOneOutgoingRequest (state, data){
    state.outgoing_request.push({status:0, ...data})
  },
  //*
  responseOutgoingRequest (state, data){
    const index = state.outgoing_request.findIndex(item => item._id == data._id)
    state.outgoing_request[index].status = data.status
  },
  //*
  inCommonChat (state, data){
    // ищем нового мембера data.member в контактах --> 3 варианта
    // он есть в контактах --> добавляем в commonchat - chat_id
    const conindex = state.contacts.findIndex(c=>c._id==data.member)
    if (conindex>-1) {
      state.contacts[conindex].commonchat.push({id:data.chat,name:data.chatname})
      data.success = true
      return
    }
    // он есть в notcontactyet --> добавляем в commonchat  - chat_id
    const nonindex = state.notcontactyet.findIndex(c=>c._id==data.member)
    if (nonindex>-1) {
      state.notcontactyet[nonindex].commonchat.push({id:data.chat,name:data.chatname})
      data.success = true
      return
    }
    // его нигде нет --> запрашиваем его контактные данные + commonchat с одной записью chat_id
    data.success = false
  },
  //*
  outOfCommonChat (state, data){
    // ищем нового мембера data.member в контактах --> 2 варианта
    // он есть в контактах --> удаляем из commonchat - chat_id
    const conindex = state.contacts.findIndex(c=>c._id==data.member)
    if (conindex>-1) {
      state.contacts[conindex].commonchat = state.contacts[conindex].commonchat.filter(item => item.id !== data.chat)
      return
    }
    // он есть в notcontactyet --> даляем из commonchat  - chat_id
    const nonindex = state.notcontactyet.findIndex(c=>c._id==data.member)
    if (nonindex>-1) {
      state.notcontactyet[nonindex].commonchat = state.notcontactyet[nonindex].commonchat.filter(item => item.id !== data.chat)
      return
    }
  },
  //*
  updateAvatar (state, data){
    const conindex = state.contacts.findIndex(c=>c._id==data.id)
    if (conindex>-1) {
      state.contacts[conindex].avatar_url = data.avatar_url
    } else {
      const nonindex = state.notcontactyet.findIndex(c=>c._id==data.id)
      if (nonindex>-1) {
        state.notcontactyet[nonindex].avatar_url = data.avatar_url
      }
    }
  },
  //*
  updateName (state, data){
    const conindex = state.contacts.findIndex(c=>c._id==data.id)
    if (conindex>-1) {
      state.contacts[conindex].name = data.name
    } else {
      const nonindex = state.notcontactyet.findIndex(c=>c._id==data.id)
      if (nonindex>-1) {
        state.notcontactyet[nonindex].name = data.name
      }
    }
  },
  //*
  updateOnline (state, data){
    const conindex = state.contacts.findIndex(c=>c._id==data.id)
    if (conindex>-1) {
      state.contacts[conindex].online = data.online
    } else {
      const nonindex = state.notcontactyet.findIndex(c=>c._id==data.id)
      if (nonindex>-1) {
        state.notcontactyet[nonindex].online = data.online
      }
    }
  },
  //*
  updateLastseen (state, data){
    const conindex = state.contacts.findIndex(c=>c._id==data.id)
    if (conindex>-1) {
      state.contacts[conindex].last_seen = data.last_seen
    } else {
      const nonindex = state.notcontactyet.findIndex(c=>c._id==data.id)
      if (nonindex>-1) {
        state.notcontactyet[nonindex].last_seen = data.last_seen
      }
    }
  },
  clearUsers (state) {
    state.user = {}
    state.contacts.length = 0
  },
  setStatus (state, data) {
    const user = state.contacts.filter(user => user._id == data.id)
    if (data.online) {
      user[0].online = true
    } else {
      user[0].online = false
      user[0].last_seen = new Date()
    }
  }
}

export const actions = {
  //**fetch*/
  async getSelfData ({ commit, state }) {
    try {
      // return await this.$axios.$get(`api/user/self/${state.user.id}`)
      return await this.$api("user", "self", {id: state.user.id})
    } catch (e) {
      commit('setError', e, { root: true })
      throw e
    }
  },
  //*
  async getOneContact ({ commit }, id) {
    try {
      return await this.$axios.$get(`api/user/user/${id}`)
    } catch (e) {
      commit('setError', e, { root: true })
      throw e
    }
  },
  //**fetch*/
  async getAllContact ({ commit, state }) {
    try {
      // let {contacts, notcontactyet} = await this.$axios.$get(`api/user/users/${state.user.id}`)
      let {contacts, notcontactyet} = await this.$api("user", "users", {id: state.user.id})
      commit('setContacts', contacts)
      commit('setNotContactsYet', notcontactyet)
    } catch (e) {
      commit('setError', e, { root: true })
      throw e
    }
  },
  //**fetch*/
  async getAllRequest ({ commit, state }) {
    try {
      // return await this.$axios.$get(`api/user/request/${state.user.id}`)
      return await this.$api("user", "request", {id: state.user.id})
    } catch (e) {
      commit('setError', e, { root: true })
      throw e
    }
  }

}

export const getters = {
  user: state => state.user, // слишком простой геттер - но используется в index.vue
  contacts: state => state.contacts,  // слишком простой геттер - но используется в index.vue
  loginById: state => id => state.contacts.find(user => user._id == id).login,
  //*
  contactNameLoginById: state => id => { // по id возвращает, по приоритету, contact_name || name || login
    let name = ''
    const conindex = state.contacts.findIndex(c=>c._id==id)
    if (conindex>-1) {
      name = state.contacts[conindex].contact_name
      if (name && name !== "") {return name}
      name = state.contacts[conindex].name
      if (name && name !== "") {return name}
      name = state.contacts[conindex].login
      if (name && name !== "") {return name}
    } else {
      const nonindex = state.notcontactyet.findIndex(c=>c._id==id)
      if (nonindex>-1) {
        name = state.notcontactyet[nonindex].name
        if (name && name !== "") {return name}
        name = state.notcontactyet[nonindex].login
        if (name && name !== "") {return name}
      }
    }
  },
  statusByLogin: state => login => {
    // if (!login) {return undefined}
    const online = state.contacts.find(user => user.login == login).online
    if (online) {
      return 'online'
    } else {
      return state.contacts.find(user => user.login == login).last_seen
    }
  }
}
