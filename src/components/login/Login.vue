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
                      v-mask="'#########'"
                      v-model="usuario.matricula"
                      :rules="[v => /^\d{9}$/.test(v) || 'A matrícula deve conter exatamente 9 dígitos']"
                      clearable
                      dense
                      maxlength="9"
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

          <v-row>
            <v-col>
              <v-alert
                dense
                rounded="xxl"
                class="text-center"
                type="warning"
                elevation="5">
                Para sua segurança, esta tela se fechará em: {{ contaSair }} segundos
              </v-alert>

            </v-col>
          </v-row>

          <v-row>
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
                  <v-icon
                    v-bind="attrs"
                    class="mr-2"
                    small
                    @click="openDialogVerDetalhes(item)"
                    v-on="on"
                  >
                    mdi-magnify
                  </v-icon>
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
      contaSair: 60
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
