module.exports = (sequelize, DataTypes) => {
    const D1_crop_indus_harvest = sequelize.define('D1_crop_indus_harvest', {
        crop_detail_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        record_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'C_crop_records_indus',
                key: 'record_id'
            }
        },
        harvest_date: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        total_area_harvested: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        total_volume_production: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        mode_of_payment: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        mode_of_delivery: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    }, {
        tableName: 'D1_crop_indus_harvest',
        createdAt: false,
        updatedAt: false
    });
    return D1_crop_indus_harvest;
}