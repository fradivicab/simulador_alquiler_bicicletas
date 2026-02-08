// 1. Datos iniciales
const PRECIO_POR_HORA = 2000;

let bicicletas = [
    { id: 1, modelo: "Mountain Bike", disponible: true, img: "assets/img/bici-mountain.webp" },
    { id: 2, modelo: "Urbana", disponible: true, img: "assets/img/bici-urbana.webp" },
    { id: 3, modelo: "Eléctrica", disponible: true, img: "assets/img/bici-electrica.webp" },
    { id: 4, modelo: "Doble", disponible: true, img: "assets/img/bici-doble.webp" }
];

// 2. Función para renderizar las bicicletas en el HTML
function mostrarDisponibles() {
    const contenedor = document.getElementById('contenedor-bicicletas');
    contenedor.innerHTML = ""; // Limpiamos el contenedor

    bicicletas.forEach(bici => {
        // Creamos el HTML para cada tarjeta
        const card = document.createElement('div');
        card.className = "bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition hover:scale-105";
        
        card.innerHTML = `
            <img src="${bici.img}" alt="${bici.modelo}" class="w-full h-48 object-cover">
            <div class="p-5">
                <span class="text-xs font-semibold uppercase px-2 py-1 ${bici.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-full">
                    ${bici.disponible ? 'Disponible' : 'Alquilada'}
                </span>
                <h4 class="text-xl font-bold mt-2">${bici.modelo}</h4>
                <p class="text-sm text-gray-500 mb-4">ID: #${bici.id}</p>
                <button 
                    onclick="alquilarBicicleta(${bici.id})" 
                    ${!bici.disponible ? 'disabled' : ''}
                    class="w-full ${bici.disponible ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'} text-white py-2 rounded-lg transition font-semibold">
                    ${bici.disponible ? 'Alquilar Ahora' : 'No Disponible'}
                </button>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

// 3. Función para alquilar
function alquilarBicicleta(id) {
    let bici = bicicletas.find(b => b.id === id);

    if (bici && bici.disponible) {
        bici.disponible = false;
        alert(`¡Genial! Has alquilado la ${bici.modelo}.`);
        mostrarDisponibles(); // Refrescamos la interfaz
    }
}

// 4. Función para devolver y calcular pago
function devolverBicicleta() {
    const idInput = document.getElementById('id-devolucion').value;
    const horasInput = document.getElementById('horas-uso').value;
    const resultadoDiv = document.getElementById('resultado-pago');

    const id = parseInt(idInput);
    const horas = parseInt(horasInput);

    let bici = bicicletas.find(b => b.id === id);

    if (!bici) {
        alert("Bicicleta no encontrada. Revisa el ID.");
        return;
    }

    if (bici.disponible) {
        alert("Esta bicicleta ya está en el taller (disponible).");
        return;
    }

    if (horas > 0) {
        let total = horas * PRECIO_POR_HORA;
        bici.disponible = true;

        // Mostramos el resultado en el cuadro verde del HTML
        resultadoDiv.classList.remove('hidden');
        resultadoDiv.innerHTML = `Gracias por devolver la ${bici.modelo}. <br> Total a pagar: **$${total}**`;
        
        mostrarDisponibles(); // Refrescamos la interfaz
    } else {
        alert("Por favor, ingresa una cantidad de horas válida.");
    }
}

// 5. Ejecución inicial al cargar la página
document.addEventListener('DOMContentLoaded', mostrarDisponibles);