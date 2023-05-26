export const QUERIES = [
    {
        QUERY: `CREATE TABLE IF NOT EXISTS USERS (
        user_id VARCHAR(100) NOT NULL PRIMARY KEY ,
        email  VARCHAR(100) NOT NULL UNIQUE,
        password  VARCHAR(150) NOT NULL,
        name  VARCHAR(130) NOT NULL,
        coin int NOT NULL
       );`,
        SUCCESS: "User Table is Created",
        FAILURE: "Cannot Create User Table"
    },
    {
        QUERY: `CREATE TABLE IF NOT EXISTS GAMES (
            _id int NOT NULL AUTO_INCREMENT PRIMARY KEY ,
            game_id varchar(100) UNIQUE,
            role varchar(100),
            player1_score int,
            player2_score int,
            player1_id VARCHAR(100) ,
            player2_id VARCHAR(100),
            CONSTRAINT fk_user1 FOREIGN KEY (player1_id) REFERENCES USERS(user_id),
            FOREIGN KEY (player2_id) REFERENCES USERS(user_id)
           );`,
            SUCCESS: "Game Table is Created",
            FAILURE: "Cannot Create Game Table"
    },
    {
        QUERY: `CREATE TABLE IF NOT EXISTS TOURNAMENT (
            _id int NOT NULL AUTO_INCREMENT PRIMARY KEY UNIQUE,
            tournament_id VARCHAR(100),
            score int,
            player_id VARCHAR(100),
            CONSTRAINT fk_user2 FOREIGN KEY (player_id) REFERENCES USERS(user_id)
           );`,
            SUCCESS: "Tournament Games Table is Created",
            FAILURE: "Cannot Create Tournament Games Table"
    }

]

