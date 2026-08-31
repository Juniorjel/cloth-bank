<template>
  <div class="saas-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Cloth Categories</h1>
        <p class="text-muted">Manage the clothing types that donors can select from when creating donations.</p>
      </div>
      <button class="btn btn-primary btn-sm" @click="openModal()">
        <span>+</span> Add Category
      </button>
    </div>

    <div v-if="loading" class="spinner-wrap">
      <div class="spinner"></div>
      <p>Loading categories…</p>
    </div>

    <div v-else class="card table-card mb-0">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="width: 70px;">ID</th>
              <th>Category Name</th>
              <th>Status</th>
              <th class="text-center" style="width: 180px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in types" :key="t.id">
              <td>
                <span class="font-medium text-muted">#{{ t.id }}</span>
              </td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <span>👕</span>
                  <span class="font-semibold text-main">{{ t.name }}</span>
                </div>
              </td>
              <td>
                <span :class="'badge ' + (t.is_active ? 'badge-verified' : 'badge-inactive')">
                  ● {{ t.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="text-center">
                <div class="d-flex gap-1 justify-content-center">
                  <button class="btn btn-secondary btn-sm" @click="openModal(t)" title="Edit Name">
                    Edit
                  </button>
                  <button
                    class="btn btn-sm"
                    :class="t.is_active ? 'btn-warning' : 'btn-success'"
                    @click="toggleStatus(t)"
                  >
                    {{ t.is_active ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button
                    class="btn btn-danger btn-sm"
                    @click="deleteType(t.id)"
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!types.length">
              <td colspan="4" class="text-center text-muted py-5">
                <p class="mb-0">No clothing categories configured. Click "Add Category" to create one.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal-backdrop" v-if="showModal" @click.self="showModal = false">
      <div class="modal">
        <h3 class="modal-title">{{ editing ? 'Edit Category' : 'New Cloth Category' }}</h3>
        
        <div v-if="formError" class="alert alert-error">
          <div>{{ formError }}</div>
        </div>
        <div v-if="formSuccess" class="alert alert-success">
          <div>{{ formSuccess }}</div>
        </div>

        <div class="form-group">
          <label>Category Name</label>
          <input
            v-model="form.name"
            class="form-control"
            placeholder="e.g. Winter Jackets & Coats"
            @keyup.enter="save"
            required
          />
        </div>

        <div class="form-group">
          <label>Status</label>
          <select v-model="form.is_active" class="form-control">
            <option :value="true">Active (Visible to donors)</option>
            <option :value="false">Inactive (Disabled)</option>
          </select>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showModal = false">Cancel</button>
          <button type="button" class="btn btn-primary" :disabled="saving" @click="save">
            <span v-if="saving">Saving…</span>
            <span v-else>{{ editing ? 'Save Changes' : 'Create Category' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import clothTypeApi from '../../api/clothTypes'

export default {
  name: 'AdminClothTypes',
  data() {
    return {
      types:       [],
      loading:     true,
      showModal:   false,
      editing:     null,
      saving:      false,
      formError:   '',
      formSuccess: '',
      form:        { name: '', is_active: true },
    }
  },
  async created() {
    await this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const res  = await clothTypeApi.getAll()
        this.types = res.data
      } finally {
        this.loading = false
      }
    },
    openModal(type = null) {
      this.editing     = type
      this.formError   = ''
      this.formSuccess = ''
      this.form = type
        ? { name: type.name, is_active: type.is_active }
        : { name: '', is_active: true }
      this.showModal = true
    },
    async save() {
      if (!this.form.name.trim()) {
        this.formError = 'Category name is required.'
        return
      }
      this.saving    = true
      this.formError = ''
      try {
        if (this.editing) {
          await clothTypeApi.update(this.editing.id, this.form)
          this.formSuccess = 'Category updated successfully!'
        } else {
          await clothTypeApi.create(this.form)
          this.formSuccess = 'Category created successfully!'
        }
        await this.load()
        setTimeout(() => { this.showModal = false }, 800)
      } catch (e) {
        const errors = e.response?.data?.errors
        this.formError = errors
          ? Object.values(errors).flat().join(' ')
          : (e.response?.data?.message || 'Failed to save.')
      } finally {
        this.saving = false
      }
    },
    async toggleStatus(type) {
      try {
        await clothTypeApi.update(type.id, { is_active: !type.is_active })
        type.is_active = !type.is_active
      } catch (e) {
        alert('Failed to update status.')
      }
    },
    async deleteType(id) {
      if (!confirm('Delete this cloth category? Categories in use by past donations cannot be deleted.')) return
      try {
        await clothTypeApi.delete(id)
        this.types = this.types.filter(t => t.id !== id)
      } catch (e) {
        alert(e.response?.data?.message || 'Cannot delete — it is in use by past donations.')
      }
    },
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
