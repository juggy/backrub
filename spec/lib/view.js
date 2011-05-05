(function() {
  describe("view", function() {
    beforeEach(function() {
      this.model = new TestModel();
      this.view = new Backbone.TemplateView({
        model: this.model,
        template: '{{#view "SimpleView" model=model}}{{attribute_1}}{{/view}}'
      });
      return setFixtures(this.view.render());
    });
    it("renders the view container", function() {
      expect($("#simple_view").length).toEqual(1);
      return expect($("#simple_view span[data-bvid]")).toHaveText(this.model.get("attribute_1"));
    });
    it("keeps track of created views", function() {
      return expect(_.size(this.view.compile._aliveViews)).toEqual(2);
    });
    return it("delegates events properly", function() {
      $("#simple_view").click();
      return expect($(".clicked").length).toEqual(1);
    });
  });
}).call(this);
