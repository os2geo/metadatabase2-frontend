export default function ({ app, store, route, redirect }) {
  if (!store.state.auth.payload) {
    app.$cookies.set('redirect', route.fullPath, {
      path: '/',
      maxAge: 60 * 60 * 24
    })
    return redirect(app.localePath({ name: 'login' }))
  }
}
