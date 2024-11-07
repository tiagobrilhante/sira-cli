<template >
  <v-container
    v-if="!usuarioEstaLogado"
    fluid>
    <v-row>
      <v-col class="text-center">
        <h2>Auto-Cadastramento de Aluno</h2>
        <br>
        <hr>
        <br>
      </v-col>
    </v-row>
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
        <span class="pl-3">Matricula (Somente Leitura)</span>
        <v-text-field
          v-model="editedUser.matricula"
          dense
          hint="Você já inseriu sua matrícula na tela anterior"
          persistent-hint
          readonly
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

    <!-- password e confirma password-->
    <v-row dense>

      <!-- senha-->
      <v-col>
        <span class="pl-3">Senha (Obrigatório)</span>
        <v-text-field
          v-model="editedUser.password"
          dense
          persistent-hint
          hint="no mínimo 6 caracteres"
          label="Senha"
          rounded
          type="password"
          solo
        />
      </v-col>

      <!-- confirma senha-->
      <v-col>
        <span class="pl-3">Confirmação de Senha (Obrigatório)</span>
        <v-text-field
          v-model="editedUser.passwordConfirm"
          dense
          persistent-hint
          hint="no mínimo 6 caracteres"
          type="password"
          label="Confirmação de Senha"
          rounded
          solo
        />
      </v-col>
    </v-row>

    <!-- seletor de cursos-->
    <v-alert
      elevation="5"
      rounded="xxl">
      <v-row>
        <v-col>
          <!-- seleção de cursos-->
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
              item-text="displayName"
              item-value="id"
              label="Selecione os cursos nos quais você está matriculado"
              multiple
              name="cursos"
              return-object
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

          <!-- alert de informação sobre cursos-->
          <v-alert
            class="white--text"
            color="rgb(250, 115, 59)"
            dismissible
            elevation="5"
            rounded="xxl">
            Caso o seu curso não apareça como opção disponível para seleção, entre em contato com o coordenador do mesmo
            para a abertura de semestre letivo.
          </v-alert>

          <!-- o curso, mostrar detalhes-->
          <v-alert
            v-for="curso in editedUser.cursos"
            :key="curso.id"
            class="white--text"
            color="#015088"
            rounded="xxl">
            <v-row>
              <v-col class="mt-auto mb-auto"><b>Curso: </b>{{ curso.nome }}</v-col>
              <v-col class="mt-auto mb-auto"><b>Unidade: </b>{{ curso.unidade.nome }}</v-col>
            </v-row>
            <v-row>

              <!-- turno-->
              <v-col>
                <span>Turno (Obrigatório)</span>
                <v-select
                  v-model="curso.turno"
                  :items="ajustaOptionsTurnosDisponiveis(curso)"
                  dense
                  hide-details
                  item-text="horario"
                  item-value="id"
                  return-object
                  label="Informe o seu turno"
                  rounded
                  solo
                />
              </v-col>

              <!-- periodo-->
              <v-col>
                <div v-if="curso.turno">
                  <span>Período (Obrigatório)</span>
                  <v-select
                    v-model="curso.periodo"
                    :items="ajustaOptionsPeriodosDisponiveis(curso.turno)"
                    dense
                    hide-details
                    item-text="periodo"
                    item-value="periodo"
                    label="Informe o seu período"
                    rounded
                    solo
                  />
                </div>
              </v-col>

              <!-- turma-->
              <v-col v-if="curso.periodo && ajustaOptionsTurmasDisponiveis(curso.periodo, curso.turno).length > 1">
                <div>
                  <span>Turma (Obrigatório)</span>
                  <v-select
                    v-model="curso.turma"
                    :items="ajustaOptionsTurmasDisponiveis(curso.periodo, curso.turno)"
                    dense
                    hide-details
                    label="Informe a sua turma"
                    rounded
                    solo
                  />
                </div>
              </v-col>
            </v-row>
          </v-alert>

        </v-col>
      </v-row>

      <!-- pra cada curso eu tenho que inbformar meu período-->

    </v-alert>

    <!-- actions-->
    <v-row>
      <v-col>
        <v-btn
          block
          class="white--text"
          color="#015088"
          rounded
          @click="saveAndLoga">
          <v-icon
            class="mr-4"
            small>mdi-check
          </v-icon>
          Salvar
        </v-btn>
      </v-col>
      <v-col>
        <v-btn
          block
          class="white--text"
          color="rgb(250, 115, 59)"
          rounded
          @click="cancelaCadastro">
          <v-icon
            class="mr-4"
            small>mdi-cancel
          </v-icon>
          Cancelar
        </v-btn>
      </v-col>
    </v-row>

  </v-container>
