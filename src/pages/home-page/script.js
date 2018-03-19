import api from '../../api/'
import _ from 'lodash'
import moment from 'moment'
import LineChart from '../../components/lineChart'
import Vue from 'vue'

export default {
	name: 'home-page',
    components: {
        LineChart,
    },
	data: function () {
		return {
            allCurrencies: {},
            currencyRates: {},
            defaultCurrencyRate: '',
            selectedBaseCurrency: 'USD',
            selectedTargetCurrency: 'RUB',
            searchCurrenciesRequest: '',
            defaultCurrencyAmount: 1,
            chartDataCollection: null,
            chartOptions: {
                responsive: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            maxTicksLimit: 6,
                        }
                    }]
                }
            },
            chartStep: 30,
            chartPoints: 10,
            chartLabels: [],
            historycalRates: [],
            isChartReady: false,
            errors: [],
        }
    },

    computed: {
        searchedCurrencies: function () {
            let reg = new RegExp(this.searchCurrenciesRequest,'i')
            return _.pickBy(this.allCurrencies, function(value, key) {
                return reg.test(key) || reg.test(value)
            })
        },
        isEmptyCurrencies: function () {
            return _.isEmpty(this.allCurrencies)
        },
        isEmptyRates: function () {
            return _.isEmpty(this.currencyRates)
        },
        isErrors: function () {
            return !_.isEmpty(this.errors)
        },
        baseAmount: {
            get: function () {
                return _.round(this.defaultCurrencyAmount * this.currencyRates[this.selectedBaseCurrency], 2)
                //return _.round(this.defaultCurrencyAmount * this.currencyRates[this.selectedBaseCurrency], 2).toString().split('').reverse().join('')
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

    mounted () {
        api.getCurrencies()
            .then((response) => {
                this.allCurrencies = _.clone(response.data)
            }, (error) => {
                console.log(error)
                this.errors.push(error)
            })
        api.getCurrenciesRates()
            .then((response) => {
                this.defaultCurrencyRate = response.data.base
                this.currencyRates = _.clone(response.data.rates)
            }, (error) => {
                console.log(error)
                this.errors.push(error)
            })

        document.addEventListener('click', () => {
            this.closeAllPopups()
        })

        this.closeAllPopups = function () {
            this.searchCurrenciesRequest = ''
            for (let popup of document.querySelectorAll('.popup')) {
                popup.classList.remove('open')
            }
        }

        this.openSearchPopup = function (target, event) {
            this.closeAllPopups()
            document.getElementById(target).classList.add('open')
        }
        this.closeSearchPopup = function (target) {
            this.searchCurrenciesRequest = ''
            document.getElementById(target).classList.remove('open')
        }

        this.reloadPage = function (event) {
            document.location.reload(true)
        }

        for (let i = this.chartPoints - 1; i >= 0; i--) {
            let date = moment().subtract(this.chartStep * i, 'days').format('YYYY-MM-DD')
            this.chartLabels.push(moment(date).format('DD.MM.YYYY'))
            api.getHistoricalRates(date)
                .then((response) => {
                    this.historycalRates.push(response.data)
                    if (this.historycalRates.length === this.chartPoints) {
                        this.historycalRates.sort((a, b) => {
                            return a.timestamp - b.timestamp
                        })
                        this.fillChartData()
                        this.isChartReady = true
                    }
                }, (error) => {
                    console.log(error)
                       this.errors.push(error)
                })
        }
    },

    methods: {
        popupClickHandler: function (event) {
            event.stopPropagation()
        },
        swapCurrencies: function () {
            let tmp = this.selectedBaseCurrency
            this.selectedBaseCurrency = this.selectedTargetCurrency
            this.selectedTargetCurrency = tmp
        },
        fillChartData () {
            let data = []
            for (let i = 0; i < this.chartPoints; i++) {
                let value = 1 / this.historycalRates[i].rates[this.selectedBaseCurrency] * this.historycalRates[i].rates[this.selectedTargetCurrency]
                data.push(_.round(value, 4))
            }
            this.chartDataCollection = {
                labels: this.chartLabels,
                datasets: [
                    {
                        label: `${this.selectedBaseCurrency} · ${this.allCurrencies[this.selectedBaseCurrency]} / ${this.selectedTargetCurrency} · ${this.allCurrencies[this.selectedTargetCurrency]}`,
                        backgroundColor: '#3498db',
                        data: data,
                    }
                ]
            }
        },
    },

    watch: {
        selectedBaseCurrency: function (n, o) {
            this.fillChartData()
        },
        selectedTargetCurrency: function (n, o) {
            this.fillChartData()
        },
    },

};
