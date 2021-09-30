<template>
<div id="app" >
  <v-app id="inspire">
    <v-container fluid class="mx-0 px-0">
          <v-col cols="12" sm="12"> 
            <v-row  justify="center" dense class="mb-n6 mt-n2">
                <div style="margin-top: 5px;">
                    <h3>{{location}}</h3>
                </div>
                <div  style="width: 400px; margin-left: 10px;">
                    <v-text-field
                        id="datepicker"
                        dense
                        outlined
                        prepend-inner-icon="mdi-calendar"
                    ></v-text-field>
                </div>
                <div style="width: 150px; margin-left: 10px;">
                    <v-autocomplete
                    v-model="periodFilter"
                    :items="periodFilters"
                    dense
                    small
                    outlined
                    prepend-inner-icon="mdi-filter"
                    ></v-autocomplete>
                </div>
                <div style="width: 170px; margin-left: 10px;">
                    <v-btn
                        v-if="this.isBtnActive"
                        rounded
                        block
                        dark
                        color="#D7004B"
                        @click="showValues()"
                        class="loadBtn"
                    >
                    Load Data
                    </v-btn>
                    <div class="text-center">
                        <v-progress-circular
                        v-if="this.isSpinnerActive"
                        :size="50"
                        :width="6"
                        color="#D7004B"
                        indeterminate
                        center
                        ></v-progress-circular>
                    </div>
                </div>
            </v-row>
            <v-row justify="center">
              <v-col cols="12" sm="10" class="px-2 pt-0 mx-5">
                <v-card 
                    v-if="this.isChartActive"
                    class="lx-auto my-auto overflow-y-auto overflow-x-hidden"
                    outlined
                    height="71vh"
                    style="scrollbar-width: thin;"
                    ref="card"
                >
                  <v-card-text class="pt-0 px-2 pb-3">
                    <div>
                      <span class="float-sm-left" >Total energy consumption:</span><span class="float-sm-right"  style="color:rgb(215, 0, 75, 1);font-weight:bold;float-right">{{ this.totalEnergyConsumed.toLocaleString()}} kWh </span>
                    </div>
                    <br>
                    <div>
                      <span class="float-sm-left" >Total carbon dioxide:</span><span class="float-sm-right" style="color:rgb(215, 0, 75, 1);font-weight:bold">{{ (this.totalEnergyConsumed * this.co2Factor / 1000).toFixed(2).toLocaleString() }} metric tons CO2e </span>
                    </div>
                  </v-card-text>
                  <br>
                  <v-divider/>
                  <LineChart  :energyValues="energyValues" :timeValues="timeValues" :location="this.location"/>
                  <v-divider/>
                  <v-row justify="center">
                    <v-card
                        class="mt-6 mb-2"
                        outlined
                    >
                      <PieChart :energyValues="subEnergyValues" :labelValues="subCategoryValues" :category="plantCategories[0]"/>
                    </v-card>
                    <v-card
                      class="mt-6 mb-2"
                      outlined
                    >
                      <PieChart :energyValues="departmentEnergyValues" :labelValues="departmentValues" :category="plantCategories[1]"/>
                    </v-card>
                  </v-row>
                  <v-row justify="center">
                    <v-card
                      class="mb-2"
                      outlined
                    >
                      <PieChart :energyValues="machineEnergyValues" :labelValues="machineValues" :category="plantCategories[2]"/>
                    </v-card>
                  </v-row>
                  <br>
                  <v-divider/>
                  <v-row  justify="center" class="mt-6">
                    <div style="margin-left: 5px; width: 200px;">
                      <v-select
                        v-model="selectedPlantCategories"
                        :items= plantCategories
                        :menu-props="{ maxHeight: '400' }"
                        label="Category"
                        dense
                        persistent-hint
                        outlined
                        @change="checkFilter"
                      >
                      </v-select>
                    </div>
                    <div style="margin-right: 5px; margin-left: 5px; width: 400px;">
                      <v-autocomplete
                        v-model="selectedFilterCateg"
                        :items= filterCateg
                        :menu-props="{ maxHeight: '400' }"
                        label="Filter by:"
                        dense
                        persistent-hint
                        outlined
                        prepend-inner-icon="mdi-filter"
                        
                      >
                      </v-autocomplete>
                    </div>
                    <div style="margin-right: 5px; width: 50px;">
                    <v-btn
                      v-if="this.isBtnActive2"
                      rounded
                      color="#4B4B46"
                      dark
                      block
                      class="loadBtn"
                      @click="filterData()"
                    >
                      <v-icon
                        medium
                        color="white"
                      >
                        mdi-magnify
                      </v-icon>
                    </v-btn>
                      <div class="text-center">
                          <v-progress-circular
                          v-if="this.isSpinnerActive2"
                          :size="25"
                          :width="4"
                          color="#4B4B46"
                          indeterminate
                          center
                          ></v-progress-circular>
                      </div>
                    </div>
                  </v-row>
                  <v-divider/>
                  <LineChart v-if="isFilteredChart" :energyValues="filteredEnergyValues" :timeValues="filteredValues" :location="selectedFilterCateg"/>
                  <v-divider/>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
      <v-row>

        <v-btn v-if="this.isChartActive" fab dark small color="#4B4B46" fixed left bottom @click="downloadFile"> 
          <v-icon
            medium
            color="white"
            >
            mdi-arrow-collapse-down
          </v-icon>
        </v-btn>

        <div class="text-center ma-2">
          <v-snackbar
            v-model="snackbar"
            color="#D7004B"
            timeout=7000
          >
            {{ this.errorMessage }}
      
            <template v-slot:action="{ attrs }">
              <v-btn
                color="white"
                text
                v-bind="attrs"
                @click="snackbar = false"
              >
                Close
              </v-btn>
            </template>
          </v-snackbar>
        </div>
    
      </v-row>

    </v-container>
  </v-app>
