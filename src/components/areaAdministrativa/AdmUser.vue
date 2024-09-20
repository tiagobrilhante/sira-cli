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
                mdi-account
              </v-icon>
              Gerenciamento de Usuários
            </h2>

          </v-col>
          <v-col class="text-right" cols="3">
            <v-btn class="primary" @click="openDialogAddEditUser('add')">Adicionar Novo</v-btn>
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
            <v-toolbar-title>Tabela de Usuários Cadastrados</v-toolbar-title>

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

        <!--Template de reset -->
        <template v-slot:item.reset="{ item }">

          <v-chip v-if="item.reset === 1"
                  class="ma-2"
                  color="red"
                  text-color="white"
          >
            Resetado
          </v-chip>
          <v-chip v-else
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
                class="mr-2"
                small
                v-bind="attrs"
                @click="openDialogReset(item)"
                v-on="on"
              >
                mdi-lock-reset
              </v-icon>
            </template>
            <span>Resetar Usuário</span>
          </v-tooltip>

          <!--editar-->
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="mr-2"
                small
                v-bind="attrs"
                @click="openDialogAddEditUser('edit', item)"
                v-on="on"
              >
                mdi-pen
              </v-icon>
            </template>
            <span>Editar Usuário</span>
          </v-tooltip>

          <!--Excluir-->
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="mr-2"
                small
                v-bind="attrs"
                @click="deleteUser(item)"
                v-on="on"
              >
                mdi-delete
              </v-icon>
            </template>
            <span>Excluir Usuário</span>
          </v-tooltip>

        </template>

      </v-data-table>

      <!--Dialog para add/edit usuário-->
      <v-dialog v-model="dialogAddEditUser" max-width="70%">
        <v-card>
          <v-form @submit.prevent="efetuarCadastroEditUsuario">

            <v-card-title class="justify-center" primary-title>
              <span v-if="tipoAcao === 'add'">Adicionar novo usuário</span><span v-else>Edição de Usuário</span>
            </v-card-title>

            <v-card-text>

              <!-- nome completo / nome de guerra -->
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
                  ></v-text-field>
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
                  ></v-text-field>
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
                    label="Selecione o Tipo de Usuário"
                    name="tipo"
                    rounded
                    solo
                  ></v-select>

                </v-col>

              </v-row>

            </v-card-text>
            <v-card-actions class="pb-5">

              <v-row>
                <v-col class="text-right mr-4">
                  <v-btn color="warning lighten-1" @click="dialogAddEditUser = false">Cancelar</v-btn>
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

      <!--Dialog para deletar usuário-->
      <v-dialog v-model="dialogDelete" max-width="800px">
        <v-card>
          <v-card-title class="justify-center" primary-title>
            <v-icon
              class="mr-4">
              fa fa-exclamation-triangle
            </v-icon>
            Você tem certeza que quer deletar o usuário {{ editedUser.nome }}?
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
            <v-btn color="red lighten-1" @click="deleteUserConfirm">Excluir</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!--Dialog para resetar usuário-->
      <v-dialog v-model="dialogReset" max-width="800px">
        <v-card>
          <v-card-title class="justify-center" primary-title>
            <v-icon
              class="mr-4">
              fa fa-exclamation-triangle
            </v-icon>
            Você tem certeza que quer resetar a senha do usuário {{ editedUser.nome }}?
            <v-icon
              class="ml-4">
              fa fa-exclamation-triangle
            </v-icon>

          </v-card-title>
          <v-card-text>
            <div class="text-center">
              <p>A nova senha (temporária), será o CPF do usuário, sem "." e "-".</p>
              <p>Por exemplo: Se o CPF do usuário for 123.456.789-10, a senha temporária será 12345678910.</p>
            </div>
          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer></v-spacer>
            <v-btn color="grey lighten-1" @click="dialogReset = false">Cancelar</v-btn>
            <span class="pl-5 pr-5"></span>
            <v-btn color="red lighten-1" @click="resetUserConfirm">Resetar</v-btn>
            <v-spacer></v-spacer>
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
      'reset': false
    },
    editedUser: {
      'nome': '',
      'matricula': '',
      'telefone': '',
      'email': '',
      'tipo': '',
      'reset': false
    },
    tipoAcao: '',
    tiposUsuario: ['Administrador Geral', 'Administrador'],
    dialogDelete: false,
    dialogReset: false,
    dialogAddEditUser: false,
    editedIndex: -1,
    cpfMessage: ''
  }),
  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado'])
  },
  async mounted () {
    await this.getUsers()
  },
  methods: {

    async getUsers () {
      try {
        this.$http.get('users')
          .then(response => {
            this.usuarios = response.data
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
      }
      this.dialogAddEditUser = true
    },

    openDialogReset (item) {
      this.editedUser = Object.assign({}, item)
      this.editedIndex = this.usuarios.indexOf(item)
      this.dialogReset = true
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

        if (this.tipoAcao === 'add') {
          // aqui eu vou adicionar o usuario
          try {
            this.$http.post('users', objetoParaEnvio)
              .then(response => {
                this.usuarios.push(response.data)
                this.dialogAddEditUser = false
                this.$toastr.s(
                  'Usuário Cadastrado com sucesso', 'Sucesso!'
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
                  'Usuário alterado com sucesso', 'Sucesso!'
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
            'Usuário removido com sucesso', 'Sucesso!'
          )
        }, err => {
          console.log(err)
          this.$toastr.e(
            'Não foi possível remover o Usuário', 'Erro!'
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
      if (this.editedUser.tipo === '') {
        msgRetornoErro += '<li>Selecione um tipo de usuário.</li>'
        contador++
      }
      msgRetornoErro = '<ul>' + msgRetornoErro + '</ul>'
      return [contador, msgRetornoErro]
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
              'Senha do Usuário resetada com sucesso', 'Sucesso!'
            )
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        this.$toastr.e(
          'Houve um erro na tentativa de execução: <br>' + e, 'Erro!'
        )
      }
    }
  }
}
</script>

<style>
</style>
