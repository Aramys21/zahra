// Système de notifications professionnelles
class NotificationSystem {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Créer le conteneur de notifications
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.className = 'fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(this.container);
  }

  show(message, type = 'success', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `
      pointer-events-auto flex items-center gap-3 rounded-lg border p-4 shadow-lg
      transform translate-x-full transition-all duration-300
      ${this.getTypeClasses(type)}
    `;
    
    const icon = this.getIcon(type);
    
    notification.innerHTML = `
      <div class="flex-shrink-0">${icon}</div>
      <div class="flex-1">
        <p class="text-sm font-medium">${message}</p>
      </div>
      <button onclick="this.parentElement.remove()" class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    this.container.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 10);
    
    // Auto-suppression
    setTimeout(() => {
      notification.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  getTypeClasses(type) {
    const classes = {
      success: 'border-green-200 bg-green-50 text-green-800',
      error: 'border-red-200 bg-red-50 text-red-800',
      warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
      info: 'border-blue-200 bg-blue-50 text-blue-800'
    };
    return classes[type] || classes.info;
  }

  getIcon(type) {
    const icons = {
      success: '<i class="fas fa-check-circle text-green-600 text-xl"></i>',
      error: '<i class="fas fa-exclamation-circle text-red-600 text-xl"></i>',
      warning: '<i class="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>',
      info: '<i class="fas fa-info-circle text-blue-600 text-xl"></i>'
    };
    return icons[type] || icons.info;
  }

  success(message, duration) {
    this.show(message, 'success', duration);
  }

  error(message, duration) {
    this.show(message, 'error', duration);
  }

  warning(message, duration) {
    this.show(message, 'warning', duration);
  }

  info(message, duration) {
    this.show(message, 'info', duration);
  }
}

// Instance globale
const notifications = new NotificationSystem();

// Export pour utilisation dans d'autres modules
export { notifications, NotificationSystem };
