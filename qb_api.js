'use strict';

const QuickBooks = require('node-quickbooks')
const qb_api_config = require('./config')



const qbo = new QuickBooks(qb_api_config.consumerKey,
                           qb_api_config.consumerSecret,
                           qb_api_config.oauthToken,
                           qb_api_config.oauthTokenSecret,
                           qb_api_config.realmId,
                           true,
                           true)


//qbo.findAccounts({
//  AccountType: 'Expense',
//  desc: 'MetaData.LastUpdatedTime',
//  limit: 5,
//  offset: 5
//  }, (err, accounts) => {
//       accounts.QueryResponse.Account.forEach((account) => {
//         console.log(accounts.name)
//       })
// })


qbo.reportCustomerIncome([
    {field: 'fetchAll', value: true}
    ], (e, customerIncome) => {
      console.log(customerIncome)
    })
