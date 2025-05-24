import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai/index.mjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors()); 
const openai = new OpenAI(
  {
    apiKey: process.env.OPENAI_API_KEY,
  });

async function addMessage(threadId, message) {
  try {
    
  const messageResponse = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message

  })
  return messageResponse
} catch (error) {
  console.error("Error adding message:", error);
    throw error;
}
}
async function getMessage(asistente, thread) {
  console.log("Pensando");
  try {
    const run = await openai.beta.threads.runs.create(thread, {
      assistant_id: asistente
    });

    let attempts = 0; // Contador de intentos
    const maxAttempts = 60; // Número máximo de intentos

    while (attempts < maxAttempts) {
      const runInfo = await openai.beta.threads.runs.retrieve(thread, run.id);
      console.log(runInfo);
      if (runInfo.status === "completed") {
        break; // Salir del bucle si se completa
      }
      console.log("Esperando");
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (attempts === maxAttempts) {
      throw new Error("Timeout waiting for completion");
    }

    const messages = await openai.beta.threads.messages.list(thread);
    const messageContent = messages.data[0]?.content[0]?.text?.value;
    return messageContent;
  } catch (error) {
    console.error("Error retrieving message:", error);
    throw error;
  }
}

async function main() {
  //const thread = await openai.beta.threads.create()
  //const asistente = process.env.ASIS_API_KEY;
  //const thread = process.env.THREAD_API_KEY;
  //let mensaje = "Hola"
  // const message = await addMessage(thread, mensaje)
  //const mensaje = "hola"
 // let mensajesList = await openai.beta.threads.messages.list(thread)
  //console.log('main', mensajesList.data[0].content[0].text.value)
  const thread = await openai.beta.threads.create()
  console.log('main', thread)
}



app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the OpenAI API server!');
});

app.get('/openai', async (req, res) => {
  try {
    //const asistente = req.query.asistente;
   // const thread = req.query.thread;
    const message = req.query.message;

   // if (!asistente || !thread || !message) {
   if (!message) {
      return res.status(400).json({ error: 'Message required parameters' });
    }
    const asistente = process.env.ASIS_API_KEY;
    const thread = process.env.THREAD_API_KEY;
    //const thread = await openai.beta.threads.create();
    await addMessage(thread, message);
    //const result = await getMessage(asistente, thread);}
    const result = await getMessage(asistente, thread);
    //const result = await openaiFunction(req.body);
    res.json({ response: result });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});