import Vue from 'vue'

let token = `b7c3836f8d984f3ebd43c15cfd665940`

export default {
    getCurrencies(){
        return Vue.http.get(`https://openexchangerates.org/api/currencies.json`)
    },
    getCurrenciesRates(){
        return Vue.http.get(`https://openexchangerates.org/api/latest.json`, {params: {app_id: token}})
    }
}
