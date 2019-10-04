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
      <v-container pt-0 :pa-0="$breakpoint.is('xsOnly')" fill-height max-height fluid>
        <v-layout column>
          <div>
            <v-layout row>
              <v-flex>
                <v-toolbar flat color="transparent">
                  <v-text-field
                    v-model="databaseName"
                    :placeholder="$t('Name')"
                  />
                  <v-chip color="primary" dark class="mx-4">
                    <v-avatar>
                      <v-icon>insert_drive_file</v-icon>
                    </v-avatar>
                    {{ pagination.total }}
                  </v-chip>
                  <v-text-field
                    v-model="search"
                    :placeholder="$t('Search')"
                    prepend-icon="search"
                    clearable
                    @input="updateQuery()"
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
                    <v-btn slot="activator" icon @click="exportExcel()">
                      <v-icon color="primary">
                        fas fa-file-export
                      </v-icon>
                    </v-btn>
                    <span>{{ $t('Export') }}</span>
                  </v-tooltip>
                  <v-tooltip v-if="$breakpoint.is('smAndUp')" top>
                    <v-btn slot="activator" :disabled="disableClear" icon @click="dialogRemove=true">
                      <v-icon color="primary">
                        delete
                      </v-icon>
                    </v-btn>
                    <span>{{ $t('Delete') }}</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <v-menu slot="activator" lazy max-height="50vh" :close-on-content-click="false">
                      <v-btn slot="activator" icon>
                        <v-icon color="primary">
                          settings
                        </v-icon>
                      </v-btn>
                      <v-list dense>
                        <template v-for="(header, index) in headers">
                          <v-list-tile :key="`Header-${index}`">
                            <v-list-tile-action>
                              <v-checkbox v-model="header.visible" />
                            </v-list-tile-action>
                            <v-list-tile-title>{{ header.text }}</v-list-tile-title>
                          </v-list-tile>
                          <v-divider v-if="index < headers.length" :key="`Divider-${index}`" />
                        </template>
                      </v-list>
                    </v-menu>
                    <span>{{ $t('ShowColumns') }}</span>
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
                        <v-list-tile @click="exportExcel()">
                          <v-list-tile-action>
                            <v-icon>fas fa-file-export</v-icon>
                          </v-list-tile-action>
                          <v-list-tile-content>
                            {{ $t('Export') }}
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile
                          :disabled="disableClear"
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
              :headers="visibleHeaders"
              :items="data"
              :total-items="pagination.total"
              :custom-sort="sort"
              hide-actions
            >
              <template slot="headers" slot-scope="props">
                <tr>
                  <th>
                    <v-checkbox
                      hide-details
                      :input-value="checkboxClearValue"
                      :indeterminate="!disableClear"
                      :disabled="disableClear"
                      @click.stop="clear()"
                    />
                  </th>
                  <template v-for="(item, index) in props.headers">
                    <th
                      :id="`header-${index}`"
                      :key="index"
                      draggable
                      @dragover.prevent
                      @dragenter.prevent="tableHeaderDragEnter"
                      @dragleave.prevent="tableHeaderDragLeave"
                      @drop.prevent="tableHeaderDrop($event, item, index)"
                      @dragstart="tableHeaderDragStart($event, item)"
                    >
                      <v-layout>
                        <v-layout column justify-center>
                          <table-header
                            :value="item"
                            :sorting="sorting"
                            @update:sortBy="sorting.name=$event"
                            @update:descending="sorting.descending=$event"
                            @update:filter="item.filter=$event"
                            @update:query="updateQuery()"
                          />
                        </v-layout>
                        <v-spacer />
                        <v-icon color="grey lighten-2 select" @click.stop="item.width=item.width===0?200:0">
                          {{ item.width===0 ? 'chevron_left' : 'chevron_right' }}
                        </v-icon>
                      </v-layout>
                    </th>
                  </template>
                </tr>
              </template>
              <template slot="items" slot-scope="props">
                <td>
                  <v-checkbox
                    :input-value="selectionSet.hasOwnProperty(props.item._id)"
                    primary
                    hide-details
                    @change="select($event, props.item._id)"
                  />
                </td>
                <td v-for="(item, index) in visibleHeaders" :key="index" class="text-xs-left select text-truncate overflow-hidden" :style="item.width>0 && `max-width:${item.width}px;min-width:${item.width}px`" @click.stop="select(props.item)">
                  {{ props.item[item.value] }}
                </td>
              </template>
            </v-data-table>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <dialog-remove
      v-model="dialogRemove"
      @remove="remove()"
    />

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
import dialogRemove from '~/components/dialog-remove.vue'
import tableHeader from '~/components/table-header.vue'
import mainDrawer from '~/components/main-drawer'
import mainToolbar from '~/components/main-toolbar'
import { mapGetters } from 'vuex'

