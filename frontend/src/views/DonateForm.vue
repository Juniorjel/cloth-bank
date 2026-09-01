<template>
  <div class="donate-page">
    <!-- Navbar Header -->
    <header class="donate-navbar">
      <div class="navbar-container">
        <div class="brand">
          <img src="/logo.svg" alt="Cloth Bank Logo" class="brand-logo-img" />
          <span class="brand-title">Cloth Bank</span>
          <span class="brand-tag">कपडा बैंक</span>
        </div>
        <router-link to="/login" class="btn btn-secondary btn-sm">
          <span>🔐</span> Staff Portal
        </router-link>
      </div>
    </header>

    <!-- Hero Banner -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-badge">🌿 Sustainable Giving</div>
        <h1 class="hero-title">Give Your Clothes a Second Life</h1>
        <p class="hero-subtitle">
          Donate clean, wearable clothing to families in need. Schedule a free doorstep pickup or drop off at our collection hubs.
        </p>
        <div class="hero-stats">
          <div class="stat-pill">✨ <strong>100%</strong> Non-Profit</div>
          <div class="stat-pill">🚚 <strong>Free</strong> Doorstep Pickup</div>
          <div class="stat-pill">🤝 <strong>Direct</strong> Community Impact</div>
        </div>
      </div>
    </section>

    <!-- Main Container -->
    <main class="donate-container">
      <!-- Success Screen -->
      <div v-if="submitted" class="success-card card">
        <div class="success-celebration">🎉</div>
        <div class="success-icon-wrap">
          <span class="check-icon">✓</span>
        </div>
        <h2>Donation Submitted Successfully!</h2>
        <p class="success-desc">
          Thank you, <strong>{{ form.donor_name }}</strong>! Your generous donation has been registered. Our logistics team will review and contact you shortly.
        </p>
        
        <div class="ref-box">
          <span class="ref-label">Reference ID:</span>
          <span class="ref-code">#CB-{{ submittedId }}</span>
        </div>

        <div class="success-actions">
          <button class="btn btn-primary btn-lg" @click="resetForm">
            🎁 Submit Another Donation
          </button>
        </div>
      </div>

      <!-- Donation Form -->
      <div v-else class="form-wrapper">
        <div v-if="error" class="alert alert-error">
          <span>⚠️</span>
          <div>{{ error }}</div>
        </div>

        <!-- ── Section 1: Campaign & Donor ── -->
        <div class="card form-section-card mb-4">
          <div class="section-heading">
            <div class="step-badge">1</div>
            <div>
              <h3>Donor Information</h3>
              <p class="text-muted">Select an active campaign and enter your contact details.</p>
            </div>
          </div>

          <div class="form-group mt-3">
            <label>Campaign <span class="req">*</span></label>
            <select v-model="form.campaign_id" class="form-control">
              <option value="">— Select an Active Campaign —</option>
              <option v-for="c in campaigns" :key="c.id" :value="c.id">
                📢 {{ c.title }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Full Name <span class="req">*</span></label>
              <input v-model="form.donor_name" class="form-control" placeholder="e.g. Maya Sharma" />
            </div>
            <div class="form-group">
              <label>Phone Number <span class="req">*</span></label>
              <input v-model="form.donor_phone" class="form-control" placeholder="98XXXXXXXX" />
            </div>
          </div>

          <div class="form-group">
            <label>Email Address <span class="req">*</span></label>
            <input v-model="form.donor_email" type="email" class="form-control" placeholder="you@example.com" />
            <small class="text-muted">We will email your verified donation certificate to this address.</small>
          </div>
        </div>

        <!-- ── Section 2: Collection Method ── -->
        <div class="card form-section-card mb-4">
          <div class="section-heading">
            <div class="step-badge">2</div>
            <div>
              <h3>Collection Method</h3>
              <p class="text-muted">Choose how you would like us to receive your clothes.</p>
            </div>
          </div>

          <div class="collection-selector mt-3">
            <label
              class="collection-card"
              :class="{ selected: form.collection_type === 'pickup' }"
            >
              <input type="radio" v-model="form.collection_type" value="pickup" class="sr-only" />
              <div class="collection-icon">🚚</div>
              <div class="collection-info">
                <span class="collection-title">Doorstep Pickup</span>
                <span class="collection-desc">Our agent will come collect items from your address.</span>
              </div>
              <span class="select-indicator">{{ form.collection_type === 'pickup' ? '✓' : '' }}</span>
            </label>

            <label
              class="collection-card"
              :class="{ selected: form.collection_type === 'drop' }"
            >
              <input type="radio" v-model="form.collection_type" value="drop" class="sr-only" />
              <div class="collection-icon">🏢</div>
              <div class="collection-info">
                <span class="collection-title">Self Drop-off</span>
                <span class="collection-desc">Drop items directly at our central collection center.</span>
              </div>
              <span class="select-indicator">{{ form.collection_type === 'drop' ? '✓' : '' }}</span>
            </label>
          </div>

          <!-- Pickup location details -->
          <div v-if="form.collection_type === 'pickup'" class="pickup-details mt-4">
            <!-- Location Category Presets -->
            <div class="form-group mb-3">
              <label class="font-bold text-main" style="font-size: 13.5px;">🏢 Pickup Location Type</label>
              <div class="location-preset-chips mt-2">
                <button
                  type="button"
                  class="location-chip"
                  :class="{ active: form.location_tag === 'office' }"
                  @click="form.location_tag = 'office'"
                >
                  🏢 Office / Workplace
                </button>
                <button
                  type="button"
                  class="location-chip"
                  :class="{ active: form.location_tag === 'home' }"
                  @click="form.location_tag = 'home'"
                >
                  🏠 Home / Residence
                </button>
                <button
                  type="button"
                  class="location-chip"
                  :class="{ active: form.location_tag === 'other' }"
                  @click="form.location_tag = 'other'"
                >
                  📍 Other Landmark
                </button>
              </div>
            </div>

            <!-- Street Address & Search Action -->
            <div class="form-group mb-3">
              <label>Street Address / Area / Landmark <span class="req">*</span></label>
              <div class="input-with-action">
                <input
                  v-model="form.address"
                  class="form-control"
                  placeholder="e.g. Durbar Marg, Kathmandu or Putalisadak..."
                  @keyup.enter.prevent="searchAddressOnMap"
                />
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  :disabled="searchingLocation || !form.address"
                  @click="searchAddressOnMap"
                  title="Search this location to pin GPS on map"
                >
                  <span v-if="searchingLocation">Searching…</span>
                  <span v-else>🔍 Find on Map</span>
                </button>
              </div>
              <small class="text-muted">You can enter your office or any address across Nepal, even if you are not currently there.</small>
            </div>

            <!-- Special Pickup Instructions for Driver -->
            <div class="form-group mb-3">
              <label>Special Instructions for Field Driver <span class="text-muted" style="font-size:12px; font-weight:normal">(Optional)</span></label>
              <input
                v-model="form.pickup_instructions"
                class="form-control"
                placeholder="e.g. Leave package with reception, call on arrival, gate #2..."
              />
            </div>

            <div class="map-action-bar">
              <button type="button" class="btn btn-outline-primary btn-sm" @click="detectLocation">
                <span>📍</span> Use My Current Device GPS
              </button>
              <span v-if="form.latitude" class="location-tag">
                ✓ GPS Pinned: {{ form.latitude.toFixed(4) }}, {{ form.longitude.toFixed(4) }}
              </span>
            </div>

            <div id="map" class="map-container" v-show="mapVisible"></div>
          </div>
        </div>

        <!-- ── Section 3: Donation Items ── -->
        <div class="card form-section-card mb-4">
          <div class="section-heading justify-between">
            <div class="flex items-center gap-3">
              <div class="step-badge">3</div>
              <div>
                <h3>Clothes to Donate</h3>
                <p class="text-muted">Specify types, counts, and attach photos if available.</p>
              </div>
            </div>
            <button
              type="button"
              class="btn btn-secondary btn-sm add-btn"
              @click="addItem"
            >
              <span>+</span> Add Another Type
            </button>
          </div>

          <div class="items-list mt-3">
            <div
              v-for="(item, index) in form.items"
              :key="index"
              class="item-entry-card"
            >
              <div class="item-header">
                <span class="item-index-badge">Item #{{ index + 1 }}</span>
                <button
                  v-if="form.items.length > 1"
                  type="button"
                  class="remove-btn"
                  @click="removeItem(index)"
                >
                  ✕ Remove
                </button>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Clothing Category <span class="req">*</span></label>
                  <select v-model="item.cloth_type_id" class="form-control">
                    <option value="">— Select Category —</option>
                    <option v-for="t in clothTypes" :key="t.id" :value="t.id">
                      👕 {{ t.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Estimated Quantity (Pieces) <span class="req">*</span></label>
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    min="1"
                    class="form-control"
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Item Condition / Notes <span class="text-muted">(optional)</span></label>
                <input
                  v-model="item.note"
                  class="form-control"
                  placeholder="e.g. Washed, winter jackets for children aged 6-10"
                />
              </div>

              <!-- Photo Uploader -->
              <div class="photo-upload-section">
                <label class="photo-label">
                  <span>📸 Photos</span>
                  <span class="text-muted">(Optional, up to 5 photos)</span>
                </label>

                <div
                  class="dropzone"
                  @click="triggerFileInput(index)"
                  @dragover.prevent
                  @drop.prevent="onDrop($event, index)"
                >
                  <div v-if="!item.previews.length" class="dropzone-empty">
                    <span class="dropzone-icon">📷</span>
                    <p class="dropzone-text">Click or drag photos of clothes here</p>
                    <span class="dropzone-hint">Supports JPEG, PNG, WEBP (max 4MB each)</span>
                  </div>

                  <div v-else class="preview-gallery">
                    <div
                      v-for="(preview, pi) in item.previews"
                      :key="pi"
                      class="preview-card"
                    >
                      <img :src="preview" :alt="'Item ' + (index+1) + ' photo ' + (pi+1)" />
                      <button
                        type="button"
                        class="delete-photo-btn"
                        @click.stop="removeImage(index, pi)"
                      >
                        ✕
                      </button>
                    </div>
                    <div
                      v-if="item.previews.length < 5"
                      class="preview-add-card"
                      @click.stop="triggerFileInput(index)"
                    >
                      <span>+</span>
                      <small>Add</small>
                    </div>
                  </div>
                </div>

                <input
                  :ref="'fileInput_' + index"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  multiple
                  style="display:none"
                  @change="onFileChange($event, index)"
                />
              </div>
            </div>
          </div>

          <!-- Total Summary Pill -->
          <div class="summary-pill" v-if="form.items.length">
            <div class="summary-item">
              <span class="summary-label">Categories:</span>
              <strong>{{ form.items.length }}</strong>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-item">
              <span class="summary-label">Total Pieces:</span>
              <strong class="total-qty-number">{{ totalQuantity }} pcs</strong>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="submit-bar">
          <button
            class="btn btn-primary btn-lg w-full submit-btn"
            :disabled="loading"
            @click="submitDonation"
          >
            <span v-if="loading" class="spinner-sm"></span>
            <span v-if="loading">Processing Donation…</span>
            <span v-else>🎁 Confirm & Submit Donation ({{ totalQuantity }} pcs)</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import campaignApi  from '../api/campaigns'
import donationApi  from '../api/donations'
import clothTypeApi from '../api/clothTypes'

function blankItem() {
  return { cloth_type_id: '', quantity: '', note: '', files: [], previews: [] }
}

export default {
  name: 'DonateForm',
  data() {
    return {
      campaigns:  [],
      clothTypes: [],
      form: {
        campaign_id:         '',
        donor_name:          '',
        donor_phone:         '',
        donor_email:         '',
        collection_type:     'pickup',
        location_tag:        'office',
        pickup_instructions: '',
        latitude:            null,
        longitude:           null,
        address:             '',
        items:               [blankItem()],
      },
      searchingLocation: false,
      loading:     false,
      error:       '',
      submitted:   false,
      submittedId: null,
      mapVisible:  false,
      map:         null,
      marker:      null,
    }
  },

  computed: {
    totalQuantity() {
      return this.form.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)
    }
  },

  async created() {
    try {
      const [camRes, typeRes] = await Promise.all([
        campaignApi.getActive(),
        clothTypeApi.getAll(),
      ])
      this.campaigns  = camRes.data
      this.clothTypes = typeRes.data
      if (this.campaigns.length === 1) {
        this.form.campaign_id = this.campaigns[0].id
      }
    } catch (e) {
      this.error = 'Could not load active campaigns. Please refresh.'
    }
  },

  watch: {
    'form.collection_type'(newVal) {
      if (newVal === 'pickup') {
        this.$nextTick(() => {
          this.initLeafletMap()
        })
      }
    }
  },

  mounted() {
    if (this.form.collection_type === 'pickup') {
      this.$nextTick(() => {
        this.initLeafletMap()
      })
    }
  },

  methods: {
    addItem() {
      if (this.form.items.length >= 10) return
      this.form.items.push(blankItem())
    },

    removeItem(index) {
      this.form.items.splice(index, 1)
    },

    triggerFileInput(index) {
      const ref = this.$refs['fileInput_' + index]
      if (ref) {
        const el = Array.isArray(ref) ? ref[0] : ref
        el.click()
      }
    },

    onFileChange(event, index) {
      const files = Array.from(event.target.files)
      this.addFiles(files, index)
      event.target.value = ''
    },

    onDrop(event, index) {
      const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'))
      this.addFiles(files, index)
    },

    addFiles(files, index) {
      const item = this.form.items[index]
      const allowed = 5 - item.files.length
      if (allowed <= 0) return
      const toAdd = files.slice(0, allowed)

      toAdd.forEach(file => {
        item.files.push(file)
        const reader = new FileReader()
        reader.onload = e => item.previews.push(e.target.result)
        reader.readAsDataURL(file)
      })
    },

    removeImage(itemIndex, imgIndex) {
      this.form.items[itemIndex].files.splice(imgIndex, 1)
      this.form.items[itemIndex].previews.splice(imgIndex, 1)
    },

    initLeafletMap(lat, lng) {
      if (typeof window.L === 'undefined') {
        setTimeout(() => this.initLeafletMap(lat, lng), 300)
        return
      }

      const initialLat = lat || this.form.latitude || 27.7172
      const initialLng = lng || this.form.longitude || 85.3240

      const container = document.getElementById('map')
      if (!container) return

      if (this.map) {
        this.map.remove()
        this.map = null
      }

      this.mapVisible = true

      try {
        this.map = window.L.map('map').setView([initialLat, initialLng], 14)

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(this.map)

        this.marker = window.L.marker([initialLat, initialLng], { draggable: true }).addTo(this.map)
        this.marker.bindPopup('📍 <b>Pickup Location</b><br>Drag pin to your exact building entrance.').openPopup()

        this.marker.on('dragend', (e) => {
          const pos = e.target.getLatLng()
          this.form.latitude = pos.lat
          this.form.longitude = pos.lng
          this.reverseGeocode(pos.lat, pos.lng)
        })

        this.map.on('click', (e) => {
          const { lat: clickLat, lng: clickLng } = e.latlng
          this.form.latitude = clickLat
          this.form.longitude = clickLng
          this.marker.setLatLng([clickLat, clickLng])
          this.marker.bindPopup('📍 <b>Selected Pickup Point</b>').openPopup()
          this.reverseGeocode(clickLat, clickLng)
        })

        setTimeout(() => {
          if (this.map) this.map.invalidateSize()
        }, 250)
      } catch (err) {
        console.error('Leaflet init error:', err)
      }
    },

    async reverseGeocode(lat, lng) {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        const res = await fetch(url, { headers: { 'User-Agent': 'ClothBankWeb/1.0' } })
        const data = await res.json()
        if (data && data.display_name && !this.form.address) {
          this.form.address = data.display_name
        }
      } catch (e) {
      }
    },

    async searchAddressOnMap() {
      const address = (this.form.address || '').trim()

      if (!address) {
        alert('Please enter a street, landmark, or area name.')
        return
      }

      this.searchingLocation = true

      const queriesToTry = []
      queriesToTry.push(address)

      // Split address tokens (e.g. "Durbar Marg", "Kathmandu")
      const tokens = address.split(/[,;]/).map(t => t.trim()).filter(Boolean)
      tokens.forEach(t => {
        if (!queriesToTry.includes(t)) queriesToTry.push(t)
      })

      let foundLat = null
      let foundLng = null
      let matchedName = ''

      for (const q of queriesToTry) {
        if (foundLat !== null) break

        // Tier 1: Photon Fuzzy POI API (Best for offices, banks, hospitals, malls in Nepal)
        try {
          const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q + ' Nepal')}&lat=27.7172&lon=85.3240&limit=1`
          const pRes = await fetch(photonUrl)
          const pData = await pRes.json()
          if (pData && pData.features && pData.features.length > 0) {
            const geom = pData.features[0].geometry
            if (geom && geom.coordinates && geom.coordinates.length >= 2) {
              foundLng = geom.coordinates[0]
              foundLat = geom.coordinates[1]
              matchedName = (pData.features[0].properties && pData.features[0].properties.name) || q
              break
            }
          }
        } catch (e) {}

        if (foundLat !== null) break

        // Tier 2: OpenStreetMap Nominatim
        try {
          const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ', Nepal')}&limit=1`
          const nRes = await fetch(nomUrl, { headers: { 'User-Agent': 'ClothBankWeb/2.0' } })
          const nData = await nRes.json()
          if (nData && nData.length > 0) {
            foundLat = parseFloat(nData[0].lat)
            foundLng = parseFloat(nData[0].lon)
            matchedName = nData[0].display_name || q
            break
          }
        } catch (e) {}
      }

      this.searchingLocation = false

      if (foundLat !== null && foundLng !== null) {
        this.form.latitude = foundLat
        this.form.longitude = foundLng
        this.mapVisible = true

        if (this.map && this.marker) {
          this.map.setView([foundLat, foundLng], 16)
          this.marker.setLatLng([foundLat, foundLng])
          this.marker.bindPopup(`📍 <b>${matchedName}</b><br>GPS Pinned!`).openPopup()
        } else {
          this.initLeafletMap(foundLat, foundLng)
        }
      } else {
        alert('Could not pin exact GPS for this address. Please try adding city/area name (e.g. Durbar Marg, Baneshwor, Kathmandu).')
      }
    },

    detectLocation() {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.')
        return
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.form.latitude  = pos.coords.latitude
          this.form.longitude = pos.coords.longitude
          this.mapVisible = true
          if (this.map && this.marker) {
            this.map.setView([pos.coords.latitude, pos.coords.longitude], 16)
            this.marker.setLatLng([pos.coords.latitude, pos.coords.longitude])
            this.marker.bindPopup('📍 <b>Your Current Location</b>').openPopup()
          } else {
            this.initLeafletMap(pos.coords.latitude, pos.coords.longitude)
          }
          this.reverseGeocode(pos.coords.latitude, pos.coords.longitude)
        },
        () => alert('Unable to retrieve your location. Please check browser permissions.')
      )
    },

    async submitDonation() {
      this.error = ''

      const { campaign_id, donor_name, donor_phone, donor_email, collection_type } = this.form
      if (!campaign_id || !donor_name || !donor_phone || !donor_email) {
        this.error = 'Please fill in all required donor contact fields.'
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      if (collection_type === 'pickup' && (!this.form.latitude && !this.form.address)) {
        this.error = 'Please provide an address or pin your location on the map.'
        return
      }
      for (let i = 0; i < this.form.items.length; i++) {
        const item = this.form.items[i]
        if (!item.cloth_type_id || !item.quantity) {
          this.error = `Item ${i + 1}: Please select clothing type and quantity.`
          return
        }
      }

      this.loading = true

      let fullAddress = this.form.address ? this.form.address.trim() : ''
      if (this.form.location_tag) {
        const tagIcon = this.form.location_tag === 'office' ? '🏢 Office' : (this.form.location_tag === 'home' ? '🏠 Home' : '📍 Place')
        fullAddress = `[${tagIcon}] ${fullAddress}`
      }
      if (this.form.pickup_instructions && this.form.pickup_instructions.trim()) {
        fullAddress = `${fullAddress} (Note: ${this.form.pickup_instructions.trim()})`
      }

      const formData = new FormData()
      formData.append('campaign_id',     this.form.campaign_id)
      formData.append('donor_name',      this.form.donor_name)
      formData.append('donor_phone',     this.form.donor_phone)
      formData.append('donor_email',     this.form.donor_email)
      formData.append('collection_type', this.form.collection_type)
      if (this.form.latitude)  formData.append('latitude',  this.form.latitude)
      if (this.form.longitude) formData.append('longitude', this.form.longitude)
      if (fullAddress)         formData.append('address',   fullAddress)

      this.form.items.forEach((item, i) => {
        formData.append(`items[${i}][cloth_type_id]`, item.cloth_type_id)
        formData.append(`items[${i}][quantity]`,      item.quantity)
        if (item.note) formData.append(`items[${i}][note]`, item.note)
        item.files.forEach(file => {
          formData.append(`items[${i}][images][]`, file)
        })
      })

      try {
        const res = await donationApi.createFormData(formData)
        this.submitted   = true
        this.submittedId = res.data.donation.id
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (e) {
        const errors = e.response?.data?.errors
        if (errors) {
          this.error = Object.values(errors).flat().join(' ')
        } else {
          this.error = e.response?.data?.message || 'Submission failed. Please try again.'
        }
      } finally {
        this.loading = false
      }
    },

    resetForm() {
      this.submitted   = false
      this.submittedId = null
      this.mapVisible  = false
      this.map         = null
      this.marker      = null
      this.form = {
        campaign_id: (this.campaigns.length === 1 ? this.campaigns[0].id : ''),
        donor_name: '', donor_phone: '', donor_email: '',
        collection_type: 'pickup', latitude: null, longitude: null,
        address: '', items: [blankItem()],
      }
    }
  }
}
</script>

