import "./style.css";
import {
  CONFIG,
  asignarGasto,
  avanzarSemana,
  crearEstado,
  responderImprevistoMedico,
  type CategoriaGasto,
  type EstadoPartida,
  type OpcionMedica,
} from "./logica.ts";

const elementoApp = document.querySelector<HTMLDivElement>("#app");
if (!elementoApp) {
  throw new Error("No se encontró el contenedor de la aplicación.");
}
const app = elementoApp;

const etiquetasGastos: Record<CategoriaGasto, string> = {
  alimentos: "Alimentos",
  servicios: "Servicios (luz y agua)",
  transporte: "Transporte",
};
const montosGastos: Record<CategoriaGasto, number> = {
  alimentos: CONFIG.gastoMensualAlimentos,
  servicios: CONFIG.gastoMensualServicios,
  transporte: CONFIG.gastoMensualTransporte,
};

let estado: EstadoPartida = crearEstado();
let mensaje = "";
let imprevistoMedicoResuelto = false;

app.addEventListener("click", (evento: MouseEvent) => {
  const objetivo = evento.target;
  if (!(objetivo instanceof Element)) {
    return;
  }

  const boton = objetivo.closest<HTMLButtonElement>("button");
  if (!boton) {
    return;
  }

  if (boton.dataset.categoria) {
    const categoria = obtenerCategoria(boton.dataset.categoria);
    if (!categoria) {
      return;
    }
    asignarCategoria(categoria);
    dibujar();
    return;
  }

  if (boton.dataset.opcionMedica) {
    const opcion = obtenerOpcionMedica(boton.dataset.opcionMedica);
    if (!opcion) {
      return;
    }
    elegirOpcionMedica(opcion);
    dibujar();
    return;
  }

  if (boton.hasAttribute("data-avanzar")) {
    mensaje = avanzarSemana(estado)
      ? "La semana avanzó y se descontaron los gastos asignados."
      : mensajeAlNoAvanzar();
    dibujar();
    return;
  }

  if (boton.hasAttribute("data-reiniciar")) {
    estado = crearEstado();
    imprevistoMedicoResuelto = false;
    mensaje = "Comienza un nuevo mes. Asigna tus gastos básicos.";
    dibujar();
  }
});

document.addEventListener("keydown", (evento: KeyboardEvent) => {
  if (
    evento.defaultPrevented ||
    evento.repeat ||
    evento.isComposing ||
    evento.altKey ||
    evento.ctrlKey ||
    evento.metaKey
  ) {
    return;
  }

  if (evento.code === "Space") {
    evento.preventDefault();
    if (estado.resultado !== "enCurso") {
      return;
    }
    avanzar();
    dibujar();
    return;
  }

  if (estado.resultado !== "enCurso") {
    return;
  }

  if (estado.imprevistoMedicoPendiente) {
    const opciones: Record<string, OpcionMedica> = {
      "1": "consultaCompleta",
      "2": "arriesgarse",
    };
    const opcion = opciones[evento.key];
    if (opcion) {
      elegirOpcionMedica(opcion);
      dibujar();
    }
    return;
  }

  if (estado.semana === 1) {
    const categorias: Record<string, CategoriaGasto> = {
      "1": "alimentos",
      "2": "servicios",
      "3": "transporte",
    };
    const categoria = categorias[evento.key];
    if (categoria) {
      asignarCategoria(categoria);
      dibujar();
    }
  }
});

function obtenerCategoria(valor: string): CategoriaGasto | undefined {
  if (valor === "alimentos" || valor === "servicios" || valor === "transporte") {
    return valor;
  }
  return undefined;
}

function obtenerOpcionMedica(valor: string): OpcionMedica | undefined {
  if (valor === "consultaCompleta" || valor === "arriesgarse") {
    return valor;
  }
  return undefined;
}

function asignarCategoria(categoria: CategoriaGasto): void {
  mensaje = asignarGasto(estado, categoria)
    ? `${etiquetasGastos[categoria]} agregado al presupuesto.`
    : "No se pudo agregar esa categoría.";
}

function elegirOpcionMedica(opcion: OpcionMedica): void {
  const resuelta = responderImprevistoMedico(estado, opcion);
  mensaje = resuelta
    ? "Decisión médica registrada."
    : "No se pudo registrar la decisión.";
  if (resuelta) {
    imprevistoMedicoResuelto = true;
  }
}

function avanzar(): void {
  mensaje = avanzarSemana(estado)
    ? "La semana avanzó y se descontaron los gastos asignados."
    : mensajeAlNoAvanzar();
}

function mensajeAlNoAvanzar(): string {
  if (estado.imprevistoMedicoPendiente) {
    return "Resuelve primero el imprevisto médico.";
  }
  if (!Object.values(estado.gastosAsignados).every(Boolean)) {
    return "Asigna las tres categorías de gastos antes de avanzar.";
  }
  return "No se puede avanzar en el estado actual.";
}

function formatoDinero(monto: number): string {
  return `$${monto.toFixed(2)}`;
}

