<template>

  <v-row v-if="loadingData">
    <v-col>
      <v-alert
        v-if="dadosEstatisticos.curso && dadosEstatisticos.curso.nome"
        elevation="15">

        <v-row>
          <v-col>
            <!-- dados do curso-->
            <v-alert
              elevation="10"
              rounded="xxl">
              <!-- nome e unidade -->
              <v-row
                v-if="dadosEstatisticos.curso.unidade.nome"
                dense>
                <v-col><b>Nome:</b> {{ dadosEstatisticos.curso.nome }}</v-col>
                <v-col><b>Unidade:</b> {{ dadosEstatisticos.curso.unidade.nome }}</v-col>
              </v-row>

            </v-alert>

            <v-alert
              v-if="dadosEstatisticos.qtdperiodos.length > 0"
              elevation="10"
              rounded="xxl">
              <h2>Seleção de períodos</h2>
              <br>

              <v-btn
                :color="ajustaCorBtn('Todos')"
                class="white--text mr-3"
                rounded
                small
                @click="getEstatisticasCursoPorPeriodo('Todos')">Todos
              </v-btn>

              <v-btn
                v-for="(periodo, index) in dadosEstatisticos.qtdperiodos"
                :key="index"
                :color="ajustaCorBtn(periodo)"
                class="white--text mr-3"
                rounded
                small
                @click="getEstatisticasCursoPorPeriodo(periodo)">{{ periodo }}
              </v-btn>
            </v-alert>

            <v-alert
              v-else
              type="info"
              color="#015088"
              elevation="10"
              rounded="xxl">
              Esse curso não realizou nenhum atendimento.

            </v-alert>
          </v-col>
          <v-col>
            <!-- estatisticas básicas-->
            <v-alert
              class="pb-0 pt-4 mb-0"
              color="#015088"
              dense
              elevation="10"
              rounded="xxl">
              <v-row>
                <!-- atendimentos solucionados, deferidos e indeferidos-->
                <v-col>
                  <v-alert
                    elevation="10"
                    rounded="xxl">
                    <h2>Sumário de atendimentos</h2> <br>
                    <hr>
                    <br>
                    <b>Atendimentos solucionados: </b>{{ dadosEstatisticos.qtdatendimentossolucionados }}<br>
                    <b>Atendimentos deferidos: </b>{{ dadosEstatisticos.qtdatendimentosdeferidos }}<br>
                    <b>Atendimentos indeferidos: </b>{{ dadosEstatisticos.qtdatendimentosindeferidos }} <br><br>
                    <hr>
                    <br>
                    (série histórica)
                    <br><br>
                  </v-alert>
                </v-col>
                <!-- gráficos-->
                <v-col
                  v-if="dadosEstatisticos.qtdperiodos.length > 0"
                  class="d-flex justify-center">
                  <v-alert
                    elevation="10"
                    rounded="xxl">
                    <apexchart
                      :options="options"
                      :series="series"
                      width="340px"
                    />
                  </v-alert>
                </v-col>
              </v-row>

            </v-alert>
          </v-col>
        </v-row>

        <br>
        <hr>

        <br>

        <EstatisticaCursoIndividual
          v-if="Object.keys(dadosPorPeriodo).length > 0 && selectedPeriodo !== 'Todos'"
          :selected-data="dadosPorPeriodo" />

        <EstatisticaCursoTodos
          v-if = "selectedPeriodo === 'Todos' && dadosGerais.length > 0"
          :selected-data="dadosGerais" />

      </v-alert>
    </v-col>
  </v-row>

</template>

<script>
import { logoutMixin } from '@/mixins'
import { mapGetters } from 'vuex'
import config from '../../../http/config'
import EstatisticaCursoIndividual from './EstatisticaCursoIndividual.vue'
import EstatisticaCursoTodos from './EstatisticaCursoTodos.vue'

export default {
  name: 'EstatisticaCurso',
  components: {EstatisticaCursoIndividual, EstatisticaCursoTodos},
  mixins: [logoutMixin],
  props: {
    selectedCurso: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    configSis: config,
    loadingData: false,
    dadosEstatisticos: {
      curso: {
        nome: '',
        unidade: {}
      }
    },
    selectedPeriodo: 'Nenhum',
    options: {
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
        text: 'Atendimentos (Geral)',
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
    },
    series: [],
    dadosPorPeriodo: {},
    dadosGerais: {}
  }),

  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado'])
  },

  watch: {
  },

  async mounted () {
    await this.getEstatisticasCurso()
  },

  methods: {
    async getEstatisticasCurso () {
      try {
        const response = await this.$http.get('estatisticas/cursogeral/' + this.selectedCurso.id)
        this.dadosEstatisticos = response.data
        this.series = [
          this.dadosEstatisticos.qtdatendimentosdeferidos,
          this.dadosEstatisticos.qtdatendimentosindeferidos
        ]
      } catch (e) {
        console.log(e)
      } finally {
        this.loadingData = true
      }
    },

    async getEstatisticasCursoPorPeriodo (periodo) {
      this.selectedPeriodo = periodo
      this.dadosPorPeriodo = {}
      let objetoParaEnvio = {
        cursoId: this.selectedCurso.id,
        periodo: periodo
      }
      try {
        const response = await this.$http.post('estatisticas/cursoperiodo/', objetoParaEnvio)
        if (this.selectedPeriodo !== 'Todos') {
          this.dadosPorPeriodo = response.data
          this.dadosPorPeriodo.periodo = periodo
        } else {
          this.dadosGerais = response.data
        }
      } catch (e) {
        console.log(e)
      } finally {
        this.loadingData = true
      }
    },

    ajustaCorBtn (periodo) {
      if (this.selectedPeriodo === periodo) {
        return 'rgb(250, 115, 59)'
      } else {
        return '#015088'
      }
    }
  }
}
</script>

<style>
</style>
