<template>
  <div class="chatlist">
    <div class="chatitem" v-for="(ch, index) in chats" :key="index" 
      @click="openChat(ch, index)" :class="{active:active === index, hover:hover === index}"
      @mouseover="hover = index">
      <div class="avatar">
        <vs-avatar :color="randColor()">
          <img :src="ch.avatar_url" alt="">
          <!-- <template #text>
            {{ch.chat_name}}
          </template> -->
        </vs-avatar>
      </div>
      <div class="content">
        <span class="itemup">
          <p class="left short">{{ch.chat_name}}<p>
          <p v-if="ch.lastmessage" class="right">{{ch.lastmessage.date | date('chat_date')}}</p>
        </span>
        <p class="short" v-if="ch.lastmessage" v-html="lastMessageOwner(ch.lastmessage.sender_id, ch.lastmessage.text)"></p>
        <p v-else class="short lastmessage">Пока нет ни одного сообщения</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
    
export default {
  data () {
    return {
      active: null,
      hover: null
    }
  },
  computed: {
    ...mapGetters({getIdByName: 'chat/getIdByName', haveBeenOpened: 'message/haveBeenOpened'}),
    userId (){
      const {id} = this.$store.getters['user/user']
      return id
    },
    chats () {
      return this.$store.getters['chat/chats']
    }
  },
  methods: {
    lastMessageOwner(senderId, text) {
      if (senderId == this.userId) {
        return `<span class="you">Вы: </span><span class="lastmessage">${text}</span>`
      } else {
        return `<span class="lastmessage">${text}</span>`
      }
    },
    openChat(ch, index) {
      this.active = index
      // по имени чата находим id чата
      let chatId = this.getIdByName(ch.chat_name)
      // передаем id чата и id инициатора
      const chatData = {
        user_id: this.userId,
        chat_id: chatId
      }
      // подсоединяемся к чату
      this.$socket.emit('userJoined', chatData, async (data) => {
        if (typeof data === 'string') {
          console.error(data)
        } else {         
          // this.$store.commit('chat/setSocketId', data.userId) // это актуальный socket.id - будем хранить его в store  !!!!!!!!!   socket.id уже есть один на все чаты
          this.$store.commit('chat/setChatId', chatId) // это chat.id открытого чата - будем хранить его в store

          //проверка есть ли уже массив с сообщениями - тогда не надо у базы спрашивать
          if (!this.haveBeenOpened(chatId)) {
            try {
              await this.$store.dispatch('message/getMessages', {id: chatId, name: ch.chat_name}) 
            } catch (e) {
              console.error(e)
            }           
          }
          this.$store.commit('message/setChatId', chatId) // не знаю для чего он в chat, но в messages он нужен
          this.$store.commit('setMenu', 'chat') // переключаем вкладку
        }
      })
    },
    randColor () {
      function twoDigit (value) {
        if (value.length < 2) {
          return '0' + value
        } else {
          return value
        }
      }
      let r = Math.floor(Math.random() * (256))
      let g = Math.floor(Math.random() * (256))
      let b = Math.floor(Math.random() * (256))
      r = twoDigit(r.toString(16))
      g = twoDigit(g.toString(16))
      b = twoDigit(b.toString(16))
      return '#' + r + g + b
    }     
  },
}
</script>

<style lang="stylus">
.vs-avatar
  font-size 0.9rem
  font-weight bold

.you
  color rgb(100, 150, 190)
  font-weight bold

.lastmessage
  opacity 0.5

.active
  .you
    color white
    font-weight normal
  .lastmessage
    opacity 1 
  .right
    opacity 1

</style>

<style lang="stylus" scoped>
.chatlist 
  display flex
  flex-direction column

.chatitem
  line-height 1.7
  font-size 0.9rem
  padding 0.4rem 0.8rem 0.4rem 0.8rem
  cursor pointer
  display flex
  width 100% 
  align-items center
  // background-position center
  // transition background 0.8s

.hover
  background-color rgb(33, 44, 56)

.active
  background-color rgb(52, 90, 127)

// .ripple
//   background-position center
//   transition background 0.8s

// .hover
//   background rgb(33, 44, 56) radial-gradient(circle, transparent 1%, rgb(33, 44, 56) 1%) center/15000%
// .active
//   background-color rgb(52, 90, 127)
//   background-size 100%
//   transition background 0s
  
.content
  flex 1
  min-width 0
  margin-left 0.7rem

.itemup
  display flex
  justify-content flex-end
  .left
    margin-right auto
    font-weight bold
  .right
    opacity 0.5

.active 
  .right
    opacity 1

.short
  white-space nowrap
  overflow hidden
  text-overflow ellipsis

</style>