function showViews(idVistaMostrada) {
    const vistas = document.querySelectorAll('.view');
    
    vistas.forEach(v => v.style.display = 'none');

    const vistaActiva = document.getElementById(idVistaMostrada);
    if (vistaActiva) {
        vistaActiva.style.display = 'block';
    }
}
