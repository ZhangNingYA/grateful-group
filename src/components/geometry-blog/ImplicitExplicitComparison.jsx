import { useState } from 'react'

/**
 * 隐式 vs 显式几何对比组件
 * 交互式对比表，点击维度展示详细说明
 */

const dimensions = [
  {
    id: 'concept',
    label: '核心思想',
    implicit: '用关系 / 方程 / 距离场定义形状',
    explicit: '直接给出点、面或参数映射',
    detail: '隐式问"哪些点满足条件？"，显式问"有哪些点和面？"',
  },
  {
    id: 'examples',
    label: '典型例子',
    implicit: 'f(x,y,z)=0、SDF、Level Set、CSG',
    explicit: 'Point Cloud、Triangle Mesh、Parametric Surface',
    detail: '隐式表示常见于物理模拟和 CAD，显式表示常见于游戏和实时渲染。',
  },
  {
    id: 'query',
    label: 'Inside/Outside 查询',
    implicit: '✓ 容易 — 计算 f(p) 的符号即可',
    explicit: '✗ 困难 — 需要额外算法（如 ray casting）',
    detail: '隐式几何天然支持空间分类：f(p)<0 内部，f(p)>0 外部。显式网格需要射线检测或 winding number。',
  },
  {
    id: 'render',
    label: '渲染 / 绘制',
    implicit: '✗ 困难 — 需要 ray marching 或提取 mesh',
    explicit: '✓ 容易 — GPU 管线直接处理三角形',
    detail: '显式三角网格是 GPU 光栅化管线的原生输入。隐式表示需要先转换（如 Marching Cubes）或用 ray marching。',
  },
  {
    id: 'boolean',
    label: '布尔运算 / CSG',
    implicit: '✓ 容易 — min/max 组合 SDF',
    explicit: '✗ 困难 — 需要复杂的网格布尔算法',
    detail: 'SDF 的 union = min(d1,d2)，intersection = max(d1,d2)。网格布尔需要计算交线、重新三角化，容易出错。',
  },
  {
    id: 'topology',
    label: '拓扑变化',
    implicit: '✓ 自然支持 — 场值变化即可',
    explicit: '✗ 困难 — 需要重新连接网格',
    detail: '水滴分裂、融合等拓扑变化在 SDF/Level Set 中自然发生。网格需要手动处理拓扑。',
  },
  {
    id: 'storage',
    label: '存储 / 传输',
    implicit: '紧凑（简单形状）或体素网格（复杂形状）',
    explicit: '顶点+面索引，标准格式（OBJ/glTF/FBX）',
    detail: '一个球只需要圆心和半径。但复杂隐式场可能需要大量体素。显式网格有成熟的文件格式生态。',
  },
  {
    id: 'editing',
    label: '建模 / 编辑',
    implicit: '不直观 — 改参数影响全局',
    explicit: '直观 — 直接移动顶点、调整面',
    detail: '艺术家更习惯显式网格编辑（Blender、Maya）。隐式建模更适合程序化生成。',
  },
]

export default function ImplicitExplicitComparison() {
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)', background: '#0a0a1a' }}>
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '1px', marginBottom: '2px' }}>
          <div style={{ padding: '10px 12px', fontSize: '11px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>
            维度
          </div>
          <div style={{ padding: '10px 12px', fontSize: '12px', color: '#a78bfa', fontWeight: 600, textAlign: 'center' }}>
            隐式 Implicit
          </div>
          <div style={{ padding: '10px 12px', fontSize: '12px', color: '#34d399', fontWeight: 600, textAlign: 'center' }}>
            显式 Explicit
          </div>
        </div>

        {/* Rows */}
        {dimensions.map((dim) => (
          <div key={dim.id}>
            <div
              onClick={() => setSelected(selected === dim.id ? null : dim.id)}
              role="button"
              tabIndex={0}
              aria-expanded={selected === dim.id}
              aria-label={`展开 ${dim.label} 详情`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(selected === dim.id ? null : dim.id) }}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 1fr',
                gap: '1px',
                cursor: 'pointer',
                borderRadius: '8px',
                marginBottom: '2px',
                background: selected === dim.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ padding: '10px 12px', fontSize: '12px', color: '#ccc', fontWeight: 500 }}>
                {dim.label}
              </div>
              <div style={{ padding: '10px 12px', fontSize: '12px', color: '#c4b5fd', lineHeight: 1.5 }}>
                {dim.implicit}
              </div>
              <div style={{ padding: '10px 12px', fontSize: '12px', color: '#6ee7b7', lineHeight: 1.5 }}>
                {dim.explicit}
              </div>
            </div>
            {selected === dim.id && (
              <div style={{
                padding: '10px 16px',
                marginBottom: '4px',
                fontSize: '12px',
                color: '#999',
                lineHeight: 1.6,
                borderLeft: '3px solid rgba(99,102,241,0.3)',
                marginLeft: '12px',
                background: 'rgba(99,102,241,0.04)',
                borderRadius: '0 8px 8px 0',
              }}>
                {dim.detail}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 20px', background: '#111118', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: '#666' }}>
        点击任意行查看详细解释
      </div>
    </div>
  )
}
