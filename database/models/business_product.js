module.exports = (sequelize, dataTypes) =>{

    let alias = "Business_Product";

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

        sold: {
            type : dataTypes.INTEGER,
            allowNull : false
        },

        profit:{
            type : dataTypes.DOUBLE,
            allowNull : false
        },

        price : {
            type : dataTypes.DOUBLE,
            allowNull : false
        },

    }

    let config = {
        tableName: "business_product",
        timestamps: true,
        underscored: false
    }

    let Business_Product = sequelize.define(alias, cols, config);

    return Business_Product;
}