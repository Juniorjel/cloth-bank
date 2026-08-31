<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal qr-poster-modal">
      <div class="modal-head-between">
        <div>
          <h3 class="modal-title mb-0">📱 Mobile App Server QR Poster</h3>
          <p class="text-muted small mb-0">Scan with Cloth Bank mobile app or download printable poster.</p>
        </div>
        <button class="close-x-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Server Host / IP Configuration -->
      <div class="server-config-card my-3">
        <label class="font-bold text-main mb-1 d-block" style="font-size:12px">Server API Endpoint URL</label>
        <div class="d-flex gap-2">
          <input
            v-model="serverUrl"
            class="form-control font-bold"
            placeholder="http://192.168.1.68:8000/api"
            @input="generatePoster"
          />
          <button class="btn btn-secondary btn-sm" @click="resetToLocalIp" title="Auto-detect Host">
            Auto Detect
          </button>
        </div>
        <small class="text-muted d-block mt-1">
          💡 For mobile devices on Wi-Fi, ensure your phone is connected to the same Wi-Fi network.
        </small>
      </div>

      <!-- Printable Poster Preview Frame -->
      <div class="poster-preview-wrapper">
        <canvas ref="posterCanvas" class="poster-canvas"></canvas>
      </div>

      <!-- Action Buttons -->
      <div class="modal-footer justify-content-between mt-3">
        <button class="btn btn-secondary" @click="$emit('close')">Close</button>
        <button class="btn btn-primary" @click="downloadPosterPng">
          📥 Download Printable Poster (PNG)
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'ServerQrModal',
  data() {
    return {
      serverUrl: 'http://192.168.1.68:8000/api',
    }
  },
  mounted() {
    this.resetToLocalIp()
  },
  methods: {
    resetToLocalIp() {
      const hostname = window.location.hostname
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        this.serverUrl = 'http://192.168.1.68:8000/api'
      } else {
        this.serverUrl = `http://${hostname}:8000/api`
      }
      this.$nextTick(() => {
        this.generatePoster()
      })
    },
    generatePoster() {
      const canvas = this.$refs.posterCanvas
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      
      const targetUrl = (this.serverUrl && this.serverUrl.trim().length > 0)
        ? this.serverUrl.trim()
        : 'http://192.168.1.68:8000/api'

      // High-res poster dimensions (420 x 560)
      canvas.width = 420
      canvas.height = 560

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 560)
      bgGrad.addColorStop(0, '#0f172a')
      bgGrad.addColorStop(1, '#1e293b')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, 420, 560)

      // 2. Header Banner
      ctx.fillStyle = '#4f46e5'
      ctx.fillRect(0, 0, 420, 95)

      // Brand Icon & Title
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 20px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🧺 CLOTH BANK', 210, 40)

      ctx.fillStyle = '#c7d2fe'
      ctx.font = '500 12.5px Inter, sans-serif'
      ctx.fillText('Community Clothing Donation Platform', 210, 68)

      // 3. Instruction Card (White surface)
      ctx.fillStyle = '#ffffff'
      if (ctx.roundRect) {
        ctx.roundRect(25, 110, 370, 425, 16)
        ctx.fill()
      } else {
        ctx.fillRect(25, 110, 370, 425)
      }

      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 16px Inter, sans-serif'
      ctx.fillText('Scan to Connect Mobile App', 210, 140)

      ctx.fillStyle = '#64748b'
      ctx.font = '11.5px Inter, sans-serif'
      ctx.fillText('Open Cloth Bank Flutter App & scan to connect', 210, 160)

      // 4. Synchronous QR Matrix Rendering (100% Reliable, Zero Network Latency)
      try {
        const qr = QRCode.create(targetUrl, { errorCorrectionLevel: 'M' })
        const modules = qr.modules
        const size = modules.size
        const targetQrPx = 200
        const cellSize = Math.floor(targetQrPx / size)
        const actualQrPx = size * cellSize
        const offsetX = Math.floor((targetQrPx - actualQrPx) / 2)
        const startX = 110 + offsetX
        const startY = 180 + offsetX

        // White background box with border
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(95, 170, 230, 230)
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 1.5
        ctx.strokeRect(95, 170, 230, 230)

        // Draw individual black blocks
        ctx.fillStyle = '#0f172a'
        for (let row = 0; row < size; row++) {
          for (let col = 0; col < size; col++) {
            if (modules.get(row, col)) {
              ctx.fillRect(
                startX + col * cellSize,
                startY + row * cellSize,
                cellSize,
                cellSize
              )
            }
          }
        }

        // Server URL text below QR
        ctx.fillStyle = '#4f46e5'
        ctx.font = 'bold 11.5px monospace'
        ctx.fillText(targetUrl, 210, 426)

        // Features pill container
        ctx.fillStyle = '#ecfdf5'
        if (ctx.roundRect) {
          ctx.roundRect(40, 450, 340, 44, 10)
          ctx.fill()
        } else {
          ctx.fillRect(40, 450, 340, 44)
        }

        ctx.fillStyle = '#065f46'
        ctx.font = '600 11.5px Inter, sans-serif'
        ctx.fillText('🎁 Donate Clothes  •  🚚 Field Driver  •  👑 Admin', 210, 477)

      } catch (err) {
        console.error('Synchronous QR generation error:', err)
      }
    },
    downloadPosterPng() {
      const canvas = this.$refs.posterCanvas
      if (!canvas) return
      const link = document.createElement('a')
      link.download = 'ClothBank_Server_QR_Poster.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }
}
</script>

<style scoped>
.qr-poster-modal {
  max-width: 480px;
}
.modal-head-between {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 10px;
}
.close-x-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--text-muted);
}
.server-config-card {
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px;
}
.poster-preview-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a;
  border-radius: var(--radius-lg);
  padding: 14px;
}
.poster-canvas {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
}
</style>
