Backbone.Template = 
  #
  # Get a path within the base object (or window if undefined)
  #
  getPath : (path, base)->
    base = base || window
    parts = path.split(".")
    _.each parts, (p)->
      base = base[p]
      if !base
        throw "cannot find given path '#{path}'"
        return {}
    return base

  #
  # Resolve a value properly in the model
  #
  # Backbone models are not plain javascript object so you cannot
  # simply follow the path, you need to call get on the model.
  #
  resolveValue : (attr, model)->
    model_info = Backbone.Template.resolveIsModel attr, model
    value = try
      Backbone.Template.getPath model_info.attr, model_info.model
    catch error
      null
    if model_info.is_model
      model_info.model.get(model_info.attr)
    else if typeof( value ) is "function"
      value()
    else
      value

  #
  # Determine if the attribute is a model attribute or view attribute
  # If the attribute is preceded by @ it is considered a model attr.
  #   
  resolveIsModel : (attr, model)->
    is_model = false
    attr = if attr.charAt(0) is "@"
      is_model = true
      model = model.model
      attr.substring(1)
    else
      attr
    {is_model: is_model, attr: attr, model: model}
    

  #
  # Used by if and unless helpers to render the and listen changes
  #
  bindIf : (attr, context)->
    if context 
      view = new Backbone.Template._BindView
        attr  : attr
        model : this
      model_info = Backbone.Template.resolveIsModel attr, this
      model_info.model.bind "change:#{model_info.attr}", view.rerender
      #setup the render to check for truth of the value
      view.render = ->
        fn = if Backbone.Template.resolveValue @attr, @model then context else context.inverse
        @span fn(@model)
    
      new Handlebars.SafeString view.render()
    else
      throw "No block is provided!"


  #
  # Lightweight span based view to encapsulate the different helpers
  # A unique id is used to retrieve the view for update
  #
  _BindView : Backbone.View.extend
    tagName : "span"
    live : -> $("[data-bvid='#{@bbid}']")
    initialize: -> 
      _.bindAll this, "render", "rerender"
      @bbid = "bv-#{jQuery.uuid++}"
      @attr = @options.attr
    value: ->
      Backbone.Template.resolveValue @attr, @model
    span: (inner)->
      "<span data-bvid=\"#{@bbid}\">#{inner}</span>"
    rerender : -> 
      @live().replaceWith @render()
    render  : -> 
      @span @value()


#
# View helper
# You can reference your backbone views in the template to 
# add extra logic and events. Use this helper with the view
# name (as accessible within the window object). You can give it
# a hash with the usual backbone options (model, id, etc.)
# The render method is redefined. A rendered event is sent but 
# within the templating loop (elements are not on the document yet)
#
Handlebars.registerHelper "view", (viewName, context)->
  view = Backbone.Template.getPath(viewName)
  v = new view(context.hash)
  v.render = ()-> 
    rendered = context(@)
    @trigger "rendered"
    return rendered
  v.render(v)
  

#
# Bind helper
# Bind a value from the view or the model to the template.
# When the value changes ("change:_attribute_" events) only this part
# of the template will be rerendered. Bind will create a new <span>
# node to keep track of what to refresh.
#
Handlebars.registerHelper "bind", (attrName, context)->
  view = new Backbone.Template._BindView
    attr  : attrName
    model : this
  model_info = Backbone.Template.resolveIsModel attrName, this
  model_info.model.bind "change:#{model_info.attr}", view.rerender
  new Handlebars.SafeString view.render()

#
# Bind attributes helper
# This helper is used to bind attributes to an HTML element in 
# your template. Bind attributes will create a data-baid to keep 
# track of the element for further updates.
#
Handlebars.registerHelper "bindAttr", (context)->
  attrs = context.hash
  id = jQuery.uuid++
  outAttrs = []
  self = this
  #go thru every attributes in the hash
  _.each attrs, (v, k)->
    attr = v
    
    model_info = Backbone.Template.resolveIsModel attr, self
    value = Backbone.Template.resolveValue attr, self
    outAttrs.push "#{k}=\"#{value}\""
    
    #handle change events
    model_info.model.bind "change:#{model_info.attr}", ->
      el = $("[data-baid='ba-#{id}']")
      
      if el.length is 0
        model_info.model.unbind "change#{model_info.attr}"
      else
        el.attr k, Backbone.Template.resolveValue( attr, self)
  
  outAttrs.push "data-baid=\"ba-#{id}\""
  new Handlebars.SafeString outAttrs.join(" ")

#
# Bounded if
# A if/else statement that will listen for changes and update
# accordingly. Uses bind so a <span> will be created
#
Handlebars.registerHelper "boundIf", (attr, context)->
  _.bind(Backbone.Template.bindIf, this)( attr, context )

#
# Bounded unless
# A unless/else statement that will listen for changes and update
# accordingly. Uses bind so a <span> will be created
#
Handlebars.registerHelper "boundUnless", (attr, context)->
  fn = context
  context = context.inverse
  context.inverse = fn
  
  _.bind(Backbone.Template.bindIf, this)( attr, context )

#
# Bounded each
# A each helper to iterate on a Backbone Collection and
# update any refresh/add/remove events. <span> will be created
# for the overall collection and each of its items to keep track
# of what to refresh.
# Do not know what will happen with sorting...
#
Handlebars.registerHelper "boundEach", (attr, context)->
  collection = Backbone.Template.resolveValue attr, this
  if not collection.each?
    throw "not a backbone collection!"
  
  view = new Backbone.Template._BindView
    attr  : attr
    model : this
  
  views = {}
  
  item_view = (m)->
    mview = new Backbone.Template._BindView
      model: m
    #render the single view
    mview.render = ()-> @span context(@)
    return mview
  
  setup = (c) ->
    collection.each (m)->
      mview = item_view m
      views[m.cid] = mview

    view.render = ->
      rendered = _.map views, (v)->
        v.render()
      
      new Handlebars.SafeString @span( rendered.join("\n") )
  
  setup(collection)
  
  collection.bind "refresh", ()->
    views = {}
    setup(collection)
    view.rerender()
  collection.bind "add", (m)->
    mview = item_view m
    views[m.cid] = mview
    view.live().append(mview.render())
  collection.bind "remove", (m)->
    mview = views[m.cid]
    mview.live().remove()

  view.render()