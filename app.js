const express = require('express');
const app = express();

const mainRoute = require('./routes/main');
const userRoute = require('./routes/user');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const CORSpolicy = require('./middlewares/CORSpolicy');
const mysql = require('mysql2');
dotenv.config();
let PORT;

(process.env.STATUS === 'production') ? (PORT = process.env.PROD_PORT) : (PORT = process.env.DEV_PORT);

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
  });

  connection.query(
    `CREATE DATABASE IF NOT EXISTS admin_finance`,
    function (err, results) {
      console.log(results);
      console.log(err);
    }
  );
  
  connection.end();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true})); 
app.use(bodyParser.json());
app.use(session({secret: "Secreto", 
                resave: true,
                saveUninitialized: true
                }));
app.use(CORSpolicy);

app.use( '/',mainRoute );
app.use('/user',userRoute);

app.listen(PORT,() => {
    console.log(`Servidor Corriendo en el puerto ${PORT}`);
});

