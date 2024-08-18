import { Client } from '@neondb/client';

let globalClient: Client;

export function getDb() {
  if (!globalClient) {
    const connectionString = process.env.POSTGRES_URL;
    console.log("connectionString", connectionString);

    globalClient = new Client({
      connectionString,
    });
  }

  return globalClient;
}
