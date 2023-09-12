
const db = require('../database/models/index');
const { Op } = require('sequelize');
const mercadopago = require('mercadopago');

mercadopago.configure({
    access_token: 'TEST-3468240649607797-042414-b3cc549bbd979fc20f529b3ce3db5a0c-181912221'
});

module.exports = {

    user : async (req,res) =>{

        if(req.name === undefined) return res.status(400);
        
        let user = await db.User.findOne({where: {[Op.or]:{name : req.name, mail : req.name}}});;
        res.status(200).json(user);            
    },
    
    updateUser: async (req,res) =>{

        if(req.headers.authorization!= null && req.headers.authorization !== undefined){

            if(req.name === undefined) return res.status(400);
        
            let user = await db.User.findOne({where: {[Op.or]:{name : req.name, mail : req.name}}});
                if(user){
                    let response = await db.User.update(req.body,{where:{name:user.name}});
                        if(response){
                            res.status(200).json({ok:true});
                        }else{
                            res.status(500).json({ok:false});
                        }
                    }
        }
    },

    newBusiness: async (req, res) =>{

        if(req.name === undefined) return res.status(400);
        
        let user = await db.User.findOne({where: {name : req.name}});

        if(!user) return res.status(500).json({message:"incorrect credentials",ok:false});

        if(req.body.name === undefined) return res.status(400).json({ok:false});
        
        let businesses = await db.Business.findAll({where:{userId:user.id}});

        if(!businesses) return res.status(500).json({message:"service unavailable",ok:false});

        if(businesses.length > 6 ) return res.status(503).json({message:'max-businesses-amount-reached',ok:false})

        if(businesses.length>0) businesses.forEach(business => {

            if(business.name === req.body.name) return res.status(400).json({message:"business already exists",ok:false});

        });

        let response = await db.Business.create({name: req.body.name,CUIT:0, income:0, userId: user.id,created_at:Date.now() });

        if(!response) return res.status(500);

        businesses = await db.Business.findAll({where:{userId:user.id},
                                                    include:[{model:db.Sale, as: 'Sales',
                                                            order:[['time','DESC']],include:[{model:db.Ticket,as:'Ticket'},{model:db.Product,as:'Products',through:{attributes:{include:['sold']}}}]},
                                                            {model:db.Product, as:'Products',
                                                             through:{
                                                                attributes:{
                                                                    include:['profit','sold','stock','price']
                                                                }}}]});

        res.status(200).json({message:"business created",data:businesses,ok:true});

    }, 

    preferenceId: async (req,res) =>{

        let preference = {
            // el "purpose": "wallet_purchase" solo permite pagos registrados
            // para permitir pagos de guests puede omitir esta propiedad
            "purpose": "wallet_purchase",
            "items": [
              {
                "id": "item-ID-1234",
                "title": "Mi servicio",
                "quantity": 1,
                "unit_price": 500
              }
            ]
          };

          mercadopago.preferences.create(preference).then( (response) =>{

            const preferenceId = response.body.id;
            res.status(200).json({data:preferenceId, ok:true})
          }).catch( (error) =>{
            console.log(error);
          })
    },

    processPayment: async (req,res) =>{

        if(!req.body) return res.status(400).json({message:'bad request',ok:false});

        if(req.name === undefined) return res.status(400);
        
        let user = await db.User.findOne({name:req.name});

        if(!user) return res.status(400).json({message:'bad request',ok:false});

        if(req.body.selectedPaymentMethod === 'credit_card');

        const payment_data = {
            transaction_amount: 500,
            token:req.body.formData.token,
            installments: req.body.formData.installments,
            transaction_amount:req.body.formData.transaction_amount,
            payment_method_id: req.body.formData.payment_method_id,
            payer:req.body.formData.payer
        }

        let mp_payment;
        try{

        mp_payment = await mercadopago.payment.save(payment_data);
        
        }catch(err){

            console.log(err);

        }

        if(mp_payment.body.status === 'approved') user.update({subscriptionState:Date.now()});

        return res.status(mp_payment.status).json({status:mp_payment.body.status,status_detail:mp_payment.body.status_detail,id:mp_payment.body.id});
    },

    acceptedTerms: async (req,res) =>{
        
        if(req.name === undefined) return res.status(400);
        
        let user = await db.User.findOne({where:{name:req.name}});

        if(!user) return res.status(400).json({message:'bad request',ok:false});

        user.update({firstTime:false});

        return res.status(200).json({ok:true});
    }
};