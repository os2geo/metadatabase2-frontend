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
        <v-list-tile :to="localePath({ name: 'organizations-id-users', params: $route.params })" active-class="primary white--text" nuxt>
          <v-list-tile-title>{{ $t('Users') }}</v-list-tile-title>
        </v-list-tile>
        <v-list-tile :to="localePath({ name: 'organizations-id-groups', params: $route.params })" active-class="primary white--text" nuxt>
          <v-list-tile-title>{{ $t('Groups') }}</v-list-tile-title>
        </v-list-tile>
        <v-list-tile :to="localePath({ name: 'organizations-id-databases', params: $route.params })" active-class="primary white--text" nuxt>
          <v-list-tile-title>{{ $t('Databases') }}</v-list-tile-title>
        </v-list-tile>
        <v-list-tile :to="localePath({ name: 'organizations-id-forms', params: $route.params })" active-class="primary white--text" nuxt>
          <v-list-tile-title>{{ $t('Forms') }}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </main-drawer>
    <main-toolbar v-model="drawer" />
    <v-content>
      <v-container fluid grid-list-md>
        <draggable v-model="groups">
          <v-layout row wrap>
            <v-flex
              v-for="(group, groupIndex) in groups"
              :key="groupIndex"
              xs12
              md4
              d-flex
              class="draggable"
            >
              <v-card>
                <v-layout>
                  <v-btn icon @click="showGroupDialogMethod(groupIndex)">
                    <v-icon small>
                      edit
                    </v-icon>
                  </v-btn>
                  <v-card-title>
                    {{ group.name || $t('Group') }}
                  </v-card-title>
                </v-layout>
                <v-card-text>
                  <template v-for="(field, fieldIndex) in group.fields">
                    <v-layout :key="fieldIndex">
                      <v-btn icon>
                        <v-icon small>
                          edit
                        </v-icon>
                      </v-btn>
                      <v-text-field :label="field.name || 'Name'" />
                    </v-layout>
                  </template>
                  <v-sheet
                    class="d-flex"
                    color="grey lighten-3"
                  >
                    <v-layout fill-height column justify-center align-center>
                      <v-btn icon @click="addField(groupIndex)">
                        <v-icon>add</v-icon>
                      </v-btn>
                    </v-layout>
                  </v-sheet>
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn flat color="primary" @click="removeGroup(groupIndex)">
                    {{ $t('Delete') }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-flex>
            <v-flex
              xs12
              md4
              d-flex
            >
              <v-sheet
                class="d-flex min-height"
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
        </draggable>
      </v-container>
    </v-content>
    <v-dialog v-model="showGroupDialog" max-width="500">
      <v-form ref="groupForm" @submit.prevent>
        <v-card>
          <v-card-title>
            {{ $t('EditGroup') }}
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="groupName" :label="$t('Name')" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn flat color="primary" @click="showGroupDialog=false">
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn type="submit" flat color="primary" @click="saveGroupDialog()">
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-app>
</template>

<script>
import draggable from 'vuedraggable'
import service from '~/plugins/feathers-service.js'
import mainDrawer from '~/components/main-drawer'
import mainToolbar from '~/components/main-toolbar'
import { mapGetters } from 'vuex'
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
      showGroupDialog: false,
      currentGroupIndex: null,
      groupName: null,
      options: {
        dropzoneSelector: '.layout',
        draggableSelector: '.draggable',
        handlerSelector: null,
        reactivityEnabled: true,
        multipleDropzonesItemsDraggingEnabled: true,
        showDropzoneAreas: true,
        onDrop: function (event) {},
        onDragstart: function (event) {},
        onDragend: function (event) {}
      }
    }
  },
  computed: {
    ...mapGetters('forms', ['current']),
    title() {
      return this.$t(this.$store.state.title)
    },
    header() {
      return this.$store.state.organizations.current.name
    },
    groups: {
      get() {
        return this.current.doc.groups || []
      },
      set(value) {
        console.log(value)
        this.$store.dispatch('forms/patch', [this.$route.params.id, { doc: { ...this.current.doc, groups: value } }])
      }
    }
  },
  async fetch({ store, params }) {
    service('forms')(store)
    const form = await store.dispatch('forms/get', params.id)
    store.commit('title', form.name)
  },
  created() {
    service('forms')(this.$store)
  },
  methods: {
    addGroup() {
      this.groups = [...this.groups, { name: null, fields: [] }]
    },
    removeGroup(index) {
      const groups = [...this.groups]
      groups.splice(index, 1)
      this.groups = groups
    },
    addField(groupIndex) {
      const group = { ...this.groups[groupIndex] }
      const fields = [ ...group.fields, { name: null } ]
      const groups = [...this.groups]
      groups.splice(groupIndex, 1, { ...group, fields })
      this.groups = groups
    },
    showGroupDialogMethod(index) {
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
    }
  }
}
</script>
<style lang="stylus" scoped>
.min-height
  min-height 400px
</style>
