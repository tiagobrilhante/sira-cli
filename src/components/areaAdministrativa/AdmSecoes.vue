<template>
  <v-main class="bgConfig">

    <!--Barra de navegação da área administrativa-->
    <BarraNavegacao></BarraNavegacao>

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
                mdi-sitemap
              </v-icon>
              Gerenciamento de Seções
            </h2>

          </v-col>
          <v-col class="text-right" cols="3">
            <v-btn class="primary" @click="openDialogAddEditSecao('add')">Adicionar Nova Seção</v-btn>
          </v-col>
        </v-row>

      </v-alert>

      <v-data-table
        :headers="headers"
        :items="secoes"
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
            <v-toolbar-title>Tabela de Seções Cadastradas</v-toolbar-title>

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

          <!--editar-->
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="mr-2"
                small
                v-bind="attrs"
                @click="openDialogAddEditSecao('edit', item)"
                v-on="on"
              >
                mdi-pen
              </v-icon>
            </template>
            <span>Editar Seção</span>
          </v-tooltip>

          <!--Excluir-->
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="mr-2"
                small
                v-bind="attrs"
                @click="deleteSecao(item)"
                v-on="on"
              >
                mdi-delete
              </v-icon>
            </template>
            <span>Excluir Seção</span>
          </v-tooltip>

        </template>

      </v-data-table>

      <!--Dialog para add/edit secao-->
      <v-dialog v-model="dialogAddEditSecao" max-width="70%">
        <v-card>
          <v-form @submit.prevent="efetuarCadastroEditSecao">

            <v-card-title class="justify-center" primary-title>
              <span v-if="tipoAcao === 'add'">Adicionar nova seção</span><span v-else>Edição de Seção</span>
            </v-card-title>

            <v-card-text>

              <!-- nome completo / nome de guerra -->
              <v-row dense>

                <!--nome completo da seção-->
                <v-col>
                  <span class="pl-3">Nome Completo (Obrigatório)</span>
                  <v-text-field
                    v-model="selectedSecao.nome"
                    class="ml-3"
                    dense
                    label="Nome Completo da Seção"
                    rounded
                    solo
                  ></v-text-field>
                </v-col>

                <!-- Sigla -->
                <v-col>
                  <span class="pl-3">Sigla (Obrigatório)</span>
                  <v-text-field
                    v-model="selectedSecao.sigla"
                    class="ml-3"
                    dense
                    label="Sigla"
                    rounded
                    solo
                  ></v-text-field>
                </v-col>

              </v-row>

              <v-row dense>
                <v-col>
                  <v-checkbox v-if="tipoAcao==='add'"
                              v-model="selectedSecao.soupai"
                              class="pt-3 ml-5"
                              hide-details
                              label="É seção pai"
                  ></v-checkbox>
                  <v-alert v-else class="mt-2" rounded="xxl" type="info">
                    Caso a seção seja pai, selecione ela mesma no campo Seção Pai
                  </v-alert>
                </v-col>
                <v-col v-if="!selectedSecao.soupai">
                  <span class="pl-3">Seção Pai (Obrigatório)</span>
                  <v-select
                    v-model="selectedSecao.secao_pai"
                    :items="secoes"
                    class="ml-3"
                    clearable
                    dense
                    item-text="sigla"
                    item-value="id"
                    label="Selecione a seção pai"
                    name="secao_pai"
                    rounded
                    solo
                  ></v-select>

                </v-col>

              </v-row>

            </v-card-text>
            <v-card-actions class="pb-5">

              <v-row>
                <v-col class="text-right mr-4">
                  <v-btn color="warning lighten-1" @click="dialogAddEditSecao = false">Cancelar</v-btn>
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

      <!--Dialog para deletar secao-->
      <v-dialog v-model="dialogDeleteSecao" max-width="800px">
        <v-card>
          <v-card-title class="justify-center" primary-title>
            <v-icon
              class="mr-4">
              fa fa-exclamation-triangle
            </v-icon>
            Você tem certeza que quer deletar essa Seção - {{ selectedSecao.sigla }}?
            <v-icon
              class="ml-4">
              fa fa-exclamation-triangle
            </v-icon>

          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col class="text-center">
                Essa ação é irreversível. Tenha certeza do que está fazendo.
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <b>Serão afetados {{ alertaProblema.users.length }} usuario(s)</b>
                <ul>
                  <li v-for="user in alertaProblema.users" :key="user.id">
                    {{ user.posto_grad.pg }} {{ user.nome_guerra }}
                  </li>
                </ul>

                <b>Serão apagadas {{ alertaProblema.filhos.length }} seções filhas (e todos os usuários , categorias,
                  indicadores e lançamentos associados a elas)</b><br>
                <b>Serão apagadas {{ alertaProblema.categorias }} categoria(s)</b><br>
                <b>Serão apagados {{ alertaProblema.indicadores }} indicador(es)</b><br>
                <b>Serão apagados {{ alertaProblema.indicadorValor }} registros de valores</b><br>
                <br>
                <v-alert type="warning">Tenha certeza sobre o que está fazendo. O impacto de apagar uma seção é muito
                  grande para o sistema.<br><br>

                  <h3>Será necessário inserir a sua senha para confirmar a exclusão da Seção.</h3>
                  <br><br>

                  <!--senha necessária-->
                  <v-row>
                    <v-col>
                      <span class="pl-3">Insira sua senha para confirmar a ação.</span>
                      <v-text-field
                        v-model="passwordCheck"
                        class="ml-3"
                        dense
                        label="Senha de acesso ao sistema"
                        rounded
                        solo
                        type="password"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                </v-alert>

              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer></v-spacer>
            <v-btn color="grey lighten-1" @click="closeDelete">Cancelar</v-btn>
            <span class="pl-5 pr-5"></span>
            <v-btn v-if="passwordCheck" color="red lighten-1" @click="deleteSecaoConfirm">Excluir</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>

  </v-main>
