
module.exports = (sequelize, dataTypes) =>{

    let alias = "Product";
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
    }

    let config = {
        tableName: "product",
        timestamps: false,
        underscored: true
    }

    let Product = sequelize.define(alias, cols, config);

    Product.associate = (models)=>{
        Product.belongsToMany(models.Business, {
            through: "Business_Product",
        });
        Product.belongsToMany(models.Sale,{
            through: "Sale_Product",
            foreignKey:'productid'
        });

    }

    return Product;
}