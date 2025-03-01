module.exports = (sequelize, DataTypes) => {
    const D2_bc_other_fct_new = sequelize.define('D2_bc_other_fct_new', {
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
        harvest_month_year: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        total_trees: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },

    }, {
        tableName: 'D2_bc_other_fct_new',
        createdAt: false,
        updatedAt: false
    });
    return D2_bc_other_fct_new;
}