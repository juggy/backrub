simple_bind_template = '{{bind "@attribute_1"}}'
simple_bindattr_template = '<span {{bindAttr class="@attribute_6"}}></span>'

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
    

describe "bindAttr", ->

  beforeEach ->
    t = Handlebars.compile simple_bindattr_template
    @model = new TestModel
    setFixtures t({model: @model})

  it "creates attributes based on the model", ->
    expect($("span.class_6").length).toEqual 1
    expect($("span[data-baid]").length).toEqual 1

  it "updates the attributes on a model change", ->
    @model.set {attribute_6 : "class_change"}
    expect($("span.class_change").length).toEqual 1
    