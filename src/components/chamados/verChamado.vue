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
          ref="logoImage"
          :src="logoSrc"
          :eager="true"
          max-height="125"
          class="ma-5"
          alt="Logo Uninorte"
          contain
          @load="handleImageLoad('logo')"
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
      <v-col
        class="my-border myrealce"
        cols="2">
        <span class="pl-2">
          <b>MATRICULA:</b>
        </span>
      </v-col>
      <v-col
        cols="5"
        class="my-border">
        <span class="pl-2">
          {{ selectedSolicitacao.aluno.matricula }}
        </span>
      </v-col>
      <v-col
        class="my-border myrealce"
        cols="2">
        <span class="pl-2">
          <b>PERÍODO:</b>
        </span>
      </v-col>
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
      <v-col
        class="my-border myrealce"
        cols="2">
        <span class="pl-2">
          <b>CURSO:</b>
        </span>
      </v-col>
      <v-col
        cols="5"
        class="my-border">
        <span class="pl-2">
          {{ selectedSolicitacao.curso.nome }}
        </span>
      </v-col>
      <v-col
        class="my-border myrealce"
        cols="2">
        <span class="pl-2">
          <b>TURMA:</b>
        </span>
      </v-col>
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
        <v-col class="my-border text-justify pa-3">
          {{ selectedSolicitacao.descricao }}
          <br>
          <br>
          <v-row>
            <v-col>DATA: {{ formatDate(selectedSolicitacao.data_solicitacao) }}</v-col>
            <v-col class="text-center">
              <v-img
                ref="assinaturaImage1"
                :src="assinaturaDigitalSrc"
                :max-height="sizeDigitalSignature"
                :eager="true"
                class="pl-10"
                alt="Assinado Digitalmente"
                contain
                @load="handleImageLoad('assinatura1')"
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
          ref="assinaturaImage2"
          :src="assinaturaDigitalSrc"
          :max-height="sizeDigitalSignature"
          :eager="true"
          class="pl-10"
          alt="Assinado Digitalmente"
          contain
          @load="handleImageLoad('assinatura2')"
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
        <h3 v-if="selectedSolicitacao.data_solucao !== '' && selectedSolicitacao.status !=='Aberto'">
          {{ formatDate(selectedSolicitacao.data_solucao) }}
        </h3>
      </v-col>
      <v-col
        cols="2"
        class="my-border text-left myrealce">
        <h3 class="pl-2">DATA:</h3>
      </v-col>
      <v-col
        class="my-border text-center">
        <h3 v-if="selectedSolicitacao.data_solucao !== '' && selectedSolicitacao.status !=='Aberto'">
          {{ formatDate(selectedSolicitacao.data_solucao) }}
        </h3>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { logoutMixin } from '@/mixins'
import { mapGetters } from 'vuex'
import config from '../../http/config'

export default {
  name: 'VerChamado',
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
    sizeDigitalSignature: 80,
    logoSrc: require('@/assets/img/logoSer.png'),
    assinaturaDigitalSrc: require('@/assets/img/assinaturadigitalAluno.png'),
    loadedImages: {
      logo: false,
      assinatura1: false,
      assinatura2: false
    }
  }),

  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado']),
    allImagesLoaded () {
      return Object.values(this.loadedImages).every(loaded => loaded)
    }
  },

  watch: {
    allImagesLoaded (newVal) {
      if (newVal) {
        this.$emit('imagesLoaded')
      }
    }
  },

  async mounted () {
    await this.preloadAllImages()
  },

  methods: {
    handleImageLoad (imageKey) {
      this.$set(this.loadedImages, imageKey, true)
    },

    async preloadAllImages () {
      const images = [
        { key: 'logo', src: this.logoSrc },
        { key: 'assinatura1', src: this.assinaturaDigitalSrc },
        { key: 'assinatura2', src: this.assinaturaDigitalSrc }
      ]

      await Promise.all(
        images.map(({ key, src }) => {
          return new Promise((resolve) => {
            const img = new Image()
            img.onload = () => {
              this.$set(this.loadedImages, key, true)
              resolve()
            }
            img.onerror = () => {
              this.$set(this.loadedImages, key, true)
              resolve()
            }
            img.src = src
          })
        })
      )
    },

    formatDate (dateString) {
      if (!dateString) return ''
      const [datePart] = dateString.split(' ')
      const [year, month, day] = datePart.split('-')
      return `${day}/${month}/${year}`
    },

    retornaObjetoCursoPeriodoTurnoTurma (codigo) {
      if (!codigo || codigo.length < 12) return {}

      return {
        unidade: codigo.substring(0, 3),
        curso: codigo.substring(3, 6),
        numero_constante: codigo.substring(6, 8),
        identificador_periodo: codigo.substring(8, 10),
        turno: codigo.substring(10, codigo.length - 1),
        codigo_turma: codigo.substring(codigo.length - 1),
        geral: codigo
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
