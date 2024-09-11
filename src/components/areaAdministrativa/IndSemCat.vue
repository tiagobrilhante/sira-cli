<template>
  <v-row dense>
    <v-col>
      <v-alert elevation="12">
        <h3>Pesquisa de Indicadores sem categorias</h3>
        <v-alert type="info">
          Indicadores que não possuem categorias vinculadas, apresentam erros principalmente no painel de gerenciamento
          de indicadores.
          A ocorrência desse fato se dá quando um usuário remove uma categoria cadastrada no sistema, sem antes remover
          os indicadores vinculados a ela.
          Para corrigir esse erro, clique no botão abaixo e verifique quais Indicadores se encontram nessa condição.
          <v-row class="mt-5">
            <v-col>
              <v-btn block class="secondary" rounded @click="doPesquisaIndSemCat">
                Pesquisar Indicadores sem Categorias
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>

        <v-alert v-if="indicadores.length > 0" elevation="5">
          <v-row>
            <v-col>
              <h3>Resultado da busca</h3>
            </v-col>
            <v-col class="text-right">
              <v-btn color="error" small @click="openDialogExcluirTodes"> Excluir todos</v-btn>
            </v-col>
          </v-row>

        </v-alert>
        <v-data-table
          v-if="indicadores.length > 0"
          :headers="headers"
          :items="indicadores"
          :items-per-page="-1"
          class="elevation-21"
          dense
          disable-pagination
          hide-default-footer
        >
          <!-- categoria-->
          <template v-slot:item.categoria="{ item }">
            {{ retornaCatExcluida(item).nome }}
          </template>

          <!-- valor-->
          <template v-slot:item.valor="{ item }">
            {{ item.indicador_valor.length }}
          </template>

          <!--Template de botões para editar, excluir -->
          <template v-slot:item.actions="{ item }">

            <!--Excluir-->
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  class="mr-2"
                  small
                  v-bind="attrs"
                  @click="openDialogDeleteIndicador(item)"
                  v-on="on"
                >
                  mdi-delete
                </v-icon>
              </template>
              <span>Excluir Indicador</span>
            </v-tooltip>

          </template>
        </v-data-table>

        <v-alert v-if="resultadoBuscaVazio" elevation="5">
          <v-row>
            <v-col class="text-center">
              <h3>Não existem indicadores sem categorias</h3>
            </v-col>
          </v-row>

        </v-alert>

      </v-alert>

    </v-col>

    <!--Dialog para deletar indicador-->
    <v-dialog v-model="dialogDeleteIndicador" max-width="800px">
      <v-card>
        <v-card-title class="justify-center" primary-title>
          <v-icon
            class="mr-4">
            fa fa-exclamation-triangle
          </v-icon>
          Você tem certeza que quer deletar esse indicador?
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
          <v-btn color="grey lighten-1" @click="dialogDeleteIndicador = false">Cancelar</v-btn>
          <span class="pl-5 pr-5"></span>
          <v-btn color="red lighten-1" @click="deleteIndicadorConfirm">Excluir</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Dialog para deletar TODES indicador-->
    <v-dialog v-model="dialogExcluirTodes" max-width="800px">
      <v-card>
        <v-card-title class="justify-center" primary-title>
          <v-icon
            class="mr-4">
            fa fa-exclamation-triangle
          </v-icon>
          Você tem certeza que quer deletar todos os indicadores?
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
          <v-btn color="grey lighten-1" @click="dialogExcluirTodes = false">Cancelar</v-btn>
          <span class="pl-5 pr-5"></span>
          <v-btn color="red lighten-1" @click="deleteTodesConfirm">Excluir</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'

export default {
  name: 'indSemCat',
  mixins: [logoutMixin],

  data: () => ({
    indicadores: [],
    deletedCategories: [],
    headers: [
      {
        text: 'id',
        align: 'center',
        value: 'id'
      },
      {
        text: 'Indicador',
        align: 'center',
        value: 'nome'
      },
      {
        text: 'Categoria Excluída',
        align: 'center',
        value: 'categoria'
      },
      {
        text: 'Lançamento de Valor (qtd)',
        align: 'center',
        value: 'valor'
      },
      {
        text: 'Ação',
        align: 'center',
        value: 'actions',
        sortable: false
      }
    ],
    dialogDeleteIndicador: false,
    selectedIndicador: {},
    dialogExcluirTodes: false,
    resultadoBuscaVazio: false
  }),

  computed: {
    ...mapGetters(['usuarioLogado'])
  },
  created () {
  },
  watch: {},

  mounted () {
  },

  methods: {
    doPesquisaIndSemCat () {
      try {
        this.$http.get('ferramenta/indsemcat')
          .then(response => {
            this.indicadores = response.data[0]
            this.deletedCategories = response.data[1]
            this.resultadoBuscaVazio = this.indicadores.length === 0
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    retornaCatExcluida (item) {
      for (let i = 0; i < this.deletedCategories.length; i++) {
        if (this.deletedCategories[i].id === item.categoria_id) {
          return this.deletedCategories[i]
        }
      }
    },

    openDialogDeleteIndicador (item) {
      this.editedIndex = this.indicadores.indexOf(item)
      this.selectedIndicador = Object.assign({}, item)
      this.dialogDeleteIndicador = true
    },

    deleteIndicadorConfirm () {
      this.$http.delete('indicadores/' + this.selectedIndicador.id)
        // eslint-disable-next-line no-return-assign
        .then(() => {
          this.indicadores.splice(this.editedIndex, 1)
          this.dialogDeleteIndicador = false
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

    openDialogExcluirTodes () {
      this.dialogExcluirTodes = true
    },

    deleteTodesConfirm () {
      let objetoParaEnvio = {}
      objetoParaEnvio['indicadores'] = this.indicadores
      this.$http.post('indicadores/destroiinvalidos', objetoParaEnvio)
        // eslint-disable-next-line no-return-assign
        .then(() => {
          this.indicadores = []
          this.dialogExcluirTodes = false
          this.$toastr.s(
            'Indicadores removidos com sucesso', 'Sucesso!'
          )
        }, err => {
          console.log(err)
          this.$toastr.e(
            'Não foi possível remover os Indicadores', 'Erro!'
          )
        })
    }
  }
}
</script>
<style>
</style>
