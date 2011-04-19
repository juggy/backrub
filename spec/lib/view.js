(function() {
  var simple_view_template;
  simple_view_template = '{{#view "SimpleView" model=model}}{{bind "@attribute_1"}}{{/view}}';
  this.SimpleView = Backbone.View.extend({
    id: "simple_view"
  });
  describe("view", function() {
    beforeEach(function() {
      var t;
      t = Handlebars.compile(simple_view_template);
      this.model = new TestModel;
      return setFixtures(t({
        model: this.model
      }));
    });
    it("renders the view container", function() {
      expect($("#simple_view").length).toEqual(1);
      return expect($("#simple_view span[data-bvid]")).toHaveText(this.model.get("attribute_1"));
    });
    return xit("delegates events properly", function() {});
  });
}).call(this);
