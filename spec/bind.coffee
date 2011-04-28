simple_bind_template = new Backbone.Template '{{attribute_1}}'
simple_bindattr_template = new Backbone.Template '<span {{bindAttr class=attribute_6}}></span>'
view_bindattr_template = new Backbone.Template '<span {{bindAttr class=fn}}></span>'



describe "bind", ->

  beforeEach ->
    @model = new TestModel
    setFixtures simple_bind_template.render({model: @model})
    
  it "creates a span with data-bvid and the right content", ->
    expect($("span[data-bvid]").length).toEqual 1
    expect($("span[data-bvid]")).toHaveText @model.get("attribute_1")

  it "content changes when the model changes", ->
    @model.set {attribute_1 : 10}
    expect($("span[data-bvid]")).toHaveText @model.get("attribute_1")
    

describe "bindAttr", ->

  it "creates attributes based on the model", ->
    @model = new TestModel
    setFixtures simple_bindattr_template.render({model: @model})
    expect($("span.class_6").length).toEqual 1
    expect($("span[data-baid]").length).toEqual 1

  it "updates the attributes on a model change", ->
    @model = new TestModel
    setFixtures simple_bindattr_template.render({model: @model})
    @model.set {attribute_6 : "class_change"}
    expect($("span.class_change").length).toEqual 1
      
  it "calls the method on the context", ->
    @model = new TestModel
    @model.model = @model
    @model.fn = -> "fncalled"
    setFixtures view_bindattr_template.render(@model)
    expect($("span.fncalled").length).toEqual 1
    