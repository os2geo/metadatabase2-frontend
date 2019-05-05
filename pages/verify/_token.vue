<template>
  <v-app>
    <v-content>
      <v-container>
        <v-card>
          <v-card-title
            class="title"
            primary-title
          >
            {{ $t('ResetPassword') }}
          </v-card-title>
          <v-card-text v-if="verified">
            <h6 class="title">
              {{ $t('Hi') }}, {{ email }}
            </h6>
            <p>{{ $t('m[0]') }}</p>
            <p>{{ $t('m[1]') }}</p>
            <v-btn
              color="blue-grey"
              dark
              large
              @click="sendResetPwd"
            >
              {{ $t('ResetPassword') }}
            </v-btn>
          </v-card-text>
          <v-card-text v-if="!verified">
            <p>{{ $t('m[2]') }}</p>
          </v-card-text>
          <v-card-text>
            {{ message }}
          </v-card-text>
        </v-card>
      </v-container>
    </v-content>
  </v-app>
</template>
<script>
import client from '~/plugins/feathers-client'
const service = client.service('authManagement')
export default {
  i18n: {
    messages: {
      en: {
        m: ['Thank you for verifying your email.', 'Please reset your password.', 'Invalid verification token.']
      },
      da: {
        m: ['Tak fordi du verificerede din email', 'Nulstil venligst dit password', 'Ugyldig verifikationsnøgle.']
      }
    }
  },
  head() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      message: null,
      title: this.$t('Verify Email'),
      verified: false,
      email: null
    }
  },
  computed: {
  },
  watch: {
  },
  fetch({ store }) {
  },
  mounted() {
    service.create({
      action: 'verifySignupLong',
      value: this.$route.params.token
    }).then((res) => {
      this.verified = true
      this.email = res.email
    }).catch((err) => {
      console.log('error', err)
      this.message = err
    })
  },
  methods: {
    sendResetPwd() {
      const { email } = this
      service.create({
        action: 'sendResetPwd',
        value: { email }
      }).then((message) => {
        this.message = 'An email has been send to you with a reset link!'
      }).catch((err) => {
        console.log('error', err)
        if (err.type && err.type === 'FeathersError') {
          this.message = err.message
        } else {
          this.message = 'An email has been send to you with a reset link!'
        }
      })
    }
  }
}
</script>
<style scoped lang="stylus">
</style>
