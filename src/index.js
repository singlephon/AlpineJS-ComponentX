export default function (Alpine) {
  class Component extends HTMLElement {
    connectedCallback() {
      let shadow = this.attachShadow({ mode: "open" });
      if (this.attributes.template) {
        let template = document.getElementById(this.attributes.template.value)
        let component = new DOMParser().parseFromString(template.innerHTML, "text/html").body.firstChild;
        shadow.appendChild(component)
        document.addEventListener("alpine:initialized", () => Alpine.initTree(shadow));
      }
      else if(this.attributes.url) this.attributes.url && fetch(this.attributes.url.value).then((e) => e.text()).then((e) => {
        let component = new DOMParser().parseFromString(e, "text/html").body.firstChild;
        shadow.appendChild(component)
        Alpine.initTree(shadow);
      });
      else fetch(this.tagName.toLowerCase().replace("a-", "").replace(/-/g, "/")).then((e) => e.text()).then((e) => {
          let component = new DOMParser().parseFromString(e, "text/html").body.firstChild;
          shadow.appendChild(component)
          Alpine.initTree(shadow);
        });
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      const stylesheetHrefs = stylesheets.map(stylesheet => stylesheet.href);
      for(let link of stylesheetHrefs) {
        this.shadowRoot.innerHTML += `<link rel="stylesheet" href="${link}" />`
      }
    }
  }

  let result = document.evaluate( "//*[starts-with(name(),'a-')]", document, null, XPathResult.ANY_TYPE, null );
  let nodes = [];
  let anode = null;

  while( (anode = result.iterateNext()) ){
    nodes.push( anode.nodeName.toLowerCase() );
  }

  for (let item of nodes) {
    let copy = class extends Component {}
    if (window.customElements.get(copy)) return
    customElements.define(item, copy)
  }

  if (window.customElements.get('a-include')) return
  customElements.define('a-include', Component)
}
