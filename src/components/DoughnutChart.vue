<script>
  import { Doughnut, mixins } from 'vue-chartjs'
  const { reactiveProp } = mixins

  export default {
    extends: Doughnut,
    mixins: [ reactiveProp ],
    props: ['title'],
    data () {
      return {
        options: {
          legend: {
            display: false
          },
          rotation:5,
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
