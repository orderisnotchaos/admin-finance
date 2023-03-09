module.exports  = (sequelize, dataTypes) => { 
    let alias = "User";
    let cols = {
            id : {
                type : dataTypes.INTEGER,
                autoIncrement : true,
                primaryKey : true,
                allowNull : false
            },
            email:{
                type:dataTypes.STRING,
                allowNull: true
            },
            name : {
                type : dataTypes.STRING,
                allowNull : false
            },
            dType : {
                type: dataTypes.STRING,
                allowNull: false
            },
            dNumber : {
                type: dataTypes.INTEGER,
                allowNull:false
            },
            password: {
                type:dataTypes.STRING,
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
            tableName: "user",
            timestamps: false,
            underscored: true
        }

        let User = sequelize.define(alias,cols,config);

        User.associate = (models)=>{
            User.hasMany(models.Business, {
                foreignKey: "userId"
            });
        }
    
        return User;
    }