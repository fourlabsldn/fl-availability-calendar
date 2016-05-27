export default class ViewController {
  constructor(elementType = 'div') {
    this.html = {};
    this.html.container = document.createElement(elementType);
    this.html.container.controller = this;
  }
}
