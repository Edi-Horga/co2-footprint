<template>
  <div class="PieWrapper">
    <canvas :id="this.randomId" height="300" width="600"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'PieChart',
  props: ['energyValues', 'labelValues', 'category'],
  data() {
    return {
       randomId: (Math.floor(100000 + Math.random() * 900000)).toString(),
       colors: [],
       config : {
        type: 'doughnut',
        data: {

            labels: [],
            datasets: [{
                label: 'My First Dataset',
                data: [],
                backgroundColor: [],
                hoverOffset: 4,
                weight: 1
            }]

        },
        options: {
          maintainAspectRatio: true,
          responsive: false,
          plugins: {
            
            title: {
              text: '',
              display: true,
              font: {
                size: 14,
                weight: 'bold',
                color: '#d7004b',
                textAlign: 'center'
              }
            },
            legend:{
              maxHeight: 0,
              position: 'bottom',
              fullSize: false,
              labels:{
                textAlign: 'justified',
                boxWidth: 10,
                font: {
                  size: 14
                }
              }
            }
          }
        }

      }
    }
  },
  methods: {},
  mounted() {

    //document.getElementsByClassName('PieWrapper').forEach( el => {el.childNodes[0].height=300})

    let sortedArray = []
    for (var i = 0; i < this.energyValues.length; i++) {
        sortedArray.push({energy: this.energyValues[i], label: this.labelValues[i]})
    }
    this.sortArray(sortedArray, "energy")
    this.energyValues = []
    this.labelValues = []

    for (let item of sortedArray) {
        this.energyValues.push(item.energy)
        this.labelValues.push(item.label)
    }

    for (const [index, item ] of this.labelValues.entries()) {
      if (item == "Grid Electricity (purchased; renewable AND non-renewable)") {
        this.labelValues[index] = "Grid Electricity"
      }
    }

    if ( this.category == "Scope 1" || this.category == "Scope 2" || this.category == "Scope 1 & Scope 2" ) {
      // convert from kg to tons and round number
      this.energyValues = this.energyValues.map( item => { item = Math.round(item/1000); return item })
    }
    let sumEnergyValues = 0

    this.energyValues.forEach( el => sumEnergyValues += el)
    this.labelValues = this.labelValues.map( (j,index) =>{ return `${j} ${(this.energyValues[index] / sumEnergyValues * 100).toLocaleString(undefined, {maximumFractionDigits: 1})}%` })
    this.config.data.labels = this.labelValues
     
    if ( this.category == "Scope 1" ) {
      this.config.options.plugins.title.text = `${this.category} - Direct Emissions: ${sumEnergyValues.toLocaleString(undefined, {maximumFractionDigits: 0})} [tons CO2e]`    
    } else if  ( this.category == "Scope 2" ) {
      this.config.options.plugins.title.text = `${this.category} - Indirect Emissions: ${sumEnergyValues.toLocaleString(undefined, {maximumFractionDigits: 0})} [tons CO2e]`       
    } else if ( this.category == "Scope 1 & Scope 2"  ) {
      this.config.options.plugins.title.text = `${this.category} emissions: ${sumEnergyValues.toLocaleString(undefined, {maximumFractionDigits: 0})} [tons CO2e]`      
    } else if ( this.category == "MWh") {
      this.config.options.plugins.title.text = `Scope 1 & Scope 2 emissions: ${sumEnergyValues.toLocaleString(undefined, {maximumFractionDigits: 0})} [MWh]`      
    }
     else {
      this.config.options.plugins.title.text = `${this.category} energy distribution: ${sumEnergyValues.toLocaleString()} [kWh]`
    }

    this.config.data.datasets[0].data = this.energyValues

    for (let i=0;i<this.energyValues.length;i++) {
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        this.colors.push(`rgb(${r}, ${g}, ${b})`)
    }
    this.config.data.datasets[0].backgroundColor = this.colors
    const ctx = document.getElementById(this.randomId)
    new Chart(ctx, this.config)

    //this.subEnergyValues = null
    //this.subCategoryValues = null
  }
}
</script>

<style scoped>
canvas {
  margin: auto;
}
</style>