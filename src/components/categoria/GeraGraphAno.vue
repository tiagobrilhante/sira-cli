<template>
  <div>
    <div id="chart">
      <apexchart v-if="dataLoaded" :height="tamanhoGraph" :options="chartOptionsComputed" :series="series"
                 :type="chartType"></apexchart>
    </div>
  </div>
</template>
<script>
import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'

export default {
  name: 'categoriaView',
  mixins: [logoutMixin],

  data: () => ({
    dataLoaded: false,
    series: [],
    chartOptions: {
      title: {
        text: '', // Placeholder, será atualizado no mounted
        align: 'center',
        margin: 10,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize: '20px',
          color: '#263238'
        }
      },
      chart: {
        type: 'bar',
        height: 1000
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '90%',
          endingShape: 'rounded'
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      },
      fill: {
        opacity: 1
      }
    },

    chartOptions2: {
      title: {
        text: '', // Placeholder, será atualizado no mounted
        align: 'center',
        margin: 10,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize: '20px',
          color: '#263238'
        }
      },
      chart: {
        width: 380,
        type: 'pie',
        toolbar: {
          show: true,
          offsetX: 0,
          offsetY: 0,
          tools: {
            download: true
          },
          export: {
            csv: {
              filename: undefined,
              columnDelimiter: ',',
              headerCategory: 'category',
              headerValue: 'value'
            },
            svg: {
              filename: undefined
            },
            png: {
              filename: undefined
            }
          },
          autoSelected: 'zoom'
        }
      },
      labels: [],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      meuNome: '',
      plotOptions: {
        pie: {
          dataLabels: {
            offset: -5,
            minAngleToShowLabel: 10,
            formatter: function (val, opts) {
              const absoluteValue = opts.w.config.series[opts.seriesIndex]
              return opts.w.globals.labels[opts.seriesIndex] + ': ' + val.toFixed(2) + '% (' + absoluteValue + ')'
            }
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
          const absoluteValue = opts.w.config.series[opts.seriesIndex]
          return opts.w.globals.labels[opts.seriesIndex] + ': ' + val.toFixed(2) + '% (' + absoluteValue + ')'
        }
      }
    }
  }),
  props: {
    dadosGraph: Array,
    nomeCategoria: String,
    garphTipo: String,
    lelabels: Array
  },

  computed: {
    ...mapGetters(['usuarioLogado']),

    chartType () {
      return this.garphTipo === 'Anual' ? 'bar' : 'pie'
    },
    tamanhoGraph () {
      return this.garphTipo === 'Anual' ? 400 : 600
    },

    chartOptionsComputed () {
      return this.garphTipo === 'Anual' ? this.chartOptions : this.chartOptions2
    },

    nomeComputed () {
      return this.nomeCategoria
    }
  },
  created () {
  },
  watch: {
    nomeCategoria: {
      immediate: true,
      handler (newVal) {
        this.chartOptions.title.text = newVal
        this.chartOptions2.title.text = newVal
      }
    }
  },

  mounted () {
    if (this.dadosGraph && this.dadosGraph.length > 0) {
      this.series = this.dadosGraph
      this.chartOptions2.labels = this.lelabels
      this.dataLoaded = true
    } else {
      console.error('dadosGraph is empty or undefined')
    }
  },

  methods: {}
}
</script>
<style>
</style>
