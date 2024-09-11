<template>
  <v-main>

    <BarraNavegacao></BarraNavegacao>

    <v-container fluid>

      <!--form para login-->
      <v-form @submit.prevent="efetuarLogin">
        <v-container>
          <br>

          <!--cabeçalho-->
          <v-row>

            <v-col cols="8" offset="2">
              <v-alert class="ma-0" rounded="xl" dense>

                <v-row>
                  <v-col cols="2" class="text-left align-self-start align-content-start">
                    <img alt="Logo CMA" :src="require('@/assets/img/logoCMA.png')" width="70px">
                  </v-col>
                  <v-col class="text-center" cols="8">
                    <h1>{{ configSis.nomeSis }}</h1><br>
                    <h3>{{ configSis.labelSis }}</h3>
                  </v-col>
                  <v-col cols="2" class="text-right align-self-end align-content-end">
                    <img alt="Logo EB" :src="require('@/assets/img/logoEb.png')" width="60px">
                  </v-col>
                </v-row>

              </v-alert>
            </v-col>
          </v-row>

          <v-row>
            <v-col
              cols="8"
              offset="2"
            >
              <v-card
                elevation="10"
                rounded="lg"
              >

                <!--card title-->
                <v-card-title>
                  <v-icon class="mr-4">
                    fa fa-user
                  </v-icon>
                  Login
                </v-card-title>

                <!--card text-->
                <v-card-text>
                  <v-container>

                    <!--cpf-->
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          id="email"
                          v-model="usuario.cpf"
                          clearable
                          dense
                          label="CPF"
                          name="cpf"
                          outlined
                          placeholder="Insira o seu CPF"
                          required
                          v-mask-cpf
                        />
                      </v-col>
                    </v-row>

                    <!--Password-->
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          v-model="usuario.password"
                          :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                          :type="show1 ? 'text' : 'password'"
                          clearable
                          counter
                          dense
                          hint="No mínimo 6 caracteres"
                          label="Senha"
                          name="password"
                          outlined
                          required
                          @click:append="show1 = !show1"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <!--logar e cadastro-->
                    <v-row no-gutters>
                      <!--logar-->
                      <v-col class="text-left">
                        <v-btn
                          color="primary"
                          elevation="2"
                          type="submit"
                        >Entrar
                        </v-btn>
                      </v-col>
                    </v-row>

                  </v-container>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-container>

  </v-main>

</template>

<script>import config from '../http/config'
import {cpf} from 'cpf-cnpj-validator'
import BarraNavegacao from '../components/barra-navegacao/BarraNavegacao'

export default {

  components: {
    BarraNavegacao
  },
  data () {
    return {
      configSis: config,
      usuario: {},
      show1: false
    }
  },
  computed: {
  },
  methods: {
    efetuarLogin () {
      if (!cpf.isValid(this.usuario.cpf)) {
        this.$toastr.e(
          'CPF invalido', 'Erro!'
        )
      } else {
        this.$store.dispatch('efetuarLogin', this.usuario)
          .then(response => {
            if (response.user.reset) {
              this.$router.push({name: 'reset'})
            } else {
              this.$router.push({name: 'home'})
            }
          })
          .catch(erro => {
            if (erro.request.status === 401) {
              this.$toastr.e(
                'Login ou senha inválidos', 'Erro!'
              )
            }
          })
      }
    }
  }
}
</script>
<style>
</style>
