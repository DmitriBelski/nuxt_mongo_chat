<template>
  <div>
    <div v-if="name == 'time'" class="system">
      <p ref="date">{{ date | date('flow') }}</p>
    </div>
    <div v-else-if="name == 'admin'" class="system">
      <p ref="admin">{{ text }}</p>
    </div>
    <div v-else class="wrap">
      <div class="mes" :class="{owner}">
        <svg class="lefttail" width="8" height="17" >
          <path d="M8,17H0l.00036-1.34748C7.99994,11.78192,8,5.71657,8,0Z"/>
        </svg>
        <svg class="righttail" width="8" height="17" >
          <path d="M.00386,17h8L8.0035,15.65252C.00393,11.78192.00386,5.71657.00386,0Z"/>
        </svg>
        <p style="padding-bottom: 0.2rem"><strong style="opacity: 0.5;">{{name}}</strong></p>
        <p>{{text}}
          
          <span>{{date | date('hour_minute')}}</span>
          <span class="update" v-if="update">Изменено {{new Date(update) | date('hour_minute')}}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    name: String,
    text: String,
    owner: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date
    },
    index: Number,
    update: String
  },
  mounted() {
    if (this.name == "time") {
      this.$emit('shareWidth', {width: this.$refs.date.offsetWidth, index: this.index})
    } 
  }
}
</script>

<style lang="stylus" scoped>
  .system
    text-align: center
    margin-bottom 1rem
    p
      font-size 0.8rem
      padding 0.4rem 0.8rem
      background rgba(35, 46, 58, 0.3)
      border-radius 1rem
      display inline-block

  .wrap
    display flex
    flex-direction column

  .mes
    font-size 0.9rem
    line-height 1.3
    padding 0.6rem 1.8rem 0.6rem 1rem
    margin 0 1rem 1rem 1rem
    width 60%
    min-width 320px
    max-width 450px
    box-shadow 0 1px 0 0 rgba(50, 50, 50, 0.3)
    border-radius 6px 6px 6px 0px
    background rgb(30, 40, 52)
    position relative
    p
      margin-bottom 0
      span 
        float right
        margin-right -1rem
        margin-left 1.7 rem
        padding 0.3rem 0 0 0
        line-height 0.9rem
    .righttail
      display none
    .lefttail
      fill rgb(30, 40, 52)
      position absolute
      bottom 0
      left -8px  
      box-shadow 0 1px 0 0 rgba(50, 50, 50, 0.3)
  
  .owner
    background rgb(52, 90, 127)
    align-self flex-end
    border-radius 6px 6px 0px 6px
    .lefttail
      display none
    .righttail
      display block
      fill rgb(52, 90, 127)
      position absolute
      right -8px
      bottom 0
      box-shadow 0 1px 0 0 rgba(50, 50, 50, 0.3)

  .update
    font-size 0.7rem 
    font-style italic
    

</style>