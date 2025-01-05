const calendar = document.getElementById('calendar');
const currentMonthElement = document.getElementById('currentMonth');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const slotsContainer = document.getElementById('slots');
const confirmBtn = document.getElementById('confirmBtn');

let selectedDate = null;
let selectedSlot = null;
let bookedSlots = {};

const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();

// Fetch booked slots from the backend
const fetchBookedSlots = () => {
    fetch('get_booked_slots.php')
        .then(response => response.json())
        .then(data => {
            bookedSlots = data;
            generateCalendar(currentYear, currentMonth);
        })
        .catch(error => console.error('Error fetching slots:', error));
};

// Generate the calendar
const generateCalendar = (year, month) => {
    calendar.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    currentMonthElement.textContent = new Date(year, month).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
    });

    // Add empty days for padding
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        calendar.appendChild(emptyDiv);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.textContent = day;
        dayDiv.dataset.date = date;

        // Check if the date is in the past
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        
        if (checkDate < currentDate) {
            dayDiv.classList.add('booked');
            dayDiv.style.backgroundColor = '#999'; // Gray out past dates
        } else {
            dayDiv.addEventListener('click', () => selectDate(date));
        }

        calendar.appendChild(dayDiv);
    }
};

// Select a date
const selectDate = (date) => {
    selectedDate = date;
    document.querySelectorAll('.day').forEach((day) => day.classList.remove('selected'));
    document.querySelector(`[data-date="${date}"]`).classList.add('selected');
    fetchSlots(date);
};

// Fetch available slots for the selected date
const fetchSlots = (date) => {
    slotsContainer.style.display = 'block';
    slotsContainer.innerHTML = `<h3>Available Slots for ${date}</h3>`;

    const slots = [
        "10:00 AM", "11:00 AM", "12:00 PM", 
        "1:00 PM", "2:00 PM", "3:00 PM", 
        "4:00 PM", "5:00 PM", "6:00 PM"
    ];

    // Get booked slots for the selected date
    const dateBookedSlots = bookedSlots[date] || [];

    slots.forEach(slot => {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'slot';
        slotDiv.textContent = slot;

        if (dateBookedSlots.includes(slot)) {
            slotDiv.classList.add('booked');
        } else {
            slotDiv.addEventListener('click', () => selectSlot(slotDiv, slot));
        }

        slotsContainer.appendChild(slotDiv);
    });
};

// Select a slot
const selectSlot = (slotDiv, slot) => {
    selectedSlot = slot;
    document.querySelectorAll('.slot').forEach((s) => s.classList.remove('selected'));
    slotDiv.classList.add('selected');
    confirmBtn.style.display = 'block';
};

// Confirm the booking
confirmBtn.addEventListener('click', () => {
    if (selectedDate && selectedSlot) {
        const data = {
            date: selectedDate,
            slot_time: selectedSlot,
        };

        fetch('book_slot.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            if (result.status === 'success') {
                // Refresh the booked slots and update the display
                fetchBookedSlots();
                // Clear selection
                selectedDate = null;
                selectedSlot = null;
                slotsContainer.style.display = 'none';
                confirmBtn.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while booking the slot. Please try again.');
        });
    } else {
        alert('Please select a date and a slot before confirming.');
    }
});

// Handle previous month navigation
prevMonthButton.addEventListener('click', () => {
    currentMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    currentYear = currentMonth === 11 ? currentYear - 1 : currentYear;
    generateCalendar(currentYear, currentMonth);
});

// Handle next month navigation
nextMonthButton.addEventListener('click', () => {
    currentMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    currentYear = currentMonth === 0 ? currentYear + 1 : currentYear;
    generateCalendar(currentYear, currentMonth);
});

// Initial setup
fetchBookedSlots();