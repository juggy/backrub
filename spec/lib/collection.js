(function() {
  var colitemview_change_template, coltagname_change_template, colview_change_template, itemtagname_change_template, itemview_change_template, simple_collection_template;
  simple_collection_template = '{{#collection "collection"}}{{bind "@attribute"}}{{/collection}}';
  coltagname_change_template = '{{#collection "collection" colTag="ol" colId="collection" }}{{bind "@attribute"}}{{/collection}}';
  itemtagname_change_template = '{{#collection "collection" colTag="div" itemTag="span" itemClass="item" }}{{bind "@attribute"}}{{/collection}}';
  colview_change_template = '{{#collection "collection" colView="SimpleView" itemTag="span"}}{{bind "@attribute"}}{{/collection}}';
  itemview_change_template = '{{#collection "collection" colTag="div" colClass="col" itemView="SimpleView"}}{{bind "@attribute"}}{{/collection}}';
  colitemview_change_template = '{{#collection "collection" colView="SimpleView" colTag="span" itemView="SimpleView"}}{{bind "@attribute"}}{{/collection}}';
  describe("collection", function() {
    var compareToCollection;
    compareToCollection = function(collection, colTag, itemTag) {
      var colTagName, itemTagName, p;
      colTagName = colTag || "ul";
      itemTagName = itemTag || "li";
      expect($("" + colTagName + "[data-bvid]").length).toEqual(1);
      expect($("" + colTagName + " " + itemTagName + "[data-bvid]").length).toEqual(collection.size());
      p = 0;
      return collection.each(function(m) {
        return expect($($("" + colTagName + " " + itemTagName + "[data-bvid]")[p++])).toHaveText(m.get("attribute"));
      });
    };
    beforeEach(function() {
      var num, t;
      t = Handlebars.compile(simple_collection_template);
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
    it("refresh elements on refresh events", function() {
      this.collection.refresh({
        attribute: 10
      });
      return compareToCollection(this.collection);
    });
    return describe("collection-advanced", function() {
      var useTemplate;
      useTemplate = function(template) {
        var num, t;
        t = Handlebars.compile(template);
        this.collection = new TestCollection;
        for (num = 0; num <= 4; num++) {
          this.collection.add(new TestModel({
            attribute: num
          }));
        }
        return setFixtures(t({
          collection: this.collection
        }));
      };
      it("uses colTag and attributes argument properly", function() {
        useTemplate(coltagname_change_template);
        return compareToCollection(this.collection, "ol#collection");
      });
      it("uses itemTag and attributes argument properly", function() {
        useTemplate(itemtagname_change_template);
        return compareToCollection(this.collection, "div", "span.item");
      });
      it("uses colView and attributes argument properly", function() {
        useTemplate(colview_change_template);
        return compareToCollection(this.collection, "div#simple_view", "> span");
      });
      it("uses itemView and attributes argument properly", function() {
        useTemplate(itemview_change_template);
        return compareToCollection(this.collection, "div.col", "div.simple");
      });
      return it("uses itemView and colView together properly", function() {
        useTemplate(colitemview_change_template);
        return compareToCollection(this.collection, "span#simple_view", " > div.simple");
      });
    });
  });
}).call(this);
