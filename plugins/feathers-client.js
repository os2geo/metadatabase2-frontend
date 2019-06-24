import feathers from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import rest from '@feathersjs/rest-client'
import auth from '@feathersjs/authentication-client'
import io from 'socket.io-client'
import { CookieStorage } from 'cookie-storage'
import axios from 'axios'
const restClient = rest(process.env.BACKEND)
const socket = io(process.env.BACKEND, { transports: ['websocket'] })
const feathersClient = feathers()
if (process.client) {
  feathersClient.configure(socketio(socket))
} else {
  feathersClient.configure(restClient.axios(axios))
}
feathersClient.configure(auth({
  storage: new CookieStorage({
    path: '/'
  })
}))
if (process.client) {
  socket.on('connect', () => {
    feathersClient.authenticate()
  })
}
export default feathersClient
