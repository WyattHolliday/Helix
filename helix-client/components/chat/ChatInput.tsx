import { useState } from "react";
import { Button } from "@heroui/button";

export const ChatInput = ({ onSend }: { onSend: (message: string) => void }) => {
    const [message, setMessage] = useState("");

    const handleSendMessage = () => {
        if (!message.trim()) return;
        onSend(message);
        setMessage("");
    };

    return (
        <div className="flex items-center p-4 border-t border-gray-200">
            <input
                type="text"
                className="flex-1 p-2 border border-gray-200 rounded-lg"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
                className="ml-4 bg-blue-900 text-white px-4 py-2 rounded-lg"
                onPress={handleSendMessage}
            >
                Send
            </Button>
        </div>
    );
}