
const db = require("../database/models");


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
            console.log(req);
        }

        res.json({res: 'you are now logged in'});
    }
}
