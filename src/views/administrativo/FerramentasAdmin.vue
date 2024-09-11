<template>
  <v-main class="bgConfig">

    <!--Barra de navegação da área administrativa-->
    <BarraNavegacao></BarraNavegacao>

    <v-container fluid>
      <v-row class="pt-0" dense>
        <v-col>

          <!-- header -->
          <v-alert elevation="21">
            <h2>
              <v-icon
                class="mr-4"
                size="36">
                mdi-cog
              </v-icon>
              Ferramentas Administrativas
            </h2>
          </v-alert>

          <!-- menu de ferramentas-->
          <v-alert dense elevation="12">
            <h2>Menu de ferramentas</h2>
            <v-btn :class="ajustaCorBtn('integridade')" @click="changeVisibilityFerramenta('analiseIntegridade')">
              Análise de
              integridade do
              banco
            </v-btn>
            <v-btn :class="ajustaCorBtn('relatorio')" @click="changeVisibilityFerramenta('relatorioPendencias')">
              Relatório de
              pendências
            </v-btn>
            <v-btn :class="ajustaCorBtn('verificaIndSemCat')" @click="changeVisibilityFerramenta('verificaIndSemCat')">
              Verificação de Indicadores sem categoria
            </v-btn>
          </v-alert>

          <!-- análise de integridade do banco-->
          <v-alert v-if="integridadeBancoVisibility" elevation="21">
            <h3>Análise de integridade do Banco de Dados</h3>
            <v-row>
              <v-col cols="12">
                <v-alert class="text-justify" color="red lighten-3">

                  <!-- explicação-->
                  <h3>A análise de integridade do banco, pesquisa se existem valores duplicados no mesmo mês e ano para
                    um determinado indicador</h3>
                  <h4>O Sistema CMA em números entende que para cada indicador, só pode existir um lançamento único em
                    cada mês de cada ano.</h4>
                  <p>Preencha o intervalo no qual você deseja realizar uma varredura do banco de dados. </p>
                  <p>Caso você deseje verificar apenas um ano, coloque o mesmo valor no "Ano Inicial" e "Ano Final".</p>

                  <!-- ano de início e fim -->
                  <v-row>
                    <!-- ano de início -->
                    <v-col>
                      <span class="pl-3">Ano de início de Verificação</span>
                      <v-text-field
                        v-model="ano_verifica_inicio"
                        :rules="anoRules()"
                        dense
                        label="Ano Inicial"
                        maxlength="4"
                        rounded
                        solo
                        type="text"
                        @input="filtraAno($event, 'inicio')"
                      ></v-text-field>
                    </v-col>
                    <!-- ano de fim -->
                    <v-col>
                      <span class="pl-3">Ano de fim de Verificação</span>
                      <v-text-field
                        v-model="ano_verifica_fim"
                        :rules="anoRules()"
                        dense
                        label="Ano Final"
                        maxlength="4"
                        rounded
                        solo
                        type="text"
                        @input="filtraAno($event, 'fim')"
                      ></v-text-field>
                    </v-col>

                  </v-row>

                  <!-- executa a análise-->
                  <v-btn v-if="ano_verifica_inicio.length === 4 && ano_verifica_fim.length === 4" block
                         color="secondary"
                         @click="analisaIntegridade">Analisar
                  </v-btn>

                  <!-- resultado da análise-->
                  <v-alert v-if="resultadoIntegridade.length > 0" class="mt-5" elevation="21">
                    <v-row>
                      <v-col><h2>Resultado da busca - Houveram um total de {{ resultadoIntegridade.length }}
                        registro(s)</h2></v-col>
                      <v-col class="text-right">
                        <v-btn class="warning" @click="dialogDeleteRegistroTodos = true">
                          <v-icon class="mr-4" small>mdi-alert-outline</v-icon>
                          Limpe todos os registros duplicados de uma vez
                        </v-btn>
                      </v-col>
                    </v-row>

                    <!-- data table com os resultados-->
                    <v-data-table
                      :headers="headersIntegridade"
                      :items="resultadoIntegridade"
                      :items-per-page="-1"
                      class="elevation-21 mt-4"
                      disable-pagination
                      group-by="ano"
                      sort-by="mes"
                    >
                      <template v-slot:item.mes="{ item }">
                        {{ transformaMes(item.mes) }}
                      </template>

                      <!--Template de excluir -->
                      <template v-slot:item.actions="{ item }">

                        <!--Excluir-->
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                              class="mr-2"
                              small
                              v-bind="attrs"
                              @click="openDialogDeleteItem(item)"
                              v-on="on"
                            >
                              mdi-delete
                            </v-icon>
                          </template>
                          <span>Excluir Registro Duplicado</span>
                        </v-tooltip>

                      </template>
                    </v-data-table>
                  </v-alert>

                  <v-alert v-if="dadodDuplicadosInexistentes" class="mt-5" elevation="21">
                    <h3>Não existem dados duplicados no banco</h3>
                  </v-alert>
                </v-alert>
              </v-col>
            </v-row>
          </v-alert>

          <RelatorioPendencias v-if="relatorioPendenciasVisibility" class="mt-0"/>

          <IndSemCat v-if="relatorioIndSemCatVisibility" class="mt-0"/>

          <!-- selecione uma oipção-->
          <v-alert v-if="alertEscolha" elevation="12" type="info">
            <h3>Selecione uma opção do menu acima.</h3>
          </v-alert>
        </v-col>
      </v-row>
    </v-container>

    <!--Dialog para deletar registro-->
    <v-dialog v-model="dialogDeleteRegistro" max-width="800px" persistent>
      <v-card>
        <v-card-title class="justify-center" primary-title>
          <v-icon
            class="mr-4">
            fa fa-exclamation-triangle
          </v-icon>
          Você tem certeza que quer deletar o Registro?
          <v-icon
            class="ml-4">
            fa fa-exclamation-triangle
          </v-icon>

        </v-card-title>
        <v-card-text>
          <div class="text-center">Essa ação é irreversível. Tenha certeza do que está fazendo.</div>
        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" @click="dialogDeleteRegistro = false">Cancelar</v-btn>
          <span class="pl-5 pr-5"></span>
          <v-btn color="red lighten-1" @click="doDeleteItem">Excluir</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Dialog para deletar todos os registros duplicados-->
    <v-dialog v-model="dialogDeleteRegistroTodos" max-width="70%" persistent>
      <v-card>
        <v-card-title class="justify-center" primary-title>
          <v-icon
            class="mr-4">
            fa fa-exclamation-triangle
          </v-icon>
          Você tem certeza que quer deletar o TODOS os Registro duplicados do Banco de Dados?
          <v-icon
            class="ml-4">
            fa fa-exclamation-triangle
          </v-icon>

        </v-card-title>
        <v-card-text>
          <div class="text-center">Essa ação é irreversível. Tenha certeza do que está fazendo.</div>
        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" @click="dialogDeleteRegistroTodos = false">Cancelar</v-btn>
          <span class="pl-5 pr-5"></span>
          <v-btn color="red lighten-1" @click="fazLimpeza">Excluir</v-btn>
          <v-spacer></v-spacer>
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
import RelatorioPendencias from '../../components/areaAdministrativa/RelatorioPendencias.vue'
import IndSemCat from '../../components/areaAdministrativa/IndSemCat.vue'

