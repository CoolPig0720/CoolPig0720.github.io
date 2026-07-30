"use strict";

// 主题补丁应用脚本：把 themes/_patches/ 下的所有文件
// 按相同的相对路径覆盖到 node_modules/hexo-theme-butterfly/。
//
// 为什么需要它：npm install 会还原 node_modules 中的主题文件，
// 所有对主题源码的修改都必须放在 themes/_patches/ 中并重新应用。
//
// 执行时机：
//   - 本地：npm install 后自动执行（postinstall），也可手动 npm run patch
//   - CI：deploy.yml 中的 "Apply custom theme patches" 步骤执行 npm run patch
//
// 新增补丁：直接把文件按主题内的相对路径放进 themes/_patches/ 即可，
// 本脚本自动递归遍历，无需修改任何配置。

const fs = require("fs");
const path = require("path");

const PATCH_DIR = path.join(__dirname, "themes", "_patches");
const THEME_DIR = path.join(__dirname, "node_modules", "hexo-theme-butterfly");

if (!fs.existsSync(PATCH_DIR)) {
  console.log("[patch] 未找到 themes/_patches/ 目录，跳过");
  process.exit(0);
}
if (!fs.existsSync(THEME_DIR)) {
  console.log("[patch] 未找到 hexo-theme-butterfly，请先 npm install，跳过");
  process.exit(0);
}

let count = 0;
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const src = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(src);
    } else {
      const rel = path.relative(PATCH_DIR, src);
      const dest = path.join(THEME_DIR, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      console.log(`[patch] ${rel}`);
      count++;
    }
  }
})(PATCH_DIR);

console.log(`[patch] 完成，共应用 ${count} 个补丁文件`);
