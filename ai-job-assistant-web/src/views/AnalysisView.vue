<template>
  <div class="analysis-page">
    <div class="top-actions">
      <button class="back-btn" @click="goToHome">返回首页</button>
    </div>

    <header class="page-header">
      <h1>简历分析</h1>
      <p>填写岗位信息后，点击开始分析获取匹配结果。</p>
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
            <textarea v-model="jdText" rows="10" placeholder="请粘贴岗位 JD" />
          </div>

          <div class="bottom-btn">
            <button class="primary-btn" :disabled="status === 'loading'" @click="handleAnalyze">
              {{ status === 'loading' ? '分析中...' : '开始分析' }}
            </button>
            <button class="clear-btn" :disabled="status === 'loading'" @click="handleClear">清空</button>
          </div>
        </div>
      </section>

      <section class="right-panel">
        <div class="card">
          <h2>分析结果</h2>

          <div v-if="status === 'idle'" class="empty-box">
            暂无分析结果，请先填写岗位信息并点击开始分析。
          </div>

          <div v-else-if="status === 'loading'" class="state loading">分析中，请稍候...</div>

          <div v-else-if="status === 'error'" class="state error">{{ errorMessage }}</div>

          <div v-else-if="result" class="result-grid">
            <div class="result-card score-card">
              <h3>匹配度</h3>
              <p class="score" :class="scoreColorClass">{{ result.score }}/100</p>
            </div>

            <div class="result-card">
              <h3>优势项</h3>
              <ul>
                <li v-for="(item, index) in result.strengths" :key="`s-${index}`">{{ item }}</li>
              </ul>
            </div>

            <div class="result-card">
              <h3>待提升项</h3>
              <ul>
                <li v-for="(item, index) in result.weaknesses" :key="`w-${index}`">{{ item }}</li>
              </ul>
            </div>

            <div class="result-card">
              <h3>优化建议</h3>
              <ul>
                <li v-for="(item, index) in result.suggestions" :key="`g-${index}`">{{ item }}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

type AnalyzeStatus = 'idle' | 'loading' | 'success' | 'error';

interface AnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

const router = useRouter();

const fileInputRef = ref<HTMLInputElement | null>(null);
const jobTitle = ref('');
const companyName = ref('');
const jdText = ref('');
const jobId = ref<string | null>(null);

const status = ref<AnalyzeStatus>('idle');
const errorMessage = ref('');
const result = ref<AnalysisResult | null>(null);

const scoreColorClass = computed(() => {
  const scoreNum = result.value?.score ?? 0;
  if (scoreNum >= 80) return 'score-high';
  if (scoreNum >= 60) return 'score-medium';
  return 'score-low';
});

const goToHome = () => {
  router.push('/');
};

const handleAnalyze = async () => {
  const file = fileInputRef.value?.files?.[0];
  if (!file) {
    alert('请先上传简历');
    return;
  }

  if (!jobTitle.value.trim() || !jdText.value.trim()) {
    alert('岗位名称和 JD 不能为空');
    return;
  }

  status.value = 'loading';
  errorMessage.value = '';
  result.value = null;

  try {
    const formData = new FormData();
    formData.append('resume', file);

    const uploadResponse = await axios.post('http://localhost:3000/api/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!uploadResponse.data?.success) {
      throw new Error(uploadResponse.data?.message || '简历上传失败');
    }
    // console.log('简历上传成功:', uploadResponse.data.text);
    
    // 获取解析后的简历文本
    const resumeText = uploadResponse.data.text;

    const jobResponse = await axios.post('http://localhost:3000/api/job/create', {
      jobTitle: jobTitle.value.trim(),
      companyName: companyName.value.trim(),
      jd: jdText.value.trim(),
      
    });

    if (!jobResponse.data?.success) {
      throw new Error(jobResponse.data?.message || '创建岗位失败');
    }

    jobId.value = jobResponse.data?.data?.jobId ?? null;
    console.log('jobId', jobId.value);
    if (!jobId.value) {
      throw new Error('后端未返回 jobId');
    }

    const analysisResponse = await axios.post('http://localhost:3000/api/analysis/run', {
      jobId: jobId.value,
      // 可选的额外参数，方便后端记录日志或做进一步分析
      jobTitle: jobTitle.value.trim(),
      companyName: companyName.value.trim(),
      jdText: jdText.value.trim(),
      resumeText: resumeText, // 新增：传递简历解析文本
    });
    console.log('分析结果:', analysisResponse.data.data);
    if (!analysisResponse.data?.success) {
      throw new Error(analysisResponse.data?.message || '分析失败');
    }

    result.value = analysisResponse.data.data as AnalysisResult;
    status.value = 'success';
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '分析失败，请稍后重试';
    status.value = 'error';
    errorMessage.value = message;
    console.error('分析流程失败:', error);
  }
};

const handleClear = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
  jobTitle.value = '';
  companyName.value = '';
  jdText.value = '';
  jobId.value = null;
  result.value = null;
  errorMessage.value = '';
  status.value = 'idle';
};
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
  margin-bottom: 48px;
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
  margin-top: 8px;
}

.primary-btn,
.clear-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  font-size: 15px;
}

.primary-btn {
  background: #409eff;
}

.clear-btn {
  background: #676a6e;
}

.primary-btn:disabled,
.clear-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-box,
.state {
  padding: 24px;
  border-radius: 8px;
}

.empty-box {
  background: #f7f7f7;
  color: #888;
}

.state.loading {
  background: #ecf5ff;
  color: #409eff;
}

.state.error {
  background: #fef0f0;
  color: #f56c6c;
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.result-card {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 14px;
  background: #fafafa;
}

.result-card h3 {
  margin: 0 0 8px;
}

.score-card {
  background: #f5f7fa;
}

.score {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.score-high {
  color: #67c23a;
}

.score-medium {
  color: #e6a23c;
}

.score-low {
  color: #f56c6c;
}

.result-card ul {
  margin: 0;
  padding-left: 18px;
}

@media (max-width: 900px) {
  .content {
    grid-template-columns: 1fr;
  }
}
</style>
