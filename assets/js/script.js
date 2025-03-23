let myChart = null; // Variable para almacenar la instancia del gráfico
const botonConvertir = document.getElementById("calcular");
const inputPesos = document.querySelector("#inputPesos");
const selectMoneda = document.querySelector("#monedaConvertir");
const resultado = document.getElementById("resultado");

// Obtener datos de la API
async function getMonedas(moneda) {
  try {
    const endpoint = `https://mindicador.cl/api/${moneda}`;
    const response = await fetch(endpoint);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getMonedas: ", error);
    alert("Hubo un error al obtener los datos. Intenta nuevamente.");
    return null;
  }
}

// Preparar la configuración para la gráfica
function prepararConfiguracionParaLaGrafica(arrayMoneda) {
  const tipoDeGrafica = "line";
  const codigoMoneda = selectMoneda.value.toUpperCase();
  const titulo = `Valor histórico de ${codigoMoneda}`;
  const colorDeLinea = "blue";

  // Obtener las primeras 10 fechas y valores
  const nombresDeLasMonedas = arrayMoneda.serie
    .map((serie) => serie.fecha.slice(0, 10))
    .slice(0, 10)
    .reverse();

  const valores = arrayMoneda.serie
    .map((serie) => serie.valor)
    .slice(0, 10)
    .reverse();

  // Configuración del gráfico
  const config = {
    type: tipoDeGrafica,
    data: {
      labels: nombresDeLasMonedas,
      datasets: [
        {
          label: titulo,
          backgroundColor: colorDeLinea,
          borderColor: colorDeLinea,
          data: valores,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  };

  return config;
}

// Renderizar la gráfica
async function renderGrafica(moneda) {
  const monedas = await getMonedas(moneda);
  const config = prepararConfiguracionParaLaGrafica(monedas);
  const chartDOM = document.getElementById("myChart");

  // Destruir el gráfico anterior si existe
  if (myChart) {
    myChart.destroy();
  }

  // Crear un nuevo gráfico
  myChart = new Chart(chartDOM, config);
}

// Convertir moneda y mostrar resultado
async function convertirMoneda(valor) {
  const codigoMoneda = selectMoneda.value;
  const arrayMoneda = await getMonedas(codigoMoneda);
  const valorConvertir = arrayMoneda.serie[0].valor;
  const resultadoConversion = valor / valorConvertir;

  resultado.textContent = `Resultado: ${resultadoConversion.toFixed(2)}`;
  renderGrafica(codigoMoneda);
}

// Evento del botón convertir
botonConvertir.addEventListener("click", () => {
  const pesosInput = parseFloat(inputPesos.value);

  if (pesosInput && pesosInput > 0) {
    convertirMoneda(pesosInput);
    inputPesos.value = ""; // Limpiar el campo de entrada
  } else {
    alert("¡Debes ingresar un valor válido mayor que 0!");
  }
});
