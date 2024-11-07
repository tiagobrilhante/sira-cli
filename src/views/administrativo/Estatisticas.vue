<template>
  <v-main
    v-if="usuarioLogado.tipo !== 'Aluno'"
    class="bgConfig">

    <BarraNavegacao/>

    <!--banner -->
    <v-container
      v-if="usuarioEstaLogado"
      class="pt-5"
      fluid>

      <!--Banner-->
      <v-alert
        class="p-5"
        color="#015088"
        elevation="21"
      >
        <v-row>
          <!--banner-->
          <v-col
            class="white--text"
            cols="9">
            <h2>
              <v-icon
                class="mr-4"
                color="white"
                size="36">
                mdi-chart-line
              </v-icon>
              Estatísticas
            </h2>

          </v-col>
          <v-col />
        </v-row>
      </v-alert>

      <!-- dados estatisticos gerais e gráfico de pizza-->
      <v-alert
        color="#015088"
        class="white--text">

        <v-row>

          <!-- dados estatisticos gerais-->
          <v-col cols="8">

            <h3>Dados Gerais (Total Acumulado)</h3>
            <br>
            <hr>
            <br>

            <!-- solicitacoes criadas e solicitacoes resolvidas-->
            <v-row dense>

              <!-- solicitacoes criadas-->
              <v-col>
                <b>Quantidade de Solicitações criadas: </b> {{ dadosEstatisticos.qtdatendimentoscriados }}
              </v-col>

              <!-- solicitacoes resolvidas-->
              <v-col>
                <b>Quantidade de Solicitações resolvidas: </b> {{ dadosEstatisticos.qtdatendimentosresolvidos }}
              </v-col>
            </v-row>

            <!-- solicitacoes deferidas e solicitacoes indeferidas-->
            <v-row dense>

              <!-- solicitacoes deferidas-->
              <v-col>
                <b>Quantidade de Solicitações Deferidas: </b> {{ dadosEstatisticos.qtdatendimentosdeferidos }}
              </v-col>

              <!-- solicitacoes indeferidas-->
              <v-col>
                <b>Quantidade de Solicitações Indeferidas: </b> {{ dadosEstatisticos.qtdatendimentosindeferidos }}
              </v-col>
            </v-row>

            <!-- solicitacoes em aberto-->
            <v-row dense>

              <!-- solicitacoes em aberto-->
              <v-col>
                <b>Quantidade de Solicitações sem Solução: </b> {{ dadosEstatisticos.qtdatendimentosemaberto }}
              </v-col>

              <v-col/>
            </v-row>

            <br>
            <hr>
            <br>

            <!--unidades e cursos abrangidos-->
            <v-row
              v-if="dadosEstatisticos.unidades && usuarioLogado.tipo === 'Administrador Geral'"
              dense>

              <!-- unidades abrangidas-->
              <v-col>
                <b>Unidades Abrangidas: </b> {{ dadosEstatisticos.unidades.length }}
              </v-col>

              <!-- cursos abrangidos-->
              <v-col>
                <b>Cursos Abrangidos: </b> {{ dadosEstatisticos.cursos.length }}
              </v-col>

            </v-row>

            <!--coordenadores envolvidos e alunos cadastrados-->
            <v-row
              v-if="dadosEstatisticos.coordenadores && usuarioLogado.tipo === 'Administrador Geral'"
              dense>

              <!-- coordenadores envolvidos-->
              <v-col>
                <b>Coordenadores Envolvidos: </b> {{ dadosEstatisticos.coordenadores.length }}
              </v-col>

              <!-- alunos cadastrados-->
              <v-col>
                <b>Alunos Cadastrados: </b> {{ dadosEstatisticos.qtdalunos }}
              </v-col>

            </v-row>

            <!-- periodos em uso-->
            <v-row
              v-if="usuarioLogado.tipo === 'Administrador Geral'"
              dense>
              <v-col>
                <b>Períodos em uso: </b> {{ dadosEstatisticos.qtdperiodos }}
              </v-col>
            </v-row>

          </v-col>

          <!-- grafico de pizza-->
          <v-col >
            <v-alert
              class="d-flex justify-center"
              elevation="10"
              rounded="xxl">
              <apexchart
                :options="options"
                :series="series"
                width="380"
              />
            </v-alert>
          </v-col>

        </v-row>

      </v-alert>

      <!-- filtros - unidade - curso - coordenador-->
      <v-alert elevation="10">
        <h3>Filtros:</h3>
        <br>
        <hr>
        <br>
        <v-row>
          <!-- por unidade-->
          <v-col v-if="usuarioLogado.tipo === 'Administrador Geral'">
            <v-btn
              :color="ajustaCorBtnNivelMax('unidade')"
              block
              rounded
              class="white--text"
              @click="ajusteSeletor('unidade')">
              Por unidades
            </v-btn>
          </v-col>

          <!-- por curso-->
          <v-col>
            <v-btn
              :color="ajustaCorBtnNivelMax('curso')"
              block
              rounded
              class="white--text"
              @click="ajusteSeletor('curso')">
              Por curso
            </v-btn>
          </v-col>

          <!-- por coordenador-->
          <v-col>
            <v-btn
              :color="ajustaCorBtnNivelMax('coordenador')"
              block
              rounded
              class="white--text"
              @click="ajusteSeletor('coordenador')">
              Por coordenador
            </v-btn>
          </v-col>

        </v-row>
      </v-alert>

      <!-- seletor de unidades-->
      <v-alert
        v-if="seletorUnidade"
        elevation="10">

        <h2 class="mb-3">Selecione a unidade</h2>

        <v-btn
          v-for="unidade in dadosEstatisticos.unidades"
          :key="unidade.id"
          :color="ajustaCorBtnSelecao(unidade.id)"
          rounded
          class="white--text mr-4 mb-3"
          @click="openUnidade(unidade)">
          {{ unidade.nome }}
        </v-btn>

      </v-alert>

      <!-- seletor de Curso-->
      <v-alert
        v-if="seletorCurso"
        elevation="10">

        <h2 class="mb-3">Selecione o Curso</h2>

        <v-btn
          v-for="curso in dadosEstatisticos.cursos"
          :key="curso.id"
          :color="ajustaCorBtnSelecao(curso.id)"
          rounded
          class="white--text mr-4 mb-3"
          @click="openCurso(curso)">
          {{ curso.nome }} ( {{ curso.unidade.nome }} )
        </v-btn>

      </v-alert>

      <!-- seletor de coordenadores-->
      <v-alert
        v-if="seletorCoordenador"
        elevation="10">

        <h2 class="mb-3">Selecione o Coordenador</h2>

        <v-btn
          v-for="coordenador in dadosEstatisticos.coordenadores"
          :key="coordenador.id"
          :color="ajustaCorBtnSelecao(coordenador.id)"
          rounded
          class="white--text mr-4 mb-3"
          @click="openCoordenador(coordenador)">
          {{ coordenador.nome }}
        </v-btn>

      </v-alert>

      <!-- retorno -->
      <EstatisticaUnidade
        v-if="areaUnindade"
        :selected-unidade = "selectedUnidade"/>

      <EstatisticaCurso
        v-if="areaCurso"
        :selected-curso = "selectedCurso"/>

      <EstatisticaCoordenador
        v-if="areaCoordenador"
        :selected-coordenador = "selectedCoordenador"/>

    </v-container>

  </v-main>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'
