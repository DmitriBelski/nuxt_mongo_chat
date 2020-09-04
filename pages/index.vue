<template>
  <div class="c-wrap">
    <div class="c-chat" ref="block">
      <div v-for="(message, index) in messages" :key="index" class="message" :ref="'m' + index">
        <MessageList @shareWidth="remeberWidth"
          :name="loginById(message.sender_id)"
          :text="message.text"
          :owner="owner(message.sender_id)"
          :date="new Date(message.date)"
          :index="index"
          :update="message.update"
        />
      </div>
    </div>
    <transition name="fade">
      <div ref="date" v-if="fixDateIndex>=0 && heightByIndex(fixDateIndex) < -70 " class="fixdate" :style="left()">
        <p>{{ messages[fixDateIndex].date | date('flow') }}</p>
      </div>
    </transition>
  </div>
</template>

<script>
import MessageList from '@/components/message'
import {mapGetters} from 'vuex';

export default {
  layout: 'default',
  components: { MessageList },
  data() {
    return {
      hasRefDate: false,
      fixDateIndex: -1,
      dateArr: [], // --> {index: 0, height: null}
      widthArr: {} // --> 0: 128, 2: 81, 4: 90 ...
    }
  },
  computed: {
    ...mapGetters({userById: 'user/loginById'}),
    messages () {
      return this.$store.getters['message/messages']
    }
  },
  watch: {
    messages () {
      setTimeout(() => {
        this.$refs.block.scrollTop = this.$refs.block.scrollHeight  
      })
      // заполним массив dateArr, записями только о датах, а сообщения пропустим
      // --> {index: 0, height: null}
      // --> {index: 2, height: null}
      this.fixDateIndex = -1
      this.dateArr.length=0
      for (let n=0; n<this.messages.length; n++) {
        if (this.messages[n].sender_id == 'time') {
          this.dateArr.push({index: n, height: null})
        }
      }
    }
  },
  methods: {
    hybridOffsetWidth (index) {
      if (index == 0) {
        if (this.$refs.date) {return this.$refs.date.offsetWidth}
        return 0 // поидее никогда не вернет 0 - оставлю, чтобы избежать ошибки
      } else {
        return this.widthArr[index]
      }
    },
    owner (id) {
      if (id == 'time') {return false} // если это сообщение с датой
      if (id == 'admin') {return false} // если это сообщение от админа
      const user = this.$store.getters['user/user']
      return user.id === id
    },
    loginById (id) {
      if (id == 'time') {return 'time'} // если это сообщение с датой
      if (id == 'admin') {return 'admin'} // если это сообщение от админа
      if (this.owner(id)) {return this.$store.getters['user/user'].login}
      return this.userById(id)
    },
    topFixDates() {
      // при скролинге каждой дате обновляются высоты
      this.dateArr = this.dateArr.map(date => {
        return {
          index: date.index,
          //-----------------------------растояние блока от верха страницы - скролл самой страницы + высота блока (с марджином)
          height: date.height = this.$refs['m'+date.index][0].offsetTop - this.$refs.block.scrollTop - 0.5*this.$refs['m'+date.index][0].clientHeight - 50
        }
      })
      // ищем индекс самой большей из отрицательных высот (тех что спрятались вверху)
      let maxNeg = -1000
      for (let n=0; n<this.dateArr.length; n++) {
        if (this.dateArr[n].height < 0 && this.dateArr[n].height > maxNeg) {
          maxNeg = this.dateArr[n].height
          this.fixDateIndex = this.dateArr[n].index    
        }
      }
    },
    remeberWidth(value) {
      this.widthArr[value.index] = value.width
    },
    left() {
      return {
        // 'left': 0.5*(this.$refs.block.clientWidth - this.widthArr[this.fixDateIndex]) + 'px', // offsetWidth - дает ширину вместе с прокруткой - здесь удобно clientWidth
        'left': 0.5*(this.$refs.block.clientWidth - this.hybridOffsetWidth(this.fixDateIndex)) + 'px', // offsetWidth - дает ширину вместе с прокруткой - здесь удобно clientWidth
      }
    },
    heightByIndex(index) {
      if (this.fixDateIndex>=0) {
        return this.dateArr.find(date => date.index == index).height 
      }
      return -1000
    }
  },
  async fetch ({ store }) {
    const {id, login} = store.getters['user/user']
    let user, chats, request
    try {
      user = await store.dispatch('user/getSelfData')
      chats = await store.dispatch('chat/getChats', id)
      await store.dispatch('user/getAllContact')
      request = await store.dispatch('user/getAllRequest')
      // await store.dispatch('message/migrateMessages')
    } catch (e) {
      console.log(e)
    }  
    user = {...user, login: login, id: id} // дополним тем, что уже имеется
    store.commit('user/setUser', user)
    // не групповым чатом проставляем аватарки собеседников
    for (let chat of chats) {
      if (!chat.avatar_url || chat.avatar_url == '') {
        let contact = store.getters['user/contacts']
        let index = contact.findIndex(c => c._id.toString() == chat.members[0].toString())
        chat.avatar_url = contact[index].avatar_url
      }
    }
    if (chats) {store.commit('chat/setChats', chats)}
    if (request) {store.commit('user/setRequest', request)}
  },
  mounted() {
    this.$refs.block.addEventListener('scroll', () => this.topFixDates())
  }
}
</script>

<style lang='stylus'>
  .c-wrap
    height 100%
    position relative
    overflow hidden

  .c-chat
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    overflow-y auto
    &::-webkit-scrollbar
      -webkit-appearance none
      width 7px
    &::-webkit-scrollbar-thumb
      border-radius 2px
      margin 0.3rem 0.3rem 0.3rem 0
      background-color rgba(26, 36, 46, 0.5)
      -webkit-box-shadow 0 0 1px rgba(0,0,0,0.5)

  .message
    &:nth-child(1)
      margin-top 1rem

  .fixdate
    position absolute
    top 1rem
    left 50%
    // margin-bottom 1rem
    p
      font-size 0.8rem
      padding 0.4rem 0.8rem
      background rgba(26, 36, 46, 0.5)
      border-radius 1rem
      display inline-block    

.fade-enter-active,
.fade-leave-active
  transition opacity .5s

.fade-enter,
.fade-leave-to
  opacity 0

</style>