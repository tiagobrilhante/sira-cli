<template>
  <!-- container básico-->
  <v-row v-if="Object.keys(objetoPesquisa).length > 0" class="mt-0" dense>
    <v-col>
      <v-alert elevation="12">
        <v-row>
          <v-col>
            <h3>Resultado da Tela</h3>
          </v-col>
          <v-col class="text-right">
            <v-btn :loading="loadingBtn" color="success" small @click="newTela">
              <v-icon class="pr-4" small>mdi-plus-circle</v-icon>
              Nova Tela
            </v-btn>
            <v-btn color="primary" small @click="openDialogSaveTela">
              <v-icon class="pr-4" small>mdi-content-save-outline</v-icon>
              Salvar Tela
            </v-btn>
          </v-col>
        </v-row>

        <br>
        <v-alert elevation="12">
          <v-row dense>
            <v-col><b>Tipo de Gráfico: </b> <span v-if="tipoGraph === 'pie'">Pizza</span> <span v-else>Barra</span>
            </v-col>
            <v-col><b>Forma de montagem: </b> {{ objetoPesquisa.forma }}</v-col>

          </v-row>
          <v-row dense>
            <v-col>
              <span v-html="retornaDadosAjustados('Mês')"> </span>
            </v-col>
            <v-col>
              <span v-html="retornaDadosAjustados('Ano')"> </span>
            </v-col>
          </v-row>
        </v-alert>

        <v-alert elevation="12">
          <apexchart v-if="series.length > 0" ref="apexChart" :options="chartOptions" :series="series" :type="tipoGraph"
                     height="600"/>
        </v-alert>

      </v-alert>
    </v-col>

    <!--Dialog para salvar tela-->
    <v-dialog v-model="dialogSaveTela" max-width="800px">
      <v-card>
        <v-card-title class="justify-center" primary-title>
          Salvar Tela
        </v-card-title>
        <v-card-text>
          <!--nome da tela-->
          <v-row>
            <v-col>
              <span class="pl-3">Nome da Tela</span>
              <v-text-field
                v-model="objTela.nome"
                dense
                hint="Escreva algo para identificar essa tela"
                label="Nome da tela"
                rounded
                solo
              ></v-text-field>
            </v-col>
          </v-row>

        </v-card-text>
        <v-card-actions class="pb-5">
          <v-spacer></v-spacer>
          <v-btn color="success" @click="doSaveTela">Salvar</v-btn>
          <span class="pl-5 pr-5"></span>
          <v-btn color="grey lighten-1" @click="dialogSaveTela = false">Cancelar</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import BarraNavegacao from '../barra-navegacao/BarraNavegacao.vue'

