<template>
  <v-container>

    <v-row dense>
      <v-col>
        <v-card class="bordaAzul"
                elevation="10"
                rounded="xxl"
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
            <v-form @submit.prevent="efetuarLogin">
              <v-container>

                <!--matricula-->
                <v-row no-gutters>
                  <v-col>
                    <v-text-field
                      v-model="usuario.matricula"
                      clearable
                      dense
                      label="Matricula"
                      name="matricula"
                      outlined
                      placeholder="Insira a sua matrícula"
                      required
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
                <v-row dense>
                  <!--logar-->
                  <v-col>
                    <v-btn block
                           class="white--text"
                           color="#015088"
                           elevation="2"
                           type="submit"
                    >Entrar
                    </v-btn>
                  </v-col>
                </v-row>

              </v-container>
            </v-form>
          </v-card-text>

        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>import config from '../../http/config'

export default {
  data () {
    return {
      configSis: config,
      usuario: {
        matricula: '',
        password: ''
      },
      show1: false
    }
  },
  computed: {},
  props: {
    tipo: String
  },
  methods: {
    efetuarLogin () {
      if (this.usuario.matricula === '' || this.usuario.password === '') {
        this.$toastr.e(
          'Preencha todos os campos', 'Erro!'
        )
      } else {
        this.$store.dispatch('efetuarLogin', this.usuario)
          .then(response => {
            if (this.tipo === 'Aluno' && response.user.tipo === 'Aluno') {
              // aqui eu posso emitir para ocultar o login
            } else if (this.tipo === 'Admin' && response.user.tipo === 'Aluno') {
              // o aluno não pode estar aqui
              // fecho o dialog e lanço o toaster informando que o aluno não pode estar aqui
              this.$store.commit('DESLOGAR_USUARIO')
              this.$router.push({name: 'index'})
              this.$toastr.e(
                'Você não é um administrador', 'Erro!'
              )
            } else {
              this.$router.push({name: 'home'})
            }
            /*
            if (response.user.reset) {
              this.$router.push({name: 'reset'})
            } else {
              this.$router.push({name: 'home'})
            }
            */
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
.bordaBranca {
  position: relative;
}

.bordaBranca::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 3px solid white;
  pointer-events: none;
  border-radius: 30px;
}

.bordaAzul {
  position: relative;
}

.bordaAzul::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 3px solid #cd7f0d;
  pointer-events: none;
  border-radius: 30px;
}
</style>
