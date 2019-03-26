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
              {{ $t('Login') }}
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="email"
                name="username"
                label="Email"
                type="email"
                required
              />
              <v-text-field
                v-model="password"
                :label="$t('Password')"
                name="password"
                type="password"
                required
              />
              <p>
                {{ `${$t('Contact')} ` }}<a :href="`mailto:${contact}?Subject=Signup`">
                  {{ contact }}
                </a>
              </p>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                flat
                color="primary"
                @click="sendResetPwd"
              >
                {{ `${$t('ForgotPassword')}?` }}
              </v-btn>
              <v-btn
                dark
                type="submit"
                color="primary"
                @click="submit"
              >
                {{ $t('Login') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-container>
      <v-snackbar
        v-model="snackbar"
        color="error"
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
import { mapActions } from 'vuex'
export default {
  i18n: {
    messages: {
      en: {
        Password: 'Password',
        'Login': 'Login',
        'Forgot password?': 'Forgot password?',
        contact: `Don't have an account? Contact`
      },
      da: {
        Password: 'Kodeord',
        'Login': 'Log ind',
        'Forgot password?': 'Glemt kodeord?',
        contact: 'Hvis du ikke har en konto så kontakt'
      }
    }
  },
  head() {
    return {
      title: 'Login'
    }
  },
  data() {
    return {
      snackbar: false,
      email: null,
      password: null,
      error: null,
      valid: false,
      message: null,
      title: 'Login',
      contact: 'rune@addin.dk'
    }
  },
  methods: {
    ...mapActions('auth', ['authenticate']),
    async submit() {
      const { email, password } = this
      try {
        await this.authenticate({
          strategy: 'local',
          email,
          password: password
        })
        const last = this.$cookies.get('redirect')
        if (last) {
          this.$router.replace(last)
        } else if (this.$store.state.auth.user.organizationId) {
          return this.$router.replace(this.localePath({
            name: 'organizations-id',
            params: { id: this.$store.state.auth.user.organizationId }
          }))
        } else if (this.$store.state.auth.user.roleId === 1) {
          return this.$router.replace(this.localePath({
            name: 'system-organizations'
          }))
        }
      } catch (e) {
        this.snackbar = true
        this.message = e.message
        throw e
      }
    },
    sendResetPwd() {
      const { email } = this
      this.$store
        .dispatch('authManagement/create', {
          action: 'sendResetPwd',
          value: { email }
        })
        .then((message) => {
          console.log(message)
        })
        .catch((err) => {
          console.log('error', err)
          if (err.type && err.type === 'FeathersError') {
            this.message = err.message
          } else {
            this.message = 'Der er sendt en email til dig!'
          }
          this.snackbar = true
        })
    }
  }
}
</script>
<style scoped lang="stylus">
</style>
