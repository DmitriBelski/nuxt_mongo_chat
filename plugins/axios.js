// создаем плагин для обработки 401 ошибки
// 401 возникнет когда попытаются зайти на защищенный роутер не залогинившись
// этот плагин вызывается и на фронте и на бэке
export default function ({ $axios, redirect, store }) { // $axios забирается из объекта контекста - можно почитать на axios.nuxtjs.org / extending axios
  // при ssr с токеном есть проблема, что когда страницы вновь отрисуются в auth.js / this.$axios.setToken(token, 'Bearer') - this еще не будет и токен не будет зарегистрирован
  // через аксиос перехватываем запросы, отправленные на сервер
  // этот код также будет выполнен и на сервере
  $axios.interceptors.request.use((request) => {
    if (store.getters['auth/isAuthenticated'] && !request.headers.common.Authorization) { // ['Authorization'] тоже можно, но EsLint не пускает
      const token = store.getters['auth/token']
      request.headers.common.Authorization = `Bearer ${token}`// в request передаем токен
    }
    // console.log('interceptor', request)// посмотрим перехватывается ли запрос и что собой представляет request
    // console.log(request.method, ' . ', request.url)
    // console.log("header-Authorization", request.headers.common.Authorization)
    return request // чтобы не было ошибки передаем запрос дальше, чтобы он дальше выполнялся
  })

  $axios.onError((error) => {
    if (error.response) {
      if (error.response.status === 401) {
        redirect('/login?message=session') // проблема с авторизацией, например токен протух - редирект на логин, message прочитаем в pages/admin/post/login.vue
        store.dispatch('auth/logout') // если есть 401 ошибка, значит токен не валидный, значит нужно его удалить
      }
      if (error.response.status === 500) { // сервер что-то в себе сломал
        window.console.error('server 500 error') // мы особенно ничего сделать не можем, просто выводим ошибку
      }
    }
  })
}
