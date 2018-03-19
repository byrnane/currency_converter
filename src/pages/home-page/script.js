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
            allCurrencies: {},              //список всех валют
            currencyRates: {},              //список всех рейтов относительно базовой валюты (USD)
            defaultCurrencyRate: '',        //собственно та самая базовая валюта
            selectedBaseCurrency: 'USD',    //выбранная пользователем "левая" валюта
            selectedTargetCurrency: 'RUB',  //выбранная пользователем "правая" валюта
            searchCurrenciesRequest: '',    //строка для поиска по валютам
            defaultCurrencyAmount: 1,       //количество базовой валюты
            chartDataCollection: null,      //данные для построения графика, инициализируются в коде ниже
            chartOptions: {                 //опции для построения графика
                responsive: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            maxTicksLimit: 6,
                        }
                    }]
                }
            },
            chartStep: 30,                  //шаг в днях при выборке дат для построения графика
            chartPoints: 10,                //кол-во точек в графике
            chartLabels: [],                //лейблы по оси Y в графике (даты)
            historycalRates: [],            //исторические данные по валютам для построения графика
            isChartReady: false,            //флаг готовности графика
            errors: [],                     //список ошибок при работе с API
        }
    },

    computed: {
        //список отфильтрованных валют для автокомплита
        searchedCurrencies: function () {
            let reg = new RegExp(this.searchCurrenciesRequest,'i')
            return _.pickBy(this.allCurrencies, function(value, key) {
                return reg.test(key) || reg.test(value)
            })
        },

        //флаги состояния данных
        isEmptyCurrencies: function () {
            return _.isEmpty(this.allCurrencies)
        },
        isEmptyRates: function () {
            return _.isEmpty(this.currencyRates)
        },
        isErrors: function () {
            return !_.isEmpty(this.errors)
        },

        //значения валют с динамическим пересчетем и простой валидацией
        baseAmount: {
            get: function () {
                return _.round(this.defaultCurrencyAmount * this.currencyRates[this.selectedBaseCurrency], 2)
            },
            set: function (newValue) {
                this.defaultCurrencyAmount = newValue.toString().replace(/[^.0-9]/gim,'') / this.currencyRates[this.selectedBaseCurrency]
            }
        },
        targetAmount: {
            get: function () {
                return _.round(this.defaultCurrencyAmount * this.currencyRates[this.selectedTargetCurrency], 2)
            },
            set: function (newValue) {
                this.defaultCurrencyAmount = newValue.toString().replace(/[^.0-9]/gim,'') / this.currencyRates[this.selectedTargetCurrency]
            }
        },
    },

    methods: {
        //вспомогательная функция для предотвращения закрытия попапов при клике по ним
        popupClickHandler: function (event) {
            event.stopPropagation()
        },

        //функция для перемены местами валют
        swapCurrencies: function () {
            let tmp = this.selectedBaseCurrency
            this.selectedBaseCurrency = this.selectedTargetCurrency
            this.selectedTargetCurrency = tmp
        },

        //функция заполнения данных для графика
        fillChartData () {
            //заполнение значений (пересчет относительно базовой валюты)
            let data = []
            for (let i = 0; i < this.chartPoints; i++) {
                let value = 1 / this.historycalRates[i].rates[this.selectedBaseCurrency] * this.historycalRates[i].rates[this.selectedTargetCurrency]
                data.push(_.round(value, 4))
            }
            //формирование итогового объекта данных
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

    //слежение за изменением выбранных валют для перерисовки графика
    watch: {
        selectedBaseCurrency: function (n, o) {
            this.fillChartData()
        },
        selectedTargetCurrency: function (n, o) {
            this.fillChartData()
        },
    },

    mounted () {
        //закрытие попапа при клике вне его
        document.addEventListener('click', () => {
            this.closeAllPopups()
        })

        //функция закрытия всех попапов на странице по классу .popup
        this.closeAllPopups = function () {
            //так же осуществляет сброс строки поиска для автокомплита
            this.searchCurrenciesRequest = ''
            for (let popup of document.querySelectorAll('.popup')) {
                popup.classList.remove('open')
            }
        }

        //хэндлеры для открытия/закрытия нужного попапа с ID target
        this.openSearchPopup = function (target, event) {
            this.closeAllPopups()
            document.getElementById(target).classList.add('open')
        }
        this.closeSearchPopup = function (target) {
            this.searchCurrenciesRequest = ''
            document.getElementById(target).classList.remove('open')
        }

        //вспомогательная функция для перезагрузки страницы
        this.reloadPage = function (event) {
            document.location.reload(true)
        }

        //получение валют и рейтов из API
        //список валют может браться из кэша
        if (localStorage.getItem('currencies_cache')) {
            this.allCurrencies = JSON.parse(localStorage.getItem('currencies_cache'))
        } else {
            api.getCurrencies()
                .then((response) => {
                    this.allCurrencies = _.clone(response.data)
                    //кэширование списка валют
                    localStorage.setItem('currencies_cache', JSON.stringify(this.allCurrencies))
                }, (error) => {
                    console.log(error)
                    //ошибки складываются в массив и выводятся на странице
                    this.errors.push(error)
                })
        }
        //рейты не кэшируются по понятным причинам ;)
        //шучу, на самом деле на бесплатном тарифе API они обновляются только раз в час
        //и мы имеем timestamp последнего обновления
        //так что их тоже закэшируем!
        let _self = this
        if (localStorage.getItem('rates_expires') && localStorage.getItem('rates_cache') && localStorage.getItem('rates_expires') > moment().utc().unix()) {
            this.currencyRates = JSON.parse(localStorage.getItem('rates_cache'))
            //запрос данных в начале следующего часа
            setTimeout(() => {
                getCurrencies(_self)
                //следующая сложная и длинная строчка просто вычисляет, сколько ждать до начала следующего часа + 1 минута
            }, (moment().utc().add(1, 'hours').startOf('hour').unix() - moment().utc().unix()) * 1000 + 60000)
        } else {
            getCurrencies(_self)
        }

        function getCurrencies (_self) {
            api.getCurrenciesRates()
                .then((response) => {
                    _self.defaultCurrencyRate = response.data.base
                    _self.currencyRates = _.clone(response.data.rates)
                    //кэшируем рейты
                    localStorage.setItem('rates_cache', JSON.stringify(_self.currencyRates))
                    localStorage.setItem('rates_expires', moment.unix(response.data.timestamp).utc().add(1, 'hours').unix())
                    //функция получения данных реккурсивно вызывает себя в начале следующего часа
                    setTimeout(() => {
                        getCurrencies(_self)
                    }, (moment().utc().add(1, 'hours').startOf('hour').unix() - moment().utc().unix()) * 1000 + 60000)
                }, (error) => {
                    console.log(error)
                    _self.errors.push(error)
                })
        }

        //получение исторических данных для построения графика
        //проверяем наличие данных в кэше и их актуальность
        if (localStorage.getItem('historical_expires') && localStorage.getItem('historical_cache') && localStorage.getItem('historical_labels') && localStorage.getItem('historical_expires') > moment().utc().unix()) {
            this.historycalRates = JSON.parse(localStorage.getItem('historical_cache'))
            this.chartLabels = JSON.parse(localStorage.getItem('historical_labels'))
            this.fillChartData()
            this.isChartReady = true
        } else {
            for (let i = this.chartPoints - 1; i >= 0; i--) {
                //определяем дату для вызова нужного URL
                let date = moment().utc().subtract(this.chartStep * i, 'days').format('YYYY-MM-DD')
                this.chartLabels.push(moment(date).format('DD.MM.YYYY'))
                api.getHistoricalRates(date)
                    .then((response) => {
                        //заполняем массив в произвольном порядке
                        this.historycalRates.push(response.data)
                        //проверяем, заполнен ли массив
                        if (this.historycalRates.length === this.chartPoints) {
                            //если заполнен - сортируем его по timestamp
                            this.historycalRates.sort((a, b) => {
                                return a.timestamp - b.timestamp
                            })
                            //кэшируем до начала следующего дня
                            localStorage.setItem('historical_expires', moment().utc().add(1, 'days').startOf('day').unix())
                            localStorage.setItem('historical_cache', JSON.stringify(this.historycalRates))
                            localStorage.setItem('historical_labels', JSON.stringify(this.chartLabels))
                            //и заполняем данные для графика
                            this.fillChartData()
                            this.isChartReady = true
                        }
                    }, (error) => {
                        console.log(error)
                            this.errors.push(error)
                    })
            }
        }
    },
};
