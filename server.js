const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const axios = require('axios');


const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};
  
const db = pgp(dbConfig);
  
db.connect()
    .then(obj => {
        console.log('Database connection successful'); 
        obj.done(); 
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });

app.set('view engine', 'ejs');
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true}
    ));
// app.use(express.static('resources'));



app.get('/', (req, res) => {
    return res.render('pages/main', {item: []});
})

app.get('/reviews', (req, res) => {
    db.any(`SELECT * FROM reviews ORDER BY reviewDate DESC;`)
        .then(reviews => { 
            return res.render('pages/reviews', {reviews});
        })
        .catch(error => { 
            return res.render('pages/reviews', {error: true, message: 'Error'});
        })
})

app.post('/search', (req, res) => {
    axios({
      url: `https://itunes.apple.com/search?term=${req.body.q}`, 
      method: 'GET' ,
      params: {
        media: "music"
      }
    }) 
      .then(items => { 
        if(items.data.resultCount > 0) {
            res.render('pages/main', {item: items.data.results});
        } 
        else {
            res.render('pages/main', {item: [], error:true, message: "No Results"});

        }
      }) 
      .catch(error => { 
        res.render('pages/main', {item: [], error: true, message: 'Search error'});
      }) 
});
  

app.post('/newReview', (req, res) => {   
    if(req.body.review == null) {
        return res.redirect('/reviews');
    } 
    else {
        var now = new Date();
        
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var date = month + '/' + day + '/' + year;

        db.any(`INSERT INTO reviews (songName, review, reviewDate) VALUES ('${req.body.songName}', '${req.body.review}', '${date}');`)
            .then(result => { 
                return res.redirect('/reviews');
            })
            .catch(error => { 
                return res.redirect('/');
            })
    }
});


app.listen(3000);
console.log('Server is listening on port 3000');