</div>
</template>

<script>
  import axios from 'axios'
  import flatpickr from "flatpickr"
  import LineChart from '../components/LineChart.vue'
  import PieChart from '../components/PieChart.vue'
  //import localforage from 'localforage'


  require("flatpickr/dist/flatpickr.min.css")
  require("flatpickr/dist/themes/material_green.css")

  const pako = require('pako')

  export default {
    name: 'LocationDetail',
    mounted() {

      document.getElementsByClassName('v-tabs-slider')[0].style.backgroundColor = "white"

      this.location = this.$route.params.loc_name.replace(/_/g, ' ')

      if (localStorage.getItem("loc_detailed_time_filter") !== null ){
          this.periodFilter = localStorage.getItem("loc_detailed_time_filter")
      } else {
          this.periodFilter = "Hour"
      }

      if ( localStorage.getItem("global_fp") !== null ) {
        this.defaultDates = localStorage.getItem("global_fp")
        this.defaultDates = this.defaultDates.split(",")
        this.defaultDates[0] = new Date(this.defaultDates[0])
        this.defaultDates[1] = new Date(this.defaultDates[1])
      } else {
        this.defaultDates = [ new Date((new Date()).setMonth((new Date()).getMonth() - 6)),new Date() ]
      }

      this.fp =flatpickr('#datepicker', {
        enableTime: true,
        altInput: true,
        altFormat: "F j, Y H:i",
        dateFormat: "Y-m-d H:i",
        mode: "range",
        defaultDate: this.defaultDates
      })

      this.fp.selectedDates = this.defaultDates
      //avoid Lambda function cold-start
      this.showValues()
    },
    methods: {

      async downloadFile(){
        let jsonData
        let csv = "COUNTRY,LOCATION,MACHINE,INFRASTRUCTURE,DEPARTMENT,DATE,ENERGY-VALUE\n"
        var FileSaver = require('file-saver')
        //await localforage.getItem('db_data_location').then( value => {jsonData = value})

        for (const i of jsonData[0]) {
          csv += `${this.selectedCountries},${this.selectedLocations},${i[4]},${i[0]},${i[3]},${i[2]},${i[1]}\n`
        }
        var blob = new Blob([csv], {type: "application/csv"})
        FileSaver.saveAs(blob, `${this.selectedCountries}_${this.selectedLocations}_${this.period[0]}-${this.period[1]}.csv`)
      },

      async filterData() {

        this.isBtnActive2 = false 
        this.isSpinnerActive2 = true
        this.totalFilteredEnergyConsumed = 0
        this.isFilteredChart = false
        this.filteredEnergyValues = []
        this.filteredValues = []
        this.period = []

        localStorage.setItem("loc_detailed_categ", this.selectedPlantCategories)
        localStorage.setItem("loc_detailed_categ_filter", this.selectedFilterCateg)
        let dbCateg = ''

        if (this.selectedPlantCategories == "Infrastructure") {
          dbCateg = "subcategory"
        } else if (this.selectedPlantCategories == "Department") {
          dbCateg = "area"
        } else {
          dbCateg = "tag_name"
        }

        this.fpSetPeriod()

        await axios({ method: "GET", 
          "url": "https://2s3ds132y9.execute-api.eu-central-1.amazonaws.com/prod/tracker/co2-filter-categories",
          "params": {categ: dbCateg, input_categ: this.selectedFilterCateg, c: "date", i: this.location, df: this.period[0], dt: this.period[1], pf: this.periodFilter}, 
          "headers": { "content-type": "application/json" } })
        .then( (result) => {
          this.response = result.data
          this.response = pako.inflate(Buffer.from(this.response, 'base64'), { to: 'string' })
          this.response = JSON.parse(this.response)

          this.filteredValues = this.response[0]
          this.filteredEnergyValues = this.response[1]

          this.isFilteredChart = true
         
        })
        .catch( (error) => {
          if (error.response) {
          this.errorMessage = error.response.data.message
          this.snackbar = true

          }
        })
        this.isBtnActive2 = true 
        this.isSpinnerActive2 = false
        //this.$refs.card.$el.goTo(999)
        //this.$vuetify.goTo(999)
         this.$refs.card.$el.scrollTop = this.$refs.card.$el.scrollHeight
        
      },
      checkFilter(x){
        if (x == "Infrastructure") {
          this.filterCateg = this.subCategoryValues
        } else if ( x == "Department") {
          this.filterCateg = this.departmentValues
        } else if ( x == "Machine (Top 10)") {
          this.filterCateg = this.machineValues
        }
      },

     fpSetPeriod() {
        for (let item of this.fp.selectedDates) {
            if (item.getMinutes().toString().length == 1) {
            this.minutes = `0${item.getMinutes()}`
            } else {
            this.minutes = item.getMinutes()
            }
            if (item.getMonth().toString().length == 1) {
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

            this.period.push(`${item.getUTCFullYear()}-${this.months}-${this.dates} ${item.getHours()}:${this.minutes}`)
        }
     },

     async showValues() {

        this.period = []
        this.timeValues = []
        this.energyValues = []
        this.subCategoryValues = []
        this.subEnergyValues = []
        this.departmentValues = []
        this.departmentEnergyValues = []
        this.machineValues = []
        this.machineEnergyValues = []
        this.selectedPlantCategories = []
        this.selectedFilterCateg = ''
        this.filterCateg = []

        this.configLineChart = {}
        this.totalEnergyConsumed = 0
        this.totalFilteredEnergyConsumed = 0
        this.isChartActive = false
        this.isBtnActive = false 
        this.isSpinnerActive = true

        if (this.fp.selectedDates.length == 2) {
            localStorage.setItem("global_fp", this.fp.selectedDates)
        }
        localStorage.setItem("loc_detailed_time_filter", this.periodFilter)

        if (this.selectedCountries == 'Germany') { this.co2Factor = 0.3786}
        
        this.fpSetPeriod()

        await Promise.all([
            axios({ method: "GET", 
                        "url": "https://2s3ds132y9.execute-api.eu-central-1.amazonaws.com/prod/tracker/co2-location-detail", 
                        "params": {c: "date", i: this.location, df: this.period[0], dt: this.period[1], pf: this.periodFilter}, 
                        "headers": { "content-type": "application/json" } }),
            axios({ method: "GET", 
                        "url": "https://2s3ds132y9.execute-api.eu-central-1.amazonaws.com/prod/tracker/co2-location-detail", 
                        "params": {c: "subcategory", i: this.location, df: this.period[0], dt: this.period[1], pf: ''},  
                        "headers": { "content-type": "application/json" } }),
            axios({ method: "GET", 
                        "url": "https://2s3ds132y9.execute-api.eu-central-1.amazonaws.com/prod/tracker/co2-location-detail", 
                        "params": {c: "area", i: this.location, df: this.period[0], dt: this.period[1], pf: ''}, 
                        "headers": { "content-type": "application/json" } }),
            axios({ method: "GET", 
                        "url": "https://2s3ds132y9.execute-api.eu-central-1.amazonaws.com/prod/tracker/co2-location-detail", 
                        "params": {c: "tag_name", i: this.location, df: this.period[0], dt: this.period[1], pf: ''}, 
                        "headers": { "content-type": "application/json" } })
        ])
            .then( results => {

            this.response = results[0].data

            //decompress gzip response
            this.response = pako.inflate(Buffer.from(this.response, 'base64'), { to: 'string' })
            this.response = JSON.parse(this.response)

            this.timeValues = this.response[0]
            this.energyValues = this.response[1]

            console.log(this.timeValues)
            console.log(this.energyValues)
            this.response = results[1].data

            //decompress gzip response
            this.response = pako.inflate(Buffer.from(this.response, 'base64'), { to: 'string' })
            this.response = JSON.parse(this.response)

            this.subCategoryValues = this.response[0]
            this.subEnergyValues = this.response[1]

            this.response = results[2].data

            //decompress gzip response
            this.response = pako.inflate(Buffer.from(this.response, 'base64'), { to: 'string' })
            this.response = JSON.parse(this.response)

            this.departmentValues = this.response[0]
            this.departmentEnergyValues = this.response[1]

            this.response = results[3].data

            //decompress gzip response
            this.response = pako.inflate(Buffer.from(this.response, 'base64'), { to: 'string' })
            this.response = JSON.parse(this.response)

            let sortedArray = []
            for (var i = 0; i < this.response[0].length; i++) {
                sortedArray.push({machine: this.response[0][i], value: this.response[1][i]})
            }
            this.sortArray(sortedArray, "value")
            sortedArray = sortedArray.slice(0,10)

            for (let item of sortedArray) {
                this.machineValues.push(item.machine)
                this.machineEnergyValues.push(item.value)
            }

            for (const i of this.energyValues ) {
                this.totalEnergyConsumed += i
            }

            this.isChartActive = true
            this.isFilteredChart = false
            this.isBtnActive = true 
            this.isSpinnerActive = false

            }).catch( error => {
                if (error.response) {
                this.errorMessage = error.response.data.message
                this.snackbar = true
                this.isBtnActive = true 
                this.isSpinnerActive = false
                }
            })

        if (localStorage.getItem("loc_detailed_categ") !== null && localStorage.getItem("loc_detailed_categ_filter") !== null  ){
            this.selectedPlantCategories = localStorage.getItem("loc_detailed_categ")
            this.selectedFilterCateg = localStorage.getItem("loc_detailed_categ_filter")
            this.checkFilter(this.selectedPlantCategories)
            //this.filterData()
        }

        this.timeValues = null
        this.energyValues = 
        //this.subCategoryValues = null
        this.subEnergyValues = null
        //this.departmentValues = null
        this.departmentEnergyValues = null
        //this.machineValues = null
        this.machineEnergyValues = null
        this.response = null
        }
    },
    data () {
      return {
        defaultDates: [],
        co2Factor: 0.542,
        totalEnergyConsumed: 0,
        totalFilteredEnergyConsumed: 0,
        isSpinnerActive: false,
        isSpinnerActive2: false,
        isChartActive: false,
        isBtnActive: true,
        isBtnActive2: true,
        isFilteredChart: false,

        sumEnergyValues: 0,
        subSumEnergyValues: [],
        departmentSumEnergyValues:0,

        subEnergyValues: [],
        departmentEnergyValues: [],

        subCategoryValues: [],
        energyValues: [],
        timeValues: [],
        departmentValues: [],

        machineValues: [],
        machineSumEnergyValues: 0,
        machineEnergyValues: [],

        errorMessage : '',
        snackbar : false,
        response: '',
        period: [],
        minutes: '',
        months:'',
        dates:'',
        fp: {},
        dateValue: '',

        periodFilter: '',
        periodFilters: ['Year', 'Month', 'Week', 'Day', 'Hour'],
        location: '',

        plantCategories: ['Infrastructure', 'Department', 'Machine (Top 10)'],
        selectedPlantCategories:'',
        selectedFilterCateg: '',
        filterCateg: [],
        filteredValues: [],
        filteredEnergyValues: [],

      
      }
    },
    components: {
      LineChart,
      PieChart
    }
  }
</script>

<style scoped>

.loadBtn {
  margin-bottom: 25px !important;
  background-color: #4B4B46; 
}

.v-select >>> label {
  font-size: 0.85em;
}
.v-text-field >>> input {
  font-size: 0.85em;
}
#datepickerRow {
  margin-top: -30px;
}
#btnRow {
  margin-top: -30px;
}
.v-text-field--outlined >>> fieldset {
  border-color: #4B4B46;
}
.v-select >>> .primary--text {
  color: #D7004B !important;
}
.v-application .primary--text {
  color: #D7004B !important;
}
.v-list >>> .v-list-item--link:before{
  background-color: #D7004B !important;
}

.v-list >>> .v-list-item--active {  
  color: #4B4B46  !important;
}

</style>
