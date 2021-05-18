<template>
  <div id="app">
    <h1>コラージュ画像アップロード</h1>
    <input type="radio" name="type" v-model="type" value="object" checked>Object
    <input type="radio" name="type" v-model="type" value="background">Background
    <input type="radio" name="type" v-model="type" value="color">Color
    <br>
    <input @change="select_file" ref="file" type="file" />
    <input @click="regist" type="button" value="Upload"/>
  </div>
</template>

<script>
import Amplify, { Storage } from 'aws-amplify'
import config from '@/config'
Amplify.configure(config)
export default{
  data(){
    return{
      type: this.type,
    }
  },
  mounted(){
    this.type = 'object'
  },
  methods:{
    select_file(e){
      const files = e.target.files || e.dataTransfer.files;
    // ファイルが選択されたら変数に入れる
      this.uploadfile = files[0];
    },
    async regist() {
      let now = new Date()
      let extension = this.uploadfile.name.match(/\.\w+/)[0]
      let s3_key = 'collage/'+this.type+'/' + now.toJSON().replace(/\D/g, '') + extension

      Storage.put(s3_key, this.uploadfile)
      .then(result=>{
        console.log(result)
        alert('アップロードしました')
      })
      .catch(e=>{
        console.log(e)
      })
    },
  },
}
</script>

<style>
#app{
    line-height: 2;
}
</style>