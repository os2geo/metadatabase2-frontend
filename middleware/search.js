import service from '~/plugins/feathers-service'
export default async ({ store, redirect, error, app, route }) => {
  service('forms')(store)
  service('organizations')(store)
  const form = await store.dispatch('forms/get', route.params.form)
  await store.dispatch('organizations/get', form.organizationId)
  store.commit('title', form.name)
}
