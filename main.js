let listado = [];
let tabla = document.querySelector('#tabla');
let promNota = document.querySelector('#promNota');
let promEdad = document.querySelector('#promEdad');
let maxNota = document.querySelector('#maxNota');
let minNota = document.querySelector('#minNota');
let formulario = document.querySelector('#cargar');

document.addEventListener('DOMContentLoaded', async function() {

    document.querySelector('#nombre').addEventListener('input', function() {
        this.value = this.value.replace(/[^a-zA-Z\s'áéíóúÁÉÍÓÚüÜ]/g, '');
    });

    document.querySelector('#apellido').addEventListener('input', function() {
        this.value = this.value.replace(/[^a-zA-Z\s'áéíóúÁÉÍÓÚüÜ]/g, '');
    });
    
    const estudiantesAlmacenados = localStorage.getItem('Estudiantes');

    if(estudiantesAlmacenados) {
        listado = [].concat(...Object.values(JSON.parse(estudiantesAlmacenados)));
    } else {
        try {
            const response = await fetch('/estudiantes.json');
            if (!response.ok) {
                throw new Error('Error al cargar los datos del alumnado desde el JSON');
            }
            responselistado = await response.json();
            listado = [].concat(...Object.values(responselistado));
            localStorage.setItem('Estudiantes', JSON.stringify(listado));
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: `${error}`,
                footer: ''
              });
        }
    }

    renderizarEstudiantes(listado,0);
});

class Estudiante {
    constructor(id, nombre, apellido, edad, nota, mencion) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.nota = nota;
        this.mencion = mencion;
    }
}

formulario.addEventListener('submit', function(event) {
    event.preventDefault();
    removeAnimacionCounter();
    setTimeout(function() {
        cargaEstudiante();
        addAnimacionCounter();
    },100);
});

function cargaEstudiante(){
    let contador = listado.length;
    let id = contador + 1,
        nombre = document.querySelector('#nombre').value,
        apellido = document.querySelector('#apellido').value,
        edad = parseInt(document.querySelector('#edad').value),
        nota = parseFloat(document.querySelector('#nota').value),
        mencion = mencionTipo(nota);
        
        nombre = mayusculas(nombre);
        apellido = mayusculas(apellido);
        
        if(isNaN(nota) || nota < 1 || nota > 20 || isNaN(edad) || edad < 18){
            if(isNaN(nota) || nota < 1 || nota > 20){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Ingresá una nota válida (del 1 al 20).',
                    footer: ''
                  });
                document.querySelector('#nota').value = 0;
                document.querySelector('#nota').classList.add('red-border');
                return
            } else if(isNaN(edad) || edad < 18) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Por favor, ingresa una edad válida en el campo `edad` (no menor a 18 años).',
                    footer: ''
                  });
                document.querySelector('#edad').value = 0;
                document.querySelector('#edad').classList.add('red-border');
                return
            }
        } else {
            listado.push(new Estudiante(id,nombre,apellido,edad,nota,mencion));
            let nuevaLista = JSON.stringify(listado);
            localStorage.setItem('Estudiantes', nuevaLista);
            
            renderizarEstudiantes(listado,listado.length - 1);

            document.querySelector('#nombre').value = '';
            document.querySelector('#apellido').value = '';
            document.querySelector('#edad').value = 0;
            document.querySelector('#edad').classList.remove('red-border');
            document.querySelector('#nota').value = 0;
            document.querySelector('#nota').classList.remove('red-border');
        }
    
    Toastify({
        text: "¡Usuario agregado!",
        duration: 1500
    }).showToast();
               
}

function promedio(listado,dato) {
    if (listado.length === 0) {
        return 0;
    }

    let notas = 0;
    let edades = 0;
    let cantidad = counter();

    listado.forEach(estudiante => {
        dato === 'nota'? notas += estudiante.nota : edades += estudiante.edad;
    });            
    
    if(dato === 'nota'){
        return notas / cantidad;
    } else if (dato === 'edad'){ 
        return edades / cantidad;
    } else {
        return null;
    }
}

function notaMinMax(valor){
    if (listado.length === 0) {
        return null;
    }

    const notas = listado.map(alumno => alumno.nota);

    if (valor === 'max') {
        return Math.max(...notas);
    } else if (valor === 'min') {
        return Math.min(...notas);
    } else {
        return null;
    }
}

function mencionTipo(nota){
    switch(true) {
        case (nota >= 18):
            return 'Sobresaliente';
        case (nota >= 16):
            return 'Excelente';
        case (nota >= 14):
            return 'Correcto';
        default:
            return '--';
    }
}

function counter() {
    let elementosNoVacios = listado.filter(elemento => elemento !== undefined && elemento !== null);
    return elementosNoVacios.length;
}

function ordenarPor(dato) {
    limpiarTabla();
    listado.sort((a, b) => {
        if (a[dato] < b[dato]) return -1;
        if (a[dato] > b[dato]) return 1;
        return 0;
    });
    renderizarEstudiantes(listado, 0);
  }

function renderizarEstudiantes(estudiantes,cantidad){
    for(let i = cantidad; i < estudiantes.length; i++){
        tabla.innerHTML += `
                            <tr>
                                <td>${estudiantes[i].id}</td>
                                <td>${estudiantes[i].nombre}</td>
                                <td>${estudiantes[i].apellido}</td>
                                <td>${estudiantes[i].edad}</td>
                                <td>${estudiantes[i].nota}</td>
                                <td>${estudiantes[i].mencion}</td>
                            </tr>
                        ` ;
    }
    promNota.innerHTML = `${Math.round(promedio(listado,'nota'))}`;
    promEdad.innerHTML = `${Math.round(promedio(listado,'edad'))}`;
    maxNota.innerHTML = `${notaMinMax('max')}`;
    minNota.innerHTML = `${notaMinMax('min')}`;
}

function addAnimacionCounter() {
    promNota.classList.add('animacion');
    promEdad.classList.add('animacion');
    maxNota.classList.add('animacion');
    minNota.classList.add('animacion');
}

function removeAnimacionCounter() {
    promNota.classList.remove('animacion');
    promEdad.classList.remove('animacion');
    maxNota.classList.remove('animacion');
    minNota.classList.remove('animacion');
}

function mayusculas(value) {
    const palabras = value.split(' ');
  
    for (let i = 0; i < palabras.length; i++) {
      palabras[i] = palabras[i][0].toUpperCase() + palabras[i].slice(1).toLowerCase();
    }
  
    value = palabras.join(' ');
    return value
};

function limpiarTabla() {
    tabla.innerHTML = `<thead>
                        <td><button onclick="ordenarPor('id')">ID</button></td>
                        <td><button onclick="ordenarPor('nombre')">Nombre</button></td>
                        <td><button onclick="ordenarPor('apellido')">Apellido</button></td>
                        <td><button onclick="ordenarPor('edad')">Edad</button></td>
                        <td><button onclick="ordenarPor('nota')">Nota</button></td>
                        <td><button onclick="ordenarPor('mencion')">Mención</button></td>
                    </thead>
                    `;
}


  