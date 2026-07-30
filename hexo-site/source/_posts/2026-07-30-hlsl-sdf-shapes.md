---
title: HLSL 学习笔记（五）：距离场与基础形状（SDF 思想）
excerpt: 用 length 距离场画圆、圆环、矩形，配合 smoothstep 柔边与 min/max 布尔组合，最后完成风标与靶子两个综合练习。
categories:
  - 学习笔记
tags:
  - HLSL
toc: true
abbrlink: 34094
date: 2026-07-30 11:00:00
updated: 2026-07-30 11:00:00
---
## 总述

SDF（Signed Distance Field，有符号距离场）的核心思想：**每个像素先算出"我离形状有多远"（距离 d），再用 d 去决定颜色**。有了距离场，画圆、圆环、矩形都只是对 d 做不同的裁决（`step` 硬边、`smoothstep` 柔边），多个形状之间还能用 `min/max` 做布尔运算（并、交、减）。

## 5.1 length 求距离

```hlsl
cbuffer Uniforms : register(b0)
{
    float2 iResolution;   // 视口尺寸（Variables 里绑 ViewportSize）
    float  iTime;         // 运行秒数（Variables 里绑 Time）
};

struct PSInput
{
    float4 Position : SV_POSITION;   // 屏幕像素坐标
};

float4 main(PSInput pin) : SV_TARGET
{
    float2 uv = pin.Position.xy / iResolution.xy;   // 0~1
    float2 center = float2(0.5, 0.5);
    float d = length(uv - center);
    return float4(d, d, d, 1.0);
}
```

**总结**：`length(v)` 求一个向量的长度，即 `sqrt(v.x*v.x + v.y*v.y)`。把距离直接当颜色输出，就得到一个"中心黑、四周亮"的径向渐变——这就是最原始的距离场可视化。

![径向距离场](/images/hlsl/5-1-1.png)

## 5.2 居中坐标系 + 修正宽高比

直接用 `[0, 1]` 的 uv 画圆有两个问题：圆心不在原点、屏幕非正方形导致圆被拉成椭圆。解决办法：先把原点挪到屏幕中心，再给 x 乘上宽高比。

```hlsl
float4 main(PSInput pin) : SV_TARGET
{
    float2 uv = pin.Position.xy / iResolution.xy;   // 0~1
    float2 p = uv - 0.5;   // 原点中心变换，范围 [-0.5, 0.5]，中心是 0
    float m = iResolution.y / iResolution.x;   // 高宽比 < 1
    float n = iResolution.x / iResolution.y;   // 宽高比 > 1
    p.x *= n;
    float d = length(p);
    return float4(d, d, d, 1.0);
}
```

**为什么 p.x 要乘宽高比（>1）而不是高宽比**：

关键要记住我们是靠 **d 小 = 黑** 来成像的。一个像素黑不黑，取决于 `d = length(p)` 够不够小。把 `p.x` 乘大（× 宽/高 > 1）→ x 方向的距离涨得更快 → 稍微偏离中心 x，d 就冲上去变亮了 → 黑区在 x 上更快结束 → 形状在 x 上被压窄，正好抵消屏幕横向的拉伸。

修正之后，屏幕中心那个像素的 d 仍然是 0（乘法不改变 0），而左右两侧及四个角的 d 会因为修正变大。

![未修正的拉伸圆](/images/hlsl/5-2-1.png)

![修正后的正圆距离场](/images/hlsl/5-2-2.png)

![宽高比修正对比](/images/hlsl/5-2-3.png)

![修正后角落距离变化](/images/hlsl/5-2-4.png)

## 5.3 画实心圆

```hlsl
float4 main(PSInput pin) : SV_TARGET
{
    float2 uv = pin.Position.xy / iResolution.xy;
    float2 p = uv - 0.5;
    float n = iResolution.x / iResolution.y;
    p.x *= n;
    float d = length(p);
    float r = 0.4;
    float c = step(d, r);
    return float4(c, c, c, 1.0);
}
```

**总结**：`step(a, b)` 是 `b >= a` 给 1；要让"半径内（d 小）"为 1，就得 `r >= d`，所以第一个参数放 `d`、第二个放 `r` → `step(d, r)`。

![step实心圆](/images/hlsl/5-3-1.png)

## 5.4 smoothstep 做柔边圆

