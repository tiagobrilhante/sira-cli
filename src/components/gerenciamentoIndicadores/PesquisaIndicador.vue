<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <h4>Pesquisa de indicadores</h4>
        <v-row>

          <v-col>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              dense
              hide-details
              label="Pesquisar"
              outlined
              placeholder="Pesquisar"
              single-line
              @keydown.enter="fazBusca('agora')"
            ></v-text-field>
          </v-col>
          <v-col class="mt-2 text-left">Digite alguma palavra chave para identificação da categoria e aperte ENTER
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- dialog para ver resultados-->
    <v-dialog v-model="dialogVerResultados" persistent width="90%">
      <v-card>
        <v-card-title>
          <v-row>
            <v-col cols="10">Resultado da busca pelo termo: {{ this.search }}</v-col>
            <v-col class="text-right" cols="2">
              <v-btn
                class="link"
                @click="closeDialogVerResultado"
              >
                X
              </v-btn>
            </v-col>
          </v-row>

        </v-card-title>
        <v-card-text>
          <v-row v-if="resultadoBusca.length > 0" class="mb-3">
            <v-col></v-col>
            <!--btn Navega Ano-->
            <v-col class="text-center">
              <!--diminui ano, exibe ano corrente e aumenta ano-->
              <v-row>

                <!-- dminui ano-->
                <v-col class="text-right">
                  <v-btn class="primary" elevation="10" @click="changeYear('down')">
                    <v-icon>mdi-chevron-left</v-icon>
                  </v-btn>
                </v-col>

                <!-- exibe ano selecionado-->
                <v-col>
                  <v-alert class="mt-0 mb-0" dense elevation="10">
                    <h2>{{ anoCorrente }}</h2>
                  </v-alert>
                </v-col>

                <!-- aimenta ano-->
                <v-col class="text-left">
                  <v-btn v-if="anoBase !== anoCorrente" class="primary" elevation="10" @click="changeYear('up')">
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>

                  <v-btn v-if="anoBase !== anoCorrente" class="success" elevation="10" @click="changeYear('corrente')">
                    <v-icon>mdi-calendar-today</v-icon>
                  </v-btn>

                </v-col>

              </v-row>

            </v-col>
            <v-col></v-col>
          </v-row>

          <!-- expande todes-->
          <v-alert v-if="resultadoBusca.length > 0" color="blue lighten-2" dense>
            <v-row>
              <v-col class="mb-auto mt-auto" cols="3">
                <v-btn :color="colorTextBtn" :loading="loaderBtnExpandir" small @click="expandeTodes">{{
                    textoBtnExpandirOcultar
                  }}
                </v-btn>
              </v-col>
            </v-row>
          </v-alert>

          <v-alert v-for="categoria in resultadoBusca"
                   v-if="categoria.indicadores.length > 0"
                   :key="categoria.id" color="green lighten-2"
                   elevation="12">

            <!-- expande -nome-detalhe e gera grafico anual-->
            <v-row v-if="!categoria.expanded">
              <!-- expande - nome e detalhes-->
              <v-col>
                <span class="text-h6">
                  <v-icon class="mr-5" @click="toggleExpand(categoria)">mdi-plus</v-icon>
                  {{ categoria.nome }} - <b>Seção Responsável: {{ categoria.secao.sigla }}</b>
                  <v-icon class="ml-10" @click="openDialogDetailsCategoria(categoria)">mdi-magnify</v-icon>
                </span>
              </v-col>

              <!-- gera grafico anual-->
              <v-col class="text-right" cols="4">
                <v-btn class="primary" small @click="openGraphDialog(categoria)">
                  <v-icon class="mr-4" small>mdi-chart-bar</v-icon>
                  Gerar Gráfico Anual
                </v-btn>
              </v-col>

            </v-row>

            <v-data-table
              v-if="categoria.indicadores.length > 0 && categoria.expanded"
              :key="categoria.id"
              :headers="headersDados"
              :items="categoria.indicadores"
              :items-per-page="-1"
              class="elevation-21"
              dense
              disable-pagination
              hide-default-footer
            >

              <!-- template para titulo e abrir grafico anual-->
              <template v-slot:top>
                <v-toolbar class="green lighten-3"
                           flat
                >
                  <!-- Título da tabela-->
                  <v-toolbar-title>
                    <v-icon class="mr-5" @click="toggleExpand(categoria)">mdi-minus</v-icon>
                    {{ categoria.nome }} - <b>Seção Responsável: {{ categoria.secao.sigla }}</b>
                    <v-icon class="ml-10" @click="openDialogDetailsCategoria(categoria)">mdi-magnify</v-icon>
                  </v-toolbar-title>

                  <!-- abre grafico anual-->
                  <v-row>
                    <v-col class="text-right">
                      <v-btn class="primary" small @click="openGraphDialog(categoria)">
                        <v-icon class="mr-4" small>mdi-chart-bar</v-icon>
                        Gerar Gráfico Anual
                      </v-btn>
                    </v-col>
                  </v-row>

                </v-toolbar>

              </template>

              <!-- template para o nome do indicador-->
              <template v-slot:item.indicador="{ item }">

                {{ item.nome }}

              </template>

              <!-- linhas para totais mensais e gerar gráficos -->
              <template v-if="categoria.indicadores.length > 1" v-slot:body.append>
                <tr class="cyan lighten-2">
                  <td class="text-center">
                    Total (M)
                    <v-icon small @click="handleTotalAnoClick(categoria, 'mes')">mdi-information</v-icon>
                  </td>
                  <td v-for="(month, index) in arrayMonthSmall" :key="index" class="text-left">
                    {{ pegaSomaMes(categoria, index + 1) }}
                  </td>
                  <td class="text-center">
                    <v-tooltip v-if="pegaSomaMes(categoria, 99) === 'Média'" top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                          v-bind="attrs"
                          v-on="on"
                        >
                          mdi-information
                        </v-icon>
                      </template>
                      <span>Total Anual em Média - não é possível estipular um valor</span>
                    </v-tooltip>
                    <span v-else>{{ pegaSomaMes(categoria, 99) }}</span>
                  </td>
                </tr>
                <tr class="yellow lighten-4">
                  <td class="text-center">
                    Gerar Gráfico<br>
                    Mensal
                  </td>
                  <td v-for="(month, index) in arrayMonthSmall" :key="index" class="text-left">
                    <v-btn v-if="mostraBtnMes(categoria, index)" color="secondary" x-small
                           @click="generateMonthGraph(categoria, index)">{{ month }}
                    </v-btn>
                  </td>
                  <td class="text-center">
                    <v-btn color="secondary" x-small @click="generateMonthGraph(categoria, 99)">Geral
                    </v-btn>
                  </td>
                </tr>
              </template>

              <!-- Janeiro-->
              <template v-slot:item.mes_1="{ item }">
        <span v-if="item.indicador_valor && retornaValorCorreto(item.indicador_valor, 1) !== undefined">
               <v-chip v-if="item.meta === 1"
                       :color="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 1))"
               >
                  <span v-if="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 1)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.indicador_valor, 1)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.indicador_valor, 1) }}</span>
            </v-chip>
              <span v-else>{{ retornaValorCorreto(item.indicador_valor, 1) }}</span>
            </span>
                <span v-else class="text-center">-</span>
              </template>

              <!-- Fevereiro-->
              <template v-slot:item.mes_2="{ item }">
        <span v-if="item.indicador_valor && retornaValorCorreto(item.indicador_valor, 2) !== undefined">
               <v-chip v-if="item.meta === 1"
                       :color="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 2))"
               >
                  <span v-if="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 2)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.indicador_valor, 2)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.indicador_valor, 2) }}</span>
            </v-chip>
              <span v-else>{{ retornaValorCorreto(item.indicador_valor, 2) }}</span>
            </span>
                <span v-else class="text-center">-</span>
              </template>

              <!-- Março-->
              <template v-slot:item.mes_3="{ item }">
        <span v-if="item.indicador_valor && retornaValorCorreto(item.indicador_valor, 3) !== undefined">
               <v-chip v-if="item.meta === 1"
                       :color="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 3))"
               >
                  <span v-if="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 3)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.indicador_valor, 3)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.indicador_valor, 3) }}</span>
            </v-chip>
              <span v-else>{{ retornaValorCorreto(item.indicador_valor, 3) }}</span>
            </span>
                <span v-else class="text-center">-</span>
              </template>

              <!-- Abril-->
              <template v-slot:item.mes_4="{ item }">
        <span v-if="item.indicador_valor && retornaValorCorreto(item.indicador_valor, 4) !== undefined">
               <v-chip v-if="item.meta === 1"
                       :color="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 4))"
               >
                  <span v-if="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 4)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.indicador_valor, 4)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.indicador_valor, 4) }}</span>
            </v-chip>
              <span v-else>{{ retornaValorCorreto(item.indicador_valor, 4) }}</span>
            </span>
                <span v-else class="text-center">-</span>
              </template>

              <!-- Maio-->
              <template v-slot:item.mes_5="{ item }">
        <span v-if="item.indicador_valor && retornaValorCorreto(item.indicador_valor, 5) !== undefined">
               <v-chip v-if="item.meta === 1"
                       :color="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 5))"
               >
                  <span v-if="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 5)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.indicador_valor, 5)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.indicador_valor, 5) }}</span>
            </v-chip>
              <span v-else>{{ retornaValorCorreto(item.indicador_valor, 5) }}</span>
            </span>
                <span v-else class="text-center">-</span>
              </template>

              <!-- junho-->
              <template v-slot:item.mes_6="{ item }">
        <span v-if="item.indicador_valor && retornaValorCorreto(item.indicador_valor, 6) !== undefined">
               <v-chip v-if="item.meta === 1"
                       :color="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 6))"
               >
                  <span v-if="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 6)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.indicador_valor, 6)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.indicador_valor, 6) }}</span>
            </v-chip>
              <span v-else>{{ retornaValorCorreto(item.indicador_valor, 6) }}</span>
            </span>
                <span v-else class="text-center">-</span>
              </template>

              <!-- julho-->
              <template v-slot:item.mes_7="{ item }">
        <span v-if="item.indicador_valor && retornaValorCorreto(item.indicador_valor, 7) !== undefined">
               <v-chip v-if="item.meta === 1"
                       :color="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 7))"
               >
                  <span v-if="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 7)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.indicador_valor, 7)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.indicador_valor, 7) }}</span>
            </v-chip>
              <span v-else>{{ retornaValorCorreto(item.indicador_valor, 7) }}</span>
            </span>
                <span v-else class="text-center">-</span>
              </template>

              <!-- Agosto-->
              <template v-slot:item.mes_8="{ item }">
        <span v-if="item.indicador_valor && retornaValorCorreto(item.indicador_valor, 8) !== undefined">
               <v-chip v-if="item.meta === 1"
                       :color="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 8))"
               >
                  <span v-if="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 8)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.indicador_valor, 8)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.indicador_valor, 8) }}</span>
            </v-chip>
              <span v-else>{{ retornaValorCorreto(item.indicador_valor, 8) }}</span>
            </span>
                <span v-else class="text-center">-</span>
              </template>

              <!-- Setembro-->
              <template v-slot:item.mes_9="{ item }">
        <span v-if="item.indicador_valor && retornaValorCorreto(item.indicador_valor, 9) !== undefined">
               <v-chip v-if="item.meta === 1"
                       :color="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 9))"
               >
                  <span v-if="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 9)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.indicador_valor, 9)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.indicador_valor, 9) }}</span>
            </v-chip>
              <span v-else>{{ retornaValorCorreto(item.indicador_valor, 9) }}</span>
            </span>
                <span v-else class="text-center">-</span>
              </template>

              <!-- Outubro-->
              <template v-slot:item.mes_10="{ item }">
        <span v-if="item.indicador_valor && retornaValorCorreto(item.indicador_valor, 10) !== undefined">
               <v-chip v-if="item.meta === 1"
                       :color="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 10))"
               >
                  <span v-if="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 10)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.indicador_valor, 10)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.indicador_valor, 10) }}</span>
            </v-chip>
              <span v-else>{{ retornaValorCorreto(item.indicador_valor, 10) }}</span>
            </span>
                <span v-else class="text-center">-</span>
              </template>

              <!-- Novembro-->
              <template v-slot:item.mes_11="{ item }">
        <span v-if="item.indicador_valor && retornaValorCorreto(item.indicador_valor, 11) !== undefined">
               <v-chip v-if="item.meta === 1"
                       :color="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 11))"
               >
                  <span v-if="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 11)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.indicador_valor, 11)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.indicador_valor, 11) }}</span>
            </v-chip>
              <span v-else>{{ retornaValorCorreto(item.indicador_valor, 11) }}</span>
            </span>
                <span v-else class="text-center">-</span>
              </template>

              <!-- Dezembro-->
              <template v-slot:item.mes_12="{ item }">
        <span v-if="item.indicador_valor && retornaValorCorreto(item.indicador_valor, 12) !== undefined">
               <v-chip v-if="item.meta === 1"
                       :color="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 12))"
               >
                  <span v-if="getColorForIndicatorTable(item, retornaValorCorreto(item.indicador_valor, 12)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.indicador_valor, 12)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.indicador_valor, 12) }}</span>
            </v-chip>
              <span v-else>{{ retornaValorCorreto(item.indicador_valor, 12) }}</span>
            </span>
                <span v-else class="text-center">-</span>
              </template>

              <!-- total-->
              <template v-slot:item.total_ano="{ item }">
                <td :class="getStatusClass('Active')" class="text-center">
                  {{ getTotalAno(item, categoria) }}
                </td>
              </template>

              <template v-slot:header.total_ano="{ header }">
                <v-icon small @click="handleTotalAnoClick(categoria, 'ano')">mdi-information</v-icon>
                {{ header.text }}
              </template>

            </v-data-table>

          </v-alert>

          <v-alert v-if="resultadoBusca.length === 0" class="mt-5" type="info">
            <v-row>
              <v-col>
                <h3>Nenhum resultado encontrado</h3>
              </v-col>
            </v-row>
          </v-alert>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            @click="closeDialogVerResultado"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog para ver gráfico-->
    <v-dialog v-model="dialogVerGrafico" :width="leDialogGraphWidth">
      <v-card>
        <v-card-title>
          Gráfico (Anual)
        </v-card-title>
        <v-card-text>

          <GeraGraphAno v-if="dialogVerGrafico" :dadosGraph="dadosGraph" :garphTipo="garphTipo"
                        :lelabels="labelpie" :nomeCategoria="nomeCategoria"/>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            @click="dialogVerGrafico = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog de detalhes de uma categoria-->
    <v-dialog v-model="dialogDetailsCategoria" width="30%">
      <v-card>
        <v-card-title>
          Detalhes da categoria
        </v-card-title>
        <v-card-text>
          <v-row v-if="categoriaDetalhe">
            <v-col>
              <b>Nome: </b> {{ categoriaDetalhe.nome }}<br>
              <b>Natureza: </b> {{ categoriaDetalhe.natureza }}<br>
              <b>Periodicidade: </b> {{ categoriaDetalhe.periodicidade }}<br>
              <b>Mapeamento de Total (Mensal)</b> {{ categoriaDetalhe.mapeamento_total_mensal }}<br>
              <b>Mapeamento de Total (Anual)</b> {{ categoriaDetalhe.mapeamento_total_anual }}<br>

            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            @click="dialogDetailsCategoria = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog de detalhes de um indicador-->
    <v-dialog v-model="dialogDetailsIndicador" width="30%">
      <v-card>
        <v-card-title>
          Detalhes do indicador
        </v-card-title>
        <v-card-text>
          <v-row v-if="indicadorDetalhe">
            <v-col>
              <b>Nome: </b> {{ indicadorDetalhe.nome }}<br>
              <b>Meta: </b> <span v-if="indicadorDetalhe.meta">Sim</span><span v-else>Não</span><br>
              <div v-if="indicadorDetalhe.meta">
                <b>Tendência: </b> {{ indicadorDetalhe.tendencia }}<br>
                <b>Objetivo: </b> {{ indicadorDetalhe.objetivo }}<br>
                <b>Verde: </b> {{ indicadorDetalhe.green }}<br>
                <b>Amarelo: </b> entre {{ indicadorDetalhe.yellow_1 }} e {{ indicadorDetalhe.yellow_2 }}<br>
                <b>Vermelho: </b> {{ indicadorDetalhe.red }}
              </div>

            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            @click="dialogDetailsIndicador = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog de detalhes sobre um total-->
    <v-dialog v-model="dialogDetailsTotal" width="30%">
      <v-card>
        <v-card-title>
          Tipo de Total Vigente
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              {{ tipoDeTotalVigente }}
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            @click="dialogDetailsTotal = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import GeraGraphAno from '../categoria/GeraGraphAno.vue'