import BarraNavegacao from '../../components/barra-navegacao/BarraNavegacao.vue'
import EstatisticaUnidade from '../../components/areaAdministrativa/estatisticas/EstatisticaUnidade.vue'
import EstatisticaCurso from '../../components/areaAdministrativa/estatisticas/EstatisticaCurso.vue'
import EstatisticaCoordenador from '../../components/areaAdministrativa/estatisticas/EstatisticaCoordenador.vue'
import { nextTick } from 'vue'

export default {
  name: 'Estatisticas',
  components: {EstatisticaUnidade, BarraNavegacao, EstatisticaCurso, EstatisticaCoordenador},
  mixins: [logoutMixin],
  data: () => ({
    configSis: config,
    dadosEstatisticos: {},
    seletorUnidade: false,
    seletorCurso: false,
    seletorCoordenador: false,
    areaUnindade: false,
    areaCurso: false,
    areaCoordenador: false,
    selectedUnidade: {},
    selectedCurso: {},
    selectedCoordenador: {},
    options: {
      labels: ['Aberto', 'Deferido', 'Indeferido'],
      colors: ['#646762', '#4aa64a', '#d82929'],
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
        text: 'Situação de Atendimento (Geral)',
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
    series: []

  }),
  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado'])
  },
  watch: {},
  created () {
  },

  async mounted () {
    this.cospeAluno()
    await this.getEstatisticas()
  },
  methods: {
    async getEstatisticas () {
      try {
        const response = await this.$http.get('estatisticas')
        this.dadosEstatisticos = response.data
        this.series = [
          this.dadosEstatisticos.qtdatendimentosemaberto,
          this.dadosEstatisticos.qtdatendimentosdeferidos,
          this.dadosEstatisticos.qtdatendimentosindeferidos
        ]
      } catch (e) {
        console.log(e)
      }
    },

    cospeAluno () {
      if (this.usuarioLogado.tipo === 'Aluno') {
        this.$store.commit('DESLOGAR_USUARIO')
        this.$router.push({name: 'index'})
      }
    },

    ajusteSeletor (tipo) {
      this.areaUnindade = false
      this.areaCurso = false
      this.areaCoordenador = false
      this.selectedUnidade = {}
      this.selectedCurso = {}
      this.selectedCoordenador = {}

      if (tipo === 'unidade') {
        this.seletorUnidade = true
        this.seletorCurso = false
        this.seletorCoordenador = false
      } else if (tipo === 'curso') {
        this.seletorCurso = true
        this.seletorUnidade = false
        this.seletorCoordenador = false
      } else {
        this.seletorCoordenador = true
        this.seletorUnidade = false
        this.seletorCurso = false
      }
    },

    openUnidade (unidade) {
      this.areaUnindade = false
      this.areaCurso = false
      this.areaCoordenador = false
      this.selectedUnidade = {}
      this.selectedCurso = {}
      this.selectedCoordenador = {}
      nextTick(() => {
        this.areaUnindade = true
        this.areaCurso = false
        this.areaCoordenador = false
        this.selectedUnidade = unidade
      })
    },

    openCurso (curso) {
      this.areaUnindade = false
      this.areaCurso = false
      this.areaCoordenador = false
      this.selectedUnidade = {}
      this.selectedCurso = {}
      this.selectedCoordenador = {}
      nextTick(() => {
        this.areaUnindade = false
        this.areaCurso = true
        this.areaCoordenador = false
        this.selectedCurso = curso
      })
    },

    openCoordenador (coordenador) {
      this.areaUnindade = false
      this.areaCurso = false
      this.areaCoordenador = false
      this.selectedUnidade = {}
      this.selectedCurso = {}
      this.selectedCoordenador = {}
      nextTick(() => {
        this.areaUnindade = false
        this.areaCurso = false
        this.areaCoordenador = true
        this.selectedCoordenador = coordenador
      })
    },

    ajustaCorBtnSelecao (quem) {
      if (this.seletorCoordenador) {
        return quem === this.selectedCoordenador.id ? 'rgb(250, 115, 59)' : '#015088'
      } else if (this.seletorCurso) {
        return quem === this.selectedCurso.id ? 'rgb(250, 115, 59)' : '#015088'
      } else {
        return quem === this.selectedUnidade.id ? 'rgb(250, 115, 59)' : '#015088'
      }
    },

    ajustaCorBtnNivelMax (tipo) {
      if (tipo === 'unidade' && this.seletorUnidade) {
        return 'rgb(250, 115, 59)'
      } else if (tipo === 'curso' && this.seletorCurso) {
        return 'rgb(250, 115, 59)'
      } else if (tipo === 'coordenador' && this.seletorCoordenador) {
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
