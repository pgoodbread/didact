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

function createDomNode(fiber) {
  const domNode =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);
  // element.props.children.forEach((child) => render(child, domNode));

  // apply all props that are not children to domNode
  const isNotChildren = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isNotChildren)
    .forEach((prop) => (domNode[prop] = fiber.props[prop]));

  // container.appendChild(domNode);
  return domNode;
}

function render(element, container) {
  // this is a fiber
  nextUnitOfWork = {
    domNode: container,
    props: {
      children: [element],
    },
  };
}

let nextUnitOfWork = null;

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    shouldYield = deadline.timeRemaining() < 1;
    requestIdleCallback(workLoop);
  }
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  // add dom node
  if (!fiber.domNode) {
    fiber.domNode = createDomNode(fiber);
  }

  if (fiber.parent) {
    fiber.parent.domNode.appendChild(fiber.domNode);
  }

  // create new fibers for children
  const children = fiber.props.children;
  let index = 0;
  // tracks the previous sibling fiber
  let prevSibling = null;

  while (index < children.length) {
    const childElement = children[index];

    const newFiber = {
      type: childElement.type,
      props: childElement.props,
      parent: fiber,
      domNode: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    // move pointer to next fiber
    prevSibling = newFiber;
    index++;
  }

  // return next unit of work
  if (fiber.child) {
    return fiber.child;
  }
  let currentFiber = fiber;
  while (currentFiber) {
    if (currentFiber.sibling) return currentFiber.sibling;
    currentFiber = currentFiber.parent;
  }
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