</template>
<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'

export default {
  components: {},
  mixins: [logoutMixin],
  props: {
    matricula: {
      type: String,
      required: true
    }
  },
  data: () => ({
    configSis: config,
    defaultUser: {
      'nome': '',
      'matricula': '',
      'telefone': '',
      'email': '',
      'tipo': '',
      'cursos': [],
      'reset': false,
      'password': '',
      'passwordConfirm': ''
    },
    editedUser: {
      'nome': '',
      'matricula': '',
      'telefone': '',
      'email': '',
      'tipo': '',
      'cursos': [],
      'reset': false,
      'password': '',
      'passwordConfirm': ''
    },
    cursosOptions: [],
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

  watch: {
    'editedUser.cursos': {
      handler (newCursos) {
        newCursos.forEach(curso => {
          this.$watch(
            () => curso.turno,
            (newTurno) => {
              curso.periodo = null
              curso.turma = null
            }
          )
          this.$watch(
            () => curso.periodo,
            (newPeriodo) => {
              curso.turma = null
            }
          )
        })
      },
      deep: true
    }
  },

  async mounted () {
    this.editedUser.matricula = this.matricula
    await this.getCursos()
  },

  methods: {
    async getCursos () {
      try {
        this.$http.get('retornacursos')
          .then(response => {
            this.cursosOptions = response.data
            console.log(this.cursosOptions)
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    getPeriodosOuTurmasPossiveis (curso, tipo) {
      let arrayRetorno = []

      if (tipo === 'periodo') {
        for (let i = 1; i < curso.qtd_periodos_possiveis + 1; i++) {
          arrayRetorno.push(i)
        }
      } else if (tipo === 'turnos') {
        for (let i = 0; i < curso.turnos.length; i++) {
          arrayRetorno.push(curso.turnos[i])
        }
      } else {
        for (let i = 1; i < curso.qtd_turmas + 1; i++) {
          arrayRetorno.push(i)
        }
      }

      return arrayRetorno
    },

    ajustaOptionsPeriodosDisponiveis (turno) {
      let retorno = []
      if (turno !== undefined) {
        for (let i = 0; i < turno.periodo_turmas.length; i++) {
          if (turno.periodo_turmas[i]) {
            retorno.push(turno.periodo_turmas[i])
          }
        }
      }
      return retorno
    },

    ajustaOptionsTurmasDisponiveis (periodo, turno) {
      let retornoTurmas = []

      for (let i = 0; i < turno.periodo_turmas.length; i++) {
        if (turno.periodo_turmas[i].periodo === periodo) {
          for (let j = 1; j < turno.periodo_turmas[i].qtd_turmas_por_periodo + 1; j++) {
            retornoTurmas.push(j)
          }
        }
      }

      return retornoTurmas
    },

    ajustaOptionsTurnosDisponiveis (curso) {
      let retornoTurnos = []
      for (let i = 0; i < curso.turnos.length; i++) {
        retornoTurnos.push(curso.turnos[i])
      }
      return retornoTurnos
    },

    concluirSelecao () {
      // Fecha o menu do v-select
      if (this.$refs.cursoSelect) {
        this.$refs.cursoSelect.isMenuActive = false
        this.$refs.cursoSelect.isFocused = false
      }
    },

    cancelaCadastro () {
      this.$emit('cancela-cadastro')
    },

    validaDadosParaEnvio () {
      let msgErro = []
      if (this.editedUser.nome === '') {
        msgErro.push('<li>O campo nome não pode ser vazio.</li>')
      }
      if (this.editedUser.email === '') {
        msgErro.push('<li>O campo email não pode ser vazio.</li>')
      }
      if (this.editedUser.telefone === '') {
        msgErro.push('<li>O campo telefone não pode ser vazio.</li>')
      }
      if (this.editedUser.password === '') {
        msgErro.push('<li>O campo senha não pode ser vazio.</li>')
      }
      if (this.editedUser.password.length < 6) {
        msgErro.push('<li>O campo senha deve ter no mínimo 6 caracteres.</li>')
      }
      if (this.editedUser.password !== this.editedUser.passwordConfirm) {
        msgErro.push('<li>Os campos senha e confirmação de senha devem ser iguais.</li>')
      }
      if (this.editedUser.cursos.length === 0) {
        msgErro.push('<li>Selecione ao menos um curso.</li>')
      }

      let verificaTurno = false
      let verificaperiodo = false
      let verificaTurma = false
      if (this.editedUser.cursos.length > 0) {
        for (let i = 0; i < this.editedUser.cursos.length; i++) {
          if ((this.editedUser.cursos[i].turno === null || this.editedUser.cursos[i].turno === undefined) && !this.editedUser.cursos[i].turno) {
            verificaTurno = true
          }
          if ((this.editedUser.cursos[i].periodo === null || this.editedUser.cursos[i].periodo === undefined) && !this.editedUser.cursos[i].periodo) {
            verificaperiodo = true
          }
          if ((this.editedUser.cursos[i].periodo !== null || this.editedUser.cursos[i].periodo !== undefined) && this.editedUser.cursos[i].periodo) {
            for (let j = 0; j < this.editedUser.cursos[i].turno.periodo_turmas.length; j++) {
              if (this.editedUser.cursos[i].turno.periodo_turmas[j].qtd_turmas_por_periodo > 1 && (this.editedUser.cursos[i].turma === null || this.editedUser.cursos[i].turma === undefined)) {
                verificaTurma = true
              }
            }
          }
        }
      }

      if (verificaTurno) {
        msgErro.push('<li>Selecione o seu turno.</li>')
      }

      if (verificaperiodo) {
        msgErro.push('<li>Selecione o seu periodo.</li>')
      }

      if (verificaTurma) {
        msgErro.push('<li>Selecione a sua turma.</li>')
      }

      if (msgErro.length > 0) {
        let msgretorno = '<ul>'
        for (let i = 0; i < msgErro.length; i++) {
          msgretorno += msgErro[i]
        }
        msgretorno += '</ul>'
        this.mostrarToastrPersonalizado(msgretorno)
        return false
      } else {
        return true
      }
    },

    mostrarToastrPersonalizado (msgretorno) {
      this.$toastr.Add({
        title: 'Erro!',
        msg: `<div style="padding: 20px;">${msgretorno}</div>`,
        type: 'error',
        timeout: 8000, // 10 segundos
        progressBar: true,
        closeOnHover: true,
        closeButton: true,
        onclick: null,
        debug: true,
        preventDuplicates: true,
        classNames: ['toastr-grande'] // Adiciona uma classe personalizada
      })
    },

    saveAndLoga () {
      if (this.validaDadosParaEnvio()) {
        this.$http.post('autocadastro', this.editedUser)
          .then(response => {
            console.log(response.data)
            this.$store.dispatch('efetuarLogin', {
              matricula: this.editedUser.matricula,
              password: this.editedUser.password
            })
              /* .then(() => {
              }) */
              .catch(erro => {
                this.mostrarToastrPersonalizado(erro.response.data.message)
              })
          })
          .catch(erro => {
            this.mostrarToastrPersonalizado(erro.response.data.message)
          })
      }
    }
  }
}

</script>
<style>

</style>
