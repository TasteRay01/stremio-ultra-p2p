const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");

const manifest = {
    id: "community.ultrap2pstreamer",
    version: "1.0.0",
    name: "Ultra P2P Streamer",
    description: "Instant zero-buffer P2P multi-resolution torrent streaming.",
    resources: ["stream"],
    types: ["movie"],
    catalogs: []
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async (args) => {
    if (args.type === "movie" && args.id) {
        try {
            const res = await axios.get(`https://yts.mx{args.id}`);
            const json = res.data;

            if (json.data && json.data.movies && json.data.movies.length > 0) {
                const movie = json.data.movies[0];
                
                if (movie.torrents) {
                    const streams = movie.torrents.map(torrent => {
                        const qualityLabel = torrent.quality === "2160p" ? "⚡ [4K ULTRA HD]" : `⚡ [${torrent.quality}]`;
                        return {
                            name: "UltraP2P",
                            title: `${qualityLabel}\nSeeds: ${torrent.seeds} | Size: ${torrent.size}\nPeer Network Connection`,
                            infoHash: torrent.hash
                        };
                    });
                    return { streams: streams };
                }
            }
        } catch (error) {
            console.error("P2P Scraping Error: ", error.message);
        }
    }
    return { streams: [] };
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: port });
