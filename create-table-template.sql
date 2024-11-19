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

INSERT INTO Genre (genreName, descr) VALUES ('Comedy', 'Hahaha!');