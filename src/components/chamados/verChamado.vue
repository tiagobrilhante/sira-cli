<template>
  <v-container
    ref="contentToConvert"
    fluid>

    <!-- imagem, texto form atend, cod e aprov-->
    <v-row no-gutters>

      <!-- imagem-->
      <v-col
        class="my-border"
        cols="2">
        <v-img
          :src="require('@/assets/img/logoSer.png')"
          max-height="125"
          class="ma-5"
          alt="Logo Uninorte"
          contain
        />
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
              <v-img
                :src="require('@/assets/img/assinaturadigitalAluno.png')"
                :max-height="sizeDigitalSignature"
                class="pl-10"
                alt="Assinado Digitalmente"
                contain
              />
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
          Assinado por: {{ selectedSolicitacao.user_atendimento_resolucao.responsavel.nome }}
        </span>
        <v-img
          :src="require('@/assets/img/assinaturadigitalAluno.png')"
          :max-height="sizeDigitalSignature"
          class="pl-10"
          alt="Assinado Digitalmente"
          contain
        />
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

  </v-container>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'

export default {
  components: {},
  mixins: [logoutMixin],
  props: {
    selectedSolicitacao: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    configSis: config,
    sizeDigitalSignature: 80
  }),
  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado'])
  },

  watch: {
  },

  async mounted () {
  },
  beforeDestroy () {
  },

  methods: {
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
