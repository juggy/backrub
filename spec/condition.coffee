simple_ifcondition_template = new Backbone.Template '{{#boundIf "@check"}}{{bind "@attribute_1"}}{{else}}{{bind "@attribute_2"}}{{/boundIf}}'
simple_unlesscondition_template = new Backbone.Template '{{#boundUnless "@check"}}{{bind "@attribute_1"}}{{else}}{{bind "@attribute_2"}}{{/boundUnless}}'

describe "boundIf", ->

  beforeEach ->
    @model = new TestModel {check: true}
    setFixtures simple_ifcondition_template.render({model: @model})
    
  it "renders attribute_1 if check is true", ->
    expect($("span[data-bvid]").length).toEqual 2
    expect($("span > span[data-bvid]")).toHaveText @model.get("attribute_1")

  it "renders else if check is false", ->
    @model.set {check : false}
    expect($("span[data-bvid]").length).toEqual 2
    expect($("span > span[data-bvid]")).toHaveText @model.get("attribute_2")
    
    
describe "boundUnless", ->
  beforeEach ->
     @model = new TestModel {check: false}
     setFixtures simple_unlesscondition_template.render({model: @model})

  it "renders attribute_1 if check is false", ->
    expect($("span[data-bvid]").length).toEqual 2
    expect($("span > span[data-bvid]")).toHaveText @model.get("attribute_1")

  it "renders else if check is true", ->
    @model.set {check : true}
    expect($("span[data-bvid]").length).toEqual 2
    expect($("span > span[data-bvid]")).toHaveText @model.get("attribute_2")