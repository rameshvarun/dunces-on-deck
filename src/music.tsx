import { Howl, Howler } from "howler";

export const oceanAmbience = new Howl({
  src: require("./music/ocean.mp3"),
  loop: true,
  volume: 0.3,
});

export const adventurousTheme = new Howl({
  src: require("./music/adventurous.mp3"),
  loop: true,
  volume: 0.3,
});

export const battleTheme = new Howl({
  src: require("./music/battle.mp3"),
  loop: true,
  volume: 0.3,
});

export const victoryTheme = new Howl({
  src: require("./music/victory.mp3"),
  loop: true,
  volume: 0.3,
});




let currentSong: Howl | null = null;
export function switchMusic(music: Howl) {
  if (currentSong) {
    currentSong.stop();
  }
  currentSong = music;
  currentSong.play();
}
