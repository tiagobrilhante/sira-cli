<template >
  <v-container
    fluid>
    <v-row>
      <v-col class="text-center">
        <h2>Atualização de vínculo de Aluno - Matricula {{ usuarioLogado.matricula }}</h2>
        <br>
        <hr>
        <br>
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
      <v-col/>
      <v-col>
        <v-btn
          block
          class="white--text"
          color="#015088"
          rounded
          @click="updateAndAtualiza">
          <v-icon
            class="mr-4"
            small>mdi-check
          </v-icon>
          Atualizar
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
  data: () => ({
    configSis: config,
    defaultUser: {
      'cursos': []
    },
    editedUser: {
      'cursos': []
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
    await this.getCursos()
  },

  methods: {
    async getCursos () {
      try {
        this.$http.get('retornacursos')
          .then(response => {
            this.cursosOptions = response.data
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

    updateAndAtualiza () {
      if (this.validaDadosParaEnvio()) {
        this.editedUser.matricula = this.usuarioLogado.matricula
        this.$http.post('users/updatecursousuario', this.editedUser)
          .then(response => {
            this.$store.dispatch('atualizarUsuarioLogado', response.data)
            this.$emit('atualiza-vinculo')
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
