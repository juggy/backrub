
describe "view", ->

  beforeEach ->
    @model = new TestModel()
    @view = new Backbone.TemplateView model: @model, template : '{{#view "SimpleView" model=model}}{{attribute_1}}{{/view}}'
    setFixtures @view.render()
    
  it "renders the view container", ->
    expect($("#simple_view").length).toEqual 1
    expect($("#simple_view span[data-bvid]")).toHaveText @model.get("attribute_1")

  it "keeps track of created views", ->
    expect(_.size(@view.compile._aliveViews)).toEqual 2
    
  it "delegates events properly", ->
    $("#simple_view").click()
    expect($(".clicked").length).toEqual 1
    
    
