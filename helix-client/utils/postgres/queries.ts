"use server";

import { Pool } from 'pg';
import { DBQueryResultRow, DBSequenceRow, DBConversationRow } from '@/types/db';
import { Sequence, Message } from '@/types/text';

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "helix",
});

const query = (text: string, params: any[]): Promise<{ rows: DBQueryResultRow[] }> => pool.query(text, params);

export const createSequence = async (userId: number, sequence_memory: JSON): Promise<DBSequenceRow> => {
    try {
        const { rows } = await query(
        `INSERT INTO sequences (user_id, sequence_memory) VALUES ($1, $2) RETURNING *`,
        [userId, sequence_memory]
        );
        return rows[0] as DBSequenceRow;
    } catch (error) {
        console.error('Error creating sequence:', error);
        throw error;
    }
};

export const upsertSequence = async (sequenceId: number, userId: number, sequence_data: Sequence[]): Promise<DBSequenceRow> => {
    try {
        const sequenceDataJson = JSON.stringify(sequence_data);
        const { rows } = await query(
        `INSERT INTO sequences (id, user_id, sequence_data) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET user_id = $2, sequence_data = $3 RETURNING *`,
        [sequenceId, userId, sequenceDataJson]
        );
        return rows[0] as DBSequenceRow;
    } catch (error) {
        console.error('Error upserting sequence:', error);
        throw error;
    }
};

export const getSequenceById = async (sequenceId: number): Promise<DBSequenceRow> => {
    try {
        const { rows } = await query(
        `SELECT * FROM sequences WHERE id = $1`,
        [sequenceId]
        );
        return rows[0] as DBSequenceRow;
    } catch (error) {
        console.error('Error fetching sequence by ID:', error);
        throw error;
    }
};

export const getSequencesByUserId = async (userId: number): Promise<DBSequenceRow[]> => {
    try {
        const { rows } = await query(
            `SELECT * FROM sequences WHERE user_id = $1`,
            [userId]
        );
        return rows as DBSequenceRow[];
    } catch (error) {
        console.error('Error fetching sequences by user ID:', error);
        throw error;
    }
};

export const createConversation = async (sequenceId: number, conversation_data: JSON): Promise<DBConversationRow> => {
    try {
        const { rows } = await query(
        `INSERT INTO conversations (sequence_id, conversation_data) VALUES ($1, $2) RETURNING *`,
        [sequenceId, conversation_data]
        );
        return rows[0] as DBConversationRow;
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }
};

export const upsertConversation = async (conversationId: number, sequenceId: number, content: Message[]): Promise<DBConversationRow> => {
    try {
        const { rows } = await query(
        `INSERT INTO conversations (id, sequence_id, content) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET sequence_id = $2, content = $3 RETURNING *`,
        [conversationId, sequenceId, content]
        );
        return rows[0] as DBConversationRow;
    } catch (error) {
        console.error('Error upserting conversation:', error);
        throw error;
    }
};

export const getConversationById = async (conversationId: number): Promise<DBConversationRow> => {
    try {
        const { rows } = await query(
        `SELECT * FROM conversations WHERE id = $1`,
        [conversationId]
        );
        return rows[0] as DBConversationRow;
    } catch (error) {
        console.error('Error fetching conversation by ID:', error);
        throw error;
    }
};

export const getConversationsBySequenceId = async (sequenceId: number): Promise<DBConversationRow[]> => {
    try {
        const { rows } = await query(
        `SELECT * FROM conversations WHERE sequence_id = $1`,
        [sequenceId]
        );
        return rows as DBConversationRow[];
    } catch (error) {
        console.error('Error fetching conversations by sequence ID:', error);
        throw error;
    }
};

export const getSequenceByConversationId = async (conversationId: number): Promise<DBSequenceRow | null> => {
    try {
        const { rows } = await query(
        `SELECT * FROM sequences WHERE id = (SELECT sequence_id FROM conversations WHERE id = $1)`,
        [conversationId]
        );
        return rows[0] as DBSequenceRow || null;
    } catch (error) {
        console.error('Error fetching sequence by conversation ID:', error);
        throw error;
    }
};