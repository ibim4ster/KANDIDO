import { GoogleGenAI, Type, Schema } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!aiClient) {
    // Try to get the key from Vite env or process.env (for AI Studio compatibility)
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please set VITE_GEMINI_API_KEY in your environment variables (e.g., in Vercel).");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

const candidateSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    personalData: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        portfolio: { type: Type.STRING },
        location: { type: Type.STRING },
      },
    },
    workExperience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          description: { type: Type.STRING },
        },
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING },
          degree: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
        },
      },
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
          url: { type: Type.STRING },
        },
      },
    },
    certifications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          issuer: { type: Type.STRING },
          date: { type: Type.STRING },
        },
      },
    },
    hardSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    softSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    languages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          language: { type: Type.STRING },
          level: { type: Type.STRING },
        },
      },
    },
    driverLicense: { type: Type.STRING, description: "Tipo de carnet de conducir si lo tiene" },
    availability: { type: Type.STRING, description: "Disponibilidad (inmediata, etc.)" },
    hobbies: { type: Type.ARRAY, items: { type: Type.STRING } },
    publications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          publisher: { type: Type.STRING },
          date: { type: Type.STRING },
          url: { type: Type.STRING },
        },
      },
    },
  },
};

export const parseCandidateCV = async (text: string) => {
  const response = await getAIClient().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Analiza el siguiente currículum y extrae TODA la información estructurada posible. No te dejes nada fuera: proyectos personales, carnets, disponibilidad, aficiones, publicaciones, etc.\n\nCV:\n${text}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: candidateSchema,
      temperature: 0.1,
    },
  });

  if (!response.text) {
    throw new Error("No se pudo generar la respuesta de la IA.");
  }

  return JSON.parse(response.text);
};

export const generateCVFeedback = async (text: string) => {
  const response = await getAIClient().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Actúa como un experto reclutador de Recursos Humanos. Analiza el siguiente currículum y proporciona sugerencias concretas y accionables para mejorar el impacto del perfil del candidato. Sé directo, profesional y estructurado.\n\nCV:\n${text}`,
    config: {
      temperature: 0.4,
    },
  });

  if (!response.text) throw new Error("No se pudo generar la respuesta de la IA.");
  return response.text;
};

export const generateInterviewQuestions = async (text: string) => {
  const response = await getAIClient().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Actúa como un experto reclutador técnico y de RRHH. Analiza el siguiente currículum y genera una lista de 5 a 7 preguntas de entrevista altamente personalizadas para este candidato. 
    NO hagas preguntas genéricas (como "háblame de ti"). 
    Basa las preguntas en:
    1. Huecos laborales o transiciones de carrera inusuales.
    2. Profundizar en las habilidades clave o tecnologías que menciona.
    3. Retos específicos de los proyectos o roles que describe.
    
    Devuelve la respuesta en formato Markdown, con las preguntas en negrita y una breve explicación de por qué se hace esa pregunta.
    
    CV:\n${text}`,
    config: {
      temperature: 0.4,
    },
  });

  if (!response.text) throw new Error("No se pudo generar la respuesta de la IA.");
  return response.text;
};

export const analyzeGaps = async (text: string) => {
  const response = await getAIClient().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Actúa como un auditor de currículums experto. Analiza el siguiente CV en busca de inconsistencias, "red flags" o huecos (Gap Analysis).
    Busca específicamente:
    1. Huecos temporales inexplicados entre trabajos o estudios (ej. meses o años sin actividad).
    2. Inconsistencias en las fechas.
    3. Afirmaciones dudosas (ej. 10 años de experiencia en una tecnología que se inventó hace 5).
    4. Saltos de carrera ilógicos o descensos de responsabilidad no explicados.
    
    Si encuentras algo, lístalo claramente. Si el CV parece coherente y sin huecos, indícalo también. Devuelve la respuesta en Markdown.
    
    CV:\n${text}`,
    config: {
      temperature: 0.2,
    },
  });

  if (!response.text) throw new Error("No se pudo generar la respuesta de la IA.");
  return response.text;
};

export const enrichProfile = async (name: string, links: string[]) => {
  const linksText = links.filter(Boolean).join(", ");
  if (!linksText) return "No hay enlaces proporcionados para buscar.";

  const response = await getAIClient().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Busca información pública en internet sobre el profesional "${name}" utilizando estos enlaces como referencia: ${linksText}.
    Resume su actividad pública, valida si los proyectos que menciona coinciden con su perfil, y proporciona un breve resumen de su presencia online (LinkedIn, GitHub, Portfolio, etc.).
    No inventes información. Si no encuentras nada relevante, dilo.`,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.2,
    },
  });

  if (!response.text) throw new Error("No se pudo generar la respuesta de la IA.");
  return response.text;
};

export const translateProfile = async (profileData: any, targetLanguage: string) => {
  const response = await getAIClient().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Traduce el siguiente objeto JSON de un perfil de candidato al idioma: ${targetLanguage}. 
    Mantén exactamente la misma estructura JSON y las mismas claves (keys), solo traduce los valores (values) que sean texto descriptivo (como roles, descripciones, nombres de títulos). 
    No traduzcas nombres propios, nombres de empresas o tecnologías.
    
    JSON a traducir:
    ${JSON.stringify(profileData)}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: candidateSchema,
      temperature: 0.1,
    },
  });

  if (!response.text) throw new Error("No se pudo generar la respuesta de la IA.");
  return JSON.parse(response.text);
};

export const searchCandidates = async (query: string, candidates: any[]) => {
  const simplifiedCandidates = candidates.map(c => ({
    id: c.id,
    name: c.personalData?.name,
    location: c.personalData?.location,
    experience: c.workExperience?.map((w: any) => `${w.role} at ${w.company}`).join(", "),
    skills: [...(c.hardSkills || []), ...(c.softSkills || [])].join(", "),
    languages: c.languages?.map((l: any) => l.language).join(", ")
  }));

  const response = await getAIClient().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Actúa como un Headhunter. Tengo una lista de candidatos y una consulta de búsqueda en lenguaje natural.
    Consulta: "${query}"
    
    Candidatos:
    ${JSON.stringify(simplifiedCandidates)}
    
    Devuelve un array JSON con los IDs de los candidatos que mejor coincidan con la consulta. Si ninguno coincide bien, devuelve un array vacío.
    Solo devuelve el array JSON, nada más.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      temperature: 0.1,
    },
  });

  if (!response.text) throw new Error("No se pudo generar la respuesta de la IA.");
  return JSON.parse(response.text);
};
