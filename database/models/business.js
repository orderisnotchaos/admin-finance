module.exports  = (sequelize, dataTypes) => { 
    let alias = "Business";
    let cols = {
            id : {
                type : dataTypes.INTEGER,
                autoIncrement : true,
                primaryKey : true,
                allowNull : false
            },
            name : {
                type : dataTypes.STRING,
                allowNull : false
            },

            CUIT: {
                type:dataTypes.STRING,
                allowNull:false
            },

            income : {
                type : dataTypes.FLOAT,
                allowNull : false
            },

            userId:{
                type : dataTypes.INTEGER,
                allowNull: false
            },

            created_at : {
                type : dataTypes.DATE,
                defaultValue:dataTypes.NOW,
                allowNull : false
            },

            updated_at : {
                type : dataTypes.NOW,
                allowNull : true
            }


        }
        let config = {
            tableName: "business",
            timestamps: false,
        }

        let Business = sequelize.define(alias,cols,config);

        Business.associate = (models)=>{
            Business.belongsToMany(models.Product, {
                through : "business_product",
            })
            Business.belongsTo(models.User);
            Business.hasMany(models.Sale,{foreignKey:'businessId'});
        };
        return Business;
    }