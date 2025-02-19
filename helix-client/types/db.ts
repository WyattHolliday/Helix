export type DBQueryResultRow = {
    [column: string]: any;
}

export type DBUserRow = {
    id: number | null;
    user_memory: JSON;
    created_at: string;
}

export type DBSequenceRow = {
    id: number | null;
    user_id: number;
    sequence_data: JSON;
    sequence_memory: JSON;
    created_at: string;
}

export type DBConversationRow = {
    id: number | null;
    sequence_id: number;
    conversation_data: JSON;
    created_at: string;
}