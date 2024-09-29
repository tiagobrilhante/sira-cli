<template>
  <v-main class="bgConfig">
    <BarraNavegacao/>

    <v-container fluid>

      <v-row>
        <v-col cols="1"/>
        <v-col> <!--Banner-->
          <v-alert
            class="p-5 rounded-xl"
            elevation="21"
          >
            <v-row>
              <v-col>
                <h2>
                  <v-icon
                    class="mr-4"
                    size="36">
                    mdi-database-export
                  </v-icon>
                  Gerenciamento de Bkups do Banco
                </h2>
              </v-col>
              <v-col class="text-right">
                <v-btn
                  :loading="loadingBackup"
                  class="primary"
                  small
                  @click="geraBkup">Gerar Backup</v-btn>
              </v-col>
            </v-row>
          </v-alert>

          <!--DataTable-->
          <v-data-table
            :headers="headers"
            :items="listabkup"
            class="elevation-21 mt-4"
            loading-text="Carregando... por favor aguarde."
          >
            <template v-slot:item.created_at="{ item }">
              {{ formataDataHora(item.created_at, 'Sim') }}
            </template>

            <!--download link-->
            <template v-slot:item.actions="{ item }">
              <!--baixar-->
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    :href="urlDownload + item.path"
                    v-bind="attrs"
                    class=""
                    color="success"
                    small
                    target="_blank"
                    v-on="on"
                  >
                    <v-icon>
                      mdi-file-download
                    </v-icon>
                  </v-btn>
                </template>
                <span>Baixar Arquivo</span>
              </v-tooltip>
            </template>

          </v-data-table>
        </v-col>
        <v-col cols="1"/>
      </v-row>

    </v-container>

  </v-main>
</template>

<script>import {mapGetters} from 'vuex'
import moment from 'moment'
import config from '../../http/config'
import BarraNavegacao from '../../components/barra-navegacao/BarraNavegacao.vue'

export default {
  components: {BarraNavegacao},
  data () {
    return {
      loadingBackup: false,
      listabkup: [],
      headers: [
        {
          text: 'rotulo',
          value: 'rotulo'
        },
        {
          text: 'Criado em:',
          value: 'created_at'
        },
        {
          text: 'Actions',
          value: 'actions',
          align: 'center',
          sortable: false
        }
      ],
      urlDownload: config.urlDownload
    }
  },
  computed: {

    ...mapGetters(['usuarioLogado'])

  },
  async mounted () {
    await this.getListaBkup()
  },
  methods: {
    async getListaBkup () {
      try {
        this.$http.get('bkupbanco')
          .then(response => {
            this.listabkup = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    async geraBkup () {
      this.loadingBackup = true
      try {
        this.$http.get('bkupbanco/gerabkupnovo')
          .then(response => {
            this.getListaBkup()
            this.loadingBackup = false
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    // utilitários

    formataDataHora (dataHora, ch) {
      if (dataHora === null) {
        return null
      } else if (dataHora[2] === '/') {
        return dataHora
      } else {
        let d = moment.tz(dataHora, 'America/Manaus')
        let dh
        if (ch === 'Sim') {
          dh = d.format('DD/MM/YYYY ( HH:mm:ss )')
        } else {
          dh = d.format('DD/MM/YYYY')
        }
        return dh
      }
    }
  }
}
</script>

<style>
.bgConfig {
  background-color: #6b5252 !important;
}
</style>
