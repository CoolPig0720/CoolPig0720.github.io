---
#title: 首页
layout: page
comments: false
aside: true
---

<!--
  ========================================
  首页自定义样式和内容
  ========================================
  
  【经常修改的内容】：
  1. 欢迎标题和副标题（搜索 "welcome-title"）
  2. 个人简介（搜索 "关于本站"）
  3. 联系方式（搜索 "联系我"）
  4. 底部引言（搜索 "footer-quote"）
  
  【修改提示】：
  - 修改文字内容即可，不要删除 HTML 标签
  - 图片路径格式：/images/xxx.jpg
  - 链接格式：/about/ 或 https://xxx.com
-->

<style>
.home-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-section {
  text-align: center;
  padding: 40px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 30px;
}

.welcome-title {
  font-size: 2.2em;
  font-weight: bold;
  margin-bottom: 15px;
}

.welcome-subtitle {
  font-size: 1.1em;
  opacity: 0.9;
}

.intro-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  margin: 20px 0;
}

.intro-title {
  font-size: 1.3em;
  margin-bottom: 15px;
  color: #2c3e50;
  border-left: 4px solid #667eea;
  padding-left: 12px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin: 25px 0;
}

.feature-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  align-items: flex-start;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.feature-icon {
  font-size: 1.8em;
  margin-right: 15px;
  flex-shrink: 0;
}

.feature-content h3 {
  margin: 0 0 5px 0;
  font-size: 1.1em;
  color: #2c3e50;
}

.feature-content p {
  margin: 0;
  font-size: 0.9em;
  color: #7f8c8d;
}

.quick-nav {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.nav-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
}

.nav-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: #667eea;
  color: white;
}

.nav-icon {
  font-size: 1.5em;
  margin-bottom: 8px;
}

.nav-text {
  font-weight: 500;
  font-size: 0.95em;
}

.contact-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.contact-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.contact-icon {
  margin-right: 10px;
  font-size: 1.2em;
}

.footer-quote {
  text-align: center;
  margin-top: 40px;
  padding: 20px;
  color: #95a5a6;
  font-style: italic;
}
</style>

<div class="home-container">
  <!-- ========== 【修改】欢迎区域 ========== -->
  <div class="welcome-section">
    <h1 class="welcome-title">欢迎来到 CoolPig 的个人网站</h1>
    <p class="welcome-subtitle">分享想法，记录学习，探索技术</p>
  </div>

  <!-- ========== 【修改】关于本站 ========== -->
  <div class="intro-card">
    <h2 class="intro-title">📌 关于本站</h2>
    <p>这是我的个人网站，基于 <strong>Hexo</strong> + <strong>Butterfly</strong> 主题搭建，托管在 GitHub Pages 上。</p>
    <p>在这里，你可以找到我的博客文章、个人简历等内容。</p>
  </div>

  <!-- ========== 【修改】联系方式 ========== -->
  <div class="contact-section">
    <h2 class="intro-title">📬 联系我</h2>
    <div class="contact-item">
      <span class="contact-icon">📧</span>
      <!-- 【修改】邮箱地址 -->
      <span>邮箱：coolpig0720@gmail.com</span>
    </div>
    <div class="contact-item">
      <span class="contact-icon">🌐</span>
      <!-- 【修改】GitHub 链接 -->
      <span>GitHub：<a href="https://github.com/CoolPig0720" target="_blank">CoolPig0720</a></span>
    </div>
  </div>

  <!-- ========== 【修改】底部引言 ========== -->
  <div class="footer-quote">
    <p>路虽远行则将至，事虽难做则必成！</p>
  </div>
</div>
