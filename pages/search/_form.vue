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
        <v-list-tile :to="localePath({ name: 'organizations-id-databases', params: { id: current.organizationId } })" active-class="primary white--text" nuxt>
          <v-list-tile-title>{{ $t('Databases') }}</v-list-tile-title>
        </v-list-tile>
        <v-list-group :value="true">
          <template v-slot:activator>
            <v-list-tile :to="localePath({ name: 'organizations-id-forms', params: { id: current.organizationId } })" active-class="primary white--text" nuxt>
              <v-list-tile-title>{{ $t('Forms') }}</v-list-tile-title>
            </v-list-tile>
          </template>
          <v-list-tile :to="localePath({ name: 'forms-id', params: { id: current.id} })" active-class="primary white--text" nuxt>
            <v-list-tile-title>{{ $store.state.forms.current.name }}</v-list-tile-title>
          </v-list-tile>
        </v-list-group>
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
                  <v-chip color="primary" dark class="mr-4">
                    <v-avatar color="primary lighten-1">
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
          <v-container grid-list-md fill-height fluid pa-0>
            <v-layout row fill-height>
              <v-flex
                v-show="!maximize"
                :class="breakClass"
                scroll-x
                class="fixed-header white ma-1 pa-0"
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
                          <v-layout ma-0>
                            <v-layout column justify-center ma-0>
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
                    <tr class="select" :class="props.item._id === $route.params.id && 'accent lighten-4'">
                      <td>
                        <v-checkbox
                          :input-value="selectionSet.hasOwnProperty(props.item._id)"
                          primary
                          hide-details
                          @change="select($event, props.item._id)"
                        />
                      </td>
                      <td v-for="(item, index) in visibleHeaders" :key="index" class="text-xs-left text-truncate overflow-hidden" :style="item.width>0 && `max-width:${item.width}px;min-width:${item.width}px`" @click.stop="$router.push(localePath({ name: 'search-form-id', params: { form: $route.params.form, id: props.item._id }}))">
                        {{ props.item[item.value] }}
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </v-flex>
              <v-flex v-show="$route.params.hasOwnProperty('id')" :class="infoClass">
                <v-card color="accent lighten-5" style="max-width:100%">
                  <v-container fluid fill-height pa-0>
                    <v-layout column ma-0>
                      <v-toolbar card dense color="accent" dark>
                        <v-spacer />
                        <v-btn
                          icon
                          @click="maximize=!maximize"
                        >
                          <v-icon>
                            {{ maximize? 'minimize' : 'maximize' }}
                          </v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          :to="localePath({ name: 'search-form', params: { form: $route.params.form } })"
                          nuxt
                        >
                          <v-icon>
                            close
                          </v-icon>
                        </v-btn>
                      </v-toolbar>
                      <v-flex d-flex scroll-y pa-0 fill-height>
                        <nuxt-child />
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </v-layout>
      </v-container>

      <dialog-remove
        v-model="dialogRemove"
        @remove="remove()"
      />

      <v-dialog
        v-model="dialogCreate"
        scrollable
        hide-overlay
      >
        <v-form ref="form" v-model="valid" style="width:100%" @submit.prevent>
          <v-card color="accent lighten-5">
            <v-card-title class="primary dark title white--text">
              {{ $t('Create') }}
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md fluid>
                <v-layout row wrap>
                  <v-flex
                    v-for="(groupItem, groupIndex) in groups"
                    :key="groupIndex"
                    xs12
                    sm6
                    md4
                    lg3
                    d-flex
                  >
                    <v-card>
                      <v-toolbar color="accent lighten-3" dense card>
                        <v-toolbar-title>
                          {{ groupItem.name }}
                        </v-toolbar-title>
                      </v-toolbar>
                      <v-card-text>
                        <template v-for="(fieldItem, fieldIndex) in groupItem.fields">
                          <div
                            :key="fieldIndex"
                          >
                            <v-text-field
                              v-if="fieldItem.type==='text'"
                              v-model="doc[fieldItem.column]"
                              :label="fieldItem.name"
                              :required="fieldItem.isRequired"
                              :rules="fieldItem.isRequired ? [v => !!v || $t('Required')] : []"
                            />
                            <v-text-field
                              v-if="fieldItem.type==='url'"
                              v-model="doc[fieldItem.column]"
                              :label="fieldItem.name"
                              :required="fieldItem.isRequired"
                              :rules="fieldItem.isRequired ? [v => !!v || $t('Required')] : []"
                              type="url"
                              append-outer-icon="launch"
                              @click:append-outer="openLink(fieldItem)"
                            />
                            <v-textarea
                              v-if="fieldItem.type==='textarea'"
                              v-model="doc[fieldItem.column]"
                              :label="fieldItem.name"
                              :required="fieldItem.isRequired"
                              :rules="fieldItem.isRequired ? [v => !!v || $t('Required')] : []"
                            />
                            <v-text-field
                              v-if="fieldItem.type==='timestamp'"
                              :value="doc[fieldItem.column]"
                              :label="fieldItem.name"
                              readonly
                            />
                            <v-select
                              v-if="fieldItem.type==='select'"
                              v-model="doc[fieldItem.column]"
                              :items="fieldItem.values"
                              :label="fieldItem.name"
                              :required="fieldItem.isRequired"
                              :rules="fieldItem.isRequired ? [v => !!v || $t('Required')] : []"
                            />
                            <v-checkbox
                              v-if="fieldItem.type==='boolean'"
                              v-model="doc[fieldItem.column]"
                              :label="fieldItem.name"
                              :required="fieldItem.isRequired"
                              :rules="fieldItem.isRequired ? [v => !!v || $t('Required')] : []"
                            />
                            <v-menu
                              v-if="fieldItem.type==='date'"
                              v-model="menus[fieldIndex]"
                              :close-on-content-click="false"
                              :nudge-right="40"
                              lazy
                              transition="scale-transition"
                              offset-y
                              full-width
                              min-width="290px"
                            >
                              <template v-slot:activator="{ on }">
                                <v-text-field
                                  v-model="doc[fieldItem.column]"
                                  :label="fieldItem.name"
                                  :required="fieldItem.isRequired"
                                  :rules="fieldItem.isRequired ? [v => !!v || $t('Required')] : []"
                                  readonly
                                  v-on="on"
                                />
                              </template>
                              <v-date-picker
                                v-model="doc[fieldItem.column]"
                                :locale="locale"
                                no-title
                                @input="menus[fieldIndex]=false"
                              />
                            </v-menu>
                            <v-radio-group
                              v-if="fieldItem.type==='radio'"
                              v-model="doc[fieldItem.column]"
                              :mandatory="false"
                              :label="fieldItem.name"
                              :required="fieldItem.isRequired"
                              :rules="fieldItem.isRequired ? [v => !!v || $t('Required')] : []"
                            >
                              <v-radio
                                v-for="(value, valueIndex) in fieldItem.values"
                                :key="valueIndex"
                                :label=" value"
                                :value="value"
                              />
                            </v-radio-group>
                          </div>
                        </template>
                      </v-card-text>
                    </v-card>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions class="primary lighten-5">
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
    <v-snackbar
      v-model="snackbar"
      :color="color"
      :timeout="2000"
      multi-line
    >
      <v-icon large dark>
        {{ color==='error'?'error':'save' }}
      </v-icon>
      <div class="ml-3">
        <h1 class="title">
          {{ snackbarTitle }}
        </h1>
        <div v-show="color==='error'">
          {{ snackbarBody }}
        </div>
      </div>
      <v-btn
        dark
        flat
        @click="snackbar = false"
      >
        {{ $t('Close') }}
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import client from '~/plugins/feathers-client'
import service from '~/plugins/feathers-service.js'
import dialogRemove from '~/components/dialog-remove.vue'
import tableHeader from '~/components/table-header.vue'
import mainDrawer from '~/components/main-drawer'
import mainToolbar from '~/components/main-toolbar'
import { mapGetters } from 'vuex'

