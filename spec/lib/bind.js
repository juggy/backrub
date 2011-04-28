(function() {
  var simple_bind_template, simple_bindattr_template, view_bindattr_template;
  simple_bind_template = new Backbone.Template('{{attribute_1}}');
  simple_bindattr_template = new Backbone.Template('<span {{bindAttr class=attribute_6}}></span>');
  view_bindattr_template = new Backbone.Template('<span {{bindAttr class=fn}}></span>');
  describe("bind", function() {
    beforeEach(function() {
      this.model = new TestModel;
      return setFixtures(simple_bind_template.render({
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
    it("creates attributes based on the model", function() {
      this.model = new TestModel;
      setFixtures(simple_bindattr_template.render({
        model: this.model
      }));
      expect($("span.class_6").length).toEqual(1);
      return expect($("span[data-baid]").length).toEqual(1);
    });
    it("updates the attributes on a model change", function() {
      this.model = new TestModel;
      setFixtures(simple_bindattr_template.render({
        model: this.model
      }));
      this.model.set({
        attribute_6: "class_change"
      });
      return expect($("span.class_change").length).toEqual(1);
    });
    return it("calls the method on the context", function() {
      this.model = new TestModel;
      this.model.model = this.model;
      this.model.fn = function() {
        return "fncalled";
      };
      setFixtures(view_bindattr_template.render(this.model));
      return expect($("span.fncalled").length).toEqual(1);
    });
  });
}).call(this);
