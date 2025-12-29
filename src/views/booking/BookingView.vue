<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div class="hero-content">
        <div>
          <p class="eyebrow">Booking</p>
          <h2 class="hero-title">New Shipment</h2>
        </div>
      </div>
    </div>

    <div class="card">
      <h4>Account Details</h4>
        <div class="grid grid-4">
          <div>
            <label class="field-label">Date</label>
            <input class="input c-height" type="date" :value="today" disabled />
          </div>
          <div>
            <label class="field-label">Time</label>
            <input class="input c-height" type="time" :value="now" disabled />
          </div>
          <div>
            <label class="field-label">Booking Type</label>
            <div class="custom-select" :class="{ disabled: bookingTypeDisabled }" @click="!bookingTypeDisabled && (bookingTypeOpen = !bookingTypeOpen)">
              <div class="select-display">
                <span v-if="bookingTypeLabel">{{ bookingTypeLabel }}</span>
                <span v-else class="muted">Select booking type</span>
                <i :class="['pi', bookingTypeOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
              </div>
              <div v-if="bookingTypeOpen && !bookingTypeDisabled" class="select-dropdown">
                <div
                  v-for="bt in bookingTypes"
                  :key="bt.id"
                  class="select-option"
                  @click.stop="selectBookingType(bt.id)"
                >
                  {{ bt.title }}
                </div>
              </div>
            </div>
            <p v-if="errors.bookingType" class="error-text">{{ errors.bookingType }}</p>
          </div>
          <div>
            <label class="field-label">Agent ID</label>
            <div class="custom-select" @click="agentOpen = !agentOpen">
              <div class="select-display">
                <span v-if="selectedAgent">{{ selectedAgent.username }} - {{ selectedAgent.name }}</span>
                <span v-else class="muted">Select agent</span>
                <i :class="['pi', agentOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
              </div>
              <div v-if="agentOpen" class="select-dropdown">
                <div
                  v-for="agent in agents"
                  :key="agent.id"
                  class="select-option"
                  @click.stop="selectAgent(agent.id)"
                >
                  {{ agent.username }} - {{ agent.name }}
                </div>
              </div>
            </div>
          </div>
        <div>
          <label class="field-label">Company Name</label>
          <div class="locked-input" :class="{ disabled: companyLocked }">
            <input class="input c-height" type="text" v-model="companyName" :disabled="companyLocked" />
            <i v-if="companyLocked" class="pi pi-lock"></i>
          </div>
        </div>
        <div>
          <label class="field-label">Manual Booking ID</label>
          <input class="input c-height" type="text" v-model="manualBookingId" placeholder="Enter manual booking ID" />
          <p class="muted small input-note">Enter if booking was taken manually</p>
        </div>
      </div>
    </div>

    <div class="grid panels m-top-2 m-bottom-2">
      <div class="panel">
        <h4>Shipper Details</h4>
        <div class="grid grid-2">
          <div>
            <label class="field-label">Name</label>
            <input class="input c-height" type="text" v-model="shipper.name" />
            <p v-if="errors.shipperName" class="error-text">{{ errors.shipperName }}</p>
          </div>
          <div>
            <label class="field-label">Address</label>
            <input class="input c-height" type="text" v-model="shipper.address" />
            <p v-if="errors.shipperAddress" class="error-text">{{ errors.shipperAddress }}</p>
          </div>
          <div>
            <label class="field-label">Phone No</label>
            <input class="input c-height" type="text" v-model="shipper.phone" />
            <p v-if="errors.shipperPhone" class="error-text">{{ errors.shipperPhone }}</p>
          </div>
          <div>
            <label class="field-label">Address 2</label>
            <input class="input c-height" type="text" v-model="shipper.address2" />
          </div>
          <div>
            <label class="field-label">State</label>
            <div class="custom-select" @click="stateOpen = !stateOpen">
              <div class="select-display">
                <span v-if="selectedState">{{ selectedState.title }}</span>
                <span v-else class="muted">Choose state</span>
                <i :class="['pi', stateOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
              </div>
              <div v-if="stateOpen" class="select-dropdown">
                <div class="dropdown-search" @click.stop>
                  <input class="input c-height" type="text" v-model="stateSearch" placeholder="Search state..." />
                </div>
                <div
                  v-for="state in filteredStates"
                  :key="state.id"
                  class="select-option"
                  @click.stop="selectState(state.id)"
                >
                  {{ state.title }}
                </div>
              </div>
            </div>
            <p v-if="errors.shipperState" class="error-text">{{ errors.shipperState }}</p>
          </div>
          <div>
            <label class="field-label">City</label>
            <div class="custom-select" :class="{ disabled: !shipperStateId }" @click="cityOpen = !cityOpen && !!shipperStateId">
              <div class="select-display">
                <span v-if="selectedCity">{{ selectedCity.title }}</span>
                <span v-else class="muted">Choose city</span>
                <i :class="['pi', cityOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
              </div>
              <div v-if="cityOpen" class="select-dropdown">
                <div class="dropdown-search" @click.stop>
                  <input class="input c-height" type="text" v-model="citySearch" placeholder="Search city..." />
                </div>
                <div
                  v-for="city in filteredShipperCities"
                  :key="city.id"
                  class="select-option"
                  @click.stop="selectCity(city.id)"
                >
                  {{ city.title }}
                </div>
              </div>
            </div>
            <p v-if="errors.shipperCity" class="error-text">{{ errors.shipperCity }}</p>
          </div>
          <div>
            <label class="field-label">Pincode</label>
            <input class="input c-height" type="text" v-model="shipper.pincode" />
            <p v-if="errors.shipperPincode" class="error-text">{{ errors.shipperPincode }}</p>
          </div>
          <div>
            <label class="field-label">Aadhaar</label>
            <input class="input c-height" type="text" v-model="shipper.aadhaar" />
          </div>
        </div>
      </div>

      <div class="panel">
        <h4>Consignee Details</h4>
        <div class="m-bottom-1">
          <label class="field-label">Destination</label>
          <div class="custom-select" @click="destOpen = !destOpen">
            <div class="select-display">
              <span v-if="selectedDestination">{{ selectedDestination.title }} ({{ selectedDestination.code }})</span>
              <span v-else class="muted">Choose One</span>
              <i :class="['pi', destOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
            </div>
            <div v-if="destOpen" class="select-dropdown">
              <div class="dropdown-search" @click.stop>
                <input class="input c-height" type="text" v-model="destSearch" placeholder="Search destination..." />
              </div>
              <div
                v-for="dest in filteredDestinations"
                :key="dest.id"
                class="select-option"
                @click.stop="selectDestination(dest.id)"
              >
                {{ dest.title }} ({{ dest.code }})
              </div>
            </div>
          </div>
          <p v-if="errors.destination" class="error-text">{{ errors.destination }}</p>
        </div>
        <div class="grid grid-2">
          <div>
            <label class="field-label">Name</label>
            <input class="input c-height" type="text" v-model="consigneeForm.name" />
            <p v-if="errors.consigneeName" class="error-text">{{ errors.consigneeName }}</p>
          </div>
          <div>
            <label class="field-label">Phone No</label>
            <input class="input c-height" type="text" v-model="consigneeForm.phone" />
            <p v-if="errors.consigneePhone" class="error-text">{{ errors.consigneePhone }}</p>
          </div>
          <div>
            <label class="field-label">Address</label>
            <input class="input c-height" type="text" v-model="consigneeForm.address" />
            <p v-if="errors.consigneeAddress" class="error-text">{{ errors.consigneeAddress }}</p>
          </div>
          <div>
            <label class="field-label">Address Line 2</label>
            <input class="input c-height" type="text" v-model="consigneeForm.address2" />
          </div>
          <div>
            <label class="field-label">Zip code</label>
            <input class="input c-height" type="text" v-model="consigneeForm.zipcode" />
            <p v-if="errors.consigneeZip" class="error-text">{{ errors.consigneeZip }}</p>
          </div>
        </div>
      </div>

      <div class="panel">
        <h4>Service Details</h4>
        <div class="grid grid-2">
          <div>
            <label class="field-label">Package Type</label>
            <div class="custom-select" @click="packageOpen = !packageOpen">
              <div class="select-display">
                <span v-if="selectedPackageTypeLabel">{{ selectedPackageTypeLabel }}</span>
                <span v-else class="muted">Select type</span>
                <i :class="['pi', packageOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
              </div>
              <div v-if="packageOpen" class="select-dropdown">
                <div
                  v-for="pkg in packageTypes"
                  :key="pkg.id"
                  class="select-option"
                  @click.stop="selectPackageType(pkg.id)"
                >
                  {{ pkg.title }}
                </div>
              </div>
            </div>
            <p v-if="errors.packageType" class="error-text">{{ errors.packageType }}</p>
          </div>
          <div>
            <label class="field-label">Courier Service</label>
            <div class="vendor-select" @click="vendorOpen = !vendorOpen">
              <div class="vendor-display input">
                <div v-if="selectedVendor" class="vendor-chip">
                  <img v-if="selectedVendor.logo" :src="selectedVendor.logo" alt="" />
                  <span>{{ selectedVendor.title }}</span>
                </div>
                <span v-else class="muted">Select courier</span>
                <i :class="['pi', vendorOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
              </div>
              <div v-if="vendorOpen" class="vendor-dropdown">
                <div
                  v-for="vendor in filteredVendors"
                  :key="vendor.id"
                  class="vendor-option"
                  @click.stop="selectVendor(vendor.id)"
                >
                  <img v-if="vendor.logo" :src="vendor.logo" alt="" />
                  <span>{{ vendor.title }}</span>
                </div>
              </div>
            </div>
            <p v-if="errors.vendor" class="error-text">{{ errors.vendor }}</p>
          </div>
          <div>
            <label class="field-label">Service Type</label>
            <div
              class="custom-select"
              :class="{ disabled: serviceTypeDisabled }"
              @click="!serviceTypeDisabled && (serviceTypeOpen = !serviceTypeOpen)"
            >
              <div class="select-display">
                <span v-if="selectedServiceType">{{ selectedServiceType.title }}</span>
                <span v-else class="muted">Select type</span>
                <i :class="['pi', serviceTypeOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
              </div>
              <div v-if="serviceTypeOpen && !serviceTypeDisabled" class="select-dropdown">
                <div
                  v-for="stype in filteredServiceTypes"
                  :key="stype.id"
                  class="select-option"
                  @click.stop="selectServiceType(stype.id)"
                >
                  {{ stype.title }}
                </div>
              </div>
            </div>
            <p v-if="errors.serviceType" class="error-text">{{ errors.serviceType }}</p>
          </div>
          <div>
            <label class="field-label">Actual Weight</label>
            <div class="locked-input">
              <input class="input c-height" type="text" :value="actualWeightDisplay" disabled />
              <i class="pi pi-lock"></i>
            </div>
          </div>
          <div>
            <label class="field-label">Scale</label>
            <input class="input c-height" type="text" value="KGS" disabled />
          </div>
          <div>
            <label class="field-label">Volumetric Weight</label>
            <div class="locked-input">
              <input class="input c-height" type="text" :value="volumetricWeightDisplay" disabled />
              <i class="pi pi-lock"></i>
            </div>
          </div>
          <div>
            <label class="field-label">No of Pieces</label>
            <div class="locked-input">
              <input class="input c-height" type="text" :value="piecesDisplay" disabled />
              <i class="pi pi-lock"></i>
            </div>
          </div>
          <div>
            <label class="field-label">Shipment Value</label>
            <input class="input c-height" type="text" v-model="shipmentValue" />
          </div>
          <div>
            <label class="field-label">Currency</label>
            <input class="input c-height" type="text" value="INR" disabled />
          </div>
          <div>
            <label class="field-label">Shipment Type</label>
            <div class="custom-select" @click="shipmentOpen = !shipmentOpen">
              <div class="select-display">
                <span v-if="shipmentLabel">{{ shipmentLabel }}</span>
                <span v-else class="muted">Select type</span>
                <i :class="['pi', shipmentOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
              </div>
              <div v-if="shipmentOpen" class="select-dropdown">
                <div class="select-option" @click.stop="selectShipmentType('Commercial')">Commercial</div>
                <div class="select-option" @click.stop="selectShipmentType('Non-Commercial')">Non-Commercial</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="package-header">
        <div>
          <h4>Package Details</h4>
          <span class="muted small">Unit measurement is in centimeters / 5000</span>
        </div>
        <button
          v-if="!isDomesticOrCargo"
          class="chip add"
          type="button"
          @click="addPackage"
        >
          <i class="pi pi-plus"></i>
        </button>
      </div>
        <div
          v-for="(pkg, idx) in packages"
          :key="pkg.id"
          class="grid grid-8 package-row"
        >
        <div>
          <label class="field-label">Weight</label>
          <input v-model="pkg.weight" class="input c-height" type="text" @input="recalcPackage(pkg)" />
        </div>
        <div>
          <label class="field-label">Pieces</label>
          <input v-model="pkg.pieces" class="input c-height" type="text" />
        </div>
        <div>
          <label class="field-label">Length</label>
          <input v-model="pkg.length" class="input c-height" type="text" @input="recalcPackage(pkg)" />
        </div>
        <div>
          <label class="field-label">Width</label>
          <input v-model="pkg.width" class="input c-height" type="text" @input="recalcPackage(pkg)" />
        </div>
        <div>
          <label class="field-label">Height</label>
          <input v-model="pkg.height" class="input c-height" type="text" @input="recalcPackage(pkg)" />
        </div>
        <div>
          <label class="field-label">Vol Wt.</label>
          <input v-model="pkg.vol" class="input c-height" type="text" readonly />
        </div>
        <div>
          <label class="field-label">Chrg Wt.</label>
          <input v-model="pkg.chrg" class="input c-height" type="text" readonly />
        </div>
        <div class="action-col">
          <label class="field-label">&nbsp;</label>
          <button
            v-if="packages.length > 1"
            class="chip remove"
            type="button"
            title="Remove"
            @click="removePackage(idx)"
          >
            <i class="pi pi-minus"></i>
          </button>
        </div>
        <div v-if="idx === 0 && errors.package" class="error-text" style="grid-column: 1 / -1;">
          {{ errors.package }}
        </div>
      </div>
    </div>

    <div class="panel m-top-2 m-bottom-2">
      <div v-if="!isDomesticOrCargo" class="package-header">
        <div>
          <h4>Performa details</h4>
          <span class="muted small">Manifest GST Detail</span>
        </div>
      </div>
      <div v-if="!isDomesticOrCargo" class="grid grid-3 tight">
        <div>
          <label class="field-label">CSB Type</label>
          <div class="custom-select" :class="{ disabled: csbDisabled }" @click="!csbDisabled && (csbOpen = !csbOpen)">
            <div class="select-display">
              <span v-if="selectedCsbType">{{ selectedCsbType }}</span>
              <span v-else class="muted">Select CSB type</span>
              <i :class="['pi', csbOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
            </div>
            <div v-if="csbOpen" class="select-dropdown">
              <div class="select-option" v-for="csb in csbTypes" :key="csb.id" @click.stop="selectCsbType(csb.id)">
                {{ csb.title }}
              </div>
            </div>
          </div>
          <p v-if="errors.csbType" class="error-text">{{ errors.csbType }}</p>
        </div>
        <div>
          <label class="field-label">Term Of Invoice</label>
          <div class="custom-select" :class="{ disabled: termDisabled }" @click="!termDisabled && (termOpen = !termOpen)">
            <div class="select-display">
              <span v-if="selectedTerm">{{ selectedTerm }}</span>
              <span v-else class="muted">Select term</span>
              <i :class="['pi', termOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
            </div>
            <div v-if="termOpen" class="select-dropdown">
              <div
                class="select-option"
                v-for="term in termTypes"
                :key="term.id"
                @click.stop="selectTerm(term.id)"
              >
                {{ term.title }}
              </div>
            </div>
          </div>
          <p v-if="errors.termType" class="error-text">{{ errors.termType }}</p>
        </div>
        <div>
          <label class="field-label">GST Invoice</label>
          <label class="switch">
            <input type="checkbox" :checked="gstInvoice === 'Yes'" @change="gstInvoice = $event.target.checked ? 'Yes' : 'No'" />
            <span class="slider"></span>
          </label>
        </div>
        <div>
          <label class="field-label">Invoice No</label>
          <input class="input c-height" v-model="gst.invoiceNo" type="text" />
        </div>
        <div>
          <label class="field-label">Invoice Date</label>
          <input class="input c-height" v-model="gst.invoiceDate" type="date" />
        </div>
        <div>
          <label class="field-label">Department No</label>
          <input class="input c-height" v-model="gst.departmentNo" type="text" />
        </div>
        <div>
          <label class="field-label">Export Reason</label>
          <div class="custom-select" :class="{ disabled: exportDisabled }" @click="!exportDisabled && (exportOpen = !exportOpen)">
            <div class="select-display">
              <span v-if="selectedExportReason">{{ selectedExportReason }}</span>
              <span v-else class="muted">Select export reason</span>
              <i :class="['pi', exportOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
            </div>
            <div v-if="exportOpen" class="select-dropdown">
              <div
                class="select-option"
                v-for="reason in exportReasons"
                :key="reason.id"
                @click.stop="selectExportReason(reason.id)"
              >
                {{ reason.title }}
              </div>
            </div>
          </div>
          <p v-if="errors.exportReason" class="error-text">{{ errors.exportReason }}</p>
        </div>
        <div>
          <label class="field-label">Format</label>
          <div class="custom-select disabled">
            <div class="select-display">
              <span>{{ selectedFormat }}</span>
              <i class="pi pi-lock"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="package-header m-top-2">
        <div>
          <h4>List Of Items</h4>
        </div>
        <button v-if="!isDomesticOrCargo" class="chip add" type="button" @click="addManifestItem">
          <i class="pi pi-plus"></i>
        </button>
      </div>
      <p v-if="itemError" class="error-text m-top-1">{{ itemError }}</p>
      <div v-for="(item, idx) in manifestItems" :key="item.id" class="grid grid-4 package-row m-top-1">
        <div>
          <label class="field-label">Box No</label>
          <input class="input c-height" v-model="item.boxNo" type="text" />
        </div>
        <div>
          <label class="field-label">Packages</label>
          <input class="input c-height" v-model="item.packages" type="text" />
        </div>
        <div>
          <label class="field-label">Description</label>
          <input class="input c-height" v-model="item.description" type="text" />
        </div>
        <div>
          <label class="field-label">HSN Code</label>
          <input class="input c-height" v-model="item.hsn" type="text" />
        </div>
        <div>
          <label class="field-label">Quantity</label>
          <input class="input c-height" v-model="item.quantity" type="text" @input="recalcItem(item)" />
        </div>
        <div>
          <label class="field-label">Weight</label>
          <input class="input c-height" v-model="item.weight" type="text" />
        </div>
        <div>
          <label class="field-label">Unit</label>
          <input class="input c-height" v-model="item.unit" type="text" />
        </div>
        <div>
          <label class="field-label">Rate</label>
          <input class="input c-height" v-model="item.rate" type="text" @input="recalcItem(item)" />
        </div>
        <div>
          <label class="field-label">Amount</label>
          <div class="locked-input">
            <input class="input c-height" v-model="item.amount" type="text" disabled />
            <i class="pi pi-lock"></i>
          </div>
        </div>
        <div class="action-col">
          <label class="field-label">&nbsp;</label>
          <button
            v-if="manifestItems.length > 1"
            class="chip remove"
            type="button"
            title="Remove"
            @click="removeManifestItem(idx)"
          >
            <i class="pi pi-minus"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="panel m-top-2 m-bottom-2">
      <div class="package-header">
        <div>
          <h4>Charge details</h4>
        </div>
      </div>
      <div class="grid grid-3 tight">
        <div>
          <label class="field-label">Payment Type <span style="color:#e74c3c">*</span></label>
          <div class="custom-select" @click="paymentOpen = !paymentOpen">
            <div class="select-display">
              <span v-if="charge.paymentType">{{ charge.paymentType }}</span>
              <span v-else class="muted">Select payment</span>
              <i :class="['pi', paymentOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
            </div>
            <div v-if="paymentOpen" class="select-dropdown">
              <div
                v-for="option in paymentOptions"
                :key="option"
                class="select-option"
                @click.stop="selectPayment(option)"
              >
                {{ option }}
              </div>
            </div>
          </div>
        </div>
        <div>
          <label class="field-label">Reference No.</label>
          <input class="input c-height" v-model="charge.reference" type="text" />
        </div>
        <div>
          <label class="field-label">Content</label>
          <textarea class="input" v-model="charge.content" rows="1"></textarea>
        </div>
        <div>
          <label class="field-label">Instruction</label>
          <textarea class="input" v-model="charge.instruction" rows="1"></textarea>
        </div>
      </div>
    </div>

    <div class="panel m-top-2 m-bottom-2">
      <div class="package-header">
        <div>
          <h4>Booking Summary</h4>
        </div>
      </div>
      <div class="summary-grid">
        <div class="summary-row">
          <span>Volume Metric</span>
          <span class="muted">{{ summary.volumeMetric || 0 }}</span>
        </div>
        <div class="summary-row">
          <span>Charged Weight</span>
          <span class="muted">{{ summary.chargedWeight || 0 }}</span>
        </div>
        <div class="summary-row">
          <span>Total Boxes</span>
          <span class="muted">{{ summaryBoxes }}</span>
        </div>
        <div class="summary-row">
          <span>Payable Amount</span>
          <span class="muted">INR {{ (Number(summary.payableAmount) || 0).toFixed(2) }}</span>
        </div>
      </div>
      <div class="summary-actions">
        <span v-if="calcError" class="calc-error">{{ calcError }}</span>
        <button class="pill-btn ghost" type="button" @click="calculateBooking">Calculate</button>
        <button class="pill-btn" type="button" @click="validateBeforeConfirm">Confirm Booking</button>
      </div>
    </div>

    <div v-if="confirmOpen" class="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h4>Confirm Booking</h4>
          <button class="icon-btn" type="button" @click="closeConfirm"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body summary-grid wide">
          <div class="summary-row">
            <span>Destination</span>
            <span class="muted">{{ selectedDestination ? `${selectedDestination.title} (${selectedDestination.code})` : '—' }}</span>
          </div>
          <div class="summary-row">
            <span>Courier</span>
            <span class="muted">{{ selectedVendor?.title || '—' }}</span>
          </div>
          <div class="summary-row">
            <span>Service Type</span>
            <span class="muted">{{ selectedServiceType?.title || '—' }}</span>
          </div>
          <div class="summary-row">
            <span>Package Type</span>
            <span class="muted">{{ selectedPackageTypeLabel || '—' }}</span>
          </div>
          <div class="summary-row">
            <span>Actual Weight</span>
            <span class="muted">{{ actualWeightDisplay }} KGS</span>
          </div>
          <div class="summary-row">
            <span>Volumetric Weight</span>
            <span class="muted">{{ volumetricWeightDisplay }} KGS</span>
          </div>
          <div class="summary-row">
            <span>Charged Weight</span>
            <span class="muted">{{ summary.chargedWeight }} KGS</span>
          </div>
          <div class="summary-row">
            <span>Total Pieces</span>
            <span class="muted">{{ summaryBoxes }}</span>
          </div>
          <div class="summary-row">
            <span>Payable Amount</span>
            <span class="muted">INR {{ (Number(summary.payableAmount) || 0).toFixed(2) }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="pill-btn ghost" type="button" @click="closeConfirm">Cancel / Edit</button>
          <button class="pill-btn" type="button" @click="submitConfirm">Submit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import api from '@/api/http'

const packages = ref([
  { id: 1, weight: '', pieces: '', length: '', width: '', height: '', vol: '', chrg: '' },
])
const toKolkataISO = () => {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]))
  const date = `${parts.year}-${parts.month}-${parts.day}`
  const time = `${parts.hour}:${parts.minute}`
  return { date, time }
}

