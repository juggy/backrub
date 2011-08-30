this.NestedModel = Backbone.Model.extend
  defaults:
    attribute_11 : 11
    attribute_12 : 12
    attribute_13 : 13

this.TestModel = Backbone.Model.extend
  defaults:
    attribute_1 : 1
    attribute_2 : 2
    attribute_3 : 3
    attribute_4 : 4
    attribute_5 : 5
    attribute_6 : "class_6"
    attribute_7 : {"kk": "vv"}
    attribute_8 : new this.NestedModel()



this.TestCollection = Backbone.Collection.extend
  model: TestModel

this.SimpleView = Backbone.View.extend
  id: "simple_view"
  className: "simple"
  events :
    "click" : "click"
  click : ->
    $(@el).addClass("clicked")
