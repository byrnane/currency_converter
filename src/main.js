//vendor libs
import Vue from 'vue'
import VueResource from 'vue-resource'

//main App entry point
import app from './app'

//app router
import router from './router'

//plugins init
Vue.use(VueResource)

//app init
new Vue({
  router,
  el: '#app',
  template: '<app/>',
  components: { app }
});

