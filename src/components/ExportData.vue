<template>
  <v-tooltip right>
    <template v-slot:activator="{ on, attrs }">
      <v-btn  fab dark small color="#4B4B46" fixed left bottom @click="downloadFile" v-bind="attrs" v-on="on"> 
        <v-icon
        medium
        color="white"
        >
            mdi-arrow-collapse-down
        </v-icon>
      </v-btn>
    </template>
    <span>Download CSV</span>
  </v-tooltip>
</template>

<script>
export default {
    name: "ExportData",
    props: ['region', 'period', 'source'],
    mounted() {

    },

    methods: {

     downloadFile(){
        let dwlData
        let csv
        var FileSaver = require('file-saver')
        //await localforage.getItem('db_data_location').then( value => {jsonData = value})
        dwlData = JSON.parse(localStorage.getItem("dwl_csv_obj"))

        if ( this.source == 'sofi' ) {
          csv = "REGION,DATE,ENERGY-VALUE[MWh]\n"
          for (var i = 0; i < dwlData[0][0].length; i++) {
            csv += `${this.region},${dwlData[0][0][i].substring(0,7)},${dwlData[0][1][i]}\n`
          }
          csv +="\nScope 1 - Direct Emissions\n--------------------------\nSOURCE,CO2-VALUE[tons CO2e]\n"

          for (var j = 0; j < dwlData[1][0].length; j++) {
            csv += `${dwlData[1][0][j]},${dwlData[1][1][j] / 1000}\n`
          }
          csv +="\nScope 2 - Indirect Emissions\n--------------------------\nSOURCE,CO2-VALUE[tons CO2e]\n"

          for (var z = 0; z < dwlData[2][0].length; z++) {
            csv += `${dwlData[2][0][z].replace(';','.')},${dwlData[2][1][z] / 1000}\n`
          }
    
          // for (const i of jsonData[0]) {
          //   csv += `${this.selectedCountries},${this.selectedLocations},${i[4]},${i[0]},${i[3]},${i[2]},${i[1]}\n`
          // }

        } else if ( this.source == 'messdas' ) {
            csv = "DATE,ENERGY-VALUE[KWh]\n"
            for (var a = 0; a < dwlData[0][0].length; a++) {
              csv += `${dwlData[0][0][a].replace(/-/g,'.')},${dwlData[0][1][a]}\n`
            }
            csv +="\nInfrastructure(Top 10)\n--------------------------\nINFRA,ENERGY-VALUE[KWh]\n"
            for (var b = 0; b < dwlData[1][0].length; b++) {
              csv += `${dwlData[1][0][b]},${dwlData[1][1][b]}\n`
            }
            csv +="\nDepartment(Top 10)\n--------------------------\nDEPARTMENT,ENERGY-VALUE[KWh]\n"
            for (var c = 0; c < dwlData[2][0].length; c++) {
              csv += `${dwlData[2][0][c]},${dwlData[2][1][c]}\n`
            }
            csv +="\nMachine(Top 10)\n--------------------------\nMachine,ENERGY-VALUE[KWh]\n"
            for (var d = 0; d < dwlData[3][0].length; d++) {
              csv += `${dwlData[3][0][d]},${dwlData[3][1][d]}\n`
            }
        }
        var blob = new Blob(["\uFEFF" + csv], {type: "text/csv;charset=utf-8"})
        FileSaver.saveAs(blob, `${this.region}_${this.period[0]}-${this.period[1]}.csv`)
      },
    }

}
</script>

<style>

</style>