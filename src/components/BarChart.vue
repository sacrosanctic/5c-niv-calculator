<script>
  import { Bar, mixins } from 'vue-chartjs'

  const { reactiveProp } = mixins
  export default {
    extends: Bar,
    mixins: [ reactiveProp ],
    data () {
      return {
        // datacollection: {
        //   labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        //   datasets: [
        //     {
        //       label: 'Data One',
        //       backgroundColor: '#f87979',
        //       pointBackgroundColor: 'white',
        //       borderWidth: 1,
        //       pointBorderColor: '#249EBF',
        //       data: [40, 20, 30, 50, 90, 10, 20, 40, 50, 70, 90, 100]
        //     }
        //   ]
        // },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              },
              gridLines: {
                display: true
              }
            }],
            xAxes: [ {
              gridLines: {
                display: false
              }
            }]
          },
          legend: {
            display: false
          },
          responsive: true,
          maintainAspectRatio: false
        }
      }
    },
    mounted () {
      this.renderChart(this.chartData, this.options)
    }
  }
</script>
