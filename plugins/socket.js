import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
import SocketIO from "socket.io-client"

// анонимную функцию мы используем, чтобы получить объект store из контекста, который собирает nuxt из кусочков стора, объявленных в store/index.js
export default function({store}) {
  // const socket = SocketIO.connect('http://localhost:3000', {
  //   extraHeaders: { Authorization: `Bearer ${store.getters['auth/token']}` },
  //   query: `token=${store.getters['auth/token']}`
  // })

  const socket = SocketIO.connect('http://localhost:3000')

  socket.on('connect', () => {
    console.log('client-connect', new Date())
    // console.log('token', store.getters['auth/token'])
    socket
      .emit('authenticate', { token: store.getters['auth/token'] }) //send the jwt
  });

  socket.on('disconnect', () => {
    console.log('client-disconnect', new Date())
  })

  Vue.use(new VueSocketIO({
    debug: false,
    // connection: 'http://localhost:3000',
    connection: socket,
    vuex: {
      store, // сюда очень важно было передать store
      actionPrefix: 'SOCKET_', // этот префикс мы будем использовать при объявлении action и mutation
      mutationPrefix: 'SOCKET_'
    }
  }))
}

// new Vue({
//   router,
//   store,
//   render: h => h(App)
// }).$mount('#app')

