import Vue from 'vue'

let token = `18162d42621246e599db4534ba76721d`

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
