<template>
  <div class="center">
    <vs-dialog not-close prevent-close success v-model="active">
      <template #header>
        <h4 class="not-margin">
          Welcome to <b>Vuesax</b>
        </h4>
      </template>

      <div class="con-form">
        <vs-input v-model="login" placeholder="Login" type="text" id="name" name="name" autocomplete="name">
          <template #icon>
            <i class='bx bx-user'></i>
          </template>
          <template v-if="!loginValid" #message-danger>
            please input login more than 2 character
          </template>
        </vs-input>
        <vs-input v-model="email" placeholder="Email" type="email" id="email" name="email" autocomplete="home email">
          <template #icon>
            @
          </template>
          <template v-if="!emailValid" #message-danger>
            please input correct email
          </template>
        </vs-input>

        <vs-input
        type="password"
        v-model="password"
        placeholder="Password"
        :progress="getProgress"
        :visiblePassword="hasVisiblePassword"
        icon-after
        @click-icon="hasVisiblePassword = !hasVisiblePassword"
        @keyup.enter="onSubmit()">
          <template #icon>
            <i v-if="!hasVisiblePassword" class='bx bx-show-alt'></i>
            <i v-else class='bx bx-hide'></i>
          </template>
          <template v-if="getProgress >= 100" #message-success>
            Secure password
          </template>
          <template v-if="!passwordValid && getProgress == 0" #message-danger>
            please input password
          </template>
        </vs-input>

        <div class="flex">
          <vs-checkbox v-model="remember">Remember me</vs-checkbox>
          <a href="/">Sign In</a>
        </div>
      </div>

      <template #footer>
        <div class="footer-dialog">
          <vs-button 
          block 
          :loading="loading"
          @click="onSubmit()">
            Register
          </vs-button>
        </div>
      </template>
    </vs-dialog>
  </div> 
</template>

<script>
export default {
  name: 'register',
  layout: 'empty',
  head: {
    title: 'Регистрация'
  },
  data:() => ({
    loginValid: true,
    emailValid: true,
    passwordValid: true,
    loading: false,
    active: true,
    email: '',
    login: '',
    password: '',
    remember: false,
    hasVisiblePassword: false
  }),
  mounted () {
  },
  methods: {
    async onSubmit () {
      // more than 2 digits
      this.loginValid = (this.login.length >= 3)
      // correct email
      this.emailValid = (/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(this.email))
      // more than 1 digits
      this.passwordValid = (this.password.length >= 2)

      if (this.loginValid && this.emailValid && this.passwordValid && this.getProgress >= 5) {
        this.loading = true
        try {
          const formData = {
            email: this.email,
            login: this.login,
            password: this.password
          }
          await this.$store.dispatch('auth/createUser', formData)
          this.$router.push('/login?message=registered')
        } catch (e) {
          this.loading = false
        }
      }
    }
  },
  computed: {
    getProgress() {
      let progress = 0
      // at least one number
      if (/\d/.test(this.password)) {
        progress += 20
      }
      // at least one capital letter
      if (/(.*[A-Z].*)/.test(this.password)) {
        progress += 20
      }
      // at menons a lowercase
      if (/(.*[a-z].*)/.test(this.password)) {
        progress += 20
      }
      // more than 5 digits
      if (this.password.length >= 6) {
        progress += 20
      }
      // at least one special character
      if (/[^A-Za-z0-9]/.test(this.password)) {
        progress += 20
      }
      return progress
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
  
.vs-input__progress
  margin 7px 0 5px 0
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
.flex
  display flex
  align-items center
  justify-content space-between
  a
    color #fff
    font-size .8rem
    text-decoration none
    opacity .7
    padding-right 10px
    &:hover
      opacity 1
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
.vs-dialog__content 
  padding 3px 16px
  .con-form
    width 100%
    .vs-checkbox-label
      font-size .8rem
  .vs-checkbox-label
    font-size .8rem    
  .footer-dialog
    display flex
    align-items center
    justify-content center
    flex-direction column
    width calc(100%)
    .vs-button
      margin 15px
</style>