const { date: today, time: now } = toKolkataISO()

const destinations = ref([])
const consignee = ref({ destinationId: '' })
const consigneeForm = reactive({ name: '', phone: '', address: '', address2: '', zipcode: '' })
const shipper = reactive({ name: '', address: '', phone: '', address2: '', pincode: '', aadhaar: '' })
const states = ref([])
const cities = ref([])
const shipperStateId = ref('')
const shipperCityId = ref('')
const vendors = ref([])
const agents = ref([])
const serviceTypes = ref([])
const packageTypes = ref([])
const providerServiceTypes = ref([])
const volumetricWeight = ref(0)
const confirmOpen = ref(false)
const itemError = ref('')
const destSearch = ref('')
const stateSearch = ref('')
const citySearch = ref('')
const bookingTypes = ref([])
const bookingTypeId = ref('')
const bookingTypeOpen = ref(false)
const bookingTypeDisabled = ref(false)
const errors = reactive({})
const service = ref({
  vendorId: '',
  agentId: '',
  serviceTypeId: '',
  packageType: '',
  shipmentType: '',
  csbTypeId: '',
  termTypeId: '',
  exportReasonId: '',
})
const packageOpen = ref(false)
const selectedPackageTypeLabel = computed(() => {
  const match = packageTypes.value.find((p) => p.id === service.value.packageType)
  return match ? match.title : ''
})
const summary = reactive({
  volumeMetric: 0,
  chargedWeight: 0,
  totalBoxes: 0,
  payableAmount: 0,
})
const companyName = ref('')
const companyLocked = ref(false)
const manualBookingId = ref('')
const shipmentValue = ref('')
const agentOpen = ref(false)
const destOpen = ref(false)
const stateOpen = ref(false)
const cityOpen = ref(false)
const serviceTypeOpen = ref(false)
const serviceTypeDisabled = ref(false)
const vendorOpen = ref(false)
const shipmentOpen = ref(false)
const csbTypes = ref([])
const termTypes = ref([])
const exportReasons = ref([])
const csbOpen = ref(false)
const termOpen = ref(false)
const exportOpen = ref(false)
const csbDisabled = ref(false)
const termDisabled = ref(false)
const exportDisabled = ref(false)
const formatOpen = ref(false)
const selectedFormat = ref('CS2')
const paymentOpen = ref(false)
const gstInvoice = ref('No')
const gst = ref({
  invoiceNo: '',
  invoiceDate: '',
  departmentNo: '',
})
const manifestItems = ref([
  { id: 1, boxNo: '', packages: '', description: '', hsn: '', quantity: '', weight: '', unit: '', rate: '', amount: '' },
])
const charge = reactive({
  paymentType: '',
  reference: '',
  content: '',
  instruction: '',
})
const paymentOptions = ['Credit', 'Cash', 'Prepaid']
const calcError = ref('')
const toNum = (val) => {
  const n = Number(val)
  return Number.isFinite(n) ? n : 0
}
const selectedCsbType = computed(() => {
  const match = csbTypes.value.find((c) => c.id === service.value.csbTypeId)
  return match?.title || ''
})
const selectedTerm = computed(() => {
  const match = termTypes.value.find((t) => t.id === service.value.termTypeId)
  return match?.title || ''
})
const selectedExportReason = computed(() => {
  const match = exportReasons.value.find((e) => e.id === service.value.exportReasonId)
  return match?.title || ''
})
const shipmentLabel = computed(() => service.value?.shipmentType || '')

