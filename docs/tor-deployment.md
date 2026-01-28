# Tor Hidden Service Deployment

This document outlines the steps to deploy this application as a Tor hidden service using Docker and Docker Compose.

## Prerequisites

- **Docker:** Ensure Docker is installed and running on your system. ([Installation Guide](https://docs.docker.com/engine/install/))
- **Docker Compose:** Ensure Docker Compose is installed. (It's included with Docker Desktop for Windows and Mac. For Linux, [see here](https://docs.docker.com/compose/install/)).

## Setup and Deployment

1.  **Clone the Repository:**
    If you haven't already, clone the project repository to your local machine.

2.  **Navigate to Project Root:**
    Open your terminal and change the directory to the root of the project.

3.  **Start the Services:**
    Run the following command to build the application container (if not already built) and start both the application and Tor services in detached mode:
    ```bash
    docker-compose up -d
    ```
    - The `app` service will build the SvelteKit application and run its Node.js server.
    - The `tor` service will start Tor and configure the hidden service based on `tor/torrc`.

4.  **Retrieve Your .onion Address:**
    Once the services are up (especially the `tor` service for the first time), Tor will generate the hidden service data, including its unique `.onion` address. This data is stored in the `hidden_service_data` directory in your project root (as mapped in `docker-compose.yml`).

    To get the address:
    ```bash
    cat ./hidden_service_data/hostname
    ```
    This will output your `.onion` address (e.g., `yourrandomstringhere.onion`). You can now access your application through the Tor Browser using this address.

5.  **Accessing the Application Locally (Optional):**
    The `docker-compose.yml` file maps port 3000 of the application container to port 3000 on your host machine. This means you can also access the application directly in your regular browser (without Tor) at `http://localhost:3000` for testing or local use.

## Service Management

-   **View Logs:**
    To view the logs for the application:
    ```bash
    docker-compose logs app
    ```
    To view the logs for the Tor service:
    ```bash
    docker-compose logs tor
    ```
    To follow logs in real-time, add the `-f` flag (e.g., `docker-compose logs -f app`).

-   **Stop the Services:**
    To stop the application and Tor services:
    ```bash
    docker-compose down
    ```
    This will stop and remove the containers but will not remove the `hidden_service_data` volume, so your `.onion` address will persist for the next time you start the services.

-   **Rebuild the Application Container:**
    If you make changes to the application code, you'll need to rebuild the `app` container:
    ```bash
    docker-compose build app
    # or to rebuild all services if needed
    docker-compose build
    ```
    Then, restart the services:
    ```bash
    docker-compose up -d
    ```

## How It Works

The setup consists of two main services defined in `docker-compose.yml`:

-   **`app` service:**
    -   Built using the `Dockerfile` at the root of the project.
    -   This container runs the SvelteKit application (Node.js server) on port 3000.
-   **`tor` service:**
    -   Uses the official `tor` Docker image.
    -   It's configured using `tor/torrc` to create a hidden service.
    -   The hidden service is set to forward traffic to the `app` service at `app:3000` over the internal Docker network (`tor_network`).
    -   The `hidden_service_data` directory is mounted from your host machine to `/var/lib/tor/hidden_service/` inside the Tor container. This directory stores the Tor hidden service keys and hostname, ensuring your `.onion` address remains the same across restarts.

## Security Notes

-   The private key for your hidden service is stored in `./hidden_service_data/private_key`. **Guard this key carefully.** Anyone with access to this key can impersonate your hidden service.
-   Ensure your application is secure and does not leak sensitive information that could deanonymize your server if that's a concern.
