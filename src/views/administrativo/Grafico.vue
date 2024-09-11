<template>
  <v-container fluid>
    <v-row>
      <v-col>
        {{ dados }}
        <apexchart :key="chartKey" :options="chartOptions"
                   :series="series" :type="tipoGrafico"
                   width="100%"></apexchart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'home',
  components: {},
  data: () => ({
    chartKey: 0,
    tipoGrafico: 'pie',
    series: [],
    chartOptions: {
      labels: [],
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val.toFixed(2) + ' %'
        }
      },
      legend: {
        position: 'bottom'
      },
      chart: {
        toolbar: {
          show: true,
          offsetX: 0,
          offsetY: 0,
          tools: {
            download: true
          },
          export: {
            png: {
              filename: undefined
            }
          }
        }
      },
      title: {
        text: 'Gráfico de teste (Mês)',
        align: 'center',
        margin: 0,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize: '20px',
          fontWeight: 'bold',
          fontFamily: undefined,
          color: '#263238'
        }
      }

    },
    valores: []
  }),
  props: {
    dados: Array
  },
  mounted () {
    this.ajustadorDeCoisas()
  },
  methods: {
    ajustadorDeCoisas () {
      let arrayDeSeries = []
      let arrayDeLabels = []
      for (let i = 0; i < this.dados.length; i++) {
        arrayDeSeries.push(this.dados[i].indicador_valor[0].valor)
        arrayDeLabels.push(this.dados[i].nome)
      }
      this.series = arrayDeSeries
      this.chartOptions.labels = arrayDeLabels
      this.updateChartData()
    },

    updateChartData () {
      this.chartOptions = {
        ...this.chartOptions,
        labels: this.chartOptions.labels
      }

      this.series = this.series

      this.chartKey++ // Incrementa a key para forçar a recriação do componente
    }
  }
}
</script>
