<template>
  <v-row>
    <v-col>
      <h2 class="text-center">Período Considerado - {{ selectedData.periodo }}</h2>
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
              <h2>Sumário de atendimentos - {{ selectedData.periodo }}</h2> <br>
              <hr>
              <br>
              <b>Atendimentos solucionados: </b>{{ selectedData.quantidadeAtendimentosDeferidos + selectedData.quantidadeAtendimentosIndeferidos }}<br>
              <b>Atendimentos deferidos: </b>{{ selectedData.quantidadeAtendimentosDeferidos }}<br>
              <b>Atendimentos indeferidos: </b>{{ selectedData.quantidadeAtendimentosIndeferidos }} <br><br>
              <hr>
              <br>

            </v-alert>
          </v-col>
          <!-- gráficos-->
          <v-col
            cols="6">
            <v-alert
              elevation="10"
              rounded="xxl">
              <apexchart
                :options="chartOptions"
                :series="series"
                class="d-flex justify-center"
                width="340px"
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
  name: 'EstatisticaUnidadeIndividual',
  components: {
    apexchart: VueApexCharts
  },
  mixins: [logoutMixin],
  props: {
    selectedData: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    configSis: config,
    loadingData: false,
    series: []
  }),

  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado']),
    chartOptions () {
      return {
        labels: ['Deferido', 'Indeferido'],
        colors: ['#4aa64a', '#d82929'],
        legend: {
          show: true,
          position: 'bottom',
          onItemHover: {
            highlightDataSeries: true
          },
          fontSize: '16px'
        },
        chart: {
          type: 'pie'
        },
        title: {
          text: `Atendimentos - ${this.selectedData.periodo}`,
          align: 'center',
          style: {
            fontSize: '24px' // Increase the font size of the title
          }
        },
        dataLabels: {
          style: {
            fontSize: '16px' // Increase the font size of the data labels
          }
        }
      }
    }
  },

  watch: {},

  mounted () {
    this.getEstatisticasCoordenador()
  },

  methods: {
    getEstatisticasCoordenador () {
      this.series = [
        this.selectedData.quantidadeAtendimentosDeferidos,
        this.selectedData.quantidadeAtendimentosIndeferidos
      ]
    }
  }
}
</script>

<style>
</style>
