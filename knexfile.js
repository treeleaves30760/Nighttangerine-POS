require('dotenv').config();

const getConnectionConfig = () => {
  const useLocal = process.env.DB_USE_LOCAL === 'true';
  
  if (useLocal) {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'nighttangerine_pos',
    };
  } else {
    const remoteHost = process.env.REMOTE_DB_HOST;
    const remoteUser = process.env.REMOTE_DB_USER;
    const remotePassword = process.env.REMOTE_DB_PASSWORD;
    
    if (!remoteHost || !remoteUser || !remotePassword) {
      throw new Error('Remote database credentials are required when DB_USE_LOCAL is false');
    }
    
    return {
      host: remoteHost,
      port: parseInt(process.env.REMOTE_DB_PORT || '5432'),
      user: remoteUser,
      password: remotePassword,
      database: process.env.REMOTE_DB_NAME || 'nighttangerine_pos',
      ssl: process.env.DB_SSL_MODE === 'require' ? { rejectUnauthorized: false } : false,
    };
  }
};

const config = {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || getConnectionConfig(),
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
    },
    migrations: {
      directory: './dist/database/migrations',
      tableName: 'knex_migrations',
      loadExtensions: ['.js'],
    },
    seeds: {
      directory: './dist/database/seeds',
      loadExtensions: ['.js'],
    },
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || getConnectionConfig(),
    pool: {
      min: 5,
      max: 30,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
    },
    migrations: {
      directory: './dist/database/migrations',
      tableName: 'knex_migrations',
      loadExtensions: ['.js'],
    },
    seeds: {
      directory: './dist/database/seeds',
      loadExtensions: ['.js'],
    },
  },

  test: {
    client: 'postgresql',
    connection: {
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5432'),
      user: process.env.TEST_DB_USER || 'postgres',
      password: process.env.TEST_DB_PASSWORD || 'postgres',
      database: process.env.TEST_DB_NAME || 'nighttangerine_pos_test',
    },
    pool: {
      min: 1,
      max: 5,
    },
    migrations: {
      directory: './dist/database/migrations',
      tableName: 'knex_migrations',
      loadExtensions: ['.js'],
    },
    seeds: {
      directory: './dist/database/seeds',
      loadExtensions: ['.js'],
    },
  },
};

module.exports = config;
