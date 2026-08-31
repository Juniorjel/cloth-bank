<template>
  <div class="agent-pickups-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2>🚚 My Assigned Pickups</h2>
        <p class="text-muted">Pick up donated clothes from donors and deliver them to the distribution center.</p>
      </div>
      <div class="badge badge-assigned font-bold" style="font-size:13px; padding:6px 14px">
        {{ donations.length }} Active Tasks
      </div>
    </div>

    <div v-if="loading" class="spinner-wrap">
      <div class="spinner"></div>
      <p>Loading assigned pickups…</p>
    </div>

    <div v-else>
      <!-- Empty state -->
      <div v-if="!donations.length" class="card text-center empty-card">
        <div class="empty-icon">📭</div>
        <h3>No Assigned Pickups</h3>
        <p class="text-muted">You have completed all your tasks or no new pickups have been assigned yet.</p>
      </div>

      <!-- Pickups Task Cards -->
      <div class="pickups-list">
        <div v-for="d in donations" :key="d.id" class="card pickup-task-card mb-4">
          <div class="task-head">
            <div class="task-id-badge">
              <span class="task-id">Task #{{ d.id }}</span>
              <span :class="'badge badge-' + d.status">
                ● {{ d.status.replace('_',' ') }}
              </span>
            </div>
            <div class="task-date text-muted">
              📅 {{ formatDate(d.created_at) }}
            </div>
          </div>

          <!-- Donor & Route Information -->
          <div class="task-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-icon">👤</span>
                <div>
                  <span class="info-title">{{ d.donor_name }}</span>
                  <a :href="'tel:' + d.donor_phone" class="phone-action-btn">
                    📞 Call Donor ({{ d.donor_phone }})
                  </a>
                </div>
              </div>

              <div class="info-item">
                <span class="info-icon">📢</span>
                <div>
                  <span class="info-label">Campaign</span>
                  <span class="info-val font-semibold">{{ d.campaign ? d.campaign.title : '—' }}</span>
                </div>
              </div>

              <div class="info-item" v-if="d.address">
                <span class="info-icon">📍</span>
                <div>
                  <span class="info-label">Address</span>
                  <span class="info-val">{{ d.address }}</span>
                </div>
              </div>

              <div class="info-item" v-if="d.latitude">
                <span class="info-icon">🗺</span>
                <div>
                  <span class="info-label">GPS Navigation</span>
                  <a
                    :href="`https://maps.google.com/?q=${d.latitude},${d.longitude}`"
                    target="_blank"
                    class="nav-map-btn"
                  >
                    🗺 Open Route in Google Maps ↗
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Items Checklist -->
          <div class="task-items-section">
            <div class="items-header">
              <span class="font-bold text-main" style="font-size:13.5px">👕 CLOTHES CHECKLIST</span>
              <span class="badge badge-assigned">{{ totalQuantity(d) }} total pieces</span>
            </div>

            <div class="task-items-list" v-if="d.items && d.items.length">
              <div v-for="item in d.items" :key="item.id" class="task-item-row">
                <div class="task-item-left">
                  <span class="check-box">✓</span>
                  <strong class="item-name">{{ item.cloth_type ? item.cloth_type.name : 'Clothes' }}</strong>
                  <span class="qty-pill">{{ item.quantity }} pcs</span>
                  <span v-if="item.note" class="item-note-text">— {{ item.note }}</span>
                </div>

                <!-- Photos -->
                <div v-if="item.images && item.images.length" class="item-thumb-list">
                  <img
                    v-for="img in item.images"
                    :key="img.id"
                    :src="img.url"
                    class="item-thumb"
                    @click="lightboxUrl = img.url"
                    :alt="'Item photo'"
                    title="Click to zoom"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Action Progression Buttons -->
          <div class="task-actions-bar">
            <button
              v-if="d.status === 'assigned'"
              class="btn btn-warning btn-lg action-step-btn"
              :disabled="actionLoading === d.id"
              @click="markPickedUp(d)"
            >
              <span v-if="actionLoading === d.id" class="spinner-sm"></span>
              <span v-else>📦 Mark as Picked Up from Donor</span>
            </button>

            <button
              v-if="d.status === 'picked_up'"
              class="btn btn-success btn-lg action-step-btn"
              :disabled="actionLoading === d.id"
              @click="markDelivered(d)"
            >
              <span v-if="actionLoading === d.id" class="spinner-sm"></span>
              <span v-else>🏢 Mark as Delivered to Warehouse</span>
            </button>

            <div v-if="d.status === 'delivered'" class="delivered-banner">
              <span>✅ Delivered to Warehouse</span>
              <small class="text-muted">Awaiting Admin Verification & Certificate Dispatch</small>
            </div>
          </div>

          <div v-if="successMsg[d.id]" class="alert alert-success mt-3">
            <span>✓</span> {{ successMsg[d.id] }}
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div v-if="lightboxUrl" class="lightbox-backdrop" @click="lightboxUrl = null">
      <div class="lightbox-dialog" @click.stop>
        <img :src="lightboxUrl" class="lightbox-img" alt="Enlarged photo" />
        <button class="lightbox-close" @click="lightboxUrl = null">✕</button>
      </div>
    </div>
  </div>
