simple_bind_template = new Backbone.Template '{{bind attribute_1 class=attribute_2 id=tata}}'
simple_bindattr_template = new Backbone.Template '<span {{bindAttr class=attribute_6}}></span>'
view_bindattr_template = new Backbone.Template '<span {{bindAttr class=fn}}></span>'

describe "bind", ->

  beforeEach ->
    @model = new TestModel
    setFixtures simple_bind_template.render({model: @model})
    simple_bind_template.makeAlive()
    
  it "creates a span with data-bvid and the right content", ->
    expect($("span[data-bvid]").length).toEqual 1
    expect($("span[data-bvid]")).toHaveText @model.get("attribute_1")

  it "content changes when the model changes", ->
    @model.set {attribute_1 : 10}
    expect($("span[data-bvid]")).toHaveText @model.get("attribute_1")
    
  it "class is loaded from the context", ->
    expect($("span.#{@model.get("attribute_2")}").length).toEqual 1
    @model.set {attribute_1 : 10, attribute_2 : 10}
    expect($("span.#{@model.get("attribute_2")}").length).toEqual 1
  
  it "id is static", ->
    expect($("span#tata").length).toEqual 1

describe "bindAttr", ->

  it "creates attributes based on the model", ->
    @model = new TestModel
    setFixtures simple_bindattr_template.render({model: @model})
    simple_bindattr_template.makeAlive()
    expect($("span.class_6").length).toEqual 1
    expect($("span[data-baid]").length).toEqual 1

  it "updates the attributes on a model change", ->
    @model = new TestModel
    setFixtures simple_bindattr_template.render({model: @model})
    simple_bindattr_template.makeAlive()
    @model.set {attribute_6 : "class_change"}
    expect($("span.class_change").length).toEqual 1
      
  it "calls the method on the context", ->
    @model = new TestModel
    @model.model = @model
    @model.fn = -> "fncalled"
    setFixtures view_bindattr_template.render(@model)
    simple_bindattr_template.makeAlive()
    expect($("span.fncalled").length).toEqual 1
    