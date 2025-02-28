module.exports = (sequelize, DataTypes) => {
    const D1_crop_indus_new = sequelize.define('D1_crop_indus_new', {
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
                model: 'C_crop_records',
                key: 'record_id'
            }
        },
        variety: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        plantation_date: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        harvest_month: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        total_area_planted: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
    }, {
        tableName: 'D1_crop_indus_new',
        createdAt: false,
        updatedAt: false
    });
    return D1_crop_indus_new;
}