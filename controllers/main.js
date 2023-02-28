
const db = require("../database/models");
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET);
  }

module.exports = {

    all : (req, res, next) =>{
        console.log(req.headers.authorization);
        if(req.headers.authorization !== null || req.headers.authorization !== undefined || req.headers.authorization !== ''){
            let name = jwt.verify(req.headers.authorization,process.env.TOKEN_SECRET).name;
            db.User.findOne({
                where: {
                    [Op.or]:[
                        {name  : name},
                        {email : name}
                    ]
                }
            }).then(user =>{
                if(user === null){

                    return res.json({tokenVerification: 'NOK'});   
                }

                db.Business.findAll().then((b) =>{

                    return res.json({b, tokenVerification: 'OK'});
                });
            });
        }else{

            return res.json({tokenVerification: 'NOK'});  
        }
    },

    login: (req,res,next) =>{

        if(req.body !== null){
            console.log(req.body);
            db.User.findOne({
                where: {password: req.body.password,
                    [Op.or]:[
                        {name  : req.body.userName === undefined ? '' : req.body.userName},
                        {email : req.body.userName === undefined ? '' : req.body.userName}
                    ]}
            }).then((user) =>{

                if(user === null){
                    res.json({message:"incorrect credentials"});
                }else{
                    
                    res.json({token:generateAccessToken(({name  : req.body.userName})), message: `don't loose your token!`});
                }
            })
        }
    }
}
