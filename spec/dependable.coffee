describe "dependable", ->
  it "triggers event properly", ->
    Model = Backbone.Model.extend 
      defaults:
        attribute_1: 1
        attribute_2: 2
        
      initialize: ->
        @dependencies 
          "composed change:attribute_1 change:attribute_2" : ""
          "composed2 change:attribute_1 change:attribute_2" : ""
          
        
      composed : -> @get("attribute_1") + @get("attribute_2")
      composed2 : ->@get("attribute_1") + @get("attribute_2")
      
    m = new Model();
    callback = jasmine.createSpy("event")
    m.bind "change:composed", callback
    
    m.set {attribute_1 : "test"}
    
    expect(callback).wasCalled()     