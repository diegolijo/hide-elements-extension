// Agrega un listener para hacer clic en cualquier parte de la página
document.addEventListener('click', function(event) {
  // Previene el comportamiento por defecto
  event.preventDefault();
  
  // Detiene la propagación del evento
  event.stopPropagation();

  // Aplica el estilo display: none !important al elemento clickeado
  const element = event.target;
  element.style.setProperty('display', 'none', 'important');
}, true); // Use capturing phase to capture clicks on all elements