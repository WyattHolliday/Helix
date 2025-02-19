from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv
import os
from agents.evaluator import chat_eval_agent
from agents.generator import call_gen_agent


load_dotenv()
app = Flask(__name__)
CORS(app)


@app.route("/api/evaluate_message", methods=["POST"])
def evaluate_message():
    data = request.get_json()
    messages = data.get("messages")
    sequence = data.get("sequence")

    new_message, passes_evaluation = chat_eval_agent(messages, sequence)
    response = {"reply": new_message, "passesEvaluation": passes_evaluation}
    return jsonify(response)


@app.route("/api/generate_sequence", methods=["POST"])
def generate_sequence():
    data = request.get_json()
    messages = data.get("messages")
    sequence = data.get("sequence")

    new_sequence = call_gen_agent(messages, sequence)
    return jsonify(new_sequence)


if __name__ == "__main__":
    app.run(debug=True, port=os.getenv("PORT"))
