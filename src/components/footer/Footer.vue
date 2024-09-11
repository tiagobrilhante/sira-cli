<template>

  <v-footer
    app
    class="ma-0 pa-0"
    color="#556b2f"
  >

    <!-- Espaço para versoes-->
    <v-row no-gutters>
      <v-col class="text-center">
        <span
          class="caption">{{ configSis.nomeSis }} <v-btn class="pa-0 ma-0" link plain x-small
                                                         @click="dialogVersoes = true">({{
            configSis.versaoSis
          }})</v-btn> - Todos os direitos reservados / {{
            new Date().getFullYear()
          }} — <strong>Criado por: <v-btn
            class="pa-0 ma-0" link plain x-small
            @click="dialogProgramador = true">{{ configSis.criador }}</v-btn></strong></span>
      </v-col>
    </v-row>

    <!--Dialog para ver detalhes de versão-->
    <v-dialog v-model="dialogVersoes" max-width="70%">

      <v-card>

        <v-card-title class="justify-center" primary-title>

          <v-row>
            <v-col>
              Detalhe de Versões
            </v-col>
          </v-row>

        </v-card-title>

        <v-card-text>

          <v-alert class="text-justify" color="cyan">
            <p>O Sistema CMA em Números, foi criado a pedido do Comando do CMA, para compor uma ferramenta de suporte a decisão, utilizando os conceitos de BIG DATA e gerenciamento de estatísticas.</p>
            <p>Trata-se de um sistema que foi projetado para propiciar o consumo de indicadores relevantes de acordo com as necessidades do Comando, além de estabelecer como esses indicadores se relacionar.</p>
            <p>O conteúdo é inserido pelos administradores cadastrados no sistema, que possui a capacidade de gerenciar de forma ativa qualquer tipo de métrica necessária ao processo decisório.</p>
            <p><b>Abaixo é possivel acompanhar o histórico de alterações das versões lançadas ao longo do tempo.</b></p>
          </v-alert>

          <ul>
            <li v-for="versao in versoes" :key="versao.id" class="mt-4">
              Versão: {{ versao.id }} r{{ versao.release }} - {{ versao.data }} <span
              v-if="versao.latest"> ( LATEST ) </span>
              <v-chip v-if="!versao.latest" class="ml-6" x-small @click="toggleDetalhes(versao.id)">Ver Detalhes
              </v-chip>
              <ul v-if="versao.detalhesVisiveis && !versao.latest">
                <li v-for="detalhe in versao.detalhes" :key="detalhe">{{ detalhe }}</li>
              </ul>

              <ul v-if="versao.latest">
                <li v-for="detalhe in versao.detalhes" :key="detalhe">{{ detalhe }}</li>
              </ul>

            </li>
          </ul>

        </v-card-text>

        <v-card-actions class="pb-5">

          <v-spacer></v-spacer>

          <v-btn
            color="grey lighten-1"
            @click="dialogVersoes = false">
            Fechar
          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>

    <!--Dialog para ver detalhes do programador-->
    <v-dialog v-model="dialogProgramador" max-width="800px">

      <v-card>

        <v-card-title class="justify-center" primary-title>

          Sobre o Programador

        </v-card-title>

        <v-card-text>
          <b></b>
          <br>
          <p>TC Cav Tiago da Silva <strong>Brilhante</strong></p>
          <p>O TC Brilhante é o chefe da Seção de Tecnologia da Informação / Seção de Desenvolvimento de Sistemas do Comando Militar da Amazônia</p>
          <p>Atua como desenvolvedor sênior Full-Stack com especialização desenvolvimento WEB.</p>
          <p>Trabalha com as seguintes linguagens:</p>
          <ul>
            <li>Java</li>
            <li>PHP</li>
            <li>JS</li>
            <li>Python</li>
          </ul>
          <br>

          <hr>

          <br>
          <p>Contato: tiagobrilhantemania@gmail.com</p>
        </v-card-text>

        <v-card-actions class="pb-5">

          <v-spacer></v-spacer>

          <v-btn
            color="grey lighten-1"
            @click="dialogProgramador = false">
            Fechar
          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>

  </v-footer>

</template>

<script>import config from '../../http/config'

export default {
  components: {
  },
  data: () => ({
    configSis: config,
    dialogVersoes: false,
    dialogProgramador: false,
    qualIcone: 'mdi-arrow-down-thick',
    versoes: config.versoes
  }),
  computed: {},
  methods: {
    mostraDetalhesVersao (versao) {
      console.log(versao)
    },

    toggleDetalhes (id) {
      const versao = this.versoes.find(v => v.id === id)
      if (versao) {
        versao.detalhesVisiveis = !versao.detalhesVisiveis
      }
    }
  }
}
</script>

<style>
.thewhite {
  color: white;
}

</style>
