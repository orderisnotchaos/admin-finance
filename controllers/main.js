
const db = require("../database/models");
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
  }

module.exports = {

    all : (req, res, next) =>{
        db.Business.findAll().then((res) =>{
            return res.json;
        }).then(()=>{
            res.json();
        });
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
