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
  "Internet Troll",
  "Big Chungus"
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
  "Perfect Looping GIF",
  "Content that isn't a Repost"
];

export const QUOTES = [
  "I don't like sand. It's coarse and rough and irritating and it gets everywhere.",
  "You mean the chaos emeralds?",
  "Donkeh!",
  "Fake News!",
  "It's free real estate!",
  "Hello there.",
  "Has anyone really been far even as decided to use even go want to do look more like?",
  "They don't think it be like it is, but it do."
];

export const ACTIONS = [
  "fires off a 3AM tweetstorm",
  "does a backflip",
  "asks to see the manager",
  "writes an angry YouTube comment",
  "asks if ya like jazz",
  "writes a fanfiction"
];

export const GIFS = [
  "https://media3.giphy.com/media/2Y8Iq3xe121Ba3hUAM/200w.gif?cid=0adaf0bdfd2eb7973b7ec6a763a13bfd1478800ececa9014&rid=200w.gif",
  "https://media0.giphy.com/media/cPNXOm7ln8HwK7UcbV/200w.gif?cid=0adaf0bd90e10412374b41727bae515caf8fcb9454d8da41&rid=200w.gif",
  "https://media2.giphy.com/media/Qjmp5vKEERPyw/200w.gif?cid=0adaf0bdb5dff1ffe4f95515253e001c30129a05056c1878&rid=200w.gif",
  "https://media0.giphy.com/media/yXVO50FJIJMSQ/200w.gif?cid=0adaf0bd9cf06211e2b56d7df471c5c4a32318a1d980ab6e&rid=200w.gif",
  "https://media2.giphy.com/media/3o7qDEq2bMbcbPRQ2c/200w.gif?cid=0adaf0bd5ffe5e00419cc25bcc788edd3cad6be2d1ca30fc&rid=200w.gif"
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
