<template>
  <v-row>
    <v-col>

      <!-- seleção de vigências disponíveis-->
      <v-alert
        color="rgb(250, 115, 59)"
        rounded="xxl">
        <v-row>
          <v-col>
            <h3 class="white--text">Selecione o período de vigência para gerar o relatório.</h3>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            v-for="(vigencia, index) in vigenciasDisponiveis"
            :key="index"
            cols="1">
            <v-btn
              :color="ajustaCorBtnVigencia(vigencia)"
              block
              rounded
              class="white--text"
              @click="verificaCursos(vigencia)">{{ vigencia }}</v-btn>
          </v-col>
        </v-row>
      </v-alert>

      <!-- cursos disponiveis-->
      <v-alert
        v-if="selectedVigencia !== ''"
        color="rgb(250, 115, 59)"
        rounded="xxl">
        <v-row>
          <v-col>
            <h3 class="white--text">Selecione os cursos para gerar o relatório.</h3>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn
              :color="ajustaCorBtnCurso('Todos')"
              rounded
              class="white--text mr-4"
              @click="geraRelatorio('Todos')">Todos</v-btn>

            <v-btn
              v-for="curso in cursosDisponiveis"
              :key="curso.id"
              :color="ajustaCorBtnCurso(curso.nome + ' - ' + curso.unidade.nome)"
              rounded
              class="white--text mr-5"
              @click="geraRelatorio(curso)">{{ curso.nome }} - {{ curso.unidade.nome }}</v-btn>
          </v-col>
        </v-row>

      </v-alert>

      <!-- vigencia selecionada e download-->
      <v-alert
        v-if="vigenciaRelatorio.length > 0"
        color="#015088"
        rounded="xxl">
        <v-row>
          <v-col>
            <h2 class="white--text">Vigência: {{ selectedVigencia }} - {{ selectedCurso }}</h2>
          </v-col>

          <v-col
            class="text-right"
            cols="4">
            <v-btn
              :loading="loading"
              block
              rounded
              class="white--text"
              color="rgb(250, 115, 59)"
              @click="downloadPdf">
              <v-icon class="pr-5">mdi-file-pdf-box</v-icon>
              Download PDF</v-btn>
          </v-col>
        </v-row>

      </v-alert>

      <!-- área designada aos dados-->
      <v-row ref="contentToConvert">
        <v-col>
          <v-alert
            v-if="vigenciaRelatorio.length > 0"
            rounded="xxl"
            elevation="15">
            <v-row
              v-for="selectedSolicitacao in vigenciaRelatorio"
              :key="selectedSolicitacao.id">
              <v-col>
                <div ref="verChamadoPages">
                  <VerChamado
                    :selected-solicitacao="selectedSolicitacao"
                    class="font-size-12"/>
                </div>
              </v-col>
            </v-row>

          </v-alert>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'
import VerChamado from '../chamados/verChamado.vue'
import html2canvas from 'html2canvas'
import JsPDF from 'jspdf'

export default {
  components: {VerChamado},
  mixins: [logoutMixin],
  data: () => ({
    configSis: config,
    vigenciasDisponiveis: [],
    vigenciaRelatorio: [],
    selectedVigencia: '',
    cursosDisponiveis: [],
    selectedCurso: '',
    loading: false
  }),
  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado'])
  },

  watch: {
    vigenciaRelatorio (newVal) {
      if (newVal.length > 0) {
        this.startLoading()
      }
    }
  },

  async mounted () {
    await this.getVigencias()
  },
  beforeDestroy () {
  },

  methods: {
    async startLoading () {
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 4000)
    },

    async getVigencias () {
      try {
        this.$http.get('relatorios/vigencias')
          .then(response => {
            this.vigenciasDisponiveis = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    async verificaCursos (vigencia) {
      this.selectedVigencia = vigencia
      this.vigenciaRelatorio = []
      this.cursosDisponiveis = []

      try {
        this.$http.get('relatorios/cursosvigentes/' + this.transformString(vigencia))
          .then(response => {
            this.cursosDisponiveis = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    async geraRelatorio (curso) {
      if (curso !== 'Todos') {
        this.selectedCurso = curso.nome + ' - ' + curso.unidade.nome
        curso = curso.id
      } else {
        this.selectedCurso = 'Todos'
      }

      let objetoEnvio = {}
      objetoEnvio['vigencia'] = this.selectedVigencia
      objetoEnvio['curso_id'] = curso

      try {
        this.$http.post('relatorios/pegarelatoriovigencia/', objetoEnvio)
          .then(response => {
            this.vigenciaRelatorio = response.data
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    transformString (input) {
      return input.replace('.', '_')
    },

    async downloadPdf () {
      this.loading = true

      const verChamadoPages = this.$refs.verChamadoPages
      const pdf = new JsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      })

      const margin = 20 // Adjust this value as needed
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      for (let i = 0; i < verChamadoPages.length; i++) {
        const element = verChamadoPages[i]

        const canvas = await html2canvas(element, {
          scale: 2,
          onclone: (clonedDoc) => {
            const images = clonedDoc.querySelectorAll('img')
            images.forEach((img) => {
              if (!img.complete) {
                img.onload = () => {}
              }
            })
          }
        })

        const imgData = canvas.toDataURL('image/jpeg', 1.0)

        let imgWidth = pageWidth - 2 * margin
        let imgHeight = (canvas.height * imgWidth) / canvas.width

        if (imgHeight > pageHeight - 2 * margin) {
          imgHeight = pageHeight - 2 * margin
          imgWidth = (canvas.width * imgHeight) / canvas.height
        }

        const centeredPositionX = (pageWidth - imgWidth) / 2
        const positionY = margin

        pdf.addImage(
          imgData,
          'JPEG',
          centeredPositionX,
          positionY,
          imgWidth,
          imgHeight
        )

        if (i < verChamadoPages.length - 1) {
          pdf.addPage()
        }
      }

      const namefile = `relatorio.pdf`
      pdf.save(namefile)
      this.loading = false
    },

    ajustaCorBtnVigencia (vigencia) {
      if (this.selectedVigencia === vigencia) {
        return 'rgb(179,73,27)'
      } else {
        return '#015088'
      }
    },

    ajustaCorBtnCurso (curso) {
      if (this.selectedCurso === curso) {
        return 'rgb(179,73,27)'
      } else {
        return '#015088'
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

.font-size-12 {
  font-size: 25px;
}

</style>
