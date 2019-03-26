export default function ({ store, redirect, error, app, route }) {
  if (store.state.auth.user) {
    if (store.state.auth.user.roleId !== 1) {
      return redirect(app.localePath({ name: 'index' }))
    }
  } else {
    return redirect(app.localePath({ name: 'login' }))
  }
}
