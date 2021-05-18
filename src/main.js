import Vue from 'vue'
import App from './App.vue'
import router from "./router"

import Amplify, * as AmplifyModules from 'aws-amplify'
import { AmplifyPlugin } from 'aws-amplify-vue'
import config from './aws-exports'
Amplify.configure(config)

Vue.use(AmplifyPlugin, AmplifyModules)
Vue.config.productionTip = false

import VueCookies from 'vue-cookies'
Vue.use(VueCookies)

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
