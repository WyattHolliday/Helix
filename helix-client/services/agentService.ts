import { Message, Sequence } from "@/types/text";

export async function evaluateChat(messages: Message[], sequence: Sequence[]): Promise<any> {
  const response = await fetch('http://localhost:5000/api/evaluate_message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, sequence }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

export async function generateSequence(messages: Message[], sequence: Sequence[]): Promise<any> {
  const response = await fetch('http://localhost:5000/api/generate_sequence', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, sequence }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};