// js/prescriptions.js
// Version with "View Details" functionality removed.

let activePrescriptionsCache = [];
let historicalPrescriptionsCache = [];

function initPrescriptionsPage() {
    console.log('Initializing Prescriptions Page...');
    const prescriptionsContainer = document.getElementById('prescriptions-container');
    const prescriptionHistoryContainer = document.getElementById('prescription-history-container');
    const historyFilter = document.getElementById('history-filter');
    const refillAllBtn = document.getElementById('refill-all-btn'); // Assuming you might want this functionality

    if (!prescriptionsContainer || !prescriptionHistoryContainer) {
        console.error('Prescription containers not found.');
        return;
    }

    loadActivePrescriptions(prescriptionsContainer);
    loadPrescriptionHistory(prescriptionHistoryContainer, 'all'); // Load all history initially

    if (historyFilter) {
        historyFilter.addEventListener('change', (event) => {
            loadPrescriptionHistory(prescriptionHistoryContainer, event.target.value);
        });
    }

    if (refillAllBtn) {
        refillAllBtn.addEventListener('click', handleRefillAll);
    }
}

// --- Loading and Displaying Active Prescriptions ---

async function loadActivePrescriptions(container) {
    showLoading(container, 'Loading active prescriptions...');
    const noPrescriptionsElement = document.getElementById('no-prescriptions');
    if (noPrescriptionsElement) noPrescriptionsElement.style.display = 'none'; // Hide 'no prescriptions' message initially

    try {
        activePrescriptionsCache = await dataService.getActivePrescriptions();
        displayActivePrescriptions(activePrescriptionsCache, container);
         console.log('Active prescriptions loaded and displayed.');

        if (activePrescriptionsCache.length === 0 && noPrescriptionsElement) {
            noPrescriptionsElement.style.display = 'block'; // Show message if no active ones
             container.innerHTML = ''; // Clear loading indicator
        }

    } catch (error) {
        console.error('Error loading active prescriptions:', error);
        showError(container, 'Could not load active prescriptions.');
        if (noPrescriptionsElement) noPrescriptionsElement.style.display = 'none';
    }
}

function displayActivePrescriptions(prescriptions, container) {
    container.innerHTML = ''; // Clear loading/error

    if (prescriptions.length === 0) {
        // Message is handled by loadActivePrescriptions checking cache length
        return;
    }

    prescriptions.forEach(prescription => {
        const card = createPrescriptionCard(prescription, true); // true indicates active
        container.appendChild(card);
    });

    addPrescriptionCardListeners(container); // Add listeners after rendering
}

// --- Loading and Displaying Prescription History ---

async function loadPrescriptionHistory(container, filter = 'all') {
     console.log(`Loading prescription history with filter: ${filter}`);
    showLoading(container, 'Loading prescription history...');

    try {
        // Fetch only if cache is empty, otherwise use cache (for demo)
        if (historicalPrescriptionsCache.length === 0) {
             historicalPrescriptionsCache = await dataService.getHistoricalPrescriptions();
        }

        const filteredHistory = filterPrescriptionHistory(historicalPrescriptionsCache, filter);
        displayPrescriptionHistory(filteredHistory, container);
         console.log('Prescription history loaded and displayed.');

    } catch (error) {
        console.error('Error loading prescription history:', error);
        showError(container, 'Could not load prescription history.');
    }
}

function filterPrescriptionHistory(history, filter) {
    if (filter === 'all') {
        return [...history]; // Return a copy
    }

    const today = new Date();
    const cutoffDate = new Date();
    let monthsBack = 0;

    if (filter === '3months') monthsBack = 3;
    else if (filter === '6months') monthsBack = 6;
    else if (filter === '1year') monthsBack = 12;
    else return [...history]; // Default to all if filter is unrecognized

    cutoffDate.setMonth(today.getMonth() - monthsBack);

    return history.filter(p => new Date(p.prescribedDate) >= cutoffDate);
}


function displayPrescriptionHistory(history, container) {
    container.innerHTML = ''; // Clear loading/error

    if (history.length === 0) {
        container.innerHTML = '<p class="text-center text-muted no-history">No prescription history found for the selected period.</p>';
        return;
    }

    // Sort by date descending (newest first)
    history.sort((a, b) => new Date(b.prescribedDate) - new Date(a.prescribedDate));

    const table = document.createElement('table');
    table.className = 'history-table'; // Use styles from CSS
    table.innerHTML = `
        <thead>
            <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Prescribed Date</th>
                <th>Doctor</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${history.map(p => `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.dosage}</td>
                    <td>${formatDate(p.prescribedDate)}</td>
                    <td>${p.prescribedBy}</td>
                    <td><span class="status-completed">${p.status || 'Completed'}</span></td>
                </tr>
            `).join('')}
        </tbody>
    `;
    container.appendChild(table);
}


