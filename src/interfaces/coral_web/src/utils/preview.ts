/**
 * Adds an onError event to all img elements in the html string
 * @param html
 * @returns
 */
const addOnErrorToImg = (html: string) => {
  const regex = /<img([\s\S]+?)>/g;
  const imgElements = html.match(regex);
  if (imgElements) {
    for (let i = 0; i < imgElements.length; i++) {
      const imgElement = imgElements[i];
      const newImgElement = imgElement.replace('>', ' onError="onImageError(this)">');
      html = html.replace(imgElement, newImgElement);
    }
  }
  html = html + GET_IMAGE_DEF;
  return html;
};

const GET_IMAGE_DEF = `
<script>
  function onImageError(element) {
    element.src = 'https://picsum.photos/' + element.width + '/' + element.height;
    element.onerror = null;
  }
</script>
`;

/**
 * Reconstructs the html from the plain string
 * @param rawHTML
 * @returns
 */
const getReconstructedHtml = (rawHTML: string) => {
  const htmlRegex = /```(?:html)\n([\s\S]*?)(```|$)/;
  const code = rawHTML.match(htmlRegex);
  let html = '';
  if (code) {
    html = code[1];
    const cssRegex = /```(?:css)\n([\s\S]*?)```/;
    const cssCode = rawHTML.match(cssRegex);
    let css = '';
    if (cssCode) {
      css = cssCode[1];
      html = `<style>${css}</style>` + html;
    }

    const jsRegex = /```(?:js)\n([\s\S]*?)```/;
    const jsCode = rawHTML.match(jsRegex);
    let js = '';

    if (jsCode) {
      js = jsCode[1];
      html = html + `<script>${js}</script>`;
    }
  }
  return html;
};

export const replaceCodeBlockWithIframe = (content: string) => {
  const matchingRegex = /```html([\s\S]+)/;
  const replacingRegex = /```html([\s\S]+?)(```|$)/;

  const match = content.match(matchingRegex);

  if (!match) {
    return content;
  }

  const html = addOnErrorToImg(getReconstructedHtml(content));

  const blob = new Blob([html], { type: 'text/html' });
  const src = URL.createObjectURL(blob);
  const iframe = `<iframe data-src="${src}"></iframe>`;

  content = content.replace(replacingRegex, iframe);

  return content;
};
