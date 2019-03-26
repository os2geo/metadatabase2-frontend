<template>
  <v-app>
    <main-drawer v-model="drawer">
      <v-list>
        <v-list-tile
          :to="localePath({ name: 'groups-id', params: $route.params })"
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
        <v-list-tile :to="localePath({ name: 'groups-id-users', params: $route.params })" active-class="primary white--text" nuxt>
          <v-list-tile-title>{{ $t('Users') }}</v-list-tile-title>
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
  middleware: ['auth', 'groups'],
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
      return this.$store.state.groups.current.name
    }
  }
}
</script>
