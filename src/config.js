const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const config = {
    production: {
        api: 'legal-hackathon-api.herokuapp.com',
    },
    development: {
        api: '10.25.24.220:8081',
    },
};

export default config[env];