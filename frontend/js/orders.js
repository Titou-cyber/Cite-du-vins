// frontend/js/orders.js
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    if (!authApi.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load orders
    loadOrders();
});

async function loadOrders() {
    try {
        // Show loader
        const ordersLoader = document.getElementById('orders-loader');
        const ordersEmpty = document.getElementById('orders-empty');
        const ordersList = document.getElementById('orders-list');
        
        if (ordersLoader) ordersLoader.style.display = 'block';
        if (ordersEmpty) ordersEmpty.style.display = 'none';
        
        // In a real app, you would fetch orders from the server
        // Here we'll create mock data for demonstration
        const orders = await getMockOrders();
        
        if (orders.length === 0) {
            if (ordersLoader) ordersLoader.style.display = 'none';
            if (ordersEmpty) ordersEmpty.style.display = 'block';
            return;
        }
        
        // Generate HTML for orders
        if (ordersList) {
            let html = '';
            
            orders.forEach(order => {
                html += `
                    <div class="order-card">
                        <div class="order-header">
                            <div class="order-info">
                                <div class="order-number">Commande #${order.id}</div>
                                <div class="order-date">${new Date(order.date).toLocaleDateString('fr-FR')}</div>
                            </div>
                            <div class="order-status status-${order.status.toLowerCase()}">${getStatusLabel(order.status)}</div>
                        </div>
                        <div class="order-items">
                            ${order.items.map(item => `
                                <div class="order-item">
                                    <div class="item-image">
                                        <img src="${item.image || 'assets/images/wine-placeholder.jpg'}" alt="${item.title}">
                                    </div>
                                    <div class="item-details">
                                        <div class="item-title">${item.title}</div>
                                        <div class="item-meta">
                                            <span class="item-quantity">Qté: ${item.quantity}</span>
                                            <span class="item-price">€${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-footer">
                            <div class="order-total">
                                <span class="total-label">Total:</span>
                                <span class="total-value">€${order.total.toFixed(2)}</span>
                            </div>
                            <div class="order-actions">
                                <button class="btn secondary" onclick="viewOrderDetails('${order.id}')">
                                    Voir les détails
                                </button>
                                ${order.status === 'COMPLETED' ? `
                                    <button class="btn outline" onclick="reorderItems('${order.id}')">
                                        Commander à nouveau
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            ordersList.innerHTML = html;
        }
        
        // Hide loader
        if (ordersLoader) ordersLoader.style.display = 'none';
        
    } catch (error) {
        console.error('Error loading orders:', error);
        
        // Hide loader
        const ordersLoader = document.getElementById('orders-loader');
        if (ordersLoader) ordersLoader.style.display = 'none';
        
        // Show error message
        const ordersList = document.getElementById('orders-list');
        if (ordersList) {
            ordersList.innerHTML = `
                <div class="error-message">
                    Une erreur est survenue lors du chargement des commandes. Veuillez réessayer.
                </div>
            `;
        }
    }
}

function getStatusLabel(status) {
    switch (status) {
        case 'PENDING': return 'En attente';
        case 'PROCESSING': return 'En cours de traitement';
        case 'SHIPPED': return 'Expédiée';
        case 'DELIVERED': return 'Livrée';
        case 'COMPLETED': return 'Terminée';
        case 'CANCELLED': return 'Annulée';
        default: return status;
    }
}

async function getMockOrders() {
    // This would be replaced with a real API call in production
    return [
        {
            id: 'ORD-2023-1254',
            date: '2023-03-25T10:30:00Z',
            status: 'COMPLETED',
            items: [
                {
                    id: '1',
                    title: 'Château Margaux 2015',
                    quantity: 1,
                    price: 420,
                    image: 'assets/images/wine-placeholder.jpg'
                },
                {
                    id: '2',
                    title: 'Domaine de la Romanée-Conti 2018',
                    quantity: 1,
                    price: 1250,
                    image: 'assets/images/wine-placeholder2.jpg'
                }
            ],
            shipping: {
                address: '123 Rue de Bordeaux',
                city: 'Bordeaux',
                postal: '33000',
                country: 'France'
            },
            subtotal: 1670,
            tax: 334,
            shipping_cost: 15,
            total: 2019
        },
        {
            id: 'ORD-2023-1255',
            date: '2023-03-15T14:20:00Z',
            status: 'SHIPPED',
            items: [
                {
                    id: '3',
                    title: 'Château Lafite Rothschild 2016',
                    quantity: 2,
                    price: 850,
                    image: 'assets/images/wine-placeholder.jpg'
                }
            ],
            shipping: {
                address: '123 Rue de Bordeaux',
                city: 'Bordeaux',
                postal: '33000',
                country: 'France'
            },
            subtotal: 1700,
            tax: 340,
            shipping_cost: 0,
            total: 2040
        }
    ];
}

function viewOrderDetails(orderId) {
    // In a real app, this would navigate to an order details page
    window.location.href = `order-details.html?id=${orderId}`;
}

async function reorderItems(orderId) {
    try {
        // Get the order
        const orders = await getMockOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            throw new Error('Order not found');
        }
        
        // Add items to cart
        for (const item of order.items) {
            await cartManager.addToCart({
                id: item.id,
                title: item.title,
                price: item.price,
                image: item.image
            }, item.quantity);
        }
        
        // Show success message
        alert('Les articles ont été ajoutés à votre panier.');
        
    } catch (error) {
        console.error('Error reordering items:', error);
        alert('Une erreur est survenue lors de l\'ajout des articles au panier.');
    }
}