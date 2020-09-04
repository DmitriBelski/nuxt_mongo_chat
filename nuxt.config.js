
module.exports = {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  cache: true,
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/boxicons@2.0.5/css/boxicons.min.css'}
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    'vuesax/dist/vuesax.css',
    '@/assets/style.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    "@/plugins/api-context.client.js",
    "@/plugins/api-context.server.js",
    '@/plugins/global',
    // {src: '@/plugins/global', ssr: false},
    // '@/plugins/axios',
    {src: '@/plugins/axios', ssr: false},
    {src: '@/plugins/socket', ssr: false} // ssr: false значит, что этот плагин мы подключаем только на фронте, т.к. на бэке нам сокеты точно не нужны, а nuxt начинает рендериться на бэке
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
  ],
  serverMiddleware: [
    // { path: "/api", handler: require("body-parser").json() },
    {
      path: "/api",
      handler: (req, res, next) => {
        const url = require("url");
        req.query = url.parse(req.url, true).query;
        req.params = { ...req.query, ...req.body };
        next();
      }
    },
    { path: "/api", handler: "@/server/middleware/api-server.js" }
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000'
  },
  // настройка @nuxtjs/pwa
  workbox: {},
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
  cache: true,
  hardSource: true,
  extend (config, ctx) {
    }
  }
}
