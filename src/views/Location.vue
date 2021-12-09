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
              v-model="location"
              :items="locations"
              dense
              small
              outlined
              label="Location"
              @change="loadData('location', location, 'location1')"
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
                    @click="loadData('location', location, 'location1')"
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
                <h3><router-link :to="{ path: `/location/${this.cardLocation.replace(/\s+/g, '_')}` }">{{this.cardLocation}}</router-link></h3>
              </div>
              <v-divider/> 
                <div>
                  <span class="float-sm-left" >Total energy consumption:</span><span class="float-sm-right"  style="color:rgb(215, 0, 75, 1);font-weight:bold;float-right"> {{ (this.totalEnergyConsumed).toLocaleString() }} MWh </span>
                </div>
                <!-- <div>
                  <span class="float-sm-left" >Total carbon dioxide:</span><span class="float-sm-right" style="color:rgb(215, 0, 75, 1);font-weight:bold">{{ (this.totalKgCo2 / 1000).toLocaleString() }} metric tons CO2e </span>
                </div> -->
            </v-card-text>
            <LineChart  :energyValues="energyValues" :timeValues="timeValues" :sourceDb="this.sourceDb" :location="this.location"/>
            <v-row justify="center">
              <v-card
                class="mt-6 mb-2"
                outlined
              >
                <PieChart :energyValues="scope1Values" :labelValues="scope1Labels" :category="this.scopeCategories[0]"/>
              </v-card>
            </v-row>
            <v-row justify="center">
              <v-card
                class="my-0"
                outlined
              >
                <PieChart :energyValues="scope2Values" :labelValues="scope2Labels" :category="this.scopeCategories[1]"/>
              </v-card>
            </v-row>
          </v-card>
        </div>
      </v-col>
    

      <v-row>
        <ExportData v-if="this.isChartActive" :region="this.location" :period="this.period" :source="'sofi'" /> 
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


  delete Icon.Default.prototype._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  })


  export default {
    name: 'LocationMap',
    mounted() {

      document.getElementsByClassName('v-tabs-slider')[0].style.backgroundColor = "#D7004B"

      if ( localStorage.getItem("location_loc") !== null ) {
        this.location = localStorage.getItem("location_loc")
      } else {
          this.location = "Regensburg"
      }

      if ( localStorage.getItem("global_fp") !== null ) {
        this.defaultDates = localStorage.getItem("global_fp")
        this.defaultDates = this.defaultDates.split(",")
        this.defaultDates[0] = new Date(this.defaultDates[0])
        this.defaultDates[1] = new Date(this.defaultDates[1])
      } else {
        this.defaultDates = [ new Date((new Date()).setMonth((new Date()).getMonth() - 12)),new Date() ]
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
      this.loadData('location', this.location, 'location1')
      
      this.map = L.map("mapContainer").setView([25, 10], 1.5)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
      }).addTo(this.map)


      this.addMarkerToMap([52.52, 13.405], "red" ,"Berlin")
      this.addMarkerToMap([50.1542, 8.5288], "green", "Schwalbach")
      this.addMarkerToMap([49.1941, 12.5223], "red", "Roding")
      this.addMarkerToMap([50.9689, 9.7973], "gold", "Bebra")
      this.addMarkerToMap([51.2099, 10.4571], "violet", "Muehlhausen")
      this.addMarkerToMap([51.5136, 7.4653], "grey", "Dortmund")
      this.addMarkerToMap([50.9796, 10.3147], "black", "Eisenach (Hoerselberg-Hainich)")
      this.addMarkerToMap([50.8576, 12.7537], "yellow", "Limbach-Oberfrohna")
      this.addMarkerToMap([50.8378, 7.2127], "blue", "Lohmar")
      this.addMarkerToMap([49.4521, 11.0767], "orange", "Nuremberg")
      this.addMarkerToMap([49.0134, 12.1016], "blue", "Regensburg")
      
      this.addMarkerToMap([45.7489, 21.2087], "red", "Timisoara")
      this.addMarkerToMap([45.6427, 25.5887], "gold", "Brasov")
      this.addMarkerToMap([47.1585, 27.6014], "blue", "Iasi")

      this.addMarkerToMap([47.5316, 21.6273], "green", "Debrecen")

      this.addMarkerToMap([43.6047, 1.4442], "blue", "Toulouse")
      this.addMarkerToMap([42.9641, 1.6052], "red", "Foix")
      this.addMarkerToMap([49.0487, 6.5954], "violet", "Faulquemont")
      this.addMarkerToMap([43.1762, 0.9726], "black", "Boussens")

      this.addMarkerToMap([50.5654, 15.9091], "grey", "Trutnov")
      this.addMarkerToMap([49.5483, 18.2108], "gold", "Frenstat")

      this.addMarkerToMap([13.0239, 101.0724], "green", "Amata City")
      
      this.addMarkerToMap([37.2720, 127.4348], "gold", "Icheon")

      this.addMarkerToMap([18.7376, 73.6747], "red", "Pune (Talegaon)")
      this.addMarkerToMap([18.6117, 73.3208], "violet", "Pune (Taluka Mulshi; EMITEC)")

      this.addMarkerToMap([31.3529, 118.4329], "blue", "Wuhu 1 (Yinhu)")
      this.addMarkerToMap([31.2529, 118.3329], "black", "Wuhu 1 (Huashan)")
      this.addMarkerToMap([39.3434, 117.3616], "orange", "Tianjin")
      this.addMarkerToMap([43.8171, 125.3235], "grey", "Changchun I (Jing Kai)")

      this.addMarkerToMap([29.5688, -97.9647], "grey", "Seguin")
      this.addMarkerToMap([37.0871, -76.4730], "green", "Newport News")
      this.addMarkerToMap([42.6485, -83.2453], "gold", "Auburn Hills South")

      this.addMarkerToMap([18.8126, -98.9548], "red", "Cuautla")
      this.addMarkerToMap([31.6904, -106.4245], "green", "Ciudad Juarez 2 (Viatech)")
      this.addMarkerToMap([31.6004, -106.3345], "blue", "Ciudad Juarez 1 (Aerotech)")

      this.addMarkerToMap([-23.1994, -47.2878], "green", "Salto")

      this.addMarkerToMap([43.5691, 10.5172], "blue", "Pisa-Fauglia")
      this.addMarkerToMap([43.6810, 10.3475], "red", "Pisa - San Piero")
    },
    methods: {

        addMarkerToMap( coordinates, color, locationName){
          return L.marker(coordinates, {icon: this.createIcon(color)})
                  .addTo(this.map).on('click', () => { this.location = locationName }).on('click', () => { this.loadData('location', this.location, 'location1') })
                  .bindTooltip(locationName)
        },

        createIcon( color ) {
          return new L.Icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [15, 23.5],
            iconAnchor: [6.5, 21],
            popupAnchor: [1, -34],
            shadowSize: [20.5, 20.5]
          })
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
        location: '',
        locations:  ["Berlin", "Schwalbach", "Roding", "Bebra", "Muehlhausen", "Dortmund", "Eisenach (Hoerselberg-Hainich)", "Limbach-Oberfrohna", "Lohmar",
      "Nuremberg", "Regensburg", "Timisoara", "Brasov", "Iasi", "Debrecen", "Toulouse", "Foix", "Faulquemont", "Boussens", "Trutnov", "Frenstat",
      "Amata City", "Icheon", "Pune (Talegaon)", "Pune (Taluka Mulshi; EMITEC)", "Wuhu 1 (Yinhu)", "Wuhu 1 (Huashan)", "Tianjin", "Changchun I (Jing Kai)",
      "Seguin", "Newport News", "Auburn Hills South", "Cuautla", "Ciudad Juarez 2 (Viatech)", "Ciudad Juarez 1 (Aerotech)", "Salto", "Pisa-Fauglia", "Pisa - San Piero"
      ].sort(),
        map: '',
        marker: '',
        marker1: '',
        defaultDates: [],
        errorMessage: 'test',
        energyValues: [],
        timeValues: [],
        cardLocation: '',
        sourceDb: 'sofi',

        fp: '',
        period: [],
        months:'',
        dates:'',

        isBtnActive: true,
        isSpinnerActive: false,
        isChartActive: false,
        snackbar: false,

        totalEnergyConsumed: 0,
        totalKgCo2: 0
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
