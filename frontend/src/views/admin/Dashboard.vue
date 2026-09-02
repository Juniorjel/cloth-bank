<template>
  <div class="saas-dashboard">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p class="text-muted">Real-time overview of clothes donation intake, logistics pipeline, and campaign progress.</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <router-link to="/admin/donations" class="btn btn-secondary btn-sm">
          <span>📦</span> Manage Intake
        </router-link>
        <router-link to="/donate" target="_blank" class="btn btn-primary btn-sm">
          <span>+</span> New Donation
        </router-link>
      </div>
    </div>

    <!-- ── 4 Crisp Metric Cards ── -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card metric-card mb-0">
          <div class="metric-head">
            <span class="metric-label">Total Donations</span>
            <span class="metric-badge metric-badge-indigo">📦 All Time</span>
          </div>
          <div class="metric-value">{{ stats ? stats.total_donations : 0 }}</div>
          <div class="metric-footer text-muted">Intake requests registered</div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card metric-card mb-0">
          <div class="metric-head">
            <span class="metric-label">Pieces Declared</span>
            <span class="metric-badge metric-badge-emerald">👕 Clothes</span>
          </div>
          <div class="metric-value">{{ stats ? stats.total_quantity : 0 }}</div>
          <div class="metric-footer text-muted">Total garments in network</div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card metric-card mb-0">
          <div class="metric-head">
            <span class="metric-label">Active Campaigns</span>
            <span class="metric-badge metric-badge-amber">📢 Drives</span>
          </div>
          <div class="metric-value">{{ stats ? stats.active_campaigns : 0 }}</div>
          <div class="metric-footer text-muted">Currently active drives</div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card metric-card mb-0">
          <div class="metric-head">
            <span class="metric-label">Field Drivers</span>
            <span class="metric-badge metric-badge-sky">👷 Logistics</span>
          </div>
          <div class="metric-value">{{ stats ? stats.total_agents : 0 }}</div>
          <div class="metric-footer text-muted">Active logistics agents</div>
        </div>
      </div>
    </div>

    <!-- ── Analytics Row: Velocity Chart & Pipeline Donut ── -->
    <div class="row g-3 mb-4">
      <!-- 7-Day Velocity Chart -->
      <div class="col-12 col-lg-8">
        <div class="card chart-card mb-0 h-100">
          <div class="card-head-between mb-3">
            <div>
              <h3 class="card-title">Intake Velocity (7-Day Trend)</h3>
              <span class="text-muted">Daily volume of incoming donation submissions</span>
            </div>
            <span class="chart-tag">Realtime</span>
          </div>
          <div class="canvas-container">
            <canvas ref="trendCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Status Pipeline Breakdown Donut -->
      <div class="col-12 col-lg-4">
        <div class="card chart-card mb-0 h-100">
          <div class="card-head-between mb-3">
            <div>
              <h3 class="card-title">Status Breakdown</h3>
              <span class="text-muted">Current lifecycle stage distribution</span>
            </div>
          </div>
          <div class="canvas-container donut-wrap">
            <canvas ref="donutCanvas"></canvas>
          </div>
          <div class="status-legend mt-3" v-if="stats && (stats.statusBreakdown || stats.status_breakdown)">
            <div
              v-for="item in (stats.statusBreakdown || defaultStatusList)"
              :key="item.key"
              class="legend-item"
            >
              <span class="legend-dot" :style="{ background: item.color }"></span>
              <span class="legend-name">{{ item.status }}</span>
              <span class="legend-val">{{ item.count !== undefined ? item.count : (stats.status_breakdown && stats.status_breakdown[item.key] || 0) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Lower Row: Recent Donations Table & Active Campaigns ── -->
    <div class="row g-3">
      <!-- Recent Donations Table -->
      <div class="col-12 col-lg-8">
        <div class="card mb-0 h-100">
          <div class="card-head-between mb-3">
            <h3 class="card-title">Recent Submissions</h3>
            <router-link to="/admin/donations" class="link-btn">View all →</router-link>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Campaign</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in (stats ? stats.recent_donations : [])" :key="d.id">
                  <td>
                    <div class="donor-cell">
                      <span class="font-medium text-main">{{ d.donor_name }}</span>
                      <span class="text-muted" style="font-size:11.5px">{{ d.donor_phone }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="text-secondary">{{ d.campaign ? d.campaign.title : '—' }}</span>
                  </td>
                  <td>
                    <span class="font-semibold">{{ calcQty(d) }} pcs</span>
                  </td>
                  <td>
                    <span :class="'badge badge-' + d.status">● {{ d.status.replace('_',' ') }}</span>
                  </td>
                  <td class="text-right">
                    <router-link :to="'/admin/donations/' + d.id" class="btn btn-secondary btn-sm">
                      Inspect
                    </router-link>
                  </td>
                </tr>
                <tr v-if="!stats || !stats.recent_donations || !stats.recent_donations.length">
                  <td colspan="5" class="text-center text-muted py-4">No recent submissions found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Active Campaigns Progress -->
      <div class="col-12 col-lg-4">
        <div class="card mb-0 h-100">
          <div class="card-head-between mb-3">
            <h3 class="card-title">Active Campaigns</h3>
            <router-link to="/admin/campaigns" class="link-btn">Manage →</router-link>
          </div>
          <div v-if="stats && stats.campaigns_list && stats.campaigns_list.length" class="campaigns-list">
            <div v-for="c in stats.campaigns_list" :key="c.id" class="campaign-row">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="font-medium text-main">{{ c.title }}</span>
                <span class="badge badge-assigned">{{ c.total_quantity || 0 }} pcs</span>
              </div>
              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  :style="{ width: Math.min(100, Math.round(((c.total_quantity || 0) / (c.target_quantity || 100)) * 100)) + '%' }"
                ></div>
              </div>
              <div class="d-flex justify-content-between text-muted mt-1" style="font-size:11px">
                <span>Goal: {{ c.target_quantity ? c.target_quantity + ' pcs' : 'Open' }}</span>
                <span v-if="c.target_quantity">
                  {{ Math.min(100, Math.round(((c.total_quantity || 0) / (c.target_quantity || 100)) * 100)) }}%
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-muted text-center py-4">No active campaigns.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'
import dashboardApi from '../../api/dashboard'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      stats: null,
      trendChart: null,
      donutChart: null,
    }
  },
  async mounted() {
    await this.loadStats()
    this.$nextTick(() => {
      this.initTrendChart()
      this.initDonutChart()
    })
  },
  beforeDestroy() {
    if (this.trendChart) this.trendChart.destroy()
    if (this.donutChart) this.donutChart.destroy()
  },
  methods: {
    async loadStats() {
      try {
        const res = await dashboardApi.getStats()
        this.stats = res.data
      } catch (e) {
        console.error('Failed to load stats', e)
      }
    },
    calcQty(d) {
      if (!d.items) return 0
      return d.items.reduce((sum, i) => sum + (i.quantity || 0), 0)
    },
    initTrendChart() {
      if (!this.$refs.trendCanvas) return
      const ctx = this.$refs.trendCanvas.getContext('2d')
      if (this.trendChart) this.trendChart.destroy()

      const series = (this.stats && this.stats.velocity_series) || [
        { label: 'Mon', count: 4 },
        { label: 'Tue', count: 7 },
        { label: 'Wed', count: 3 },
        { label: 'Thu', count: 9 },
        { label: 'Fri', count: 12 },
        { label: 'Sat', count: 8 },
        { label: 'Sun', count: 14 }
      ]

      const gradient = ctx.createLinearGradient(0, 0, 0, 200)
      gradient.addColorStop(0, 'rgba(79, 70, 229, 0.18)')
      gradient.addColorStop(1, 'rgba(79, 70, 229, 0.0)')

      this.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: series.map(s => s.label),
          datasets: [{
            label: 'Donations',
            data: series.map(s => s.count),
            borderColor: '#4f46e5',
            borderWidth: 2.5,
            backgroundColor: gradient,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#4f46e5',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0f172a',
              padding: 8,
              cornerRadius: 6,
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
            },
            y: {
              grid: { color: '#f1f5f9' },
              ticks: { precision: 0, color: '#94a3b8', font: { family: 'Inter', size: 11 } },
              beginAtZero: true
            }
          }
        }
      })
    },
    initDonutChart() {
      if (!this.$refs.donutCanvas) return
      const ctx = this.$refs.donutCanvas.getContext('2d')
      if (this.donutChart) this.donutChart.destroy()

      const breakdown = (this.stats && this.stats.statusBreakdown) || [
        { status: 'Pending',   count: this.stats?.status_breakdown?.pending || 0,   color: '#f59e0b' },
        { status: 'Accepted',  count: this.stats?.status_breakdown?.accepted || 0,  color: '#6366f1' },
        { status: 'Assigned',  count: this.stats?.status_breakdown?.assigned || 0,  color: '#0ea5e9' },
        { status: 'Picked Up', count: this.stats?.status_breakdown?.picked_up || 0, color: '#8b5cf6' },
        { status: 'Delivered', count: this.stats?.status_breakdown?.delivered || 0, color: '#ec4899' },
        { status: 'Verified',  count: this.stats?.status_breakdown?.verified || 0,  color: '#10b981' },
        { status: 'Rejected',  count: this.stats?.status_breakdown?.rejected || 0,  color: '#ef4444' },
      ]

      const labels = breakdown.map(b => b.status)
      const data   = breakdown.map(b => b.count)
      const colors = breakdown.map(b => b.color)

      this.donutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors,
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: { display: false }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.saas-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

/* Metric Cards */
.metric-card {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.metric-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.metric-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}
.metric-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: var(--radius-full);
}
.metric-badge-indigo  { background: #eef2ff; color: #4338ca; }
.metric-badge-emerald { background: #ecfdf5; color: #065f46; }
.metric-badge-amber   { background: #fffbeb; color: #92400e; }
.metric-badge-sky     { background: #f0f9ff; color: #0369a1; }

.metric-value {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.1;
  margin-bottom: 4px;
}
.metric-footer {
  font-size: 11.5px;
}

/* Charts */
.chart-card {
  padding: 20px;
}
.card-head-between {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.chart-tag {
  background: #f1f5f9;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}
.canvas-container {
  height: 220px;
  position: relative;
}
.donut-wrap {
  height: 150px;
}

/* Status legend */
.status-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}
.legend-name {
  flex: 1;
  color: var(--text-secondary);
}
.legend-val {
  font-weight: 600;
  color: var(--text-main);
}

.donor-cell {
  display: flex;
  flex-direction: column;
}
.link-btn {
  color: var(--primary);
  font-size: 12.5px;
  font-weight: 600;
  text-decoration: none;
}
.link-btn:hover {
  text-decoration: underline;
}

/* Campaign progress list */
.campaigns-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: #f1f5f9;
  border-radius: var(--radius-full);
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: var(--primary);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.h-100 { height: 100%; }
</style>
