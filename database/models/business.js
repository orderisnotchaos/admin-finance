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

            profit : {
                type : dataTypes.FLOAT,
                allowNull : false
            },

            userId:{
                type : dataTypes.INTEGER,
                allowNull: false
            },

            created_at : {
                type : dataTypes.NOW,
                allowNull : false
            },

            updated_at : {
                type : dataTypes.NOW,
                allowNull : false
            }


        }
        let config = {
            tableName: "business",
            timestamps: false,
        }

        let Business = sequelize.define(alias,cols,config);

        Business.associate = (models)=>{
            Business.belongsToMany(models.Products, {
                through : "business_product",
                foreignKey : "businessid"
            });

        Business.associate = (models) => {

            Business.belongsTo(models.User);
        };
        }
    
        return Business;
    }