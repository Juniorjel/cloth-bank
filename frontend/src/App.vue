<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* ─── Stripe / Vercel Clean Modern Minimalist SaaS Design System ─── */
:root {
  /* Brand / Primary */
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --primary-light: #eef2ff;
  --primary-focus: rgba(79, 70, 229, 0.15);

  /* Neutrals */
  --bg-app: #f8fafc;
  --bg-surface: #ffffff;
  --bg-subtle: #f1f5f9;
  --bg-hover: #f8fafc;
  
  --text-main: #0f172a;
  --text-secondary: #334155;
  --text-muted: #64748b;
  --text-light: #94a3b8;

  /* Borders & Dividers */
  --border-subtle: #e2e8f0;
  --border-card: #e2e8f0;
  --border-input: #cbd5e1;
  --border-focus: #6366f1;

  /* Status Colors */
  --success: #10b981;
  --success-light: #ecfdf5;
  --success-border: #a7f3d0;
  --success-text: #065f46;

  --warning: #f59e0b;
  --warning-light: #fffbeb;
  --warning-border: #fde68a;
  --warning-text: #92400e;

  --danger: #ef4444;
  --danger-light: #fef2f2;
  --danger-border: #fecaca;
  --danger-text: #991b1b;

  --info: #0ea5e9;
  --info-light: #f0f9ff;
  --info-border: #bae6fd;
  --info-text: #075985;

  /* Shadows */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
  --shadow-modal: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* Radii */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}

/* ─── Global Reset & Base Typography ─── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-app);
  color: var(--text-main);
  font-size: 13.5px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  color: var(--text-main);
  font-weight: 700;
  letter-spacing: -0.02em;
}

h1 { font-size: 22px; }
h2 { font-size: 18px; }
h3 { font-size: 15px; }
h4 { font-size: 13.5px; }

p {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.text-muted {
  color: var(--text-muted) !important;
  font-size: 12px;
}
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-left { text-align: left; }
.w-full, .w-100 { width: 100%; }

/* ─── Responsive Utilities & Flex Grid ─── */
.d-flex { display: flex !important; }
.d-inline-flex { display: inline-flex !important; }
.d-block { display: block !important; }
.d-none { display: none !important; }
.flex-column { flex-direction: column !important; }
.flex-wrap { flex-wrap: wrap !important; }
.align-items-center { align-items: center !important; }
.align-items-start { align-items: flex-start !important; }
.justify-content-between { justify-content: space-between !important; }
.justify-content-center { justify-content: center !important; }
.flex-1 { flex: 1 !important; }
.flex-shrink-0 { flex-shrink: 0 !important; }

.gap-1 { gap: 4px !important; }
.gap-2 { gap: 8px !important; }
.gap-3 { gap: 12px !important; }
.gap-4 { gap: 16px !important; }

.m-0 { margin: 0 !important; }
.mb-0 { margin-bottom: 0 !important; }
.mb-1 { margin-bottom: 4px !important; }
.mb-2 { margin-bottom: 8px !important; }
.mb-3 { margin-bottom: 12px !important; }
.mb-4 { margin-bottom: 16px !important; }
.mt-0 { margin-top: 0 !important; }
.mt-1 { margin-top: 4px !important; }
.mt-2 { margin-top: 8px !important; }
.mt-3 { margin-top: 12px !important; }
.mt-4 { margin-top: 16px !important; }
.ms-1 { margin-left: 4px !important; }
.ms-2 { margin-left: 8px !important; }
.me-1 { margin-right: 4px !important; }
.me-2 { margin-right: 8px !important; }

.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -8px;
  margin-left: -8px;
}
.row.g-2 { margin-right: -4px; margin-left: -4px; }
.row.g-2 > * { padding-right: 4px; padding-left: 4px; }
.row.g-3 { margin-right: -6px; margin-left: -6px; }
.row.g-3 > * { padding-right: 6px; padding-left: 6px; }
.row.g-4 { margin-right: -10px; margin-left: -10px; }
.row.g-4 > * { padding-right: 10px; padding-left: 10px; }

.row > * {
  box-sizing: border-box;
  flex-shrink: 0;
  width: 100%;
  max-width: 100%;
  padding-right: 8px;
  padding-left: 8px;
}

.col-12 { flex: 0 0 100%; max-width: 100%; }
.col-6 { flex: 0 0 50%; max-width: 50%; }
.col-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
.col-3 { flex: 0 0 25%; max-width: 25%; }

@media (min-width: 576px) {
  .col-sm-6 { flex: 0 0 50%; max-width: 50%; }
  .col-sm-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .col-sm-3 { flex: 0 0 25%; max-width: 25%; }
  .d-sm-flex { display: flex !important; }
  .d-sm-inline-flex { display: inline-flex !important; }
  .d-sm-block { display: block !important; }
  .d-sm-none { display: none !important; }
}

