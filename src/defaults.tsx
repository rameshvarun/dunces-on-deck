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
  "Pikachu"
];

export const LOCATIONS = [
  "a Wendy's",
  "America",
  "San Francisco",
  "Reddit",
  "The Internet"
];

export const THINGS = [
  "Unicorn Startup",
  "San Francisco Studio Apartment",
  "Free Real Estate",
  "McDonald's Mulan Szechuan Sauce"
];

export const QUOTES = [
  "I don't like sand. It's coarse and rough and irritating and it gets everywhere.",
  "You mean the chaos emeralds?",
  "Donkeh!",
  "Fake News!",
  "It's free real estate!",
  "Hello there."
];

export const ACTIONS = ["fires off a 3AM tweetstorm"];

export const DESCRIPTIONS = ["is full of cats"];

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
