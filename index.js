const express = require('express');
const bodyParser = require('body-parser');
const app1 = express();
const port1 = 3001;
const app2 = express();
const port2 = 3002;
const axios = require('axios');
const fs = require('fs');
const privateKey = fs.readFileSync('my_private_key', { encoding: 'utf-8' });
const publicKey = fs.readFileSync('my_public_key', { encoding: 'utf-8' });
const util = require('./util');
const algorithm = 'RS256';
const host = 'http://localhost';

app1.use(bodyParser.urlencoded({ extended: false }));
app1.use(bodyParser.json());
app1.use(bodyParser.raw());
app2.use(bodyParser.urlencoded({ extended: false }));
app2.use(bodyParser.json());
app2.use(bodyParser.raw());

app1.listen(port1, () => {
  console.log(`App1 listening on port ${port1}`);
});

app2.listen(port2, () => {
  console.log(`App2 listening on port ${port2}`);
});

app1.post('/transform-account', async (req, res) => {

  if (Object.keys(req.body).length === 0 || req.body.length < 1) {
    res.status(400);
    res.send('Invalid request!');
    return;
  }

  let accountId = req.body[0].FL_ACCOUNT;
  let payload = {
    account: {
      currency: req.body[0].FL_CURRENCY,
      amount: req.body[0].FL_AMOUNT,
    }
  };

  const signature = util.getSignature(algorithm, payload, privateKey);

  try {
    const url = `${host}:${port2}/dev/api/${accountId}?signature=${signature}`;
    const response = await axios.post(url, payload);
    // verify signature
    if (response.data.signature && 
        util.verifySignature(response.data.signature, algorithm, publicKey)) {
          let data = [
            {
              FIN_ACCOUNT: response.data.accountId,
              FIN_CURRENCY: response.data.transactions[0].currency,
              FIN_DEBIT: response.data.transactions[0].type.toLowerCase() === 'debit'?response.data.transactions[0].amount:0,
              FIN_CREDIT:response.data.transactions[0].type.toLowerCase() === 'credit'?response.data.transactions[0].amount:0,
            }
          ];
          res.json(data);
    } else {
      res.status(500);
      res.send('Invalid signature!');
    }
  } catch (error) {
    console.error(error);
    res.send(error.toString());
    return;
  }

})

app2.post('/dev/api/:accountId', async (req, res) => {
  
  if (Object.keys(req.body).length === 0 || 
        !req.params.accountId || 
        !req.query.signature ||
        !util.verifySignature(req.query.signature, algorithm, publicKey)) {
    res.status(400);
    res.send('Invalid request!');
    return;
  }

  const payload = { 
    accountId: req.params.accountId,
    transactions: [{
      id: '1000',
      currency: req.body.account.currency,
      amount: req.body.account.amount,
      type: 'Credit'
    }]
  };

  payload.signature = util.getSignature(algorithm, payload, privateKey);

  res.json(payload);

});






