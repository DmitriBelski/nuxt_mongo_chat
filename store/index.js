export const state = () => ({
  error: null,
  menu: 'chat'
})

export const mutations = {
  setMenu (state, menu) {
    state.menu = menu
  },
  setError (state, error) {
    state.error = error
  },
  clearError (state) {
    state.error = null
  }
}

export const actions = {
  // данный экшн будет диспатчится один раз при загрузке приложения, диспатчится на сервере
  nuxtServerInit ({ dispatch }) {
    dispatch('auth/autologin')
  },
  // SOCKET_newMessage({ commit }, message) {
  //   // получили из сокета
  //   const update = {read: false, sender_id: message.id, text: message.text, updated_at: new Date(message.date)}
  //   commit('message/setMessage', update)
  //   ///// !!!!!!!!!!!! а в открытом чате нужно изменить last message     !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // },
  // SOCKET_updateStatus({ commit }, data) {
  //   commit('user/setStatus', data)
  // },
  SOCKET_mySocketId({ commit }, data) {
    commit('user/addToUser', data)
  },
  //*
  SOCKET_deleteContact({ commit }, data) { // сообщение об удалении пользователем аккаунта
    // data --> {id: "5e88626bdadb912b34b60173"}
    commit('user/deleteOneContact', data.id)
    commit('user/deleteOneNotContact', data.id)
  },
  //*
  SOCKET_addContact({ commit }, data) { // сообщение об принятии приглашения стать другом
    // data --> {online: false, _id: "5e88626bdadb912b34b60173", avatar_url: "http://myfoto.ru", login: "dasha", name: "AihuaDasha", last_seen: "2020-05-12T18:22:49.109Z"}
    commit('user/addOneContact', data)
  },
  //*
  SOCKET_addIncomingRequest({ commit }, data) { // сообщение об получении запроса на дружбу
    // data --> {_id: "5e88626bdadb912b34b60173", login: "dasha"}
    commit('user/addOneIncomingRequest', data)
  },
  //*
  SOCKET_addOutgoingRequest({ commit }, data) { // сообщение об получении рекомендации на добавление в друзья
    // data --> {_id: "5e88626bdadb912b34b60173", login: "dasha"}
    commit('user/addOneOutgoingRequest', data)
  },
  //*
  SOCKET_responseOutgoingRequest({ commit }, data) { // сообщение об ответе на запрос: принято или отклонено
    // data --> {_id: "5e88626bdadb912b34b60173", status: 2}  /or status: 3/
    commit('user/responseOutgoingRequest', data)
  },
  //*
  async SOCKET_newChatMember({ dispatch, getters, commit }, data) { // в чате новый пользователь
    // data --> {chat: "5eb2932fe05af5454e0b07f1", member: '5eb28face05af5454e0b07f0'}  
    commit('chat/newChatMember', data)
    data = {chatname:getters['chat/getNameById'](data.chat),...data} // data --> {chatname: "somename", chat: ...}
    commit('user/inCommonChat', data)
    // этого контакта нет --> запрашиваем его контактные данные + commonchat с одной записью chat_id
    if (!data.success) {  
      let notcontact 
      try {
        notcontact = await dispatch('user/getOneContact',data.member)
      } catch (e) {
        commit('setError', e)
        throw e
      }
      notcontact['_id'] = data.member
      notcontact['commonchat'] = [{id: data.chat, name: data.chatname}]
      commit('user/addNotContactsYet', notcontact)
    }
  },
  //*
  SOCKET_chatMemberLeave({ commit, getters}, data) { // пользователь удалил и покинул чат
    // data --> {chat: "5eb2932fe05af5454e0b07f1", member: '5eb28face05af5454e0b07f0'} 
    commit('chat/chatMemberLeave', data)
    data = {chatname:getters['chat/getNameById'](data.chat),...data} // data --> {chatname: "somename", chat: ...}
    commit('user/outOfCommonChat', data)
  },
  //*
  SOCKET_updateAvatar({ commit }, data) { // пользователь сменил аватарку
    commit('user/updateAvatar', data) // записываем аватарку в контакт
    commit('chat/updateAvatar', data) // записываем аватарку в не групповой чат
  },
  //*
  SOCKET_updateName({ commit }, data) { // пользователь сменил имя
    commit('user/updateName', data) // записываем имя в контакт
  },
  //*
  SOCKET_updateOnline({ commit }, data) { // у пользователя сменился статус онлайн
    commit('user/updateOnline', data) // записываем онлайн в контакт
  },
  //*
  SOCKET_updateLastseen({ commit }, data) { // пользователь вышел - появился актуальный last_seen
    commit('user/updateLastseen', data) // записываем last_seen в контакт
  },
  //*
  SOCKET_newMessage({ commit }, data) { // пользователь создал новое сообщение
    commit('message/setMessage', data) // записываем сообщение в стэк сообщений в store/message
    commit('chat/setLastMessage', data) // записываем сообщение как последнее сообщение в store/chat
  },
  //*
  SOCKET_deleteMessage({ commit }, data) { // пользователь удалил сообщение
    commit('message/deleteMessage', data) // удаляем сообщение из стэка сообщений в store/message
    commit('chat/deleteLastMessage', data) // удаляем сообщение как последнее сообщение в store/chat
  },
  //*
  SOCKET_updateMessage({ commit }, data) { // пользователь отредактировал сообщение
    commit('message/updateMessage', data) // редактируем сообщение в стэке сообщений в store/message
    // commit('chat/updateLastMessage', data) // редактируем сообщение как последнее сообщение в store/chat !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  },
  //*
  SOCKET_updateStatus({ commit }, data) { // пользователь посмотрел сообщение - прислали смену статуса
    commit('message/updateStatus', data) // меняем статус в стэке сообщений в store/message
    // commit('chat/updateLastMessage', data) // меняем статус у последнего сообщения в store/chat
  }
}

export const getters = {
  error: state => state.error,
  menu: state => state.menu
}
