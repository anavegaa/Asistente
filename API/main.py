import time
import os
from openai import OpenAI
from flask import Flask, request, jsonify
from flask_cors import CORS  
from dotenv import load_dotenv

load_dotenv() 

app = Flask(__name__)

CORS(app, resources={r"/ask": {"origins": "http://localhost:3000"}})
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

client = OpenAI(api_key=OPENAI_API_KEY)
PORT = int(os.getenv('PORT', 8080)) 

ASSISTANT_ID = os.getenv('ASIST_API_KEY')

@app.route('/ask', methods=['GET'])
def ask_openai():
    
    query = request.args.get('query', 'Hola')

    # new conversation (thread) with the user's message
    thread = client.beta.threads.create(
        messages=[{
            "role": "user",
            "content": query,
        }]
    )

    # Run the thread in the assistant
    run = client.beta.threads.runs.create(thread_id=thread.id, assistant_id=ASSISTANT_ID)
    while run.status != "completed":
        run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
        print(f"Run Status: {run.status}")
        time.sleep(1)

    # Get the last message of the conversation
    message_response = client.beta.threads.messages.list(thread_id=thread.id)
    messages = message_response.data

    # Join all the messages into a single response
    full_response = "\n".join([msg.content[0].text.value for msg in messages])

    # Return the response in JSON format
    return jsonify({'response': full_response})

# Iniciar el servidor en el puerto 8080
if __name__ == '__main__':
    app.run(host='localhost', port=PORT)