const applySingleSelectRule = (list, key, disabledRef, openRef) => {
  const current = service.value[key]
  if (!list.length) {
    service.value[key] = ''
    disabledRef.value = true
    openRef.value = false
    return
  }
  if (list.length === 1) {
    service.value[key] = list[0].title || ''
    disabledRef.value = true
    openRef.value = false
    return
  }
  disabledRef.value = false
  if (current && !list.some((i) => i.title === current)) {
    service.value[key] = ''
  }
}

const fetchDestinations = async () => {
  try {
    const { data } = await api.get('/locations/served-countries')
    const list = data.data || []
    destinations.value = list.map((d) => ({
      id: d.id,
      title: d.title?.trim() || '',
      code: d.code || '',
    })).filter((d) => d.id && (d.status ?? d.is_active ?? 1))
  } catch (e) {
    // ignore
  }
}

const backendOrigin =
  import.meta.env.VITE_BACKEND_URL ||
  (window.location.origin.includes(':5173')
    ? window.location.origin.replace(':5173', ':8000')
    : window.location.origin)

const resolveUrl = (val) => {
  if (!val) return ''
  if (val.startsWith('http')) return val
  let clean = val.replace(/^\/+/, '')
  if (!clean.startsWith('storage/')) {
    clean = `storage/${clean}`
  }
  return `${backendOrigin.replace(/\/+$/, '')}/${clean}`
}

