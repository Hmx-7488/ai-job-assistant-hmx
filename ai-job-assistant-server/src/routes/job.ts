import { Router } from 'express';
import { prisma } from '../lib/prisma';
import type { CreateJobRequest } from '../types/job';

const router = Router();

router.post('/create', async (req, res) => {
  try {
    // 从请求体获取数据
    const { jobTitle, companyName, jd } = req.body as CreateJobRequest;

    if (!jobTitle?.trim() || !jd?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'jobTitle and jd are required',
      });
    }

    const job = await prisma.job.create({
      data: {
        jobTitle: jobTitle.trim(),
        companyName: companyName?.trim() || null,
        jdText: jd.trim(),
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      data: {
        jobId: job.id,
        createdAt: job.createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to create job:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create job',
    });
  }
});

export default router;
