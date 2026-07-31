
// 将TOC目录从左侧侧边栏移动到右侧独立容器
function moveTocToRight() {
  var toc = document.getElementById('card-toc');
  var layout = document.querySelector('.layout');
  if (!toc || !layout) return;

  // 只在桌面端(>=901px)执行移动
  if (window.innerWidth < 901) return;

  var rightContainer = document.getElementById('right-toc-container');
  if (!rightContainer) {
    rightContainer = document.createElement('div');
    rightContainer.id = 'right-toc-container';
    var stickyWrap = document.createElement('div');
    stickyWrap.className = 'sticky_layout';
    rightContainer.appendChild(stickyWrap);
    layout.appendChild(rightContainer);
  }

  var stickyWrap = rightContainer.querySelector('.sticky_layout');
  if (toc.parentElement !== stickyWrap) {
    stickyWrap.appendChild(toc);
    toc.style.display = 'block';
  }
}

// 页面加载和窗口resize时执行
document.addEventListener('DOMContentLoaded', function() {
  moveTocToRight();
  setTimeout(moveTocToRight, 500);
});
window.addEventListener('resize', function() {
  moveTocToRight();
});

// PJAX导航后重新执行
document.addEventListener('pjax:complete', function() {
  moveTocToRight();
  setTimeout(moveTocToRight, 500);
});

// ====== 修复：滚动时显示右侧按钮（回到顶部、黑夜模式等）======
(function() {
  var rightside = document.getElementById('rightside');
  if (!rightside) return;

  function toggleRightside() {
    var scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY > 200) {
      rightside.classList.add('rightside-show');
    } else {
      rightside.classList.remove('rightside-show');
    }
  }

  // 页面加载时检查一次
  toggleRightside();
  // 滚动时切换显示
  window.addEventListener('scroll', function() {
    toggleRightside();
  }, { passive: true });
})();

// ====== 归档页分类展开/收起 ======
document.querySelectorAll('.category-group-title').forEach(function(title) {
  title.addEventListener('click', function() {
    var group = this.parentElement;
    var isCollapsed = group.getAttribute('data-collapsed') === 'true';
    group.setAttribute('data-collapsed', isCollapsed ? 'false' : 'true');
    this.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
  });
  // 支持键盘 Enter/Space 操作
  title.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.click();
    }
  });
});

// ====== 阅读进度条（仅文章页） ======
(function() {
  var bar = document.createElement('div');
  bar.id = 'reading-progress-bar';
  document.body.appendChild(bar);

  function updateProgress() {
    var postEl = document.getElementById('post');
    if (!postEl) {
      bar.style.display = 'none';
      return;
    }
    bar.style.display = 'block';
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var progress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
    bar.style.width = progress + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  document.addEventListener('DOMContentLoaded', updateProgress);
  document.addEventListener('pjax:complete', function() {
    setTimeout(updateProgress, 100);
  });
  updateProgress();
})();
