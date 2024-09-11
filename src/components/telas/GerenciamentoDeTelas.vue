<template>
  <v-main class="bgConfig">

    <!--Barra de navegação da área administrativa-->
    <BarraNavegacao></BarraNavegacao>
    <!-- container básico-->
    <v-container class="mb-0" fluid>
      <!-- Banner / seletor de seletor de ano / Tipo de Visualização-->
      <v-row dense>

        <v-col>
          <!--Banner (cabecalho e btn de voltar-->
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
                    mdi-chart-pie
                  </v-icon>
                  Gerenciamento de Telas
                </h2>
              </v-col>

              <!-- btn de voltar-->
              <v-col class="text-right">

                <!-- voltar-->
                <v-btn color="primary" to="/home">
                  <v-icon class="mr-4" small>mdi-home</v-icon>
                  Voltar
                </v-btn>

              </v-col>

            </v-row>

          </v-alert>

        </v-col>

      </v-row>

      <!-- area de retorno da tela-->
      <Tela v-if="Object.keys(resultadoMontagem).length > 0" :objetoPesquisa="objetoPesquisa"
            :resultado="resultadoMontagem" :tipoGraph="tipoGraph" @ajustaTelasSalvas="handleResetaTelaSalva"
            @resetaTela="handleResetaTela"/>

      <!-- área de montagem da tela-->
      <v-row v-else class="mt-0" dense>
        <v-col>
          <v-alert
            elevation="21"
          >

            <h3>Criação e telas</h3>
            <br>
            <!-- modalidade de criação de tela e alert de explicação-->
            <v-row dense>

              <!-- modalidade de montagem de tela-->
              <v-col>
                <span class="pl-3">Selecione a forma da montagem da tela</span>
                <v-select
                  v-model="formaMontagem"
                  :items="formaMontagemTipo"
                  class="pt-1"
                  clearable
                  dense
                  hide-details
                  label="Selecione a forma da montagem da tela"
                  name="tipoMontagem"
                  rounded
                  solo
                  @change="clearInputs"
                ></v-select>

              </v-col>

              <!-- alert de explicação-->
              <v-col>
                <span class="pl-3">Selecione a forma da montagem da tela</span>
                <v-alert class="text-center" dense rounded="xxl" type="info">
                  <h5>Entenda como se processa a montagem de telas de acordo com as opções disponíveis.
                    <v-btn class="ml-5" small @click="toggleExplicacao">
                      {{ mostraExplicacao ? 'Clique para ocultar' : 'Clique para exibir' }}
                    </v-btn>
                  </h5>
                </v-alert>
              </v-col>

            </v-row>

            <!-- explicação-->
            <v-row v-if="mostraExplicacao" dense>
              <v-col>
                <v-alert class="text-center" rounded="xxl" type="info">
                  <v-row>
                    <v-col>

                      <v-alert dense elevation="12">
                        <b>Mês de um ano específico</b><br>
                        Nesta opção você vai selecionar os indicadores apenas de um mês de um ano e compará-los.
                        <hr>
                        Ex: Número de acidentes no serviço da Brigada X e Brigada Y no mês de maio de 2024.
                      </v-alert>

                      <v-alert dense elevation="12">
                        <b>Intervalo de meses de um ano específico</b><br>
                        Nesta opção você vai selecionar os indicadores dentro de um intervalo de um mês de um ano e
                        compará-los.
                        <hr>
                        Ex: Número de acidentes no serviço da Brigada X e Brigada Y nos meses de maio, julho e setembro
                        de 2024.
                      </v-alert>

                      <v-alert dense elevation="12">
                        <b>Ano específico</b><br>
                        Nesta opção você vai selecionar os indicadores e comparar os dados no período de um ano.
                        <hr>
                        Ex: Número de acidentes no serviço da Brigada X e Brigada Y no ano de 2024.
                      </v-alert>

                      <v-alert dense elevation="12">
                        <b>Intervalo de anos</b><br>
                        Nesta opção você vai selecionar os indicadores e comparar os dados em um intervalo de anos.
                        <hr>
                        Ex: Número de acidentes no serviço da Brigada X e Brigada Y entre 2023 e 2024.
                      </v-alert>

                      <v-alert dense elevation="12">
                        <b>Intervalo de meses de um intervalo de anos</b><br>
                        Nesta opção você vai selecionar os indicadores e comparar os dados em um intervalo de anos e
                        meses específicos.
                        <hr>
                        Ex: Número de acidentes no serviço da Brigada X e Brigada Y nos meses de janeiro, março e julho
                        entre 2023 e 2024.
                      </v-alert>

                    </v-col>
                  </v-row>
                </v-alert>
              </v-col>
            </v-row>

            <!-- mes e ano específico-->
            <v-row v-if="formaMontagem === 'Mês de um ano específico'">

              <!-- mes específico-->
              <v-col>
                <span class="pl-3">Selecione o mês</span>
                <v-select
                  v-model="mes"
                  :items="mesesOptions"
                  clearable
                  dense
                  hide-details
                  label="Selecione o mês"
                  name="mesEspecifico"
                  rounded
                  solo
                ></v-select>

              </v-col>

              <!-- ano-->
              <v-col>
                <span class="pl-3">Ano</span>
                <v-text-field
                  v-model="ano_verifica_inicio"
                  :rules="anoRules()"
                  dense
                  hide-details
                  label="Ano de Verificação"
                  maxlength="4"
                  rounded
                  solo
                  type="text"
                  @input="filterInput($event, 'inicio')"
                  @keydown="preventSpecialKeys"
                />

              </v-col>

            </v-row>

            <!-- mesese e ano específico-->
            <v-row v-if="formaMontagem === 'Intervalo de meses de um ano específico'">

              <!-- meses-->
              <v-col>
                <span class="pl-3">Selecione os mêses</span>
                <v-select
                  v-model="mes"
                  :items="mesesOptions"
                  chips
                  clearable
                  deletable-chips
                  dense
                  hide-details
                  label="Selecione os mêses"
                  multiple
                  name="mesEspecifico"
                  rounded
                  solo
                ></v-select>

              </v-col>

              <!-- ano-->
              <v-col>
                <span class="pl-3">Ano</span>
                <v-text-field
                  v-model="ano_verifica_inicio"
                  :rules="anoRules()"
                  dense
                  hide-details
                  label="Ano de Verificação"
                  maxlength="4"
                  rounded
                  solo
                  type="text"
                  @input="filterInput($event, 'inicio')"
                  @keydown="preventSpecialKeys"
                />
              </v-col>

            </v-row>

            <!-- ano específico-->
            <v-row v-if="formaMontagem === 'Ano específico'">
              <!-- ano-->
              <v-col>
                <span class="pl-3">Ano</span>
                <v-text-field
                  v-model="ano_verifica_inicio"
                  :rules="anoRules()"
                  dense
                  hide-details
                  label="Ano de Verificação"
                  maxlength="4"
                  rounded
                  solo
                  type="text"
                  @input="filterInput"
                  @keydown="preventSpecialKeys"
                />
              </v-col>

              <v-col></v-col>

            </v-row>

            <!-- intervalo de ano-->
            <v-row v-if="formaMontagem === 'Intervalo de anos'">
              <!-- ano inicio-->
              <v-col>
                <span class="pl-3">Ano Início</span>
                <v-text-field
                  v-model="ano_verifica_inicio"
                  :rules="anoRules()"
                  dense
                  hide-details
                  label="Ano de Verificação"
                  maxlength="4"
                  rounded
                  solo
                  type="text"
                  @input="filterInput($event, 'inicio')"
                  @keydown="preventSpecialKeys"
                />
              </v-col>

              <v-col>
                <span class="pl-3">Ano Fim</span>
                <v-text-field
                  v-model="ano_verifica_fim"
                  :rules="anoRules()"
                  dense
                  hide-details
                  label="Ano de Verificação"
                  maxlength="4"
                  rounded
                  solo
                  type="text"
                  @input="filterInput($event, 'fim')"
                  @keydown="preventSpecialKeys"
                />
              </v-col>

            </v-row>

            <!-- intervalo de meses e anos-->
            <v-row v-if="formaMontagem === 'Intervalo de meses de um intervalo de anos'">

              <!-- meses-->
              <v-col>
                <span class="pl-3">Selecione os mêses</span>
                <v-select
                  v-model="mes"
                  :items="mesesOptions"
                  chips
                  clearable
                  deletable-chips
                  dense
                  hide-details
                  label="Selecione os mêses"
                  multiple
                  name="mesEspecifico"
                  rounded
                  solo
                ></v-select>

              </v-col>

              <!-- ano inicio-->
              <v-col>
                <span class="pl-3">Ano Início</span>
                <v-text-field
                  v-model="ano_verifica_inicio"
                  :rules="anoRules()"
                  dense
                  hide-details
                  label="Ano de Verificação"
                  maxlength="4"
                  rounded
                  solo
                  type="text"
                  @input="filterInput($event, 'inicio')"
                  @keydown="preventSpecialKeys"
                />
              </v-col>

              <!-- ano de fim-->
              <v-col>
                <span class="pl-3">Ano Fim</span>
                <v-text-field
                  v-model="ano_verifica_fim"
                  :rules="anoRules()"
                  dense
                  hide-details
                  label="Ano de Verificação"
                  maxlength="4"
                  rounded
                  solo
                  type="text"
                  @input="filterInput($event, 'fim')"
                  @keydown="preventSpecialKeys"
                />
              </v-col>

            </v-row>

            <!-- selecionar filtors por secao-->
            <v-alert v-if="formaMontagem !== ''" class="mt-4" color="cyan lighten-3" elevation="12">
              <v-row>
                <v-col><h3>Categorias / Indicadores disponíveis </h3></v-col>
                <v-col v-if="secs.length === 0" class="text-right">
                  <v-btn class="primary" small @click="pesquisaCoisas">Exibir categorias Disponíveis</v-btn>
                </v-col>
              </v-row>

              <v-btn v-for="sec in secs" v-if="secs.length > 0" :key="sec.id" :color="selectedColorSecaoAtiva(sec.id)"
                     class="mr-3"
                     @click="applyFilter(sec.id)">{{ sec.sigla }}
              </v-btn>
              <v-btn v-if="secs.length > 0 && usuarioLogado.tipo !== 'Usuário'"
                     :color="selectedColorSecaoAtiva('Todos')"
                     @click="applyFilter('Todos')">Todos
              </v-btn>

            </v-alert>

            <v-btn v-if="secs.length > 0" block class="mb-4" color="success" @click="montaTela">Montar a tela
            </v-btn>

            <!-- cards de categoria e indicadores-->
            <v-alert v-for="cat in filterCatInd" v-if="formaMontagem !== ''" :key="cat.id" color="green lighten-5"
                     elevation="12">
              <h3>{{ cat.nome }} <span v-if="secaoAtiva === 'Todos'"> - Responsável: {{ cat.secao.sigla }}</span>
                <v-btn class="ml-7" color="primary" x-small @click="markAll(cat.indicadores)">
                  <v-icon v-if="isAllMarked(cat.indicadores)" class="mr-4" small>mdi-checkbox-blank-outline</v-icon>
                  <v-icon v-else class="mr-4" small>mdi-checkbox-marked-outline</v-icon>
                  {{ isAllMarked(cat.indicadores) ? 'Desmarcar todos' : 'Marcar todos' }}
                </v-btn>
              </h3>

              <v-alert class="mt-2 mb-2" color="green lighten-3">

                <v-row dense>
                  <v-col><b>Natureza: </b>{{ cat.natureza }}</v-col>
                  <v-col><b>Periodicidade: </b>{{ cat.periodicidade }}</v-col>
                  <v-col><b>Total Mensal: </b>{{ cat.mapeamento_total_mensal }}</v-col>
                  <v-col><b>Total Anual: </b>{{ cat.mapeamento_total_anual }}</v-col>
                </v-row>
                <v-row v-if="cat.observacoes">
                  <v-col><b>Observações</b><br>{{ cat.observacoes }}</v-col>
                </v-row>
              </v-alert>
              <v-row dense>
                <v-col><h5>Indicadores</h5></v-col>
              </v-row>

              <v-row class="mt-0 pt-0" dense>
                <v-col v-for="ind in cat.indicadores" :key="ind.id" class="d-flex align-items-center" cols="3">
                  <v-checkbox
                    v-model="arrayIndGeral"
                    :label="`${ind.nome}`"
                    :value="ind.id"
                    class="pt-0 pb-0"
                    hide-details
                  ></v-checkbox>

                  <v-icon class="pt-4 ml-4 ">mdi-magnify</v-icon>
                </v-col>
              </v-row>
            </v-alert>

            <v-btn v-if="secs.length > 0" block color="success" @click="montaTela">Montar a tela</v-btn>

          </v-alert>
        </v-col>
      </v-row>

      <!-- area de telas cadastradas-->
      <v-alert color="green" elevation="12">

        <v-alert elevation="12">
          <v-row>
            <v-col>
              <h2>Recuperar Telas</h2>
            </v-col>
            <v-col class="text-right pt-5">
              Digite a hash e aperte enter
            </v-col>
            <v-col>
              <v-text-field
                v-model="searchTela"
                append-icon="mdi-magnify"
                dense
                hide-details
                label="Pesquisar"
                outlined
                placeholder="Pesquisar"
                single-line
                @keydown.enter="fazBuscaTela()"
              ></v-text-field>
            </v-col>
          </v-row>

        </v-alert>

        <v-data-table
          :headers="headers"
          :items="telas"
          :search="search"
          class="elevation-21"
        >
          <!-- template para titulo e search-->
          <template v-slot:top>
            <v-toolbar
              flat
            >
              <!-- Título da tabela-->
              <v-toolbar-title>Telas Cadastradas</v-toolbar-title>

              <v-divider
                class="mx-4"
                inset
                vertical
              ></v-divider>

              <v-spacer></v-spacer>

              <!--Pesquisar-->
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                hide-details
                label="Pesquisar"
                placeholder="Pesquisar"
                single-line
              ></v-text-field>

            </v-toolbar>

          </template>

          <!--Template de botões para editar, excluir -->
          <template v-slot:item.actions="{ item }">

            <!--ver-->
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  class="mr-2"
                  small
                  v-bind="attrs"
                  @click="openDialogVer(item)"
                  v-on="on"
                >
                  mdi-magnify
                </v-icon>
              </template>
              <span>Ver Tela</span>
            </v-tooltip>

            <!--Excluir-->
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  class="mr-2"
                  small
                  v-bind="attrs"
                  @click="openDialogExcluirTela(item)"
                  v-on="on"
                >
                  mdi-delete
                </v-icon>
              </template>
              <span>Excluir Tela</span>
            </v-tooltip>

          </template>

        </v-data-table>
      </v-alert>

      <!--Dialog para ver tela-->
      <v-dialog v-model="dialogVerTela" max-width="90%">
        <v-card>
          <v-card-title>
            <v-row>
              <v-col>Detalhes da Tela</v-col>
              <v-col class="text-right"> <v-btn color="grey lighten-1" class="link" @click="dialogVerTela = false" rounded>X</v-btn></v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <TelaVer v-if="dialogVerTela" :selectedTela="selectedTela" class="pt-5"
                     @ajustaTelasSalvas="handleResetaTelaSalva" @resetaTela="handleResetaTela"/>
          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer></v-spacer>
            <span class="pl-5 pr-5"></span>
            <v-btn color="grey lighten-1" @click="dialogVerTela = false">Fechar</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!--Dialog para excluir tela-->
      <v-dialog v-model="dialogExcluirTela" max-width="30%">
        <v-card>
          <v-card-title>
            Exclusão de tela
          </v-card-title>
          <v-card-text>
            Você realmente deseja excluir a tela: {{ selectedTela.nome }}?
            <br>
            Essa ação não pode ser desfeita.
          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer></v-spacer>
            <span class="pl-5 pr-5"></span>
            <v-btn color="grey lighten-1" @click="dialogExcluirTela = false">Cancelar</v-btn>
            <v-btn color="error" @click="doExcluirTela">Excluir</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>
  </v-main>
</template>
<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import BarraNavegacao from '../barra-navegacao/BarraNavegacao.vue'
import PesquisaIndicador from '../gerenciamentoIndicadores/PesquisaIndicador.vue'
import Tela from './Tela.vue'
import TelaVer from './TelaVer.vue'

export default {
  name: 'gerenciamentodetelas',
  mixins: [logoutMixin],
  components: {Tela, PesquisaIndicador, BarraNavegacao, TelaVer},
  data: () => ({
    formaMontagem: '',
    formaMontagemTipo: ['Mês de um ano específico', 'Intervalo de meses de um ano específico', 'Ano específico', 'Intervalo de anos', 'Intervalo de meses de um intervalo de anos'],
    ano_verifica_inicio: '',
    ano_verifica_fim: '',
    mostraExplicacao: false,
    mes: '',
    mesesOptions: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    catind: [],
    secs: [],
    filterCatInd: [],
    secaoAtiva: '',
    arrayIndGeral: [],
    resultadoMontagem: {},
    tipoGraph: '',
    objetoPesquisa: {},
    telas: [],
    headers: [
      {
        text: 'Nome',
        align: 'start',
        value: 'nome'
      },
      {
        text: 'Hash',
        align: 'start',
        value: 'hash'
      },
      {
        text: 'Actions',
        value: 'actions',
        align: 'center',
        sortable: false
      }
    ],
    search: '',
    dialogVerTela: false,
    selectedTela: {},
    searchTela: '',
    dialogExcluirTela: false
  }),

  props: {},

  computed: {
    ...mapGetters(['usuarioLogado'])
  },

  created () {
  },

  watch: {},

  async mounted () {
    await this.pegaTelas()
  },

  methods: {
    async pegaTelas () {
      try {
        this.$http.get('tela/pegatelas')
          .then(response => {
            this.telas = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    async pesquisaCoisas () {
      await this.getCatInd()
    },

    async getCatInd () {
      try {
        this.$http.get('tela/pegacatind')
          .then(response => {
            this.catind = response.data[0]
            this.secs = response.data[1]
            this.filterCatInd = this.catind
            this.secaoAtiva = response.data[1][0].id

            this.applyFilter(this.secaoAtiva)
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    anoRules () {
      return [
        v => !!v || 'O ano é obrigatório',
        v => (v >= 1920 && v <= 2999) || 'O ano deve estar entre 1920 e 2999',
        v => (/^\d{4}$/).test(v) || 'O ano deve ter 4 dígitos',
        v => (/^\d+$/).test(v) || 'O ano deve conter apenas dígitos'
      ]
    },

    filterInput (event, tipo) {
      // Verifica se o event.target e event.target.value estão definidos
      if (event && event.target && typeof event.target.value === 'string') {
        // Remove caracteres que não são números após a entrada
        const value = event.target.value.replace(/[^\d]/g, '')
        if (tipo === 'inicio') {
          this.ano_verifica_inicio = value
        } else {
          this.ano_verifica_fim = value
        }
        // Atualiza o valor no campo de entrada
        event.target.value = value
      }
    },

    preventSpecialKeys (event) {
      const key = event.key
      // Bloqueia todas as teclas que não sejam números ou comandos básicos
      if (!/^[0-9]$/.test(key) && key !== 'Backspace' && key !== 'Tab' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
        event.preventDefault()
      }
    },

    toggleExplicacao () {
      this.mostraExplicacao = !this.mostraExplicacao
    },

    montaTela () {
      let msgErro = []

      /*
      ['Mês de um ano específico', 'Intervalo de meses de um ano específico', 'Ano específico', 'Intervalo de anos', 'Intervalo de meses de um intervalo de anos'],
       */

      if (this.formaMontagem === '') {
        msgErro.push('Selecione a forma da montagem da tela')
      } else if (this.formaMontagem !== '' && this.formaMontagem === 'Mês de um ano específico') {
        this.tipoGraph = 'pie'
        if (this.mes === '') {
          msgErro.push('Selecione o mês')
        }
        if (this.ano_verifica_inicio === '') {
          msgErro.push('Informe o ano')
        }
      } else if (this.formaMontagem !== '' && this.formaMontagem === 'Intervalo de meses de um ano específico') {
        this.tipoGraph = 'bar'
        if (this.mes.length === 0) {
          msgErro.push('Selecione os meses')
        }
        if (this.ano_verifica_inicio === '') {
          msgErro.push('Informe o ano')
        }
      } else if (this.formaMontagem !== '' && this.formaMontagem === 'Ano específico') {
        this.tipoGraph = 'bar'
        if (this.ano_verifica_inicio === '') {
          msgErro.push('Informe o ano')
        }
      } else if (this.formaMontagem !== '' && this.formaMontagem === 'Intervalo de anos') {
        this.tipoGraph = 'bar'
        if (this.ano_verifica_inicio === '') {
          msgErro.push('Informe o ano de início')
        }
        if (this.ano_verifica_fim === '') {
          msgErro.push('Informe o ano de fim')
        }
      } else if (this.formaMontagem !== '' && this.formaMontagem === 'Intervalo de meses de um intervalo de anos') {
        this.tipoGraph = 'bar'
        if (this.mes.length === 0) {
          msgErro.push('Selecione os mêses')
        }
        if (this.ano_verifica_inicio === '') {
          msgErro.push('Informe o ano de início')
        }
        if (this.ano_verifica_fim === '') {
          msgErro.push('Informe o ano de fim')
        }
      }
      if (this.arrayIndGeral.length <= 1) {
        msgErro.push('Selecione ao menos 2 indicadores')
      }

      if (msgErro.length > 0) {
        let retornoErro = '<ul>'
        for (let i = 0; i < msgErro.length; i++) {
          retornoErro += '<li>' + msgErro[i] + '</li>'
        }
        retornoErro += '</ul>'
        this.$toastr.e(
          retornoErro, 'Erro!'
        )
      } else {
        let objetoParaEnvio = {}
        objetoParaEnvio['forma'] = this.formaMontagem
        objetoParaEnvio['mes'] = this.mes
        objetoParaEnvio['ano_verifica_inicio'] = this.ano_verifica_inicio
        objetoParaEnvio['ano_verifica_fim'] = this.ano_verifica_fim
        objetoParaEnvio['array_indicadores'] = this.arrayIndGeral
        this.objetoPesquisa = objetoParaEnvio

        try {
          this.$http.post('tela/montatela', objetoParaEnvio)
            .then(response => {
              this.resultadoMontagem = response.data
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          console.log(e)
        }
      }
    },

    clearInputs () {
      this.mes = ''
      this.ano_verifica_inicio = ''
      this.ano_verifica_fim = ''
    },

    applyFilter (filtro) {
      this.secaoAtiva = filtro
      if (filtro === 'Todos') {
        this.filterCatInd = this.catind
      } else {
        let retornoFiltro = []
        for (let i = 0; i < this.catind.length; i++) {
          if (this.catind[i].secao_id === filtro) {
            retornoFiltro.push(this.catind[i])
          }
        }
        this.filterCatInd = retornoFiltro
      }
    },

    selectedColorSecaoAtiva (qual) {
      if (qual === this.secaoAtiva) {
        return 'secondary'
      } else {
        return 'primary'
      }
    },

    handleCheckboxChange (indicator) {
      const index = this.arrayIndGeral.indexOf(indicator.id)
      if (index === -1) {
        this.arrayIndGeral.push(indicator.id)
      } else {
        this.arrayIndGeral.splice(index, 1)
      }
    },

    markAll (indicators) {
      if (this.isAllMarked(indicators)) {
        // Desmarcar todos os indicadores
        this.arrayIndGeral = this.arrayIndGeral.filter(id => !indicators.some(ind => ind.id === id))
      } else {
        // Marcar todos os indicadores
        const idsToAdd = indicators.map(ind => ind.id).filter(id => !this.arrayIndGeral.includes(id))
        this.arrayIndGeral = [...this.arrayIndGeral, ...idsToAdd]
      }
    },

    isAllMarked (indicators) {
      return indicators.every(indicator => this.arrayIndGeral.includes(indicator.id))
    },

    // ajustar o reset efetivo de tela
    handleResetaTela () {
      console.log('Ajustando o estado da aplicação')
      this.arrayIndGeral = []
      this.resultadoMontagem = {}
      this.tipoGraph = ''
      this.objetoPesquisa = {}
      this.formaMontagem = ''
      this.mes = ''
      this.ano_verifica_inicio = ''
      this.ano_verifica_fim = ''
      this.secs = []
      this.filterCatInd = []
    },

    openDialogVer (item) {
      this.dialogVerTela = true
      this.selectedTela = item
    },

    fazBuscaTela () {
      try {
        this.$http.post('tela/existehash', this.searchTela)
          .then(response => {
            if (response.data > 0) {
              this.selectedTela.hash = this.searchTela
              this.dialogVerTela = true
              this.searchTela = ''
            } else {
              this.$toastr.e(
                'Não existem telas cadastradas com esse Hash', 'Erro!'
              )
              this.searchTela = ''
            }
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    async handleResetaTelaSalva () {
      await this.pegaTelas()
    },

    openDialogExcluirTela (item) {
      this.selectedTela = item
      this.dialogExcluirTela = true
    },

    doExcluirTela () {
      try {
        this.$http.delete('tela/' + this.selectedTela.id)
          .then(() => {
            this.selectedTela = {}
            this.dialogExcluirTela = false
            this.handleResetaTelaSalva()
            this.$toastr.s(
              'Tela excluida com sucesso', 'Sucesso!'
            )
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    }
  }
}

</script>
<style>
</style>
