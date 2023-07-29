// ------ GLOBAL CODE ------
const Didact = {
  createElement,
};

// children is always an array
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        typeof child == "object" ? child : createTextElement(child);
      }),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    // props to treat all elements the same
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

/** @jsx Didact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);
const container = document.getElementById("root");
ReactDOM.render(element, container);