```hlsl
float4 main(PSInput pin) : SV_TARGET
{
    float2 uv = pin.Position.xy / iResolution.xy;
    float2 p = uv - 0.5;
    float n = iResolution.x / iResolution.y;
    p.x *= n;
    float d = length(p);
    float r = 0.3;
    float w = 0.01;   // w 大，会变成光晕
    float c = 1.0 - smoothstep(r - w, r + w, d);   // 更合适的写法
    return float4(c, c, c, 1.0);
}
```

**注意一个坑**：如果写成 `smoothstep(r - w, r + w, 1.0 - d)`，`r` 越大圆反而越小。因为此时 `r` 已经不是半径了：`1.0 - d ≈ r → d ≈ 1.0 - r`，画出来的圆真正的半径是 `1.0 - r`：

- `r = 0.6` → 实际半径 = 1.0 - 0.6 = 0.4
- `r = 0.9` → 实际半径 = 1.0 - 0.9 = 0.1（更小了！）

所以推荐写法是对 d 正向 smoothstep 后再用 `1.0 -` 翻转：`1.0 - smoothstep(r-w, r+w, d)`。

![柔边圆](/images/hlsl/5-4-1.png)

![w变大形成光晕](/images/hlsl/5-4-2.png)

## 5.5 圆环与矩形

### 5.5.1 圆环

```hlsl
float4 main(PSInput pin) : SV_TARGET
{
    float2 uv = pin.Position.xy / iResolution.xy;
    float2 p = uv - 0.5;
    float n = iResolution.x / iResolution.y;
    p.x *= n;
    float d = length(p);
    float r  = 0.3;    // 外圆半径
    float r0 = 0.2;    // 内圆半径
    float w  = 0.01;
    // A = 外圆（大，实心）
    float A = 1.0 - smoothstep(r - w, r + w, d);
    // B = 内圆（小，实心）
    float B = 1.0 - smoothstep(r0 - w, r0 + w, d);
    float c = abs(A - B);   // 用 A、B 组合出圆环
    return float4(c, c, c, 1.0);
}
```

使用异或 `abs(A - B)` 生成圆环：

| 区域 | A | B | `abs(A-B)` |
| --- | --- | --- | --- |
| 中心（在内圆内） | 1 | 1 | **0**（黑）✅ |
| 环带（在外圆内、内圆外） | 1 | 0 | **1**（白）✅ |
| 环外 | 0 | 0 | **0**（黑）✅ |

![圆环](/images/hlsl/5-5-1.png)

### 5.5.2 矩形

```hlsl
float4 main(PSInput pin) : SV_TARGET
{
    float2 uv = pin.Position.xy / iResolution.xy;
    float2 p = uv - 0.5;
    float n = iResolution.x / iResolution.y;
    p.x *= n;
    float bx = 0.3;   // 半宽
    float by = 0.2;   // 半高
    float w  = 0.01;

    float2 q = abs(p);   // 分轴折叠，只需操心第一象限
    // 横向：|p.x| 在 bx 内 → 亮（复用柔边实心圆的套路，只不过对象换成 q.x）
    float insideX = 1.0 - smoothstep(bx - w, bx + w, q.x);
    // 纵向：|p.y| 在 by 内 → 亮
    float insideY = 1.0 - smoothstep(by - w, by + w, q.y);
    float c = min(insideX, insideY);   // 两个方向取交集
    //float c = insideX * insideY;   // 只在硬 mask 时完全相等，在柔边时会分道扬镳
    return float4(c, c, c, 1.0);
}
```

**要点**：

- `abs(p)` 分轴折叠：四个象限折叠成第一象限，只需处理一种情况。
- 矩形 = 横向带子 ∩ 纵向带子，用 `min` 取交集。
- `min` 与乘法只在硬 mask（0/1）时完全等价，柔边时结果不同（`min` 保边缘更干净）。

![柔边矩形](/images/hlsl/5-5-2.png)

## 5.6 min/max 组合（并 / 交 / 减）

```hlsl
float4 main(PSInput pin) : SV_TARGET
{
    float2 uv = pin.Position.xy / iResolution.xy;
    float2 p = uv - 0.5;
    float n = iResolution.x / iResolution.y;
    p.x *= n;
    float r  = 0.3;
    float bx = 0.3;   // 半宽
    float by = 0.2;   // 半高
    float w  = 0.01;

    // 圆 mask（复用 5.4）
    float dCirc  = length(p);
    float circle = 1.0 - smoothstep(r - w, r + w, dCirc);

    // 矩形 mask（复用 5.5）
    float2 q = abs(p);
    float insideX = 1.0 - smoothstep(bx - w, bx + w, q.x);
    float insideY = 1.0 - smoothstep(by - w, by + w, q.y);
    float rect = min(insideX, insideY);

    // 三选一，一次看一个（把另外两行注释掉）：
    //float c = max(circle, rect);       // 并集
    //float c = min(circle, rect);       // 交集
    float c = circle * (1.0 - rect);     // 减法：圆挖掉矩形
    return float4(c, c, c, 1.0);
}
```

