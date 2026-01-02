<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div class="hero-content">
        <div>
          <p class="eyebrow">Bookings</p>
          <h2 class="hero-title">Booking Details</h2>
          <p class="muted">Reference: {{ booking?.booking_reference || '--' }}</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="panel glassy">
      <p class="muted">Loading booking...</p>
    </div>
    <div v-else-if="!booking" class="panel glassy">
      <p class="muted">Booking not found.</p>
    </div>
    <div v-else class="detail-grid">
      <div class="panel glassy">
        <h4>Booking Info</h4>
        <div class="kv">
          <div><span>Reference</span><strong>{{ booking.booking_reference || '--' }}</strong></div>
          <div><span>Manual ID</span><strong>{{ booking.manual_booking_id || '--' }}</strong></div>
          <div><span>Booking Type</span><strong>{{ booking.booking_type?.title || '--' }}</strong></div>
          <div><span>Service Provider</span><strong>{{ booking.service_provider?.title || '--' }}</strong></div>
          <div><span>Pieces</span><strong>{{ booking.number_pieces ?? 0 }}</strong></div>
          <div><span>Charged Weight</span><strong>{{ booking.volumetric_weight }}</strong></div>
          <div><span>Payable</span><strong>{{ formatCurrency(booking.charge_detail?.payable_amount) }}</strong></div>
          <div><span>Payment Status</span><strong>{{ booking.charge_detail?.payment_status || '--' }}</strong></div>
          <div><span>Created At</span><strong>{{ formatDate(booking.created_at) }}</strong></div>
        </div>
      </div>

      <div class="panel glassy">
        <h4>Shipper Details</h4>
        <div class="kv">
          <div><span>Name</span><strong>{{ booking.shipper_detail?.name || '--' }}</strong></div>
          <div><span>Phone</span><strong>{{ booking.shipper_detail?.phone || '--' }}</strong></div>
          <div><span>Address</span><strong>{{ booking.shipper_detail?.address || '--' }}</strong></div>
          <div><span>Address 2</span><strong>{{ booking.shipper_detail?.address_two || '--' }}</strong></div>
          <div><span>Pincode</span><strong>{{ booking.shipper_detail?.pincode || '--' }}</strong></div>
        </div>
      </div>

      <div class="panel glassy">
        <h4>Consignee Details</h4>
        <div class="kv">
          <div><span>Name</span><strong>{{ booking.consignee_detail?.consignee_name || '--' }}</strong></div>
          <div><span>Phone</span><strong>{{ booking.consignee_detail?.consignee_phone || '--' }}</strong></div>
          <div><span>Address</span><strong>{{ booking.consignee_detail?.consignee_address || '--' }}</strong></div>
          <div><span>Address 2</span><strong>{{ booking.consignee_detail?.consignee_address_two || '--' }}</strong></div>
          <div><span>Zip/Pincode</span><strong>{{ booking.consignee_detail?.consignee_zipcode || '--' }}</strong></div>
          <div><span>State</span><strong>{{ booking.consignee_detail?.consignee_state || '--' }}</strong></div>
          <div><span>City</span><strong>{{ booking.consignee_detail?.consignee_city || '--' }}</strong></div>
        </div>
      </div>

      <div class="panel glassy">
        <h4>Packages</h4>
        <div class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Weight</th>
                <th>Pieces</th>
                <th>L</th>
                <th>W</th>
                <th>H</th>
                <th>Vol Wt.</th>
                <th>Chrg Wt.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!booking.package_details?.length">
                <td colspan="8" class="muted">No packages.</td>
              </tr>
              <tr v-for="(pkg, idx) in booking.package_details" :key="pkg.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ pkg.weight }}</td>
                <td>{{ pkg.pieces }}</td>
                <td>{{ pkg.length }}</td>
                <td>{{ pkg.width }}</td>
                <td>{{ pkg.height }}</td>
                <td>{{ pkg.volume_weight }}</td>
                <td>{{ pkg.charged_weight }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel glassy">
        <h4>List of Items</h4>
        <div class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Box No</th>
                <th>Packages</th>
                <th>Description</th>
                <th>HSN</th>
                <th>Qty</th>
                <th>Weight</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!booking.shipment_items?.length">
                <td colspan="10" class="muted">No items.</td>
              </tr>
              <tr v-for="(item, idx) in booking.shipment_items" :key="item.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ item.box_number || '--' }}</td>
                <td>{{ item.packages || '--' }}</td>
                <td>{{ item.description || '--' }}</td>
                <td>{{ item.hsn_code || '--' }}</td>
                <td>{{ item.quantity ?? '--' }}</td>
                <td>{{ item.weight ?? '--' }}</td>
                <td>{{ item.unit || '--' }}</td>
                <td>{{ item.rate ?? '--' }}</td>
                <td>{{ item.amount ?? '--' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel glassy" v-if="booking.charge_detail || booking.performa_detail">
        <h4>Charges & Performa</h4>
        <div class="kv">
          <div><span>Payment Type</span><strong>{{ booking.charge_detail?.payment_type || '--' }}</strong></div>
          <div><span>Payable Amount</span><strong>{{ formatCurrency(booking.charge_detail?.payable_amount) }}</strong></div>
          <div><span>Invoice #</span><strong>{{ booking.performa_detail?.invoice_number || '--' }}</strong></div>
          <div><span>Invoice Date</span><strong>{{ formatDate(booking.performa_detail?.invoice_date) }}</strong></div>
          <div><span>Department #</span><strong>{{ booking.performa_detail?.department_number || '--' }}</strong></div>
          <div><span>Format</span><strong>{{ booking.performa_detail?.format || '--' }}</strong></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/http'

const route = useRoute()
const booking = ref(null)
const loading = ref(false)

const formatCurrency = (val) => {
  const n = Number(val)
  return Number.isFinite(n) ? `₹ ${n.toFixed(2)}` : '--'
}

const formatDate = (val) => {
  if (!val) return '--'
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return val
  return d.toLocaleString()
}

const fetchBooking = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const { data } = await api.get(`/bookings/${id}`)
    booking.value = data.data || null
  } catch {
    booking.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBooking()
})
</script>

<style scoped>
.detail-grid {
  display: grid;
  gap: 1rem;
}

.kv {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.5rem 1rem;
  margin-top: 0.5rem;
}

.kv div {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.35rem 0.45rem;
  border: 1px dashed #e2e8f5;
  border-radius: 10px;
}

.kv span {
  font-size: 0.82rem;
  color: #7b88a8;
}

.kv strong {
  color: #0f172a;
}

.table-wrap {
  border: 1px solid #e2e8f5;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.fx-table {
  width: 100%;
  border-collapse: collapse;
}

.fx-table th,
.fx-table td {
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid #e9eef7;
  text-align: left;
}

.fx-table thead {
  background: #f5f7fb;
}

.fx-table tbody tr:last-child td {
  border-bottom: none;
}

.muted {
  color: #8b95b1;
}

.detail-grid .panel.glassy {
    border-radius: 12px;
    padding: 0 18px 25px 18px;
}
</style>
