const express = require('express');
const app = express();
const axios = require('axios');

const PORT = process.env.PORT || 3000;

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
            return parseInt(client.saleID) === 11; // 12 is dedicated namwan user referral ID
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