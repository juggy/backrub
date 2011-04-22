
describe "view", ->

  beforeEach ->
    @template = new Backbone.Template '{{#view "SimpleView" model=model}}{{attribute_1}}{{/view}}'
    @model = new TestModel 
    setFixtures @template.render({model: @model})
    
  it "renders the view container", ->
    expect($("#simple_view").length).toEqual 1
    expect($("#simple_view span[data-bvid]")).toHaveText @model.get("attribute_1")

  it "keeps track of created views", ->
    expect(_.size(@template._createdViews)).toEqual 2
    
  it "delegates events properly", ->
    @template.makeAlive()
    $("#simple_view").click()
    expect($(".clicked").length).toEqual 1
    
    
