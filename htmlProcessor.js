const voidTagsSet = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
]);

function matchSelector(htmlElNode, selector) {
    if (htmlElNode === null || htmlElNode.tag === null) {
        return false;
    };

    const tagMatchArray = selector.match(/^[a-zA-Z][\w-]*/);

    if (tagMatchArray !== null) {
        if (htmlElNode.tag !== tagMatchArray[0]) {
            return false;
        };
    };

    const idMatchArray = selector.match(/#([\w-]+)/);

    if (idMatchArray !== null) {
        if (htmlElNode.attributesObj.id !== idMatchArray[1]) {
            return false;
        };
    };

    const classMatchesArray = selector.matchAll(/\.([\w-]+)/g);

    const nodeClasses = (htmlElNode.attributesObj.class ?? "").split(/\s+/);

    for (const match of classMatchesArray) {
        if (nodeClasses.includes(match[1]) === false) {
            return false;
        };
    };

    const attributeMatchesArray = selector.matchAll(/\[([\w-]+)(?:=['"]?(.*?)['"]?)?\]/g);

    for (const match of attributeMatchesArray) {
        const attributeName = match[1];
        const attributeValue = match[2];

        if ((attributeName in htmlElNode.attributesObj) === false) {
            return false;
        };

        if (attributeValue && htmlElNode.attributesObj[attributeName] !== attributeValue) {
            return false;
        };
    };

    return true;
};

class htmlElNode {
    constructor(tag, attributesObj = {}, parentElNode = null) {
        this.tag = tag;
        this.attributesObj = attributesObj;
        this.parentElNode = parentElNode;
        this.childrenArray = [];
        this.content = "";
    };

    querySelector(selector) {
        return this.querySelectorAll(selector)[0] ?? null;
    };

    querySelectorAll(selector) {
        const tokens = selector.trim().split(/\s+/);

        const resultsArray = [];

        const stackArray = [this];

        while (stackArray.length > 0) {
            const htmlElNode = stackArray.pop();

            let currentHtmlElNode = htmlElNode;
            let index = tokens.length - 1;

            if (matchSelector(currentHtmlElNode, tokens[index]) !== false) {
                while (--index >= 0) {
                    let ancestorHtmlElNode = currentHtmlElNode.parentElNode;

                    while (ancestorHtmlElNode && matchSelector(ancestorHtmlElNode, tokens[index]) === false) {
                        ancestorHtmlElNode = ancestorHtmlElNode.parentElNode;
                    };

                    if (ancestorHtmlElNode === null) {
                        currentHtmlElNode = null;

                        break;
                    };

                    currentHtmlElNode = ancestorHtmlElNode;
                };

                if (currentHtmlElNode !== null) {
                    resultsArray.push(htmlElNode);
                };
            };

            for (let i = htmlElNode.childrenArray.length - 1; i >= 0; i -= 1) {
                stackArray.push(htmlElNode.childrenArray[i]);
            };
        };

        return resultsArray;
    };

    get getContent() {
        if (this.tag === null) {
            return this.content;
        };
    
        return this.childrenArray.map(childHtmlElNode => childHtmlElNode.getContent).join("");
    };
};

function parseHtml(html) {
    const root = new htmlElNode("root");
    let currentHtmlElNode = root;

    const tokenRegex = /<\/?[^>]+>|[^<]+/g;
    const attributesRegex = /([\w:-]+)(?:="([^"]*)")?/g;

    let match;

    while ((match = tokenRegex.exec(html))) {
        const token = match[0];

        if (token.startsWith("</") === true) {
            currentHtmlElNode = currentHtmlElNode.parentElNode ?? currentHtmlElNode;

            continue;
        };

        if (token.startsWith("<") === true) {
            const matchArray = token.match(/^<([\w-]+)([^>]*)>/);

            if (matchArray === null) {
                continue;
            };

            const tag = matchArray[1];

            const attributesObj = {};

            attributesRegex.lastIndex = 0;

            let attibutesArray;

            while ((attibutesArray = attributesRegex.exec(matchArray[2]))) {
                attributesObj[attibutesArray[1]] = attibutesArray[2] ?? "";
            };

            const newHtmlElNode = new htmlElNode(tag, attributesObj, currentHtmlElNode);

            currentHtmlElNode.childrenArray.push(newHtmlElNode);

            if (voidTagsSet.has(tag) === false && token.endsWith("/>") === false) {
                currentHtmlElNode = newHtmlElNode;
            };

            continue;
        };

        const text = token;

        if (text === "") {
            continue;
        };

        const newHtmlElNode = new htmlElNode(null, {}, currentHtmlElNode);
        newHtmlElNode.content = text;

        currentHtmlElNode.childrenArray.push(newHtmlElNode);
    };

    return root;
};

function serializeHtml(htmlElNode) {
    if (htmlElNode.tag === null) {
        return htmlElNode.content;
    };

    const attributes = Object.entries(htmlElNode.attributesObj).map(([key, value]) => ` ${key}="${value}"`).join("");

    if (voidTagsSet.has(htmlElNode.tag) === true) {
        return `<${htmlElNode.tag}${attributes}>`;
    };

    const children = htmlElNode.childrenArray.map(serializeHtml).join("");

    return `<${htmlElNode.tag}${attributes}>${children}</${htmlElNode.tag}>`;
};

module.exports = { parseHtml, serializeHtml };