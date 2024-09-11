<template>
  <v-main class="bgConfig">

    <BarraNavegacao></BarraNavegacao>

    <!--banner e datatable-->
    <v-container v-if="usuarioEstaLogado" class="pt-5" fluid>

      <!--Banner-->
      <v-alert
        class="p-5"
        elevation="21"
      >
        <v-row>
          <v-col cols="9">
            <h2>
              <v-icon
                class="mr-4"
                size="36">
                fa fa-user
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

                <!-- nome_guerra -->
                <v-col>
                  <span class="pl-3">Nome Guerra (Obrigatório)</span>
                  <v-text-field
                    v-model="editedUser.nome_guerra"
                    class="ml-3"
                    dense
                    label="Nome de Guerra"
                    rounded
                    solo
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- cpf e postograd -->
              <v-row dense>

                <!-- cpf-->
                <v-col>
                  <span class="pl-3">CPF (Obrigatório)</span>
                  <v-text-field
                    v-model="editedUser.cpf"
                    v-mask-cpf
                    :hint="cpfMessage"
                    class="ml-3"
                    dense
                    label="CPF"
                    name="cpf"
                    persistent-hint
                    placeholder="Insira o CPF do usuário"
                    rounded
                    solo
                    @blur="checaErrosCPF"
                  ></v-text-field>
                </v-col>

                <!-- posto_grad-->
                <v-col>
                  <span class="pl-3">Posto/Grad (Obrigatório)</span>
                  <v-select
                    v-model="editedUser.posto_grad_id"
                    :items="posto_grad"
                    class="ml-3"
                    clearable
                    dense
                    item-text="pg"
                    item-value="id"
                    label="Selecione o Posto/Grad"
                    name="posto_grad"
                    rounded
                    solo
                  ></v-select>

                </v-col>

              </v-row>

              <!--secao e tipo-->
              <v-row dense>

                <!-- seção -->
                <v-col>
                  <span class="pl-3">Seção (Obrigatório)</span>
                  <v-autocomplete
                    v-model="editedUser.secao_id"
                    :items="secoes"
                    class="ml-3"
                    clearable
                    dense
                    item-text="sigla"
                    item-value="id"
                    label="Selecione a seção do usuário"
                    name="secao"
                    rounded
                    solo
                  ></v-autocomplete>
                </v-col>

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
            Você tem certeza que quer deletar o usuário {{ editedUser.email }}?
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
            Você tem certeza que quer resetar a senha do usuário {{ editedUser.posto_grad.pg }}
            {{ editedUser.nome_guerra }}?
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
import {cpf} from 'cpf-cnpj-validator'
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
    posto_grad: [],
    secoes: [],
    // fim options select
    search: '',
    headers: [
      {
        text: 'Nome',
        align: 'start',
        value: 'nome'
      },
      {
        text: 'Posto/Grad',
        align: 'start',
        value: 'posto_grad.pg'
      },
      {
        text: 'Nome de Guerra',
        align: 'start',
        value: 'nome_guerra'
      },
      {
        text: 'CPF',
        align: 'start',
        value: 'cpf'
      },
      {
        text: 'Tipo',
        align: 'start',
        value: 'tipo'
      },
      {
        text: 'Seçao',
        align: 'start',
        value: 'secao.sigla'
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
      'nome_guerra': '',
      'cpf': '',
      'tipo': '',
      'reset': false,
      'secao_id': '',
      'posto_grad_id': '',
      'posto_grad': {},
      'secao': {}
    },
    editedUser: {
      'nome': '',
      'nome_guerra': '',
      'cpf': '',
      'tipo': '',
      'reset': false,
      'secao_id': '',
      'posto_grad_id': '',
      'posto_grad': {},
      'secao': {}
    },
    tipoAcao: '',
    tiposUsuario: ['Administrador', 'Auditor', 'Usuário'],
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
    await this.getPostoGrad()
    await this.getSecao()
    // tenho que pegar as secoes
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

    async getPostoGrad () {
      try {
        this.$http.get('pg')
          .then(response => {
            this.posto_grad = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    async getSecao () {
      try {
        this.$http.get('secao')
          .then(response => {
            this.secoes = response.data
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
        objetoParaEnvio['nome_guerra'] = this.editedUser.nome_guerra
        objetoParaEnvio['tipo'] = this.editedUser.tipo
        objetoParaEnvio['secao_id'] = this.editedUser.secao_id
        objetoParaEnvio['posto_grad_id'] = this.editedUser.posto_grad_id
        objetoParaEnvio['cpf'] = this.editedUser.cpf

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

    checaErrosCPF () {
      if (this.editedUser.cpf === '') {
        this.cpfMessage = 'Preencha o CPF'
      } else if (!cpf.isValid(this.editedUser.cpf)) {
        this.cpfMessage = 'Esse CPF é Inválido'
      } else {
        let objetoParaEnvio = {}
        objetoParaEnvio['cpf'] = this.editedUser.cpf
        try {
          this.$http.post('users/checacpf/' + this.editedUser.id, objetoParaEnvio)
            .then(response => {
              this.cpfMessage = response.data
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

      if (this.editedUser.nome === '') {
        msgRetornoErro += '<li>O Nome não pode ser vazio.</li>'
        contador++
      }
      if (this.editedUser.nome_guerra === '') {
        msgRetornoErro += '<li>O Nome de Guerra não pode ser vazio.</li>'
        contador++
      }
      if (this.editedUser.posto_grad_id === '') {
        msgRetornoErro += '<li>Selecione um posto/grad.</li>'
        contador++
      }
      if (this.editedUser.secao_id === '') {
        msgRetornoErro += '<li>Selecione uma seção.</li>'
        contador++
      }
      if (this.editedUser.tipo === '') {
        msgRetornoErro += '<li>Selecione um tipo de usuário.</li>'
        contador++
      }
      if (this.editedUser.cpf === '') {
        msgRetornoErro += '<li>O CPF não pode ser vazio.</li>'
        contador++
      }
      if (!cpf.isValid(this.editedUser.cpf)) {
        msgRetornoErro += '<li>O CPF informado não é válido.</li>'
        contador++
      }
      if (this.cpfMessage === 'CPF já registrado por outro usuário.') {
        msgRetornoErro += '<li>CPF já registrado por outro usuário.</li>'
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
.bgConfig {
  background-color: #CFE0BC !important;
}
</style>
