import { createContext, useContext, useState, type ReactNode } from 'react';

export interface QuizState {
  // Perfil
  ageGroup: string;           
  objetivo: string;
  cuerpoActual: string;       
  cuerpoSoñado: string;
  evolucionPeso: string;
  ultimaVezBien: string;
  
  // Alimentación
  comidasDia: string;
  tipoAlmuerzo: string;
  tiempoCocina: string;
  habitosAlimenticios: string;
  suplementos: string;
  habitosMalos: string[];
  antojos: string[];
  escalaRecaida: number;
  escalaDesliz: number;
  escalaMotivacion: number;
  
  // Actividad
  frecuenciaEjercicio: string;
  zonasCuerpo: string[];
  limitacionesFisicas: string[];
  nivelCardio: string;
  frecuenciaCaminata: string;
  
  // Estilo de vida
  horarios: string;
  diaTipico: string;
  nivelEnergia: string;
  horasSueño: string;
  consumoAgua: string;
  
  // Casi listo
  eventosAumento: string[];
  razonPrincipal: string;
  estatura: number | null;
  pesoActual: number | null;
  pesoObjetivo: number | null;
  edad: number | null;
  
  // Evento
  eventoProximo: string[];
  fechaEvento: Date | null;
  
  // Contacto
  email: string;
  nombre: string;
  
  // Calculados
  imc: number | null;
  tipoHormonal: string;
  pesoEstimadoEvento: number | null;
  semanasSolucion: number | null;
}

const initialState: QuizState = {
  ageGroup: '',           
  objetivo: '',
  cuerpoActual: '',       
  cuerpoSoñado: '',
  evolucionPeso: '',
  ultimaVezBien: '',
  comidasDia: '',
  tipoAlmuerzo: '',
  tiempoCocina: '',
  habitosAlimenticios: '',
  suplementos: '',
  habitosMalos: [],
  antojos: [],
  escalaRecaida: 0,
  escalaDesliz: 0,
  escalaMotivacion: 0,
  frecuenciaEjercicio: '',
  zonasCuerpo: [],
  limitacionesFisicas: [],
  nivelCardio: '',
  frecuenciaCaminata: '',
  horarios: '',
  diaTipico: '',
  nivelEnergia: '',
  horasSueño: '',
  consumoAgua: '',
  eventosAumento: [],
  razonPrincipal: '',
  estatura: null,
  pesoActual: null,
  pesoObjetivo: null,
  edad: null,
  eventoProximo: [],
  fechaEvento: null,
  email: '',
  nombre: '',
  imc: null,
  tipoHormonal: '',
  pesoEstimadoEvento: null,
  semanasSolucion: null
};

interface QuizContextProps {
  state: QuizState;
  updateState: (updates: Partial<QuizState>) => void;
  currentStep: number;
  setStep: (step: number | ((prev: number) => number)) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const QuizContext = createContext<QuizContextProps | undefined>(undefined);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<QuizState>(initialState);
  const [currentStep, setCurrentStep] = useState(0);

  const updateState = (updates: Partial<QuizState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(0, prev - 1));

  return (
    <QuizContext.Provider value={{ state, updateState, currentStep, setStep: setCurrentStep, nextStep, prevStep }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
