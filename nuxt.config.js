import VuetifyLoaderPlugin from 'vuetify-loader/lib/plugin'
import pkg from './package'
import vueI18n from './plugins/i18n'

export default {
  env: {
    FEATHERS: process.env.FEATHERS || 'http://localhost:3030',
    REST: process.env.REST || 'http://localhost:3030'
  },

  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
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
    '@fortawesome/fontawesome-free/css/all.css',
    '~/assets/style/app.styl'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/vuetify',
    '@/plugins/filters'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    [
      'nuxt-i18n',
      {
        seo: false,
        locales: [
          {
            code: 'en',
            iso: 'en-US',
            name: 'English'
          },
          {
            code: 'da',
            iso: 'da-DK',
            name: 'Dansk'
          }
        ],
        defaultLocale: 'da',
        vueI18n
      }
    ],
    'cookie-universal-nuxt',
    'nuxt-webfontloader'
  ],
  webfontloader: {
    google: {
      families: ['Roboto:300,400,500,700', 'Material+Icons']
    }
  },
  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
  ** Build configuration
  */
  build: {
    transpile: ['vuetify/lib'],
    plugins: [new VuetifyLoaderPlugin()],
    loaders: {
      stylus: {
        import: ['~assets/style/variables.styl']
      }
    },
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
