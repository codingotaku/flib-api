module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING,
            unique: true
        },
        password: DataTypes.STRING,
        createdAt: {
            type: 'TIMESTAMP',
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            onUpdate: DataTypes.NOW,
            field: 'updated_at'
        },
    }, {
        freezeTablename: true,
    });

    return User;
};
