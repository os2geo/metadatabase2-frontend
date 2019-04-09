<template>
  <v-content>
    <v-container pt-0 :pa-0="$breakpoint.is('xsOnly')" fill-height max-height>
      <v-layout column>
        <div>
          <v-layout row>
            <v-flex>
              <v-toolbar flat color="transparent">
                <v-text-field
                  v-model="search "
                  :placeholder="$t('Search')"
                  prepend-icon="search"
                  clearable
                />
                <v-spacer />
                <v-tooltip v-if="$breakpoint.is('smAndUp')" top>
                  <v-btn slot="activator" icon @click="showCreate()">
                    <v-icon color="primary">
                      add
                    </v-icon>
                  </v-btn>
                  <span>{{ $t('Add') }}</span>
                </v-tooltip>
                <v-tooltip v-if="$breakpoint.is('smAndUp')" top>
                  <v-btn slot="activator" :disabled="selected.length===0" icon @click="dialogRemove=true">
                    <v-icon color="primary">
                      delete
                    </v-icon>
                  </v-btn>
                  <span>{{ $t('DeleteSelected') }}</span>
                </v-tooltip>
                <v-tooltip v-if="$breakpoint.is('smAndUp')" top>
                  <v-btn slot="activator" icon @click="dialogHelp=true">
                    <v-icon color="primary">
                      help_outline
                    </v-icon>
                  </v-btn>
                  <span>{{ $t('Help') }}</span>
                </v-tooltip>

                <v-tooltip v-if="$breakpoint.is('xsOnly')" top>
                  <v-menu slot="activator" left offset-y>
                    <v-btn slot="activator" icon>
                      <v-icon color="primary">
                        more_vert
                      </v-icon>
                    </v-btn>
                    <v-list>
                      <v-list-tile @click="showCreate()">
                        <v-list-tile-content>
                          {{ $t('Add') }}
                        </v-list-tile-content>
                        <v-list-tile-action>
                          <v-icon>add</v-icon>
                        </v-list-tile-action>
                      </v-list-tile>
                      <v-list-tile
                        :disabled="selected.length===0"
                        @click="dialogRemove = true"
                      >
                        <v-list-tile-content>
                          {{ $t('DeleteSelected') }}
                        </v-list-tile-content>
                        <v-list-tile-action>
                          <v-icon>delete</v-icon>
                        </v-list-tile-action>
                      </v-list-tile>
                      <v-list-tile @click="showHelp()">
                        <v-list-tile-content>
                          {{ $t('Help') }}
                        </v-list-tile-content>
                        <v-list-tile-action>
                          <v-icon>help_outline</v-icon>
                        </v-list-tile-action>
                      </v-list-tile>
                    </v-list>
                  </v-menu>
                  <span>{{ $t('Actions') }}</span>
                </v-tooltip>
              </v-toolbar>
            </v-flex>
          </v-layout>
        </div>

        <v-flex
          :class="$breakpoint.is('smAndUp') && 'elevation-1'"
          d-flex
          scroll-x
          class="fixed-header white"
        >
          <v-data-table
            v-model="selected"
            :search="search"
            :headers="headers"
            :items="usersGroups"
            select-all
            hide-actions
          >
            <template slot="items" slot-scope="props">
              <td>
                <v-checkbox v-model="props.selected" hide-details />
              </td>
              <td class="text-xs-left select" @click.stop="select(props.item)">
                {{ props.item.user.name }}
              </td>
              <td class="text-xs-left select" @click.stop="select(props.item)">
                {{ props.item.user.email }}
              </td>
              <td class="text-xs-left select" @click.stop="select(props.item)">
                {{ props.item.updatedAt | date }}
              </td>
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-container>

    <dialog-remove
      v-model="dialogRemove"
      @remove="remove()"
    />

    <v-dialog
      v-model="dialogCreate"
      persistent
      max-width="500"
    >
      <v-form ref="form" v-model="valid" @submit.prevent>
        <v-card>
          <v-card-title>
            {{ $t('Add') }}
          </v-card-title>
          <v-card-text>
            <v-autocomplete
              v-model="autocompleteUsers"
              :items="users"
              :label="$t('Users')"
              :rules="requiredRules"
              required
              multiple
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" flat @click="dialogCreate=false">
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              dark
              type="submit"
              color="primary"
              @click="create()"
            >
              {{ $t('Add') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-content>
</template>

<script>
import service from '~/plugins/feathers-service.js'
import dialogRemove from '~/components/dialog-remove.vue'
import { mapState } from 'vuex'
export default {
  components: { dialogRemove },

  data() {
    return {
      requiredRules: [v => !!v || this.$t('Required')],
      autocompleteUsers: [],
      selected: [],
      dialogRemove: false,
      dialogCreate: false,
      valid: null,
      search: null
    }
  },

  computed: {
    headers() {
      return [
        { text: this.$t('Name'), align: 'left', sortable: true, value: 'user.name' },
        { text: this.$t('Email'), align: 'left', sortable: true, value: 'user.email' },
        { text: this.$t('UpdatedAt'), sortable: true, value: 'updatedAt' }
      ]
    },
    ...mapState('users-groups', {
      usersGroups(state) {
        return state.list.filter((item) => {
          return item.groupId === this.$route.params.id
        })
      }
    }),
    usersGroupsIds() {
      return this.usersGroups.map((item) => {
        return item.userId
      })
    },
    ...mapState('users', {
      users(state) {
        return state.list.filter((item) => {
          return this.usersGroupsIds.indexOf(item.id) === -1
        }).map((item) => {
          return { text: `${item.name} (${item.email})`, value: item.id }
        })
      }
    })
  },
  async fetch({ store, params }) {
    service('users')(store)
    service('users-groups')(store)
    await store.dispatch('users/find', {
      query: {
        organizationId: store.state.groups.current.organizationId,
        $limit: -1
      }
    })
    await store.dispatch('users-groups/find', {
      query: {
        groupId: params.id,
        $limit: -1
      }
    })
    store.commit('title', 'Users-Groups')
  },
  created() {
    service('users')(this.$store)
    service('users-groups')(this.$store)
  },

  methods: {
    showCreate() {
      this.dialogCreate = true
    },
    async create() {
      if (this.$refs.form.validate()) {
        if (this.autocompleteUsers.length > 0) {
          await this.$store.dispatch('users-groups/create', this.autocompleteUsers.map((item) => {
            return { groupId: this.$route.params.id, userId: item }
          }))
        }
        this.dialogCreate = false
        this.$refs.form.reset()
      }
    },
    async remove() {
      await this.$store.dispatch('users-groups/remove', [
        null,
        {
          query: {
            id: this.selected.map(item => item.id)
          }
        }
      ])
      this.selected = []
      this.dialogRemove = false
    },
    select(item) {
      // this.$router.push(this.localePath({ name: 'users-id', params: { id: item.id } }))
    }
  }
}
</script>
<style scoped lang="stylus">
.select
  cursor pointer
</style>
