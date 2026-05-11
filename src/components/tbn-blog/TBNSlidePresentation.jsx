import { useState, useCallback, useEffect, useRef } from 'react'

// Lazy imports for each slide's interactive component
import CoordinateSpaceIntro from './CoordinateSpaceIntro.jsx'
import EdgeVectorDemo from './EdgeVectorDemo.jsx'
import DerivationScene from './DerivationScene.jsx'
import TBNCalculatorScene from './TBNCalculatorScene.jsx'
import CurvedSurfaceTBN from './CurvedSurfaceTBN.jsx'
import NormalMapLighting from './NormalMapLighting.jsx'
import NormalMapColorDemo from './NormalMapColorDemo.jsx'
import SpaceTransformDemo from './SpaceTransformDemo.jsx'
import GramSchmidtDemo from './GramSchmidtDemo.jsx'

// Title slide component (no 3D, just typography)
function TitleSlide() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, rgba(126,232,168,0.06) 0%, transparent 60%)',
      padding: '40px',
      textAlign: 'center',
      minHeight: '380px',
    }}>
      <div style={{
        fontSize: 'clamp(3rem, 8vw, 6rem)',
        fontWeight: '200',
        letterSpacing: '-0.04em',
        lineHeight: '1',
        marginBottom: '16px',
        background: 'linear-gradient(135deg, #fff 30%, rgba(126,232,168,0.8) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        TBN Matrix
      </div>
      <div style={{
        fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '300',
        marginBottom: '32px',
      }}>
        从推导到实战的交互式之旅
      </div>
      <div style={{
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {['Tangent', 'Bitangent', 'Normal'].map((label, i) => (
          <div key={label} style={{
            padding: '8px 20px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.85rem',
            color: ['#ff6666', '#66ff66', '#6688ff'][i],
            background: 'rgba(255,255,255,0.03)',
          }}>
            {label}
          </div>
        ))}
      </div>
      <div style={{
        marginTop: '48px',
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.25)',
        fontFamily: 'monospace',
      }}>
        按 → 或 Space 开始
      </div>
    </div>
  )
}

// Summary slide component
function SummarySlide() {
  const points = [
    { icon: '🎯', label: 'T 沿纹理 U 方向，B 沿 V 方向，N 垂直于表面' },
    { icon: '📐', label: '通过三角形边向量和 UV 差值反推 T 和 B' },
    { icon: '🔄', label: 'TBN 矩阵将切线空间向量变换到世界空间' },
    { icon: '✨', label: '实践中需要 Gram-Schmidt 正交化和手性处理' },
  ]

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      minHeight: '380px',
      background: 'radial-gradient(ellipse at center, rgba(126,232,168,0.04) 0%, transparent 60%)',
    }}>
      <div style={{
        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
        fontWeight: '300',
        marginBottom: '32px',
        color: 'rgba(255,255,255,0.9)',
      }}>
        核心要点回顾
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '600px',
        width: '100%',
      }}>
        {points.map((p, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '14px 20px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ fontSize: '1.3rem' }}>{p.icon}</span>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>{p.label}</span>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: '36px',
        padding: '12px 24px',
        borderRadius: '8px',
        background: 'rgba(126,232,168,0.08)',
        border: '1px solid rgba(126,232,168,0.2)',
        fontSize: '0.85rem',
        color: 'rgba(126,232,168,0.8)',
        textAlign: 'center',
      }}>
        TBN 矩阵是连接纹理空间和世界空间的桥梁 — 现代实时渲染的数学基础
      </div>
    </div>
  )
}

/**
 * Slide data: each slide has a title, subtitle, description bullets, and an interactive component
 */
