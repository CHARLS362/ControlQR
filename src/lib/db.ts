import mysql from 'mysql2/promise';

// Crea un pool de conexiones a la base de datos
// Esto es más eficiente que crear una conexión por cada solicitud
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Exporta el pool para que pueda ser usado en otros módulos
export default pool;
