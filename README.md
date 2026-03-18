# HTML Processor

htmlProcessor is a lightweight, standalone JavaScript library designed for server side or local environment HTML processing. In a local script, you don't have access to the DOM, making it ideal for Node.js automation, CLI tools, and local file analysis.

## Prerequisites

- Node.js

## Installation and usage

Clone the `htmlProcessor.min.js` file from this repository.

### Usage example

```javascript
const { parseHtml, serializeHtml } = require("./htmlProcessor.min.js");

const htmlInput = `
    <div id="app">
        <span class="myEl">I like coffee.</span>
    </div>
`;

// Parse a raw string into a structured tree
const doc = parseHtml(htmlInput);

// Select a specific element
const el = doc.querySelector(".myEl");
console.log(el.getContent); // Output: "I like coffee."

// Update the element node
el.attributesObj["data-value"] = "Hello world !";

// Output back a raw html string
const updatedHtml = serializeHtml(doc);
```

## The parser (`parseHtml`)

The `parseHtml` function performs a linear scan of the HTML string to tokenize and organize elements.

- **Void tag management:** Automatically handles self-closing tags (e.g. `<img>`, `<br>`) to maintain tree integrity.
- **Auto rooting:** Wraps content in a `<root>` tag to ensure a consistent entry point.

## Serialization (`serializeHtml`)

`serializeHtml` converts the tree back into a clean HTML string, including modified attributes.

## The `htmlElNode` class

This class represents a pseudo html element as a minimalist DOM element.

### Properties

- **`tag`**: The tag name (e.g. `div`). Set to `null` for text only nodes.

    The parser distinguishes between two types of nodes to ensure precise manipulation:

    - **Element Nodes (`tag !== null`)**: These represent HTML tags. They hold attributes and children but do not hold "raw text" directly. Their text content is derived from their children.

    - **Text Nodes (`tag === null`)**: These are the "leaves" of the tree. They represent the actual raw text between tags. They have no children and no attributes.

    > [!NOTE]
    > This structure allows you to safely target and modify text content (e.g. for translation) without accidentally breaking the HTML tag attributes or structure.

- **`attributesObj`**: Object containing all HTML attributes (id, class, etc.).
- **`childrenArray`**: Array of child nodes.
- **`parentElNode`**: Reference to the parent node.
- **`content`**: The raw text value (only if `tag` is `null`).

### Getters

- **`getContent`**: Recursively extracts and concatenates all text from the node and its descendants. Useful for extracting translatable strings without HTML noise.

## Selectors

The integration of `querySelector` and `querySelectorAll` allows you to access your tree as if you were in a browser console.

### `querySelector(selector)`

Returns the first element that matches the CSS selector.

### `querySelectorAll(selector)`

Returns an array of all elements matching the selector.

### Supported syntax

| Selector Type | Syntax | Description |
| ------------- | ------ | ----------- |
| **Tag** | `div` | Matches all elements with the given tag name. |
| **ID** | `#main` | Matches the element with the specific id. |
| **Class** | `.btn` | Matches elements containing the specified class. |
| **Attribute** | `[data-tr]` | Matches elements that have the specified attribute. |
| **Attr Value** | `[type="text"]` | Matches elements where the attribute exactly equals the value. |
| **Descendant** | `nav a` | Matches `<a>` tags inside a `<nav>` tag. |