const slides = [
  {
    id: 'title',
    number: '00',
    title: 'TBN Matrix',
    subtitle: '交互式讲解',
    description: [
      '9 个交互式 3D 场景',
      '从直觉到公式，循序渐进',
      '动手操作，深入理解',
    ],
    hint: '按 → 或 Space 键开始探索',
    component: TitleSlide,
  },
  {
    id: 'intro',
    number: '01',
    title: 'TBN 矩阵',
    subtitle: '连接两个世界的桥梁',
    description: [
      'TBN = Tangent + Bitangent + Normal',
      '三个向量组成 3×3 矩阵',
      '在切线空间和世界空间之间做坐标变换',
    ],
    hint: '🖱️ 拖拽旋转平面，观察 T、B、N 如何始终贴合表面',
    component: CoordinateSpaceIntro,
  },
  {
    id: 'why',
    number: '02',
    title: '为什么需要 TBN？',
    subtitle: '法线贴图的秘密',
    description: [
      '法线贴图中 (0,0,1) = "垂直于表面向外"',
      '同一张贴图可以贴在任何朝向的表面',
      '光照在世界空间计算 → 需要 TBN 做翻译',
    ],
    hint: '🔄 切换法线贴图开关，感受有无 TBN 变换的差异',
    component: NormalMapLighting,
  },
  {
    id: 'edge-vectors',
    number: '03',
    title: '边向量与 UV',
    subtitle: '推导的起点',
    description: [
      '每个三角形有 3 个顶点 → 3D 坐标 + UV 坐标',
      '边向量 E₁、E₂ 连接 3D 空间和 UV 空间',
      '这个对应关系就是 TBN 的数学基础',
    ],
    hint: '👀 左侧 3D 三角形，右侧 UV 映射 — 观察两者的对应',
    component: EdgeVectorDemo,
  },
  {
    id: 'decomposition',
    number: '04',
    title: '线性组合',
    subtitle: '边向量 = Δu·T + Δv·B',
    description: [
      '边向量可以用 T 和 B 的线性组合表示',
      '红色段 = 沿切线方向的分量',
      '绿色段 = 沿副切线方向的分量',
    ],
    hint: '🎛️ 拖动滑块改变 ΔU、ΔV，观察分解过程',
    component: DerivationScene,
  },
  {
    id: 'calculator',
    number: '05',
    title: '完整计算',
    subtitle: '实时 TBN 计算器',
    description: [
      '从边向量和 UV 差值反推 T、B、N',
      '拖动顶点改变三角形形状',
      '观察 TBN 矩阵如何实时变化',
    ],
    hint: '🎯 拖动 V₂.z 让三角形离开平面，看法线如何倾斜',
    component: TBNCalculatorScene,
  },
  {
    id: 'curved-surface',
    number: '06',
    title: '曲面上的 TBN',
    subtitle: '每个点都不同',
    description: [
      '平面上所有点的 TBN 一致',
      '曲面上每个点有自己的 TBN 坐标系',
      'TBN 随表面法线变化而旋转',
    ],
    hint: '🌊 调节波浪幅度，观察 TBN 如何贴合曲面',
    component: CurvedSurfaceTBN,
  },
  {
    id: 'space-transform',
    number: '07',
    title: '空间变换',
    subtitle: '切线空间 → 世界空间',
    description: [
      '左侧：法线贴图中的法线方向',
      '右侧：经 TBN 变换后的世界空间法线',
      '改变表面倾斜角度，看坐标系如何旋转',
    ],
    hint: '↔️ 调节法线 X 分量和表面角度，观察变换效果',
    component: SpaceTransformDemo,
  },
  {
    id: 'color-encoding',
    number: '08',
    title: '蓝紫色之谜',
    subtitle: '法线 → RGB 编码',
    description: [
      '编码公式：color = normal × 0.5 + 0.5',
      '(0,0,1) → RGB(128, 128, 255) = 蓝紫色',
      '大部分法线接近 (0,0,1) → 整体蓝紫色调',
    ],
    hint: '🎨 拖动法线方向，实时看到对应的颜色变化',
    component: NormalMapColorDemo,
  },
  {
    id: 'gram-schmidt',
    number: '09',
    title: '正交化修正',
    subtitle: 'Gram-Schmidt 过程',
    description: [
      'UV 拉伸导致 T 不垂直于 N',
      "T' = normalize(T - dot(T,N) × N)",
      "B' = cross(N, T')",
    ],
    hint: '📐 增大角度让 T 偏离，观察正交化如何修正',
    component: GramSchmidtDemo,
  },
  {
    id: 'summary',
    number: '10',
    title: '总结',
    subtitle: '核心要点',
    description: [
      'TBN 是法线贴图、视差映射的数学基础',
      '正交矩阵的逆 = 转置 → 高效变换',
      '掌握 TBN = 掌握现代表面细节渲染',
    ],
    hint: '🎉 恭喜完成！你已经掌握了 TBN 矩阵的核心知识',
    component: SummarySlide,
  },
]

