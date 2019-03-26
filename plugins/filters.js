import Vue from 'vue'
Vue.filter('date', function (value) {
  if (!value) return ''
  return new Date(value).toLocaleString()
})
