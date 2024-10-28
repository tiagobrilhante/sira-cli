<template>

  <v-row dense>
    <v-col>

      <h3>Dados do Aluno</h3>

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

      <!-- convite para ajustar os cursos caso não exista semestre vigente vinculado ao aluno-->
      <v-alert
        v-if="testaSemestreVigente() === 0"
        dense
        class="white--text"
        elevation="5"
        color="rgb(250, 115, 59)">
        Você não possui cursos vinculados a esse período letivo ({{ emVigencia() }}).
        <br>

        Seu último vinculo é do período: {{ findClosestSemestreLetivo() }}<br>
        Você deve atualizar suas informações de cursos antes de prosseguir.

      </v-alert>

      <UpdateCurso
        v-if="testaSemestreVigente() === 0"
        @atualiza-vinculo = "retonaTurmaViaCodigo"/>

      <!-- seletor do curso para atendiimento / ajuste de cursos-->
      <v-alert
        v-if="testaSemestreVigente() > 0 && !retornoOk"
        rounded="xxl"
        dense
        class="white--text"
        elevation="5"
        color="rgb(250, 115, 59)">

        <!-- descritor e ajuste seus cursos-->
        <v-row class="mb-0">
          <v-col cols="7">
            Selecione para qual curso deseja solicitar o atendimento.
          </v-col>

          <!-- ajuste seus cursos-->
          <v-col
            class="text-right"
            cols="5">
            <v-btn
              class="white--text"
              x-small
              rounded
              color="#015088"
              @click="openDialogAjustaCursos">
              <v-icon
                class="pr-2"
                x-small
                color="white">
                mdi-cog
              </v-icon>
              Ajuste seus cursos
            </v-btn>
          </v-col>
        </v-row>

        <!-- espaço para rádio de selecão-->
        <v-alert
          elevation="5"
          rounded="xxl"
          dense>
          <v-radio-group
            v-model="turmaCursoGroup"
            hide-details
            class="pt-0 mt-0"
          >
            <v-radio
              v-for="(objeto, index) in arrayTurmaCurso"
              :key="index"
              :label="`${objeto.curso.nome} - ${objeto.geral}`"
              :value="objeto"
            />
          </v-radio-group>

        </v-alert>

        <!-- informações sobre o curso selecionado-->
        <v-alert
          v-if="turmaCursoGroup"
          rounded="xxl"
          elevation="5">
          <v-row dense>
            <v-col>
              <b>Curso: </b>{{ turmaCursoGroup.curso.nome }} - ({{ turmaCursoGroup.curso.codigo }})<br>
            </v-col>
            <v-col><b>Turno: </b> {{ turmaCursoGroup.turno.horario }} - {{ turmaCursoGroup.turno.identificador_horario }}</v-col>
          </v-row>

          <v-row dense>
            <v-col><b>Periodo: </b>{{ turmaCursoGroup.identificador_periodo }}</v-col>
            <v-col><b>Turma</b> {{ turmaCursoGroup.codigo_turma }}</v-col>
          </v-row>

          <v-row dense>
            <v-col><b>Codigo da turma: </b>{{ turmaCursoGroup.geral }}</v-col>
          </v-row>
        </v-alert>

      </v-alert>

      <!-- campos para preenchimento do pedido a ser atendido-->
      <v-alert
        v-if="turmaCursoGroup && !retornoOk"
        rounded="xxl"
        elevation="5">

        <h2>Descrição do assunto</h2>
        <h4>(escreva o que você precisa que seja resolvido, de forma clara e sucinta)</h4>

        <v-textarea
          v-model="descricao"
          label="Descrição"
          outlined
          dense
          rows="5"
        />

        <v-row>
          <v-col>
            <b>Data: </b> {{ getCurrentDateTime() }}
          </v-col>
          <v-col>
            <b>Assinatura do aluno</b> (mediante senha)
            <v-text-field
              v-model="password"
              dense
              label="Senha"
              type="password"
              rounded
              solo
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-btn
              rounded
              class="white--text"
              block
              color="rgb(250, 115, 59)">Cancelar</v-btn>
          </v-col>
          <v-col>
            <v-btn
              rounded
              color="#015088"
              block
              class="white--text"
              @click="sendSolicitacaoToServer">Enviar
            </v-btn>
          </v-col>
        </v-row>
        <br>

      </v-alert>

      <!-- countdown para logoff-->
      <v-alert
        v-if="retornoOk"
        class="text-center"
        elevation="5">
        <h3>
          Sua solicitação foi enviada com sucesso.<br>
          Essa janela fechará em: {{ contaSair }} </h3>
      </v-alert>

      <!--Dialog para configurar cursos de um aluno-->
      <v-dialog
        v-model="dialogAjustaCursos"
        persistent
        max-width="70%">
        <v-card>
          <v-card-title
            class="justify-center"
            primary-title>
            Ajuste de Cursos - Matrícula: {{ usuarioLogado.matricula }}
          </v-card-title>
          <v-card-text>

            <v-alert
              dense

              elevation="15"
              rounded="xxl">

              <v-row>
                <v-col cols="3"/>
                <v-col
                  cols="6"
                  class="text-center">Vigência: {{ emVigencia() }}</v-col>
                <v-col
                  cols="3"
                  class="text-right">
                  <v-btn
                    class="white--text"
                    color="#015088"
                    rounded
                    small
                    @click="openDialogAddNovoCurso"> <v-icon
                      class="pr-3"
                      small
                      color="white">mdi-plus-circle</v-icon> Cadastrar novo curso</v-btn>
                </v-col>
              </v-row>

            </v-alert>

            <v-alert
              v-for="vinculo in arrayTurmaCurso"
              :key="vinculo.id"
              rounded="xxl"
              class="white--text"
              color="rgb(250, 115, 59)"
              dense>

              <v-row>
                <v-col cols="11">
                  <!-- unidade e curso-->
                  <v-row dense>
                    <!--unidade-->
                    <v-col>
                      <b>Unidade: </b>{{ vinculo.unidade.nome }}
                    </v-col>
                    <!--curso-->
                    <v-col>
                      <b>Curso: </b>{{ vinculo.curso.nome }}
                    </v-col>
                  </v-row>

                  <!--periodo e tirno-->
                  <v-row dense>
                    <!--periodo-->
                    <v-col>
                      <b>Período: </b>{{ vinculo.identificador_periodo }}
                    </v-col>
                    <!--turno-->
                    <v-col>
                      <b>Turno: </b>{{ vinculo.turno.horario }}
                    </v-col>
                  </v-row>

                  <!--turma e código-->
                  <v-row dense>
                    <!--turma-->
                    <v-col>
                      <b>Turma: </b>{{ vinculo.codigo_turma }}
                    </v-col>
                    <!--código-->
                    <v-col>
                      <b>Código: </b>{{ vinculo.geral }}
                    </v-col>
                  </v-row>

                </v-col>
                <v-col
                  cols="1"
                  class="text-right">
                  <v-btn
                    color="#015088"
                    rounded
                    small> <v-icon
                      small
                      color="white">mdi-pen</v-icon></v-btn>
                  <br>
                  <br>
                  <v-btn
                    color="#015088"
                    rounded
                    small> <v-icon
                      small
                      color="white">mdi-delete</v-icon></v-btn>
                </v-col>
              </v-row>

            </v-alert>

          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer/>
            <v-btn
              rounded
              class="white--text"
              color="#015088"
              @click="dialogAjustaCursos = false">Fechar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!--Dialog para add cursos em um aluno-->
      <v-dialog
        v-model="dialogAddCursos"
        persistent
        max-width="70%">
        <v-card>
          <v-card-title
            class="justify-center"
            primary-title>
            Adicionar Cursos - Matrícula: {{ usuarioLogado.matricula }}
          </v-card-title>
          <v-card-text>
            <AjusteCurso @atualiza-vinculo = "retonaTurmaViaCodigo"/>
          </v-card-text>
          <v-card-actions class="pb-5">

            <v-row>
              <v-col/>
              <v-col class="pr-5 ml-3">
                <v-btn
                  rounded
                  block
                  class="white--text"
                  color="rgb(250, 115, 59)"
                  @click="dialogAddCursos = false">Cancelar
                </v-btn>
              </v-col>
            </v-row>

          </v-card-actions>

        </v-card>
      </v-dialog>

    </v-col>

  </v-row>

