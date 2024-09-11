<template>
  <!--container para eventos-->
  <v-container class="mt-3 pt-10" fill-height fluid>

    <!--caso não haja itens-->
    <v-row v-if="eventos.length === 0">
      <v-col>
        <v-alert class="text-center mt-16" type="warning">
          Não existe conteúdo cadastrado nesse totem.
        </v-alert>
      </v-col>
    </v-row>

    <!--caso tenha itens-->
    <v-row v-else class="mt-16">

      <!--espaçador + btn voltar-->
      <v-col align-self="center" class="text-center" cols="1">
        <v-btn v-if="pagAtualEvento > 1" color="#eb9234" @click="changeEventPage(pagAtualEvento - 1)">
          <span v-if="selected_lang === 'pt_br'"> Voltar</span>
          <span v-else-if="selected_lang === 'en'"> Back</span>
          <span v-else> Volver</span>
        </v-btn>
      </v-col>

      <v-col align-self="center">

        <!--linha 1 de eventos-->
        <v-row class="mb-10">

          <v-col v-for="le1 in linha1eventos" :key="le1.id" align-self="center" cols="3">

            <v-card :hover="clicable"
                    class="ml-3 mr-3 align-content-center"
                    color="#7ca387"
                    elevation="21"
                    rounded="xl"
                    @click="openAnoEventoLista(le1)">
              <br>

              <v-img :height=totemConfigs.altura_index :src="configSis.urlDownload + le1.imagem"
                     :width=totemConfigs.largura_index
                     class="rounded-xl text-center ml-auto mr-auto"/>

              <v-row>

                <v-col class="text-center">

                  <h2>{{ le1.ano }}</h2>
                </v-col>
              </v-row>
              <hr>
              <v-card class="mt-2" color="#7ca387" elevation="21">
                <v-row>
                  <v-col>
                    <ul>
                      <li v-for="ev in le1.eventos" v-if="selected_lang === 'pt_br'" :key="ev.id"><strong>{{
                          ev.nome
                        }}</strong></li>
                      <li v-for="ev in le1.eventos" v-if="selected_lang === 'en'" :key="ev.id"><strong>
                        <span
                          v-if="ev.nome_en === '' || ev.nome_en === 'null' || ev.nome_en === null">{{
                            naoTraduzidoEn
                          }}</span><span
                        v-else>{{ ev.nome_en }}</span></strong></li>
                      <li v-for="ev in le1.eventos" v-if="selected_lang === 'es'" :key="ev.id"><strong>
                        <span
                          v-if="ev.nome_es === '' || ev.nome_es === 'null' || ev.nome_es === null">{{
                            naoTraduzidoEs
                          }}</span><span
                        v-else>{{ ev.nome_es }}</span></strong></li>
                    </ul>
                  </v-col>
                </v-row>
              </v-card>
            </v-card>

          </v-col>
        </v-row>

        <!--linha 2 de eventos-->
        <v-row>
          <v-col v-for="le2 in linha2eventos" v-if="le2 !== undefined" :key="le2.id" align-self="center" cols="3">

            <v-card :hover="clicable"
                    class="ml-3 mr-3"
                    color="#7ca387"
                    elevation="21"
                    rounded="xl"
                    @click="openAnoEventoLista(le2)">

              <br>

              <v-img :height=totemConfigs.altura_index :src="configSis.urlDownload + le2.imagem"
                     :width=totemConfigs.largura_index
                     class="rounded-xl text-center ml-auto mr-auto"/>

              <v-row>

                <v-col class="text-center">
                  <h2>{{ le2.ano }}</h2>
                </v-col>
              </v-row>
              <hr>
              <v-card class="mt-2" color="#7ca387" elevation="21">
                <v-row>
                  <v-col>
                    <ul>
                      <li v-for="ev2 in le2.eventos" v-if="selected_lang === 'pt_br'" :key="ev2.id">
                        <strong>{{
                            ev2.nome
                          }}</strong></li>
                      <li v-for="ev2 in le2.eventos" v-if="selected_lang === 'en'" :key="ev2.id"><strong>
                        <span
                          v-if="ev2.nome_en === '' || ev2.nome_en === 'null' || ev2.nome_en === null">{{
                            naoTraduzidoEn
                          }}</span><span
                        v-else>{{ ev2.nome_en }}</span></strong></li>
                      <li v-for="ev2 in le2.eventos" v-if="selected_lang === 'es'" :key="ev2.id"><strong>
                        <span
                          v-if="ev2.nome_es === '' || ev2.nome_es === 'null' || ev2.nome_es === null">{{
                            naoTraduzidoEs
                          }}</span><span
                        v-else>{{ ev2.nome_es }}</span></strong></li>
                    </ul>
                  </v-col>
                </v-row>
              </v-card>
            </v-card>

          </v-col>
        </v-row>

      </v-col>

      <!--espaçador + btn avançar-->
      <v-col align-self="center" class="text-center" cols="1">
        <v-btn v-if="temProxPag" color="#eb9234" @click="changeEventPage(pagAtualEvento + 1)">
          <span v-if="selected_lang === 'pt_br'"> Avançar</span>
          <span v-else-if="selected_lang === 'en'"> Next</span>
          <span v-else> Avance</span>
        </v-btn>
      </v-col>

    </v-row>

    <!-- espaço btn quiz-->
    <v-row class="mt-6">
      <v-col cols="1"></v-col>
      <v-col>
        <v-row>
          <v-col cols="3"></v-col>
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
          <v-col cols="3"></v-col>
        </v-row>
      </v-col>
      <v-col cols="1"></v-col>
    </v-row>

    <!--Dialog para navegar pelo evento-->
    <v-dialog v-model="dialogNavegaAno" max-width="90%" scrollable>
      <v-card color="#7ca387" @contextmenu.prevent="disableRightClick">

        <!--Card Title (ANO)-->
        <v-card-title class="justify-center">
          <v-row>
            <v-col cols="1"></v-col>
            <v-col class="text-center text-h1" cols="10"><b>{{ selectedAnoEvento.ano }}</b></v-col>
            <v-col class="text-right" cols="1">
              <v-btn color="grey lighten-1" @click="dialogNavegaAno = false">X</v-btn>
            </v-col>
          </v-row>
        </v-card-title>

        <!--Card Text-->
        <v-card-text>
          <hr>

          <!-- Navegação  dentre eventos dentro do  ano-->
          <v-row v-if="Object.keys(selectedAnoEvento).length !== 0 && selectedAnoEvento.eventos.length > 1"
                 class="mt-1">
            <v-col>
              <v-btn v-for="(evento, index) in selectedAnoEvento.eventos" :key="evento.id" class="mr-5 mb-3"
                     color="primary"
                     @click="mostraEventoSelecionado(index)">
                <span v-if="selected_lang === 'pt_br'">{{ evento.nome }}</span>
                <span v-else-if="selected_lang === 'en'">
                  <span v-if="evento.nome_en === '' || evento.nome_en === 'null' || evento.nome_en === null">
                    {{ naoTraduzidoEn }}
                  </span>
                  <span v-else>{{ evento.nome_en }}</span>
                </span>
                <span v-else>
                  <span v-if="evento.nome_es === '' || evento.nome_es === 'null' || evento.nome_es === null">
                    {{ naoTraduzidoEs }}
                  </span>
                  <span v-else>{{ evento.nome_es }}</span>
                </span>
              </v-btn>
            </v-col>
          </v-row>

          <v-row class="mt-0">
            <!-- espaço para a imagem-->
            <v-col v-if="eventoVisivel.imagem !== 'null' && eventoVisivel.imagem !== null " align-self="start"
                   class="text-center">

              <v-alert rounded="xl">

                <!--navegação entre imagens adicionais de um mesmo evento-->
                <v-row>
                  <v-col class="text-center">

                    <!-- btaaompara img padrao-->
                    <v-btn v-if="!soTemUmaImagem" class="mb-4 mr-1" color="secondary" retain-focus-on-click
                           @click="mostraImagemAdicional(eventoVisivel,'default')">1
                    </v-btn>

                    <!--imagens adicionais-->
                    <v-btn v-for="(imgaddadd, index) in eventoVisivel.imagens_adicionais" :key="imgaddadd.id"
                           class="mx-2 mb-4" color="secondary"
                           retain-focus-on-click
                           @click="mostraImagemAdicional(imgaddadd, 'adicional')">
                      {{ index + 2 }}
                    </v-btn>
                  </v-col>
                </v-row>

                <v-img :height=totemConfigs.altura_detail :src="configSis.urlDownload + eventoVisivel.imagem"
                       :width=totemConfigs.largura_detail
                       class="rounded-xl ml-auto mr-auto"/>

                <!-- espaço para a fonte-->
                <v-alert v-if="eventoVisivel.fonteimagempcp !== '' && eventoVisivel.fonteimagempcp !== null"
                         class="mt-2" color="rgb(0,0,0,0)">fonte: {{ eventoVisivel.fonteimagempcp }}
                </v-alert>

                <!-- explicação sobre im agem adicional-->
                <v-alert v-if="!essaEImgEventoPcp" color="green lighten-3">
                  <h3>{{ explicacaoImgAddEvevntox }}</h3>
                </v-alert>

                <!--navegação entre imagens adicionais de um mesmo evento-->
                <v-row>
                  <v-col class="text-center">

                    <!-- btaaompara img padrao-->
                    <v-btn v-if="!soTemUmaImagem" class="mt-4 mr-1" color="secondary" retain-focus-on-click
                           @click="mostraImagemAdicional(eventoVisivel,'default')">1
                    </v-btn>

                    <!--imagens adicionais-->
                    <v-btn v-for="(imgaddadd, index) in eventoVisivel.imagens_adicionais" :key="imgaddadd.id"
                           class="mx-2 mt-4" color="secondary"
                           retain-focus-on-click
                           @click="mostraImagemAdicional(imgaddadd, 'adicional')">
                      {{ index + 2 }}
                    </v-btn>
                  </v-col>
                </v-row>

              </v-alert>

            </v-col>

            <!-- espaço para titulo, fonte++ e legenda -->
            <v-col>

              <!--titulo e aumenta e di minui fonte-->
              <v-row>
                <v-col>
                  <v-alert class="text-center text-h3" rounded="xl">
                    <b><span class="font-preta">
                      <span v-if="selected_lang === 'pt_br'">{{ eventoVisivel.nome }}</span>
                      <span v-if="selected_lang === 'en'">
                        <span
                          v-if="eventoVisivel.nome_en === '' || eventoVisivel.nome_en === 'null' || eventoVisivel.nome_en === null">
                          {{ naoTraduzidoEn }}
                        </span>
                        <span v-else>{{ eventoVisivel.nome_en }}</span>
                      </span>
                      <span v-if="selected_lang === 'es'">
                        <span
                          v-if="eventoVisivel.nome_eS === '' || eventoVisivel.nome_es === 'null' || eventoVisivel.nome_es === null">
                          {{ naoTraduzidoEs }}
                        </span>
                        <span v-else>{{ eventoVisivel.nome_es }}</span>
                      </span>
                      <span
                        v-if="eventoVisivel.dia || eventoVisivel.mes">(</span> <span
                      v-if="eventoVisivel.dia"> {{ eventoVisivel.dia }} de </span> <span
                      v-if="eventoVisivel.mes">  {{ converteNumEmMes(eventoVisivel.mes) }} </span>
                      <span v-if="eventoVisivel.dia || eventoVisivel.mes">)</span></span></b>
                  </v-alert>
                </v-col>

              </v-row>

              <br>

              <!--legenda, saiba mais e btn saiba mais-->
              <v-row>
                <v-col>
                  <v-alert v-if="eventoVisivel.legenda && eventoVisivel !== null" color="grey lighten-2"
                           rounded="xl">

                    <v-row>
                      <v-col class="text-right">
                        <v-btn color="#aeeb8a" small @click="aumentaDimunuiFonte">{{ legendaBtnAumentaDiminui }}</v-btn>
                      </v-col>
                    </v-row>

                    <!-- texto da legenda -->
                    <v-row v-if="!saibaMaisAreaVisibility" class="mb-1">
                      <v-col :class=tamanhoTexto class="text-justify">

                        <span v-if="selected_lang==='pt_br'" v-html="eventoVisivel.legenda"/>

                        <span v-if="selected_lang === 'en'">
                          <span
                            v-if="eventoVisivel.legenda_en === '' || eventoVisivel.legenda_en === 'null' || eventoVisivel.legenda_en === null ">
                          {{ naoTraduzidoEn }}
                          </span>
                          <span v-else v-html="eventoVisivel.legenda_en"/>
                        </span>
                        <span v-if="selected_lang==='es'">
                          <span
                            v-if="eventoVisivel.legenda_es === '' || eventoVisivel.legenda_es === 'null' || eventoVisivel.legenda_es === null ">
                          {{ naoTraduzidoEs }}
                          </span>
                          <span v-else v-html="eventoVisivel.legenda_es"/>
                        </span>
                      </v-col>
                    </v-row>

                    <!-- texto do saiba mais -->
                    <v-row v-if="saibaMaisAreaVisibility">
                      <v-col class="text-justify">
                        <div v-if="selected_lang === 'pt_br'" :class="tamanhoTexto"
                             v-html="eventoVisivel.saibamais"/>
                        <div v-if="selected_lang === 'en'" :class="tamanhoTexto">
                          <span
                            v-if="eventoVisivel.saibamais_en === '' || eventoVisivel.saibamais_en === 'null' || eventoVisivel.saibamais_en === null">
                            {{ naoTraduzidoEn }}
                          </span>
                          <span v-else v-html="eventoVisivel.saibamais_en"/>
                        </div>
                        <div v-if="selected_lang === 'es'" :class="tamanhoTexto">
                          <span
                            v-if="eventoVisivel.saibamais_es === '' || eventoVisivel.saibamais_es === 'null' || eventoVisivel.saibamais_es === null">
                            {{ naoTraduzidoEs }}
                          </span>
                          <span v-else v-html="eventoVisivel.saibamais_es"/>
                        </div>
                      </v-col>
                    </v-row>

                    <!-- botao saiba mais-->
                    <hr v-if="eventoVisivel.saibamais">
                    <v-row v-if="eventoVisivel.saibamais" class="mt-1">
                      <v-col class="text-right">
                        <v-btn @click="abreSaibaMais">{{ saibaMaisTextButton }}</v-btn>
                      </v-col>
                    </v-row>

                  </v-alert>
                </v-col>
              </v-row>

            </v-col>

          </v-row>

        </v-card-text>

        <!-- Actions-->
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" @click="dialogNavegaAno = false">
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
              <b v-if="selected_lang === 'pt_br'">Teste o seu conhecimento!</b>
              <b v-else-if="selected_lang === 'en'">Test your knowledge!</b>
              <b v-else>¡Prueba tus conocimientos!</b>
            </v-col>
            <v-col cols="1">
              <v-btn color="grey lighten-1" @click="dialogQuiz = false">X</v-btn>
            </v-col>
          </v-row>

        </v-card-title>

        <!-- card Text-->
        <v-card-text>

          <Quiz v-if="dialogQuiz" :selected_lang="selected_lang"/>

        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" @click="dialogQuiz = false">
            <span v-if="selected_lang === 'pt_br'">Sair</span>
            <span v-else-if="selected_lang === 'en'">Close</span>
            <span v-else>Cerrar</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>

