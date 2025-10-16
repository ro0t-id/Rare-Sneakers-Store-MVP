// Product Data
const productCatalog = {
    products: [],
    
    // Add product to catalog
    addProduct(product) {
        this.products.push(product);
        return product.id;
    },
    
    // Find product by ID
    findProductById(id) {
        return this.products.find(product => product.id === id);
    },
    
    // Find products by brand
    findProductsByBrand(brand) {
        return this.products.filter(product => 
            product.brand.toLowerCase() === brand.toLowerCase()
        );
    },
    
    // Get featured products
    getFeaturedProducts() {
        return this.products.filter(product => product.featured);
    },
    
    // Update product stock
    updateStock(productId, variantId, quantity) {
        const product = this.findProductById(productId);
        if (!product) return false;
        
        if (variantId) {
            const variant = product.variants.find(v => v.id === variantId);
            if (variant) {
                variant.stock = quantity;
                return true;
            }
        } else {
            product.inventory.stock = quantity;
            return true;
        }
        
        return false;
    }
};

// Shopping Cart
const shoppingCart = {
    id: "CART001",
    userId: null, // or null for guest
    items: [],
    currency: "USD",
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    
    // Add item to cart
    addItem(product, variant = null, quantity = 1) {
        const existingItem = this.items.find(item => 
            item.productId === product.id && 
            item.variantId === (variant?.id || null)
        );
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: `CARTITEM${Date.now()}`,
                productId: product.id,
                variantId: variant?.id || null,
                productName: product.name,
                variantName: variant ? `${variant.color} - Size ${variant.size}` : '',
                price: variant?.price || product.price,
                quantity: quantity,
                image: product.images.find(img => img.isPrimary)?.url || product.images[0]?.url,
                stock: variant?.stock || product.inventory.stock
            });
        }
        
        this.updateTotals();
        this.updateCartUI();
    },
    
    // Remove item from cart
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.updateTotals();
        this.updateCartUI();
    },
    
    // Update item quantity
    updateQuantity(itemId, quantity) {
        const item = this.items.find(item => item.id === itemId);
        if (item && quantity > 0) {
            item.quantity = quantity;
            this.updateTotals();
            this.updateCartUI();
        }
    },
    
    // Calculate totals
    updateTotals() {
        this.subtotal = this.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
        
        this.tax = this.subtotal * 0.08; // 8% tax example
        this.shipping = this.subtotal > 50 ? 0 : 9.99; // Free shipping over $50
        this.total = this.subtotal + this.tax + this.shipping;
    },
    
    // Clear cart
    clear() {
        this.items = [];
        this.updateTotals();
        this.updateCartUI();
    },
    
    // Get cart summary
    getSummary() {
        return {
            itemCount: this.items.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: this.subtotal,
            tax: this.tax,
            shipping: this.shipping,
            total: this.total
        };
    },
    
    // Update cart UI
    updateCartUI() {
        const cartCount = document.querySelector('.cart-count');
        const cartItems = document.getElementById('cartItems');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartShipping = document.getElementById('cartShipping');
        const cartTax = document.getElementById('cartTax');
        const cartTotal = document.getElementById('cartTotal');
        
        // Update cart count
        cartCount.textContent = this.getSummary().itemCount;
        
        // Update cart items
        if (this.items.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        } else {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.productName}">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.productName}</div>
                        <div class="cart-item-variant">${item.variantName}</div>
                        <div class="cart-item-price">KES${item.price.toFixed(2)}</div>
                        <div class="cart-item-actions">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                            <button class="remove-item" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Add event listeners to quantity buttons
            document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemId = e.target.closest('button').dataset.id;
                    const item = this.items.find(item => item.id === itemId);
                    if (item.quantity > 1) {
                        this.updateQuantity(itemId, item.quantity - 1);
                    }
                });
            });
            
            document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemId = e.target.closest('button').dataset.id;
                    const item = this.items.find(item => item.id === itemId);
                    this.updateQuantity(itemId, item.quantity + 1);
                });
            });
            
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemId = e.target.closest('button').dataset.id;
                    this.removeItem(itemId);
                });
            });
        }
        
        // Update totals - FIXED: Check if elements exist before updating
        if (cartSubtotal && cartShipping && cartTax && cartTotal) {
            const summary = this.getSummary();
            cartSubtotal.textContent = `KES${summary.subtotal.toFixed(2)}`;
            cartShipping.textContent = summary.shipping === 0 ? 'FREE' : `KES${summary.shipping.toFixed(2)}`;
            cartTax.textContent = `KES${summary.tax.toFixed(2)}`;
            cartTotal.textContent = `KES${summary.total.toFixed(2)}`;
        }
    }
};

