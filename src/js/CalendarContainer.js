import ViewController from './ViewController';
import debounce from './utils/debounce';
import assert from 'fl-assert';

const scrollSync = ['datesPanel', 'labelsBar'];

export default class CalendarContainer extends ViewController {
  constructor(modulePrefix) {
    super(modulePrefix);
    this.acceptEvents('scrollEndBottom', 'scrollEndTop');
  }

  set(name, instance) {
    assert(this.html[name], `Trying to set invalid property: ${name}`);
    this.html[name].parentNode.replaceChild(instance.html.container, this.html[name]);
    this.html[name] = instance.html.container;
    this[name] = instance;

    // if this has all properties in scrollSync array
    if (scrollSync.reduce((outcome, prop) => !!(outcome && this[prop]), true)) {
      this.synchroniseScrolls();
    }
  }

  buildHtml() {
    this.html.controlBar = document.createElement('div');
    this.html.container.appendChild(this.html.controlBar);

    this.html.panelWrapper = document.createElement('div');
    this.html.panelWrapper.classList.add(`${this.cssPrefix}-panelWrapper`);
    this.html.container.appendChild(this.html.panelWrapper);

    this.html.labelsBar = document.createElement('div');
    this.html.panelWrapper.appendChild(this.html.labelsBar);

    this.html.datesPanel = document.createElement('div');
    this.html.panelWrapper.appendChild(this.html.datesPanel);
  }

  getScrollContainer() {
    return this.html.panelWrapper;
  }

  synchroniseScrolls() {
    const subjectsContainer = this.datesPanel.getSubectsContainer();
    const dateBar = this.datesPanel.getDateBarContainer();
    const labelsContainer = this.labelsBar.getLabelsContainer();

    subjectsContainer.addEventListener('scroll', () => {
      const topScroll = subjectsContainer.scrollTop;
      const leftScroll = subjectsContainer.scrollLeft;
      labelsContainer.scrollTop = topScroll;
      dateBar.scrollLeft = leftScroll;
    });


    let lastScrollVal = 0;
    const scrollCheck = debounce(250, () => {
      const panel = subjectsContainer;
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
    subjectsContainer.addEventListener('scroll', scrollCheck);
  }
}
