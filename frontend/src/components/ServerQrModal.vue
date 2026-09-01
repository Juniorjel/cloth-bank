<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal qr-poster-modal">
      <div class="modal-head-between">
        <div>
          <h3 class="modal-title mb-0">📱 Mobile App Server Connection</h3>
          <p class="text-muted small mb-0">Scan with Cloth Bank mobile app or download printable poster.</p>
        </div>
        <button class="close-x-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Server Host / IP Configuration -->
      <div class="server-config-card my-3">
        <label class="font-bold text-main mb-1 d-block" style="font-size:12px">Server API Endpoint URL (VUE_APP_API_URL)</label>
        <div class="d-flex gap-2">
          <input
            v-model="serverUrl"
            class="form-control font-bold"
            :placeholder="defaultApiUrl"
            @input="generateQr"
          />
          <button class="btn btn-secondary btn-sm" @click="resetToConfiguredApi" title="Reset to VUE_APP_API_URL">
            Reset to .env API
          </button>
        </div>
        <div class="d-flex gap-2 mt-2 flex-wrap" v-if="defaultApiUrl">
          <button class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size:11.5px" @click="setPreset(defaultApiUrl)">
            🌐 Use VUE_APP_API_URL: {{ defaultApiUrl }}
          </button>
        </div>
        <small class="text-muted d-block mt-1">
          💡 Configured in <code>.env</code> as <code>VUE_APP_API_URL</code>.
        </small>
      </div>

      <!-- Visual Poster Card (Pure HTML/CSS - 100% Reliable Render) -->
      <div class="poster-card-frame" ref="posterFrame">
        <div class="poster-header">
          <div class="poster-badge">🧺 CLOTH BANK</div>
          <div class="poster-subtitle">Community Clothing Donation Platform</div>
        </div>

        <div class="poster-body">
          <h4 class="poster-heading">Scan to Connect Mobile App</h4>
          <p class="poster-desc">Open Cloth Bank Flutter App & scan to connect</p>

          <!-- Direct Base64 QR Image Render -->
          <div class="qr-image-wrapper">
            <img
              v-if="qrDataUrl"
              :src="qrDataUrl"
              class="qr-main-img"
              alt="Cloth Bank Server QR Code"
            />
            <div v-else class="qr-loading-placeholder">
              <div class="spinner-sm"></div>
              <span>Generating QR…</span>
            </div>
          </div>

          <div class="poster-url-pill">
            <code>{{ serverUrl || 'http://192.168.1.68:8000/api' }}</code>
          </div>

          <div class="poster-features-row">
            <span>🎁 Donate Clothes</span>
            <span>•</span>
            <span>🚚 Field Driver</span>
            <span>•</span>
            <span>👑 Admin</span>
          </div>
        </div>
      </div>

      <!-- Hidden canvas for generating high-res downloadable poster -->
      <canvas ref="downloadCanvas" style="display: none;"></canvas>

      <!-- Action Buttons -->
      <div class="modal-footer justify-content-between mt-3">
        <button class="btn btn-secondary" @click="$emit('close')">Close</button>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" @click="downloadQrOnly">
            🖼️ Download QR Only
          </button>
          <button class="btn btn-primary" @click="downloadPoster">
            📥 Download Full Poster (PNG)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'ServerQrModal',
  data() {
    const envUrl = process.env.VUE_APP_API_URL || 'http://192.168.1.68:8000/api'
    return {
      defaultApiUrl: envUrl,
      serverUrl: envUrl,
      qrDataUrl: '',
    }
  },
  mounted() {
    this.resetToConfiguredApi()
  },
  methods: {
    setPreset(url) {
      this.serverUrl = url
      this.generateQr()
    },
    resetToConfiguredApi() {
      this.serverUrl = this.defaultApiUrl || process.env.VUE_APP_API_URL || 'http://192.168.1.68:8000/api'
      this.generateQr()
    },
    async generateQr() {
      const targetUrl = (this.serverUrl && this.serverUrl.trim().length > 0)
        ? this.serverUrl.trim()
        : 'http://192.168.1.68:8000/api'

      try {
        const url = await QRCode.toDataURL(targetUrl, {
          width: 320,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        })
        this.qrDataUrl = url
      } catch (err) {
        console.error('QR code generation failed:', err)
      }
    },
    downloadQrOnly() {
      if (!this.qrDataUrl) return
      const link = document.createElement('a')
      link.download = 'ClothBank_Server_QR.png'
      link.href = this.qrDataUrl
      link.click()
    },
    async downloadPoster() {
      const canvas = this.$refs.downloadCanvas
      if (!canvas || !this.qrDataUrl) return
      const ctx = canvas.getContext('2d')
      
      canvas.width = 420
      canvas.height = 560

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 560)
      bgGrad.addColorStop(0, '#0f172a')
      bgGrad.addColorStop(1, '#1e293b')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, 420, 560)

      // 2. Header
      ctx.fillStyle = '#4f46e5'
      ctx.fillRect(0, 0, 420, 95)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 20px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🧺 CLOTH BANK', 210, 40)

      ctx.fillStyle = '#c7d2fe'
      ctx.font = '500 12.5px Inter, sans-serif'
      ctx.fillText('Community Clothing Donation Platform', 210, 68)

      // 3. White Card
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

      // 4. Draw QR image onto canvas
      const img = new Image()
      img.onload = () => {
        ctx.fillStyle = '#f8fafc'
        ctx.fillRect(100, 175, 220, 220)
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 1.5
        ctx.strokeRect(100, 175, 220, 220)
        
        ctx.drawImage(img, 110, 185, 200, 200)

        // URL
        ctx.fillStyle = '#4f46e5'
        ctx.font = 'bold 11.5px monospace'
        ctx.fillText(this.serverUrl, 210, 426)

        // Features
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

        const link = document.createElement('a')
        link.download = 'ClothBank_Server_QR_Poster.png'
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
      img.src = this.qrDataUrl
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

/* ── Poster Card Frame (Pure HTML/CSS) ── */
.poster-card-frame {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.35);
  border: 1px solid #334155;
  text-align: center;
}
.poster-header {
  background: #4f46e5;
  padding: 16px 20px;
  color: #ffffff;
}
.poster-badge {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: 0.5px;
}
.poster-subtitle {
  font-size: 12px;
  color: #c7d2fe;
  margin-top: 2px;
}
.poster-body {
  background: #ffffff;
  margin: 12px 14px 14px 14px;
  border-radius: 14px;
  padding: 16px 14px;
}
.poster-heading {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15.5px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 2px 0;
}
.poster-desc {
  font-size: 11.5px;
  color: #64748b;
  margin: 0 0 12px 0;
}

.qr-image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px auto;
  width: 210px;
  height: 210px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}
.qr-main-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.qr-loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}
.poster-url-pill {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 12px;
  display: inline-block;
  margin-bottom: 10px;
}
.poster-url-pill code {
  color: #4f46e5;
  font-weight: 700;
  font-size: 12px;
}
.poster-features-row {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
