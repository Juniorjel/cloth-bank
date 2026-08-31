<template>
  <div class="saas-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Campaigns</h1>
        <p class="text-muted">Create and manage public clothes donation drives, schedule dates, and monitor goals.</p>
      </div>
      <button class="btn btn-primary btn-sm" @click="openModal()">
        <span>+</span> Launch Campaign
      </button>
    </div>

    <div v-if="loading" class="spinner-wrap">
      <div class="spinner"></div>
      <p>Loading campaigns…</p>
    </div>

    <div v-else class="card table-card mb-0">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="width: 70px;">ID</th>
              <th>Campaign Details</th>
              <th>Date Schedule</th>
              <th>Status</th>
              <th class="text-center">Submissions</th>
              <th class="text-center" style="width: 180px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in campaigns" :key="c.id">
              <td>
                <span class="font-medium text-muted">#{{ c.id }}</span>
              </td>
              <td>
                <div style="max-width: 320px;">
                  <strong class="text-main d-block" style="font-size:13.5px">{{ c.title }}</strong>
                  <span class="text-muted" style="font-size:12px" v-if="c.description">
                    {{ c.description.length > 70 ? c.description.substring(0, 70) + '…' : c.description }}
                  </span>
                </div>
              </td>
              <td>
                <div class="d-flex align-items-center gap-1 text-muted" style="font-size:12px">
                  <span>📅 {{ formatDate(c.start_date) }}</span>
                  <span>→</span>
                  <span>{{ formatDate(c.end_date) }}</span>
                </div>
              </td>
              <td>
                <span :class="'badge ' + (c.status === 'active' ? 'badge-verified' : 'badge-inactive')">
                  ● {{ c.status === 'active' ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="text-center">
                <span class="badge badge-assigned">
                  {{ c.donations_count || 0 }} submissions
                </span>
              </td>
              <td class="text-center">
                <div class="d-flex gap-1 justify-content-center">
                  <button class="btn btn-secondary btn-sm" @click="openModal(c)" title="Edit Campaign">
                    Edit
                  </button>
                  <button
                    class="btn btn-sm"
                    :class="c.status === 'active' ? 'btn-warning' : 'btn-success'"
                    @click="toggleStatus(c)"
                  >
                    {{ c.status === 'active' ? 'Pause' : 'Activate' }}
                  </button>
                  <button
                    class="btn btn-danger btn-sm"
                    @click="deleteCampaign(c.id)"
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!campaigns.length">
              <td colspan="6" class="text-center text-muted py-5">
                <p class="mb-0">No donation campaigns found. Click "Launch Campaign" to create one.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal-backdrop" v-if="showModal" @click.self="showModal = false">
      <div class="modal">
        <h3 class="modal-title">{{ editing ? 'Edit Campaign' : 'Launch New Campaign' }}</h3>
        
        <div v-if="formError" class="alert alert-error">
          <div>{{ formError }}</div>
        </div>

        <div class="form-group">
          <label>Campaign Title</label>
          <input
            v-model="form.title"
            class="form-control"
            placeholder="e.g. Winter Clothes Drive 2024"
            required
          />
        </div>

        <div class="form-group">
          <label>Description & Purpose</label>
          <textarea
            v-model="form.description"
            class="form-control"
            rows="3"
            placeholder="Target recipients, preferred clothes, distribution center details…"
          ></textarea>
        </div>

        <div class="row g-2">
          <div class="col-12 col-sm-6">
            <div class="form-group">
              <label>Start Date</label>
              <input
                v-model="form.start_date"
                type="date"
                class="form-control"
                required
              />
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="form-group">
              <label>End Date</label>
              <input
                v-model="form.end_date"
                type="date"
                class="form-control"
                required
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Status</label>
          <select v-model="form.status" class="form-control">
            <option value="active">Active (Visible to public donors)</option>
            <option value="inactive">Inactive (Hidden/Draft)</option>
          </select>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showModal = false">Cancel</button>
          <button type="button" class="btn btn-primary" :disabled="saving" @click="save">
            <span v-if="saving">Saving…</span>
            <span v-else>{{ editing ? 'Save Changes' : 'Launch Campaign' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import campaignApi from '../../api/campaigns'

export default {
  name: 'AdminCampaigns',
  data() {
    return {
      campaigns: [],
      loading:   true,
      showModal: false,
      editing:   null,
      saving:    false,
      formError: '',
      form: { title: '', description: '', start_date: '', end_date: '', status: 'active' }
    }
  },
  async created() {
    await this.loadCampaigns()
  },
  methods: {
    async loadCampaigns() {
      this.loading = true
      try {
        const res = await campaignApi.getAll()
        this.campaigns = res.data
      } finally {
        this.loading = false
      }
    },
    formatDateForInput(val) {
      if (!val) return ''
      if (typeof val === 'string' && val.length >= 10) {
        return val.substring(0, 10)
      }
      const d = new Date(val)
      if (isNaN(d.getTime())) return ''
      return d.toISOString().split('T')[0]
    },
    openModal(campaign = null) {
      this.editing   = campaign
      this.formError = ''
      if (campaign) {
        this.form = {
          title:       campaign.title,
          description: campaign.description || '',
          start_date:  this.formatDateForInput(campaign.start_date),
          end_date:    this.formatDateForInput(campaign.end_date),
          status:      campaign.status || 'active'
        }
      } else {
        const today = new Date().toISOString().split('T')[0]
        const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        this.form = {
          title: '',
          description: '',
          start_date: today,
          end_date: nextMonth,
          status: 'active'
        }
      }
      this.showModal = true
    },
    async save() {
      if (!this.form.title || !this.form.start_date || !this.form.end_date) {
        this.formError = 'Title, start date, and end date are required.'
        return
      }
      this.saving = true
      this.formError = ''
      try {
        const payload = {
          title:       this.form.title,
          description: this.form.description || '',
          start_date:  this.formatDateForInput(this.form.start_date),
          end_date:    this.formatDateForInput(this.form.end_date),
          status:      this.form.status || 'active'
        }

        if (this.editing) {
          await campaignApi.update(this.editing.id, payload)
        } else {
          await campaignApi.create(payload)
        }
        this.showModal = false
        await this.loadCampaigns()
      } catch (e) {
        const errors = e.response?.data?.errors
        this.formError = errors ? Object.values(errors).flat().join(' ') : 'Failed to save campaign.'
      } finally {
        this.saving = false
      }
    },
    async toggleStatus(campaign) {
      const newStatus = campaign.status === 'active' ? 'inactive' : 'active'
      await campaignApi.update(campaign.id, { status: newStatus })
      campaign.status = newStatus
    },
    async deleteCampaign(id) {
      if (!confirm('Are you sure you want to delete this campaign? All related donations will also be removed.')) return
      await campaignApi.delete(id)
      this.campaigns = this.campaigns.filter(c => c.id !== id)
    },
    formatDate(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }
  }
}
</script>

<style scoped>
.saas-page {
  max-width: 1200px;
  margin: 0 auto;
}
.table-card {
  padding: 0;
  overflow: hidden;
}
</style>