export default {
  name: 'pesquisaIndicador',
  components: {GeraGraphAno},
  mixins: [logoutMixin],

  data: () => ({
    search: '',
    dialogVerResultados: false,
    resultadoBusca: [],
    headersDados: [
      {text: 'Indicador', align: 'start', value: 'indicador', sortable: false},
      {text: 'Janeiro', align: 'start', value: 'mes_1', sortable: false},
      {text: 'Fevereiro', align: 'start', value: 'mes_2', sortable: false},
      {text: 'Março', align: 'start', value: 'mes_3', sortable: false},
      {text: 'Abril', align: 'start', value: 'mes_4', sortable: false},
      {text: 'Maio', align: 'start', value: 'mes_5', sortable: false},
      {text: 'Junho', align: 'start', value: 'mes_6', sortable: false},
      {text: 'Julho', align: 'start', value: 'mes_7', sortable: false},
      {text: 'Agosto', align: 'start', value: 'mes_8', sortable: false},
      {text: 'Setembro', align: 'start', value: 'mes_9', sortable: false},
      {text: 'Outubro', align: 'start', value: 'mes_10', sortable: false},
      {text: 'Novembro', align: 'start', value: 'mes_11', sortable: false},
      {text: 'Dezembro', align: 'start', value: 'mes_12', sortable: false},
      {text: 'Total (A)', align: 'start', value: 'total_ano', sortable: false, class: 'grey lighten-2'}
    ],
    awaitData: true,
    anoCorrente: 0,
    anoBase: 0,
    selectedCategoria: {},
    dialogVerGrafico: false,
    dadosGraph: [],
    nomeCategoria: '',
    arrayMonthSmall: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    garphTipo: '',
    labelpie: [],
    leDialogGraphWidth: '90%',
    categoriaDetalhe: {},
    dialogDetailsCategoria: false,
    dialogDetailsIndicador: false,
    indicadorDetalhe: {},
    dialogDetailsTotal: false,
    tipoDeTotalVigente: '',
    textoBtnExpandirOcultar: 'Expandir Todos',
    colorTextBtn: 'primary',
    loaderBtnExpandir: false
  }),
  props: {},

  computed: {
    ...mapGetters(['usuarioLogado'])
  },
  created () {
  },
  watch: {},

  mounted () {
    this.getCurrentDate()
  },

  methods: {
    fazBusca (anoBusca) {
      let anoNow = 0
      if (anoBusca === 'agora') {
        anoNow = new Date().getFullYear()
      } else {
        anoNow = anoBusca
      }
      let objetoParaEnvio = {
        busca: this.search,
        ano: anoNow
      }
      try {
        this.$http.post('categorias/busca', objetoParaEnvio)
          .then(response => {
            this.resultadoBusca = response.data.map(categoria => {
              return {...categoria, expanded: false}
            })
            this.dialogVerResultados = true
            this.textoBtnExpandirOcultar = 'Expandir Todos'
            this.colorTextBtn = 'primary'
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    getColorForIndicator (indicador) {
      if (indicador.meta) {
        if (indicador.indicador_valor.length > 0) {
          const value = parseFloat(indicador.indicador_valor[0].valor)
          if (!isNaN(value)) {
            const lowerYellow = Math.min(indicador.yellow_1, indicador.yellow_2)
            const higherYellow = Math.max(indicador.yellow_1, indicador.yellow_2)

            if (indicador.tendencia === 'Quanto maior melhor') {
              if (value >= indicador.green) {
                return 'green' // Verde, se maior ou igual ao limite green
              } else if (value >= lowerYellow && value <= higherYellow) {
                return 'yellow' // Amarelo entre yellow_2 e green
              } else {
                return 'red' // Vermelho para valores abaixo de yellow_2
              }
            } else {
              if (value <= indicador.green) {
                return 'green' // Verde, se maior ou igual ao limite green
              } else if (value >= lowerYellow && value <= higherYellow) {
                return 'yellow' // Amarelo entre yellow_2 e green
              } else {
                return 'red' // Vermelho para valores abaixo de yellow_2
              }
            }
          }
        }
        return 'grey' // Cor padrão se o valor não for válido
      } else {
        return 'blue'
      }
    },

    getColorForIndicatorTable (indicador, valor) {
      if (indicador.meta) {
        const lowerYellow = Math.min(indicador.yellow_1, indicador.yellow_2)
        const higherYellow = Math.max(indicador.yellow_1, indicador.yellow_2)

        if (indicador.tendencia === 'Quanto maior melhor') {
          if (valor >= indicador.green) {
            return 'green' // Verde, se maior ou igual ao limite green
          } else if (valor >= lowerYellow && valor <= higherYellow) {
            return 'yellow' // Amarelo entre yellow_2 e green
          } else {
            return 'red' // Vermelho para valores abaixo de yellow_2
          }
        } else {
          if (valor <= indicador.green) {
            return 'green' // Verde, se maior ou igual ao limite green
          } else if (valor >= lowerYellow && valor <= higherYellow) {
            return 'yellow' // Amarelo entre yellow_2 e green
          } else {
            return 'red' // Vermelho para valores abaixo de yellow_2
          }
        }
      }
    },

    openGraphDialog (categoria) {
      this.selectedCategoria = categoria
      this.garphTipo = 'Anual'
      this.leDialogGraphWidth = '90%'

      // Ajustar a informação antes de passar
      let ajustes = []

      for (let i = 0; i < this.selectedCategoria.indicadores.length; i++) {
        let data = []

        // Ordenar os valores pelo mês
        this.selectedCategoria.indicadores[i].indicador_valor.sort((a, b) => a.mes - b.mes)

        for (let j = 0; j < this.selectedCategoria.indicadores[i].indicador_valor.length; j++) {
          data.push(this.selectedCategoria.indicadores[i].indicador_valor[j].valor)
        }

        ajustes.push({
          name: this.selectedCategoria.indicadores[i].nome,
          data: data
        })
      }

      this.dadosGraph = ajustes
      this.nomeCategoria = this.selectedCategoria.nome

      this.dialogVerGrafico = true
    },

    generateMonthGraph (categoria, indexMonth) {
      this.selectedCategoria = categoria
      this.garphTipo = 'Mensal'
      this.leDialogGraphWidth = '50%'

      let labels = []
      let series = []
      if (indexMonth === 99) {
        for (let i = 0; i < categoria.indicadores.length; i++) {
          labels.push(categoria.indicadores[i].nome)
          series.push(this.getTotalAno(categoria.indicadores[i], this.selectedCategoria))
        }
        this.dadosGraph = series
        this.labelpie = labels
        this.garphTipo = 'Geral - ' + this.anoCorrente
        this.nomeCategoria = this.selectedCategoria.nome

        this.dialogVerGrafico = true
      } else {
        let mes = indexMonth + 1

        for (let i = 0; i < categoria.indicadores.length; i++) {
          labels.push(categoria.indicadores[i].nome)

          for (let j = 0; j < categoria.indicadores[i].indicador_valor.length; j++) {
            if (categoria.indicadores[i].indicador_valor[j].mes === mes) {
              series.push(categoria.indicadores[i].indicador_valor[j].valor)
            }
          }
        }

        this.dadosGraph = series
        this.labelpie = labels
        this.nomeCategoria = this.selectedCategoria.nome

        this.dialogVerGrafico = true
      }
    },

    mostraBtnMes (categoria, indexMes) {
      let mes = indexMes + 1
      let labels = []
      let series = []

      for (let i = 0; i < categoria.indicadores.length; i++) {
        labels.push(categoria.indicadores[i].nome)

        for (let j = 0; j < categoria.indicadores[i].indicador_valor.length; j++) {
          if (categoria.indicadores[i].indicador_valor[j].mes === mes) {
            series.push(categoria.indicadores[i].indicador_valor[j].valor)
          }
        }
      }
      return series.length > 0
    },

    changeYear (direction) {
      this.awaitData = true
      if (direction === 'up') {
        this.anoCorrente++
      } else if (direction === 'corrente') {
        this.anoCorrente = this.anoBase
      } else {
        this.anoCorrente--
      }

      this.$nextTick(() => {
        this.fazBusca(this.anoCorrente)
      })
    },

    getCurrentDate () {
      // Obtém a data atual
      const currentDate = new Date()
      this.anoBase = currentDate.getFullYear()
      this.anoCorrente = currentDate.getFullYear()
    },

    openDialogDetailsCategoria (categoria) {
      this.categoriaDetalhe = categoria
      this.dialogDetailsCategoria = true
    },

    pegaSomaMes (categoria, mes) {
      let arrayTrabalho = []
      if (mes === 99) {
        for (let i = 0; i < categoria.indicadores.length; i++) {
          for (let j = 0; j < categoria.indicadores[i].indicador_valor.length; j++) {
            arrayTrabalho.push(categoria.indicadores[i].indicador_valor[j].valor)
          }
        }

        if (categoria.mapeamento_total_anual === 'Somatório' || categoria.mapeamento_total_anual === 'Máximo' || categoria.mapeamento_total_anual === 'Mínimo') {
          if (arrayTrabalho.length === 0) {
            return '-'
          } else {
            return arrayTrabalho.reduce((a, b) => a + b, 0)
          }
        } else if (categoria.mapeamento_total_anual === 'Média') {
          if (arrayTrabalho.length === 0) {
            return '-'
          } else {
            return 'Média'
          }
        }
      } else {
        for (let i = 0; i < categoria.indicadores.length; i++) {
          for (let j = 0; j < categoria.indicadores[i].indicador_valor.length; j++) {
            if (categoria.indicadores[i].indicador_valor[j].mes === mes) {
              arrayTrabalho.push(categoria.indicadores[i].indicador_valor[j].valor)
            }
          }
        }

        if (categoria.mapeamento_total_mensal === 'Somatório') {
          if (arrayTrabalho.length === 0) {
            return '-'
          } else {
            return arrayTrabalho.reduce((a, b) => a + b, 0)
          }
        } else if (categoria.mapeamento_total_mensal === 'Média') {
          if (arrayTrabalho.length === 0) {
            return '-'
          } else {
            const average = arrayTrabalho.reduce((a, b) => a + b, 0) / arrayTrabalho.length
            return Number.isInteger(average) ? average : average.toFixed(2)
          }
        } else if (categoria.mapeamento_total_mensal === 'Mínimo') {
          if (arrayTrabalho.length === 0) {
            return '-'
          } else {
            return Math.min(...arrayTrabalho)
          }
        } else if (categoria.mapeamento_total_mensal === 'Máximo') {
          if (arrayTrabalho.length === 0) {
            return '-'
          } else {
            return Math.max(...arrayTrabalho)
          }
        }
      }
    },

    getTotalAno (indicador, categoria) {
      let arrayTrabalho = []

      for (let i = 0; i < indicador.indicador_valor.length; i++) {
        arrayTrabalho.push(indicador.indicador_valor[i].valor)
      }

      if (categoria.mapeamento_total_anual === 'Somatório') {
        if (arrayTrabalho.length === 0) {
          return '-'
        } else {
          return arrayTrabalho.reduce((a, b) => a + b, 0)
        }
      } else if (categoria.mapeamento_total_anual === 'Média') {
        if (arrayTrabalho.length === 0) {
          return '-'
        } else {
          const average = arrayTrabalho.reduce((a, b) => a + b, 0) / arrayTrabalho.length
          return Number.isInteger(average) ? average : parseFloat(average.toFixed(2))
        }
      } else if (categoria.mapeamento_total_anual === 'Mínimo') {
        if (arrayTrabalho.length === 0) {
          return '-'
        } else {
          return Math.min(...arrayTrabalho)
        }
      } else if (categoria.mapeamento_total_anual === 'Máximo') {
        if (arrayTrabalho.length === 0) {
          return '-'
        } else {
          return Math.max(...arrayTrabalho)
        }
      }
      return arrayTrabalho
    },

    handleTotalAnoClick (categoria, tipo) {
      this.dialogDetailsTotal = true
      if (tipo === 'ano') {
        this.tipoDeTotalVigente = categoria.mapeamento_total_anual
      } else {
        this.tipoDeTotalVigente = categoria.mapeamento_total_mensal
      }
    },

    retornaValorCorreto (item, mes) {
      for (let i = 0; i < item.length; i++) {
        if (item[i].mes === mes) {
          return item[i].valor
        }
      }
    },

    getStatusClass (status) {
      if (status === 'Active') {
        return 'status-active'
      } else if (status === 'Inactive') {
        return 'status-inactive'
      }
      return ''
    },

    toggleExpand (categoria) {
      this.resultadoBusca.forEach(cat => {
        if (cat.id === categoria.id) {
          cat.expanded = !cat.expanded
        } else {
          cat.expanded = false
        }
      })
    },

    closeDialogVerResultado () {
      this.dialogVerResultados = false
      this.search = ''
    },

    expandeTodes () {
      this.loaderBtnExpandir = true
      if (this.textoBtnExpandirOcultar === 'Expandir Todos') {
        for (let i = 0; i < this.resultadoBusca.length; i++) {
          this.resultadoBusca[i].expanded = true
        }

        this.textoBtnExpandirOcultar = 'Colapsar Todos'
        this.colorTextBtn = 'warning'
        this.loaderBtnExpandir = false
      } else {
        for (let i = 0; i < this.resultadoBusca.length; i++) {
          this.resultadoBusca[i].expanded = false
        }

        this.textoBtnExpandirOcultar = 'Expandir Todos'
        this.colorTextBtn = 'primary'
        this.loaderBtnExpandir = false
      }
    }
  }
}
</script>
<style>
.status-active {
  background-color: #d4edda; /* Verde claro */
}

.status-inactive {
  background-color: #f8d7da; /* Vermelho claro */
}
</style>
