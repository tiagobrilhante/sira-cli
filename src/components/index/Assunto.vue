<template>
  <!--container para informações default-->
  <v-container fill-height fluid>

    <!--caso nao haja itens-->
    <v-row v-if="qtdAssuntos === 0">
      <v-col>
        <v-alert class="text-center mt-16" type="warning">
          Não existe conteúdo cadastrado nesse totem.
        </v-alert>
      </v-col>
    </v-row>

    <!--area de navegação-->
    <v-row v-else>
      <!--espaçador com botão voltar-->
      <v-col align-self="center" class="text-center" cols="1">
        <v-btn v-if="assuntos.current_page > 1" color="#eb9234" elevation="21" @click="ajustaPagVoltar">
          <span v-if="this.selected_lang === 'pt_br'">Voltar</span>
          <span v-else-if="this.selected_lang === 'en'"> Back</span>
          <span v-else> Volver </span>
        </v-btn>
      </v-col>

      <!--linhas 1 e 2 de assuntos-->
      <v-col class="">

        <!--linha 1-->
        <v-row>

          <v-col v-for="la1 in linha1assuntos" v-if="la1 !== undefined" :key="la1.id" align-self="center" cols="4">
            <v-card
              :hover=clicable
              class="ml-3 mr-3"
              color="#7ca387"
              elevation="21"
              rounded="xl"
              @click="abreAssunto(la1.id)"
            >

              <v-card-text class="text-center pa-2">
                <v-img :height=totemConfigs.altura_index :src="configSis.urlDownload + la1.banner.imagem"
                       :width=totemConfigs.largura_index
                       class="rounded-xl ml-auto mr-auto"/>

                <v-alert class="" color="rgb(0,0,0,0)">
                  <h2 v-if="selected_lang === 'pt_br'">{{ la1.nome_assunto }}</h2>
                  <h2 v-else-if="selected_lang === 'en'">{{ la1.nome_assunto_en }}</h2>
                  <h2 v-else>{{ la1.nome_assunto_es }}</h2>
                </v-alert>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col v-for="n in countUndefined1" :key="n" align-self="center" cols="4">
          </v-col>

        </v-row>

        <!--linha 2-->
        <v-row>
          <v-col v-for="la2 in linha2assuntos" v-if="la2 !== undefined" :key="la2.id" align-self="center" cols="4">
            <v-card
              :hover=clicable
              class="ml-3 mr-3"
              color="#7ca387"
              elevation="21"
              rounded="xl"
              @click="abreAssunto(la2.id)"
            >
              <v-card-text class="text-center pa-2">

                <v-img :height=totemConfigs.altura_index :src="configSis.urlDownload + la2.banner.imagem"
                       :width=totemConfigs.largura_index
                       class="rounded-xl ml-auto mr-auto"/>

                <v-alert class="" color="rgb(0,0,0,0)">
                  <h2 v-if="selected_lang === 'pt_br'">{{ la2.nome_assunto }}</h2>
                  <h2 v-else-if="selected_lang === 'en'">{{ la2.nome_assunto_en }}</h2>
                  <h2 v-else>{{ la2.nome_assunto_es }}</h2>
                </v-alert>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col v-for="n in 3-countUndefined2" v-if="linha2assuntos.length === 0" :key="n" align-self="center"
                 cols="4">
            <v-alert :height=totemConfigs.altura_index :width=totemConfigs.largura_index
                     color="rgb(0,0,0,0)"></v-alert>
          </v-col>

        </v-row>

      </v-col>

      <!--espaçador com botão avançar-->
      <v-col align-self="center" class="text-center" cols="1">
        <v-btn v-if="assuntos.current_page !== assuntos.last_page" color="#eb9234" elevation="21"
               @click="ajustaPagAvanca">
          <span v-if="this.selected_lang === 'pt_br'">Avançar</span>
          <span v-else-if="this.selected_lang === 'en'"> Next</span>
          <span v-else> Avance </span>
        </v-btn>
      </v-col>

      <!--pagination-->

      <v-container fluid>

        <v-row>
          <v-col cols="1"></v-col>
          <v-col>
            <v-container fluid>
              <v-row>
                <v-col class="text-center">
                  <v-btn v-if="totemConfigs.quiz === 'Sim'" block class="pt-8 pb-8" color="warning"
                         elevation="21" rounded x-large @click="openDialogQuiz">
                    <h2 v-if="this.selected_lang === 'pt_br'" class="black--text"> Teste o seu
                      conhecimento!</h2>
                    <h2 v-else-if="this.selected_lang === 'en'" class="black--text"> Test your
                      knowledge!</h2>
                    <h2 v-else class="black--text"> ¡Prueba tus conocimientos! </h2>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-col>
          <v-col>
            <v-container v-if="assuntos.last_page > 1" fluid>
              <v-pagination
                v-model="assuntos.current_page"
                :length="assuntos.last_page"
                class="pl-5 pr-5 ml-5 mr-5"
                color="success"
                @input="onPageChange"
              ></v-pagination>

            </v-container>
          </v-col>
          <v-col></v-col>
          <v-col cols="1"></v-col>
        </v-row>

      </v-container>

    </v-row>

    <!--Dialog para navegar pelo assunto-->
    <v-dialog v-model="dialogNavegaAssunto" max-width="90%" scrollable>
      <v-card v-if="!objetoVazio(selectedAssunto)" color="#7ca387" @contextmenu.prevent="disableRightClick">

        <!--titulo e botão fechar-->
        <v-card-title class="justify-center text-center">
          <v-row>
            <v-col cols="1"></v-col>
            <v-col class="text-h2" cols="10">

              <b v-if="selected_lang === 'pt_br'">{{ selectedAssunto.nome_assunto }}</b>
              <b v-else-if="selected_lang === 'en'">
                <span
                  v-if="selectedAssunto.nome_assunto_en === '' || selectedAssunto.nome_assunto_en === 'null' || selectedAssunto.nome_assunto_en === null">
                  {{ naoTraduzidoEn }}
                </span>
                <span v-else>
                  {{ selectedAssunto.nome_assunto_en }}
                </span>
              </b>
              <b v-else>
              <span
                v-if="selectedAssunto.nome_assunto_es === '' || selectedAssunto.nome_assunto_es === 'null' || selectedAssunto.nome_assunto_es === null">
                  {{ naoTraduzidoEs }}
                </span>
                <span v-else>
                  {{ selectedAssunto.nome_assunto_es }}
                </span>
              </b>

            </v-col>
            <v-col cols="1">
              <v-btn color="grey lighten-1" @click="dialogNavegaAssunto = false">X</v-btn>
            </v-col>
          </v-row>

        </v-card-title>

        <!-- card Text-->
        <v-card-text>

          <div ref="dialogContent">
            <hr>

            <!--navegar pelas imagens internas-->
            <v-container fluid>
              <v-row>
                <v-col>
                  <v-btn v-for="imgs in selectedAssunto.imagens" :key="imgs.id" class="mr-5" retain-focus-on-click
                         @click="changeSelectedImg(imgs.ordem)">{{ imgs.ordem }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>

            <!-- Área de exibição de imagem e conteúdo-->
            <v-row class="mt-2">

              <!--imagem e fonte-->
              <v-col align-self="start" class="text-center">

                <v-alert rounded="xl">

                  <v-img :height=totemConfigs.altura_detail :src="configSis.urlDownload + selectedImg.imagem"
                         :width=totemConfigs.largura_detail
                         class="rounded-xl ml-auto mr-auto"/>

                </v-alert>

                <v-alert v-if="selectedImg.fonte" rounded="xl"><b>Fonte: </b> {{ selectedImg.fonte }}</v-alert>
              </v-col>

              <!--Se tem nome (titulo da imagem) ou se tem legenda-->
              <v-col v-if="selectedImg.nome !=='' || selectedImg.legenda !== '' ">

                <!-- Título da imagem e aumenta e diminui fonte-->
                <v-row>
                  <v-col class="text-center">
                    <v-alert color="grey lighten-2" rounded="xl">
                      <span v-if="selected_lang === 'pt_br'" class="text-h3 font-preta">{{
                          selectedImg.nome
                        }}</span>
                      <span v-else-if="selected_lang === 'en'"
                            class="text-h3 font-preta">
                      <span
                        v-if="selectedImg.nome_en === '' || selectedImg.nome_en === 'null' || selectedImg.nome_en === null">
                        {{ naoTraduzidoEn }}
                      </span>
                        <span v-else>
                        {{ selectedImg.nome_en }}
                        </span>
                      </span>
                      <span v-else class="text-h3 font-preta">
                      <span
                        v-if="selectedImg.nome_es === '' || selectedImg.nome_es === 'null' || selectedImg.nome_es === null">
                        {{ naoTraduzidoEs }}
                      </span>
                        <span v-else>
                        {{ selectedImg.nome_es }}
                        </span>
                      </span>
                    </v-alert>
                  </v-col>
                </v-row>

                <!-- Area do conteúdo-->
                <v-alert v-if="selectedImg.legenda !== ''" class="text-justify" color="grey lighten-2" rounded="xl">

                  <v-row class="mt-2 mr-1">
                    <v-col class="text-right">
                      <v-btn color="#aeeb8a" small @click="aumentaDimunuiFonte">{{ legendaBtnAumentaDiminui }}</v-btn>
                    </v-col>
                  </v-row>

                  <!-- texto da legenda -->
                  <v-row v-if="!saibaMaisAreaVisibility" class="mb-1">

                    <v-row class="ml-2 mr-2">
                      <v-col :class=tamanhoTexto>
                        <span v-if="selected_lang === 'pt_br'" v-html="selectedImg.legenda"> </span>

                        <span v-else-if="selected_lang === 'en'">
                            <span
                              v-if="selectedImg.legenda_en === '' || selectedImg.legenda_en === 'null' || selectedImg.legenda_en === null">
                                {{ naoTraduzidoEn }}
                            </span>
                            <span v-else>
                              <span v-html="selectedImg.legenda_en"> </span>
                            </span>

                        </span>

                        <span v-else>
                        <span
                          v-if="selectedImg.legenda_es === '' || selectedImg.legenda_es === 'null' || selectedImg.legenda_es === null">
                                {{ naoTraduzidoEs }}
                            </span>
                            <span v-else>
                              <span v-html="selectedImg.legenda_es"> </span>
                            </span>
                        </span>
                      </v-col>
                    </v-row>
                  </v-row>

                  <!-- texto do saiba mais -->
                  <v-row v-if="saibaMaisAreaVisibility">
                    <v-col>
                      <span v-if="selected_lang === 'pt_br'" :class="tamanhoTexto" v-html="selectedImg.saibamais"/>
                      <span v-else-if="selected_lang === 'en'">
                        <span v-if="selectedImg.saibamais_en === '' || selectedImg.saibamais_en === 'null' || selectedImg.saibamais_en === null"
                              :class="tamanhoTexto">
                          {{ naoTraduzidoEn }}
                        </span>
                        <span v-else :class="tamanhoTexto" v-html="selectedImg.saibamais_en"/>
                      </span>
                      <span v-else>
                        <span v-if="selectedImg.saibamais_es === '' || selectedImg.saibamais_es === 'null' || selectedImg.saibamais_es === null"
                              :class="tamanhoTexto">
                          {{ naoTraduzidoEs }}
                        </span>
                        <span v-else :class="tamanhoTexto" v-html="selectedImg.saibamais_es"/>
                      </span>
                    </v-col>
                  </v-row>

                  <!-- botao saiba mais-->
                  <hr v-if="selectedImg.saibamais">
                  <v-row v-if="selectedImg.saibamais" class="mt-1">
                    <v-col class="text-right">
                      <v-btn @click="abreSaibaMais">{{ saibaMaisTextButton }}</v-btn>
                    </v-col>
                  </v-row>

                </v-alert>
              </v-col>

            </v-row>

            <!--navegar pelas imagens internas-->
            <v-container class="" fluid>
              <v-row no-gutters>
                <v-col>
                  <v-btn v-for="imgs in selectedAssunto.imagens" :key="imgs.id" class="mr-5" retain-focus-on-click
                         @click="changeSelectedImg(imgs.ordem)">{{ imgs.ordem }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </div>

        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" @click="dialogNavegaAssunto = false">
            <span v-if="selected_lang === 'pt_br'"> Voltar</span>
            <span v-if="selected_lang === 'en'"> Close</span>
            <span v-if="selected_lang === 'es'"> Cerrar</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Dialog para navegar pelos quiz-->
    <v-dialog v-model="dialogQuiz" max-width="90%" scrollable>
      <v-card color="#7ca387" @contextmenu.prevent="disableRightClick">

        <!--titulo e botão fechar-->
        <v-card-title class="justify-center text-center">
          <v-row>
            <v-col cols="1"></v-col>

            <v-col class="text-h4" cols="10">
              <b v-if="this.selected_lang === 'pt_br'">Teste o seu conhecimento!</b>
              <b v-else-if="this.selected_lang === 'en'">Test your knowledge!</b>
              <b v-else>¡Prueba tus conocimientos!</b>
            </v-col>

            <v-col cols="1">
              <v-btn color="grey lighten-1" @click="dialogQuiz = false">X</v-btn>
            </v-col>
          </v-row>

        </v-card-title>

        <!-- card Text-->
        <v-card-text>

          <Quiz v-if="dialogQuiz" :selected_lang="selected_lang" />

        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" @click="dialogQuiz = false">
            <span v-if="this.selected_lang === 'pt_br'">Sair</span>
            <span v-else-if="this.selected_lang === 'en'">Close</span>
            <span v-else>Cerrar</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>import config from '../../http/config'
import Quiz from './Quiz'

export default {

  components: {
    Quiz
  },
  data () {
    return {
      configSis: config,
      clicable: true,
      usuario: {},
      assuntos: [],
      qtdAssuntos: 0,
      linha1assuntos: [],
      linha2assuntos: [],
      countUndefined1: 0,
      countUndefined2: 0,
      dialogNavegaAssunto: false,
      selectedAssunto: {},
      selectedImg: {},
      tamanhoTexto: 'text-h5',
      legendaBtnAumentaDiminui: 'A--',
      saibamais: '',
      saibamais_en: '',
      saibamais_es: '',
      saibaMaisAreaVisibility: false,
      saibaMaisTextButton: 'SAIBA MAIS...',
      essaEImgEventoPcp: true,
      dialogQuiz: false,
      naoTraduzidoEn: 'Not translated yet',
      naoTraduzidoEs: 'Aún no traducido'
    }
  },
  props: {
    totemConfigs: Object,
    selected_lang: String
  },
  watch: {},

  computed: {},

  async mounted () {
    await this.getAssuntos()
  },
  methods: {
    async getAssuntos () {
      // pega os assuntos e divide de acordo com o grid (3 em cima e 3 em baixo)
      // se ajusta conforme a quantidade de assuntos
      this.linha1assuntos = []
      this.linha2assuntos = []
      try {
        this.$http.get('assunto/principal?page=' + this.assuntos.current_page)
          .then(response => {
            this.assuntos = response.data
            this.qtdAssuntos = this.assuntos.data.length

            // para a primeira linha, caso seja diferente de 0 e menor ou igual a 3
            if (this.assuntos.data.length !== 0 && this.assuntos.data.length <= 3 > 0) {
              for (let i = 0; i < 3; i++) {
                if (this.assuntos.data[i].imagens.length !== 0) {
                  this.linha1assuntos.push(this.assuntos.data[i])
                }
              }
              // isso significa que não vai existir a linha 2
              this.linha2assuntos = []
            } else {
              // nesse caso, a quantidade de assuntos vai ocupar a segunda linha
              // primeira linha a ser ocupada
              for (let i = 0; i < 3; i++) {
                this.linha1assuntos.push(this.assuntos.data[i])
              }
              // segunda linha a ser ocupada
              for (let i = 3; i < 6; i++) {
                if (this.assuntos.data[i].imagens.length !== 0) {
                  this.linha2assuntos.push(this.assuntos.data[i])
                }
              }
            }
            /*
             * agora preciso ajustar as cols para que sejam inseridas vazias
             * com a finalidade de ocupar os claros e manter o design da tela
             */

            let ajuste1 = 0
            let ajuste2 = 0
            for (let i = 0; i < this.linha1assuntos.length; i++) {
              if (this.linha1assuntos[i] === undefined) {
                ajuste1++
              }
            }
            for (let i = 0; i < this.linha2assuntos.length; i++) {
              if (this.linha2assuntos[i] === undefined) {
                ajuste2++
              }
            }
            this.countUndefined1 = ajuste1
            this.countUndefined2 = ajuste2
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    onPageChange () {
      this.getAssuntos()
    },

    abreAssunto (assuntoId) {
      this.dialogNavegaAssunto = true
      this.tamanhoTexto = 'text-h5'
      this.legendaBtnAumentaDiminui = 'A--'
      this.saibamais = ''
      this.saibamais_en = ''
      this.saibamais_es = ''
      this.saibaMaisAreaVisibility = false
      if (this.selected_lang === 'pt_br') {
        this.saibaMaisTextButton = 'SAIBA MAIS...'
      } else if (this.selected_lang === 'en') {
        this.saibaMaisTextButton = 'KNOW MORE...'
      } else {
        this.saibaMaisTextButton = 'SEPA MAS...'
      }
      this.selectedAssunto = {}
      this.selectedImg = {}
      for (let i = 0; i < this.assuntos.data.length; i++) {
        if (this.assuntos.data[i].id === assuntoId) {
          this.selectedAssunto = this.assuntos.data[i]
          this.selectedImg = this.assuntos.data[i].imagens[0]
          this.incrementaContadorAssunto(this.selectedAssunto)
          this.incrementaContadorImagem(this.selectedImg)
        }
      }
    },

    incrementaContadorAssunto (qualAssunto) {
      try {
        this.$http.post('incrementaacessoassunto', qualAssunto)
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    incrementaContadorImagem (qualImagem) {
      try {
        this.$http.post('incrementaacessoimagem', qualImagem)
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    objetoVazio (obj) {
      for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) return false
      }
      return true
    },

    changeSelectedImg (ordem) {
      this.saibamais = ''
      this.saibamais_en = ''
      this.saibamais_es = ''
      this.saibaMaisAreaVisibility = false
      if (this.selected_lang === 'pt_br') {
        this.saibaMaisTextButton = 'SAIBA MAIS...'
      } else if (this.selected_lang === 'en') {
        this.saibaMaisTextButton = 'KNOW MORE...'
      } else {
        this.saibaMaisTextButton = 'SEPA MAS...'
      }
      for (let i = 0; i < this.selectedAssunto.imagens.length; i++) {
        if (this.selectedAssunto.imagens[i].ordem === ordem) {
          this.selectedImg = this.selectedAssunto.imagens[i]
          this.incrementaContadorImagem(this.selectedImg)
        }
      }
    },

    ajustaPagVoltar () {
      if (this.totemConfigs.tipo_totem !== 'data') {
        if (this.assuntos.current_page >= this.assuntos.last_page) {
          this.assuntos.current_page--
          this.onPageChange()
        }
      }
    },

    ajustaPagAvanca () {
      if (this.assuntos.current_page < this.assuntos.last_page) {
        this.assuntos.current_page++
        this.onPageChange()
      }
    },

    aumentaDimunuiFonte () {
      if (this.legendaBtnAumentaDiminui === 'A++') {
        this.tamanhoTexto = 'text-h5'
        this.legendaBtnAumentaDiminui = 'A--'
      } else {
        this.tamanhoTexto = ''
        this.legendaBtnAumentaDiminui = 'A++'
      }
    },

    abreSaibaMais () {
      if (this.saibaMaisAreaVisibility === false) {
        this.saibamais = this.selectedImg.saibamais
        this.saibaMaisAreaVisibility = true

        if (this.selected_lang === 'pt_br') {
          this.saibaMaisTextButton = 'Ocultar informações adicionais.'
        } else if (this.selected_lang === 'en') {
          this.saibaMaisTextButton = 'Hide additional information.'
        } else {
          this.saibaMaisTextButton = 'Ocultar información adicional.'
        }
      } else {
        this.saibamais = ''
        this.saibaMaisAreaVisibility = false

        if (this.selected_lang === 'pt_br') {
          this.saibaMaisTextButton = 'SAIBA MAIS...'
        } else if (this.selected_lang === 'en') {
          this.saibaMaisTextButton = 'KNOW MORE...'
        } else {
          this.saibaMaisTextButton = 'SEPA MAS...'
        }
      }
    },

    disableRightClick (event) {
      event.preventDefault() // Impede o comportamento padrão do clique com o botão direito
    },

    openDialogQuiz () {
      this.dialogQuiz = true
    }
  }
}
</script>
<style>
.font-preta {
  color: black !important;
}
</style>
