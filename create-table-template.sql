-- Active: 1732029756459@@127.0.0.1@5432@postgres@public
CREATE TABLE Genre(
    id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    genreName VARCHAR(255),
    descr VARCHAR(255)
);

CREATE TABLE Users(
    id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255),
    username VARCHAR(255),
    password VARCHAR(255),
    birthYear INT
);

CREATE TABLE Movie(
    id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255),
    year INT,
    genreID INT,
    FOREIGN KEY (genreID) REFERENCES Genre(id)
);

CREATE TABLE Reviews(
    id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    userID INT,
    movieID INT,
    reviewText VARCHAR(255),
    stars INT
);

CREATE TABLE Favorite(
    id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    userID INT,
    movieID INT,
    FOREIGN KEY (userID) REFERENCES Users(id),
    FOREIGN KEY (movieID) REFERENCES Movie(id)
);


INSERT INTO Genre (genreName, descr) VALUES 
('Drama', 'Dramatic movies'), 
('Comedy', 'Funny movies'), 
('Sci-Fi', 'Science Fiction movies'), 
('Fantasy', 'Fantasy adventures'), 
('Action', 'Action movies'), 
('Thriller', 'Suspenseful movies');

INSERT INTO Movie (name, year, genreID) VALUES 
('Inception', 2010, 5),
('The Terminator', 1984, 5),
('Tropic Thunder', 2008, 2),
('Borat', 2006, 2),
('Interstellar', 2014, 1),
('Joker', 2019, 1);


INSERT INTO Users (username, name, password, birthYear) VALUES 
('reimarii', 'Reima Riihimäki', 'qwerty123', 1986),
('lizzy', 'Lisa Simpson', 'abcdef', 1991),
('boss', 'Ben Bossy', 'salasana', 1981);

DROP TABLE IF EXISTS Reviews CASCADE;
DROP TABLE IF EXISTS Favorite CASCADE;
DROP TABLE IF EXISTS Movie CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Genre CASCADE;