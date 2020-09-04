<template>
  <div class="container" vs-theme="dark">
    <nuxt/>
  </div>
</template>

<script>
export default {
  computed: {
    error () {
      return this.$store.getters.error
    }
  },
  watch: {
    error (value) {
      // $axios возвращает error.response.data, message - из auth.controller.js / res.status(404).json({message: 'Пользователь не найден'})
      this.$vs.notification({
        color: 'danger',
        position: 'top-center',
        title: `${value.response.data.message}`,
        text: 'Вы все еще не авторизованы'
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.empty-layout 
  display flex
  justify-content center
  width 100%
  padding-top 4rem

.container
  height: 100vh
  background-color var(--vs-theme-bg2) !important
</style>

