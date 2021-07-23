<template>
  <div class="chartWrapper">
    <canvas :id="this.randomId" height="300" width="1000"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'LineChart',
  props: ['energyValues', 'timeValues', 'location'],
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
    setValue(x){
      console.log(x)
      this.dataChart = x
      
    }
  },
  mounted() {
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