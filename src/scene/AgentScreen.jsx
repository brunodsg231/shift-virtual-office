import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore from '../store/useStore'

const SCREEN_W = 1024
const SCREEN_H = 640

// Role-specific screen content drawing functions
const drawFunctions = {
  kim: (ctx, t, agent) => {
    // HubSpot CRM
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, 1024, 640)
    // Header bar
    ctx.fillStyle = '#7B5CE6'
    ctx.fillRect(0, 0, 1024, 52)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 18px monospace'
    ctx.fillText('\u25CF HUBSPOT CRM', 20, 34)
    // 5 contact rows, alternating bg
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#151520' : '#1a1a2a'
      ctx.fillRect(0, 60 + i * 68, 1024, 64)
      // Purple status dot
      ctx.fillStyle = '#7B5CE6'
      ctx.beginPath()
      ctx.arc(30, 92 + i * 68, 6, 0, Math.PI * 2)
      ctx.fill()
      // Contact info
      ctx.fillStyle = '#e8e8ff'
      ctx.font = '14px monospace'
      const names = ['Sarah Chen \u00B7 Acme Corp', 'James Wilson \u00B7 TechFlow', 'Maria Garcia \u00B7 CloudSys', 'Alex Kim \u00B7 DataVault', 'Priya Patel \u00B7 NetScale']
      ctx.fillText(names[i], 50, 96 + i * 68)
      // Status pill
      const statuses = ['Active', 'Pending', 'Active', 'New', 'Active']
      const pillColors = ['#00aa44', '#aaaa00', '#00aa44', '#4466aa', '#00aa44']
      ctx.fillStyle = pillColors[i]
      ctx.fillRect(800, 82 + i * 68, 60, 22)
      ctx.fillStyle = '#fff'
      ctx.font = '11px monospace'
      ctx.fillText(statuses[i], 808, 98 + i * 68)
    }
    // Bottom bar chart: 7 bars
    for (let i = 0; i < 7; i++) {
      const h = 40 + Math.sin(t * 0.2 + i) * 25 + i * 10
      ctx.fillStyle = '#7B5CE6'
      ctx.fillRect(60 + i * 130, 590 - h, 100, h)
    }
    ctx.fillStyle = '#666'
    ctx.font = '10px monospace'
    ;['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach((d, i) => {
      ctx.fillText(d, 85 + i * 130, 608)
    })
  },

  dev: (ctx, t, agent) => {
    // Code editor
    ctx.fillStyle = '#1e1e2e'
    ctx.fillRect(0, 0, 1024, 640)
    // Tab bar
    ctx.fillStyle = '#252535'
    ctx.fillRect(0, 0, 1024, 36)
    ctx.fillStyle = '#1e1e2e'
    ctx.fillRect(0, 0, 180, 36)
    ctx.fillStyle = '#fff'
    ctx.font = '13px monospace'
    ctx.fillText('AgentCharacter.tsx', 12, 24)
    ctx.fillStyle = '#666'
    ctx.fillText('server.ts', 200, 24)
    // Line numbers column
    ctx.fillStyle = '#1a1a28'
    ctx.fillRect(0, 36, 56, 604)
    // 20 lines of code
    const lines = [
      "import { useRef, useState } from 'react'",
      "import * as THREE from 'three'",
      "",
      "const AGENT_CONFIG = {",
      "  walkSpeed: 4,",
      "  turnRate: 6,",
      "  blinkInterval: [3, 7],",
      "}",
      "",
      "export function AgentCharacter({ id }) {",
      "  const meshRef = useRef<THREE.Mesh>(null)",
      "  const [status, setStatus] = useState('idle')",
      "",
      "  useFrame((state, delta) => {",
      "    if (!meshRef.current) return",
      "    const t = state.clock.elapsedTime",
      "    meshRef.current.rotation.y += delta",
      "    // Apply walk animation",
      "    updateWalkCycle(meshRef, t, delta)",
      "  })",
    ]
    lines.forEach((line, i) => {
      // Line number
      ctx.fillStyle = '#556677'
      ctx.font = '13px monospace'
      ctx.fillText(`${(i + 1).toString().padStart(3)}`, 8, 60 + i * 28)
      // Syntax coloring
      if (line.match(/import|export|const|function|return|if/)) {
        ctx.fillStyle = '#c678dd'
      } else if (line.match(/['"`]/)) {
        ctx.fillStyle = '#98c379'
      } else if (line.match(/\/\//)) {
        ctx.fillStyle = '#5c6370'
      } else if (line.match(/\d/)) {
        ctx.fillStyle = '#d19a66'
      } else {
        ctx.fillStyle = '#abb2bf'
      }
      ctx.fillText(line, 66, 60 + i * 28)
    })
    // Blinking cursor
    if (Math.sin(t * 3) > 0) {
      ctx.fillStyle = '#528bff'
      ctx.fillRect(66 + 17 * 7.8, 540, 2, 18)
    }
  },

  marco: (ctx, t, agent) => {
    // Sales dashboard
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, 1024, 640)
    // Header
    ctx.fillStyle = '#FF6B35'
    ctx.fillRect(0, 0, 1024, 52)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 18px monospace'
    ctx.fillText('SALES PIPELINE', 20, 34)
    // KPI cards
    const kpis = [
      { label: 'LEADS', val: '47', color: '#3B82F6' },
      { label: 'DEALS', val: '12', color: '#22C55E' },
      { label: 'REVENUE', val: '$84K', color: '#FF6B35' },
    ]
    kpis.forEach((k, i) => {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(20 + i * 330, 70, 310, 120)
      ctx.fillStyle = k.color
      ctx.font = 'bold 48px monospace'
      ctx.fillText(k.val, 40 + i * 330, 140)
      ctx.fillStyle = '#888'
      ctx.font = '14px monospace'
      ctx.fillText(k.label, 40 + i * 330, 172)
    })
    // Bar chart
    for (let i = 0; i < 8; i++) {
      const h = 60 + Math.sin(t * 0.2 + i) * 40 + i * 16
      ctx.fillStyle = i < 6 ? '#FF6B35' : 'rgba(255,107,53,0.3)'
      ctx.fillRect(40 + i * 120, 560 - h, 96, h)
    }
    ctx.fillStyle = '#666'
    ctx.font = '12px monospace'
    ;['Q1-W1','Q1-W2','Q1-W3','Q1-W4','Q2-W1','Q2-W2','Q2-W3','Q2-W4'].forEach((d, i) => {
      ctx.fillText(d, 44 + i * 120, 580)
    })
  },

  zara: (ctx, t, agent) => {
    // Campaign Studio
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, 1024, 640)
    // Header
    ctx.fillStyle = '#F59E0B'
    ctx.fillRect(0, 0, 1024, 52)
    ctx.fillStyle = '#000'
    ctx.font = 'bold 18px monospace'
    ctx.fillText('CAMPAIGN STUDIO', 20, 34)
    // Color palette row
    const colors = ['#ff453a', '#FF6B35', '#F59E0B', '#22C55E', '#3B82F6', '#7B5CE6', '#EC4899']
    colors.forEach((c, i) => {
      ctx.fillStyle = c
      ctx.fillRect(20 + i * 140, 68, 124, 60)
    })
    // Campaign metrics area
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(20, 148, 984, 340)
    ctx.fillStyle = '#F59E0B'
    ctx.font = '14px monospace'
    ctx.fillText('Social Campaign Performance', 40, 180)
    // Sparkline graph
    ctx.strokeStyle = '#F59E0B'
    ctx.lineWidth = 3
    ctx.beginPath()
    for (let i = 0; i < 80; i++) {
      const x = 60 + i * 11.5
      const y = 320 + Math.sin(t * 0.3 + i * 0.5) * 80
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
    // Engagement metrics
    ctx.fillStyle = '#e8e8ff'
    ctx.font = '14px monospace'
    const metrics = [
      { label: 'Impressions', val: '24.8K' },
      { label: 'Clicks', val: '3,210' },
      { label: 'CTR', val: '12.9%' },
      { label: 'Conversions', val: '847' },
    ]
    metrics.forEach((m, i) => {
      ctx.fillStyle = '#F59E0B'
      ctx.font = 'bold 28px monospace'
      ctx.fillText(m.val, 40 + i * 244, 540)
      ctx.fillStyle = '#888'
      ctx.font = '12px monospace'
      ctx.fillText(m.label, 40 + i * 244, 564)
    })
  },

  riley: (ctx, t, agent) => {
    // AV Systems Monitor
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, 1024, 640)
    // Header
    ctx.fillStyle = '#22C55E'
    ctx.fillRect(0, 0, 1024, 52)
    ctx.fillStyle = '#000'
    ctx.font = 'bold 18px monospace'
    ctx.fillText('AV SYSTEMS MONITOR', 20, 34)
    // System status rows
    const systems = ['Audio Main', 'Audio Conf', 'Video Feed 1', 'Video Feed 2', 'Lighting', 'Network']
    systems.forEach((s, i) => {
      ctx.fillStyle = i % 2 === 0 ? '#151520' : '#1a1a2a'
      ctx.fillRect(0, 64 + i * 88, 1024, 80)
      ctx.fillStyle = '#e8e8ff'
      ctx.font = '14px monospace'
      ctx.fillText(s, 40, 110 + i * 88)
      // Status indicator
      const ok = Math.sin(t * 0.5 + i * 2) > -0.8
      ctx.fillStyle = ok ? '#22C55E' : '#ff453a'
      ctx.beginPath()
      ctx.arc(940, 104 + i * 88, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#888'
      ctx.font = '12px monospace'
      ctx.fillText(ok ? 'ONLINE' : 'CHECK', 840, 110 + i * 88)
      // Signal level bar
      const barW = ok ? 160 + Math.sin(t * 0.2 + i) * 30 : 40
      ctx.fillStyle = ok ? 'rgba(34,197,94,0.3)' : 'rgba(255,69,58,0.3)'
      ctx.fillRect(400, 94 + i * 88, barW, 20)
    })
  },

  dante: (ctx, t, agent) => {
    // Beverage Ops
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, 1024, 640)
    // Header
    ctx.fillStyle = '#EC4899'
    ctx.fillRect(0, 0, 1024, 52)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 18px monospace'
    ctx.fillText('BEVERAGE OPS', 20, 34)
    // Inventory list
    const items = [
      { name: 'Espresso Beans', stock: 85 },
      { name: 'Oat Milk', stock: 42 },
      { name: 'Sparkling Water', stock: 96 },
      { name: 'Kombucha', stock: 28 },
      { name: 'Cold Brew', stock: 60 },
      { name: 'Matcha Powder', stock: 15 },
    ]
    items.forEach((item, i) => {
      ctx.fillStyle = i % 2 === 0 ? '#151520' : '#1a1a2a'
      ctx.fillRect(0, 64 + i * 88, 1024, 80)
      ctx.fillStyle = '#e8e8ff'
      ctx.font = '14px monospace'
      ctx.fillText(item.name, 40, 110 + i * 88)
      // Stock bar background
      ctx.fillStyle = '#2a2a3e'
      ctx.fillRect(360, 94 + i * 88, 500, 28)
      // Stock bar fill
      const barW = item.stock * 5
      ctx.fillStyle = item.stock < 30 ? '#ff453a' : item.stock < 50 ? '#F59E0B' : '#22C55E'
      ctx.fillRect(360, 94 + i * 88, barW, 28)
      // Percentage label
      ctx.fillStyle = '#fff'
      ctx.font = '14px monospace'
      ctx.fillText(`${item.stock}%`, 880, 114 + i * 88)
    })
  },

  sam: (ctx, t, agent) => {
    // Operations Hub
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, 1024, 640)
    // Header
    ctx.fillStyle = '#94A3B8'
    ctx.fillRect(0, 0, 1024, 52)
    ctx.fillStyle = '#000'
    ctx.font = 'bold 18px monospace'
    ctx.fillText('OPERATIONS HUB', 20, 34)
    // Checklist
    const tasks = [
      { text: 'Morning security check', done: true },
      { text: 'HVAC calibration', done: true },
      { text: 'Inventory audit \u2014 supplies', done: Math.sin(t * 0.1) > 0 },
      { text: 'Fire system test', done: false },
      { text: 'Vendor delivery confirmation', done: false },
      { text: 'Evening lockup prep', done: false },
    ]
    tasks.forEach((task, i) => {
      ctx.fillStyle = i % 2 === 0 ? '#151520' : '#1a1a2a'
      ctx.fillRect(0, 64 + i * 88, 1024, 80)
      // Checkbox
      ctx.strokeStyle = task.done ? '#22C55E' : '#555'
      ctx.lineWidth = 3
      ctx.strokeRect(40, 88 + i * 88, 30, 30)
      if (task.done) {
        ctx.fillStyle = '#22C55E'
        ctx.fillRect(46, 94 + i * 88, 18, 18)
      }
      ctx.fillStyle = task.done ? '#888' : '#e8e8ff'
      ctx.font = '14px monospace'
      ctx.fillText(task.text, 90, 110 + i * 88)
    })
  },

  petra: (ctx, t, agent) => {
    // Finance Q1 Report
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, 1024, 640)
    // Header
    ctx.fillStyle = '#EAB308'
    ctx.fillRect(0, 0, 1024, 52)
    ctx.fillStyle = '#000'
    ctx.font = 'bold 18px monospace'
    ctx.fillText('FINANCE \u2014 Q1 REPORT', 20, 34)
    // Spreadsheet header
    const cols = ['Item', 'Budget', 'Actual', 'Var']
    cols.forEach((c, i) => {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(20 + i * 248, 68, 236, 48)
      ctx.fillStyle = '#EAB308'
      ctx.font = 'bold 14px monospace'
      ctx.fillText(c, 36 + i * 248, 98)
    })
    // Rows
    const rows = [
      ['Payroll', '$48,200', '$47,900', '+$300'],
      ['Supplies', '$3,500', '$4,100', '-$600'],
      ['Rent', '$12,000', '$12,000', '$0'],
      ['Marketing', '$8,000', '$7,200', '+$800'],
      ['Tech', '$5,500', '$6,800', '-$1,300'],
    ]
    rows.forEach((row, i) => {
      row.forEach((cell, j) => {
        ctx.fillStyle = i % 2 === 0 ? '#151520' : '#1a1a2a'
        ctx.fillRect(20 + j * 248, 120 + i * 72, 236, 64)
        const isNeg = cell.startsWith('-')
        ctx.fillStyle = j === 3 ? (isNeg ? '#ff453a' : '#22C55E') : '#ccc'
        ctx.font = '14px monospace'
        ctx.fillText(cell, 36 + j * 248, 160 + i * 72)
      })
    })
    // Total row
    ctx.fillStyle = '#EAB308'
    ctx.fillRect(20, 120 + 5 * 72, 992, 4)
    ctx.fillStyle = '#EAB308'
    ctx.font = 'bold 14px monospace'
    ctx.fillText('TOTAL', 36, 150 + 5 * 72)
    ctx.fillText('$77,200', 36 + 248, 150 + 5 * 72)
    ctx.fillText('$78,000', 36 + 496, 150 + 5 * 72)
    ctx.fillStyle = '#ff453a'
    ctx.fillText('-$800', 36 + 744, 150 + 5 * 72)
  },

  lex: (ctx, t, agent) => {
    // Contract Review
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, 1024, 640)
    // Header
    ctx.fillStyle = '#6366F1'
    ctx.fillRect(0, 0, 1024, 52)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 18px monospace'
    ctx.fillText('CONTRACT REVIEW', 20, 34)
    // Document area with cream background
    ctx.fillStyle = '#f0f0e8'
    ctx.fillRect(120, 72, 784, 540)
    ctx.fillStyle = '#222'
    ctx.font = 'bold 22px serif'
    ctx.fillText('SERVICE AGREEMENT', 320, 120)
    ctx.font = '14px serif'
    const legalText = [
      'This Agreement is entered into as of',
      'the date last signed below, between',
      'SHIFT HQ ("Company") and the Client.',
      '',
      'SECTION 1: SCOPE OF SERVICES',
      'The Company shall provide virtual',
      'office management and AI-powered',
      'operational support as described in',
      'Exhibit A attached hereto.',
      '',
      'SECTION 2: COMPENSATION',
      'Client agrees to pay the fees set',
      'forth in Schedule B, payable monthly.',
      '',
      'SECTION 3: TERM',
      'This Agreement shall commence on the',
      'Effective Date and continue for an',
      'initial term of twelve (12) months.',
    ]
    legalText.forEach((line, i) => {
      ctx.fillStyle = '#222'
      if (line.startsWith('SECTION')) {
        ctx.font = 'bold 14px serif'
      } else {
        ctx.font = '14px serif'
      }
      ctx.fillText(line, 160, 160 + i * 28)
    })
    // Highlight line
    if (Math.sin(t * 0.5) > 0) {
      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)'
      ctx.fillRect(150, 290, 700, 28)
    }
  },

  bruno: (ctx, t, agent) => {
    // Command Center
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, 1024, 640)
    // Header
    ctx.fillStyle = '#FF0040'
    ctx.fillRect(0, 0, 1024, 52)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 18px monospace'
    ctx.fillText('SHIFT HQ \u2014 COMMAND CENTER', 20, 34)
    // Agent status cards — 3x3 grid
    const agentNames = ['Kim', 'Dev', 'Marco', 'Zara', 'Riley', 'Dante', 'Sam', 'Petra', 'Lex']
    const agentColors = ['#7B5CE6', '#00BCD4', '#FF6B35', '#F59E0B', '#22C55E', '#EC4899', '#94A3B8', '#EAB308', '#6366F1']
    agentNames.forEach((name, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(20 + col * 330, 68 + row * 184, 310, 168)
      // Color accent bar at top of card
      ctx.fillStyle = agentColors[i]
      ctx.fillRect(20 + col * 330, 68 + row * 184, 310, 6)
      // Status dot
      ctx.fillStyle = agentColors[i]
      ctx.beginPath()
      ctx.arc(50 + col * 330, 104 + row * 184, 10, 0, Math.PI * 2)
      ctx.fill()
      // Agent name
      ctx.fillStyle = '#e8e8ff'
      ctx.font = 'bold 18px monospace'
      ctx.fillText(name, 72 + col * 330, 110 + row * 184)
      // Status text
      ctx.fillStyle = '#888'
      ctx.font = '14px monospace'
      const status = Math.sin(t * 0.3 + i) > 0.3 ? 'working' : 'idle'
      ctx.fillText(status, 72 + col * 330, 138 + row * 184)
      // Activity bar
      const barW = 120 + Math.sin(t * 0.2 + i * 1.5) * 60
      ctx.fillStyle = agentColors[i] + '44'
      ctx.fillRect(40 + col * 330, 160 + row * 184, 270, 14)
      ctx.fillStyle = agentColors[i]
      ctx.fillRect(40 + col * 330, 160 + row * 184, barW, 14)
      // Task count
      ctx.fillStyle = '#666'
      ctx.font = '12px monospace'
      const taskCount = Math.floor(3 + Math.sin(t * 0.1 + i) * 2)
      ctx.fillText(`${taskCount} tasks`, 40 + col * 330, 200 + row * 184)
    })
  },
}

