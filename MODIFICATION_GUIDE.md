# 课程笔记修改指南

## ✅ 已完成的修改

### 1. Lecture 18 拆分 ✓
创建了两个新文件：
- `lecture18a-advanced-light-transport.mdx` - 高级光线传输
- `lecture18b-advanced-appearance.mdx` - 高级外观建模

**改进点**：
- 每个技术添加了"什么时候用"的实战场景判断
- 用表格明确列出适用场景、优缺点、代价
- 自测问题分为基础和进阶两档
- 技术选择速查表帮助快速决策

### 2. 语气统一（部分完成）✓
已修改 `geometry01.mdx` 的部分内容：
- 去掉了"下面这个组件展示……"等元叙述
- 精简了重复的"自测"提示
- 保持了"核心问题 → 答案 → 验证"的结构

---

## 📋 待完成修改清单

### 优先级 1：精简重复内容

#### Lecture 21 - 关键帧动画重复解释
**位置**：Section 1（关键帧动画）

**需要精简的段落**：
```text
原文：
"关键帧动画的思想很简单：
t=0s:  角色站立
t=1s:  角色跳起
t=2s:  角色落地

艺术家只需要定义这几个关键时刻的姿态，中间的过渡帧由计算机自动插值生成。"

改为：
"关键帧动画：艺术家定义关键时刻姿态，中间帧通过插值自动生成。"
```

#### Lecture 20 - 颜色概念重复
**位置**：Section 0（颜色的四层）

**需要精简**：将表格和后续的列表合并，避免同一概念重复出现。

---

### 优先级 2：表格改列表

#### Lecture 20 - 颜色管线清单
**位置**：Section 16（一条实用颜色管线清单）

**当前格式**（嵌套表格）：
```markdown
| 步骤 | 内容 |
|---|---|
| 输入贴图 | - baseColor / emissive: sRGB -> linear<br>- normal / roughness: no sRGB decode |
```

**建议改为**：
```markdown
## 颜色管线清单

1. **输入贴图**
   - baseColor / emissive: sRGB → linear
   - normal / roughness / metallic / AO: 保持 linear

2. **材质和光照**
   - BRDF, shadows, GI, bloom threshold 在 scene-linear 计算
   - HDR 值允许，不要过早 clamp

3. **后处理**
   ```glsl
   // exposure in linear HDR
   exposed = hdrColor * exposure
   // bloom from bright regions
   bloom = extractBright(exposed)
   // tone mapping
   toneMapped = toneMap(exposed + bloom)
   ```

4. **输出**
   - gamut mapping to target color space
   - linear → sRGB or HDR output transform
```

#### Lecture 17 - PBR 参数表
**位置**：Section 11（和实时 PBR 参数逐个对上）

类似改为列表格式，避免单元格内容过长。

---

### 优先级 3：统一所有笔记语气

需要修改的表达模式：

| 原表达（教学化） | 改为（技术文档化） |
|---|---|
| "下面这个组件展示了……" | 直接放组件，不用元叙述 |
| "拖动 slider 观察……" | 移除指令性语言 |
| "请注意……" | 改为"关键："或直接陈述 |
| "让我们看看……" | 删除，直接切入主题 |
| "这个交互……" | 删除交互描述 |

**需要修改的文件**：
- `geometry01.mdx`（部分完成）
- `geometry02.mdx`
- `shadow-mapping.mdx`
- `rayTracing01.mdx`

**修改原则**：
- 保留"核心问题"结构
- 去掉所有元叙述
- 交互组件直接放，不描述
- 自测问题移到统一的"自测问题"章节

---

### 优先级 4：自测问题分档

为每节课添加分档标记：

```markdown
## 自测问题

### ⭐ 基础理解（必须掌握）
1. 什么是 BRDF？
2. 为什么光照要在线性空间计算？
3. ...

### 🔥 进阶思考（拔高内容）
1. 为什么 metallic 为 1 时要关闭 diffuse？
2. 给定一个场景，如何选择最优 tone mapping 曲线？
3. ...
```

**需要修改的文件**：
- `geometry01.mdx`
- `geometry02.mdx`
- `shadow-mapping.mdx`
- `rayTracing01.mdx`
- `rayTracing02.mdx`
- `rayTracing03.mdx`
- `lecture17-materials-appearance.mdx`
- `lecture19-cameras-lenses-light-fields.mdx`
- `lecture20-color-and-perception.mdx`
- `lecture21-animation-simulation.mdx`
- `lecture22-course-review.mdx`

---

## 🔧 快速修改脚本

### 批量去除元叙述
```bash
# 去除"下面这个组件"
sed -i 's/下面这个组件展示//' src/content/works/*.mdx
sed -i 's/下面这个交互//' src/content/works/*.mdx

# 去除"拖动"指令
sed -i 's/拖动.*观察：//' src/content/works/*.mdx
sed -i 's/调整.*观察：//' src/content/works/*.mdx

# 去除"请"字
sed -i 's/请注意/关键/g' src/content/works/*.mdx
sed -i 's/请重点/重点/g' src/content/works/*.mdx
```

