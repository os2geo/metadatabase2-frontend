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
            :items="users"
            select-all
            hide-actions
          >
            <template slot="items" slot-scope="props">
              <td>
                <v-checkbox v-model="props.selected" hide-details />
              </td>
              <td class="text-xs-left select" @click.stop="select(props.item)">
                {{ props.item.name }}
              </td>
              <td class="text-xs-left select" @click.stop="select(props.item)">
                {{ props.item.email }}
              </td>
              <td class="text-xs-left select" @click.stop="select(props.item)">
                {{ props.item.role.name }}
              </td>
              <td class="text-xs-left select" @click.stop="select(props.item)">
                <v-icon v-show="props.item.isVerified">
                  check
                </v-icon>
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
            {{ $t('Create') }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              ref="focus"
              v-model="name"
              :label="$t('Name')"
              :rules="requiredRules"
              required
            />
            <v-text-field
              v-model="email"
              :label="$t('Email')"
              :rules="requiredRules"
              required
            />
            <v-select
              v-model="role"
              :items="roles"
              :label="$t('Role')"
              :rules="requiredRules"
              required
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
              {{ $t('Create') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-dialog
      v-model="dialogEdit"
      persistent
      max-width="500"
    >
      <v-form ref="formEdit" @submit.prevent>
        <v-card>
          <v-card-title>
            {{ $t('Edit') }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              ref="focus"
              v-model="current.name"
              :label="$t('Name')"
              :rules="requiredRules"
              required
            />
            <v-text-field
              v-model="current.email"
              :label="$t('Email')"
              :rules="requiredRules"
              required
              readonly
            />
            <v-select
              v-model="current.roleId"
              :items="roles"
              :label="$t('Role')"
              :rules="requiredRules"
              required
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" flat @click="dialogEdit=false">
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              dark
              type="submit"
              color="primary"
              @click="update()"
            >
              {{ $t('Update') }}
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
      name: null,
      email: null,
      role: null,
      selected: [],
      dialogRemove: false,
      dialogCreate: false,
      dialogEdit: false,
      valid: null,
      search: null,
      current: {}
    }
  },

  computed: {
    headers() {
      return [
        { text: this.$t('Name'), align: 'left', sortable: true, value: 'name' },
        { text: this.$t('Email'), align: 'left', sortable: true, value: 'email' },
        { text: this.$t('Role'), align: 'left', sortable: true, value: 'role.name' },
        { text: this.$t('Verified'), align: 'left', sortable: true, value: 'isVerified' },
        { text: this.$t('UpdatedAt'), sortable: true, value: 'updatedAt' }
      ]
    },
    ...mapState('users', {
      users(state) {
        return state.list.filter((item) => {
          return item.organizationId === this.$route.params.id
        })
      }
    }),
    ...mapState('roles', {
      roles(state) {
        return state.list.filter((item) => {
          return this.$store.state.auth.user.roleId === 1 ? true : item.id !== 1
        }).map((item) => {
          return { text: item.name, value: item.id }
        })
      }
    })
  },
  async fetch({ store, params }) {
    service('users')(store)
    service('roles')(store)
    await store.dispatch('users/find', {
      query: {
        organizationId: params.id,
        $limit: -1
      }
    })
    await store.dispatch('roles/find', {
      query: {
        $limit: -1
      }
    })
  },
  created() {
    service('users')(this.$store)
    service('roles')(this.$store)
  },

  methods: {
    showCreate() {
      this.dialogCreate = true
      this.$nextTick(() =>
        this.$refs.focus.$el.getElementsByTagName('input')[0].focus()
      )
    },
    async update() {
      if (this.$refs.formEdit.validate()) {
        await this.$store.dispatch('users/patch', [this.current.id, { name: this.current.name, roleId: this.current.roleId }])
        this.dialogEdit = false
        this.$refs.formEdit.reset()
      }
    },
    async create() {
      if (this.$refs.form.validate()) {
        await this.$store.dispatch('users/create', {
          name: this.name,
          organizationId: this.$route.params.id,
          roleId: this.role,
          email: this.email
        })
        this.dialogCreate = false
        this.$refs.form.reset()
      }
    },
    async remove() {
      for (const item of this.selected) {
        await this.$store.dispatch('users/remove', item.id)
      }
      this.selected = []
      this.dialogRemove = false
    },
    select(item) {
      this.current = { ...item }
      this.dialogEdit = true
    }
  }
}
</script>
<style scoped lang="stylus">
.select
  cursor pointer
</style>
