import express from 'express';
import cors from 'cors';
import axios from 'axios';
import LruCache from 'lru-cache';
import PQueuе from 'p-queue';
import { createClient } from 'redis';

const proxyPort = parseInt(process.env.PROXY_PORT, 10) || 3000;
const redisPort = parseInt(process.env.REDIS_PORT, 10) || 6379;
const cacheCapacity = parseInt(process.env.CACHE_CAPACITY, 10) || 100;
const cacheExpiryTime = parseInt(process.env.CACHE_EXPIRY_TIME, 10) || 3600;
const queueConcurrencyLimit = parseInt(process.env.QUEUE_CONCURRENCY_LIMIT, 10) || 10;

const redisClient = createClient({
    host: 'redis',
    port: redisPort,
});

redisClient.on('error', function(error) {
    console.error(error);
});

const cache = new LruCache({
    max: cacheCapacity,
    maxAge: cacheExpiryTime,
});

const queuе = new PQueuе({ concurrency: queueConcurrencyLimit });

const app = express();

app.use(cors());

app.use('/:key', async (req, res) => {
    try {
        const { key } = req.params;

        //
        if (key === 'favicon.ico') {
            return res.status(200).send('');
        }

        async function getValue(key) {
            const cachedValue = await cache.get(key);

            if (cachedValue) {
                console.log('return cached value!');
                return res.status(200).json({ ...JSON.parse(cachedValue), from: 'cache' });
            }

            redisClient.get(key, (redisErr, redisValue) => {
                if (redisValue) {
                    return res.status(200).json({ ...JSON.parse(redisValue), from: 'redis' });
                }
            });

            const response = await axios({
                method: 'GET',
                url: `https://jsonplaceholder.typicode.com/todos/${key}`,
            });

            const { data } = response;
            const jsonData = JSON.stringify(data);

            cache.set(key, jsonData);
            redisClient.set(key, jsonData);

            return res.status(200).json({ ...data, from: 'api' });
        };

        if (queuе.size + queuе.pending <= queueConcurrencyLimit) {
            await queuе.add(() => getValue(key)).catch((queuеErr) => console.log(queuеErr));
        } else {
            throw Error('max_concurrency');
        }
    } catch (err) {
        console.error(err);

        if (err.message === 'max_concurrency') {
            return res.sendStatus(429);
        }

        return res.sendStatus(500);
    }
});

app.use((req, res) => {
    res.sendStatus(404);
});

app.listen(proxyPort, () => {
    console.log(`Server has been started on port ${proxyPort}`);
}).on('error', (err) => {
    console.error(`Server starts error`, err);
});
