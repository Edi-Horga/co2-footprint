<template>
  <div class="PieWrapper">
    <canvas :id="this.randomId" height="450" width="450"></canvas>
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
          plugins: {
            title: {
              text: '',
              display: true,
              font: {
                size: 16,
                weight: 'bold',
                color: '#d7004b'
              }
            },
            legend:{
              maxHeight: 115
            }
          }
        }

      }
    }
  },
  methods: {},
  mounted() {
    this.config.data.labels = this.labelValues 
    this.config.data.datasets[0].data = this.energyValues 
    this.config.options.plugins.title.text = `${this.category} energy distribution [kWh]`
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

</style>