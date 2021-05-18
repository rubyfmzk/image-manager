<template>
  <div id="collage_object_upload">
    <h1>サビアンシンボル画像アップロード</h1>
    <p>
      <select id="sign" v-model="sign">
        <option v-for="sign in 12" :key="sign" :value="sign">{{SIGN_LIST[sign-1].key}}</option>
      </select>
      <select id="degree" v-model="degree">
        <option v-for="degree in 30" :key="degree" :value="degree">{{degree}}</option>
      </select>
    </p>
    <p>
      <input @change="select_file" ref="file" type="file" /><br>
      <button @click="regist(sign, degree)">Upload</button>
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
      SIGN_LIST: [
        {key: "Aries"},
        {key: "Taurus"},
        {key: "Gemini"},
        {key: "Cancer"},
        {key: "Leo"},
        {key: "Virgo"},
        {key: "Libra"},
        {key: "Scorpio"},
        {key: "Sagittarius"},
        {key: "Capricorn"},
        {key: "Aquarius"},
        {key: "Pisces"},
      ],
      sign: this.sign,
      degree: this.degree,
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
    async regist(sign, degree){
      sign = sign.zeroPadding(2)
      degree = degree.zeroPadding(2)
      let s3_key = 'sabian-symbols/'+sign+'/'+degree+'.jpg'
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