import service from '~/plugins/feathers-service'
export default async ({ store, redirect, error, app, route }) => {
  service('forms')(store)
  service('organizations')(store)
  const form = await store.dispatch('forms/get', route.params.id)
  const organization = await store.dispatch('organizations/get', form.organizationId)
  store.commit('title', organization.name)
  if (store.state.auth.user.roleId === 1) {
    return
  }
  if (store.state.auth.user.organizationId === form.organizationId && store.state.auth.user.roleId === 2) {
    return
  }
  return redirect(app.localePath({ name: 'login' }))
}
