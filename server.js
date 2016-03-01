"use strict";
const express = require('express')
const url = require('url')
const request = require('request')
const ejs = require('ejs')
const qs = require('querystring')
//const qb = require('./qb_api')
const session = require('express-session')
const QuickBooks = require('./node_modules/node-quickbooks/index.js')
const config = require('./config.js')

const app = express()
let tempSecret = 0;


app.locals.port = process.env.port || 7777
app.locals.ip = '127.0.0.1'

app.set('views', 'views')
app.locals.appCenter = QuickBooks.APP_CENTER_BASE;

app.use(session({
  secret: 'cb',
  resave: false, 
  saveUninitialized: false, 
  cookie: {secure: true}
  }));
  
app.get('/', (req, res) => {
  res.render('intuit.ejs');
});

app.get('/requesttoken', (req, res) => {
  let postBody = {
    url: QuickBooks.REQUEST_TOKEN_URL,
    oauth: {
      callback: 'http://localhost:' + app.locals.port + '/callback',
      consumer_key: config.consumerKey,
      consumer_secret: config.consumerSecret
    }
  };

  request.post(postBody, (e, r, data) => {
    let requestToken = qs.parse(data);
    req.session.oauth_token_secret = requestToken.oauth_token_secret;
    tempSecret = req.session.oauth_token_secret;
    res.redirect(QuickBooks.APP_CENTER_URL + requestToken.oauth_token)
  });
}); 

app.get('/callback', (req, res) => {
  let postBody = {
    url: QuickBooks.ACCESS_TOKEN_URL,
    oauth: {
      consumer_key:      config.consumerKey,
      consumer_secret:   config.consumerSecret,
      token:             req.query.oauth_token,
      token_secret:      tempSecret,
      verifier:          req.query.oauth_verifier,
      realmId:           req.query.realmId
    }
  };

  request.post(postBody, (e, r, data) => {
    let accessToken = qs.parse(data)
    const qbo = new QuickBooks(config.consumerKey,
                               config.consumerSecret,
                               accessToken.oauth_token,
                               accessToken.oauth_token_secret,
                               postBody.oauth.realmId,
                               true,
                               true
                              ); 

qbo.reportCustomerIncome([
    {field: 'fetchAll', value: true}
    ], (e, customerIncome) => {
      console.log(customerIncome)
    })

//    qbo.findAccounts({
//        AccountType: 'Expense',
//        desc: 'MetaData.LastUpdatedTime',
//        limit: 5,
//        offset: 5
//        }, function(err, accounts) {
//            accounts.QueryResponse.Account.forEach(function(account) {
//                  console.log(account.Name)
//                })
//        });
    });
  tempSecret = 0;
  res.send('<!DOCTYPE html><html lang="en"><head><script>window.close();</script></head><body></body></html>')
});


app.listen(app.locals.port, app.locals.ip, function() {console.log('Server running on ' + app.locals.port + ' at ' + app.locals.ip);});

