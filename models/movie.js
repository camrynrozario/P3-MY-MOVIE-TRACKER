const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    tmdbId: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    posterPath: {
        type: String,
    },
    releaseDate: {
        type: String,
    },
    overview: {
        type: String,
    },
    status: {
        type: String,
        enum: ['want_to_watch', 'currently_watching', 'finished_watching'],
        default: 'want_to_watch'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);