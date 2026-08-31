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
      serverUrl: '',
    }
  },
  mounted() {
    this.resetToLocalIp()
  },
  methods: {
    resetToLocalIp() {
      const hostname = window.location.hostname
      // If localhost or 127.0.0.1, use default Wi-Fi IP or hostname
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        this.serverUrl = 'http://192.168.1.68:8000/api'
      } else {
        this.serverUrl = `http://${hostname}:8000/api`
      }
      this.$nextTick(() => this.generatePoster())
    },
    async generatePoster() {
      const canvas = this.$refs.posterCanvas
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      
      // High-res poster dimensions (400 x 540)
      canvas.width = 400
      canvas.height = 540

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 540)
      bgGrad.addColorStop(0, '#0f172a')
      bgGrad.addColorStop(1, '#1e293b')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, 400, 540)

      // 2. Header Banner
      ctx.fillStyle = '#4f46e5'
      ctx.fillRect(0, 0, 400, 100)

      // Brand Icon & Title
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 22px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🧺 CLOTH BANK', 200, 44)

      ctx.fillStyle = '#c7d2fe'
      ctx.font = '500 13px Inter, sans-serif'
      ctx.fillText('Community Clothing Donation Platform', 200, 70)

      // 3. Instruction Card (White surface)
      ctx.fillStyle = '#ffffff'
      if (ctx.roundRect) {
        ctx.roundRect(25, 115, 350, 400, 16)
        ctx.fill()
      } else {
        ctx.fillRect(25, 115, 350, 400)
      }

      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 16px Inter, sans-serif'
      ctx.fillText('Scan to Connect Mobile App', 200, 145)

      ctx.fillStyle = '#64748b'
      ctx.font = '11.5px Inter, sans-serif'
      ctx.fillText('Open Cloth Bank Flutter App & scan to connect', 200, 166)

      // 4. Generate QR Code completely offline via local library
      try {
        const qrDataUrl = await QRCode.toDataURL(this.serverUrl || 'http://192.168.1.68:8000/api', {
          width: 220,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        })

        const img = new Image()
        img.onload = () => {
          // Draw frame for QR
          ctx.fillStyle = '#f8fafc'
          ctx.fillRect(90, 185, 220, 220)
          ctx.strokeStyle = '#e2e8f0'
          ctx.lineWidth = 1.5
          ctx.strokeRect(90, 185, 220, 220)
          
          ctx.drawImage(img, 100, 195, 200, 200)

          // Server URL text below QR
          ctx.fillStyle = '#4f46e5'
          ctx.font = 'bold 11px monospace'
          ctx.fillText(this.serverUrl, 200, 430)

          // Features pill
          ctx.fillStyle = '#ecfdf5'
          if (ctx.roundRect) {
            ctx.roundRect(40, 452, 320, 42, 10)
            ctx.fill()
          } else {
            ctx.fillRect(40, 452, 320, 42)
          }

          ctx.fillStyle = '#065f46'
          ctx.font = '600 11.5px Inter, sans-serif'
          ctx.fillText('🎁 Donate Clothes  •  🚚 Field Driver  •  👑 Admin', 200, 478)
        }
        img.src = qrDataUrl
      } catch (err) {
        console.error('Local QR generation error:', err)
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
