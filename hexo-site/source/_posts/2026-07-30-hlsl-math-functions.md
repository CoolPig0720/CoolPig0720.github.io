---
title: HLSL 学习笔记（四）：常用数学函数
excerpt: frac、step、smoothstep、lerp、saturate、abs/min/max 等着色器核心数学函数的用法与图案实验。
categories:
  - 技术文档
tags:
  - HLSL
toc: true
abbrlink: 34093
date: 2026-07-30 10:00:00
updated: 2026-07-30 10:00:00
---
## 总述

着色器里没有循环画图的概念，所有图案都是靠**数学函数对坐标做变换**得到的。本篇整理最常用的几个函数：`frac` 造周期、`step` 切硬边、`smoothstep` 做柔边、`lerp` 混颜色、`saturate` 防溢出、`abs/min/max` 做对称与布尔组合。

## 4.1 frac —— 取小数部分，做重复/循环

```hlsl
cbuffer Uniforms : register(b0)
{
    float2 iResolution;
    float iTime;
};

struct PSInput
{
    float4 Position : SV_POSITION;
};

float4 main(PSInput pin) : SV_TARGET
{
    float2 uv = pin.Position.xy / iResolution.xy;
    float e = frac(uv.x * 10.0f);
    return float4(e, e, e, 1.0f);
    //float g = 1.0-abs(e - 0.5f)*2.0f;
    //return float4(g, g, g, 1.0f);
}
```

**总结**：

- `frac` = 取小数 = 周期循环，乘的系数控制重复次数。
- `abs` 的作用是"以 0.5 为镜子对折"，把周期信号再套一层 `abs(x - 0.5)`，可以做出对称的三角波。

![锯齿波条纹](/images/hlsl/4-1-1.png)

![三角波条纹](/images/hlsl/4-1-2.png)

## 4.2 step —— 硬边界（黑白二值分界）

```hlsl
cbuffer Uniforms : register(b0)
{
    float2 iResolution;
    float iTime;
};

struct PSInput
{
    float4 Position : SV_POSITION;
};

float4 main(PSInput pin) : SV_TARGET
{
    float2 uv = pin.Position.xy / iResolution.xy;
    //float e = step(0.8f, frac(uv.x * 10.0f));
    //return float4(e, e, e, 1.0f);
    float e = frac(uv.x * 10.0f);
    float g = 1.0 - abs(e - 0.5f) * 2.0f;
    float h = step(0.5f, g);
    // 对三角波 g 进行 step，得到"每条带子中间白、两边黑"的对称条纹。
    // 因为 g 是中间高（=1）两边低（=0）的三角波，卡 0.5 门槛后，只有中间超过门槛的部分变白。
    return float4(h, h, h, 1.0f);
}
```

**总结**：

- `step(edge, x)`：`x >= edge` 出 1，否则出 0，硬边、无过渡。
- 门槛值 `edge` 控制黑白分界位置（也就控制了黑白占比）。
- 组合顺序有意义：`step` 是"坍缩成二值"的收尾操作，放在你想裁决的那个图案的最外层。

![step硬边条纹1](/images/hlsl/4-2-1.png)

![step硬边条纹2](/images/hlsl/4-2-2.png)

![step硬边条纹3](/images/hlsl/4-2-3.png)

## 4.3 smoothstep —— 柔和过渡（抗锯齿）

```hlsl
cbuffer Uniforms : register(b0)
{
    float2 iResolution;
    float iTime;
};

struct PSInput
{
    float4 Position : SV_POSITION;
};

float4 main(PSInput pin) : SV_TARGET
{
    // smoothstep(e0, e1, x) 内部其实分两步：
    // 第1步（线性重映射）: t = saturate((x - e0) / (e1 - e0));  // 把 [e0,e1] 拉成 [0,1] 的直线
    // 第2步（套 S 多项式）: return t * t * (3.0 - 2.0 * t);      // ← S 曲线就诞生在这里
    float2 uv = pin.Position.xy / iResolution.xy;
    // float e = smoothstep(0.3f, 0.7f, frac(uv.x * 10.0f));
    // return float4(e, e, e, 1.0f);
    float t = saturate((frac(uv.x * 10.0) - 0.3) / 0.4);
    float o = t * t * (3.0 - 2.0 * t); // S 曲线，也就是 smoothstep 的等价物
    if (uv.y > 0.5)
    {
        return float4(t, t, t, 1.0f); // 屏幕下半：线性
    }
    else
    {
        return float4(o, o, o, 1.0f); // 屏幕上半：S 曲线
    }
}
```

**总结**：

- `smoothstep(a, b, x)`：
  - `x <= a` 时结果为 0；
  - `x >= b` 时结果为 1；
  - `a < x < b` 时不是直线上升，而是走一条 S 型曲线（先慢-后快-再慢），两端非常平滑（导数为 0），看起来非常自然。
- `smoothstep(e0, e1, x)` = 先线性重映射到 `[0, 1]`，再套 `t*t*(3-2t)`。
- 两端斜率为 0 → 无折角 → 抗锯齿；这才是它比 `step`、比线性优秀的本质。
- `e1 - e0` 控制过渡带宽度，越窄越接近 `step`。

![smoothstep渐变条纹](/images/hlsl/4-3-1.png)

