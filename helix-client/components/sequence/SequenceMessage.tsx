import { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/button";
import { Trash2 } from "@deemlol/next-icons"


interface SequenceMessageProps {
  content: string;
  index: number;
  OnDelete: () => void;
  OnEdit: (content: string) => void;
}

export const SequenceMessage = ({ content, index, OnDelete, OnEdit }: SequenceMessageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(content);

  const handleEdit = () => {
    setIsEditing(false);
    OnEdit(newContent);
  };


  return (
        <div className="flex p-4 transition-all hover:shadow-lg rounded-lg border border-gray-200">
            <div className="pr-16 flex-shrink-0">Step {index + 1}:</div>
            <div className="flex-grow" onClick={() => setIsEditing(true)}>
              {isEditing ? (
                <input
                  type="text"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  onBlur={handleEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEdit();
                  }}
                  className="focus:outline-none focus:ring-0 w-full"
                  autoFocus
                />
              ) : (
                <span>{content}</span>
              )}
            </div>
            <Button isIconOnly onPress={() => setTimeout(() => {OnDelete()}, 200)}> {/* Delay to show animation */}
              <Trash2 size={18} color="#7C7C7C" />
            </Button>
        </div>
      );
};

export const SequenceTitle = () => {
  return (
    <div className="flex justify-center items-center w-[120px] p-4 bg-gray-100 rounded-lg border-b border-gray-200">
      <h2 className="text-lg font-bold">Sequence</h2>
    </div>
  );
}