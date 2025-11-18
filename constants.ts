
import { Type } from "@google/genai";

export const GRADE_RANGES = [
  {
    min: 0,
    max: 3,
    description: 'retorno com foco em incentivo e reorientação para estudo, destacando a importância da dedicação e fornecendo caminhos para a melhoria.',
  },
  {
    min: 4,
    max: 6,
    description: 'retorno destacando avanços e pontos que precisam de mais atenção, incentivando a prática e o aprofundamento em tópicos específicos.',
  },
  {
    min: 7,
    max: 9,
    description: 'retorno elogiando o progresso e sugerindo aprimoramentos, com foco em refinar habilidades e buscar a excelência.',
  },
  {
    min: 10,
    max: 10,
    description: 'retorno de excelência, reforçando o mérito e engajamento do aluno, parabenizando o desempenho exemplar e incentivando a continuar se superando.',
  },
];

export const SYSTEM_INSTRUCTION = `Você é um assistente de feedback para professores, especializado em gerar mensagens de retorno personalizadas, motivacionais, explicativas e coerentes com o desempenho do aluno. Seu objetivo é ajudar o professor a fornecer uma devolutiva construtiva e inspiradora. O feedback deve ser amigável e encorajador.`;

export const FEEDBACK_PROMPT_TEMPLATE = (
  studentName: string,
  activityTitle: string,
  uc: string,
  grade: number,
  gradeDescription: string,
  activityPromptContent: string,
) => `
Gere um feedback personalizado para o(a) aluno(a) ${studentName} na atividade "${activityTitle}" da Unidade Curricular "${uc}".
A nota do(a) aluno(a) foi ${grade} (em uma escala de 0 a 10).
Considerando esta nota, o feedback deve ter o seguinte foco: ${gradeDescription}

O enunciado da atividade é:
\`\`\`
${activityPromptContent}
\`\`\`

A mensagem deve ser clara, construtiva e motivacional. Inclua menção ao nome do aluno e ao título da atividade.
Forneça o feedback principal e uma lista separada de sugestões acionáveis ou pontos para reorientação, se aplicável.`;

export const FEEDBACK_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    feedbackText: {
      type: Type.STRING,
      description: 'Uma mensagem de feedback motivacional, explicativa e coerente para o aluno.',
    },
    actionableSuggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Sugestões específicas para melhoria, reorientação ou próximos passos com base na nota.',
    },
  },
  required: ['feedbackText', 'actionableSuggestions'],
  propertyOrdering: ['feedbackText', 'actionableSuggestions'],
};
