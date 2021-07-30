const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 8080;

// import sales emails
const salesEmails = require('./assets/salesEmails.js');

app.post('/fast/login', async (req, res) => {
    try {
        if (req.body.email.toLowerCase() in salesEmails) {
            res.send(JSON.stringify({email: req.body.email}));
        } else {
            res.status(401).send(false);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify(err));
    }
});

app.post('/fast/logout', async (req, res) => {
    try {
        res.send('logged out');
    } catch (error) {
        res.status(500).send(JSON.stringify(error));
    }
});

app.post('/fast/auth', async (req, res) => {
    try {
        if (req.headers.authorization) {
            const credentials = req.headers.authorization.split(' ')[1];
            if (credentials in salesEmails) {
                res.send(JSON.stringify({user: salesEmails[credentials]}));
            } else {
                res.status(401).send(false);
            }
        } else {
            res.status(401).send(false);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify(err));
    }
});

app.post('/fast/salesperformance', async(req, res) => {
    try {
        const {salesId} = req.body;
        const url = `https://apiold.makesend.asia/api/google/makesend/getSaleRegisterLeadResultList`;
        const { data } = await axios.post(url);
        const list = data.saleReferralList.filter(client => {
            return parseInt(client.saleID) === salesId; 
        });
        res.send(JSON.stringify(list));
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/tripleiii', async (req, res) => {
    try {
        const url = `https://apiold.makesend.asia/api/google/makesend/getSaleRegisterLeadResultList`;
        const { data } = await axios.post(url);
        const list = data.saleReferralList.filter(client => {
            return parseInt(client.saleID) === 11; // 11 is dedicated iii user referral ID
        });
        console.log(list);
        res.send(JSON.stringify(list));
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/namwan', async (req, res) => {
    try {
        const url = `https://apiold.makesend.asia/api/google/makesend/getSaleRegisterLeadResultList`;
        const { data } = await axios.post(url);
        const list = data.saleReferralList.filter(client => {
            return parseInt(client.saleID) === 12; // 12 is dedicated namwan user referral ID
        });
        console.log(list);
        res.send(JSON.stringify(list));
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log(`Server starts at port ${PORT}`);
});