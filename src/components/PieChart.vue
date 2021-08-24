<template>
  <div class="PieWrapper">
    <canvas :id="this.randomId" height="200" width="350"></canvas>
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
                hoverOffset: 4
            }]

        },
        options: {
          responsive: false,
          plugins: {
            title: {
              text: '',
              display: true,
              font: {
                size: 14,
                weight: 'bold',
                color: '#d7004b'
              }
            },
            legend:{
              maxHeight: -1,
              // position: 'left',
              // fullSize: false,
              // labels:{
              //   textAlign: 'justified',
              //   boxWidth: 8,
              //   font: {
              //     size: 10
              //   }
              // }
            }
          }
        }

      }
    }
  },
  methods: {},
  mounted() {



    for (const [index, item ] of this.labelValues.entries()) {
      if (item == "Grid Electricity (purchased; renewable AND non-renewable)") {
        this.labelValues[index] = "Grid Electricity"
      }
    }
    this.config.data.labels = this.labelValues 
     
    if ( this.category == "Scope 1" ) {
      this.energyValues = this.energyValues.map( item => { item = item/1000; return item })
      this.config.options.plugins.title.text = `${this.category} - Direct Emissions [tons CO2e]`    
    } else if  ( this.category == "Scope 2" ) {
      this.energyValues = this.energyValues.map( item => { item = item/1000; return item })
      this.config.options.plugins.title.text = `${this.category} - Indirect Emissions [tons CO2e]`       
    } else {
      this.config.options.plugins.title.text = `${this.category} energy distribution [kWh]`
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