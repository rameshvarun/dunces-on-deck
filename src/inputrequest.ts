type InputRequest = {
  title: string;
  fields: Array<InputField>;
};

type InputField = TextInput | ParagraphInput;

type TextInput = {
  kind: "text";
};

type ParagraphInput = {
  kind: "paragraph";
};
