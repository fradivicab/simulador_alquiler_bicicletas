// 1. CONSTANTES Y DATOS INICIALES
const PRECIO_HORA = 2000;

const bicisIniciales = [
    { id: 1, modelo: "Mountain Bike", disponible: true, img: "assets/img/bici-mountain.webp" },
    { id: 2, modelo: "Urbana", disponible: true, img: "assets/img/bici-urbana.webp" },
    { id: 3, modelo: "Eléctrica", disponible: true, img: "assets/img/bici-electrica.webp" },
    { id: 4, modelo: "Doble", disponible: true, img: "assets/img/bici-doble.webp" }
];

// 2. RECUPERAR DE LOCALSTORAGE
let bicicletas = JSON.parse(localStorage.getItem("bicicletas_storage")) || bicisIniciales;
let historialVentas = JSON.parse(localStorage.getItem("ventas_storage")) || [];

// elementos
const contenedor = document.getElementById('contenedor-bicicletas');
const formulario = document.getElementById('form-devolucion');
const textoResultado = document.getElementById('resultado-pago');
const displayIngresos = document.getElementById('total-ingresos');
const btnReset = document.getElementById('btn-limpiar-storage');

// 3. FUNCIONES

// crear el catálogo
function renderizarBicicletas() {
    contenedor.innerHTML = ""; 

    bicicletas.forEach((bici) => {
        
        let claseBadge;
        let textoEstado;
        let claseBoton;
        let textoBoton;

        if (bici.disponible) {
            claseBadge = 'disponible';
            textoEstado = 'Disponible';
            claseBoton = 'btn-alquilar-activo';
            textoBoton = 'Alquilar Ahora';
        } else {
            claseBadge = 'alquilada';
            textoEstado = 'Alquilada';
            claseBoton = 'btn-deshabilitado';
            textoBoton = 'No Disponible';
        }

        //aqui nos apoyamos en las clases de tailwind para crear tarjetas
        const tarjeta = document.createElement('div');
        tarjeta.className = "card-bici";
        
        tarjeta.innerHTML = `
            <img src="${bici.img}" class="card-img">
            <div class="p-5">
                <span class="badge ${claseBadge}">${textoEstado}</span>
                <h4 class="text-xl font-bold mt-2">${bici.modelo}</h4>
                <p class="text-sm text-gray-500 mb-4">ID: #${bici.id}</p>
                <button 
                    class="btn-base ${claseBoton} btn-alquilar" 
                    data-id="${bici.id}" 
                    ${!bici.disponible ? 'disabled' : ''}>
                    ${textoBoton}
                </button>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });

    asignarEventosBotones();
    actualizarTotalRecaudado();
}

// Función para darle el evento de click a los botones de alquiler
function asignarEventosBotones() {
    const botonesAlquilar = document.querySelectorAll('.btn-alquilar');
    botonesAlquilar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const idSeleccionado = parseInt(e.target.getAttribute('data-id'));
            alquilarBici(idSeleccionado);
        });
    });
}

function alquilarBici(id) {
    const biciEncontrada = bicicletas.find(b => b.id === id);
    
    if (biciEncontrada && biciEncontrada.disponible) {
        biciEncontrada.disponible = false;
        guardarEnStorage();
        renderizarBicicletas(); // Volvemos a dibujar para que cambie el color de los labelcitos
    }
}

function procesarDevolucion(e) {
    e.preventDefault(); 

    const idInput = parseInt(document.getElementById('id-devolucion').value);
    const horasInput = parseInt(document.getElementById('horas-uso').value);

    const biciParaDevolver = bicicletas.find(b => b.id === idInput);

    if (biciParaDevolver && !biciParaDevolver.disponible && horasInput > 0) {  
        const costoTotal = horasInput * PRECIO_HORA;
        biciParaDevolver.disponible = true;

        historialVentas.push(costoTotal);

        textoResultado.innerHTML = `¡Devolución exitosa! Total a cobrar: **$${costoTotal}**`;
        textoResultado.classList.remove('hidden');

        formulario.reset();
        guardarEnStorage();
        renderizarBicicletas();
    } else {
        textoResultado.innerHTML = "❌ Datos incorrectos o bicicleta no alquilada.";
        textoResultado.classList.remove('hidden');
    }
}

// calcular ganancias
function actualizarTotalRecaudado() {
    const total = historialVentas.reduce((acumulador, actual) => acumulador + actual, 0);
    displayIngresos.innerText = `$${total}`;
}

function guardarEnStorage() {
    localStorage.setItem("bicicletas_storage", JSON.stringify(bicicletas));
    localStorage.setItem("ventas_storage", JSON.stringify(historialVentas));
}

// 4. Evento de devolucion e inicio de la web
formulario.addEventListener('submit', procesarDevolucion);

btnReset.addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});


document.addEventListener('DOMContentLoaded', renderizarBicicletas);