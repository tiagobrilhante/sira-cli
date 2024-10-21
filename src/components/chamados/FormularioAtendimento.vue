<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-alert
          elevation="12"
          rounded="xxl">

          <h3>Dados do Aluno</h3>

          <!-- dados básicos do aluno (nome, matricula, telefone e email-->
          <v-alert
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

          <!-- seletor do curso para atendiimento-->
          <v-alert
            v-if="testaSemestreVigente() > 0 && !retornoOk"
            dense
            class="white--text"
            elevation="5"
            color="rgb(250, 115, 59)">

            <!-- descritor-->
            <v-row>
              <v-col>
                Selecione para qual curso deseja solicitar o atendimento.
              </v-col>
            </v-row>

            <!-- espaço para rádio de selecão-->
            <v-alert
              elevation="5"
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

          <v-alert
            v-if="retornoOk"
            class="text-center"
            elevation="5">
            <h3>
              Sua solicitação foi enviada com sucesso.<br>
              Essa janela fechará em: {{ contaSair }} </h3>
          </v-alert>

        </v-alert>
      </v-col>
    </v-row>
  </v-container>

</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'
import UpdateCurso from '../update/UpdateCurso.vue'

export default {
  components: {UpdateCurso},
  mixins: [logoutMixin],
  data: () => ({
    configSis: config,
    turmaCursoGroup: null,
    arrayTurmaCurso: [],
    descricao: '',
    password: '',
    retornoOk: false,
    contaSair: 10
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
    }
  }
}

</script>
<style>
</style>
