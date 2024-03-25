const client = require("./db");

async function isReady() {
  try {
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = $1
      );
    `;

    const createTableQueries = [
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        verify_code VARCHAR(255),
        mail VARCHAR(255) NOT NULL UNIQUE,
        pass VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(255) DEFAULT 'user',
        active BOOLEAN DEFAULT true ,
        image VARCHAR(255) DEFAULT 'http://localhost:6666/images/profile.png' 
      );`,
          `
            CREATE TABLE IF NOT EXISTS category (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            image VARCHAR(255)
            );
          `,
          `
          CREATE TABLE IF NOT EXISTS owner_attachment (
           id SERIAL PRIMARY KEY,
           owner_id INT REFERENCES users (id) NOT NULL,
           attachment VARCHAR(255) 
          );
       `,
       `
       CREATE TABLE IF NOT EXISTS places (
        id SERIAL PRIMARY KEY,
        owner_id INT REFERENCES users(id) NOT NULL,
        category_id INT REFERENCES category(id) NOT NULL,
        active BOOLEAN DEFAULT false,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(500) NOT NULL,
        description VARCHAR(500) NOT NULL,
        nsign INT DEFAULT 0,
        location VARCHAR(500) NOT NULL,
        min_hours REAL,
        hour_salary REAL
        );    
      `,
      `
      CREATE TABLE IF NOT EXISTS place_attachment (
       id SERIAL PRIMARY KEY,
       place_id INT REFERENCES places (id) NOT NULL,
       attachment VARCHAR(255) 
      );
   `,
      `
      CREATE TABLE IF NOT EXISTS places_images (
        id SERIAL PRIMARY KEY,
        place_id INT REFERENCES places(id) NOT NULL,
        image VARCHAR(255) NOT NULL
        );    
      `,
          `
          CREATE TABLE IF NOT EXISTS days (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255)
            );
            INSERT INTO days (name) VALUES
            ('Sunday'),
            ('Monday'),
            ('Tuesday'),
            ('Wednesday'),
            ('Thursday'),
            ('Friday'),
            ('Saturday');

          `
      ,
      `
      CREATE TABLE IF NOT EXISTS free_day (
        id SERIAL PRIMARY KEY,
        place_id INT REFERENCES places(id) NOT NULL,
        day_id INT REFERENCES days(id) NOT NULL
        );
      `,
      `
      CREATE TABLE IF NOT EXISTS feedbacks (
        id SERIAL PRIMARY KEY,
        description VARCHAR(255),
        writer_id INT REFERENCES users(id),
        writed_id INT
       );
      `
      

    ];

    const tablesToCheck = [
      "users","category","owner_attachment","places","place_attachment","places_images","days","free_day","feedbacks"
    ];

    let c = 0;

    for (let i = 0; i < tablesToCheck.length; i++) {
      const res = await client.query(tableCheckQuery, [tablesToCheck[i]]);
      const existingTable = res.rows[0].exists;

      if (!existingTable) {
        await client.query(createTableQueries[i]);
        c++;
      }
    }

    console.log(`${c} tables created successfully!`);
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

module.exports = isReady;