const fetchVendors = async () => {
  try {
    const { data } = await api.get('/service-providers')
    const list = data.data || []
    vendors.value = list
      .filter((v) => v.status ?? v.is_active ?? 1)
      .map((v) => ({
        id: v.id,
        title: v.title || '',
        logo: v.logo ? resolveUrl(v.logo) : '',
        booking_type_id: v.booking_type_id ?? null,
      }))
  } catch (e) {
    // ignore
  }
}

const loadPackageTypes = async () => {
  try {
    const { data } = await api.get('/package-types')
    packageTypes.value = (data.data || [])
      .filter((p) => p.status ?? p.is_active ?? 1)
      .map((p) => ({ id: p.id, title: p.name || p.title || '' }))
  } catch (e) {
    packageTypes.value = []
  }
}

const fetchStatesCities = async () => {
  try {
    const [statesRes, citiesRes] = await Promise.all([
      api.get('/locations/states'),
      api.get('/locations/cities'),
    ])
    states.value = (statesRes.data.data || []).filter((s) => s.status ?? s.is_active ?? 1)
    cities.value = (citiesRes.data.data || []).filter((c) => c.status ?? c.is_active ?? 1)
  } catch (e) {
    // ignore
  }
}

const filteredShipperCities = computed(() =>
  cities.value.filter((c) => {
    const matchesState = !shipperStateId.value || c.state_id === shipperStateId.value
    const q = citySearch.value.toLowerCase()
    const matchesSearch = !q || (c.title || '').toLowerCase().includes(q)
    return matchesState && matchesSearch
  })
)
const filteredStates = computed(() => {
  const q = stateSearch.value.toLowerCase()
  return states.value.filter((s) => !q || (s.title || '').toLowerCase().includes(q))
})
const filteredDestinations = computed(() => {
  const q = destSearch.value.toLowerCase()
  return destinations.value.filter((d) => {
    const hay = `${d.title || ''} ${d.code || ''}`.toLowerCase()
    return !q || hay.includes(q)
  })
})

