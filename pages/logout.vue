<template>
  <h1>
    Очищаем данные
  </h1>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  methods: {
    ...mapMutations({clearUsers: 'user/clearUsers'}),
    ...mapMutations({clearChats: 'user/clearChats'}),
    ...mapMutations({clearMessages: 'user/clearMessages'}),
  },
  middleware: ['user-auth'],
  beforeCreate () {
    this.$store.dispatch('auth/logout')
    this.$router.push('/login?message=logout')

    this.$socket.emit('userLeft', () => {  // можно передать this.user.id, но сервер впринципе его знает
      this.clearUsers()
      this.clearChats()
      this.clearMessages()
    })
  }
}
</script>
