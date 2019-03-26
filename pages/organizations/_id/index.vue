<template>
  <v-content>
    <v-container pt-0 :pa-0="$breakpoint.is('xsOnly')" fill-height class="max">
      <v-layout column>
        <div>
          <v-layout row>
            <v-flex>
              <v-toolbar
                flat
                color="transparent"
              >
                <v-spacer />

                <v-tooltip top>
                  <v-btn
                    slot="activator"
                    icon
                    @click="dialogHelp=true"
                  >
                    <v-icon color="primary">
                      help_outline
                    </v-icon>
                  </v-btn>
                  <span>{{ $t('Help') }}</span>
                </v-tooltip>
              </v-toolbar>
            </v-flex>
          </v-layout>
        </div>
        <v-flex d-flex>
          <v-card :tile="$breakpoint.is('xsOnly')" class="scroll-y">
            <v-card-title
              primary-title
              class="title"
            >
              {{ $t('Organization') }}
            </v-card-title>
            <v-card-text>
              <v-text-field
                id="name"
                v-model="name"
                :label="$t('Name')"
                required
                name="name"
              />
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>
<script>
import service from '~/plugins/feathers-service'
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState('organizations', {
      organization(state) {
        return { ...state.current }
      }
    }),

    name: {
      get() {
        return this.organization.name
      },
      set(value) {
        this.$store.commit('title', value)
        this.$store.dispatch('organizations/patch', [this.$route.params.id, { name: value }])
      }
    }
  },

  created() {
    service('organizations')(this.$store)
  }
}
</script>
