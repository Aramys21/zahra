// Initialiser la page de confirmation
function initConfirmationPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order');
    
    if (orderId) {
        loadOrderDetails(orderId);
    } else {
        // Si pas d'ID de commande, essayer de récupérer la dernière commande
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        if (orders.length > 0) {
            const lastOrder = orders[orders.length - 1];
            loadOrderDetails(lastOrder.id);
        }
    }
}

function loadOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id == orderId);
    
    if (order) {
        document.getElementById('order-number').textContent = `#${order.id}`;
        
        const date = new Date(order.createdAt);
        document.getElementById('order-date').textContent = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        const total = order.total + order.shipping;
        document.getElementById('order-total').textContent = `${total.toLocaleString()} DA`;
        
        const paymentMethods = {
            'ccp': 'CCP (Chèque Postal)',
            'card': 'Carte Bancaire',
            'cash': 'Paiement à la livraison',
            'baridi': 'BaridiMob'
        };
        
        document.getElementById('payment-method').textContent = paymentMethods[order.paymentMethod] || order.paymentMethod;
    }
}

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConfirmationPage);
} else {
    initConfirmationPage();
}
