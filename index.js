const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
require('dotenv').config();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.post('/fast/login', async (req, res) => {
    try {
        const response = await axios('https://apiold.makesend.asia/api/google/makesend/getSaleTeam', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
        });
        const salesEmails = response.data.saleTeam.map(sale => sale.email.toLowerCase());
        if (salesEmails.includes(req.body.email.toLowerCase())) {
            res.send(JSON.stringify({ email: req.body.email }));
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
            const response = await axios('https://apiold.makesend.asia/api/google/makesend/getSaleTeam', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
            });
            const salesEmails = response.data.saleTeam.map(sale => sale.email);
            if (salesEmails.includes(credentials)) {
                res.send(JSON.stringify({ user: response.data.saleTeam.find(sale => sale.email.toLowerCase() === credentials.toLowerCase()) }));
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

app.post('/fast/salesreferrals', checkOrigin, async (req, res) => {
    try {
        const { salesId } = req.body;
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

app.post('/fast/invoices', checkOrigin, async (req, res) => {
    try {
        const { userIds, startDate, endDate } = req.body;
        if (userIds && userIds.length && startDate && endDate) {
            const userIdsText = userIds.join();
            const connection = mysql.createConnection({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE
            });
            connection.connect();
            const query = `
                SELECT 
                    app_user.id AS user_id,
                    app_user.first_name AS first_name,
                    app_user.last_name AS last_name,
                    app_user.phone AS phone,
                    app_user.email AS email,
                    invoice.invoice_id AS invoice_id,
                    invoice.status AS payment_status,
                    invoice.created_at AS created_at,
                    invoice.updated_at AS updated_at,
                    bill.amount AS amount,
                    bill.payment_type AS payment_type,
                    bill.type AS type
                FROM \`invoice\`
                JOIN \`bill\` ON invoice.bill_id = bill.id
                JOIN \`app_user\` ON app_user.id = invoice.user_id
                WHERE invoice.user_id IN (${userIdsText}) AND invoice.created_at >= CAST('${startDate}' AS DATE) AND invoice.created_at <= CAST('${endDate}' AS DATE)
            `;
            connection.query(query, function (error, results, fields) {
                if (error) throw error;
                res.send(JSON.stringify(results));
            });
            connection.end();
        } else {
            res.status(400).send('missing body params');
        }
    } catch (err) {
        console.log(err);
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

function checkOrigin(req, res, next) {
    const origin = req.headers.origin;
    const urlList = validOrigins();
    const isOriginValid = urlList.some(url => origin.includes(url));
    if (isOriginValid) {
        next();
    } else {
        res.status(401).send(null);
    }
}

function validOrigins() {
    return [
        'localhost:3000',
        '127.0.0.1:3000',
        'localhost:5500',
        '127.0.0.1:5500',
        'localhost:8080',
        '127.0.0.1:8080',
        'makesend-fast.netlify.app',
        'makesend.asia',
        'makesend.ninja',
    ]
}