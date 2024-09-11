<template>
  <v-main class="bgConfig">
    <BarraNavegacao></BarraNavegacao>

    <v-container fluid>

      <!--Banner-->
      <v-alert
        class="p-5"
        elevation="21"
      >

        <!-- nome e btn add novo indicador-->
        <v-row>

          <!--nome-->
          <v-col cols="6">
            <h2>
              <v-icon
                class="mr-4"
                size="36">
                mdi-chart-line
              </v-icon>
              Configurações de Indicadores
            </h2>

          </v-col>

          <!-- btn add novo indicador-->
          <v-col class="text-right" cols="6">
            <v-btn class="success" @click="dialogGerenciaCategoria = true">Gerenciar Categorias</v-btn>
            <v-btn class="primary" @click="openDialogAddEditIndicador('add')">Adicionar Novo Indicador</v-btn>
          </v-col>

        </v-row>

      </v-alert>

      <!-- seletor por seção-->
      <v-alert v-if="usuarioLogado.tipo === 'Administrador'"
               class="p-5"
               elevation="21"
      >
        <v-row>
          <v-col>
            <v-btn :color="ajustaCorBtn('Todos')" class="mr-3" retain-focus-on-click
                   @click="pegaIndicadoresSecao('Todos')"> Todos
            </v-btn>

            <v-btn v-for="secao in secoes" v-if="secoes.length > 0" :key="secao.id"
                   :color="ajustaCorBtn('secao', secao.sigla)" class="mr-3"
                   @click="pegaIndicadoresSecao(secao)"> {{ secao.sigla }}
            </v-btn>
          </v-col>
        </v-row>
      </v-alert>

      <!--DataTable-->
      <v-data-table
        :footer-props="{
          'items-per-page-options': [50, 100, 200, -1]
        }"
        :headers="headers"
        :items="indicadores"
        :items-per-page="porPag"
        :loading="indicadores.length === 0"
        :search="search"
        class="elevation-21 mt-4"
        group-by="categoria.nome"
      >
        <!-- template para titulo e search-->
        <template v-slot:top>
          <v-toolbar
            flat
          >
            <!-- Título da tabela-->
            <v-toolbar-title>Tabela de Indicadores Cadastrados - {{ selectedSecao }}</v-toolbar-title>

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

        <!--Template de categoria -->
        <template v-slot:item.categoria.nome="{ item }">
          <span v-if="item.categoria.secao !== null && item.categoria.secao !== undefined">{{
              item.categoria.secao.sigla
            }} - {{ item.categoria.nome }}</span> <span v-else>-</span>
        </template>

        <!--Template de tendencia -->
        <template v-slot:item.tendencia="{ item }">
          <span v-if="item.tendencia === null || item.tendencia === ''">Sem meta</span>
          <span v-else>{{ item.tendencia }}</span>
        </template>

        <!--Template de objetivo -->
        <template v-slot:item.objetivo="{ item }">
          <span v-if="item.objetivo === null || item.objetivo === ''">Sem objetivo</span>
          <span v-else>{{ item.objetivo }}</span>
        </template>

        <!--Template de green -->
        <template v-slot:item.green="{ item }">

          <span v-if="item.green === null || item.green === ''"> - </span>
          <v-chip v-else
                  class="ml-0"
                  color="green"
                  text-color="black">
            {{ item.green }}
          </v-chip>

        </template>

        <!--Template de yellow -->
        <template v-slot:item.yellow_1="{ item }">

          <span
            v-if="(item.yellow_1 === null || item.yellow_1 === '') || (item.yellow_2 === null || item.yellow_2 === '')"> - </span>
          <span v-else>
          <v-chip
            color="yellow"
            text-color="black">
            {{ item.yellow_1 }}
          </v-chip>
          <v-chip
            color="yellow"
            text-color="black"
          >
            {{ item.yellow_2 }}
          </v-chip>
          </span>

        </template>

        <!--Template de red -->
        <template v-slot:item.red="{ item }">

          <span v-if="item.red === null || item.red === ''"> - </span>
          <v-chip
            v-else color="red"
            text-color="white">
            {{ item.red }}
          </v-chip>

        </template>

        <!--Template de botões para editar, excluir -->
        <template v-slot:item.actions="{ item }">

          <!--observacoes-->
          <v-tooltip v-if="item.observacoes" top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="mr-2"
                small
                v-bind="attrs"
                @click="openModalObservacoes(item.observacoes)"
                v-on="on"
              >
                mdi-magnify
              </v-icon>
            </template>
            <span>Observações</span>
          </v-tooltip>

          <!--editar-->
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="mr-2"
                small
                v-bind="attrs"
                @click="openDialogAddEditIndicador('edit', item)"
                v-on="on"
              >
                mdi-pen
              </v-icon>
            </template>
            <span>Editar Indicador</span>
          </v-tooltip>

          <!--Excluir -->
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="mr-2"
                small
                v-bind="attrs"
                @click="deleteIndicador(item)"
                v-on="on"
              >
                mdi-delete
              </v-icon>
            </template>
            <span>Excluir Indicador</span>
          </v-tooltip>

        </template>

      </v-data-table>

    </v-container>

    <!-- melhorar no edit não esta carregando s seção-->
    <!--Dialog para add/edit indicador-->
    <v-dialog v-model="dialogAddEditIndicadores" max-width="80%" persistent>
      <v-card>
        <v-form @submit.prevent="efetuarCadastroEditIndicador">

          <v-card-title primary-title>
            <v-row>
              <v-col></v-col>
              <v-col class="text-center">

                <span v-if="areaGerenciamentoCategorias">Gerenciamento de categorias</span>
                <span v-else>
                  <span v-if="tipoAcao === 'add'">Adicionar novo Indicador</span>
                  <span v-else>Edição de Indicadores</span>
                </span>

              </v-col>
              <v-col class="text-right">
                <v-btn :class="seletorClasseBtn" small @click="showHideGerencimantoCategoria">
                  <v-icon class="mr-4" small> mdi-cogs</v-icon>
                  <span v-if="areaGerenciamentoCategorias">Fechar Gerenciamento de categorias</span>
                  <span v-else>Abrir gerenciamento de categorias</span>
                </v-btn>
              </v-col>
            </v-row>

          </v-card-title>

          <v-card-text>

            <GerenciamentoCategorias v-if="areaGerenciamentoCategorias"
                                     @resetaSecao="buscaAjuste($event)"></GerenciamentoCategorias>

            <v-container v-else fluid>

              <!-- secao e categoria-->
              <v-row dense>
                <!-- seção -->
                <v-col v-if="usuarioLogado.tipo === 'Administrador'">
                  <span class="pl-3">Selecione a Seção do Indicador</span>
                  <v-autocomplete
                    v-model="editedIndicador.secao_id"
                    :items="secoes"
                    dense
                    item-text="sigla"
                    item-value="id"
                    label="Selecione a seção responsável pelo Indicador"
                    name="secao"
                    return-object
                    rounded
                    solo
                    @change="getCategoriaPorSecao"
                  ></v-autocomplete>
                </v-col>

                <!--caso não seja um administrador-->
                <v-col v-else>
                  <br>
                  <v-alert dense elevation="10">
                    <h2 class="ml-2"><b>Seção: </b> {{ usuarioLogado.secao.sigla }}</h2>
                  </v-alert>
                </v-col>

                <!-- Categoria-->
                <v-col v-if="categoriasPorSecao.length > 0">
                  <span class="pl-3">Selecione a Categoria do Indicador</span>
                  <v-autocomplete
                    v-model="editedIndicador.categoria_id"
                    :items="categoriasPorSecao"
                    clearable
                    dense
                    item-text="nome"
                    item-value="id"
                    label="Selecione categoria do indicador"
                    name="secao"
                    rounded
                    solo
                  ></v-autocomplete>
                </v-col>

                <!-- alerta em caso de não existir categoria-->
                <v-col
                  v-else-if="editedIndicador.secao_id !== '' && categoriasPorSecao.length <= 0 && editedIndicador.secao_id !== null">
                  <v-alert class="mt-6" dense rounded="xxl" type="warning">
                    Ainda não existem categorias cadastradas para essa seção.
                  </v-alert>
                </v-col>

                <!-- alerta em caso de não existir categoria-->
                <v-col
                  v-else-if="usuarioLogado.tipo !== 'Administrador' && categoriasPorSecao.length <= 0">
                  <v-alert class="mt-6" dense rounded="xxl" type="warning">
                    Ainda não existem categorias cadastradas para essa seção.
                  </v-alert>
                </v-col>

                <!--estado incial-->
                <v-col v-else>
                </v-col>

              </v-row>

              <!-- nome do indicador e possui meta-->
              <v-row v-if="categoriasPorSecao.length > 0" dense>

                <!-- nome_indicador -->
                <v-col>
                  <span class="pl-3">Nome do Indicador</span>
                  <v-text-field
                    v-model="editedIndicador.nome"
                    dense
                    label="Nome do indicador"
                    rounded
                    solo
                  ></v-text-field>
                </v-col>

                <v-col>
                  <v-checkbox
                    v-model="editedIndicador.meta"
                    class="ml-6"
                    label="Possui meta associada"
                  ></v-checkbox>
                </v-col>

              </v-row>

              <!--observacoes-->
              <v-row v-if="categoriasPorSecao.length > 0" dense>
                <v-col>
                  <span class="pl-3">Observações do Indicador</span>
                  <v-textarea
                    v-model="editedIndicador.observacoes"
                    dense
                    hint="Escreva algo se desejar, sobre o indicador"
                    label="Observações do Indicador"
                    rounded
                    solo
                  ></v-textarea>
                </v-col>
              </v-row>

              <!-- tendência e objetivo-->
              <v-row v-if="categoriasPorSecao.length > 0 && editedIndicador.meta">
                <!-- tendência-->
                <v-col>
                  <span class="pl-3">Tendência</span>
                  <v-select
                    v-model="editedIndicador.tendencia"
                    :items="tendencia_opt"
                    dense
                    label="Selecione a tendência do indicador"
                    name="tendencia"
                    rounded
                    solo
                  ></v-select>
                </v-col>

                <!--objetivo-->
                <v-col>
                  <span class="pl-3">Objetivo do Indicador (Anual)</span>
                  <v-text-field
                    v-model="editedIndicador.objetivo"
                    dense
                    label="Objetivo Anual do indicador"
                    rounded
                    solo
                    type="number"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Cards de acompanhamento - verde - amarelo - vermelho -->
              <v-alert v-if="editedIndicador.tendencia && editedIndicador.meta" elevation="8">
                <h3 class="text-center">Cards de acompanhamento</h3> <br>

                <!-- verde - amarelo - vermelho -->
                <v-row dense>

                  <!-- verde-->
                  <v-col>
                    <v-alert color="green">
                      <h4>Índice satisfatório</h4>
                      <span v-if="editedIndicador.tendencia === 'Quanto maior melhor'"> maior ou igual</span>
                      <span v-else> menor ou igual</span>
                      <v-text-field
                        v-model="editedIndicador.green"
                        class="pt-0 mt-4 pb-0 mb-0"
                        dense
                        hide-details
                        label="Satisfatório"
                        rounded
                        solo
                        type="number"
                      ></v-text-field>
                    </v-alert>
                  </v-col>

                  <!--amarelo-->
                  <v-col>
                    <v-alert color="yellow">
                      <h4>Índice em alerta</h4>
                      Intervalo
                      <v-row dense>
                        <v-col>
                          <v-text-field
                            v-model="editedIndicador.yellow_1"
                            class="pt-0 mt-4 pb-0 mb-0"
                            dense
                            hide-details
                            label="Alerta 1"
                            rounded
                            solo
                            type="number"
                          ></v-text-field>
                        </v-col>
                        <v-col>
                          <v-text-field
                            v-model="editedIndicador.yellow_2"
                            class="pt-0 mt-4 pb-0 mb-0"
                            dense
                            hide-details
                            label="Alerta 2"
                            rounded
                            solo
                            type="number"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-alert>
                  </v-col>

                  <!-- vermelho-->
                  <v-col>
                    <v-alert class="white--text" color="red">
                      <h4>Índice em perigo</h4>
                      <span v-if="editedIndicador.tendencia === 'Quanto maior melhor'"> Menor ou igual</span>
                      <span v-else>maior ou igual</span>
                      <v-text-field
                        v-model="editedIndicador.red"
                        class="pt-0 mt-4 pb-0 mb-0"
                        dense
                        hide-details
                        label="Perigo"
                        rounded
                        solo
                        type="number"
                      ></v-text-field>
                    </v-alert>
                  </v-col>
                </v-row>

              </v-alert>

            </v-container>

          </v-card-text>

          <!-- actions-->
          <v-card-actions v-if="!areaGerenciamentoCategorias" class="pb-5">
            <v-row>
              <v-col class="text-right mr-4">
                <v-btn color="warning lighten-1" @click="dialogAddEditIndicadores = false">Cancelar</v-btn>
                <span class="pl-5 pr-5"></span>
                <v-btn color="success" type="submit">
                  <span v-if="tipoAcao === 'add'">Cadastrar</span><span v-else>Alterar</span>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>

        </v-form>
      </v-card>

    </v-dialog>

    <!--Dialog para deletar indicador-->
    <v-dialog v-model="dialogDelete" max-width="800px">
      <v-card>
        <v-card-title class="justify-center" primary-title>
          <v-icon
            class="mr-4">
            fa fa-exclamation-triangle
          </v-icon>
          Você tem certeza que quer deletar o Indicador {{ editedIndicador.nome }}?
          <v-icon
            class="ml-4">
            fa fa-exclamation-triangle
          </v-icon>

        </v-card-title>
        <v-card-text>
          <v-row class="text-center">
            <v-col>
              <p>Essa ação é irreversível. Tenha certeza do que está fazendo.</p>
              <p>Todos os dados armazenados nesse indicador, serão removidos também!</p>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" @click="closeDelete">Cancelar</v-btn>
          <span class="pl-5 pr-5"></span>
          <v-btn color="red lighten-1" @click="deleteIndicadorConfirm">Excluir</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Dialog para gerenciar categorias-->
    <v-dialog v-model="dialogGerenciaCategoria" max-width="85%">
      <v-card>
        <v-card-title class="justify-center" primary-title>
          Gerenciamento de Categorias
        </v-card-title>
        <v-card-text>
          <GerenciamentoCategorias v-if="dialogGerenciaCategoria"
                                   @resetaSecao="buscaAjuste($event)"></GerenciamentoCategorias>
        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" @click="dialogGerenciaCategoria = false">Fechar</v-btn>
          <span class="pl-5 pr-5"></span>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Dialog para mostrar observacoes-->
    <v-dialog v-model="dialogShowObservacoes" max-width="50%">
      <v-card>
        <v-card-title class="justify-center" primary-title>
          Observações
        </v-card-title>
        <v-card-text>
          {{ leObservacoes }}
        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" @click="dialogShowObservacoes = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-main>
