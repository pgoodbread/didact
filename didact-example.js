{
  const element = <h1 title="foo">Hello, world</h1>; // JSX not valid JS
  const container = document.getElementById("root");
  ReactDOM.render(element, container);
}

{
  const element = React.createElement("h1", { title: "foo" }, "Hello, world");
}
{
  const element = {
    type: "h1",
    props: {
      title: "foo",
      children: "Hello, world",
    },
  };
  const container = document.getElementById("root");

  const node = document.createElement(element.type);
  node["title"] = element.props.title;

  const text = document.createTextNode("");
  text["nodeValue"] = element.props.children;
  node.appendChild(text);
  container.appendChild(node);
}
