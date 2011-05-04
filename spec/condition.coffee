simple_ifcondition_template = new Backbone.Template '{{#if "@check"}}{{attribute_1}}{{else}}{{attribute_2}}{{/if}}'
simple_unlesscondition_template = new Backbone.Template '{{#unless "@check"}}{{attribute_1}}{{else}}{{attribute_2}}{{/unless}}'

describe "if", ->

  beforeEach ->
    @model = new TestModel {check: true}
    setFixtures simple_ifcondition_template.render({model: @model})
    simple_ifcondition_template.makeAlive()
    
  it "renders attribute_1 if check is true", ->
    expect($("span[data-bvid]").length).toEqual 2
    expect($("span > span[data-bvid]")).toHaveText @model.get("attribute_1")

  it "renders else if check is false", ->
    @model.set {check : false}
    expect($("span[data-bvid]").length).toEqual 2
    expect($("span > span[data-bvid]")).toHaveText @model.get("attribute_2")
    
    
describe "unless", ->
  beforeEach ->
     @model = new TestModel {check: false}
     setFixtures simple_unlesscondition_template.render({model: @model})
     simple_unlesscondition_template.makeAlive()

  it "renders attribute_1 if check is false", ->
    expect($("span[data-bvid]").length).toEqual 2
    expect($("span > span[data-bvid]")).toHaveText @model.get("attribute_1")

  it "renders else if check is true", ->
    @model.set {check : true}
    expect($("span[data-bvid]").length).toEqual 2
    expect($("span > span[data-bvid]")).toHaveText @model.get("attribute_2")