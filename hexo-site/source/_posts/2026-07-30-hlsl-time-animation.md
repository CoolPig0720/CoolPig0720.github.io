---
title: HLSL 学习笔记（三）：时间动画
excerpt: 利用 iTime 与 sin 函数实现动态条纹效果，理解时间频率与空间频率的作用。
categories:
  - 技术文档
tags:
  - HLSL
toc: true
abbrlink: 34092
date: 2026-07-30 09:00:00
updated: 2026-07-30 09:00:00
---
## 总述

Shader 本身是无状态的，想让画面"动起来"，核心思路是把**时间**作为一个输入变量（`iTime`）传入着色器，再配合周期函数 `sin` 生成随时间变化的颜色，从而产生动画效果。

## 1 完整代码

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
    float color1 = sin(iTime * 2.0f + uv.x * 80.0f) * 0.5f + 0.5f;
    float color2 = sin(iTime * 2.0f + uv.y * 80.0f) * 0.5f + 0.5f;
    return float4(color1, color2, color1, 1.0f);
}
```

**效果**：屏幕上出现横竖交织的彩色条纹，并随时间不断流动闪烁。

## 2 映射原理（先缩放、后平移）

`sin` 函数的输出范围是 `[-1, 1]`，而颜色分量的合法范围是 `[0, 1]`，所以需要做一次区间映射：

| 步骤 | 运算 | 区间变化 |
| --- | --- | --- |
| 原始 | `sin(iTime)` | `[-1, 1]` |
| 缩放 | `* 0.5` | `[-0.5, 0.5]` |
| 平移 | `+ 0.5` | `[0, 1]` ✅ |

即通用公式：`sin(x) * 0.5 + 0.5`，把任意 `sin` 结果压缩平移到颜色可用的 `[0, 1]` 区间。

## 3 时间项与空间项

`sin(iTime * 2.0f + uv.x * 80.0f)` 中的两个系数各司其职：

| 项 | 通俗理解 | 专业术语 | 系数越大 |
| --- | --- | --- | --- |
| 时间项 `iTime * 2.0` | 闪动 / 流动的**速度** | 时间频率（角频率） | 动得越快 |
| 空间项 `uv.x * 80.0` | 条纹的**密度** | 空间频率 | 条纹越密（波长越短） |

- 调大 `iTime` 的系数 → 条纹流动 / 闪烁得更快；
- 调大 `uv` 的系数 → 单位屏幕宽度内挤进更多个周期，条纹更密。

两者相加放进 `sin` 里，本质上就是一个随时间平移的正弦波：时间项充当**相位偏移**，让固定的空间条纹整体"滑动"起来。
