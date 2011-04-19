simple_bind_template = '{{bind "@attribute_1"}}'
simple_bind_each_template = '<ul>{{#boundEach "collection"}}<li>{{bind "@attribute"}}</li>{{/boundEach}}</ul>'


describe "bind", ->

  beforeEach ->
    t = Handlebars.compile simple_bind_template
    @model = new TestModel
    setFixtures t({model: @model})
    
  it "creates a span with data-bvid and the right content", ->
    expect($("span[data-bvid]").length).toEqual 1
    expect($("span[data-bvid]")).toHaveText @model.get("attribute_1")

  it "content changes when the model changes", ->
    @model.set {attribute_1 : 10}
    expect($("span[data-bvid]")).toHaveText @model.get("attribute_1")
    
    
describe "boundEach", ->
  compareToCollection = (collection)->
    expect($("ul > span[data-bvid]").length).toEqual 1
    expect($("ul li > span[data-bvid]").length).toEqual collection.size()
    
    p = 0
    collection.each (m)->
      expect($($("ul li > span[data-bvid]")[p++])).toHaveText m.get("attribute")

  beforeEach ->
    t = Handlebars.compile simple_bind_each_template
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