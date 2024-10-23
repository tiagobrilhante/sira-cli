<template>
  <v-main
    v-if="usuarioLogado.tipo !== 'Aluno'"
    class="bgConfig">

    <!--Barra de navegação da área administrativa-->
    <BarraNavegacao/>

    <!-- container básico-->
    <v-container
      class="mb-0"
      fluid>
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
      <v-row dense>

        <v-col>
          <!--Banner-->
          <v-alert
            dense
            elevation="21"
          >
            <v-alert
              class="white--text"
              dense
              color="#015088">
              <h2>Filtros</h2>
            </v-alert>

            <v-container fluid>
              <v-row dense>
                <!--cabecalho-->
                <v-col cols="1">
                  <h3>
                    Unidades: </h3>
                </v-col>

                <v-col>
                  <v-btn
                    :color="ajustaSelectedUnidade('todos')"
                    class="white--text mt-1 "
                    rounded
                    small
                    @click="fazPesquisa('todos')">Todos
                  </v-btn>

                  <v-btn
                    v-for="unidade in unidades"
                    :key="unidade.id"
                    :color="ajustaSelectedUnidade(unidade.id)"
                    class="ml-3 white--text mt-1"
                    rounded
                    small
                    @click="fazPesquisa(unidade)">{{ unidade.nome }}
                  </v-btn>
                </v-col>

              </v-row>

              <!-- seletor de CURSOS-->
              <v-row
                v-if="selectedUnidade !== 'todos'"
                dense>
                <!--cabecalho-->
                <v-col cols="1">
                  <h3>
                    Cursos:
                  </h3>
                </v-col>
                <v-col>
                  <v-btn
                    :color="ajustaSelectedCurso('todos')"
                    class="white--text mt-1 "
                    rounded
                    small
                    @click="fazPesquisaCurso('todos')">Todos
                  </v-btn>

                  <v-btn
                    v-for="curso in selectedUnidadeParaSelecao.cursos"
                    :key="curso.id"
                    :color="ajustaSelectedCurso(curso.id)"
                    class="ml-3 white--text mt-1"
                    rounded
                    small
                    @click="fazPesquisaCurso(curso.id)"
                  >{{ curso.nome }}
                  </v-btn>

                </v-col>

              </v-row>

              <!-- Seletor de aberto fechado-->
              <v-row dense>
                <!--cabecalho-->
                <v-col cols="1">
                  <h3>
                    Estado:
                  </h3>

                </v-col>
                <v-col>
                  <v-btn
                    :color="ajustaCorEstado('Aberto')"
                    class="white--text mt-1"
                    rounded
                    small
                    @click="fazPesquisaEstado('Aberto')">Aberto
                  </v-btn>

                  <v-btn
                    :color="ajustaCorEstado('Deferido')"
                    class="white--text mt-1 ml-3"
                    rounded
                    small
                    @click="fazPesquisaEstado('Deferido')">Deferido
                  </v-btn>

                  <v-btn
                    :color="ajustaCorEstado('Indeferido')"
                    class="white--text mt-1 ml-3"
                    rounded
                    small
                    @click="fazPesquisaEstado('Indeferido')">Indeferido
                  </v-btn>
                </v-col>

              </v-row>
            </v-container>

          </v-alert>

        </v-col>

      </v-row>

      <!-- dados tabelares-->
      <v-row dense>

        <v-col>
          <!--Banner-->
          <v-alert
            class="p-5"
            color="#015088"
            elevation="21"
          >

            <!--DataTable-->
            <v-data-table
              :headers="headers"
              :items="atendimentos"
              :search="search"
              class="elevation-21"
              dense
              sort-by="nome"
            >
              <!-- template para titulo e search-->
              <template v-slot:top>
                <v-toolbar
                  flat
                >
                  <!-- Título da tabela-->
                  <v-toolbar-title>Tabela de Solicitações Cadastradas</v-toolbar-title>

                  <v-divider
                    class="mx-4"
                    inset
                    vertical
                  />

                  <v-spacer/>

                  <!--Pesquisar-->
                  <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    hide-details
                    label="Pesquisar"
                    placeholder="Pesquisar"
                    single-line
                  />

                </v-toolbar>

              </template>

              <!--Template de botões para resolver chamado e ver detalhes -->
              <template v-slot:item.actions="{ item }">

                <!--resolver-->
                <v-tooltip
                  v-if="selectedEstado === 'Aberto'"
                  top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      v-bind="attrs"
                      class="mr-2"
                      small
                      @click="resolveSolicitacao(item)"
                      v-on="on"
                    >
                      mdi-check
                    </v-icon>
                  </template>
                  <span>Resolver Solicitação</span>
                </v-tooltip>

                <!-- ver detalhes-->
                <v-tooltip
                  v-else
                  top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      v-bind="attrs"
                      class="mr-2"
                      small
                      @click="openDialogVerDetalhes(item)"
                      v-on="on"
                    >
                      mdi-magnify
                    </v-icon>
                  </template>
                  <span>Detalhes da solicitação</span>
                </v-tooltip>

              </template>

            </v-data-table>

          </v-alert>

        </v-col>

      </v-row>

    </v-container>

    <!--Dialog para resolver solicitação -->
    <v-dialog
      v-model="dialogResolverChamado"
      max-width="70%">
      <v-card>
        <v-card-title
          class="justify-center"
          primary-title>
          Solução de Solicitação
        </v-card-title>
        <v-card-text>

          <!-- imagem, texto form atend, cod e aprov-->
          <v-row no-gutters>

            <!-- imagem-->
            <v-col
              class="my-border"
              cols="2">
              <img
                :src="require('@/assets/img/logoSer.png')"
                class="pa-5"
                alt="Logo Uninorte"
                width="150px">
            </v-col>
            <!-- texto form atendimento-->
            <v-col
              class="my-border d-flex align-center justify-center"
              cols="7">
              <h2>FORMULÁRIO DE ATENDIMENTO AO ALUNO</h2>
            </v-col>
            <!--cod e aprovado por-->
            <v-col
              cols="3">
              <v-row
                no-gutters
                class="text-center">
                <v-col class="my-border myrealce"><h3 class="pt-2 pb-2">Código:</h3></v-col>
                <v-col class="my-border"><h3 class="pt-2 pb-2">CCG-FOR-35</h3> </v-col>
              </v-row>
              <v-row
                no-gutters
                class="text-center">
                <v-col class="my-border myrealce"><h3 class="pt-1 pb-1">Aprovado por:</h3></v-col>
                <v-col class="my-border"><h5 class="pt-1 pb-1">SUPERINTENDENTE ACADÊMICA</h5></v-col>
              </v-row>
            </v-col>

          </v-row>

          <!-- versao-->
          <v-row no-gutters>
            <v-col class="my-border text-right">
              <span class="pr-1">
                <b>05/02/2020 - Versão: 07</b>
              </span>
            </v-col>
          </v-row>

          <!-- nome-->
          <v-row no-gutters>
            <v-col
              class="my-border myrealce"
              cols="2">
              <span class="pl-2">
                <b>NOME:</b>
              </span>

            </v-col>
            <v-col
              class="my-border">
              <span class="pl-2">
                {{ selectedSolicitacao.aluno.nome }}
              </span>
            </v-col>
          </v-row>

          <!-- matricula e periodo-->
          <v-row no-gutters>

            <!-- matricula txt-->
            <v-col
              class="my-border myrealce"
              cols="2">
              <span class="pl-2">
                <b>MATRICULA:</b>
              </span>

            </v-col>
            <!-- matricula -->
            <v-col
              cols="5"
              class="my-border">
              <span class="pl-2">
                {{ selectedSolicitacao.aluno.matricula }}
              </span>
            </v-col>
            <!-- periodo txt-->
            <v-col
              class="my-border myrealce"
              cols="2">
              <span class="pl-2">
                <b>PERÍODO:</b>
              </span>

            </v-col>
            <!-- periodo-->
            <v-col
              cols="3"
              class="my-border">
              <span
                v-if="selectedSolicitacao.codigo_geral !== ''"
                class="pl-2">
                {{ retornaObjetoCursoPeriodoTurnoTurma(selectedSolicitacao.codigo_geral)['identificador_periodo'] }}
              </span>
            </v-col>

          </v-row>

          <!-- curso e turma-->
          <v-row no-gutters>

            <!-- curso txt-->
            <v-col
              class="my-border myrealce"
              cols="2">
              <span class="pl-2">
                <b>CURSO:</b>
              </span>

            </v-col>
            <!-- curso-->
            <v-col
              cols="5"
              class="my-border">
              <span class="pl-2">
                {{ selectedSolicitacao.curso.nome }}
              </span>
            </v-col>
            <!-- turma txt-->
            <v-col
              class="my-border myrealce"
              cols="2">
              <span class="pl-2">
                <b>TURMA:</b>
              </span>
            </v-col>
            <!-- turma-->
            <v-col
              cols="3"
              class="my-border">
              <span class="pl-2">
                {{ selectedSolicitacao.codigo_geral }}
              </span>
            </v-col>
          </v-row>

          <!-- Telefone-->
          <v-row no-gutters>
            <v-col
              class="my-border myrealce"
              cols="2">
              <span class="pl-2">
                <b>TELEFONE:</b>
              </span>

            </v-col>
            <v-col
              class="my-border">
              <span class="pl-2">
                {{ selectedSolicitacao.aluno.telefone }}
              </span>
            </v-col>
          </v-row>

          <!-- EMAIL-->
          <v-row no-gutters>
            <v-col
              class="my-border myrealce"
              cols="2">
              <span class="pl-2">
                <b>EMAIL:</b>
              </span>

            </v-col>
            <v-col
              class="my-border">
              <span class="pl-2">
                {{ selectedSolicitacao.aluno.email }}
              </span>
            </v-col>
          </v-row>

          <!-- Separador-->
          <v-row no-gutters>
            <v-col
              class="my-border"/>
            <span class="pt-3"/>
          </v-row>

          <!-- descricao do assunto-txt-->
          <v-row no-gutters>
            <v-col
              class="my-border text-center myrealce">

              <h3><b>DESCRIÇÃO DO ASSUNTO</b></h3>

            </v-col>
          </v-row>

          <!-- descricao do assunto , data e assinatura-->
          <template v-if="selectedSolicitacao.descricao !== ''">
            <v-row no-gutters>

              <!-- descricao-->
              <v-col class="my-border text-justify pa-3">
                {{ selectedSolicitacao.descricao }}

                <br>
                <br>
                <!-- data e assinatura-->
                <v-row>
                  <!-- data-->
                  <v-col>DATA: {{ formatDate(selectedSolicitacao.data_solicitacao) }}</v-col>
                  <v-col class="text-center">
                    <img
                      :src="require('@/assets/img/assinaturadigitalAluno.png')"
                      alt="Assinado Digitalmente"
                      width="250px">
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </template>

          <!-- intervenção realizada-txt-->
          <v-row no-gutters>
            <v-col
              class="my-border text-center myrealce">

              <h3><b>INTERVENÇÃO REALIZADA</b></h3>

            </v-col>
          </v-row>

          <!-- coordenacao de curso, outros setores-txt-->
          <v-row no-gutters>
            <v-col
              class="my-border text-center">

              <h3><b>COORDENAÇÃO DO CURSO</b></h3>

            </v-col>
            <v-col
              class="my-border text-center">

              <h3><b>OUTROS SETORES (se necessário)</b></h3>

            </v-col>
          </v-row>

          <!-- coordenacao de curso, outros setores-->
          <v-row no-gutters>
            <v-col
              class="my-border text-center">

              <v-textarea
                v-model="intervencaoCoordenacao"
                class="pa-3"
                auto-grow
                rows="5"
                hide-details
                outlined
                name="input-7-4"
                label="Escreva a intervenção realizada pela coordenação"
              />

            </v-col>
            <v-col
              class="my-border text-center">

              <v-textarea
                v-model="intervencaoOutros"
                class="pa-3"
                auto-grow
                rows="5"
                hide-details
                outlined
                name="input-7-4"
                label="Espaço destinado para intervenção de outros setores (SFC)"

              />

            </v-col>
          </v-row>

          <!-- datas-->
          <v-row no-gutters>
            <v-col
              cols="2"
              class="my-border text-left myrealce">

              <h3 class="pl-2">DATA:</h3>

            </v-col>
            <v-col
              class="my-border text-center">

              <h3>{{ getCurrentDateTime('only date') }}</h3>

            </v-col>
            <v-col
              cols="2"
              class="my-border text-left myrealce">

              <h3 class="pl-2">DATA:</h3>

            </v-col>

            <v-col
              class="my-border text-center">

              <h3/>

            </v-col>
          </v-row>

          <!-- seleção de estados-->
          <v-row>
            <v-col class="text-right"><h2 class="pt-2">Selecione o estado:</h2></v-col>
            <v-col>
              <v-select
                :items="['Deferido', 'Indeferido']"
                v-model="intervencaoEstado"
                dense
                label="Selecione o estado"
                outlined
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions
          class="
              pb-5">
          <v-spacer/>
          <v-btn
            rounded
            class="white--text"
            color="rgb(250, 115, 59)"
            @click="dialogResolverChamado = false">Cancelar
          </v-btn>
          <v-btn
            rounded
            class="white--text"
            color="#015088"
            @click="doResolverChamado">Resolver
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Dialog para ver detalhes de solicitação -->
    <v-dialog
      v-model="dialogVerChamado"
      max-width="70%">
      <v-card>
        <v-card-title
          class="justify-center"
          primary-title>
          Solução de Solicitação - {{ selectedSolicitacao.status }}
        </v-card-title>
        <v-card-text ref="contentToConvert">
          <!-- imagem, texto form atend, cod e aprov-->
          <v-row no-gutters>

            <!-- imagem-->
            <v-col
              class="my-border"
              cols="2">
              <img
                :src="require('@/assets/img/logoSer.png')"
                class="pa-5"
                alt="Logo Uninorte"
                width="150px">
            </v-col>
            <!-- texto form atendimento-->
            <v-col
              class="my-border d-flex align-center justify-center"
              cols="7">
              <h2>FORMULÁRIO DE ATENDIMENTO AO ALUNO</h2>
            </v-col>
            <!--cod e aprovado por-->
            <v-col
              cols="3">
              <v-row
                no-gutters
                class="text-center">
                <v-col class="my-border myrealce"><h3 class="pt-2 pb-2">Código:</h3></v-col>
                <v-col class="my-border"><h3 class="pt-2 pb-2">CCG-FOR-35</h3> </v-col>
              </v-row>
              <v-row
                no-gutters
                class="text-center">
                <v-col class="my-border myrealce"><h3 class="pt-1 pb-1">Aprovado por:</h3></v-col>
                <v-col class="my-border"><h5 class="pt-1 pb-1">SUPERINTENDENTE ACADÊMICA</h5></v-col>
              </v-row>
            </v-col>

          </v-row>

          <!-- versao-->
          <v-row no-gutters>
            <v-col class="my-border text-right">
              <span class="pr-1">
                <b>05/02/2020 - Versão: 07</b>
              </span>
            </v-col>
          </v-row>

          <!-- nome-->
          <v-row no-gutters>
            <v-col
              class="my-border myrealce"
              cols="2">
              <span class="pl-2">
                <b>NOME:</b>
              </span>

            </v-col>
            <v-col
              class="my-border">
              <span class="pl-2">
                {{ selectedSolicitacao.aluno.nome }}
              </span>
            </v-col>
          </v-row>

          <!-- matricula e periodo-->
          <v-row no-gutters>

            <!-- matricula txt-->
            <v-col
              class="my-border myrealce"
              cols="2">
              <span class="pl-2">
                <b>MATRICULA:</b>
              </span>

            </v-col>
            <!-- matricula -->
            <v-col
              cols="5"
              class="my-border">
              <span class="pl-2">
                {{ selectedSolicitacao.aluno.matricula }}
              </span>
            </v-col>
            <!-- periodo txt-->
            <v-col
              class="my-border myrealce"
              cols="2">
              <span class="pl-2">
                <b>PERÍODO:</b>
              </span>

            </v-col>
            <!-- periodo-->
            <v-col
              cols="3"
              class="my-border">
              <span
                v-if="selectedSolicitacao.codigo_geral !== ''"
                class="pl-2">
                {{ retornaObjetoCursoPeriodoTurnoTurma(selectedSolicitacao.codigo_geral)['identificador_periodo'] }}
              </span>
            </v-col>

          </v-row>

          <!-- curso e turma-->
          <v-row no-gutters>

            <!-- curso txt-->
            <v-col
              class="my-border myrealce"
              cols="2">
              <span class="pl-2">
                <b>CURSO:</b>
              </span>

            </v-col>
            <!-- curso-->
            <v-col
              cols="5"
              class="my-border">
              <span class="pl-2">
                {{ selectedSolicitacao.curso.nome }}
              </span>
            </v-col>
            <!-- turma txt-->
            <v-col
              class="my-border myrealce"
              cols="2">
              <span class="pl-2">
                <b>TURMA:</b>
              </span>
            </v-col>
            <!-- turma-->
            <v-col
              cols="3"
              class="my-border">
              <span class="pl-2">
                {{ selectedSolicitacao.codigo_geral }}
              </span>
            </v-col>
          </v-row>

          <!-- Telefone-->
          <v-row no-gutters>
            <v-col
              class="my-border myrealce"
              cols="2">
              <span class="pl-2">
                <b>TELEFONE:</b>
              </span>

            </v-col>
            <v-col
              class="my-border">
              <span class="pl-2">
                {{ selectedSolicitacao.aluno.telefone }}
              </span>
            </v-col>
          </v-row>

          <!-- EMAIL-->
          <v-row no-gutters>
            <v-col
              class="my-border myrealce"
              cols="2">
              <span class="pl-2">
                <b>EMAIL:</b>
              </span>

            </v-col>
            <v-col
              class="my-border">
              <span class="pl-2">
                {{ selectedSolicitacao.aluno.email }}
              </span>
            </v-col>
          </v-row>

          <!-- Separador-->
          <v-row no-gutters>
            <v-col
              class="my-border"/>
            <span class="pt-3"/>
          </v-row>

          <!-- descricao do assunto-txt-->
          <v-row no-gutters>
            <v-col
              class="my-border text-center myrealce">

              <h3><b>DESCRIÇÃO DO ASSUNTO</b></h3>

            </v-col>
          </v-row>

          <!-- descricao do assunto , data e assinatura-->
          <template v-if="selectedSolicitacao.descricao !== ''">
            <v-row no-gutters>

              <!-- descricao-->
              <v-col class="my-border text-justify pa-3">
                {{ selectedSolicitacao.descricao }}

                <br>
                <br>
                <!-- data e assinatura-->
                <v-row>
                  <!-- data-->
                  <v-col>DATA: {{ formatDate(selectedSolicitacao.data_solicitacao) }}</v-col>
                  <v-col class="text-center">
                    <img
                      :src="require('@/assets/img/assinaturadigitalAluno.png')"
                      alt="Assinado Digitalmente"
                      width="250px">
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </template>

          <!-- intervenção realizada-txt-->
          <v-row no-gutters>
            <v-col
              class="my-border text-center myrealce">

              <h3><b>INTERVENÇÃO REALIZADA</b></h3>

            </v-col>
          </v-row>

          <!-- coordenacao de curso, outros setores-txt-->
          <v-row no-gutters>
            <v-col
              class="my-border text-center">

              <h3><b>COORDENAÇÃO DO CURSO</b></h3>

            </v-col>
            <v-col
              class="my-border text-center">

              <h3><b>OUTROS SETORES (se necessário)</b></h3>

            </v-col>
          </v-row>

          <!-- coordenacao de curso, outros setores-->
          <v-row
            v-if="selectedSolicitacao.user_atendimento_resolucao"
            no-gutters>
            <v-col
              class="my-border text-left">
              <span class="pl-2">{{ selectedSolicitacao.user_atendimento_resolucao.intervencao_coordenacao }}</span>

              <br><br>
              <span class="pl-2">
                Assinado por: {{ selectedSolicitacao.user_atendimento_resolucao.responsavel.nome }}  <img
                  :src="require('@/assets/img/assinaturadigitalAluno.png')"
                  alt="Assinado Digitalmente"
                  class="pl-10"
                  width="250px">
              </span>
            </v-col>
            <v-col
              class="my-border text-left">

              <span class="pl-2">{{ selectedSolicitacao.user_atendimento_resolucao.intervencao_outros }}</span>

            </v-col>
          </v-row>

          <!-- datas-->
          <v-row no-gutters>
            <v-col
              cols="2"
              class="my-border text-left myrealce">

              <h3 class="pl-2">DATA:</h3>

            </v-col>
            <v-col
              class="my-border text-center">

              <h3 v-if="selectedSolicitacao.data_solucao !== '' && selectedSolicitacao.status !=='Aberto'">{{ formatDate(selectedSolicitacao.data_solucao) }}</h3>

            </v-col>
            <v-col
              cols="2"
              class="my-border text-left myrealce">

              <h3 class="pl-2">DATA:</h3>

            </v-col>

            <v-col
              class="my-border text-center">

              <h3 v-if="selectedSolicitacao.data_solucao !== '' && selectedSolicitacao.status !=='Aberto'">{{ formatDate(selectedSolicitacao.data_solucao) }}</h3>

            </v-col>
          </v-row>

        </v-card-text>
        <v-card-actions
          class="
              pb-5">
          <v-spacer/>
          <v-btn
            rounded
            class="white--text"
            color="#015088"
            @click="downloadPdf">Download PDF</v-btn>
          <v-btn
            rounded
            class="white--text"
            color="rgb(250, 115, 59)"
            @click="dialogVerChamado = false">Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-main>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'