</template>

<script>import config from '../../http/config'
import BarraNavegacao from '../../components/barra-navegacao/BarraNavegacao.vue'
import GerenciamentoCategorias from '../../components/gerenciamentoIndicadores/GerenciamentoCategorias.vue'
import {mapGetters} from 'vuex'

export default {
  name: 'gerindicadores',
  components: {BarraNavegacao, GerenciamentoCategorias},
  data: () => ({
    configSis: config,
    dialogAddEditIndicadores: false,
    dialogDelete: false,
    tipoAcao: '',
    defaultIndicador: {
      'secao_id': '',
      'categoria_id': '',
      'nome': '',
      'meta': true,
      'tendencia': '',
      'observacoes': '',
      'objetivo': '',
      'green': '',
      'yellow_1': '',
      'yellow_2': '',
      'red': ''
    },
    editedIndicador: {
      'secao_id': '',
      'categoria_id': '',
      'nome': '',
      'meta': '',
      'tendencia': '',
      'observacoes': '',
      'objetivo': '',
      'green': '',
      'yellow_1': '',
      'yellow_2': '',
      'red': ''
    },
    secoes: [],
    categoriasPorSecao: [],
    tendencia_opt: ['Quanto maior melhor', 'Quanto menor melhor'],
    areaGerenciamentoCategorias: false,
    seletorClasseBtn: 'primary',
    indicadores: [],
    editedIndex: -1,
    search: '',
    headers: [
      {
        text: 'Categoria',
        align: 'start',
        value: 'categoria.nome'
      },
      {
        text: 'Nome',
        align: 'start',
        value: 'nome'
      },
      {
        text: 'Tendência',
        align: 'start',
        value: 'tendencia'
      },
      {
        text: 'Objetivo (anual)',
        align: 'center',
        value: 'objetivo'
      },
      {
        text: 'Verde',
        align: 'center',
        value: 'green'
      },
      {
        text: 'Amarelo (intervalo)',
        align: 'center',
        value: 'yellow_1'
      },
      {
        text: 'Vermelho',
        align: 'center',
        value: 'red'
      },
      {
        text: 'Actions',
        value: 'actions',
        align: 'center',
        sortable: false
      }
    ],
    selectedSecao: 'Todos',
    dialogGerenciaCategoria: false,
    porPag: 50,
    dialogShowObservacoes: false,
    leObservacoes: ''
  }),
  computed: {
    ...mapGetters(['usuarioLogado'])
  },
  watch: {},
  async mounted () {
    await this.getSecao()
    if (this.usuarioLogado.tipo === 'Administrador') {
      await this.getIndicadores('Todos')
    } else {
      this.editedIndicador.secao_id = this.usuarioLogado.secao_id
      await this.getIndicadores(this.usuarioLogado.secao)
      await this.getCategoriaPorSecao()
    }
  },
  methods: {
    async getSecao () {
      try {
        this.$http.get('secao/simples')
          .then(response => {
            this.secoes = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    async getIndicadores (qual) {
      if (qual === 'Todos') {
        this.selectedSecao = 'Todos'
        try {
          this.$http.get('indicadores')
            .then(response => {
              this.indicadores = response.data
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          console.log(e)
        }
      } else {
        this.selectedSecao = qual.sigla
        try {
          this.$http.get('indicadores/pega/' + qual.id)
            .then(response => {
              this.indicadores = response.data
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          console.log(e)
        }
      }
    },

    async getCategoriaPorSecao () {
      let tratamentoEnvio = ''
      if (this.usuarioLogado.tipo === 'Administrador' || this.usuarioLogado.tipo === 'Auditor') {
        tratamentoEnvio = this.editedIndicador.secao_id.id
      } else {
        tratamentoEnvio = this.editedIndicador.secao_id
      }
      if (this.editedIndicador.secao_id) {
        try {
          const response = await this.$http.get('categorias/porsecao/' + tratamentoEnvio)
          this.categoriasPorSecao = response.data
        } catch (error) {
          console.error('Erro ao buscar categorias por seção:', error)
        }
      }
    },

    async openDialogAddEditIndicador (tipo, item) {
      this.tipoAcao = tipo
      if (tipo === 'add') {
        this.editedIndicador = Object.assign({}, this.defaultIndicador)
        this.dialogAddEditIndicadores = true
      } else {
        this.editedIndicador = Object.assign({}, item)
        this.editedIndex = this.indicadores.indexOf(item)
        this.editedIndicador.secao_id = item.categoria.secao_id
        this.editedIndicador.categoria_id = item.categoria_id
        this.categoriasPorSecao = [item.categoria]

        try {
          this.$http.get('categorias/porsecao/' + item.categoria.secao_id)
            .then(response => {
              this.categoriasPorSecao = response.data
              this.dialogAddEditIndicadores = true
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          console.log(e)
        }
      }
    },

    showHideGerencimantoCategoria () {
      this.areaGerenciamentoCategorias = !this.areaGerenciamentoCategorias
      if (!this.areaGerenciamentoCategorias) {
        this.seletorClasseBtn = 'primary'
      } else {
        this.seletorClasseBtn = 'secondary'
      }
    },

    efetuarCadastroEditIndicador () {
      let arrayVal = this.validadoresCampos()
      if (arrayVal[0] > 0) {
        this.$toastr.e(
          arrayVal[1], 'Erro!'
        )
      } else {
        let objetoParaEnvio = {}
        objetoParaEnvio['nome'] = this.editedIndicador.nome
        objetoParaEnvio['categoria_id'] = this.editedIndicador.categoria_id
        objetoParaEnvio['meta'] = this.editedIndicador.meta
        objetoParaEnvio['observacoes'] = this.editedIndicador.observacoes
        if (this.editedIndicador.meta) {
          objetoParaEnvio['tendencia'] = this.editedIndicador.tendencia
          objetoParaEnvio['objetivo'] = this.editedIndicador.objetivo
          objetoParaEnvio['green'] = this.editedIndicador.green
          objetoParaEnvio['yellow_1'] = this.editedIndicador.yellow_1
          objetoParaEnvio['yellow_2'] = this.editedIndicador.yellow_2
          objetoParaEnvio['red'] = this.editedIndicador.red
        } else {
          objetoParaEnvio['tendencia'] = null
          objetoParaEnvio['objetivo'] = null
          objetoParaEnvio['green'] = null
          objetoParaEnvio['yellow_1'] = null
          objetoParaEnvio['yellow_2'] = null
          objetoParaEnvio['red'] = null
        }

        if (this.tipoAcao === 'add') {
          // aqui eu vou adicionar o usuario
          try {
            this.$http.post('indicadores', objetoParaEnvio)
              .then(response => {
                console.log(response.data)
                this.indicadores.push(response.data)
                this.$nextTick(() => {
                  this.editedIndicador = Object.assign({}, this.defaultIndicador)
                  this.editedIndex = -1
                })
                this.dialogAddEditIndicadores = false
                this.$toastr.s(
                  'Indicador cadastrado com sucesso', 'Sucesso!'
                )
              })
              .catch(erro => console.log(erro))
          } catch (e) {
            this.$toastr.e(
              'Houve um erro na tentativa de execução: <br>' + e, 'Erro!'
            )
          }
        } else {
          // aqui vou editar
          try {
            this.$http.put('indicadores/' + this.editedIndicador.id, objetoParaEnvio)
              .then(response => {
                Object.assign(this.indicadores[this.editedIndex], response.data)
                this.$toastr.s(
                  'Indicador alterado com sucesso', 'Sucesso!'
                )
                this.$nextTick(() => {
                  this.editedIndicador = Object.assign({}, this.defaultIndicador)
                  this.editedIndex = -1
                })
                this.dialogAddEditIndicadores = false
              })
              .catch(erro => console.log(erro))
          } catch (e) {
            this.$toastr.e(
              'Houve um erro na tentativa de execução: <br>' + e, 'Erro!'
            )
          }
        }
      }
    },

    validadoresCampos () {
      let msgRetornoErro = ''
      let contador = 0

      if (this.editedIndicador.nome === '') {
        msgRetornoErro += '<li>O Nome não pode ser vazio.</li>'
        contador++
      }
      if (this.editedIndicador.categoria_id === '') {
        msgRetornoErro += '<li>Selecione uma Categoria.</li>'
        contador++
      }

      if (this.editedIndicador.meta) {
        if (this.editedIndicador.tendencia === '') {
          msgRetornoErro += '<li>A tendência não pode ser vazia.</li>'
          contador++
        }
        if (this.editedIndicador.objetivo === '') {
          msgRetornoErro += '<li>O Objetivo não pode ser vazio.</li>'
          contador++
        }
        if (this.editedIndicador.green === '') {
          msgRetornoErro += '<li>O índice satisfatório não pode ser vazio.</li>'
          contador++
        }
        if (this.editedIndicador.yellow_1 === '' || this.editedIndicador.yellow_2 === '') {
          msgRetornoErro += '<li>O índice em alerta deve apresentar 2 valores.</li>'
          contador++
        }
        if (this.editedIndicador.red === '') {
          msgRetornoErro += '<li>O índice em perigo não pode ser vazio.</li>'
          contador++
        }
      }
      msgRetornoErro = '<ul>' + msgRetornoErro + '</ul>'
      return [contador, msgRetornoErro]
    },

    deleteIndicador (item) {
      this.editedIndex = this.indicadores.indexOf(item)
      this.editedIndicador = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteIndicadorConfirm () {
      this.$http.delete('indicadores/' + this.editedIndicador.id)
        // eslint-disable-next-line no-return-assign
        .then(() => {
          this.indicadores.splice(this.editedIndex, 1)
          this.closeDelete()
          this.$toastr.s(
            'Indicador removido com sucesso', 'Sucesso!'
          )
        }, err => {
          console.log(err)
          this.$toastr.e(
            'Não foi possível remover o Indicador', 'Erro!'
          )
        })
    },

    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedIndicador = this.defaultIndicador
        this.editedIndex = -1
      })
    },

    pegaIndicadoresSecao (secao) {
      this.indicadores = []
      if (secao === 'Todos') {
        this.getIndicadores('Todos')
      } else {
        this.getIndicadores(secao)
      }
    },

    buscaAjuste (evento) {
      if (evento === 'Usuário') {
        this.editedIndicador.secao_id = this.usuarioLogado.secao_id
        this.getCategoriaPorSecao()
      } else {
        this.pegaIndicadoresSecao('Todos')
      }
    },

    ajustaCorBtn (tipo, id) {
      if (tipo === 'Todos' && this.selectedSecao === 'Todos') {
        return 'secondary'
      } else if (this.selectedSecao !== 'Todos' && tipo === 'secao') {
        if (this.selectedSecao === id) {
          return 'secondary'
        } else {
          return 'primary'
        }
      } else {
        return 'primary'
      }
    },

    openModalObservacoes (observacoes) {
      this.leObservacoes = observacoes
      this.dialogShowObservacoes = true
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
</style>
