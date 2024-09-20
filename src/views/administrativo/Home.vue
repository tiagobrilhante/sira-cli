<template>
  <v-main class="bgConfig">

    <!--Barra de navegação da área administrativa-->
    <BarraNavegacao></BarraNavegacao>

    <!-- container básico-->
    <v-container class="mb-0" fluid>
      <!-- Banner-->
      <v-row>

        <v-col>
          <!--Banner-->
          <v-alert
            class="p-5"
            color="#015088"
            elevation="21"
          >

            <v-row>
              <!--cabecalho-->
              <v-col>
                <h2 class="white--text">
                  <v-icon
                    class="mr-4 white--text"
                    size="36">
                    mdi-list-box
                  </v-icon>
                  Controle de Registros de Atendimentos
                </h2>
              </v-col>

            </v-row>

          </v-alert>

        </v-col>

      </v-row>
      <!-- seletor de unidades-->
      <v-row>

        <v-col>
          <!--Banner-->
          <v-alert
            class="p-5"
            color="#015088"
            elevation="21"
          >

            <v-row>
              <!--cabecalho-->
              <v-col>
                <h2 class="white--text">
                  Seleção de unidades
                </h2>
              </v-col>

            </v-row>

          </v-alert>

        </v-col>

      </v-row>

      <!-- seletor de CURSOS-->
      <v-row>

        <v-col>
          <!--Banner-->
          <v-alert
            class="p-5"
            color="#015088"
            elevation="21"
          >

            <v-row>
              <!--cabecalho-->
              <v-col>
                <h2 class="white--text">
                  Seleção de CURSOS
                </h2>
              </v-col>

            </v-row>

          </v-alert>

        </v-col>

      </v-row>

      <!-- Seletor de aberto fechado-->
      <v-row>

        <v-col>
          <!--Banner-->
          <v-alert
            class="p-5"
            color="#015088"
            elevation="21"
          >

            <v-row>
              <!--cabecalho-->
              <v-col>
                <h2 class="white--text">
                  Seleção de aberto fechado
                </h2>
              </v-col>

            </v-row>

          </v-alert>

        </v-col>

      </v-row>

      <!-- dados tabelares-->
      <v-row>

        <v-col>
          <!--Banner-->
          <v-alert
            class="p-5"
            color="#015088"
            elevation="21"
          >

            <v-row>
              <!--cabecalho-->
              <v-col>
                <h2 class="white--text">
                  Dados Tabelares
                </h2>
              </v-col>

            </v-row>

          </v-alert>

        </v-col>

      </v-row>

    </v-container>
  </v-main>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'
// import moment from 'moment-timezone'
import BarraNavegacao from '../../components/barra-navegacao/BarraNavegacao.vue'

export default {
  name: 'home',
  mixins: [logoutMixin],
  components: {BarraNavegacao},
  data: () => ({
    configSis: config
  }),
  computed: {
    ...mapGetters(['usuarioLogado'])
  },
  created () {
  },
  watch: {},

  mounted () {
  },
  methods: {}
}
</script>

<style>

.bgConfig {
  background-color: #ffffff !important;
}
</style>
