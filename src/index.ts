import TimingBelt from "parsegraph-timingbelt";
import GraphicsWindow from "parsegraph-window";
import AlphaGLWidget from "./GLWidget";

export default function start() {
  const belt = new TimingBelt();
    const window = new GraphicsWindow();
    document.body.appendChild(window.container());
    belt.addWindow(window);
    const widget = new AlphaGLWidget(belt, window);
    window.addComponent(widget);
}
