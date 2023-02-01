<template>
    <h2>リスト</h2>
    <div class="ly_article">
      <div class="ly_article_inner"  v-for="article in articles" :key="article">
        <div class="bl_article">{{ article.title }}</div>
        <div class="bl_article"><img :src=article.filePath></div>
        <div class="bl_article">{{ article.memo }}</div>
      </div>
    </div>
  </template>
  <script>
  import { defineComponent, onMounted ,ref } from 'vue'
  import { fetchFirebase } from './firebase'
  
  export default defineComponent({
    setup() {
      const articles =ref()
      onMounted(()=>{
        fetchFirebase()
          .then((data)=>{
            articles.value = data
          })
      })
      return{
        articles
      }    
    },
  })
  </script>
  <style lang="scss">
  h2{
    border-left:10px solid blue;
    padding-left:5px; ;
  }
  .ly_article{
    display: flex;
    flex-wrap: wrap;
    padding:10px;
    max-width: 1000px;
    margin:auto;
    .ly_article_inner{
      flex:0 0 250px;
      padding: 20px;
      margin:5px;
      background-color: rgb(197, 197, 243);
    }
    .bl_article{
      text-align: center;
    }
    
  }
  </style>
  