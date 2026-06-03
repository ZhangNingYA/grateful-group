# 课程笔记重构计划

## 优先级 1：拆分 Lecture 18

### 现状问题
- Lecture 18 包含高级采样（IS、MIS、BDPT、MLT、Photon Mapping）+ 高级外观（参与介质、头发、皮肤、布料）
- 信息密度过高，初学者容易被吓到

### 拆分方案
**Lecture 18A：高级光线传输（Advanced Light Transport）**
- 重要性采样与 MIS
- BDPT
- MLT
- Photon Mapping
- VCM
- Instant Radiosity
- 每个技术加"什么时候需要用"的实战场景

**Lecture 18B：高级外观建模（Advanced Appearance Modeling）**
- Participating Media（雾、烟、云、火）
- Hair / Fur / Fibers
- Granular Material（沙子、糖、雪）
- Translucent Material（皮肤、玉、蜡）
- Cloth

---

## 优先级 2：统一语气和结构

### 需要修改的文件
- `geometry01.mdx` - 教学化语气
- `shadow-mapping.mdx` - 教学化语气
- `geometry02.mdx` - 教学化语气
- `rayTracing01.mdx` - 教学化语气

### 目标语气：技术文档化 + 适度的引导性
- 去掉"下面这个组件展示……"之类的元叙述
- 直接切入核心问题
- 保持"核心问题 → 直觉 → 公式 → 验证"的结构

---

## 优先级 3：自测问题分档

### 改进方案
每节课的自测问题分两部分：

**基础理解（必须掌握）**
- 定义、公式、核心概念
- 标记为"⭐ 基础"

**进阶思考（拔高内容）**
- 实现细节、优化技巧、跨章节综合
- 标记为"🔥 进阶"

---

## 优先级 4：精简啰嗦内容

### 原则
- 每个概念只用一句话抓核心
- "通俗理解"和"技术定义"合并
- 去掉重复解释

### 重点修改章节
- Lecture 21（动画与模拟）- 关键帧动画重复解释 3 遍
- Lecture 20（颜色与感知）- 部分概念过度解释

---

## 优先级 5：表格改列表

### 需要改的地方
- Lecture 20：颜色管线清单（当前是嵌套表格）
- Lecture 17：PBR 参数表（部分单元格过长）

改成：有序列表 + 子项目 + 代码块
