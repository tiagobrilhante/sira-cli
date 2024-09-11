import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

// Translation provided by Vuetify (typescript)
import pt from 'vuetify/src/locale/pt.ts'

Vue.use(Vuetify)

export default new Vuetify({
  lang: {
    locales: { pt },
    current: 'pt'
  },
  pwa: {
    name: 'EBTotem',
    themeColor: '#4DBA87',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    manifestOptions: {
      icons: [
        {
          src: './img/icons/maskable_icon.png',
          sizes: '196x196',
          purpose: 'maskable'
        }
      ]
    }
  }
})
