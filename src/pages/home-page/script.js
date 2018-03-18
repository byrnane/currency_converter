import api from '../../api/'
import _ from 'lodash'

export default {
	name: 'home-page',

	data: function () {
		return {
            allCurrencies: {},
            currencyRates: {},
            defaultCurrencyRate: '',
            selectedBaseCurrency: 'USD',
            selectedTargetCurrency: 'RUB',
            searchCurrenciesRequest: '',
            defaultCurrencyAmount: 1,
            scrollOptions: {
                vBar: {
                    background: '#34495e',
                    opacity: 0.5,
                },
                vRail: {
                    background: '#34495e',
                    opacity: 0.2,
                },
            },
        }
    },

    computed: {
        searchedCurrencies: function () {
            let reg = new RegExp(this.searchCurrenciesRequest,'i')
            return _.pickBy(this.allCurrencies, function(value, key) {
                return reg.test(key) || reg.test(value)
            })
        },
        baseAmount: {
            get: function () {
                return _.round(this.defaultCurrencyAmount * this.currencyRates[this.selectedBaseCurrency], 2);
            },
            set: function (newValue) {
                this.defaultCurrencyAmount = newValue / this.currencyRates[this.selectedBaseCurrency]
            }
        },
        targetAmount: {
            get: function () {
                return _.round(this.defaultCurrencyAmount * this.currencyRates[this.selectedTargetCurrency], 2);
            },
            set: function (newValue) {
                this.defaultCurrencyAmount = newValue / this.currencyRates[this.selectedTargetCurrency]
            }
        },
    },

    created () {
        api.getCurrencies()
            .then((response) => {
                this.allCurrencies = _.clone(response.data)
            }, (error) => {
                console.log(error)
            })
        api.getCurrenciesRates()
            .then((response) => {
                this.defaultCurrencyRate = response.data.base
                this.currencyRates = _.clone(response.data.rates)
            }, (error) => {
                console.log(error)
            })
        document.addEventListener('click', () => {
            this.searchCurrenciesRequest = ''
            document.getElementById('basePopup').classList.remove('open')
            document.getElementById('targetPopup').classList.remove('open')
        })
    },

    methods: {
        openSearchPopup: function (target, event) {
            event.stopPropagation()
            document.getElementById(target).classList.add('open')
        },
        closeSearchPopup: function (target) {
            this.searchCurrenciesRequest = ''
            document.getElementById(target).classList.remove('open')
        },
        popupClickHandler: function (event) {
            event.stopPropagation()
        },
        swapCurrencies: function () {
            let tmp = this.selectedBaseCurrency
            this.selectedBaseCurrency = this.selectedTargetCurrency
            this.selectedTargetCurrency = tmp
            // let tmpAmount = this.baseAmount
            // this.baseAmount = this.targetAmount
            // this.targetAmount = tmpAmount
        },
    }

};
