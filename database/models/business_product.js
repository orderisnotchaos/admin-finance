module.exports = (sequelize, dataTypes) =>{

    let alias = "business_product";

    let cols = {
        businessid : {
            type : dataTypes.INTEGER,
            allowNull: false,
            primaryKey : true

        },

        productid : {
            type : dataTypes.INTEGER,
            allowNull: false,
            primaryKey : true

        },

        stock: {
            type : dataTypes.INTEGER,
            allowNull : false
        },

        price : {
            type : dataTypes.DOUBLE,
            allowNull : false
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
        tableName: "business_product",
        timestamps: true,
        underscored: true
    }

    let Business_Product = sequelize.define(alias, cols, config);


    return Business_Product;
}