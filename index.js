require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var bodyparser = require('body-parser');
const dns = require('node:dns');
const mongoose = require('mongoose');
require('nanoid');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

const Url = mongoose.model('Url', urlSchema);

app.route('/api/shorturl').post((req,res) => {
  const createShort = (done) => {
    var hostname = req.body.toString();
    var short = nanoid();
    if (!dns.lookup(hostname, err)){
      try{
        let url = Url.findOne({original_url: hostname});
        if (url) {
          res.json(url)
        } else{
          url = new Url({
          original_url: hostname,
          short_url: short,
        });
        url.save();
        res.json(url);
        done();
        }   
      } catch (err) {console.error(err);}
    } else res.json({error: 'invalid url'});
  }
});

app.get('/api/shorturl/:short', (req,res) => {
  if (Url.findOne({short_url: req.params.short})){
    let url = Url.findOne({short_url: req.params.short});
    res.redirect(url.original_url);
  } else {res.json({error: 'invalid url'});}

});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
