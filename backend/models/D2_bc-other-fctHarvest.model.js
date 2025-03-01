module.exports = (sequelize, DataTypes) => {
    const D2_bc_other_fct_harvest = sequelize.define('D2_bc_other_fct_harvest', {
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
                model: 'C_crop_records_others',
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
        trees_harvested: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        total_weight: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        destination: {
            type: DataTypes.STRING,
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
        tableName: 'D2_bc_other_fct_harvest',
        createdAt: false,
        updatedAt: false
    });
    return D2_bc_other_fct_harvest;
}