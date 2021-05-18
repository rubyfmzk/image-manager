<template>
  <div id="app">
    <!-- 認証済みの時はメインの画面を表示 -->
    <div v-if="signedIn">
      <router-view :jwtToken="jwtToken"/>
      <footer>
        <Link></Link>
        <div class="amplify-sign-out">
          <amplify-sign-out/>
        </div>
      </footer>
    </div>
    <!-- 認証していない時はログイン画面を表示 -->
    <div v-else>
      <amplify-authenticator :authConfig="authConfig" hide-sign-up="true" hideSignUp></amplify-authenticator>
    </div>
  </div>
</template>

<script>
import { Auth } from 'aws-amplify'
import { AmplifyEventBus } from 'aws-amplify-vue'
import { onAuthUIStateChange } from '@aws-amplify/ui-components'
import Link from '@/components/Link'

export default {
  name: 'App',
  components: {
    Link,
  },
  data(){
    return {
      signedIn: false,
      authConfig:{
        signInConfig: {
          isSignUpDisplayed: false
        }
      },
      jwtToken: this.jwtToken,
    }
  },
  beforeDestroy(){
    return onAuthUIStateChange
  },
  async beforeCreate() {
    // Auth.currentAuthenticatedUser()でユーザ情報を取得する。
    // 取得できなければ認証ステータスをfalseに設定する
    try {
      let cognitoUser = await Auth.currentAuthenticatedUser()
      this.signedIn = true
      this.username = cognitoUser.username
      this.jwtToken = cognitoUser.signInUserSession.idToken.jwtToken
    } catch (err) {
      this.signedIn = false
    }
    // 認証ステータスが変わった時に呼び出されるイベントを登録
    AmplifyEventBus.$on('authState', async  info => {
      if (info === 'signedIn') {
        let cognitoUser = await Auth.currentAuthenticatedUser()
        this.signedIn = true
        this.username = cognitoUser.username
      } else {
        this.signedIn = false
      }
    });
  }
}
</script>

<style scoped>
@import url("assets/css/common.scss")
</style>

<style>
button.Button__button___1FrBC{
    background: #333;
}
</style>
