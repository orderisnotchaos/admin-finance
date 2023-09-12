module.exports = (sequelize, dataTypes) =>{

    let alias = "Sale_Product";

    let cols = {

        saleTime:{
            type: dataTypes.DATE,
            allowNull:false,
            primaryKey:true
        },

        saleBusiness:{
            type: dataTypes.INTEGER,
            allowNull:false,
            primaryKey:true
        },

        productid : {
            type : dataTypes.INTEGER,
            allowNull: false,
            primaryKey : true

        },

        sold: {
            type : dataTypes.INTEGER,
            allowNull : false
        },

    }

    let config = {
        tableName: "sale_product",
        timestamps: true,
        underscored: false
    }

    let Sale_Product = sequelize.define(alias, cols, config);


    Sale_Product.sync({force:false});
    
    return Sale_Product;
}