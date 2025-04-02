// prescriptions.js - Complete file for managing prescriptions

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const prescriptionsContainer = document.getElementById('prescriptions-container');
    const prescriptionHistoryContainer = document.getElementById('prescription-history-container');
    const historyFilter = document.getElementById('history-filter');
    const noPrescriptionsElement = document.getElementById('no-prescriptions');
    const refillAllBtn = document.getElementById('refill-all-btn');
    
    // Sample prescriptions data (in a real app, this would come from a server)
    const samplePrescriptions = [
        {
            id: 'rx-001',
            name: 'Amoxicillin',
            dosage: '500mg',
            frequency: 'Every 8 hours',
            duration: '10 days',
            prescribedBy: 'Dr. John Smith',
            prescribedDate: '2025-03-15',
            refillsRemaining: 2,
            instructions: 'Take with food. Complete the full course.',
            status: 'active',
            expiryDate: '2025-06-15'
        },
        {
            id: 'rx-002',
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '30 days',
            prescribedBy: 'Dr. Sarah Johnson',
            prescribedDate: '2025-03-20',
            refillsRemaining: 5,
            instructions: 'Take in the morning with water.',
            status: 'active',
            expiryDate: '2025-09-20'
        },
        {
            id: 'rx-003',
            name: 'Ibuprofen',
            dosage: '400mg',
            frequency: 'Every 6 hours as needed',
            duration: '7 days',
            prescribedBy: 'Dr. Michael Brown',
            prescribedDate: '2025-03-25',
            refillsRemaining: 0,
            instructions: 'Take with food. Do not exceed 4 doses in 24 hours.',
            status: 'active',
            expiryDate: '2025-04-25'
        },
        {
            id: 'rx-004',
            name: 'Metformin',
            dosage: '1000mg',
            frequency: 'Twice daily',
            duration: '90 days',
            prescribedBy: 'Dr. Emily Lee',
            prescribedDate: '2025-02-10',
            refillsRemaining: 3,
            instructions: 'Take with meals to reduce stomach upset.',
            status: 'active',
            expiryDate: '2025-08-10'
        }
    ];
    
    // Historical prescriptions
    const historicalPrescriptions = [
        {
            id: 'rx-h001',
            name: 'Azithromycin',
            dosage: '250mg',
            frequency: 'Once daily',
            duration: '5 days',
            prescribedBy: 'Dr. John Smith',
            prescribedDate: '2025-01-05',
            refillsRemaining: 0,
            instructions: 'Take on an empty stomach.',
            status: 'completed',
            expiryDate: '2025-02-05'
        },
        {
            id: 'rx-h002',
            name: 'Prednisone',
            dosage: '20mg',
            frequency: 'Once daily',
            duration: '7 days',
            prescribedBy: 'Dr. Sarah Johnson',
            prescribedDate: '2024-11-15',
            refillsRemaining: 0,
            instructions: 'Take in the morning with food.',
            status: 'completed',
            expiryDate: '2024-12-15'
        },
        {
            id: 'rx-h003',
            name: 'Ciprofloxacin',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '7 days',
            prescribedBy: 'Dr. Michael Brown',
            prescribedDate: '2024-10-10',
            refillsRemaining: 0,
            instructions: 'Take with a full glass of water. Avoid dairy products.',
            status: 'completed',
            expiryDate: '2024-11-10'
        }
    ];
    
    // Function to display active prescriptions
    function displayActivePrescriptions() {
        // Clear loading spinner
        prescriptionsContainer.innerHTML = '';
        
        // Check if there are any active prescriptions
        if (samplePrescriptions.length === 0) {
            noPrescriptionsElement.style.display = 'block';
            return;
        }
        
        // Hide the "no prescriptions" message
        noPrescriptionsElement.style.display = 'none';
        
        // Display each prescription
        samplePrescriptions.forEach(prescription => {
            const prescriptionCard = document.createElement('div');
            prescriptionCard.className = 'prescription-card';
            prescriptionCard.dataset.id = prescription.id;
            
            // Calculate days remaining
            const today = new Date();
            const expiryDate = new Date(prescription.expiryDate);
            const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            // Create status class based on days remaining
            let statusClass = 'status-good';
            if (daysRemaining < 0) {
                statusClass = 'status-expired';
            } else if (daysRemaining < 7) {
                statusClass = 'status-warning';
            }
            
            prescriptionCard.innerHTML = `
                <div class="prescription-header">
                    <h4>${prescription.name} ${prescription.dosage}</h4>
                    <span class="prescription-status ${statusClass}">
                        ${daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                    </span>
                </div>
                <div class="prescription-details">
                    <p><strong>Take:</strong> ${prescription.frequency}</p>
                    <p><strong>Duration:</strong> ${prescription.duration}</p>
                    <p><strong>Prescribed by:</strong> ${prescription.prescribedBy}</p>
                    <p><strong>Date:</strong> ${formatDate(prescription.prescribedDate)}</p>
                    <p><strong>Refills remaining:</strong> ${prescription.refillsRemaining}</p>
                    <p class="prescription-instructions"><strong>Instructions:</strong> ${prescription.instructions}</p>
                </div>
                <div class="prescription-actions">
                    <button class="btn-secondary refill-btn" ${prescription.refillsRemaining === 0 ? 'disabled' : ''}>
                        <i class="fas fa-sync"></i> Refill
                    </button>
                    <button class="btn-outline details-btn">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            `;
            
            prescriptionsContainer.appendChild(prescriptionCard);
            
            // Add event listeners to buttons
            const refillBtn = prescriptionCard.querySelector('.refill-btn');
            const detailsBtn = prescriptionCard.querySelector('.details-btn');
            
            refillBtn.addEventListener('click', function() {
                requestRefill(prescription.id);
            });
            
            detailsBtn.addEventListener('click', function() {
                showPrescriptionDetails(prescription);
            });
        });
    }
    
    // Function to display prescription history
    function displayPrescriptionHistory(filter = 'all') {
        // Clear the container
        prescriptionHistoryContainer.innerHTML = '';
        
        // Filter prescriptions based on selected time period
        let filteredPrescriptions = [...historicalPrescriptions];
        const today = new Date();
        
        if (filter !== 'all') {
            let monthsBack = 12;
            if (filter === '3months') monthsBack = 3;
            if (filter === '6months') monthsBack = 6;
            
            const cutoffDate = new Date();
            cutoffDate.setMonth(today.getMonth() - monthsBack);
            
            filteredPrescriptions = historicalPrescriptions.filter(prescription => {
                const prescribedDate = new Date(prescription.prescribedDate);
                return prescribedDate >= cutoffDate;
            });
        }
        
        // Sort by date (newest first)
        filteredPrescriptions.sort((a, b) => new Date(b.prescribedDate) - new Date(a.prescribedDate));
        
        // Create history table
        if (filteredPrescriptions.length > 0) {
            const table = document.createElement('table');
            table.className = 'history-table';
            
            // Create table header
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Medication</th>
                        <th>Dosage</th>
                        <th>Prescribed</th>
                        <th>Doctor</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;
            
            const tableBody = table.querySelector('tbody');
            
            // Add rows for each prescription
            filteredPrescriptions.forEach(prescription => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${prescription.name}</td>
                    <td>${prescription.dosage}</td>
                    <td>${formatDate(prescription.prescribedDate)}</td>
                    <td>${prescription.prescribedBy}</td>
                    <td><span class="status-completed">Completed</span></td>
                `;
                
                tableBody.appendChild(row);
            });
            
            prescriptionHistoryContainer.appendChild(table);
        } else {
            prescriptionHistoryContainer.innerHTML = '<p class="no-history">No prescription history found for the selected period.</p>';
        }
    }
    
    // Function to format dates
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    // Function to request a prescription refill
    function requestRefill(prescriptionId) {
        // Find the prescription
        const prescription = samplePrescriptions.find(p => p.id === prescriptionId);
        
        if (prescription && prescription.refillsRemaining > 0) {
            // In a real app, this would send a request to the server
            alert(`Refill request submitted for ${prescription.name}. Your refill will be ready for pickup within 24 hours.`);
            
            // Update the UI to reflect the refill request
            const prescriptionCard = document.querySelector(`.prescription-card[data-id="${prescriptionId}"]`);
            if (prescriptionCard) {
                const refillBtn = prescriptionCard.querySelector('.refill-btn');
                refillBtn.innerHTML = '<i class="fas fa-check"></i> Requested';
                refillBtn.disabled = true;
            }
        }
    }
    
    // Function to show prescription details in a modal
    function showPrescriptionDetails(prescription) {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Prescription Details</h3>
                <div class="prescription-detail-content">
                    <div class="detail-section">
                        <h4>Medication Information</h4>
                        <p><strong>Name:</strong> ${prescription.name}</p>
                        <p><strong>Dosage:</strong> ${prescription.dosage}</p>
                        <p><strong>Frequency:</strong> ${prescription.frequency}</p>
                        <p><strong>Duration:</strong> ${prescription.duration}</p>
                        <p><strong>Instructions:</strong> ${prescription.instructions}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Prescription Information</h4>
                        <p><strong>Prescribed by:</strong> ${prescription.prescribedBy}</p>
                        <p><strong>Date prescribed:</strong> ${formatDate(prescription.prescribedDate)}</p>
                        <p><strong>Expires on:</strong> ${formatDate(prescription.expiryDate)}</p>
                        <p><strong>Refills remaining:</strong> ${prescription.refillsRemaining}</p>
                        <p><strong>Prescription ID:</strong> ${prescription.id}</p>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="window.print()">
                        <i class="fas fa-print"></i> Print
                    </button>
                    <button class="btn-secondary modal-close">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        `;
        
        // Add modal to the document
        document.body.appendChild(modal);
        
        // Show the modal
        setTimeout(() => {
            modal.style.display = 'flex';
        }, 10);
        
        // Close modal when clicking the close button
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
        
        // Close modal when clicking the close button in actions
        const closeModalBtn = modal.querySelector('.modal-close');
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
        
        // Close modal when clicking outside the content
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
        });
    }
    
    // Event listener for history filter
    if (historyFilter) {
        historyFilter.addEventListener('change', function() {
            displayPrescriptionHistory(this.value);
        });
    }
    
    // Event listener for
