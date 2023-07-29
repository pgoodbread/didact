// children is always an array
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
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

function render(element, container) {
  const domNode =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);
  element.props.children.forEach((child) => render(child, domNode));

  // apply all props that are not children to domNode
  const isNotChildren = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isNotChildren)
    .forEach((prop) => (domNode[prop] = element.props[prop]));

  container.appendChild(domNode);
}

const Didact = {
  createElement,
  render,
};

/** @jsx Didact.createElement */
const element = (
  <div style="background: salmon">
    <h1>Hello Philip</h1>
    <h2 style="text-align:right">from Didact</h2>
  </div>
);
const container = document.getElementById("root");
Didact.render(element, container);
