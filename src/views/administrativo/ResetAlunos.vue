<template>
  <v-main
    v-if="usuarioLogado.tipo !== 'Aluno'"
    class="bgConfig">

    <BarraNavegacao/>

    <!--banner e datatable-->
    <v-container
      v-if="usuarioEstaLogado"
      class="pt-5"
      fluid>

      <!--Banner + btn add user-->
      <v-alert
        class="p-5"
        color="#015088"
        elevation="21"
      >
        <v-row>
          <!--banner-->
          <v-col
            class="white--text"
            cols="9">
            <h2>
              <v-icon
                class="mr-4"
                color="white"
                size="36">
                mdi-account-group
              </v-icon>
              Resetar Alunos
            </h2>

          </v-col>
          <v-col />
        </v-row>
      </v-alert>

      <ResetAluno/>

    </v-container>

  </v-main>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'
import BarraNavegacao from '../../components/barra-navegacao/BarraNavegacao.vue'
import ResetAluno from '../../components/areaAdministrativa/ResetAluno.vue'

export default {
  name: 'ResetAlunos',
  components: {BarraNavegacao, ResetAluno},
  mixins: [logoutMixin],
  data: () => ({
    configSis: config
  }),
  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado'])
  },
  watch: {},
  created () {
  },

  async mounted () {
    this.cospeAluno()
  },
  methods: {
    cospeAluno () {
      if (this.usuarioLogado.tipo === 'Aluno') {
        this.$store.commit('DESLOGAR_USUARIO')
        this.$router.push({name: 'index'})
      }
    }
  }
}
</script>

<style>
</style>
