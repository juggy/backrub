
describe "view", ->

  beforeEach ->
    @model = new TestModel()
    @view = new Backbone.TemplateView model: @model, template : '{{#view "SimpleView" model=model}}{{attribute_6}}{{attribute_7/kk}}{{attribute_8/attribute_11}}{{/view}}'
    setFixtures @view.render()

  it "renders the view container", ->
    expect($("#simple_view").length).toEqual 1
    expect($("#simple_view span[data-bvid]").length).toEqual 3
    expect($.trim($("#simple_view span[data-bvid]").text()))
      .toEqual @model.get("attribute_6") + @model.get("attribute_7").kk + @model.get("attribute_8").get("attribute_11")

  it "keeps track of created views", ->
    expect(_.size(@view.compile._aliveViews)).toEqual 4

  it "delegates events properly", ->
    $("#simple_view").click()
    expect($(".clicked").length).toEqual 1