export default {
  name: 'tela',
  mixins: [logoutMixin],
  components: {BarraNavegacao},
  data: () => ({
    series: [],
    chartOptions: {
      title: {
        text: '', // Placeholder, será atualizado no mounted
        align: 'center',
        margin: 30,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize: '20px',
          color: '#263238'
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
          const label = opts.w.config.labels[opts.seriesIndex]
          const absoluteValue = opts.w.config.series[opts.seriesIndex]
          return `${label}: ${val.toFixed(2)}% (${absoluteValue})`
        },
        style: {
          fontSize: '20px',
          colors: ['#ffffff']
        },
        dropShadow: {
          enabled: true,
          top: 2,
          left: 2,
          right: 2,
          bottom: 2,
          blur: 5,
          opacity: 1
        }
      },
      chart: {
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          },
          autoSelected: 'zoom', // Ferramenta padrão selecionada
          export: {
            csv: {
              filename: undefined,
              columnDelimiter: ',',
              headerCategory: 'category',
              headerValue: 'value'
            },
            svg: {
              filename: undefined
            },
            png: {
              filename: undefined
            }
          }
        },
        zoom: {
          enabled: true,
          type: 'x', // Zoom apenas no eixo X
          autoScaleYaxis: true // Ajusta automaticamente o eixo Y ao fazer zoom
        },
        pan: {
          enabled: true,
          mode: 'x' // Pan apenas no eixo X
        }
      },
      legend: {
        show: true,
        position: 'top', // Coloca as legendas à direita
        floating: false, // Mantém as legendas não flutuantes
        horizontalAlign: 'center', // Alinha as legendas à esquerda da posição
        fontSize: '18px', // Aumenta o tamanho da fonte das legendas
        labels: {
          colors: ['#263238'], // Cor das legendas
          useSeriesColors: false
        },
        markers: {
          width: 12,
          height: 12,
          strokeWidth: 0,
          strokeColor: '#fff',
          radius: 12,
          customHTML: undefined,
          onClick: undefined,
          offsetX: 0,
          offsetY: 0
        },
        itemMargin: {
          horizontal: 20, // Ajusta para que as legendas fiquem uma abaixo da outra
          vertical: 5 // Espaçamento entre as legendas
        },
        containerMargin: {
          left: 35,
          top: 0
        }
      }
    },
    loadingBtn: false,
    dialogSaveTela: false,
    objTela: {
      nome: '',
      pesquisaFeita: {}
    }
  }),
  props: {
    resultado: Array,
    tipoGraph: String,
    objetoPesquisa: Object
  },

  computed: {
    ...mapGetters(['usuarioLogado'])
  },

  async mounted () {
    await this.getSeries()
    this.redrawChart() // Chama o redraw após as configurações
  },

  methods: {
    getSeries () {
      if (this.tipoGraph === 'pie') {
        this.chartOptions.chart.height = 1000
        // Para gráficos do tipo "pie"
        this.series = this.resultado.map(r => r.valor)
        this.chartOptions.labels = this.resultado.map(r => ` ${r.indicador.categoria.nome} - ${r.indicador.nome}  `)
        this.chartOptions.title.text = [...new Set(this.resultado.map(r => r.indicador.categoria.nome))].join(' -X- ')
      } else if (this.tipoGraph === 'bar') {
        if (this.objetoPesquisa.forma === 'Ano específico') {
          // Para gráficos do tipo "bar"
          this.chartOptions.title.text = [...new Set(this.resultado.map(r => r.indicador.categoria.nome))].join(' -X- ')

          // Preparando a lista única de meses e ordenando
          const meses = [...new Set(this.resultado.map(r => r.mes))].sort((a, b) => a - b)

          // Mapear as séries por indicador
          this.series = [...new Set(this.resultado.map(r => `${r.indicador.categoria.nome} - ${r.indicador.nome}`))]
            .map(nomeIndicador => {
              return {
                name: nomeIndicador,
                data: meses.map(mes => {
                  // Busca o valor correspondente ao mês e indicador atual
                  const entry = this.resultado.find(r => r.mes === mes && `${r.indicador.categoria.nome} - ${r.indicador.nome}` === nomeIndicador)
                  return entry ? entry.valor : 0 // Retorna o valor ou 0 se não houver dado para o mês
                })
              }
            })

          // Função para gerar uma cor aleatória em formato hexadecimal
          // eslint-disable-next-line no-inner-declarations
          function generateRandomColor () {
            const letters = '0123456789ABCDEF'
            let color = '#'
            for (let i = 0; i < 6; i++) {
              color += letters[Math.floor(Math.random() * 16)]
            }
            return color
          }

          // Gerar cores aleatórias para cada série
          this.chartOptions.colors = this.series.map(() => generateRandomColor())

          // Configurando as categorias do eixo X com os meses correspondentes
          this.chartOptions.xaxis = {
            categories: meses.map(mes => {
              const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
              return nomesMeses[mes - 1]
            })
          }

          // Configurações para exibir as informações diretamente no gráfico do tipo "bar"
          this.chartOptions.plotOptions = {
            bar: {
              dataLabels: {
                position: 'top', // Coloca os valores no topo das barras
                formatter: function (val, opts) {
                  return `${val}` // Exibe apenas o valor na barra
                },
                style: {
                  fontSize: '12px',
                  colors: ['#000']
                }
              }
            }
          }

          // Habilitando dataLabels globalmente
          this.chartOptions.dataLabels = {
            enabled: true,
            offsetY: -20, // Ajuste para posicionamento dos labels
            style: {
              fontSize: '12px',
              colors: ['#304758']
            }
          }
        } else if (this.objetoPesquisa.forma === 'Intervalo de anos' || this.objetoPesquisa.forma === 'Intervalo de meses de um ano específico' || this.objetoPesquisa.forma === 'Intervalo de meses de um intervalo de anos') {
          // Para gráficos do tipo "bar"
          this.chartOptions.title.text = [...new Set(this.resultado.map(r => r.indicador.categoria.nome))].join(' -X- ')

          // Preparando uma lista única de anos e meses com dados, sem valores vazios
          const mesesAnos = [...new Set(this.resultado.map(r => `${r.mes}-${r.ano}`))].sort((a, b) => {
            const [mesA, anoA] = a.split('-').map(Number)
            const [mesB, anoB] = b.split('-').map(Number)
            return anoA !== anoB ? anoA - anoB : mesA - mesB
          })

          // Mapear as séries por indicador, somente para meses/anos com dados
          this.series = [...new Set(this.resultado.map(r => `${r.indicador.categoria.nome} - ${r.indicador.nome}`))]
            .map(nomeIndicador => {
              return {
                name: nomeIndicador,
                data: mesesAnos.map(mesAno => {
                  const [mes, ano] = mesAno.split('-').map(Number)
                  // Busca o valor correspondente ao mês, ano e indicador atual
                  const entry = this.resultado.find(r => r.mes === mes && r.ano === ano && `${r.indicador.categoria.nome} - ${r.indicador.nome}` === nomeIndicador)
                  return entry ? entry.valor : null // Retorna o valor ou null se não houver dado para o mês/ano
                }).filter(val => val !== null) // Remove os valores nulos
              }
            })

          // Função para gerar uma cor aleatória em formato hexadecimal
          // eslint-disable-next-line no-inner-declarations
          function generateRandomColor () {
            const letters = '0123456789ABCDEF'
            let color = '#'
            for (let i = 0; i < 6; i++) {
              color += letters[Math.floor(Math.random() * 16)]
            }
            return color
          }

          // Gerar cores aleatórias para cada série
          this.chartOptions.colors = this.series.map(() => generateRandomColor())

          // Configurando as categorias do eixo X com os meses/anos correspondentes
          this.chartOptions.xaxis = {
            categories: mesesAnos.map(mesAno => {
              const [mes, ano] = mesAno.split('-').map(Number)
              const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
              return `${nomesMeses[mes - 1]} - ${ano}`
            })
          }

          // Configurações para exibir as informações diretamente no gráfico do tipo "bar"
          this.chartOptions.plotOptions = {
            bar: {
              dataLabels: {
                position: 'top', // Coloca os valores no topo das barras
                formatter: function (val, opts) {
                  return `${val}` // Exibe apenas o valor na barra
                },
                style: {
                  fontSize: '12px',
                  colors: ['#000']
                }
              }
            }
          }

          // Habilitando dataLabels globalmente
          this.chartOptions.dataLabels = {
            enabled: true,
            offsetY: -20, // Ajuste para posicionamento dos labels
            style: {
              fontSize: '12px',
              colors: ['#304758']
            }
          }
        }
      }
    },

    redrawChart () {
      this.$refs.apexChart.updateOptions(this.chartOptions, true, true)
      this.$refs.apexChart.updateSeries(this.series, true)
    },

    retornaDadosAjustados (tipo) {
      /* formas
      Mês de um ano específico
      Intervalo de meses de um ano específico
      Ano específico
      Intervalo de anos
      Intervalo de meses de um intervalo de anos
      */
      if (tipo === 'Mês') {
        if (this.objetoPesquisa.forma === 'Mês de um ano específico') {
          return '<b>Mês:</b> ' + this.objetoPesquisa.mes
        }
        if (this.objetoPesquisa.forma === 'Intervalo de meses de um ano específico' || this.objetoPesquisa.forma === 'Intervalo de meses de um intervalo de anos') {
          let meses = ''
          for (let i = 0; i < this.objetoPesquisa.mes.length; i++) {
            let porVirgula = i < this.objetoPesquisa.mes.length - 1 ? ', ' : ''
            meses += this.objetoPesquisa.mes[i] + porVirgula
          }
          return '<b>Meses:</b> ' + meses
        }
        if (this.objetoPesquisa.forma === 'Ano específico' || this.objetoPesquisa.forma === 'Intervalo de anos') {
          return '<b>Meses:</b> Todos'
        }
      } else {
        if (this.objetoPesquisa.forma === 'Mês de um ano específico' || this.objetoPesquisa.forma === 'Intervalo de meses de um ano específico' || this.objetoPesquisa.forma === 'Ano específico') {
          return '<b>Ano:</b> ' + this.objetoPesquisa.ano_verifica_inicio
        }
        if (this.objetoPesquisa.forma === 'Intervalo de meses de um intervalo de anos' || this.objetoPesquisa.forma === 'Intervalo de anos') {
          let anos = 'entre: ' + this.objetoPesquisa.ano_verifica_inicio + ' e ' + this.objetoPesquisa.ano_verifica_fim
          return '<b>Anos:</b> ' + anos
        }
      }
    },

    newTela () {
      this.loadingBtn = true
      this.resetTela()
        .then(() => {
          this.$emit('resetaTela')
        })
        .catch(error => {
          console.error('Erro ao resetar a tela:', error)
        })
    },

    resetTela () {
      return new Promise((resolve, reject) => {
        // Sua lógica de reset; chame resolve() ou reject() conforme apropriado
        resolve()
      })
    },

    openDialogSaveTela () {
      this.dialogSaveTela = true
    },
    doSaveTela () {
      if (this.objTela.nome === '') {
        this.$toastr.e(
          'O nome da tela é obrigatório', 'Erro!'
        )
      } else {
        this.objTela.pesquisaFeita = this.objetoPesquisa
        try {
          this.$http.post('tela/savetela', this.objTela)
            .then(() => {
              this.$toastr.s(
                'Tela cadastrada com sucesso', 'Sucesso!'
              )
              this.dialogSaveTela = false
              this.objTela = {
                nome: '',
                pesquisaFeita: {}
              }
              this.$emit('ajustaTelasSalvas')

              this.$nextTick(() => {
                this.$emit('resetaTela')
              })
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
.apexcharts-toolbar {
  display: flex !important;
}
</style>
