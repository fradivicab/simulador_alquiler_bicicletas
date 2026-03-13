// 1. CONFIGURACIÓN Y DATOS
const PRECIO_HORA = 2000;

const bicisIniciales = [
    { id: 1, modelo: "Mountain Bike", disponible: true, img: "assets/img/bici-mountain.webp" },
    { id: 2, modelo: "Urbana", disponible: true, img: "assets/img/bici-urbana.webp" },
    { id: 3, modelo: "Eléctrica", disponible: true, img: "assets/img/bici-electrica.webp" },
    { id: 4, modelo: "Doble", disponible: true, img: "assets/img/bici-doble.webp" }
];

// --- CLASE PARA GESTIONAR CADA ALQUILER ---
class Alquiler {
    constructor(cliente, ciudad, telefono, bicicleta, horas) {
        this.cliente = cliente;
        this.ciudad = ciudad;
        this.telefono = telefono;
        this.bicicleta = bicicleta;
        this.horas = horas;
        this.totalEstimado = this.calcularPresupuesto();
    }

    calcularPresupuesto() {
        return this.horas * PRECIO_HORA;
    }

    obtenerResumen() {
        return `
            <strong>Datos del Cliente:</strong> ${this.cliente} (${this.ciudad})<br>
            <strong>Contacto:</strong> ${this.telefono}<br>
            <strong>Bici:</strong> ${this.bicicleta.modelo}<br>
            <strong>Tiempo:</strong> ${this.horas} hs.<br>
            <strong>Presupuesto inicial:</strong> $${this.totalEstimado}
        `;
    }
}

// 2. PERSISTENCIA (LOCAL STORAGE)
let bicicletas = JSON.parse(localStorage.getItem("bicicletas_storage")) || bicisIniciales;
let historialVentas = JSON.parse(localStorage.getItem("ventas_storage")) || [];

// 3. CAPTURA DE ELEMENTOS DEL DOM
const contenedor = document.getElementById('contenedor-bicicletas');
const displayIngresos = document.getElementById('total-ingresos');
const btnReset = document.getElementById('btn-limpiar-storage');

const formAlquiler = document.getElementById('form-alquiler');
const selectBicicleta = document.getElementById('select-bicicleta');
const inputCliente = document.getElementById('cliente');
const inputCiudad = document.getElementById('ciudad');
const inputTelefono = document.getElementById('telefono');
const inputHoras = document.getElementById('horas');

const resumenDiv = document.getElementById('resumen-alquiler');
const btnConfirmar = document.getElementById('btn-confirmar');
const contenedorAcciones = document.getElementById('acciones-confirmacion');
const btnCancelar = document.getElementById('btn-cancelar');
let alquilerEnCurso = null;
const msjEstado = document.getElementById('msj-estado');

// --- FUNCIONES DE LÓGICA ---

