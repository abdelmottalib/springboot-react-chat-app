# Chat App

A simple chat application built with Spring Boot for the backend, PostgreSQL for the database, and Next.js for the frontend.

## Prerequisites

- Java 17 or higher
- Node.js and npm
- PostgreSQL (local installation or container)

## Backend Setup (Spring Boot)

1. **Clone the repository:**

    ```bash
    git clone https://github.com/abdelmottalib/springboot-next-chat-app
    cd backend
    ```

2. **Configure Database:**

    - Create a PostgreSQL database named `chat`.
    - Update database configuration in `backend/src/main/resources/application.properties`:

        ```properties
        spring.datasource.url=jdbc:postgresql://localhost:5432/chat
        spring.datasource.username=<your_db_username>
        spring.datasource.password=<your_db_password>
        ```

3. **Run the Spring Boot Application:**

    ```bash
    ./mvnw spring-boot:run
    ```

   The backend will run on `http://localhost:8088`.

## Frontend Setup (Next.js)

1. **Navigate to the frontend folder:**

    ```bash
    cd frontend
    ```

2. **Install Dependencies:**

    ```bash
    npm install
    ```

3. **Run the Next.js Application:**

    ```bash
    npm run dev
    ```

   The frontend will be available at `http://localhost:3000`.

## Usage

1. Access the frontend application at [http://localhost:3000](http://localhost:3000).
2. Enter your nickname and full name in the register page
3. Chat with other users who are online.

## Notes

- This project can easily be refactored for use with React.
- Make sure to have a PostgreSQL server running either locally or in a container.
