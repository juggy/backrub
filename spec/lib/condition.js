(function() {
  var simple_ifcondition_template, simple_unlesscondition_template;
  simple_ifcondition_template = new Backbone.Backrub('{{#if "@check"}}{{attribute_1}}{{else}}{{attribute_2}}{{/if}}');
  simple_unlesscondition_template = new Backbone.Backrub('{{#unless "@check"}}{{attribute_1}}{{else}}{{attribute_2}}{{/unless}}');
  describe("if", function() {
    beforeEach(function() {
      this.model = new TestModel({
        check: true
      });
      setFixtures(simple_ifcondition_template.render({
        model: this.model
      }));
      return simple_ifcondition_template.makeAlive();
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
  describe("unless", function() {
    beforeEach(function() {
      this.model = new TestModel({
        check: false
      });
      setFixtures(simple_unlesscondition_template.render({
        model: this.model
      }));
      return simple_unlesscondition_template.makeAlive();
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
