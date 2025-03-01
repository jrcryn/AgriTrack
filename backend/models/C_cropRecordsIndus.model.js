module.exports = (sequelize, DataTypes) => {
    const C_crop_records = sequelize.define('C_crop_records', {
        record_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        farmer_input_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'A_farmer_inputs',
                key: 'farmer_input_id'
            }
        },
        crop_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'B_crop_types',
                key: 'crop_type_id'
            }
        },
        crop_type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        crop_variety: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        crop_stage: {
            type: DataTypes.ENUM('Newly Planted', 'Harvesting'),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
    }, {
        createdAt: false,
        updatedAt: false
    });
    return C_crop_records;
}