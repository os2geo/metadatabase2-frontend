import feathersClient from '~/plugins/feathers-client'
const serviceUsers = feathersClient.service('users')

export const state = () => ({
  payload: null,
  accessToken: null,
  authenticateError: null,
  user: null
})
export const getters = {
  get(state) {
    return state.user
  }
}
export const mutations = {
  setPayload(state, payload) {
    state.payload = payload
  },
  setAccessToken(state, accessToken) {
    state.accessToken = accessToken
  },
  setAuthenticateError(state, error) {
    state.authenticateError = error
  },
  setUser(state, user) {
    state.user = user
  },
  logout(state) {
    state.payload = null
    state.accessToken = null
    if (state.user) {
      state.user = null
      state.customerUsers = null
    }
    if (process.client) {
      document.cookie =
        'feathers-jwt=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;'
    }
  }
}
export const actions = {
  async authenticate(store, data) {
    const { commit, dispatch } = store
    try {
      const response = await feathersClient.authenticate(data)
      if (response.accessToken) {
        commit('setAccessToken', response.accessToken)

        // Decode the token and set the payload, but return the response
        const payload = await feathersClient.passport.verifyJWT(
          response.accessToken
        )
        commit('setPayload', payload)
        if (payload.hasOwnProperty('userId')) {
          await dispatch('populateUser', payload.userId)
        }
      }
      return response
    } catch (error) {
      commit('setAuthenticateError', error)
      return Promise.reject(error)
    }
  },
  async populateUser({ commit }, userId) {
    const user = await serviceUsers.get(userId)
    commit('setUser', user)
    return user
  },
  logout({ commit }) {
    return feathersClient
      .logout()
      .then((response) => {
        commit('logout')
        return response
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}
