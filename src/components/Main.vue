<template>
<div id="app">
  <v-app id="inspire">
    <v-container fluid>
      <v-row align="center">
        <v-col
          cols="12"
          sm="3"
        >
          <v-btn v-if="this.isChartActive" fab dark medium color="#4B4B46" fixed left bottom @click="downloadFile"> 
            <v-icon
              medium
              color="white"
            >
              mdi-arrow-collapse-down
            </v-icon>
          </v-btn>
        </v-col>
        <v-col
          cols="12"
          sm="2"
        > 
          <v-select
            v-model="selectedRegions"
            :items="regions"
            label="Region" 
            persistent-hint
            @change="checkRegion"
            outlined
            dense
          >
          </v-select>
         
        </v-col>
        <v-col
          cols="12"
          sm="2"
        >
          <v-select
            v-model="selectedCountries"
            :items="countries"
            :menu-props="{ maxHeight: '400' }"
            label="Country"
            persistent-hint
            outlined
            @change="checkCountry"
            dense               
          >
           </v-select>
        </v-col>
        <v-col
          cols="12"
          sm="2"
        >
          <v-select
            v-model="selectedLocations"
            :items="locations"
            :menu-props="{ maxHeight: '400' }"
            label="Location"
            dense
            persistent-hint
            outlined
          >
          </v-select>
        </v-col>
      </v-row>
      <v-row id="datepickerRow">
        <v-col
          cols="12"
          sm="3"
        ></v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            
            id="datepicker"
            label="From:"
            dense
            outlined
            prepend-inner-icon="mdi-calendar"
          ></v-text-field>
        </v-col>

      </v-row>
      <v-row id="btnRow">
        <v-col
          cols="12"
          sm="3"
        ></v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-btn
            v-if="this.isBtnActive"
            rounded
            block
            dark
            color="#D7004B"
            @click="showValues(regions, countries, locations)"
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
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="1"></v-col>
        <v-col cols="12" sm="10">
          <div v-if="this.isChartActive">
            <v-card
              class="mx-auto my-12"
              max-width="1700"
              outlined
            >
              <v-card-title>{{ this.payload.location }}</v-card-title>
              <v-divider/>
              <v-card-text>
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
              <LineChart  :energyValues="energyValues" :timeValues="timeValues" :location="payload.location"/>
              <v-divider/>
              <v-row>
                <v-card
                  class="mr-auto my-12 ml-3"
                  max-width="400"
                  outlined
                >
                  <PieChart :energyValues="subEnergyValues" :labelValues="subCategoryValues" :category="plantCategories[0]"/>
                </v-card>
                <v-card
                  class="ml-auto my-12 mr-3"
                  max-width="400"
                  outlined
                >
                  <PieChart :energyValues="departmentEnergyValues" :labelValues="departmentValues" :category="plantCategories[1]"/>
                </v-card>
                <v-card
                  class="ml-auto my-12 mr-3"
                  max-width="400"
                  outlined
                >
                  <PieChart :energyValues="machineEnergyValues" :labelValues="machineValues" :category="plantCategories[2]"/>
                </v-card>
              </v-row>
              <v-row>
                <v-col
                  cols="12"
                  sm="1"
                ></v-col>                
                <v-col
                  cols="12"
                  sm="4"
                >
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
                </v-col>
                <v-col
                  cols="12"
                  sm="5"
                >
                  <v-select
                    v-model="selectedFilterCateg"
                    :items= filterCateg
                    :menu-props="{ maxHeight: '400' }"
                    label="Filter by:"
                    dense
                    persistent-hint
                    outlined
                    prepend-inner-icon="mdi-filter"
                  >
                  </v-select>
                </v-col>
                <v-col
                  cols="12"
                  sm="1"
                >
                  <v-btn
                    rounded
                    color="#4B4B46"
                    dark
                    block
                    class="loadBtn"
                    @click="filterData(selectedFilterCateg)"
                  >
                    <v-icon
                      medium
                      color="white"
                    >
                      mdi-magnify
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <div v-if="isFilteredChart">
                <v-divider/>
                <v-card-text>
                  <div>
                    <span class="float-sm-left" >Total energy consumption:</span><span class="float-sm-right"  style="color:rgb(215, 0, 75, 1);font-weight:bold;float-right">{{ this.totalFilteredEnergyConsumed.toLocaleString()}} kWh </span>
                  </div>
                  <br>
                  <div>
                    <span class="float-sm-left" >Total carbon dioxide:</span><span class="float-sm-right" style="color:rgb(215, 0, 75, 1);font-weight:bold">{{ (this.totalFilteredEnergyConsumed * this.co2Factor / 1000).toFixed(2).toLocaleString() }} metric tons CO2e </span>
                  </div>
                  <br>
                </v-card-text>
                <v-divider/>
                    <div id="first">
                    <LineChart :energyValues="filteredEnergyValues" :timeValues="timeValues" :location="filterBySelection"/>
                    </div>
                <v-divider/>
                
              </div>
            </v-card>

          </div>
        </v-col>
      </v-row>
      <v-row>

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

      console.log(this.$route.params.loc_name.replace(/_/g, ' '))
      this.fp =flatpickr('#datepicker', {
        enableTime: true,
        altInput: true,
        altFormat: "F j, Y H:i",
        dateFormat: "Y-m-d H:i",
        mode: "range",
      })
      //avoid Lambda function cold-start
      axios({ method: "GET", 
        "url": "https://2s3ds132y9.execute-api.eu-central-1.amazonaws.com/prod/tracker/co2", 
        "headers": { "content-type": "application/json" } })
      .then( () => {})
      .catch( () => {})
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

      async filterData(selection) {
        this.totalFilteredEnergyConsumed = 0
        this.filterBySelection = selection
        this.isFilteredChart = false
        this.filteredEnergyValues = []
        this.filteredValues = []

        //await localforage.getItem('db_data_location').then( value => {this.response = value})
        
        for (let i of this.response) {
          for (let j of i) {
            if (j.includes(selection)) {this.filteredValues.push(j)}
          }
        }
        this.response = null

        for (let item of this.timeValues) {
            this.sumFilteredEnergyValues = 0
            for (let j of this.filteredValues) {
                if (j[2] == item) {this.sumFilteredEnergyValues += j[1]}
            }
            this.filteredEnergyValues.push(this.sumFilteredEnergyValues)
        }
        for (const i of this.filteredEnergyValues ) {
          this.totalFilteredEnergyConsumed += i
        }          
        this.isFilteredChart = true
        this.filteredValues = null

        this.$vuetify.goTo(9999)


      },
      checkFilter(x){
        if (x == "Infrastructure") {
          this.filterCateg = this.subCategoryValues
        } else if ( x == "Department") {
          this.filterCateg = this.departmentValues
        } else if ( x == "Machine") {
          this.filterCateg = this.machineValues
        }
      },
      checkRegion(x) {
        this.countries = []
        this.locations = []

        if (x == "EMEA") {
          this.countries.push('Germany', 'France', 'Romania')
        } else if (x == "APAC") {
          this.countries.push('China', 'South Korea', 'India')
        }

        //for (let item of x) {
        //  if (item == "EMEA") {
        //    this.countries.push('Germany', 'France', 'Romania')
        //  }
        //  if (item == "APAC") {
        //    this.countries.push('China', 'South Korea', 'India')
        //  }
        //}
        this.countries.sort()
        this.selectedLocations = ''
        this.selectedCountries = ''
        this.checkCountry(this.selectedCountries)
  
      },
    checkCountry(x) {
      this.locations =[]
      
      if (x == "Germany") {
        this.locations.push('Schwalbach', 'Limbach', 'Regensburg')
      } else if (x == "France") {
        this.locations.push('Toulouse')
      }
      //for (let item of x) {
      //  if (item == "Germany") {
      //    this.locations.push('Schwalbach', 'Limbach', 'Regensburg')
      //  }
      //  if (item == "France") {
      //    this.locations.push('Toulouse')
      //  }
      //  this.locations.sort()

      //}
    },
     sortArray(arr,prop){
  arr.sort((a,b)=>{
    if(typeof a[prop] ==='string')
      return b[prop].localeCompare(a[prop])
    return b[prop] - a[prop]
  })
},
     async showValues() {

      this.payload = {}
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

      if (this.selectedCountries == 'Germany') { this.co2Factor = 0.3786}
        
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
      this.payload = {
        region: this.selectedRegions,
        country: this.selectedCountries,
        location: this.selectedLocations,
        timeframe: this.period
      }

      await Promise.all([
        axios({ method: "GET", 
                    "url": "https://2s3ds132y9.execute-api.eu-central-1.amazonaws.com/prod/tracker/co2-location-detail", 
                    "params": {c: "date", i: this.selectedLocations, df: this.period[0], dt: this.period[1]}, 
                    "headers": { "content-type": "application/json" } }),
        axios({ method: "GET", 
                    "url": "https://2s3ds132y9.execute-api.eu-central-1.amazonaws.com/prod/tracker/co2-location-detail", 
                    "params": {c: "subcategory", i: this.selectedLocations, df: this.period[0], dt: this.period[1]},  
                    "headers": { "content-type": "application/json" } }),
        axios({ method: "GET", 
                    "url": "https://2s3ds132y9.execute-api.eu-central-1.amazonaws.com/prod/tracker/co2-location-detail", 
                    "params": {c: "area", i: this.selectedLocations, df: this.period[0], dt: this.period[1]}, 
                    "headers": { "content-type": "application/json" } }),
        axios({ method: "GET", 
                    "url": "https://2s3ds132y9.execute-api.eu-central-1.amazonaws.com/prod/tracker/co2-location-detail", 
                    "params": {c: "tag_name", i: this.selectedLocations, df: this.period[0], dt: this.period[1]}, 
                    "headers": { "content-type": "application/json" } })
      ])
        .then( results => {

          this.response = results[0].data

          //decompress gzip response
          this.response = pako.inflate(Buffer.from(this.response, 'base64'), { to: 'string' })
          this.response = JSON.parse(this.response)

          this.timeValues = this.response[0]
          this.energyValues = this.response[1]

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

          let sortArray = []
          for (var i = 0; i < this.response[0].length; i++) {
              sortArray.push({machine: this.response[0][i], value: this.response[1][i]})
          }
          this.sortArray(sortArray, "value")
          sortArray = sortArray.slice(0,10)

          for (let item of sortArray) {
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



      this.timeValues = null
      this.energyValues = 
      this.subCategoryValues = null
      this.subEnergyValues = null
      this.departmentValues = null
      this.departmentEnergyValues = null
      this.machineValues = null
      this.machineEnergyValues = null
      this.response = null
     }
   },
    data () {
      return {
        co2Factor: 0,
        totalEnergyConsumed: 0,
        totalFilteredEnergyConsumed: 0,
        isSpinnerActive: false,
        isChartActive: false,
        isBtnActive: true,
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
        payload: {},
        selectedCountries: '',
        selectedRegions: '',
        selectedLocations: '',
        regions: [ 'APAC', 'EMEA', 'NAFTA'],
        countries : [],
        locations: [],

        plantCategories: ['Infrastructure', 'Department', 'Machine (Top 10)'],
        selectedPlantCategories:'',
        selectedFilterCateg: '',
        filterCateg: [],
        filteredValues: [],
        sumFilteredEnergyValues: 0,
        filteredEnergyValues: [],
        filterBySelection: ''
      
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
