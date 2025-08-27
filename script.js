// DOM elements
const periodicTable = document.getElementById('periodicTable');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const categoryFilter = document.getElementById('categoryFilter');
const elementModal = document.getElementById('elementModal');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModal');

// Modal content elements
const modalSymbol = document.getElementById('modalSymbol');
const modalTitle = document.getElementById('modalTitle');
const modalAtomicNumber = document.getElementById('modalAtomicNumber');
const modalAtomicMass = document.getElementById('modalAtomicMass');
const modalCategory = document.getElementById('modalCategory');
const modalElectronConfig = document.getElementById('modalElectronConfig');
const modalPhase = document.getElementById('modalPhase');
const modalDiscovered = document.getElementById('modalDiscovered');

// Application state
let allElements = [];
let filteredElements = [];

// Initialize the application
function init() {
    createPeriodicTable();
    bindEventListeners();
    filteredElements = [...elementsData];
}

// Create the periodic table layout
function createPeriodicTable() {
    // Clear existing content
    periodicTable.innerHTML = '';
    
    // Create a 10x18 grid to accommodate all elements including lanthanides and actinides
    const totalCells = 10 * 18;
    
    // Initialize grid with empty cells
    for (let i = 0; i < totalCells; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('empty-cell');
        periodicTable.appendChild(emptyCell);
    }
    
    // Map elements to their grid positions
    elementsData.forEach(element => {
        const { period, group } = element.position;
        const gridPosition = calculateGridPosition(period, group);
        
        if (gridPosition !== null) {
            const elementDiv = createElementDiv(element);
            
            // Replace the empty cell at the calculated position
            const cells = periodicTable.children;
            if (cells[gridPosition]) {
                periodicTable.replaceChild(elementDiv, cells[gridPosition]);
            }
        }
    });
    
    allElements = Array.from(periodicTable.querySelectorAll('.element'));
}

// Calculate grid position based on period and group
function calculateGridPosition(period, group) {
    // Handle lanthanides (period 8) - placed in row 8 starting from column 4
    if (period === 8) {
        return 7 * 18 + (group - 1); // Row 8 (index 7), columns 4-17
    }
    
    // Handle actinides (period 9) - placed in row 9 starting from column 4
    if (period === 9) {
        return 8 * 18 + (group - 1); // Row 9 (index 8), columns 4-17
    }
    
    // Regular periodic table positions
    if (period >= 1 && period <= 7 && group >= 1 && group <= 18) {
        return (period - 1) * 18 + (group - 1);
    }
    
    return null;
}

// Create individual element div
function createElementDiv(element) {
    const elementDiv = document.createElement('div');
    elementDiv.classList.add('element', element.category);
    elementDiv.setAttribute('data-atomic-number', element.atomicNumber);
    elementDiv.setAttribute('data-symbol', element.symbol);
    elementDiv.setAttribute('data-name', element.name.toLowerCase());
    elementDiv.setAttribute('data-category', element.category);
    elementDiv.setAttribute('role', 'gridcell');
    elementDiv.setAttribute('tabindex', '0');
    elementDiv.setAttribute('aria-label', `${element.name}, symbol ${element.symbol}, atomic number ${element.atomicNumber}`);
    
    elementDiv.innerHTML = `
        <div class="atomic-number">${element.atomicNumber}</div>
        <div class="element-symbol">${element.symbol}</div>
        <div class="element-name">${element.name}</div>
    `;
    
    // Add click event listener
    elementDiv.addEventListener('click', () => openModal(element));
    
    // Add keyboard support
    elementDiv.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(element);
        }
    });
    
    return elementDiv;
}

// Open modal with element details
function openModal(element) {
    // Populate modal content
    modalSymbol.textContent = element.symbol;
    modalSymbol.className = `element-symbol ${element.category}`;
    modalTitle.textContent = element.name;
    modalAtomicNumber.textContent = `Atomic Number: ${element.atomicNumber}`;
    modalAtomicMass.textContent = element.atomicMass;
    modalCategory.textContent = categoryNames[element.category] || element.category;
    modalElectronConfig.textContent = element.electronConfig;
    modalPhase.textContent = element.phase;
    modalDiscovered.textContent = element.discovered;
    
    // Show modal
    elementModal.classList.add('active');
    modalOverlay.classList.add('active');
    elementModal.setAttribute('aria-hidden', 'false');
    
    // Focus on close button for accessibility
    closeModalBtn.focus();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    elementModal.classList.remove('active');
    modalOverlay.classList.remove('active');
    elementModal.setAttribute('aria-hidden', 'true');
    
    // Restore body scroll
    document.body.style.overflow = '';
}

// Search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        // Show all elements if search is empty
        showAllElements();
        clearSearchBtn.style.display = 'none';
        return;
    }
    
    clearSearchBtn.style.display = 'flex';
    
    allElements.forEach(elementDiv => {
        const symbol = elementDiv.getAttribute('data-symbol').toLowerCase();
        const name = elementDiv.getAttribute('data-name');
        const atomicNumber = elementDiv.getAttribute('data-atomic-number');
        
        const isMatch = symbol.includes(searchTerm) || 
                       name.includes(searchTerm) || 
                       atomicNumber.includes(searchTerm);
        
        if (isMatch) {
            elementDiv.classList.remove('hidden');
        } else {
            elementDiv.classList.add('hidden');
        }
    });
}

// Clear search
function clearSearch() {
    searchInput.value = '';
    showAllElements();
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
}

// Filter by category
function handleCategoryFilter() {
    const selectedCategory = categoryFilter.value;
    
    if (selectedCategory === 'all') {
        showAllElements();
        return;
    }
    
    allElements.forEach(elementDiv => {
        const elementCategory = elementDiv.getAttribute('data-category');
        
        if (elementCategory === selectedCategory) {
            elementDiv.classList.remove('filtered-out');
        } else {
            elementDiv.classList.add('filtered-out');
        }
    });
}

// Show all elements
function showAllElements() {
    allElements.forEach(elementDiv => {
        elementDiv.classList.remove('hidden', 'filtered-out');
    });
}

// Bind event listeners
function bindEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    
    // Category filter
    categoryFilter.addEventListener('change', handleCategoryFilter);
    
    // Modal controls
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Keyboard navigation for modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elementModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Prevent modal close when clicking inside modal content
    document.querySelector('.modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Search input keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Focus search on Ctrl/Cmd + F
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

// Initialize keyboard navigation for elements
function initializeKeyboardNavigation() {
    const elements = document.querySelectorAll('.element');
    let currentIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        if (!elementModal.classList.contains('active') && 
            !searchInput.matches(':focus') && 
            !categoryFilter.matches(':focus')) {
            
            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    currentIndex = Math.min(currentIndex + 1, elements.length - 1);
                    elements[currentIndex].focus();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    currentIndex = Math.max(currentIndex - 1, 0);
                    elements[currentIndex].focus();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    currentIndex = Math.min(currentIndex + 18, elements.length - 1);
                    elements[currentIndex].focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    currentIndex = Math.max(currentIndex - 18, 0);
                    elements[currentIndex].focus();
                    break;
            }
        }
    });
    
    // Update current index when element is focused
    elements.forEach((element, index) => {
        element.addEventListener('focus', () => {
            currentIndex = index;
        });
    });
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    initializeKeyboardNavigation();
});

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
    // Close modal on resize to prevent layout issues
    if (elementModal.classList.contains('active')) {
        closeModal();
    }
});