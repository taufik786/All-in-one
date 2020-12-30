const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/AllInOne',
{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> console.log("Database Connected."))

