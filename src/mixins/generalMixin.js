import Vue from 'vue'
import axios from 'axios'

const pako = require('pako')

Vue.mixin({
    methods: {
        
        sortArray(arr,prop){
            arr.sort((a,b)=>{
                if(typeof a[prop] ==='string')
                return b[prop].localeCompare(a[prop])
                return b[prop] - a[prop]
            })
        },

        async loadData(c, i, x) {

            this.period = []
            this.totalKgCo2 = 0
            this.totalEnergyConsumed = 0
            
            this.isBtnActive = false 
            this.isSpinnerActive = true
            this.isChartActive = false
    
            if (this.fp.selectedDates.length == 2) {
              localStorage.setItem("global_fp", this.fp.selectedDates)
            }
            if (x == "region1") {
                if ( this.region != '' ) {
                    localStorage.setItem("region_reg", this.region)
                }
            } else if (x == "country1") {
                if (this.country != '') {
                    localStorage.setItem("country_co", this.country)
                }
            } else if (x == "location1") {
                if (this.location != '') {
                    localStorage.setItem("location_loc", this.location)
                }
            }

    
    
            for (let item of this.fp.selectedDates) {
                if (item.getMinutes().toString().length == 1) {
                    this.minutes = `0${item.getMinutes()}`
                } else {
                    this.minutes = item.getMinutes()
                }
                if (item.getMonth().toString().length == 1 && item.getMonth().toString() != '9') {
                    this.months = item.getMonth() + 1
                    this.months = `0${this.months}`
                } else {
                    this.months = item.getMonth() +1
                }
                if (item.getDate().toString().length == 1) {
                    this.dates = `0${item.getDate()}`
                } else {
                    this.dates = item.getDate()
                }
                this.period.push(`${item.getUTCFullYear()}-${this.months}-01`)
            }

            this.params = {
                c: c,
                i: i,
                df: this.period[0],
                dt: this.period[1]
            }
            
            await Promise.all([
                axios({ method: "GET", 
                            "url": `${this.$urlAPI}/tracker/co2-map-mwh`, 
                            //"data": this.payload,
                            "params": this.params,  
                            "headers": { "content-type": "application/json" } }),
                axios({ method: "GET", 
                            "url": `${this.$urlAPI}/tracker/co2-map-total-kg`, 
                            "params": this.params, 
                            "headers": { "content-type": "application/json" } }),
                axios({ method: "GET", 
                            "url": `${this.$urlAPI}/tracker/co2-map-distribution-scope1`, 
                            "params": this.params,
                            "headers": { "content-type": "application/json" } }),
                axios({ method: "GET", 
                            "url": `${this.$urlAPI}/tracker/co2-map-distribution-scope2`, 
                            "params": this.params,  
                            "headers": { "content-type": "application/json" } })
            ])
                .then( results => {
                let arr = []
                this.response = results[0].data
    
                this.response = pako.inflate(Buffer.from(this.response, 'base64'), { to: 'string' })
                this.response = JSON.parse(this.response)
                
                for ( let i of this.response[0]){
                  this.timeValues.push(i.substring(0,7))
                }
    
                this.energyValues = this.response[1]
    
                for (const i of this.energyValues ) {
                    this.totalEnergyConsumed += i
                }
    
                this.totalKgCo2 = results[1].data[0]
                this.distributionRegionsValues = results[1].data[1]
                this.distributionRegionsEnergyCO2 = results[1].data[2]
                this.distributionRegionsEnergyMWh = results[1].data[3]
    
                arr.push(this.response)
                this.response = results[2].data
    
                this.response = pako.inflate(Buffer.from(this.response, 'base64'), { to: 'string' })
                this.response = JSON.parse(this.response)
    
                this.scope1Labels = this.response[0]
                this.scope1Values = this.response[1]
    
                arr.push(this.response)
                this.response = results[3].data
    
                this.response = pako.inflate(Buffer.from(this.response, 'base64'), { to: 'string' })
                this.response = JSON.parse(this.response)
    
                this.scope2Labels = this.response[0]
                this.scope2Values = this.response[1]
    
                arr.push(this.response)
                localStorage.setItem("dwl_csv_obj", JSON.stringify(arr))
                if (x == "region1") {
                    this.cardRegion = this.region
                } else if (x == "country1") {
                    this.cardCountry = this.country
                } else if (x == "location1") {
                    this.cardLocation = this.location
                }
                
                this.isChartActive = true
                this.isBtnActive = true 
                this.isSpinnerActive = false
                this.response = null
                arr = null
    
    
                }).catch( error => {
                    if (error.response) {
                    this.errorMessage = error.response.data.message
                    this.snackbar = true
                    this.isBtnActive = true 
                    this.isSpinnerActive = false
                    }
                })
              
            this.timeValues = []
            this.energyValues = []
            this.distributionRegionsValues = []
            this.distributionRegionsEnergy = []
            this.distributionRegionsEnergyCO2 = []
            this.distributionRegionsEnergyMWh = []
    
        }   
    }
  })