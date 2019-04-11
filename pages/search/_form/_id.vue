<template>
  <v-container grid-list-md fluid>
    <v-layout row wrap>
      <v-flex
        v-for="(groupItem, groupIndex) in groups"
        :id="`group-${groupIndex}`"
        :key="groupIndex"
        xs12
        sm6
        md6
        d-flex
      >
        <v-card>
          <v-card-title>
            {{ groupItem.name }}
          </v-card-title>
          <v-card-text>
            <template v-for="(fieldItem, fieldIndex) in groupItem.fields">
              <div
                :key="fieldIndex"
              >
                {{ fieldItem }}
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import client from '~/plugins/feathers-client'
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState('forms', {
      form(state) {
        return state.current.doc
      }
    }),
    groups() {
      return this.form.groups
    }
  },
  async asyncData({ store, params }) {
    const doc = await client.service(`es/${store.state.forms.current.databaseId}`).get(params.id)
    console.log(doc)
    return {
      doc
    }
  }
}
</script>

<style>

</style>
