<template>
  <div class="saas-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Donations</h1>
        <p class="text-muted">Manage incoming clothing donations, dispatch field pickup agents, and authenticate items.</p>
      </div>
      <router-link to="/donate" target="_blank" class="btn btn-secondary btn-sm">
        <span>+</span> Public Form ↗
      </router-link>
    </div>

    <!-- ── Filter Toolbar (Stripe Style) ── -->
    <div class="card filter-card mb-3">
      <div class="row g-2 align-items-center">
        <!-- Search -->
        <div class="col-12 col-md-4">
          <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input
              v-model="filters.search"
              class="form-control filter-input"
              placeholder="Search donor name, phone, email…"
            />
          </div>
        </div>

        <!-- Status -->
        <div class="col-12 col-sm-6 col-md-3">
          <select v-model="filters.status" class="form-control">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="picked_up">Picked Up</option>
            <option value="delivered">Delivered</option>
            <option value="verified">Verified</option>
          </select>
        </div>

        <!-- Campaign -->
        <div class="col-12 col-sm-6 col-md-3">
          <select v-model="filters.campaign_id" class="form-control">
            <option value="">All Campaigns</option>
            <option v-for="c in campaigns" :key="c.id" :value="c.id">{{ c.title }}</option>
          </select>
        </div>

        <!-- Reset Button -->
        <div class="col-12 col-md-2">
          <button class="btn btn-secondary btn-sm w-100" @click="resetFilters">
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="spinner-wrap">
      <div class="spinner"></div>
      <p>Loading donation records…</p>
    </div>

    <!-- ── Datatable ── -->
    <div v-else class="card table-card mb-0">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="width:70px">ID</th>
              <th>Donor</th>
              <th>Campaign</th>
              <th>Declared Items</th>
              <th>Method</th>
              <th>Status</th>
              <th>Submitted</th>
              <th class="text-right" style="width:100px">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in filteredDonations" :key="d.id">
              <td>
                <span class="font-medium text-muted">#{{ d.id }}</span>
              </td>
              <td>
                <div class="donor-cell">
                  <span class="font-semibold text-main">{{ d.donor_name }}</span>
                  <span class="text-muted" style="font-size:11.5px">{{ d.donor_phone }}</span>
                </div>
              </td>
              <td>
                <span class="text-secondary">{{ d.campaign ? d.campaign.title : '—' }}</span>
              </td>
              <td>
                <div class="items-summary-cell">
                  <span class="font-medium">{{ totalQuantity(d) }} pcs</span>
                  <span class="text-muted" style="font-size:11px" v-if="d.items">({{ d.items.length }} types)</span>
                </div>
              </td>
              <td>
                <span :class="d.collection_type === 'pickup' ? 'badge badge-assigned' : 'badge badge-verified'">
                  {{ d.collection_type === 'pickup' ? 'Pickup' : 'Drop-off' }}
                </span>
              </td>
              <td>
                <span :class="'badge badge-' + d.status">
                  ● {{ d.status.replace('_',' ') }}
                </span>
              </td>
              <td>
                <span class="text-muted" style="font-size:12px">{{ formatDate(d.created_at) }}</span>
              </td>
              <td class="text-right">
                <router-link :to="'/admin/donations/' + d.id" class="btn btn-secondary btn-sm">
                  View →
                </router-link>
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-if="!filteredDonations.length">
              <td colspan="8" class="text-center text-muted py-5">
                <p class="mb-0">No matching donations found.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import donationApi from '../../api/donations'
import campaignApi from '../../api/campaigns'

export default {
  name: 'AdminDonations',
  data() {
    return {
      donations: [],
      campaigns: [],
      loading:   true,
      filters: {
        search:          '',
        status:          '',
        campaign_id:     '',
        collection_type: '',
      }
    }
  },
  computed: {
    filteredDonations() {
      return this.donations.filter(d => {
        if (this.filters.status && d.status !== this.filters.status) return false
        if (this.filters.campaign_id && d.campaign_id !== Number(this.filters.campaign_id)) return false
        if (this.filters.collection_type && d.collection_type !== this.filters.collection_type) return false
        if (this.filters.search) {
          const q = this.filters.search.toLowerCase()
          const nameMatch  = (d.donor_name || '').toLowerCase().includes(q)
          const phoneMatch = (d.donor_phone || '').toLowerCase().includes(q)
          const emailMatch = (d.donor_email || '').toLowerCase().includes(q)
          if (!nameMatch && !phoneMatch && !emailMatch) return false
        }
        return true
      })
    }
  },
  async created() {
    await Promise.all([this.loadDonations(), this.loadCampaigns()])
  },
  methods: {
    async loadDonations() {
      this.loading = true
      try {
        const res = await donationApi.getAll()
        this.donations = res.data
      } finally {
        this.loading = false
      }
    },
    async loadCampaigns() {
      try {
        const res = await campaignApi.getAll()
        this.campaigns = res.data
      } catch (e) {}
    },
    resetFilters() {
      this.filters = { search: '', status: '', campaign_id: '', collection_type: '' }
    },
    totalQuantity(d) {
      if (!d.items) return 0
      return d.items.reduce((sum, i) => sum + (i.quantity || 0), 0)
    },
    formatDate(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.saas-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* ── Filter Toolbar ── */
.filter-card {
  padding: 12px 16px;
}
.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid var(--border-input);
  border-radius: var(--radius-md);
  padding: 0 10px;
}
.search-icon {
  font-size: 12px;
  color: var(--text-light);
}
.filter-input {
  border: none;
  background: transparent;
  padding: 6px 0;
  box-shadow: none;
  font-size: 13px;
  min-height: auto;
}
.filter-input:focus {
  box-shadow: none;
}

.table-card {
  padding: 0;
  overflow: hidden;
}
.donor-cell {
  display: flex;
  flex-direction: column;
}
.items-summary-cell {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
</style>
