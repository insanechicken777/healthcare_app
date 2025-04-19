// js/dataService.js

// In a real app, these functions would make fetch() requests to a backend API.
// We are simulating that with static data and Promises.

const dataService = {
    // Simulate network delay
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    // --- Doctors Data ---
    doctors: [
        {
            id: 'john-doe',
            name: 'Dr. John Doe',
            specialty: 'Cardiology',
            experience: '15+ Years',
            education: 'MD, Harvard Medical School',
            description: 'Dr. Doe specializes in cardiovascular diseases and interventional cardiology procedures. Committed to providing patient-centered care.',
            image: 'John Doe.png' // Use consistent naming
        },
        {
            id: 'jane-smith',
            name: 'Dr. Jane Smith',
            specialty: 'Dermatology',
            experience: '12+ Years',
            education: 'MD, Johns Hopkins University',
            description: 'Dr. Smith is an expert in dermatological conditions, cosmetic procedures, and skin cancer treatments. Known for her meticulous approach.',
            image: 'Jane Smith.png'
        },
        {
            id: 'robert-johnson',
            name: 'Dr. Robert Johnson',
            specialty: 'Neurology',
            experience: '18+ Years',
            education: 'MD, Yale School of Medicine',
            description: 'Dr. Johnson specializes in neurological disorders, stroke management, and neurodegenerative diseases. Dedicated to advancing neurological care.',
            image: 'Robert.png'
        },
        {
            id: 'sarah-williams',
            name: 'Dr. Sarah Williams',
            specialty: 'Pediatrics',
            experience: '10+ Years',
            education: 'MD, Stanford University',
            description: 'Dr. Williams provides comprehensive care for infants, children, and adolescents. Passionate about child wellness and development.',
            image: 'Sarah.png'
        },
        {
            id: 'michael-brown',
            name: 'Dr. Michael Brown',
            specialty: 'Cardiology',
            experience: '20+ Years',
            education: 'MD, Columbia University',
            description: 'Leader in non-invasive cardiology and preventative heart care. Focuses on lifestyle modifications and early detection.',
            image: 'Michael.png'
        },
        {
            id: 'emily-lee',
            name: 'Dr. Emily Lee',
            specialty: 'Dermatology',
            experience: '8+ Years',
            education: 'MD, University of California, SF',
            description: 'Specializes in pediatric dermatology and complex skin conditions. Offers both medical and cosmetic dermatology services.',
            image: 'Emily.png'
        }
    ],

    getDoctors: async function() {
        console.log('Simulating fetching doctors...');
        await this.delay(500); // Simulate network delay
        console.log('Doctors data retrieved.');
        return this.doctors;
    },

    getDoctorById: async function(id) {
        await this.delay(100);
        return this.doctors.find(doc => doc.id === id);
    },

    // --- Prescriptions Data ---
    activePrescriptions: [
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
            status: 'active', // Status might be determined dynamically based on expiry
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
        // ... (Add rx-003, rx-004 from original code)
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
    ],

    historicalPrescriptions: [
        // ... (Add historical prescriptions from original code)
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
    ],

    getActivePrescriptions: async function() {
        console.log('Simulating fetching active prescriptions...');
        await this.delay(800);
        console.log('Active prescriptions retrieved.');
        return this.activePrescriptions;
    },

    getHistoricalPrescriptions: async function() {
        console.log('Simulating fetching historical prescriptions...');
        await this.delay(600);
         console.log('Historical prescriptions retrieved.');
        return this.historicalPrescriptions;
    },

    requestRefill: async function(prescriptionId) {
        console.log(`Simulating refill request for ${prescriptionId}...`);
        await this.delay(700);
        // In a real app, update the backend and then maybe update local state
        const pres = this.activePrescriptions.find(p => p.id === prescriptionId);
        if (pres && pres.refillsRemaining > 0) {
            pres.refillsRemaining--; // Simulate decrement (won't persist without proper state management)
            console.log(`Refill successful for ${prescriptionId}. Remaining: ${pres.refillsRemaining}`);
            return { success: true, message: `Refill submitted for ${pres.name}. ${pres.refillsRemaining} refills left.` };
        } else if (pres) {
             console.log(`Refill failed for ${prescriptionId}. No refills left.`);
             return { success: false, message: `No refills remaining for ${pres.name}.` };
        } else {
            console.log(`Refill failed. Prescription ${prescriptionId} not found.`);
            return { success: false, message: 'Prescription not found.' };
        }
    },

     // --- Appointments Data (Using Local Storage for demo persistence) ---
    saveAppointment: function(appointmentData) {
        try {
            let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
            appointmentData.id = `appt-${Date.now()}`; // Simple unique ID
            appointmentData.createdAt = new Date().toISOString();
            appointments.push(appointmentData);
            localStorage.setItem('appointments', JSON.stringify(appointments));
            console.log('Appointment saved to localStorage:', appointmentData);
            return { success: true, appointment: appointmentData };
        } catch (error) {
            console.error("Error saving appointment to localStorage:", error);
            return { success: false, message: "Could not save appointment." };
        }
    },

    getAppointments: async function() {
        console.log('Getting appointments from localStorage...');
        await this.delay(100); // Simulate slight delay
        try {
            return JSON.parse(localStorage.getItem('appointments')) || [];
        } catch (error) {
             console.error("Error getting appointments from localStorage:", error);
             return [];
        }
    }

};

// Make doctor names available for appointment form dropdown
const doctorOptions = dataService.doctors.map(doc => ({
    value: doc.id, // Use ID as value
    name: doc.name // Display name
}));