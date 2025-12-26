// Shopping Cart Functionality
let cart = [];

// Initialize Stripe (replace with your publishable key after setup)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_KEY_HERE'; // You'll replace this
const stripe = window.Stripe ? window.Stripe(STRIPE_PUBLISHABLE_KEY) : null;

// Backend URL (you'll need to deploy a backend - I'll provide instructions)
const BACKEND_URL = 'YOUR_BACKEND_URL_HERE'; // You'll replace this

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('rachelsRiseCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('rachelsRiseCart', JSON.stringify(cart));
}

// Add to Cart
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const productName = this.getAttribute('data-name');
        const productPrice = parseFloat(this.getAttribute('data-price'));
        const productId = this.getAttribute('data-id');

        // Check if item already in cart
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1
            });
        }

        saveCart();
        updateCartUI();
        
        // Visual feedback
        this.textContent = 'Added! ✓';
        this.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            this.textContent = 'Add to Cart';
            this.style.backgroundColor = '';
        }, 1500);
    });
});

// Update Cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items display
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '$0.00';
        checkoutBtn.disabled = true;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                </div>
                <div class="cart-item-controls">
                    <div class="cart-item-qty">
                        <button class="qty-btn qty-decrease" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn qty-increase" data-id="${item.id}">+</button>
                    </div>
                    <button class="remove-item" data-id="${item.id}">Remove</button>
                </div>
            </div>
        `).join('');

        // Calculate total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
        checkoutBtn.disabled = false;

        // Add event listeners to quantity buttons
        document.querySelectorAll('.qty-decrease').forEach(btn => {
            btn.addEventListener('click', function() {
                decreaseQuantity(this.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.qty-increase').forEach(btn => {
            btn.addEventListener('click', function() {
                increaseQuantity(this.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                removeItem(this.getAttribute('data-id'));
            });
        });
    }
}

// Increase Quantity
function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += 1;
        saveCart();
        updateCartUI();
    }
}

// Decrease Quantity
function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            removeItem(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

// Remove Item
function removeItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Cart Modal
const cartModal = document.getElementById('cartModal');
const cartBtn = document.getElementById('cartBtn');
const closeCart = document.getElementById('closeCart');

cartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    cartModal.classList.add('active');
});

closeCart.addEventListener('click', function() {
    cartModal.classList.remove('active');
});

cartModal.addEventListener('click', function(e) {
    if (e.target === cartModal) {
        cartModal.classList.remove('active');
    }
});

// Checkout
document.getElementById('checkoutBtn').addEventListener('click', async function() {
    if (cart.length === 0) return;

    const checkoutBtn = this;
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Processing...';

    try {
        // Check if Stripe is configured
        if (!stripe || STRIPE_PUBLISHABLE_KEY === 'pk_test_YOUR_KEY_HERE') {
            // Fallback to manual checkout for now
            manualCheckout();
            return;
        }

        // Create checkout session via backend
        const response = await fetch(`${BACKEND_URL}/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items: cart })
        });

        const session = await response.json();

        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            alert(result.error.message);
        }
    } catch (error) {
        console.error('Error:', error);
        // Fallback to manual checkout
        manualCheckout();
    } finally {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Proceed to Checkout';
    }
});

// Manual checkout fallback
function manualCheckout() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');
    
    alert(`Thank you for your order!\n\nItems: ${itemsList}\nTotal: $${total.toFixed(2)}\n\nRachel will contact you shortly to arrange pickup/delivery and payment.`);
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();
    cartModal.classList.remove('active');
}

// Contact Form
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    alert(`Thank you for reaching out, ${name}! Rachel will respond to your message at ${email} soon.`);
    
    this.reset();
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.querySelector('.nav-menu');

mobileMenuBtn.addEventListener('click', function() {
    navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
    
    if (navMenu.style.display === 'flex') {
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.backgroundColor = 'white';
        navMenu.style.flexDirection = 'column';
        navMenu.style.padding = '1rem';
        navMenu.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#cartModal') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                if (window.innerWidth <= 768) {
                    navMenu.style.display = 'none';
                }
            }
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
});

// Initialize cart on page load
loadCart();

// Add scroll reveal animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.product-card, .about-content, .contact-content').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});
