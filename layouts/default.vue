<template>
  <div class="container" vs-theme="dark">

    <div class="header">
      <div class="headerwraper">
        <p class="chatname"> {{chatName}} </p>
        <p class="lastseen" v-if="chatName" >{{ status | date('last_seen') }}</p>
      </div>
    </div>

    <div class="menu">
      <div class="menu_up">
        <div class="button">
          <vs-button 
            transparent
            :active="storeMenu == 'contact'"
            @click="selectMenu('contact')"
          >
            Контакты
          </vs-button>
        </div>

        <div class="button">
          <vs-button 
            transparent
            :active="storeMenu == 'chat'"
            @click="selectMenu('chat')"
          >
            Чаты
          </vs-button>
        </div>

<vs-button flat  @click="testing()">
  Test
</vs-button>

        <div class="button-right">
          <vs-button 
            gradient
            style="min-width: 60px"
            animation-type="scale"
            :loading="loading"
            @click="logout()"
          >
            <i class='bx bx-log-out' ></i>
            <template #animate >
              Logout
            </template>
          </vs-button>
        </div>
      </div>


      <hr>

      <!-- <div class="color-wraper">
        <div v-for="(color, index) in colors" :key="index">
          <vs-button 
            @mouseover="color.hover = true"
            @mouseleave="color.hover = false"
            @click="color.active = !color.active"
            :style="[
              color.active || color.hover ? 
              ActiveButtonStyle(color.value[0],color.value[1],color.value[2]) 
              : '', 
              ButtonStyle(color.value[0],color.value[1],color.value[2])
            ]"
          >
            {{color.name}}
          </vs-button>
        </div>
      </div>

      <hr> -->
      
      <div class="namelist" v-show="storeMenu == 'contact'">
        <ContactList/>
      </div>

      <div class="namelist" v-show="storeMenu == 'chat'">
        <ChatList/>
      </div>
    </div>

    <div class="content">
      <nuxt/>
    </div>

    <div class="footer">
      <ChatForm/>
    </div>
    
  </div>
</template>

<script>
import ChatForm from '@/components/chatForm'
import ContactList from '@/components/contact'
import ChatList from '@/components/chat'
import {mapGetters} from 'vuex';

