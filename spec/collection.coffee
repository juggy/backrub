simple_collection_template = new Backbone.Backrub '{{#collection "collection"}}{{attribute}}{{/collection}}'
coltagname_change_template = new Backbone.Backrub '{{#collection "collection" colTag="ol" colId="collection" }}{{attribute}}{{/collection}}'
itemtagname_change_template = new Backbone.Backrub '{{#collection "collection" colTag="div" itemTag="span" itemClass="item" }}{{attribute}}{{/collection}}'
colview_change_template = new Backbone.Backrub '{{#collection "collection" colView="SimpleView" itemTag="span"}}{{attribute}}{{/collection}}'
itemview_change_template = new Backbone.Backrub '{{#collection "collection" colTag="div" colClass="col" itemView="SimpleView"}}{{attribute}}{{/collection}}'
colitemview_change_template = new Backbone.Backrub '{{#collection "collection" colView="SimpleView" colTag="span" itemView="SimpleView"}}{{attribute}}{{/collection}}'

describe "collection", ->
  compareToCollection = (collection, colTag, itemTag)->
    colTagName = colTag || "ul"
    itemTagName = itemTag || "li"
    expect($("#{colTagName}[data-bvid]").length).toEqual 1
    expect($("#{colTagName} #{itemTagName}[data-bvid]").length).toEqual collection.size()

    p = 0
    collection.each (m)->
      expect($($("#{colTagName} #{itemTagName}[data-bvid]")[p++])).toHaveText m.get("attribute")

  beforeEach ->
    @collection = new TestCollection

    for num in [0..4]
      @collection.add new TestModel( {attribute: num})

    setFixtures simple_collection_template.render({collection: @collection})
    simple_collection_template.makeAlive()

  it "creates a span for the main collection and each items with the right content", ->
    compareToCollection @collection

  it "removes elements on remove events", ->
    first = @collection.first()
    @collection.remove first

    compareToCollection @collection

  it "appends elements on add events", ->
    @collection.add {attribute: 10}
    compareToCollection @collection

  it "refresh elements on refresh events", ->
    @collection.reset {attribute: 10}
    compareToCollection @collection

  describe "collection-advanced", ->
    useTemplate =  (template)->
      @collection = new TestCollection
      for num in [0..4]
        @collection.add new TestModel( {attribute: num})
      #console.log t({collection: @collection})
      setFixtures template.render({collection: @collection})
      template.makeAlive()

    it "uses colTag and attributes argument properly", ->
      useTemplate coltagname_change_template
      compareToCollection @collection, "ol#collection"

    it "uses itemTag and attributes argument properly", ->
      useTemplate itemtagname_change_template
      compareToCollection @collection, "div", "span.item"

    it "uses colView and attributes argument properly", ->
      useTemplate colview_change_template
      compareToCollection @collection, "div#simple_view", "> span"

    it "uses itemView and attributes argument properly", ->
      useTemplate itemview_change_template
      compareToCollection @collection, "div.col", "div.simple"

    it "uses itemView and colView together properly", ->
      useTemplate colitemview_change_template
      compareToCollection @collection, "span#simple_view", " > div.simple"
