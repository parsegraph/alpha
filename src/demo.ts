import TimingBelt from "parsegraph-timingbelt";
import { BasicProjector } from "parsegraph-projector";
import AlphaGLWidget from "./GLWidget";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("demo");
  root.style.position = "relative";

  const belt = new TimingBelt();
  const proj = new BasicProjector();
  const widget = new AlphaGLWidget(proj);
  widget.setOnScheduleUpdate(() => {
    belt.scheduleUpdate();
  });
  root.appendChild(proj.container());
  belt.addRenderable(widget);
});