</template>

<script>import {mapGetters} from 'vuex'
import BarraNavegacao from '../barra-navegacao/BarraNavegacao.vue'

export default {
  components: {
    BarraNavegacao
  },
  data () {
    return {
      secoes: [],
      dataBtnPai: [],
      search: '',
      passwordCheck: '',
      headers: [
        {
          text: 'Nome',
          align: 'left',
          value: 'nome'
        },
        {
          text: 'Sigla',
          align: 'center',
          value: 'sigla'
        },
        {
          text: 'Seção Pai',
          align: 'center',
          value: 'pai.sigla'
        },
        {
          text: 'Actions',
          value: 'actions',
          align: 'center',
          sortable: false
        }
      ],
      selectedSecao: {
        nome: '',
        sigla: '',
        secao_pai: '',
        soupai: false,
        password: ''
      },
      defaultSecao: {
        nome: '',
        sigla: '',
        secao_pai: '',
        soupai: false,
        password: ''
      },
      dialogAddEditSecao: false,
      dialogDeleteSecao: false,
      tipoAcao: '',
      editedIndex: -1,
      alertaProblema: {
        users: [],
        filhos: [],
        categorias: 0,
        indicadores: 0,
        indicadorValor: 0
      }
    }
  },
  watch: {},

  async mounted () {
    await this.getSecoes()
  },
  computed: {

    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado'])

  },
  methods: {
    async getSecoes () {
      this.$http.get('secao/basica')
        .then(response => {
          this.secoes = response.data
        })
        .catch(erro => console.log(erro))

      this.$http.get('secao/lepais')
        .then(response => {
          this.dataBtnPai = response.data
        })
        .catch(erro => console.log(erro))
    },

    openDialogAddEditSecao (tipo, item) {
      this.tipoAcao = tipo
      if (tipo === 'add') {
        // Aqui estamos inicializando com os valores padrão (seção nova)
        this.selectedSecao = Object.assign({}, this.defaultSecao)
      } else {
        // Aqui estamos inicializando com os valores da seção que está sendo editada
        this.selectedSecao = item
        this.editedIndex = this.secoes.indexOf(item)
      }
      this.dialogAddEditSecao = true
    },

    efetuarCadastroEditSecao () {
      let arrayVal = this.validadoresCampos()
      if (arrayVal[0] > 0) {
        this.$toastr.e(
          arrayVal[1], 'Erro!'
        )
      } else {
        if (this.tipoAcao === 'add') {
          // aqui eu vou adicionar o usuario
          try {
            this.$http.post('secao', this.selectedSecao)
              .then(response => {
                this.secoes.push(response.data)
                this.dialogAddEditSecao = false
                this.$toastr.s(
                  'Seção cadastrada com sucesso', 'Sucesso!'
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
            this.$http.put('secao/' + this.selectedSecao.id, this.selectedSecao)
              .then(response => {
                Object.assign(this.secoes[this.editedIndex], response.data)
                this.$toastr.s(
                  'Seção alterada com sucesso', 'Sucesso!'
                )
                this.dialogAddEditSecao = false
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

    closeDelete () {
      this.dialogDeleteSecao = false
      this.$nextTick(() => {
        this.selectedSecao = {}
        this.editedIndex = -1
      })
    },

    deleteSecao (item) {
      this.alertaProblema = {
        users: [],
        filhos: [],
        categorias: 0,
        indicadores: 0,
        indicadorValor: 0
      }
      this.editedIndex = this.secoes.indexOf(item)
      this.selectedSecao = Object.assign({}, item)

      this.$http.get('secao/impacto/' + this.selectedSecao.id)
        .then(response => {
          this.alertaProblema = response.data
          this.dialogDeleteSecao = true
        }, err => {
          console.log(err)
          this.$toastr.e(
            'Não foi possível recuperar o impacto', 'Erro!'
          )
        })
    },

    deleteSecaoConfirm () {
      let objetoEnvio = {
        'password': this.passwordCheck
      }

      this.$http.post('users/checasenha', objetoEnvio)
        .then(response => {
          if (response.data === 1) {
            this.$http.delete('secao/' + this.selectedSecao.id)
              // eslint-disable-next-line no-return-assign
              .then(() => {
                this.getSecoes()
                this.closeDelete()
                this.$toastr.s(
                  'Seção removida com sucesso', 'Sucesso!'
                )
              }, err => {
                console.log(err)
                this.$toastr.e(
                  'Não foi possível remover a seção', 'Erro!'
                )
              })
          } else {
            this.$toastr.e(
              'A senha informada não confere com a sua senha!', 'Erro!'
            )
          }
        }, err => {
          console.log(err)
          this.$toastr.e(
            'Não foi possível verificar a senha!', 'Erro!'
          )
        })
    },

    validadoresCampos () {
      let msgRetornoErro = ''
      let contador = 0

      if (this.selectedSecao.nome === '') {
        msgRetornoErro += '<li>O Nome da Seção não pode ser vazio.</li>'
        contador++
      }
      if (this.selectedSecao.sigla === '') {
        msgRetornoErro += '<li>A sigla da seção não pode ser vazia.</li>'
        contador++
      }
      if (this.selectedSecao.soupai === false && this.selectedSecao.pai === '') {
        msgRetornoErro += '<li>Selecione a seção pai.</li>'
        contador++
      }

      msgRetornoErro = '<ul>' + msgRetornoErro + '</ul>'
      return [contador, msgRetornoErro]
    }
  }
}
</script>

<style>
.bgConfig {
  background-color: #CFE0BC !important;
}
</style>
