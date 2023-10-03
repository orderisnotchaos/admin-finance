module.exports  = (sequelize, dataTypes) => { 
    let alias = "Sale";
    let cols = {
            value: {
                type : dataTypes.FLOAT,
                allowNull : false
            },

            ticketName:{
                type:dataTypes.STRING,
                allowNull:false
            },

            ticketType:{
                type:dataTypes.INTEGER,
                allowNull:false
            },
            saleId:{
                type:dataTypes.INTEGER,
                primaryKey:true,
                allowNull:false,
                autoIncrement: true
            },
          
            time : {
                type: dataTypes.DATE,
                primaryKey:true,
                allowNull: false
            },

            businessId:{
                primaryKey:true,
                type : dataTypes.INTEGER,
                allowNull: false
            },

        }
        
        let config = {
            tableName: "sale",
            timestamps: false,
        }

        let Sale = sequelize.define(alias,cols,config);

        Sale.associate = (models) =>{

            Sale.belongsTo(models.Business, {as:'sale'});
            Sale.belongsToMany(models.Product,{through:'Sale_Product',foreignKey:'saleTime',otherKey:'saleBusiness'})
            Sale.hasOne(models.Ticket,{as:'Ticket',foreignKey:'sId'});
        }

        return Sale;
    }