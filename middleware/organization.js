import service from '~/plugins/feathers-service'
export default async ({ store, redirect, error, app, route }) => {
  if (!(store.state.auth.user.roleId === 1 || store.state.auth.user.organizationId === route.params.id)) {
    return redirect(app.localePath({ name: 'login' }))
  }
  service('organizations')(store)
  const organization = await store.dispatch('organizations/get', route.params.id)
  console.log(organization)
  store.commit('title', organization.name)
}
