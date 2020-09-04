<template>
  <div class="error-layout">
    <div class="error-content">
      <h1 class="error-title">
        Ошибка 404
      </h1>
      <nuxt-link to="/" class="home">
        Вернуться на главную
      </nuxt-link>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
.error-layout
  display flex
  justify-content center
  align-items center
  width 100%

.error-content
  display flex
  flex-direction column
  align-items center
  padding-top 4rem

.error-title
  color rgb(145, 6, 6)
  margin-bottom 1rem

.home
  text-decoration none
  color white
  opacity .7
  &:hover
    opacity 1
</style>
