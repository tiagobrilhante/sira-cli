<template>
  <v-alert
    elevation="12"
    rounded="xxl">

    <!-- pesquisa matricula-->
    <v-row v-if="mostraPesquisaMatricula">
      <v-col cols="11">
        <span class="pl-3">Digite sua Matricula</span>
        <v-text-field
          v-model="matricula"
          dense
          label="Matricula"
          rounded
          solo
          @keydown.enter="pesquisaMatricula"
        />
      </v-col>
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

    <v-alert
      v-if="showCadastro"
      rounded="xxl"
      elevation="5">
      <Cadastro/>
    </v-alert>

    o usuário digita a matricula, se ela existir, será convidado a inserir a senha<br>
    caso contrário, será aberto o formulário de auto-cadastro e logo a baixo já vai aparecer o form de inserir dados
  </v-alert>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'
import Cadastro from '../cadastro/Cadastro.vue'

export default {
  components: {Cadastro},
  mixins: [logoutMixin],
  data: () => ({
    configSis: config,
    users: [],
    matricula: '',
    returnErrorMatricula: false,
    mostraPesquisaMatricula: true,
    showCadastro: false
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

    pesquisaMatricula () {
      let objetoparaEnvio = {}
      objetoparaEnvio['matricula'] = this.matricula

      try {
        this.$http.post('pesquisamatricula', objetoparaEnvio)
          .then(response => {
            console.log(response.data)
            this.mostraPesquisaMatricula = false

            if (response.data === 'Matrícula não encontrada.') {
              this.returnErrorMatricula = true
              this.matricula = ''
            } else {
              this.returnErrorMatricula = false
            }
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    tentaNovamentePesquisaMatricula () {
      this.returnErrorMatricula = false
      this.mostraPesquisaMatricula = true
      this.matricula = ''
    },

    openCompenentCadastro () {
      this.returnErrorMatricula = false
      console.log('oi')
      this.showCadastro = true
    }
  }
}

</script>
<style>

</style>
