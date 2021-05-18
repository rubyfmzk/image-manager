<template>
  <div id="collage_draiwing">
    <nav>
      Scale
      <input id="input_scale" @change="change_canvas_scale($event.target.value)" v-model="current_data.img_info.scale">
      <input id="input_scale_range" type="range" value="0" min="-30" max="15" @change="change_canvas_scale($event.target.value)" v-model="current_data.img_info.scale">
      Rotate
      <input id="input_rotate" @change="change_canvas_rotate($event.target.value)" v-model="current_data.img_info.rotate">
      <input id="input_rotate_range" type="range" value="0" min="-45" max="45" @change="change_canvas_rotate($event.target.value)" v-model="current_data.img_info.rotate">
      Flip X
      <input id="input_flip_x" type="checkbox" value="0" @change="change_canvas_flip($event.target.checked, 'x')" v-model="current_data.img_info.flip_x"><br>
      Color<br>
      <input id="input_color1" type="color" value="#ffffff" @change="change_filter()" v-model="current_data.img_info.color1">
      <input id="input_color2" type="color" value="#ffffff" @change="change_filter()" v-model="current_data.img_info.color2"><br>
      <div>
        <input id="input_filter_alpha" type="range" value="100" min="0" max="100" @change="change_filter()" v-model="current_data.img_info.filter.alpha">
        <select id="input_filter_type" name="filter" @change="change_filter()" v-model="current_data.img_info.filter.type">
          <option v-for="(v,i) in filter_options" :value="i" :key="i">{{v}}</option>
        </select><br>
        <a @click="change_filter()">change color</a>
      </div>
      <div>
        Layer
      </div>
      <draggable tag="ul" id="layer" @end="set_layer_order">
        <li v-for="id in layer_order" :key="id" :id="id" @click="click_layer"><img :src="get_layer_thumbnail(id)"></li>
      </draggable>

      <div>
        <button @click="delete_layer">Delete</button>
      </div>
      <div>
        W×H<br>
        <input id="input_width" value="192" @input="change_canvas_size('w', $event.target.value)" v-model="canvas_w">
        <input id="input_height" value="108" @change="change_canvas_size('h', $event.target.value)" v-model="canvas_h">
      </div>
      <div>
        File Name
        <input id="file_name" v-model="file_name">
        <a id="post" @click="post"><button>Post</button></a>
      </div>
    </nav>

    <section id="main_section">
      <div id="canvas" width="1920" height="1080"></div>

      <div id="images">
        <img v-for="(image,i) in images" :key="i" :src="get_thumbnail(image.type, image.image_id)" @click="click_image(image.type, image.image_id, image.motif)">
      </div>
    </section>
  </div>
</template>

<script>
import Mixin from '@/components/Common'
import define from '@/assets/js/define'
import axios from 'axios'
import interact from 'interactjs'
import draggable from 'vuedraggable'
import Amplify, { Storage } from 'aws-amplify'
import config from '@/config'
Amplify.configure(config)

