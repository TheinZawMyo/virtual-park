import { useEffect, useRef } from 'react'
import {
  BENCHES,
  POND,
  FOUNTAIN,
  HOTSPOTS,
  LAMPS,
  PAGODA,
  PARK_RADIUS,
  PATH_HALF,
  PLAZA_RADIUS,
  TREES,
} from '../../game/layout'
import { game } from '../../game/state'

const SIZE = 320

export default function Minimap({ showMarkers = true }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr
    ctx.scale(dpr, dpr)

    const c = SIZE / 2
    const scale = (c - 28) / PARK_RADIUS
    const mx = (x) => c + x * scale
    const my = (z) => c + z * scale

    let raf
    let previous = 0

    const draw = (now) => {
      raf = requestAnimationFrame(draw)
      if (now - previous < 32) return
      previous = now

      ctx.clearRect(0, 0, SIZE, SIZE)

      const grass = ctx.createRadialGradient(c, c, 10, c, c, PARK_RADIUS * scale)
      grass.addColorStop(0, '#3c6234')
      grass.addColorStop(1, '#28461f')
      ctx.fillStyle = grass
      ctx.beginPath()
      ctx.arc(c, c, PARK_RADIUS * scale, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = 'rgba(255,255,255,0.18)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(c, c, PARK_RADIUS * scale, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = '#b7a57f'
      ctx.fillRect(mx(-PATH_HALF), my(-PARK_RADIUS), PATH_HALF * 2 * scale, PARK_RADIUS * 2 * scale)
      ctx.fillRect(mx(-PARK_RADIUS), my(-PATH_HALF), PARK_RADIUS * 2 * scale, PATH_HALF * 2 * scale)

      ctx.fillStyle = '#cab895'
      ctx.beginPath()
      ctx.arc(c, c, PLAZA_RADIUS * scale, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#a7a294'
      ctx.beginPath()
      ctx.arc(mx(FOUNTAIN.x), my(FOUNTAIN.z), 2.6 * scale, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#6fb1c2'
      ctx.beginPath()
      ctx.arc(mx(FOUNTAIN.x), my(FOUNTAIN.z), 1.9 * scale, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#3f8298'
      ctx.beginPath()
      ctx.arc(mx(POND.x), my(POND.z), POND.r * scale, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(214, 223, 198, 0.5)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = '#c9a227'
      ctx.beginPath()
      ctx.arc(mx(PAGODA.x), my(PAGODA.z), PAGODA.r * scale, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(247, 221, 138, 0.85)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = '#f6dc72'
      ctx.beginPath()
      ctx.arc(mx(PAGODA.x), my(PAGODA.z), 2.7, 0, Math.PI * 2)
      ctx.fill()

      TREES.forEach((tree) => {
        ctx.fillStyle = tree.type === 'pine' ? '#2b5527' : '#35652c'
        ctx.beginPath()
        ctx.arc(mx(tree.x), my(tree.z), 1.6 + tree.s * 0.9, 0, Math.PI * 2)
        ctx.fill()
      })

      LAMPS.forEach((lamp) => {
        ctx.fillStyle = '#e8c97f'
        ctx.beginPath()
        ctx.arc(mx(lamp.x), my(lamp.z), 1.4, 0, Math.PI * 2)
        ctx.fill()
      })

      BENCHES.forEach((bench) => {
        ctx.save()
        ctx.translate(mx(bench.x), my(bench.z))
        ctx.rotate(-bench.rotation)
        ctx.fillStyle = '#d0a06b'
        ctx.fillRect(-4.2, -1.7, 8.4, 3.4)
        ctx.restore()
      })

      if (showMarkers) {
        const pulse = 0.5 + 0.5 * Math.sin(now / 420)
        HOTSPOTS.forEach((spot) => {
          ctx.fillStyle = `rgba(231, 246, 142, ${0.45 + pulse * 0.4})`
          ctx.beginPath()
          ctx.arc(mx(spot.position.x), my(spot.position.z), 2.4 + pulse * 1.1, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      const px = mx(game.position.x)
      const py = my(game.position.z)
      const look = Math.atan2(-Math.cos(game.cameraYaw), -Math.sin(game.cameraYaw))
      ctx.fillStyle = 'rgba(212, 240, 106, 0.13)'
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.arc(px, py, 34, look - 0.42, look + 0.42)
      ctx.closePath()
      ctx.fill()

      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(Math.atan2(Math.cos(game.playerYaw), Math.sin(game.playerYaw)))
      ctx.beginPath()
      ctx.moveTo(7, 0)
      ctx.lineTo(-4.5, 4.5)
      ctx.lineTo(-2, 0)
      ctx.lineTo(-4.5, -4.5)
      ctx.closePath()
      ctx.fillStyle = '#e7f68e'
      ctx.fill()
      ctx.strokeStyle = 'rgba(10, 18, 13, 0.9)'
      ctx.lineWidth = 1.4
      ctx.stroke()
      ctx.restore()

      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.font = '600 10px ui-sans-serif, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('N', c, 15)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [showMarkers])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%' }}
      className="block rounded-xl"
      aria-label="Park minimap"
    />
  )
}
