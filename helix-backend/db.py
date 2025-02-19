import psycopg2
from dotenv import load_dotenv
import argparse
import json
import os

load_dotenv()


class Database:
    def __init__(self):
        self.connection = psycopg2.connect(
            dbname="helix",
            user=os.environ.get("DB_USER"),
            password=os.environ.get("DB_PASSWORD"),
            host="localhost",
            port="5432",
        )
        self.cursor = self.connection.cursor()

    def drop_tables(self):
        drop_users_table = "DROP TABLE IF EXISTS users CASCADE;"
        drop_sequences_table = "DROP TABLE IF EXISTS sequences CASCADE;"
        drop_conversations_table = "DROP TABLE IF EXISTS conversations CASCADE;"

        self.cursor.execute(drop_users_table)
        self.cursor.execute(drop_sequences_table)
        self.cursor.execute(drop_conversations_table)
        self.connection.commit()

    def create_tables(self):
        create_users_table = """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            user_memory JSON NOT NULL DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        create_sequences_table = """
        CREATE TABLE IF NOT EXISTS sequences (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            sequence_data JSON NOT NULL DEFAULT '[]',
            sequence_memory JSON NOT NULL DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        create_conversations_table = """
        CREATE TABLE IF NOT EXISTS conversations (
            id SERIAL PRIMARY KEY,
            sequence_id INTEGER REFERENCES sequences(id),
            conversation_data JSON NOT NULL DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        self.cursor.execute(create_users_table)
        self.cursor.execute(create_sequences_table)
        self.cursor.execute(create_conversations_table)
        self.connection.commit()

    def populate_tables(self):
        insert_user_query = """
        INSERT INTO users DEFAULT VALUES;
        """
        self.cursor.execute(insert_user_query)

        insert_sequence_query = """
        INSERT INTO sequences (user_id) VALUES (1);
        """
        self.cursor.execute(insert_sequence_query)

        insert_conversation_query = """
        INSERT INTO conversations (sequence_id) VALUES (1);
        """
        self.cursor.execute(insert_conversation_query)
        self.connection.commit()

    def get_sequence_memory(self, sequence_id: int):
        get_sequence_memory_query = """
        SELECT sequence_memory
        FROM sequences
        WHERE id = %s;
        """
        self.cursor.execute(get_sequence_memory_query, [sequence_id])
        return self.cursor.fetchone()

    def add_sequence_memory(self, sequence_id: int, sequence_memory: str):
        update_sequence_memory_query = """
        UPDATE sequences
        SET sequence_memory = jsonb_set(
            sequence_memory,
            '{memories}',
            COALESCE(sequence_memory->'memories', '[]'::jsonb) || %s::jsonb
        )
        WHERE id = %s;
        """
        self.cursor.execute(
            update_sequence_memory_query, [json.dumps(sequence_memory), sequence_id]
        )
        self.connection.commit()

    def close(self):
        self.cursor.close()
        self.connection.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run scripts on the database")
    parser.add_argument(
        "--init",
        action="store_true",
        help="Drop previous tables and initialize the database",
    )
    parser.add_argument("--delete", action="store_true", help="Delete the database")
    args = parser.parse_args()
    init = args.init
    delete = args.delete

    if init:
        db = Database()
        db.drop_tables()
        db.create_tables()
        db.populate_tables()
        db.close()
        print("Database initialized")
    elif delete:
        db = Database()
        db.drop_tables()
        db.close()
        print("Database deleted")
