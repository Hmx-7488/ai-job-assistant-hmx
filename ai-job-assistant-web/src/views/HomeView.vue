<template>
  <div class="home">
    <h1>AI 求职助手</h1>
    <p>上传简历、输入岗位 JD，获得匹配分析和面试建议。</p>

    <div class="card">
      <h2>系统状态</h2>
      <p>{{ pingText }}</p>
      <button @click="handlePing" :disabled="loading">
        {{ loading ? '请求中...' : '测试后端 /api/ping' }}
      </button>
      <br />
      <button @click="hello">测试后端 /api/hello</button>
      <p>测试时间: {{ pingTime }} </p>
      <p>{{ helloText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const pingText = ref('等待检测')
const loading = ref(false)
const pingTime = ref(0)
const helloText = ref('')

const handlePing = async () => {
  loading.value = true
  try {
    const res = await fetch('http://localhost:3000/api/ping')
    const data = await res.json()
    pingText.value = data.message
    pingTime.value = new Date(data.time).toLocaleTimeString()
    console.log(data)
  } catch (error) {
    pingText.value = '请求失败，请检查后端是否启动'
  } finally {
    loading.value = false
  }

}

const hello = async () => {
 try {
  const res = await fetch('http://localhost:3000/api/hello')
  const data = await res.json()
  helloText.value = data.message
  console.log(data)
 } catch (error) {
  helloText.value = '请求失败，请检查后端是否启动'
 
 }
}

onMounted(() => {
  handlePing()
  hello()
})
</script>

<style scoped>
.home {
  max-width: 720px;
  margin: 60px auto;
  padding: 24px;
  font-family: Arial, sans-serif;
}

.card {
  margin-top: 24px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 12px;
}

button {
  margin-top: 12px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #409eff;
  color: #fff;
}
</style>