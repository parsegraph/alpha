const AlphaSkinTests = new TestSuite("alpha_Skin");

AlphaSkinTests.addTest("alpha_Skin.<constructor>", function (resultDom) {
  const green = new AlphaColor(0, 1, 0);
  const brown = new AlphaColor(0.5, 0.5, 0);
  const skin = new AlphaSkin([
    [green, green, green, green], // color 1 has 4 vertices
    [brown, brown, brown, brown], // color 2
    [brown, brown, brown, brown], // color 3
  ]);
});

AlphaSkinTests.addTest("alpha_Skin.forEach", function (resultDom) {
  const green = new AlphaColor(0, 1, 0);
  const brown = new AlphaColor(0.5, 0.5, 0);
  const skin = new AlphaSkin([
    [green, green, green, green], // color 1 has 4 vertices
    [brown, brown, brown, brown], // color 2
    [brown, brown, brown, brown], // color 3
  ]);

  let maxRow = 0;
  skin.forEach(function (color, i) {
    maxRow = Math.max(maxRow, i);
    switch (i) {
      case 0:
        if (
          !color[0].equals(green) ||
          !color[1].equals(green) ||
          !color[2].equals(green) ||
          !color[3].equals(green)
        ) {
          console.log(color);
          throw new Error("Face 0 does not match");
        }
        break;
      case 1:
        if (
          !color[0].equals(brown) ||
          !color[1].equals(brown) ||
          !color[2].equals(brown) ||
          !color[3].equals(brown)
        ) {
          console.log(color);
          throw new Error("Face 1 does not match");
        }
        break;
      case 2:
        if (
          !color[0].equals(brown) ||
          !color[1].equals(brown) ||
          !color[2].equals(brown) ||
          !color[3].equals(brown)
        ) {
          console.log(color);
          throw new Error("Face 2 does not match");
        }
        break;
    }
  });

  if (maxRow != 2) {
    return "Unexpected number of rows iterated: " + maxRow;
  }
});