// --- Prescription Card Creation and Helpers ---

function createPrescriptionCard(prescription, isActive) {
    const card = document.createElement('div');
    card.className = 'prescription-card card';
    card.dataset.id = prescription.id;

    const { statusClass, statusText } = getPrescriptionStatus(prescription);
    card.classList.add(statusClass); // Add status class for border styling

    card.innerHTML = `
        <div class="prescription-header">
            <h4>${prescription.name} (${prescription.dosage})</h4>
            <span class="prescription-status ${statusClass}">${statusText}</span>
        </div>
        <div class="prescription-details">
            <p><strong>Frequency:</strong> ${prescription.frequency}</p>
            <p><strong>Duration:</strong> ${prescription.duration}</p>
            <p><strong>Prescribed by:</strong> ${prescription.prescribedBy}</p>
            <p><strong>Prescribed Date:</strong> ${formatDate(prescription.prescribedDate)}</p>
            ${isActive ? `<p><strong>Refills remaining:</strong> <span class="refills-count">${prescription.refillsRemaining}</span></p>` : ''}
             <p><strong>Expires on:</strong> ${formatDate(prescription.expiryDate)}</p>
            <div class="prescription-instructions">
                <strong>Instructions:</strong> ${prescription.instructions || 'Follow doctor\'s advice.'}
            </div>
        </div>
        <div class="prescription-actions">
            ${isActive ? `
                <button class="btn btn-secondary btn-sm refill-btn" ${prescription.refillsRemaining === 0 ? 'disabled' : ''}>
                    <i class="fas fa-sync" aria-hidden="true"></i> Refill
                </button>` : ''
            }
            <!-- Details Button Removed -->
        </div>
    `;
    return card;
}

function getPrescriptionStatus(prescription) {
    const today = new Date();
    // Ensure expiryDate is treated as a date without time for comparison
    const expiryDateString = prescription.expiryDate; // e.g., "2025-06-15"
    const expiryDateParts = expiryDateString.split('-').map(Number); // [2025, 6, 15]
    // Note: Month is 0-indexed in JS Date, so month - 1
    const expiryDate = new Date(expiryDateParts[0], expiryDateParts[1] - 1, expiryDateParts[2]);

    today.setHours(0, 0, 0, 0); // Compare dates only
    expiryDate.setHours(0,0,0,0);

    // Calculate days remaining based on midnight comparison
    const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));


    if (prescription.status === 'completed') {
         return { statusClass: 'status-completed', statusText: 'Completed' };
    }
    // If expiry date is before today (daysRemaining is negative)
    if (daysRemaining < 0) {
        return { statusClass: 'status-expired', statusText: 'Expired' };
    }
    // If expiring within the next 7 days (0 to 6 days remaining)
    else if (daysRemaining < 7) {
        const dayText = daysRemaining === 1 ? 'day left' : 'days left';
        return { statusClass: 'status-warning', statusText: `${daysRemaining} ${dayText}` };
    }
    // Otherwise, it's good
    else {
        return { statusClass: 'status-good', statusText: `${daysRemaining} days left` };
    }
}


// --- Event Listeners and Handlers ---

function addPrescriptionCardListeners(container) {
    const refillButtons = container.querySelectorAll('.refill-btn');
    console.log(`Found ${refillButtons.length} refill buttons to attach listeners to.`);

    // Note: Details button selectors and listeners are removed.

    refillButtons.forEach(button => {
        // Apply the cloning technique for consistency and safety
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', handleRefillClick);
    });
}