// Mostramos las bicis usando las clases de nuestro CSS propio
function dibujarCatalogo() {
    contenedor.innerHTML = "";

    bicicletas.forEach(bici => {
        const estadoClase = bici.disponible ? 'badge-disponible' : 'badge-alquilada';
        const estadoTexto = bici.disponible ? 'Disponible' : 'Alquilada';
        const botonClase = bici.disponible ? 'btn-activo' : 'btn-bloqueado';

        const card = document.createElement('div');
        card.className = "card-bici";

        card.innerHTML = `
            <img src="${bici.img}" class="card-img" alt="${bici.modelo}">
            <div class="p-5">
                <span class="badge ${estadoClase}">${estadoTexto}</span>
                <h4 class="text-xl font-bold mt-2">${bici.modelo}</h4>
                <p class="text-sm text-gray-400 mb-4">Código: #00${bici.id}</p>
                <button 
                    class="btn-alquilar-main ${botonClase}" 
                    onclick="prepararAlquiler(${bici.id})"
                    ${!bici.disponible ? 'disabled' : ''}>
                    ${bici.disponible ? 'Alquilar Ahora' : 'No Disponible'}
                </button>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

// Esta función se activa al hacer clic en el botón de una tarjeta
function prepararAlquiler(id) {
    selectBicicleta.value = id;
    inputCliente.focus();
    
    // Scroll suave hasta el formulario
    window.scrollTo({
        top: formAlquiler.offsetTop - 80,
        behavior: 'smooth'
    });
}

// Llenar el selector del formulario solo con bicis libres
function actualizarSelectorAlquiler() {
    selectBicicleta.innerHTML = '<option value="">-- Seleccionar Bicicleta --</option>';
    bicicletas.filter(b => b.disponible).forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = `${b.modelo} (ID: ${b.id})`;
        selectBicicleta.appendChild(opt);
    });
}

// --- MANEJO DE FORMULARIOS ---

function procesarPresupuesto(e) {
    e.preventDefault();

    const biciSeleccionada = bicicletas.find(b => b.id === parseInt(selectBicicleta.value));
    
    // Creamos la instancia de la clase Alquiler
    alquilerEnCurso = new Alquiler(
        inputCliente.value,
        inputCiudad.value,
        inputTelefono.value,
        biciSeleccionada,
        parseInt(inputHoras.value)
    );

    resumenDiv.innerHTML = alquilerEnCurso.obtenerResumen();
    resumenDiv.classList.remove('hidden');
    //btnConfirmar.classList.remove('hidden');
    contenedorAcciones.classList.remove('hidden');
}

function finalizarConfirmacion() {
    if (!alquilerEnCurso) return;

    // Cambiamos estado de la bici
    alquilerEnCurso.bicicleta.disponible = false;

    // Guardar y refrescar
    actualizarTodo();
    
    // Limpiar interfaz
    formAlquiler.reset();
    resumenDiv.classList.add('hidden');
    //btnConfirmar.classList.add('hidden');
    contenedorAcciones.classList.add('hidden');
    alquilerEnCurso = null;
}

// --- SECCIÓN DE DEVOLUCIÓN ---

const selectDevolucion = document.getElementById('select-devolucion');
const inputHorasFinales = document.getElementById('horas-devolucion');
const avisoDevolucion = document.getElementById('resultado-devolucion');

function actualizarSelectorDevolucion() {
    if(!selectDevolucion) return; // Por si el form aún no se crea
    selectDevolucion.innerHTML = '<option value="">-- Seleccionar Bici a Entregar --</option>';
    bicicletas.filter(b => !b.disponible).forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = `${b.modelo} (ID: ${b.id})`;
        selectDevolucion.appendChild(opt);
    });
}

function gestionarDevolucion(e) {
    e.preventDefault();

    const id = parseInt(selectDevolucion.value);
    const horas = parseInt(inputHorasFinales.value);
    const bici = bicicletas.find(b => b.id === id);

    if (bici) {
        const cobroFinal = horas * PRECIO_HORA;
        bici.disponible = true;
        
        // Aquí es donde el dinero entra REALMENTE al historial
        historialVentas.push(cobroFinal);
        
        actualizarTodo();
        
        avisoDevolucion.innerHTML = `✅ Devolución Exitosa. Total cobrado: $${cobroFinal}`;
        avisoDevolucion.classList.remove('hidden');
        e.target.reset();
    }
}

// --- UTILIDADES ---

function actualizarTodo() {
    localStorage.setItem("bicicletas_storage", JSON.stringify(bicicletas));
    localStorage.setItem("ventas_storage", JSON.stringify(historialVentas));
    
    dibujarCatalogo();
    actualizarSelectorAlquiler();
    actualizarSelectorDevolucion();
    
    const total = historialVentas.reduce((acc, valor) => acc + valor, 0);
    displayIngresos.innerText = `$${total}`;
}

// --- EVENTOS ---

formAlquiler.addEventListener('submit', procesarPresupuesto);
btnConfirmar.addEventListener('click', finalizarConfirmacion);

// El formulario de devolución se maneja si existe en el DOM
document.addEventListener('submit', (e) => {
    if (e.target.id === 'form-devolucion') gestionarDevolucion(e);
});

// Validación de teléfono (Solo números)
inputTelefono.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

btnReset.addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});

// Cancelar alquiler
btnCancelar.addEventListener('click', () => {
    alquilerEnCurso = null;
    formAlquiler.reset();
    resumenDiv.classList.add('hidden');
    contenedorAcciones.classList.add('hidden');    
    
    mostrarNotificacion("Reserva cancelada", "bg-gray-100", "text-gray-600");
});

// Función para mostrar mensajes temporales
function mostrarNotificacion(mensaje, fondo, colorTexto) {
    msjEstado.textContent = mensaje;
    msjEstado.className = `mt-4 p-3 rounded-lg text-center font-medium ${fondo} ${colorTexto}`;
    msjEstado.classList.remove('hidden');

    setTimeout(() => {
        msjEstado.classList.add('hidden');
    }, 3000);
}
// --- INICIO DE LA APP ---
actualizarTodo();