simple_collection_template = '{{#collection "collection"}}{{bind "@attribute"}}{{/collection}}'
coltagname_change_template = '{{#collection "collection" colTag="ol" colId="collection" }}{{bind "@attribute"}}{{/collection}}'
itemtagname_change_template = '{{#collection "collection" colTag="div" itemTag="span" itemClass="item" }}{{bind "@attribute"}}{{/collection}}'
colview_change_template = '{{#collection "collection" colView="SimpleView" itemTag="span"}}{{bind "@attribute"}}{{/collection}}'
itemview_change_template = '{{#collection "collection" colTag="div" colClass="col" itemView="SimpleView"}}{{bind "@attribute"}}{{/collection}}'
colitemview_change_template = '{{#collection "collection" colView="SimpleView" colTag="span" itemView="SimpleView"}}{{bind "@attribute"}}{{/collection}}'

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
    t = Handlebars.compile simple_collection_template
    @collection = new TestCollection
    
    for num in [0..4]
      @collection.add new TestModel( {attribute: num})
    
    setFixtures t({collection: @collection})

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
    @collection.refresh {attribute: 10}
    compareToCollection @collection

  describe "collection-advanced", ->
    useTemplate =  (template)->
      t = Handlebars.compile template
      @collection = new TestCollection
      for num in [0..4]
        @collection.add new TestModel( {attribute: num})
      #console.log t({collection: @collection})
      setFixtures t({collection: @collection})
    
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