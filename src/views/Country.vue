<template>
  <div style="margin: 0em 0.2em 0.2em 0.2em; display:flex;">

      <v-col
        cols="12"
        sm="6"
      >
      <div id="mapContainer" style="height: 76vh; z-index: 0;"></div>
      </v-col>
      <v-col cols="12" sm="6">
        <div style="display:flex;">
          <div style="width: 250px;">
            <v-autocomplete
              v-model="country"
              :items="countries"
              dense
              small
              outlined
              label="Country"
            ></v-autocomplete>
          </div>
          <div style="width: 300px; margin-left: 10px;">
          <v-text-field
            id="datepicker"
            dense
            outlined
            prepend-inner-icon="mdi-calendar"
          ></v-text-field>
          </div>
            <div style="width: 170px; margin-left: 10px;">
                <v-btn
                    v-if="this.isBtnActive"
                    rounded
                    block
                    dark
                    color="#D7004B"
                    @click="loadData('country', country, 'country1')"
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
        </div>
        <div v-if="this.isChartActive">
          <v-card
             class="lx-auto my-auto overflow-y-auto overflow-x-hidden"
             max-width="1000"
             outlined
             height="70vh"
             style="scrollbar-width: thin;"
           > 
            <v-card-text>
              <div class="text-center" style="margin-top:-10px;">
                <h3>{{this.cardCountry}}</h3>
              </div>
              <v-divider/> 
                <div>
                  <span class="float-sm-left" >Total energy consumption:</span><span class="float-sm-right"  style="color:rgb(215, 0, 75, 1);font-weight:bold;float-right"> {{ (this.totalEnergyConsumed).toLocaleString() }} MWh </span>
                </div>
                <br>
                <div>
                  <span class="float-sm-left" >Total carbon dioxide:</span><span class="float-sm-right" style="color:rgb(215, 0, 75, 1);font-weight:bold">{{ (this.totalKgCo2 / 1000).toLocaleString() }} metric tons CO2e </span>
                </div>
            </v-card-text>
            <LineChart  :energyValues="energyValues" :timeValues="timeValues" :sourceDb="this.sourceDb" :location="this.country"/>
            <v-row justify="center">
              <v-card
                class="my-6"
                outlined
              >
                <PieChart :energyValues="scope1Values" :labelValues="scope1Labels" :category="scopeCategories[0]"/>
              </v-card>
            </v-row>
            <v-row justify="center">
              <v-card
                class="my-0"
                outlined
              >
                <PieChart :energyValues="scope2Values" :labelValues="scope2Labels" :category="scopeCategories[1]"/>
              </v-card>
            </v-row>
          </v-card>
        </div>
      </v-col>
    

      <v-row>
        <ExportData v-if="this.isChartActive" :region="this.country" :period="this.period" /> 
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
  </div>
