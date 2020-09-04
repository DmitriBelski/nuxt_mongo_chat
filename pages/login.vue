<template>
  <div class="center">
    <vs-dialog not-close prevent-close success v-model="active">
      <template #header>
        <h4 class="not-margin">
          Welcome to <b>MongoNuxt</b> messenger
        </h4>
      </template>

      <div class="con-form">
        <vs-input v-model="login" placeholder="login">
          <template #icon>
            @
          </template>
          <template v-if="!loginValid" #message-danger>
            please input login more than 2 character
          </template>
        </vs-input>

        <vs-input
        type="password"
        v-model="password"
        placeholder="Password"
        :visiblePassword="hasVisiblePassword"
        icon-after
        @click-icon="hasVisiblePassword = !hasVisiblePassword"
        @keyup.enter="onSubmit()">
          <template #icon>
            <i v-if="!hasVisiblePassword" class='bx bx-show-alt'></i>
            <i v-else class='bx bx-hide'></i>
          </template>
          <template v-if="!passwordValid" #message-danger>
            please input password more than 1 character
          </template>
        </vs-input>

        <div class="flex">
          <vs-checkbox v-model="remember">Remember me</vs-checkbox>
          <a href="#">Forgot Password?</a>
        </div>
      </div>

      <template #footer>
        <div class="footer-dialog">
          <vs-button 
          block 
          :loading="loading"
          @click="onSubmit()">
            Sign In
          </vs-button>

          <div class="new">
            New Here? <a href="/register">Create New Account</a>
          </div>
        </div>
      </template>
    </vs-dialog>
  </div> 
</template>

<script>
export default {
  name: 'chat',
  layout: 'empty',
  head: {
    title: 'Добро пожаловать в NuxtChat'
  },
  data:() => ({
    loginValid: true,
    passwordValid: true,
    loading: false,
    active: true,
    login: '',
    password: '',
    remember: false,
    hasVisiblePassword: false
  }),
  mounted () {
    const { message } = this.$route.query
    switch (message) {
      case 'login':
        this.$vs.notification({
          color: 'primary',
          position: 'top-center',
          title: 'Вы не авторизованы',
          text: `Для начала войдите в систему`
        })
        this.$router.push('/login')
        break
      case 'logout':
        this.$vs.notification({
          color: 'success',
          position: 'top-center',
          title: 'До встречи, друг',
          text: `Ты успешно вышел из системы`
        })
        this.$router.push('/login')
        break
      case 'session':
        this.$vs.notification({
          color: 'warn',
          position: 'top-center',
          title: 'Время сессии истекло.',
          text: `Пожалуйста, зайдите заново`
        })
        this.$router.push('/login')
        break
      case 'registered':
        this.$vs.notification({
          color: 'success',
          position: 'top-center',
          title: 'Вы в команде!',
          text: `Теперь, пожалуйста, залогиньтесь`
        })
        this.$router.push('/login')
        break
    }
  },
  methods: {
    async onSubmit () {
      // more than 2 digits
      this.loginValid = (this.login.length >= 3)
      // more than 1 digits
      this.passwordValid = (this.password.length >= 2)

      if (this.loginValid && this.passwordValid) {
        this.loading = true
        try {
          const formData = {
            login: this.login,
            password: this.password
          }
          await this.$store.dispatch('auth/login', formData)
          // this.$store.commit('user/setUser', this.login) // пусть сервер после логина закоммитит и логин и id заодно
          
          // location.href --> localhost:3000/login
          // location.origin --> localhost:3000
          location.href=location.origin
        } catch (e) {
          this.loading = false
        }
      }
    }
  }
}
</script>
<style lang='stylus'>
getColor(vsColor, alpha = 1)
    unquote("rgba(var(--vs-"+vsColor+"), "+alpha+")")
getVar(var)
    unquote("var(--vs-"+var+")")
    
@-webkit-keyframes autofill 
  to 
    color white
    background-color getColor('primary')

input:-webkit-autofill 
  -webkit-animation-name autofill
  -webkit-animation-fill-mode both

.vs-input-parent
  margin-bottom 10px   
  .vs-input-content
    margin-top 10px
    width calc(100%)
    .vs-input
      width 100%
    .vs-input--has-icon
      padding-left 45px
    .vs-input--has-icon--after
      padding-left 14px
      padding-right 38px
</style>

<style lang="stylus" scoped>
getColor(vsColor, alpha = 1)
    unquote("rgba(var(--vs-"+vsColor+"), "+alpha+")")
getVar(var)
    unquote("var(--vs-"+var+")")

.not-margin
  margin 0px
  font-weight normal
  padding 10px 10px 0
.con-form
  width 100%
  .vs-input__progress
    margin-top 0px
    margin-bottom 5px
  .flex
    display flex
    align-items center
    justify-content space-between
    a
      color #fff
      font-size .8rem
      text-decoration none
      opacity .7
      &:hover
        opacity 1
  .vs-checkbox-label
    font-size .8rem
.footer-dialog
  display flex
  align-items center
  justify-content center
  flex-direction column
  width calc(100%)
  .new
    margin 0px
    margin-top 20px
    padding: 0px
    font-size .7rem
    a
      color getColor('primary') !important
      margin-left 6px
      text-decoration none
      &:hover
        text-decoration underline
  .vs-button
    margin 0px
</style>