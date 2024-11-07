<template>
  <v-container>

    <v-row dense>
      <v-col>
        <v-card
          v-if="!usuarioEstaLogado"
          class="bordaAzul"
          elevation="10"
          rounded="xxl"
        >

          <!--card title-->
          <v-card-title>
            <v-icon class="mr-4">
              fa fa-user
            </v-icon>
            Login
          </v-card-title>

          <!--card text-->
          <v-card-text>
            <v-form
              @submit.prevent="efetuarLogin">
              <v-container>

                <!--matricula-->
                <v-row no-gutters>
                  <v-col>
                    <v-text-field
                      v-mask="'########'"
                      v-model="usuario.matricula"
                      :rules="[v => /^\d{8}$/.test(v) || 'A matrícula deve conter exatamente 8 dígitos']"
                      clearable
                      dense
                      maxlength="8"
                      label="Matricula"
                      name="matricula"
                      outlined
                      placeholder="Insira a sua matrícula"
                      required
                    />
                  </v-col>
                </v-row>

                <!--Password-->
                <v-row no-gutters>
                  <v-col>
                    <v-text-field
                      v-model="usuario.password"
                      :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="show1 ? 'text' : 'password'"
                      clearable
                      counter
                      dense
                      hint="No mínimo 6 caracteres"
                      label="Senha"
                      name="password"
                      outlined
                      required
                      @click:append="show1 = !show1"
                    />
                  </v-col>
                </v-row>

                <!--logar e cadastro-->
                <v-row dense>
                  <!--logar-->
                  <v-col>
                    <v-btn
                      block
                      class="white--text"
                      color="#015088"
                      elevation="2"
                      type="submit"
                    >Entrar
                    </v-btn>
                  </v-col>
                </v-row>

              </v-container>
            </v-form>
          </v-card-text>

        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="usuarioEstaLogado">
      <v-col>

        <v-alert
          elevation="10"
          rounded="xxl">

          <v-row dense>
            <v-col>
              <v-alert
                dense
                rounded="xxl"
                class="text-center"
                type="warning"
                elevation="5">
                Para sua segurança, esta tela se fechará em: {{ contaSair }} segundos
              </v-alert>

              <v-row
                class="pb-3"
                dense>
                <v-col><h3 class="pt-1">Dados do Aluno</h3></v-col>
                <v-col class="text-right"><v-btn
                  color="#015088"
                  class="white--text"
                  x-small
                  rounded
                  @click="openDialogAjustaDados"> <v-icon
                    class="pr-2"
                    x-small
                    color="white">
                    mdi-cog
                </v-icon>Ajuste seus dados</v-btn></v-col>
              </v-row>

              <!-- dados básicos do aluno (nome, matricula, telefone e email-->
              <v-alert
                rounded="xxl"
                dense
                class="white--text"
                elevation="5"
                color="#015088">

                <!-- nome e matricula-->
                <v-row dense>
                  <!-- nome-->
                  <v-col><b>Nome: </b>{{ usuarioLogado.nome }}</v-col>
                  <!-- matricula-->
                  <v-col><b>Matricula: </b>{{ usuarioLogado.matricula }}</v-col>
                </v-row>

                <!-- telefone e email-->
                <v-row dense>
                  <!-- telefone-->
                  <v-col><b>Telefone </b>{{ usuarioLogado.telefone }}</v-col>
                  <!-- email-->
                  <v-col><b>Email </b>{{ usuarioLogado.email }}</v-col>
                </v-row>
              </v-alert>

            </v-col>
          </v-row>

          <v-row dense>
            <v-col><v-btn
              :color="returnColorBtnSelected('Aberto')"
              block
              class="white--text"
              rounded
              @click="getMeusAtendimentos('Aberto')">Aberto</v-btn></v-col>
            <v-col><v-btn
              :color="returnColorBtnSelected('Deferido')"
              block
              class="white--text"
              rounded
              @click="getMeusAtendimentos('Deferido')">Deferido</v-btn></v-col>
            <v-col><v-btn
              :color="returnColorBtnSelected('Indeferido')"
              block
              class="white--text"
              rounded
              @click="getMeusAtendimentos('Indeferido')">Indeferido</v-btn></v-col>
          </v-row>

          <br>

          <!--DataTable-->
          <v-data-table
            :headers="headers"
            :items="atendimentos"
            :search="search"
            class="elevation-21"
            dense
            sort-by="id"
          >
            <!-- template para titulo e search-->
            <template v-slot:top>
              <v-toolbar
                flat
              >
                <!-- Título da tabela-->
                <v-toolbar-title>Tabela de Solicitações Cadastradas</v-toolbar-title>

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

            <!--Template de botões para resolver chamado e ver detalhes -->
            <template v-slot:item.actions="{ item }">
              <!-- ver detalhes-->
              <v-tooltip
                top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    class="white--text"
                    color="rgb(250, 115, 59)"
                    rounded
                    x-small
                    @click="openDialogVerDetalhes(item)"
                    v-on="on"
                  >
                    <v-icon

                      class="mr-2"
                      x-small

                    >
                      mdi-magnify
                    </v-icon>
                    Ver detalhes
                  </v-btn>
                </template>
                <span>Detalhes da solicitação</span>
              </v-tooltip>

            </template>

          </v-data-table>

        </v-alert>
      </v-col>
    </v-row>

    <!--Dialog para ver detalhes de solicitação -->
    <v-dialog
      v-model="dialogVerChamado"
      max-width="70%">
      <v-card>
        <v-card-title
          class="justify-center"
          primary-title>
          Solução de Solicitação - {{ selectedSolicitacao.status }}
        </v-card-title>
        <v-card-text ref="contentToConvert">

          <VerChamado :selected-solicitacao="selectedSolicitacao"/>

        </v-card-text>
        <v-card-actions
          class="
              pb-5">
          <v-spacer/>
          <v-btn
            rounded
            class="white--text"
            color="rgb(250, 115, 59)"
            @click="dialogVerChamado = false">Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Dialog para ajustar dados de um aluno-->
    <v-dialog
      v-model="dialogAjustaDados"
      persistent
      max-width="70%">
      <v-card>
        <v-card-title
          class="justify-center"
          primary-title>
          Ajuste de dados
        </v-card-title>
        <v-card-text>

          <!-- nome completo / matricula -->
          <v-row dense>

            <!--nome completo-->
            <v-col>
              <span class="pl-3">Nome Completo (Obrigatório)</span>
              <v-text-field
                v-model="editedUser.nome"
                dense
                label="Nome Completo"
                rounded
                solo
              />
            </v-col>

            <!-- matricula -->
            <v-col>
              <span class="pl-3">Matricula</span>

              <v-text-field
                v-mask="'########'"
                v-model="editedUser.matricula"
                :rules="[v => /^\d{8}$/.test(v) || 'A matrícula deve conter exatamente 8 dígitos']"
                dense
                label="Matricula"
                maxlength="8"
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
                dense
                label="Telefone de Contato"
                rounded
                solo
              />
            </v-col>

          </v-row>

          <v-alert
            v-if="altereiMatricula"
            color="rgb(250, 115, 59)"
            elevation="10">
            <h3 class="white--text"> Você está modificando o número de sua matrícula e por isso, ao clicar em alterar, será necessário realizar um novo login.</h3>

            <br>

            <v-alert
              elevation="10"
              dense
              class="pt-0 pb-0 mt-0"
              color="white">
              <v-checkbox
                v-model="checkboxConfirmacao"
                color="black"
                label="Eu estou ciente dessa ação."
                @change = "btnAlteraDisabled = !btnAlteraDisabled"

              />
            </v-alert>

          </v-alert>

        </v-card-text>
        <v-card-actions class="pb-5">

          <v-row dense>
            <v-col/>
            <v-col>
              <v-btn
                :disabled = "btnAlteraDisabled"
                rounded
                block
                class="white--text"
                color="#015088"
                @click="doEditDados">Alterar
              </v-btn>
            </v-col>
            <v-col>

              <v-btn
                rounded
                block
                class="white--text"
                color="rgb(250, 115, 59)"
                @click="fechaDialogAjustaDados">Cancelar
              </v-btn>
            </v-col>
            <v-col/>
          </v-row>

        </v-card-actions>

      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>import config from '../../http/config'
import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import VerChamado from '../chamados/verChamado.vue'

export default {
  components: {VerChamado},
  mixins: [logoutMixin],
  props: {
    tipo: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      configSis: config,
      usuario: {
        matricula: '',
        password: ''
      },
      show1: false,
      atendimentos: [],
      search: '',
      headers: [
        {
          text: 'Descrição',
          align: 'start',
          value: 'descricao'
        },
        {
          text: 'Detalhes',
          value: 'actions',
          align: 'center',
          sortable: false
        }
      ],
      dialogVerChamado: false,
      selectedSolicitacao: {
        codigo_geral: '',
        descricao: '',
        data_solicitacao: '',
        data_solucao: '',
        aluno: {
          nome: '',
          matricula: '',
          email: '',
          telefone: ''
        },
        curso: {
          nome: ''
        },
        user_atendimento_resolucao: {
          responsavel: {}
        }
      },
      opcaoSelecionada: 'Aberto',
      retornoOk: false,
      contaSair: 60,
      dialogAjustaDados: false,
      editedUser: {},
      checkboxConfirmacao: false,
      altereiMatricula: false,
      btnAlteraDisabled: false
    }
  },
  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado'])
  },
  methods: {
    efetuarLogin () {
      if (this.usuario.matricula === '' || this.usuario.password === '') {
        this.$toastr.e(
          'Preencha todos os campos', 'Erro!'
        )
      } else {
        this.$store.dispatch('efetuarLogin', this.usuario)
          .then(response => {
            if (this.tipo === 'Aluno' && response.user.tipo === 'Aluno') {
              // aqui eu posso emitir para ocultar o login
              if (response.user.reset) {
                this.$router.push({name: 'reset'})
              } else {
                this.getMeusAtendimentos('Aberto')

                this.startCountdown()
              }
            } else if (this.tipo === 'Admin' && response.user.tipo === 'Aluno') {
              // o aluno não pode estar aqui
              // fecho o dialog e lanço o toaster informando que o aluno não pode estar aqui
              this.$store.commit('DESLOGAR_USUARIO')
              // this.$router.push({name: 'index'})
              this.$toastr.e(
                'Você não é um administrador', 'Erro!'
              )
            } else {
              if (response.user.reset) {
                this.$router.push({name: 'reset'})
              } else {
                this.$router.push({name: 'home'})
              }
            }
            /*
            if (response.user.reset) {
              this.$router.push({name: 'reset'})
            } else {
              this.$router.push({name: 'home'})
            }
            */
          })
          .catch(erro => {
            if (erro.request.status === 401) {
              this.$toastr.e(
                'Login ou senha inválidos', 'Erro!'
              )
            }
          })
      }
    },

    getMeusAtendimentos (tipoStatus) {
      this.contaSair = 60
      this.opcaoSelecionada = tipoStatus
      try {
        this.$http.get('atendimento/meusatendimentos/' + tipoStatus)
          .then(response => {
            this.atendimentos = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    openDialogVerDetalhes (item) {
      this.contaSair = 60
      this.selectedSolicitacao = item
      this.dialogVerChamado = true
    },

    retornaObjetoCursoPeriodoTurnoTurma (codigo) {
      if (codigo) {
        // Verifica se o código tem o comprimento esperado
        if (codigo.length < 12) {
          throw new Error('Código inválido')
        }

        // Extrai as partes do código conforme as regras
        const identificadorUnidade = codigo.substring(0, 3)
        const codigoCurso = codigo.substring(3, 6)
        const numeroConstante = codigo.substring(6, 8)
        const identificadorPeriodo = codigo.substring(8, 10)
        const codigoTurno = codigo.substring(10, codigo.length - 1) // Pega todos os caracteres até o penúltimo
        const codigoTurma = codigo.substring(codigo.length - 1) // Pega o último caractere

        // Monta o array com as informações extraídas
        const informacoes = {
          unidade: identificadorUnidade,
          curso: codigoCurso,
          numero_constante: numeroConstante,
          identificador_periodo: identificadorPeriodo,
          turno: codigoTurno,
          codigo_turma: codigoTurma,
          geral: codigo
        }

        return informacoes
      }
    },

    formatDate (dateString) {
      // eslint-disable-next-line no-constant-condition
      if (dateString !== null || true || dateString !== '' || dateString !== undefined) {
        if (dateString !== '') {
          const [datePart] = dateString.split(' ')
          const [year, month, day] = datePart.split('-')
          return `${day}/${month}/${year}`
        }
      }
    },

    returnColorBtnSelected (qual) {
      if (qual === this.opcaoSelecionada) {
        return '#015088'
      } else {
        return 'rgb(250, 115, 59)'
      }
    },

    startCountdown () {
      this.retornoOk = true
      const intervalId = setInterval(() => {
        this.contaSair--
        if (this.contaSair === 0) {
          clearInterval(intervalId)
          this.$emit('countdown-finished')
        }
      }, 1000)
    },

    openDialogAjustaDados () {
      this.contaSair = 60
      this.dialogAjustaDados = true
      this.editedUser = Object.assign({}, this.usuarioLogado)
    },

    fechaDialogAjustaDados () {
      this.contaSair = 60
      this.dialogAjustaDados = false
      this.editedUser = {}
    },

    doEditDados () {
      this.contaSair = 60
      let contaErros = 0
      const promises = []

      // Check the integrity of email and matricula (unique)
      if (this.editedUser.matricula !== this.usuarioLogado.matricula) {
        this.altereiMatricula = true
        this.btnAlteraDisabled = true

        if (!this.checkboxConfirmacao) {
          return
        }

        const objetoEnvio = {
          'matricula': this.editedUser.matricula
        }
        promises.push(
          this.$http.put('users/checamatricula/' + this.usuarioLogado.id, objetoEnvio)
            .then(response => {
              if (response.data === 'Matrícula já registrada por outro usuário.') {
                this.$toastr.e(response.data, 'Erro!')
                contaErros++
                this.checkboxConfirmacao = false
                this.altereiMatricula = false
                this.btnAlteraDisabled = false
              }
            })
            .catch(erro => {
              console.log(erro)
              contaErros++
            })
        )
      }

      if (this.editedUser.email !== this.usuarioLogado.email) {
        const objetoEnvio = {
          'email': this.editedUser.email
        }
        promises.push(
          this.$http.put('users/checaemail/' + this.usuarioLogado.id, objetoEnvio)
            .then(response => {
              if (response.data === 'Email já registrado por outro usuário.') {
                this.checkboxConfirmacao = false
                this.altereiMatricula = false
                this.btnAlteraDisabled = false
                this.$toastr.e(response.data, 'Erro!')
                contaErros++
              }
            })
            .catch(erro => {
              console.log(erro)
              contaErros++
            })
        )
      }

      Promise.all(promises).then(() => {
        if (contaErros === 0) {
          if (this.editedUser.nome === '' || this.editedUser.matricula === '' || this.editedUser.telefone === '' || this.editedUser.email === '') {
            this.$toastr.e('Todos os campos são obrigatórios', 'Erro!')
          } else {
            this.$http.put('users/editaaluno/' + this.usuarioLogado.id, this.editedUser)
              .then(response => {
                this.$toastr.s('Dados alterados com sucesso', 'Sucesso!')
                if (this.altereiMatricula) {
                  this.$emit('countdown-finished')
                } else {
                  this.$store.dispatch('atualizarUsuarioLogado', response.data)
                  this.dialogAjustaDados = false
                  this.editedUser = {}
                  this.checkboxConfirmacao = false
                  this.altereiMatricula = false
                  this.btnAlteraDisabled = false
                }
              })
              .catch(erro => {
                console.log(erro)
                this.$toastr.e('Erro ao alterar os dados', 'Erro!')
              })
          }
        }
      })
    }
  }
}
</script>
<style>
.bordaBranca {
  position: relative;
}

.bordaBranca::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 3px solid white;
  pointer-events: none;
  border-radius: 30px;
}

.bordaAzul {
  position: relative;
}

.bordaAzul::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 3px solid #cd7f0d;
  pointer-events: none;
  border-radius: 30px;
}

.my-border {
  border: 1px solid black !important;
}

.myrealce{
  background-color: #d0d8d7;
}
</style>
