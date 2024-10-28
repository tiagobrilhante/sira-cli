<template>
  <v-main>

    <BarraNavegacao/>

    <v-container>
      <br>
      <!--cabeçalho-->
      <v-row>

        <v-col
          cols="8"
          offset="2">
          <v-alert
            class="ma-0 bordaBranca"
            color="#015088"
            dense
            rounded="xxl">

            <v-row>
              <v-col
                class="text-left align-self-start align-content-start"
                cols="4">
                <img
                  :src="require('@/assets/icons/ser_educacional_branco.png')"
                  alt="Logo Uninorte"
                  width="100%">
              </v-col>
              <v-col
                class="text-center"
                cols="8">
                <h1 class="white--text pt-4"><i>{{ configSis.nomeSis }}</i></h1>
                <h3 class="white--text">{{ configSis.labelSis }}</h3>
              </v-col>
            </v-row>

          </v-alert>
        </v-col>
      </v-row>

      <!--seleção de opcoes-->
      <v-row>
        <v-col
          cols="8"
          offset="2">
          <v-alert
            class="text-center bordaBranca"
            color="#015088"
            rounded="xxl">
            <img
              :src="require('@/assets/img/logo-ser-branca.png')"
              alt="Logo Uninorte"
              width="200px"> <br><br>

            <!-- abrir solicitação-->
            <v-btn
              block
              rounded
              class="white--text"
              color="rgb(250, 115, 59)"
              @click="openDialog('solicita')">Abrir uma
              solicitação
            </v-btn>
            <br>

            <!-- acompanhar solicitação-->
            <v-btn
              rounded
              block
              class="white--text"
              color="rgb(250, 115, 59)"
              @click="openDialog('acompanha')">Acompanhar
              solicitações
              abertas
            </v-btn>
          </v-alert>
        </v-col>
      </v-row>

    </v-container>

    <!--Dialog Geral -->
    <v-dialog
      v-model="dialogGeral"
      :max-width="tamanhoDialog()"
      persistent
      scrollable>
      <v-card
        color="#015088"
        rounded="xxl">
        <!--titulo e botão fechar-->
        <v-card-title class="justify-center text-center">
          <v-row>
            <v-col cols="1"/>
            <v-col
              class="text-h4 white--text"
              cols="10">
              <b>{{ objetoDialog.cabecalho }}</b>
            </v-col>
            <v-col
              cols="1"
              class="text-right">
              <v-btn
                rounded
                class="white--text"
                color="rgb(250, 115, 59)"
                @click="closeAndReset()"><v-icon color="white">mdi-close-circle-outline</v-icon></v-btn>
            </v-col>
          </v-row>

        </v-card-title>

        <!-- card Text-->
        <v-card-text>

          <AberturaChamado
            v-if="objetoDialog.action_type === 'Solicitação'"
            ref="aberturaChamado"
            @close-and-reset="closeAndReset"/>
          <Login
            v-if="objetoDialog.action_type === 'Verificação'"
            :tipo="tipo"
            @countdown-finished="onCountdownFinished"/>

        </v-card-text>

        <!-- actions (fechar)-->
        <v-card-actions class="pb-5">
          <v-spacer/>
          <v-btn
            rounded
            class="white--text mr-2"
            color="rgb(250, 115, 59)"
            @click="closeAndReset()">
            <v-icon
              color="white"
              class="mr-3">mdi-close-circle-outline</v-icon> Fechar
          </v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

  </v-main>

</template>

<script>import config from '../http/config'
import BarraNavegacao from '../components/barra-navegacao/BarraNavegacao'
import AberturaChamado from '../components/chamados/AberturaChamado'
import Login from '../components/login/Login.vue'
import Cadastro from '../components/cadastro/Cadastro.vue'
import FormularioAtendimento from '../components/chamados/FormularioAtendimento.vue'

export default {

  components: {FormularioAtendimento, Cadastro, BarraNavegacao, AberturaChamado, Login},
  data () {
    return {
      configSis: config,
      dialogGeral: false,
      objetoDialog: {
        'cabecalho': '',
        'txt_button': '',
        'action_type': ''
      },
      tipo: 'Aluno'
    }
  },
  computed: {},
  methods: {
    openDialog (acao) {
      this.dialogGeral = true

      this.$nextTick(() => {
        if (acao === 'solicita' && this.$refs.aberturaChamado) {
          this.$refs.aberturaChamado.matricula = ''
        }
      })

      if (acao === 'solicita') {
        this.objetoDialog = {
          'cabecalho': 'Solicitação de Atendimento',
          'txt_button': 'Solicitar',
          'action_type': 'Solicitação'
        }
      } else {
        this.objetoDialog = {
          'cabecalho': 'Verificação de Atendimentos',
          'txt_button': 'Verificar',
          'action_type': 'Verificação'
        }
      }
    },

    closeAndReset () {
      this.$store.commit('DESLOGAR_USUARIO')
      this.dialogGeral = false
      this.$root.$emit('reset-matricula')
      this.objetoDialog = {
        cabecalho: '',
        txt_button: '',
        action_type: ''
      }
    },

    tamanhoDialog () {
      if (this.objetoDialog.action_type === 'Solicitação') {
        return '90%'
      } else {
        return '60%'
      }
    },

    onCountdownFinished () {
      this.closeAndReset()
    }
  }
}
</script>
<style>
.bordaBranca {
  position: relative;
}

.bordaBranca::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 3px solid white;
  pointer-events: none;
  border-radius: 30px;
}

.bordaAzul {
  position: relative;
}

.bordaAzul::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 3px solid #cd7f0d;
  pointer-events: none;
  border-radius: 30px;
}
</style>