### 批量添加自测分档
```bash
# 在每个"自测问题"后添加分档标题
# 需要手动处理，因为每个文件的问题数量不同
```

---

## 📊 修改进度追踪

| 任务 | 状态 | 完成度 |
|---|---|---|
| Lecture 18 拆分 | ✅ 完成 | 100% |
| Lecture 18A/B 添加实战场景 | ✅ 完成 | 100% |
| Lecture 18A/B 自测分档 | ✅ 完成 | 100% |
| Geometry01 语气统一 | 🔄 进行中 | 30% |
| 其他文件语气统一 | ⏳ 待开始 | 0% |
| 精简重复内容 | ⏳ 待开始 | 0% |
| 表格改列表 | ⏳ 待开始 | 0% |
| 全局自测分档 | ⏳ 待开始 | 0% |

---

## 🎯 建议的执行顺序

### 第一轮：快速全局改进（30分钟）
1. 用脚本批量去除元叙述
2. 快速浏览每个文件，手动删除明显的重复段落

### 第二轮：结构优化（1小时）
1. 修改 Lecture 20 的颜色管线清单（表格→列表）
2. 修改 Lecture 17 的 PBR 参数表（表格→列表）
3. 统一所有文件的"优点/缺点"格式

### 第三轮：自测分档（1小时）
1. 为每个文件的自测问题添加 ⭐ 和 🔥 标记
2. 确保基础问题占 60%，进阶问题占 40%

### 第四轮：最终审校（30分钟）
1. 通读修改后的文件
2. 确保语气一致
3. 检查交互组件是否正常引用

---

## ✨ 修改后预期效果

### 语气对比
**修改前**（教学化）：
> "下面这个组件展示了 BVH 的构建过程。请拖动 slider 调整细分级别，观察树的深度如何影响性能。注意：叶节点通常包含 1-4 个三角形。"

**修改后**（技术文档化）：
> **BVH 构建**：按物体分组建立层次包围盒。
> 
> <BVHBuilderVisualizer client:only="react" />
> 
> 叶节点通常包含 1-4 个三角形。树深度直接影响遍历性能。

### 自测问题对比
**修改前**（混乱）：
```markdown
1. 为什么颜色不是光的固有属性？（太简单）
2. 什么是 tone mapping？（定义背诵）
3. 为什么 MLT 噪声呈块状？（论文级）
```

**修改后**（分档清晰）：
```markdown
### ⭐ 基础理解
1. 什么是 tone mapping？为什么需要它？
2. 线性空间和 sRGB 有什么区别？

### 🔥 进阶思考
3. 为什么 MLT 的噪声呈块状？如何权衡？
4. 给定 HDR 场景，如何选择最优 tone mapping 曲线？
```

---

## 🚀 下一步行动

### 立即执行（你可以做的）
1. 运行批量脚本去除元叙述
2. 手动修改 Lecture 20 和 17 的表格
3. 为所有自测问题添加分档标记

### 需要时间（逐步完成）
1. 逐个文件检查语气一致性
2. 精简重复段落
3. 最终审校全部笔记

### 可选优化（如果有时间）
1. 为每个"核心问题"添加一句话答案
2. 统一所有"优点/缺点"的格式
3. 为关键概念添加"什么时候用"的判断表

---

## 📝 修改检查清单

完成每项修改后打勾：

- [x] Lecture 18 拆分为 18A 和 18B
- [x] 18A/18B 添加"什么时候用"
- [x] 18A/18B 自测分档
- [ ] 批量去除"下面这个组件"
- [ ] 批量去除"拖动...观察"
- [ ] Lecture 20 颜色管线改列表
- [ ] Lecture 17 PBR 参数改列表
- [ ] Geometry01 完全去除元叙述
- [ ] Geometry02 语气统一
- [ ] Shadow Mapping 语气统一
- [ ] Ray Tracing 01 语气统一
- [ ] Lecture 21 精简重复段落
- [ ] 全局自测问题分档
- [ ] 最终通读审校

---

## 💡 额外建议

### 可以考虑的改进
1. **添加"快速参考"章节**：每节课开头用表格总结核心公式和概念
2. **技术选择流程图**：用 Mermaid 图表展示"什么场景用什么技术"
3. **常见错误速查表**：每节课末尾列出 top 3 常见 bug

### 保持现有优势
- ✅ 交互组件质量很高，不要减少
- ✅ "核心问题"结构很清晰，保持
- ✅ 公式和代码示例丰富，保持
- ✅ 实战坑点总结很有价值，保持

---

## 总结

当前进度：**40%**

**已完成**：
- ✅ Lecture 18 拆分（最重要）
- ✅ 添加实战场景判断
- ✅ 自测分档示例

**下一步重点**：
1. 批量去除元叙述（30分钟）
2. 表格改列表（1小时）
3. 全局自测分档（1小时）

预计还需 **2-3 小时**可以完成所有核心修改。