// Progress dots component
function ProgressDots({ current, total, onNavigate }) {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          aria-label={`Go to slide ${i + 1}`}
          style={{
            width: i === current ? '24px' : '8px',
            height: '8px',
            borderRadius: '4px',
            border: 'none',
            background: i === current ? '#7ee8a8' : 'rgba(255,255,255,0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: 0,
          }}
        />
      ))}
    </div>
  )
}

// Navigation button
function NavButton({ direction, onClick, disabled }) {
  const isNext = direction === 'next'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isNext ? 'Next slide' : 'Previous slide'}
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.15)',
        background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
        color: disabled ? 'rgba(255,255,255,0.2)' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = 'rgba(126, 232, 168, 0.15)'
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
      }}
    >
      {isNext ? '→' : '←'}
    </button>
  )
}

export default function TBNSlidePresentation() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef(null)

  const slide = slides[currentSlide]
  const InteractiveComponent = slide.component

  const goTo = useCallback((index) => {
    if (index < 0 || index >= slides.length || index === currentSlide) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(index)
      setIsTransitioning(false)
    }, 200)
  }, [currentSlide])

  const next = useCallback(() => goTo(currentSlide + 1), [currentSlide, goTo])
  const prev = useCallback(() => goTo(currentSlide - 1), [currentSlide, goTo])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [next, prev])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1520 50%, #0a1018 100%)',
        color: '#fff',
        fontFamily: "'Outfit', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorations */}
      <div style={{
        position: 'fixed',
        top: '-20%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(126,232,168,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-15%',
        left: '-5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(100,180,255,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Top bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
          }}>
            TBN Matrix
          </span>
          <span style={{
            width: '1px',
            height: '16px',
            background: 'rgba(255,255,255,0.15)',
          }} />
          <span style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.3)',
          }}>
            Interactive Guide
          </span>
        </div>
        <div style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.4)',
          fontFamily: 'monospace',
        }}>
          {slide.number} / {String(slides.length).padStart(2, '0')}
        </div>
      </header>

      {/* Main content area */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 32px',
        gap: '20px',
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? 'translateY(8px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        minHeight: 0,
      }}>
        {/* Slide header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '24px',
          flexWrap: 'wrap',
        }}>
          {/* Left: title area */}
          <div style={{ flex: '1 1 300px', minWidth: '280px' }}>
            <div style={{
              fontSize: '64px',
              fontWeight: '200',
              lineHeight: '1',
              color: 'rgba(126, 232, 168, 0.12)',
              fontFamily: 'monospace',
              marginBottom: '-8px',
              userSelect: 'none',
            }}>
              {slide.number}
            </div>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: '300',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
            }}>
              {slide.title}
            </h1>
            <p style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              color: 'rgba(126, 232, 168, 0.8)',
              margin: 0,
              fontWeight: '300',
            }}>
              {slide.subtitle}
            </p>
          </div>

          {/* Right: description bullets */}
          <div style={{
            flex: '1 1 280px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingTop: '12px',
          }}>
            {slide.description.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '0.88rem',
                color: 'rgba(255,255,255,0.65)',
                lineHeight: '1.5',
              }}>
                <span style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: 'rgba(126, 232, 168, 0.5)',
                  marginTop: '7px',
                  flexShrink: 0,
                }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive component area */}
        <div style={{
          flex: 1,
          minHeight: '380px',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.3)',
          position: 'relative',
        }}>
          <InteractiveComponent />
        </div>

        {/* Hint bar */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'rgba(255,255,255,0.35)',
          padding: '4px 0',
        }}>
          {slide.hint}
        </div>
      </main>

      {/* Bottom navigation */}
      <footer style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        zIndex: 10,
      }}>
        <NavButton direction="prev" onClick={prev} disabled={currentSlide === 0} />
        <ProgressDots current={currentSlide} total={slides.length} onNavigate={goTo} />
        <NavButton direction="next" onClick={next} disabled={currentSlide === slides.length - 1} />
      </footer>

      {/* Keyboard hint */}
      <div style={{
        position: 'fixed',
        bottom: '8px',
        right: '32px',
        fontSize: '10px',
        color: 'rgba(255,255,255,0.2)',
        fontFamily: 'monospace',
      }}>
        ← → or Space to navigate
      </div>
    </div>
  )
}
