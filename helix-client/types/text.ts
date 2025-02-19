export type Message = {
  content: string;
  role: "user" | "assistant";
}

export type Sequence = {
  content: string;
  // index: number;
}