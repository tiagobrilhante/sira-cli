<template>
  <div>
    <v-menu
      offset-y
      open-on-hover
      rounded="b-xl"
    >

      <!--dados de usuário-->
      <v-row>
        <v-col>
          <!--Dados do usuário-->
          <v-card color="yellow lighten-4">
            <v-card-title>Dados do usuário</v-card-title>
            <v-card-text>
              <v-row>
                <v-col>
                  <b>Nome: </b> {{ usuarioLogado.nome }}<br>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Botão quando o usuário esta logado - First Name-->
      <template
        v-slot:activator="{ on, attrs }"
        v-if="usuarioResetado">
        <v-btn
          v-bind="attrs"
          block
          color="rgb(250, 115, 59)"
          dark
          rounded
          v-on="on"
        >
          <v-icon class="mr-5">mdi-account</v-icon>
          {{ usuarioLogado.firstName }}
        </v-btn>
      </template>

      <!-- Botão de ajustes de usuário - First Name-->
      <template
        v-slot:activator="{ on, attrs }"
        v-else>
        <v-btn
          v-bind="attrs"
          block
          color="secondary"
          dark
          to="/"
          v-on="on"
        >
          Sair
        </v-btn>
      </template>

      <!--list-->
      <v-list color="cyan lighten-4">
        <!--alterar senha-->
        <v-list-item @click.prevent="mudarSenhaAbrir">
          <v-list-item-title>
            <v-icon
              class="mr-3"
              small>mdi-lock</v-icon>
            Alterar Senha
          </v-list-item-title>
        </v-list-item>

        <!--Efetuar logout-->
        <v-list-item @click.prevent="retornaTotem">
          <v-list-item-title>
            <v-icon
              class="mr-3"
              small>mdi-logout</v-icon>
            Sair do Sistema
          </v-list-item-title>
        </v-list-item>

      </v-list>
    </v-menu>

    <!--Dialog para alteração de senha-->
    <v-dialog
      v-model="dialogSenha"
      max-width="800px">
      <v-card>
        <v-card-title
          class="justify-center"
          primary-title> Alteração de senha de usuário</v-card-title>
        <v-form @submit.prevent="alterarSenha">
          <v-card-text>
            <h3><b>Insira a sua Nova Senha</b></h3><br>
            <v-alert
              border="left"
              dense
              type="warning">
              Ao alterar a sua senha, você será desconectado do {{ configSis.nomeSis }} para realizar um novo login.
            </v-alert>
            <v-divider/>
            <br>
            <!--Password-->
            <v-row>
              <v-col>
                <v-text-field
                  v-model="password"
                  :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="show1 ? 'text' : 'password'"
                  clearable
                  counter
                  dense
                  hint="No mínimo 6 caracteres"
                  label="Nova Senha"
                  name="password"
                  outlined
                  required
                  @click:append="show1 = !show1"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer/>
            <v-btn
              color="primary"
              elevation="2"
              type="submit"
            >Alterar senha
            </v-btn>
            <v-btn
              color="error"
              elevation="2"
              @click="dialogSenha = false">Cancelar
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>import {logoutMixin} from '@/mixins'
import {mapGetters} from 'vuex'
import {validationMixin} from 'vuelidate'
import {required} from 'vuelidate/lib/validators'
import config from '../../http/config'

export default {
  mixins: [logoutMixin, validationMixin],
  data: () => ({
    dialogSenha: false,
    show1: false,
    password: '',
    configSis: config
  }),
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
    ...mapGetters(['usuarioResetado', 'usuarioLogado'])

  },
  methods: {
    retornaTotem () {
      this.$store.commit('DESLOGAR_USUARIO')
      this.$router.push({name: 'index'})
    },
    mudarSenhaAbrir () {
      this.dialogSenha = true
    },

    alterarSenha () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        let myObject = {}
        myObject['password'] = this.password
        this.$http.post('users/password/change', myObject)
          .then(() => {
            this.dialogSenha = false
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
