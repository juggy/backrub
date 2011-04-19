simple_ifcondition_template = '{{#boundIf "@check"}}{{bind "@attribute_1"}}{{else}}{{bind "@attribute_2"}}{{/boundIf}}'
simple_unlesscondition_template = '{{#boundUnless "@check"}}{{bind "@attribute_1"}}{{else}}{{bind "@attribute_2"}}{{/boundUnless}}'

describe "boundIf", ->

  beforeEach ->
    t = Handlebars.compile simple_ifcondition_template
    @model = new TestModel {check: true}
    setFixtures t({model: @model})
    
  it "renders attribute_1 if check is true", ->
    expect($("span[data-bvid]").length).toEqual 2
    expect($("span > span[data-bvid]")).toHaveText @model.get("attribute_1")

  it "renders else if check is false", ->
    @model.set {check : false}
    expect($("span[data-bvid]").length).toEqual 2
    expect($("span > span[data-bvid]")).toHaveText @model.get("attribute_2")
    
    
describe "boundUnless", ->
  beforeEach ->
     t = Handlebars.compile simple_unlesscondition_template
     @model = new TestModel {check: false}
     setFixtures t({model: @model})

  it "renders attribute_1 if check is false", ->
    expect($("span[data-bvid]").length).toEqual 2
    expect($("span > span[data-bvid]")).toHaveText @model.get("attribute_1")

  it "renders else if check is true", ->
    @model.set {check : true}
    expect($("span[data-bvid]").length).toEqual 2
    expect($("span > span[data-bvid]")).toHaveText @model.get("attribute_2")