import service from '~/plugins/feathers-service'
export default async ({ store, redirect, error, app, route }) => {
  service('databases')(store)
  service('organizations')(store)
  const database = await store.dispatch('databases/get', route.params.id)
  const organization = await store.dispatch('organizations/get', database.organizationId)
  store.commit('title', organization.name)
  if (store.state.auth.user.roleId === 1) {
    return
  }
  if (store.state.auth.user.organizationId === database.organizationId && store.state.auth.user.roleId === 2) {
    return
  }
  return redirect(app.localePath({ name: 'login' }))
}
