<template>
  <v-main class="bgConfig">

    <!--Barra de navegação da área administrativa-->
    <BarraNavegacao></BarraNavegacao>
    <!-- container básico-->
    <v-container class="mb-0" fluid>

      <!-- espaço geral-->
      <v-row dense>

        <!-- Banner / voltar-->
        <v-col>
          <!--Banner (cabecalho, criar cabeçalho e btn de voltar-->
          <v-alert
            class="p-5"
            elevation="21"
          >
            <v-row>
              <!--cabecalho-->
              <v-col>
                <h2>
                  <v-icon
                    class="mr-4"
                    size="36">
                    mdi-view-dashboard-variant-outline
                  </v-icon>
                  Gerenciamento de Dashboards
                </h2>
              </v-col>

              <!-- btn criar e voltar-->
              <v-col class="text-right">

                <v-btn :color="btnData.color" @click="statusSpaceAdd">
                  <v-icon class="mr-4" small>{{ btnData.icone }}</v-icon>
                  {{ btnData.texto }}
                </v-btn>

                <!-- voltar-->
                <v-btn color="primary" to="/home">
                  <v-icon class="mr-4" small>mdi-home</v-icon>
                  Voltar
                </v-btn>

              </v-col>

            </v-row>

          </v-alert>

          <v-alert elevation="12">
            <v-row>
              <v-col>
                <h2>Recuperar Dashboards</h2>
              </v-col>
              <v-col class="text-right pt-5">
                Digite a hash e aperte enter
              </v-col>
              <v-col>
                <v-text-field
                  v-model="searchDashboard"
                  append-icon="mdi-magnify"
                  dense
                  hide-details
                  label="Pesquisar"
                  outlined
                  placeholder="Pesquisar"
                  single-line
                  @keydown.enter="fazBuscaDash()"
                ></v-text-field>
              </v-col>
            </v-row>

          </v-alert>

          <!-- alert de dashboard-->
          <v-row v-if="spaceMostraCadastrado">
            <v-col>

              <v-data-table
                v-if="dashCadastrados.length > 0"
                :headers="headers"
                :items="dashCadastrados"
                :search="search"
                class="elevation-21 mt-0"
                dense
                sort-by="nome"
              >
                <!-- template para titulo e search-->
                <template v-slot:top>
                  <v-toolbar
                    flat
                  >
                    <!-- Título da tabela-->
                    <v-toolbar-title>Tabela de Dashboards Cadastrados</v-toolbar-title>

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

                <!--Template de ativo -->
                <template v-slot:item.ativo="{ item }">
                  <span v-if="item.ativo"> Sim</span>
                  <span v-else>Não</span>
                </template>

                <!--Template de destaque -->
                <template v-slot:item.destaque="{ item }">
                  <v-chip v-if="item.destaque" color="black" small>
                    <span> <v-icon class="pb-1 pt-1" color="yellow" small>mdi-star</v-icon></span>
                  </v-chip>
                </template>

                <!--Template de botões para editar, excluir -->
                <template v-slot:item.actions="{ item }">

                  <!--detalhes-->
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        class="mr-2"
                        small
                        v-bind="attrs"
                        @click="openDialogVerDash(item)"
                        v-on="on"
                      >
                        mdi-magnify
                      </v-icon>
                    </template>
                    <span>Exibir Dashboard</span>
                  </v-tooltip>

                  <!--editar dashboard-->
                  <!--
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        class="mr-2"
                        small
                        v-bind="attrs"
                        @click="openDialogAddEditUser('edit', item)"
                        v-on="on"
                      >
                        mdi-pen
                      </v-icon>
                    </template>
                    <span>Editar Dashboard</span>
                  </v-tooltip>
                  -->

                  <!--Excluir-->
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        class="mr-2"
                        small
                        v-bind="attrs"
                        @click="openDialogDeteleDash(item)"
                        v-on="on"
                      >
                        mdi-delete
                      </v-icon>
                    </template>
                    <span>Excluir DashBoard</span>
                  </v-tooltip>

                </template>

              </v-data-table>

              <v-alert v-else elevation="12">
                Nenhum dashboard cadastrado.
              </v-alert>
            </v-col>
          </v-row>

          <!-- area de criação de dashboard-->
          <v-alert v-if="spaceAdd" elevation="12">
            <h3>Criação de dashboard</h3>

            <!-- nome da tela,ativo e adicionar linha-->
            <v-row>
              <!--nome da tela-->
              <v-col>
                <span class="pl-3">Nome do Dashboard</span>
                <v-text-field
                  v-model="nomeTela"
                  dense
                  label="Nome do Dashboard"
                  rounded
                  solo
                ></v-text-field>
              </v-col>

              <!-- ativo-->
              <v-col cols="1">
                <v-checkbox
                  v-model="ativo"
                  class="pt-3"
                  hide-details
                  label="Ativo"
                ></v-checkbox>
              </v-col>

              <!-- Destaque-->
              <v-col cols="1">
                <v-checkbox v-if="ativo"
                            v-model="destaque"
                            class="pt-3"
                            hide-details
                            label="Destaque"
                ></v-checkbox>
              </v-col>

              <!-- adicionar linha-->
              <v-col>
                <v-btn block class="mt-6 mb-4" color="success" rounded @click="addLinha">
                  <v-icon class="pr-4">mdi-plus</v-icon>
                  Adicionar linha
                </v-btn>
              </v-col>

            </v-row>

            <!-- cabeçalho de linha e excluir linha-->
            <v-alert v-for="(linha,index) in arrayLinhas" :key="index" color="cyan" elevation="12">

              <!-- qual linha e excluir linha-->
              <v-row>
                <!-- qual linha-->
                <v-col><b>Linha: </b>{{ index + 1 }}</v-col>

                <!-- excluir linha-->
                <v-col class="text-right">
                  <v-btn color="error" small @click="excluiLinha(linha.id)">
                    <v-icon small>mdi-trash-can-outline</v-icon>
                  </v-btn>
                </v-col>

              </v-row>

              <br>

              <!-- Linha e adicionar tela-->
              <v-row>

                <!-- btn add tela-->
                <v-col cols="2">
                  <v-btn block color="secondary" small @click="addTela(linha.id)">
                    <v-icon class="mr-3" x-small>mdi-plus-circle</v-icon>
                    Adicionar tela
                  </v-btn>
                </v-col>

                <v-col cols="10">
                  <v-row>
                    <!-- espaço para definoição de telas-->
                    <v-col v-for="tela in linha.telas" :key="tela.index" :cols="12/linha.telas.length">
                      <!-- info da tela e btn de excluir tela-->
                      <v-alert elevation="10">

                        <!-- cabeçalho-->
                        <v-row>
                          <!-- info da tela-->
                          <v-col cols="6">
                            <b>Tela: </b>{{ tela.tela.nome }}<br>
                            <b>Hash: </b>{{ tela.tela.hash }}<br>
                          </v-col>

                          <!-- btn para exluir tela e ver a tela-->
                          <v-col class="text-right" cols="6">
                            <v-btn color="success" small @click="openDialogVerTela(tela.tela)">
                              <v-icon small>mdi-magnify</v-icon>
                            </v-btn>
                            <v-btn color="error" small @click="excluiTela(linha.id, tela.id)">
                              <v-icon small>mdi-trash-can-outline</v-icon>
                            </v-btn>
                          </v-col>
                        </v-row>

                      </v-alert>

                    </v-col>
                  </v-row>

                </v-col>

              </v-row>

            </v-alert>

            <v-row v-if="isReadyToSave">
              <v-col cols="12">
                <v-btn block class="primary" @click="salvaDash">Salvar Dashboard</v-btn>
              </v-col>
            </v-row>

          </v-alert>

        </v-col>

      </v-row>

      <!--Dialog para add tela usuário-->
      <v-dialog v-model="dialogAddTela" max-width="800px">
        <v-card>
          <v-card-title class="justify-center" primary-title>
            Selecione a tela
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col>
                <span class="pl-3">Selecione a tela</span>
                <v-select
                  v-model="telaSelecionada"
                  :items="telasDisponiveis"
                  class="ml-3"
                  clearable
                  dense
                  item-text="nome"
                  item-value="id"
                  label="Selecione a tela"
                  name="tela"
                  return-object
                  rounded
                  solo
                ></v-select>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer></v-spacer>
            <v-btn color="grey lighten-1" @click="dialogAddTela = false">Cancelar</v-btn>
            <span class="pl-5 pr-5"></span>
            <v-btn color="success" @click="doAddTela">Selecionar</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!--Dialog para ver detalhes dashboard-->
      <v-dialog v-model="dialogDetalheDashboard" max-width="95%">
        <v-card>
          <v-card-title class="justify-center" primary-title>
            <v-row>
              <v-col cols="1"></v-col>
              <v-col class="text-center">Dashboard {{ dadosDashboard.nome }}</v-col>
              <v-col class="text-right" cols="1">
                <v-btn color="transparent" rounded @click="dialogDetalheDashboard = false"><h2>X</h2></v-btn>
              </v-col>
            </v-row>

          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col>
                <VerDashboard v-if="dialogDetalheDashboard" :dados="dadosDashboard" />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer></v-spacer>
            <v-btn color="grey lighten-1" @click="dialogDetalheDashboard = false">Fechar</v-btn>
            <span class="pl-5 pr-5"></span>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!--Dialog para deletar dashboard-->
      <v-dialog v-model="dialogDeleteDash" max-width="800px">
        <v-card>
          <v-card-title class="justify-center" primary-title>
            <v-icon
              class="mr-4">
              fa fa-exclamation-triangle
            </v-icon>
            Você tem certeza que quer deletar esse DashBoard?
            <v-icon
              class="ml-4">
              fa fa-exclamation-triangle
            </v-icon>
          </v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col><b>Nome: </b>{{ selectedDash.nome }}</v-col>
              <v-col><b>Hash: </b>{{ selectedDash.hash }}</v-col>
            </v-row>
            <v-row dense>
              <v-col><b>Ativo: </b><span v-if="selectedDash.ativo">Sim</span><span v-else>Não</span></v-col>
              <v-col><b>Destaque: </b><span v-if="selectedDash.destaque">Sim</span><span v-else>Não</span></v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer></v-spacer>
            <v-btn color="grey lighten-1" @click="dialogDeleteDash = false">Cancelar</v-btn>
            <span class="pl-5 pr-5"></span>
            <v-btn color="error" @click="doDeleteDash">Excluir</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!--Dialog para ver tela-->
      <v-dialog v-model="dialogVerTela" max-width="75%">
        <v-card>
          <v-card-title class="justify-center" primary-title>
            Detalhes da Tela
          </v-card-title>
          <v-card-text>
            <TelaVer v-if="dialogVerTela" :selectedTela="this.telaPraVer"></TelaVer>
          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer></v-spacer>
            <v-btn color="grey lighten-1" @click="dialogVerTela = false">Fechar</v-btn>
            <span class="pl-5 pr-5"></span>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!--Dialog para ver dashboard-->
      <v-dialog v-model="dialogVerDashBoard" max-width="90%">
        <v-card>
          <v-card-title>
            <v-row>
              <v-col>Detalhes do Dashboard</v-col>
              <v-col class="text-right"> <v-btn color="grey lighten-1" class="link" @click="dialogVerDashBoard = false" rounded>X</v-btn></v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <VerDashboard v-if="dialogVerDashBoard" :dados="dadosDashboardVer" @ajustaDashSalvas="handleResetaDashSalva"/>
          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer></v-spacer>
            <span class="pl-5 pr-5"></span>
            <v-btn color="grey lighten-1" @click="dialogVerDashBoard = false">Fechar</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>
  </v-main>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import BarraNavegacao from '../barra-navegacao/BarraNavegacao.vue'
import Tela from '../telas/Tela.vue'
import TelaVer from '../telas/TelaVer.vue'
import VerDashboard from './VerDashboard.vue'

export default {
  name: 'gerenciamentodetelas',
  mixins: [logoutMixin],
  components: {Tela, BarraNavegacao, TelaVer, VerDashboard},
  data: () => ({
    arrayLinhas: [],
    dialogAddTela: false,
    telaSelecionada: {},
    telasDisponiveis: [],
    constantId: 0,
    nomeTela: '',
    ativo: false,
    destaque: false,
    dashCadastrados: [],
    spaceAdd: false,
    spaceMostraCadastrado: true,
    btnData: {
      texto: 'Criar Dashboard',
      icone: 'mdi-plus',
      color: 'success'
    },
    isReadyToSave: false,
    search: '',
    headers: [
      {
        text: 'Nome',
        align: 'start',
        value: 'nome'
      },
      {
        text: 'Hash',
        align: 'start',
        value: 'hash'
      },
      {
        text: 'Ativo',
        align: 'center',
        value: 'ativo'
      },
      {
        text: 'Destaque',
        align: 'center',
        value: 'destaque'
      },
      {
        text: 'Actions',
        value: 'actions',
        align: 'center',
        sortable: false
      }
    ],
    dialogDetalheDashboard: false,
    dadosDashboard: {},
    dialogDeleteDash: false,
    selectedDash: {},
    reajustaGrafico: false,
    telaPraVer: {},
    dialogVerTela: false,
    searchDashboard: '',
    dialogVerDashBoard: false,
    dadosDashboardVer: ''
  }),
  props: {},

  computed: {
    ...mapGetters(['usuarioLogado'])
  },

  created () {
  },

  watch: {
    arrayLinhas: {
      handler (newVal) {
        this.isReadyToSave = newVal.some(linha => linha.telas && linha.telas.length > 0)
      },
      deep: true
    }
  },

  async mounted () {
    await this.getDashCadastrado()
  },

  methods: {
    async getDashCadastrado () {
      try {
        this.$http.get('dashboard')
          .then(response => {
            this.dashCadastrados = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    addLinha () {
      this.arrayLinhas.push({
        id: this.arrayLinhas.length + 1,
        telas: []
      })
    },

    addTela (id) {
      this.dialogAddTela = true
      try {
        this.$http.get('tela/pegatelas')
          .then(response => {
            this.telasDisponiveis = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
      this.constantId = id
    },

    doAddTela () {
      let maxTelaId = 0

      // Find the maximum tela ID
      for (let i = 0; i < this.arrayLinhas.length; i++) {
        for (let j = 0; j < this.arrayLinhas[i].telas.length; j++) {
          if (this.arrayLinhas[i].telas[j].id > maxTelaId) {
            maxTelaId = this.arrayLinhas[i].telas[j].id
          }
        }
      }

      // Increment the maximum tela ID by 1 for the new tela ID
      const newTelaId = maxTelaId + 1

      // Add the new tela to the specified linha
      for (let i = 0; i < this.arrayLinhas.length; i++) {
        if (this.arrayLinhas[i].id === this.constantId) {
          this.arrayLinhas[i].telas.push({
            id: newTelaId,
            tela: this.telaSelecionada
          })
        }
      }
      this.dialogAddTela = false
      this.telaSelecionada = {}
    },

    excluiLinha (id) {
      for (let i = 0; i < this.arrayLinhas.length; i++) {
        if (this.arrayLinhas[i].id === id) {
          this.arrayLinhas.splice(i, 1)
        }
      }
    },

    excluiTela (linhaid, telaid) {
      for (let i = 0; i < this.arrayLinhas.length; i++) {
        if (this.arrayLinhas[i].id === linhaid) {
          for (let j = 0; j < this.arrayLinhas[i].telas.length; j++) {
            if (this.arrayLinhas[i].telas[j].id === telaid) {
              this.arrayLinhas[i].telas.splice(j, 1)
            }
          }
        }
      }
    },

    salvaDash () {
      this.arrayLinhas.unshift({
        nome: this.nomeTela,
        ativo: this.ativo,
        destaque: this.destaque
      })
      try {
        this.$http.post('dashboard', this.arrayLinhas)
          .then(response => {
            this.getDashCadastrado()
            this.statusSpaceAdd()
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    statusSpaceAdd () {
      if (this.spaceAdd) {
        this.spaceAdd = false
        this.spaceMostraCadastrado = true

        this.btnData = {
          texto: 'Criar Dashboard',
          icone: 'mdi-plus',
          color: 'success'
        }
        this.resetaTudo()
      } else {
        this.spaceAdd = true
        this.spaceMostraCadastrado = false

        this.btnData = {
          texto: 'Cancelar',
          icone: 'mdi-cancel',
          color: 'secondary'
        }
      }
    },

    resetaTudo () {
      this.arrayLinhas = []
      this.telaSelecionada = {}
      this.constantId = 0
      this.nomeTela = ''
      this.ativo = false
      this.destaque = false
      this.isReadyToSave = false
    },

    openDialogVerDash (item) {
      try {
        this.$http.get('dashboard/' + item.id)
          .then(response => {
            this.dadosDashboard = response.data
            this.dialogDetalheDashboard = true
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    openDialogDeteleDash (item) {
      this.dialogDeleteDash = true
      this.selectedDash = item
    },

    doDeleteDash () {
      this.$http.delete('dashboard/' + this.selectedDash.id)
        // eslint-disable-next-line no-return-assign
        .then(() => {
          this.spaceAdd = true
          this.getDashCadastrado()
          this.statusSpaceAdd()
          this.dialogDeleteDash = false
          this.$toastr.s(
            'Dashboard removido com sucesso', 'Sucesso!'
          )
        }, err => {
          console.log(err)
          this.$toastr.e(
            'Não foi possível remover o Dashboard', 'Erro!'
          )
        })
    },

    openDialogVerTela (tela) {
      this.telaPraVer = tela
      this.dialogVerTela = true
    },

    fazBuscaDash () {
      try {
        this.$http.post('dashboard/existehash', this.searchDashboard)
          .then(response => {
            this.dadosDashboardVer = {}
            console.log(response.data)
            if (response.data[0] > 0) {
              this.dialogVerDashBoard = true
              this.dadosDashboardVer = response.data[1]
              this.searchDashboard = ''
            } else {
              this.$toastr.e(
                'Não existem dashboards cadastrados com esse Hash', 'Erro!'
              )
              this.searchDashboard = ''
            }
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    handleResetaDashSalva () {
      console.log('entrei aqui')
      this.getDashCadastrado()
      this.dialogVerDashBoard = false
    }
  }
}
</script>
<style>
</style>