**总结**：

| 运算 | 写法 | 含义 |
| --- | --- | --- |
| 并集 | `max(A, B)` | 两个形状叠加 |
| 交集 | `min(A, B)` | 只留重叠部分 |
| 减法 | `A * (1.0 - B)` 或 `min(A, 1.0 - B)` | 从 A 中挖掉 B |

注意减法**不能**直接写 `abs(A - B)`——那是异或，B 超出 A 的部分也会亮。

![并集](/images/hlsl/5-6-1.png)

![交集](/images/hlsl/5-6-2.png)

![减法](/images/hlsl/5-6-3.png)

## 5.7 综合练习：柔边图标

### 5.7.1 风标图

矩形挖掉一个贴在右边中点的圆：

```hlsl
float4 main(PSInput pin) : SV_TARGET
{
    float2 uv = pin.Position.xy / iResolution.xy;
    float2 p = uv - 0.5;
    float n = iResolution.x / iResolution.y;
    p.x *= n;

    float bx = 0.3;   // 半宽
    float by = 0.2;   // 半高
    float rh = by;    // 圆半径 = 矩形半高
    float w  = 0.01;
    float2 ctr = float2(bx, 0.0);   // 矩形右边中心点

    // 圆 mask（复用 5.4，圆心平移到 ctr）
    float dCirc  = length(p - ctr);
    float circle = 1.0 - smoothstep(rh - w, rh + w, dCirc);

    // 矩形 mask（复用 5.5）
    float2 q = abs(p);
    float insideX = 1.0 - smoothstep(bx - w, bx + w, q.x);
    float insideY = 1.0 - smoothstep(by - w, by + w, q.y);
    float rect = min(insideX, insideY);

    float c = rect * (1.0 - circle);   // 矩形挖掉圆
    return float4(c, c, c, 1.0);
}
```

**要点**：想把形状移到任意位置，只需在算距离前对坐标做平移——`length(p - ctr)` 就是"以 ctr 为圆心"。

![风标图](/images/hlsl/5-7-1.png)

### 5.7.2 靶子

同心环 = 对距离场做周期化（frac）再切环：

```hlsl
float4 main(PSInput pin) : SV_TARGET
{
    float2 uv = pin.Position.xy / iResolution.xy;
    float2 p = uv - 0.5;
    float n = iResolution.x / iResolution.y;
    p.x *= n;
    float r = 0.5;
    float w = 0.01;
    float d = length(p);   // 到中心距离（这次圆心就放原点）

    //float s = frac(d * 10.0);                 // 直接 frac 会导致环一边毛边一边柔性
    //float ring = smoothstep(0.45, 0.55, s);
    float tri = abs(frac(sqrt(d) * 10.0) - 0.5);
    // 三角波：来回 0.5→0→0.5，连续无跳变；sqrt(d) 做非线性拉伸让环距更均匀
    float disc = 1.0 - smoothstep(r - w, r + w, d);       // 外轮廓圆盘
    float ring = smoothstep(0.22, 0.28, tri);             // 把三角波斜坡切成环
    float3 bg  = float3(0.25, 0.25, 0.30);                // 背景色
    float target = 1.0 - ring;                            // 环图案（0/1）
    float3 col = lerp(bg, float3(target, target, target), disc);
    // lerp(bg, 靶子, disc)：disc=1（圆盘内）显示靶子、disc=0（圆盘外）显示背景色
    return float4(col, 1.0);
}
```

**要点**：

- 直接对 `frac(d * N)` 做 smoothstep 会出现"一边毛边一边柔边"——因为锯齿波在周期交界处有跳变；改用三角波 `abs(frac(x) - 0.5)` 则连续无跳变，两侧都柔。
- `sqrt(d)` 对距离做非线性拉伸，调整环与环之间的间距。
- 最外层再用一个圆盘 mask + `lerp` 背景色，把靶子裁进圆里。

![靶子](/images/hlsl/5-7-2.png)
