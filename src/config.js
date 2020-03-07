const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const config = {
    production: {
        api: 'wss://legal-hackathon-api.herokuapp.com',
    },
    development: {
        api: 'ws://10.25.24.220:8081',
    },
};

export default config[env];