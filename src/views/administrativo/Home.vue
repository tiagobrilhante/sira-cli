<template>
  <v-main class="bgConfig">

    <!--Barra de navegação da área administrativa-->
    <BarraNavegacao></BarraNavegacao>

    <!-- container básico-->
    <v-container class="mb-0" fluid>
      <!-- Banner / seletor de seletor de ano / Tipo de Visualização-->
      <v-row>

        <v-col v-if="!mostraDash">
          <!--Banner (cabecalho e btn de navegação ano-->
          <v-alert
            class="p-5"
            elevation="21"
          >

            <v-row>
              <!--cabecalho-->
              <v-col>
                <h2>
                  <v-icon
                    class="mr-4"
                    size="36">
                    mdi-finance
                  </v-icon>
                  Controle de Indicadores
                </h2>
              </v-col>

              <!--btn Navega Ano-->
              <v-col class="text-center">
                <!--diminui ano, exibe ano corrente e aumenta ano-->
                <v-row>

                  <!-- dminui ano-->
                  <v-col class="text-right">
                    <v-btn class="primary" @click="changeYear('down')">
                      <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                  </v-col>

                  <!-- exibe ano selecionado-->
                  <v-col>
                    <v-alert class="mt-0 mb-0 pt-0 pb-0" dense elevation="10">
                      <h2>{{ anoCorrente }}</h2>
                    </v-alert>
                  </v-col>

                  <!-- aumenta ano-->
                  <v-col class="text-left">
                    <v-btn v-if="anoBase !== anoCorrente" class="primary" @click="changeYear('up')">
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>

                    <v-btn v-if="anoBase !== anoCorrente" class="success" @click="changeYear('corrente')">
                      <v-icon>mdi-calendar-today</v-icon>
                    </v-btn>

                  </v-col>

                </v-row>

              </v-col>

              <v-col></v-col>

            </v-row>

          </v-alert>

        </v-col>

        <v-col v-else>
          <!--Banner (cabecalho e btn de navegação ano-->
          <v-alert
            class="p-5"
            elevation="21"
          >

            <v-row>
              <!--cabecalho-->
              <v-col>
                <h2>
                  <v-icon
                    class="mr-4"
                    size="36">
                    mdi-monitor-dashboard
                  </v-icon>
                  CMA em Números - Central de Dashboards
                </h2>
              </v-col>

            </v-row>

          </v-alert>

        </v-col>

      </v-row>

      <!-- tipo de visualização-->
      <v-alert dense elevation="11">
        <v-row dense>
          <!-- btn de tipo de visualização-->
          <v-col>

            <!-- visão geral-->
            <v-btn v-if="dashboards.length > 0" :color="selectorTelaDash" small @click="showTable('Dashboards')">
              <v-icon class="mr-4" small>mdi-monitor-dashboard</v-icon>
              Dashboards
            </v-btn>

            <!-- visão geral-->
            <v-btn :color="selectorTelaVG" small @click="showTable('Visão Geral')">
              <v-icon class="mr-4" small>mdi-table-large</v-icon>
              Visão Geral
            </v-btn>

            <!-- formulário de cadastramento-->
            <v-btn v-if="usuarioLogado.tipo !== 'Auditor'" :color="selectorTelaForm" small
                   @click="showTable('Formulário')">
              <v-icon class="mr-4" small>mdi-form-textbox</v-icon>
              Formulário
            </v-btn>

          </v-col>
        </v-row>
      </v-alert>

      <!-- pesquisa por indicador-->
      <v-alert v-if="!mostraDash" class="pt-0 pb-0 mb-0" dense elevation="21">
        <PesquisaIndicador/>
      </v-alert>

      <!-- seletor por seção-->
      <v-alert v-if="(usuarioLogado.tipo === 'Administrador' || usuarioLogado.tipo === 'Auditor') && !mostraDash"
               class="p-5 mb-0 mt-4"
               elevation="21"
      >
        <v-row>
          <v-col>
            <v-btn v-for="secao in secoes" :key="secao.id" :color="ajustaCorBtn(secao.id)" class="mr-3"
                   @click="pegaIndicadoresSecao(secao)"> {{ secao.sigla }}
            </v-btn>
          </v-col>
        </v-row>
      </v-alert>

    </v-container>

    <v-container v-if="mostraDash" class="mt-0 pt-0" fluid>
      <v-alert elevation="12">
      <Dashboards :dados="dashboards"/>
      </v-alert>
    </v-container>

    <!--Gerenciamento de Valores (Lançamento de dados - FORM)-->
    <v-container v-if="mostraForm" class="mt-0 pt-1" fluid>
      <!--Seletor de mês e inserção de dados-->
      <v-alert
        elevation="21"
      >
        <v-row>

          <!-- seletor de mês-->
          <v-col cols="1">
            <v-alert color="blue lighten-2" elevation="5">
              <h3 class="text-center">Mês</h3>
            </v-alert>
            <v-btn
              v-for="(mes, index) in meses"
              :key="index"
              :class="getMonthButtonClass(mes)"
              :disabled="checaMesDisabled(index)"
              block
              @click="escolheMesIndicador(mes)"
            >
              {{ simplificaMes(mes) }}
            </v-btn>
          </v-col>

          <!--area de lançamento preciso  ARRUMAR ISSO AQUI-->
          <v-col v-if="!awaitData">

            <!-- alert seçao e mes ano referencia-->
            <v-alert color="green lighten-2" elevation="5">
              <!-- informa o mês e o ano de referência-->
              <h3 class="text-center">{{ selectedSecao.sigla }} - Referência: {{ this.mesCorrente }} de
                {{ this.anoCorrente }}</h3>
            </v-alert>

            <!-- expande / colapsa + pendência-->
            <v-alert color="blue lighten-2" dense>
              <v-row>
                <v-col class="mb-auto mt-auto" cols="3">

                  <v-btn :color="selectedSecao.categoria.some(categoria => !categoria.expanded) ? 'primary' : 'warning'"
                         small
                         @click="toggleAllCategories">
                    {{
                      selectedSecao.categoria.some(categoria => !categoria.expanded) ? 'Expandir Todas' : 'Ocultar Todas'
                    }}
                  </v-btn>

                </v-col>
                <!-- alertas de pendências-->
                <v-col>
                  <v-alert v-if="resultadoBusca.length > 0" class="mb-0" dense dismissible elevation="5" type="warning">
                    <v-row>
                      <v-col cols="2"><h3>Alertas</h3></v-col>
                      <v-col>
                  <span v-if="resultadoBusca.length > 0">
                    <span v-if="resultadoBusca[0].categorias_pendentes.length > 0">Pendências: {{
                        resultadoBusca[0].categorias_pendentes.length
                      }}</span>

                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        class="ml-2 pb-1"
                        v-bind="attrs"
                        @click="openDialogMostraPendencia()"
                        v-on="on"
                      >
                        mdi-information
                      </v-icon>
                    </template>
                    <span>Exibir informações sobre as pendências</span>
                  </v-tooltip>
                  </span>
                      </v-col>
                    </v-row>
                  </v-alert>
                </v-col>
              </v-row>
            </v-alert>

            <!-- inputs para lançamento de dados-->
            <v-row v-if="selectedSecao.categoria && selectedSecao.categoria.length > 0">
              <v-col v-for="categoria in selectedSecao.categoria" v-if="categoria.ativo && categoria.numindicador > 0"
                     :key="categoria.id" cols="3">
                <v-card class="pl-2 pr-2 pb-1 pt-1" color="blue lighten-4" elevation="21">
                  <v-alert :color="contaFaltasValor(categoria.indicadores) > 0 ? 'yellow' : 'black'"
                           class="pt-1 pb-1 mb-1"
                           dense>
                    <h4 :class="contaFaltasValor(categoria.indicadores) > 0 ? 'black--text' : 'white--text'">
                      {{ categoria.nome }}</h4>
                  </v-alert>

                  <!-- espaço para icones e colapsar expandir-->
                  <v-row>
                    <v-col>

                      <!-- colapsar e expandir-->
                      <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon
                            class="ml-2 pb-1"
                            v-bind="attrs"
                            @click="expandeOcultaCategoria(categoria)"
                            v-on="on"
                          >
                            {{ categoria.expanded ? 'mdi-minus-circle' : 'mdi-plus-circle' }}
                          </v-icon>
                        </template>
                        <span>Expandir</span>
                      </v-tooltip>

                      <!-- mostrar detalhes da categoria-->
                      <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon
                            class="ml-2 pb-1"
                            v-bind="attrs"
                            @click="openDialogMostraDetalhesCategoriaIndicador(categoria, 'da Categoria')"
                            v-on="on"
                          >
                            mdi-magnify
                          </v-icon>
                        </template>
                        <span>Exibir informações sobre a categoria</span>
                      </v-tooltip>

                      <!-- conta intens faltosos-->
                      <v-tooltip v-if="contaFaltasValor(categoria.indicadores) > 0" top>
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon
                            class="ml-2 pb-1"
                            v-bind="attrs"
                            v-on="on"
                          >
                            mdi-alert
                          </v-icon>
                        </template>
                        <span>Lançamentos faltosos</span>
                      </v-tooltip>

                      <!-- conta intens faltosos-->
                      <span v-if="contaFaltasValor(categoria.indicadores) > 0">{{
                          contaFaltasValor(categoria.indicadores)
                        }}</span>

                    </v-col>
                  </v-row>

                  <v-alert v-for="indicador in categoria.indicadores" v-if="categoria.expanded" :key="indicador.id"
                           :color="getColorForIndicator(indicador)" class="mt-0 ml-0 mr-0 mb-2" dense elevation="10">
                    <span class="ml-2">{{ indicador.nome }}  <!-- mostrar detalhes da categoria-->
                      <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon
                            class="ml-4 pb-1"
                            v-bind="attrs"
                            @click="openDialogMostraDetalhesCategoriaIndicador(indicador, 'do Indicador')"
                            v-on="on"
                          >
                            mdi-magnify
                          </v-icon>
                        </template>
                        <span>Exibir informações sobre o indicador</span>
                      </v-tooltip></span>
                    <v-text-field
                      :value="getIndicadorValor(indicador)"
                      class="mb-2"
                      dense
                      hide-details
                      rounded
                      solo
                      type="number"
                      @input="updateIndicadorValor(indicador, $event)"
                    ></v-text-field>
                    <span
                      v-if="indicador.indicador_valor.length === 0 || indicador.indicador_valor[0].valor === '' || indicador.indicador_valor[0].valor === undefined"
                      class="ml-2">Dado não lançado</span>
                    <span v-else class="ml-2">
          {{ indicador.indicador_valor[0].atualizado }}
        </span>
                  </v-alert>

                  <!-- grava valores-->
                  <v-btn v-if="categoria.expanded" :loading="loadingBtn" block class="primary" @click="gravaValores">
                    <v-icon class="mr-5">mdi-content-save-move</v-icon>
                    Gravar Valores
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>

            <!-- caso não tenha nenhum indicador cadastrado-->
            <v-row v-if="selectedSecao.categoria && !awaitData && selectedSecao.categoria.length === 0">
              <v-col>
                <v-alert class="text-center mt-5" elevation="15" type="warning">
                  Esta Seção ainda não possui indicadores cadastrados
                </v-alert>
              </v-col>
            </v-row>

          </v-col>

          <!-- carregamento de dados-->
          <v-col v-else>
            <v-alert color="yellow lighten-2">
              <v-progress-circular
                class="mr-10"
                color="primary"
                indeterminate
              ></v-progress-circular>
              Aguarde o carregamento de dados...
            </v-alert>
          </v-col>

        </v-row>

      </v-alert>
    </v-container>

    <!-- exibição de tabela de dados-->
    <v-container v-if="mostraTabela" class="mt-0 pt-1" fluid>
      <v-row>
        <v-col>
          <!-- Cabeçalho-->
          <v-alert v-if="tabelaDados.length !== 0" color="white">
            <v-container fluid>
              <v-row>
                <v-col>
                  <h2>Dados Acumulados - {{ selectedSecao.sigla }}</h2>
                </v-col>
              </v-row>
            </v-container>

            <!-- visualização por categoria-->
            <CategoriaView :anoCorrente="anoCorrente" :resultadoBusca="resultadoBusca"
                           :selectedSecao="selectedSecao"></CategoriaView>

          </v-alert>

        </v-col>
      </v-row>
    </v-container>

    <!--Dialog para ver pendências-->
    <v-dialog v-model="dialogMostraPendencia" max-width="800px">
      <v-card>
        <v-card-title class="justify-center" primary-title>
          <v-icon
            class="mr-4">
            fa fa-exclamation-triangle
          </v-icon>
          Pendências
          <v-icon
            class="ml-4">
            fa fa-exclamation-triangle
          </v-icon>

        </v-card-title>
        <v-card-text>
          <hr>
          <br>
          <h2>Foram encontradas as seguintes pendências:</h2>
          <br>
          <hr>
          <br>

          <ul v-if="resultadoBusca.length > 0">
            <li v-for="categoria in resultadoBusca[0].categorias_pendentes" :key="categoria.id" class="mb-3">
              {{ categoria.categoria }}
              <ul>
                <li v-for="indicador in categoria.indicadores_pendentes" :key="indicador.id">
                  {{ indicador.indicador }} - Meses Pendentes: ( <span v-for="(mes, index) in indicador.meses_pendentes"
                                                                       :key="index">{{ transformaMes(mes) }} </span> )
                </li>
              </ul>
            </li>
          </ul>
        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" @click="dialogMostraPendencia = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Dialog para ver detalhes de uma categoria-->
    <v-dialog v-model="dialogMostraDetalheCatInd" max-width="30%">
      <v-card>
        <v-card-title class="justify-center" primary-title>
          Detalhes {{ selectedDetalheCatInd[1] }}
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col v-if="selectedDetalheCatInd[1] === 'da Categoria'">
              <b>Nome: </b> {{ selectedDetalheCatInd[0].nome }}<br>
              <b>Natureza: </b> {{ selectedDetalheCatInd[0].natureza }}<br>
              <b>Mapeamento de total (Mensal): </b> {{ selectedDetalheCatInd[0].mapeamento_total_mensal }}<br>
              <b>Mapeamento de total (Anual): </b> {{ selectedDetalheCatInd[0].mapeamento_total_anual }}<br>
              <b>Periodicidade: </b> {{ selectedDetalheCatInd[0].periodicidade }}<br>
              <b>Numero de Indicadores: </b> {{ selectedDetalheCatInd[0].numindicador }}<br>
            </v-col>
            <v-col v-else>

              <span v-if="selectedDetalheCatInd[0]">
                <b>Nome: </b> {{ selectedDetalheCatInd[0].nome }}<br>
                <b>Meta: </b> <span v-if="selectedDetalheCatInd[0].meta">Possui meta</span> <span
                v-else>Não possui meta</span><br>
                <span v-if="selectedDetalheCatInd[0].meta">
                  <b>Tendência: </b> {{ selectedDetalheCatInd[0].tendencia }}<br>
                  <b>Objetivo: </b> {{ selectedDetalheCatInd[0].objetivo }}<br>
                  <b>Verde: </b> <span v-if="selectedDetalheCatInd[0].tendencia === 'Quanto maior melhor'">Acima ou igual a </span><span
                  v-else>Abaixo ou igual a: </span> {{ selectedDetalheCatInd[0].green }}<br>
                  <b>Amarelo: </b> entre {{ selectedDetalheCatInd[0].yellow_1 }} e {{
                    selectedDetalheCatInd[0].yellow_2
                  }}<br>
                  <b>Vermelho: </b> <span v-if="selectedDetalheCatInd[0].tendencia === 'Quanto maior melhor'">Abaixo ou igual a </span><span
                  v-else>Acima ou igual a </span>{{ selectedDetalheCatInd[0].red }}
                </span>
              </span>

            </v-col>
          </v-row>

        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" @click="dialogMostraDetalheCatInd = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-main>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'
// import moment from 'moment-timezone'
import BarraNavegacao from '../../components/barra-navegacao/BarraNavegacao.vue'
import CategoriaView from '../../components/categoria/CategoriaView.vue'
import PesquisaIndicador from '../../components/gerenciamentoIndicadores/PesquisaIndicador.vue'
import Grafico from './Grafico.vue'
import Dashboards from '../../components/dashboard/Dashboards.vue'

export default {
  name: 'home',
  mixins: [logoutMixin],
  components: {BarraNavegacao, Grafico, CategoriaView, PesquisaIndicador, Dashboards},
  data: () => ({
    configSis: config,
    anoCorrente: 0,
    anoBase: 0,
    mesCorrente: '',
    diaCorrente: '',
    secoes: [],
    selectedSecao: {},
    meses: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    mostraGrafico: {},
    capturaIndexMes: 0,
    awaitData: true,
    headersDados: [
      {text: ':---', align: 'start', value: 'categoria'},
      {text: 'Indicador', align: 'start', value: 'indicador'},
      {text: 'Janeiro', align: 'start', value: 'mes_1'},
      {text: 'Fevereiro', align: 'start', value: 'mes_2'},
      {text: 'Março', align: 'start', value: 'mes_3'},
      {text: 'Abril', align: 'start', value: 'mes_4'},
      {text: 'Maio', align: 'start', value: 'mes_5'},
      {text: 'Junho', align: 'start', value: 'mes_6'},
      {text: 'Julho', align: 'start', value: 'mes_7'},
      {text: 'Agosto', align: 'start', value: 'mes_8'},
      {text: 'Setembro', align: 'start', value: 'mes_9'},
      {text: 'Outubro', align: 'start', value: 'mes_10'},
      {text: 'Novembro', align: 'start', value: 'mes_11'},
      {text: 'Dezembro', align: 'start', value: 'mes_12'}
    ],
    getResumo: [],
    search: '',
    mostraForm: true,
    mostraTabela: false,
    mostraDash: false,
    secaoCorrente: '',
    corGeral: 'warning',
    corCategoria: 'secondary',
    loadingBtn: false,
    resultadoBusca: [],
    dialogMostraPendencia: false,
    dialogMostraDetalheCatInd: false,
    selectedDetalheCatInd: [],
    selectorTelaVG: 'success',
    selectorTelaForm: 'success',
    selectorTelaScreen: 'success',
    selectorTelaDash: 'success',
    dashboards: []
  }),
  computed: {
    ...mapGetters(['usuarioLogado']),

    tabelaDados () {
      let result = []
      const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

      this.getResumo.forEach(resumo => {
        resumo.indicadores.forEach(ind => {
          let row = {
            categoria: resumo.categoria.nome,
            indicador: ind.indicador.nome,
            objeto_indicador: ind.indicador
          }
          months.forEach(month => {
            const monthData = ind.valor.find(val => val.mes === month)
            row[`mes_${month}`] = monthData ? monthData.valor : ''
          })

          result.push(row)
        })
      })
      return result
    }
  },
  created () {
  },
  watch: {},

  mounted () {
    this.getCurrentDate()

    this.asyncMounted()

    this.checaTipoUsuario()
  },
  methods: {
    checaTipoUsuario () {
      try {
        this.$http.get('dashboard/completo')
          .then(response => {
            this.dashboards = response.data
            if (this.dashboards.length > 0) {
              this.showTable('Dashboards')
            } else {
              if (this.usuarioLogado.tipo === 'Administrador' || this.usuarioLogado.tipo === 'Auditor') {
                this.showTable('Visão Geral')
              } else {
                this.showTable('Formulário')
              }
            }
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    async asyncMounted () {
      await this.getSecoes()
    },

    // tenho que melhorar isso e passar o mes e ano
    async getSecoes () {
      if (this.usuarioLogado.tipo === 'Administrador' || this.usuarioLogado.tipo === 'Auditor') {
        try {
          this.$http.get('secao/simples')
            .then(response => {
              this.secoes = response.data
              this.getIndicadoresVigentes(this.secoes[0].id, this.mesCorrente, this.anoCorrente, 'consulta')
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          console.log(e)
        }
      } else {
        try {
          this.$http.get('secao/unitaria/' + this.usuarioLogado.secao_id)
            .then(response => {
              this.getIndicadoresVigentes(response.data.id, this.mesCorrente, this.anoCorrente, 'consulta')
              this.getResumoVigente(response.data.id, this.anoCorrente)
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          console.log(e)
        }
      }
    },

    async getIndicadoresVigentes (secaoId, mes, ano, tipo, objeto) {
      if (tipo === 'consulta') {
        let objetoParaEnvio = {
          mes: mes,
          ano: ano,
          secao_id: secaoId
        }
        try {
          this.$http.post('indicadores/secao/refinado', objetoParaEnvio)
            .then(response => {
              this.selectedSecao = response.data
              this.getResumoVigente(secaoId, ano)
              this.awaitData = false

              this.fazPesquisaPendencia()
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          console.log(e)
        }
      }
    },

    async getResumoVigente (secaoId, ano) {
      let objetoParaEnvio = {}
      objetoParaEnvio['secao_id'] = secaoId
      objetoParaEnvio['ano'] = ano
      try {
        this.$http.post('valorindicador/resumo', objetoParaEnvio)
          .then(response => {
            this.getResumo = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    pegaIndicadoresSecao (secao) {
      this.selectedSecao = {}
      this.awaitData = true
      this.getIndicadoresVigentes(secao.id, this.mesCorrente, this.anoCorrente, 'consulta').then(() => {
      }).catch(error => {
        console.error('Erro ao buscar indicadores:', error)
        this.awaitData = false
      })
    },

    getIndicadorValor (indicador) {
      if (indicador.indicador_valor.length > 0) {
        return indicador.indicador_valor[0].valor
      }
      return null
    },

    updateIndicadorValor (indicador, valor) {
      if ((valor === null || valor === '') && indicador.indicador_valor[0].id === null) {
        this.$set(indicador, 'indicador_valor', [])
      } else {
        if (indicador.indicador_valor.length > 0) {
          indicador.indicador_valor[0].valor = valor
        } else {
          this.$set(indicador, 'indicador_valor', [{
            id: null,
            valor: valor,
            mes: this.mesCorrente,
            ano: this.anoCorrente,
            indicador_id: indicador.id,
            atualizado: this.formatDateTime(new Date())
          }])
        }
      }
    },

    gravaValores () {
      this.selectedSecao.ano = this.anoCorrente
      this.selectedSecao.mes = this.mesCorrente
      this.loadingBtn = true
      try {
        this.$http.post('valorindicador', this.selectedSecao)
          .then((response) => {
            this.loadingBtn = false
            this.$toastr.s(
              'Indicadores lançados com sucesso', 'Sucesso!'
            )
            this.selectedSecao = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    getMonthButtonClass (mes) {
      // Se for o mês corrente, retorna 'primary', caso contrário, 'success'
      return {
        secondary: this.mesCorrente === mes,
        success: this.mesCorrente !== mes,
        'mb-3': true // Mantém a classe de margem
      }
    },

    changeYear (direction) {
      this.awaitData = true
      if (direction === 'up') {
        this.anoCorrente++
      } else if (direction === 'corrente') {
        this.anoCorrente = this.anoBase
        this.mesCorrente = this.meses[this.getPreviousMonth() - 1]
      } else {
        this.anoCorrente--
      }

      this.$nextTick(() => {
        this.pegaIndicadoresSecao(this.selectedSecao)
      })
    },

    formatDateTime (isoString) {
      if (isoString === undefined) {
        return 'Sem Lançamentos'
      } else {
        const date = new Date(isoString)
        // Formata a data
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0') // Janeiro é 0!
        const year = date.getFullYear()

        // Formata a hora
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const seconds = date.getSeconds().toString().padStart(2, '0')

        return `${day}/${month}/${year} (${hours}:${minutes}:${seconds})`
      }
    },

    escolheMesIndicador (mes) {
      this.resultadoBusca = []
      this.awaitData = true
      this.mesCorrente = mes
      this.pegaIndicadoresSecao(this.selectedSecao)
    },

    checaMesDisabled (index) {
      if (this.anoBase === this.anoCorrente) {
        return this.capturaIndexMes < index
      } else {
        return false
      }
    },

    getCurrentDate () {
      // Obtém a data atual
      const currentDate = new Date()

      // Define os meses
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ]

      this.diaCorrente = currentDate.getDate()

      // Calcula o mês e ano de referência
      let mesIndex = currentDate.getMonth() - 1
      let anoRef = currentDate.getFullYear()

      // Ajusta o ano se o mês for janeiro
      if (mesIndex === 0) {
        mesIndex = 11
        anoRef -= 1
      }

      this.capturaIndexMes = mesIndex

      this.mesCorrente = months[mesIndex] // Retorna o mês anterior como texto
      this.anoCorrente = anoRef // Retorna o ano de referência
      this.anoBase = anoRef // Retorna o ano de referência
    },

    getColorForIndicator (indicador) {
      if (indicador.meta) {
        if (indicador.indicador_valor.length > 0) {
          const value = parseFloat(indicador.indicador_valor[0].valor)
          if (!isNaN(value)) {
            const lowerYellow = Math.min(indicador.yellow_1, indicador.yellow_2)
            const higherYellow = Math.max(indicador.yellow_1, indicador.yellow_2)

            if (indicador.tendencia === 'Quanto maior melhor') {
              if (value >= indicador.green) {
                return 'green' // Verde, se maior ou igual ao limite green
              } else if (value >= lowerYellow && value <= higherYellow) {
                return 'yellow' // Amarelo entre yellow_2 e green
              } else {
                return 'red' // Vermelho para valores abaixo de yellow_2
              }
            } else {
              if (value <= indicador.green) {
                return 'green' // Verde, se maior ou igual ao limite green
              } else if (value >= lowerYellow && value <= higherYellow) {
                return 'yellow' // Amarelo entre yellow_2 e green
              } else {
                return 'red' // Vermelho para valores abaixo de yellow_2
              }
            }
          }
        }
        return 'grey' // Cor padrão se o valor não for válido
      } else {
        return 'blue'
      }
    },

    ajustaCorBtn (id) {
      if (this.selectedSecao.id === id) {
        return 'secondary'
      } else {
        return 'primary'
      }
    },

    simplificaMes (mes) {
      if (mes === 'Janeiro') {
        return 'Jan'
      } else if (mes === 'Fevereiro') {
        return 'Fev'
      } else if (mes === 'Março') {
        return 'Mar'
      } else if (mes === 'Abril') {
        return 'Abr'
      } else if (mes === 'Maio') {
        return 'Mai'
      } else if (mes === 'Junho') {
        return 'Jun'
      } else if (mes === 'Julho') {
        return 'Jul'
      } else if (mes === 'Agosto') {
        return 'Ago'
      } else if (mes === 'Setembro') {
        return 'Set'
      } else if (mes === 'Outubro') {
        return 'Out'
      } else if (mes === 'Novembro') {
        return 'Nov'
      } else {
        return 'Dez'
      }
    },

    getColorForIndicatorTable (indicador, valor) {
      if (indicador.meta) {
        const lowerYellow = Math.min(indicador.yellow_1, indicador.yellow_2)
        const higherYellow = Math.max(indicador.yellow_1, indicador.yellow_2)

        if (indicador.tendencia === 'Quanto maior melhor') {
          if (valor >= indicador.green) {
            return 'green' // Verde, se maior ou igual ao limite green
          } else if (valor >= lowerYellow && valor <= higherYellow) {
            return 'yellow' // Amarelo entre yellow_2 e green
          } else {
            return 'red' // Vermelho para valores abaixo de yellow_2
          }
        } else {
          if (valor <= indicador.green) {
            return 'green' // Verde, se maior ou igual ao limite green
          } else if (valor >= lowerYellow && valor <= higherYellow) {
            return 'yellow' // Amarelo entre yellow_2 e green
          } else {
            return 'red' // Vermelho para valores abaixo de yellow_2
          }
        }
      }
    },

    showTable (qual) {
      if (qual === 'Visão Geral') {
        this.mostraForm = false
        this.mostraTabela = true
        this.mostraDash = false
        this.selectorTelaVG = 'secondary'
        this.selectorTelaForm = 'success'
        this.selectorTelaScreen = 'success'
        this.selectorTelaDash = 'success'
      } else if (qual === 'Formulário') {
        this.mostraForm = true
        this.mostraDash = false
        this.mostraTabela = false
        this.selectorTelaVG = 'success'
        this.selectorTelaForm = 'secondary'
        this.selectorTelaScreen = 'success'
        this.selectorTelaDash = 'success'
      } else {
        this.mostraForm = false
        this.mostraDash = true
        this.mostraTabela = false
        this.selectorTelaVG = 'success'
        this.selectorTelaForm = 'success'
        this.selectorTelaScreen = 'success'
        this.selectorTelaDash = 'secondary'
      }
    },

    getPreviousMonth () {
      const currentDate = new Date()
      currentDate.setMonth(currentDate.getMonth())
      return currentDate.getMonth()// JavaScript months are 0-indexed, so add 1 for a human-readable format
    },

    async fazPesquisaPendencia () {
      this.resultadoBusca = []
      let objetoParaEnvio = {}
      objetoParaEnvio['mes_limite'] = this.mesCorrente
      objetoParaEnvio['ano'] = this.anoCorrente
      objetoParaEnvio['secao'] = this.selectedSecao.id
      objetoParaEnvio['tipo'] = 'form'
      try {
        this.$http.post('ferramenta/relatoriopendencias', objetoParaEnvio)
          .then(response => {
            this.resultadoBusca = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    openDialogMostraPendencia () {
      this.dialogMostraPendencia = true
    },

    transformaMes (mes) {
      if (mes === 1) return 'Janeiro'
      if (mes === 2) return 'Fevereiro'
      if (mes === 3) return 'Março'
      if (mes === 4) return 'Abril'
      if (mes === 5) return 'Maio'
      if (mes === 6) return 'Junho'
      if (mes === 7) return 'Julho'
      if (mes === 8) return 'Agosto'
      if (mes === 9) return 'Setembro'
      if (mes === 10) return 'Outubro'
      if (mes === 11) return 'Novembro'
      if (mes === 12) return 'Dezembro'
    },

    expandeOcultaCategoria (categoria) {
      this.$set(categoria, 'expanded', !categoria.expanded)
    },

    toggleAllCategories () {
      const expandAll = this.selectedSecao.categoria.some(categoria => !categoria.expanded)
      this.selectedSecao.categoria.forEach(categoria => {
        this.$set(categoria, 'expanded', expandAll)
      })
    },

    contaFaltasValor (indicadores) {
      let contador = 0
      for (let i = 0; i < indicadores.length; i++) {
        contador += indicadores[i].indicador_valor.length
      }
      return indicadores.length - contador
    },

    openDialogMostraDetalhesCategoriaIndicador (objeto, tipo) {
      this.selectedDetalheCatInd = [objeto, tipo]
      this.dialogMostraDetalheCatInd = true
    }
  }
}
</script>

<style>

.bgConfig {
  background-color: #CFE0BC !important;
}

.v-row-group__header {
  background-color: #b6c378 !important; /* Cor de fundo para a linha agrupada */
  font-weight: bold; /* Texto em negrito */
  cursor: pointer; /* Cursor para indicar que é clicável */
}

.bgred {
  background-color: red !important;
}
</style>
