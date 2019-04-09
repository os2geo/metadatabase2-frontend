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
        <v-layout row wrap>
          <div
            v-for="(group, groupIndex) in groups"
            :key="groupIndex"
            class="flex xs12 md4 d-flex"
          >
            <v-card
              draggable
              @dragover.prevent
              @dragenter.prevent="dragEnterGroup"
              @dragleave.prevent="dragLeaveGroup"
              @drop.prevent="dropGroup($event, group, groupIndex)"
              @dragstart="dragStartGroup($event, group)"
            >
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
          </div>
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
import mainDrawer from '~/components/main-drawer'
import mainToolbar from '~/components/main-toolbar'

export default {
  components: { mainDrawer, mainToolbar },

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
      groups: [
        { name: 'a', fields: [ { name: 'a1' }, { name: 'a2' } ] },
        { name: 'b', fields: [ { name: 'b1' }, { name: 'b2' } ] },
        { name: 'c', fields: [ { name: 'c1' }, { name: 'c2' } ] }
      ]
    }
  },
  computed: {
    title() {
      return this.$t(this.$store.state.title)
    },
    header() {
      return 'drag'
    }
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
    },
    dragStartGroup(e, group) {
      console.log('dragStart')
      e.dataTransfer.setData('group', JSON.stringify(group))
      // e.dropEffect = 'move'
    },
    dragEnterGroup(e) {
      e.dataTransfer.dropEffect = 'move'
      /*
      if (e.target.nodeName === 'TH') {
        e.target.classList.add('accent')
        e.target.classList.add('lighten-4')
      }
      */
    },
    dragLeaveGroup(e) {
      e.dataTransfer.dropEffect = 'move'
      /*
      if (e.toElement.nodeName !== 'DIV' && e.fromElement.nodeName === 'TH') {
        e.target.classList.remove('accent')
        e.target.classList.remove('lighten-4')
      }
      */
    },
    dropGroup(e, group, index) {
      const source = e.dataTransfer.getData('group')
      console.log(source)
    }
  }
}
</script>
<style lang="stylus" scoped>
.min-height
  min-height 400px
</style>
