var assert = require("assert");
import todo from "../dist/alpha";

describe("Package", function () {
  it("works", ()=>{
    assert.equal(todo(), 42);
  });
});
