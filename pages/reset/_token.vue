<template>
  <v-app>
    <v-content>
      <v-container>
        <v-form
          ref="form"
          v-model="valid"
          @submit.prevent
        >
          <v-card>
            <v-card-title
              class="title"
              primary-title
            >
              {{ title }}
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="password"
                :label="$t('NewPassword')"
                type="password"
                required
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                type="submit"
                color="blue-grey"
                dark
                @click="submit"
              >
                {{ title }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-container>
      <v-snackbar
        v-model="snackbar"
        color="warning"
      >
        {{ message }}
        <v-btn
          dark
          flat
          @click.native="snackbar = false"
        >
          {{ $t('Close') }}
        </v-btn>
      </v-snackbar>
    </v-content>
  </v-app>
</template>
<script>
import client from '~/plugins/feathers-client'
export default {
  head() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      snackbar: false,
      password: null,
      message: null,
      valid: false,
      title: this.$t('ResetPassword')
    }
  },
  computed: {
  },
  watch: {
  },
  fetch({ store }) {
  },
  mounted() {
  },
  methods: {
    submit() {
      const { password } = this
      client.service('authManagement').create({
        action: 'resetPwdLong',
        value: { token: this.$route.params.token, password }
      }).then((message) => {
        this.$router.replace('/')
      }).catch((err) => {
        if (err.type && err.type === 'FeathersError') {
          this.message = err.message
          this.snackbar = true
        } else {
          this.$router.replace('/')
        }
      })
    }
  }
}
</script>
<style scoped lang="stylus">
</style>
