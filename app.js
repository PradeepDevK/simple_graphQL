"use strict";

const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { graphql, buildSchema, GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLNonNull } = require("graphql");

const { singers, songs } = require("./data");


const app = express()
const port = 5000;

// const schema = new buildSchema(`
//   type Query {
//     hello: String
//   }
// `);
 
// const rootValue = { hello: () => "Hello world!" };

// app.use("/graphql", graphqlHTTP({
//     schema: schema,
//     rootValue: rootValue,
//     graphiql: true
// }));

const SongType = new GraphQLObjectType({
  name: "Song",
  description: "This represents a song written by an author",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    singerId: { type: new GraphQLNonNull(GraphQLInt) },
    singer: {
      type: SingerType,
      resolve: (song) => {
        return singers.find(singer => singer.id == song.singerId)
      }
    }
  })
});

const SingerType = new GraphQLObjectType({
  name: "Singer",
  description: "This represents an singer of a song",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    songs: {
      type: new GraphQLList(SongType),
      resolve: (singer) => {
      return songs.filter(song => song.singerId == singer.id)
      }
    }
  })
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    song: {
      type: SongType,
      description: "A single song",
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parents, args) => songs.find(song => song.id === args.id)
    },
    songs: {
      type: new GraphQLList(SongType),
      description: "List of Songs",
      resolve: () => songs
    },
    singers: {
      type: new GraphQLList(SingerType),
      description: "List of all Singers",
      resolve: () => singers
    },
    singer: {
      type: SingerType,
      description: "A single author",
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parents, args) => singers.find(singer => singer.id === args.id)
    }
  })
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addSong: {
      type: SongType,
      description: "Add a song",
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        singerId: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const song = {
          id: songs.length + 1,
          name: args.name,
          singerId: args.singerId
        }
        songs.push(song)
        return song
      }
    },
    addSinger: {
      type: SingerType,
      description: "Add an singer",
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const singer = {
          id: singers.length + 1,
          name: args.name,
        }
        singers.push(singer)
        return singer
      }
    }
  })
});


const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use("/graphql", graphqlHTTP({
    schema: schema,
    graphiql: true
}));

app.listen(port? port: 5050, () => console.log("Server is listening on Port:", port));
