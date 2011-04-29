describe "dependable", ->
  it "triggers event properly", ->
    Model = TestModel.extend 
      initialize: ->
        Backbone.Dependable(@)
        
      composed : (->
        @get("attribute_1") + @get("attribute_2")
      ).depends
        "change:attribute_1" : "" 
        "change:attribute_2" : ""
        
      composed2 : (->
        @get("attribute_1") + @get("attribute_2")
      ).depends
        "change:attribute_1" : "" 
        "change:attribute_2" : ""
      
    m = new Model();
    callback = jasmine.createSpy("event")
    m.bind "change:composed", callback
    
    m.set {attribute_1 : "test"}
    
    expect(callback).wasCalled()     