---
#title: 关于我
date: 2025-03-18 00:00:00
updated: 2025-03-18 00:00:00
type: "cv"
layout: "page"
comments: false
---

<!--
  ========================================
  关于我页面 - 陈嘉豪
  ========================================
  
  【经常修改的内容】：
  1. 工作经历
  2. 技能列表
  3. 游戏经历
-->

<style>
/* === CV 页面整体 === */
.cv-page {
  font-size: 1.20em !important;
}
.cv-page h2 {
  font-size: 1.15em !important;
  font-weight: 700 !important;
  margin: 28px 0 12px 0 !important;
  padding-bottom: 6px !important;
  border-bottom: 2px solid var(--text-highlight-color, #667eea) !important;
  color: var(--font-color) !important;
}
.cv-page h2:first-of-type {
  margin-top: 0 !important;
}
.cv-page h3 {
  font-size: 1.02em !important;
  font-weight: 700 !important;
  margin: 16px 0 4px 0 !important;
  color: var(--font-color) !important;
}
.cv-page h4 {
  font-size: 0.9em !important;
  font-weight: 600 !important;
  margin: 8px 0 1px 0 !important;
  color: var(--font-color) !important;
  border-left: 3px solid var(--text-highlight-color, #667eea) !important;
  padding-left: 8px !important;
}
.cv-page p {
  margin: 3px 0 !important;
  line-height: 1.55 !important;
}
.cv-page strong {
  font-weight: 700 !important;
}

/* === 基本信息表格 === */
.cv-page .cv-info-table {
  width: 100% !important;
  border-collapse: collapse !important;
  margin: 0 0 4px 0 !important;
}
.cv-page .cv-info-table th,
.cv-page .cv-info-table td {
  padding: 4px 10px !important;
  border: none !important;
  text-align: left !important;
  font-size: 0.95em !important;
  vertical-align: middle !important;
  background: transparent !important;
}
.cv-page .cv-info-table th {
  width: 3.5em !important;
  white-space: nowrap !important;
  color: var(--font-color) !important;
  opacity: 0.5 !important;
  font-weight: 500 !important;
}
.cv-page .cv-info-table td {
  color: var(--font-color) !important;
  font-weight: 500 !important;
}
.cv-page .cv-info-table a {
  color: var(--text-highlight-color, #667eea) !important;
  text-decoration: none !important;
}
.cv-page .cv-info-table a:hover {
  text-decoration: underline !important;
}

/* === 时间线 === */
.cv-timeline {
  position: relative !important;
  padding-left: 20px !important;
  margin: 4px 0 !important;
}
.cv-timeline::before {
  content: '' !important;
  position: absolute !important;
  left: 5px !important;
  top: 8px !important;
  bottom: 8px !important;
  width: 2px !important;
  background: var(--text-highlight-color, #667eea) !important;
  opacity: 0.25 !important;
  border-radius: 1px !important;
}
.cv-timeline h3 {
  position: relative !important;
  padding-left: 16px !important;
}
.cv-timeline h3::before {
  content: '' !important;
  position: absolute !important;
  left: -18px !important;
  top: 6px !important;
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
  background: var(--text-highlight-color, #667eea) !important;
  border: 2px solid var(--card-bg, #fff) !important;
}

/* === 列表项 === */
.cv-bullet {
  font-size: 0.9em !important;
  color: var(--font-color) !important;
  opacity: 0.85 !important;
  line-height: 1.5 !important;
  margin: 1px 0 !important;
  padding-left: 1.2em !important;
  text-indent: -1.2em !important;
}
.cv-bullet::before {
  content: '• ' !important;
  color: var(--text-highlight-color, #667eea) !important;
  font-weight: bold !important;
}

/* === 技能标签 === */
.cv-page code {
  display: inline-block !important;
  padding: 2px 10px !important;
  border-radius: 12px !important;
  font-size: 0.82em !important;
  font-weight: 500 !important;
  background: rgba(102, 126, 234, 0.1) !important;
  color: var(--text-highlight-color, #667eea) !important;
  border: 1px solid rgba(102, 126, 234, 0.2) !important;
  white-space: nowrap !important;
}
.cv-page strong code {
  background: var(--text-highlight-color, #667eea) !important;
  color: #fff !important;
  border-color: transparent !important;
}

/* === 奖项标签 === */
.cv-awards {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 6px !important;
  margin: 6px 0 !important;
}
.cv-award {
  display: inline-block !important;
  font-size: 0.84em !important;
  padding: 2px 8px !important;
  border-radius: 4px !important;
  background: rgba(255, 193, 7, 0.1) !important;
  color: var(--font-color) !important;
  border: 1px solid rgba(255, 193, 7, 0.2) !important;
}

/* === 项目卡片容器 === */
.cv-projects {
  display: flex !important;
  gap: 10px !important;
  margin: 8px 0 !important;
}
.cv-projects .cv-project {
  flex: 1 !important;
  margin: 0 !important;
  vertical-align: top !important;
}
@media (max-width: 600px) {
  .cv-projects {
    flex-direction: column !important;
  }
}

/* === 项目卡片 === */
.cv-project {
  padding: 12px 16px !important;
  border-radius: 8px !important;
  background: var(--card-bg) !important;
  border: 1px solid rgba(102, 126, 234, 0.1) !important;
  margin: 8px 0 !important;
}
.cv-project h3 {
  margin: 0 0 2px 0 !important;
  font-size: 0.95em !important;
}
.cv-project h3::before {
  content: none !important;
}
.cv-project p {
  font-size: 0.88em !important;
  color: var(--font-color) !important;
  opacity: 0.78 !important;
  margin: 2px 0 !important;
}

/* === 游戏经历 === */
.cv-game {
  display: inline-block !important;
  width: calc(50% - 6px) !important;
  padding: 8px 12px !important;
  border-radius: 8px !important;
  background: var(--card-bg) !important;
  border: 1px solid rgba(102, 126, 234, 0.1) !important;
  margin: 3px 0 !important;
  vertical-align: top !important;
  box-sizing: border-box !important;
}
.cv-game strong {
  display: block !important;
  font-size: 0.78em !important;
  color: var(--text-highlight-color, #667eea) !important;
  margin-bottom: 2px !important;
}
@media (max-width: 600px) {
  .cv-game {
    width: 100% !important;
  }
}

/* === 工作经历头行 === */
.cv-work-head {
  font-size: 1.02em !important;
  font-weight: 700 !important;
  color: var(--font-color) !important;
  margin: 0 0 3px 0 !important;
  position: relative !important;
  padding-left: 16px !important;
}
.cv-work-head::before {
  content: '' !important;
  position: absolute !important;
  left: -18px !important;
  top: 6px !important;
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
  background: var(--text-highlight-color, #667eea) !important;
  border: 2px solid var(--card-bg, #fff) !important;
}
.cv-work-org {
  font-weight: 400 !important;
  color: var(--text-highlight-color, #667eea) !important;
  font-size: 0.92em !important;
}
.cv-work-date {
  font-weight: 400 !important;
  color: var(--font-color) !important;
  opacity: 0.45 !important;
  font-size: 0.82em !important;
  margin-left: 8px !important;
}
.cv-work-desc {
  font-size: 0.9em !important;
  color: var(--font-color) !important;
  opacity: 0.8 !important;
  margin: 3px 0 2px 0 !important;
  line-height: 1.5 !important;
}
</style>

<div class="cv-page">

## 📋 基本信息

<table class="cv-info-table">
<tr><th>姓名</th><td>陈嘉豪</td><th>性别</th><td>男</td></tr>
<tr><th>电话</th><td>157****7739</td><th>邮箱</th><td>1933617419@qq.com</td></tr>
<tr><th>微信</th><td>请通过邮件联系</td><th>网站</th><td><a href="https://coolpig0720.github.io">coolpig0720.github.io</a></td></tr>
</table>

## 🎓 教育经历

<div class="cv-timeline">

<h3>广东技术师范大学 · 计算机科学与技术 / 本科</h3>
<p class="cv-date">2021.09 - 2025.06 ｜ GPA：3.62/5（专业前25%）｜ 主修：C/Python/Java编程、数据结构、计算机网络、人工智能等</p>

<p class="cv-awards">
<span class="cv-award">🏆 亚太数学建模竞赛二等奖 (2022)</span>
<span class="cv-award">全国数学建模竞赛三等奖 (2023)</span>
<span class="cv-award">五一数学建模竞赛一等奖 (2023)</span>
<span class="cv-award">连续两年院三好学生 (2022-2024)</span>
</p>
<p>📌 2022.05 ~ 2023.05 在学院学生会公关实践部担任负责人，多次组织校级、院级活动。</p>

</div>

## 💼 工作经历

<div class="cv-timeline">

<h3 class="cv-work-head">Unity3D工程师（性能测试向）<span class="cv-work-org"> · 厦门真有趣信息科技有限公司</span><span class="cv-work-date">2025.04 - 2026.03</span></h3>
<p class="cv-work-desc">任职于《香肠派对》项目组，负责核心玩法全周期客户端性能专项测试，定位性能瓶颈并推动优化落地。</p>

<h4>资源性能专项测试与风险管控</h4>
<p class="cv-bullet">累计完成 <strong>200+套角色套装</strong>、<strong>150+款武器皮肤</strong>、<strong>200+个其他资源</strong> 的全流程性能测试</p>
<p class="cv-bullet">使用 RenderDoc、Unity Profiler 进行截帧分析，保障上线资源异常发生率 <strong>&lt;0.5%</strong></p>

<h4>SDK 迭代性能专项测试</h4>
<p class="cv-bullet">搭建 SDK 性能测试用例体系，覆盖 CPU/内存/帧率核心维度，累计完成 <strong>10+次</strong> 版本测试</p>
<p class="cv-bullet">SDK 迭代平均帧率损耗 <strong>≤2帧</strong>，内存增量 <strong>≤5MB</strong></p>

<h4>赛季版本全周期性能保障</h4>
<p class="cv-bullet">通过 PerfDog 实现全场景性能数据采集、趋势分析与线上监控</p>
<p class="cv-bullet">核心玩法帧率波动 <strong>≤5%</strong>，性能稳定性达标率 <strong>99.8%</strong></p>

</div>

## 🚀 项目经历

<div class="cv-projects">

<div class="cv-project">

<h3>Unity 植物大战僵尸 Demo</h3>
<p class="cv-meta">独立开发者 ｜ 2025.01 - 2025.02</p>
<p>复刻核心玩法机制并优化交互体验。</p>
<p class="cv-bullet">种植系统：卡牌冷却+阳光消耗，拖拽放置+A*寻路</p>
<p class="cv-bullet">僵尸状态机：RigidBody2D 移动/攻击/死亡</p>
<p class="cv-bullet">ScriptableObject 解耦属性配置，生成交互流程图文档</p>

</div>

<div class="cv-project">

<h3>怪兽大战精灵 3D 射击游戏</h3>
<p class="cv-meta">独立开发者 ｜ 2024.11 - 2024.12</p>
<p>Unity 3D射击游戏，击败敌人获取分数。</p>
<p class="cv-bullet">对象池+随机算法控制敌人生成，子弹碰撞+粒子特效</p>
<p class="cv-bullet">GameManager 单例管理状态，OnTriggerEnter 事件驱动</p>
<p class="cv-bullet">模块化设计（Player/Enemy/Bullet 分离），对象池防内存泄漏</p>

</div>

</div>

## 🛠 技术能力

<p><strong>性能测试工具</strong>：<code>PerfDog</code> <code>RenderDoc</code> <code>Unity Profiler</code> <code>Snapdragon Profiler</code> <code>UWA Gears</code></p>

<p><strong>核心专业能力</strong>：<code>性能专项测试</code> <code>测试方案设计</code> <code>数据采集分析</code> <code>报告输出</code> <code>图形学基础</code></p>

<p><strong>其他能力</strong>：<code>Git</code> <code>Cursor/Qoder/Codex</code> <code>CET-6</code></p>

## 🎮 游戏经历

<div class="cv-game">
<strong>射击竞技</strong>
和平精英 800+h、香肠派对 800+h、穿越火线 300+h、CS:GO 100+h
</div>
<div class="cv-game">
<strong>MOBA</strong>
王者荣耀 1500+h、英雄联盟 300+h
</div>
<div class="cv-game">
<strong>策略竞技</strong>
金铲铲之战 1000+h、云顶之弈 500+h、明日方舟 100+h
</div>
<div class="cv-game">
<strong>生存模拟</strong>
荒野日记：孤岛 300+h、无尽冬日 300+h
</div>

</div>