<style scoped>
.donate-page {
  min-height: 100vh;
  background-color: #f8fafc;
  padding-bottom: 60px;
}

/* ── Navbar ── */
.donate-navbar {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}
.navbar-container {
  max-width: 860px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-logo-img {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: contain;
}
.brand-icon {
  font-size: 24px;
}
.brand-title {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.brand-tag {
  background: #ecfdf5;
  color: #059669;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 9999px;
  letter-spacing: 0.04em;
}

/* ── Hero Banner ── */
.hero-section {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%);
  color: #ffffff;
  padding: 56px 20px 60px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.hero-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 24px;
  background: #f8fafc;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
}
.hero-container {
  max-width: 720px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}
.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 12.5px;
  font-weight: 600;
  margin-bottom: 16px;
  backdrop-filter: blur(4px);
}
.hero-title {
  font-size: 36px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 12px;
}
@media (max-width: 600px) {
  .hero-title { font-size: 28px; }
}
.hero-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 24px;
  line-height: 1.5;
}
.hero-stats {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
.stat-pill {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 13px;
  backdrop-filter: blur(4px);
}

/* ── Form Container ── */
.donate-container {
  max-width: 800px;
  margin: -10px auto 0;
  padding: 0 16px;
  position: relative;
  z-index: 10;
}
.form-section-card {
  box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.05);
}
.section-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}
.step-badge {
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25);
}
.section-heading h3 {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 580px) {
  .form-row { grid-template-columns: 1fr; }
}
.req {
  color: #e11d48;
}

