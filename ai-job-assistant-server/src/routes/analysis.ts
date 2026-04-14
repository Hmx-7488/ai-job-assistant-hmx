import {Router} from 'express'
import { analyzeResumeWithAI } from '../services/ai';
import { safeParseAnalysis } from '../services/parser';

const router = Router()

router.post('/run', async (req, res) => { 
  const { jobId, jobTitle, jdText, resumeText } = req.body

  if (!jobId || !jobTitle || !jdText || !resumeText) {
    return res.status(400).json({
      success: false,
      message: 'jobId、岗位名称、JD、简历内容不能为空'
    })
  }

  try {
    // 1. 调用 AI 服务获取原始文本
    const rawResult = await analyzeResumeWithAI({
      jobTitle,
      jdText,
      resumeText
    });

    console.log('AI Raw Result:', rawResult);

    // 2. 安全解析 AI 响应为结构化数据（保证返回统一对象结构）
    const safeResult = safeParseAnalysis(rawResult);

    console.log('Safe Parsed Result:', safeResult);

    // 3. 返回统一格式的结构化结果
    return res.json({
      success: true,
      data: safeResult
    });

  } catch (error) {
    console.error('Analysis failed:', error);
    
    // 识别错误类型，返回更具体的错误信息
    if (error instanceof Error) {
      const errorMessage = error.message;
      
      // 配置类错误（如缺少 API Key）
      if (errorMessage.includes('DASHSCOPE_API_KEY') || 
          errorMessage.includes('环境变量') ||
          errorMessage.includes('配置')) {
        return res.status(500).json({
          success: false,
          message: `配置错误：${errorMessage}`,
          errorType: 'CONFIG_ERROR'
        });
      }
      
      // AI 服务调用错误
      if (errorMessage.includes('AI 分析服务异常') || 
          errorMessage.includes('AI 服务未返回有效内容')) {
        return res.status(500).json({
          success: false,
          message: 'AI 服务调用失败，请稍后重试或检查网络连接',
          errorType: 'AI_SERVICE_ERROR'
        });
      }
      
      // 其他已知错误
      return res.status(500).json({
        success: false,
        message: `分析失败：${errorMessage}`,
        errorType: 'UNKNOWN_ERROR'
      });
    }
    
    // 未知错误类型
    return res.status(500).json({
      success: false,
      message: 'AI 分析失败，请稍后重试',
      errorType: 'UNKNOWN_ERROR'
    });
  }
})

export default router;