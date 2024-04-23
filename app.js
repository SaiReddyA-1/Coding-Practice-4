// app.js

const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    console.log('Database connected')

    app.listen(3000, () => {
      console.log('Server is started in https://localhost:3000/')
    })
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }
}

initializeDatabaseAndServer()

// API 1: Get all players
app.get('/players/', async (req, res) => {
  const Query = `SELECT
  player_id as playerId,
  player_name as playerName,
  jersey_number as jerseyNumber,
  role
  FROM cricket_team`
  const DBresponse = await db.all(Query)

  res.send(DBresponse)
})

// API 2: Create a new player
app.post('/players/', async (req, res) => {
  const {playerName, jerseyNumber, role} = req.body

  const query =
    'INSERT INTO cricket_team (player_name, jersey_number, role) VALUES (?, ?, ?)'
  const result = await db.run(query, [playerName, jerseyNumber, role])
  const newPlayerId = result.lastID
  res.send('Player Added to Team')
})

// API 3: Get player by ID
app.get('/players/:playerId/', async (req, res) => {
  const {playerId} = req.params
  try {
    const query = `SELECT
      player_id as playerId,
      player_name as playerName,
      jersey_number as jerseyNumber,
      role
      FROM cricket_team
      WHERE player_id = ?`
    const player = await db.get(query, [playerId])

    res.send(player)
  } catch (error) {
    console.error('Error fetching player:', error.message)
    res.status(500).json({error: 'Internal server error'})
  }
})

// API 4: Update player by ID
app.put('/players/:playerId/', async (req, res) => {
  const {playerId} = req.params
  const {playerName, jerseyNumber, role} = req.body

  try {
    const query =
      'UPDATE cricket_team SET player_name = ?, jersey_number = ?, role = ? WHERE player_id = ?'
    await db.run(query, [playerName, jerseyNumber, role, playerId])
    res.send('Player Details Updated')
  } catch (error) {
    console.error('Error updating player:', error.message)
    res.status(500).json({error: 'Internal server error'})
  }
})

// API 5: Delete player by ID
app.delete('/players/:playerId/', async (req, res) => {
  const {playerId} = req.params
  query = `DELETE FROM cricket_team WHERE player_id = ${playerId}`

  await db.run(query)
  console.log('Player Removed')
  res.send('Player Removed')
})

module.exports = app
