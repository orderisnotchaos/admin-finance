

module.exports = (sequelize,dataTypes) =>{

    let alias = 'Ticket';

    let cols = {
        id:{
            type:dataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true,
            allowNull:false
        },
        sId:{
            type:dataTypes.INTEGER,
            allowNull:false
        },
        name:{
            type:dataTypes.STRING,
            allowNull: false
        },
    }

    let config =
    {
        tableName:'ticket',
        underscored:false,
        timestamps:true
    };

    let Ticket = sequelize.define(alias,cols,config);

    Ticket.associate = (models =>{
        Ticket.belongsTo(models.Sale,{as:'Ticket',foreignKey:'sId'});
    })

    return Ticket;
}