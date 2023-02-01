<template>
    <div class="ly_top">
      <h1>投稿</h1>
      <div class="ly_top_inner">
        <div v-if="displayList">
          <button @click="toCreate">新規作成</button>
        </div>
        <div v-else>
          <button @click="toList">戻る</button>
        </div>
    
        <div v-if="displayList">
          <list></list>
        </div>
        <div v-if="displayCreate">
          <create></create>
        </div>
      </div>
    </div>
    </template>
    <script lang="ts">
    import { ref } from 'vue'
    import create from './create.vue'
    import list from './list.vue'
    export default({
      components:{
        create,
        list
      },
      setup() {
        const displayList = ref<boolean>(true)
        const displayCreate = ref<boolean>(false)
    
        const toCreate=()=>{
          displayList.value = false
          displayCreate.value = true
        }
        const toList=()=>{
          displayList.value = true
          displayCreate.value = false
        }
    
        return{
          displayList,
          displayCreate,
          toCreate,
          toList
        }
        
      },
    })
    </script>
    <style lang="scss">
      h1{
        padding:15px;
        background-color:blue;
        color:white;
      }
      .ly_top_inner{
        max-width: 1000px;
        margin:auto;
      }
    </style>