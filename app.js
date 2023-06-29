const express = require('express');
const app = express();

const mainRoute = require('./routes/main');
const userRoute = require('./routes/user');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const CORSpolicy = require('./middlewares/CORSpolicy');

dotenv.config();
let PORT;

(process.env.STATUS === 'production') ? (PORT = process.env.PROD_PORT) : (PORT = process.env.DEV_PORT);

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

