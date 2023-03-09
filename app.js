const express = require('express');
const app = express();

const mainRoute = require('./routes/main');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();
let PORT;
process.env.TOKEN_SECRET;

process.env.STATUS === 'production' ? (PORT = process.env.PROD_PORT) : (PORT = process.env.DEV_PORT);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());
app.use(session({secret: "Secreto", 
                resave: true,
                saveUninitialized: true
                }));

app.use( ( req, res, next ) => {

                    res.setHeader('Access-Control-Allow-Origin', '*');
                    
                    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
                    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                    
                    next();
                
                });

app.use('/',mainRoute);
app.listen(PORT,() => {
    console.log(`Servidor Corriendo en el puerto ${PORT}`);
});