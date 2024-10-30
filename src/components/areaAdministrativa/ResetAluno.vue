<template>

  <v-row>
    <v-col>
      <v-alert elevation="15">
        <v-row>
          <v-col cols="4">
            <h3 class="pt-2">
              Digite a matrícula do aluno:
            </h3>
          </v-col>
          <v-col>
            <v-text-field
              v-mask="'#########'"
              v-model="matricula"
              :rules="[v => /^\d{9}$/.test(v) || 'A matrícula deve conter exatamente 9 dígitos']"
              dense
              hide-details
              label="Matricula"
              maxlength="9"
              rounded
              solo
              @keydown.enter="pesquisaMatricula"
            />
          </v-col>
          <v-col cols="1">
            <v-btn
              elevation="5"
              rounded
              color="rgb(250, 115, 59)"
              @click="pesquisaMatricula">
              <v-icon class="white--text">mdi-magnify</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-alert>

      <v-alert
        v-if="showInfo"
        elevation="10"
        class="white--text"
        color="#015088">

        <v-row>
          <v-col>
            <h1><b>Nome: </b> {{ selectedAluno.nome }}</h1>
          </v-col>
          <v-col>
            <v-btn
              block
              x-large
              elevation="5"
              rounded
              color="error"
              @click="dialogReset = true">
              Resetar Senha
          </v-btn></v-col>
        </v-row>
      </v-alert>

      <!--Dialog para resetar usuário -->
      <v-dialog
        v-model="dialogReset"
        max-width="60%">
        <v-card>

          <!-- title-->
          <v-card-title
            class="justify-center"
            primary-title>
            <v-icon
              class="mr-4">
              fa fa-exclamation-triangle
            </v-icon>
            Você tem certeza que quer resetar a senha do Aluno {{ selectedAluno.nome }}?
            <v-icon
              class="ml-4">
              fa fa-exclamation-triangle
            </v-icon>

          </v-card-title>

          <v-card-text>

            <v-row>
              <v-col class="text-center">
                <p>A nova senha (temporária), será a matricula do Aluno.</p>
              </v-col>

            </v-row>
          </v-card-text>

          <!-- actions-->
          <v-card-actions class="pb-5">
            <v-spacer/>
            <v-btn
              rounded
              color="grey lighten-1"
              @click="dialogReset = false">Cancelar
            </v-btn>
            <span class="pl-5 pr-5"/>
            <v-btn
              rounded
              color="red lighten-1"
              @click="resetUserConfirm">Resetar
            </v-btn>
            <v-spacer/>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-col>
  </v-row>

</template>

<script>
import { logoutMixin } from '@/mixins'
import { mapGetters } from 'vuex'
import config from '../../http/config'

export default {
  name: 'VerChamado',
  components: {},
  mixins: [logoutMixin],
  props: {},
  data: () => ({
    configSis: config,
    matricula: '',
    msgErroMatricula: [],
    showInfo: false,
    selectedAluno: {},
    dialogReset: false
  }),

  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado'])
  },

  watch: {
  },

  async mounted () {
  },

  methods: {
    validaMatricula (matricula) {
      this.msgErroMatricula = []
      if (matricula === '') {
        this.msgErroMatricula.push('<li>O campo matricula não pode ser vazio.</li>')
      }
      if (matricula.length !== 9) {
        this.msgErroMatricula.push('<li>O campo matricula deve possuir 9 digitos. </li>')
      }
      // Verifica se contém apenas dígitos de 0 a 9
      if (!/^\d+$/.test(matricula)) {
        this.msgErroMatricula.push('<li>O campo matricula deve conter apenas dígitos de 0 a 9.</li>')
      }

      if (this.msgErroMatricula.length > 0) {
        let msgretorno = '<ul>'
        for (let i = 0; i < this.msgErroMatricula.length; i++) {
          msgretorno += this.msgErroMatricula[i]
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

    async pesquisaMatricula () {
      this.showInfo = false
      if (this.validaMatricula(this.matricula)) {
        let objetoparaEnvio = {}
        objetoparaEnvio['matricula'] = this.matricula

        try {
          const response = await this.$http.post('pesquisamatricula', objetoparaEnvio)
          if (response.data === 'Matrícula não encontrada.') {
            this.returnErrorMatricula = true
            this.matricula = ''
            this.mostrarToastrPersonalizado(response.data)
          } else {
            this.returnErrorMatricula = false
            this.showInfo = true
            this.selectedAluno = response.data
            this.matricula = ''
          }
        } catch (e) {
          console.log(e)
        }
      }
    },

    resetUserConfirm () {
      let objetoParaEnvio = {}
      objetoParaEnvio['id'] = this.selectedAluno.id
      try {
        this.$http.post('users/reset', objetoParaEnvio)
          .then(() => {
            this.dialogReset = false
            this.$toastr.s(
              'Senha do Aluno resetada com sucesso', 'Sucesso!'
            )
            this.returnErrorMatricula = false
            this.showInfo = false
            this.selectedAluno = {}
            this.matricula = ''
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        this.$toastr.e(
          'Houve um erro na tentativa de execução: <br>' + e, 'Erro!'
        )
      }
    }
  }
}
</script>

<style>
</style>
