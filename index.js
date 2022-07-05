const express = require("express");
const morgan = require("morgan");
const { Prohairesis } = require("prohairesis");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const mySQLstring = process.env.CLEARDB_DATABASE_URL;
const database = new Prohairesis(mySQLstring);

app
  .use(morgan("dev"))
  .use(express.static("public"))
  .use("/img", express.static("__dirname" + "public/img"))
  .use("/js", express.static("__dirname" + "public/js"))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())

  .get("/api/user", async (req, res) => {
    const users = await database.query(`
        SELECT
        *
        FROM
            contact_form
        ORDER BY
            date_added DESC
    `);

    res.contentType("html");

    res.end(`
        ${users
          .map((user) => {
            return `<p>${user.name} ${user.email} is ${user.message}</p>`;
          })
          .join("")}
    `);
  })

  .post("/api/user", async (req, res) => {
    const body = req.body;

    await database.execute(
      `
    INSERT INTO contact_form (
        name,
        email,
        subject,
        message,
        date_added
    ) VALUES (
        @name,
        @email,
        @subject,
        @message,
        NOW()
    )
`,
      {
        name: body.name,
        email: body.email,
        subject: body.subject,
        message: body.message,
      }
    );

    res.end("Added User");
  })

  .listen(port, () => console.log(`Server listening on port ${port}`));
