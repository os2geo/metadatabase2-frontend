<template>
  <v-app>
    <main-drawer v-if="$store.state.auth.payload" v-model="drawer">
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
        <v-list-tile v-if="isAdmin" :to="localePath({ name: 'organizations-id-users', params: { id: current.organizationId } })" active-class="primary white--text" nuxt>
          <v-list-tile-title>{{ $t('Users') }}</v-list-tile-title>
        </v-list-tile>
        <v-list-tile v-if="isAdmin" :to="localePath({ name: 'organizations-id-databases', params: { id: current.organizationId } })" active-class="primary white--text" nuxt>
          <v-list-tile-title>{{ $t('Databases') }}</v-list-tile-title>
        </v-list-tile>
        <v-list-group :value="true">
          <template v-slot:activator>
            <v-list-tile :to="localePath({ name: 'organizations-id-forms', params: { id: current.organizationId } })" active-class="primary white--text" nuxt>
              <v-list-tile-title>{{ $t('Forms') }}</v-list-tile-title>
            </v-list-tile>
          </template>
          <v-list-tile :to="localePath({ name: 'search-form', params: { form: current.id } })" active-class="primary white--text" nuxt>
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
                  <v-tooltip v-show="$breakpoint.is('smAndUp') && isUser" top>
                    <v-btn slot="activator" icon @click="dialogImport=true">
                      <v-icon color="primary">
                        fas fa-file-import
                      </v-icon>
                    </v-btn>
                    <span>{{ $t('Import') }}</span>
                  </v-tooltip>
                  <v-tooltip v-show="$breakpoint.is('smAndUp') && $store.state.auth.payload" top>
                    <v-btn slot="activator" icon @click="dialogExport=true">
                      <v-icon color="primary">
                        fas fa-file-export
                      </v-icon>
                    </v-btn>
                    <span>{{ $t('Export') }}</span>
                  </v-tooltip>
                  <v-tooltip v-show="$breakpoint.is('smAndUp') && isUser" top>
                    <v-btn slot="activator" icon @click="showCreate()">
                      <v-icon color="primary">
                        add
                      </v-icon>
                    </v-btn>
                    <span>{{ $t('Add') }}</span>
                  </v-tooltip>
                  <v-tooltip v-show="$breakpoint.is('smAndUp') && isUser" top>
                    <v-btn slot="activator" :disabled="disableClear" icon @click="dialogRemove=true">
                      <v-icon color="primary">
                        delete
                      </v-icon>
                    </v-btn>
                    <span>{{ $t('Delete') }}</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <v-menu slot="activator" lazy max-height="50vh" :close-on-content-click="false" offset-y>
                      <v-btn slot="activator" icon>
                        <v-icon color="primary">
                          settings
                        </v-icon>
                      </v-btn>
                      <v-list dense>
                        <template v-for="(header, index) in headersNotHidden">
                          <v-list-tile :key="`Header-${index}`">
                            <v-list-tile-action>
                              <v-checkbox v-model="header.visible" />
                            </v-list-tile-action>
                            <v-list-tile-title>{{ header.text }}</v-list-tile-title>
                          </v-list-tile>
                          <v-divider v-if="index < headersNotHidden.length" :key="`Divider-${index}`" />
                        </template>
                      </v-list>
                    </v-menu>
                    <span>{{ $t('ShowColumns') }}</span>
                  </v-tooltip>

                  <v-tooltip v-if="$breakpoint.is('smAndUp')" top>
                    <v-menu slot="activator" lazy max-height="50vh" :close-on-content-click="false" offset-y>
                      <v-btn slot="activator" icon>
                        <v-icon color="primary">
                          help_outline
                        </v-icon>
                      </v-btn>
                      <v-list dense>
                        <v-list-tile v-for="(link, index) in links" :key="index" :href="link.url" target="_blank">
                          <v-list-tile-title>{{ link.name }}</v-list-tile-title>
                        </v-list-tile>
                      </v-list>
                    </v-menu>
                    <span>{{ $t('ShowColumns') }}</span>
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
                                @update:exact="item.exact=$event"
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
                        {{ item.type === 'boolean' ? props.item[item.value] ? $t('true') : $t('false') : props.item[item.value] }}
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </v-flex>
              <v-flex v-show="$route.params.hasOwnProperty('id')" :class="infoClass">
                <v-card :color="`${$store.state.databases.current.isLocked ? 'red' : 'accent'} lighten-5`" style="max-width:100%">
                  <v-container fluid fill-height pa-0>
                    <v-layout column ma-0>
                      <v-toolbar card dense :color="$store.state.databases.current.isLocked ? 'red' : 'accent'" dark>
                        <v-btn
                          icon
                          nuxt
                          :to="localePath({ name: 'data-form-id', params: { form: $route.params.form, id: $route.params.id } })"
                        >
                          <v-icon>
                            launch
                          </v-icon>
                        </v-btn>
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
                              :readonly="fieldItem.isReadonly"
                              :rules="fieldItem.isRequired ? [v => !!v || $t('Required')] : []"
                            />
                            <v-text-field
                              v-if="fieldItem.type==='url'"
                              v-model="doc[fieldItem.column]"
                              :label="fieldItem.name"
                              :required="fieldItem.isRequired"
                              :readonly="fieldItem.isReadonly"
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
                              :readonly="fieldItem.isReadonly"
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
                              :readonly="fieldItem.isReadonly"
                              :rules="fieldItem.isRequired ? [v => !!v || $t('Required')] : []"
                            />
                            <v-checkbox
                              v-if="fieldItem.type==='boolean'"
                              v-model="doc[fieldItem.column]"
                              :label="fieldItem.name"
                              :required="fieldItem.isRequired"
                              :readonly="fieldItem.isReadonly"
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
                                :readonly="fieldItem.isReadonly"
                                @input="menus[fieldIndex]=false"
                              />
                            </v-menu>
                            <v-radio-group
                              v-if="fieldItem.type==='radio'"
                              v-model="doc[fieldItem.column]"
                              :mandatory="false"
                              :label="fieldItem.name"
                              :required="fieldItem.isRequired"
                              :readonly="fieldItem.isReadonly"
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
      <v-dialog
        v-model="dialogResult"
        max-width="500"
        persistent
        scrollable
      >
        <v-card>
          <v-card-title class="title">
            {{ $t('ImportDone') }}
          </v-card-title>
          <v-divider />
          <v-card-text style="height: 300px;">
            <p v-for="(item, index) in importResults" :key="index">
              {{ item.message }}
            </p>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" flat @click="dialogResult = false">
              {{ $t('Close') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="dialogImport" max-width="500" persistent>
        <v-card>
          <v-card-title class="title">
            {{ $t('ImportExcel') }}
          </v-card-title>
          <v-card-text>
            <v-radio-group
              v-model="importOptions"
              :label="$t('Options')"
              :messages="$t(importOptions===1?'UpdateCreateMessage':'DeleteMessage')"
            >
              <v-radio
                :label="$t('Update/Create')"
                :value="1"
              />
              <v-radio
                :label="$t('Delete')"
                :value="2"
              />
            </v-radio-group>
            <v-checkbox
              v-model="isLocked"
              :label="$t('LockDatabase')"
              hide-details
            />
          </v-card-text>
          <v-form ref="importForm" @submit.prevent>
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
            <v-progress-linear v-model="progress" />
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
                {{ $t(importOptions===1 ? 'Import' : 'Delete') }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>
      <v-dialog v-model="dialogExport" max-width="500" persistent>
        <v-card>
          <v-card-title class="title">
            {{ $t('ExportExcel') }}
          </v-card-title>
          <v-card-text>
            <v-radio-group
              v-model="exportOptions"
              :label="$t('Options')"
            >
              <v-radio
                :label="$t('List')"
                :value="1"
              />
              <v-radio
                :label="$t('Selected')"
                :value="2"
              />
            </v-radio-group>
            <v-checkbox
              v-model="isLocked"
              :label="$t('LockDatabase')"
            />
          </v-card-text>
          <v-progress-linear v-model="progress" />
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" flat @click="dialogExport=false">
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              dark
              color="primary"
              @click="exportExcel()"
            >
              {{ $t('Export') }}
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
import v4 from 'uuid/v4'
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
  middleware: ['search'],
  head() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      progress: 0,
      sorting: { name: null, descending: false },
      checkboxClearValue: false,
      loading: false,
      requiredRules: [v => !!v || this.$t('Required')],
      name: null,
      selectionSet: {},
      dialogExport: false,
      dialogImport: false,
      dialogRemove: false,
      dialogCreate: false,
      dialogResult: false,
      exportOptions: 1,
      importOptions: 1,
      valid: null,
      sheets: [],
      sheet: null,
      filename: null,
      search: null,
      headers: [],
      data: [],
      pagination: {},
      drawer: null,
      menus: {},
      doc: {},
      color: null,
      snackbarTitle: null,
      snackbarBody: null,
      snackbar: false,
      importResults: []
    }
  },
  computed: {
    ...mapGetters('databases', {
      database: 'current'
    }),
    isLocked: {
      get() {
        return this.database.isLocked
      },
      set(isLocked) {
        this.$store.dispatch('databases/patch', [this.database.id, { isLocked }])
      }
    },
    headersNotHidden() {
      return this.headers.filter((item) => {
        return !item.isHidden
      })
    },
    isUser() {
      return this.$store.state.auth.user && this.$store.state.auth.user.roleId < 4
    },
    isAdmin() {
      return this.$store.state.auth.user && this.$store.state.auth.user.roleId < 3
    },
    ...mapGetters('forms', ['current']),
    form() {
      return this.current.doc
    },
    links() {
      return this.form.links
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
    const query = {}
    const doc = {}
    store.state.forms.current.doc.groups.forEach((group) => {
      group.fields.forEach((field) => {
        headers.push({
          align: 'left',
          text: field.name,
          value: field.column,
          visible: field.isVisible,
          isHidden: field.isHidden,
          type: field.type,
          filter: field.filter,
          menu: false,
          sortable: false,
          lookup: field.values,
          width: 200,
          exact: false
        })
        if (field.defaultValue) {
          doc[field.column] = field.defaultValue
        }
      })
    })
    headers.forEach((item) => {
      const key = item.value
      const value = typeof item.filter !== 'undefined' ? item.filter : null
      if (item.lookup) {
        if (value !== null && value.length !== 0) {
          query[`${key}.keyword`] = {
            $in: value
          }
        }
      } else if ((item.type === 'date' || item.type === 'time') && value !== null) {
        if (item.filter.from) {
          query[key] = { ...query[key], ...{ $gte: item.filter.from } }
        }
        if (item.filter.to) {
          query[key] = { ...query[key], ...{ $lte: item.filter.to } }
        }
      } else if (item.type === 'number' && value !== null) {
        query[key] = item.filter
      } else if (item.type === 'boolean' && value !== null) {
        query[key] = item.filter
      } else if (value !== null && value !== '') {
        if (value.exact) {
          query[key] = {
            $phrase: value
          }
        } else {
          query[key] = {
            $wildcard: `${value}*`
          }
        }
      }
    })
    const service = client.service(`es/${store.state.forms.current.databaseId}`)
    const res = await service.find({ query })
    const { data, ...pagination } = res
    return {
      headers,
      query,
      data,
      doc,
      pagination
    }
  },
  created() {
    service('forms')(this.$store)
    service('databases')(this.$store)
  },
  mounted() {
    const target = document.querySelector('.v-table__overflow')
    target.addEventListener('scroll', this.onScroll, { pasive: true })

    const service = client.service(`es/${this.$store.state.forms.current.databaseId}`)
    service.on('created', (item) => {
    })
    service.on('updated', (item) => {
      const index = this.data.findIndex((doc) => {
        return doc._id === item._id
      })
      if (index !== -1) {
        this.data.splice(index, 1, item)
      }
    })
    service.on('patched', (item) => {
      const index = this.data.findIndex((doc) => {
        return doc._id === item._id
      })
      if (index !== -1) {
        this.data.splice(index, 1, item)
      }
    })
    service.on('removed', (item) => {
    })
  },

  methods: {
    async importExcel() {
      try {
        if (this.$refs.importForm.validate()) {
          const service = client.service(`es/${this.database.id}`)
          const json = XLSX.utils.sheet_to_json(this.$options.workbook.Sheets[this.sheet])
          const json2 = json.map((item) => {
            if (item.hasOwnProperty('_rev')) {
              const { _rev, ...doc } = item
              return doc
            }
            return item
          })
          this.progress = 0
          let current = 0
          for (const item of json2) {
            try {
              if (this.importOptions === 1) {
                // create / update
                if (item.hasOwnProperty('_id') && item._id !== null) {
                  await service.update(item._id, item)
                  const index = this.data.findIndex((doc) => {
                    return doc._id === item._id
                  })
                  if (index !== -1) {
                    this.data.splice(index, 1, item)
                  }
                } else {
                  item._id = v4()
                  await service.create(item)
                  this.pagination.total = this.pagination.total + 1
                }
              } else if (item.hasOwnProperty('_id') && item._id !== null) {
                // delete
                await service.remove(item._id)
                this.pagination.total = this.pagination.total - 1
                const index = this.data.findIndex((doc) => {
                  return doc._id === item._id
                })
                if (index !== -1) {
                  this.data.splice(index, 1)
                }
                if (this.selectionSet.hasOwnProperty(item._id)) {
                  this.$delete(this.selectionSet, item._id)
                }
              }
            } catch (err) {
              this.importResults.push(err)
            }
            current++
            this.progress = 100 * current / json2.length
          }
        }
      } catch (err) {
        console.log(err)
        this.color = 'error'
        this.snackbarTitle = this.$t('Error')
        this.snackbarBody = err
        this.snackbar = true
      } finally {
        this.dialogImport = false
        this.dialogResult = true
        this.progress = 0
        this.$refs.importForm.reset()
      }
    },
    async exportExcel() {
      try {
        let data = []
        this.progress = 0
        let current = 0
        if (this.exportOptions === 1) {
        // export list
          let skip = 0
          let limit = 0

          while (this.pagination.total > skip + limit) {
            const res = await client.service(`es/${this.$store.state.forms.current.databaseId}`).find({
              query: {
                ...this.query,
                $skip: limit + skip,
                $sort: { _id: 1 }
              }
            })
            data = [...data, ...res.data.map((item) => {
              const { _meta, ...fields } = item
              return fields
            })]
            limit = res.limit
            skip = res.skip
            current++
            this.progress = 100 * current / Math.ceil(this.pagination.total / limit)
          }
        } else {
        // export selected
          const service = client.service(`es/${this.$store.state.forms.current.databaseId}`)
          const keys = Object.keys(this.selectionSet)
          for (const id of keys) {
            current++
            const doc = await service.get(id)
            data.push(doc)
            this.progress = 100 * current / keys.length
          }
        }
        const ws = XLSX.utils.json_to_sheet(data, { header: this.headers.map(item => item.value) })
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Ark 1')
        XLSX.writeFile(wb, `${this.$route.params.id}.xlsx`)
      } catch (err) {
        console.log(err)
      } finally {
        this.dialogExport = false
        this.progress = 0
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
        doc._id = v4()
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
        } else if (typeof value !== 'undefined' && value !== null && value !== '') {
          if (item.exact) {
            this.query[key] = {
              $phrase: value
            }
          } else {
            this.query[key] = {
              $wildcard: `${value}*`
            }
          }
        }
      })
      if (this.sorting.name) {
        const header = this.headers.find((item) => {
          return item.value === this.sorting.name
        })
        if (header) {
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
