<template>
  <v-container fluid>
    <v-row>
      <v-col>

        <!-- expande todes e pendencias-->
        <v-alert v-if="meusDados.length > 0" color="blue lighten-2" dense>

          <!-- expande todes / oculta e mostra OBS / e pendências-->
          <v-row>
            <v-col class="mb-auto mt-auto" cols="3">
              <v-btn :color="colorTextBtn" :loading="loaderBtnExpandir" small @click="expandeTodes">{{
                  textoBtnExpandirOcultar
                }}
              </v-btn>
              <v-btn :color="colorTextMostrarOcultarObs" :loading="loaderBtnMostraOcultaObs" small
                     @click="mostraOcultaObs">{{
                  textoBtnEsconderMostrarObs
                }}
              </v-btn>
            </v-col>
            <v-col>
              <!-- alertas de pendências-->
              <v-alert v-if="resultadoBusca.length > 0" class="mb-0" dense dismissible type="warning">
                <v-row>
                  <v-col cols="2"><h3>Alertas</h3></v-col>
                  <v-col>
                  <span v-if="resultadoBusca.length > 0">
                    <span v-if="resultadoBusca[0].categorias_pendentes.length > 0">Pendências: {{
                        resultadoBusca[0].categorias_pendentes.length
                      }}</span>

                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        class="ml-2 pb-1"
                        v-bind="attrs"
                        @click="openDialogMostraPendencia()"
                        v-on="on"
                      >
                        mdi-information
                      </v-icon>
                    </template>
                    <span>Exibir informações sobre as pendências</span>
                  </v-tooltip>
                  </span>
                  </v-col>
                </v-row>
              </v-alert>
            </v-col>
          </v-row>

        </v-alert>

        <!-- carregamento de dados - loading-->
        <v-alert v-else color="yellow lighten-2">
          <v-progress-circular
            class="mr-10"
            color="primary"
            indeterminate
          ></v-progress-circular>
          Aguarde o carregamento de dados...
        </v-alert>

        <!-- expandir e colapsar-->
        <v-alert v-for="categoria in meusDados" v-if="categoria.indicadores.length > 0 && categoria.categoria.ativo"
                 :key="categoria.categoria.id" color="green lighten-2"
                 elevation="12">

          <v-row v-if="categoria.expanded === false">

            <!-- nome da categoria e informações-->
            <v-col cols="7">
              <h3>
                <v-icon class="mr-5" @click="categoria.expanded = true">mdi-plus</v-icon>
                {{ categoria.categoria.nome }}
                <v-icon class="ml-5" @click="openDialogDetailsCategoria(categoria)">mdi-magnify</v-icon>
              </h3>
            </v-col>

            <!-- quantidade de indicadores -->
            <v-col cols="1">

              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                  >
                    mdi-list-box-outline
                  </v-icon>
                </template>
                <span>Indicadores</span>
              </v-tooltip>
              {{ categoria.indicadores.length }}

            </v-col>

            <!-- dados faltosos -->
            <v-col cols="1">
              <v-tooltip v-if="retornaDadosFaltosos(categoria) !== 'Nenhum dado faltoso'" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                  >
                    mdi-alert
                  </v-icon>
                </template>
                <span>Dados Previstos / Dados Faltosos</span>
              </v-tooltip>

              <span v-if="retornaDadosFaltosos(categoria) !== 'Nenhum dado faltoso'">{{
                  retornaDadosFaltosos(categoria)
                }}</span>

            </v-col>

            <!-- gerar gráfico anual -->
            <v-col class="text-right" cols="3">
              <v-btn class="primary" small @click="openGraphDialog(categoria)">
                <v-icon class="mr-4" small>mdi-chart-bar</v-icon>
                Gerar Gráfico Anual
              </v-btn>
            </v-col>

          </v-row>

          <v-data-table
            v-if="categoria.indicadores.length > 0 && categoria.categoria.ativo"
            v-show="categoria.expanded"
            :headers="headersDados"
            :items="categoria.indicadores"
            :items-per-page="-1"
            class="elevation-21"
            dense
            disable-pagination
            hide-default-footer
          >

            <!-- template para titulo e gerar gráfico-->
            <template v-slot:top>
              <v-toolbar class="green lighten-3"
                         flat
              >
                <!-- Título da tabela e gera gráfico-->
                <v-toolbar-title>
                  <v-icon class="mr-5" @click="categoria.expanded = false">mdi-minus</v-icon>
                  {{ categoria.categoria.nome }}
                </v-toolbar-title>

                <v-row>
                  <v-col>
                    <v-icon class="ml-10" @click="openDialogDetailsCategoria(categoria)">mdi-magnify</v-icon>
                  </v-col>
                  <v-col class="text-right">
                    <v-btn class="primary" small @click="openGraphDialog(categoria)">
                      <v-icon class="mr-4" small>mdi-chart-bar</v-icon>
                      Gerar Gráfico Anual
                    </v-btn>
                  </v-col>
                </v-row>

              </v-toolbar>

            </template>

            <!-- nome do inicador-->
            <template v-slot:item.indicador="{ item }">

              {{ item.indicador.nome }}
              <v-icon small @click="openDialogDetailsIndicador(item.indicador)">mdi-magnify</v-icon>

            </template>

            <!-- linhas para totais mensais e gerar gráficos -->
            <template v-if="categoria.indicadores.length > 1" v-slot:body.append>
              <tr class="cyan lighten-2">
                <td class="text-center">
                  Total (M)
                  <v-icon small @click="handleTotalAnoClick(categoria, 'mes')">mdi-information</v-icon>
                </td>
                <td v-for="(month, index) in arrayMonthSmall" :key="index" class="text-left">

                  <!--tooltip inserir Observação-->
                  <v-tooltip v-if="mostraObsTootips && pegaSomaMes(categoria, index + 1) !== '-'" top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        class="mr-2"
                        small
                        v-bind="attrs"
                        @click="openDialogTMObs(index+1, anoCorrente, categoria)"
                        v-on="on"
                      >
                        mdi-chat-plus-outline
                      </v-icon>
                    </template>
                    <span>Inserir Observação</span>
                  </v-tooltip>

                  <span class="texto_chip">{{ pegaSomaMes(categoria, index + 1) }}</span>

                  <!--tooltip observações cadastradas-->
                  <v-tooltip
                    v-if="mostraObsTootips && pegaSomaMes(categoria, index + 1) !== '-' && categoria.totalObs[index].length > 0"
                    top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        class="ml-1"
                        small
                        v-bind="attrs"
                        @click="openDialogVerTMObs(categoria, index + 1)"
                        v-on="on"
                      >
                        mdi-chat
                      </v-icon>
                    </template>
                    <span>Observações Cadastradas</span>
                  </v-tooltip>
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

            <!-- chips de informação-->

            <!-- Janeiro-->
            <template v-slot:item.mes_1="{ item }">

              <span v-if="item.valor && retornaValorCorreto(item.valor, 1) !== undefined">
                <!--tooltip inserir Observação-->
                <v-tooltip v-if="mostraObsTootips" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="mr-2"
                    small
                    v-bind="attrs"
                    @click="openDialogInsertIndicadorValorObs(item, 1)"
                    v-on="on"
                  >
                    mdi-chat-plus-outline
                  </v-icon>
                </template>
                <span>Inserir Observação</span>
              </v-tooltip>

                <v-chip v-if="item.indicador.meta === 1"
                        :color="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 1))"
                        class="texto_chip"
                        small
                >
                  <span v-if="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 1)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.valor, 1)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.valor, 1) }}</span>
            </v-chip>
                <span v-else class="texto_chip">{{ retornaValorCorreto(item.valor, 1) }}</span>

                <!--tooltip observações cadastradas-->
                <v-tooltip
                  v-if="retornaIndicadoValorCorreto(item,1).indicador_valor_observacoes.length >0 && mostraObsTootips"
                  top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="ml-1"
                    small
                    v-bind="attrs"
                    @click="showObsIV(retornaIndicadoValorCorreto(item,1))"
                    v-on="on"
                  >
                    mdi-chat
                  </v-icon>
                </template>
                <span>Observações Cadastradas</span>
              </v-tooltip>

            </span>
              <span v-else class="text-center">-</span>

            </template>

            <!-- Fevereiro-->
            <template v-slot:item.mes_2="{ item }">

              <span v-if="item.valor && retornaValorCorreto(item.valor, 2) !== undefined">
                <!--tooltip inserir Observação-->
                <v-tooltip v-if="mostraObsTootips" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="mr-2"
                    small
                    v-bind="attrs"
                    @click="openDialogInsertIndicadorValorObs(item, 2)"
                    v-on="on"
                  >
                    mdi-chat-plus-outline
                  </v-icon>
                </template>
                <span>Inserir Observação</span>
              </v-tooltip>

                <v-chip v-if="item.indicador.meta === 1"
                        :color="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 2))"
                        class="texto_chip"
                        small
                >
                  <span v-if="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 2)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.valor, 2)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.valor, 2) }}</span>
            </v-chip>
                <span v-else class="texto_chip">{{ retornaValorCorreto(item.valor, 2) }}</span>

                <!--tooltip observações cadastradas-->
                <v-tooltip
                  v-if="retornaIndicadoValorCorreto(item,2).indicador_valor_observacoes.length >0 && mostraObsTootips"
                  top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="ml-1"
                    small
                    v-bind="attrs"
                    @click="showObsIV(retornaIndicadoValorCorreto(item,2))"
                    v-on="on"
                  >
                    mdi-chat
                  </v-icon>
                </template>
                <span>Observações Cadastradas</span>
              </v-tooltip>
            </span>
              <span v-else>-</span>
            </template>

            <!-- Março-->
            <template v-slot:item.mes_3="{ item }">

            <span v-if="item.valor && retornaValorCorreto(item.valor, 3) !== undefined">

              <!--tooltip inserir Observação-->
              <v-tooltip v-if="mostraObsTootips" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="mr-2"
                    small
                    v-bind="attrs"
                    @click="openDialogInsertIndicadorValorObs(item, 3)"
                    v-on="on"
                  >
                    mdi-chat-plus-outline
                  </v-icon>
                </template>
                <span>Inserir Observação</span>
              </v-tooltip>

              <v-chip v-if="item.indicador.meta === 1"
                      :color="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 3))"
                      class="texto_chip"
                      small
              >
                  <span v-if="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 3)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.valor, 3)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.valor, 3) }}</span>
            </v-chip>
              <span v-else class="texto_chip">{{ retornaValorCorreto(item.valor, 3) }}</span>

              <!--tooltip observações cadastradas-->
              <v-tooltip
                v-if="retornaIndicadoValorCorreto(item,3).indicador_valor_observacoes.length >0 && mostraObsTootips"
                top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="ml-1"
                    small
                    v-bind="attrs"
                    @click="showObsIV(retornaIndicadoValorCorreto(item,3))"
                    v-on="on"
                  >
                    mdi-chat
                  </v-icon>
                </template>
                <span>Observações Cadastradas</span>
              </v-tooltip>

            </span>
              <span v-else>-</span>
            </template>

            <!-- Abril-->
            <template v-slot:item.mes_4="{ item }">

            <span v-if="item.valor  && retornaValorCorreto(item.valor, 4) !== undefined">

              <!--tooltip inserir Observação-->
              <v-tooltip v-if="mostraObsTootips" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="mr-2"
                    small
                    v-bind="attrs"
                    @click="openDialogInsertIndicadorValorObs(item, 4)"
                    v-on="on"
                  >
                    mdi-chat-plus-outline
                  </v-icon>
                </template>
                <span>Inserir Observação</span>
              </v-tooltip>

              <v-chip v-if="item.indicador.meta === 1"
                      :color="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 4))"
                      class="texto_chip"
                      small
              >
                  <span v-if="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 4)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.valor, 4)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.valor, 4) }}</span>
            </v-chip>
              <span v-else class="texto_chip">{{ retornaValorCorreto(item.valor, 4) }}</span>

              <!--tooltip observações cadastradas-->
              <v-tooltip
                v-if="retornaIndicadoValorCorreto(item,4).indicador_valor_observacoes.length >0 && mostraObsTootips"
                top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="ml-1"
                    small
                    v-bind="attrs"
                    @click="showObsIV(retornaIndicadoValorCorreto(item,4))"
                    v-on="on"
                  >
                    mdi-chat
                  </v-icon>
                </template>
                <span>Observações Cadastradas</span>
              </v-tooltip>

            </span>
              <span v-else>-</span>
            </template>

            <!-- Maio-->
            <template v-slot:item.mes_5="{ item }">

            <span v-if="item.valor && retornaValorCorreto(item.valor, 5) !== undefined">

              <!--tooltip inserir Observação-->
              <v-tooltip v-if="mostraObsTootips" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="mr-2"
                    small
                    v-bind="attrs"
                    @click="openDialogInsertIndicadorValorObs(item, 5)"
                    v-on="on"
                  >
                    mdi-chat-plus-outline
                  </v-icon>
                </template>
                <span>Inserir Observação</span>
              </v-tooltip>

               <v-chip v-if="item.indicador.meta === 1"
                       :color="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 5))"
                       class="texto_chip"
                       small
               >
                  <span v-if="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 5)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.valor, 5)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.valor, 5) }}</span>
            </v-chip>
              <span v-else class="texto_chip">{{ retornaValorCorreto(item.valor, 5) }}</span>

              <!--tooltip observações cadastradas-->
              <v-tooltip
                v-if="retornaIndicadoValorCorreto(item,5).indicador_valor_observacoes.length >0 && mostraObsTootips"
                top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="ml-1"
                    small
                    v-bind="attrs"
                    @click="showObsIV(retornaIndicadoValorCorreto(item,5))"
                    v-on="on"
                  >
                    mdi-chat
                  </v-icon>
                </template>
                <span>Observações Cadastradas</span>
              </v-tooltip>

            </span>
              <span v-else>-</span>
            </template>

            <!-- Junho-->
            <template v-slot:item.mes_6="{ item }">

            <span v-if="item.valor && retornaValorCorreto(item.valor, 6) !== undefined">

              <!--tooltip inserir Observação-->
              <v-tooltip v-if="mostraObsTootips" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="mr-2"
                    small
                    v-bind="attrs"
                    @click="openDialogInsertIndicadorValorObs(item, 6)"
                    v-on="on"
                  >
                    mdi-chat-plus-outline
                  </v-icon>
                </template>
                <span>Inserir Observação</span>
              </v-tooltip>

              <v-chip v-if="item.indicador.meta === 1"
                      :color="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 6))"
                      class="texto_chip"
                      small
              >
                  <span v-if="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 6)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.valor, 6)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.valor, 6) }}</span>
            </v-chip>
              <span v-else class="texto_chip">{{ retornaValorCorreto(item.valor, 6) }}</span>

              <!--tooltip observações cadastradas-->
              <v-tooltip
                v-if="retornaIndicadoValorCorreto(item,6).indicador_valor_observacoes.length >0 && mostraObsTootips"
                top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="ml-1"
                    small
                    v-bind="attrs"
                    @click="showObsIV(retornaIndicadoValorCorreto(item,6))"
                    v-on="on"
                  >
                    mdi-chat
                  </v-icon>
                </template>
                <span>Observações Cadastradas</span>
              </v-tooltip>

            </span>
              <span v-else>-</span>
            </template>

            <!-- Julho-->
            <template v-slot:item.mes_7="{ item }">

            <span v-if="item.valor && retornaValorCorreto(item.valor, 7) !== undefined">

              <!--tooltip inserir Observação-->
              <v-tooltip v-if="mostraObsTootips" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="mr-2"
                    small
                    v-bind="attrs"
                    @click="openDialogInsertIndicadorValorObs(item, 7)"
                    v-on="on"
                  >
                    mdi-chat-plus-outline
                  </v-icon>
                </template>
                <span>Inserir Observação</span>
              </v-tooltip>

              <v-chip v-if="item.indicador.meta === 1"
                      :color="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 7))"
                      class="texto_chip"
                      small
              >
                  <span v-if="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 7)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.valor, 7)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.valor, 7) }}</span>
            </v-chip>
              <span v-else class="texto_chip">{{ retornaValorCorreto(item.valor, 7) }}</span>

              <!--tooltip observações cadastradas-->
              <v-tooltip
                v-if="retornaIndicadoValorCorreto(item,7).indicador_valor_observacoes.length >0 && mostraObsTootips"
                top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="ml-1"
                    small
                    v-bind="attrs"
                    @click="showObsIV(retornaIndicadoValorCorreto(item,7))"
                    v-on="on"
                  >
                    mdi-chat
                  </v-icon>
                </template>
                <span>Observações Cadastradas</span>
              </v-tooltip>

            </span>
              <span v-else>-</span>
            </template>

            <!-- Agosto-->
            <template v-slot:item.mes_8="{ item }">

            <span v-if="item.valor && retornaValorCorreto(item.valor, 8) !== undefined">

              <!--tooltip inserir Observação-->
              <v-tooltip v-if="mostraObsTootips" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="mr-2"
                    small
                    v-bind="attrs"
                    @click="openDialogInsertIndicadorValorObs(item, 8)"
                    v-on="on"
                  >
                    mdi-chat-plus-outline
                  </v-icon>
                </template>
                <span>Inserir Observação</span>
              </v-tooltip>

              <v-chip v-if="item.indicador.meta === 1"
                      :color="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 8))"
                      class="texto_chip"
                      small
              >
                  <span v-if="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 8)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.valor, 8)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.valor, 8) }}</span>
            </v-chip>
              <span v-else class="texto_chip">{{ retornaValorCorreto(item.valor, 8) }}</span>

              <!--tooltip observações cadastradas-->
              <v-tooltip
                v-if="retornaIndicadoValorCorreto(item,8).indicador_valor_observacoes.length >0 && mostraObsTootips"
                top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="ml-1"
                    small
                    v-bind="attrs"
                    @click="showObsIV(retornaIndicadoValorCorreto(item,8))"
                    v-on="on"
                  >
                    mdi-chat
                  </v-icon>
                </template>
                <span>Observações Cadastradas</span>
              </v-tooltip>

            </span>
              <span v-else>-</span>
            </template>

            <!-- Setembro-->
            <template v-slot:item.mes_9="{ item }">

            <span v-if="item.valor && retornaValorCorreto(item.valor, 9) !== undefined">

              <!--tooltip inserir Observação-->
              <v-tooltip v-if="mostraObsTootips" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="mr-2"
                    small
                    v-bind="attrs"
                    @click="openDialogInsertIndicadorValorObs(item, 9)"
                    v-on="on"
                  >
                    mdi-chat-plus-outline
                  </v-icon>
                </template>
                <span>Inserir Observação</span>
              </v-tooltip>

              <v-chip v-if="item.indicador.meta === 1"
                      :color="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 9))"
                      class="texto_chip"
                      small
              >
                  <span v-if="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 9)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.valor, 9)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.valor, 9) }}</span>
            </v-chip>
              <span v-else class="texto_chip">{{ retornaValorCorreto(item.valor, 9) }}</span>

              <!--tooltip observações cadastradas-->
              <v-tooltip
                v-if="retornaIndicadoValorCorreto(item,9).indicador_valor_observacoes.length >0 && mostraObsTootips"
                top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="ml-1"
                    small
                    v-bind="attrs"
                    @click="showObsIV(retornaIndicadoValorCorreto(item,9))"
                    v-on="on"
                  >
                    mdi-chat
                  </v-icon>
                </template>
                <span>Observações Cadastradas</span>
              </v-tooltip>

            </span>
              <span v-else>-</span>
            </template>

            <!-- Outubro-->
            <template v-slot:item.mes_10="{ item }">

            <span v-if="item.valor && retornaValorCorreto(item.valor, 10) !== undefined">

              <!--tooltip inserir Observação-->
              <v-tooltip v-if="mostraObsTootips" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="mr-2"
                    small
                    v-bind="attrs"
                    @click="openDialogInsertIndicadorValorObs(item, 10)"
                    v-on="on"
                  >
                    mdi-chat-plus-outline
                  </v-icon>
                </template>
                <span>Inserir Observação</span>
              </v-tooltip>

              <v-chip v-if="item.indicador.meta === 1"
                      :color="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 10))"
                      class="texto_chip"
                      small
              >
                  <span v-if="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 10)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.valor, 10)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.valor, 10) }}</span>
            </v-chip>
              <span v-else class="texto_chip">{{ retornaValorCorreto(item.valor, 10) }}</span>

              <!--tooltip observações cadastradas-->
              <v-tooltip
                v-if="retornaIndicadoValorCorreto(item,10).indicador_valor_observacoes.length >0 && mostraObsTootips"
                top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="ml-1"
                    small
                    v-bind="attrs"
                    @click="showObsIV(retornaIndicadoValorCorreto(item,10))"
                    v-on="on"
                  >
                    mdi-chat
                  </v-icon>
                </template>
                <span>Observações Cadastradas</span>
              </v-tooltip>

            </span>
              <span v-else>-</span>
            </template>

            <!-- Novembro-->
            <template v-slot:item.mes_11="{ item }">

            <span v-if="item.valor && retornaValorCorreto(item.valor, 11) !== undefined">

              <!--tooltip inserir Observação-->
              <v-tooltip v-if="mostraObsTootips" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="mr-2"
                    small
                    v-bind="attrs"
                    @click="openDialogInsertIndicadorValorObs(item, 11)"
                    v-on="on"
                  >
                    mdi-chat-plus-outline
                  </v-icon>
                </template>
                <span>Inserir Observação</span>
              </v-tooltip>

              <v-chip v-if="item.indicador.meta === 1"
                      :color="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 11))"
                      class="texto_chip"
                      small
              >
                  <span v-if="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 11)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.valor, 11)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.valor, 11) }}</span>
            </v-chip>
              <span v-else class="texto_chip">{{ retornaValorCorreto(item.valor, 11) }}</span>

              <!--tooltip observações cadastradas-->
              <v-tooltip
                v-if="retornaIndicadoValorCorreto(item,11).indicador_valor_observacoes.length >0 && mostraObsTootips"
                top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="ml-1"
                    small
                    v-bind="attrs"
                    @click="showObsIV(retornaIndicadoValorCorreto(item,11))"
                    v-on="on"
                  >
                    mdi-chat
                  </v-icon>
                </template>
                <span>Observações Cadastradas</span>
              </v-tooltip>

            </span>
              <span v-else>-</span>
            </template>

            <!-- Dezembro-->
            <template v-slot:item.mes_12="{ item }">

            <span v-if="item.valor && retornaValorCorreto(item.valor, 12) !== undefined">

              <!--tooltip inserir Observação-->
              <v-tooltip v-if="mostraObsTootips" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="mr-2"
                    small
                    v-bind="attrs"
                    @click="openDialogInsertIndicadorValorObs(item, 12)"
                    v-on="on"
                  >
                    mdi-chat-plus-outline
                  </v-icon>
                </template>
                <span>Inserir Observação</span>
              </v-tooltip>

               <v-chip v-if="item.indicador.meta === 1"
                       :color="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 12))"
                       class="texto_chip"
                       small
               >
                  <span v-if="getColorForIndicatorTable(item.indicador, retornaValorCorreto(item.valor, 12)) === 'red'"
                        class="white--text">{{
                      retornaValorCorreto(item.valor, 12)
                    }}</span>
              <span v-else class="black--text">{{ retornaValorCorreto(item.valor, 12) }}</span>
            </v-chip>
              <span v-else class="texto_chip">{{ retornaValorCorreto(item.valor, 12) }}</span>

              <!--tooltip observações cadastradas-->
              <v-tooltip
                v-if="retornaIndicadoValorCorreto(item,12).indicador_valor_observacoes.length >0 && mostraObsTootips"
                top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="ml-1"
                    small
                    v-bind="attrs"
                    @click="showObsIV(retornaIndicadoValorCorreto(item,12))"
                    v-on="on"
                  >
                    mdi-chat
                  </v-icon>
                </template>
                <span>Observações Cadastradas</span>
              </v-tooltip>

            </span>
              <span v-else>-</span>
            </template>

            <!-- total-->
            <template v-slot:item.total_ano="{ item }">

              <td :class="getStatusClass('Active')" class="text-center">
                <span class="texto_chip">{{ getTotalAno(item, categoria) }}</span>
              </td>
            </template>

            <template v-slot:header.total_ano="{ header }">
              <v-icon small @click="handleTotalAnoClick(categoria, 'ano')">mdi-information</v-icon>
              {{ header.text }}
            </template>

          </v-data-table>

        </v-alert>

        <!-- dialog para ver gráfico-->
        <v-dialog v-model="dialogVerGrafico" :width="leDialogGraphWidth">
          <v-card>
            <v-card-title>
              Gráfico ({{ garphTipo }})
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
              <v-row v-if="categoriaDetalhe.categoria">
                <v-col>
                  <b>Nome: </b> {{ categoriaDetalhe.categoria.nome }}<br>
                  <span v-if="categoriaDetalhe.categoria.observacoes"><b>Observações: </b> {{
                      categoriaDetalhe.categoria.observacoes
                    }}<br></span>
                  <b>Natureza: </b> {{ categoriaDetalhe.categoria.natureza }}<br>
                  <b>Periodicidade: </b> {{ categoriaDetalhe.categoria.periodicidade }}<br>
                  <b>Mapeamento de Total (Mensal)</b> {{ categoriaDetalhe.categoria.mapeamento_total_mensal }}<br>
                  <b>Mapeamento de Total (Anual)</b> {{ categoriaDetalhe.categoria.mapeamento_total_anual }}<br>

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
                  <span v-if="indicadorDetalhe.observacoes"><b>Observações: </b> {{ indicadorDetalhe.observacoes }}<br></span>
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

        <!--Dialog para ver pendências-->
        <v-dialog v-model="dialogMostraPendencia" max-width="800px">
          <v-card>
            <v-card-title class="justify-center" primary-title>
              <v-icon
                class="mr-4">
                fa fa-exclamation-triangle
              </v-icon>
              Pendências
              <v-icon
                class="ml-4">
                fa fa-exclamation-triangle
              </v-icon>

            </v-card-title>
            <v-card-text>
              <hr>
              <br>
              <h2>Foram encontradas as seguintes pendências:</h2>
              <br>
              <hr>
              <br>

              <ul v-if="resultadoBusca.length > 0">
                <li v-for="categoria in resultadoBusca[0].categorias_pendentes" :key="categoria.id" class="mb-3">
                  {{ categoria.categoria }}
                  <ul>
                    <li v-for="indicador in categoria.indicadores_pendentes" :key="indicador.id">
                      {{ indicador.indicador }} - Meses Pendentes: ( <span
                      v-for="(mes, index) in indicador.meses_pendentes"
                      :key="index">{{ transformaMes(mes) }} </span> )
                    </li>
                  </ul>
                </li>
              </ul>
            </v-card-text>
            <v-card-actions class="pb-5">
              <v-spacer></v-spacer>
              <v-btn color="grey lighten-1" @click="dialogMostraPendencia = false">Fechar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- dialog para inserir Observações sobre indicador valor-->
        <v-dialog v-model="dialogInsertIndicadorValorObs" width="30%">
          <v-card>
            <v-card-title>
              Inserir Observação
            </v-card-title>
            <v-card-text>
              <span class="pl-3">Observações sobre o valor do Indicador</span>
              <v-textarea v-if="dialogInsertIndicadorValorObs"
                          ref="observacaoTextarea"
                          :value="observacaoTexto"
                          dense
                          hint="Escreva algo se desejar, sobre o valor do indicador"
                          label="Observações do valor do Indicador"
                          rounded
                          solo
                          @input="debouncedUpdateObservacao($event)"
              ></v-textarea>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="success"
                @click="doSaveEditObs"
              >
                Salvar
              </v-btn>
              <v-btn
                color="secondary"
                @click="dialogInsertIndicadorValorObs = false"
              >
                Fechar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- dialog para ver observações de indicador valor-->
        <v-dialog v-model="dialogIndicadorValorObs" width="40%">
          <v-card>
            <v-card-title>
              Observações Cadastradas
            </v-card-title>
            <v-card-text>
              <v-alert v-for="obsvi in selectedVI.indicador_valor_observacoes" :key="obsvi.id" elevation="12">
                <v-row>
                  <v-col>
                    <h3>Observação</h3>
                  </v-col>
                  <v-col class="text-right">
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                          class="ml-2 pb-1"
                          small
                          v-bind="attrs"
                          v-on="on"
                        >
                          mdi-pencil
                        </v-icon>
                      </template>
                      <span>Editar Observação (EM CONSTRUÇÃO)</span>
                    </v-tooltip>

                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                          class="ml-2 pb-1"
                          small
                          v-bind="attrs"
                          @click="openDialogExcluiObsVI(obsvi , 'vi')"
                          v-on="on"
                        >
                          mdi-delete
                        </v-icon>
                      </template>
                      <span>Excluir Observação</span>
                    </v-tooltip>
                  </v-col>
                </v-row>

                {{ obsvi.observacao }} <br>
                <b>Por: </b> {{ obsvi.resp }}
              </v-alert>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="secondary"
                @click="dialogIndicadorValorObs = false"
              >
                Fechar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- dialog para excluir observações de indicador valor-->
        <v-dialog v-model="dialogIndicadorValorObsExcluir" width="40%">
          <v-card>
            <v-card-title class="justify-center" primary-title>
              <v-icon
                class="mr-4">
                fa fa-exclamation-triangle
              </v-icon>
              Exclusão de observação
              <v-icon
                class="ml-4">
                fa fa-exclamation-triangle
              </v-icon>
            </v-card-title>
            <v-card-text>
              <p>Você tem certeza de que quer excluir essa observação?</p>
              <p>Essa ação não poderá ser desfeita!</p>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="error"
                @click="doExcluiObsVI"
              >
                Excluir
              </v-btn>
              <v-btn
                color="secondary"
                @click="dialogIndicadorValorObsExcluir = false"
              >
                Cancelar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- dialog para inserir Observações sobre total mensal-->
        <v-dialog v-model="dialogInsertTMObs" width="30%">
          <v-card>
            <v-card-title>
              Inserir Observação
            </v-card-title>
            <v-card-text>
              <span class="pl-3">Observações sobre o Total Mensal</span>
              <v-textarea v-if="dialogInsertTMObs"
                          dense
                          hint="Escreva algo se desejar, sobre o total mensal"
                          label="Observações sobre o total mensal"
                          rounded
                          solo
                          @input="debouncedUpdateObservacaoTotal($event)"
              ></v-textarea>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="success"
                @click="doSaveEditTM"
              >
                Salvar
              </v-btn>
              <v-btn
                color="secondary"
                @click="dialogInsertTMObs = false"
              >
                Fechar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- dialog para ver observações totais de categoria-->
        <!-- preciso implementar edição  de obs-->
        <v-dialog v-model="dialogTMObs" width="40%">
          <v-card>
            <v-card-title>
              Observações Cadastradas
            </v-card-title>
            <v-card-text>
              <v-alert v-for="leobstm in obsTMArray" :key="leobstm.id" elevation="12">
                <v-row>
                  <v-col>
                    <h3>Observação</h3>
                  </v-col>
                  <v-col class="text-right">
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                          class="ml-2 pb-1"
                          small
                          v-bind="attrs"
                          v-on="on"
                        >
                          mdi-pencil
                        </v-icon>
                      </template>
                      <span>Editar Observação (EM CONSTRUÇÃO)</span>
                    </v-tooltip>

                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                          class="ml-2 pb-1"
                          small
                          v-bind="attrs"
                          @click="openDialogExcluiObsVI(leobstm, 'tm')"
                          v-on="on"
                        >
                          mdi-delete
                        </v-icon>
                      </template>
                      <span>Excluir Observação</span>
                    </v-tooltip>
                  </v-col>
                </v-row>

                {{ leobstm.observacao }} <br>
                <b>Por: </b> {{ leobstm.resp }}
              </v-alert>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="secondary"
                @click="dialogTMObs = false"
              >
                Fechar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import GeraGraphAno from './GeraGraphAno.vue'