const selectedVendor = computed(() => vendors.value.find((v) => v.id === service.value.vendorId))
const selectedAgent = computed(() => agents.value.find((a) => a.id === service.value.agentId))
const selectedState = computed(() => states.value.find((s) => s.id === shipperStateId.value))
const selectedCity = computed(() => cities.value.find((c) => c.id === shipperCityId.value))
const selectedDestination = computed(() => destinations.value.find((d) => d.id === consignee.value.destinationId))
const selectedServiceType = computed(() => serviceTypes.value.find((t) => t.id === service.value.serviceTypeId))
const selectedBookingType = computed(() => bookingTypes.value.find((b) => b.id === bookingTypeId.value))
const filteredVendors = computed(() => {
  if (!bookingTypeId.value) return vendors.value
  return vendors.value.filter((v) => !v.booking_type_id || v.booking_type_id === bookingTypeId.value)
})
const filteredServiceTypes = computed(() => {
  if (!service.value.vendorId) return serviceTypes.value
  const allowed = providerServiceTypes.value
    .filter((p) => p.service_provider_id === service.value.vendorId)
    .map((p) => p.service_type_id)
  return serviceTypes.value.filter((t) => allowed.includes(t.id))
})
const totals = computed(() => {
  const sumVol = packages.value.reduce((acc, pkg) => acc + toNum(pkg.vol), 0)
  const sumChrg = packages.value.reduce((acc, pkg) => acc + toNum(pkg.chrg), 0)
  const sumPieces = packages.value.reduce((acc, pkg) => acc + toNum(pkg.pieces), 0)
  const sumWeight = packages.value.reduce((acc, pkg) => acc + toNum(pkg.weight), 0)
  return { sumVol, sumChrg, sumPieces, sumWeight }
})
const calculatedBoxes = computed(() => {
  const sum = packages.value.reduce((acc, pkg) => acc + (Number(pkg.pieces) || 0), 0)
  return sum || packages.value.length || 0
})
const summaryBoxes = computed(() => summary.totalBoxes || calculatedBoxes.value)
const actualWeightDisplay = computed(() => toNum(totals.value.sumWeight).toFixed(2))
const volumetricWeightDisplay = computed(() => toNum(volumetricWeight.value).toFixed(2))
const piecesDisplay = computed(() => (totals.value.sumPieces || 0).toString())
const bookingTypeLabel = computed(() => selectedBookingType.value?.title || '')
const isDomesticOrCargo = computed(() => /domestic|cargo/i.test(bookingTypeLabel.value))

