
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

                    res.status(500).json({ok: false});   
                }
                db.Business.findAll({where: {userId: user.dataValues.id},include:[{model:db.Sale, as: 'Sales'},{model:db.Product, as:'Products'}]}).then((data) =>{
                        if(data){
                            res.status(200).json({data,ok:true});  
                        }else{
                            res.status(500).json({statusText:'service unavaliable'});
                        }
                    });
            });
        }else{
            
            return res.status(400);  
        }
    },

    login: (req,res,next) =>{

        if(req.body !== null){
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
    },
    newBusiness: (req, res, next) =>{

        let name = jwt.verify(req.headers.authorization,process.env.TOKEN_SECRET).name;
        db.User.findOne({
            where: {name : name}}).then((user) =>{
                if(user === null){
                    res.status(500).json({message:"incorrect credentials"});
                }else{
                    db.Business.findAll({where:{userId:user.id}}).then((businesses) =>{
                        if(businesses.length>7){
                            res.status(503).json({message:'max-businesses-size-reached'})
                        }else{
                            db.Business.create({name: req.body.name, income:0, userId: user.id,created_at:Date() }).then(
                                (response) =>{
                                    if(response){
                                        db.Business.findAll({where:{userId:user.id},include:[{model:db.Sale, as: 'Sales'}]}).then(businesses =>{
                                            res.json({message:"business created",data:businesses,ok:true});
                                        })
                                    }else{
                                        res.status(500);
                                    }
                                }
                            )
                        }
                    })

                }
            });
        
    },

    newSale : (req,res,next) =>{
        let name = jwt.verify(req.headers.authorization,process.env.TOKEN_SECRET).name;

        db.User.findOne({where: {name:name}}).then((user)=> {
            if(user){
                db.Product.findOne({where:{name:req.body.soldItemValues.name}}).then(product =>{
                    if(product){
                        db.Sale.create({value:req.body.soldItemValues.value,
                            name:req.body.soldItemValues.name,
                            quantity: req.body.soldItemValues.quantity,
                            time: req.body.soldItemValues.time,
                            businessId: req.body.bId}).then(sale =>{
                                if(sale){
                                    db.Business.findAll({where: {userId: user.dataValues.id},include:[{model:db.Sale, as: 'Sales'},{model:db.Product, as:'Products'}]}).then((data) =>{
                                        if(data){
                                            res.status(200).json({data,ok:true});  
                                        }else{
                                            res.status(500).json({statusText:'service unavaliable'});
                                        }
                                    });
                                }else{
                                    res.statues(500).json({statusText:'service unavailable'});
                                }
                            })
                    }else{
                        db.Product.create({name:req.body.soldItemValues.name,created_at:Date.now(),updated_at:0}).then((created)=>{
                            if(created){
                                db.Business_Product.create({businessid:req.body.bId,
                                                            productid:created.id,
                                                            stock:0,
                                                            price:req.body.soldItemValues.value,
                                                            created_at:Date.now(),
                                                            updated_at:0})
                                                    .then(created =>{
                                                        if(created){
                                                            db.Sale.create({value:req.body.soldItemValues.value,
                                                                name:req.body.soldItemValues.name,
                                                                quantity: req.body.soldItemValues.quantity,
                                                                time: req.body.soldItemValues.time,
                                                                businessId: req.body.bId},)
                                                                .then((response)=>{
                                                                    if(response){
                                                                        db.Business.findAll({where:{userId:user.id},include:[{model:db.Sale, as: 'Sales'},{model:db.Product, as:'Products'}]}).then(businesses =>{
                                                                            res.status(200).json({data:businesses,ok:true});
                                                                        })
                                                                    }else{
                                                                        res.status(500).json({ok:false,statusText:'service unavailable'});
                                                                    }
                                                                });
                                                        }else{
                                                            res.status(500).json({statusText:'service unavailable'});
                                                        }
                                                    })
                            }else{
                                res.status(500).json({statusText:'service unavailable'});
                            }
                        })
                    }
                })
            }else{
                res.status(404).json({message:'invalid user',ok:false});
            }});

    },
    newUser: (req,res,next) =>{
        if(req.body !== undefined){
            let name = jwt.verify(req.headers.authorization,process.env.TOKEN_SECRET).name;
            db.User.findOne({where:{name:name}}).then(user =>{
                console.log(user);
                if(user === null || user === undefined){
                    db.User.create({email:req.body.uMail,
                                    name:req.body.uName,
                                    dType:req.body.uDType,
                                    dNumber:req.body.uDocNumber,
                                    password:req.body.uPassword,
                                    created_at:Date.now(),
                                    updated_at:0})
                            .then(response =>{
                                if(response){
                                    res.status(200).json({});
                                }else{
                                    res.status(503).json({});
                                }
                            })
                }else{
                    res.status(400).json({});
                }
            });

        }
    },

    user : (req,res,next) =>{
        if(req.headers.authorization!= null && req.headers.authorization !== undefined){
            let name = jwt.verify(req.headers.authorization,process.env.TOKEN_SECRET).name;

            db.User.findOne({where:{name:name}}).then(user =>{
                res.status(200).json(user);
            })
        }
    }
}
