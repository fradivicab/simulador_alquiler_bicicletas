// 1. CONSTANTES Y DATOS INICIALES
const PRECIO_HORA = 2000;

const bicisIniciales = [
    { id: 1, modelo: "Mountain Bike", disponible: true, img: "assets/img/bici-mountain.webp" },
    { id: 2, modelo: "Urbana", disponible: true, img: "assets/img/bici-urbana.webp" },
    { id: 3, modelo: "Eléctrica", disponible: true, img: "assets/img/bici-electrica.webp" },
    { id: 4, modelo: "Doble", disponible: true, img: "assets/img/bici-doble.webp" }
];

// --- CLASE ALQUILER ---
class Alquiler {
    constructor(cliente, bicicleta, horas) {
        this.cliente = cliente;
        this.bicicleta = bicicleta;
        this.horas = horas;
        this.total = this.calcularTotal();
    }

    calcularTotal() {
        return this.horas * PRECIO_HORA;
    }

    generarResumen() {
        return `
            Cliente: ${this.cliente}<br>
            Bicicleta: ${this.bicicleta.modelo}<br>
            Horas: ${this.horas}<br>
            Total: $${this.total}
        `;
    }
}

// 2. RECUPERAR DE LOCALSTORAGE
let bicicletas = JSON.parse(localStorage.getItem("bicicletas_storage")) || bicisIniciales;
let historialVentas = JSON.parse(localStorage.getItem("ventas_storage")) || [];

// 3. ELEMENTOS DEL DOM
const contenedor = document.getElementById('contenedor-bicicletas');
const displayIngresos = document.getElementById('total-ingresos');
const btnReset = document.getElementById('btn-limpiar-storage');

const formAlquiler = document.getElementById('form-alquiler');
const selectBicicleta = document.getElementById('select-bicicleta');
const inputCliente = document.getElementById('cliente');
const inputHoras = document.getElementById('horas');
const resumenDiv = document.getElementById('resumen-alquiler');
const btnConfirmar = document.getElementById('btn-confirmar');

let alquilerActual = null;

