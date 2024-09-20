<template>
  <div>

    <v-app-bar
      app
      color="#015088"
    >

      <v-toolbar-title><span class="white--text"><i>{{ configSis.nomeSis }}</i></span>
        <v-chip class="ml-4 mr-10" small> {{ configSis.labelSis }}</v-chip>
      </v-toolbar-title>
      <img :src="require('@/assets/img/logo-ser-branca.png')" alt="Logo Uninorte" width="150px">
      <!--home-->
      <template v-if="usuarioEstaLogado && usuarioResetado">
        <div class="text-center">
          <v-menu
            rounded="xl"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="mr-4 ml-5"
                     color="rgb(250, 115, 59)"
                     dark
                     rounded
                     to="/home"
                     v-bind="attrs"
                     v-on="on"
              >
                <v-icon small>mdi-home</v-icon>
              </v-btn>
            </template>
          </v-menu>
        </div>
      </template>

      <!--configurações básicas-->
      <template v-if="usuarioEstaLogado && usuarioResetado">
        <div class="text-center">
          <v-menu
            bottom
            offset-y
            open-on-hover
            rounded="xl"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="rgb(250, 115, 59)"
                     dark
                     rounded
                     v-bind="attrs"
                     v-on="on"
              >
                <v-icon class="mr-3" small>mdi-cogs</v-icon>
                Configurações Básicas
              </v-btn>
            </template>
            <v-list>

              <!-- gerenciamento de indicadores-->
              <v-list-item to="/admunidades">
                <v-list-item-title>
                  <v-icon class="mr-3" small>mdi-office-building</v-icon>
                  Configurações de Unidades e Cursos
                </v-list-item-title>
              </v-list-item>

              <v-list-item to="/admuser">
                <v-list-item-title>
                  <v-icon class="mr-3" small>mdi-account</v-icon>
                  Gerenciamento de Usuários
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>

      <v-spacer></v-spacer>

      <!--btn login para administradores-->
      <template v-if="!usuarioEstaLogado">
        <div class="text-center">
          <v-menu
            bottom
            offset-y
            open-on-hover
            rounded="xl"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="rgb(250, 115, 59)"
                     dark
                     rounded
                     v-bind="attrs"
                     v-on="on"
                     @click="dialogLogin = true"
              >
                <v-icon class="mr-3">mdi-account-star-outline</v-icon>
                Administração
              </v-btn>
            </template>

          </v-menu>
        </div>
      </template>

      <!-- BARRA DE NAVEGACAO LOGADO-->
      <OpcoesUsuario v-if="usuarioEstaLogado"/>

    </v-app-bar>

    <!--Dialog Login Adm -->
    <v-dialog v-model="dialogLogin" max-width="40%" persistent scrollable>
      <v-card color="#748bab" rounded="xxl">
        <!--titulo e botão fechar-->
        <v-card-title class="justify-center text-center">
          <v-row>
            <v-col cols="2"></v-col>
            <v-col class="text-5 white--text" cols="8">
              <b>Login para Administradores</b>
            </v-col>
            <v-col cols="2" class="text-right">
              <v-btn color="BLACK" icon @click="dialogLogin = false">X</v-btn>
            </v-col>
          </v-row>

        </v-card-title>

        <!-- card Text-->
        <v-card-text>

          <Login :tipo="tipo"></Login>

        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" @click="dialogLogin = false">
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>import OpcoesUsuario from './OpcoesUsuario'
import config from '../../http/config'
import {mapGetters} from 'vuex'
import Login from '../login/Login.vue'

export default {
  data: () => ({
    configSis: config,
    dialogGeneric70: false,
    selectedTypeOfContent: '',
    dialogLogin: false,
    tipo: 'Admin'
  }),

  components: {Login, OpcoesUsuario},

  computed: {
    ...mapGetters(['usuarioEstaLogado', 'usuarioLogado', 'paginaEmAtulizacao', 'usuarioResetado'])
  },

  methods: {
    openDialogAdmUser () {
      this.dialogGeneric70 = true
      this.selectedTypeOfContent = 'AdmUser'
    },
    openDialogAdmConfig () {
      this.dialogGeneric70 = true
      this.selectedTypeOfContent = 'AdmConfig'
    },
    refreshPage () {
      this.$store.commit('ATUALIZAR_CONTEUDO')
    },
    retornaTotem () {
      this.$store.commit('DESLOGAR_USUARIO')
      this.$router.push({name: 'index'})
    }
  }
}
</script>

<style>
.bgConfig {
  background-color: #ffffff !important;
}
</style>
