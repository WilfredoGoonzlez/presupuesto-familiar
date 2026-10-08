export const CONFIG = {
  saldoInicial: 500, // dólares
  gastoMensualAlimentos: 150, // dólares por mes
  gastoMensualServicios: 80, // dólares por mes
  gastoMensualTransporte: 70, // dólares por mes
  semanasDelMes: 4, // semanas
  semanaImprevistoMedico: 2, // semana del mes
  costoConsultaCompleta: 100, // dólares
  costoFarmaciaMenor: 20, // dólares
} as const;

export type CategoriaGasto = "alimentos" | "servicios" | "transporte";
export type OpcionMedica = "consultaCompleta" | "arriesgarse";
export type ResultadoPartida = "enCurso" | "ganada" | "bancarrota";

export interface EstadoPartida {
  saldo: number;
  semana: number;
  gastosAsignados: Record<CategoriaGasto, boolean>;
  imprevistoMedicoPendiente: boolean;
  resultado: ResultadoPartida;
}

const GASTOS_MENSUALES: Record<CategoriaGasto, number> = {
  alimentos: CONFIG.gastoMensualAlimentos,
  servicios: CONFIG.gastoMensualServicios,
  transporte: CONFIG.gastoMensualTransporte,
};

export function crearEstado(): EstadoPartida {
  return {
    saldo: CONFIG.saldoInicial,
    semana: 1,
    gastosAsignados: {
      alimentos: false,
      servicios: false,
      transporte: false,
    },
    imprevistoMedicoPendiente: false,
    resultado: "enCurso",
  };
}

export function asignarGasto(
  estado: EstadoPartida,
  categoria: CategoriaGasto,
): boolean {
  if (
    estado.resultado !== "enCurso" ||
    estado.semana !== 1 ||
    !(categoria in GASTOS_MENSUALES) ||
    estado.gastosAsignados[categoria]
  ) {
    return false;
  }

  estado.gastosAsignados[categoria] = true;
  return true;
}

export function responderImprevistoMedico(
  estado: EstadoPartida,
  opcion: OpcionMedica,
): boolean {
  if (
    estado.resultado !== "enCurso" ||
    !estado.imprevistoMedicoPendiente
  ) {
    return false;
  }

  let costo: number;
  switch (opcion) {
    case "consultaCompleta":
      costo = CONFIG.costoConsultaCompleta;
      break;
    case "arriesgarse":
      costo = CONFIG.costoFarmaciaMenor;
      break;
    default:
      return false;
  }

  estado.saldo -= costo;
  estado.imprevistoMedicoPendiente = false;
  if (estado.saldo <= 0) {
    estado.resultado = "bancarrota";
  }
  return true;
}

export function avanzarSemana(estado: EstadoPartida): boolean {
  if (
    estado.resultado !== "enCurso" ||
    estado.imprevistoMedicoPendiente ||
    !Object.values(estado.gastosAsignados).every(Boolean)
  ) {
    return false;
  }

  const gastoSemanal =
    Object.values(GASTOS_MENSUALES).reduce((total, gasto) => total + gasto, 0) /
    CONFIG.semanasDelMes;
  estado.saldo -= gastoSemanal;

  if (estado.saldo <= 0) {
    estado.resultado = "bancarrota";
    return true;
  }

  if (estado.semana === CONFIG.semanasDelMes) {
    estado.resultado = "ganada";
    return true;
  }

  estado.semana += 1;
  if (estado.semana === CONFIG.semanaImprevistoMedico) {
    estado.imprevistoMedicoPendiente = true;
  }
  return true;
}
