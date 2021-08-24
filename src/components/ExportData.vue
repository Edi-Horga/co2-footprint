<template>
  <v-btn  fab dark small color="#4B4B46" fixed left bottom @click="downloadFile"> 
    <v-icon
    medium
    color="white"
    >
        mdi-arrow-collapse-down
    </v-icon>
  </v-btn>
</template>

<script>
export default {
    name: "ExportData",
    props: ['region', 'period'],
    mounted() {

    },

    methods: {

     downloadFile(){
        let dwlData
        let csv = "REGION,DATE,ENERGY-VALUE[MWh]\n"
        var FileSaver = require('file-saver')
        //await localforage.getItem('db_data_location').then( value => {jsonData = value})
        dwlData = JSON.parse(localStorage.getItem("dwl_csv_obj"))

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
        var blob = new Blob([csv], {type: "application/csv"})
        FileSaver.saveAs(blob, `${this.region}_${this.period[0]}-${this.period[1]}.csv`)
      },
    }

}
</script>

<style>

</style>