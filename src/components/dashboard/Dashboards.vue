<template>
  <v-row>
    <v-col>
      <v-alert elevation="12" color="green lighten-3">
        <v-row>
          <v-col v-for="(data, index) in dados" :key="data.id" cols="3">
            <v-btn :color="ajustaSelecionado(index)" class=" mr-3" @click="ajustaIndex(index)" block> {{data.nome}}</v-btn>
          </v-col>
        </v-row>

      </v-alert>

      <v-container fluid>
      <hr>
      </v-container>
      <VerDashboard :dados="dados[indexGeral]" v-if="liberadoParaVer"/>
    </v-col>
  </v-row>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import VerDashboard from './VerDashboard.vue'

export default {
  name: 'Dashboards',
  mixins: [logoutMixin],
  components: {VerDashboard},
  data: () => ({
    indexGeral: 0,
    liberadoParaVer: true
  }),
  props: {
    dados: Array
  },

  computed: {
    ...mapGetters(['usuarioLogado'])
  },

  created () {
  },

  watch: {},

  mounted () {
  },

  methods: {
    ajustaIndex (index) {
      this.liberadoParaVer = false
      this.indexGeral = index
      this.liberadoParaVer = true
    },

    ajustaSelecionado (index) {
      if (index === this.indexGeral) {
        return 'primary'
      } else {
        return 'secondary'
      }
    }
  }
}
</script>
<style>
</style>