![线性与S曲线对比](/images/hlsl/4-3-2.png)

## 4.4 lerp —— 两个值/颜色间插值

```hlsl
cbuffer Uniforms : register(b0)
{
    float2 iResolution;
    float iTime;
};

struct PSInput
{
    float4 Position : SV_POSITION;
};

float4 main(PSInput pin) : SV_TARGET
{
    float2 uv = pin.Position.xy / iResolution.xy;
    float3 color1 = float3(1.0f, 0.5f, 0.0f); // 橙色
    float3 color2 = float3(0.0f, 0.0f, 1.0f); // 蓝色
    //float3 color = lerp(color1, color2, uv.x);                 // 全屏渐变
    //float3 color = lerp(color1, color2, frac(uv.x * 10.0f));   // frac 周期渐变
    float3 color = lerp(color1, color2, smoothstep(0.3f, 0.7f, frac(uv.x * 10.0f))); // smoothstep 渐变
    return float4(color, 1.0f);
}
```

**总结**：

- `lerp(A, B, t)`：
  - `t = 0` → A（完全是 A）；
  - `t = 1` → B（完全是 B）；
  - `t = 0.5` → A、B 的中间（各一半）。
- 本质是加权平均，展开来看：`lerp(A, B, t) = A * (1 - t) + B * t`。
- `t` 就是一个滑块：从 0 滑到 1，结果从 A 平滑滑向 B。
- A、B 可以是单个数，也可以是 `float3` 颜色（R/G/B 三个通道各自独立混合）。
- **任何一个 0~1 的信号，都能当 lerp 的滑块，去驱动两种颜色的过渡。信号是什么形状，配色就是什么节奏**——这是着色器配色的通用心法。

![lerp全屏渐变](/images/hlsl/4-4-1.png)

![frac周期渐变](/images/hlsl/4-4-2.png)

![smoothstep周期渐变](/images/hlsl/4-4-3.png)

## 4.5 saturate / clamp —— 限制范围防溢出

```hlsl
cbuffer Uniforms : register(b0)
{
    float2 iResolution;
    float iTime;
};

struct PSInput
{
    float4 Position : SV_POSITION;
};

float4 main(PSInput pin) : SV_TARGET
{
    float2 uv = pin.Position.xy / iResolution.xy;
    float x = (frac(uv.x * 10.0) - 0.3) / 0.4;
    float v = saturate(x);
    v = v * v;
    // float v = x * x; // 不套 saturate 的对照版本
    return float4(v, v, v, 1.0f);
    // 不套 saturate，每条带子左边冒出一块本不该有的灰"鬼影"；套上就干净了。
    // 这就是 saturate 的价值——它守在"越界值流入后续运算"的门口。
}
```

**总结**：

- `saturate(x)`：把值夹到 `[0, 1]`——小于 0 的变 0，大于 1 的变 1，中间不变。等价于 `clamp(x, 0.0, 1.0)`。
- `clamp(x, a, b)`：更通用，夹到任意区间 `[a, b]`。
- **为什么需要它**：颜色分量的有效范围是 `[0, 1]`，而很多运算（除法、减法、乘大系数）会把值冲出这个范围，产生异常色或意外截断。`saturate` 是给结果"上保险"。

![saturate处理后](/images/hlsl/4-5-1.png)

![未saturate的鬼影](/images/hlsl/4-5-2.png)

## 4.6 abs / min / max / fmod —— 对称、镜像、取模

```hlsl
cbuffer Uniforms : register(b0)
{
    float2 iResolution;
    float iTime;
};

struct PSInput
{
    float4 Position : SV_POSITION;
};

float4 main(PSInput pin) : SV_TARGET
{
    float2 uv = pin.Position.xy / iResolution.xy;
    float sx = step(0.5, frac(uv.x * 10.0)); // 左黑右白
    float sy = step(0.5, frac(uv.y * 10.0)); // 上白下黑
    float vMax = max(sx, sy);      // 有白则白，类似"或"
    float vMin = min(sx, sy);      // 全白才白，类似"与"
    float final = abs(sx - sy);    // 横竖状态不同为白，类似"异或"
    //return float4(vMax, vMax, vMax, 1.0f);
    //return float4(vMin, vMin, vMin, 1.0f);
    return float4(final, final, final, 1.0f);
}
```

**总结**：

- `abs(x)`：取绝对值 = 以某点为镜子对折。
- `fmod(x, y)`：取余数，是 `frac` 的"通用版"。`fmod(x, 1.0)` 基本等于 `frac(x)`；但它能对任意周期取模，比如 `fmod(x, 2.0)` 得到 0~2 的循环。

| 函数 | 结果 | 图案含义 |
| --- | --- | --- |
| `max(a, b)` | 两者中大的 | "谁亮谁赢" → 图案的并集（叠加） |
| `min(a, b)` | 两者中小的 | "谁暗谁赢" → 图案的交集（只留重叠处） |
| `abs(a - b)` | 差的绝对值 | 状态不同才亮 → 异或 |

![max并集棋盘](/images/hlsl/4-6-1.png)

![min交集棋盘](/images/hlsl/4-6-2.png)

![abs异或棋盘](/images/hlsl/4-6-3.png)
