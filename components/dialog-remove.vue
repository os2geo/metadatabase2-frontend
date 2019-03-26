<template>
  <v-dialog v-model="show" persistent max-width="500">
    <v-card>
      <v-card-title>
        <div class="headline">
          {{ `${$t('DeleteSelected')}?` }}
        </div>
      </v-card-title>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" flat="flat" @click.stop="show=false">
          {{ $t('Cancel') }}
        </v-btn>
        <v-btn color="primary" dark @click.stop="$emit('remove')">
          {{ $t('Delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    show: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  }
}
</script>
