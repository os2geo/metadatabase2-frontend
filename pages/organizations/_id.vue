<template>
  <v-app>
    <main-drawer v-model="drawer">
      <v-list>
        <v-list-tile
          :to="localePath({ name: 'organizations-id', params: $route.params })"
          active-class="primary white--text"
          nuxt
          exact
          avatar
        >
          <v-list-tile-avatar>
            <v-avatar color="accent" size="40">
              <span class="white--text headline">
                {{ header[0] }}
              </span>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-content>
            {{ header }}
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          v-if="isAdmin"
          :to="localePath({ name: 'organizations-id-users', params: $route.params })"
          active-class="primary white--text"
          nuxt
        >
          <v-list-tile-title>{{ $t('Users') }}</v-list-tile-title>
        </v-list-tile>
        <v-list-tile v-if="isAdmin" :to="localePath({ name: 'organizations-id-databases', params: $route.params })" active-class="primary white--text" nuxt>
          <v-list-tile-title>{{ $t('Databases') }}</v-list-tile-title>
        </v-list-tile>
        <v-list-tile :to="localePath({ name: 'organizations-id-forms', params: $route.params })" active-class="primary white--text" nuxt>
          <v-list-tile-title>{{ $t('Forms') }}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </main-drawer>
    <main-toolbar v-model="drawer" />
    <nuxt-child />
  </v-app>
</template>

<script>
import mainDrawer from '~/components/main-drawer'
import mainToolbar from '~/components/main-toolbar'

export default {
  components: { mainDrawer, mainToolbar },
  middleware: ['auth', 'organization'],
  head() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      drawer: null
    }
  },
  computed: {
    title() {
      return this.$t(this.$store.state.title)
    },
    header() {
      return this.$store.state.organizations.current.name
    },
    isAdmin() {
      return this.$store.state.auth.user.roleId < 3
    }
  }
}
</script>
