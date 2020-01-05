const synth = window.speechSynthesis;

export function narrate(text: string): Promise<void> {
  if (!synth) return Promise.resolve();

  return new Promise((resolve, reject) => {
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.onend = () => resolve();

    synth.speak(utterance);
  });
}
