import Vue from 'vue'
import Vuesax from 'vuesax'
import DateFilter from '@/common/date.filter'

Vue.use(Vuesax)
Vue.filter('date', DateFilter)
