<template>
  <v-container fluid>
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
        <span class="pl-3">Matricula (Obrigatório)</span>
        <v-text-field
          v-model="editedUser.matricula"
          dense
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

    <!-- seletor de cursos-->
    <v-alert
      elevation="5"
      rounded="xxl">
      <v-row>
        <v-col>
          <span class="pl-3">Cursos (Obrigatório)</span>
          <v-select
            v-model="editedUser.cursos"
            :items="transformedCursosOptions"
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
          />

          <v-alert
            class="white--text"
            color="rgb(250, 115, 59)"
            dismissible
            elevation="5"
            rounded="xxl">
            Caso o seu curso não apareça como opção disponível para seleção, entre em contato com o coordenador do mesmo
            para a abertura de semestre letivo.
          </v-alert>

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
              <v-col>
                <span>Período (Obrigatório)</span>
                <v-select
                  v-model="curso.periodo"
                  :items="getPeriodosOuTurmasPossiveis(curso, 'periodo')"
                  dense
                  hide-details
                  item-text="displayName"
                  item-value="id"
                  label="Informe o seu período"
                  rounded
                  solo
                />
              </v-col>
              <v-col>
                <span>Turno (Obrigatório)</span>
                <v-select
                  v-model="curso.turno"
                  :items="getPeriodosOuTurmasPossiveis(curso, 'turnos')"
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
              <v-col v-if="curso.turno && curso.turno.qtd_turmas > 1">
                <span>Turma (Obrigatório)</span>
                <v-select
                  v-model="curso.turma"
                  :items="getPeriodosOuTurmasPossiveis(curso.turno, 'turma')"
                  dense
                  hide-details
                  label="Informe a sua turma"
                  rounded
                  solo
                />
              </v-col>
            </v-row>

            {{ curso }}

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
          rounded>
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
          rounded>
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
  data: () => ({
    configSis: config,
    defaultUser: {
      'nome': '',
      'matricula': '',
      'telefone': '',
      'email': '',
      'tipo': '',
      'cursos': [],
      'reset': false
    },
    editedUser: {
      'nome': '',
      'matricula': '',
      'telefone': '',
      'email': '',
      'tipo': '',
      'cursos': [],
      'reset': false
    },
    cursosOptions: []
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

  watch: {},

  async mounted () {
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
    }
  }
}

</script>
<style>

</style>
