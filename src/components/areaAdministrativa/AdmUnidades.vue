<template>
  <v-main class="bgConfig">

    <BarraNavegacao></BarraNavegacao>

    <!--banner e datatable-->
    <v-container v-if="usuarioEstaLogado" class="pt-5" fluid>

      <!--Banner-->
      <v-alert
        class="p-5"
        color="#015088"
        elevation="21"
      >
        <v-row>
          <v-col class="white--text" cols="9">
            <h2>
              <v-icon
                class="mr-4"
                color="white"
                size="36">
                mdi-office-building
              </v-icon>
              Gerenciamento de Unidades / Cursos
            </h2>

          </v-col>
          <v-col class="text-right" cols="3">
            <v-btn class="primary" @click="openDialogAddEditUnidade('add')">
              <v-icon class="mr-4">mdi-plus-circle</v-icon>
              Adicionar Nova Unidade
            </v-btn>
          </v-col>
        </v-row>

      </v-alert>
      <!--DataTable-->
      <v-data-table
        :custom-filter="customFilter"
        :headers="headers"
        :items="unidades"
        :search="search"
        class="elevation-21 mt-4"
        sort-by="nome"

      >
        <!-- template para titulo e search-->
        <template v-slot:top>
          <v-toolbar
            flat
          >
            <!-- Título da tabela-->
            <v-toolbar-title>Tabela de Unidades / Cursos Existentes</v-toolbar-title>

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

        <!--Template de cursos -->
        <template v-slot:item.cursos="{ item }">

          <ul v-if="item.cursos.length > 0">
            <li v-for="curso in item.cursos" :key="curso.id">
              <v-tooltip v-if="curso.semestre_codigo !== null && curso.semestre_codigo === emVigencia()" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="mr-2"
                    color="green"
                    small
                    v-bind="attrs"
                    v-on="on"
                  >
                    mdi-check
                  </v-icon>
                </template>
                <span>Em Vigência</span>
              </v-tooltip>

              <v-tooltip v-else top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="mr-2"
                    color="red"
                    small
                    v-bind="attrs"
                    v-on="on"
                  >
                    mdi-alert
                  </v-icon>
                </template>
                <span>Fora de vigência</span>
              </v-tooltip>

              {{ curso.nome }}
              <v-icon class="ml-4" small @click="openDialogDetalhes(curso)">mdi-magnify</v-icon>

            </li>
          </ul>
          <v-chip v-else color="yellow" small> Sem Cursos Cadastrados</v-chip>

        </template>

        <!--Template de botões para editar, excluir -->
        <template v-slot:item.actions="{ item }">

          <!--editar-->
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="mr-2"
                small
                v-bind="attrs"
                @click="openDialogAddEditUnidade('edit', item)"
                v-on="on"
              >
                mdi-pen
              </v-icon>
            </template>
            <span>Editar Unidade</span>
          </v-tooltip>

          <!--Excluir-->
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="mr-2"
                small
                v-bind="attrs"
                @click="deleteUnidade(item)"
                v-on="on"
              >
                mdi-delete
              </v-icon>
            </template>
            <span>Excluir Unidade</span>
          </v-tooltip>

        </template>

      </v-data-table>

      <!--Dialog para add/edit unidade-->
      <v-dialog v-model="dialogAddEditUnidade" max-width="70%">
        <v-card>
          <v-form @submit.prevent="efetuarCadastroEditUnidade">

            <v-card-title class="justify-center" primary-title>
              <span v-if="tipoAcao === 'add'">Adicionar nova Unidade</span><span v-else>Edição de Unidade</span>
            </v-card-title>

            <v-card-text>

              <!-- nome completo / nome de guerra -->
              <v-row dense>

                <!--nome completo-->
                <v-col>
                  <span class="pl-3">Nome da Unidade (Obrigatório)</span>
                  <v-text-field
                    v-model="editedUnidade.nome"
                    class="ml-3"
                    dense
                    label="Nome da Unidade"
                    rounded
                    solo
                  ></v-text-field>
                </v-col>

                <!-- matricula -->
                <v-col>
                  <span class="pl-3">Prefixo (Obrigatório)</span>
                  <v-text-field
                    v-model="editedUnidade.prefixo"
                    class="ml-3"
                    dense
                    label="Prefixo"
                    rounded
                    solo
                  ></v-text-field>
                </v-col>
              </v-row>

            </v-card-text>
            <v-card-actions class="pb-5">

              <v-row>
                <v-col class="text-right mr-4">
                  <v-btn color="warning lighten-1" @click="dialogAddEditUnidade = false">Cancelar</v-btn>
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

      <!--Dialog para deletar Unidade-->
      <v-dialog v-model="dialogDelete" max-width="800px">
        <v-card>
          <v-card-title class="justify-center" primary-title>
            <v-icon
              class="mr-4">
              fa fa-exclamation-triangle
            </v-icon>
            Você tem certeza que quer deletar a Unidade {{ editedUnidade.nome }}?
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
            <v-btn color="grey lighten-1" @click="closeDelete">Cancelar</v-btn>
            <span class="pl-5 pr-5"></span>
            <v-btn color="red lighten-1" @click="deleteUnidadeConfirm">Excluir</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!--Dialog para detalhes de cursos-->
      <v-dialog v-model="dialogDetalheCurso" max-width="800px">
        <v-card>
          <v-card-title class="justify-center" primary-title>
            Detalhes do Curso
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col><b>Nome: </b>{{ objetoCursoSelecionado.nome }}</v-col>
              <v-col><b>Código: </b>{{ objetoCursoSelecionado.codigo }}</v-col>
            </v-row>

            <v-row>
              <v-col><b>Quantidade Total de períodos: </b>{{ objetoCursoSelecionado.qtd_periodos_possiveis }}</v-col>
            </v-row>

            <v-row>

              <v-col>
                <v-alert
                  v-if="objetoCursoSelecionado.semestre_codigo !== null && objetoCursoSelecionado.semestre_codigo === emVigencia()"
                  color="green lighten-3">
                  Esse curso possui registro de atividade previsto para o semestre letivo: {{ emVigencia() }}
                </v-alert>
                <v-alert v-else color="red lighten-3">
                  Esse curso não possui registro de atividade previsto para o semestre letivo: {{ emVigencia() }}<br>
                  Você pode resolver isso, habilitando o semestre letivo no menu de controle de semestres.
                </v-alert>
              </v-col>

            </v-row>

          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer></v-spacer>
            <v-btn class="white--text" color="rgb(250, 115, 59)" @click="dialogDetalheCurso = false"> Fechar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>

    <v-container v-else class="pt-5" fluid>
      <v-alert type="error">
        Você não tem permissão para estar aqui!
      </v-alert>
    </v-container>

  </v-main>

