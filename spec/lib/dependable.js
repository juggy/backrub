(function() {
  describe("dependable", function() {
    return it("triggers event properly", function() {
      var Model, callback, m;
      Model = Backbone.Model.extend({
        defaults: {
          attribute_1: 1,
          attribute_2: 2
        },
        initialize: function() {
          return this.dependencies({
            "composed change:attribute_1 change:attribute_2": "",
            "composed2 change:attribute_1 change:attribute_2": ""
          });
        },
        composed: function() {
          return this.get("attribute_1") + this.get("attribute_2");
        },
        composed2: function() {
          return this.get("attribute_1") + this.get("attribute_2");
        }
      });
      m = new Model();
      callback = jasmine.createSpy("event");
      m.bind("change:composed", callback);
      m.set({
        attribute_1: "test"
      });
      return expect(callback).wasCalled();
    });
  });
}).call(this);
