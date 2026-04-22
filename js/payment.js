import { getLocalCart, getCartDetailed, getCartTotal } from "./cart.js";
import { products } from "./data.js";
import { createSupabaseClient } from "../supabase/client.js";

// Initialiser la page de paiement
async function initPaymentPage() {
    loadWilayas();
    await loadOrderSummary();
    setupPaymentForm();
}

// Charger les wilayas
function loadWilayas() {
    const wilayaSelect = document.getElementById('delivery-wilaya');
    if (wilayaSelect) {
        const wilayas = [
            "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
            "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda",
            "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
            "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
            "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Baji Mokhtar",
            "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "M'Ghaïer", "El M'Ghair"
        ];
        
        wilayas.forEach(wilaya => {
            const option = document.createElement('option');
            option.value = wilaya;
            option.textContent = wilaya;
            wilayaSelect.appendChild(option);
        });
    }
}

// Charger le résumé de commande
async function loadOrderSummary() {
    const cart = getCartDetailed();
    const orderItems = document.getElementById('order-items');
    
    if (orderItems && cart.length > 0) {
        orderItems.innerHTML = cart.map(item => `
            <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded bg-sky-100 flex items-center justify-center text-sky-600">
                    <i class="fas fa-box"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium">${item.product.name}</p>
                    <p class="text-xs text-gray-500">Quantité: ${item.quantity}</p>
                </div>
                <span class="text-sm font-medium">${(item.product.price * item.quantity).toLocaleString()} DA</span>
            </div>
        `).join('');
        
        const total = getCartTotal();
        document.getElementById('subtotal').textContent = `${total.toLocaleString()} DA`;
        document.getElementById('total').textContent = `${total.toLocaleString()} DA`;
        
        // Calculer la livraison
        calculateShipping(total);
    } else {
        orderItems.innerHTML = '<p class="text-sm text-gray-500">Votre panier est vide</p>';
        document.getElementById('subtotal').textContent = '0 DA';
        document.getElementById('total').textContent = '0 DA';
    }
}

// Calculer les frais de livraison
function calculateShipping(total) {
    const shippingElement = document.getElementById('shipping');
    let shipping = 0;
    
    if (total >= 5000) {
        shipping = 0; // Livraison gratuite à partir de 5000 DA
        shippingElement.textContent = 'Gratuit';
        shippingElement.classList.add('text-green-600');
    } else {
        shipping = 500; // 500 DA de frais de livraison
        shippingElement.textContent = `${shipping.toLocaleString()} DA`;
    }
    
    const totalWithShipping = total + shipping;
    document.getElementById('total').textContent = `${totalWithShipping.toLocaleString()} DA`;
}

// Configurer le formulaire de paiement
function setupPaymentForm() {
    const placeOrderBtn = document.getElementById('place-order');
    
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }
    
    // Mettre à jour les frais de livraison quand la wilaya change
    const wilayaSelect = document.getElementById('delivery-wilaya');
    if (wilayaSelect) {
        wilayaSelect.addEventListener('change', () => {
            const total = getCartTotal();
            calculateShipping(total);
        });
    }
}

// Gérer la commande
async function handlePlaceOrder() {
    const client = await createSupabaseClient();
    if (!client) {
        alert('Erreur: Supabase non disponible');
        return;
    }
    
    // Validation du formulaire
    const name = document.getElementById('delivery-name').value;
    const phone = document.getElementById('delivery-phone').value;
    const wilaya = document.getElementById('delivery-wilaya').value;
    const city = document.getElementById('delivery-city').value;
    const address = document.getElementById('delivery-address').value;
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
    
    if (!name || !phone || !wilaya || !city || !address) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    if (!paymentMethod) {
        alert('Veuillez choisir une méthode de paiement');
        return;
    }
    
    const cart = getCartDetailed();
    if (cart.length === 0) {
        alert('Votre panier est vide');
        return;
    }
    
    // Get user ID
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
        alert('Vous devez être connecté pour commander');
        window.location.href = './auth.html';
        return;
    }
    
    // Créer la commande
    const order = {
        user_id: user.id,
        items: cart,
        total: getCartTotal(),
        shipping: calculateShippingAmount(getCartTotal()),
        delivery: {
            name,
            phone,
            wilaya,
            city,
            address
        },
        paymentMethod,
        notes: document.getElementById('order-notes').value,
        status: 'en attente'
    };
    
    // Sauvegarder la commande dans Supabase
    const { error } = await client.from("orders").insert([order]);
    
    if (error) {
        alert('Erreur lors de la commande: ' + error.message);
        return;
    }
    
    // Vider le panier
    localStorage.removeItem('zahra_cart_guest');
    
    // Afficher confirmation
    alert('Commande confirmée ! Redirection...');
    
    // Rediriger vers la page de confirmation
    setTimeout(() => {
        window.location.href = './confirmation.html';
    }, 2000);
}

// Calculer le montant des frais de livraison
function calculateShippingAmount(total) {
    return total >= 5000 ? 0 : 500;
}

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPaymentPage);
} else {
    initPaymentPage();
}