</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'
import BarraNavegacao from '../barra-navegacao/BarraNavegacao.vue'

export default {
  mixins: [logoutMixin],
  components: {BarraNavegacao},
  data: () => ({
    configSis: config,
    // options de select
    unidades: [],
    // fim options select
    search: '',
    headers: [
      {
        text: 'Nome',
        align: 'start',
        value: 'nome',
        search: true
      },
      {
        text: 'Prefixo',
        align: 'start',
        value: 'prefixo',
        search: true
      },
      {
        text: 'Cursos',
        align: 'start',
        value: 'cursos',
        search: true
      },
      {
        text: 'Actions',
        value: 'actions',
        align: 'center',
        search: false,
        sortable: false
      }
    ],
    defaultUnidade: {
      'nome': '',
      'prefixo': ''
    },
    editedUnidade: {
      'nome': '',
      'prefixo': ''
    },
    dialogDelete: false,
    dialogReset: false,
    dialogAddEditUnidade: false,
    editedIndex: -1,
    tipoAcao: '',
    dialogDetalheCurso: false,
    objetoCursoSelecionado: {}
  }),
  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado'])
  },
  async mounted () {
    await this.getUnidades()
  },
  methods: {

    async getUnidades () {
      try {
        this.$http.get('unidades/vigente')
          .then(response => {
            console.log(response.data)
            this.unidades = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    openDialogAddEditUnidade (tipo, item) {
      this.tipoAcao = tipo
      if (tipo === 'add') {
        this.editedUnidade = Object.assign({}, this.defaultUnidade)
      } else {
        this.editedUnidade = Object.assign({}, item)
        this.editedIndex = this.unidades.indexOf(item)
      }
      this.dialogAddEditUnidade = true
    },

    openDialogReset (item) {
      this.editedUnidade = Object.assign({}, item)
      this.editedIndex = this.unidades.indexOf(item)
      this.dialogReset = true
    },

    efetuarCadastroEditUnidade () {
      let arrayVal = this.validadoresCampos()
      if (arrayVal[0] > 0) {
        this.$toastr.e(
          arrayVal[1], 'Erro!'
        )
      } else {
        let objetoParaEnvio = {}
        objetoParaEnvio['nome'] = this.editedUnidade.nome
        objetoParaEnvio['prefixo'] = this.editedUnidade.prefixo

        if (this.tipoAcao === 'add') {
          // aqui eu vou adicionar a unidade
          try {
            this.$http.post('unidades', objetoParaEnvio)
              .then(response => {
                this.unidades.push(response.data)
                this.dialogAddEditUnidade = false
                this.$toastr.s(
                  'Unidade Cadastrada com sucesso', 'Sucesso!'
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
            this.$http.put('unidades/' + this.editedUnidade.id, objetoParaEnvio)
              .then(response => {
                Object.assign(this.unidades[this.editedIndex], response.data)
                this.$toastr.s(
                  'Unidade alterada com sucesso', 'Sucesso!'
                )
                this.dialogAddEditUnidade = false
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

    deleteUnidade (item) {
      this.editedIndex = this.unidades.indexOf(item)
      this.editedUnidade = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteUnidadeConfirm () {
      this.$http.delete('unidades/' + this.editedUnidade.id)
        // eslint-disable-next-line no-return-assign
        .then(() => {
          this.unidades.splice(this.editedIndex, 1)
          this.closeDelete()
          this.$toastr.s(
            'Unidade removida com sucesso', 'Sucesso!'
          )
        }, err => {
          console.log(err)
          this.$toastr.e(
            'Não foi possível remover a Unidade', 'Erro!'
          )
        })
    },

    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedUnidade = {}
        this.editedIndex = -1
      })
    },

    validadoresCampos () {
      let msgRetornoErro = ''
      let contador = 0

      if (this.editedUnidade.nome === '') {
        msgRetornoErro += '<li>O Nome da Unidade não pode ser vazio.</li>'
        contador++
      }
      if (this.editedUnidade.prefixo === '') {
        msgRetornoErro += '<li>O Campo Prefixo não pode ser vazio.</li>'
        contador++
      }
      msgRetornoErro = '<ul>' + msgRetornoErro + '</ul>'
      return [contador, msgRetornoErro]
    },

    openDialogDetalhes (curso) {
      console.log(curso)
      this.objetoCursoSelecionado = curso
      this.dialogDetalheCurso = true
    },

    emVigencia () {
      // Obtém o ano corrente
      const currentYear = new Date().getFullYear()

      // Obtém o mês corrente
      const currentMonth = new Date().getMonth() + 1 // Janeiro é 0, por isso somamos 1

      // Define o semestre com base no mês
      const currentSemester = currentMonth <= 6 ? 1 : 2

      // Retorna o ano com os dois últimos dígitos e o semestre
      return currentYear.toString().slice(-2) + '.' + currentSemester
    },

    customFilter (value, search, item) {
      if (!search) return true

      // Verifica se o nome da unidade ou prefixo corresponde à busca
      const inUnidadeNome = item.nome.toLowerCase().includes(search.toLowerCase())
      const inUnidadePrefixo = item.prefixo.toLowerCase().includes(search.toLowerCase())

      // Verifica se algum dos cursos corresponde à busca
      const inCursos = item.cursos.some(curso => curso.nome.toLowerCase().includes(search.toLowerCase()))

      // Retorna true se qualquer uma das condições acima for verdadeira
      return inUnidadeNome || inUnidadePrefixo || inCursos
    }
  }
}
</script>

<style>
</style>
