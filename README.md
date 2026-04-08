# AI 求职助手

一个面向求职场景的 AI 应用项目，支持简历分析、岗位匹配、面试题生成与求职问答。

## 项目简介

本项目用于帮助求职者完成简历优化、岗位匹配分析和面试准备。当前已完成前后端基础联调，并搭建了项目的前后端分离结构。

## 项目结构

```text
ai-job-assistant/
├─ ai-job-assistant-web/      # 前端项目，基于 Vue3 + TypeScript
├─ ai-job-assistant-server/   # 后端项目，基于 Express + TypeScript
└─ README.md

当前功能
前后端基础联调
/api/ping 接口测试
/api/hello 接口测试
首页状态展示

技术栈
前端
Vue3
TypeScript
Vite

后端
Node.js
Express
TypeScript
cors

本地运行

1. 启动后端
cd ai-job-assistant-server
npm install
npm run dev

2. 启动前端
cd ai-job-assistant-web
npm install
npm run dev

开发计划
 完成前后端项目初始化
 完成 /api/ping 联调
 完成 /api/hello 联调
 实现简历上传
 实现岗位 JD 输入
 实现 AI 匹配分析
 实现面试题生成
 实现对话追问功能