</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'
import UpdateCurso from '../update/UpdateCurso.vue'
import AjusteCurso from '../update/AjusteCurso.vue'

export default {
  components: {UpdateCurso, AjusteCurso},
  mixins: [logoutMixin],
  data: () => ({
    configSis: config,
    turmaCursoGroup: null,
    arrayTurmaCurso: [],
    descricao: '',
    password: '',
    retornoOk: false,
    contaSair: 10,
    dialogAjustaCursos: false,
    meusCursosVigentes: [],
    dialogAddCursos: false
  }),
  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado'])
  },

  watch: {
  },

  async mounted () {
    await this.retonaTurmaViaCodigo()
  },
  beforeDestroy () {
  },

  methods: {
    retonaTurmaViaCodigo () {
      this.arrayTurmaCurso = []
      for (let i = 0; i < this.usuarioLogado.aluno_vinculos.length; i++) {
        if (this.usuarioLogado.aluno_vinculos[i].semestre_letivo === this.emVigencia()) {
          try {
            this.$http.get('turma/' + this.usuarioLogado.aluno_vinculos[i].codigo_vinculo)
              .then(response => {
                this.arrayTurmaCurso.push(response.data)
              })
              .catch(erro => console.log(erro))
          } catch (e) {
            console.log(e)
          }
        }
      }
      if (this.dialogAddCursos) {
        this.dialogAddCursos = false
      }
    },

    getCurrentDateTime () {
      const now = new Date()
      const date = now.toLocaleDateString() // Format: MM/DD/YYYY
      const time = now.toLocaleTimeString() // Format: HH:MM:SS AM/PM
      return `${date} ${time}`
    },

    sendSolicitacaoToServer () {
      // tenho que validar
      /*
      descricao
      password
      turmaCursoGroup
       */
      const objetoParaEnvio = {
        'descricao': this.descricao,
        'password': this.password,
        'data': this.getCurrentDateTime(),
        'turmaCursoGroup': this.turmaCursoGroup,
        'usuarioLogado': this.usuarioLogado,
        'periodo_letivo': this.emVigencia()
      }

      try {
        this.$http.post('atendimento/', objetoParaEnvio)
          .then(response => {
            if (response.data === 'Senha inválida') {
              this.$toastr.e(
                'Verifique sua senha, ele deve ser a mesma de login', 'Erro!'
              )
            } else {
              this.retornoOk = true
              this.startCountdown()
            }
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    testaSemestreVigente () {
      const vigente = this.emVigencia()
      let contador = 0
      for (let i = 0; i < this.usuarioLogado.aluno_vinculos.length; i++) {
        if (this.usuarioLogado.aluno_vinculos[i].semestre_letivo === vigente) {
          contador++
        }
      }

      return contador
    },

    emVigencia () {
      // Obtém o ano corrente
      const currentYear = new Date().getFullYear()

      // Obtém o mês corrente
      const currentMonth = new Date().getMonth() + 1 // Janeiro é 0, por isso somamos 1

      // Define o semestre com base no mês
      const currentSemester = currentMonth <= 6 ? 1 : 2

      const semestreVigente = currentYear.toString().slice(-2) + '.' + currentSemester
      // Retorna o ano com os dois últimos dígitos e o semestre
      return semestreVigente
    },

    findClosestSemestreLetivo () {
      const vigente = this.emVigencia()
      let closest = null
      let minDiff = Infinity

      for (let i = 0; i < this.usuarioLogado.aluno_vinculos.length; i++) {
        const semestre = this.usuarioLogado.aluno_vinculos[i].semestre_letivo
        const diff = Math.abs(parseFloat(semestre) - parseFloat(vigente))

        if (diff < minDiff) {
          minDiff = diff
          closest = semestre
        }
      }
      return closest
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

    openDialogAjustaCursos () {
      this.dialogAjustaCursos = true
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

    openDialogAddNovoCurso () {
      this.dialogAddCursos = true
    }
  }
}

</script>
<style>
</style>
