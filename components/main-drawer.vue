<template>
  <v-navigation-drawer
    v-model="drawer"
    dark
    fixed
    app
  >
    <v-container fluid fill-height pa-0>
      <v-layout column>
        <v-toolbar
          dark
          dense
        >
          <v-toolbar-title>
            <nuxt-link :to="localePath({ name: 'index' })">
              METADATABASE
            </nuxt-link>
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            v-show="$vuetify.breakpoint.xsOnly"
            dark
            flat
            icon
            @click="drawer = false"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-flex
          d-flex
          scroll-y
        >
          <slot />
        </v-flex>
      </v-layout>
    </v-container>
  </v-navigation-drawer>
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
    }
  }
}
</script>

<style scoped lang="stylus">
.logo
  height inherit
a
  text-decoration: none
  color: white
</style>
