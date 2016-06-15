export default function holdButton(fn) {
  let functionSchedule;
  function doFunction(f) {
    f();
    functionSchedule = requestAnimationFrame(() => {
      doFunction(f);
    });
  }

  doFunction(fn);
  const docMouseUp = document.addEventListener('mouseup', () => {
    cancelAnimationFrame(functionSchedule);
    document.removeEventListener('mouseup', docMouseUp);
  });
}