@media (min-width: 768px) {
  .col-md-3 { flex: 0 0 25%; max-width: 25%; }
  .col-md-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .col-md-6 { flex: 0 0 50%; max-width: 50%; }
  .col-md-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
  .col-md-12 { flex: 0 0 100%; max-width: 100%; }
  .d-md-block { display: block !important; }
  .d-md-flex { display: flex !important; }
  .d-md-inline-block { display: inline-block !important; }
  .d-md-none { display: none !important; }
}

@media (min-width: 992px) {
  .col-lg-3 { flex: 0 0 25%; max-width: 25%; }
  .col-lg-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .col-lg-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
  .col-lg-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
  .col-lg-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
  .d-lg-block { display: block !important; }
  .d-lg-flex { display: flex !important; }
  .d-lg-none { display: none !important; }
}

/* ─── Buttons ─── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
  line-height: 1.25;
  white-space: nowrap;
  min-height: 34px;
}

.btn:active {
  transform: translateY(1px);
}
.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background-color: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
  box-shadow: 0 1px 2px rgba(79, 70, 229, 0.2);
}
.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
}

.btn-secondary {
  background-color: #ffffff;
  color: var(--text-secondary);
  border-color: var(--border-subtle);
  box-shadow: var(--shadow-xs);
}
.btn-secondary:hover:not(:disabled) {
  background-color: var(--bg-hover);
  color: var(--text-main);
  border-color: #cbd5e1;
}

.btn-success {
  background-color: #059669;
  color: #ffffff;
  border-color: #059669;
}
.btn-success:hover:not(:disabled) {
  background-color: #047857;
}

.btn-danger {
  background-color: #ffffff;
  color: #e11d48;
  border-color: #fecdd3;
}
.btn-danger:hover:not(:disabled) {
  background-color: #fff1f2;
  border-color: #fda4af;
}

.btn-warning {
  background-color: #d97706;
  color: #ffffff;
  border-color: #d97706;
}
.btn-warning:hover:not(:disabled) {
  background-color: #b45309;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
  border-radius: var(--radius-sm);
  min-height: 28px;
}
.btn-lg {
  padding: 10px 18px;
  font-size: 14px;
  border-radius: var(--radius-md);
  min-height: 40px;
}

/* ─── Cards & Containers ─── */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 18px 20px;
  margin-bottom: 16px;
  position: relative;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 8px;
}
.card-title {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--text-main);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

/* ─── Forms & Inputs ─── */
.form-group {
  margin-bottom: 14px;
}
.form-group label {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 5px;
}
.form-control {
  width: 100%;
  padding: 7px 12px;
  font-size: 13px;
  font-family: inherit;
  color: var(--text-main);
  background-color: #ffffff;
  border: 1px solid var(--border-input);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  transition: all 0.15s ease;
  outline: none;
  min-height: 34px;
}
.form-control:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--primary-focus);
}
.form-control::placeholder {
  color: var(--text-light);
}

/* ─── Clean Responsive Tables ─── */
.table-wrap, .table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: #ffffff;
}
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  text-align: left;
  min-width: 600px;
}
thead th {
  background-color: #f8fafc;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-subtle);
  white-space: nowrap;
}
tbody tr {
  transition: background-color 0.1s ease;
}
tbody tr:hover {
  background-color: #f8fafc;
}
tbody td {
  padding: 11px 14px;
  border-bottom: 1px solid #f1f5f9;
  color: var(--text-secondary);
  vertical-align: middle;
}
tbody tr:last-child td {
  border-bottom: none;
}

/* ─── Modern Status Badges ─── */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  border: 1px solid transparent;
  line-height: 1.2;
  text-transform: capitalize;
  white-space: nowrap;
}

.badge-pending {
  background-color: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}
.badge-assigned {
  background-color: #eff6ff;
  color: #1e40af;
  border-color: #bfdbfe;
}
.badge-picked_up {
  background-color: #f5f3ff;
  color: #6b21a8;
  border-color: #ddd6fe;
}
.badge-delivered {
  background-color: #fff1f2;
  color: #9f1239;
  border-color: #fecdd3;
}
.badge-verified, .badge-active {
  background-color: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}
.badge-inactive {
  background-color: #f1f5f9;
  color: #475569;
  border-color: #e2e8f0;
}

/* ─── Alerts ─── */
.alert {
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  border: 1px solid transparent;
}
.alert-success {
  background-color: var(--success-light);
  color: var(--success-text);
  border-color: var(--success-border);
}
.alert-error {
  background-color: var(--danger-light);
  color: var(--danger-text);
  border-color: var(--danger-border);
}

/* ─── Modals ─── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 14px;
}
.modal {
  background: #ffffff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  border: 1px solid var(--border-subtle);
  width: 100%;
  max-width: 500px;
  padding: 22px;
  max-height: 92vh;
  overflow-y: auto;
  animation: modalEnter 0.15s ease-out;
}
@keyframes modalEnter {
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
}
.modal h3, .modal-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 14px;
  color: var(--text-main);
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

/* ─── Spinners ─── */
.spinner-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  gap: 12px;
  color: var(--text-muted);
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
