<template>
  <v-main class="bgConfig">

    <!--Barra de navegação da área administrativa-->
    <BarraNavegacao></BarraNavegacao>

    <!--Gerenciamento de Valores-->
    <v-container fluid>
      <v-row>
        <v-col>
          <!--Banner-->
          <v-alert
            class="p-5"
            elevation="21"
          >
            <v-row>
              <v-col>
                <h2>
                  <v-icon
                    class="mr-4"
                    size="36">
                    mdi-finance
                  </v-icon>
                  Lançamento de Valores
                </h2>
              </v-col>
              <v-col class="text-center">
                <v-row>
                  <v-col class="text-right">
                    <v-btn class="primary" @click="changeYear('down')">
                      <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                  </v-col>
                  <v-col>
                    <v-alert class="mt-0 mb-0 pt-0 pb-0" dense elevation="10">
                      <h2>{{ this.anoCorrente }}</h2>
                    </v-alert>
                  </v-col>
                  <v-col class="text-left">
                    <v-btn v-if="this.anoBase !== this.anoCorrente" class="primary" @click="changeYear('up')">
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>

              </v-col>
              <v-col></v-col>
            </v-row>

          </v-alert>
        </v-col>
      </v-row>

      <!-- coisas pra se preocupar-->
      <v-row>
        <v-col>
          <v-alert type="error">
            <h3>Coisas para ajustar</h3>
            <br>
            <ul>
              <li>Os dados lançados em um mes, correspondem aos indicadores do mês anterior</li>
              <li>O limite de tabulação dos dados é o dia 15 de cada mes</li>
              <li>Alerta para indicadores sem lançamentos</li>
              <li>Sistema de controle (virou o ano, não preciso mais ter um alert me provocando a lançar dados)</li>
              <li>O mês de referencia é sempre o mes passado</li>
              <li>Btn impedir de colocar meses depois (ex se é maio, o btn de maio pra frente não pode aparecer... mas
                isso se ano for ano)
              </li>
            </ul>
          </v-alert>
        </v-col>
      </v-row>

      <!-- pick de indicadores por seção-->
      <v-alert
        class="p-5"
        elevation="21"
      >
        <v-row>
          <v-col>
            <v-btn v-for="secao in secoes" :key="secao.id" class="primary mr-3" retain-focus-on-click
                   @click="pegaIndicadoresSecao(secao)"> {{ secao.sigla }}
            </v-btn>
          </v-col>
        </v-row>
      </v-alert>

      <!--Seletor de mês e inserção de dados-->
      <v-alert
        class="p-5"
        elevation="21"
      >
        <v-row>

          <!-- seletor de mês-->
          <v-col cols="1">
            <v-btn
              v-for="(mes, index) in meses"
              :key="index"
              :class="getMonthButtonClass(mes)"
              :disabled="checaMesDisabled(index)"
              block
              retain-focus-on-click
              @click="escolheMesIndicador(mes)"
            >
              {{ mes }}
            </v-btn>
          </v-col>

          <!--area de lançamento preciso  ARRUMAR ISSO AQUI-->
          <v-col v-if="!awaitData">

            <!-- informa o mês e o ano de referência-->
            <h3 class="text-center mb-5">Referência: {{ this.mesCorrente }} de {{ this.anoCorrente }}</h3>

            <!-- nesse caso eu pego a categoria-->
            <v-row v-if="selectedSecao.categoria.length > 0">

              <v-col v-for="categoria in selectedSecao.categoria" :key="categoria.id" cols="3">
                <v-card class="pl-2 pr-2 pb-1" elevation="11">
                  <h4 class="mb-2">{{ categoria.nome }}</h4>

                  <v-alert v-for="indicador in categoria.indicadores" :key="indicador.id"
                           :color="getColorForIndicator(indicador)"
                           class="mt-0 ml-0 mr-0 mb-2" dense>
                    {{ indicador.nome }}

                    <v-text-field
                      :value="inputs[indicador.id]"
                      class="mt-1 pb-2"
                      dense
                      hide-details
                      label="Valor"
                      solo
                      type="number"
                      @input="handleInput(indicador.id, $event)">
                    </v-text-field>
                    <span v-if="inputsUpdate[indicador.id]">Atualizado em: {{
                        formatDateTime(inputsUpdate[indicador.id])
                      }} </span>
                    <span v-else>Indicador não lançado</span>

                  </v-alert>

                </v-card>

              </v-col>
            </v-row>

            <!-- caso não tenha nenhum indicador cadastrado-->
            <v-row v-else>
              <v-col>
                <v-alert class="text-center mt-5" elevation="15" type="warning">
                  Esta Seção ainda não possui indicadores cadastrados
                </v-alert>
              </v-col>
            </v-row>

            <v-row v-if="selectedSecao.categoria.length > 0">
              <v-col>

              </v-col>
              <v-col>
                <v-btn block class="primary" x-large @click="gravaValores">
                  <v-icon class="mr-5" large>mdi-content-save-move</v-icon>
                  Gravar Valores
                </v-btn>
              </v-col>
            </v-row>

          </v-col>

          <v-col v-else>
            <v-alert type="info"> Aguardando Dados</v-alert>
          </v-col>

        </v-row>

      </v-alert>
    </v-container>

    <!-- área de gráficos-->
    <v-container fluid>

      <v-row>
        <v-col v-for="categoria in selectedSecao.categoria" :key="categoria.id" cols="4">

          <!-- abertura de card-->
          <v-alert class="pb-1" elevation="10" rounded="xxl">

            <!-- chamada de categoria-->
            <v-alert :color="checaCorCardCategoria(categoria)" class="text-center" dense elevation="10" rounded="xxl">
              <h2>{{ categoria.nome }}</h2>
            </v-alert>

            <!-- btn de chamada dos gráficos-->
            <v-row>

              <!-- separador-->
              <v-col></v-col>

              <!-- btn mostra oculta grafico do mês-->
              <v-col>
                <v-btn
                  :color="mostraGrafico[categoria.id] ? 'primary' : 'secondary'"
                  block rounded x-small @click="toggleGrafico(categoria.id)">
                  {{ mostraGrafico[categoria.id] ? 'Ocultar Gráfico' : 'Exibir Gráfico' }}
                </v-btn>

              </v-col>

              <!-- btn mostra dados da série histórica-->
              <v-col>
                <v-btn block color="secondary" rounded x-small>Série Histórica</v-btn>
              </v-col>

              <!-- separador-->
              <v-col></v-col>

            </v-row>

            <!-- área de chamada do módulo de gráfico-->
            <v-alert v-if="mostraGrafico[categoria.id]" class="mt-5 mb-1" dense elevation="10" rounded="xxl">
              <Grafico :dados="categoria.indicadores"/>
            </v-alert>

            <!-- exibição dos dados em cards-->
            <v-alert class="mt-5" dense elevation="10" rounded="xxl">
              <v-row v-for="indicador in categoria.indicadores" :key="indicador.id" dense>
                <v-col>
                  <v-card :color="ajustaCorBtn(indicador)" class="text-center" dense rounded="xl">{{ indicador.nome }} -
                    {{ indicador.indicador_valor[0].valor }}
                  </v-card>
                </v-col>
              </v-row>
            </v-alert>

          </v-alert>

        </v-col>

      </v-row>

    </v-container>

  </v-main>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import config from '../../http/config'
