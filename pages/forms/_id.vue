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
                {{ header[0] }}
              </span>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-content>
            {{ header }}
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
          <v-list-tile :to="localePath({ name: 'forms-id', params: $route.params })" active-class="primary white--text" nuxt>
            <v-list-tile-title>{{ formName }}</v-list-tile-title>
          </v-list-tile>
        </v-list-group>
      </v-list>
    </main-drawer>
    <main-toolbar v-model="drawer" />
    <v-content>
      <v-container fluid grid-list-md>
        <v-card>
          <v-card-text>
            <v-text-field
              v-model="formName"
              :label="$t('Name')"
            />
            <v-autocomplete
              v-model="databaseId"
              :items="databases"
              item-text="name"
              item-value="id"
              :label="$t('Database')"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn flat color="primary" @click="showCreateCopy()">
              {{ $t('CreateCopy') }}
            </v-btn>
            <v-btn flat color="primary" @click="showDialogCreate=true">
              {{ $t('CreateFromData') }}
            </v-btn>
            <v-btn flat color="primary" nuxt :to="localePath({ name: 'search-form', params: { form: $route.params.id }})">
              {{ $t('Show') }}
            </v-btn>
          </v-card-actions>
        </v-card>
        <h2 class="title primary--text my-2">
          {{ $t('Groups') }}
        </h2>
        <v-layout row wrap>
          <v-flex
            v-for="(groupItem, groupIndex) in groups"
            :id="`group-${groupIndex}`"
            :key="groupIndex"
            xs12
            md4
            d-flex
          >
            <v-card
              draggable
              @dragover.prevent
              @dragenter.prevent="dragEnterGroup($event, groupIndex)"
              @dragleave.prevent="dragLeaveGroup($event, groupIndex)"
              @drop.prevent="dropGroup($event, groupIndex)"
              @dragstart.stop="dragStartGroup($event, groupIndex)"
            >
              <v-toolbar color="primary" dark dense card>
                <v-text-field
                  :placeholder="$t('GroupName')"
                  :value="groupItem.name"
                  @input="inputGroupName($event, groupIndex)"
                />
                <v-spacer />
                <v-btn icon @click="removeGroup(groupIndex)">
                  <v-icon>close</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-text>
                <template v-for="(fieldItem, fieldIndex) in groupItem.fields">
                  <div
                    :key="fieldIndex"
                    draggable
                    @dragover.prevent
                    @dragenter.prevent="dragEnterField($event, groupIndex, fieldIndex)"
                    @dragleave.prevent="dragLeaveField($event, groupIndex, fieldIndex)"
                    @drop.prevent="dropField($event, groupIndex, fieldIndex)"
                    @dragstart.stop="dragStartField($event, groupIndex, fieldIndex)"
                  >
                    <v-combobox
                      :label="fieldItem.type || 'text'"
                      :value="fieldItem.name"
                      :items="headers"
                      :error-messages="fieldItem.isRequired ? [$t('Required')] : []"
                      prepend-icon="drag_indicator"
                      append-outer-icon="edit"
                      @click:append-outer="editField(groupIndex, fieldIndex)"
                      @change="changeName($event, groupIndex, fieldIndex)"
                    />
                  </div>
                </template>
                <v-btn block outline color="primary" @click="addField(groupIndex)">
                  <v-icon>add</v-icon>
                </v-btn>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex
            xs12
            md4
            d-flex
          >
            <v-sheet
              class="d-flex dropzone-group"
              color="grey lighten-3"
            >
              <v-layout fill-height column justify-center align-center>
                <v-btn icon @click="addGroup()">
                  <v-icon>add</v-icon>
                </v-btn>
              </v-layout>
            </v-sheet>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <v-dialog v-model="showDialogCreate" max-width="500">
      <v-card>
        <v-card-title>
          {{ $t('CreateFromData') }}
        </v-card-title>
        <v-card-text>
          {{ $t('CreateFromDataText') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn flat color="primary" @click.stop="showDialogCreate=false">
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn flat color="primary" @click.stop="create()">
            {{ $t('Create') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showDialogCreateCopy" max-width="500">
      <v-form ref="form" @submit.prevent>
        <v-card>
          <v-card-title>
            {{ $t('CreateCopy') }}
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
            <v-btn color="primary" flat @click="showDialogCreateCopy=false">
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              dark
              type="submit"
              color="primary"
              @click="createCopy()"
            >
              {{ $t('CreateCopy') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog v-model="showFieldDialog" max-width="500" scrollable>
      <v-card>
        <v-card-title class="title">
          {{ fieldName }}
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-checkbox
            v-model="fieldIsRequired"
            :label="$t('Required')"
          />
          <v-combobox
            v-model="fieldColumn"
            :items="headers"
            :label="$t('ColumnName')"
            clearable
            item-text="text"
            return-object
            @change="changeColumn"
          />
          <v-autocomplete
            v-model="fieldType"
            :items="['boolean','email','date','number','radio','select','text','textarea','timestamp','url']"
            :label="$t('FieldType')"
          />
          <div v-show="['radio','select'].indexOf(fieldType) !==-1">
            <v-toolbar card dense>
              <v-toolbar-title>
                {{ $t('LookupValues') }}
              </v-toolbar-title>
              <v-spacer />
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn icon @click.stop="getDistinct(fieldColumn)" v-on="on">
                    <v-icon>autorenew</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('AutoGenerate') }}</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn icon @click.stop="addValue()" v-on="on">
                    <v-icon>add</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('Add') }}</span>
              </v-tooltip>
            </v-toolbar>
            <draggable v-model="fieldValues">
              <v-text-field
                v-for="(value,index) in fieldValues"
                :key="index"
                :value="value"
                prepend-icon="drag_indicator"
                append-outer-icon="close"
                @input="fieldValueInput($event, index)"
                @click:append-outer="removeValue(index)"
              />
            </draggable>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn flat color="primary" @click.stop="removeField()">
            {{ $t('Delete') }}
          </v-btn>
          <v-btn flat color="primary" @click.stop="showFieldDialog=false">
            {{ $t('Close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
      </v-form>
    </v-dialog>
  </v-app>
</template>

<script>
import client from '~/plugins/feathers-client'
import draggable from 'vuedraggable'
import service from '~/plugins/feathers-service.js'
import mainDrawer from '~/components/main-drawer'
import mainToolbar from '~/components/main-toolbar'
import { mapState, mapGetters } from 'vuex'
export default {
  components: { mainDrawer, mainToolbar, draggable },
  middleware: ['auth', 'forms'],
  head() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      drawer: null,
      showFieldDialog: false,
      showDialogCreate: false,
      showDialogCreateCopy: false,
      currentGroupIndex: null,
      currentFieldIndex: null,
      headers: [],
      name: null,
      requiredRules: [v => !!v || this.$t('Required')]
    }
  },
  computed: {
    ...mapGetters('forms', ['current']),
    ...mapState('databases', {
      databases(state) {
        return state.list.filter((item) => {
          return item.organizationId === this.current.organizationId
        })
      }
    }),
    title() {
      return this.$t(this.$store.state.title)
    },
    header() {
      return this.$store.state.organizations.current.name
    },
    formName: {
      get() {
        return this.current.name
      },
      set(name) {
        this.$store.dispatch('forms/patch', [this.$route.params.id, { name }])
      }
    },
    databaseId: {
      get() {
        return this.current.databaseId
      },
      set(databaseId) {
        this.$store.dispatch('forms/patch', [this.$route.params.id, { databaseId }])
      }
    },
    groups: {
      get() {
        return this.current.doc.groups || []
      },
      set(value) {
        this.$store.dispatch('forms/patch', [this.$route.params.id, { doc: { ...this.current.doc, groups: value } }])
      }
    },
    group: {
      get() {
        return this.currentGroupIndex !== null && this.groups.length > this.currentGroupIndex ? this.groups[this.currentGroupIndex] : { name: null, fields: [] }
      },
      set(group) {
        const groups = [ ...this.groups ]
        groups.splice(this.currentGroupIndex, 1, group)
        this.groups = groups
      }
    },
    fields: {
      get() {
        return this.group.fields
      },
      set(fields) {
        this.group = { ...this.group, fields }
      }
    },
    field: {
      get() {
        return this.currentFieldIndex !== null && this.fields.length > this.currentFieldIndex ? this.fields[this.currentFieldIndex] : { name: null, column: null, type: 'text', required: false, values: [] }
      },
      set(field) {
        const fields = [ ...this.fields ]
        fields.splice(this.currentFieldIndex, 1, field)
        this.fields = fields
      }
    },
    fieldName: {
      get() {
        return this.field.name
      },
      set(name) {
        this.field = { ...this.field, name }
      }
    },
    fieldColumn: {
      get() {
        return this.field.column
      },
      set(column) {
        this.field = { ...this.field, column }
      }
    },
    fieldType: {
      get() {
        return this.field.type
      },
      set(type) {
        if (['radio', 'select'].indexOf(type) === -1) {
          this.field = { ...this.field, type, values: null }
        } else {
          this.field = { ...this.field, type }
        }
      }
    },
    fieldIsRequired: {
      get() {
        return this.field.isRequired
      },
      set(isRequired) {
        this.field = { ...this.field, isRequired }
      }
    },
    fieldValues: {
      get() {
        return this.field.values || []
      },
      set(values) {
        this.field = { ...this.field, values }
      }
    }
  },
  async fetch({ store, params }) {
    service('forms')(store)
    service('databases')(store)
    const form = await store.dispatch('forms/get', params.id)
    await store.dispatch('databases/find', {
      query: {
        organizationId: form.organizationId,
        $limit: -1
      }
    })
    store.commit('title', 'Form')
  },
  async mounted() {
    if (this.current.databaseId) {
      const id = this.current.databaseId
      const res = await client.service('indices').get(id)
      if (res.hasOwnProperty(id) && res[id].hasOwnProperty('mappings') && res[id].mappings.hasOwnProperty('docs') && res[id].mappings.docs.hasOwnProperty('properties')) {
        this.headers = Object.keys(res[id].mappings.docs.properties).map((key) => {
          return { text: key, type: res[id].mappings.docs.properties[key].type }
        })
      }
    }
  },
  created() {
    service('forms')(this.$store)
    service('databases')(this.$store)
  },
  methods: {
    addGroup() {
      this.groups = [...this.groups, { name: null, fields: [] }]
    },
    removeGroup(index) {
      this.groups = this.groups.filter((item, index2) => index !== index2)
    },
    addValue() {
      const values = this.field.values || []
      this.fieldValues = [...values, null]
    },
    removeValue(index) {
      this.fieldValues = this.fieldValues.filter((item, index2) => index !== index2)
    },
    addField(groupIndex) {
      const group = { ...this.groups[groupIndex] }
      const fields = [ ...group.fields, { name: null, column: null, type: 'text', required: false, values: [] } ]
      const groups = [...this.groups]
      groups.splice(groupIndex, 1, { ...group, fields })
      this.groups = groups
    },
    editField(groupIndex, fieldIndex) {
      this.currentGroupIndex = groupIndex
      this.currentFieldIndex = fieldIndex
      this.showFieldDialog = true
    },
    removeField() {
      this.showFieldDialog = false
      this.fields = this.fields.filter((item, index2) => this.currentFieldIndex !== index2)
      this.currentFieldIndex = null
      this.currentGroupIndex = null
    },
    saveFieldDialog() {
      const groups = [...this.groups]
      const group = { ...groups[this.currentGroupIndex] }
      const fields = [...group.fields]
      fields.splice(this.currentFieldIndex, 1, this.field)
      group.fields = fields
      groups.splice(this.currentGroupIndex, 1, group)
      this.groups = groups
      this.showFieldDialog = false
      this.currentGroupIndex = null
      this.currentFieldIndex = null
    },
    editGroup(index) {
      this.currentGroupIndex = index
      this.groupName = this.groups[this.currentGroupIndex].name
      this.showGroupDialog = true
    },
    saveGroupDialog() {
      const groups = [...this.groups]
      groups.splice(this.currentGroupIndex, 1, { ...this.groups[this.currentGroupIndex], name: this.groupName })
      this.groups = groups
      this.showGroupDialog = false
      this.$refs.groupForm.reset()
      this.currentGroupIndex = null
    },

    dragEnterGroup(e, index) {
      e.dataTransfer.dropEffect = 'move'
    },
    dragLeaveGroup(e, index) {
      e.dataTransfer.dropEffect = 'move'
    },
    dragStartGroup(e, groupIndex) {
      e.dataTransfer.setData('data', JSON.stringify({ type: 'group', groupIndex }))
      e.dropEffect = 'move'
    },
    dropGroup(e, index) {
      const data = JSON.parse(e.dataTransfer.getData('data'))
      if (data.type === 'group') {
        const groups = [...this.groups]
        groups.splice(index, 0, groups.splice(data.groupIndex, 1)[0])
        this.groups = groups
      } else if (data.type === 'field') {
        if (index === data.groupIndex) {
          const groups = [...this.groups]
          const group = { ...groups[index] }
          const fields = [...group.fields]
          const field = fields.splice(data.fieldIndex, 1)[0]
          fields.push(field)
          group.fields = fields
          groups.splice(index, 1, group)
          this.groups = groups
        } else {
          const groups = [...this.groups]
          const fromGroup = { ...groups[data.groupIndex] }
          const toGroup = { ...groups[index] }
          const fromFields = [...fromGroup.fields]
          const toFields = [...toGroup.fields]

          const field = fromFields.splice(data.fieldIndex, 1)[0]
          fromGroup.fields = fromFields
          groups.splice(data.groupIndex, 1, fromGroup)

          toFields.push(field)
          toGroup.fields = toFields
          groups.splice(index, 1, toGroup)
          this.groups = groups
        }
      }
    },
    dragEnterField(e, groupIndex, fieldIndex) {
      e.dataTransfer.dropEffect = 'move'
    },
    dragLeaveField(e, groupIndex, fieldIndex) {
      e.dataTransfer.dropEffect = 'move'
    },
    dragStartField(e, groupIndex, fieldIndex) {
      e.dataTransfer.setData('data', JSON.stringify({ type: 'field', groupIndex, fieldIndex }))
      e.dropEffect = 'move'
    },
    dropField(e, groupIndex, fieldIndex) {
      const data = JSON.parse(e.dataTransfer.getData('data'))
      if (data.type === 'field') {
        e.stopPropagation()
        if (groupIndex === data.groupIndex) {
          const groups = [...this.groups]
          const group = { ...groups[groupIndex] }
          const fields = [...group.fields]
          fields.splice(fieldIndex, 0, fields.splice(data.fieldIndex, 1)[0])
          group.fields = fields
          groups.splice(groupIndex, 1, group)
          this.groups = groups
        } else {
          const groups = [...this.groups]
          const fromGroup = { ...groups[data.groupIndex] }
          const toGroup = { ...groups[groupIndex] }
          const fromFields = [...fromGroup.fields]
          const toFields = [...toGroup.fields]

          const field = fromFields.splice(data.fieldIndex, 1)[0]
          fromGroup.fields = fromFields
          groups.splice(data.groupIndex, 1, fromGroup)
          toFields.splice(fieldIndex, 0, field)
          toGroup.fields = toFields
          groups.splice(groupIndex, 1, toGroup)
          this.groups = groups
        }
      }
    },
    fieldValueInput(value, index) {
      const fieldValues = [...this.fieldValues]
      fieldValues.splice(index, 1, value)
      this.fieldValues = fieldValues
    },
    inputGroupName(name, index) {
      this.currentGroupIndex = index
      this.group = { ...this.group, name }
    },

    create() {
      this.groups = [{
        fields: this.headers.map((item) => {
          return {
            name: item.text,
            column: item.text,
            type: ['byte', 'short', 'integer', 'long', 'double', 'float', 'half_float', 'scaled_float'].indexOf(item.type) === -1 ? item.type : 'number'
          }
        })
      }]
      this.showDialogCreate = false
    },
    async createCopy() {
      if (this.$refs.form.validate()) {
        await this.$store.dispatch('forms/create', {
          name: this.name,
          organizationId: this.current.organizationId,
          databaseId: this.current.databaseId,
          doc: this.current.doc
        })
        this.showDialogCreateCopy = false
        this.$refs.form.reset()
      }
    },
    changeName(value, groupIndex, fieldIndex) {
      this.currentGroupIndex = groupIndex
      this.currentFieldIndex = fieldIndex
      if (typeof value === 'object') {
        this.field = { ...this.field, name: value.text, column: value.text, type: value.type }
      } else {
        this.fieldName = value
      }
    },
    changeColumn(value) {
      this.fieldType = value.type
    },
    showCreateCopy() {
      this.showDialogCreateCopy = true
      this.$nextTick(() =>
        this.$refs.focus.$el.getElementsByTagName('input')[0].focus()
      )
    },
    async getDistinct(value) {
      const id = this.current.databaseId
      let res = await client.service('indices').get(id)
      if (res.hasOwnProperty(id) && res[id].hasOwnProperty('mappings') && res[id].mappings.hasOwnProperty('docs') && res[id].mappings.docs.hasOwnProperty('properties') && res[id].mappings.docs.properties.hasOwnProperty(this.fieldColumn)) {
        const field = res[id].mappings.docs.properties[this.fieldColumn]

        res = await client.service(`es/${id}`).find({
          query: {
            $distinct: `${this.fieldColumn}${field.hasOwnProperty('fields') && field.fields.hasOwnProperty('keyword') ? '.keyword' : ''}`
          }
        })
        if (res.hasOwnProperty('aggregations')) {
          this.fieldValues = res.aggregations.values.buckets.map((item) => {
            return item.key
          })
        }
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
.group-enter-left
  border-left 2px solid
.group-enter-right
  border-right 2px solid
.dropzone-group
  min-height 400px
.dropzone-field
  min-height 56px
</style>
