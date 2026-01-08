import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';



const google = createGoogleGenerativeAI({
  apiKey:process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(){
    const aiResponse= await generateText({
        model: google('gemini-2.5-flash'),
        prompt: 'Write a chole bhature recipe for 4 people.',
        experimental_telemetry:{
          isEnabled:true,
          recordInputs:true,
          recordOutputs:true,
        },
      });
      return Response.json({aiResponse})
}