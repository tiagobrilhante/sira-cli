<template>
  <v-main class="bgConfig">
    <BarraNavegacao></BarraNavegacao>

    <v-container fluid>

      <v-row>

        <!--espaço-->
        <v-col cols="1"></v-col>

        <!--configurações  de conteúdo para assuntos e imagens-->
        <v-col>

          <!--Configurações de conteúdo para assuntos e imagens-->
          <v-alert color="rgb(255,255,255,0.4)" rounded="xl">

            <!--Cabeçalho -->
            <v-row class="mb-3">

              <v-col align-self="center">
                <h3>Histórico do Sistema</h3>
              </v-col>

            </v-row>

            <v-divider></v-divider>

            <!--DataTable-->
            <v-data-table
              :headers="headers"
              :items="historicos"
              :search="search"
              class="elevation-21 mt-4"
              sort-by="id"
              dense
              :sort-desc="true"
              :calculate-widths="true"
            >

              <!--template do topo da tabela-->
              <template v-slot:top>
                <v-toolbar
                  flat
                >
                  <v-toolbar-title>Tabela de Histórico Cadastrado</v-toolbar-title>

                  <v-divider
                    class="mx-4"
                    inset
                    vertical
                  ></v-divider>

                  <v-spacer></v-spacer>

                  <!--Pesquisar-->
                  <v-text-field
                    append-icon="mdi-magnify"
                    hide-details
                    label="Pesquisar"
                    placeholder="Pesquisar"
                    single-line
                    v-model="search"
                  ></v-text-field>

                </v-toolbar>

              </template>

              <!--Template de datas -->
              <template v-slot:item.evento="{ item }">

                <div v-html="item.evento"></div>

              </template>

              <!--Template de datas -->
              <template v-slot:item.created_at="{ item }">

                {{ converterDataParaFormatoBrasileiro(item.created_at) }}

              </template>

            </v-data-table>

          </v-alert>

        </v-col>

        <!--espaço-->
        <v-col cols="1"></v-col>

      </v-row>
    </v-container>

  </v-main>
</template>

<script>import config from '../../http/config'
import BarraNavegacao from '../../components/barra-navegacao/BarraNavegacao.vue'
import {mapGetters} from 'vuex'

export default {
  name: 'historico',
  components: {BarraNavegacao},
  data: vm => ({
    configSis: config,
    historicos: [],
    headers: [
      {
        text: 'Evento',
        align: 'start',
        value: 'evento'
      },
      {
        text: 'Responsável',
        align: 'start',
        value: 'responsavel'
      },
      {
        text: 'Data',
        align: 'start',
        value: 'created_at'
      }
    ],
    search: ''
  }),
  computed: {
    ...mapGetters(['usuarioLogado'])
  },
  watch: {},
  async mounted () {
    await this.getHistoricos()
  },
  methods: {
    async getHistoricos () {
      try {
        this.$http.get('historico')
          .then(response => {
            this.historicos = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    converterDataParaFormatoBrasileiro (dataIso) {
      const data = new Date(dataIso)
      const dia = String(data.getDate()).padStart(2, '0')
      const mes = String(data.getMonth() + 1).padStart(2, '0')
      const ano = String(data.getFullYear())
      const hora = String(data.getHours()).padStart(2, '0')
      const minutos = String(data.getMinutes()).padStart(2, '0')
      const segundos = String(data.getSeconds()).padStart(2, '0')
      return `${dia}/${mes}/${ano} ${hora}:${minutos}:${segundos}`
    }
  }
}
</script>
<style>
.bgConfig {
  background-color: #6b5252 !important;
}
</style>
