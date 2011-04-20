simple_view_template = '{{#view "SimpleView" model=model}}{{bind "@attribute_1"}}{{/view}}'

describe "view", ->

  beforeEach ->
    t = Handlebars.compile simple_view_template
    @model = new TestModel 
    setFixtures t({model: @model})
    
  it "renders the view container", ->
    expect($("#simple_view").length).toEqual 1
    expect($("#simple_view span[data-bvid]")).toHaveText @model.get("attribute_1")

  xit "delegates events properly", ->
    
    
