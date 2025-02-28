const express = require('express');
const dotenv = require('dotenv');
const db = require('./models');
const farmerInputs = require('./routes/farmerInputs.route.js');

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/', farmerInputs);

db.sequelize.sync().then(() => { 
    app.listen(PORT, () => {
        console.log('Server is running on port ' + PORT);
    });
});

/* Tables does not get automatically updated kahit may nodemon, to alter, { alter: true } is needed to update the table 

db.sequelize.sync({ alter: true }).then(() => { 
    app.listen(PORT, () => {
        console.log('Server is running on port ' + PORT);
    });
}); */


