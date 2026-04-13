import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid'; 

const router = Router();

// 模拟数据库存储 
const jobStore = new Map<string, any>();

router.post('/create', async (req, res) => {
  try {
    const { jobTitle, companyName, jd } = req.body;

    // 1. 基础校验
    if (!jobTitle || !jd) {
      return res.status(400).json({
        success: false,
        message: '岗位名称和 JD 不能为空'
      });
    }

    // 2. 生成 jobId
    const jobId = uuidv4();

    // 3. 保存岗位信息 (模拟存入数据库)
    const newJob = {
      jobId,
      jobTitle,
      companyName: companyName || '',
      jd,
      createdAt: new Date()
    };
    
    jobStore.set(jobId, newJob);
    console.log(`岗位已创建: ${jobId}`);

    // 4. 返回结果
    res.json({
      success: true,
      data: {
        jobId: jobId
      }
    });

  } catch (error) {
    console.error('创建岗位失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;