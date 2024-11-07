<template>
  <v-alert
    elevation="12"
    rounded="xxl">

    <!-- pesquisa matricula-->
    <v-row v-if="mostraPesquisaMatricula && !usuarioEstaLogado">
      <v-col cols="11">
        <span class="pl-3">Digite sua Matricula</span>
        <v-text-field
          v-mask="'########'"
          ref="matriculaField"
          v-model="matricula"
          :rules="[v => /^\d{8}$/.test(v) || 'A matrícula deve conter exatamente 8 dígitos']"
          dense
          label="Matricula"
          maxlength="8"
          rounded
          solo
          @keydown.enter="pesquisaMatricula"
        />
      </v-col>

      <!-- btn para pesquisar-->
      <v-col cols="1">
        <v-btn
          class="mt-5"
          color="#015088"
          large
          rounded
          @click="pesquisaMatricula">
          <v-icon color="white">mdi-magnify</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- tente novamente ou cadastre-se-->
    <v-alert
      v-if="returnErrorMatricula && matricula === ''"
      rounded="xxl"
      type="error">
      <v-row>
        <v-col>Matricula não encontrada.</v-col>
        <v-col class="text-right">
          <v-btn
            class="mr-3"
            color="#015088"
            rounded
            small
            @click="tentaNovamentePesquisaMatricula">Tente novamente
          </v-btn>
          <v-btn
            color="#015088"
            rounded
            small
            @click="openCompenentCadastro">Cadastre-se
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>

    <Cadastro
      v-if="showCadastro"
      :matricula="matriculaPraCadastro"
      @cancela-cadastro="cancelaCadastro"/>

    <!-- digita a senha se tem uma matricula no retorno-->
    <v-row v-if="showInputSenha">
      <v-col><h1 class="pt-7"><b>Matricula: </b> {{ matricula }}</h1></v-col>
      <v-col>
        <span class="pl-3">Digite sua Senha</span>
        <v-text-field
          ref="passwordField"
          v-model="password"
          dense
          label="Senha"
          type="password"
          rounded
          solo
          @keydown.enter="fazLogin"
        />
      </v-col>
    </v-row>

    <FormularioAtendimento
      v-if="usuarioEstaLogado"
      @countdown-finished="onCountdownFinished"/>
  </v-alert>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'
import Cadastro from '../cadastro/Cadastro.vue'
import FormularioAtendimento from './FormularioAtendimento.vue'
import {nextTick} from 'vue'

export default {
  components: {FormularioAtendimento, Cadastro},
  mixins: [logoutMixin],
  data: () => ({
    configSis: config,
    users: [],
    matricula: '',
    password: '',
    returnErrorMatricula: false,
    mostraPesquisaMatricula: true,
    showCadastro: false,
    showInputSenha: false,
    matriculaPraCadastro: '',
    msgErroMatricula: []
  }),
  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado'])
  },

  watch: {
    // Sempre que o componente é exibido, limpa a matrícula
    mostraPesquisaMatricula (val) {
      if (val) {
        this.matricula = ''
      }
    }
  },

  async mounted () {
    this.$nextTick(() => {
      this.$refs.matriculaField.focus()
    })

    this.$root.$on('reset-matricula', this.tentaNovamentePesquisaMatricula)
  },

  beforeDestroy () {
    // Certificando-se de remover o listener quando o componente for destruído
    this.$root.$off('reset-matricula', this.tentaNovamentePesquisaMatricula)
  },

  methods: {

    async getUsers () {
      try {
        this.$http.get('users/adm')
          .then(response => {
            this.usuarios = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    async pesquisaMatricula () {
      if (this.validaMatricula(this.matricula)) {
        let objetoparaEnvio = {}
        objetoparaEnvio['matricula'] = this.matricula

        try {
          const response = await this.$http.post('pesquisamatricula', objetoparaEnvio)
          this.mostraPesquisaMatricula = false

          if (response.data === 'Matrícula não encontrada.') {
            this.returnErrorMatricula = true
            this.matriculaPraCadastro = this.matricula
            this.matricula = ''
            this.showInputSenha = false
          } else {
            this.returnErrorMatricula = false
            this.showInputSenha = true
            await nextTick()
            this.$refs.passwordField.focus()
          }
        } catch (e) {
          console.log(e)
        }
      }
    },

    tentaNovamentePesquisaMatricula () {
      this.returnErrorMatricula = false
      this.mostraPesquisaMatricula = true
      this.matricula = ''
    },

    openCompenentCadastro () {
      this.returnErrorMatricula = false
      this.showCadastro = true
    },

    cancelaCadastro () {
      this.showCadastro = false
      this.mostraPesquisaMatricula = true
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

    validaMatricula (matricula) {
      this.msgErroMatricula = []
      if (matricula === '') {
        this.msgErroMatricula.push('<li>O campo matricula não pode ser vazio.</li>')
      }
      if (matricula.length !== 8) {
        this.msgErroMatricula.push('<li>O campo matricula deve possuir 8 digitos. </li>')
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

    fazLogin () {
      this.$store.dispatch('efetuarLogin', {
        matricula: this.matricula,
        password: this.password
      }).then(response => {
        if (response.user.reset) {
          this.$router.push({name: 'reset'})
        } else {
          if (this.usuarioEstaLogado) {
            this.$toastr.Add({
              title: 'Sucesso!',
              msg: 'Login efetuado com sucesso!',
              type: 'success',
              timeout: 5000
            })
            this.showInputSenha = false
            this.mostraPesquisaMatricula = false
          } else {
            this.$toastr.Add({
              title: 'Erro!',
              msg: 'Matrícula ou senha inválida!',
              type: 'error',
              timeout: 5000
            })
          }
        }
      })
    },

    onCountdownFinished () {
      this.$emit('close-and-reset')
    }
  }
}

</script>
<style>
.toastr-grande {
  min-width: 550px; /* Aumenta o tamanho apenas para este toastr */
  max-width: 700px;
  font-size: 18px;
}
</style>
