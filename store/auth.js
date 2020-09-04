import Cookie from 'cookie' // для парсинга куки
import Cookies from 'js-cookie' // чтобы записывать и удалять различные куки
import jwtDecode from 'jwt-decode'// для декодирования токена

export const state = () => ({
  token: null
})

export const mutations = {
  setToken (state, token) {
    state.token = token
  },
  clearToken (state) {
    state.token = null
  }
}

export const actions = {
  async createUser ({ commit }, formData) {
    try {
      // console.log('Create User', formData) // пока нет бэкэнда, можно посмотреть
      await this.$axios.$post('api/auth/create', formData)
    } catch (e) {
      commit('setError', e, { root: true }) // здесь ошибка будет не строкой а объектом от axios, поэтому эту ошибку нужно будет обработать и правильно вызвать в empty.vue
      throw e
    }
  },
  async login ({ commit, dispatch }, formData) {
    try {
      // пока нет Бэкэнда
      // const token = await new Promise((resolve, reject) => {
      //   setTimeout(() => resolve('mock-token'), 2000) // eslint-disable-line no-use-before-define
      // })
      const {token} = await this.$axios.$post('api/auth/login', formData)
      // console.log('token', token)
      dispatch('setToken', token)
      commit('user/setUser', {login: jwtDecode(token).login, id: jwtDecode(token).userId}, { root: true })
    } catch (e) {
      console.log(e)
      commit('setError', e, { root: true })
      throw e
    }
  },

  // запускается при каждом обновлении страницы с помощью store/index/nuxtServerInit
  autologin ({ dispatch, commit }) {
    const cookieStr = process.browser // где мы? на клиенте?
      ? document.cookie // это если на клиенте
      : this.app.context.req.headers.cookie // если на сервере
    const cookies = Cookie.parse(cookieStr || '') || {} // что парсим? cookieStr, а если он undefined, то пустую строку. Что возвращаем? если ничего, то пустой объект
    const token = cookies['jwt-token']
    if (isJwtValid(token)) {
      dispatch('setToken', token)
      commit('user/setUser', {login: jwtDecode(token).login, id: jwtDecode(token).userId}, { root: true })
    } else {
      dispatch('logout')
    }
  },
  setToken ({ commit }, token) {
    this.$axios.setToken(token, 'Bearer') // регистрируем токен, читаем в https://axios.nuxtjs.org/helpers - Adds header: `Authorization: Bearer token` to all requests
    commit('setToken', token)
    Cookies.set('jwt-token', token)
  },
  logout ({ commit }) {
    this.$axios.setToken(false) // Removes default Authorization header from `common` scope (all requests) - тоесть удаляем из Хедера
    commit('clearToken')
    Cookies.remove('jwt-token')
  }
}

export const getters = {
  isAuthenticated: state => Boolean(state.token),
  token: state => state.token
}

function isJwtValid (token) {
  if (!token) {
    return false
  }
  const jwtData = jwtDecode(token) || {}
  // что мы видим в jwtData?
  // console.log(jwtData)
  // { login: 'admin',
  // userId: '5e5e64eecd3f900f30104377',
  // iat: 1583339623,
  // exp: 1583343223 } // время экспирации
  const expires = jwtData.exp || 0
  return (new Date().getTime() / 1000) < expires
}
