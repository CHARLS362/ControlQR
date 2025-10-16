
import mysql from 'mysql2/promise';

// Crea una conexión a la base de datos
export async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
  return connection;
}