export default {
  components: { mainDrawer, mainToolbar, dialogRemove, tableHeader },
  middleware: ['search'],
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
      dialogCreate: false,
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
      menus: {},
      doc: {},
      color: null,
      snackbarTitle: null,
      snackbarBody: null,
      snackbar: false
    }
  },
  computed: {
    ...mapGetters('forms', ['current']),
    form() {
      return this.current.doc
    },
    groups() {
      return this.form.groups
    },
    locale() {
      const l = this.$i18n.locales.find((item) => {
        return item.code === this.$i18n.locale
      })
      return l ? l.iso : 'da-DK'
    },
    disableClear() {
      return Object.keys(this.selectionSet).length === 0
    },
    visibleHeaders() {
      return this.headers.filter((header) => {
        if (header.visible) return header
      })
    },
    title() {
      return this.$t(this.$store.state.title)
    },
    avatar() {
      return this.$store.state.organizations.current.name
    },
    breakClass() {
      const classes = []
      if (this.$breakpoint.is('smAndUp')) {
        classes.push('elevation-1')
      }
      if (this.$route.params.hasOwnProperty('id')) {
        if (!this.maximize) {
          classes.push('xs6 d-flex')
        }
      } else {
        classes.push('xs12 d-flex')
      }
      return classes.join(' ')
    },
    infoClass() {
      if (this.$route.params.hasOwnProperty('id')) {
        return `${this.maximize ? 'xs12' : 'xs6'} d-flex`
      }
      return ''
    },
    maximize: {
      get() {
        return this.$store.state.maximize
      },
      set(value) {
        this.$store.commit('maximize', value)
      }
    }
  },

  async asyncData({ store, params }) {
    const headers = []
    store.state.forms.current.doc.groups.forEach((group) => {
      group.fields.forEach((field) => {
        headers.push({
          align: 'left',
          text: field.name,
          value: field.column,
          visible: true,
          type: field.type,
          filter: null,
          menu: false,
          sortable: false,
          lookup: field.values,
          width: 200
        })
      })
    })
    const service = client.service(`es/${store.state.forms.current.databaseId}`)
    const res = await service.find()
    const { data, ...pagination } = res
    return {
      headers,
      data,
      pagination
    }
  },
  created() {
    service('forms')(this.$store)
  },
  mounted() {
    const target = document.querySelector('.v-table__overflow')
    target.addEventListener('scroll', this.onScroll, { pasive: true })

    const service = client.service(`es/${this.$store.state.forms.current.databaseId}`)
    service.on('created', (item) => {
      console.log('created', item)
    })
    service.on('updated', (item) => {
      console.log('updated', item)
      const index = this.data.findIndex((doc) => {
        return doc._id === item._id
      })
      if (index !== -1) {
        this.data.splice(index, 1, item)
      }
    })
    service.on('patched', (item) => {
      console.log('patched', item)
      const index = this.data.findIndex((doc) => {
        return doc._id === item._id
      })
      if (index !== -1) {
        this.data.splice(index, 1, item)
      }
    })
    service.on('removed', (item) => {
      console.log('removed', item)
    })
  },

  methods: {
    openLink(field) {
      window.open(this.doc[field.column], '_blank')
    },
    showCreate() {
      this.dialogCreate = true
      /*
      this.$nextTick(() =>
        this.$refs.focus.$el.getElementsByTagName('input')[0].focus()
      )
      */
    },
    async create() {
      if (this.$refs.form.validate()) {
        const doc = { ...this.doc }
        this.form.groups.forEach((group) => {
          group.fields.forEach((field) => {
            if (field.type === 'timestamp') {
              doc[field.column] = (new Date()).toISOString()
            }
            if (field.type === 'date' && doc.hasOwnProperty(field.column)) {
              doc[field.column] = new Date(doc[field.column])
            }
          })
        })
        try {
          await client.service(`es/${this.$store.state.forms.current.databaseId}`).create(doc)
          this.dialogCreate = false
          this.$refs.form.reset()
          this.color = 'success'
          this.snackbarTitle = this.$t('ValidateSuccessTitle')
          this.snackbar = true
        } catch (err) {
          this.color = 'error'
          this.snackbarTitle = this.$t('ValidateErrorTitle')
          this.snackbarBody = err
          this.snackbar = true
        }
      } else {
        this.color = 'error'
        this.snackbarTitle = this.$t('ValidateErrorTitle')
        this.snackbarBody = this.$t('ValidateErrorBody')
        this.snackbar = true
      }
    },
    async remove() {
      const service = client.service(`es/${this.$store.state.forms.current.databaseId}`)
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
    async nextPage() {
      try {
        const res = await client.service(`es/${this.$store.state.forms.current.databaseId}`).find({
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
        if (item.lookup) {
          if (value && value.length !== 0) {
            this.query[`${key}.keyword`] = {
              $in: value
            }
          }
        } else if ((item.type === 'date' || item.type === 'time') && item.filter) {
          if (item.filter.from) {
            this.query[key] = { ...this.query[key], ...{ $gte: item.filter.from } }
          }
          if (item.filter.to) {
            this.query[key] = { ...this.query[key], ...{ $lte: item.filter.to } }
          }
        } else if (item.type === 'number' && item.filter) {
          this.query[key] = item.filter
        } else if (item.type === 'boolean' && item.filter !== null) {
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
          console.log(header)
          this.query.$sort = { [['radio', 'select', 'text', 'textarea'].indexOf(header.type) !== -1 ? `${header.value}.keyword` : header.value]: this.sorting.descending ? -1 : 1 }
        }
      }
      const service = client.service(`es/${this.$store.state.forms.current.databaseId}`)
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
