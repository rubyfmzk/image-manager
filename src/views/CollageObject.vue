<template>
  <div id="collage_object_upload">
    <h1>コラージュ画像一覧</h1>

    <table>
      <tr v-for="(image,i) in images" :key="i">
        <td><img :src="get_thumbnail(image.type, image.image_id)" @click="click_image(image.type, image.image_id, image.motif)"></td>
        <td>{{image.type}}</td>
        <td>{{image.image_id}}</td>
        <td><input id="motif" :value="image.motif"></td>
        <td><button @click="change_info(image.image_id, image.motif, image.type, i)">Change</button></td>
        <td><button @click="delete_img(image.image_id, image.motif, image.type)">Delete</button></td>
      </tr>
    </table>

  </div>
</template>

<script>
import Mixin from '@/components/Common'
import define from '@/assets/js/define'
import axios from 'axios'
import Amplify from 'aws-amplify'
import config from '@/config'
Amplify.configure(config)

export default{
  mixins:[Mixin],
  props: ['current', 'jwtToken'],
  data(){
    return{
      images: this.images,
    }
  },
  mounted(){
    this.show_images()
  },
  methods:{
    delete_img(image_id, motif, type){
      window.confirm('Do you really delete this?')

      let url = define.API_BASE_URL+image_id+'/'+motif+'/'+type

      axios
      .delete(
        url,
        //{},
        {
          headers: {
            Authorization: this.jwtToken,
          }
        }
      )
      .then(r=>{
        console.log(r)
      })
      .catch(r=>{
        console.log(r)
      })
    },

    get_thumbnail(type, image_id){
      return define.BASE_URL+type+'/thumbnail/'+image_id+'.png'
    },

    change_info(image_id, motif, type, i){
      let new_image_id = image_id
      let new_motif = this.$$$('#motif')[i].value

      let url = define.API_BASE_URL+image_id+'/'+motif

      axios
      .patch(
        url,
        {
          new_image_id: new_image_id,
          new_motif: new_motif,
          type: type,
        },
        {
          headers: {
            Authorization: this.jwtToken,
          }
        }
      )
      .then(r=>{
        console.log(r)
      })
      .catch(r=>{
        console.log(r)
      })
    },

    show_images(){
      let api = define.API_BASE_URL
      axios
        .get(api)
        .then(r=>{
console.log(r)
          this.images = r.data.Items
        })
    },

  }
}
</script>

<style>
body{
    background: #445;
}
table td{
    padding-left: 20px;
    padding-right: 20px;
}
table img{
    border: solid 1px #666;
  }
</style>