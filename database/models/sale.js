module.exports  = (sequelize, dataTypes) => { 
    let alias = "Sale";
    let cols = {
            value: {
                type : dataTypes.FLOAT,
                allowNull : false
            },
            name:{
                type: dataTypes.STRING,
                allowNull:false
            },
            quantity:{
                type:dataTypes.INTEGER,
                allowNull: false
            },
            time : {
                primaryKey:true,
                type: dataTypes.DATE,
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
        }
        return Sale;
    }