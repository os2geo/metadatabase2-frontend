// import feathersVuexClient from '~/plugins/feathers-vuex-client'
import feathersClient from '~/plugins/feathers-client'
const cookieparser = process.server ? require('cookieparser') : undefined
export const state = () => ({
  title: null,
  sprites: [],
  sprite: '',
  modules: {},
  maximize: false
})
export const getters = {
  title(state) {
    return state.title
  },
  hasModule: state => (id) => {
    return state.modules.hasOwnProperty(id)
  }
}

export const mutations = {
  title(state, value) {
    state.title = value
  },
  addModule(state, data) {
    state.modules[data] = true
  },
  maximize(state, data) {
    state.maximize = data
  }
}

export const actions = {
  async nuxtServerInit({ commit, dispatch }, { req }) {
    commit('auth/logout')
    if (req.headers.cookie) {
      const parsed = cookieparser.parse(req.headers.cookie)
      if (parsed.hasOwnProperty('feathers-jwt')) {
        commit('auth/setAccessToken', parsed['feathers-jwt'])
        feathersClient.set('accessToken', parsed['feathers-jwt'])
        try {
          const payload = await feathersClient.passport.verifyJWT(
            parsed['feathers-jwt']
          )
          commit('auth/setPayload', payload)
          if (payload.hasOwnProperty('userId')) {
            await dispatch('auth/populateUser', payload.userId)
          }
        } catch (err) {
          commit('auth/setAuthenticateError', err)
        }
      }
    }
  }
}
