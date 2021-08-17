import TimingBelt from "parsegraph-timingbelt";
import GraphicsWindow from "parsegraph-window";
import AlphaGLWidget from "./GLWidget";
import WeetCubeWidget from "./WeetCubeWidget";

export function startAlpha() {
  const belt = new TimingBelt();
    const window = new GraphicsWindow();
    document.body.appendChild(window.container());
    belt.addWindow(window);
    const widget = new AlphaGLWidget(belt, window);
    window.addComponent(widget);
}

export function startWeetcubes() {
  const belt = new TimingBelt();
    const window = new GraphicsWindow();
    document.body.appendChild(window.container());
    belt.addWindow(window);
    const widget = new WeetCubeWidget(belt, window);
    window.addComponent(widget);
}
