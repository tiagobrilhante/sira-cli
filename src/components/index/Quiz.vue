<template>
  <v-main @contextmenu.prevent="disableRightClick">

    <!-- espaço destinado a mostrar as opções de quiz disponíveis-->
    <v-row v-for="quiz in quizzes" v-if="Object.keys(selectedQuiz).length === 0" :key="quiz.id">
      <v-col>
        <v-alert elevation="21" rounded="xl">
          <v-row>
            <v-col>
              <span v-if="selected_lang === 'pt_br'" v-html="quiz.cabecalho"></span>
              <span v-else-if="selected_lang === 'en'" v-html="quiz.cabecalho_en"></span>
              <span v-else v-html="quiz.cabecalho_es"></span>
            </v-col>
            <v-col cols="2">
              <v-btn block color="success" rounded x-large @click="pegaQuizEspecifico(quiz.id)">
                <span v-if="selected_lang === 'pt_br'">Iniciar o quiz!</span>
                <span v-else-if="selected_lang === 'en'">Start the quiz!</span>
                <span v-else>¡Comenzar el quiz!</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>
      </v-col>
    </v-row>

    <!--- espaço para renderização do quiz propriamente dito-->
    <v-row v-if="Object.keys(selectedQuiz).length > 0">
      <v-col>
        <v-alert v-if="!scoreQuizWindow" elevation="21" rounded="xl">

          <!--cabecalho e cancelarquiz-->
          <v-row>
            <v-col></v-col>
            <v-col class="text-center"><h2>QUIZ</h2></v-col>
            <v-col class="text-right">
              <v-btn color="error" @click="cancelaQuiz">
                <span v-if="selected_lang === 'en'">Cancel Quiz</span>
                <span v-else>Cancelar Quiz</span>
              </v-btn>
            </v-col>
          </v-row>

          <!-- perguntas e respostas-->
          <v-row v-for="myQuiz in selectedQuiz.perguntas" :key="myQuiz.id">

            <v-col>
              <!-- enunciado da pergunta-->
              <h2>
                <b>
                  <span v-if="selected_lang === 'pt_br'" v-html="myQuiz.enunciado"/>
                  <span v-else-if="selected_lang === 'en'" v-html="myQuiz.enunciado_en"/>
                  <span v-else v-html="myQuiz.enunciado_es"/>
                </b>
              </h2>

              <!-- respostas cadastradas-->
              <v-row v-if="selected_lang ==='pt_br'">
                <v-col>
                  <v-radio-group v-model="respostasEscolhidas[myQuiz.id]"
                                 :rules="[v => !!v || 'Uma opção deve ser selecionada']">
                    <v-radio
                      v-for="resposta in myQuiz.respostas"
                      :key="resposta.id" :label="resposta.resposta"
                      :value="resposta.id"
                      @change="removeMsgErro"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>

              <v-row v-else-if="selected_lang ==='en'">
                <v-col>
                  <v-radio-group v-model="respostasEscolhidas[myQuiz.id]"
                                 :rules="[v => !!v || 'An option must be selected']">
                    <v-radio
                      v-for="resposta in myQuiz.respostas"
                      :key="resposta.id" :label="resposta.resposta_en"
                      :value="resposta.id"
                      @change="removeMsgErro"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>

              <v-row v-else>
                <v-col>
                  <v-radio-group v-model="respostasEscolhidas[myQuiz.id]"
                                 :rules="[v => !!v || 'Debe seleccionarse una opción.']">
                    <v-radio
                      v-for="resposta in myQuiz.respostas"
                      :key="resposta.id" :label="resposta.resposta_es"
                      :value="resposta.id"
                      @change="removeMsgErro"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>

            </v-col>

          </v-row>

          <!-- enviar e erro-->
          <v-row>
            <v-col cols="3">
              <v-btn block color="success" rounded x-large @click="enviaquiz">

                <span v-if="selected_lang === 'pt_br'">Enviar respostas</span>
                <span v-else-if="selected_lang === 'en'">Submit answers</span>
                <span v-else>Enviar respuestas</span>
              </v-btn>
            </v-col>
            <v-col>
              <v-alert v-if="errorMsgQuiz !== ''" elevation="21" rounded="xl" type="error">
                {{ errorMsgQuiz }}
              </v-alert>
            </v-col>
          </v-row>

        </v-alert>

        <!-- exibe o score quando finaliza o quiz-->
        <v-alert v-if="scoreQuizWindow">

          <v-alert color="success" elevation="21">
            <v-row>
              <v-col class="text-center">
                <br>

                <h1> {{ msgRetornoQuiz }} </h1>

                <br>

              </v-col>
            </v-row>

          </v-alert>

          <!-- sumário-->
          <v-alert elevation="21">
            <h2>
              <span v-if="selected_lang ==='pt_br'">Sumário:</span>
              <span v-else-if="selected_lang ==='en'">Summary:</span>
              <span v-else>Resumen:</span>
            </h2>

            <v-row>
              <v-col class="text-center">
                <h2>

                  <span v-if="selected_lang ==='pt_br'">Sua nota foi:</span>
                  <span v-else-if="selected_lang ==='en'">Your grade was:</span>
                  <span v-else>Tu calificación fue:</span>

                </h2>
                <br>
                <h1 class="text-h1">
                  {{ scoreQuiz }}
                </h1>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <h2>
                  <span v-if="numAcertos === 0">
                    <span v-if="selected_lang ==='pt_br'">Você não acertou nenhuma questão.</span>
                    <span v-else-if="selected_lang ==='en'">You didn't get any questions right.</span>
                    <span v-else>No acertaste ninguna pregunta.</span>
                  </span>
                  <span v-else-if="numAcertos === 1">
                    <span v-if="selected_lang ==='pt_br'">Você acertou uma questão.</span>
                    <span v-else-if="selected_lang ==='en'">You got one question right.</span>
                    <span v-else>Has acertado una pregunta.</span>
                  </span>
                  <span v-else>
                    <span v-if="selected_lang ==='pt_br'">Você acertou {{ numAcertos }} questões.</span>
                    <span v-else-if="selected_lang ==='en'">You got {{ numAcertos }} questions right.</span>
                    <span v-else>Has acertado {{ numAcertos }}  preguntas.</span>
                  </span>
                </h2>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h2>
                  <span v-if="selected_lang ==='pt_br'">
                    Sua Pontuação foi: {{ scoreQuiz }} de {{ this.selectedQuiz.maxscore }} ({{ porcentagemComparada }} %)
                  </span>
                  <span v-else-if="selected_lang ==='en'">
                    Your Score was: {{ scoreQuiz }} out of {{ this.selectedQuiz.maxscore }} ({{ porcentagemComparada }} %)
                  </span>
                  <span v-else>
                    Tu puntuación fue: {{ scoreQuiz }} de {{ this.selectedQuiz.maxscore }} ({{ porcentagemComparada }} %)
                  </span>
                </h2>
              </v-col>
            </v-row>
          </v-alert>

          <v-alert elevation="21">
            <v-row>
              <v-col>
                <h2>
                  <span v-if="selected_lang ==='pt_br'">Opções:</span>
                  <span v-else-if="selected_lang ==='en'">Options</span>
                  <span v-else>Opciones</span>
                </h2>
              </v-col>
            </v-row>
            <br>
            <v-row>
              <v-col>
                <v-btn block color="secondary" rounded x-large @click="selectedQuiz={}">
                  <span v-if="selected_lang ==='pt_br'">Voltar para a tela de seleção de Quiz</span>
                  <span v-else-if="selected_lang ==='en'">Return to the Quiz selection screen</span>
                  <span v-else>Volver a la pantalla de selección de Quiz</span>
                </v-btn>
              </v-col>
              <v-col>
                <v-btn block color="success" rounded x-large @click="resetQuiz">
                  <span v-if="selected_lang ==='pt_br'">Tentar novamente</span>
                  <span v-else-if="selected_lang ==='en'">Try again</span>
                  <span v-else>Intentar de nuevo</span>

                </v-btn>
              </v-col>
            </v-row>

          </v-alert>
        </v-alert>

      </v-col>
    </v-row>

  </v-main>