</template>
<script>import config from '../../http/config'
import Quiz from './Quiz.vue'

export default {

  components: {Quiz},
  data () {
    return {
      configSis: config,
      clicable: true,
      eventos: [],
      qtdEventos: 0,
      linha1eventos: [],
      linha2eventos: [],
      countUndefinedEE1: 0,
      countUndefinedEE2: 0,
      pagAtualEvento: 0,
      temProxPag: false,
      dialogNavegaAno: false,
      selectedAnoEvento: {},
      eventoVisivel: {},
      tamanhoTexto: 'text-h5',
      legendaBtnAumentaDiminui: 'A--',
      saibamaisevent: '',
      saibaMaisAreaVisibility: false,
      saibaMaisTextButton: 'SAIBA MAIS...',
      objPcpEventoParaImagemAdicional: {},
      essaEImgEventoPcp: true,
      explicacaoImgAddEvevntox: '',
      soTemUmaImagem: true,
      dialogQuiz: false,
      naoTraduzidoEn: 'Not translated yet',
      naoTraduzidoEs: 'Aún no traducido'
    }
  },
  watch: {},

  props: {
    totemConfigs: Object,
    selected_lang: String
  },

  computed: {},

  async mounted () {
    await this.getEventos()
  },
  methods: {

    async getEventos () {
      this.linha1eventos = []
      this.linha2eventos = []
      try {
        this.$http.get('evento/principal')
          .then(response => {
            this.eventos = response.data[0]
            this.pagAtualEvento = response.data[1]
            this.temProxPag = response.data[2]
            this.qtdEventos = this.eventos.length
            if (this.eventos.length !== 0 && this.eventos.length <= 3 > 0) {
              for (let i = 0; i < 4; i++) {
                if (this.eventos[i] !== undefined) {
                  this.linha1eventos.push(this.eventos[i])
                }
              }
              this.linha2eventos = []
            } else {
              for (let i = 0; i < 4; i++) {
                this.linha1eventos.push(this.eventos[i])
              }
              for (let i = 4; i < 8; i++) {
                if (this.eventos[i] !== undefined) {
                  this.linha2eventos.push(this.eventos[i])
                }
              }
            }
            let ajuste1 = 0
            let ajuste2 = 0
            for (let i = 0; i < this.linha1eventos.length; i++) {
              if (this.linha1eventos[i] === undefined) {
                ajuste1++
              }
            }
            for (let i = 0; i < this.linha2eventos.length; i++) {
              if (this.linha2eventos[i] === undefined) {
                ajuste2++
              }
            }
            this.countUndefinedEE1 = ajuste1
            this.countUndefinedEE2 = ajuste2
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    changeEventPage (pagina) {
      this.eventos = []
      this.linha1eventos = []
      this.linha2eventos = []
      try {
        this.$http.get('evento/principal/porpag/' + pagina)
          .then(response => {
            this.eventos = response.data[0]
            this.pagAtualEvento = response.data[1]
            this.temProxPag = response.data[2]
            this.qtdEventos = this.eventos.length
            if (this.eventos.length !== 0 && this.eventos.length <= 3 > 0) {
              for (let i = 0; i < 4; i++) {
                if (this.eventos[i] !== undefined) {
                  this.linha1eventos.push(this.eventos[i])
                }
              }
              this.linha2eventos = []
            } else {
              for (let i = 0; i < 4; i++) {
                this.linha1eventos.push(this.eventos[i])
              }
              for (let i = 4; i < 8; i++) {
                if (this.eventos[i] !== undefined) {
                  this.linha2eventos.push(this.eventos[i])
                }
              }
            }
            let ajuste1 = 0
            let ajuste2 = 0
            for (let i = 0; i < this.linha1eventos.length; i++) {
              if (this.linha1eventos[i] === undefined) {
                ajuste1++
              }
            }
            for (let i = 0; i < this.linha2eventos.length; i++) {
              if (this.linha2eventos[i] === undefined) {
                ajuste2++
              }
            }
            this.countUndefinedEE1 = ajuste1
            this.countUndefinedEE2 = ajuste2
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    openAnoEventoLista (evento) {
      this.dialogNavegaAno = true
      this.selectedAnoEvento = evento
      this.mostraEventoSelecionado(0)
    },

    mostraEventoSelecionado (index) {
      this.tamanhoTexto = 'text-h5'
      this.legendaBtnAumentaDiminui = 'A--'
      this.saibamaisevent = ''
      this.saibaMaisAreaVisibility = false
      if (this.selected_lang === 'pt_br') {
        this.saibaMaisTextButton = 'SAIBA MAIS...'
      } else if (this.selected_lang === 'en') {
        this.saibaMaisTextButton = 'KNOW MORE...'
      } else {
        this.saibaMaisTextButton = 'SEPA MAS...'
      }
      this.eventoVisivel = this.selectedAnoEvento.eventos[index]
      this.essaEImgEventoPcp = true
      this.objPcpEventoParaImagemAdicional = {}
      this.objPcpEventoParaImagemAdicional = this.eventoVisivel
      if (this.eventoVisivel.imagens_adicionais.length === 0) {
        this.soTemUmaImagem = true
      } else {
        this.soTemUmaImagem = false
      }
      this.incrementaContadorEvento(this.eventoVisivel)
    },

    converteNumEmMes (num) {
      if (num === 1) {
        return 'Janeiro'
      } else if (num === 2) {
        return 'Fevereiro'
      } else if (num === 3) {
        return 'Março'
      } else if (num === 4) {
        return 'Abril'
      } else if (num === 5) {
        return 'Maio'
      } else if (num === 6) {
        return 'Junho'
      } else if (num === 7) {
        return 'Julho'
      } else if (num === 8) {
        return 'Agosto'
      } else if (num === 9) {
        return 'Setembro'
      } else if (num === 10) {
        return 'Outubro'
      } else if (num === 11) {
        return 'Novembro'
      } else {
        return 'Dezembro'
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
        this.saibamaisevent = this.eventoVisivel.saibamais
        this.saibaMaisAreaVisibility = true
        if (this.selected_lang === 'pt_br') {
          this.saibaMaisTextButton = 'Ocultar informações adicionais.'
        } else if (this.selected_lang === 'en') {
          this.saibaMaisTextButton = 'Hide additional information.'
        } else {
          this.saibaMaisTextButton = 'Ocultar información adicional.'
        }
      } else {
        this.saibamaisevent = ''
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

    mostraImagemAdicional (objeto, tipo) {
      // Cria uma cópia do objeto eventoVisivel
      const eventoVisivelCopia = Object.assign({}, this.eventoVisivel)

      // Modifica a imagem e a fonte da cópia
      if (tipo === 'default') {
        this.essaEImgEventoPcp = true
        eventoVisivelCopia.imagem = this.objPcpEventoParaImagemAdicional.imagem
        eventoVisivelCopia.fonteimagempcp = this.objPcpEventoParaImagemAdicional.fonteimagempcp
      } else {
        this.essaEImgEventoPcp = false
        eventoVisivelCopia.imagem = objeto.imagem
        eventoVisivelCopia.fonteimagempcp = objeto.fonte
        if (this.selected_lang === 'pt_br') {
          this.explicacaoImgAddEvevntox = objeto.descricao
        } else if (this.selected_lang === 'en') {
          if (objeto.descricao_en === '' || objeto.descricao_en === 'null' || objeto.descricao_en === null) {
            this.explicacaoImgAddEvevntox = this.naoTraduzidoEn
          } else {
            this.explicacaoImgAddEvevntox = objeto.descricao_en
          }
        } else {
          if (objeto.descricao_es === '' || objeto.descricao_es === 'null' || objeto.descricao_es === null) {
            this.explicacaoImgAddEvevntox = this.naoTraduzidoEs
          } else {
            this.explicacaoImgAddEvevntox = objeto.descricao_es
          }
        }
      }

      // Altera o estado do componente com a cópia do objeto
      this.eventoVisivel = eventoVisivelCopia
    },

    disableRightClick (event) {
      event.preventDefault() // Impede o comportamento padrão do clique com o botão direito
    },

    incrementaContadorEvento (qualEvento) {
      try {
        this.$http.post('incrementaacessoevento', qualEvento)
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
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
