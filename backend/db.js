const { Pool } = require("pg");

// Create the PostgreSQL connection pool used by all backend queries.
const pool = new Pool({
  user: "pllskip",
  host: "localhost",
  database: "uniswap",
  password: "",
  port: 5432,
});

module.exports = pool;
