import ViewController from './ViewController';
import setSticky from './utils/setSticky';
import debounce from './utils/debounce';
import assert from 'fl-assert';

export default class CalendarContainer extends ViewController {
  constructor(modulePrefix) {
    super(modulePrefix);
    Object.preventExtensions(this);

    this.acceptEvents('scrollEndBottom', 'scrollEndTop');
  }

  set(name, instance) {
    assert(this.html[name], `Trying to set invalid property: ${name}`);
    this.html[name].parentNode.replaceChild(instance.html.container, this.html[name]);
    this.html[name] = instance.html.container;
    if (name === 'labelsBar') {
      setSticky('left', this.html[name], this.html.panelWrapper);
      const header = instance.getHeader();
      setSticky('top', header, this.html.panelWrapper);
    } else if (name === 'datesPanel') {
      const dateBar = instance.getDateBar();
      const dateBarContainer = dateBar.getContainer();
      setSticky('top', dateBarContainer, this.html.panelWrapper);
    }
  }

  buildHtml() {
    this.html.controlBar = document.createElement('div');
    this.html.container.appendChild(this.html.controlBar);

    this.html.panelWrapper = document.createElement('div');
    this.html.panelWrapper.classList.add(`${this.cssPrefix}-panelWrapper`);

    let lastScrollVal = 0;
    const scrollCheck = debounce(250, () => {
      const panel = this.html.panelWrapper;
      const scrolledToTheEnd = panel.clientHeight + panel.scrollTop === panel.scrollHeight;
      const scrolletToTheTop = panel.scrollTop === 0;
      const movedInYAxis = panel.scrollTop !== lastScrollVal;

      if (movedInYAxis) {
        if (scrolledToTheEnd) {
          this.trigger('scrollEndBottom');
        } else if (scrolletToTheTop) {
          this.trigger('scrollEndTop');
        }
      }
      lastScrollVal = panel.scrollTop;
    });
    this.html.panelWrapper.addEventListener('scroll', scrollCheck);
    this.html.container.appendChild(this.html.panelWrapper);

    this.html.labelsBar = document.createElement('div');
    this.html.panelWrapper.appendChild(this.html.labelsBar);

    this.html.datesPanel = document.createElement('div');
    this.html.panelWrapper.appendChild(this.html.datesPanel);
  }

  getScrollContainer() {
    return this.html.panelWrapper;
  }
}