const addPackage = () => {
  const nextId = (packages.value[packages.value.length - 1]?.id || 1) + 1
  packages.value.push({ id: nextId, weight: '', pieces: '', length: '', width: '', height: '', vol: '', chrg: '' })
}

const removePackage = (idx) => {
  packages.value.splice(idx, 1)
}

onMounted(() => {
  fetchDestinations()
  fetchStatesCities()
  fetchVendors()
  fetchAgents()
  fetchServiceTypes()
  fetchBookingTypes()
  loadPackageTypes()
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

watch(
  () => [service.value.vendorId, filteredServiceTypes.value],
  () => {
    const list = filteredServiceTypes.value
    if (!service.value.vendorId) {
      serviceTypeDisabled.value = false
      service.value.serviceTypeId = ''
      serviceTypeOpen.value = false
      return
    }
    if (list.length === 0) {
      serviceTypeDisabled.value = true
      service.value.serviceTypeId = ''
      serviceTypeOpen.value = false
    } else if (list.length === 1) {
      service.value.serviceTypeId = list[0].id
      serviceTypeDisabled.value = true
      serviceTypeOpen.value = false
    } else {
      serviceTypeDisabled.value = false
      if (!list.find((t) => t.id === service.value.serviceTypeId)) {
        service.value.serviceTypeId = ''
      }
    }
  },
  { immediate: true, deep: true }
)

const fetchAgents = async () => {
  try {
    const { data } = await api.get('/users/agents')
    agents.value = data.data || []
  } catch (e) {
    // ignore
  }
}

const fetchServiceTypes = async () => {
  try {
    const { data } = await api.get('/service-types')
    const list = data.data || []
    serviceTypes.value = list.map((t) => ({ id: t.id, title: t.title || '' }))
    const pst = await api.get('/provider-service-types')
    const pstList = pst.data.data || []
    providerServiceTypes.value = pstList.map((p) => ({
      service_provider_id: p.service_provider_id,
      service_type_id: p.service_type_id,
    }))

    const [csbRes, termRes, exportRes] = await Promise.allSettled([
      api.get('/csb-types'),
      api.get('/term-invoice-types'),
      api.get('/export-reasons'),
    ])

    csbTypes.value =
      csbRes.status === 'fulfilled'
        ? (csbRes.value.data.data || []).filter((c) => c.status ?? c.is_active ?? 1)
        : []
    termTypes.value =
      termRes.status === 'fulfilled'
        ? (termRes.value.data.data || []).filter((t) => t.status ?? t.is_active ?? 1)
        : []
    exportReasons.value =
      exportRes.status === 'fulfilled'
        ? (exportRes.value.data.data || []).filter((r) => r.status ?? r.is_active ?? 1)
        : []

    applySingleSelectRuleIds(csbTypes.value, 'csbTypeId', csbDisabled, csbOpen)
    applySingleSelectRuleIds(termTypes.value, 'termTypeId', termDisabled, termOpen)
    applySingleSelectRuleIds(exportReasons.value, 'exportReasonId', exportDisabled, exportOpen)
  } catch (e) {
    // ignore
  }
}

const applySingleSelectRuleIds = (list, key, disabledRef, openRef) => {
  if (!list.length) {
    service.value[key] = ''
    disabledRef.value = true
    openRef.value = false
    return
  }
  if (list.length === 1) {
    service.value[key] = list[0].id
    disabledRef.value = true
    openRef.value = false
    return
  }
  disabledRef.value = false
}

const fetchBookingTypes = async () => {
  try {
    const { data } = await api.get('/booking-types')
    const list = (data.data || []).filter((t) => t.status ?? t.is_active ?? 1)
    bookingTypes.value = list
    if (list.length === 1) {
      bookingTypeId.value = list[0].id
      bookingTypeDisabled.value = true
    } else {
      bookingTypeDisabled.value = false
    }
  } catch (e) {
    bookingTypes.value = []
  }
}

const selectVendor = (id) => {
  service.value.vendorId = id
  vendorOpen.value = false
}

const selectAgent = (id) => {
  service.value.agentId = id
  const agent = agents.value.find((a) => a.id === id)
  if (agent?.company_name) {
    companyName.value = agent.company_name
    companyLocked.value = true
  } else {
    companyName.value = ''
    companyLocked.value = false
  }
  agentOpen.value = false
}

const selectDestination = (id) => {
  consignee.value.destinationId = id
  destOpen.value = false
}

const selectBookingType = (id) => {
  if (bookingTypeDisabled.value) return
  bookingTypeId.value = id
  bookingTypeOpen.value = false
}

const selectState = (id) => {
  shipperStateId.value = id
  shipperCityId.value = ''
  stateOpen.value = false
}

const selectCity = (id) => {
  shipperCityId.value = id
  cityOpen.value = false
}

const selectServiceType = (id) => {
  service.value.serviceTypeId = id
  serviceTypeOpen.value = false
}

const selectPackageType = (val) => {
  service.value.packageType = val
  packageOpen.value = false
}

const selectShipmentType = (val) => {
  service.value.shipmentType = val
  shipmentOpen.value = false
}

const closeAllSelects = () => {
  agentOpen.value = false
  destOpen.value = false
  stateOpen.value = false
  cityOpen.value = false
  vendorOpen.value = false
  serviceTypeOpen.value = false
  packageOpen.value = false
  bookingTypeOpen.value = false
  shipmentOpen.value = false
  csbOpen.value = false
  termOpen.value = false
  exportOpen.value = false
  formatOpen.value = false
  paymentOpen.value = false
}

const selectCsbType = (id) => {
  service.value.csbTypeId = id
  csbOpen.value = false
}

const selectTerm = (id) => {
  service.value.termTypeId = id
  termOpen.value = false
}

const selectExportReason = (id) => {
  service.value.exportReasonId = id
  exportOpen.value = false
}

const selectPayment = (val) => {
  charge.paymentType = val
  paymentOpen.value = false
}

const selectFormat = (val) => {
  selectedFormat.value = val
  formatOpen.value = false
}

const calculateBooking = async () => {
  const pkg = packages.value[0] || {}
  if (!consignee.value.destinationId || !service.value.packageType || !service.value.vendorId) {
    calcError.value = 'Select destination, package type, and courier service to calculate.'
    return
  }
  calcError.value = ''
  const length = Number(pkg.length || 0)
  const width = Number(pkg.width || 0)
  const height = Number(pkg.height || 0)
  const volInput = Number(toNum(totals.value.sumVol).toFixed(2))
  try {
    const chargeToSend = summary.chargedWeight || toNum(totals.value.sumChrg || volInput)
    const { data } = await api.post('/bookings/calculate', {
      destination_id: consignee.value.destinationId,
      package_type_id: service.value.packageType,
      provider_id: service.value.vendorId,
      length,
      width,
      height,
      volumetric_weight: volInput,
      charged_weight: chargeToSend,
    })
    const res = data.data || {}
    const volMetric = Number(toNum(volumetricWeight.value).toFixed(2))
    summary.volumeMetric = volMetric
    summary.payableAmount = Number(res.payable_amount ?? 0)
  } catch (e) {
    calcError.value = 'Calculation failed. Please try again.'
  }
}

watch(
  () => [packages.value, totals.value, volumetricWeight.value],
  () => {
    summary.volumeMetric = Number(toNum(volumetricWeight.value).toFixed(2))
    summary.chargedWeight = Number(toNum(totals.value.sumChrg).toFixed(2))
    summary.totalBoxes = totals.value.sumPieces || packages.value.length || 0
    volumetricWeight.value = toNum(totals.value.sumVol)
  },
  { deep: true, immediate: true }
)

const handleClickOutside = (e) => {
  if (!e.target.closest('.custom-select') && !e.target.closest('.vendor-select')) {
    closeAllSelects()
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

const recalcPackage = (pkg) => {
  const l = toNum(pkg.length)
  const w = toNum(pkg.width)
  const h = toNum(pkg.height)
  let vol = toNum(pkg.vol)
  if (l > 0 && w > 0 && h > 0) {
    vol = (l * w * h) / 5000
    pkg.vol = vol ? vol.toFixed(2) : ''
  }
  const weightVal = toNum(pkg.weight)
  const charge = Math.max(vol, weightVal)
  pkg.chrg = charge ? charge.toFixed(2) : ''
}

const recalcAllPackages = () => {
  packages.value.forEach((pkg) => recalcPackage(pkg))
}

const recalcItem = (item) => {
  const qty = toNum(item.quantity)
  const rate = toNum(item.rate)
  const amt = qty && rate ? (qty * rate).toFixed(2) : ''
  item.amount = amt
}

const closeConfirm = () => {
  confirmOpen.value = false
}

const submitConfirm = () => {
  const performaPayload = isDomesticOrCargo.value
    ? null
    : {
        csb_type_id: service.value.csbTypeId || null,
        term_invoice_id: service.value.termTypeId || null,
        gst: gstInvoice.value === 'Yes' ? 1 : 0,
        invoice_number: gst.invoiceNo || null,
        invoice_date: gst.invoiceDate || null,
        deperatement_number: gst.departmentNo || null,
        export_reason_id: service.value.exportReasonId || null,
        format: selectedFormat.value || null,
      }

  const payload = {
    booking_type_id: bookingTypeId.value || null,
    package_type_id: service.value.packageType,
    service_provider_id: service.value.vendorId,
    service_type_id: service.value.serviceTypeId,
    scale: 'KGS',
    actual_weight: toNum(totals.value.sumWeight).toFixed(2),
    volumetric_weight: toNum(volumetricWeight.value).toFixed(2),
    number_pieces: totals.value.sumPieces || 0,
    shipment_value: shipmentValue.value || null,
    currency: 'INR',
    shipment_type: service.value.shipmentType || 'Commercial',
    manual_booking_id: manualBookingId.value || null,
    foraward_number: null,
    consignee: {
      destination_id: consignee.value.destinationId,
      consignee_name: consigneeForm.name,
      consignee_phone: consigneeForm.phone,
      consignee_address: consigneeForm.address,
      consignee_address_two: consigneeForm.address2 || null,
      consignee_zipcode: consigneeForm.zipcode,
    },
    shipper: {
      name: shipper.name,
      address: shipper.address,
      address_two: shipper.address2 || null,
      phone: shipper.phone,
      state_id: shipperStateId.value,
      city_id: shipperCityId.value,
      pincode: shipper.pincode,
      aadhaar: shipper.aadhaar || null,
    },
    packages: packages.value.map((pkg) => ({
      weight: toNum(pkg.weight),
      pieces: Number(pkg.pieces) || 0,
      length: toNum(pkg.length),
      width: toNum(pkg.width),
      height: toNum(pkg.height),
      volume_weight: toNum(pkg.vol),
      charged_weight: toNum(pkg.chrg),
    })),
    performa: performaPayload,
    items: manifestItems.value
      .filter((item) => item.boxNo || item.packages || item.description || item.hsn || item.quantity || item.weight || item.unit || item.rate)
      .map((item) => ({
        box_number: item.boxNo || null,
        packages: item.packages || null,
        description: item.description || null,
        hsn_code: item.hsn || null,
        quantity: item.quantity ? Number(item.quantity) : null,
        weight: item.weight ? Number(item.weight) : null,
        unit: item.unit || null,
        rate: item.rate ? Number(item.rate) : null,
        amount: item.amount ? Number(item.amount) : null,
      })),
    charge: {
      payment_type: charge.paymentType || null,
      reference_number: charge.reference || null,
      content: charge.content || null,
      intructions: charge.instruction || null,
      margin_rate: 0,
      payment_status: 'pending',
    },
  }

  api
    .post('/bookings', payload)
    .then(() => {
      confirmOpen.value = false
    })
    .catch(() => {
      calcError.value = 'Submission failed. Please review required fields.'
    })
}

const validateBeforeConfirm = () => {
  errors.bookingType = bookingTypeId.value ? '' : 'Booking type is required'
  errors.destination = consignee.value.destinationId ? '' : 'Destination is required'
  errors.vendor = service.value.vendorId ? '' : 'Courier service is required'
  errors.packageType = service.value.packageType ? '' : 'Package type is required'
  errors.serviceType = service.value.serviceTypeId ? '' : 'Service type is required'
  errors.shipperName = shipper.name ? '' : 'Shipper name is required'
  errors.shipperAddress = shipper.address ? '' : 'Shipper address is required'
  errors.shipperPhone = shipper.phone ? '' : 'Shipper phone is required'
  errors.shipperState = shipperStateId.value ? '' : 'Shipper state is required'
  errors.shipperCity = shipperCityId.value ? '' : 'Shipper city is required'
  errors.shipperPincode = shipper.pincode ? '' : 'Shipper pincode is required'
  errors.consigneeName = consigneeForm.name ? '' : 'Consignee name is required'
  errors.consigneePhone = consigneeForm.phone ? '' : 'Consignee phone is required'
  errors.consigneeAddress = consigneeForm.address ? '' : 'Consignee address is required'
  errors.consigneeZip = consigneeForm.zipcode ? '' : 'Consignee zip code is required'
  if (isDomesticOrCargo.value) {
    errors.csbType = ''
    errors.termType = ''
    errors.exportReason = ''
  } else {
    errors.csbType = service.value.csbTypeId ? '' : 'CSB type is required'
    errors.termType = service.value.termTypeId ? '' : 'Term of invoice is required'
    errors.exportReason = service.value.exportReasonId ? '' : 'Export reason is required'
  }

  // ensure at least one package has basics
  const pkg = packages.value[0]
  const pkgMissing =
    !pkg ||
    !pkg.weight ||
    !pkg.length ||
    !pkg.width ||
    !pkg.height ||
    !pkg.pieces ||
    !pkg.vol ||
    !pkg.chrg
  errors.package = pkgMissing ? 'Please fill package details (weight, dimensions, pieces, volume and charged weight).' : ''

  // List of items validation
  itemError.value = ''
  const itemsInvalid = manifestItems.value.some((item) => {
    const filled =
      item.boxNo ||
      item.packages ||
      item.description ||
      item.hsn ||
      item.quantity ||
      item.weight ||
      item.unit ||
      item.rate
    if (!filled) return false // allow empty rows
    return (
      !item.boxNo ||
      !item.packages ||
      !item.description ||
      !item.hsn ||
      !item.quantity ||
      !item.weight ||
      !item.unit ||
      !item.rate
    )
  })
  if (itemsInvalid) {
    itemError.value = 'Please complete all fields for each item in the list.'
  }

  const anyError = Object.values(errors).some((v) => v) || !!itemError.value
  if (!anyError) {
    confirmOpen.value = true
  }
}

watch(
  () => service.value.vendorId,
  () => {
    serviceTypeOpen.value = false
  }
)

watch(
  () => shipperStateId.value,
  () => {
    cityOpen.value = false
  }
)

watch(
  () => bookingTypeId.value,
  () => {
    // if current vendor is not allowed for this booking type, clear it
    if (
      service.value.vendorId &&
      bookingTypeId.value &&
      !filteredVendors.value.find((v) => v.id === service.value.vendorId)
    ) {
      service.value.vendorId = ''
      service.value.serviceTypeId = ''
    }
    vendorOpen.value = false
  }
)
</script>

<style scoped>
.m-top-1{
  margin-top: 1rem;
}

.m-top-2{
  margin-top: 2rem;
}

.m-bottom-1{
  margin-bottom: 0.8rem;
}

.m-bottom-2{
  margin-bottom: 2rem;
}

.card,
.panel {
  background: #fff;
  border: 1px solid #eef1f7;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 12px 40px rgba(12, 24, 52, 0.05);
}

.card h4,
.panel h4 {
  margin: 0 0 0.75rem;
}

.panels {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.grid {
  display: grid;
  gap: 0.75rem;
  padding: 0.5rem;
}

.grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-4 {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.grid-7 {
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.grid-3 {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.grid-8 {
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
}

.grid-4 {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.grid-2.tight {
  grid-template-columns: repeat(2, minmax(120px, 1fr));
}

.field-label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
  color: #1a2743;
}

.input {
  width: 100%;
  padding: 0.6rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #d6ddf2;
  background: #fff;
  color: #0f1f3d;
  font-size: 16px;
}

.muted {
  color: #7a8699;
}

.small {
  font-size: 0.9rem;
}

.package-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  justify-content: space-between;
}

.package-row {
  padding: 1.5rem 0.5rem;
  border-top: 1px solid #f0f2f8;
}

.vendor-select {
  position: relative;
  width: 100%;
}

.custom-select {
  position: relative;
  width: 100%;
}

.custom-select.disabled {
  pointer-events: none;
  opacity: 0.85;
}

.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d5d9e6;
  transition: 0.2s;
  border-radius: 24px;
  border: 1px solid #c2c8db;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 2px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.switch input:checked + .slider {
  background-color: #36b47e;
  border-color: #36b47e;
}

.switch input:checked + .slider:before {
  transform: translateX(20px);
}

.vendor-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  height: 38px;
}

.select-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #d6ddf2;
  background: #fff;
  height: 38px;
}

.custom-select.disabled {
  pointer-events: none;
  opacity: 0.85;
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 260px;
  overflow-y: auto;
  border: 1px solid #e1e6f2;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(12, 24, 52, 0.15);
  z-index: 5;
}

.select-option {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.75rem;
  cursor: pointer;
}

.select-option:hover {
  background: #f4f6ff;
}

.vendor-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 260px;
  overflow-y: auto;
  border: 1px solid #e1e6f2;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(12, 24, 52, 0.15);
  z-index: 5;
}

.vendor-option {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.75rem;
  cursor: pointer;
}

.vendor-option:hover {
  background: #f4f6ff;
}

.vendor-option img,
.vendor-chip img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.vendor-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.chip {
  border: none;
  background: #36b47e;
  color: #fff;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(54, 180, 126, 0.3);
}

.chip.remove {
  background: #ff6b6b;
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.25);
}

.chip i {
  font-size: 14px;
}

.action-col {
  display: flex;
  align-items: flex-end;
}
.c-height{
  height: 38px;
}

.locked-input {
  position: relative;
}
.locked-input .pi-lock {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}
.locked-input.disabled .input {
  padding-right: 32px;
}
.input-note{
  margin-top: 0;
  font-size: 12px;
  padding-left: 5px;
  color: #e58a14;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.6rem 1.5rem;
  margin-top: 0.5rem;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: #1a2743;
}
.summary-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}
.calc-error {
  margin-right: auto;
  color: #e74c3c;
  font-size: 0.95rem;
}
.error-text {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}
.dropdown-search {
  padding: 0.4rem 0.5rem 0.2rem;
  border-bottom: 1px solid #eef1f7;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(7, 13, 30, 0.55);
  display: grid;
  place-items: center;
  z-index: 20;
}
.modal {
  width: min(720px, 92vw);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 18px 60px rgba(12, 24, 52, 0.25);
  padding: 1.25rem;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.modal-body {
  margin-bottom: 1rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.summary-grid.wide {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
</style>







