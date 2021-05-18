<template>
  <ul>
    <li><router-link :to="{name:'sabian_upload'}">サビアンシンボル画像アップロード</router-link></li>
    <li><router-link :to="{name:'collage_object'}">コラージュ画像一覧</router-link></li>
    <li><router-link :to="{name:'collage_object_upload'}">コラージュ元画像アップロード</router-link></li>
    <li><router-link :to="{name:'collage_drawing'}">コラージュ画像作成</router-link></li>
  </ul>
</template>

<script>
export default {
  name: 'Link',
}
</script>
