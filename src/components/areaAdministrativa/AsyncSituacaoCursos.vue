<template>
  <div>
    <span v-if="situacaoCursos && situacaoCursos !== 'Sem cursos vigentes'">
      <v-alert
        v-for="turnoBase in turnoParametro"
        :key="turnoBase.id"
        elevation="5">
        {{ turnoBase.horario }} - ({{ turnoBase.identificador_horario }}) <br><br>

        <!-- Verifica se existe pelo menos um turno correspondente -->
        <template
          v-if="situacaoCursos.turnos && situacaoCursos.turnos.some(turno => turno.turno_parametro.id === turnoBase.id)">
          <v-alert
            v-for="turno in situacaoCursos.turnos"
            v-if="turno.turno_parametro.id === turnoBase.id"
            :key="turno.id"
            elevation="5">
            <v-row>
              <v-col>
                <b>Quantidade de turmas: </b> {{ turno.qtd_turmas }}
              </v-col>

              <v-col class="text-right">
                <!--editar-->
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      class="mb-0 white--text"
                      color="rgb(250, 115, 59)"
                      small
                      @click="editarTurma(turnoBase, turno)">
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
                      color="rgb(250, 115, 59)"
                      small
                      @click="excluirTurma(turnoBase)">
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
        </template>

        <!-- Caso não haja nenhum turno correspondente, exibe o alerta de "Sem turmas" -->
        <v-alert
          v-else
          elevation="5">
          <v-row>
            <v-col class="pt-4"><b>Sem turmas</b></v-col>
            <v-col class="text-right"><v-btn
              class="mb-0 white--text"
              color="rgb(250, 115, 59)"
              small
              @click="habilitarEditarTurma(turnoBase)">Abrir Turmas</v-btn></v-col>
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
        {{ turnoBase.horario }} - ({{ turnoBase.identificador_horario }}) <br><br>

        <v-alert elevation="5">
          <v-row>
            <v-col><b>Sem turmas</b></v-col>
            <v-col class="text-right"><v-btn
              class="mb-0 white--text"
              color="rgb(250, 115, 59)"
              small
              @click="habilitarEditarTurma(turnoBase)">Abrir Turmas</v-btn></v-col>
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
          <v-row desne>
            <v-col><b>Unidade:</b> {{ unidade.nome }}</v-col>
            <v-col><b>Curso:</b> {{ curso.nome }}</v-col>
          </v-row>
          <v-row dense>
            <v-col><b>Vigência:</b> {{ emVigencia() }}</v-col>
            <v-col><b>Horário: </b>{{ selectedTurnoBase.horario }}</v-col>
          </v-row>
          <v-row class="mt-10">
            <v-col>
              <v-slider
                v-model="qtd_turmas"
                class="align-center"
                dense
                label="Quantidade de Turmas"
                max="15"
                min="1"
                rounded
                solo
                thumb-color="#015088"
                thumb-label="always"
              >
                <template v-slot:append>
                  <v-text-field
                    v-model="qtd_turmas"
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
                <span>Todas as turmas serão excluídas!</span>
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
      selectedTurno: {}
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
      let objetoEnvio = {
        turno: this.selectedTurnoBase,
        vigencia: this.emVigencia(),
        curso: this.curso,
        unidade: this.unidade,
        qtd_turmas: this.qtd_turmas
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
      let objetoEnvio = {
        vigencia: this.emVigencia(),
        curso: this.curso,
        unidade: this.unidade,
        turno: this.selectedTurnoBase
      }

      try {
        await this.$http.post('semestreletivo/deletaturma', objetoEnvio)

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
    },

    excluirTurma (turnoBase) {
      this.selectedTurnoBase = turnoBase
      this.dialogDeletaTurma = true
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
    }
  }
}
</script>
