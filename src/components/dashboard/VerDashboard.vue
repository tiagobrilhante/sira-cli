<template>
  <v-container fluid>
    <v-row v-if="$route.path === '/gerenciadasboard'" dense>
      <v-col>
      </v-col>
      <v-col v-if="usuarioLogado.id !== dados.user_id" class="text-right">
        <v-btn color="primary" small @click="openDialogSaveDash(dados.hash)">
          <v-icon class="pr-4" small>mdi-content-save-outline</v-icon>
          Salvar Dashboard
        </v-btn>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col><b>Nome: </b>{{ dados.nome }}</v-col>
      <v-col><b>Hash: </b>{{ dados.hash }}</v-col>
    </v-row>
    <v-row dense>
      <v-col><b>Ativo: </b><span v-if="dados.ativo">Sim</span><span v-else>Não</span></v-col>
      <v-col><b>Destaque: </b><span v-if="dados.destaque">Sim</span><span v-else>Não</span></v-col>
    </v-row>
    <br>
    <hr>
    <br>

    <v-row v-for="linha in dados.linhas" :key="linha.id">
      <v-col v-for="coluna in linha.colunas" :key="coluna.id">
        <TelaVer :selectedTela="coluna.tela"/>
      </v-col>
    </v-row>

    <!--Dialog para salvar Dash-->
    <v-dialog v-model="dialogSaveDash" max-width="800px">
      <v-card>
        <v-card-title class="justify-center" primary-title>
          Salvar Dashboard
        </v-card-title>
        <v-card-text>
          <!--nome da dash-->
          <v-row class="pb-0 mb-0" dense>
            <v-col>
              <span class="pl-3">Nome do Dashboard</span>
              <v-text-field
                v-model="objTela.nome"
                dense
                hint="Escreva algo para identificar esse dashboard"
                label="Nome do Dashboard"
                rounded
                solo
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row class="mt-0 pt-0 text-center" dense>
            <!-- ativo-->
            <v-col cols="6">
              <v-checkbox
                v-model="objTela.ativo"
                hide-details
                label="Ativo"
              ></v-checkbox>
            </v-col>

            <!-- Destaque-->
            <v-col cols="6">
              <v-checkbox v-if="objTela.ativo"
                          v-model="objTela.destaque"
                          class="pt-3"
                          hide-details
                          label="Destaque"
              ></v-checkbox>
            </v-col>
          </v-row>

        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="success" @click="doSaveDash">Salvar</v-btn>
          <span class="pl-5 pr-5"></span>
          <v-btn color="grey lighten-1" @click="dialogSaveDash = false">Cancelar</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import TelaVer from '../telas/TelaVer.vue'

export default {
  name: 'verDashboard',
  mixins: [logoutMixin],
  components: {TelaVer},
  data: () => ({
    dialogSaveDash: false,
    objTela: {
      nome: '',
      ativo: false,
      destaque: false,
      hashOriginal: ''
    },
    hashAtivo: ''
  }),
  props: {
    dados: Object
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
    openDialogSaveDash () {
      this.dialogSaveDash = true
      this.hashAtivo = this.dados.hash
    },

    doSaveDash () {
      if (this.objTela.nome === '') {
        this.$toastr.e(
          'O nome do dashboard é obrigatório', 'Erro!'
        )
      } else {
        this.objTela.hashOriginal = this.hashAtivo
        try {
          this.$http.post('dashboard/savedashcapturado', this.objTela)
            .then(() => {
              this.$toastr.s(
                'Dashboard cadastrado com sucesso', 'Sucesso!'
              )
              this.dialogSaveDash = false
              this.objTela = {
                nome: '',
                ativo: false,
                destaque: false,
                hashOriginal: ''
              }
              this.$emit('ajustaDashSalvas')
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
</style>
