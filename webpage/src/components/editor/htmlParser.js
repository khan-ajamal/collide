export const parseHTML = (html, text) => {
    const doc = document.implementation.createHTMLDocument("foo");
    doc.documentElement.innerHTML = html;
    const root = doc.getElementsByTagName("body")[0];

    const childNodes = root.childNodes

    const entityMap = []
    for (let i = 0; i < childNodes.length; i++) {
        const node = childNodes[i];

        if(node.classList && node.classList.contains("token")) {
            for(let j = 0; j < node.textContent.length; j++) {
                const start = text.indexOf(node.textContent)
                const end = start + node.textContent.length;
                entityMap.push({
                    start,
                    end,
                    classList: node.classList
                })
            }
        }
    }
    return entityMap
}
