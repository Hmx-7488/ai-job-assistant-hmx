<template>
  <div class="analysis-page">
    <div class="top-actions">
      <button class="back-btn" @click="goToHome" >
        返回首页
      </button>
    </div>
    <header class="page-header"> 
      <h1>简历分析</h1>
      <p>上传简历并填写岗位信息，开始生成分析结果。</p>
    </header>

    <div class="content">
      <section class="left-panel">
        <div class="card">
          <h2>上传简历</h2>
          <input type="file" accept=".pdf" ref="fileInputRef" />
        </div>

        <div class="card">
          <h2>岗位信息</h2>

          <div class="form-item">
            <label>岗位名称</label>
            <input v-model="jobTitle" type="text" placeholder="请输入岗位名称" />
          </div>

          <div class="form-item">
            <label>公司名称</label>
            <input v-model="companyName" type="text" placeholder="请输入公司名称（可选）" />
          </div>

          <div class="form-item">
            <label>岗位 JD</label>
            <textarea
              v-model="jdText"
              rows="10"
              placeholder="请粘贴岗位描述"
            />
          </div>

          <div class="bottom-btn">
            <button class="primary-btn" @click="handleAnalyze">
            开始分析
          </button>
          <button class="clear-btn" @click="handleClear">
            清空
          </button>
          </div>
        </div>
      </section>

      <section class="right-panel">
        <div class="card">
          <h2>分析结果</h2>

          <div v-if="!hasResult" class="empty-box">
            暂无分析结果，请先上传简历并填写岗位信息。
          </div>

          <div v-else class="result-box">
            <p><strong>匹配度：</strong><span :class="scoreColorClass">{{ result.score }}</span></p>

            <div class="result-section">
              <h3>优势项</h3>
              <ul>
                <li v-for="(item, index) in result.strengths" :key="index">
                  {{ item }}
                </li>
              </ul>
            </div>

            <div class="result-section">
              <h3>待补强项</h3>
              <ul>
                <li v-for="(item, index) in result.weaknesses" :key="index">
                  {{ item }}
                </li>
              </ul>
            </div>

            <div class="result-section">
              <h3>优化建议</h3>
              <ul>
                <li v-for="(item, index) in result.suggestions" :key="index">
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {useRouter} from 'vue-router'

const router = useRouter()

const fileInputRef = ref<HTMLInputElement | null>(null)
const jobTitle = ref('')
const companyName = ref('')
const jdText = ref('')

const result = ref({
  score: '',
  strengths: [] as string[],
  weaknesses: [] as string[],
  suggestions: [] as string[],
})

const hasResult = computed(() => {
  return result.value.score !== ''
})

const goToHome = ()=>{
  router.push('/');
}
const handleAnalyze = () => {
  result.value = {
    score: '72/100',
    strengths: ['具备 Vue3 + TypeScript 项目经验', '有后台系统开发与部署经历'],
    weaknesses: ['缺少 AI 项目经验', '后端闭环能力需要加强'],
    suggestions: ['补一个 AI 求职助手项目', '加强 Node.js 和接口设计能力'],
  }
}

const scoreColorClass = computed(() => {
  if (!hasResult.value) return ''
  
  // 提取分数中的数字，例如 "72/100" -> 72
  const match = result.value.score.match(/(\d+)/)
  const scoreNum = match ? parseInt(match[1], 10) : 0

  if (scoreNum >= 80) return 'score-high'   // 高分：绿色
  if (scoreNum >= 60) return 'score-medium' // 中等：橙色
  return 'score-low'                        // 低分：红色
})

const handleClear = ()=> {
  // 清空文件
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
  // 清空表单
  jobTitle.value = '';
  companyName.value = '';
  jdText.value = '';

  result.value = {
    score: '',
    strengths: [],
    weaknesses: [],
    suggestions: [],

  }
}

</script>

<style scoped>
.top-actions {
  display: flex;
  justify-content: start;
  margin-bottom: 16px;
}
.back-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: #409eff;
  color: #fff;
  cursor: pointer;
}
.analysis-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin-bottom: 18px;
}

.page-header p {
  color: #666;
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.card {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px;
  background: #fff;
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-item input,
.form-item textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 14px;
}

.bottom-btn {
display: flex;
gap: 10px;
justify-content: center;
}

.primary-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  background: #409eff;
  color: #fff;
  cursor: pointer;
  font-size: 15px;
}

.clear-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  background: #676a6e;
  color: #fff;
  cursor: pointer;
  font-size: 15px;
}
.empty-box {
  padding: 24px;
  border-radius: 8px;
  background: #f7f7f7;
  color: #888;
}

.result-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 高分：绿色 */
.score-high {
  color: #67c23a;
}

/* 中等：橙色/黄色 */
.score-medium {
  color: #e6a23c;
}

/* 低分：红色 */
.score-low {
  color: #f56c6c;
}

.result-section h3 {
  margin-bottom: 8px;
}

.result-section ul {
  padding-left: 18px;
  margin: 0;
}
</style>