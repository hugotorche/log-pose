class RoadTripInventory {
    constructor() {
        this.inventoryData = null;
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.items = [];
        this.categories = [];

        this.loadInventoryData();
    }

    loadInventoryData() {
        fetch('/assets/data/inventory.json')
          .then(response => response.json())
          .then(data => {
            this.inventoryData = data;
            this.items = [...this.inventoryData.inventoryItems];
            this.categories = this.inventoryData.categories;
            this.init();
          })
          .catch(error => console.error('Error loading JSON:', error));
    }

    init() {
        this.renderCategoryFilters();
        this.renderInventoryGrid();
        this.updateStats();
        this.setupEventListeners();
        
        // Ensure grid is visible after initialization
        setTimeout(() => {
            const grid = document.getElementById('inventory-grid');
            if (grid) {
                grid.style.display = 'grid';
            }
        }, 100);
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.renderInventoryGrid();
            });
        }

        // Category filter buttons - use event delegation properly
        const categoryContainer = document.getElementById('category-filters');
        const allItemsBtn = document.querySelector('[data-category="all"]');
        
        if (allItemsBtn) {
            allItemsBtn.addEventListener('click', () => {
                this.handleCategoryFilter(allItemsBtn);
            });
        }

        if (categoryContainer) {
            categoryContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    this.handleCategoryFilter(e.target);
                }
            });
        }

        // Item card clicks - use more specific event delegation
        const inventoryGrid = document.getElementById('inventory-grid');
        if (inventoryGrid) {
            inventoryGrid.addEventListener('click', (e) => {
                const itemCard = e.target.closest('.item-card');
                if (itemCard && itemCard.dataset.itemId) {
                    this.toggleItemPacked(parseInt(itemCard.dataset.itemId));
                }
            });
        }
    }

    renderCategoryFilters() {
        const container = document.getElementById('category-filters');
        if (!container) return;

        const uniqueCategories = [...new Set(this.items.map(item => item.category))];
        
        container.innerHTML = uniqueCategories.map(categoryName => {
            const category = this.categories.find(cat => cat.name === categoryName);
            if (!category) return '';
            
            return `
                <button class="filter-btn" data-category="${category.name}">
                    ${category.icon} ${this.capitalizeFirst(category.name)}
                </button>
            `;
        }).join('');
    }

    handleCategoryFilter(button) {
        if (!button) return;

        // Remove active class from all buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to clicked button
        button.classList.add('active');

        // Update current filter
        this.currentFilter = button.dataset.category || 'all';

        // Re-render grid
        this.renderInventoryGrid();
    }

    getFilteredItems() {
        let filteredItems = [...this.items]; // Always work with a copy

        // Apply category filter
        if (this.currentFilter && this.currentFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.category === this.currentFilter);
        }

        // Apply search filter
        if (this.searchTerm && this.searchTerm.trim()) {
            const searchLower = this.searchTerm.trim().toLowerCase();
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(searchLower) ||
                item.description.toLowerCase().includes(searchLower) ||
                item.category.toLowerCase().includes(searchLower)
            );
        }

        return filteredItems;
    }

    renderInventoryGrid() {
        const grid = document.getElementById('inventory-grid');
        if (!grid) return;

        const filteredItems = this.getFilteredItems();

        // Clear existing content
        grid.innerHTML = '';

        if (filteredItems.length === 0) {
            grid.innerHTML = `
                <div class="no-items" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #8B4513;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <h3>No items found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }

        // Render items
        filteredItems.forEach(item => {
            const itemElement = this.createItemElement(item);
            grid.appendChild(itemElement);
        });

        // Ensure grid is visible
        grid.style.display = 'grid';
    }

    createItemElement(item) {
        const category = this.categories.find(cat => cat.name === item.category);
        const div = document.createElement('div');
        
        div.className = `item-card ${item.packed ? 'packed' : ''}`;
        div.dataset.itemId = item.id.toString();
        div.style.borderColor = category ? category.color : '#8B4513';

        const essentialBadge = item.essential ? '<span class="essential-badge">Essential</span>' : '';
        const packedStatus = item.packed ? 'Ongoing' : 'Finished';

        div.innerHTML = `
            <div class="item-header">
                
                <img class="item-img" src="${item.photo}"/>
                <div class="item-info">
                    <h3 class="item-name">${item.name}</h3>
                    <h7 class="item-subname">${item.subname ? item.subname : ''}</h7>
                </div>
                
            </div>
            <p class="item-description">${item.description}</p>
            <div class="item-status">
                <div class="item-icon">${category ? category.icon : '📦'}</div>
                <span class="essential-badge">${this.capitalizeFirst(item.category)}</span>
                
                <span class="pack-status">
                    ${packedStatus}
                </span>
                
            </div>
        `;

        return div;
    }

    createItemCard(item) {
        const category = this.categories.find(cat => cat.name === item.category);
        const packedClass = item.packed ? 'Ongoing' : '';
        const packedStatus = item.packed ? 'Ongoing' : 'Finished';
        const essentialBadge = item.essential ? '<span class="essential-badge">Essential</span>' : '';

        return `
            <div class="item-card ${packedClass}" data-item-id="${item.id}" style="border-color: ${category ? category.color : '#8B4513'}">
                <div class="item-header">
                    <div class="item-icon">${category ? category.icon : '📦'}</div>
                    <div class="item-info">
                        <h3 class="item-name">${item.name}</h3>
                        <div class="item-category">${this.capitalizeFirst(item.category)}</div>
                    </div>
                </div>
                <p class="item-description">${item.description}</p>
                <div class="item-status">
                    ${essentialBadge}
                    <span class="pack-status ${item.packed ? 'packed' : 'unpacked'}">
                        ${packedStatus}
                    </span>
                </div>
            </div>
        `;
    }

    toggleItemPacked(itemId) {
        const item = this.items.find(item => item.id === itemId);
        if (!item) return;

        item.packed = !item.packed;
        
        // Update the specific item card instead of re-rendering entire grid
        const card = document.querySelector(`[data-item-id="${itemId}"]`);
        if (card) {
            // Update card classes
            if (item.packed) {
                card.classList.add('packed');
            } else {
                card.classList.remove('packed');
            }

            // Update status text
            const statusElement = card.querySelector('.pack-status');
            if (statusElement) {
                statusElement.textContent = item.packed ? 'Ongoing' : 'Finished';
                statusElement.className = `pack-status ${item.packed ? 'Ongoing' : 'Finished'}`;
            }

            // Add animation effect
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        }

        this.updateStats();
    }

    updateStats() {
        const totalItems = this.items.length;
        const packedItems = this.items.filter(item => item.packed).length;
        const essentialItems = this.items.filter(item => item.essential).length;
        const essentialPacked = this.items.filter(item => item.essential && item.packed).length;

        // Update DOM elements safely
        const totalCountEl = document.getElementById('total-count');
        const packedCountEl = document.getElementById('packed-count');
        const essentialCountEl = document.getElementById('essential-count');

        if (totalCountEl) totalCountEl.textContent = totalItems;
        if (packedCountEl) packedCountEl.textContent = packedItems;
        if (essentialCountEl) essentialCountEl.textContent = `${essentialPacked}/${essentialItems}`;

        // Update stats bar styling based on progress
        const packedPercentage = (packedItems / totalItems) * 100;
        const essentialPercentage = (essentialPacked / essentialItems) * 100;

        // Add visual feedback for completion
        const packedStat = document.querySelector('.stat-item:first-child');
        const essentialStat = document.querySelector('.stat-item:last-child');

        if (packedStat) {
            if (packedPercentage === 100) {
                packedStat.style.background = 'rgba(47, 79, 79, 0.3)';
            } else {
                packedStat.style.background = 'rgba(245, 230, 211, 0.2)';
            }
        }

        if (essentialStat) {
            if (essentialPercentage === 100) {
                essentialStat.style.background = 'rgba(47, 79, 79, 0.3)';
            } else {
                essentialStat.style.background = 'rgba(245, 230, 211, 0.2)';
            }
        }
    }

    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.inventoryApp = new RoadTripInventory();
    addAdventureEffects();
});

function addAdventureEffects() {
    // Add compass navigation effect
    const compass = document.querySelector('.compass-logo');
    if (compass) {
        compass.addEventListener('click', () => {
            compass.style.transform = 'scale(1.2) rotate(360deg)';
            setTimeout(() => {
                compass.style.transform = '';
            }, 600);
        });
    }

    // Add keyboard shortcuts for adventure navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === '/') {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.blur();
                searchInput.value = '';
                // Trigger search update
                const event = new Event('input', { bubbles: true });
                searchInput.dispatchEvent(event);
            }
        }
    });

    // Add fade-in animation for cards
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .item-card {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}