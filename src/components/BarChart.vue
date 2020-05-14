<script>
  import { Bar, mixins } from 'vue-chartjs'
  const { reactiveProp } = mixins

  export default {
    extends: Bar,
    mixins: [ reactiveProp ],
    props: ['title'],
    data () {
      return {
        options: {
          scales: {
            yAxes: [{
              // id: 'A',
              ticks: {
                beginAtZero: true
              },
              gridLines: {
                display: true
              }
            },
            // {
            //   display: true,
            //   id: 'B',
            //   position: 'right',
            //   gridLines: {
            //     display: false
            //   },
            //   ticks: {
            //     min: 0,
            //     max: 10,
            //   }
            // }
            ],
            xAxes: [ {
              // id: 'A',
              gridLines: {
                display: false
              }
            },
            // {
            //   id: 'B',
            //   type: 'linear',
            //   ticks: {
            //     label: [1,2,3,10]
            //   }
            ]
          },
          legend: {
            display: false
          },
          responsive: true,
          maintainAspectRatio: false,
          title: {
            display: true,
            text: this.title
          }
        }
      }
    },
    mounted () {
      this.renderChart(this.chartData, this.options)
    }
  }
</script>