export default {
  mixins:[Mixin],
  props: ['current', 'jwtToken'],
  components: {
    'draggable': draggable,
  },
  data () {
    return {
      img_dir: define.IMG_BASE_URL,
      images: this.images,
      define: define,
      data: this.data,
      selected_layer: this.selected_layer,
      layer_order: this.layer_order,
      current_data: this.current_data,
      background_info: this.background_info,
      canvas_w: this.canvas_w,
      canvas_h: this.canvas_h,
      file_name: this.file_name,
      filter_options: {
        'none': 'None',
        'screen': 'Screen',
        'color_dodge': 'Color Dodge',
        'linear_dodge': 'Linear Dodge',
        'multiply': 'Multiply',
        'color_burn': 'Color Burn',
        'linear_burn': 'Linear Burn',
        'overlay': 'Overlay',
        'soft_light': 'Soft Light',
        'hard_light': 'Hard Light',
        'vivid_light': 'Vivid Light',
        'subtract': 'Subtract',
        'divide': 'Divide',
      },
    }
  },

  created() {
    String.prototype.id_num = function(){
      return this.replace('_', '').int()
    }

    String.prototype.rgb = function(){
      return {
        r: ("0x"+this.slice(1,3)).int(),
        g: ("0x"+this.slice(3,5)).int(),
        b: ("0x"+this.slice(5,7)).int(),
      }
    }

    this.show_images()
    this.show_file_name_cookie()

    //window.dragMoveListener = this.dragMoveListener
    this.data = []
    this.layer_order = []
    this.canvas_w = 1920
    this.canvas_h = 1080
    this.current_data = {
      img_info:{
        scale: 0,
        rotate: 0,
        x_flip: 0,
        color1: '#999999',
        color2: '#666666',
        filter: {
          type: null,
          alpha: 100,
        },
      },
    }
  },
  mounted(){
    this.set_canvas_view_size()
  },
  destroyed() {
  },
  watch:{
    '$route': function(to){
      console.log(to)
    },
  },
  methods:{
    change_canvas_size(side, size){
      if(size < 0 || size > 3000) return

      if(side === 'w'){
        this.canvas_w = size
        this.$$('#canvas').setAttribute('width', size)
        this.$$$('#canvas canvas').forEach(v=>{
          v.setAttribute('width', size)
          v.style.width = size + 'px'
        })
      }
      else if(side === 'h'){
        this.canvas_h = size
        this.$$('#canvas').setAttribute('height', size)
        this.$$$('#canvas canvas').forEach(v=>{
          v.setAttribute('height', size)
          v.style.height = size + 'px'
        })
      }

      this.set_canvas_view_size()
    },

    click_image(type, image_id, motif){
      if(type === 'product'){
        this.click_product_image(image_id)
        return
      }

      let img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = this.get_full(type, image_id)

      let _this = this
      let w = this.canvas_w
      let h = this.canvas_h

      img.onload = function(){
        let context = document.createElement('canvas')
        context.setAttribute('width', w)
        context.setAttribute('height', h)
        context.id = 'canvas_'+ _this.data.length

        let canvas_ratio = w / h
        let img_ratio = img.width / img.height
        let img_h, img_w, x, y
        let new_id = '_' + _this.data.length
        let color2 = (type === 'object') ? '#ffffff' : '#000000'

        x = w / 2
        y = h / 2

        if(type === 'object'){
          if(canvas_ratio > img_ratio){
            img_w = h * img_ratio
            img_h = h
          }
          else{
            img_w = w
            img_h = w / img_ratio
          }
        }
        else{
          if(canvas_ratio > img_ratio){
            img_w = (w + 100)
            img_h = (w + 100) / img_ratio
          }
          else{
            img_w = (h + 100) * img_ratio
            img_h = (h + 100) 
          }
        }

        //座標は中心
        context.getContext('2d').translate(x, y)
        context.getContext('2d').drawImage(img, -img_w/2, -img_h/2, img_w, img_h)
        
        _this.data.push({
          id: new_id,
          context: context,
          img: img,
          img_info: {
            image_id: image_id,
            motif: motif,
            type: type,
            x: x,
            y: y,
            x_sum: x,
            y_sum: y,
            w: img_w,
            h: img_h,
            base_w: img_w,
            base_h: img_h,
            scale: 0,
            rotate: 0,
            last_rotate: 0,
            flip_x: 0,
            last_flip_x: 0,
            color1: '#ffffff',
            color2: color2,
            filter:{
              type: null,
              alpha: 100,
            },
          },
        })

        _this.layer_order.unshift(new_id)
        _this.set_layer_condition()
        _this.$$('#canvas').append(context)
        _this.set_canvas_view_size()

        //選択状態にする
        _this.$$$('#layer li').forEach(v=>{
          v.style.border = ''
        })
        _this.selected_layer = new_id
        _this.current_data = _this.get_selected_layer_data()
      }
    },

    click_product_image(image_id){
      let _this = this
      let after_img_load = function() {
        for(let i=0; i<_this.layer_order.length; i++){
          let id = _this.layer_order[_this.layer_order.length-1-i]
          //選択状態にする
          _this.selected_layer = id
          _this.current_data = _this.get_selected_layer_data()
          let v = _this.current_data.img_info

          // //動かす
          _this.current_data.img_info.last_rotate = 0
          _this.current_data.img_info.last_flip_x = false

          _this.change_canvas_scale(v.scale)
          _this.change_canvas_rotate(v.rotate)
          _this.change_canvas_flip(v.flip_x, 'x')
console.log(v)

          //_this.set_color(v.color1, v.color2, v.type)
          _this.change_filter(v.filter.type, v.filter.alpha, v.color1, v.color2)
        }
      }

      this.$$('#canvas').innerHTML = ''

      axios
        .get(define.BASE_URL+'product/json/'+image_id+'.json')
        .then(r=>{
          this.canvas_w = r.data.w.int()
          this.canvas_h = r.data.h.int()
          this.data = r.data.img
          this.layer_order = r.data.layer_order

          let _this = this
          let loaded_cnt = 0

          this.data.forEach((v)=>{
            let img = new Image()
            img.crossOrigin = 'Anonymous'
            img.src = _this.get_full(v.img_info.type, v.img_info.image_id)
            v.img = img

            let w = _this.canvas_w
            let h = _this.canvas_h
            
            img.onload = function(){
              let context = document.createElement('canvas')
              context.setAttribute('width', w)
              context.setAttribute('height', h)
              context.id = 'canvas' + v.id

              context.getContext('2d').translate(v.img_info.x_sum, v.img_info.y_sum)
              context.getContext('2d').drawImage(img, -v.img_info.w/2, -v.img_info.h/2, v.img_info.w, v.img_info.h)

              v.context = context

              //選択状態にする
              _this.selected_layer = v.id
              _this.current_data = _this.get_selected_layer_data()

              _this.set_layer_condition()
              _this.$$('#canvas').append(context)
              _this.set_canvas_view_size()

              //最後の画像
              loaded_cnt++
              if(loaded_cnt === _this.layer_order.length){
                after_img_load()
              }
            }
          })

          console.log(r, this.data)
        })
    },

    click_layer(e){
      this.$$$('#layer li').forEach(v=>{
        v.style.border = ''
      })
      e.target.style.border = 'solid 1px #fff'
      this.selected_layer = e.target.id
      this.current_data = this.get_selected_layer_data()
    },

    change_canvas_rotate(v){
      let data = this.current_data
      let rotate = v.float() - data.img_info.last_rotate

      data.img_info.rotate = v.float()
      data.img_info.last_rotate = v.float()
      data.context.getContext('2d').clearRect(-4999, -4999, 9999, 9999)
      data.context.getContext('2d').rotate(rotate/180*Math.PI)
      data.context.getContext('2d').drawImage(data.img, -data.img_info.w/2, -data.img_info.h/2, data.img_info.w, data.img_info.h)
    },

    change_canvas_scale(v){
      let data = this.current_data
      let scale = v.float()

      data.img_info.scale = v.float()
      data.img_info.w = data.img_info.base_w / 0.9**scale
      data.img_info.h = data.img_info.base_h / 0.9**scale
      data.context.getContext('2d').clearRect(-4999, -4999, 9999, 9999)
      data.context.getContext('2d').drawImage(data.img, -data.img_info.w/2, -data.img_info.h/2, data.img_info.w, data.img_info.h)
    },

    change_canvas_flip(v, side){
      let data = this.get_selected_layer_data()
      let x_plus_minus = 1

      if(side === 'x'){
        if(v != data.img_info.last_flip_x){
          x_plus_minus = -1
        }
        data.img_info.last_flip_x = v

        data.context.getContext('2d').rotate(-data.img_info.rotate/180*Math.PI)
        data.context.getContext('2d').scale(x_plus_minus, 1)
        data.context.getContext('2d').rotate(data.img_info.rotate/180*Math.PI)
        data.context.getContext('2d').clearRect(-4999, -4999, 9999, 9999)
        data.context.getContext('2d').drawImage(data.img, -data.img_info.w/2, -data.img_info.h/2, data.img_info.w, data.img_info.h)
      }
    },

    change_filter(filter_type, alpha, color1_str, color2_str){
      let data = this.get_selected_layer_data()

      filter_type = filter_type !== undefined ? filter_type : this.$$('#input_filter_type').value
      alpha = alpha !== undefined ? alpha / 100 : this.$$('#input_filter_alpha').value / 100
      color1_str = color1_str !== undefined ? color1_str : this.$$('#input_color1').value
      color2_str = color2_str !== undefined ? color2_str : this.$$('#input_color2').value
      if(!filter_type) filter_type = 'none'
      let color1 = color1_str.rgb()
      let color2 = color2_str.rgb()
      data.img_info.color1 = color1_str
      data.img_info.color2 = color2_str

      let background_layer_id = -1
      if(this.layer_order.indexOf(data.id) < this.layer_order.length - 1){
        background_layer_id = this.layer_order[this.layer_order.indexOf(data.id) + 1].id_num()
      }

      //reset
      this.$$('#canvas'+data.id).getContext('2d').clearRect(-4999, -4999, 9999, 9999)
      this.$$('#canvas'+data.id).getContext('2d').drawImage(data.img, -data.img_info.w/2, -data.img_info.h/2, data.img_info.w, data.img_info.h)

      let this_layer = this.$$('#canvas'+data.id).getContext('2d').getImageData(0, 0, this.canvas_w, this.canvas_h)
      let td = this_layer.data
      let background_layer = {}
      let bd = []
      if(background_layer_id !== -1){
        background_layer = this.$$('#canvas_'+background_layer_id).getContext('2d').getImageData(0, 0, this.canvas_w, this.canvas_h)
        bd = background_layer.data
      }

      if(filter_type === 'none'){
        alpha = Math.cos( - Math.PI / 2 * alpha + Math.PI / 2 )
      }

      for(let i=0; i<td.length; i+=4){
        //color
        if(data.img_info.type === 'object'){
          if(td[i+3] === 0){
            continue
          }
          td[i] = ((color1.r * td[i+3] + color2.r * (255 - td[i+3])) / 255).int()
          td[i+1] = ((color1.g * td[i+3] + color2.g * (255 - td[i+3])) / 255).int()
          td[i+2] = ((color1.b * td[i+3] + color2.b * (255 - td[i+3])) / 255).int()
        }
        else{
          td[i] = ((color1.r * td[i] + color2.r * (255 - td[i])) / 255).int()
          td[i+1] = ((color1.g * td[i+1] + color2.g * (255 - td[i+1])) / 255).int()
          td[i+2] = ((color1.b * td[i+2] + color2.b * (255 - td[i+2])) / 255).int()
        }

        if(background_layer_id === -1) continue

        //filter
        if(filter_type === 'none'){
          //td[i+3] = (alpha * td[i+3]).int()
          td[i+3] = Math.random() < 1-((1-alpha)/2) ? (td[i+3] * alpha).int() : 0
        }

        else{
          let a = alpha * bd[i+3] / 255
          if(a < 1/255) continue

          for(let dlt=0; dlt<3; dlt++){
            let d = i+dlt
            switch(filter_type){
              case 'screen':
                td[d] = td[d] + bd[d] - td[d] * bd[d] / 255
                break
              case 'color_dodge':
                td[d] = (bd[d] * 255) / (255 - td[d])
                break
              case 'linear_dodge':
                td[d] = td[d] + bd[d]
                break
              case 'multiply':
                td[d] = td[d] * bd[d] / 255
                break
              case 'color_burn':
                td[d] = 255 - (255 - bd[d]) * 255 / td[d]
                break
              case 'linear_burn':
                td[d] = td[d] + bd[d] - 255
                break
              case 'overlay':
                if(bd[d] < 128) td[d] = bd[d] * td[d] * 2 / 255
                else td[d] = (bd[d] + td[d] - bd[d] * td[d] / 255) * 2 - 255
                break
              case 'soft_light':
                if(bd[d] < 128) td[d] = ( td[d] / 255 ) ** ( ( 255 - bd[d] ) / 128 ) * 255
                else td[d] = ( td[d] / 255 ) ** ( 128 / bd[d] ) * 255
                break
              case 'hard_light':
                if(bd[d] < 128) td[d] = td[d] * bd[d] * 2 / 255
                else td[d] = 2 * ( td[d] + bd[d] - td[d] * bd[d] / 255 ) - 255
                break
              case 'vivid_light':
                if(bd[d] < 128) td[d] = 255 - (255 - bd[d]) * 255 / td[d]
                else td[d] = (255 ** 2 - 2 * (255 - bd[d]) * (255 - td[d])) / 255
                break
              case 'subtract':
                td[d] = bd[d] - td[d]
                break
              case 'divide':
                td[d] = bd[d] / td[d] * 255
                break
              default:
                break
            }
            if(td[d] >= 255) td[d] = 255
            else if(td[d] <= 0) td[d] = 0
            else td[d] = td[d].int()
          }
          td[i+3] = (a * 255).int()
        }
      }

      data.context.getContext('2d').putImageData(this_layer, 0, 0)

    },

    delete_layer(){
      let data = this.get_selected_layer_data()
      let id = data.id
      let index = id.id_num()
      this.data.splice(index, 1)
      this.layer_order.splice(this.layer_order.indexOf(id), 1)
      this.$$('#canvas' + id).remove()

      //採番しなおす
      this.data.forEach(v=>{
        let id_ = v.id.id_num()
        if(id_ > index){
          v.id = '_' + (id_-1)
          v.context.id = 'canvas_' + (id_-1)
        }
      })
      this.layer_order = this.layer_order.map(v=>{
        let id_ = v.id_num()
        if(id_ > index){
          return '_' + (id_-1)
        }
        return v
      })
    },

    get_thumbnail(type, image_id){
      return define.BASE_URL+type+'/thumbnail/'+image_id+'.png'
    },

    get_layer_thumbnail(id){
      id = id.id_num()
      let img_info = this.data[id].img_info
      return this.get_thumbnail(img_info.type, img_info.image_id)
    },

    get_full(type, image_id){
      return define.BASE_URL+type+'/full/'+image_id+'.png'
    },

    get_selected_layer_data(){

      let index = 0
      if(this.selected_layer){
        //index = this.layer_order.length - 1 - this.selected_layer.replace('_', '').int()
        index = this.selected_layer.id_num()
      }
      return this.data[index]
    },

    post(){
      let datas = []
      let new_data = new ImageData(this.canvas_w, this.canvas_h)
      let _this = this
      let i=0

      this.$$$('#canvas canvas').forEach(function(v){
        let img = v.getContext('2d').getImageData(0, 0, _this.canvas_w, _this.canvas_h)
        datas.push(img.data)
      })

      for(i=0; i<new_data.data.length; i++){
        new_data.data[i] = datas[0][i]
      }

      for(i=0; i<new_data.data.length; i+=4){
        for(var c=1; c<datas.length; c++){
          let alpha = datas[c][i+3] / 255
          if(alpha === 0) continue

          new_data.data[i] = (new_data.data[i] * (1-alpha) + datas[c][i] * alpha).int()
          new_data.data[i+1] = (new_data.data[i+1] * (1-alpha) + datas[c][i+1] * alpha).int()
          new_data.data[i+2] = (new_data.data[i+2] * (1-alpha) + datas[c][i+2] * alpha).int()
          new_data.data[i+3] = 255
        }
      }

      let data_json = {
        w: this.canvas_w.int(),
        h: this.canvas_h.int(),
        layer_order: this.layer_order,
        img: [],
      }
      this.data.forEach(v=>{
        data_json.img.push({
          id: v.id,
          img_info: v.img_info,
        }) 
      })

      data_json = JSON.stringify(data_json)

      let context = document.createElement('canvas')
      context.setAttribute('width', this.canvas_w)
      context.setAttribute('height', this.canvas_h)
      context.getContext('2d').putImageData(new_data, 0, 0)

      let now = new Date()
      let image_id = now.toJSON().replace(/\D/g, '')
      image_id = this.file_name + '_' + image_id
      let image_file_name = image_id + '.png'

      //画像名cookie
      this.$cookies.config(60 * 60 * 24 * 30,'');
      this.$cookies.set('file_name', this.file_name);

      //ダウンロード
      let link = document.createElement('a')
      link.href = context.toDataURL()
      link.download = image_file_name
      link.click()

//console.log(this.jwtToken)

      //アップロード
      let s3_key = 'collage/product/' + image_id + '.base64'
      let s3_json_key = 'collage_product_json/' + image_id + '.json'
      Storage.put(s3_key, context.toDataURL('image/png').replace(/^.*,/, ''))
      .then(result=>{

        //jsonも送る
        Storage.put(s3_json_key, data_json)

        //dynamoDBにも
        axios
        .post(
        define.API_BASE_URL,
          {
            image_id: image_id,
            motif: 'no_name',
            type: 'product',
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

        console.log(result)
        alert('アップロードしました')
      })
      .catch(e=>{
        console.log(e)
      })
    },

    show_images(){
      let api = define.API_BASE_URL
      axios
        .get(api)
        .then(r=>{
          this.images = r.data.Items
        })
    },

    show_file_name_cookie(){
      this.file_name = this.$cookies.get('file_name')
    },


    set_canvas_view_size(){
      let w, h
      let section_width = this.$$('#main_section').offsetWidth
      let window_ratio = section_width / window.innerHeight
      let canvas_ratio = this.canvas_w / this.canvas_h

      if(window_ratio > canvas_ratio){
        w = (window.innerHeight - 10) * canvas_ratio 
        h = window.innerHeight - 10
      }
      else{
        w = section_width
        h = section_width / canvas_ratio
      }

      this.$$('#canvas').style.width = w + 'px'
      this.$$('#canvas').style.height = h + 'px'
      this.$$$('#canvas canvas').forEach(v=>{
        v.style.width = w + 'px'
        v.style.height = h + 'px'
      })
    },

    set_layer_condition(){
      let _this = this

      let dragStartListener = function() {
          window.isDrag = true;
      }

      let dragMoveListener = function(e) {
        if(!window.isDrag){
          return
        }

        let data = _this.get_selected_layer_data()
        let x_plus_minus = data.img_info.flip_x ? -1 : 1
        data.context.getContext('2d').clearRect(-4999, -4999, 9999, 9999)
        data.img_info.x = e.dx * x_plus_minus
        data.img_info.y = e.dy
        data.img_info.x_sum += e.dx
        data.img_info.y_sum += e.dy
//console.log(data.img_info.x_sum, e.dy)
        data.context.getContext('2d').translate(data.img_info.x, data.img_info.y)
        data.context.getContext('2d').drawImage(data.img, -data.img_info.w/2, -data.img_info.h/2, data.img_info.w, data.img_info.h)
      }

      interact('#canvas')
        .draggable({
          inertia: false,
          autoScroll: false,
          // modifiers: [
          //   interact.modifiers.restrict({
          //     //restriction: 'parent',
          //     endOnly: true
          //   })
          // ],

          onstart: (e) => {
            dragStartListener(e);
          },

          onmove: (e) => {
            dragMoveListener(e)
          },

          // onend: (e) => {
          //   this.set_color()
          //   console.log(111, e, window.data[0].img_info.x)
          //   this.isDrag = false
          // },

          cursorChecker: (action, interactable, element, interacting) => {
            if(this.cursor){
              return this.cursor;
            }
            else {
              return interacting ? 'grabbing' : null;
            }
          }
        })
    },

    set_layer_order(){
      this.layer_order = []
      this.$$$('#layer li').forEach((v)=>{
        if(typeof v.id === 'string'){
          this.layer_order.push(v.id)
        }
      })

      let data = []
      this.$$$('#canvas canvas').forEach(function(v){
        data.push(v)
      })

      let _this = this
      data.sort(function(x, y) {
        return _this.layer_order.indexOf(x.id.replace('canvas', '')) - _this.layer_order.indexOf(y.id.replace('canvas', ''))
      })

      data.forEach(function(v){
        _this.$$('#canvas').prepend(v)
      })
    
    },


  }
}

</script>

<style>
#collage_draiwing{
    background: #445;
    padding: 5px 0 0 0;
}
nav{
    margin: 0 0 0 0.5%;
    display: inline-block;
    width: 10%;
    vertical-align: top;
}
nav div{
    margin: 0.5em 0;
}
nav input{
    max-width: 90%;
}
#input_scale, #input_rotate, #input_width, #input_height{
    width: 50px;
}
#layer{
    line-height: 0;
}
#layer img{
    width: 100%;
    pointer-events: none;
    margin: 0 0 5px;
}

section{
    display: inline-block;
    width: 88.5%;
    vertical-align: top;
    margin: 0 0.5% 0 0.5%;
}

#canvas{
    border: solid 1px #000;
    margin: auto;
}
#canvas canvas{
    position: absolute;
}

#images img{
    vertical-align: middle;
    margin-right: 5px; 
}
</style>