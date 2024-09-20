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
  background-image: url('assets/img/estudante.jpg') !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
  background-color: #ffffff !important;
}
</style>
