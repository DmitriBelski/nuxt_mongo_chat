<template>
  <div class="namelist">
    Contact List
    <div class="nameitem" v-for="(u, index) in users" :key="index" @click="openChat(u)">
      {{u.login}} 
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters({getIdByName: 'chat/getIdByName'}),
    users () {
      return this.$store.getters['user/users']
    }
  },
  methods: {
    openChat(u) {
      const {id} = this.$store.getters['user/user'] // id пользователя-инициатор чата

      // по имени чата находим id чата 
      // так как мы жмем на контакт, то мы уверены, что имя контакта == имя чата => ищем чат по имени
      let chatId = this.getIdByName(u.login) // ищем чат в state.user


// Здесь нужно поменять логику
// чат создается в базе даннных для всех одно временно с первым сообщением
// нет сообщений - нет чата
// здесь чат создается ? только локально в сторе ? с сообщением "напишете польователю сообщение"


      if (!chatId) { //  в state.user нет - создаем чат на сервере
        const chatusers = [
          {id: id}, // инициатор чата
          {id: u._id} // собеседник
        ]
        this.$store.dispatch('chat/createChat', chatusers)
        chatId = this.getIdByName(u.login) // опять ищем в сторе id чата
      }
 
      // передаем id чата и id инициатора
      const chatData = {
        user_id: id,
        chat_id: chatId
      }
      // подсоединяемся к чату
      this.$socket.emit('userJoined', chatData, data => {
        if (typeof data === 'string') {
          console.error(data)
        } else {         
          this.$store.commit('chat/setSocketId', data.userId) // это актуальный socket.id - будем хранить его в store
          console.log('setSocketId - before')
          this.$store.commit('chat/setChatId', chatId) // это chat.id открытого чата - будем хранить его в store
          console.log('setChatId - before')

          // список сообщений
          console.log('message - before')
          this.$store.dispatch('message/getMessages', {id: chatId, name: u.login}) 
          console.log('message - after')

          this.$store.commit('setMenu', 'chat') // переключаем вкладку
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.namelist 
  display flex
  flex-direction column

.nameitem
  padding 1rem 0 0 2rem 
  cursor pointer
</style>