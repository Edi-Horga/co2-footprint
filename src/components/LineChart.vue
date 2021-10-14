<template>
  <div class="chartWrapper">
    <canvas :id="this.randomId" height="300" width="1000"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'LineChart',
  props: ['energyValues', 'timeValues', 'sourceDb', 'location'],
  data() {
    return {
      randomId: (Math.floor(100000 + Math.random() * 900000)).toString(),
       config : {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '',
                data: [],
                fill: false,
                borderColor: 'rgba(215, 0, 75, 1)',
                tension: 0.1
            }]
        },
        options : {
          scales: {
            x: {
              ticks: {
                callback: function(value) {
                  // if (this.getLabelForValue(value).includes('00:00')) {
                  //   return this.getLabelForValue(value).substring(0,0)
                  // } else {
                  //   return this.getLabelForValue(value)
                  // }
                  return this.getLabelForValue(value).substring(0,10)
                }
              }
            },
            y: {
              title: {
                display: true,
                text: 'kWh'
              }
            }
          }     
        }
      }
    }
  },
  methods: {
  },
  mounted() {
    if (this.sourceDb == "sofi") {
      this.config.options.scales.y.title.text = "MWh"
    } 
    this.config.data.labels = this.timeValues
    this.config.data.datasets[0].data = this.energyValues
    this.config.data.datasets[0].label = `${this.location} energy consumption`
    const ctx = document.getElementById(this.randomId)
    new Chart(ctx, this.config)

    //this.energyValues = null
    //this.timeValues = null
  }
}
</script>

<style scoped>

</style>