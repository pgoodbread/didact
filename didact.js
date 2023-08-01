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
      : document.createElement(fiber.type);

  updateDom(domNode, {}, fiber.props);

  return domNode;
}

const isEventListener = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEventListener(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
function updateDom(domNode, prevProps, nextProps) {
  // remove old or changed eventListeners
  Object.keys(prevProps)
    .filter(isEventListener)
    .filter((key) => !(key in nextProps) || isNew(nextProps, prevProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      domNode.removeEventListener(eventType, prevProps[name]);
    });

  // remove old props
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      domNode[name] = "";
    });

  // set new or changed
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew)
    .forEach((name) => {
      domNode[name] = nextProps[name];
    });

  // add new eventListeners
  Object.keys(nextProps)
    .filter(isEventListener)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      domNode.addEventListener(eventType, nextProps[name]);
    });
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;
  const domParent = fiber.parent.domNode;
  if (fiber.effectTag === "PLACEMENT" && fiber.domNode != null) {
    domParent.appendChild(fiber.domNode);
  } else if (fiber.effectTag === "UPDATE" && fiber.domNode != null) {
    updateDom(fiber.domNode, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.domNode);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function render(element, container) {
  // this is the root fiber
  wipRoot = {
    domNode: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  // add dom node
  if (!fiber.domNode) {
    fiber.domNode = createDomNode(fiber);
  }

  // create new fibers for children
  const children = fiber.props.children;
  reconcileChildren(fiber, children);

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

function reconcileChildren(wipFiber, children) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  // tracks the previous sibling fiber
  let prevSibling = null;

  while (index < children.length || oldFiber != null) {
    const childElement = children[index];
    let newFiber = null;

    const sameType =
      oldFiber && childElement && childElement.type == oldFiber.type;

    // update
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: childElement.props,
        parent: wipFiber,
        domNode: oldFiber.domNode,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }

    // add
    if (childElement && !sameType) {
      newFiber = {
        type: childElement.type,
        props: childElement.props,
        parent: wipFiber,
        domNode: null,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }

    // delete
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    // move pointer to next fiber
    prevSibling = newFiber;
    index++;
  }
}

const Didact = {
  createElement,
  render,
};

/** @jsx Didact.createElement */
const container = document.getElementById("root");
const updateValue = (e) => {
  rerender(e.target.value);
};

const rerender = (value) => {
  const element = (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>Hello {value}</h2>
    </div>
  );
  Didact.render(element, container);
};

rerender("World");