function dibujar(): void {
  const estadoSaldo =
    estado.saldo <= 0
      ? "saldo-rojo"
      : estado.saldo <= 100
        ? "saldo-ambar"
        : "saldo-verde";
  const semanasTranscurridas =
    estado.resultado === "ganada"
      ? CONFIG.semanasDelMes
      : estado.semana - 1;

  app.innerHTML = `
    <main class="aplicacion">
      <header class="encabezado">
        <p class="sobrelinea">Presupuesto Familiar · Mes de Pruebas</p>
        <h1>Un mes, cuatro semanas</h1>
        <p class="introduccion">
          Asigna los gastos básicos, responde al imprevisto y cuida el saldo de tu hogar.
        </p>
      </header>

      <section class="panel-resumen" aria-label="Resumen del presupuesto">
        <article class="tarjeta-saldo ${estadoSaldo}" aria-live="polite">
          <span class="etiqueta">Saldo actual</span>
          <strong>${formatoDinero(estado.saldo)}</strong>
          <span class="detalle">Monto inicial: ${formatoDinero(CONFIG.saldoInicial)}</span>
        </article>
        <article class="tarjeta-semana">
          <span class="etiqueta">Semanas transcurridas</span>
          <strong>${semanasTranscurridas} <span class="total-semanas">/ ${CONFIG.semanasDelMes}</span></strong>
          <span class="detalle">${estado.resultado === "ganada" ? "Mes completo" : `Semana actual: ${estado.semana}`}</span>
        </article>
      </section>

      <section class="panel" aria-labelledby="titulo-gastos">
        <div class="titulo-seccion">
          <div>
            <p class="paso">01 · ASIGNAR</p>
            <h2 id="titulo-gastos">Gastos básicos mensuales</h2>
          </div>
          <span class="ayuda">Se descuentan en 4 partes semanales</span>
        </div>
        <div class="lista-gastos">
          ${dibujarCategoria("alimentos")}
          ${dibujarCategoria("servicios")}
          ${dibujarCategoria("transporte")}
        </div>
        <p class="nota">Total mensual: ${formatoDinero(
          Object.values(montosGastos).reduce((total, monto) => total + monto, 0),
        )} · ${formatoDinero(
          Object.values(montosGastos).reduce((total, monto) => total + monto, 0) /
            CONFIG.semanasDelMes,
        )} por semana.</p>
      </section>

      <section class="panel panel-imprevisto" aria-labelledby="titulo-imprevisto">
        <div class="titulo-seccion">
          <div>
            <p class="paso">02 · RESPONDER</p>
            <h2 id="titulo-imprevisto">Imprevisto médico</h2>
          </div>
          <span class="insignia">${estado.imprevistoMedicoPendiente ? "Atención requerida" : "Semana 2"}</span>
        </div>
        ${
          estado.imprevistoMedicoPendiente
            ? `
              <p class="texto-imprevisto">Hay que decidir cómo afrontar un gasto médico inesperado.</p>
              <div class="opciones-medicas">
                <button class="boton boton-opcion" type="button" data-opcion-medica="consultaCompleta">
                  <span class="numero-opcion">1</span>
                  <span><strong>Pagar consulta completa</strong><small>Atención médica · −${formatoDinero(CONFIG.costoConsultaCompleta)}</small></span>
                </button>
                <button class="boton boton-opcion" type="button" data-opcion-medica="arriesgarse">
                  <span class="numero-opcion">2</span>
                  <span><strong>Arriesgarse</strong><small>Farmacia menor · −${formatoDinero(CONFIG.costoFarmaciaMenor)}</small></span>
                </button>
              </div>
              <p class="ayuda">Atajos de teclado: 1 o 2 para elegir.</p>
            `
            : `<p class="texto-imprevisto">${
                imprevistoMedicoResuelto ||
                estado.semana > CONFIG.semanaImprevistoMedico ||
                estado.resultado !== "enCurso"
                  ? "El imprevisto médico ya fue resuelto o no se activó."
                  : "El imprevisto aparecerá al comenzar la semana 2."
              }</p>`
        }
      </section>

      <div class="pie-controles">
        <p class="mensaje" role="status" aria-live="polite">${mensaje}</p>
        <button
          class="boton boton-avanzar"
          type="button"
          data-avanzar
          ${estado.resultado !== "enCurso" || estado.imprevistoMedicoPendiente || !Object.values(estado.gastosAsignados).every(Boolean) ? "disabled" : ""}
        >
          ${estado.resultado === "enCurso" ? "Avanzar semana" : "Mes finalizado"}
          <span class="atajo">${estado.semana === 1 && estado.resultado === "enCurso" ? "Teclas 1–3 para asignar · " : ""}Barra espaciadora</span>
        </button>
      </div>

      ${
        estado.resultado === "ganada" || estado.resultado === "bancarrota"
          ? `
            <section class="resultado ${estado.resultado === "ganada" ? "resultado-ganado" : "resultado-perdido"}" role="status">
              <h2>${estado.resultado === "ganada" ? "¡Mes completado!" : "Bancarrota"}</h2>
              <p>${estado.resultado === "ganada" ? "Terminaste las cuatro semanas con saldo positivo." : "El saldo llegó a cero o quedó en negativo."}</p>
              <button class="boton boton-reiniciar" type="button" data-reiniciar>Empezar de nuevo</button>
            </section>
          `
          : ""
      }
    </main>
  `;
}

function dibujarCategoria(categoria: CategoriaGasto): string {
  const asignado = estado.gastosAsignados[categoria];
  return `
    <button
      class="gasto ${asignado ? "gasto-asignado" : ""}"
      type="button"
      data-categoria="${categoria}"
      aria-pressed="${asignado}"
      ${asignado || estado.semana !== 1 || estado.resultado !== "enCurso" ? "disabled" : ""}
    >
      <span class="gasto-info">
        <strong>${etiquetasGastos[categoria]}</strong>
        <small>${formatoDinero(montosGastos[categoria])} al mes · ${formatoDinero(montosGastos[categoria] / CONFIG.semanasDelMes)} por semana</small>
      </span>
      <span class="estado-gasto">${asignado ? "Asignado" : "Agregar"}</span>
    </button>
  `;
}

dibujar();
