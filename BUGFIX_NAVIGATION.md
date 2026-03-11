# 博客导航下拉菜单点击失效 Bug 修复

## 🐛 Bug 描述

**现象：**
- 在网站首页或其他页面时，"博客文章"下拉菜单可以正常点击
- 但在"全部文章"页面 (`/year-archive/`) 时，"博客文章"下拉菜单的子项无法点击
- 只能点击其他一级页签（如"个人网站"）

## 🔍 问题根源

### 1. CSS 选择器过于宽泛

在 `_sass/layout/_masthead.scss` 中：

```scss
.masthead__menu-item.selected a {
  pointer-events: none;  // ❌ 这会禁用所有子链接的点击
  cursor: default;
}
```

当访问 `/year-archive/` 页面时，"博客文章"菜单项会被添加 `selected` 类（因为 `page.url contains link.url`），导致其下所有 `<a>` 标签都无法点击。

### 2. Liquid 模板逻辑

在 `_includes/masthead.html` 第 18 行：

```liquid
<li class="masthead__menu-item simple-dropdown {% if page.url contains link.url and link.url != '/' %}selected{% endif %}">
```

当 `page.url == '/year-archive/'` 且 `link.url == '/year-archive/'` 时，条件成立，添加 `selected` 类。

## ✅ 修复方案

### 方案一：修改 SCSS（推荐，GitHub 自动编译）

**文件：** `_sass/layout/_masthead.scss`

**修改内容：**

```scss
/* 原来的代码 */
.masthead__menu-item.selected a {
  color: var(--global-text-color);
  font-weight: 700;
  border-bottom: 2px solid var(--global-text-color);
  pointer-events: none;
  cursor: default;
}

/* 修改为 */
.masthead__menu-item.selected > a {
  color: var(--global-text-color);
  font-weight: 700;
  border-bottom: 2px solid var(--global-text-color);
  pointer-events: none;
  cursor: default;
}

/* 新增：显式启用下拉菜单链接 */
.masthead__menu-item.selected.simple-dropdown .simple-dropdown-menu a {
  pointer-events: auto;
  cursor: pointer;
}
```

**原理：**
- `> a` 只选择直接子元素（主菜单链接）
- 新增规则显式启用下拉菜单中的子链接

### 方案二：JavaScript 动态修复（辅助方案）

**文件：** `assets/js/_main.js`

**修改内容：**

在 `$(document).ready()` 函数末尾添加：

```javascript
// Fix for dropdown menu when parent has 'selected' class - override pointer-events blocking clicks
$(document).on('mouseenter', '.masthead__menu-item.selected.simple-dropdown', function() {
  $('.simple-dropdown-menu a', this).css({
    'pointer-events': 'auto',
    'cursor': 'pointer'
  });
});
```

**原理：**
- 当鼠标悬停在有 `selected` 类的下拉菜单上时
- 动态修改子链接的 CSS，恢复点击能力

## 📝 修改的文件清单

1. ✅ `_sass/layout/_masthead.scss` - 修复 CSS 选择器（主要修复）
2. ✅ `assets/js/_main.js` - 添加 JavaScript 动态修复（辅助修复）

## 🚀 部署步骤

### GitHub Pages 自动处理

由于你的网站托管在 GitHub Pages，只需：

1. **提交修改到 Git 仓库**
   ```bash
   git add _sass/layout/_masthead.scss assets/js/_main.js
   git commit -m "Fix: 修复博客文章下拉菜单在全部文章页面无法点击的问题"
   git push
   ```

2. **GitHub Pages 会自动：**
   - 使用 Jekyll 重新编译 SCSS → CSS
   - 使用 uglify-js 压缩 JS → main.min.js
   - 部署更新后的网站

3. **等待 1-2 分钟**，刷新浏览器即可看到效果

## 🧪 测试验证

部署完成后，测试以下步骤：

1. ✅ 访问首页 → 点击"博客文章"下拉菜单 → 应可正常点击所有子项
2. ✅ 访问"全部文章"页面 → 点击"博客文章"下拉菜单 → **应可正常点击所有子项**（Bug 已修复）
3. ✅ 访问"技术教程"页面 → 点击"博客文章"下拉菜单 → 应可正常点击切换到其他分类
4. ✅ 在任何页面 → 点击其他一级页签 → 应正常工作

## 📚 技术要点

### 为什么 SCSS 修改是主要的？

- GitHub Pages 使用 Jekyll 静态站点生成器
- 每次 push 代码后，GitHub 会自动运行 `jekyll build`
- SCSS 文件会被编译成 CSS，并压缩到 `assets/css/main.css`
- 因此 SCSS 的修改会自动生效，无需手动编译

### JavaScript 的作用

- JavaScript 文件会被 uglify-js 压缩成 `main.min.js`
- 动态修复作为辅助手段，确保在某些边界情况下也能工作
- 使用事件委托 (`$(document).on()`) 确保动态内容也能被处理

## 🎯 总结

这个 Bug 的本质是 CSS 选择器的作用域过大，误伤了需要保留的下拉菜单链接。通过缩小选择器范围并显式启用下拉菜单，完美解决了问题。

所有修改都只需要提交到 Git 仓库，GitHub Pages 会自动处理编译和部署，无需本地开发环境！
