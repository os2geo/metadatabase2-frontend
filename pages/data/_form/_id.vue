<template>
  <v-app>
    <v-content class="accent lighten-5">
      <v-form ref="form">
        <v-container grid-list-md fluid>
          <v-layout row wrap>
            <v-flex
              v-for="(groupItem, groupIndex) in groups"
              :id="`group-${groupIndex}`"
              :key="groupIndex"
              :class="infoClass"
              xs12
              sm6
              md4
              lg3
              xl2
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
                        :readonly="$store.state.auth.payload===null"
                        @input="change($event, fieldItem)"
                      />
                      <v-text-field
                        v-if="fieldItem.type==='url'"
                        v-model="doc[fieldItem.column]"
                        :label="fieldItem.name"
                        :required="fieldItem.isRequired"
                        :rules="fieldItem.isRequired ? [v => !!v || $t('Required')] : []"
                        :readonly="$store.state.auth.payload===null"
                        type="url"
                        append-outer-icon="launch"
                        @click:append-outer="openLink(fieldItem)"
                        @input="change($event, fieldItem)"
                      />
                      <v-textarea
                        v-if="fieldItem.type==='textarea'"
                        v-model="doc[fieldItem.column]"
                        :label="fieldItem.name"
                        :required="fieldItem.isRequired"
                        :rules="fieldItem.isRequired ? [v => !!v || $t('Required')] : []"
                        :readonly="$store.state.auth.payload===null"
                        @input="change($event, fieldItem)"
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
                        :readonly="$store.state.auth.payload===null"
                        @change="change($event, fieldItem)"
                      />
                      <v-checkbox
                        v-if="fieldItem.type==='boolean'"
                        v-model="doc[fieldItem.column]"
                        :label="fieldItem.name"
                        :required="fieldItem.isRequired"
                        :rules="fieldItem.isRequired ? [v => !!v || $t('Required')] : []"
                        :readonly="$store.state.auth.payload===null"
                        @change="change($event, fieldItem)"
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
                          :readonly="$store.state.auth.payload===null"
                          no-title
                          @input="menus[fieldIndex] = false"
                          @change="change($event, fieldItem)"
                        />
                      </v-menu>
                      <v-radio-group
                        v-if="fieldItem.type==='radio'"
                        v-model="doc[fieldItem.column]"
                        :mandatory="false"
                        :label="fieldItem.name"
                        :required="fieldItem.isRequired"
                        :rules="fieldItem.isRequired ? [v => !!v || $t('Required')] : []"
                        :readonly="$store.state.auth.payload===null"
                        @change="change($event, fieldItem)"
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
      </v-form>
    </v-content>
  </v-app>
</template>

<script>
import client from '~/plugins/feathers-client'
import service from '~/plugins/feathers-service.js'
import { mapState } from 'vuex'
export default {
  middleware: ['search'],
  data() {
    return {
      menus: {},
      requiredRules: [v => !!v || this.$t('Required')],
      color: null,
      snackbarTitle: null,
      snackbarBody: null,
      snackbar: false
    }
  },
  computed: {
    ...mapState('forms', {
      form(state) {
        return state.current.doc
      }
    }),
    groups() {
      return this.form.groups
    },
    locale() {
      const l = this.$i18n.locales.find((item) => {
        return item.code === this.$i18n.locale
      })
      return l ? l.iso : 'da-DK'
    },
    infoClass() {
      if (this.$store.state.maximize) {
        return 'md4 lg3'
      }
      return ''
    }
  },

  async asyncData({ store, params }) {
    const doc = await client.service(`es/${store.state.forms.current.databaseId}`).get(params.id)
    store.state.forms.current.doc.groups.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.type === 'date' && doc.hasOwnProperty(field.column) && doc[field.column] !== null && doc[field.column].length >= 10) {
          doc[field.column] = doc[field.column].substr(0, 10)
        }
      })
    })
    return {
      doc
    }
  },
  created() {
    service('forms')(this.$store)
  },
  mounted() {
    this.$refs.form.validate()
  },
  methods: {
    openLink(field) {
      window.open(this.doc[field.column], '_blank')
    },
    async change(value, item) {
      this.snackbar = false
      if (this.$refs.form.validate()) {
        if (item.type === 'date') {
          value = new Date(value)
        }
        this.form.groups.forEach((group) => {
          group.fields.forEach((field) => {
            if (field.type === 'timestamp') {
              this.doc[field.column] = (new Date()).toISOString()
            }
          })
        })
        const { _meta, ...data } = { ...this.doc,
          [item.column]: value
        }
        try {
          await client.service(`es/${this.$store.state.forms.current.databaseId}`).update(this.$route.params.id, data)
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
    }
  }
}
</script>

<style>

</style>
