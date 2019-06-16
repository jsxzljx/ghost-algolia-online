// The cleaned up html only contains headings and text nodes (#text).
// All nodes whose name start with 'h' are necessarily headings.
export const isHeading = node => node.nodeName.startsWith('h');
export const getHeadingLevel = nodeName => nodeName.charAt(1);
export const getHeadingID = node => node.attrs[0].value;
export const splitContent = str => {
    var bytesCount = 0;
    var res = new Array();
    for (let i = 0, p = 0; i < str.length; i++) {
        let c = str.charAt(i);
        if (/^[\u0000-\u00ff]$/.test(c)) {
            bytesCount += 1;
        }
        else {
            bytesCount += 2;
        }
        if (bytesCount > 5000 || i == (str.length - 1)) {
            res.push(str.slice(p, i + 1) + "\n");
            p = i + 1;
            bytesCount = 0;
        }
    }
    return res;
}
