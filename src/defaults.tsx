import { choose } from "./utils";

export const CHARACTERS = [
  "Shrek",
  "Elon Musk",
  "Donald Trump",
  "Barack Obama",
  "Mario",
  "Mark Zuckerberg",
  "Sonic the Hedgehog",
  "Darth Vader",
  "Pickle Rick",
  "Pikachu",
  "General Kenobi",
  "Epic Sax Guy",
  "Doggo",
  "Keyboard Cat",
  "Hide the Pain Harold",
  "Barry B. Benson",
  "an Internet Troll"
];

export const LOCATIONS = [
  "a Wendy's",
  "America",
  "San Francisco",
  "Reddit",
  "The Internet",
  "Twitter",
  "Facebook",
  "The Comment's Section",
  "Netflix"
];

export const THINGS = [
  "Unicorn Startup",
  "San Francisco Studio Apartment",
  "Free Real Estate",
  "McDonald's Mulan Szechuan Sauce",
  "The Funniest GIF",
  "Repost",
  "Original Content"
];

export const QUOTES = [
  "I don't like sand. It's coarse and rough and irritating and it gets everywhere.",
  "You mean the chaos emeralds?",
  "Donkeh!",
  "Fake News!",
  "It's free real estate!",
  "Hello there."
];

export const ACTIONS = [
  "fires off a 3AM tweetstorm",
  "does a backflip",
  "asks to see the manager",
  "writes an angry YouTube comment",
  "asks if ya like jazz"
];

export const GIFS = [
  "https://media1.giphy.com/media/de9SDw6PGRsubN1o3X/200w.gif?cid=0adaf0bdd46aa782e0e7d2f1066c630b7a09e83a218aa8b0&rid=200w.gif",
  "https://media3.giphy.com/media/1hqYk0leUMddBBkAM7/200w.gif?cid=0adaf0bdd46aa782e0e7d2f1066c630b7a09e83a218aa8b0&rid=200w.gif",
  "https://media1.giphy.com/media/de9SDw6PGRsubN1o3X/200w.gif?cid=0adaf0bdd46aa782e0e7d2f1066c630b7a09e83a218aa8b0&rid=200w.gif"
];

export const DESCRIPTIONS = ["is full of cats", "is full of tourists"];

export function randomCharacter() {
  return choose(CHARACTERS);
}

export function randomLocation() {
  return choose(LOCATIONS);
}

export function randomThing() {
  return choose(THINGS);
}

export function randomQuote() {
  return choose(QUOTES);
}

export function randomAction() {
  return choose(ACTIONS);
}

export function randomDescription() {
  return choose(DESCRIPTIONS);
}

export function randomGIF() {
  return choose(GIFS);
}
