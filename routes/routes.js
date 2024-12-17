const express = require("express");
const router = express.Router();
const Movie = require('../models/movie');
const axios = require('axios');

const TMDB_API_KEY = '42d499cd970df2786a81fb1085ef26c9';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MmQ0OTljZDk3MGRmMjc4NmE4MWZiMTA4NWVmMjZjOSIsIm5iZiI6MTczNDMwNDczNy45NDQsInN1YiI6IjY3NWY2M2UxZGY4MjljNDBiY2Q4YzJlYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.xWBdfjBvY1YBulMgY3U6yK-_ddtGQLtFo-lelBTG_rc';

// Home page - show watch list
router.get("/", async (req, res) => {
    try {
        const allMovies = await Movie.find().sort({ createdAt: -1 });
        
        const movies = {
            want_to_watch: allMovies.filter(m => m.status === 'want_to_watch'),
            currently_watching: allMovies.filter(m => m.status === 'currently_watching'),
            finished_watching: allMovies.filter(m => m.status === 'finished_watching')
        };

        console.log('Sample movie:', allMovies[0]);

        res.render("index", { 
            title: "My Movie Watchlist",
            movies: movies
        });
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Add to watchlist
router.post('/add-to-watchlist', async (req, res) => {
    try {
        const exists = await Movie.findOne({ tmdbId: req.body.tmdbId });
        if (exists) {
            return res.redirect('/?message=Movie already in watchlist&type=warning');
        }

        const movie = new Movie({
            tmdbId: req.body.tmdbId,
            title: req.body.title,
            posterPath: req.body.posterPath,
            releaseDate: req.body.releaseDate,
            overview: req.body.overview,
            status: req.body.status || 'want_to_watch'
        });

        await movie.save();
        res.redirect('/?message=Movie added to watchlist&type=success');
    } catch (err) {
        console.error('Add to watchlist error:', err);
        res.redirect('/?message=Failed to add movie&type=danger');
    }
});

// Update movie status
router.post('/update-status/:id', async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        
        if (!movie) {
            return res.status(404).json({ 
                message: "Movie not found", 
                type: 'danger' 
            });
        }

        res.json({ 
            message: "Movie status updated", 
            type: 'success',
            movie: movie 
        });
    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ 
            message: err.message || 'Failed to update status', 
            type: 'danger' 
        });
    }
});

// Delete movie
router.get("/delete/:id", async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) {
            return res.redirect('/?message=Movie not found&type=error');
        }
        res.redirect('/?message=Movie removed successfully&type=success');
    } catch (err) {
        console.error('Delete error:', err);
        res.redirect('/?message=Failed to delete movie&type=error');
    }
});

// Search route
router.get('/search', async (req, res) => {
    try {
        const query = req.query.query || '';
        let movies = [];
        
        if (query) {
            const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
                headers: {
                    'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
                    'Accept': 'application/json'
                },
                params: {
                    query: query,
                    language: 'en-US',
                    page: 1,
                    include_adult: false
                }
            });
            movies = response.data.results || [];
        }

        res.render('search', { 
            movies,
            query,
            title: 'Search Movies'
        });
    } catch (error) {
        console.error('Search error:', error);
        res.render('search', { 
            movies: [], 
            query: req.query.query || '',
            error: 'Failed to search movies'
        });
    }
});

module.exports = router;