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
                  :placeholder="$t('search')"
                  prepend-icon="search"
                  clearable
                />
                <v-spacer />
                <v-tooltip v-if="$breakpoint.is('smAndUp')" top>
                  <v-btn slot="activator" icon @click="dialogImport=true">
                    <v-icon color="primary">
                      fas fa-file-import
                    </v-icon>
                  </v-btn>
                  <span>{{ $t('Import') }}</span>
                </v-tooltip>
                <v-tooltip v-if="$breakpoint.is('smAndUp')" top>
                  <v-btn slot="activator" icon @click="showExport()">
                    <v-icon color="primary">
                      fas fa-file-export
                    </v-icon>
                  </v-btn>
                  <span>{{ $t('Export') }}</span>
                </v-tooltip>
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
                  <span>{{ $t('Delete') }}</span>
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
                      <v-list-tile @click="dialogImport=true">
                        <v-list-tile-action>
                          <v-icon>fas fa-file-import</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                          {{ $t('Import') }}
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile @click="showExport()">
                        <v-list-tile-action>
                          <v-icon>fas fa-file-export</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                          {{ $t('Export') }}
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile @click="showCreate()">
                        <v-list-tile-action>
                          <v-icon>add</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                          {{ $t('Add') }}
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile
                        :disabled="selected.length===0"
                        @click="dialogRemove = true"
                      >
                        <v-list-tile-action>
                          <v-icon>delete</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                          {{ $t('Delete') }}
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile @click="showHelp()">
                        <v-list-tile-action>
                          <v-icon>help_outline</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                          {{ $t('Help') }}
                        </v-list-tile-content>
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
            :items="data"
            select-all
            hide-actions
          >
            <template slot="items" slot-scope="props">
              <td>
                <v-checkbox v-model="props.selected" hide-details />
              </td>
              <td v-for="(item, index) in headers" :key="index" class="text-xs-left select" @click.stop="select(props.item)">
                {{ props.item[item.value] }}
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
    <v-dialog v-model="dialogImport" max-width="500" persistent>
      <v-card>
        <v-card-title>
          {{ $t('ImportExcel') }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="filename"
            :hint="$t('ChooseFile')"
            :label="$t('Filename')"
            readonly
            append-icon="attach_file"
            @click:append="fileselect()"
          />
          <v-select
            v-model="sheet"
            :items="sheets"
            :label="$t('SelectSheet')"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" flat @click="dialogImport=false">
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn
            dark
            color="primary"
            @click="importExcel()"
          >
            {{ $t('Import') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-content>
</template>

<script>
import XLSX from 'xlsx'
import service from '~/plugins/feathers-service.js'
import dialogRemove from '~/components/dialog-remove.vue'
import { mapState } from 'vuex'
export default {
  components: { dialogRemove },

  data() {
    return {
      requiredRules: [v => !!v || this.$t('Required')],
      name: null,
      selected: [],
      dialogImport: false,
      dialogRemove: false,
      dialogCreate: false,
      valid: null,
      search: null,
      sheets: [],
      sheet: null,
      filename: null
    }
  },

  computed: {
    /*
    headers() {
      console.log('headers')
      return [
        { text: 'id', align: 'left', sortable: true, value: 'id' }
      ]

      const keys = { }
      this.data.forEach((item) => {
        Object.keys(item.doc).forEach((key) => {
          if (!keys.hasOwnProperty(item)) {
            keys[key] = { text: key, align: 'left', sortable: true, value: key }
          }
        })
      })
      return Object.keys(keys).map((key) => {
        return keys[key]
      })
    },
    */
    ...mapState('data', {
      data(state) {
        return state.list.filter((item) => {
          return item.databaseId === this.$route.params.id
        }).map((item) => {
          return { id: item.id, createdAt: item.createdAt, updatedAt: item.updatedAt, ...item.doc }
        })
      }
    })
  },

  async asyncData({ store, params }) {
    /*
    const createHeaders = (node) => {
      console.log(node)
      let headers = []
      Object.keys(node).forEach((key) => {
        if (key === 'properties') {
          headers = [ ...headers, ...createHeaders(node[key]) ]
        }
        if (key[0] !== '_' && key !== 'id' && key !== 'geometry') {
          headers.push({ text: key, align: 'left', sortable: true, value: key })
        }
      })
      return headers
    }
    */

    service('databases')(store)
    const database = await store.dispatch('databases/get', params.id)

    const headers = []// createHeaders(database.schema)
    if (database.schema.properties && database.schema.properties.properties && database.schema.properties.properties.properties) {
      Object.keys(database.schema.properties.properties.properties).forEach((key) => {
        headers.push({ text: key, align: 'left', sortable: true, value: key })
      })
    }
    return {
      headers
    }
  },

  async fetch({ store, params }) {
    service('data')(store)
    await store.dispatch('data/find', {
      query: {
        databaseId: params.id
      }
    })
    store.commit('title', 'Data')
  },
  created() {
    service('data')(this.$store)
  },

  methods: {
    showCreate() {
      this.dialogCreate = true
      this.$nextTick(() =>
        this.$refs.focus.$el.getElementsByTagName('input')[0].focus()
      )
    },
    async create() {
      if (this.$refs.form.validate()) {
        await this.$store.dispatch('databases/create', {
          name: this.name,
          organizationId: this.$route.params.id,
          schema: {}
        })
        this.dialogCreate = false
        this.$refs.form.reset()
      }
    },
    async remove() {
      for (const item of this.selected) {
        await this.$store.dispatch('databases/remove', item.id)
      }
      this.selected = []
      this.dialogRemove = false
    },
    select(item) {
      this.$router.push(this.localePath({ name: 'organizations-id', params: { id: item.id } }))
    },
    async importExcel() {
      const json = XLSX.utils.sheet_to_json(this.$options.workbook.Sheets[this.sheet])
      const json2 = json.map((item) => {
        /*
        if (item.hasOwnProperty('_id') && item.hasOwnProperty('_rev')) {
          const { _id, _rev, ...doc } = item
          return { id: _id, doc, databaseId: this.$route.params.id }
        }
        if (item.hasOwnProperty('id')) {
          const { id, ...doc } = item
          return { id, doc, databaseId: this.$route.params.id }
        }
        */
        return { doc: item, databaseId: this.$route.params.id }
      })
      await this.$store.dispatch('data/remove', [null, {
        query: {
          databaseId: this.$route.params.id
        }
      }])
      await this.$store.dispatch('data/create', json2)
      this.dialogImport = false
    },
    async fileselect(id) {
      const fileDialog = (...args) => {
        const input = document.createElement('input')

        // Set config
        if (typeof args[0] === 'object') {
          if (args[0].multiple === true) input.setAttribute('multiple', '')
          if (args[0].accept !== undefined) { input.setAttribute('accept', args[0].accept) }
          if (args[0].capture !== undefined) { input.setAttribute('capture', args[0].capture) }
        }
        input.setAttribute('type', 'file')

        // IE10/11 Addition
        input.style.display = 'none'
        input.setAttribute('id', 'hidden-file')
        document.body.appendChild(input)

        // Return promise/callvack
        return new Promise((resolve, reject) => {
          input.addEventListener('change', (e) => {
            resolve(input.files)
            const lastArg = args[args.length - 1]
            if (typeof lastArg === 'function') lastArg(input.files)
            // IE10/11 Addition
            document.body.removeChild(input)
          })

          // Simluate click event
          const evt = document.createEvent('MouseEvents')
          evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null)
          input.dispatchEvent(evt)
        })
      }
      const file = await fileDialog({ accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      this.filename = file[0].name
      const fr = new FileReader()
      fr.onload = () => {
        this.$options.workbook = XLSX.read(fr.result, { type: 'array' })
        this.sheets = this.$options.workbook.SheetNames
      }
      fr.readAsArrayBuffer(file[0])
    }
  }
}
</script>
<style scoped lang="stylus">
.select
  cursor pointer
</style>
