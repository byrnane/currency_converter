//vendor libs
import Vue from 'vue'
import VueResource from 'vue-resource'

//main App entry point
import App from './app'

//app router
import { createRouter } from './router'

//plugins init
Vue.use(VueResource)

export function createApp() {
  const router = createRouter();

  const app = new Vue({
    router,
    render: h => h(App)
  });

  return { app, router };
}
