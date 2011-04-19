(function() {
  var simple_bind_each_template, simple_bind_template;
  simple_bind_template = '{{bind "@attribute_1"}}';
  simple_bind_each_template = '<ul>{{#boundEach "collection"}}<li>{{bind "@attribute"}}</li>{{/boundEach}}</ul>';
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
  describe("boundEach", function() {
    var compareToCollection;
    compareToCollection = function(collection) {
      var p;
      expect($("ul > span[data-bvid]").length).toEqual(1);
      expect($("ul li > span[data-bvid]").length).toEqual(collection.size());
      p = 0;
      return collection.each(function(m) {
        return expect($($("ul li > span[data-bvid]")[p++])).toHaveText(m.get("attribute"));
      });
    };
    beforeEach(function() {
      var num, t;
      t = Handlebars.compile(simple_bind_each_template);
      this.collection = new TestCollection;
      for (num = 0; num <= 4; num++) {
        this.collection.add(new TestModel({
          attribute: num
        }));
      }
      return setFixtures(t({
        collection: this.collection
      }));
    });
    it("creates a span for the main collection and each items with the right content", function() {
      return compareToCollection(this.collection);
    });
    it("removes elements on remove events", function() {
      var first;
      first = this.collection.first();
      this.collection.remove(first);
      return compareToCollection(this.collection);
    });
    it("appends elements on add events", function() {
      this.collection.add({
        attribute: 10
      });
      return compareToCollection(this.collection);
    });
    return it("refresh elements on refresh events", function() {
      this.collection.refresh({
        attribute: 10
      });
      return compareToCollection(this.collection);
    });
  });
}).call(this);
