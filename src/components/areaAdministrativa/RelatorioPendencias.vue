<template>
  <v-row dense>
    <v-col>
      <v-alert elevation="12">
        <h3>Relatório de Pendências</h3>
        <v-alert class="text-justify" color="red lighten-3">

          <!-- mes e ano limite-->
          <v-row dense>

            <!-- mes limite-->
            <v-col>
              <span class="pl-3">Mês Limite</span>
              <v-select
                v-model="mesLimite"
                :items="mesOptions"
                dense
                label="Selecione o mês de limite"
                name="mesLimite"
                rounded
                solo
              ></v-select>

            </v-col>

            <!-- ano -->
            <v-col>
              <span class="pl-3">Ano de Verificação</span>
              <v-text-field
                v-model="ano_verifica_fim"
                :rules="anoRules()"
                dense
                label="Ano de Verificação"
                maxlength="4"
                rounded
                solo
                type="text"
                @input="filtraAno($event)"
              ></v-text-field>
            </v-col>

          </v-row>

          <v-row v-if="ano_verifica_fim && mesLimite" class="mt-0" dense>
            <v-col>
              <v-btn block class="secondary" rounded @click="fazPesquisa">Realizar Busca</v-btn>
            </v-col>
          </v-row>

          <!-- tabela-->
          <v-data-table
            v-if="prePesquisa"
            :headers="headersDados"
            :items="resultadoBusca"
            :items-per-page="-1"
            :loading="resultadoBusca.length === 0"
            :search="search"
            class="elevation-21 mt-8"
            disable-pagination
            hide-default-footer
          >

            <!-- template para titulo e search-->
            <template v-slot:top>
              <v-toolbar
                flat
              >
                <!-- Título da tabela-->
                <v-toolbar-title>Relatório de Pendências</v-toolbar-title>

                <v-divider
                  class="mx-4"
                  inset
                  vertical
                ></v-divider>

                <v-spacer></v-spacer>

                <!--Pesquisar-->
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  hide-details
                  label="Pesquisar"
                  placeholder="Pesquisar"
                  single-line
                ></v-text-field>

              </v-toolbar>

            </template>

            <template v-slot:item.secao="{ item }">

              <h2>{{ item.secao }}</h2>
            </template>

            <!-- categorias-->
            <template v-slot:item.categorias_pendentes="{ item }">
              <h3>
                <ul>
                  <li v-for="categoria in item.categorias_pendentes" :key="categoria.id">
                    {{ categoria.categoria }}
                    <ul>
                      <li v-for="indicador in categoria.indicadores_pendentes" :key="indicador.id">
                        {{ indicador.indicador }}
                        <ul>
                          <li v-for="mes in indicador.meses_pendentes" :key="mes"> {{ transformaMes(mes) }}</li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </h3>
            </template>
          </v-data-table>

        </v-alert>
      </v-alert>
    </v-col>
  </v-row>
</template>

<script>
import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'

export default {
  name: 'relatorioPendencias',
  mixins: [logoutMixin],

  data: () => ({
    mesLimite: '',
    mesOptions: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro',
      'Outubro', 'Novembro', 'Dezembro'],
    ano_verifica_fim: '',
    resultadoBusca: [],
    headersDados: [
      {
        text: 'Seção',
        align: 'center',
        value: 'secao',
        sortable: false
      },
      {
        text: 'Categorias / Indicadores / Meses Pendentes',
        align: 'left',
        value: 'categorias_pendentes',
        sortable: false
      }
    ],
    prePesquisa: false,
    search: ''
  }),

  computed: {
    ...mapGetters(['usuarioLogado'])
  },
  created () {
  },
  watch: {},

  mounted () {
  },

  methods: {
    anoRules () {
      return [
        v => !!v || 'O ano é obrigatório',
        v => (v >= 1920 && v <= 2999) || 'O ano deve estar entre 1920 e 2999',
        v => (/^\d{4}$/).test(v) || 'O ano deve ter 4 dígitos'
      ]
    },

    filtraAno (event) {
      if (event && event.target) {
        let value = event.target.value
        // Remove caracteres que não são dígitos
        value = value.replace(/\D/g, '')
        // Limita a quantidade de dígitos para 4
        if (value.length > 4) {
          value = value.slice(0, 4)
        }
        // Atualiza o valor no input e no modelo
        event.target.value = value
        this.ano_verifica_fim = value
      }
    },

    transformaMes (mes) {
      if (mes === 1) return 'Janeiro'
      if (mes === 2) return 'Fevereiro'
      if (mes === 3) return 'Março'
      if (mes === 4) return 'Abril'
      if (mes === 5) return 'Maio'
      if (mes === 6) return 'Junho'
      if (mes === 7) return 'Julho'
      if (mes === 8) return 'Agosto'
      if (mes === 9) return 'Setembro'
      if (mes === 10) return 'Outubro'
      if (mes === 11) return 'Novembro'
      if (mes === 12) return 'Dezembro'
    },

    fazPesquisa () {
      this.prePesquisa = true
      let objetoParaEnvio = {}
      objetoParaEnvio['mes_limite'] = this.mesLimite
      objetoParaEnvio['ano'] = this.ano_verifica_fim
      objetoParaEnvio['secao'] = 'todos'
      objetoParaEnvio['tipo'] = 'pesquisa'

      try {
        this.$http.post('ferramenta/relatoriopendencias', objetoParaEnvio)
          .then(response => {
            this.resultadoBusca = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
<style>

</style>
