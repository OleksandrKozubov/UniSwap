const { Pool } = require("pg");

const pool = new Pool({
  user: "pllskip",
  host: "localhost",
  database: "uniswap",
  password: "",
  port: 5432,
});

module.exports = pool;