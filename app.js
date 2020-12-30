 const express = require('express');
 const app = express();
const port = process.env.port || 5005
const routes = require('./router/routes')
const path = require('path');

app.use('/static', express.static(path.join(__dirname, '/static')));
app.set('view engine', 'ejs');

app.get('/', routes);
app.get('/register', routes);
app.post('/register', routes);
app.get('/login', routes);
app.post('/login', routes);
app.get('/forgetpassword', routes);
app.get('/logout', routes);
app.get('*', routes);

 // Server Running 
 app.listen(port,()=>{
    console.log(`Server running on http://localhost:${port}`);
 })
