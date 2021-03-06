import { Page } from '../book';
import { prefixer, div, ElementWrapper } from '../dom';
import padPages from './padPages';

const renderFlipbookViewer = (bookPages: ElementWrapper[], doubleSided: boolean) => {
  const pages = padPages(bookPages, () => new Page());

  const flipLayout = document.createDocumentFragment();
  const sizer = div('.flipbook-sizer');
  const flapHolder = div('.spread-size.flap-holder');
  sizer.append(flapHolder);
  flipLayout.append(sizer);

  const flaps: HTMLElement[] = [];

  let currentLeaf = -1;

  let leftOffset = 4;
  if (pages.length * leftOffset > 60) {
    leftOffset = 60 / pages.length;
  }
  flapHolder.style.width = `${pages.length * leftOffset}px`;

  const setLeaf = (unclamped: number) => {
    let n = unclamped;
    if (n === currentLeaf) n += 1;
    const newLeaf = Math.min(Math.max(0, n), flaps.length);

    let zScale = 4;
    if (flaps.length * zScale > 200) zScale = 200 / flaps.length;

    flaps.forEach((flap, i, arr) => {
      // + 0.5 so left and right are even
      const z = (arr.length - Math.abs(i - newLeaf + 0.5)) * zScale;
      flap.style.transform = `translate3d(${
        i < newLeaf ? 4 : 0
      }px,0,${z}px) rotateY(${i < newLeaf ? -180 : 0}deg)`;
    });

    currentLeaf = newLeaf;
  };

  let leafIndex = 0;
  for (let i = 1; i < pages.length - 1; i += doubleSided ? 2 : 1) {
    leafIndex += 1;
    const li = leafIndex;
    const flap = div('.page3d');

    flap.addEventListener('click', () => {
      const newLeaf = li - 1;
      setLeaf(newLeaf);
    });

    const rightPage = pages[i].element;
    let leftPage;
    rightPage.classList.add(prefixer('page3d-front'));
    flap.append(rightPage);
    if (doubleSided) {
      flap.classList.add(prefixer('doubleSided'));
      leftPage = pages[i + 1].element;
    } else {
      leftPage = div('.page');
    }
    leftPage.classList.add(prefixer('page3d-back'));
    flap.append(leftPage);

    // TODO: Virtualize stack of pages.
    // Putting 1000s of elements onscreen,
    // espacially as 3d layers, locks up the browser.

    flap.style.left = `${i * leftOffset}px`;

    flaps.push(flap);
    flapHolder.append(flap);
  }

  setLeaf(0);
  return {
    element: flipLayout,
    contentSizer: sizer,
    next: () => setLeaf(currentLeaf + 1),
    previous: () => setLeaf(currentLeaf - 1),
  }
};

export { renderFlipbookViewer };
