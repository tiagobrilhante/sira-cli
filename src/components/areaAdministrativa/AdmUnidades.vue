<template>
  <v-main class="bgConfig">

    <BarraNavegacao/>

    <!--banner e datatable + diallogs diversos-->
    <v-container
      v-if="usuarioEstaLogado"
      class="pt-5"
      fluid>

      <!--Banner e btn add unidade-->
      <v-alert
        class="p-5"
        color="#015088"
        elevation="21"
      >

        <!-- banner e btn add-->
        <v-row>

          <!-- banner-->
          <v-col
            class="white--text"
            cols="9">
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

          <!-- add unidade-->
          <v-col
            class="text-right"
            cols="3">
            <v-btn
              class="white--text"
              color="rgb(250, 115, 59)"
              rounded
              @click="openDialogAddEditUnidade('add')">
              <v-icon
                class="mr-4"
                color="white">mdi-plus-circle</v-icon>
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
            />

            <v-spacer/>

            <!--Pesquisar-->
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              hide-details
              label="Pesquisar"
              placeholder="Pesquisar"
              single-line
            />

          </v-toolbar>

        </template>

        <!--Template de cursos -->
        <template v-slot:item.cursos="{ item }">

          <ul v-if="item.cursos.length > 0">
            <li
              v-for="curso in item.cursos"
              :key="curso.id">
              <v-tooltip
                v-if="curso.semestre_codigo !== null && curso.semestre_codigo === emVigencia()"
                top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    class="mr-2"
                    color="green"
                    small
                    v-on="on"
                  >
                    mdi-check
                  </v-icon>
                </template>
                <span>Em Vigência</span>
              </v-tooltip>

              <v-tooltip
                v-else
                top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    class="mr-2"
                    color="red"
                    small
                    v-on="on"
                  >
                    mdi-alert
                  </v-icon>
                </template>
                <span>Fora de vigência</span>
              </v-tooltip>

              {{ curso.nome }}
              <v-icon
                class="ml-4"
                small
                @click="openDialogDetalhes(curso)">mdi-magnify</v-icon>

            </li>
          </ul>
          <v-chip
            v-else
            color="yellow"
            small> Sem Cursos Cadastrados</v-chip>

        </template>

        <!--Template de botões para editar, excluir -->
        <template v-slot:item.actions="{ item }">

          <!--editar-->
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                class="mr-2"
                small
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
                v-bind="attrs"
                class="mr-2"
                small
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
      <v-dialog
        v-model="dialogAddEditUnidade"
        max-width="70%"
        persistent>
        <v-card>
          <v-form @submit.prevent="efetuarCadastroEditUnidade">

            <v-card-title
              class="justify-center"
              primary-title>
              <span v-if="tipoAcao === 'add'">Adicionar nova Unidade</span><span v-else>Edição de Unidade</span>
            </v-card-title>

            <v-card-text>

              <!-- nome  / nome prefixo -->
              <v-row dense>

                <!--nome -->
                <v-col>
                  <span class="pl-3">Nome da Unidade (Obrigatório)</span>
                  <v-text-field
                    v-model="editedUnidade.nome"
                    dense
                    label="Nome da Unidade"
                    rounded
                    solo
                  />
                </v-col>

                <!-- Prefixo -->
                <v-col>
                  <span class="pl-3">Prefixo (Obrigatório)</span>
                  <v-text-field
                    v-model="editedUnidade.prefixo"
                    class="ml-3"
                    dense
                    label="Prefixo"
                    rounded
                    solo
                  />
                </v-col>

              </v-row>

              <!-- cursos-->
              <v-row
                class="pt-0 mt-0"
                dense>
                <v-col>
                  <v-alert
                    color="#015088"
                    rounded="xxl">
                    <v-row>
                      <v-col>
                        <h3 class="white--text">Cursos</h3>
                      </v-col>
                      <v-col class="text-right">
                        <v-btn
                          class="white--text"
                          color="rgb(250, 115, 59)"
                          rounded
                          small
                          @click="addCursoToAdd">
                          <v-icon
                            class="mr-4"
                            color="white"
                            small>mdi-plus-circle</v-icon>
                          Adicionar Curso
                        </v-btn>
                      </v-col>
                    </v-row>

                    <v-spacer
                      v-if="editedUnidade.cursos.length >0"
                      class="mt-4"/>

                    <v-alert
                      v-for="(curso, index) in editedUnidade.cursos"
                      :key="index"
                      rounded="xxl">
                      <!-- nome  / codigo / delete -->
                      <v-row dense>

                        <!--nome -->
                        <v-col>
                          <span class="pl-3">Nome do curso (Obrigatório)</span>
                          <v-text-field
                            v-model="curso.nome"
                            dense
                            hint="Ex: Ciência da Computação"
                            label="Nome do curso"
                            rounded
                            solo
                          />
                        </v-col>

                        <!-- código -->
                        <v-col>
                          <span class="pl-3">Código (Obrigatório)</span>
                          <v-text-field
                            v-model="curso.codigo"
                            class="ml-3"
                            dense
                            hint="Geralmente 3 números (ex: 079 no caso de ciência da Computação)"
                            label="Código"
                            rounded
                            solo
                          />
                        </v-col>

                        <!-- delete-->
                        <v-col cols="1">
                          <v-btn
                            block
                            class="mt-6"
                            color="rgb(250, 115, 59)"
                            rounded
                            @click="removeLinha(index)">
                            <v-icon color="white">mdi-delete</v-icon>
                          </v-btn>
                        </v-col>

                      </v-row>

                      <!-- qtd periodos -->
                      <v-row>
                        <v-col>
                          <v-slider
                            v-model="curso.qtd_periodos_possiveis"
                            class="align-center"
                            dense
                            hint="Máximo número de períodos do curso. (Ex: Ciência da computação possui 8 períodos)"
                            label="Quantidade de períodos possíveis"
                            max="15"
                            min="1"
                            persistent-hint
                            rounded
                            solo
                            thumb-color="#015088"
                            thumb-label="always"
                          >
                            <template v-slot:append>
                              <v-text-field
                                v-model="curso.qtd_periodos_possiveis"
                                class="mt-0 pt-0"
                                hide-details
                                single-line
                                style="width: 60px"
                                type="number"
                              />
                            </template>
                          </v-slider>
                        </v-col>
                      </v-row>
                    </v-alert>

                  </v-alert>
                </v-col>
              </v-row>

            </v-card-text>

            <!--acões (cancelar e persistir)-->
            <v-card-actions class="pb-5">

              <v-row>
                <v-col class="text-right mr-4">

                  <!-- cancelar-->
                  <v-btn
                    class="white--text"
                    color="rgb(250, 115, 59)"
                    @click="closeDialogAddEditUnidade">Fechar
                  </v-btn>
                  <span class="pl-5 pr-5"/>

                  <!--persistir-->
                  <v-btn
                    class="white--text"
                    color="#015088"
                    type="submit">
                    <span v-if="tipoAcao === 'add'">Cadastrar</span><span v-else>Alterar</span>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-actions>

          </v-form>
        </v-card>

      </v-dialog>

      <!--Dialog para deletar Unidade-->
      <v-dialog
        v-model="dialogDelete"
        max-width="800px"
        persistent>
        <v-card>
          <v-card-title
            class="justify-center"
            primary-title>
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
            <v-spacer/>
            <v-btn
              color="grey lighten-1"
              @click="closeDelete">Cancelar</v-btn>
            <span class="pl-5 pr-5"/>
            <v-btn
              color="red lighten-1"
              @click="deleteUnidadeConfirm">Excluir</v-btn>
            <v-spacer/>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!--Dialog para deletar Curso (já cadastrado)-->
      <v-dialog
        v-model="dialogDeleteCursoCadastrado"
        max-width="800px"
        persistent>
        <v-card>
          <v-card-title
            class="justify-center"
            primary-title>
            <v-icon
              class="mr-4">
              fa fa-exclamation-triangle
            </v-icon>
            Você tem certeza que quer deletar esse curso {{ selectedCurso.nome }}?
            <v-icon
              class="ml-4">
              fa fa-exclamation-triangle
            </v-icon>

          </v-card-title>
          <v-card-text>
            <div class="text-center">Essa ação é irreversível. Tenha certeza do que está fazendo.</div>
          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer/>
            <v-btn
              color="grey lighten-1"
              @click="dialogDeleteCursoCadastrado = false">Cancelar</v-btn>
            <span class="pl-5 pr-5"/>
            <v-btn
              color="red lighten-1"
              @click="deleteCursoCadastradoConfirm">Excluir</v-btn>
            <v-spacer/>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!--Dialog para detalhes de cursos-->
      <v-dialog
        v-model="dialogDetalheCurso"
        max-width="800px">
        <v-card>
          <v-card-title
            class="justify-center"
            primary-title>
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
                <v-alert
                  v-else
                  color="red lighten-3">
                  Esse curso não possui registro de atividade previsto para o semestre letivo: {{ emVigencia() }}<br>
                  Você pode resolver isso, habilitando o semestre letivo no menu de controle de semestres.
                </v-alert>
              </v-col>

            </v-row>

          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer/>
            <v-btn
              class="white--text"
              color="rgb(250, 115, 59)"
              @click="dialogDetalheCurso = false"> Fechar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>

    <!-- sem permissão de acesso-->
    <v-container
      v-else
      class="pt-5"
      fluid>
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
  components: {BarraNavegacao},
  mixins: [logoutMixin],
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
      nome: '',
      prefixo: '',
      cursos: []
    },
    editedUnidade: {
      nome: '',
      prefixo: '',
      cursos: []
    },
    dialogDelete: false,
    dialogReset: false,
    dialogAddEditUnidade: false,
    editedIndex: -1,
    tipoAcao: '',
    dialogDetalheCurso: false,
    objetoCursoSelecionado: {},
    indexTempCurso: -1,
    // para exclusão de curso já cadastrado
    selectedCurso: {},
    dialogDeleteCursoCadastrado: false
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
        objetoParaEnvio['cursos'] = this.editedUnidade.cursos

        if (this.tipoAcao === 'add') {
          // aqui eu vou adicionar a unidade
          try {
            this.$http.post('unidades', objetoParaEnvio)
              .then(() => {
                this.getUnidades()
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
          objetoParaEnvio['id'] = this.editedUnidade.id
          try {
            this.$http.put('unidades/' + this.editedUnidade.id, objetoParaEnvio)
              .then(response => {
                this.getUnidades()
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
        this.editedUnidade = Object.assign({}, this.defaultUnidade)
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
    },

    addCursoToAdd () {
      this.editedUnidade.cursos.push({
        nome: '',
        codigo: '',
        qtd_periodos_possiveis: 1
      })
    },

    closeDialogAddEditUnidade () {
      this.dialogAddEditUnidade = false
      if (this.tipoAcao === 'edit') {
        for (let i = 0; i < this.editedUnidade.cursos.length; i++) {
          if (this.editedUnidade.cursos[i].nome === '' || this.editedUnidade.cursos[i].codigo === '') {
            this.editedUnidade.cursos.splice(i, 1)
          }
        }
      }
      this.$nextTick(() => {
        this.editedUnidade = Object.assign({}, this.defaultUnidade)
        this.editedIndex = -1
      })
    },

    removeLinha (index) {
      if (this.tipoAcao === 'add') {
        this.editedUnidade.cursos.splice(index, 1)
      } else {
        this.selectedCurso = this.editedUnidade.cursos[index]
        if ('id' in this.selectedCurso) {
          this.dialogDeleteCursoCadastrado = true
        } else {
          // O objeto selectedCurso não tem o atributo id
          this.editedUnidade.cursos.splice(index, 1)
        }
      }
    },

    deleteCursoCadastradoConfirm () {
      this.$http.delete('curso/' + this.selectedCurso.id)
        // eslint-disable-next-line no-return-assign
        .then(() => {
          for (let i = 0; i < this.editedUnidade.cursos.length; i++) {
            if (this.editedUnidade.cursos[i].id === this.selectedCurso.id) {
              this.editedUnidade.cursos.splice(i, 1)
            }
          }
          this.dialogDeleteCursoCadastrado = false
          this.$toastr.s(
            'Curso removido com sucesso', 'Sucesso!'
          )
        }, err => {
          console.log(err)
          this.$toastr.e(
            'Não foi possível remover o Curso', 'Erro!'
          )
        })
    }
  }
}
</script>

<style>
</style>
