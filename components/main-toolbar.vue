<template>
  <v-toolbar
    dense
    fixed
    app
    dark
    color="primary darken-2"
  >
    <v-toolbar-side-icon v-if="$store.state.auth.payload" @click.stop="drawer = !drawer" />
    <v-toolbar-title>{{ $t(title) }}</v-toolbar-title>
    <v-spacer />
    <v-menu left offset-y>
      <v-avatar slot="activator" size="40" color="primary">
        <span class="white--text title">
          {{ userInitials }}
        </span>
      </v-avatar>
      <v-list>
        <v-list-tile>
          {{ userName }}
        </v-list-tile>
        <v-divider />
        <v-subheader>{{ $t('Language') }}</v-subheader>
        <v-list-tile
          v-for="(locale, index) in $i18n.locales"
          :key="index"
          :to="switchLocalePath(locale.code)"
          nuxt
        >
          {{ locale.name }}
        </v-list-tile>
        <v-divider />
        <v-list-tile
          v-if="$store.state.auth.payload"
          @click="logout"
        >
          {{ $t('Logout') }}
        </v-list-tile>
        <v-list-tile
          v-else
          @click="login"
        >
          {{ $t('Login') }}
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-toolbar>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    drawer: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    title() {
      return this.$store.state.title
    },
    user() {
      return this.$store.state.auth.user
    },
    userName() {
      return this.user ? this.user.name : ''
    },
    userInitials() {
      return this.user ? this.user.name[0] : '?'
    },
    userId() {
      return this.user ? this.user.id : null
    }
  },

  methods: {
    login() {
      this.$cookies.set('redirect', this.$route.fullPath, {
        path: '/',
        maxAge: 60 * 60 * 24
      })
      this.$router.replace(this.localePath({ name: 'login' }))
    },
    async logout() {
      await this.$store.dispatch('auth/logout')
      this.$router.replace(this.localePath({ name: 'index' }))
    }
  }
}
</script>

<style>
</style>
