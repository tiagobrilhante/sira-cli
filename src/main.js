import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from '@/store'
import vuetify from '@/plugins/vuetify'
import Vuelidate from 'vuelidate'
import http from './http'
import VueMask from 'di-vue-mask'
import moment from 'moment-timezone'
import VueToastr from 'vue-toastr'
import config from './http/config'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all'
import '@mdi/font/css/materialdesignicons.min.css'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import VueEditor from 'vue2-editor'
import './registerServiceWorker'
import VueApexCharts from 'vue-apexcharts'

Vue.use(VueApexCharts)
Vue.component('apexchart', VueApexCharts)
Vue.use(Vuelidate)

Vue.prototype.moment = moment

Vue.use(VueToastr, {
  defaultTimeout: 3000,
  defaultProgressBar: true,
  defaultCloseOnHover: true,
  clickClose: true
})

Vue.use(VueMask)
Vue.use(VueEditor)
Vue.config.productionTip = false
Vue.prototype.$http = http
Vue.prototype.$configSis = config
new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
