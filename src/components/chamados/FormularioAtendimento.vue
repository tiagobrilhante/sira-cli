<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-alert
          elevation="12"
          rounded="xxl">

          <h3>Dados do Aluno</h3>
          <v-alert
            dense
            class="white--text"
            elevation="5"
            color="#015088">
            <!-- nome e matricula-->
            <v-row dense>
              <v-col><b>Nome: </b>{{ usuarioLogado.nome }}</v-col>
              <v-col><b>Matricula: </b>{{ usuarioLogado.matricula }}</v-col>
            </v-row>

            <!-- telefone e email-->
            <v-row dense>
              <v-col><b>Telefone </b>{{ usuarioLogado.telefone }}</v-col>
              <v-col><b>Email </b>{{ usuarioLogado.email }}</v-col>
            </v-row>
          </v-alert>

          <v-alert
            dense
            class="white--text"
            elevation="5"
            color="rgb(250, 115, 59)">
            <v-row>
              <v-col>
                Selecione para qual curso deseja solicitar o atendimento.
              </v-col>
            </v-row>

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

          <v-alert
            v-if="turmaCursoGroup"
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

      </v-alert></v-col>
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
    turmaCursoGroup: null,
    arrayTurmaCurso: [],
    descricao: '',
    password: ''
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
      for (let i = 0; i < this.usuarioLogado.aluno_vinculos.length; i++) {
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
    },

    getCurrentDateTime () {
      const now = new Date()
      const date = now.toLocaleDateString() // Format: MM/DD/YYYY
      const time = now.toLocaleTimeString() // Format: HH:MM:SS AM/PM
      return `${date} ${time}`
    },

    sendSolicitacaoToServer () {
      console.log('do it')
    }
  }
}

</script>
<style>
</style>
