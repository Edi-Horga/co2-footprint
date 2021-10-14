import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import '@/mixins/generalMixin'

Vue.config.productionTip = false
Vue.prototype.$urlAPI = 'https://2s3ds132y9.execute-api.eu-central-1.amazonaws.com/prod'

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
