(function() {
  describe("view", function() {
    beforeEach(function() {
      this.template = new Backbone.Template('{{#view "SimpleView" model=model}}{{bind "@attribute_1"}}{{/view}}');
      this.model = new TestModel;
      return setFixtures(this.template.render({
        model: this.model
      }));
    });
    it("renders the view container", function() {
      expect($("#simple_view").length).toEqual(1);
      return expect($("#simple_view span[data-bvid]")).toHaveText(this.model.get("attribute_1"));
    });
    it("keeps track of created views", function() {
      return expect(_.size(this.template._createdViews)).toEqual(2);
    });
    return it("delegates events properly", function() {
      this.template.makeAlive();
      $("#simple_view").click();
      return expect($(".clicked").length).toEqual(1);
    });
  });
}).call(this);