export default {
  components: { mainDrawer, mainToolbar, dialogRemove, tableHeader },
  middleware: ['auth', 'databases'],
  head() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      sorting: { name: null, descending: false },
      checkboxClearValue: false,
      loading: false,
      requiredRules: [v => !!v || this.$t('Required')],
      name: null,
      selectionSet: {},
      dialogImport: false,
      dialogRemove: false,
      valid: null,
      sheets: [],
      sheet: null,
      filename: null,
      search: null,
      query: {},
      headers: [],
      data: [],
      pagination: {},
      drawer: null,
      progress: false
    }
  },
  computed: {
    ...mapGetters('databases', ['current']),
    disableClear() {
      return Object.keys(this.selectionSet).length === 0
    },
    visibleHeaders() {
      return this.headers.filter((header) => {
        if (header.visible) return header
      })
    },
    databaseName: {
      get() {
        return this.$store.state.databases.current.name
      },
      set(value) {
        this.$store.dispatch('databases/patch', [this.$route.params.id, { name: value }])
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
    let res = await client.service('indices').get(params.id)
    let headers = []
    if (res.hasOwnProperty(params.id) && res[params.id].hasOwnProperty('mappings') && res[params.id].mappings.hasOwnProperty('docs') && res[params.id].mappings.docs.hasOwnProperty('properties')) {
      headers = Object.keys(res[params.id].mappings.docs.properties).map((key) => {
        const header = res[params.id].mappings.docs.properties[key]
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
    const service = client.service(`es/${params.id}`)
    res = await service.find()
    const { data, ...pagination } = res
    return {
      headers,
      data,
      pagination
    }
  },
  fetch({ store, params }) {
    store.commit('title', 'Data')
  },
  mounted() {
    const target = document.querySelector('.v-table__overflow')
    target.addEventListener('scroll', this.onScroll, { pasive: true })
  },
  created() {
    service('databases')(this.$store)
  },
  methods: {
    async remove() {
      const service = client.service(`es/${this.$route.params.id}`)
      for (const id of Object.keys(this.selectionSet)) {
        await service.remove(id)
        const index = this.data.findIndex((item) => {
          return item._id === id
        })
        this.data.splice(index, 1)
        this.pagination.total = this.pagination.total - 1
      }
      this.clear()
      this.dialogRemove = false
    },
    select(state, id) {
      if (state) {
        this.$set(this.selectionSet, id, id)
      } else {
        this.$delete(this.selectionSet, id)
      }
    },
    async exportExcel() {
      const service = client.service(`es/${this.$route.params.id}`)
      let data = []
      let res = await service.find()
      data = [...data, ...res.data]
      while (res.total > res.skip + res.limit) {
        res = await service.find({
          query: {
            $skip: res.limit + res.skip
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
    },
    async nextPage() {
      try {
        const res = await client.service(`es/${this.$route.params.id}`).find({
          query: {
            ...this.query,
            ...{ $skip: this.pagination.limit + this.pagination.skip }
          }
        })
        this.pagination = {
          limit: res.limit,
          skip: res.skip,
          total: res.total
        }
        this.data = [...this.data, ...res.data]
      } catch (error) {
        console.log(error)
      }
    },
    async onScroll(e) {
      const offset = e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop
      if (!this.loading && this.pagination.total > this.pagination.skip + this.pagination.limit && offset < 300 && offset > 0) {
        this.loading = true
        await this.nextPage()
        this.loading = false
      }
    },
    async updateQuery() {
      this.query = {}
      if (this.search) {
        this.query = { ...this.query,
          ...{
            $sqs: {
              $query: `${this.search}*`
            }
          }
        }
      }
      this.headers.forEach((item) => {
        const key = item.value
        const value = item.filter
        if ((item.type === 'date' || item.type === 'time') && item.filter) {
          if (item.filter.from) {
            this.query[key] = { ...this.query[key], ...{ $gte: item.filter.from } }
          }
          if (item.filter.to) {
            this.query[key] = { ...this.query[key], ...{ $lte: item.filter.to } }
          }
        } else if (item.type === 'number' && item.filter) {
          this.query[key] = item.filter
        } else if (value !== null && value !== '') {
          this.query[key] = {
            $wildcard: `${value.toLowerCase()}*`
          }
        }
      })
      if (this.sorting.name) {
        const header = this.headers.find((item) => {
          return item.value === this.sorting.name
        })
        if (header) {
          this.query.$sort = { [header.type === 'text' ? `${header.value}.keyword` : header.value]: this.sorting.descending ? -1 : 1 }
        }
      }
      const service = client.service(`es/${this.$route.params.id}`)
      const res = await service.find({
        query: this.query
      })
      const { data, ...pagination } = res
      this.data = res.data
      this.pagination = pagination
    },
    sort(items, key, ascending) {
      return items
    },
    clear() {
      this.checkboxClearValue = false
      this.selectionSet = {}
    },
    tableHeaderDragStart(e, header) {
      e.dataTransfer.setData('header', header.value)
      // e.dropEffect = 'move'
    },
    tableHeaderDragEnter(e) {
      e.dataTransfer.dropEffect = 'move'
      if (e.target.nodeName === 'TH') {
        e.target.classList.add('accent')
        e.target.classList.add('lighten-4')
      }
    },
    tableHeaderDragLeave(e) {
      e.dataTransfer.dropEffect = 'move'
      if (e.toElement.nodeName !== 'DIV' && e.fromElement.nodeName === 'TH') {
        e.target.classList.remove('accent')
        e.target.classList.remove('lighten-4')
      }
    },
    tableHeaderDrop(e, headerTo, index) {
      const el = document.querySelector(`#header-${index}`)
      el.classList.remove('accent')
      el.classList.remove('lighten-4')
      const headerFrom = e.dataTransfer.getData('header')
      const indexTo = this.headers.findIndex((item) => {
        return item.value === headerTo.value
      })
      const indexFrom = this.headers.findIndex((item) => {
        return item.value === headerFrom
      })
      const header = this.headers[indexFrom]
      this.headers.splice(indexFrom, 1)
      this.headers.splice(indexTo, 0, header)
    }
  }
}
</script>
<style scoped lang="stylus">
.cell-width
  max-width 200px
  min-width 200px
  width: 200px
.select
  cursor pointer
</style>
