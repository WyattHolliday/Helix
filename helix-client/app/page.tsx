"use client";

import { useState, useEffect } from "react";
import SectionHeader from "@/components/SectionHeader";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { SequenceMessage, SequenceTitle } from "@/components/sequence/SequenceMessage";
import { evaluateChat, generateSequence } from "@/services/agentService";
import { Message, Sequence } from "@/types/text";
import { upsertSequence, getSequenceById, getConversationById } from "@/utils/postgres/queries";
import { DBConversationRow } from "@/types/db";

export default function page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sequence, setSequence] = useState<Sequence[]>([]);

  const [id, setId] = useState<number>(1);

  // Fetch sequences for the user on load
  useEffect(() => {
    const fetchSequence = async () => {
      try {
        const userSequence = await getSequenceById(id);
        console.log("Fetched sequences:", userSequence);
        let newSequence: Sequence[] = [];
        if (Array.isArray(userSequence.sequence_data) && userSequence.sequence_data.length > 0) {
          newSequence = userSequence.sequence_data.map((seq: any) => ({
            ...seq,
            content: JSON.stringify(seq.content)
          }));
        }
        setSequence(newSequence);
      } catch (error) {
        console.error("Error fetching user sequences:", error);
      }
    };

    const fetchConversation = async () => {
      try {
        const conversationRow: DBConversationRow = await getConversationById(id);
        console.log("Fetched conversation:", conversationRow.conversation_data);
        let newConversation: Message[] = [{ content: "How can I help creating a recruiting outreach plan?", role: "assistant" }]
        if (Array.isArray(conversationRow.conversation_data) && conversationRow.conversation_data.length > 0) {
          const pasredConversation: any[] = conversationRow.conversation_data.map((message: any) => ({
            ...message,
            content: JSON.stringify(message.content)
          }));
          if (pasredConversation.length > 0) {
            pasredConversation.forEach((message: any) => {
              newConversation.push({ content: message.content, role: message.role });
            });
          }
        }
        setMessages(newConversation);
      } catch (error) {
        console.error("Error fetching conversation:", error);
      }
    };

    fetchSequence();
    fetchConversation();
  }, [id]);

  const deleteSequenceItem = async (index: number) => {
    try {
      const sequenceIdToDelete = sequence[index];
      const newSequence = sequence.filter((content) => content !== sequenceIdToDelete);
      await upsertSequence(id, id, newSequence);
      setSequence(newSequence);
    } catch (error) {
      console.error("Error deleting sequence item:", error);
    }
  };

  const editSequenceItem = async (index: number, newContent: string) => {
    try {
      const newSequence = sequence.map((content, i) => i === index ? { ...content, content: newContent } : content);
      await upsertSequence(id, id, newSequence);
      setSequence(newSequence);
    } catch (error) {
      console.error("Error editing sequence item:", error);
    }
  }


  const replaceSequence = async (newSequence: Sequence[]) => {
    try {
      await upsertSequence(id, id, newSequence);
      setSequence(newSequence);
    } catch (error) {
      console.error("Error replacing sequence:", error);
    }
  }


  const manageUserInput = async (message: string) => {
    const swapLastBotMessage = (content: string) => {
      setMessages((prevMessages) => prevMessages.slice(0, -1).concat({ content, role: "assistant" }));
    };

    const llmArray: Message[] = [...messages, {content: message, role: "user"}];
    console.log("llmArray", llmArray);
    setMessages((prevMessages) => [...prevMessages, {content: message, role: "user"}, {content: "Thinking...", role: "assistant"}]);
    try {
      const response = await evaluateChat(llmArray, sequence);
      console.log("response", response);

        if (response.passesEvaluation) { // Ready to generate sequence
          if (sequence.length === 0) {
            swapLastBotMessage("Generating sequence...")
          } else {
            swapLastBotMessage("Updating sequence...")
          }
          
          const newSequence = await generateSequence(llmArray, sequence)
          console.log("fresh sequence", newSequence);

          if (sequence.length === 0) {
            swapLastBotMessage("Generated sequence")
          } else {
            swapLastBotMessage("Updated sequence")
          }
          replaceSequence(newSequence);
        } else { // Sequence idea needs further refinement
          const reply = typeof response.reply === 'object' ? JSON.stringify(response.reply) : response.reply;
          swapLastBotMessage(reply);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      swapLastBotMessage("Error, send a message to try again.");
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      <div className="flex flex-col h-screen w-[40%]">
        <SectionHeader title="Chat" />
        <div className="flex h-screen w-full flex-col border-2 border-[#E7E7E7]">
          <div className="max-h-[calc(100vh-12rem)] h-full overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} {...message} />
            ))}
          </div>
          <div className="p-4 border-t border-[#E7E7E7]">
            <ChatInput onSend={manageUserInput} />
          </div>
        </div>
      </div>

      <div className="flex flex-col h-screen w-[60%]">
        <SectionHeader title="Workspace" />
        <div className="flex-1 overflow-y-auto p-4 space-y-4 border-2 border-[#E7E7E7]">
          <SequenceTitle />
            {sequence.map((content, index) => (
              <SequenceMessage
                key={index}
                content={content.content}
                index={index}
                OnDelete={() => deleteSequenceItem(index)}
                OnEdit={(newContent: string) => editSequenceItem(index, newContent)}
              />
            ))}
          </div>
      </div>
  </div>
  );
}
