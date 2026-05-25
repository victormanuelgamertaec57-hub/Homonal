// utils/calculations.ts

export const calculateIMC = (pesoKg: number, estaturaCm: number): { value: number; category: string; label: string } => {
  const estaturaM = estaturaCm / 100;
  const imc = pesoKg / (estaturaM * estaturaM);
  
  let category = '';
  let label = '';
  
  if (imc < 18.5) {
    category = 'Bajo peso';
    label = 'Tu IMC está por debajo de lo recomendado. Necesitas un plan nutritivo.';
  } else if (imc < 25) {
    category = 'Normal';
    label = 'Tu IMC es normal, pero podemos tonificar y reducir la grasa rebelde.';
  } else if (imc < 30) {
    category = 'Sobrepeso';
    label = 'Tienes sobrepeso leve. Es el momento perfecto para actuar y equilibrar tus hormonas.';
  } else {
    category = 'Obesidad';
    label = 'Tu IMC indica obesidad. Tu perfil hormonal actual está bloqueando la pérdida de peso.';
  }

  return { value: parseFloat(imc.toFixed(1)), category, label };
};

export const determineHormonalType = (state: any): string => {
  const { evolucionPeso, nivelEnergia, antojos, edad } = state;
  
  // Lógica simple simulada
  if (evolucionPeso === 'Subo rápido y bajo muy lento' && nivelEnergia === '🔴 Baja energía todo el día, siempre cansada') {
    return 'Cortisol Dominante';
  }
  
  if (antojos.includes('🍫 Dulces y chocolates') && nivelEnergia === '🟡 Bajón fuerte después del almuerzo') {
    return 'Insulino Resistente';
  }
  
  if (edad && edad >= 45) {
    return 'En Transición Hormonal';
  }
  
  return 'Estrés Metabólico';
};

export const calculateProjection = (pesoActual: number, pesoObjetivo: number, diasAlEvento: number = 28) => {
  // Conservador: 0.5kg por semana
  const perdidaSemanal = 0.5;
  const semanasAlEvento = Math.floor(diasAlEvento / 7);
  
  let pesoEstimadoEvento = pesoActual - (semanasAlEvento * perdidaSemanal);
  if (pesoEstimadoEvento < pesoObjetivo) {
    pesoEstimadoEvento = pesoObjetivo;
  }
  
  const diferenciaPeso = pesoActual - pesoObjetivo;
  const semanasSolucion = Math.ceil(diferenciaPeso / perdidaSemanal);
  
  const fechaResultado = new Date();
  fechaResultado.setDate(fechaResultado.getDate() + (semanasSolucion * 7));

  const fechaEventoObj = new Date();
  fechaEventoObj.setDate(fechaEventoObj.getDate() + diasAlEvento);

  return {
    pesoEstimadoEvento: parseFloat(pesoEstimadoEvento.toFixed(1)),
    semanasSolucion,
    fechaResultado,
    fechaEvento: fechaEventoObj
  };
};