// Monitor positions — matching where screens are in Furniture.jsx
// Single monitor per desk
const MONITOR_CONFIGS = {
  kim:   { pos: [-18, 1.2, -6.284], size: [0.90, 0.58] },
  dev:   { pos: [-6, 1.2, -6.284],  size: [0.90, 0.58] },
  marco: { pos: [3, 1.2, -6.284],   size: [0.90, 0.58] },
  zara:  { pos: [12, 1.2, -6.284],  size: [0.90, 0.58] },
  sam:   { pos: [19, 1.2, -6.284],  size: [0.90, 0.58] },
  petra: { pos: [-18, 1.2, 2.716],  size: [0.90, 0.58] },
  lex:   { pos: [-6, 1.2, 2.716],   size: [0.90, 0.58] },
  riley: { pos: [3, 1.2, 2.716],    size: [0.90, 0.58] },
  dante: { pos: [7, 1.2, 2.716],    size: [0.90, 0.58] },
  bruno: { pos: [0, 1.65, -0.28],   size: [1.12, 0.47] },
}

function LiveScreen({ agentId, config }) {
  const canvasRef = useRef(document.createElement('canvas'))
  const textureRef = useRef()
  const lastDraw = useRef(0)

  const texture = useMemo(() => {
    const canvas = canvasRef.current
    canvas.width = SCREEN_W
    canvas.height = SCREEN_H
    // Draw immediately
    const ctx = canvas.getContext('2d')
    const drawFn = drawFunctions[agentId]
    if (drawFn) drawFn(ctx, 0, null)
    const tex = new THREE.CanvasTexture(canvas)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    textureRef.current = tex
    return tex
  }, [agentId])

  useFrame((state) => {
    const now = state.clock.elapsedTime
    // Update every 5 seconds
    if (now - lastDraw.current < 5.0) return
    lastDraw.current = now

    const agent = useStore.getState().agents[agentId]
    const drawFn = drawFunctions[agentId]
    if (!drawFn) return

    const ctx = canvasRef.current.getContext('2d')
    drawFn(ctx, now, agent)
    if (textureRef.current) textureRef.current.needsUpdate = true
  })

  const handleMonitorClick = (e) => {
    e.stopPropagation()
    const { cameraMode, monitorZoomed, setMonitorZoomed } = useStore.getState()
    if (cameraMode === 'desk') {
      setMonitorZoomed(!monitorZoomed)
    }
  }

  return (
    <mesh position={config.pos} onClick={handleMonitorClick}>
      <planeGeometry args={config.size} />
      <meshStandardMaterial
        map={texture}
        emissiveMap={texture}
        emissive="#ffffff"
        emissiveIntensity={0.9}
        roughness={0}
        metalness={0}
        toneMapped={false}
      />
    </mesh>
  )
}

export default function AgentScreen() {
  return (
    <group>
      {Object.entries(MONITOR_CONFIGS).map(([id, config]) => (
        <LiveScreen key={id} agentId={id} config={config} />
      ))}
    </group>
  )
}
