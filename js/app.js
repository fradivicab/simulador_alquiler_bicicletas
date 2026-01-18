// datos iniciales de precios y bicicletas existentes

const PRECIO_POR_HORA = 2000;

let bicicletas = [
    { id: 1, modelo: "Mountain Bike", disponible: true },
    { id: 2, modelo: "Urbana", disponible: true },
    { id: 3, modelo: "Eléctrica", disponible: true },
    { id: 4, modelo: "doble", disponible: true }
];

//menu principal

let opcion;

do {
    opcion = prompt(
    "Simulador de Alquiler de Bicicletas\n" +
    "1 - Ver disponibles\n" +
    "2 - Alquilar bicicleta\n" +
    "3 - Devolver bicicleta\n" +
    "4 - Salir"
    );

    switch (opcion) {
    case "1":
        mostrarDisponibles();
        break;
    case "2":
        alquilarBicicleta();
        break;
    case "3":
        devolverBicicleta();
        break;
    case "4":
        alert("Gracias por usar el simulador de bicicletas");
        break;
    default:
    alert("Opción inválida");
    }
} while (opcion !== "4");

//case 1
//mostrar bicibletas disponibles
function mostrarDisponibles() {
    let mensaje = "Bicicletas disponibles:\n";

    for (let bici of bicicletas) {
        if (bici.disponible) {
        mensaje += `${bici.id} - ${bici.modelo}\n`;
        }
    }

    alert(mensaje);
    console.log(mensaje);
}
//case 2
//funcion para alquilar abicibletas
function alquilarBicicleta() {
    let id = parseInt(prompt("Ingrese el ID de la bicicleta a alquilar:"));
    let bici = bicicletas.find(b => b.id === id);

    if (!bici) {
    alert("Bicicleta no encontrada");
    return;
    }

    if (!bici.disponible) {
        alert("La bicicleta no está disponible");
        return;
    }

    if (confirm(`¿Desea alquilar la bicicleta ${bici.modelo}?`)) {
        bici.disponible = false;
        alert("Bicicleta alquilada con éxito");
        console.log("Bicicleta alquilada:", bici);
    }
}
//case 3
//devolver bicicleta
function devolverBicicleta() {
    let id = parseInt(prompt("Ingrese el ID de la bicicleta a devolver:"));
    let horas = parseInt(prompt("Ingrese la cantidad de horas de uso:"));
    let bici = bicicletas.find(b => b.id === id);

    if (!bici) {
        alert("Bicicleta no encontrada");
        return;
    }

  let total = horas * PRECIO_POR_HORA;
    bici.disponible = true;

    alert(`Total a pagar: $${total}`);
    console.log(`Bicicleta devuelta. Total: $${total}`);
}