// import moment from 'moment-timezone'
import JsPDF from 'jspdf'
import BarraNavegacao from '../../components/barra-navegacao/BarraNavegacao.vue'
import html2canvas from 'html2canvas'
import {nextTick} from 'vue'

export default {
  name: 'Home',
  components: {BarraNavegacao},
  mixins: [logoutMixin],
  data: () => ({
    configSis: config,
    unidades: [],
    atendimentos: [],
    headers: [
      {
        text: 'Aluno',
        align: 'start',
        value: 'aluno.nome'
      },
      {
        text: 'Matricula',
        align: 'start',
        value: 'aluno.matricula'
      },
      {
        text: 'Curso',
        align: 'start',
        value: 'curso.nome'
      },
      {
        text: 'Actions',
        value: 'actions',
        align: 'center',
        sortable: false
      }
    ],
    search: '',
    selectedUnidade: 'todos',
    selectedCurso: 'todos',
    selectedEstado: 'Aberto',
    filtrosPesquisa: {
      'unidade': 'todos',
      'curso': 'todos',
      'estado': 'Aberto'
    },
    selectedUnidadeParaSelecao: [],
    dialogResolverChamado: false,
    selectedSolicitacao: {
      codigo_geral: '',
      descricao: '',
      data_solicitacao: '',
      data_solucao: '',
      periodo_letivo: '',
      aluno: {
        nome: '',
        matricula: '',
        email: '',
        telefone: ''
      },
      curso: {
        nome: ''
      },
      user_atendimento_resolucao: {
        responsavel: {}
      }
    },
    intervencaoCoordenacao: '',
    intervencaoOutros: '',
    intervencaoEstado: '',
    dialogVerChamado: false,
    size: 2480
  }),
  computed: {
    ...mapGetters(['usuarioLogado'])
  },
  watch: {},
  created () {
  },

  async mounted () {
    this.cospeAluno()
    await this.getUnidades()
    await this.getSolicitacoes()
  },
  methods: {
    cospeAluno () {
      if (this.usuarioLogado.tipo === 'Aluno') {
        this.$store.commit('DESLOGAR_USUARIO')
        this.$router.push({name: 'index'})
      }
    },

    async getUnidades () {
      try {
        this.$http.get('unidades/vigente')
          .then(response => {
            this.unidades = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    async getSolicitacoes () {
      // tenho que passar unidade, curso e estado
      try {
        this.$http.post('atendimento/pesquisa', this.filtrosPesquisa)
          .then(response => {
            this.atendimentos = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    resolveSolicitacao (item) {
      this.selectedSolicitacao = item
      this.dialogResolverChamado = true
    },

    ajustaSelectedUnidade (qual) {
      if (this.selectedUnidade === 'todos' && qual === 'todos') {
        return '#015088'
      } else {
        if (this.selectedUnidade === qual) {
          return '#015088'
        }
        return 'rgb(250, 115, 59)'
      }
    },

    ajustaSelectedCurso (qual) {
      if (this.selectedCurso === 'todos' && qual === 'todos') {
        return '#015088'
      } else {
        if (this.selectedCurso === qual) {
          return '#015088'
        }

        return 'rgb(250, 115, 59)'
      }
    },

    async fazPesquisa (unidade) {
      if (unidade === 'todos') {
        this.selectedUnidade = 'todos'
        this.selectedCurso = 'todos'
      } else {
        this.selectedUnidade = unidade.id
        this.selectedUnidadeParaSelecao = unidade
        this.selectedCurso = 'todos'
      }
      this.filtrosPesquisa = {
        'unidade': this.selectedUnidade,
        'curso': this.selectedCurso,
        'estado': this.selectedEstado
      }
      await this.getSolicitacoes()
    },

    async fazPesquisaEstado (estado) {
      this.selectedEstado = estado
      this.filtrosPesquisa = {
        'unidade': this.selectedUnidade,
        'curso': this.selectedCurso,
        'estado': this.selectedEstado
      }

      console.log(this.filtrosPesquisa)
      await this.getSolicitacoes()
    },

    async fazPesquisaCurso (curso) {
      this.selectedCurso = curso
      this.filtrosPesquisa = {
        'unidade': this.selectedUnidade,
        'curso': this.selectedCurso,
        'estado': this.selectedEstado
      }
      await this.getSolicitacoes()
    },

    ajustaCorEstado (qual) {
      if (this.selectedEstado === qual) {
        return '#015088'
      } else {
        return 'rgb(250, 115, 59)'
      }
    },

    retornaObjetoCursoPeriodoTurnoTurma (codigo) {
      if (codigo) {
        // Verifica se o código tem o comprimento esperado
        if (codigo.length < 12) {
          throw new Error('Código inválido')
        }

        // Extrai as partes do código conforme as regras
        const identificadorUnidade = codigo.substring(0, 3)
        const codigoCurso = codigo.substring(3, 6)
        const numeroConstante = codigo.substring(6, 8)
        const identificadorPeriodo = codigo.substring(8, 10)
        const codigoTurno = codigo.substring(10, codigo.length - 1) // Pega todos os caracteres até o penúltimo
        const codigoTurma = codigo.substring(codigo.length - 1) // Pega o último caractere

        // Monta o array com as informações extraídas
        const informacoes = {
          unidade: identificadorUnidade,
          curso: codigoCurso,
          numero_constante: numeroConstante,
          identificador_periodo: identificadorPeriodo,
          turno: codigoTurno,
          codigo_turma: codigoTurma,
          geral: codigo
        }

        return informacoes
      }
    },

    formatDate (dateString) {
      // eslint-disable-next-line no-constant-condition
      if (dateString !== null || true || dateString !== '' || dateString !== undefined) {
        if (dateString !== '') {
          const [datePart] = dateString.split(' ')
          const [year, month, day] = datePart.split('-')
          return `${day}/${month}/${year}`
        }
      }
    },

    getCurrentDateTime (tipo) {
      const now = new Date()
      const date = now.toLocaleDateString() // Format: MM/DD/YYYY
      const time = now.toLocaleTimeString() // Format: HH:MM:SS AM/PM

      if (tipo === 'only date') {
        return date
      } else {
        return `${date} ${time}`
      }
    },

    doResolverChamado () {
      if (this.validaDadosResolve()) {
        const objetoParaEnvio = {
          'intervencaoCoordenacao': this.intervencaoCoordenacao,
          'intervencaoOutros': this.intervencaoOutros,
          'intervencaoEstado': this.intervencaoEstado,
          'solicitacao': this.selectedSolicitacao
        }

        try {
          this.$http.post('atendimento/resolve', objetoParaEnvio)
            .then(async response => {
              this.dialogResolverChamado = false
              this.resetCampos()
              await nextTick()
              this.selectedSolicitacao = response.data
              this.openDialogVerDetalhes(this.selectedSolicitacao)
              await this.getSolicitacoes()
              await nextTick()
              this.$toastr.Add({
                title: 'Sucesso!',
                msg: 'Solicitação resolvida com sucesso!',
                type: 'success',
                timeout: 8000
              })

              setTimeout(() => {
                // Code to be executed after 500 ms
                this.downloadPdf()
              }, 500)
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          console.log(e)
        }
      }
    },

    validaDadosResolve () {
      let arrayErros = []
      if (this.intervencaoEstado === '') {
        arrayErros.push('Selecione o estado da solicitação!')
      }

      if (this.intervencaoCoordenacao === '') {
        arrayErros.push('Informe a intervenção realizada pela coordenação!')
      }

      if (arrayErros.length > 0) {
        this.$toastr.Add({
          title: 'Erro!',
          msg: arrayErros.join('<br>'),
          type: 'error',
          timeout: 8000
        })
        return false
      } else {
        return true
      }
    },

    resetCampos () {
      this.intervencaoCoordenacao = ''
      this.intervencaoOutros = ''
      this.intervencaoEstado = ''
      this.selectedSolicitacao = {
        codigo_geral: '',
        descricao: '',
        data_solicitacao: '',
        data_solucao: '',
        aluno: {
          nome: '',
          matricula: '',
          email: '',
          telefone: ''
        },
        curso: {
          nome: ''
        },
        user_atendimento_resolucao: {
          responsavel: {}
        }
      }
    },

    openDialogVerDetalhes (item) {
      this.selectedSolicitacao = item
      this.dialogVerChamado = true
    },

    async downloadPdf () {
      const element = this.$refs.contentToConvert
      const scale = 3
      const canvas = await html2canvas(element, { scale })
      const imgData = canvas.toDataURL('image/jpeg', 1.0) // Usando JPEG com qualidade máxima

      const pdf = new JsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      })

      // Definir largura máxima e calcular a nova altura para manter a proporção
      const imgWidth = 450
      const imgHeight = canvas.height * imgWidth / canvas.width

      // Centralizar a imagem no documento

      // const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2
      // const y = (pdf.internal.pageSize.getHeight() - imgHeight) / 2
      const x = 0
      const y = 10

      const matricula = this.selectedSolicitacao.aluno.matricula
      const dataSolucao = this.selectedSolicitacao.data_solucao
      const id = this.selectedSolicitacao.id
      const pl = this.selectedSolicitacao.periodo_letivo.replace('.', '_')

      const namefile = `solucao_${id}_${matricula}_${pl}_${dataSolucao}.pdf`

      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight)
      pdf.save(namefile)
    }

  }
}
</script>

<style>

.bgConfig {
  background-color: #ffffff !important;
}

.my-border {
  border: 1px solid black !important;
}

.myrealce{
  background-color: #d0d8d7;
}

</style>
