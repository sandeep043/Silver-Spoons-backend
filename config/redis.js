// config/redis.js
const redis = require('redis');

const client = redis.createClient({
    username: 'default',
    password: 'lU2zbmuZhg8gQI1nCMD45vnSjmADwfYK',
    socket: {
        host: 'redis-17005.c301.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 17005
    }
});

client.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

client.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});

// Connect to Redis
client.connect();

// Export wrapper functions with async/await support
const redisWrapper = {
    async get(key) {
        try {
            return await client.get(key);
        } catch (error) {
            console.error('Redis GET error:', error);
            throw error;
        }
    },
    async setex(key, seconds, value) {
        try {
            return await client.setEx(key, seconds, value);
        } catch (error) {
            console.error('Redis SETEX error:', error);
            throw error;
        }
    },
    async del(key) {
        try {
            return await client.del(key);
        } catch (error) {
            console.error('Redis DEL error:', error);
            throw error;
        }
    },
    client
};

module.exports = redisWrapper;