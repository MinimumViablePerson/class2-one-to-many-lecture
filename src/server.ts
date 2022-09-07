import cors from 'cors'
import express from 'express'
import Database from 'better-sqlite3'

const db = Database('./db/data.db', { verbose: console.log })
const app = express()
app.use(cors())
app.use(express.json())

const port = 5678

const getArtists = db.prepare(`
SELECT * FROM artists;
`)

const getArtistById = db.prepare(`
SELECT * FROM artists WHERE id = @id;
`)

const getAlbumsForArtist = db.prepare(`
SELECT * FROM albums WHERE artistId = @artistId;
`)

const getAlbums = db.prepare(`
SELECT * FROM albums;
`)

const getAlbumById = db.prepare(`
SELECT * FROM albums WHERE id = @id;
`)

const createArtist = db.prepare(`
INSERT INTO artists (name, image) VALUES (@name, @image);
`)

const createAlbum = db.prepare(`
INSERT INTO albums
  (name, cover, artistId)
VALUES
  (@name, @cover, @artistId);
`)

app.get('/artists', (req, res) => {
  const artists = getArtists.all()

  for (let artist of artists) {
    const albums = getAlbumsForArtist.all({ artistId: artist.id })
    artist.albums = albums
  }

  res.send(artists)
})

app.get('/artists/:id', (req, res) => {
  const artist = getArtistById.get(req.params)

  if (artist) {
    const albums = getAlbumsForArtist.all({ artistId: artist.id })
    artist.albums = albums
    res.send(artist)
  } else {
    res.status(404).send({ error: 'Artist not found.' })
  }
})

app.post('/artists', (req, res) => {
  let errors: string[] = []

  if (typeof req.body.name !== 'string') {
    errors.push('Name is missing or not a string')
  }

  if (typeof req.body.image !== 'string') {
    errors.push('Image is missing or not a string')
  }

  if (errors.length === 0) {
    const info = createArtist.run(req.body)
    const artist = getArtistById.get({ id: info.lastInsertRowid })
    const albums = getAlbumsForArtist.all({ artistId: artist.id })
    artist.albums = albums
    res.send(artist)
  } else {
    res.status(400).send({ errors })
  }
})

app.get('/albums', (req, res) => {
  const albums = getAlbums.all()

  for (let album of albums) {
    const artist = getArtistById.get({ id: album.artistId })
    album.artist = artist
  }

  res.send(albums)
})

// Longer, it works, and it gives me nice errors
// And makes sure an artist exists before trying to create the album
app.post('/albums', (req, res) => {
  let errors: string[] = []

  if (typeof req.body.name !== 'string') {
    errors.push('Name is missing or not a string')
  }

  if (typeof req.body.cover !== 'string') {
    errors.push('Cover is missing or not a string')
  }

  if (typeof req.body.artistId !== 'number') {
    errors.push('ArtistId is missing or not a number')
  }

  if (errors.length === 0) {
    const artist = getArtistById.get({ id: req.body.artistId })
    if (artist) {
      const info = createAlbum.run(req.body)
      const album = getAlbumById.get({ id: info.lastInsertRowid })
      album.artist = artist
      res.send(album)
    } else {
      res.status(400).send({
        error:
          'You are trying to create an album for an artist that does not exist.'
      })
    }
  } else {
    res.status(400).send({ errors })
  }
})

// Short, it works, but it could be way better
// app.post('/albums', (req, res) => {
//   const info = createAlbum.run(req.body)
//   const album = getAlbumById.get({ id: info.lastInsertRowid })
//   res.send(album)
// })

app.get('/albums/:id', (req, res) => {
  const album = getAlbumById.get(req.params)

  if (album) {
    const artist = getArtistById.get({ id: album.artistId })
    album.artist = artist
    res.send(album)
  } else {
    res.status(404).send({ error: 'Album not found.' })
  }
})

app.listen(port, () => {
  console.log(`App running: http://localhost:${port}`)
})
