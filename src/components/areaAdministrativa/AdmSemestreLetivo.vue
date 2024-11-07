<template>
  <v-main class="bgConfig">

    <BarraNavegacao/>

    <!--banner e datatable-->
    <v-container
      v-if="usuarioEstaLogado"
      class="pt-5"
      fluid>

      <!--Banner / seletro de semestre letivo / configurar semestre letivo-->
      <v-alert
        class="p-5"
        color="#015088"
        elevation="21"
      >
        <v-row>

          <!--banner-->
          <v-col
            class="white--text"
            cols="5">
            <h2>
              <v-icon
                class="mr-4"
                color="white"
                size="36">
                mdi-calendar-month
              </v-icon>
              Gerenciamento de Semestres Letivos
            </h2>

          </v-col>

          <!-- seletor de semestre letivo-->
          <v-col cols="2">
            <v-row dense>
              <!-- semestre letivo -1 -->
              <v-col>
                <v-btn
                  block
                  class="mt-2"
                  color="rgb(250, 115, 59)"
                  small
                  @click="ajustaSemestreVigente('previous')">
                  <v-icon color="white">mdi-chevron-left</v-icon>
                </v-btn>
              </v-col>
              <!--semestre letivo atual-->
              <v-col>
                <v-alert
                  class="text-center mt-1 pt-1 pb-1 mb-0"
                  dense
                  elevation="12">
                  <b>{{ semestreVigenteSelecionado }}</b>
                </v-alert>
              </v-col>
              <!-- semestre letivo +1-->
              <v-col>
                <v-btn
                  block
                  class="mt-2"
                  color="rgb(250, 115, 59)"
                  small
                  @click="ajustaSemestreVigente('next')">
                  <v-icon color="white">mdi-chevron-right</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-col>

          <!-- configurar semestre letivo-->
          <v-col
            class="text-right"
            cols="5">
            <v-btn
              v-if="emVigencia() === semestreVigenteSelecionado"
              class="white--text"
              color="rgb(250, 115, 59)"
              @click="openDialogConfigSemestre">
              <v-icon
                class="mr-4"
                color="white">mdi-cogs
              </v-icon>
              Configurar Semestre Letivo
            </v-btn>
          </v-col>

        </v-row>

      </v-alert>

      <!--DataTable-->
      <v-data-table
        :custom-filter="customFilter"
        :headers="headers"
        :items="unidades"
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
            <v-toolbar-title>Cursos em Vigência - {{ selectedUnidade.nome }}</v-toolbar-title>

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

          <!-- filtro de seleção por unidade-->
          <v-container fluid>
            <v-row>
              <v-col>
                <v-alert elevation="5">
                  <v-btn
                    v-for="unidade in unidadesSimples"
                    :key="unidade.id"
                    :color="corBtnSelected(unidade.id)"
                    class="white--text mr-4"
                    @click="pesquisaPorUnidade(unidade)">
                    {{ unidade.nome }}
                  </v-btn>
                </v-alert>
              </v-col>
            </v-row>
          </v-container>

        </template>

        <!--Template de turnos -->
        <template v-slot:item.turnos="{ item }">

          <ul v-if="item.turnos.length > 0">
            <li
              v-for="turno in item.turnos"
              :key="turno.id">
              {{ turno.horario }} - {{ turno.identificador_horario }}
              <ul
                v-for="pt in turno.periodo_turma"
                :key="pt.id">
                <li>{{ pt.periodo }}º Período - ( {{ pt.qtd_turmas_por_periodo }} turma<span
                  v-if="pt.qtd_turmas_por_periodo > 1">s</span> )
                </li>
              </ul>
            </li>
          </ul>
          <v-chip
            v-else
            color="yellow"
            small> Sem Trunos Cadastrados
          </v-chip>

        </template>

      </v-data-table>

      <!-- Dialog para Configurar Semestre Letivo -->
      <v-dialog
        v-if="dialogConfigSemestreLetivo"
        v-model="dialogConfigSemestreLetivo"
        max-width="70%">
        <v-card>
          <v-card-title
            class="justify-center"
            primary-title>
            Configuração de Semestre Letivo - {{ emVigencia() }}
          </v-card-title>
          <v-card-text>
            <h2>Unidade: {{ selectedUnidade.nome }}</h2>
            <br>
            <v-alert
              v-for="curso in retornoCursosExistentes"
              :key="curso.id"
              class="white--text"
              color="#015088"
              elevation="5"
            >
              <v-row align="center">
                <v-col>
                  <h3>{{ curso.nome }}</h3>
                </v-col>
                <v-col class="text-right">
                  <v-btn
                    :color="expandedCursoId === curso.id ? 'primary' : 'grey'"
                    icon
                    @click="toggleCurso(curso.id)"
                  >
                    <v-icon>{{ expandedCursoId === curso.id ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <v-expand-transition>
                <div v-show="expandedCursoId === curso.id">
                  <hr>
                  <AsyncSituacaoCursos
                    :key="asyncComponentKey"
                    :curso="curso"
                    :em-vigencia="emVigencia"
                    :retorna-situacao-cursos="retornaSituacaoCursos"
                    :semestres-letivos="curso.semestres_letivos"
                    :turno-parametro="turnoParametro"
                    :unidade="selectedUnidade"
                    @turmaHabilitada="handleTurmaHabilitada"
                  />
                </div>
              </v-expand-transition>
            </v-alert>

            <v-alert
              v-if="retornoCursosExistentes.length === 0"
              class="white--text"
              color="#015088"
              elevation="5">
              Não existem cursos cadastrados nessa unidade.
            </v-alert>
          </v-card-text>
          <v-card-actions class="pb-5">
            <v-row>
              <v-col class="text-right mr-4">
                <v-btn
                  class="white--text"
                  color="rgb(250, 115, 59)"
                  @click="dialogConfigSemestreLetivo = false">
                  Fechar
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>

    <v-container
      v-else
      class="pt-5"
      fluid>
      <v-alert type="error">
        Você não tem permissão para estar aqui!
      </v-alert>
    </v-container>

  </v-main>

</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'
import BarraNavegacao from '../barra-navegacao/BarraNavegacao.vue'
import AsyncSituacaoCursos from './AsyncSituacaoCursos.vue'

export default {
  components: {BarraNavegacao, AsyncSituacaoCursos},
  mixins: [logoutMixin],
  data: () => ({
    configSis: config,
    // options de select
    unidades: [],
    // fim options select
    search: '',
    headers: [
      {
        text: 'Curso',
        align: 'start',
        value: 'nome',
        search: true
      },
      {
        text: 'turnos',
        align: 'start',
        value: 'turnos',
        search: true
      }
    ],
    defaultUnidade: {
      'nome': '',
      'prefixo': ''
    },
    editedUnidade: {
      'id': '',
      'nome': '',
      'prefixo': ''
    },
    selectedUnidade: {
      'id': '',
      'nome': '',
      'prefixo': ''
    },
    dialogConfigSemestreLetivo: false,
    editedIndex: -1,
    semestreVigenteSelecionado: '',
    unidadesSimples: [],
    retornoCursosExistentes: [],
    turnoParametro: [],
    asyncComponentKey: 0,
    expandedCursoId: null // ID do curso expandido
  }),
  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado']),

    corBtnSelected () {
      return (unidadeId) => {
        return this.selectedUnidade.id === unidadeId ? '#015088' : 'rgb(250, 115, 59)'
      }
    }
  },
  watch: {},
  async mounted () {
    await this.getListaUnidades()
    await this.getTurnoParametro()
    this.semestreVigenteSelecionado = this.emVigencia()
  },
  methods: {

    async getListaUnidades () {
      try {
        this.$http.get('unidades/listasimples')
          .then(response => {
            this.unidadesSimples = response.data
            this.selectedUnidade = this.unidadesSimples[0]
            let objetoPesquisa = {}
            objetoPesquisa['unidade_id'] = this.selectedUnidade.id
            objetoPesquisa['semestreSelecionado'] = this.semestreVigenteSelecionado
            this.getCursosVigentes(objetoPesquisa)
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    async getCursosVigentes (objetoPesquisa) {
      try {
        this.$http.post('semestreletivo/vigentecurso', objetoPesquisa)
          .then(response => {
            this.unidades = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    async getTurnoParametro () {
      try {
        this.$http.get('turnoparametro')
          .then(response => {
            this.turnoParametro = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
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

    ajustaSemestreVigente (direction) {
      // Pega o ano e o semestre vigentes
      let [year, semester] = this.semestreVigenteSelecionado.split('.').map(Number)

      if (direction === 'previous') {
        // Se o semestre for 1, voltamos para o semestre 2 do ano anterior
        if (semester === 1) {
          semester = 2
          year -= 1
        } else {
          // Caso contrário, simplesmente voltamos para o semestre anterior
          semester = 1
        }
      } else if (direction === 'next') {
        // Se o semestre for 2, avançamos para o semestre 1 do próximo ano
        if (semester === 2) {
          semester = 1
          year += 1
        } else {
          // Caso contrário, simplesmente avançamos para o próximo semestre
          semester = 2
        }
      }

      // Atualiza o SemestreVigenteSelecionado no formato "aa.s"
      this.semestreVigenteSelecionado = year.toString().padStart(2, '0') + '.' + semester

      // realizo a pesquisa com base nas atualizações existentes no dom
      let objetoPesquisa = {}
      objetoPesquisa['unidade_id'] = this.selectedUnidade.id
      objetoPesquisa['semestreSelecionado'] = this.semestreVigenteSelecionado
      this.getCursosVigentes(objetoPesquisa)
    },

    pesquisaPorUnidade (unidade) {
      this.selectedUnidade = unidade
      let objetoPesquisa = {}
      objetoPesquisa['unidade_id'] = this.selectedUnidade.id
      objetoPesquisa['semestreSelecionado'] = this.semestreVigenteSelecionado
      this.getCursosVigentes(objetoPesquisa)
    },

    customFilter (value, search, item) {
      if (!search) return true

      // Verifica se o nome da unidade ou prefixo corresponde à busca
      const inUnidadeNome = item.nome.toLowerCase().includes(search.toLowerCase())
      const inUnidadePrefixo = item.prefixo.toLowerCase().includes(search.toLowerCase())

      // Verifica se algum dos cursos corresponde à busca
      const inCursos = item.cursos.some(curso => curso.nome.toLowerCase().includes(search.toLowerCase()))

      // Retorna true se qualquer uma das condições acima for verdadeira
      return inUnidadeNome || inUnidadePrefixo || inCursos
    },

    openDialogConfigSemestre () {
      this.$http.get('semestreletivo/cursolista/' + this.selectedUnidade.id)
        .then(response => {
          this.retornoCursosExistentes = response.data
          this.dialogConfigSemestreLetivo = true

          // Incrementa a key para garantir a re-renderização
          this.asyncComponentKey += 1
        })
        .catch(erro => console.log(erro))
    },

    async retornaSituacaoCursos (semestreLetivo) {
      if (semestreLetivo.length === 0) {
        return 'Sem cursos vigentes'
      } else {
        let contaVigencia = 0
        let vigenciaOk = {}

        for (let i = 0; i < semestreLetivo.length; i++) {
          if (semestreLetivo[i].codigo === this.emVigencia()) {
            vigenciaOk = semestreLetivo[i]
            contaVigencia++
          }
        }

        if (contaVigencia === 0) {
          return 'Sem cursos vigentes'
        } else {
          try {
            const response = await this.$http.get('semestreletivo/turnos/' + vigenciaOk.id)
            return response.data
          } catch (erro) {
            console.log(erro)
            return 'Erro ao carregar dados'
          }
        }
      }
    },

    recarregarCursos () {
      let objetoPesquisa = {
        unidade_id: this.selectedUnidade.id,
        semestreSelecionado: this.semestreVigenteSelecionado
      }
      this.getCursosVigentes(objetoPesquisa)

      // Incrementa a key para forçar a re-renderização do componente filho
      this.asyncComponentKey += 1
    },
    async handleTurmaHabilitada () {
      // Atualiza os cursos vigentes
      let objetoPesquisa = {
        unidade_id: this.selectedUnidade.id,
        semestreSelecionado: this.semestreVigenteSelecionado
      }
      await this.getCursosVigentes(objetoPesquisa)

      // Atualiza a lista de cursos existentes
      await this.atualizarCursosExistentes()

      // Força a re-renderização do componente filho
      this.asyncComponentKey += 1
    },

    async atualizarCursosExistentes () {
      try {
        const response = await this.$http.get('semestreletivo/cursolista/' + this.selectedUnidade.id)
        this.retornoCursosExistentes = response.data
      } catch (erro) {
        console.error('Erro ao atualizar cursos existentes:', erro)
      }
    },

    toggleCurso (cursoId) {
      this.expandedCursoId = this.expandedCursoId === cursoId ? null : cursoId
    }

  }
}
</script>

<style>
</style>