// Initialize with sample data
function initializeSampleData() {
    const sampleProducts = [
        {
            id: "SNK001",
            name: "Nike Air Max 90",
            brand: "Nike",
            price: 2999.99,
            comparePrice: 3499.99,
            category: "lifestyle",
            featured: true,
            inventory: { stock: 50 },
            variants: [
                { id: "VAR001", color: "Black", size: "10", stock: 25 },
                { id: "VAR002", color: "Black", size: "11", stock: 25 }
            ],
            images: [{ url: "https://images.unsplash.com/photo-1592317243138-b5d71ac1d271?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bmlrZS1haXJtYXgtOTB8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=500", 
                       isPrimary: true }],
            description: "Classic Nike Air Max 90 with premium materials and iconic design."
        },
        {
            id: "SNK002",
            name: "Adidas Ultraboost",
            brand: "Adidas",
            price: 1999.99,
            comparePrice: 2499.99,
            category: "running",
            featured: true,
            inventory: { stock: 30 },
            variants: [
                { id: "VAR003", color: "White", size: "9", stock: 15 },
                { id: "VAR004", color: "White", size: "10", stock: 15 }
            ],
            images: [{ url: "https://images.unsplash.com/photo-1613972798759-e677d3fb640f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGFkaWRhcyUyMHVsdHJhYm9vc3R8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=500", 
                        isPrimary: true }],
            description: "Revolutionary running shoes with Boost technology for maximum energy return."
        },
        {
            id: "SNK003",
            name: "Air Jordan 1 Retro High",
            brand: "Jordan",
            price: 2499.00,
            comparePrice: 2999.00,
            category: "lifestyle",
            featured: true,
            inventory: { stock: 20 },
            variants: [
                { id: "VAR005", color: "Black/Red", size: "9", stock: 10 },
                { id: "VAR006", color: "Black/Red", size: "10", stock: 10 }
            ],
            images: [{ url: "https://images.unsplash.com/photo-1669205073423-5da5a5280572?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8QWlyJTIwSm9yZGFuJTIwMSUyMFJldHJvJTIwSGlnaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500", 
                        isPrimary: true }],
            description: "Iconic Air Jordan 1 in the classic Bred colorway."
        },
        {
            id: "SNK004",
            name: "New Balance 990v5",
            brand: "New Balance",
            price: 1799.99,
            comparePrice: 0,
            category: "lifestyle",
            featured: true,
            inventory: { stock: 40 },
            variants: [
                { id: "VAR007", color: "Gray", size: "8", stock: 10 },
                { id: "VAR008", color: "Gray", size: "9", stock: 10 },
                { id: "VAR009", color: "Gray", size: "10", stock: 10 },
                { id: "VAR010", color: "Gray", size: "11", stock: 10 }
            ],
            images: [{ url: "https://images.unsplash.com/photo-1621315271772-28b1f3a5df87?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8TmV3JTIwQmFsYW5jZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500",
                        isPrimary: true }],
            description: "Made in USA premium sneakers with superior comfort and durability."
        },
        {
            id: "SNK005",
            name: "Nike Dunk Low",
            brand: "Nike",
            price: 3800.00,
            comparePrice: 4420.00,
            category: "skateboarding",
            featured: true,
            inventory: { stock: 35 },
            variants: [
                { id: "VAR011", color: "Black/White", size: "8", stock: 10 },
                { id: "VAR012", color: "Black/White", size: "9", stock: 10 },
                { id: "VAR013", color: "Black/White", size: "10", stock: 15 }
            ],
            images: [{ url: "https://images.unsplash.com/photo-1615290642924-8e6883b28a5e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8TmlrZSUyMER1bmslMjBMb3d8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=500", 
                        isPrimary: true }],
            description: "Classic skate shoe with durable construction and timeless style."
        },
        {
            id: "SNK006",
            name: "Adidas Stan Smith",
            brand: "Adidas",
            price: 3499.00,
            comparePrice: 4000.00,
            category: "lifestyle",
            featured: true,
            inventory: { stock: 60 },
            variants: [
                { id: "VAR014", color: "White/Green", size: "7", stock: 15 },
                { id: "VAR015", color: "White/Green", size: "8", stock: 15 },
                { id: "VAR016", color: "White/Green", size: "9", stock: 15 },
                { id: "VAR017", color: "White/Green", size: "10", stock: 15 }
            ],
            images: [{ url: "adidas-stan-smith.jpg", isPrimary: true }],
            description: "Timeless tennis-inspired sneakers with clean, minimalist design."
        }
    ];
    
    // Add to catalog
    sampleProducts.forEach(product => productCatalog.addProduct(product));
    
    console.log("Sample data initialized!");
}

// Render products
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const featuredProducts = productCatalog.getFeaturedProducts();
    
    productsGrid.innerHTML = featuredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">
            <img src="${product.images[0].url}" alt="${product.name}">
            </div>
            <div class="product-info">
                <div class="product-brand">${product.brand}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">KES${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                    <button class="view-details">Details</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to Add to Cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const product = productCatalog.findProductById(productId);
            shoppingCart.addItem(product);
            
            // Show a quick confirmation
            const originalText = e.target.textContent;
            e.target.textContent = "Added!";
            e.target.style.backgroundColor = "var(--success)";
            
            setTimeout(() => {
                e.target.textContent = originalText;
                e.target.style.backgroundColor = "";
            }, 1500);
        });
    });
}

// Initialize the app
function initApp() {
    initializeSampleData();
    renderProducts();
    
    // Initialize cart totals to avoid undefined errors
    shoppingCart.updateTotals();
    shoppingCart.updateCartUI();
    
    // Cart toggle functionality
    const cartIcon = document.getElementById('cartIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');
    
    if (cartIcon && cartSidebar && closeCart && overlay) {
        cartIcon.addEventListener('click', () => {
            cartSidebar.classList.add('active');
            overlay.classList.add('active');
        });
        
        closeCart.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
        
        overlay.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // In a real app, you would filter products here
            // For this demo, we'll just show all featured products
            renderProducts();
        });
    });
}

// Checkout button should interact with backend via RESTApis in future
const checkOutBtn = document.querySelector(".checkout-btn");

checkOutBtn.addEventListener("click",() => window.alert("Backend coming soon! But thanks for trying out my app?"));

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);