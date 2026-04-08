<template>
  <div class="home-page">
    <section class="hero">
      <h1>AI 求职助手</h1>
      <p class="subtitle">
        上传简历、输入岗位 JD，获得匹配分析和面试建议。
      </p>
      <button class="primary-btn" @click="goToAnalysis">
        开始分析
      </button>
    </section>

    <section class="feature-list">
      <div class="feature-card">
        <h3>简历分析</h3>
        <p>基于岗位需求分析简历优势、短板和优化方向。</p>
      </div>
      <div class="feature-card">
        <h3>岗位匹配</h3>
        <p>对比简历与 JD 内容，输出匹配度与补强建议。</p>
      </div>
      <div class="feature-card">
        <h3>面试准备</h3>
        <p>生成项目追问、技术问题和自我介绍建议。</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// 导入路由
import { useRouter } from 'vue-router';

// 创建路由对象
const router = useRouter();

// 跳转到分析页面
const goToAnalysis = ()=> {
  router.push('/analysis');
}
</script>

<style scoped>
.home-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 60px 24px;
}

.hero {
  text-align: center;
  margin-bottom: 48px;
}

.hero h1 {
  font-size: 40px;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 18px;
  color: #666;
  margin-bottom: 24px;
}

.primary-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  background: #409eff;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feature-card {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 24px;
  background: #fff;
}

.feature-card h3 {
  margin-bottom: 12px;
}
</style>