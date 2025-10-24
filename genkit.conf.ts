import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import { dotprompt } from '@genkit-ai/dotprompt';

export default configureGenkit({
  plugins: [
    firebase(),
    googleAI({ apiKey: process.env.GOOGLE_API_KEY }),
    dotprompt({
      // Configuração do Dotprompt, se necessário
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});