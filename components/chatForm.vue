<template>
  <div class="chatform">
    <div class="input" @keydown.enter="send">
      <vs-input v-model="text" placeholder="Your Message" autocomplete="off" @blur="blurinput()" @input="input()"/>
    </div>
    <div class="button">
      <vs-button
        gradient
        style="min-width: 60px"
        success
        animation-type="scale"
        @click="send"
      >
        <i class='bx bx-mail-send' ></i>
        <template #animate >
          Send
        </template>
      </vs-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: ''
    }
  },
  methods: {
    blurinput(){
      console.log('stop')
    },
    input(){
      console.log('start')
    },
    send() {
      // сначала нужно проверить не пустой ли текст !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      this.$socket.emit('createMessage', 
      {
        text: this.text,
        chatId: this.$store.getters['chat/chat_id'],
        userId: this.$store.getters['chat/socket_id']
      },
      data => { // когда на сервере сокет отработает, вернется колбэк функция, мы ее здесь забираем
        if (typeof data === 'string') {
          console.error(data)
        } else {
          this.text = ''
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.chatform
  flex 1
  display flex
  align-items center
  .input
    flex 1
    margin 0 10px 0 15px 
  .button
    margin-right 10px
</style>