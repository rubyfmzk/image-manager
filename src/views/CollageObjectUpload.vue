<template>
  <div id="collage_object_upload">
    <h1>コラージュ元画像アップロード</h1>
    <p>
      <input type="radio" name="type" v-model="type" value="object" checked>Object
      <input type="radio" name="type" v-model="type" value="background">Background
      <input type="radio" name="type" v-model="type" value="color">Color
    </p>
    <p>
      <input @change="select_file" ref="file" type="file" /><br>
      <button @click="regist">Upload</button>
    </p>
  </div>
</template>

<script>
import Mixin from '@/components/Common'
import Amplify, { Storage } from 'aws-amplify'
import config from '@/config'
Amplify.configure(config)

export default{
  mixins:[Mixin],
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
#collage_object_upload{
    line-height: 2.5;
    margin: 60px;
    text-align: center;
}
#collage_object_upload p{
    margin-top: 20px;
}
</style>