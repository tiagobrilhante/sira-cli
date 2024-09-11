<template>

  <v-container fluid>
    <!--Banner-->
    <v-alert
      elevation="21"
    >
      <!-- nome e btn add nova categoria-->
      <v-row>

        <!--nome-->
        <v-col cols="9">
          <h2>
            <v-icon
              class="mr-4"
              size="36">
              mdi-chart-line
            </v-icon>
            Gerenciamento de Categorias
          </h2>

        </v-col>

        <!-- btn add categoria-->
        <v-col class="text-right" cols="3">
          <v-btn class="primary" @click="openDialogAddEditCategoria('add')">Adicionar Nova Categoria</v-btn>
        </v-col>

      </v-row>

    </v-alert>

    <!--DataTable-->
    <v-data-table
      :headers="headers"
      :item-class="getItemClass"
      :items="categorias"
      :loading="categorias.length === 0"
      :search="search"
      class="elevation-21 mt-4"
      group-by="secao.sigla"
      sort-by="nome"
    >
      <!-- template para titulo e search-->
      <template v-slot:top>
        <v-toolbar
          flat
        >
          <!-- Título da tabela-->
          <v-toolbar-title>Tabela de Categorias Cadastradas</v-toolbar-title>

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

        <!-- LEGENDA-->
        <v-container fluid>
          <v-row dense>
            <v-col>
              Legenda:
              <v-chip class="ml-5 row-inactive" small>Inativo</v-chip>
              <v-chip class="ml-5 bgcat" small>Categorias</v-chip>
            </v-col>
          </v-row>
        </v-container>

      </template>

      <!--Template para ativo -->
      <template v-slot:item.ativo="{ item }">
        <span v-if="item.ativo">Sim</span><span v-else>Não</span>
      </template>

      <template v-slot:item.indicadorLength="{ item }">
        {{ item.numindicador }}
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
              @click="openDialogAddEditCategoria('edit', item)"
              v-on="on"
            >
              mdi-pen
            </v-icon>
          </template>
          <span>Editar Categoria</span>
        </v-tooltip>

        <!--Excluir-->
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              class="mr-2"
              small
              v-bind="attrs"
              @click="deleteCategoria(item)"
              v-on="on"
            >
              mdi-delete
            </v-icon>
          </template>
          <span>Excluir Usuário</span>
        </v-tooltip>

      </template>

    </v-data-table>

    <!--Dialog para add/edit Categoria-->
    <v-dialog v-model="dialogAddEditCategoria" max-width="70%" persistent>
      <v-card>
        <v-form @submit.prevent="efetuarCadastroEditCategoria">

          <v-card-title class="justify-center" primary-title>
            <span v-if="tipoAcao === 'add'">Adicionar nova Categoria</span><span v-else>Edição de Categoria</span>
          </v-card-title>

          <v-card-text>
            <!--Nome e seção-->
            <v-row dense>

              <!-- nome-->
              <v-col>
                <span class="pl-3">Nome da Categoria (Obrigatório)</span>
                <v-text-field
                  v-model="editedCategoria.nome"
                  class="ml-3"
                  dense
                  label="Nome da Categoria"
                  rounded
                  solo
                ></v-text-field>
              </v-col>

              <!-- seção-->
              <v-col>
                <span class="pl-3">Seção (Obrigatório)</span>
                <v-autocomplete
                  v-model="editedCategoria.secao_id"
                  :items="secoes"
                  :readonly="somenteLeitura"
                  class="ml-3"
                  dense
                  item-text="sigla"
                  item-value="id"
                  label="Selecione a seção vinculada a essa categoria"
                  name="secao"
                  rounded
                  solo
                ></v-autocomplete>
              </v-col>

            </v-row>

            <!--Natureza do dado e periodicidade-->
            <v-row dense>

              <!-- natureza-->
              <v-col>
                <span class="pl-3">Natureza do dado a ser armazenado (Obrigatório)</span>
                <v-autocomplete
                  v-model="editedCategoria.natureza"
                  :items="naturezas"
                  class="ml-3"
                  dense
                  label="Selecione a natureza do dado"
                  name="netureza"
                  rounded
                  solo
                ></v-autocomplete>
              </v-col>

              <!-- periodicidade-->
              <v-col>
                <span class="pl-3">Periodicidade do lançamento (Obrigatório)</span>
                <v-select
                  v-model="editedCategoria.periodicidade"
                  :items="periodicidadeOptions"
                  class="ml-3"
                  dense
                  label="Selecione a periodicidade do lançamento"
                  name="secao"
                  rounded
                  solo
                ></v-select>
              </v-col>
            </v-row>

            <!--observacoes-->
            <v-row dense>
              <v-col>
                <span class="pl-3">Observações da Categoria</span>
                <v-textarea
                  v-model="editedCategoria.observacoes"
                  class="ml-3"
                  dense
                  hint="Escreva algo se desejar, sobre a categoria"
                  label="Observações da Categoria"
                  rounded
                  solo
                ></v-textarea>
              </v-col>
            </v-row>

            <!-- status-->
            <v-row>
              <v-col>
                <v-alert color="blue lighten-3" dense rounded="xxl">

                  <v-row>
                    <v-col><h4>Selecione se a categoria está ativa:</h4>
                      <v-checkbox
                        v-model="editedCategoria.ativo"
                        hide-details
                        label="Ativo"
                      ></v-checkbox>
                    </v-col>
                    <v-col class="mt-4 mb-auto">
                      <v-alert dense elevation="12">
                        Caso desmarque essa opção, a categoria não será exibida no formulário de cadastramento de
                        indicadores.
                      </v-alert>
                    </v-col>
                  </v-row>

                </v-alert>
              </v-col>
            </v-row>

            <!--Gerenciamento de total-->
            <v-row dense>
              <v-col>
                <v-alert color="green lighten-3">
                  <h3>Mapeamento de Total</h3>

                  <!-- mapeamento total anual e mensal-->
                  <v-row dense>

                    <!-- mapeamento total anual-->
                    <v-col>
                      <span class="pl-3">Anual</span>
                      <v-autocomplete
                        v-model="editedCategoria.mapeamento_total_anual"
                        :items="tipos_mapeamento_total"
                        class="ml-3"
                        dense
                        label="Selecione a forma de mapeamento do total (Anual)"
                        name="mapeamento_total_anual"
                        rounded
                        solo
                      ></v-autocomplete>
                    </v-col>

                    <!-- mapeamento total mensal-->
                    <v-col>
                      <span class="pl-3">Mensal</span>
                      <v-autocomplete
                        v-model="editedCategoria.mapeamento_total_mensal"
                        :items="tipos_mapeamento_total"
                        class="ml-3"
                        dense
                        label="Selecione a forma de mapeamento do total (Mensal)"
                        name="mapeamento_total_mensal"
                        rounded
                        solo
                      ></v-autocomplete>
                    </v-col>

                  </v-row>

                  <!-- explicação-->
                  <v-alert>
                    <p>O mapeamento de Totais refletem como os dados serão acumulados ao tongo do tempo:</p>
                    <img :src="require('@/assets/img/explicatotal.png')" alt="Logo CMA" width="100%">
                    <p>O mapeamento de totais são divididos da seguinte forma:</p>
                    <ul>
                      <li>Somatório: O resultado total será a soma de todos os lançamentos (na linha ou na coluna)</li>
                      <li>Média: O resultado total será a soma de todos os lançamentos dividido pelo número de
                        lançamentos (na linha ou na coluna)
                      </li>
                      <li>Máximo: O resultado total será o maior valor existente (na linha ou na coluna)</li>
                      <li>Mínimo: O resultado total será o menor valor existente (na linha ou na coluna)</li>
                    </ul>
                  </v-alert>

                </v-alert>

              </v-col>
            </v-row>

          </v-card-text>
          <v-card-actions class="pb-5">

            <v-row>
              <v-col class="text-right mr-4">
                <v-btn color="warning lighten-1" @click="dialogAddEditCategoria = false">Cancelar</v-btn>
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

    <!--Dialog para deletar categoria-->
    <v-dialog v-model="dialogDelete" max-width="800px">
      <v-card>
        <v-card-title class="justify-center" primary-title>
          <v-icon
            class="mr-4">
            fa fa-exclamation-triangle
          </v-icon>
          Você tem certeza que quer deletar a categoria {{ editedCategoria.nome }}?
          <v-icon
            class="ml-4">
            fa fa-exclamation-triangle
          </v-icon>

        </v-card-title>
        <v-card-text>
          <div class="text-center">
            <p>Essa ação é irreversível. Tenha certeza do que está fazendo.</p>
            <p>Todos os indicadores vinculados a essa categoria serão excluídos!</p>
          </div>
        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" @click="closeDelete">Cancelar</v-btn>
          <span class="pl-5 pr-5"></span>
          <v-btn color="red lighten-1" @click="deleteCategoriaConfirm">Excluir</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Dialog sobre alteração de natureza-->
    <v-dialog v-model="dialogAlertChangeNatureza" max-width="800px">
      <v-card>
        <v-card-title class="justify-center" primary-title>
          <v-icon
            class="mr-4">
            fa fa-exclamation-triangle
          </v-icon>
          Você esta alterando a natureza dos dados armazenados!
          <v-icon
            class="ml-4">
            fa fa-exclamation-triangle
          </v-icon>

        </v-card-title>
        <v-card-text class="text-justify">
          Você está prestes a substituir a natureza de dados dessa categoria de:
          <v-chip>{{ naturezaAntiga }}</v-chip>
          para:
          <v-chip>{{ naturezaNova }}</v-chip>
          .
          <p>Entenda o impacto disso:</p>
          <p>Atualmente o sistema conta com as seguintes opções de natureza de dados:</p>

          <v-row>
            <v-col>
              <ul>
                <li>Pessoas</li>
                <li>Quantidade (Inteiro)</li>
                <li>Quantidade (Decimal)</li>
                <li>Peso (Kg)</li>
                <li>Peso (Ton)</li>
                <li>Distância (Km)</li>
                <li>Distância (Metros)</li>
                <li>Tempo (Minutos)</li>
                <li>Tempo (Horas)</li>
                <li>Tempo (Dias)</li>
                <li>Tempo (Meses)</li>
                <li>Tempo (Anos)</li>
                <li>Monetário (R$)</li>
                <li>Porcentagem (%)</li>
              </ul>
            </v-col>

            <v-col>
              <v-alert type="warning">
                <p>Apenas as naturezas:</p>
                <ul>
                  <li>Pessoas</li>
                  <li>Quantidade (Inteiro)</li>
                </ul>
                <br>

                <p>Possuem valores registrados em números inteiros, ou seja, sem casas decimais</p>
                <p>Todos as demais naturezas pertencem ao conjunto dos números REAIS positivos.</p>
              </v-alert>
            </v-col>

          </v-row>

          <v-row>
            <v-col>
              <v-alert type="info">
                {{ retornaPreocupacao() }}
              </v-alert>
            </v-col>
          </v-row>

        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" @click="dialogAlertChangeNatureza = false">Cancelar</v-btn>
          <span class="pl-5 pr-5"></span>
          <v-btn :loading="loadBtn" color="red lighten-1" @click="enviaParaPersistencia">Prosseguir</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Dialog sobre alteração de de valores de indicadores-->
    <v-dialog v-model="dialogChangeIndicadorValor" max-width="70%" persistent>
      <v-card>
        <v-card-title class="justify-center" primary-title>
          <v-icon
            class="mr-4">
            fa fa-exclamation-triangle
          </v-icon>
          Revisão de Valores de Indicadores (por motivo de alteração de natureza de dados da categoria)
          <v-icon
            class="ml-4">
            fa fa-exclamation-triangle
          </v-icon>

        </v-card-title>
        <v-card-text class="text-justify">

          Categoria: {{ dadosParaAlteracao.nome }}

          <!--DataTable-->
          <v-data-table
            v-for="indicador in dadosParaAlteracao.indicadores"
            :key="indicador.id"
            :headers="headersAlteracao"
            :items="indicador.indicador_valor"
            :items-per-page=-1
            :loading="dadosParaAlteracao.length === 0"
            class="elevation-21 mt-4"
            group-by="ano"
            hide-default-footer
          >
            <!-- template para indicador-->
            <template v-slot:top>
              <v-toolbar
                flat
              >
                <!-- Título da tabela-->
                <v-toolbar-title>{{ indicador.nome }}</v-toolbar-title>

              </v-toolbar>

            </template>

            <template v-slot:item.mes="{ item }">
              {{ transformaMes(item.mes) }}
            </template>

            <template v-slot:item.valor="{ item }">
              <v-text-field
                :value="item.tempValor !== undefined ? item.tempValor : formatValue(item.valor)"
                dense
                flat
                hide-details
                rounded
                solo-inverted
                type="number"
                @input="item.tempValor = $event"
              ></v-text-field>
            </template>

            <!--Template de botões para editar, excluir -->
            <template v-slot:item.actions="{ item }">

              <!--confirmar-->
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn class="error" small
                         v-bind="attrs" @click="ajustaNumero(item)" v-on="on">
                    <v-icon
                      class="mr-2"
                      small
                    >
                      mdi-check
                    </v-icon>
                    Confirmar
                  </v-btn>
                </template>
                <span>Confirmar dado</span>
              </v-tooltip>

            </template>
          </v-data-table>

        </v-card-text>
        <v-card-actions class="pb-5">
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
          {{leObservacoes}}
        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" @click="dialogShowObservacoes = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>

