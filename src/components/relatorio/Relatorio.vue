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
              @click="processarPDF">
              <v-icon class="pr-5">mdi-file-pdf-box</v-icon>
              Download PDF
            </v-btn>
          </v-col>
        </v-row>
      </v-alert>

      <!-- área designada aos dados-->
      <div ref="contentArea">
        <v-row>
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
                      class="font-size-12"
                      @imagesLoaded="handlePageImagesLoaded"/>
                  </div>
                </v-col>
              </v-row>
            </v-alert>
          </v-col>
        </v-row>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { logoutMixin } from '@/mixins'
import { mapGetters } from 'vuex'
import config from '../../http/config'
import VerChamado from '../chamados/verChamado.vue'
import html2canvas from 'html2canvas'
import JsPDF from 'jspdf'

export default {
  name: 'Relatorio',
  components: { VerChamado },
  mixins: [logoutMixin],

  data: () => ({
    configSis: config,
    vigenciasDisponiveis: [],
    vigenciaRelatorio: [],
    selectedVigencia: '',
    cursosDisponiveis: [],
    selectedCurso: '',
    loading: false,
    pagesLoaded: new Set(),
    totalPages: 0
  }),

  computed: {
    ...mapGetters(['usuarioLogado', 'usuarioEstaLogado']),
    allPagesLoaded () {
      return this.pagesLoaded.size === this.totalPages && this.totalPages > 0
    }
  },

  watch: {
    vigenciaRelatorio (newVal) {
      if (newVal.length > 0) {
        this.totalPages = newVal.length
        this.pagesLoaded.clear()
      }
    }
  },

  async mounted () {
    await this.getVigencias()
  },

  methods: {
    handlePageImagesLoaded () {
      this.pagesLoaded.add(Date.now())
    },

    async processarPDF () {
      if (!this.allPagesLoaded) {
        // Força carregamento de todas as páginas
        const contentArea = this.$refs.contentArea
        contentArea.style.visibility = 'hidden'
        contentArea.style.position = 'absolute'
        contentArea.style.top = '0'
        contentArea.style.height = 'auto'

        // Aguarda um pouco para garantir que tudo seja renderizado
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Restaura a visibilidade
        contentArea.style.visibility = ''
        contentArea.style.position = ''
        contentArea.style.top = ''
        contentArea.style.height = ''
      }

      await this.downloadPdf()
    },

    async downloadPdf () {
      this.loading = true

      try {
        const verChamadoPages = this.$refs.verChamadoPages
        const pdf = new JsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: 'a4'
        })

        const margin = 20
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()

        // Processa cada página
        for (let i = 0; i < verChamadoPages.length; i++) {
          const element = verChamadoPages[i]

          // Configuração do html2canvas
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 0,
            logging: false,
            backgroundColor: '#ffffff',
            onclone: (clonedDoc) => {
              const images = Array.from(clonedDoc.getElementsByTagName('img'))
              images.forEach(img => {
                img.style.maxHeight = 'none'
                img.style.height = 'auto'
              })

              const vImages = Array.from(clonedDoc.getElementsByClassName('v-image'))
              vImages.forEach(vImg => {
                const imgElement = vImg.querySelector('img')
                if (imgElement) {
                  const newImg = document.createElement('img')
                  newImg.src = imgElement.src
                  newImg.style.width = '100%'
                  newImg.style.height = '100%'
                  newImg.style.maxHeight = 'none'
                  vImg.parentNode.replaceChild(newImg, vImg)
                }
              })
            }
          })

          // Converte para imagem
          const imgData = canvas.toDataURL('image/jpeg', 1.0)

          // Calcula dimensões mantendo proporção
          let imgWidth = pageWidth - 2 * margin
          let imgHeight = (canvas.height * imgWidth) / canvas.width

          if (imgHeight > pageHeight - 2 * margin) {
            imgHeight = pageHeight - 2 * margin
            imgWidth = (canvas.width * imgHeight) / canvas.height
          }

          // Centraliza na página
          const x = (pageWidth - imgWidth) / 2
          const y = margin

          // Adiciona ao PDF
          pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'FAST')

          if (i < verChamadoPages.length - 1) {
            pdf.addPage()
          }
        }

        pdf.save('relatorio.pdf')
      } catch (error) {
        console.error('Erro ao gerar PDF:', error)
      } finally {
        this.loading = false
      }
    },

    async getVigencias () {
      try {
        const response = await this.$http.get('relatorios/vigencias')
        this.vigenciasDisponiveis = response.data
      } catch (erro) {
        console.error('Erro ao buscar vigências:', erro)
      }
    },

    async verificaCursos (vigencia) {
      this.selectedVigencia = vigencia
      this.vigenciaRelatorio = []
      this.cursosDisponiveis = []
      this.pagesLoaded.clear()

      try {
        const response = await this.$http.get(
          'relatorios/cursosvigentes/' + this.transformString(vigencia)
        )
        this.cursosDisponiveis = response.data
      } catch (erro) {
        console.error('Erro ao verificar cursos:', erro)
      }
    },

    async geraRelatorio (curso) {
      if (curso !== 'Todos') {
        this.selectedCurso = curso.nome + ' - ' + curso.unidade.nome
        curso = curso.id
      } else {
        this.selectedCurso = 'Todos'
      }

      try {
        const response = await this.$http.post('relatorios/pegarelatoriovigencia/', {
          vigencia: this.selectedVigencia,
          curso_id: curso
        })
        this.vigenciaRelatorio = response.data
      } catch (erro) {
        console.error('Erro ao gerar relatório:', erro)
      }
    },

    transformString (input) {
      return input.replace('.', '_')
    },

    ajustaCorBtnVigencia (vigencia) {
      return this.selectedVigencia === vigencia ? 'rgb(179,73,27)' : '#015088'
    },

    ajustaCorBtnCurso (curso) {
      return this.selectedCurso === curso ? 'rgb(179,73,27)' : '#015088'
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

.myrealce {
  background-color: #d0d8d7;
}

.font-size-12 {
  font-size: 25px;
}
</style>