</template>
<script>
  import ExportData from '../components/ExportData.vue'
  import LineChart from '../components/LineChart.vue'
  import PieChart from '../components/PieChart.vue'
  import "leaflet/dist/leaflet.css"
  import L from "leaflet"
  import { Icon } from 'leaflet'
  import flatpickr from "flatpickr"
  import axios from 'axios'

  const pako = require('pako')

  delete Icon.Default.prototype._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  })


  export default {
    name: 'Country',
     mounted() {

       document.getElementsByClassName('v-tabs-slider')[0].style.backgroundColor = "#D7004B"
        
      if ( localStorage.getItem("country_co") !== null ) {
        this.country = localStorage.getItem("country_co")
      } else {
        this.country = "Germany"
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
        altFormat: "F j, Y ",
        dateFormat: "Y-m-d H:i",
        mode: "range",
        defaultDate: this.defaultDates
      })

      this.fp.selectedDates = this.defaultDates
      this.loadData('country', this.country, 'country1')
      this.loadGeo()

      
    },
    methods: {

       async loadGeo() {
          await Promise.all([
            axios({ method: "GET", 
                    "url": "https://2s3ds132y9.execute-api.eu-central-1.amazonaws.com/prod/tracker/geo-country",  
                    "headers": { "content-type": "application/json" } })
          ])
            .then( results => {

            this.response = results[0].data

            this.response = pako.inflate(Buffer.from(this.response, 'base64'), { to: 'string' })
            this.response = JSON.parse(this.response)
            
            this.BR = JSON.parse(this.response[0])
            this.CH = JSON.parse(this.response[1])
            this.CZ = JSON.parse(this.response[2])
            this.FR = JSON.parse(this.response[3])
            this.GE = JSON.parse(this.response[4])
            this.HU = JSON.parse(this.response[5])
            this.IN = JSON.parse(this.response[6])
            this.IT = JSON.parse(this.response[7])
            this.MX = JSON.parse(this.response[8])
            this.RO = JSON.parse(this.response[9])
            this.KO = JSON.parse(this.response[10])
            this.TH = JSON.parse(this.response[11])
            this.US = JSON.parse(this.response[12])

            }).catch( error => {
                if (error.response) {
                this.errorMessage = error.response.data.message
                this.snackbar = true
                this.isBtnActive = true 
                this.isSpinnerActive = false
                }
            })

          this.map = L.map("mapContainer").setView([25, 10], 1.5)

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          }).addTo(this.map)

          this.addGeoJson(this.BR, this.setStyleMap('red'), () => { this.country = 'Brazil' })
          this.addGeoJson(this.CH, this.setStyleMap('blue'), () => { this.country = 'China' })         
          this.addGeoJson(this.CZ, this.setStyleMap('green'), () => { this.country = 'Czech Republic' })
          this.addGeoJson(this.FR, this.setStyleMap('#F2E500'), () => { this.country = 'France' })
          this.addGeoJson(this.GE, this.setStyleMap('#D7004B'), () => { this.country = 'Germany' })         
          this.addGeoJson(this.HU, this.setStyleMap('brown'), () => { this.country = 'Hungary' })
          this.addGeoJson(this.IN, this.setStyleMap('#C79FEF'), () => { this.country = 'India' })
          this.addGeoJson(this.IT, this.setStyleMap('#069AF3'), () => { this.country = 'Italy' })
          this.addGeoJson(this.MX, this.setStyleMap('orange'), () => { this.country = 'Mexico' })         
          this.addGeoJson(this.RO, this.setStyleMap('purple'), () => { this.country = 'Romania' })
          this.addGeoJson(this.KO, this.setStyleMap('navy blue'), () => { this.country = 'South Korea' })
          this.addGeoJson(this.TH, this.setStyleMap('teal'), () => { this.country = 'Thailand' })         
          this.addGeoJson(this.US, this.setStyleMap('#4B4B46'), () => { this.country = 'USA' })

          this.BR = null
          this.CH = null
          this.CZ = null
          this.FR = null
          this.GE = null
          this.HU = null
          this.IN = null
          this.IT = null
          this.MX = null
          this.RO = null
          this.KO = null
          this.TH = null
          this.US = null


       },

       setStyleMap(colorHex) {
          return {
            stroke: false,
            fill: true,
            fillColor: colorHex,
            fillOpacity: 0.6            
          }
       },

        addGeoJson(geoMap, styleMap, action) {
          L.geoJson(geoMap, {
            clickable: true,
            style: styleMap,
          }).addTo(this.map).on('click', action)
        },

        async downloadFile(){
          let jsonData
          let csv = "MONTH,VALUE[MWh]\n"
          var FileSaver = require('file-saver')

          for (const i of jsonData[0]) {
            csv += `${this.selectedCountries},${this.selectedLocations},${i[4]},${i[0]},${i[3]},${i[2]},${i[1]}\n`
          }
          var blob = new Blob([csv], {type: "application/csv"})
          FileSaver.saveAs(blob, `${this.selectedCountries}_${this.selectedLocations}_${this.period[0]}-${this.period[1]}.csv`)
        },


    },
    components: {
      LineChart,
      PieChart,
      ExportData
      
    },
    data(){
      return { 
        country: '',                            
        countries: ['Brazil', 'China', 'Czech Republic', 'France', 'Germany', 'Hungary', 'India', 'Italy', 'Mexico', 'Romania', 'South Korea', 'Thailand', 'USA' ],
        map: '',
        marker: '',
        marker1: '',
        sourceDb: 'sofi',
        defaultDates:[],
        errorMessage: 'test',
        energyValues: [],
        timeValues: [],
        response: '',
        cardCountry: '',

        fp: '',
        period: [],
        months:'',
        dates:'',

        isBtnActive: true,
        isSpinnerActive: false,
        isChartActive: false,
        snackbar: false,

        totalEnergyConsumed: 0,
        totalKgCo2: 0,
        scopeCategories: ['Scope 1', 'Scope 2']
      }
    }
  }
</script>

<style scoped>
canvas {
  margin: auto !important;
}
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

.v-application .my-auto {
  margin-top: -20px !important;
}
</style>
