(function() {
  var simple_bind_template, simple_bindattr_template, view_bindattr_template;
  simple_bind_template = new Backbone.Backrub('{{bind attribute_1 class=attribute_2 id=tata}}');
  simple_bindattr_template = new Backbone.Backrub('<span {{bindAttr class=attribute_6}}></span>');
  view_bindattr_template = new Backbone.Backrub('<span {{bindAttr class=fn}}></span>');
  describe("bind", function() {
    beforeEach(function() {
      this.model = new TestModel;
      setFixtures(simple_bind_template.render({
        model: this.model
      }));
      return simple_bind_template.makeAlive();
    });
    it("creates a span with data-bvid and the right content", function() {
      expect($("span[data-bvid]").length).toEqual(1);
      return expect($("span[data-bvid]")).toHaveText(this.model.get("attribute_1"));
    });
    it("content changes when the model changes", function() {
      this.model.set({
        attribute_1: 10
      });
      return expect($("span[data-bvid]")).toHaveText(this.model.get("attribute_1"));
    });
    it("class is loaded from the context", function() {
      expect($("span." + (this.model.get("attribute_2"))).length).toEqual(1);
      this.model.set({
        attribute_1: 10,
        attribute_2: 10
      });
      return expect($("span." + (this.model.get("attribute_2"))).length).toEqual(1);
    });
    return it("id is static", function() {
      return expect($("span#tata").length).toEqual(1);
    });
  });
  describe("bindAttr", function() {
    it("creates attributes based on the model", function() {
      this.model = new TestModel;
      setFixtures(simple_bindattr_template.render({
        model: this.model
      }));
      simple_bindattr_template.makeAlive();
      expect($("span.class_6").length).toEqual(1);
      return expect($("span[data-baid]").length).toEqual(1);
    });
    it("updates the attributes on a model change", function() {
      this.model = new TestModel;
      setFixtures(simple_bindattr_template.render({
        model: this.model
      }));
      simple_bindattr_template.makeAlive();
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
      simple_bindattr_template.makeAlive();
      return expect($("span.fncalled").length).toEqual(1);
    });
  });
}).call(this);
