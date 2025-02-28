module.exports = (sequelize, DataTypes) => {
    const B_crop_types = sequelize.define('B_crop_types', {
        crop_type_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        crop_type: {
            type: DataTypes.ENUM(
                'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS', 
                'BANANA', 
                'COFFEE', 
                'OTHER FRUIT CROPS/TREES'
            ),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    }, {
        createdAt: false,
        updatedAt: false
    });
    return B_crop_types;
}