</template>

<script>
import donationApi from '../../api/donations'

export default {
  name: 'AgentPickups',
  data() {
    return {
      donations:     [],
      loading:       true,
      actionLoading: null,
      successMsg:    {},
      lightboxUrl:   null,
    }
  },
  async created() {
    await this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const res      = await donationApi.getAgentPickups()
        this.donations = res.data
      } finally {
        this.loading = false
      }
    },
    totalQuantity(donation) {
      if (!donation.items) return 0
      return donation.items.reduce((sum, i) => sum + (i.quantity || 0), 0)
    },
    async markPickedUp(donation) {
      this.actionLoading = donation.id
      try {
        const res = await donationApi.markPickedUp(donation.id)
        const idx = this.donations.findIndex(d => d.id === donation.id)
        this.donations.splice(idx, 1, res.data)
        this.$set(this.successMsg, donation.id, 'Status updated: Picked Up!')
        setTimeout(() => this.$set(this.successMsg, donation.id, ''), 3500)
      } finally {
        this.actionLoading = null
      }
    },
    async markDelivered(donation) {
      this.actionLoading = donation.id
      try {
        const res = await donationApi.markDelivered(donation.id)
        const idx = this.donations.findIndex(d => d.id === donation.id)
        this.donations.splice(idx, 1, res.data)
        this.$set(this.successMsg, donation.id, 'Status updated: Delivered to Warehouse!')
        setTimeout(() => this.$set(this.successMsg, donation.id, ''), 3500)
      } finally {
        this.actionLoading = null
      }
    },
    formatDate(d) {
      if (!d) return ''
      return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }
  }
}
</script>

<style scoped>
.agent-pickups-page {
  max-width: 760px;
  margin: 0 auto;
}

.empty-card {
  padding: 56px 24px;
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.pickup-task-card {
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  border: 1.5px solid #e2e8f0;
}

.task-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 16px;
}
.task-id-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}
.task-id {
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}
.task-date {
  font-size: 12px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13.5px;
}
.info-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}
.info-label {
  display: block;
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
}
.info-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  display: block;
}
.phone-action-btn {
  display: inline-block;
  color: #0284c7;
  font-weight: 600;
  font-size: 13px;
  margin-top: 2px;
  text-decoration: none;
}
.phone-action-btn:hover {
  text-decoration: underline;
}
.nav-map-btn {
  display: inline-block;
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  margin-top: 2px;
}
.nav-map-btn:hover {
  background: #d1fae5;
}

/* ── Items Checklist ── */
.task-items-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin: 18px 0;
}
.items-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.task-items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.task-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.task-item-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.check-box {
  width: 18px;
  height: 18px;
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}
.qty-pill {
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}
.item-note-text {
  font-size: 12px;
  color: #64748b;
}

.item-thumb-list {
  display: flex;
  gap: 6px;
}
.item-thumb {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  object-fit: cover;
  cursor: zoom-in;
}

/* Action Bar */
.task-actions-bar {
  margin-top: 14px;
}
.action-step-btn {
  width: 100%;
  padding: 12px;
  font-size: 14.5px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.1);
}
.delivered-banner {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  padding: 14px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-weight: 700;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

/* Lightbox */
.lightbox-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}
.lightbox-dialog {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}
.lightbox-img {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  object-fit: contain;
}
.lightbox-close {
  position: absolute;
  top: -16px;
  right: -16px;
  background: #ffffff;
  color: #0f172a;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
</style>
