require('dotenv').config();

const config = {
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  migrationsDir: 'migrations',
  mongodb: {
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    url: process.env.MONGO_URI,
    databaseName: process.env.DB_NAME,
  },
  useFileHash: false,
};

module.exports = config;
