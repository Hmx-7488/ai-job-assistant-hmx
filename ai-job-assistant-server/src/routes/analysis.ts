import {Router} from 'express'
const router = Router()

router.post('/run', async (req, res) => { 
  const { jobId, jobTitle, jdText, } = req.body

  if (!jobId || !jobTitle || !jdText) {
    return res.status(400).json({
      success: false,
      message: 'jobId、岗位名称、JD 不能为空'
    })
  }

   // mock: 故意延迟，方便前端看到 loading 状态
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return res.json({
    success: true,
   data: {
      score: 82,
      strengths: ['技术栈匹配度较高', '项目经验和岗位方向一致', '表达结构清晰'],
      weaknesses: ['业务量化结果较少', '高并发场景描述不足', '英文关键词覆盖偏少'],
      suggestions: ['补充可量化成果', '增加复杂场景案例', '优化关键词与JD对齐'],
    },
  })  
})

export default router;