</template>

<script>import config from '../../http/config'
import {mapGetters} from 'vuex'

export default {
  name: 'gerindicadores',
  data: () => ({
    configSis: config,
    search: '',
    headers: [
      {
        text: 'Nome',
        align: 'start',
        value: 'nome'
      },
      {
        text: 'Seção Responsável',
        align: 'start',
        value: 'secao.sigla'
      },
      {
        text: 'Natureza do Dado',
        align: 'start',
        value: 'natureza'
      },
      {
        text: 'Periodicidade',
        align: 'start',
        value: 'periodicidade'
      },
      {
        text: 'Total (M)',
        align: 'start',
        value: 'mapeamento_total_mensal'
      },
      {
        text: 'Total (A)',
        align: 'start',
        value: 'mapeamento_total_anual'
      },
      {
        text: 'Indicadores Vinculados',
        align: 'center',
        value: 'indicadorLength'
      },
      {
        text: 'Ativo?',
        align: 'start',
        value: 'ativo'
      },
      {
        text: 'Actions',
        value: 'actions',
        align: 'center',
        sortable: false
      }
    ],
    headersAlteracao: [
      {
        text: 'id',
        align: 'start',
        value: 'id'
      },
      {
        text: 'Mes',
        align: 'start',
        value: 'mes'
      },
      {
        text: 'Ano',
        align: 'start',
        value: 'ano'
      },
      {
        text: 'Valor Antigo',
        align: 'start',
        value: 'valor_antigo'
      },
      {
        text: 'Valor Novo',
        align: 'start',
        value: 'valor'
      },
      {
        text: 'Actions',
        value: 'actions',
        align: 'center',
        sortable: false
      }
    ],
    somenteLeitura: false,
    dialogAddEditCategoria: false,
    dialogDelete: false,
    tipoAcao: '',
    defaultCategoria: {
      'nome': '',
      'secao_id': '',
      'natureza': '',
      'secao': {},
      'periodicidade': '',
      'observacoes': '',
      'mapeamento_total_anual': '',
      'mapeamento_total_mensal': '',
      'ativo': true
    },
    editedCategoria: {
      'nome': '',
      'secao_id': '',
      'natureza': '',
      'observacoes': '',
      'secao': {},
      'periodicidade': '',
      'mapeamento_total_anual': '',
      'mapeamento_total_mensal': '',
      'ativo': true
    },
    categorias: [],
    secoes: [],
    editedIndex: -1,
    /*
    - Pessoas               ### INT
    - Quantidade (Inteiro)  ### INT
    - Quantidade (Decimal)  ### FLOAT
    - Peso (Kg)             ### FLOAT
    - Peso (Ton)            ### FLOAT
    - Distância (Km)        ### FLOAT
    - Distância (Metros)    ### FLOAT
    - Tempo (Minutos)       ### FLOAT
    - Tempo (Horas)         ### FLOAT
    - Tempo (Dias)          ### FLOAT
    - Tempo (Meses)         ### FLOAT
    - Tempo (Anos)          ### FLOAT
    - Monetário (R$)        ### FLOAT
    - Porcentagem (%)       ### FLOAT
     */
    naturezas: ['Pessoas', 'Quantidade (Inteiro)', 'Quantidade (Decimal)', 'Peso (Kg)', 'Peso (Ton)', 'Distância (Km)', 'Distância (Metros)', 'Tempo (Minutos)', 'Tempo (Horas)', 'Tempo (Dias)', 'Tempo (Meses)', 'Tempo (Anos)', 'Monetário (R$)', 'Porcentagem (%)'],
    periodicidadeOptions: ['Mensal', 'Anual', 'Eventual'],
    tipos_mapeamento_total: ['Somatório', 'Média', 'Máximo', 'Mínimo'],
    dialogAlertChangeNatureza: false,
    naturezaAntiga: '',
    naturezaNova: '',
    alteracaoNecessaria: false,
    dialogChangeIndicadorValor: false,
    loadBtn: false,
    dadosParaAlteracao: [],
    sistemaVigente: '',
    leObservacoes: '',
    dialogShowObservacoes: false
  }),
  computed: {
    ...mapGetters(['usuarioLogado'])
  },
  watch: {},
  async mounted () {
    await this.getCategorias()
    await this.getSecao()
  },
  methods: {
    async getCategorias () {
      if (this.usuarioLogado.tipo === 'Administrador') {
        try {
          this.$http.get('categorias')
            .then(response => {
              this.categorias = response.data
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          console.log(e)
        }
      } else {
        try {
          this.$http.get('categorias/porsecao/' + this.usuarioLogado.secao_id)
            .then(response => {
              this.categorias = response.data
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          console.log(e)
        }
      }
    },
    async getSecao () {
      try {
        this.$http.get('secao')
          .then(response => {
            if (this.usuarioLogado.tipo === 'Usuário') {
              for (let i = 0; i < response.data.length; i++) {
                if (response.data[i].id === this.usuarioLogado.secao_id) {
                  this.secoes = [response.data[i]]
                  this.editedCategoria.secao_id = response.data[i]
                  this.somenteLeitura = true
                }
              }
            } else {
              this.secoes = response.data
              this.somenteLeitura = false
            }
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    openDialogAddEditCategoria (tipo, item) {
      this.tipoAcao = tipo
      this.alteracaoNecessaria = false
      if (tipo === 'add') {
        this.editedCategoria = Object.assign({}, this.defaultCategoria)
        if (this.usuarioLogado.tipo === 'Usuário') {
          this.editedCategoria.secao_id = this.usuarioLogado.secao_id
          this.somenteLeitura = true
        } else {
          this.somenteLeitura = false
        }
      } else {
        if (this.usuarioLogado.tipo === 'Usuário') {
          this.editedCategoria = Object.assign({}, item)
          this.editedIndex = this.categorias.indexOf(item)
          this.editedCategoria.secao_id = this.usuarioLogado.secao_id
          this.somenteLeitura = true
        } else {
          this.editedCategoria = Object.assign({}, item)
          this.editedIndex = this.categorias.indexOf(item)
          this.somenteLeitura = false
        }
      }
      this.dialogAddEditCategoria = true
    },

    efetuarCadastroEditCategoria () {
      let arrayVal = this.validadoresCampos()
      if (arrayVal[0] > 0) {
        this.$toastr.e(
          arrayVal[1], 'Erro!'
        )
      } else {
        let objetoParaEnvio = {}
        objetoParaEnvio['nome'] = this.editedCategoria.nome
        objetoParaEnvio['secao_id'] = this.editedCategoria.secao_id
        objetoParaEnvio['natureza'] = this.editedCategoria.natureza
        objetoParaEnvio['observacoes'] = this.editedCategoria.observacoes
        objetoParaEnvio['periodicidade'] = this.editedCategoria.periodicidade
        objetoParaEnvio['mapeamento_total_anual'] = this.editedCategoria.mapeamento_total_anual
        objetoParaEnvio['mapeamento_total_mensal'] = this.editedCategoria.mapeamento_total_mensal
        objetoParaEnvio['ativo'] = this.editedCategoria.ativo

        if (this.tipoAcao === 'add') {
          // aqui eu vou adicionar o usuario
          try {
            this.$http.post('categorias', objetoParaEnvio)
              .then(response => {
                this.categorias.push(response.data)
                this.$nextTick(() => {
                  this.editedCategoria = Object.assign({}, this.defaultCategoria)
                  this.editedIndex = -1
                })
                this.dialogAddEditCategoria = false
                this.$toastr.s(
                  'Categoria Cadastrada com sucesso', 'Sucesso!'
                )
                this.$emit('resetaSecao', this.usuarioLogado.tipo)
              })
              .catch(erro => console.log(erro))
          } catch (e) {
            this.$toastr.e(
              'Houve um erro na tentativa de execução: <br>' + e, 'Erro!'
            )
          }
        } else {
          // aqui vou editar

          // tenho que checar se estou alterando antes de mais nada a natureza do indicador
          // caso mude de inteiro para float e vice versa isso vai impactar nos dados a serem transmitidos

          let objetoTeste = {}
          objetoTeste['nova_natureza'] = objetoParaEnvio['natureza']
          objetoTeste['id'] = this.editedCategoria.id

          try {
            this.$http.post('categorias/checanatureza', objetoTeste)
              .then(response => {
                if (response.data[0]) {
                  this.dialogAlertChangeNatureza = true
                  this.naturezaAntiga = response.data[1]
                  this.naturezaNova = response.data[2]
                  this.alteracaoNecessaria = true
                } else {
                  this.enviaParaPersistencia()
                  this.alteracaoNecessaria = false
                }
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

    enviaParaPersistencia () {
      this.loadBtn = true
      let arrayVal = this.validadoresCampos()
      if (arrayVal[0] > 0) {
        this.$toastr.e(
          arrayVal[1], 'Erro!'
        )
      } else {
        let objetoParaEnvio = {}
        objetoParaEnvio['nome'] = this.editedCategoria.nome
        objetoParaEnvio['secao_id'] = this.editedCategoria.secao_id
        objetoParaEnvio['natureza'] = this.editedCategoria.natureza
        objetoParaEnvio['observacoes'] = this.editedCategoria.observacoes
        objetoParaEnvio['periodicidade'] = this.editedCategoria.periodicidade
        objetoParaEnvio['mapeamento_total_anual'] = this.editedCategoria.mapeamento_total_anual
        objetoParaEnvio['mapeamento_total_mensal'] = this.editedCategoria.mapeamento_total_mensal
        objetoParaEnvio['ativo'] = this.editedCategoria.ativo

        try {
          this.$http.put('categorias/' + this.editedCategoria.id, objetoParaEnvio)
            .then(response => {
              Object.assign(this.categorias[this.editedIndex], response.data)
              this.$toastr.s(
                'Categoria alterada com sucesso', 'Sucesso!'
              )
              this.$nextTick(() => {
                this.editedCategoria = Object.assign({}, this.defaultCategoria)
                this.editedIndex = -1
              })

              this.$emit('resetaSecao', this.usuarioLogado.tipo)

              if (this.alteracaoNecessaria) {
                let objetoParaEnvio = response.data

                try {
                  this.$http.post('valorindicador/valor/alteracao', objetoParaEnvio)
                    .then(response => {
                      let dadosBrutos = response.data

                      for (let i = 0; i < dadosBrutos.indicadores.length; i++) {
                        for (let j = 0; j < dadosBrutos.indicadores[i].indicador_valor.length; j++) {
                          dadosBrutos.indicadores[i].indicador_valor[j].valor_antigo = dadosBrutos.indicadores[i].indicador_valor[j].valor
                        }
                      }
                      this.dadosParaAlteracao = dadosBrutos

                      this.dialogChangeIndicadorValor = true
                      this.dialogAddEditCategoria = false
                      this.dialogAlertChangeNatureza = false
                      this.loadBtn = false
                    })
                    .catch(erro => console.log(erro))
                } catch (e) {
                  console.log(e)
                }
              } else {
                this.dialogAddEditCategoria = false
                this.dialogAlertChangeNatureza = false
                this.loadBtn = false
              }
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          this.$toastr.e(
            'Houve um erro na tentativa de execução: <br>' + e, 'Erro!'
          )
        }
      }
    },

    validadoresCampos () {
      let msgRetornoErro = ''
      let contador = 0

      if (this.editedCategoria.nome === '') {
        msgRetornoErro += '<li>O Nome não pode ser vazio.</li>'
        contador++
      }
      if (this.editedCategoria.secao_id === '') {
        msgRetornoErro += '<li>Selecione uma seção.</li>'
        contador++
      }
      if (this.editedCategoria.natureza === '') {
        msgRetornoErro += '<li>Selecione a natureza do dado a ser armazenado.</li>'
        contador++
      }

      if (this.editedCategoria.mapeamento_total_anual === '') {
        msgRetornoErro += '<li>Selecione o Mapeamento de Total Anual.</li>'
        contador++
      }

      if (this.editedCategoria.mapeamento_total_mensal === '') {
        msgRetornoErro += '<li>Selecione o Mapeamento de Total Mensal.</li>'
        contador++
      }
      msgRetornoErro = '<ul>' + msgRetornoErro + '</ul>'
      return [contador, msgRetornoErro]
    },

    deleteCategoria (item) {
      this.editedIndex = this.categorias.indexOf(item)
      this.editedCategoria = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteCategoriaConfirm () {
      this.$http.delete('categorias/' + this.editedCategoria.id)
        // eslint-disable-next-line no-return-assign
        .then(() => {
          this.categorias.splice(this.editedIndex, 1)
          this.closeDelete()
          this.$toastr.s(
            'Categoria removida com sucesso', 'Sucesso!'
          )
          this.$emit('resetaSecao', this.usuarioLogado.tipo)
        }, err => {
          console.log(err)
          this.$toastr.e(
            'Não foi possível remover a categoria', 'Erro!'
          )
        })
    },

    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedCategoria = Object.assign({}, this.defaultCategoria)
        this.editedIndex = -1
      })
    },

    getItemClass (item) {
      return item.ativo ? '' : 'row-inactive'
    },

    retornaPreocupacao () {
      const naturezasInt = ['Pessoas', 'Quantidade (Inteiro)']
      const naturezasFloat = ['Quantidade (Decimal)', 'Peso (Kg)', 'Peso (Ton)', 'Distância (Km)', 'Distância (Metros)', 'Tempo (Minutos)', 'Tempo (Horas)', 'Tempo (Dias)', 'Tempo (Meses)', 'Tempo (Anos)', 'Monetário (R$)', 'Porcentagem (%)']

      const isIntAntiga = naturezasInt.includes(this.naturezaAntiga)
      const isFloatAntiga = naturezasFloat.includes(this.naturezaAntiga)
      const isIntNova = naturezasInt.includes(this.naturezaNova)
      const isFloatNova = naturezasFloat.includes(this.naturezaNova)

      if ((isIntAntiga && !isIntNova) || (isFloatAntiga && !isFloatNova)) {
        this.alteracaoNecessaria = true
        return 'A natureza antiga e a nova não pertencem ao mesmo grupo. (Ao prosseguir, você será redirecionado para uma nova tela, com a finalidade de revisão dos novos valores impactados pela mudança)'
      } else {
        this.alteracaoNecessaria = false
        return 'A natureza antiga e a nova pertencem ao mesmo grupo. (você não sofrerá nenhuma consequência)'
      }
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

    formatValue (value) {
      const natuInt = ['Pessoas', 'Quantidade (Inteiro)']
      const intt = natuInt.includes(this.naturezaNova)
      if (intt) {
        return parseInt(value)
      } else {
        return Number.isInteger(value) ? value.toFixed(2) : parseFloat(value.toFixed(2))
      }
    },

    ajustaNumero (item) {
      // Faça o que for necessário com o valor ajustado
      try {
        this.$http.post('valorindicador/valor/doit', item)
          .then(response => {
            for (let i = 0; i < this.dadosParaAlteracao.indicadores.length; i++) {
              for (let j = 0; j < this.dadosParaAlteracao.indicadores[i].indicador_valor.length; j++) {
                if (this.dadosParaAlteracao.indicadores[i].indicador_valor[j].id === response.data.id) {
                  this.dadosParaAlteracao.indicadores[i].indicador_valor.splice(j, 1)
                  j-- // Adjust index after removal
                }
              }
            }
            this.$toastr.s(
              'Dado ajustado com sucesso!', 'Sucesso!'
            )

            let contador = 0
            for (let i = 0; i < this.dadosParaAlteracao.indicadores.length; i++) {
              contador += this.dadosParaAlteracao.indicadores[i].indicador_valor.length
            }
            if (contador === 0) {
              this.dialogChangeIndicadorValor = false
            }
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
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
.row-inactive {
  background-color: #E89380 !important;
}

.v-row-group__header {
  background-color: #b6c378 !important; /* Cor de fundo para a linha agrupada */
  font-weight: bold; /* Texto em negrito */
  cursor: pointer; /* Cursor para indicar que é clicável */
}

.bgcat {
  background-color: #b6c378 !important;
}
</style>
