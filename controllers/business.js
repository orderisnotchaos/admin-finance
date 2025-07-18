
const { Op } = require('sequelize');
const db = require('../database/models/index');
const Afip = require('@afipsdk/afip.js');
const fs = require('fs');

const afip = new Afip({CUIT:20398050631});

module.exports = {
    newSale : async (req,res) =>{

        if(!req.body) return res.status(403).json({message:'invalid request',ok:false});
        
        let user = await db.User.findOne({where:{[Op.or]:{name:req.name,mail:req.name}}});

        if(!user) return res.status(404).json({message:'user not found',ok:false});

        let business = await db.Business.findOne({where:{[Op.and]:{name:req.body.bName,userId:user.id}}});

        if(!business) return res.stauts(404).json({message:'business not found',ok:false});

        let errors = [];
        let products = await req.body.saleItems.map(async (saleItem) => {
            let product = await db.Product.findOne({where:{name:saleItem.name}});
            if(product){

                let bp = await db.Business_Product.findOne({where:{businessid:business.id,productid:product.id}});

                if(!bp) return {code:-1,name:saleItem.name};

                if (Number(bp.stock) - saleItem.quantity < 0) return errors.push({code:-3,name:saleItem.name});

                let business_product = await db.Business_Product.update({price:Number(saleItem.price),sold:Number(bp.sold)+Number(saleItem.quantity),
                    stock:Number(bp.stock)-Number(saleItem.quantity),
                    profit:Number(bp.profit)+Number(saleItem.price)*Number(saleItem.quantity)},
                    {where:{businessid:business.id,productid:product.id}});

                if(!business_product) return errors.push({code:-1,name:saleItem.name});

                return product;
            
            }else{
                return errors.push({code:-2,name:saleItem.name});
            }
        });

        products = await Promise.all(products);

        for(let i=0; i<errors.length;i++){
         
            if(errors[i].code === -1) return res.status(500).json({message:'service unavailable', ok:false});

            if(errors[i].code === -2) return res.status(400).json({message:"product not found",name:errors[i].name,ok:false});

            if(errors[i].code === -3) return res.status(400).json({message:'insufficient stock',name:errors[i].name,ok:false});   
        }

        if(!products) return res.status(500).json({message:'service unavailable'});

        let saleValue = 0;

        req.body.saleItems.forEach(saleItem => {saleValue+=Number(saleItem.price)*Number(saleItem.quantity)})

        let salePiv = await db.Sale.findOne({where:{time:req.body.time,businessId:business.id}});

        let salePiv2 = await db.Sale.findOne({where:{ticketName:`ticket`+req.body.time,businessId:business.id}})
        
        if(salePiv !== null || salePiv2 !== null) return res.status(400).json({message:'sale already exists',ok:false});

        let sale =  await db.Sale.create({value:saleValue,
            ticketName:`venta`+req.body.time,
            ticketType:req.body.ticketType,
            time: req.body.time,
            businessId: business.id});

        if(!sale) return res.status(500).json({message:'service unavailable',ok:false});

        let sale_products = await products.map(async (product,i) =>{
            
            let sale_product;

            const now = new Date();
            
            const time = `${now.getFullYear()}-${now.getMonth() + 1 <10 ? `0${now.getMonth() + 1 }`: now.getMonth() + 1 }-${now.getDate()} ${now.getHours() < 10 ? `0${now.getHours()}`: now.getHours()}:${now.getMinutes() < 10 ? `0${now.getMinutes()}`:now.getMinutes()}:${now.getSeconds() < 10 ? `0${now.getSeconds()}`: now.getSeconds()}-${Math.floor(Math.random() * 1000)}`;

            try{
                sale_product = await db.Sale_Product.create({saleTime:time,saleBusiness:business.id,productid:product.id,saleId:sale.saleId,sold:Number(req.body.saleItems[i].quantity)})
            }catch(err){
                console.log(err);
                if(err.name === 'SequelizeUniqueConstraintError'){
                    return res.status(403).json({});
                }
            }

            if(!sale_product) return res.status(500).json({message:'service unavailable',ok:false});

            return sale_product;

        });

        sale_products = await Promise.all(sale_products);

        if(sale_products.find(sale_product => { return (sale_product.statusCode === 500 || sale_product.statusCode === 403)}) !== undefined) return;

 
        if(!sale_products) return res.status(500).json({message:'service unavailable',ok:false});

        business.income += saleValue;

        await business.save();

        let businesses = await db.Business.findAll({where:{userId:user.id},
            include:[{model:db.Sale, as: 'Sales',order:[['time','DESC']],include:[{model:db.Ticket,as:'Ticket'}],include:[{model:db.Product, as:'Products',through:{attributes:{include:['sold']}}}]},
                        {model:db.Product, as:'Products',through:{attributes:{include:['profit','sold','stock','price','color']}}}]});

        if(!businesses) return res.status(500).json({ok:false});

        return  res.status(200).json({data:businesses,ok:true});

    },

    newProduct: async(req,res) =>{

        function generateHexadecimal() {
            // Generate a random 6-digit hexadecimal integer
            const hexNumber = Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0');
            return hexNumber;
        }
        if(req.name === undefined) return res.status(400);
        
        const user = await db.User.findOne({where: {[Op.or]:{name : req.name, mail : req.name}}});

        if(!user) return res.status(404).json({ok:false});

        const product = await db.Product.findOne({where:{name:req.body.name}});

        if(product){

            const business = await db.Business.findOne({where:{id:req.body.bId}});

            if(!business) return res.status(500);

            const business_product = await db.Business_Product.findOne({where:{businessid:business.id,productid:product.id}});

            if(business_product) return res.status(400);

            const bp = await db.Business_Product.create({
                businessid:business.id,
                productid: product.id,
                stock: req.body.stock,
                sold: 0,
                profit:0,
                price:req.body.price,
                color: `${generateHexadecimal()}`
             });

            if(!bp) return res.status(500);

            let businesses = await db.Business.findAll({where:{userId:user.id},
                include:[{model:db.Sale, as: 'Sales',order:[['time','DESC']],include:[{model:db.Ticket,as:'Ticket'}],include:[{model:db.Product, as:'Products',through:{attributes:{include:['sold']}}}]},
                            {model:db.Product, as:'Products',through:{attributes:{include:['profit','sold','stock','price','color']}}}]});

            return res.status(200).json({businesses, ok:true});
            
        }

        const newProduct = await db.Product.create({name:req.body.name}); 

        if(!newProduct){

            return res.status(500).json({message:"couldn't create new product",ok:false});
        }

        let newBusiness_Product = await db.Business_Product.create({businessid:req.body.bId,
            productid:newProduct.id,
            stock:Number(req.body.stock),
            sold: 0,
            profit:0,
            price:Number(req.body.price),
            color: `${generateHexadecimal()}`,
            created_at:Date.now(),
            updated_at:0});

        if(!newBusiness_Product){

            return res.status(500).json({message:"couldn't create new product",ok:false});
        }

        let businesses = await db.Business.findAll({where:{userId:user.id},
            include:[{model:db.Sale, as: 'Sales', order:[['time','DESC']], include:[{model:db.Ticket,as:'Ticket'}]},
                        {model:db.Product, as:'Products',through:{attributes:{include:['profit','sold','stock','price','color']}}}]});
        if(!businesses){
            return res.status(500).json({mesage:'product was created but there was an error with the database',ok:false});
        }
        
        return res.status(200).json({data:businesses,ok:true});

    },

    editProduct: async (req,res) =>{

        if(req.name === undefined) return res.status(400);

        let user = await db.User.findOne({where: {[Op.or]:{name : req.name, mail : req.name}}});

        if(!user) return res.status(404).json({ok:false});

        if(!req.body.name) return res.status(400);
        
        let product = await db.Product.findOne({where:{name:req.body.name}});

        let business_product = await db.Business_Product.findOne({where:{businessid:req.body.bId,productid:product.id}});
        product.name = req.body.name;

        business_product.price = req.body.price;

        business_product.stock = req.body.stock;

        await product.save();

        await business_product.save();

        let businesses = await db.Business.findAll({where:{userId:user.id},
            include:[{model:db.Sale, as: 'Sales', order:[['time','DESC']], include:[{model:db.Ticket,as:'Ticket'}]},
                        {model:db.Product, as:'Products',through:{attributes:{include:['profit','sold','stock','price','color']}}}]});

        res.status(200).json({businesses,ok:true});
    },

    deleteProduct : async (req, res) =>{

        if(!req.name || !req.body.bName || !req.body.productName) return res.status(400);

        const user = await db.User.findOne({where:{name:req.name}});

        if(!user) return res.status(500);

        const product = await db.Product.findOne({where:{name:req.body.productName}});

        if(!product) return res.status(500);

        const business = await db.Business.findOne({where:{name:req.body.bName,userId:user.id}});

        if(!business) return res.status(500);

        const business_product = await db.Business_Product.findOne({where:{businessid:business.id, productid:product.id}})

        if(!business_product) return res.status(500);

        await business_product.destroy();

        const businesses = await db.Business.findAll({where:{userId:user.id},
            include:[{model:db.Sale, as: 'Sales', order:[['time','DESC']], include:[{model:db.Ticket,as:'Ticket'}]},
                        {model:db.Product, as:'Products',through:{attributes:{include:['profit','sold','stock','price','color']}}}]});

        return res.status(200).json({businesses,ok:true});

    },

    data: async (req,res) =>{

        let result;

        try{
            result = await afip.RegisterScopeFour.getTaxpayerDetails(30610252334);
        }catch(err){
            console.log(err);
        }

        if(!result) return res.status(500).json({message:'service unavailable',ok:false});

        return res.status(200).json({data:result,ok:true});

    },
    deleteSale: async(req,res) =>{

        if(!req.name) return res.status(400);

        const user = await db.User.findOne({where:{name:req.name}});

        const sale = await db.Sale.findOne({where:{ticketName:req.body.ticketName}});

        const business = await db.Business.findOne({where:{id:req.body.bId}});

        const time = `${sale.time.getFullYear()}-${sale.time.getMonth() + 1 <10 ? `0${sale.time.getMonth() + 1 }`: sale.time.getMonth() + 1 }-${sale.time.getDate()} ${sale.time.getHours() < 10 ? `0${sale.time.getHours()}`: sale.time.getHours()}:${sale.time.getMinutes() < 10 ? `0${sale.time.getMinutes()}`:sale.time.getMinutes()}:${sale.time.getSeconds() < 10 ? `0${sale.time.getSeconds()}`: sale.time.getSeconds()}-${Math.floor(Math.random() * 1000)}`;

        const sale_product = await db.Sale_Product.findOne({where:{saleTime:time,saleBusiness:business.id}})

        const business_product = await db.Business_Product.findOne({where:{productid:sale_product.productid,businessid:business.id}});

        business_product.stock += sale_product.sold;

        business.income -=sale_product.sold*business_product.price;

        await business_product.save();

        await business.save();

        const businesses = await db.Business.findAll({where:{userId:user.id},
            include:[{model:db.Sale, as: 'Sales', order:[['time','DESC']], include:[{model:db.Ticket,as:'Ticket'}]},
                        {model:db.Product, as:'Products',through:{attributes:{include:['profit','sold','stock','price','color']}}}]});

        return res.status(200).json({businesses,ok:true});
    },

    salesHistory: async (req,res) =>{

        if(req.name === undefined) return res.status(400);
        
        let user = await db.User.findOne({where: {[Op.or]:{name : req.name, mail : req.name}}});

        if(!user) return res.status(403).json({ ok:false});

        if(!req.body) return res.status(403).json({ok:false});

        let business = await db.Business.findOne({where:{name:req.body.bName}});

        let sales = await db.Sale.findAll({where:{businessId:business.id},include:[{model:db.Ticket,as:'Ticket'}]});

        //let vouchers = await sales.map(async(sale) =>{return getVoucherInfo(sale.saleId,business.id,11)});

        //vouchers = await Promise.all(vouchers);

        //console.log(vouchers);

        return res.status(200).json({data:sales,ok:true});
    },

    generateTicket: async (req, res) =>{
        /*
        let user = await db.User.findOne({where: {[Op.or]:{name : req.name, mail : req.name}}});;

        if(!user) return res.status(403).json({ok:false});

        if(!req.body) return res.status(403).json({ok:false});

        let sale = await db.Sale.findOne({where:{ticketName:req.body.ticket}});

        if(!sale) return res.status(500).json({message:'service unavailable', ok:false});

        let ticket = await db.Ticket.findOne({where:{name:sale.ticketName}});

        if(!ticket) ticket = await db.Ticket.create({sId:sale.saleId,name:sale.ticketName});

        if(!ticket) return res.status(500).json({message:'service unavailable', ok:false});

        let business = await db.Business.findOne({where:{name:req.body.bName}});

        if(!business) return res.status(500).json({message:'service unavailable', ok:false});

        let data = {
            cantReg: 1,
            ptoVta:business.id,
            cbteTipo:11,
            concepto:1,
            docTipo: 80,
            docNro:business.CUIT,
            impTotal:sale.value,
            impTotConc:0,
            impNeto:150,
            impOpEx:0,
            impTrib:34.05,
            impIva:0,
            fchServDesde:'',
            fchServHasta:'',
            fchVtoPago:'',
            monId: 'PES',
            monCotiz: 1,
            cbtesAsoc: [ 
            {
            'Tipo' 		: 6,
            'PtoVta' 	: business.id,
            'Nro' 		: 1, 
            'Cuit' 		: business.CUIT 
            }
            ],
            tributos: [ 
            {
                'Id' 		:  99,  
                'Desc' 		: 'Ingresos Brutos', 
                'BaseImp' 	: 150, 
                'Alic' 		: 5.2, 
                'Importe' 	: 34.05
            }
        ],
        opcionales: [
        {
            'Id' 		: 17,
            'Valor' 	: 2 
        }
            ]
        };
        
        let bill;

        try{
            bill = await electronicBillGenerator(data);
            console.log(bill.FeDetResp.FECAEDetResponse[0].Observaciones);
        }catch(err){
            console.log(err);
        }

        let sales = await db.Sale.findAll({include:[{model:db.Ticket,as:'Ticket'}]});

        return res.status(200).json({message:'ticket created',data:sales,ok:true});
        */
       return res.status(503);
    }
};