export default {
  middleware: ['user-auth'],
  components: { ChatForm, ContactList, ChatList },
  data() {
    return {
      loading: false,
      message: '',
      colors: [
        {name: 'tele1', value: [ 26, 36, 46], active: false, hover: false},
        {name: 'tele2', value: [ 34, 45, 59], active: false, hover: false},
        {name: 'tele3', value: [ 22, 29, 38], active: false, hover: false},
        {name: 'tele4', value: [ 35, 46, 58], active: false, hover: false},
        {name: 'tele5', value: [ 61, 97, 137], active: false, hover: false},
        {name: 'tele6', value: [ 34, 45, 59], active: false, hover: false},
        {name: 'tele7', value: [ 22, 29, 38], active: false, hover: false},
        {name: 'upright', value: [ 40, 56, 73], active: false, hover: false},
        {name: 'left1', value: [ 28, 37, 50], active: false, hover: false},
        {name: 'left2', value: [ 35, 48, 64], active: false, hover: false},
        {name: 'left3', value: [ 29, 36, 47], active: false, hover: false},
        {name: 'left4', value: [ 22, 29, 38], active: false, hover: false},
        {name: 'text', value: [ 122, 140, 157], active: false, hover: false},
        {name: 'icon', value: [ 136, 142, 156], active: false, hover: false},
      ]
    }
  },
  sockets: {
    connect: function () {
      console.log('default.vue says: socket connected')
    },
    disconnect: function () {
      console.log('default.vue says: socket disconnected')
    },
    customEmit: function (data) {
      console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)')
    }
  },
  methods: {
    testing() {
      // const now = new Date()
      // const data = {
      //   chatId: '5e9b5135f52ac717c8b24b6d',
      //   user_id: '5e8619e2bb949346cc52f126',
      //   text: 'А ну ка, проверим тут!',
      //   date: now.toJSON()
      // }
      // this.$socket.emit('Testing', data)
      // const now = new Date()
      // const data = {
      //   chatId: '5e9b5135f52ac717c8b24b6d',
      //   user_id: '5e8619e2bb949346cc52f126',
      //   date: "2020-04-17T21:48:36.491Z",
      //   text: 'Не надо было мне это писать',
      //   update: new Date()
      // }
      // this.$socket.emit('Testing', data)

      // this.$socket.emit('newName', {user_id: '5e8e28266d4fbd3ff0bcb41b', name: 'Valdemar'}, ()=>{}) // пользователь сменил имя
      this.$socket.emit('deleteAccount', {user_id: '5eb28face05af5454e0b07f0'}, ()=>{}) // пользователь удалил аккаунт
    },
    clickButton: function (data) {
      // $socket is socket.io-client instance
      this.$socket.emit('emit_method', data)
    },
    selectMenu(menu) {
      this.$store.commit('setMenu', menu)
    },
    toRGB(r, g, b) {
      return `rgb(${r},${g},${b})`
    },
    ButtonStyle(r, g, b) {
      return {
        'background-color': this.toRGB(r, g, b)
      }
    },
    ActiveButtonStyle(r, g, b) {
      return {
        '-webkit-box-shadow': `0px 10px 20px -10px ${this.toRGB(r, g, b)}`,
                'box-shadow': `0px 10px 20px -10px ${this.toRGB(r, g, b)}`,
        '-webkit-transform': 'translate(0, -3px)',
                'transform': 'translate(0, -3px)',
      }
    },
    logout() {
      this.loading = true
      this.$router.push('/logout')
      this.loading = false
    },

  },
  computed: {
    ...mapGetters({statusByLogin: 'user/statusByLogin'}),
    // user () {
    //   return this.$store.getters['user/user']
    // },
    chatName () {
      return this.$store.getters['chat/getChatName']
    },
    status () {
      if (this.chatName) {
        const group = this.$store.getters['chat/getChatGroup'] // чат групповой?
        if (!group) {return this.statusByLogin(this.chatName)}  
      } 
    },
    storeMenu () {
      return this.$store.getters['menu']
    },
  }
}
</script>

<style lang='stylus'>
.vs-input
  padding 9px 0 9px 20px
  width 100% 
</style>

<style lang='stylus' scoped>
getColor(vsColor, alpha = 1)
    unquote("rgba(var(--vs-"+vsColor+"), "+alpha+")")
getVar(var)
    unquote("var(--vs-"+var+")")

.namelist 
  display flex
  flex-direction column

.nameitem
  padding 1rem 0 0 2rem 

hr 
  border none
  height 2px
  background-color var(--vs-theme-bg2) !important
  color var(--vs-theme-bg2) !important

.color-wraper
  display flex
  flex-wrap wrap
  align-self flex-start
  padding 1rem

.container  
  & > div      
      font-size 1rem
      color #fff

.container
  position absolute
  height 100%
  width  100%
  display grid
  grid-gap 0px
  grid-template-columns repeat(12, 1fr)
  grid-template-rows 60px auto 60px 

.header
  grid-column 5 / -1
  background-color var(--vs-theme-layout) !important
  display flex
  border-left 1px solid var(--vs-theme-bg2)
  .headerwraper
    font-size 0.9rem
    margin auto 0 auto 1rem
    .chatname
      font-weight bold
      margin-bottom 0.3rem
    .lastseen
      opacity 0.5

.menu
  grid-column 1 / 5
  grid-row 1 / -1
  background-color var(--vs-theme-bg) !important
  .menu_up
    display flex
    .button-right
      margin-left auto
      padding 10px
    .button
      padding 10px 0 10px 10px

.content
  grid-column 5 / -1
  background-color var(--vs-theme-bg2) !important
  border 1px solid  rgb(13, 19, 29);

.footer
  grid-column 5 / -1
  background-color var(--vs-theme-layout) !important
  display flex
  border-left 1px solid var(--vs-theme-bg2)

@media all and (max-width: 600px)
  .container
    grid-template-rows 60px auto auto 60px 
  .header
    grid-column 1 / -1
  .menu
    grid-column 1 / -1
  .content
    grid-column 1 / -1
  .footer
    grid-column 1 / -1

</style>