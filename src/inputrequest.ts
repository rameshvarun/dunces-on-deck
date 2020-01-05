type InputRequest = {
  fields: Array<InputField>;
};

type InputField = TextInput | GIPHYInput;

type TextInput = {
  kind: "text";
  prompt: string;
};

type GIPHYInput = {
  kind: "giphy";
  prompt: string;
};
