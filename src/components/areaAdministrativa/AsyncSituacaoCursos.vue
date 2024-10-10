<template>
  <div>
    <span v-if="situacaoCursos && situacaoCursos !== 'Sem cursos vigentes'">
      <v-alert
        v-for="turnoBase in turnoParametro"
        :key="turnoBase.id"
        elevation="5">
        <v-row class="mb-1">
          <v-col> {{ turnoBase.horario }} - ({{ turnoBase.identificador_horario }})</v-col>
          <v-col class="text-right">
            <!--habilita periodos e turmas-->
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  class="mb-0 white--text"
                  color="rgb(250, 115, 59)"
                  rounded
                  small
                  @click="habilitarEditarTurma(turnoBase)">
                  <v-icon
                    v-bind="attrs"
                    small
                    v-on="on">
                    mdi-plus
                  </v-icon>
                </v-btn>
              </template>
              <span>Habilitar Periodos e Turmas</span>
            </v-tooltip>

          </v-col>
        </v-row>
        <!-- Verifica se existe pelo menos um turno correspondente -->
        <template
          v-if="situacaoCursos.turnos && situacaoCursos.turnos.some(turno => turno.turno_parametro.id === turnoBase.id)">

          <v-alert
            v-for="turno in situacaoCursos.turnos"
            v-if="turno.turno_parametro.id === turnoBase.id"
            :key="turno.id"
            class="pb-0"
            color="rgb(250, 115, 59)"
            elevation="5">

            <v-alert
              v-for="pt in turno.periodo_turma"
              :key="pt.id"
              elevation="5">

              <v-row>
                <v-col>
                  <b>Período: </b> {{ pt.periodo }}º <br>
                  <b>Quantidade de turmas: </b> {{ pt.qtd_turmas_por_periodo }} <br>
                </v-col>

                <!-- actions-->
                <v-col class="text-right">
                  <!--editar-->
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        class="mb-0 white--text"
                        color="#015088"
                        rounded
                        small
                        @click="editarPeriodoTurma(pt)">
                        <v-icon
                          v-bind="attrs"
                          small
                          v-on="on">
                          mdi-pen
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Editar Turmas</span>
                  </v-tooltip>

                  <!--excluir-->
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        class="mb-0 white--text"
                        color="#015088"
                        rounded
                        small
                        @click="excluirTurma(pt, turnoBase)">
                        <v-icon
                          v-bind="attrs"
                          small
                          v-on="on">
                          mdi-delete
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Excluir Turmas</span>
                  </v-tooltip>
                </v-col>
              </v-row>
            </v-alert>
          </v-alert>
        </template>

        <!-- Caso não haja nenhum turno correspondente, exibe o alerta de "Sem turmas" -->
        <v-alert
          v-else
          elevation="5">
          <v-row>
            <v-col class="text-center"><b>Sem Períodos / Turmas</b></v-col>
          </v-row>
        </v-alert>
      </v-alert>
    </span>

    <!-- nesse caso, realmente não tem nada habilitado-->
    <span v-else>
      <v-alert
        v-for="turnoBase in turnoParametro"
        :key="turnoBase.id"
        elevation="5">

        <v-row class="mb-1">
          <v-col> {{ turnoBase.horario }} - ({{ turnoBase.identificador_horario }})</v-col>
          <v-col class="text-right">
            <!--Habilitar periodos e turmas-->
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  class="mb-0 white--text"
                  color="rgb(250, 115, 59)"
                  rounded
                  small
                  @click="habilitarEditarTurma(turnoBase)">
                  <v-icon
                    v-bind="attrs"
                    small
                    v-on="on">
                    mdi-plus
                  </v-icon>
                </v-btn>
              </template>
              <span>Habilitar Periodos e Turmas</span>
            </v-tooltip>

          </v-col>
        </v-row>

        <v-alert elevation="5">
          <v-row>
            <v-col class="text-center"><b>Sem Períodos / Turmas</b></v-col>
          </v-row>
        </v-alert>
      </v-alert>
    </span>

    <!--Dialog para habilitar e editar turmas-->
    <v-dialog
      v-model="dialogHabilitaEditaTurma"
      max-width="800px">
      <v-card>
        <v-card-title
          class="justify-center"
          primary-title>
          {{ objetoDialog.header }}
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col><b>Unidade:</b> {{ unidade.nome }}</v-col>
            <v-col><b>Curso:</b> {{ curso.nome }}</v-col>
          </v-row>
          <v-row dense>
            <v-col><b>Vigência:</b> {{ emVigencia() }}</v-col>
            <v-col><b>Horário: </b>{{ selectedTurnoBase.horario }}</v-col>
          </v-row>

          <!-- periodos disponíveis-->
          <v-row>
            <v-col>
              <v-alert
                elevation="5"
                rounded="xxl">
                <h3>Períodos Disponíveis</h3>
                <v-row>
                  <v-col
                    v-for="n in montaListaPeriodosDisponiveis(curso, selectedTurnoBase)"
                    :key="n">
                    <v-checkbox
                      v-model="objetoPeriodoTurma.periodo"
                      :label="n.toString()"
                      :value="n"
                    />
                  </v-col>
                </v-row>
              </v-alert>
            </v-col>
          </v-row>

          <v-row
            v-for="(periodo,index) in objetoPeriodoTurma.periodo"
            :key="index"
            class="mt-10">
            <v-col>
              <v-slider
                v-model="objetoPeriodoTurma.qtd_turmas_por_periodo[periodo]"
                :label="`Turmas do: ${periodo} período`"
                class="align-center"
                dense
                max="15"
                min="1"
                rounded
                solo
                thumb-color="#015088"
                thumb-label="always"
              >
                <template v-slot:append>
                  <v-text-field
                    v-model="objetoPeriodoTurma.qtd_turmas_por_periodo[periodo]"
                    class="mt-0 pt-0"
                    hide-details
                    single-line
                    style="width: 60px"
                    type="number"
                  />
                </template>
              </v-slider>

            </v-col>
          </v-row>

        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer/>
          <v-btn
            class="white--text"
            color="rgb(250, 115, 59)"
            @click="dialogHabilitaEditaTurma = false"> Cancelar
          </v-btn>

          <v-btn
            class="white--text ml-10"
            color="#015088"
            @click="doHabilitaEditaTurma"> {{ objetoDialog.txt_btn }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Dialog para deletar turmas-->
    <v-dialog
      v-model="dialogDeletaTurma"
      max-width="800px">
      <v-card>
        <v-card-title
          class="justify-center"
          primary-title>
          Excluir Turmas
        </v-card-title>
        <v-card-text>

          <v-row
            class="text-left"
            dense>
            <v-col><b>Unidade:</b> {{ unidade.nome }}</v-col>
            <v-col><b>Curso:</b> {{ curso.nome }}</v-col>
          </v-row>

          <v-row
            class="text-left"
            dense>
            <v-col><b>Vigência:</b> {{ emVigencia() }}</v-col>
            <v-col><b>Horário: </b> {{ selectedTurnoBase.horario }}</v-col>
          </v-row>

          <v-row dense>
            <v-col>
              <v-alert type="error">
                <span>Todas as turmas do {{ periodoTurmaSelected.periodo }}º período serão excluídas!</span>
              </v-alert>
            </v-col>
          </v-row>

        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer/>
          <v-btn
            class="white--text"
            color="#015088"
            @click="dialogDeletaTurma = false"> Cancelar
          </v-btn>

          <v-btn
            class="white--text ml-10"
            color="rgb(250, 115, 59)"
            @click="doDeletaTurma"> Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Dialog para editar periodo turma-->
    <v-dialog
      v-model="dialogEditaPeriodoTurma"
      max-width="800px">
      <v-card>
        <v-card-title
          class="justify-center"
          primary-title>
          Redefinir Turmas
        </v-card-title>
        <v-card-text>

          <v-row class="mt-6">
            <v-col>
              <v-slider
                v-model="reajusteTurmasPeriodo"
                :label="`Turmas do: ${periodoTurmaSelected.periodo} período`"
                class="align-center"
                dense
                max="15"
                min="1"
                rounded
                solo
                thumb-color="#015088"
                thumb-label="always"
              >
                <template v-slot:append>
                  <v-text-field
                    v-model="reajusteTurmasPeriodo"
                    class="mt-0 pt-0"
                    hide-details
                    single-line
                    style="width: 60px"
                    type="number"
                  />
                </template>
              </v-slider>
            </v-col>
          </v-row>

        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer/>
          <v-btn
            class="white--text"
            color="rgb(250, 115, 59)"
            @click="dialogEditaPeriodoTurma = false"> Cancelar
          </v-btn>

          <v-btn
            class="white--text ml-10"
            color="#015088"
            @click="doEditTurmaPeriodo"
          >
            Editar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    semestresLetivos: {
      type: Array,
      required: true
    },
    turnoParametro: {
      type: Array,
      required: true
    },
    curso: {
      type: Object,
      required: true
    },
    unidade: {
      type: Object,
      required: true
    },
    retornaSituacaoCursos: {
      type: Function,
      required: true
    },
    emVigencia: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      situacaoCursos: 'Carregando...',
      dialogHabilitaEditaTurma: false,
      selectedTurnoBase: {},
      qtd_turmas: 1,
      dialogDeletaTurma: false,
      objetoDialog: {
        'header': '',
        'action': '',
        'txt_btn': ''
      },
      selectedTurno: {},
      objetoPeriodoTurma: {
        periodo: [],
        qtd_turmas_por_periodo: {}
      },
      periodoTurmaSelected: {},
      dialogEditaPeriodoTurma: false,
      reajusteTurmasPeriodo: 1
    }
  },

  watch: {
    semestresLetivos: {
      handler (newSemestresLetivos) {
        this.atualizarSituacaoCursos(newSemestresLetivos)
      },
      immediate: true,
      deep: true
    }
  },

  async mounted () {
    this.situacaoCursos = await this.retornaSituacaoCursos(this.semestresLetivos)
  },

  methods: {
    async atualizarSituacaoCursos (semestresLetivos) {
      this.situacaoCursos = await this.retornaSituacaoCursos(semestresLetivos)
    },

    habilitarEditarTurma (turnoBase) {
      this.objetoDialog = {
        'header': 'Habilitar Turmas',
        'action': 'habilitar',
        'txt_btn': 'Salvar'
      }
      this.selectedTurnoBase = turnoBase
      this.dialogHabilitaEditaTurma = true
    },

    async doHabilitaEditaTurma () {
      let turmasPorPeriodo = this.transformObjetoPeriodoTurma()

      let objetoEnvio = {
        turno: this.selectedTurnoBase,
        vigencia: this.emVigencia(),
        curso: this.curso,
        unidade: this.unidade,
        turmas_por_periodo: turmasPorPeriodo
      }

      // mando para edição
      if (this.objetoDialog.action === 'editar') {
        try {
          await this.$http.put('semestreletivo/editaturma/' + this.selectedTurno.id, objetoEnvio)
          this.$toastr.s(
            'Turma alterada com sucesso! ', 'Sucesso!'
          )
          // Emite um evento para notificar o componente pai que as turmas foram habilitadas
          this.$emit('turmaHabilitada')

          // Atualiza os dados do componente filho
          await this.atualizarDadosLocais()

          // Fecha o diálogo
          this.dialogHabilitaEditaTurma = false
        } catch (e) {
          this.$toastr.e(
            'Erro ao excluir turmas: ' + e, 'Erro!'
          )
        }
      } else {
        // aqui eu vou criar
        try {
          await this.$http.post('semestreletivo/habilitaturma', objetoEnvio)

          this.$toastr.s(
            'Turma(s) habilitada(s) com sucesso! ', 'Sucesso!'
          )
          // Emite um evento para notificar o componente pai que as turmas foram habilitadas
          this.$emit('turmaHabilitada')

          // Atualiza os dados do componente filho
          await this.atualizarDadosLocais()

          // Fecha o diálogo
          this.dialogHabilitaEditaTurma = false
        } catch (e) {
          this.$toastr.e(
            'Erro ao habilitar turma(s): ' + e, 'Erro!'
          )
        }
      }
    },

    async doDeletaTurma () {
      try {
        await this.$http.delete('periodoturma/' + this.periodoTurmaSelected.id)

        this.$toastr.s(
          'Turma Excluída com sucesso!', 'Sucesso!'
        )
        // Emite um evento para notificar o componente pai que as turmas foram habilitadas
        this.$emit('turmaHabilitada')

        // Atualiza os dados do componente filho
        await this.atualizarDadosLocais()

        // Fecha o diálogo
        this.dialogDeletaTurma = false
      } catch (e) {
        this.$toastr.e(
          'Erro ao excluir turmas: ' + e, 'Erro!'
        )
      }
    },

    async atualizarDadosLocais () {
      // Atualiza a situação dos cursos
      this.situacaoCursos = await this.retornaSituacaoCursos(this.semestresLetivos)

      // Reseta o qtd_turmas para o valor padrão
      this.qtd_turmas = 1
      this.objetoPeriodoTurma.qtd_turmas_por_periodo = {}
    },

    excluirTurma (pt, turnoBase) {
      this.periodoTurmaSelected = pt
      this.dialogDeletaTurma = true
      this.selectedTurnoBase = turnoBase
    },

    editarTurma (turnoBase, turno) {
      this.objetoDialog = {
        'header': 'Editar Turmas',
        'action': 'editar',
        'txt_btn': 'Alterar'
      }
      this.selectedTurnoBase = turnoBase
      this.selectedTurno = turno
      this.qtd_turmas = this.selectedTurno.qtd_turmas

      this.dialogHabilitaEditaTurma = true
    },

    transformObjetoPeriodoTurma () {
      // eslint-disable-next-line camelcase
      return Object.entries(this.objetoPeriodoTurma.qtd_turmas_por_periodo).map(([periodo, qtd_turmas]) => ({
        periodo: parseInt(periodo),
        qtd_turmas: qtd_turmas
      }))
    },

    montaListaPeriodosDisponiveis (curso, turnoBase) {
      if (!this.situacaoCursos || !this.situacaoCursos.turnos) {
        return Array.from({length: curso.qtd_periodos_possiveis}, (_, i) => i + 1)
      }

      // Extrai todos os períodos existentes para o turnoBase dado
      const existingPeriods = new Set()
      this.situacaoCursos.turnos.forEach(turno => {
        if (turno.turno_parametro.id === turnoBase.id) {
          turno.periodo_turma.forEach(periodoTurma => {
            existingPeriods.add(periodoTurma.periodo)
          })
        }
      })

      // Se não existirem períodos, retorna o valor padrão qtd_periodos_possiveis
      if (existingPeriods.size === 0) {
        return Array.from({length: curso.qtd_periodos_possiveis}, (_, i) => i + 1)
      }

      // Filtra os períodos que já existem
      const availablePeriods = []
      for (let i = 1; i <= curso.qtd_periodos_possiveis; i++) {
        if (!existingPeriods.has(i)) {
          availablePeriods.push(i)
        }
      }

      return availablePeriods
    },

    editarPeriodoTurma (pt) {
      this.periodoTurmaSelected = pt
      this.dialogEditaPeriodoTurma = true
      this.reajusteTurmasPeriodo = pt.qtd_turmas_por_periodo
    },

    async doEditTurmaPeriodo () {
      let objetoParaEnvio = {}

      objetoParaEnvio['qtd_turmas_por_periodo'] = this.reajusteTurmasPeriodo

      try {
        await this.$http.put('periodoturma/' + this.periodoTurmaSelected.id, objetoParaEnvio)

        this.$toastr.s(
          'Turmas editadas com sucesso!', 'Sucesso!'
        )
        // Emite um evento para notificar o componente pai que as turmas foram habilitadas
        this.$emit('turmaHabilitada')

        // Atualiza os dados do componente filho
        await this.atualizarDadosLocais()

        // Fecha o diálogo
        this.dialogEditaPeriodoTurma = false
      } catch (e) {
        this.$toastr.e(
          'Erro ao editar turmas: ' + e, 'Erro!'
        )
      }
    }
  }
}
</script>
