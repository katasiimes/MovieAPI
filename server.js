import express from 'express'; 

var app = express();

app.listen(3001, () => {
    console.log('THE SERVER IS RUNNING!');
});

app.get('/', (req, res) => {
    res.send('<h1>You just called root endpoint!</h1>');

});

app.get('/user/:id', (req, res) => {

    console.log( req.params['id'] );
 

    res.json('done');
});

app.get('/user/info', (req, res) => {
    res.send('User info');
});

app.get('/Movie', (req, res) => {
    res.send('Movie');
});

app.get('/genre', (req, res) => {
    res.send('Genre');
});

app.get('/reviews', (req, res) => {
    res.send('Reviews');
});

app.get('/favorite', (req, res) => {
    res.send('Favorite');
});