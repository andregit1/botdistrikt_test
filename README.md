# Project Setup Guide

This guide helps you set up the necessary environment to run the project locally.

## 1. Database Setup

Follow these steps to set up the PostgreSQL database:

- **Install PostgreSQL:**

  - **Linux:**

    ```bash
    sudo apt install postgresql postgresql-contrib
    ```

  - **Mac (using Homebrew):**

    ```bash
    brew install postgresql
    ```

  - **Windows:**
  - Download PostgreSQL:
    Download PostgreSQL version 16.2 from [EnterpriseDB](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads).

  - Installation Process:

    - During the installation process:

      - Uncheck "Stack Builder" when prompted to select components to save time.
      - Use port 5432 when prompted for port selection.
      - Set the temporary password for the superuser as "123123123" when prompted.

    - After Installation:
      - Upon completion of the installation, create a user/role as "root" with the password "123123123".
      - Create a database (not a schema) named "resto_dev".
      - For complete step-by-step instructions, you can follow this guide: [How to Create PostgreSQL Database and Users using psql and pgAdmin](https://www.enterprisedb.com/postgres-tutorials/how-create-postgresql-database-and-users-using-psql-and-pgadmin).

- **Start PostgreSQL service:**

  - **Linux and Mac:**

    ```bash
    sudo systemctl start postgresql.service
    ```

  - **Windows:**
    Start PostgreSQL service from the Services panel.

- **Create a PostgreSQL role and database:**
  ```bash
  sudo -u postgres psql -c "CREATE ROLE root WITH SUPERUSER CREATEDB CREATEROLE PASSWORD '123123123';”
  sudo -u postgres createdb -O root resto_dev
  ```

## 2. Application Setup

Follow these steps to set up the application:

- **Install Node.js version 16.20.2:**

  - **Linux:**

    ```bash
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt-get install -y nodejs | sudo apt-get install -y nodejs=16.20.2
    ```

  - **MacOS:**

    **Install Homebrew:**

    If Homebrew is not already installed on your system, you can install it by running the following command in your terminal:

    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```

    **Install Node.js:**

    Once Homebrew is installed, you can use it to install Node.js version 16.20.2. Run the following commands in your terminal:

    ```bash
    brew install node@16.20.2
    brew unlink node
    brew link node@16.20.2
    ```

    After installation, verify that Node.js version 16.20.2 is installed by running:

    ```bash
    node -v
    ```

    If needed, you can use the `--overwrite` flag with `brew link` to force linking, for example:

    ```bash
    brew link --overwrite node@16.20.2
    ```

    **Why unlink and then link again?**

    Unlinking and then linking again is necessary to set Node.js version 16.20.2 as the active version. This ensures that any existing installations of other Node.js versions do not interfere.

    If both Node.js and Node.js version 16.20.2 are installed, unlinking the current version and then linking version 16.20.2 ensures that version 16.20.2 becomes the active version.

    ```bash
    brew unlink node
    brew link node@16.20.2
    ```

    **Credit:** [Stack Overflow](https://stackoverflow.com/a/67529751)

  - **Windows:**
    You can download the Node.js installer directly from the official Node.js website [here](https://nodejs.org/dist/v16.20.2/node-v16.20.2-x64.msi).

- **Install LoopBack CLI globally:**

  ```bash
  npm install -g loopback-cli
  ```

- **Install Ember CLI globally:**

  ```bash
  npm install -g ember-cli
  ```

- **Install PhantomJS globally:**

  ```bash
  npm install -g phantomjs phantomjs-rebuilt
  ```

- **Navigate to the project directory:**

  ```bash
  cd botdistrikt_test
  ```

- **Run setup:**

  ```bash
  npm run setup
  ```

- **Start the backend server:**

  ```bash
  npm run dev
  ```

- **Navigate to the client directory:**

  ```bash
  cd client
  ```

- **Serve the frontend:**

  ```bash
  ember serve
  ```

- **Start the application:**

  ```bash
  npm start
  ```

- **Open your web browser and navigate to:**

  - **Frontend:**
    [http://localhost:4200](http://localhost:4200)

  - **Backend:**
    [http://localhost:3000/explorer](http://localhost:3000/explorer)

### Additional Commands

- **To run backend tests:**

  - **Linux and Mac:**

    ```bash
    npm test
    ```

  - **Windows:**
    ```bash
    npm run test:windows
    ```