// --- FUNCIONES ---
// Renderizar catálogo de bicicletas
function renderizarBicicletas() {
    contenedor.innerHTML = "";

    bicicletas.forEach(bici => {
        const claseBadge = bici.disponible ? 'disponible' : 'alquilada';
        const textoEstado = bici.disponible ? 'Disponible' : 'Alquilada';
        const claseBoton = bici.disponible ? 'btn-alquilar-activo' : 'btn-deshabilitado';
        const textoBoton = bici.disponible ? 'Alquilar Ahora' : 'No Disponible';

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

// Asignar click a botones de alquilar desde el catálogo
function asignarEventosBotones() {
    const botonesAlquilar = document.querySelectorAll('.btn-alquilar');
    botonesAlquilar.forEach(boton => {
        boton.addEventListener('click', e => {
            const idSeleccionado = parseInt(e.target.getAttribute('data-id'));
            selectBicicleta.value = idSeleccionado;
            inputCliente.focus();
            resumenDiv.classList.add('hidden');
            btnConfirmar.classList.add('hidden');
            window.scrollTo({
                top: formAlquiler.offsetTop - 20,
                behavior: 'smooth'
            });
        });
    });
}

function alquilarBici(id) {
    const bici = bicicletas.find(b => b.id === id);
    if (bici && bici.disponible) {
        bici.disponible = false;
        guardarEnStorage();
        renderizarBicicletas();
        cargarSelect();
        cargarSelectDevolucion();
    }
}

// Actualizar select de alquiler
function cargarSelect() {
    selectBicicleta.innerHTML = '<option value="">-- Seleccionar --</option>';

    bicicletas
        .filter(bici => bici.disponible)
        .forEach(bici => {
            const option = document.createElement('option');
            option.value = bici.id;
            option.textContent = `${bici.modelo} (ID: ${bici.id})`;
            selectBicicleta.appendChild(option);
        });
}

// Manejar formulario de alquiler
function manejarFormulario(e) {
    e.preventDefault();

    const cliente = inputCliente.value.trim();
    const horas = parseInt(inputHoras.value);
    const idSeleccionado = parseInt(selectBicicleta.value);
    const bicicleta = bicicletas.find(b => b.id === idSeleccionado);

    if (!cliente || !bicicleta || horas <= 0) return;

    alquilerActual = new Alquiler(cliente, bicicleta, horas);

    resumenDiv.innerHTML = alquilerActual.generarResumen();
    resumenDiv.classList.remove('hidden');
    btnConfirmar.classList.remove('hidden');
}

// Confirmar alquiler
function confirmarAlquiler() {
    if (!alquilerActual) return;

    alquilerActual.bicicleta.disponible = false;
    historialVentas.push(alquilerActual.total);

    guardarEnStorage();
    renderizarBicicletas();
    cargarSelect();
    cargarSelectDevolucion();
    actualizarTotalRecaudado();

    resumenDiv.classList.add('hidden');
    btnConfirmar.classList.add('hidden');
    formAlquiler.reset();
    alquilerActual = null;
}

// Actualizar total recaudado
function actualizarTotalRecaudado() {
    const total = historialVentas.reduce((acc, cur) => acc + cur, 0);
    displayIngresos.innerText = `$${total}`;
}

// Guardar datos en localStorage
function guardarEnStorage() {
    localStorage.setItem("bicicletas_storage", JSON.stringify(bicicletas));
    localStorage.setItem("ventas_storage", JSON.stringify(historialVentas));
}

// --- DEVOLUCIÓN ---
// Crear formulario de devolución dinámicamente
const formDevolucion = document.createElement('form');
formDevolucion.id = 'form-devolucion';
formDevolucion.className = 'space-y-4 mt-8 p-6 bg-white rounded-xl shadow-md max-w-2xl mx-auto';

formDevolucion.innerHTML = `
    <h3 class="text-2xl font-bold mb-4 text-center">Devolver Bicicleta</h3>

    <div>
        <label class="block text-sm font-medium text-gray-700">Seleccionar Bicicleta Alquilada</label>
        <select id="select-devolucion" class="w-full mt-1 p-3 border rounded-lg" required>
            <option value="">-- Seleccionar --</option>
        </select>
    </div>

    <div>
        <label class="block text-sm font-medium text-gray-700">Cantidad de Horas Usadas</label>
        <input type="number" id="horas-devolucion" min="1" class="w-full mt-1 p-3 border rounded-lg" required>
    </div>

    <button type="submit" class="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition">
        Procesar Devolución
    </button>

    <div id="resultado-devolucion" class="mt-4 hidden p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-center font-semibold"></div>
`;

document.querySelector('main').appendChild(formDevolucion);

const selectDevolucion = document.getElementById('select-devolucion');
const inputHorasDevolucion = document.getElementById('horas-devolucion');
const resultadoDevolucion = document.getElementById('resultado-devolucion');

function cargarSelectDevolucion() {
    selectDevolucion.innerHTML = '<option value="">-- Seleccionar --</option>';

    bicicletas
        .filter(bici => !bici.disponible)
        .forEach(bici => {
            const option = document.createElement('option');
            option.value = bici.id;
            option.textContent = `${bici.modelo} (ID: ${bici.id})`;
            selectDevolucion.appendChild(option);
        });
}

function procesarDevolucion(e) {
    e.preventDefault();

    const idBici = parseInt(selectDevolucion.value);
    const horas = parseInt(inputHorasDevolucion.value);
    const bici = bicicletas.find(b => b.id === idBici);

    if (!bici || horas <= 0) {
        resultadoDevolucion.textContent = '❌ Datos incorrectos.';
        resultadoDevolucion.classList.remove('hidden');
        return;
    }

    const total = horas * PRECIO_HORA;
    bici.disponible = true;
    historialVentas.push(total);

    guardarEnStorage();
    renderizarBicicletas();
    cargarSelect();
    cargarSelectDevolucion();
    actualizarTotalRecaudado();

    resultadoDevolucion.innerHTML = `✅ Devolución procesada. Total a cobrar: $${total}`;
    resultadoDevolucion.classList.remove('hidden');

    formDevolucion.reset();
}

// --- EVENTOS ---
formAlquiler.addEventListener('submit', manejarFormulario);
btnConfirmar.addEventListener('click', confirmarAlquiler);
formDevolucion.addEventListener('submit', procesarDevolucion);

btnReset.addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});

// --- INICIALIZACIÓN ---
renderizarBicicletas();
cargarSelect();
cargarSelectDevolucion();
actualizarTotalRecaudado();