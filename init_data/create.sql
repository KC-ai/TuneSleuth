CREATE TABLE reviews (
    reviewID SERIAL PRIMARY KEY NOT NULL,
    songName TEXT NOT NULL,
    review TEXT NOT NULL,
    reviewDate VARCHAR(10) NOT NULL
);