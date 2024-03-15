export function traverseDOM(element: Element | ChildNode, callback: any) {
    // Call the callback function for the current element
    callback(element);

    // Traverse child nodes recursively
    const children = element.childNodes;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // Recursively call traverseDOM for child elements
        if (child.nodeType === Node.ELEMENT_NODE) {
            traverseDOM(child, callback);
        }
    }
}