async function handleRefillClick(event) {
    const button = event.currentTarget;
    const card = button.closest('.prescription-card');
    const prescriptionId = card.dataset.id;

    if (!prescriptionId || button.disabled) return;

    console.log(`Refill clicked for: ${prescriptionId}`);
    button.disabled = true; // Disable immediately
    button.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Requesting...';

    try {
        const result = await dataService.requestRefill(prescriptionId);
        if (result.success) {
            showUserMessage(result.message, 'success');
             // Update refills count visually and button state
            const countSpan = card.querySelector('.refills-count');
            const currentCount = activePrescriptionsCache.find(p => p.id === prescriptionId)?.refillsRemaining ?? parseInt(countSpan?.textContent, 10); // Get updated count

            if (countSpan && !isNaN(currentCount)) {
                 countSpan.textContent = currentCount; // Set to the new count from dataService simulation
                 if (currentCount === 0) {
                     button.innerHTML = '<i class="fas fa-times"></i> No Refills Left';
                     button.disabled = true;
                 } else {
                     button.innerHTML = '<i class="fas fa-check"></i> Refill Requested'; // Indicate success but keep disabled briefly perhaps?
                     // Or re-enable immediately if desired:
                     // button.disabled = false;
                     // button.innerHTML = '<i class="fas fa-sync"></i> Refill';
                 }
             } else { // Fallback if countSpan missing or count invalid
                 button.innerHTML = '<i class="fas fa-check"></i> Refill Requested';
                 // Decide if button should be re-enabled or stay disabled
             }

        } else {
            showUserMessage(result.message, 'error');
            button.innerHTML = '<i class="fas fa-exclamation-circle"></i> Refill Failed';
             // Optionally re-enable after a delay if it was a temporary error and refills > 0
             const currentPrescription = activePrescriptionsCache.find(p => p.id === prescriptionId);
             setTimeout(() => {
                 if(currentPrescription && currentPrescription.refillsRemaining > 0){
                     button.disabled = false;
                      button.innerHTML = '<i class="fas fa-sync"></i> Refill';
                 } else {
                     button.innerHTML = '<i class="fas fa-times"></i> No Refills Left'; // Keep disabled if 0
                 }
             }, 2000);
        }
    } catch (error) {
        console.error('Error requesting refill:', error);
        showUserMessage('An unexpected error occurred during refill request.', 'error');
         button.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
         const currentPrescription = activePrescriptionsCache.find(p => p.id === prescriptionId);
         setTimeout(() => {
              if(currentPrescription && currentPrescription.refillsRemaining > 0){
                 button.disabled = false;
                 button.innerHTML = '<i class="fas fa-sync"></i> Refill';
              } else {
                 button.innerHTML = '<i class="fas fa-times"></i> No Refills Left'; // Keep disabled if 0
              }
          }, 2000);
    }
}

// Removed handleDetailsClick function

function handleRefillAll() {
    console.warn('Refill All functionality needs review/implementation.');
    let requestedCount = 0;
    let alreadyRequestedOrNoRefills = 0;

    activePrescriptionsCache.forEach(prescription => {
        const card = document.querySelector(`.prescription-card[data-id="${prescription.id}"]`);
        const button = card?.querySelector('.refill-btn');

        if (button && !button.disabled && prescription.refillsRemaining > 0) {
            // Simulate clicking the button (triggers visual update and API call via handleRefillClick)
            button.click();
            requestedCount++;
        } else {
            alreadyRequestedOrNoRefills++;
        }
    });

    if (requestedCount > 0) {
        showUserMessage(`Refill requested for ${requestedCount} eligible prescription(s).`, 'info');
    } else if (alreadyRequestedOrNoRefills > 0) {
         showUserMessage('No active prescriptions eligible for refill at this time.', 'info');
    } else {
        // This case shouldn't happen if there are active prescriptions displayed
        showUserMessage('Could not process refill all request.', 'warning');
    }
}


// Removed showPrescriptionDetailsModal function


// --- Utility Functions for Prescriptions Page ---
function showLoading(container, message = 'Loading...') {
    // Check if the container is a table body or a general div
    if (container.tagName === 'TBODY') {
        const colSpan = container.closest('table')?.querySelector('thead th')?.colSpan || 5; // Get colSpan from header or default
        container.innerHTML = `<tr><td colspan="${colSpan}"><div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i><p>${message}</p></div></td></tr>`;
    } else {
         container.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i><p>${message}</p></div>`;
    }
}

function showError(container, message = 'An error occurred.') {
    // Check if the container is a table body or a general div
     if (container.tagName === 'TBODY') {
         const colSpan = container.closest('table')?.querySelector('thead th')?.colSpan || 5;
         container.innerHTML = `<tr><td colspan="${colSpan}"><p class="text-center text-danger">${message}</p></td></tr>`;
     } else {
          container.innerHTML = `<p class="text-center text-danger">${message}</p>`;
     }
}


// Note: formatDate and showUserMessage helper functions are assumed
// to be available globally (likely defined in app.js)
// The closeModal function might still be needed if other modals exist (like doctor profile),
// so it should likely remain in app.js