<template>
  <v-app id="inspire" class="bgApp">
    <router-view/>
    <Footer/>
  </v-app>
</template>

<script>import Footer from './components/footer/Footer'

export default {
  components: {
    Footer
  },
  data () {
    return {}
  },
  created () {
  },
  computed: {},
  methods: {}
}
</script>

<style>
.bgApp {
  background-image: url('assets/img/cammo3.jpg') !important;
  background-repeat: repeat;
  background-size: contain;
  background-color: #cccccc;
}
</style>
