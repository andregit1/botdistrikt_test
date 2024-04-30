# Project Setup Guide

This guide helps you set up the necessary environment to run the project locally.

## 1. Database Setup

Follow these steps to set up the PostgreSQL database:

1. Install PostgreSQL:

   ```
   sudo apt install postgresql postgresql-contrib
   ```

2. Start PostgreSQL service:

   ```
   sudo systemctl start postgresql.service
   ```

3. Create a PostgreSQL role and database:
   ```
   sudo -u postgres psql -c "CREATE ROLE root WITH SUPERUSER CREATEDB CREATEROLE PASSWORD '123123123';”
   sudo -u postgres createdb -O root resto_dev
   ```

## 2. Application Setup

Follow these steps to set up the application:

1. Install Node.js version 16.20.2.

2. Install LoopBack CLI globally:

   ```
   npm install -g loopback-cli
   ```

3. Install Ember CLI globally:

   ```
   npm install -g ember-cli
   ```

4. Install PhantomJS globally:

   ```
   npm install -g phantomjs phantomjs-rebuilt
   ```

5. Navigate to the project directory:

   ```
   cd botdistrikt_test
   ```

6. Run setup:

   ```
   npm run setup
   ```

7. Start the backend server:

   ```
   npm run dev
   ```

8. Navigate to the client directory:

   ```
   cd client
   ```

9. Serve the frontend:

   ```
   ember serve
   ```

10. Start the application:
    ```
    npm start
    ```

## Additional Commands

- To run backend tests:
  ```
  npm test
  ```
