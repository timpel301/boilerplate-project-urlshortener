require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var bodyparser = require('body-parser');
const dns = require('node:dns');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

const Url = mongoose.model('Url', urlSchema);

const createShort = (req, res) => {
  var hostname = req.body.url;
  var short = nanoid();
  dns.lookup(hostname, (err) => {
    if (err) {
      res.json({ error: 'Invalid URL' });
      return;
    }
    Url.findOne({ original_url: hostname }).exec((err, url) => {
      if (err) {
        console.error(err);
        res.json({ error: 'URL not in database' });
        return;
      }
      if (url) {
        res.json(url);
      } else {
        url = new Url({
          original_url: hostname,
          short_url: short,
        });
        url.save((err) => {
          if (err) {
            console.error(err);
            res.json({ error: 'not saved' });
            return;
          }
          res.json(url);
        });
      }
    });
  });
};

app.route('/api/shorturl').post(createShort);

app.get('/api/shorturl/:short', (req, res) => {
  Url.findOne({ short_url: req.params.short }).exec((err, url) => {
    if (err) {
      console.error(err);
      res.json({ error: 'Could not get url' });
      return;
    }
    if (url) {
      res.redirect(url.original_url);
    } else {
      res.redirect('/');
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
