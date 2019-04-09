import feathersClient from '~/plugins/feathers-client'
export default function createService(namespace, options = {}) {
  const globalOptions = {
    enableEvents: true,
    service: namespace
  }
  options = Object.assign({}, globalOptions, options)
  const service = feathersClient.service(options.service)
  const module = {
    namespaced: true,
    state: {
      current: {},
      list: []
    },
    mutations: {
      setCurrent(state, item) {
        state.current = item
      },
      addItem(state, item) {
        state.list.push(item)
      },
      addItems(state, items) {
        state.list = [...state.list, ...items]
      },
      clear(state) {
        // state.current = {}
        state.list = []
      },
      updateItem(state, item) {
        if (state.current && state.current.id === item.id) {
          state.current = item
        }
        const index = state.list.findIndex(element => element.id === item.id)
        if (index !== -1) {
          state.list.slice(index, 1, item)
        }
      },
      removeItem(state, id) {
        if (state.current && state.current.id === id) {
          state.current = null
        }
        state.list = state.list.filter(element => element.id !== id)
      }
    },
    actions: {
      async find({ state, commit }, params) {
        try {
          const res = await service.find(params)
          commit('clear')
          commit('addItems', res)
          return res
        } catch (error) {
          return Promise.reject(error)
        }
      },
      async get({ commit }, id) {
        try {
          const res = await service.get(id)
          commit('setCurrent', res)
          commit('updateItem', res)
          return res
        } catch (error) {
          return Promise.reject(error)
        }
      },
      create({ commit }, data) {
        return service.create(data)
      },
      update({ commit }, args) {
        const id = args[0]
        const data = args[1]
        const params = args.length > 2 ? args[2] : {}
        return service.update(id, data, params)
      },
      patch({ commit }, args) {
        const id = args[0]
        const data = args[1]
        const params = args.length > 2 ? args[2] : {}
        return service.patch(id, data, params)
      },
      remove({ commit }, idOrArray) {
        let id = idOrArray
        let params = {}
        if (Array.isArray(idOrArray)) {
          id = idOrArray[0]
          params = idOrArray[1]
        }
        return service.remove(id, params)
      }
    },
    getters: {
      current: (state) => {
        return state.current
      },
      get: state => (id) => {
        return state.list.find((item) => {
          return item.id === id
        })
      },
      list: (state) => {
        return state.list
      }
    }
  }
  return (store) => {
    const preserveState = store.state.hasOwnProperty(namespace)
    if (process.server) {
      if (!preserveState) {
        store.registerModule(namespace, module)
      }
    } else if (!store.state.modules.hasOwnProperty(namespace)) {
      store.registerModule(namespace, module, {
        preserveState
      })
      store.commit('addModule', namespace)
      if (options.enableEvents) {
        // Listen to socket events when available.
        service.on('created', (item) => {
          store.commit(`${namespace}/addItem`, item)
        })
        service.on('updated', item =>
          store.commit(`${namespace}/updateItem`, item)
        )
        service.on('patched', item =>
          store.commit(`${namespace}/updateItem`, item)
        )
        service.on('removed', (item) => {
          store.commit(`${namespace}/removeItem`, item.id)
        })
      }
    }
  }
}
