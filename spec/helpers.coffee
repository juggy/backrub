this.TestModel = Backbone.Model.extend
  defaults:
    attribute_1 : 1
    attribute_2 : 2
    attribute_3 : 3
    attribute_4 : 4
    attribute_5 : 5
    attribute_6 : 6
    
this.TestCollection = Backbone.Collection.extend
  model: TestModel
    