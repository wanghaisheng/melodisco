import { neon } from '@neondatabase/serverless';


async function getData() {


  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("POSTGRES_URL is not defined");
  }
  const sql = neon(connectionString);
  
const response = await sql`SELECT version()`;
return response[0].version;



}