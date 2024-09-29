<template>
  <v-main>
    <BarraNavegacao/>

    <v-container fluid>
      <v-row class="mt-5">
        <v-col
          cols="6"
          offset="3"
        >
          <v-card
            elevation="10"
            outlined
            rounded="lg"
          >
            <v-row>
              <v-col
                cols="10"
                offset="1">
                <div class="text-center pt-5">
                  <h1>Bem-vindo ao sistema CMA em Números!</h1>
                  <p>Sistema de Gerenciamento de Indicadores do CMA</p>
                  <p>Você precisa alterar a senha para efetuar o primeiro acesso</p>
                </div>
              </v-col>
            </v-row>

            <v-container fluid>
              <v-form @submit.prevent="alterarSenhaResetada">
                <v-container>
                  <v-row>
                    <v-col
                      cols="8"
                      offset="2"
                    >
                      <v-banner
                        elevation="10"
                        outlined
                        rounded="lg"
                      ><i class="fa fa-lock"/>
                        <span class="pl-5"/>
                        Altere sua senha
                      </v-banner>
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
                        <v-container fluid>
                          <!--Password-->
                          <v-row class="m-0">
                            <v-col
                              cols="12"
                            >
                              <v-text-field
                                v-model="password"
                                :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                                :error-messages="passwordErrors"
                                :type="show1 ? 'text' : 'password'"
                                clearable
                                counter
                                dense
                                hint="No mínimo 6 caracteres"
                                label="Senha"
                                name="password"
                                outlined
                                required
                                @blur="$v.password.$touch()"
                                @input="$v.password.$touch()"
                                @click:append="show1 = !show1"
                              />
                            </v-col>
                          </v-row>

                          <!--Submit-->
                          <v-row class="mt-0">
                            <v-col
                              cols="12"
                            >
                              <v-btn
                                block
                                color="primary"
                                elevation="2"
                                type="submit"
                              >Alterar senha
                              </v-btn>

                            </v-col>

                            <v-col>
                              <v-alert
                                type="warning"
                              > Ao clicar em "ALTERAR SENHA", você será levado novamente para a tela de Login
                              </v-alert>
                            </v-col>
                          </v-row>
                        </v-container>

                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-container>

          </v-card>
        </v-col>
      </v-row>

    </v-container>
  </v-main>
</template>

<script>import {logoutMixin} from '@/mixins'
import {validationMixin} from 'vuelidate'
import {required} from 'vuelidate/lib/validators'
import {mapGetters} from 'vuex'
import BarraNavegacao from '../../components/barra-navegacao/BarraNavegacao.vue'

export default {
  components: {BarraNavegacao},
  mixins: [logoutMixin, validationMixin],
  data () {
    return {
      show1: false,
      password: ''
    }
  },
  validations: {
    password: {required}
  },
  computed: {
    passwordErrors () {
      const errors = []
      if (!this.$v.password.$dirty) return errors
      !this.$v.password.required && errors.push('O Campo "Senha" não pode ficar em branco! ')
      return errors
    },
    ...mapGetters(['usuarioLogado'])
  },
  methods: {
    alterarSenhaResetada () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        let myObject = {}
        myObject['id'] = this.usuarioLogado.id
        myObject['password'] = this.password
        this.$http.post('users/password/reset', myObject)
          .then(() => {
            this.$toastr.s(
              'Senha alterada com sucesso', 'Sucesso!'
            )
            this.$store.commit('DESLOGAR_USUARIO')
            this.$router.push({name: 'login'})
          }, err => {
            console.log(err)
            this.$toastr.e(
              'Não foi possível alterar a senha', 'Erro!'
            )
          })
      }
    }
  }
}
</script>
