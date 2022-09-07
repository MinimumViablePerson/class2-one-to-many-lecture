import Database from 'better-sqlite3'

const db = Database('./db/data.db', { verbose: console.log })

const artists = [
  {
    name: 'Nicolas',
    image: 'nicolas.jpg'
  },
  {
    name: 'Ed',
    image: 'ed.jpg'
  },
  {
    name: 'Genc',
    image: 'genc.jpg'
  }
]

const albums = [
  {
    name: 'A day at the opera',
    cover: 'opera.jpg',
    artistId: 1
  },
  {
    name: 'A day at the races',
    cover: 'races.jpg',
    artistId: 1
  },
  {
    name: 'Despacito',
    cover: 'despacito.jpg',
    artistId: 2
  },
  {
    name: 'I like to move it move it',
    cover: 'moveit.jpg',
    artistId: 2
  },
  {
    name: 'Master of puppets',
    cover: 'master.jpg',
    artistId: 3
  }
]

const deleteArtistsTable = db.prepare(`
DROP TABLE IF EXISTS artists;
`)

deleteArtistsTable.run()

const createArtistsTable = db.prepare(`
CREATE TABLE IF NOT EXISTS artists (
  id INTEGER,
  name TEXT NOT NULL,
  image TEXT,
  PRIMARY KEY(id)
);
`)

createArtistsTable.run()

// Unnammed arguments - pass arguments separately and in order
// const createArtist = db.prepare(`
// INSERT INTO artists (name, image) VALUES (?, ?);
// `)
// createArtist.run("Nicolas", "nicolas.jpg")

// Named arguments - you need to pass an object with the right keys
const createArtist = db.prepare(`
INSERT INTO artists (name, image) VALUES (@name, @image);
`)

for (let artist of artists) {
  createArtist.run(artist)
}

const dropAlbumsTable = db.prepare(`
DROP TABLE IF EXISTS albums;
`)

dropAlbumsTable.run()

const createAlbumsTable = db.prepare(`
CREATE TABLE IF NOT EXISTS albums (
  id INTEGER,
  name TEXT NOT NULL,
  cover TEXT,
  artistId INTEGER NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (artistId) REFERENCES artists(id)
);
`)

createAlbumsTable.run()

const createAlbum = db.prepare(`
INSERT INTO albums
  (name, cover, artistId)
VALUES
  (@name, @cover, @artistId);
`)

for (let album of albums) {
  createAlbum.run(album)
}
