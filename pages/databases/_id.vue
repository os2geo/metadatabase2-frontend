<template>
  <v-app>
    <main-drawer v-model="drawer">
      <v-list>
        <v-list-tile
          :to="localePath({ name: 'organizations-id', params: $route.params })"
          active-class="primary white--text"
          nuxt
          exact
          avatar
        >
          <v-list-tile-avatar>
            <v-avatar color="accent" size="40">
              <span class="white--text headline">
                {{ avatar[0] }}
              </span>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-content>
            {{ avatar }}
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="localePath({ name: 'organizations-id-users', params: { id: current.organizationId } })" active-class="primary white--text" nuxt>
          <v-list-tile-title>{{ $t('Users') }}</v-list-tile-title>
        </v-list-tile>
        <v-list-group :value="true">
          <template v-slot:activator>
            <v-list-tile :to="localePath({ name: 'organizations-id-databases', params: { id: current.organizationId } })" active-class="primary white--text" nuxt>
              <v-list-tile-title>{{ $t('Databases') }}</v-list-tile-title>
            </v-list-tile>
          </template>
          <v-list-tile :to="localePath({ name: 'databases-id', params: $route.params })" active-class="primary white--text" nuxt>
            <v-list-tile-title>{{ databaseName }}</v-list-tile-title>
          </v-list-tile>
        </v-list-group>
        <v-list-tile :to="localePath({ name: 'organizations-id-forms', params: { id: current.organizationId } })" active-class="primary white--text" nuxt>
          <v-list-tile-title>{{ $t('Forms') }}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </main-drawer>
    <main-toolbar v-model="drawer" />
    <v-content>
      <v-container :pa-0="$breakpoint.is('xsOnly')" fluid grid-list-md>
        <v-layout row wrap>
          <v-flex xs12 sm6>
            <v-card>
              <v-card-title class="title">
                {{ $t('Database') }}
              </v-card-title>
              <v-card-text>
                <v-text-field
                  v-model="databaseName"
                  :label="$t('Name')"
                />
                <v-checkbox
                  v-model="isLocked"
                  :label="$t('Locked')"
                />
              </v-card-text>
              <v-card-actions>
                <v-chip color="primary" dark>
                  <v-avatar>
                    <v-icon>insert_drive_file</v-icon>
                  </v-avatar>
                  {{ pagination.total }}
                </v-chip>
                <v-spacer />
                <v-tooltip top>
                  <v-btn slot="activator" icon @click="dialogImport=true">
                    <v-icon color="primary">
                      fas fa-file-import
                    </v-icon>
                  </v-btn>
                  <span>{{ $t('Import') }}</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn slot="activator" icon @click="exportExcel()">
                    <v-icon color="primary">
                      fas fa-file-export
                    </v-icon>
                  </v-btn>
                  <span>{{ $t('Export') }}</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn slot="activator" icon @click="dialogHelp=true">
                    <v-icon color="primary">
                      help_outline
                    </v-icon>
                  </v-btn>
                  <span>{{ $t('Help') }}</span>
                </v-tooltip>
              </v-card-actions>
            </v-card>
          </v-flex>
          <v-flex xs12 sm6>
            <v-card>
              <v-card-title class="title">
                {{ $t('Forms') }}
              </v-card-title>
              <v-list>
                <v-list-tile v-for="(item, index) in forms" :key="index" nuxt :to="localePath({ name: 'forms-id', params: { id: item.id } })">
                  <v-list-tile-content>
                    {{ item.name }}
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-icon>chevron_right</v-icon>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>

    <v-dialog v-model="dialogImport" max-width="500" persistent>
      <v-form ref="importForm" @submit.prevent>
        <v-card>
          <v-card-title>
            {{ $t('ImportExcel') }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="filename"
              :hint="$t('ChooseFile')"
              :label="$t('Filename')"
              :rules="requiredRules"
              readonly
              required
              append-icon="attach_file"
              @click:append="fileselect()"
            />
            <v-select
              v-model="sheet"
              :items="sheets"
              :label="$t('SelectSheet')"
              :rules="requiredRules"
              required
            />
            <v-alert
              :value="true"
              type="warning"
            >
              {{ $t('WarningImport') }}
            </v-alert>
          </v-card-text>
          <v-progress-linear :indeterminate="progress" />
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" flat @click="dialogImport=false">
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              dark
              color="primary"
              type="submit"
              @click="importExcel()"
            >
              {{ $t('Import') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-app>
</template>

<script>
import XLSX from 'xlsx'
import client from '~/plugins/feathers-client'
import service from '~/plugins/feathers-service.js'
import mainDrawer from '~/components/main-drawer'
import mainToolbar from '~/components/main-toolbar'
import { mapGetters } from 'vuex'

export default {
  components: { mainDrawer, mainToolbar },
  middleware: ['auth', 'databases'],
  head() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      loading: false,
      requiredRules: [v => !!v || this.$t('Required')],
      name: null,
      dialogImport: false,
      dialogRemove: false,
      valid: null,
      sheets: [],
      sheet: null,
      filename: null,
      pagination: {},
      drawer: null,
      progress: false
    }
  },
  computed: {
    ...mapGetters('databases', ['current']),
    isLocked: {
      get() {
        return this.current.isLocked
      },
      set(isLocked) {
        this.$store.dispatch('databases/patch', [this.$route.params.id, { isLocked }])
      }
    },
    databaseName: {
      get() {
        return this.current.name
      },
      set(name) {
        this.$store.dispatch('databases/patch', [this.$route.params.id, { name }])
      }
    },
    title() {
      return this.$t(this.$store.state.title)
    },
    avatar() {
      return this.$store.state.organizations.current.name
    }
  },

  async asyncData({ store, params }) {
    const service = client.service(`es/${params.id}`)

    let res = await service.find()
    const { data, ...pagination } = res
    const serviceForms = client.service('forms')
    res = await serviceForms.find({
      query: {
        databaseId: params.id,
        $limit: -1
      }
    })
    return {
      pagination,
      forms: res
    }
  },
  fetch({ store, params }) {
    store.commit('title', 'Database')
  },
  mounted() {
  },
  created() {
    service('databases')(this.$store)
  },
  methods: {
    async exportExcel() {
      const service = client.service(`es/${this.$route.params.id}`)
      let data = []
      let res = await service.find({
        query: {
          $sort: { _id: 1 }
        }
      })
      data = [...data, ...res.data]
      while (res.total > res.skip + res.limit) {
        res = await service.find({
          query: {
            $skip: res.limit + res.skip,
            $sort: { _id: 1 }
          }
        })
        data = [...data, ...res.data]
      }
      /*
      const types = {}
      this.headers.forEach((item) => {
        types[item.value] = item.type
      })
      data.forEach((item) => {
        delete item._meta
        Object.keys(item).forEach((key) => {
          if (types[key] === 'date') {
            item[key] = new Date(item[key])
          }
        })
      })
      */
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Ark 1')
      XLSX.writeFile(wb, `${this.$route.params.id}.xlsx`)
    },
    async importExcel() {
      try {
        if (this.$refs.importForm.validate()) {
          this.progress = true
          const serviceIndices = client.service('indices')
          await serviceIndices.remove(this.$route.params.id)
          await serviceIndices.create({ id: this.$route.params.id })
          const json = XLSX.utils.sheet_to_json(this.$options.workbook.Sheets[this.sheet])
          const json2 = json.map((item) => {
            if (item.hasOwnProperty('_rev')) {
              const { _rev, ...doc } = item
              return doc
            }
            return item
          })

          const service = client.service(`es/${this.$route.params.id}`)
          this.data = await service.create(json2)
          const res = await client.service('indices').get(this.$route.params.id)
          if (res.hasOwnProperty(this.$route.params.id) && res[this.$route.params.id].hasOwnProperty('mappings') && res[this.$route.params.id].mappings.hasOwnProperty('docs') && res[this.$route.params.id].mappings.docs.hasOwnProperty('properties')) {
            this.headers = Object.keys(res[this.$route.params.id].mappings.docs.properties).map((key) => {
              const header = res[this.$route.params.id].mappings.docs.properties[key]
              return {
                align: 'left',
                text: key,
                value: key,
                visible: true,
                type: header.type,
                filter: null,
                menu: false,
                sortable: false,
                width: 200
              }
            })
          }
          /*
        let current = 0
        for (const doc of json2) {
          current++
          await service.create(doc)
          this.progress = 100 * current / json2.length
        }
        */
        }
      } catch (err) {
        console.log(err)
      } finally {
        this.progress = false
        this.dialogImport = false
        this.$refs.importForm.reset()
      }
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
</style>
