const alphaColorTests = new TestSuite("AlphaColor");

alphaColorTests.addTest("alpha_Color.<constructor>", function (resultDom) {
  let v = new AlphaColor(0.1, 0.2, 0.3);
  if (v[0] != 0.1 || v[1] != 0.2 || v[2] != 0.3) {
    resultDom.appendChild(document.createTextNode(v));
    return "Constructor must accept arguments.";
  }

  v = new AlphaColor();
  if (v[0] != 0 || v[1] != 0 || v[2] != 0) {
    resultDom.appendChild(document.createTextNode(v));
    return "Constructor must allow zero-arguments.";
  }
});

alphaColorTests.addTest("alpha_Color.set", function () {
  const v = new AlphaColor(1);
  v.set(0.2);
  if (!v.equals(new AlphaColor(0.2, 0.2, 0.2))) {
    console.log(v);
    return "set must allow single arguments.";
  }

  v.set(0.2, 0.3, 0.4);
  if (!v.equals(new AlphaColor(0.2, 0.3, 0.4))) {
    console.log(v);
    return "set must allow multiple arguments.";
  }

  v.set(new AlphaColor(0.2, 0.3, 0.4));
  if (!v.equals(new AlphaColor(0.2, 0.3, 0.4))) {
    console.log(v);
    return "set must allow alpha_Colors as arguments.";
  }
});

alphaColorTests.addTest("alpha_Color.Equals", function () {
  const v = new AlphaColor(1);
  v.set(0.2);
  if (!v.equals(0.2)) {
    console.log(v);
    return "Equals must accept a single numeric argument.";
  }

  v.set(0.2, 0.3, 0.4);
  if (!v.equals(0.2, 0.3, 0.4)) {
    console.log(v);
    return "Equals must accept mulitple arguments.";
  }

  v.set(new AlphaColor(0.2, 0.3, 0.4));
  if (!v.equals(new AlphaColor(0.2, 0.3, 0.4))) {
    console.log(v);
    return "Equals accepts single alpha_Color arguments.";
  }
});