export default {
  name: 'categoriaView',
  mixins: [logoutMixin],
  components: {GeraGraphAno},
  data: () => ({
    headersDados: [
      {text: 'Indicador', align: 'center', value: 'indicador', sortable: false},
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
      {text: 'Total (A)', align: 'center', value: 'total_ano', sortable: false, class: 'grey lighten-2'}
    ],
    tempvalue: '-',
    meusDados: [],
    dialogVerGrafico: false,
    selectedCategoria: {},
    dadosGraph: [],
    nomeCategoria: '',
    arrayMonthSmall: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    garphTipo: '',
    labelpie: [],
    leDialogGraphWidth: '90%',
    dialogDetailsCategoria: false,
    categoriaDetalhe: {},
    dialogDetailsIndicador: false,
    indicadorDetalhe: {},
    dialogDetailsTotal: false,
    tipoDeTotalVigente: '',
    textoBtnExpandirOcultar: 'Expandir Todos',
    textoBtnEsconderMostrarObs: 'Ocultar Obs',
    colorTextBtn: 'primary',
    colorTextMostrarOcultarObs: 'primary',
    loaderBtnExpandir: false,
    loaderBtnMostraOcultaObs: false,
    dialogMostraPendencia: false,
    dialogInsertIndicadorValorObs: false,
    observacaovi: '',
    selectedVI: {},
    dialogIndicadorValorObs: false,
    mostraObsTootips: true,
    objTotalMObs: {
      'mes': '',
      'ano': '',
      'categoria_id': '',
      'observacao': ''
    },
    dialogInsertTMObs: false,
    dialogTMObs: false,
    obsTMArray: [],
    observacaoTemp: '',
    observacaoTexto: '',
    dialogIndicadorValorObsExcluir: false,
    selectedObsToExclude: {},
    tipoExclusaoObs: ''
  }),

  props: {
    selectedSecao: Object,
    anoCorrente: Number,
    resultadoBusca: Array
  },

  computed: {
    ...mapGetters(['usuarioLogado'])
  },

  created () {
  },

  watch: {
    selectedSecao: {
      deep: true, // Observa mudanças profundas no objeto
      handler (newVal, oldVal) {
        // Chama o método de busca sempre que a propriedade selectedSecao mudar
        this.pegaPorCategoria()
      }
    },
    anoCorrente: {
      deep: true, // Observa mudanças profundas no objeto
      handler (newVal, oldVal) {
        // Chama o método de busca sempre que a propriedade selectedSecao mudar
        this.pegaPorCategoria()
      }
    },
    meusDados: {
      handler (newVal) {
        if (newVal.length === 0) {
          this.textoBtnExpandirOcultar = 'Expandir Todos'
          this.colorTextBtn = 'primary'
        }
      },
      deep: true
    },
    dialogInsertIndicadorValorObs (newVal) {
      if (newVal) {
        this.clearTextarea()
      }
    }
  },

  mounted () {
    this.pegaPorCategoria()

    this.debouncedUpdate = this.debounce(this.updateObservacao, 300)
  },

  methods: {
    async pegaPorCategoria () {
      let objetoParaEnvio = {
        ano: this.anoCorrente,
        secao_id: this.selectedSecao.id
      }

      try {
        const response = await this.$http.post('valorindicador/porcat', objetoParaEnvio)
        const dadosOrdenados = response.data.map(categoria => {
          categoria.indicadores.forEach(indicador => {
            indicador.valor.sort((a, b) => a.mes - b.mes)
          })
          categoria.expanded = false
          return categoria
        })
        this.meusDados = dadosOrdenados
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
        this.selectedCategoria.indicadores[i].valor.sort((a, b) => a.mes - b.mes)

        for (let j = 0; j < this.selectedCategoria.indicadores[i].valor.length; j++) {
          data.push(this.selectedCategoria.indicadores[i].valor[j].valor)
        }

        ajustes.push({
          name: this.selectedCategoria.indicadores[i].indicador.nome,
          data: data
        })
      }

      this.dadosGraph = ajustes
      this.nomeCategoria = this.selectedCategoria.categoria.nome

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
          labels.push(categoria.indicadores[i].indicador.nome)
          series.push(this.convertStringToNumber(this.getTotalAno(categoria.indicadores[i], this.selectedCategoria)))
        }

        this.dadosGraph = series
        this.labelpie = labels
        this.garphTipo = 'Geral - ' + this.anoCorrente
        this.nomeCategoria = this.selectedCategoria.categoria.nome

        this.dialogVerGrafico = true
      } else {
        let mes = indexMonth + 1

        for (let i = 0; i < categoria.indicadores.length; i++) {
          labels.push(categoria.indicadores[i].indicador.nome)

          for (let j = 0; j < categoria.indicadores[i].valor.length; j++) {
            if (categoria.indicadores[i].valor[j].mes === mes) {
              series.push(categoria.indicadores[i].valor[j].valor)
            }
          }
        }

        this.dadosGraph = series
        this.labelpie = labels

        this.nomeCategoria = this.selectedCategoria.categoria.nome

        this.dialogVerGrafico = true
      }
    },

    mostraBtnMes (categoria, indexMes) {
      let mes = indexMes + 1
      let labels = []
      let series = []

      for (let i = 0; i < categoria.indicadores.length; i++) {
        labels.push(categoria.indicadores[i].indicador.nome)

        for (let j = 0; j < categoria.indicadores[i].valor.length; j++) {
          if (categoria.indicadores[i].valor[j].mes === mes) {
            series.push(categoria.indicadores[i].valor[j].valor)
          }
        }
      }
      return series.length > 0
    },

    openDialogDetailsCategoria (categoria) {
      this.categoriaDetalhe = categoria
      this.dialogDetailsCategoria = true
    },

    openDialogDetailsIndicador (indicador) {
      this.indicadorDetalhe = indicador
      this.dialogDetailsIndicador = true
    },

    retornaValorCorreto (item, mes) {
      for (let i = 0; i < item.length; i++) {
        if (item[i].mes === mes) {
          let valor = item[i].valor

          // Format to two decimal places if it's a decimal number
          if (valor % 1 !== 0) {
            valor = valor.toFixed(2)
          }

          // Replace decimal point with comma
          valor = valor.toString().replace('.', ',')

          // Format with thousand separators
          valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

          return valor
        }
      }
    },

    convertStringToNumber (value) {
      // Remove spaces
      value = value.trim()

      // Remove thousand separators and replace decimal comma with a period
      value = value.replace(/\./g, '').replace(',', '.')

      // Convert to number
      return parseFloat(value)
    },

    pegaSomaMes (categoria, mes) {
      let arrayTrabalho = []

      if (mes === 99) {
        for (let i = 0; i < categoria.indicadores.length; i++) {
          for (let j = 0; j < categoria.indicadores[i].valor.length; j++) {
            arrayTrabalho.push(categoria.indicadores[i].valor[j].valor)
          }
        }

        if (categoria.categoria.mapeamento_total_anual === 'Somatório' || categoria.categoria.mapeamento_total_anual === 'Máximo' || categoria.categoria.mapeamento_total_anual === 'Mínimo') {
          if (arrayTrabalho.length === 0) {
            return '-'
          } else {
            return this.formatNumber(arrayTrabalho.reduce((a, b) => a + b, 0))
          }
        } else if (categoria.categoria.mapeamento_total_anual === 'Média') {
          if (arrayTrabalho.length === 0) {
            return '-'
          } else {
            return 'Média'
          }
        }
      } else {
        for (let i = 0; i < categoria.indicadores.length; i++) {
          for (let j = 0; j < categoria.indicadores[i].valor.length; j++) {
            if (categoria.indicadores[i].valor[j].mes === mes) {
              arrayTrabalho.push(categoria.indicadores[i].valor[j].valor)
            }
          }
        }

        if (categoria.categoria.mapeamento_total_mensal === 'Somatório') {
          if (arrayTrabalho.length === 0) {
            return '-'
          } else {
            return this.formatNumber(arrayTrabalho.reduce((a, b) => a + b, 0))
          }
        } else if (categoria.categoria.mapeamento_total_mensal === 'Média') {
          if (arrayTrabalho.length === 0) {
            return '-'
          } else {
            const average = arrayTrabalho.reduce((a, b) => a + b, 0) / arrayTrabalho.length
            return this.formatNumber(average)
          }
        } else if (categoria.categoria.mapeamento_total_mensal === 'Mínimo') {
          if (arrayTrabalho.length === 0) {
            return '-'
          } else {
            return this.formatNumber(Math.min(...arrayTrabalho))
          }
        } else if (categoria.categoria.mapeamento_total_mensal === 'Máximo') {
          if (arrayTrabalho.length === 0) {
            return '-'
          } else {
            return this.formatNumber(Math.max(...arrayTrabalho))
          }
        }
      }
    },

    formatNumber (value) {
      if (typeof value === 'number') {
        // Format to two decimal places if it's a decimal number
        if (value % 1 !== 0) {
          value = value.toFixed(2)
        }

        // Replace decimal point with comma
        value = value.toString().replace('.', ',')

        // Format with thousand separators
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      }
      return value
    },

    getTotalAno (indicador, categoria) {
      let arrayTrabalho = []

      for (let i = 0; i < indicador.valor.length; i++) {
        arrayTrabalho.push(indicador.valor[i].valor)
      }

      if (categoria.categoria.mapeamento_total_anual === 'Somatório') {
        if (arrayTrabalho.length === 0) {
          return '-'
        } else {
          return this.formatNumber(arrayTrabalho.reduce((a, b) => a + b, 0))
        }
      } else if (categoria.categoria.mapeamento_total_anual === 'Média') {
        if (arrayTrabalho.length === 0) {
          return '-'
        } else {
          const average = arrayTrabalho.reduce((a, b) => a + b, 0) / arrayTrabalho.length
          return this.formatNumber(Number.isInteger(average) ? average : parseFloat(average.toFixed(2)))
        }
      } else if (categoria.categoria.mapeamento_total_anual === 'Mínimo') {
        if (arrayTrabalho.length === 0) {
          return '-'
        } else {
          return this.formatNumber(Math.min(...arrayTrabalho))
        }
      } else if (categoria.categoria.mapeamento_total_anual === 'Máximo') {
        if (arrayTrabalho.length === 0) {
          return '-'
        } else {
          return this.formatNumber(Math.max(...arrayTrabalho))
        }
      }

      return arrayTrabalho
    },

    handleTotalAnoClick (categoria, tipo) {
      this.dialogDetailsTotal = true
      if (tipo === 'ano') {
        this.tipoDeTotalVigente = categoria.categoria.mapeamento_total_anual
      } else {
        this.tipoDeTotalVigente = categoria.categoria.mapeamento_total_mensal
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

    expandeTodes () {
      this.loaderBtnExpandir = true
      if (this.textoBtnExpandirOcultar === 'Expandir Todos') {
        for (let i = 0; i < this.meusDados.length; i++) {
          this.meusDados[i].expanded = true
        }

        this.textoBtnExpandirOcultar = 'Colapsar Todos'
        this.colorTextBtn = 'warning'
        this.loaderBtnExpandir = false
      } else {
        for (let i = 0; i < this.meusDados.length; i++) {
          this.meusDados[i].expanded = false
        }

        this.textoBtnExpandirOcultar = 'Expandir Todos'
        this.colorTextBtn = 'primary'
        this.loaderBtnExpandir = false
      }
    },

    mostraOcultaObs () {
      this.loaderBtnMostraOcultaObs = true
      setTimeout(() => {
        if (this.mostraObsTootips) {
          this.mostraObsTootips = false
          this.textoBtnEsconderMostrarObs = 'Mostrar Obs'
          this.colorTextMostrarOcultarObs = 'secondary'
        } else {
          this.mostraObsTootips = true
          this.textoBtnEsconderMostrarObs = 'Ocultar Obs'
          this.colorTextMostrarOcultarObs = 'primary'
        }
        this.loaderBtnMostraOcultaObs = false
      }, 2000)
    },

    getCurrentMonth () {
      const date = new Date()
      const month = date.getMonth() + 1 // getMonth() returns 0-11, so add 1
      return month.toString().padStart(2) // Ensure two digits
    },

    retornaDadosFaltosos (categoria) {
      const currentMonth = new Date().getMonth() // Get current month
      let missingCount = 0
      let totalExpected = 0

      for (let i = 0; i < categoria.indicadores.length; i++) {
        for (let month = 1; month <= currentMonth; month++) {
          totalExpected++
          const hasValue = categoria.indicadores[i].valor.some(v => v.mes === month)
          if (!hasValue) {
            missingCount++
          }
        }
      }

      if (missingCount === 0) {
        return 'Nenhum dado faltoso'
      } else {
        return `${totalExpected} / ${missingCount}`
      }
    },

    openDialogMostraPendencia () {
      this.dialogMostraPendencia = true
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

    openDialogInsertIndicadorValorObs (item, mes) {
      this.selectedVI = this.retornaIndicadoValorCorreto(item, mes)
      this.observacaovi = '' // Limpa a variável observacaovi
      this.dialogInsertIndicadorValorObs = true

      // Aguarda o próximo ciclo de renderização para acessar o elemento textarea
      this.$nextTick(() => {
        if (this.$refs.observacaoTextarea) {
          // Limpa manualmente o valor do textarea e remove o @input temporariamente
          this.$refs.observacaoTextarea.$el.querySelector('textarea').value = ''
          this.$refs.observacaoTextarea.$el.querySelector('textarea').removeEventListener('input', this.debouncedUpdateObservacao)
        }
      })
    },

    doSaveEditObs () {
      if (this.observacaovi === '') {
        this.$toastr.e(
          'Você deve preencher o campo de observação', 'Erro!'
        )
      } else {
        let objetoParaEnvio = {
          valor_indicador: this.selectedVI,
          observacao: this.observacaovi
        }

        try {
          this.$http.post('obsiv', objetoParaEnvio)
            .then(response => {
              this.dialogInsertIndicadorValorObs = false
              this.selectedVI = {}
              this.observacaovi = ''

              this.$nextTick(() => {
                if (this.$refs.observacaoTextarea) {
                  this.$refs.observacaoTextarea.$el.querySelector('textarea').addEventListener('input', this.debouncedUpdateObservacao)
                }
              })

              // Itera sobre os dados para encontrar o indicador correto e atualizar as observações
              for (let i = 0; i < this.meusDados.length; i++) {
                for (let j = 0; j < this.meusDados[i].indicadores.length; j++) {
                  let indicador = this.meusDados[i].indicadores[j]
                  if (indicador.indicador.id === response.data.indicador_id) {
                    // Atualiza o valor do indicador com a nova resposta do servidor
                    indicador.indicador_valor = response.data

                    // Adiciona a nova observação ao indicador específico
                    for (let k = 0; k < indicador.valor.length; k++) {
                      if (indicador.valor[k].id === response.data.id) {
                        indicador.valor[k].indicador_valor_observacoes = response.data.indicador_valor_observacoes
                        break
                      }
                    }
                  }
                }
              }
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          console.log(e)
        }
      }
    },

    retornaIndicadoValorCorreto (item, mes) {
      for (let i = 0; i < item.valor.length; i++) {
        if (item.valor[i].mes === mes) {
          return item.valor[i]
        }
      }
    },

    showObsIV (item) {
      this.selectedVI = item
      this.dialogIndicadorValorObs = true
    },

    openDialogTMObs (mes, ano, categoria) {
      this.objTotalMObs = {
        'mes': mes,
        'ano': ano,
        'categoria_id': categoria.categoria.id,
        'observacao': ''
      }
      this.dialogInsertTMObs = true
    },

    doSaveEditTM () {
      if (this.objTotalMObs.observacao === '') {
        this.$toastr.e(
          'Você deve preencher o campo de observação', 'Erro!'
        )
      } else {
        try {
          this.$http.post('obstm', this.objTotalMObs)
            .then(response => {
              for (let i = 0; i < this.meusDados.length; i++) {
                if (this.meusDados[i].categoria.id === this.objTotalMObs.categoria_id) {
                  // Calcula a posição correta no array totalObs com base no mês
                  const mesIndex = this.objTotalMObs.mes - 1 // Meses vão de 1 a 12, posições de 0 a 11

                  // Faz o push da nova observação na posição correta
                  this.meusDados[i].totalObs[mesIndex].push({
                    id: response.data.id,
                    observacao: this.objTotalMObs.observacao,
                    resp: response.data.resp, // Supondo que a resposta do servidor inclua o responsável
                    mes: this.objTotalMObs.mes,
                    ano: this.objTotalMObs.ano,
                    categoria_id: this.objTotalMObs.categoria_id,
                    user_id: response.data.user_id, // Supondo que a resposta inclua o ID do usuário
                    created_at: response.data.created_at,
                    updated_at: response.data.updated_at,
                    deleted_at: null
                  })

                  break // Sai do loop após encontrar e atualizar a categoria correta
                }
              }

              this.dialogInsertTMObs = false
              this.objTotalMObs = {
                'mes': '',
                'ano': '',
                'categoria_id': '',
                'observacao': ''
              }
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          console.log(e)
        }
      }
    },

    temObsCadastrada (categoria, ano, mes) {
      let objetoParaEnvio = {
        ano: ano,
        categoria_id: categoria.categoria.id
      }

      try {
        this.$http.post('obstm/pegaporcategoria', objetoParaEnvio)
          .then(response => {
            return response.data[mes].length > 0
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    openDialogVerTMObs (categoria, mes) {
      this.obsTMArray = categoria.totalObs[mes - 1]
      this.dialogTMObs = true
    },

    debounce (fn, delay) {
      let timeoutID
      return function (...args) {
        clearTimeout(timeoutID)
        timeoutID = setTimeout(() => {
          fn.apply(this, args)
        }, delay)
      }
    },

    updateObservacao (value) {
      this.observacaovi = value
    },

    updateObservacaoTotal (value) {
      this.objTotalMObs.observacao = value
    },

    // Adicionando debounce na função updateObservacao
    debouncedUpdateObservacao (value) {
      // Somente atualiza se o diálogo estiver aberto
      this.observacaovi = value
    },

    debouncedUpdateObservacaoTotal (value) {
      // Somente atualiza se o diálogo estiver aberto
      this.objTotalMObs.observacao = value
    },

    clearTextarea () {
      this.observacaoTexto = ''
      this.observacaovi = ''
      this.debouncedUpdateObservacao('')
    },

    openDialogExcluiObsVI (obsvi, tipo) {
      this.selectedObsToExclude = obsvi
      this.tipoExclusaoObs = tipo
      this.dialogIndicadorValorObsExcluir = true
    },

    doExcluiObsVI () {
      if (this.tipoExclusaoObs === 'vi') {
        try {
          this.$http.delete('obsiv/' + this.selectedObsToExclude.id)
            .then(() => {
              this.dialogIndicadorValorObsExcluir = false
              const obsId = this.selectedObsToExclude.id
              this.selectedObsToExclude = {}
              // Itera sobre os dados para encontrar o indicador correto e remover a observação
              for (let i = 0; i < this.meusDados.length; i++) {
                for (let j = 0; j < this.meusDados[i].indicadores.length; j++) {
                  let indicador = this.meusDados[i].indicadores[j]
                  for (let k = 0; k < indicador.valor.length; k++) {
                    let valor = indicador.valor[k]
                    valor.indicador_valor_observacoes = valor.indicador_valor_observacoes.filter(obs => obs.id !== obsId)
                  }
                }
              }

              // Remove a observação de selectedVI.indicador_valor_observacoes
              this.selectedVI.indicador_valor_observacoes = this.selectedVI.indicador_valor_observacoes.filter(obs => obs.id !== obsId)

              // Fecha o dialog se não houver mais observações
              if (this.selectedVI.indicador_valor_observacoes.length === 0) {
                this.dialogIndicadorValorObs = false
              }
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          console.log(e)
        }
      } else if (this.tipoExclusaoObs === 'tm') {
        try {
          this.$http.delete('obstm/' + this.selectedObsToExclude.id)
            .then(() => {
              this.dialogIndicadorValorObsExcluir = false
              const obsId = this.selectedObsToExclude.id
              this.selectedObsToExclude = {}
              // Itera sobre os dados para encontrar a observação total mensal correta e remover a observação
              for (let i = 0; i < this.meusDados.length; i++) {
                let categoria = this.meusDados[i]
                for (let j = 0; j < categoria.totalObs.length; j++) {
                  categoria.totalObs[j] = categoria.totalObs[j].filter(obs => obs.id !== obsId)
                }
              }

              // Remove a observação de obsTMArray
              this.obsTMArray = this.obsTMArray.filter(obs => obs.id !== obsId)

              if (this.obsTMArray.length === 0) {
                this.dialogTMObs = false
              }
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          console.log(e)
        }
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

.texto_chip {
  font-size: 1.1em !important;
}
</style>
