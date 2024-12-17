import express from 'express';
import { pgPool } from './pg_connection.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Start server
app.listen(3001, () => {
    console.log('THE SERVER IS RUNNING!');
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Movie API</h1>');
});

const genres = [];
const movies = [];
const users = [];
const favorites = {};
const reviews = [];

app.post('/genres', async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json({ success: false, error: 'Genre name and description are required.' });
    }

    try {
        const existingGenre = await pgPool.query('SELECT * FROM Genre WHERE genreName = $1', [name]);
        if (existingGenre.rowCount > 0) {
            return res.status(400).json({ success: false, error: 'Genre already exists.' });
        }

        const result = await pgPool.query(
            'INSERT INTO Genre (genreName, descr) VALUES ($1, $2) RETURNING *',
            [name, description]
        );

        const newGenre = result.rows[0];

        res.status(201).json({
            success: true,
            message: 'Genre added successfully.',
            genre: { id: newGenre.id, name: newGenre.genreName, description: newGenre.descr }
        });
    } catch (e) {
        console.error('Error adding genre:', e.message);
        res.status(500).json({ success: false, error: 'An error occurred while adding the genre.' });
    }
});

app.post('/movies', async (req, res) => {
    const { name, year, genre } = req.body;

    if (!name || !year || !genre) {
        return res.status(400).json({ success: false, error: 'Movie name, year, and genre are required.' });
    }

    try {
        const genreResult = await pgPool.query('SELECT * FROM Genre WHERE genreName = $1', [genre]);
        if (genreResult.rowCount === 0) {
            return res.status(400).json({ success: false, error: `Genre '${genre}' does not exist.` });
        }

        const movieResult = await pgPool.query(
            'SELECT * FROM Movie WHERE name = $1 AND year = $2 AND genreID = $3',
            [name, year, genreResult.rows[0].id]
        );
        if (movieResult.rowCount > 0) {
            return res.status(400).json({ success: false, error: 'Movie already exists.' });
        }

        const insertResult = await pgPool.query(
            'INSERT INTO Movie (name, year, genreID) VALUES ($1, $2, $3) RETURNING *',
            [name, year, genreResult.rows[0].id]
        );

        const newMovie = insertResult.rows[0];

        res.status(201).json({
            success: true,
            message: 'Movie added successfully.',
            movie: {
                id: newMovie.id,
                name: newMovie.name,
                year: newMovie.year,
                genre: genre,
            },
        });
    } catch (e) {
        console.error('Error adding movie:', e.message);
        res.status(500).json({ success: false, error: 'An error occurred while adding the movie.' });
    }
});

app.get('/movies/search', async (req, res) => {
    const { keyword } = req.query;

    if (!keyword) {
        return res.status(400).json({ success: false, error: 'Keyword is required.' });
    }

    try {
        const result = await pgPool.query(
            "SELECT * FROM movie WHERE LOWER(name) LIKE LOWER($1)",
            [`%${keyword}%`]
        );
        res.json({ success: true, movies: result.rows });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});


app.get('/movies/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pgPool.query("SELECT * FROM movie WHERE id = $1", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Movie not found.' });
        }
        res.json({ success: true, movie: result.rows[0] });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});


app.delete('/movies/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pgPool.query("DELETE FROM movie WHERE id = $1 RETURNING *", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Movie not found.' });
        }
        res.json({ success: true, message: 'Movie deleted successfully.', movie: result.rows[0] });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});


app.get('/movies', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const offset = (page - 1) * limit;
        const result = await pgPool.query(
            "SELECT * FROM movie ORDER BY id LIMIT $1 OFFSET $2",
            [limit, offset]
        );
        res.json({ success: true, movies: result.rows });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});


app.post('/users', async (req, res) => {
    const { name, username, password, birthYear } = req.body;

    if (!name || !username || !password || !birthYear) {
        return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    try {
        const userCheckResult = await pgPool.query('SELECT * FROM Users WHERE username = $1', [username]);

        if (userCheckResult.rowCount > 0) {
            return res.status(400).json({ success: false, error: 'Username already exists.' });
        }

        const insertResult = await pgPool.query(
            'INSERT INTO Users (name, username, password, birthYear) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, username, password, birthYear]
        );

        const newUser = insertResult.rows[0];

        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            user: {
                id: newUser.id,
                name: newUser.name,
                username: newUser.username,
                birthYear: newUser.birthYear,
            },
        });
    } catch (e) {
        console.error('Error registering user:', e.message);
        res.status(500).json({ success: false, error: 'An error occurred while registering the user.' });
    }
});

app.post('/movies/:id/reviews', async (req, res) => {
    const { id } = req.params;
    const { username, stars, text } = req.body;

    if (!username || !stars || !text) {
        return res.status(400).json({ success: false, error: 'Username, stars, and text are required.' });
    }

    try {

        const movieResult = await pgPool.query('SELECT * FROM Movie WHERE id = $1', [id]);
        if (movieResult.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Movie not found.' });
        }

        const userResult = await pgPool.query('SELECT * FROM Users WHERE username = $1', [username]);
        if (userResult.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        const insertResult = await pgPool.query(
            'INSERT INTO Reviews (userID, movieID, reviewText, stars) VALUES ($1, $2, $3, $4) RETURNING *',
            [userResult.rows[0].id, id, text, stars]
        );

        const newReview = insertResult.rows[0];

        res.status(201).json({
            success: true,
            message: 'Review added successfully.',
            review: {
                id: newReview.id,
                movieID: newReview.movieID,
                userId: newReview.userID,
                stars: newReview.stars,
                text: newReview.reviewtext,
            },
        });
    } catch (e) {
        console.error('Error adding review:', e.message);
        res.status(500).json({ success: false, error: 'An error occurred while adding the review.' });
    }
});

app.post('/users/:username/favorites', async (req, res) => {
    const { username } = req.params;
    const { movieID } = req.body;

    if (!movieID) {
        return res.status(400).json({ success: false, error: 'Movie ID is required.' });
    }

    try {
        const userResult = await pgPool.query('SELECT * FROM Users WHERE username = $1', [username]);
        if (userResult.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        const movieResult = await pgPool.query('SELECT * FROM Movie WHERE id = $1', [movieID]);
        if (movieResult.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Movie not found.' });
        }

        const favoriteResult = await pgPool.query(
            'SELECT * FROM Favorite WHERE userID = $1 AND movieID = $2',
            [userResult.rows[0].id, movieID]
        );
        if (favoriteResult.rowCount > 0) {
            return res.status(400).json({ success: false, error: 'This movie is already in the user\'s favorites.' });
        }

        const insertResult = await pgPool.query(
            'INSERT INTO Favorite (userID, movieID) VALUES ($1, $2) RETURNING *',
            [userResult.rows[0].id, movieID]
        );

        const newFavorite = insertResult.rows[0];

        res.status(201).json({
            success: true,
            message: 'Favorite added successfully.',
            favorite: newFavorite,
        });
    } catch (e) {
        console.error('Error adding favorite:', e.message);
        res.status(500).json({ success: false, error: 'An error occurred while adding the favorite.' });
    }
});

app.get('/users/:username/favorites', async (req, res) => {
    const { username } = req.params;
    try {
        const result = await pgPool.query(`
            SELECT movie.* 
            FROM favorite
            JOIN users ON favorite.userID = users.ID
            JOIN movie ON favorite.movieID = movie.ID
            WHERE users.username = $1
        `, [username]);
        res.json({ success: true, favorites: result.rows });
    } catch (e) {
        console.error("Error fetching favorites:", e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});