</template>
<script>import config from '../../http/config'

export default {

  components: {},
  data () {
    return {
      configSis: config,
      quizzes: [],
      selectedQuiz: {},
      respostasEscolhidas: {},
      errorMsgQuiz: '',
      scoreQuizWindow: false,
      scoreQuiz: 0,
      numAcertos: 0,
      msgRetornoQuiz: '',
      porcentagemComparada: 0
    }
  },
  watch: {},

  props: {
    selected_lang: String
  },

  computed: {},

  async mounted () {
    await this.getQuizzes()
  },
  methods: {

    async getQuizzes () {
      try {
        this.$http.get('admquiz/pegaquiz')
          .then(response => {
            this.quizzes = response.data
            this.selectedQuiz = {}
            this.scoreQuizWindow = false
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    pegaQuizEspecifico (id) {
      try {
        this.$http.get('admquiz/pegaquizpcp/' + id)
          .then(response => {
            this.selectedQuiz = response.data
            this.scoreQuizWindow = false
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    disableRightClick (event) {
      event.preventDefault() // Impede o comportamento padrão do clique com o botão direito
    },

    refreshPage () {
      location.reload()
    },

    cancelaQuiz () {
      this.selectedQuiz = {}
    },

    removeMsgErro () {
      this.errorMsgQuiz = ''
    },

    resetQuiz () {
      this.scoreQuizWindow = false
      this.respostasEscolhidas = {}
    },

    enviaquiz () {
      const totalPerguntas = this.selectedQuiz.perguntas.length
      const totalRespostas = Object.keys(this.respostasEscolhidas).length
      const todasRespondidas = totalPerguntas === totalRespostas &&
        Object.values(this.respostasEscolhidas).every(resposta => resposta != null)

      if (!todasRespondidas) {
        this.errorMsgQuiz = 'Responda a todas as perguntas!'
        return
      }
      try {
        this.$http.post('admquiz/enviarespostas/' + this.selectedQuiz.id, this.respostasEscolhidas)
          .then(response => {
            this.scoreQuizWindow = true
            this.scoreQuiz = response.data[1]
            this.numAcertos = response.data[0]

            /* Parâmetros
            variações de maxscore em %
            se for :
             menor que 30% - Sua pontuação foi baixa! Navegue pelo conteúdo para aprender mais!
            entre 31% e 60% - É um bom começo! Navegue pelo conteúdo para aprender mais!
            entre 61% e 85% - Muito bem! Navegue pelo conteúdo para aprender mais
            acima de 86 % - Parabéns! Sua pontuação foi ótima
             */

            const verificacaoPorcentagem = (this.scoreQuiz * 100) / this.selectedQuiz.maxscore

            if (verificacaoPorcentagem <= 30) {
              if (this.selected_lang === 'pt_br') {
                this.msgRetornoQuiz = 'Sua pontuação foi baixa! Navegue pelo conteúdo para aprender mais!'
              } else if (this.selected_lang === 'en') {
                this.msgRetornoQuiz = 'Your score was low! Browse through the content to learn more!'
              } else {
                this.msgRetornoQuiz = '¡Tu puntuación fue baja! ¡Navega por el contenido para aprender más!'
              }
            } else if (verificacaoPorcentagem > 30 && verificacaoPorcentagem <= 60) {
              if (this.selected_lang === 'pt_br') {
                this.msgRetornoQuiz = 'É um bom começo! Navegue pelo conteúdo para aprender mais!'
              } else if (this.selected_lang === 'en') {
                this.msgRetornoQuiz = 'It\'s a good start! Browse through the content to learn more!'
              } else {
                this.msgRetornoQuiz = '¡Es un buen comienzo! ¡Navega por el contenido para aprender más!'
              }
            } else if (verificacaoPorcentagem > 60 && verificacaoPorcentagem <= 85) {
              if (this.selected_lang === 'pt_br') {
                this.msgRetornoQuiz = 'Muito bem! Navegue pelo conteúdo para aprender mais!'
              } else if (this.selected_lang === 'en') {
                this.msgRetornoQuiz = 'Well done! Browse through the content to learn more!'
              } else {
                this.msgRetornoQuiz = '¡Muy bien! ¡Navega por el contenido para aprender más!'
              }
            } else if (verificacaoPorcentagem > 85) {
              if (this.selected_lang === 'pt_br') {
                this.msgRetornoQuiz = 'Parabéns! Sua pontuação foi ótima!'
              } else if (this.selected_lang === 'en') {
                this.msgRetornoQuiz = 'Congratulations! Your score was great!'
              } else {
                this.msgRetornoQuiz = '¡Felicitaciones! ¡Tu puntuación fue excelente!'
              }
            }
            this.porcentagemComparada = verificacaoPorcentagem
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
<style scoped>
.toast-container {
  min-width: 350px !important; /* Ajuste para a largura desejada */
  max-width: 600px !important; /* Ajuste para a largura máxima desejada, se necessário */
}

.toast .toast-message {
  font-size: 60px !important; /* Ajuste para o tamanho da fonte desejado */
}
</style>
