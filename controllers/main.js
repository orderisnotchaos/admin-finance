
const db = require("../database/models");
const { Op, Model } = require("sequelize");
const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
    return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: '18000s' });
};
module.exports = {

    ill: async (req,res) =>{

        const data = {data:"data"};

        return res.status(200).render(data);
    },

    mAll: async (req,res) =>{

        
        const data = {data:"data"};

        return res.status(200).render(data);

        if(req.name === undefined) return res.status(400);
        
        let user = await db.User.findOne({where: {[Op.or]:{name : req.name, mail : req.name}}});

        if(!user) return res.status(500);

        let businesses = await db.Business.findAll({where: {userId:user.id}, include:[{model:db.Sale, as: 'Sales',limit:10,order:[['time','DESC']]},{model:db.Product, as:'Products',through:{attributes:{include:['profit','sold','stock','price']}}}]});

        if(!businesses) return res.status(500);

        res.status(200).json({businesses,ok:true});

    },
    all: async (req,res) =>{

        if(req.name === undefined) return res.status(400);
        
        let user = await db.User.findOne({where: {[Op.or]:{name : req.name, mail : req.name}}});

        if(!user) return res.status(403);

        let businesses = await db.Business.findAll({where: {userId:user.id}, include:[{model:db.Sale, as: 'Sales',},{model:db.Product, as:'Products',through:{attributes:{include:['profit','sold','stock','price']}}}]});

        if(!businesses) return res.status(500);

        res.status(200).json({businesses,ok:true});

    }, 
    
    login: async (req,res) =>{

        let userPiv = await db.User.findOne({where:{password: req.body.password,[Op.or]:
                                                [{name  : req.body.userName === undefined ? '' : req.body.userName}, {mail : req.body.userName === undefined ? '' : req.body.userName}]}});

        if(userPiv === null) return res.status(400).json({message:'credenciales incorrectas'});

        let businesses = await db.Business.findAll({where: {userId:userPiv.id},
                                                    include:[{model:db.Sale, as: 'Sales',order:[['time','DESC']],include:[{model:db.Ticket,as:'Ticket'}]}
                                                    ,{model:db.Product, as:'Products',through:{attributes:{include:['profit','sold','stock','price']}}}]});

        if(!businesses) return res.status(500);

        let user = {name:userPiv.name,
                    mail:userPiv.mail,
                    dType:userPiv.dType,
                    dNumber:userPiv.dNumber,
                    suscriptionState:30-Math.trunc((Date.now()-userPiv.suscriptionState)/86400000),
                    firstTime:userPiv.firstTime};
        return res.status(200).json({token:generateAccessToken(({name  : req.body.userName})),user,businesses, message: `don't loose your token!`});
    },

    
    newUser: async (req,res) =>{

        if(req.body !== undefined){

            let user = await db.User.findOne({where:{[Op.or]:{name:req.body.uName,mail:req.body.uMail}}});

                if(user === null || user === undefined){
                    if(isNaN(Number(req.body.uDocNumber))) return res.status(400);
                    let response = db.User.create({mail:req.body.uMail,
                                                   name:req.body.uName,
                                                   dType:req.body.uDType,
                                                   dNumber:req.body.uDocNumber,
                                                   suscriptionState: Date.now(),
                                                   password:req.body.uPassword,
                                                   created_at:Date.now(),
                                                   updated_at:0,
                                                   firstTime:true});

                    if(response){
                        return res.status(200).json({message:'usuario creado con éxito'});
                    }else{
                        return res.status(503).json({});
                    }
                }else{
                    let user = await db.User.findOne({where:{mail:req.body.uMail}});

                    if(user !== null || user !== undefined){
                        return res.status(400).json({message:'el mail ya se encuentra registrado', ok:false});
                    }

                    return res.status(400).json({message:'nombre de usuario ya se encuentra registrado', ok:false});
                }
        }
    },

}
