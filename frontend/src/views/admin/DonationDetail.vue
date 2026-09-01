<template>
  <div class="saas-detail-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <router-link to="/admin/donations" class="back-link">← Donations</router-link>
          <span class="text-muted">/</span>
          <span class="font-bold text-main">Intake #{{ id }}</span>
        </div>
        <p class="text-muted mb-0">Detailed view of donor submission, clothes breakdown, and logistics lifecycle.</p>
      </div>
      <div class="d-flex align-items-center gap-2" v-if="donation">
        <span :class="'badge badge-' + donation.status">
          ● {{ donation.status.replace('_',' ') }}
        </span>
      </div>
    </div>

    <div v-if="loading" class="spinner-wrap">
      <div class="spinner"></div>
      <p>Loading donation record…</p>
    </div>

    <div v-else-if="donation">
      <!-- ── Status Stepper Bar ── -->
      <div class="card stepper-card mb-4">
        <div class="stepper-scroll-wrap">
          <div class="stepper-track">
            <div
              v-for="(step, idx) in timelineSteps"
              :key="step.key"
              class="stepper-step"
              :class="{
                completed: isStepCompleted(step.key),
                active: donation.status === step.key
              }"
            >
              <div class="step-icon-wrap">
                <span v-if="isStepCompleted(step.key) && donation.status !== step.key">✓</span>
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <div class="step-meta">
                <span class="step-label">{{ step.label }}</span>
                <span class="step-time" v-if="getStepTime(step.key)">{{ getStepTime(step.key) }}</span>
              </div>
              <div class="step-line" v-if="idx < timelineSteps.length - 1"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── 2-Column Responsive Layout ── -->
      <div class="row g-4">
        <!-- Left: Donor Info & Clothes Breakdown -->
        <div class="col-12 col-lg-7">
          <!-- Donor Information Card -->
          <div class="card mb-4">
            <h3 class="card-title mb-3">Donor & Pickup Info</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Full Name</span>
                <span class="info-value font-medium">{{ donation.donor_name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone Number</span>
                <a :href="'tel:' + donation.donor_phone" class="info-value link-primary">
                  📞 {{ donation.donor_phone }}
                </a>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ donation.donor_email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Campaign</span>
                <span class="info-value">{{ donation.campaign ? donation.campaign.title : '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Collection Method</span>
                <span class="info-value">
                  <span :class="donation.collection_type === 'pickup' ? 'badge badge-assigned' : 'badge badge-verified'">
                    {{ donation.collection_type === 'pickup' ? 'Doorstep Pickup' : 'Drop-off' }}
                  </span>
                </span>
              </div>
              <div class="info-item" v-if="donation.address">
                <span class="info-label">Address</span>
                <span class="info-value">{{ donation.address }}</span>
              </div>
              <div class="info-item" v-if="donation.latitude">
                <span class="info-label">GPS Coordinates</span>
                <span class="info-value">
                  {{ Number(donation.latitude).toFixed(4) }}, {{ Number(donation.longitude).toFixed(4) }}
                  <a
                    :href="`https://maps.google.com/?q=${donation.latitude},${donation.longitude}`"
                    target="_blank"
                    class="btn btn-secondary btn-sm ms-2 py-0 px-2"
                  >
                    Open Map ↗
                  </a>
                </span>
              </div>
            </div>
          </div>

          <!-- Items Breakdown Card -->
          <div class="card mb-0">
            <div class="card-head-between mb-3">
              <h3 class="card-title">Donated Items</h3>
              <span class="badge badge-assigned">{{ totalQuantity }} Total Pieces</span>
            </div>
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Declared Qty</th>
                    <th>Notes</th>
                    <th>Photos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in donation.items" :key="item.id">
                    <td>
                      <span class="font-medium text-main">{{ item.cloth_type ? item.cloth_type.name : 'Clothes' }}</span>
                    </td>
                    <td>
                      <span class="font-semibold">{{ item.quantity }} pcs</span>
                    </td>
                    <td>
                      <span class="text-muted" style="font-size:12px">{{ item.note || '—' }}</span>
                    </td>
                    <td>
                      <div v-if="item.images && item.images.length" class="d-flex gap-1">
                        <img
                          v-for="img in item.images"
                          :key="img.id"
                          :src="getImageUrl(img.url)"
                          class="item-img-thumb"
                          @click="lightboxUrl = getImageUrl(img.url)"
                          @error="onImageError"
                          title="Click to view full size"
                        />
                      </div>
                      <span v-else class="text-muted" style="font-size:12px">None</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Actions & Fulfillment -->
        <div class="col-12 col-lg-5">
          <!-- 1. Dispatch Agent -->
          <div class="card mb-4" v-if="['pending', 'assigned'].includes(donation.status)">
            <h3 class="card-title mb-2">Dispatch Field Driver</h3>
            <p class="text-muted mb-3" style="font-size:12.5px">
              Assign an active logistics driver to execute pickup from donor's location.
            </p>

            <div v-if="alertMsg" class="alert alert-success">{{ alertMsg }}</div>

            <div class="form-group">
              <label>Select Driver</label>
              <select v-model="selectedAgent" class="form-control">
                <option value="">— Select Driver —</option>
                <option v-for="a in agents" :key="a.id" :value="a.id">
                  {{ a.name }} {{ a.phone ? '(' + a.phone + ')' : '' }}
                </option>
              </select>
            </div>

            <button
              class="btn btn-primary w-100"
              :disabled="!selectedAgent || assigning"
              @click="assign"
            >
              {{ assigning ? 'Assigning…' : 'Confirm Assignment' }}
            </button>
          </div>

          <!-- 2. Assigned Driver Info -->
          <div class="card mb-4" v-if="donation.agent">
            <h3 class="card-title mb-3">Assigned Driver</h3>
            <div class="agent-strip">
              <div class="agent-avatar">
                {{ donation.agent.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="font-semibold text-main">{{ donation.agent.name }}</div>
                <div class="text-muted" style="font-size:12px" v-if="donation.agent.phone">📞 {{ donation.agent.phone }}</div>
              </div>
            </div>

            <div class="mt-3 text-muted" style="font-size:12px" v-if="donation.picked_up_at || donation.delivered_at">
              <div class="d-flex justify-content-between py-1" v-if="donation.picked_up_at">
                <span>Picked Up:</span>
                <span class="font-medium text-main">{{ formatDate(donation.picked_up_at) }}</span>
              </div>
              <div class="d-flex justify-content-between py-1" v-if="donation.delivered_at">
                <span>Delivered to Hub:</span>
                <span class="font-medium text-main">{{ formatDate(donation.delivered_at) }}</span>
              </div>
            </div>
          </div>

          <!-- 3. Verify & Confirm Intake -->
          <div class="card mb-4" v-if="donation.status === 'delivered'">
            <h3 class="card-title mb-2">Verify & Authenticate Intake</h3>
            <p class="text-muted mb-3" style="font-size:12.5px">
              Count verified pieces upon warehouse arrival. Confirming will automatically email a Thank-You Certificate to <strong>{{ donation.donor_email }}</strong>.
            </p>

            <div v-if="verifyAlert" class="alert alert-success">{{ verifyAlert }}</div>

            <div class="form-group">
              <label>Verified Piece Count</label>
              <input
                v-model.number="verifiedQuantity"
                type="number"
                min="0"
                class="form-control font-bold"
                :placeholder="totalQuantity"
              />
              <small class="text-muted">Donor declared {{ totalQuantity }} pieces.</small>
            </div>

            <button
              class="btn btn-success w-100"
              :disabled="verifying"
              @click="verify"
            >
              {{ verifying ? 'Verifying…' : '✅ Authenticate & Dispatch Certificate' }}
            </button>
          </div>

          <!-- 4. Verified Completed Summary -->
          <div class="card mb-4" v-if="donation.status === 'verified'">
            <div class="card-head-between mb-2">
              <h3 class="card-title" style="color:var(--success)">🎉 Intake Verified</h3>
              <span class="badge badge-verified">Completed</span>
            </div>
            <p class="text-muted mb-3" style="font-size:12px">
              Verified on {{ formatDate(donation.verified_at) }}
            </p>

            <div class="d-flex justify-content-between py-1 border-bottom">
              <span class="text-muted">Declared Pieces:</span>
              <span class="font-medium">{{ totalQuantity }} pcs</span>
            </div>
            <div class="d-flex justify-content-between py-1">
              <span class="text-muted">Verified Pieces:</span>
              <span class="font-bold text-main" style="font-size:15px">{{ donation.verified_quantity }} pcs</span>
            </div>

            <div class="alert alert-success mt-3 mb-0" style="font-size:12px">
              ✉️ Certificate dispatched to <strong>{{ donation.donor_email }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Lightbox Modal -->
    <div v-if="lightboxUrl" class="modal-backdrop" @click="lightboxUrl = null">
      <div class="lightbox-modal" @click.stop>
        <img :src="lightboxUrl" class="lightbox-img" alt="Enlarged photo" />
        <button class="lightbox-close" @click="lightboxUrl = null">✕</button>
      </div>
    </div>
  </div>
</template>

<script>
import donationApi from '../../api/donations'
import userApi     from '../../api/users'

export default {
  name: 'DonationDetail',
  data() {
    return {
      id:               this.$route.params.id,
      donation:         null,
      agents:           [],
      loading:          true,
      selectedAgent:    '',
      assigning:        false,
      alertMsg:         '',
      verifiedQuantity: '',
      verifying:        false,
      verifyAlert:      '',
      lightboxUrl:      null,
      timelineSteps: [
        { key: 'pending',   label: 'Pending' },
        { key: 'assigned',  label: 'Assigned' },
        { key: 'picked_up', label: 'Picked Up' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'verified',  label: 'Verified' },
      ]
    }
  },
  computed: {
    totalQuantity() {
      if (!this.donation || !this.donation.items) return 0
      return this.donation.items.reduce((sum, i) => sum + (i.quantity || 0), 0)
    }
  },
  async created() {
    await Promise.all([this.loadDonation(), this.loadAgents()])
  },
  methods: {
    async loadDonation() {
      this.loading = true
      try {
        const res = await donationApi.getOne(this.id)
        this.donation         = res.data
        this.verifiedQuantity = this.totalQuantity
        this.selectedAgent    = res.data.agent_id || ''
      } finally {
        this.loading = false
      }
    },
    async loadAgents() {
      try {
        const res = await userApi.getAgents()
        this.agents = res.data
      } catch (e) {}
    },
    isStepCompleted(stepKey) {
      if (!this.donation) return false
      const order = ['pending', 'assigned', 'picked_up', 'delivered', 'verified']
      const currentIndex = order.indexOf(this.donation.status)
      const stepIndex = order.indexOf(stepKey)
      return stepIndex <= currentIndex
    },
    getStepTime(stepKey) {
      if (!this.donation) return ''
      if (stepKey === 'pending')   return this.formatDate(this.donation.created_at)
      if (stepKey === 'picked_up') return this.formatDate(this.donation.picked_up_at)
      if (stepKey === 'delivered') return this.formatDate(this.donation.delivered_at)
      if (stepKey === 'verified')  return this.formatDate(this.donation.verified_at)
      return ''
    },
    async assign() {
      this.assigning = true
      this.alertMsg  = ''
      try {
        const res      = await donationApi.assign(this.id, this.selectedAgent)
        this.donation  = res.data
        this.alertMsg  = 'Driver assigned successfully!'
      } finally {
        this.assigning = false
      }
    },
    async verify() {
      this.verifying   = true
      this.verifyAlert = ''
      try {
        const res        = await donationApi.verify(this.id, this.verifiedQuantity)
        this.donation    = res.data
        this.verifyAlert = 'Donation verified successfully! Certificate dispatched.'
      } finally {
        this.verifying = false
      }
    },
    formatDate(d) {
      if (!d) return ''
      return new Date(d).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    },
    getImageUrl(url) {
      if (!url) return ''
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
      }
      const apiBase = process.env.VUE_APP_API_URL || 'http://localhost:8000/api'
      const hostBase = apiBase.replace(/\/api\/?$/, '')
      const cleanPath = url.startsWith('/') ? url : `/${url}`
      return `${hostBase}${cleanPath}`
    },
    onImageError(e) {
      // If image not found or blocked, style thumbnail safely
      e.target.style.opacity = '0.7'
      e.target.title = 'Image preview not loaded'
    }
  }
}
</script>

<style scoped>
.saas-detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

.back-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 13px;
}
.back-link:hover {
  color: var(--primary);
}

/* Stepper Card */
.stepper-card {
  padding: 16px 20px;
}
.stepper-scroll-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.stepper-track {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  min-width: 480px;
}
.stepper-step {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  flex: 1;
}
.step-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1.5px solid #cbd5e1;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  z-index: 2;
}
.stepper-step.completed .step-icon-wrap {
  background: #ecfdf5;
  border-color: #10b981;
  color: #059669;
}
.stepper-step.active .step-icon-wrap {
  background: var(--primary);
  border-color: var(--primary);
  color: #ffffff;
  box-shadow: 0 0 0 3px var(--primary-focus);
}

.step-meta {
  display: flex;
  flex-direction: column;
}
.step-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
}
.step-time {
  font-size: 10px;
  color: var(--text-muted);
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  margin: 0 10px;
}
.stepper-step.completed .step-line {
  background: #10b981;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.info-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.info-value {
  font-size: 13px;
  color: var(--text-main);
}
.link-primary {
  color: var(--primary);
  text-decoration: none;
}

.item-img-thumb {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
  object-fit: cover;
  cursor: zoom-in;
}

/* Agent Strip */
.agent-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8fafc;
  border-radius: var(--radius-md);
}
.agent-avatar {
  width: 32px;
  height: 32px;
  background: #e0e7ff;
  color: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
}

/* Lightbox Modal */
.lightbox-modal {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}
.lightbox-img {
  max-width: 100%;
  max-height: 85vh;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
}
.lightbox-close {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 28px;
  height: 28px;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: 50%;
  cursor: pointer;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.card-head-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.border-bottom {
  border-bottom: 1px solid #f1f5f9;
}
</style>
