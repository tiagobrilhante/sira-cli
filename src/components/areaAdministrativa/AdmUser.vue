<template>
  <v-main class="bgConfig">

    <BarraNavegacao/>

    <!--banner e datatable-->
    <v-container
      v-if="usuarioEstaLogado"
      class="pt-5"
      fluid>

      <!--Banner + btn add user-->
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
                mdi-account
              </v-icon>
              Gerenciamento de Administradores
            </h2>

          </v-col>
          <!-- add user-->
          <v-col
            class="text-right"
            cols="3">
            <v-btn
              class="white--text"
              color="rgb(250, 115, 59)"
              rounded
              @click="openDialogAddEditUser('add')">
              <v-icon
                class="mr-4"
                color="white">mdi-plus-circle
              </v-icon>
              Adicionar Novo Administrador
            </v-btn>
          </v-col>
        </v-row>

      </v-alert>

      <!--DataTable-->
      <v-data-table
        :headers="headers"
        :items="usuarios"
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
            <v-toolbar-title>Tabela de Administradores Cadastrados</v-toolbar-title>

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

          <!-- seletores de usuário-->
          <v-container fluid>
            <v-row>
              <v-col>
                <v-row>
                  <v-col>
                    <v-btn
                      :color="ajustaCorSelected('Todos')"
                      class="white--text mr-4 mt-3"
                      rounded
                      @click="buscaPorUnidade('Todos')">
                      Todos
                    </v-btn>
                    <v-btn
                      v-for="unidade in unidades"
                      :key="unidade.id"
                      :color="ajustaCorSelected(unidade.id)"
                      class="white--text mr-4 mt-3"
                      rounded
                      @click="buscaPorUnidade(unidade.id)">
                      {{ unidade.nome }}
                    </v-btn>

                  </v-col>
                </v-row>
              </v-col>

            </v-row>
          </v-container>

        </template>

        <!--Template de cursos -->
        <template v-slot:item.cursos="{ item }">
          <span v-if="item.cursos.length === 0"> - </span>
          <span v-else><v-icon @click="openDialogVerCursoUser(item)">mdi-magnify</v-icon></span>
        </template>

        <!--Template de reset -->
        <template v-slot:item.reset="{ item }">

          <v-chip
            v-if="item.reset === 1"
            class="ma-2"
            color="red"
            text-color="white"
          >
            Resetado
          </v-chip>
          <v-chip
            v-else
            class="ma-2"
            color="green"
            text-color="white"
          >
            OK
          </v-chip>

        </template>

        <!--Template de botões para editar, excluir -->
        <template v-slot:item.actions="{ item }">

          <!--Resetar-->
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                class="mr-2"
                small
                @click="openDialogReset(item)"
                v-on="on"
              >
                mdi-lock-reset
              </v-icon>
            </template>
            <span>Resetar Administrador</span>
          </v-tooltip>

          <!--editar-->
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                class="mr-2"
                small
                @click="openDialogAddEditUser('edit', item)"
                v-on="on"
              >
                mdi-pen
              </v-icon>
            </template>
            <span>Editar Administrador</span>
          </v-tooltip>

          <!--Excluir-->
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                class="mr-2"
                small
                @click="deleteUser(item)"
                v-on="on"
              >
                mdi-delete
              </v-icon>
            </template>
            <span>Excluir Admninistrador</span>
          </v-tooltip>

        </template>

      </v-data-table>

      <!--Dialog para add/edit usuário-->
      <v-dialog
        v-model="dialogAddEditUser"
        persistent
        max-width="70%">
        <v-card>
          <v-form @submit.prevent="efetuarCadastroEditUsuario">

            <v-card-title
              class="justify-center"
              primary-title>
              <span v-if="tipoAcao === 'add'">Adicionar novo Administrador</span><span
                v-else>Edição de Administrador</span>
            </v-card-title>

            <v-card-text>

              <!-- nome completo / matricula -->
              <v-row dense>

                <!--nome completo-->
                <v-col>
                  <span class="pl-3">Nome Completo (Obrigatório)</span>
                  <v-text-field
                    v-model="editedUser.nome"
                    class="ml-3"
                    dense
                    label="Nome Completo"
                    rounded
                    solo
                  />
                </v-col>

                <!-- matricula -->
                <v-col>
                  <span class="pl-3">Matricula (Obrigatório)</span>
                  <v-text-field
                    v-model="editedUser.matricula"
                    class="ml-3"
                    dense
                    label="Matricula"
                    rounded
                    solo
                  />
                </v-col>

              </v-row>

              <!-- email / Tel -->
              <v-row dense>

                <!--email-->
                <v-col>
                  <span class="pl-3">Email (Obrigatório)</span>
                  <v-text-field
                    v-model="editedUser.email"
                    class="ml-3"
                    dense
                    label="Email"
                    rounded
                    solo
                  />
                </v-col>

                <!-- telefone -->
                <v-col>
                  <span class="pl-3">Telefone (Obrigatório)</span>
                  <v-text-field
                    v-mask-phone.br
                    v-model="editedUser.telefone"
                    class="ml-3"
                    dense
                    label="Telefone de Contato"
                    rounded
                    solo
                  />
                </v-col>

              </v-row>

              <!-- tipo-->
              <v-row dense>

                <!-- tipo -->
                <v-col>
                  <span class="pl-3">Tipo (Obrigatório)</span>
                  <v-select
                    v-model="editedUser.tipo"
                    :items="tiposUsuario"
                    class="ml-3"
                    clearable
                    dense
                    label="Selecione o Tipo de Administrador"
                    name="tipo"
                    rounded
                    solo
                  />

                </v-col>

              </v-row>

              <!-- info sobre coordenadores e seletor de cursos-->
              <v-alert
                v-if="editedUser.tipo === 'Administrador'"
                class="white--text"
                color="#015088"
                elevation="5"
                rounded="xxl">
                <h3>Vincular Cursos</h3>
                <br>

                <!-- info sobre admin istradores-->
                <v-alert
                  dismissible
                  elevation="5"
                  rounded="xxl">
                  No SIRA, os administradores exercem o papel de coordenadores de curso, podendo possuir
                  responsabilidades inclusive com mais de um curso.<br>
                  Ex: A coordenadoria de cursos da área de TI, se responsabiliza por:
                  <ul>
                    <li>Ciência da Computação</li>
                    <li>Engenharia da Computação</li>
                    <li>Análise e Desenvolvimento de Sistemas</li>
                    <li>Sistemas de Informação</li>
                    <li>Redes de computadores</li>
                  </ul>
                  Selecione abaixo, os cursos que esse administrador coordena.<br>
                  Isso garante que todas as solicitações de atendimento feitas no escopo dos cursos, serão devidamente
                  endereçadas a esse usuário.
                </v-alert>

                <!-- seletor de cursos-->
                <v-alert
                  v-if="editedUser.tipo === 'Administrador'"
                  elevation="5"
                  rounded="xxl">
                  <v-row>
                    <v-col>
                      <span class="pl-3">Cursos (Obrigatório)</span>

                      <template>
                        <v-select
                          ref="cursoSelect"
                          v-model="editedUser.cursos"
                          :items="transformedCursosOptions"
                          :menu-props="menuProps"
                          open-on-clear
                          chips
                          clearable
                          deletable-chips
                          dense
                          return-object
                          item-text="displayName"
                          item-value="id"
                          label="Selecione os cursos nos quais você está matriculado"
                          multiple
                          name="cursos"
                          rounded
                          solo
                        >
                          <template v-slot:append-item>
                            <v-divider class="mb-2"/>
                            <v-list-item>
                              <v-btn
                                color="primary"
                                block
                                @click.stop="concluirSelecao"
                              >
                                Concluir Seleção
                              </v-btn>
                            </v-list-item>
                          </template>
                        </v-select>
                      </template>

                    </v-col>
                  </v-row>
                </v-alert>

              </v-alert>

              <!-- info sobre administradores gerais-->
              <v-alert
                v-if="editedUser.tipo === 'Administrador Geral'"
                class="white--text"
                color="#015088"
                dismissible
                rounded="xxl">
                Administradores Gerais podem manipular informações de qualque curso, além de terem permissões de
                cadastrar outros Administradores Gerais e Administradores.
              </v-alert>

            </v-card-text>

            <!-- actions -->
            <v-card-actions class="pb-5">

              <v-row>
                <v-col class="text-right mr-4">
                  <v-btn
                    rounded
                    class="white--text"
                    color="rgb(250, 115, 59)"
                    @click="dialogAddEditUser = false">Cancelar
                  </v-btn>
                  <span class="pl-5 pr-5"/>
                  <v-btn
                    rounded
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

      <!--Dialog para deletar usuário-->
      <v-dialog
        v-model="dialogDelete"
        max-width="800px">
        <v-card>
          <v-card-title
            class="justify-center"
            primary-title>
            <v-icon
              class="mr-4">
              fa fa-exclamation-triangle
            </v-icon>
            Você tem certeza que quer deletar o Administrador {{ editedUser.nome }}?
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
              class="white--text"
              rounded
              color="rgb(250, 115, 59)"
              @click="closeDelete">Cancelar
            </v-btn>
            <span class="pl-5 pr-5"/>
            <v-btn
              class="white--text"
              rounded
              color="#015088"
              @click="deleteUserConfirm">Excluir
            </v-btn>
            <v-spacer/>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!--Dialog para resetar usuário - TEM QUE ARRUMAR-->
      <v-dialog
        v-model="dialogReset"
        max-width="60%">
        <v-card>

          <!-- title-->
          <v-card-title
            class="justify-center"
            primary-title>
            <v-icon
              class="mr-4">
              fa fa-exclamation-triangle
            </v-icon>
            Você tem certeza que quer resetar a senha do Administrador {{ editedUser.nome }}?
            <v-icon
              class="ml-4">
              fa fa-exclamation-triangle
            </v-icon>

          </v-card-title>

          <v-card-text>

            <v-row>
              <v-col class="text-center">
                <p>A nova senha (temporária), será a matricula do Administrador.</p>
              </v-col>

            </v-row>
          </v-card-text>

          <!-- actions-->
          <v-card-actions class="pb-5">
            <v-spacer/>
            <v-btn
              rounded
              color="grey lighten-1"
              @click="dialogReset = false">Cancelar
            </v-btn>
            <span class="pl-5 pr-5"/>
            <v-btn
              rounded
              color="red lighten-1"
              @click="resetUserConfirm">Resetar
            </v-btn>
            <v-spacer/>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!--Dialog para ver cursos de um usuário usuário-->
      <v-dialog
        v-model="dialogVerCursos"
        max-width="800px">
        <v-card>
          <v-card-title
            class="justify-center"
            primary-title>
            Cursos vinculados ao usuário {{ editedUser.nome }}
          </v-card-title>
          <v-card-text>

            <ul>
              <li
                v-for="curso in editedUser.cursos"
                :key="curso.id"> {{ curso.nome }} - {{ curso.unidade.nome }}
              </li>
            </ul>
          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer/>
            <v-btn
              rounded
              class="white--text"
              color="#015088"
              @click="dialogVerCursos = false">Fechar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>

    <!-- sem permissão de acessop-->
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
    usuarios: [],
    // fim options select
    search: '',
    headers: [
      {
        text: 'Nome',
        align: 'start',
        value: 'nome'
      },
      {
        text: 'Matrícula',
        align: 'start',
        value: 'matricula'
      },
      {
        text: 'Email',
        align: 'start',
        value: 'email'
      },
      {
        text: 'Tipo',
        align: 'start',
        value: 'tipo'
      },
      {
        text: 'Cursos',
        align: 'center',
        value: 'cursos'
      },
      {
        text: 'Status',
        align: 'center',
        value: 'reset'
      },
      {
        text: 'Actions',
        value: 'actions',
        align: 'center',
        sortable: false
      }
    ],
    defaultUser: {
      'nome': '',
      'matricula': '',
      'telefone': '',
      'email': '',
      'tipo': '',
      'cursos': [],
      'reset': false
    },
    editedUser: {
      'nome': '',
      'matricula': '',
      'telefone': '',
      'email': '',
      'tipo': '',
      'cursos': [],
      'reset': false
    },
    tipoAcao: '',
    tiposUsuario: ['Administrador Geral', 'Administrador'],
    dialogDelete: false,
    dialogReset: false,
    dialogAddEditUser: false,
    editedIndex: -1,
    cursosOptions: [],
    tipoUserSelected: ['Administrador', 'Administrador Geral'],
    unidades: [],
    dialogVerCursos: false,
    selectedTipo: 'Todos',
    menuProps: {
      closeOnContentClick: false,
      closeOnClick: false
    }
  }),
  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado']),

    transformedCursosOptions () {
      return this.cursosOptions.map(curso => ({
        ...curso,
        displayName: `${curso.nome} - UNIDADE: ${curso.unidade.nome}`
      }))
    }
  },
  async mounted () {
    await this.getUsers(this.selectedTipo)
    await this.getUnidades()
    await this.getCursos()
  },
  methods: {

    async getUsers () {
      try {
        this.$http.get('users/adm/' + this.selectedTipo)
          .then(response => {
            this.usuarios = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    async getUnidades () {
      try {
        this.$http.get('unidades/listasimples')
          .then(response => {
            this.unidades = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    async getCursos () {
      try {
        this.$http.get('curso')
          .then(response => {
            this.cursosOptions = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    openDialogAddEditUser (tipo, item) {
      this.tipoAcao = tipo
      if (tipo === 'add') {
        this.editedUser = Object.assign({}, this.defaultUser)
      } else {
        this.editedUser = Object.assign({}, item)
        this.editedIndex = this.usuarios.indexOf(item)
        let ajuste = []
        this.editedUser.cursos.forEach(curso => {
          ajuste.push(curso.curso)
        })
        this.editedUser.cursos = ajuste
      }
      this.dialogAddEditUser = true
    },

    efetuarCadastroEditUsuario () {
      let arrayVal = this.validadoresCampos()
      if (arrayVal[0] > 0) {
        this.$toastr.e(
          arrayVal[1], 'Erro!'
        )
      } else {
        let objetoParaEnvio = {}
        objetoParaEnvio['nome'] = this.editedUser.nome
        objetoParaEnvio['matricula'] = this.editedUser.matricula
        objetoParaEnvio['telefone'] = this.editedUser.telefone
        objetoParaEnvio['email'] = this.editedUser.email
        objetoParaEnvio['tipo'] = this.editedUser.tipo
        objetoParaEnvio['cursos'] = this.editedUser.cursos

        if (this.tipoAcao === 'add') {
          // aqui eu vou adicionar o usuario
          try {
            this.$http.post('users', objetoParaEnvio)
              .then(response => {
                this.usuarios.push(response.data)
                this.dialogAddEditUser = false
                this.$toastr.s(
                  'Administrador Cadastrado com sucesso', 'Sucesso!'
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
            this.$http.put('users/' + this.editedUser.id, objetoParaEnvio)
              .then(response => {
                Object.assign(this.usuarios[this.editedIndex], response.data)
                this.$toastr.s(
                  'Administrador alterado com sucesso', 'Sucesso!'
                )
                this.dialogAddEditUser = false
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

    deleteUser (item) {
      this.editedIndex = this.usuarios.indexOf(item)
      this.editedUser = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteUserConfirm () {
      this.$http.delete('users/' + this.editedUser.id)
        // eslint-disable-next-line no-return-assign
        .then(() => {
          this.usuarios.splice(this.editedIndex, 1)
          this.closeDelete()
          this.$toastr.s(
            'Administrador removido com sucesso', 'Sucesso!'
          )
        }, err => {
          console.log(err)
          this.$toastr.e(
            'Não foi possível remover o Administrador', 'Erro!'
          )
        })
    },

    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedUser = {}
        this.editedIndex = -1
      })
    },

    openDialogReset (item) {
      this.editedIndex = this.usuarios.indexOf(item)

      this.editedUser = Object.assign({}, item)
      let ajuste = []
      this.editedUser.cursos.forEach(curso => {
        ajuste.push(curso.curso)
      })
      this.editedUser.cursos = ajuste

      this.dialogReset = true
    },

    resetUserConfirm () {
      let objetoParaEnvio = {}
      objetoParaEnvio['id'] = this.editedUser.id
      try {
        this.$http.post('users/reset', objetoParaEnvio)
          .then(response => {
            Object.assign(this.usuarios[this.editedIndex], response.data)
            this.dialogReset = false
            this.$toastr.s(
              'Senha do Administrador resetada com sucesso', 'Sucesso!'
            )
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        this.$toastr.e(
          'Houve um erro na tentativa de execução: <br>' + e, 'Erro!'
        )
      }
    },

    validadoresCampos () {
      let msgRetornoErro = ''
      let contador = 0

      if (this.editedUser.nome === '') {
        msgRetornoErro += '<li>O Nome não pode ser vazio.</li>'
        contador++
      }
      if (this.editedUser.matricula === '') {
        msgRetornoErro += '<li>O Campo Matrícula não pode ser vazio.</li>'
        contador++
      }
      if (this.editedUser.email === '') {
        msgRetornoErro += '<li>O campo Email deve ser preenchido.</li>'
        contador++
      }
      if (this.editedUser.telefone === '') {
        msgRetornoErro += '<li>O campo Telefone de Contato deve ser preenchido.</li>'
        contador++
      }
      if (this.editedUser.tipo === '') {
        msgRetornoErro += '<li>Selecione um tipo de Administrador.</li>'
        contador++
      }
      msgRetornoErro = '<ul>' + msgRetornoErro + '</ul>'
      return [contador, msgRetornoErro]
    },

    openDialogVerCursoUser (item) {
      this.editedUser = Object.assign({}, item)
      let ajuste = []
      this.editedUser.cursos.forEach(curso => {
        ajuste.push(curso.curso)
      })
      this.editedUser.cursos = ajuste
      this.dialogVerCursos = true
    },

    buscaPorUnidade (id) {
      this.selectedTipo = id
      this.getUsers()
    },

    ajustaCorSelected (qual) {
      if (qual === this.selectedTipo) {
        return '#015088'
      } else {
        return 'rgb(250, 115, 59)'
      }
    },

    concluirSelecao () {
      // Fecha o menu do v-select
      if (this.$refs.cursoSelect) {
        this.$refs.cursoSelect.isMenuActive = false
        this.$refs.cursoSelect.isFocused = false
      }
    }
  }
}
</script>

<style>
</style>