export default {
  name: 'ferramentasAdm',
  mixins: [logoutMixin],
  components: {BarraNavegacao, RelatorioPendencias, IndSemCat},
  data: () => ({
    configSis: config,
    ano_verifica_inicio: '',
    ano_verifica_fim: '',
    resultadoIntegridade: [],
    headersIntegridade: [
      {
        text: 'Id',
        align: 'start',
        value: 'id'
      },
      {
        text: 'Mês',
        align: 'start',
        value: 'mes'
      },
      {
        text: 'Ano',
        align: 'start',
        value: 'ano'
      },
      {
        text: 'Valor',
        align: 'start',
        value: 'valor'
      },
      {
        text: 'Categoria',
        align: 'start',
        value: 'indicador.categoria.nome'
      },
      {
        text: 'Indicador',
        align: 'start',
        value: 'indicador.nome'
      },
      {
        text: 'Seção responsável',
        align: 'start',
        value: 'indicador.categoria.secao.sigla'
      },
      {
        text: 'Criado em',
        align: 'start',
        value: 'created_at'
      },
      {
        text: 'Alterado em',
        align: 'start',
        value: 'updated_at'
      },
      {
        text: 'Actions',
        value: 'actions',
        align: 'center',
        sortable: false
      }
    ],
    dialogDeleteRegistro: false,
    dialogDeleteRegistroTodos: false,
    selectedRegistro: {},
    dadodDuplicadosInexistentes: false,
    integridadeBancoVisibility: false,
    relatorioPendenciasVisibility: false,
    relatorioIndSemCatVisibility: false,
    alertEscolha: true
  }),
  computed: {
    ...mapGetters(['usuarioLogado'])
  },
  watch: {
    'ano_verifica_inicio' (newValue, oldValue) {
      if (newValue && newValue.length > 4) {
        this.ano_verifica_inicio = oldValue
      }
    },
    'ano_verifica_fim' (newValue, oldValue) {
      if (newValue && newValue.length > 4) {
        this.ano_verifica_fim = oldValue
      }
    }
  },

  async mounted () {
  },
  methods: {
    async analisaIntegridade () {
      let objetoParaEnvio = {
        ano_inicio: this.ano_verifica_inicio,
        ano_fim: this.ano_verifica_fim
      }
      try {
        this.$http.post('ferramenta/integridade', objetoParaEnvio)
          .then(response => {
            this.resultadoIntegridade = response.data
            if (this.resultadoIntegridade.length === 0) {
              this.dadodDuplicadosInexistentes = true
            }
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
        v => (/^\d{4}$/).test(v) || 'O ano deve ter 4 dígitos'
      ]
    },

    filtraAno (event, tipo) {
      this.dadodDuplicadosInexistentes = false
      this.resultadoIntegridade = []
      if (event && event.target) {
        let value = event.target.value
        // Remove caracteres que não são dígitos
        value = value.replace(/\D/g, '')
        // Limita a quantidade de dígitos para 4
        if (value.length > 4) {
          value = value.slice(0, 4)
        }
        // Atualiza o valor no input e no modelo
        event.target.value = value

        if (tipo === 'fim') {
          this.ano_verifica_fim = value
        } else {
          this.ano_verifica_inicio = value
        }
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

    openDialogDeleteItem (item) {
      this.selectedRegistro = Object.assign({}, item)
      this.dialogDeleteRegistro = true
    },

    closeDelete () {
      this.dialogDeleteRegistro = false
      this.selectedRegistro = {}
      this.ano_verifica_inicio = ''
      this.ano_verifica_fim = ''
      this.resultadoIntegridade = []
      this.dadodDuplicadosInexistentes = false
    },

    doDeleteItem () {
      try {
        this.$http.delete('ferramenta/excluiduplicado/' + this.selectedRegistro.id)
          .then(() => {
            this.analisaIntegridade()
            this.dialogDeleteRegistro = false
            this.$toastr.s(
              'Registro duplicado removido com sucesso', 'Sucesso!'
            )
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    fazLimpeza () {
      let objetoParaEnvio = {
        ano_inicio: this.ano_verifica_inicio,
        ano_fim: this.ano_verifica_fim
      }
      try {
        this.$http.post('ferramenta/corretor', objetoParaEnvio)
          .then(() => {
            this.closeDelete()
            this.dialogDeleteRegistroTodos = false
            this.$toastr.s(
              'Correção feita com sucesso', 'Sucesso!'
            )
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        this.$toastr.e(
          'Houve um erro na tentativa de execução: <br>' + e, 'Erro!'
        )
      }
    },

    changeVisibilityFerramenta (qual) {
      if (qual === 'analiseIntegridade') {
        this.integridadeBancoVisibility = true
        this.relatorioPendenciasVisibility = false
        this.relatorioIndSemCatVisibility = false
        this.alertEscolha = false
      } else if (qual === 'relatorioPendencias') {
        this.integridadeBancoVisibility = false
        this.relatorioPendenciasVisibility = true
        this.relatorioIndSemCatVisibility = false
        this.alertEscolha = false
      } else if (qual === 'verificaIndSemCat') {
        this.integridadeBancoVisibility = false
        this.relatorioPendenciasVisibility = false
        this.relatorioIndSemCatVisibility = true
        this.alertEscolha = false
      }
    },

    ajustaCorBtn (selecionado) {
      if (selecionado === 'integridade') {
        if (this.integridadeBancoVisibility) {
          return 'secondary'
        } else {
          return 'primary'
        }
      } else if (selecionado === 'relatorio') {
        if (this.relatorioPendenciasVisibility) {
          return 'secondary'
        } else {
          return 'primary'
        }
      } else if (selecionado === 'verificaIndSemCat') {
        if (this.relatorioIndSemCatVisibility) {
          return 'secondary'
        } else {
          return 'primary'
        }
      } else {
        return 'primary'
      }
    }
  }
}
</script>

<style>
.bgConfig {
  background-color: #CFE0BC !important;
}
</style>