import moment from 'moment-timezone'
import BarraNavegacao from '../../components/barra-navegacao/BarraNavegacao.vue'
import Grafico from './Grafico.vue'

export default {
  name: 'home',
  mixins: [logoutMixin],
  components: {BarraNavegacao, Grafico},
  data: vm => ({
    configSis: config,
    anoCorrente: 0,
    anoBase: 0,
    mesCorrente: '',
    diaCorrente: '',
    secoes: [],
    selectedSecao: {categoria: []},
    dadosGerais: {},
    teste: '',
    inputs: {},
    inputsUpdate: {},
    meses: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    mostraGrafico: {},
    capturaIndexMes: 0,
    awaitData: true
  }),
  computed: {
    ...mapGetters(['usuarioLogado'])
  },
  watch: {
    'selectedSecao.categoria': {
      handler (categorias) {
        if (categorias) {
          categorias.forEach(categoria => {
            if (categoria.indicadores) {
              categoria.indicadores.forEach(indicador => {
                if (this.inputs[indicador.id] === undefined) {
                  this.$set(this.inputs, indicador.id, '') // Assegura que cada input está inicializado
                }
              })
            }
          })
        }
      },
      immediate: true,
      deep: true
    }
  },

  async mounted () {
    this.getCurrentDate()
    await this.getSecoes()
  },
  methods: {
    // tenho que melhorar isso e passar o mes e ano
    async getSecoes () {
      try {
        this.$http.get('secao/simples')
          .then(response => {
            this.secoes = response.data
            console.log('this.secoes (ao carregar a página)')
            console.log(this.secoes)
            console.log('this.secoes')
            this.selectedSecao = this.secoes[0]
            this.initMostraGrafico()
            this.awaitData = false
            this.getIndicadoresVigentes(this.selectedSecao.id, this.mesCorrente, this.anoCorrente, 'consulta')
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    initMostraGrafico () {
      this.selectedSecao.categoria.forEach(categoria => {
        this.$set(this.mostraGrafico, categoria.id, false) // Inicializa como false
      })
    },

    toggleGrafico (categoriaId) {
      // Alterna entre true e false
      this.$set(this.mostraGrafico, categoriaId, !this.mostraGrafico[categoriaId])
    },

    getIndicadoresVigentes (secaoId, mes, ano, tipo, objeto) {
      console.log('estouaqui')
      if (tipo === 'consulta') {
        let objetoParaEnvio = {
          mes: mes,
          ano: ano,
          secao_id: secaoId
        }
        try {
          this.$http.post('indicadores/secao', objetoParaEnvio)
            .then(response => {
              this.dadosGerais = response.data
              // Limpa os inputs antigos
              this.inputs = {}
              this.inputsUpdate = {}
              // Itera sobre os valores retornados e atualiza os inputs
              for (let i = 0; i < this.dadosGerais.length; i++) {
                for (let j = 0; j < this.dadosGerais[i].indicadores.length; j++) {
                  if (this.dadosGerais[i].indicadores[j].indicador_valor) {
                    this.$set(this.inputs, this.dadosGerais[i].indicadores[j].id, this.dadosGerais[i].indicadores[j].indicador_valor.valor)
                    this.$set(this.inputsUpdate, this.dadosGerais[i].indicadores[j].id, this.dadosGerais[i].indicadores[j].indicador_valor.atualizado)
                  } else {
                    this.$set(this.inputs, this.dadosGerais[i].indicadores[j].id, null)
                    this.$set(this.inputsUpdate, this.dadosGerais[i].indicadores[j].id, null)
                  }
                }
              }
              this.awaitData = false
            })
            .catch(erro => console.log(erro))
        } catch (e) {
          console.log(e)
        }
      } else {
        const indicadoresValores = objeto
        // Limpa os inputs antigos
        this.inputs = {}
        this.inputsUpdate = {}
        // Itera sobre os valores retornados e atualiza os inputs
        indicadoresValores.forEach(indicador => {
          this.$set(this.inputs, indicador.indicador_id, indicador.valor)
          this.$set(this.inputsUpdate, indicador.indicador_id, indicador.updated_at)
        })
      }
    },

    pegaIndicadoresSecao (secao) {
      this.inputs = {}
      this.inputsUpdate = {}
      this.selectedSecao = secao
      this.awaitData = true
      this.getIndicadoresVigentes(secao.id, this.mesCorrente, this.anoCorrente, 'consulta')
    },

    gravaValores () {
      const entries = Object.entries(this.inputs)
      for (const [key, value] of entries) {
        // Converte novamente para garantir que são inteiros
        this.inputs[key] = parseInt(value, 10) || 0
      }

      let objetoParaEnvio = {}
      objetoParaEnvio['inputs'] = this.inputs
      objetoParaEnvio['ano'] = this.anoCorrente
      objetoParaEnvio['mes'] = this.mesCorrente

      const timezone = 'America/Manaus'
      objetoParaEnvio['atualizado'] = moment.tz(timezone).format('DD/MM/YYYY (HH:mm:ss)')

      try {
        this.$http.post('valorindicador', objetoParaEnvio)
          .then((response) => {
            this.getIndicadoresVigentes('', '', '', 'retorno', response.data)
            this.$toastr.s(
              'Indicadores lançados com sucesso', 'Sucesso!'
            )
          })
          .catch(erro => console.log(erro))
      } catch (e) {
        console.log(e)
      }
    },

    getColorForIndicator (indicador) {
      const value = parseFloat(this.inputs[indicador.id]) // Converte para número
      if (!isNaN(value)) {
        // Comparação com os limites do indicador
        // duas formas de manipular o controle de informação
        // - Quanto maior melhor
        // - Quanto menor melhor

        const lowerYellow = Math.min(indicador.yellow_1, indicador.yellow_2)
        const higherYellow = Math.max(indicador.yellow_1, indicador.yellow_2)

        if (indicador.tendencia === 'Quanto maior melhor') {
          if (value >= indicador.green) {
            return 'green' // Verde, se maior ou igual ao limite green
          } else if (value >= lowerYellow && value <= higherYellow) {
            return 'yellow' // Amarelo entre yellow_2 e green
          } else {
            return 'red' // Vermelho para valores abaixo de yellow_2
          }
        } else {
          if (value <= indicador.green) {
            return 'green' // Verde, se maior ou igual ao limite green
          } else if (value >= lowerYellow && value <= higherYellow) {
            return 'yellow' // Amarelo entre yellow_2 e green
          } else {
            return 'red' // Vermelho para valores abaixo de yellow_2
          }
        }
      }
      return 'grey' // Cor padrão se o valor não for válido
    },

    getMonthButtonClass (mes) {
      // Se for o mês corrente, retorna 'primary', caso contrário, 'success'
      return {
        secondary: this.mesCorrente === mes,
        success: this.mesCorrente !== mes,
        'mb-3': true // Mantém a classe de margem
      }
    },

    changeYear (direction) {
      if (direction === 'up') {
        this.anoCorrente++
        this.pegaIndicadoresSecao(this.selectedSecao)
      } else {
        this.anoCorrente--
        this.pegaIndicadoresSecao(this.selectedSecao)
      }
    },

    handleInput (indicatorId, value) {
      // Converte o valor para inteiro ou define como 0 se a conversão falhar
      const intValue = parseInt(value, 10)
      if (isNaN(intValue)) {
        this.inputs[indicatorId] = 0
      } else {
        this.inputs[indicatorId] = intValue
      }
    },

    formatDateTime (isoString) {
      if (isoString === undefined) {
        return 'Sem Lançamentos'
      } else {
        const date = new Date(isoString)
        // Formata a data
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0') // Janeiro é 0!
        const year = date.getFullYear()

        // Formata a hora
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const seconds = date.getSeconds().toString().padStart(2, '0')

        return `${day}/${month}/${year} (${hours}:${minutes}:${seconds})`
      }
    },

    evaluateColors (colorArray) {
      // Checar se algum elemento da array é 'red'
      if (colorArray.includes('red')) {
        return 'red'
      } else if (colorArray.includes('yellow')) {
        return 'yellow'
      }
      // Se nenhuma das condições acima for verdadeira, retorna 'green'
      return 'green'
    },

    ajustaCorBtn (indicador) {
      return this.getColorForIndicator(indicador)
    },

    checaCorCardCategoria (categoria) {
      // implementa a lógica
      // preciso saber o seguinte
      // cada indicador possui um green, yellow_1 e 2 e Red
      // dentro de um indicador.indicadorValor eu tenho um valor para comparar
      // - se um deles for amarelo ou vermelho a cor não pode ser verde
      // - se um deles for vermelho a cor tem que ser vermelho
      // - se um deles for amarelo, e os outros verdes, a cor é amarelo

      let arrayComparativa = []
      for (let i = 0; i < categoria.indicadores.length; i++) {
        arrayComparativa.push(this.getColorForIndicator(categoria.indicadores[i]))
      }
      return this.evaluateColors(arrayComparativa)
    },

    escolheMesIndicador (mes) {
      this.mesCorrente = mes
      this.pegaIndicadoresSecao(this.selectedSecao)
    },

    checaMesDisabled (index) {
      if (this.anoBase === this.anoCorrente) {
        if (this.capturaIndexMes >= index) {
          return false
        } else {
          return true
        }
      } else {
        return false
      }
    },

    getCurrentDate () {
      // Obtém a data atual
      const currentDate = new Date()

      // Define os meses
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ]

      this.diaCorrente = currentDate.getDate()

      // Calcula o mês e ano de referência
      let mesIndex = currentDate.getMonth() - 1
      let anoRef = currentDate.getFullYear()

      // Ajusta o ano se o mês for janeiro
      if (mesIndex === 0) {
        mesIndex = 11
        anoRef -= 1
      }

      this.capturaIndexMes = mesIndex

      this.mesCorrente = months[mesIndex] // Retorna o mês anterior como texto
      this.anoCorrente = anoRef // Retorna o ano de referência
      this.anoBase = anoRef // Retorna o ano de referência
    }
  }
}
</script>

<style>

.bgConfig {
  background-color: #CFE0BC !important;
}

.textlConfig {
  font-family: 'Impact', sans-serif;
  color: white;
}
</style>
