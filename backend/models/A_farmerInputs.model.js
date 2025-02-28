module.exports = (sequelize, DataTypes) => {
    const A_farmer_inputs = sequelize.define('A_farmer_inputs', {
        farmer_input_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        surname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        middle_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        farm_location: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
    });
    return A_farmer_inputs;
};





