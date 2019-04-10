<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    offset-y
  >
    <v-layout slot="activator" :class="`justify-${value.align}`" @click.stop="menu=true">
      <v-icon
        v-show="showFilterIcon"
        small
        color="accent"
      >
        filter_list
      </v-icon>

      <span>{{ value.text }}</span>
      <v-icon
        v-show="sortBy===value.value"
        small
      >
        {{ sorting.descending?'arrow_downward':'arrow_upward' }}
      </v-icon>
    </v-layout>
    <v-card>
      <v-list dense>
        <v-subheader>
          {{ $t('Order') }}
        </v-subheader>
        <v-list-tile
          :value="sortBy!==value.value"
          @click="sort(null)"
        >
          <v-list-tile-content>
            {{ $t('None') }}
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          :value="sortBy===value.value && sorting.descending===false"
          @click="sort(false)"
        >
          <v-list-tile-content>
            {{ $t('Ascending') }}
          </v-list-tile-content>
          <v-list-tile-action>
            <v-icon small>
              arrow_upward
            </v-icon>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile
          :value="sortBy===value.value && sorting.descending===true"
          @click="sort(true)"
        >
          <v-list-tile-content>
            {{ $t('Descending') }}
          </v-list-tile-content>
          <v-list-tile-action>
            <v-icon small>
              arrow_downward
            </v-icon>
          </v-list-tile-action>
        </v-list-tile>
        <v-divider />
      </v-list>

      <v-card-text class="pt-0">
        <v-autocomplete
          v-if="isSelect"
          v-model="filter"
          :label="$t('Select')"
          :items="value.lookup"
          :disabled="disableFilter"
          clearable
          multiple
          menu-props="closeOnContentClick"
        />
        <v-select
          v-if="value.type === 'boolean'"
          v-model="filter"
          :label="$t('Select')"
          :items="[{ text: $t('True'), value: true }, { text: $t('False'), value: false }]"
          :disabled="disableFilter"
          clearable
        />
        <v-text-field
          v-if="['text','textarea'].indexOf(value.type) !== -1 && !isSelect"
          v-model="filter"
          :label="$t('Text')"
          :disabled="disableFilter"
          clearable
        />
        <v-text-field
          v-if="value.type === 'number'"
          v-model.number="filter"
          :label="$t('Number')"
          :disabled="disableFilter"
          clearable
        />
        <v-menu
          v-if="value.type === 'time'"
          ref="menuFrom"
          v-model="menuFrom"
          :close-on-content-click="false"
          :return-value.sync="from"
          full-width
          max-width="290"
        >
          <v-text-field
            slot="activator"
            v-model="from"
            clearable
            :label="$t('FromTime')"
            readonly
          />
          <v-time-picker
            v-if="menuFrom"
            v-model="from"
            full-width
            @click:minute="$refs.menuFrom.save(from)"
          />
        </v-menu>
        <v-menu
          v-if="value.type === 'time'"
          ref="menuTo"
          v-model="menuTo"
          :close-on-content-click="false"
          :return-value.sync="to"
          full-width
          max-width="290"
        >
          <v-text-field
            slot="activator"
            v-model="to"
            clearable
            :label="$t('ToTime')"
            readonly
          />
          <v-time-picker
            v-if="menuTo"
            v-model="to"
            full-width
            @click:minute="$refs.menuTo.save(to)"
          />
        </v-menu>
        <v-menu
          v-if="['date', 'timestamp'].indexOf(value.type) !== -1"
          v-model="menuFrom"
          :close-on-content-click="false"
          full-width
          max-width="290"
        >
          <v-text-field
            slot="activator"
            v-model="from"
            clearable
            :label="$t('FromDate')"
            readonly
          />
          <v-date-picker
            v-model="from"
            no-title
            locale="da-DK"
            @change="menuFrom = false"
          />
        </v-menu>
        <v-menu
          v-if="['date', 'timestamp'].indexOf(value.type) !== -1"
          v-model="menuTo"
          :close-on-content-click="false"
          full-width
          max-width="290"
        >
          <v-text-field
            slot="activator"
            v-model="to"
            clearable
            :label="$t('ToDate')"
            readonly
          />
          <v-date-picker
            v-model="to"
            no-title
            locale="da-DK"
            @change="menuTo = false"
          />
        </v-menu>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn flat color="primary" @click="menu=false">
          {{ $t('Close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    },
    sorting: {
      type: Object,
      default: () => {
        return {}
      }
    },
    disableFilter: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      menu: false,
      menuFrom: null,
      menuTo: null
    }
  },
  computed: {
    sortBy: {
      get() {
        return this.sorting.name
      },
      set(value) {
        this.$emit('update:sortBy', value)
      }
    },
    descending: {
      get() {
        return this.sorting.descending
      },
      set(value) {
        this.$emit('update:descending', value)
      }
    },
    isSelect() {
      return this.value.lookup && this.value.lookup.length > 0
    },
    from: {
      get() {
        return (this.value.filter && this.value.filter.from) || null
      },
      set(value) {
        if (value) {
          this.filter = { ...this.filter, ...{ from: value } }
        } else if (this.filter.hasOwnProperty('from')) {
          const { from, ...filter } = this.filter
          this.filter = Object.keys(filter).length > 0 ? filter : null
        }
      }
    },
    to: {
      get() {
        return (this.value.filter && this.value.filter.to) || null
      },
      set(value) {
        if (value) {
          this.filter = { ...this.filter, ...{ to: value } }
        } else if (this.filter.hasOwnProperty('to')) {
          const { to, ...filter } = this.filter
          this.filter = Object.keys(filter).length > 0 ? filter : null
        }
      }
    },
    filter: {
      get() {
        return this.value.filter
      },
      set(value) {
        this.$emit('update:filter', value)
        this.$emit('update:query')
      }
    },
    showFilterIcon() {
      return this.filter && this.filter !== null && this.filter.length > 0
    }
  },
  methods: {
    sort(descending) {
      if (descending === null) {
        this.sortBy = null
      } else {
        this.sortBy = this.value.value
      }
      this.descending = descending
      this.menu = false
      this.$emit('update:query')
    }
  }
}
</script>
