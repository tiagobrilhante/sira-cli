const urlDownload = 'http://localhost:8000/'
// const urlDownload = 'http://sicc.com.br/'

const baseURL = urlDownload + 'api/'

const versoes = [
  {
    id: '1.0 A',
    release: '001 (alpha)',
    latest: true,
    data: '11/09/2024',
    detalhesVisiveis: false,
    detalhes: [
      'É iniciado o processo de desenvolvimento do SICC (Sistema Interno de Controle de Chamados) em 11 de Setembro de 2024',
      'Utiliza Vue.js (v2.7) no front-end, Lumen-Laravel-PHP (v8.0) no back-end',
      'Preferencialmente usado com SGBD MySql.'
    ]
  }
]

const nomeSis = 'SICC'
const versaoSis = versoes[0].id
const labelSis = 'Sistema Interno de Controle de Chamados'
const criador = 'Tiago da Silva Brilhante'
// info geral
const revisarForm = 'Revise os campos do formulário.'

export default {
  urlDownload,
  baseURL,
  nomeSis,
  versaoSis,
  labelSis,
  criador,
  // info geral
  revisarForm,
  // versoes
  versoes
}
