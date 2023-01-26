
module.exports = (sequelize, dataTypes) =>{

    let alias = "Products";
    let cols = {
        id : {
            type : dataTypes.INTEGER,
            autoIncrement : true,
            primaryKey : true,
            allowNull : false
        },

        name : {

            type : dataTypes.STRING,
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
        timestamps: true,
        underscored: true
    }

    let Product = sequelize.define(alias, cols, config);

    Product.associate = (models)=>{
        Product.belongsToMany(models.Business, {
            through: "Business_Product",
            foreignKey: "productid"
        });
    }

    return Product;
}