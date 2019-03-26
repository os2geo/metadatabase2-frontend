import service from '~/plugins/feathers-service'
export default async ({ store, redirect, error, app, route }) => {
  service('groups')(store)
  service('organizations')(store)
  const group = await store.dispatch('groups/get', route.params.id)
  const organization = await store.dispatch('organizations/get', group.organizationId)
  store.commit('title', organization.name)
  if (store.state.auth.user.roleId === 1) {
    return
  }
  if (store.state.auth.user.organizationId === group.organizationId && store.state.auth.user.roleId === 2) {
    return
  }
  return redirect(app.localePath({ name: 'login' }))
}
