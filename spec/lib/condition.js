(function() {
  var simple_ifcondition_template, simple_unlesscondition_template;
  simple_ifcondition_template = '{{#boundIf "@check"}}{{bind "@attribute_1"}}{{else}}{{bind "@attribute_2"}}{{/boundIf}}';
  simple_unlesscondition_template = '{{#boundUnless "@check"}}{{bind "@attribute_1"}}{{else}}{{bind "@attribute_2"}}{{/boundUnless}}';
  describe("boundIf", function() {
    beforeEach(function() {
      var t;
      t = Handlebars.compile(simple_ifcondition_template);
      this.model = new TestModel({
        check: true
      });
      return setFixtures(t({
        model: this.model
      }));
    });
    it("renders attribute_1 if check is true", function() {
      expect($("span[data-bvid]").length).toEqual(2);
      return expect($("span > span[data-bvid]")).toHaveText(this.model.get("attribute_1"));
    });
    return it("renders else if check is false", function() {
      this.model.set({
        check: false
      });
      expect($("span[data-bvid]").length).toEqual(2);
      return expect($("span > span[data-bvid]")).toHaveText(this.model.get("attribute_2"));
    });
  });
  describe("boundUnless", function() {
    beforeEach(function() {
      var t;
      t = Handlebars.compile(simple_unlesscondition_template);
      this.model = new TestModel({
        check: false
      });
      return setFixtures(t({
        model: this.model
      }));
    });
    it("renders attribute_1 if check is false", function() {
      expect($("span[data-bvid]").length).toEqual(2);
      return expect($("span > span[data-bvid]")).toHaveText(this.model.get("attribute_1"));
    });
    return it("renders else if check is true", function() {
      this.model.set({
        check: true
      });
      expect($("span[data-bvid]").length).toEqual(2);
      return expect($("span > span[data-bvid]")).toHaveText(this.model.get("attribute_2"));
    });
  });
}).call(this);
