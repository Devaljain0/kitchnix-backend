// const { Client } = require("pg")

 
// const client = new Client({
//   connectionString: process.env.POSTGRE_LINK
// })

// client.connect()
//   .then(() => console.log('Connected to PostgreSQL database'))
//   .catch(err => console.error('Connection error', err.stack));
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.Deval,
});

// Function to create the users table if it doesn't exist
// const createUsersTable = async () => {
//   const query = `
//     CREATE TABLE IF NOT EXISTS users (
//       email VARCHAR(255) PRIMARY KEY,
//       username VARCHAR(255) NOT NULL,
//       password VARCHAR(255) NOT NULL,
//       phone_no VARCHAR(15) NOT NULL,
//       verified BOOLEAN DEFAULT false
//     );
//   `;

//   try {
//     const result = await pool.query(query);
//     console.log(result);
//   } catch (err) {
//     console.error("Error creating users table:", err);
//   }
// };

// Function to create inventory, recipe, and ingredients tables
const createAdditionalTables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS inventory (
      ingredient_id SERIAL,
      ingredient_name VARCHAR(50) NOT NULL,
      available_quantity INT NOT NULL,
      ingredient_cost NUMERIC(5,2) CHECK(ingredient_cost > 0) NOT NULL,
      PRIMARY KEY (ingredient_id)
    );
    CREATE TABLE  IF NOT EXISTS useraccount(
      user_email VARCHAR(100),
      user_name VARCHAR(100) NOT NULL,
      user_password VARCHAR(16) NOT NULL,
      user_phn_no BIGINT NOT NULL,
      user_address VARCHAR(200),
      user_verification_status BOOLEAN DEFAULT FALSE,
      PRIMARY KEY (user_email)
    );


    CREATE TABLE IF NOT EXISTS recipe (
      recipe_id SERIAL primary key,
      recipe_name TEXT NOT NULL,
      recipe_description TEXT NOT NULL,
      recipe_cuisine TEXT NOT NULL,
      recipe_level TEXT,
      recipe_cooktime INT NOT NULL,
      recipe_cost NUMERIC(5,2) NOT NULL,
      recipe_isveg BOOLEAN DEFAULT true,
      recipe_imgurl VARCHAR(200),
      PRIMARY KEY (recipe_id)
    );

    
    CREATE TABLE IF NOT EXISTS ingredients (
      recipe_id SERIAL,
      ingredient_id INT,
      quantity_used INT NOT NULL,
      PRIMARY KEY (recipe_id, ingredient_id),
      FOREIGN KEY (recipe_id) REFERENCES recipe (recipe_id) ON DELETE CASCADE,
      FOREIGN KEY (ingredient_id) REFERENCES inventory (ingredient_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS userorder (
      user_email VARCHAR(100),
      order_id SERIAL,
      recipe_id INTEGER, 
      ingredient_add TEXT[] DEFAULT NULL,
      ingredient_minus TEXT[] DEFAULT NULL,
      order_cost NUMERIC(7,2) NOT NULL,
      PRIMARY KEY (order_id, recipe_id),
      FOREIGN KEY (recipe_id) REFERENCES recipe (recipe_id) ON DELETE CASCADE,
      FOREIGN KEY (user_email) REFERENCES useraccount (user_email) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cart (
        user_email VARCHAR(100),
        recipe_id INTEGER,
        quantity INT NOT NULL,
        PRIMARY KEY (user_email, recipe_id),
        FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id) ON DELETE CASCADE,
        FOREIGN KEY (user_email) REFERENCES useraccount(user_email) ON DELETE CASCADE
      );

  `;

  try {
    await pool.query(query);
    console.log("Additional tables (inventory, recipe, ingredients) created or already exist.");
  } catch (err) {
    console.error("Error creating additional tables:", err);
  }
};

const getUsersData = async() => {
  const query = `
    INSERT INTO users (email, username, password, phone_no)
    VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING
    RETURNING *;;
  `;

  const values = ['gautam123@example.com', 'gautam123', 'securepassword', '1234567890'];

  try {
    const data = await pool.query(query, values);
    console.log(data.rows);
  } catch (error) {
    console.log(`Error while fetching data ${error}`);
  }
};


createAdditionalTables();
getUsersData();
module.exports = module.exports = {
  query: (text, params) => pool.query(text, params),
};;