//libs
import Vue from 'vue'
import VueRouter from 'vue-router'

//app pages
import homePage from './pages/home-page/home-page'

//router plugins
Vue.use(VueRouter)

//routes list
const routes = [
    {
        name: 'home',
        path: '/',
        component: homePage,
    },

    //служебные роуты
    {
        name: 'global_redirect',
        path: '*',
        redirect: {
            name: 'home'
        },
        meta: {
            type: 'service',
        },
    },
]

//export router object
export default new VueRouter({
    routes,
    mode: 'history',
})
