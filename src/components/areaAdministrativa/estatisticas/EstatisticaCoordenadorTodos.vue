```vue
<template>
  <v-row>
    <v-col>
      <h2 class="text-center">Evolução Histórica</h2>
      <br>

      <!-- estatisticas básicas-->
      <v-alert
        class="pb-0 pt-4 mb-0"
        color="#015088"
        dense
        elevation="10"
        rounded="xxl">
        <v-row>
          <!-- atendimentos solucionados, deferidos e indeferidos-->
          <v-col cols="6">
            <v-alert
              elevation="10"
              rounded="xxl"
              class="pb-14">
              <h2>Sumário de atendimentos</h2> <br>
              <hr>
              <br>
              <b>Atendimentos solucionados: </b>{{ totalAtendimentos }}<br>
              <b>Atendimentos deferidos: </b>{{ totalDeferidos }}<br>
              <b>Atendimentos indeferidos: </b>{{ totalIndeferidos }} <br><br>
              <hr>
              <br>
            </v-alert>
          </v-col>
          <!-- gráficos-->
          <v-col cols="6">
            <v-alert
              elevation="10"
              rounded="xxl">
              <apexchart
                ref="barChart"
                :options="chartOptions"
                :series="chartSeries"
                height="350"
              />
            </v-alert>
          </v-col>
        </v-row>
      </v-alert>
    </v-col>
  </v-row>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
import { logoutMixin } from '@/mixins'
import { mapGetters } from 'vuex'
import config from '../../../http/config'

export default {
  name: 'EstatisticaCoordenadorTodos',
  components: {
    apexchart: VueApexCharts
  },
  mixins: [logoutMixin],
  props: {
    selectedData: {
      type: Array,
      required: true
    }
  },
  data: () => ({
    configSis: config
  }),

  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado']),

    // Calcula os totais
    totalAtendimentos () {
      return this.selectedData.reduce((sum, item) => sum + item.quantidadeTotal, 0)
    },
    totalDeferidos () {
      return this.selectedData.reduce((sum, item) => sum + item.quantidadeAtendimentosDeferidos, 0)
    },
    totalIndeferidos () {
      return this.selectedData.reduce((sum, item) => sum + item.quantidadeAtendimentosIndeferidos, 0)
    },

    // Prepara os dados para o gráfico
    chartSeries () {
      return [
        {
          name: 'Deferidos',
          data: this.selectedData.map(item => item.quantidadeAtendimentosDeferidos)
        },
        {
          name: 'Indeferidos',
          data: this.selectedData.map(item => item.quantidadeAtendimentosIndeferidos)
        },
        {
          name: 'Total',
          data: this.selectedData.map(item => item.quantidadeAtendimentosIndeferidos + item.quantidadeAtendimentosDeferidos)
        }
      ]
    },

    chartOptions () {
      return {
        chart: {
          type: 'bar',
          stacked: false
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          }
        },
        colors: ['#4aa64a', '#d82929', '#5374dd'],
        dataLabels: {
          enabled: true
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: this.selectedData.map(item => item.periodo_letivo),
          title: {
            text: 'Período Letivo'
          }
        },
        yaxis: {
          title: {
            text: 'Quantidade de Atendimentos'
          }
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + ' atendimentos'
            }
          }
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  }
}
</script>
