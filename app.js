const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let dataBase = null;
const initializeDbAndServer = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DataBase Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//1.list of all movies API

app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `
    SELECT 
        movie_name
    FROM 
        movie
    `;
  const getAllMoviesArray = await dataBase.all(getAllMoviesQuery);
  response.send(getAllMoviesArray);
});

//2.create Movie API

app.post("/movies/", async (request, response) => {
  const addMovieObj = request.body;
  const { directorId, movieName, leadActor } = addMovieObj;
  const addMovieQuery = `
  INSERT INTO
    movie(director_id,movie_name,lead_actor)
  VALUES(
      '${directorId}',
      '${movieName}',
      '${leadActor}'
    )`;
  await dataBase.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//3.get specific movie  -- not working

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getSpecificMovieQuery = `
    SELECT 
        *
    FROM 
        movie
    WHERE
        movie_id = ${movieId}`;
  const getSpeMovie = await dataBase.get(getSpecificMovieQuery);
  response.send(getSpeMovie);
});

//4.updated Movie

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updateMovieObj = request.body;
  const { directorId, movieName, leadActor } = updateMovieObj;
  const updatedMovieQuery = `
  UPDATE 
     movie
  SET
     director_id = '${directorId}',
     movie_name = '${movieName}',
     lead_actor = '${leadActor}'
  WHERE
    movie_id = ${movieId}`;
  await dataBase.run(updatedMovieQuery);
  response.send("Movie Details Updated");
});

//5.delete Movie API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
        movie
    WHERE
        movie_id = ${movieId}    
    `;
  await dataBase.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//6. List of directors

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT 
        *
    FROM 
        director`;
  const getDirectorArray = await dataBase.all(getDirectorsQuery);
  response.send(getDirectorArray);
});

//7.list of all movie names directed

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorsQuery = `
    SELECT 
        movie_name
    FROM
        movie
    WHERE
        director_id = ${directorId}`;
  const getDirectedMovies = await dataBase.all(directorsQuery);
  response.send(getDirectedMovies);
});

module.exports = app;
