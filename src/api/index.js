import Vue from 'vue'

let token = `f9774bebccdd429abbbbc01d634c0a6e`

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
