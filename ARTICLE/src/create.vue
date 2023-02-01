<template>
    <h2>作成</h2>
    <div class="ly_input">
      <div class="ly_input_inner">
        タイトル:<input type="text" v-model="title"><br>
      </div>
      <div class="ly_input_inner">
        メモ:<input type="text" v-model="memo"><br>
      </div>
      <div class="ly_input_inner">
        画像:<input type="file" accept="image/jpeg,image/png,image/gif" @change="uploadFile">  
      </div>
      <button @click="create">登録</button>
    </div>
  </template>
  <script lang="ts">
  import { defineComponent,ref } from 'vue'
  import { createFirebase} from './firebase'
  
  export default defineComponent({
    setup() {
      const title = ref<string>()
      const memo = ref<string>()
      const fileData =ref<string>()
  
      const uploadFile = (event:any)=>{
        fileData.value = event.target.files[0]
      }
      const create=()=>{
        if(!title.value || !memo.value || !fileData.value ){
          alert ('すべて入力してください。')
          return
        }
        createFirebase(title.value,memo.value,fileData.value)
      }
      return{
        create,
        title,
        memo,
        uploadFile,
        fileData
      }
    },
  })
  </script>
  <style lang="scss">
  h2{
    border-left:10px solid blue;
    padding-left:5px; ;
  }
  
  .ly_input{
    padding:10px;
    max-width: 900px;
    margin:auto;
  }
  .ly_input_inner{
    margin:10px;
  }
  </style>