/* ── Collection Selector ── */
.collection-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 580px) {
  .collection-selector { grid-template-columns: 1fr; }
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  border: 0;
}
.collection-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.collection-card:hover {
  border-color: #a7f3d0;
  background: #f8fafc;
}
.collection-card.selected {
  border-color: #059669;
  background: #f0fdf4;
  box-shadow: 0 0 0 1px #059669;
}
.collection-icon {
  font-size: 28px;
  flex-shrink: 0;
}
.collection-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}
.collection-title {
  font-weight: 700;
  font-size: 15px;
  color: #0f172a;
}
.collection-desc {
  font-size: 12.5px;
  color: #64748b;
  line-height: 1.4;
}
.select-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #059669;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 10px 0;
  flex-wrap: wrap;
}
.location-tag {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}
.map-container {
  width: 100%;
  height: 260px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  margin-top: 10px;
  overflow: hidden;
}

/* ── Item Entry Card ── */
.item-entry-card {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
  position: relative;
  transition: border-color 0.2s;
}
.item-entry-card:hover {
  border-color: #cbd5e1;
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.item-index-badge {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  background: #ffffff;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}
.remove-btn {
  background: none;
  border: none;
  color: #e11d48;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}
.remove-btn:hover {
  background: #fff1f2;
}

/* ── Photo Dropzone ── */
.photo-label {
  display: flex;
  gap: 8px;
  font-weight: 600;
  font-size: 13.5px;
  margin-bottom: 8px;
  color: #334155;
}
.dropzone {
  border: 2px dashed #cbd5e1;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dropzone:hover {
  border-color: #059669;
  background: #f0fdf4;
}
.dropzone-empty {
  text-align: center;
}
.dropzone-icon {
  font-size: 26px;
}
.dropzone-text {
  font-size: 13.5px;
  font-weight: 600;
  color: #334155;
  margin: 4px 0 2px;
}
.dropzone-hint {
  font-size: 11.5px;
  color: #94a3b8;
}

.preview-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
}
.preview-card {
  position: relative;
  width: 76px;
  height: 76px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
}
.preview-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.delete-photo-btn {
  position: absolute;
  top: 3px;
  right: 3px;
  background: rgba(15, 23, 42, 0.75);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-add-card {
  width: 76px;
  height: 76px;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}
.preview-add-card:hover {
  border-color: #059669;
  color: #059669;
}

/* ── Summary Pill ── */
.summary-pill {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 12px 18px;
  border-radius: 12px;
  margin-top: 8px;
}
.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: #065f46;
}
.summary-divider {
  width: 1px;
  height: 18px;
  background: #a7f3d0;
}
.total-qty-number {
  font-size: 16px;
  color: #047857;
  font-weight: 800;
}

.submit-bar {
  margin-top: 24px;
}
.submit-btn {
  box-shadow: 0 10px 25px -4px rgba(5, 150, 105, 0.4);
  font-size: 16px;
}

/* ── Success Screen ── */
.success-card {
  text-align: center;
  padding: 56px 36px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08);
  margin-top: 20px;
}
.success-celebration {
  font-size: 48px;
  margin-bottom: 12px;
}
.success-icon-wrap {
  width: 68px;
  height: 68px;
  background: #ecfdf5;
  border: 3px solid #a7f3d0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}
.check-icon {
  font-size: 32px;
  color: #059669;
  font-weight: 800;
}
.success-card h2 {
  font-size: 26px;
  color: #0f172a;
  margin-bottom: 12px;
}
.success-desc {
  color: #475569;
  font-size: 15px;
  max-width: 520px;
  margin: 0 auto 24px;
  line-height: 1.6;
}
.ref-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  padding: 8px 18px;
  border-radius: 9999px;
  margin-bottom: 28px;
}
.ref-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}
.ref-code {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}
.spinner-sm {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

/* ── Location Preset Chips & Actions ── */
.location-preset-chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.location-chip {
  background: #f1f5f9;
  border: 1.5px solid #cbd5e1;
  color: #334155;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.location-chip:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
}
.location-chip.active {
  background: #eff6ff;
  border-color: #2563eb;
  color: #1d4ed8;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.15);
}

.input-with-action {
  display: flex;
  gap: 8px;
}
.input-with-action input {
  flex: 1;
}

.btn-outline-primary {
  background: #ffffff;
  border: 1.5px solid #2563eb;
  color: #2563eb;
  font-weight: 700;
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.2s;
  cursor: pointer;
}
.btn-outline-primary:hover {
  background: #2563eb;
  color: #ffffff;
}

/* ── Interactive Leaflet Map Container ── */
.map-container {
  height: 320px;
  width: 100%;
  border-radius: 14px;
  margin-top: 14px;
  border: 2px solid #cbd5e1;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
}
</style>
