<template>
  <v-content>
    <v-container pt-0 :pa-0="$breakpoint.is('xsOnly')" fill-height max-height fluid>
      <v-layout column>
        <div>
          <v-layout row>
            <v-flex>
              <v-toolbar flat color="transparent">
                <v-chip color="primary" dark>
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
                      <!--
                      <v-icon color="grey lighten-2" style="cursor: col-resize;" @mousedown="mousedown(item, $event)">
                        chevron_right
                      </v-icon>
                      -->
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
import client from '~/plugins/feathers-client'
import dialogRemove from '~/components/dialog-remove.vue'
import tableHeader from '~/components/table-header.vue'
const serviceData = client.service('data')
export default {
  components: { dialogRemove, tableHeader },

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
      dialogCreate: false,
      valid: null,
      sheets: [],
      sheet: null,
      filename: null,
      search: null,
      query: {},
      headers: [],
      data: [],
      pagination: {}
    }
  },
  computed: {
    disableClear() {
      return Object.keys(this.selectionSet).length === 0
    },
    visibleHeaders() {
      return this.headers.filter((header) => {
        if (header.visible) return header
      })
    }
  },

  async asyncData({ store, params }) {
    let res = await client.service('indices').get(params.id)
    console.log(res)
    let headers = []
    if (res.hasOwnProperty(params.id) && res[params.id].hasOwnProperty('mappings') && res[params.id].mappings.hasOwnProperty('docs') && res[params.id].mappings.docs.hasOwnProperty('properties')) {
      headers = Object.keys(res[params.id].mappings.docs.properties).map((key) => {
        const header = res[params.id].mappings.docs.properties[key]
        console.log(header)
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
    console.log(res)
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
    const updateItem = (item) => {
      this.$set(this.index, item.id, item)
    }
    serviceData.on('created', (item) => {
      console.log('created', item)
      // updateItem(item)
    })
    serviceData.on('updated', item =>
      updateItem(item)
    )
    serviceData.on('patched', item =>
      updateItem(item)
    )
    serviceData.on('removed', (item) => {
      console.log('removed', item)
      this.$delete(this.index, item.id)
    })
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
    edit(item) {
      this.$router.push(this.localePath({ name: 'organizations-id', params: { id: item.id } }))
    },
    select(state, id) {
      if (state) {
        this.$set(this.selectionSet, id, id)
      } else {
        this.$delete(this.selectionSet, id)
      }
    },
    async importExcel() {
      const json = XLSX.utils.sheet_to_json(this.$options.workbook.Sheets[this.sheet])
      const json2 = json.map((item) => {
        if (item.hasOwnProperty('_rev')) {
          const { _rev, ...doc } = item
          return doc
        }
        return item
      })
      const service = client.service(`es/${this.$route.params.id}`)
      await service.create(json2)
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
            $wildcard: `${value}*`
          }
        }
      })
      console.log(this.query, this.sorting)
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
    /*
    resize column
    mousedown(item, event) {
      const mousemove = (event) => {
        item.width = item.width + event.movementX
      }
      const mouseup = () => {
        console.log('mouseup')
        event.target.removeEventListener('mousemove', mousemove)
        event.target.removeEventListener('mouseup', mouseup)
        event.target.removeEventListener('mouseleave', mouseup)
      }
      event.target.addEventListener('mousemove', mousemove)
      event.target.addEventListener('mouseup', mouseup)
      event.target.addEventListener('mouseleave', mouseup)
    },
    */
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
