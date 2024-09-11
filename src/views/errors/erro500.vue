<template>
  <v-main>

    <!--App Bar Config Area-->
    <v-app-bar
      app
      color="#6b5252"
    >

      <v-toolbar-title>{{configSis.nomeSis}}
        <v-chip class="ml-4" small> {{configSis.labelSis}}</v-chip>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn @click="retornaHome()">Voltar</v-btn>
      <v-btn @click="retornaTotem()" class="ml-3">Sair</v-btn>

    </v-app-bar>
    <br><br>
    <v-row>

      <v-col cols="6" offset="3">

        <v-alert type="error">

          <h4>Erro no servidor!</h4>

          <br>
          <v-divider></v-divider>
          <br>
          <p>Houve um erro na interpretação do seu pedido.</p>
          <p>Muito provavelmente isso ocorreu por uma falha no servidor.</p>
          <p>Reporte o Bug para a equipe de desenvolvimento.</p>

          <p>Erro: {{ mensagemErro }}</p>

        </v-alert>

      </v-col>
    </v-row>
  </v-main>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'

export default {
  name: 'erro500',
  mixins: [logoutMixin],
  components: {},
  data: vm => ({
    configSis: config,
    mensagemErro: ''
  }),
  methods: {
    retornaTotem () {
      this.$store.commit('DESLOGAR_USUARIO')
      this.$router.push({name: 'index'})
    },
    retornaHome () {
      this.$router.push({name: 'home'})
    }
  },
  computed: {
    ...mapGetters(['usuarioLogado'])
  },
  mounted () {
    this.mensagemErro = this.$route.params.error
  }
}

</script>
