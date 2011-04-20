(function() {
  var simple_bind_template, simple_bindattr_template;
  simple_bind_template = '{{bind "@attribute_1"}}';
  simple_bindattr_template = '<span {{bindAttr class="@attribute_6"}}></span>';
  describe("bind", function() {
    beforeEach(function() {
      var t;
      t = Handlebars.compile(simple_bind_template);
      this.model = new TestModel;
      return setFixtures(t({
        model: this.model
      }));
    });
    it("creates a span with data-bvid and the right content", function() {
      expect($("span[data-bvid]").length).toEqual(1);
      return expect($("span[data-bvid]")).toHaveText(this.model.get("attribute_1"));
    });
    return it("content changes when the model changes", function() {
      this.model.set({
        attribute_1: 10
      });
      return expect($("span[data-bvid]")).toHaveText(this.model.get("attribute_1"));
    });
  });
  describe("bindAttr", function() {
    beforeEach(function() {
      var t;
      t = Handlebars.compile(simple_bindattr_template);
      this.model = new TestModel;
      return setFixtures(t({
        model: this.model
      }));
    });
    it("creates attributes based on the model", function() {
      expect($("span.class_6").length).toEqual(1);
      return expect($("span[data-baid]").length).toEqual(1);
    });
    return it("updates the attributes on a model change", function() {
      this.model.set({
        attribute_6: "class_change"
      });
      return expect($("span.class_change").length).toEqual(1);
    });
  });
}).call(this);
