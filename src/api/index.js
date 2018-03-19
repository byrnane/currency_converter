import Vue from 'vue'

let token = `cd60ca4021274268b35c15fbc7855ec6`

export default {
    getCurrencies(){
        return Vue.http.get(`https://openexchangerates.org/api/currencies.json`)
    },
    getCurrenciesRates(){
        return Vue.http.get(`https://openexchangerates.org/api/latest.json`, {params: {app_id: token}})
    },
    getHistoricalRates(date){
        return Vue.http.get(`https://openexchangerates.org/api/historical/${date}.json`, {params: {app_id: token}})
    },
}
