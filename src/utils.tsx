// Return a shuffled copy of the array that is passed in.
export function shuffle<T>(unshuffled: Array<T>): Array<T> {
  let array = unshuffled.slice(0);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generateID(idCharacters, idLength): string {
  let id = "";
  while (id.length < idLength) {
    id += idCharacters[Math.floor(Math.random() * idCharacters.length)];
  }
  return id;
}

export function unexpected(x: never): never {
  throw new Error("Unexpected object: " + x);
}

const ROOM_ID_CHARACTERS = "abcdefghijklmnopqrstuvwxyz0123456789";
const ROOM_ID_LENGTH = 4;

export var generateRoomID = () =>
  generateID(ROOM_ID_CHARACTERS, ROOM_ID_LENGTH);

const REMOTE_ID_LENGTH = 10;
export var generatePlayerID = () =>
  generateID(ROOM_ID_CHARACTERS, REMOTE_ID_LENGTH);
