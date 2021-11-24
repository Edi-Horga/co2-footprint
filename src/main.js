import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import '@/mixins/generalMixin'

Vue.config.productionTip = false
Vue.prototype.$urlAPI = 'https://i4ts8g99z3.execute-api.eu-central-1.amazonaws.com/prod'
Vue.prototype.scopeCategories = ['Scope 1', 'Scope 2', 'Scope 1 & Scope 2', 'MWh']

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
