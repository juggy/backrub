Template =
  _Genuine : 
    nameLookup : Handlebars.JavaScriptCompiler.prototype.nameLookup
    mustache : Handlebars.Compiler.prototype.mustache
  #
  # Get a path within the base object (or window if undefined)
  #
  _getPath : (path, base)->
    base = base || window
    throw "Path is undefined or null" if !path
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
  _resolveValue : (attr, model)->
    model_info = Template._resolveIsModel attr, model
    value = try
      Template._getPath model_info.attr, model_info.model
    catch error
      model_info.attr
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
  _resolveIsModel : (attr, model)->
    is_model = false
    attr = if (attr.charAt?(0) is "@")
      is_model = true
      model = model.model
      attr.substring(1)
    else if model.model and model.model.get(attr) isnt undefined
      is_model = true
      model = model.model
      attr
    else
      attr
    {is_model: is_model, attr: attr, model: model}

  #
  # Used by if and unless helpers to render the and listen changes
  #
  _bindIf : (attr, context)->
    if context 
      view = new Template._BindView
        attr  : attr
        model : this
      context.data.exec.addView view
      model_info = Template._resolveIsModel attr, this
      model_info.model.bind "change:#{model_info.attr}", ->
        view.rerender()
        context.data.exec.makeAlive()
      #setup the render to check for truth of the value
      view.render = ->
        fn = if Template._resolveValue( @attr, @model ) then context.fn else context.inverse
        new Handlebars.SafeString @span( fn(@model, null, null, context.data) )
    
      view.render()
    else
      throw "No block is provided!"

  #
  # Create a backbone view with the specified prototype.
  # It adds _span_, _live_, _textAttributes_ and _bvid_ attributes
  # to the view.
  #
  _createView : (viewProto, options)->
    v = new viewProto(options)
    throw "Cannot instantiate view" if !v
    v.span = Template._BindView.prototype.span
    v.live = Template._BindView.prototype.live
    v.textAttributes = Template._BindView.prototype.textAttributes
    v.bvid = "bv-#{jQuery.uuid++}"
    return v

  #
  # Lightweight span based view to encapsulate the different helpers
  # A unique id is used to retrieve the view for update
  #
  _BindView : Backbone.View.extend
    tagName : "span"
    live : -> $("[data-bvid='#{@bvid}']")
    initialize: -> 
      _.bindAll this, "render", "rerender", "span", "live", "value", "textAttributes"
      @bvid = "bv-#{jQuery.uuid++}"
      @attr = @options.attr
    value: ->
      Template._resolveValue @attr, @model
    textAttributes: ->
      return @renderedAttributes if @renderedAttributes
      @attributes = @attributes || @options.attributes || {}
      @attributes.id = @id if !(@attributes.id) && @id
      @attributes.class = @className if !@attributes.class && @className
      attr = _.map @attributes, (v, k)->
        "#{k}=\"#{v}\""
      @renderedAttributes = attr.join(" ")
    span: (inner)->
      "<#{@tagName} #{@textAttributes()} data-bvid=\"#{@bvid}\">#{inner}</#{@tagName}>"
    rerender : ->
      @live().replaceWith @render().string
    render  : -> 
      new Handlebars.SafeString @span( @value() )

#
# See handlebars code. This override mustache so that
# it will call the bind helper to resolve single value
# mustaches.
#
Handlebars.Compiler.prototype.mustache = (mustache)->
  if mustache.params.length || mustache.hash
    Template._Genuine.mustache.call(this, mustache);
  else
    id = new Handlebars.AST.IdNode(['bind']);
    mustache.id.string = "@#{mustache.id.string}"
    mustache = new Handlebars.AST.MustacheNode([id].concat([mustache.id]), mustache.hash, !mustache.escaped);
    Template._Genuine.mustache.call(this, mustache);
    
#
# See handlebars code.
#
Handlebars.JavaScriptCompiler.prototype.nameLookup =  (parent, name, type)->
  if type is 'context' 
    "(context.model && context.model.get(\"#{name}\") != null ? \"@#{name}\" : context.#{name});"
  else
    Template._Genuine.nameLookup.call(this, parent, name, type)

Backbone.Template = (template)->
  _.bindAll @, "addView", "render", "makeAlive"
  @compiled = Handlebars.compile( template, {data: true, stringParams: true} )
  @_createdViews = {}
  @_aliveViews = {}
  @_alive = false
  return @
  
_.extend Backbone.Template.prototype, 
  #
  # Execute a templae given some options
  #
  render: (options)->
    self = this
    @compiled(options, null, null, {exec : @})
  
  #
  # Make Alive will properly handle the delgation of 
  # events based on Backbone conventions. By default,
  # it will use the body element to find created elements
  # but you can also give a base element to query from.
  # This is useful when your template is appended to a 
  # DOM element that wasn't inserted into the page yet.
  #
  makeAlive: (base)->
    base = base || $("body")
    query = []
    currentViews = @_createdViews
    @_createdViews = {}
    
    _.each currentViews, (view, bvid)->
      query.push "[data-bvid='#{bvid}']"
    
    self = @
    $(query.join( "," ), base).each ->
      el = $(@)
      view = currentViews[el.attr( "data-bvid" )]
      view.el = el
      view.delegateEvents()
      view.alive?.call(view)
    #move alive views away for other makeAlive passes
    _.extend @_aliveViews, currentViews
    @_alive = true
  
  #
  # Internal API to add view to the context
  #
  addView : (view)->
    @_createdViews[view.bvid] = view
  
  #
  # Internal API to remove view formt he tracking list
  #
  removeView : (view)->
    delete @_createdViews[view.bvid]
    delete @_aliveViews[view.bvid]
    delete view

#
# A simple Backbone.View to wrap around the Backbone.Template API
# You can use this view as any other view within backbone. Call
# render as you would normally
# 
Backbone.TemplateView = Backbone.View.extend
  initialize: (options)->
    @template = @template || options.template
    throw "Template is missing" if !@template
    
    @compile = new Backbone.Template(@template)
  
  render : ->
    $(@el).html @compile.render @
    @compile.makeAlive @el
    @el

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
  execContext = context.data.exec
  view = Template._getPath(viewName)
  v = Template._createView view, context.hash
  execContext.addView v
  v.render = ()-> 
    new Handlebars.SafeString @span( context(@, null, null, context.data) )
  v.render(v)
  

#
# Bind helper
# Bind a value from the view or the model to the template.
# When the value changes ("change:_attribute_" events) only this part
# of the template will be rerendered. Bind will create a new <span>
# node to keep track of what to refresh.
#
Handlebars.registerHelper "bind", (attrName, context)->
  execContext = context.data.exec
  view = new Template._BindView
    attr  : attrName
    model : this
  execContext.addView view
  model_info = Template._resolveIsModel attrName, this
  model_info.model.bind "change:#{model_info.attr}", ->
    view.rerender()
    execContext.makeAlive()
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
    
    model_info = Template._resolveIsModel attr, self
    value = Template._resolveValue attr, self
    outAttrs.push "#{k}=\"#{value}\""
    
    #handle change events
    model_info.model.bind "change:#{model_info.attr}", ->
      el = $("[data-baid='ba-#{id}']")
      
      if el.length is 0
        model_info.model.unbind "change#{model_info.attr}"
      else
        el.attr k, Template._resolveValue( attr, self)
  
  outAttrs.push "data-baid=\"ba-#{id}\""
  new Handlebars.SafeString outAttrs.join(" ")

#
# Bounded if
# A if/else statement that will listen for changes and update
# accordingly. Uses bind so a <span> will be created
#
Handlebars.registerHelper "if", (attr, context )->
  _.bind(Template._bindIf, this)( attr, context)

#
# Bounded unless
# A unless/else statement that will listen for changes and update
# accordingly. Uses bind so a <span> will be created
#
Handlebars.registerHelper "unless", (attr, context)->
  fn = context.fn
  inverse = context.inverse
  context.fn = inverse
  context.inverse = fn
  
  _.bind(Template._bindIf, this)( attr, context )

#
# Bounded each
# A each helper to iterate on a Backbone Collection and
# update any refresh/add/remove events. <span> will be created
# for the overall collection and each of its items to keep track
# of what to refresh.
# Do not know what will happen with sorting...
#
Handlebars.registerHelper "collection", (attr, context)->
  execContext = context.data.exec
  collection = Template._resolveValue attr, this
  if not collection.each?
    throw "not a backbone collection!"
  
  options = context.hash
  colViewPath = options?.colView
  colView = Template._getPath(colViewPath) if colViewPath
  colTagName = options?.colTag || "ul"
  
  itemViewPath = options?.itemView
  itemView = Template._getPath(itemViewPath) if itemViewPath
  itemTagName = options?.itemTag || "li"
  
  # filter col/items arguments
  # TODO would it be possible to use bindAttr for col/item attributes
  colAtts = {}
  itemAtts = {}
  _.each options, (v, k) ->
    return if k.indexOf("Tag") > 0 or k.indexOf("View") > 0
    if k.indexOf( "col") is 0
      colAtts[k.substring(3).toLowerCase()] = v
    else if k.indexOf( "item" ) is 0
      itemAtts[k.substring(4).toLowerCase()] = v
  
  view = if colView 
    Template._createView colView, 
      model: collection
      attributes: colAtts
      tagName : if options?.colTag then colTagName else colView.prototype.tagName
  else
    new Template._BindView
      tagName: colTagName
      attributes: colAtts
      attr  : attr
      model : this
  execContext.addView view
  
  views = {}
  
  #
  # Item view setup closure
  #
  item_view = (m)->
    mview = if itemView
      Template._createView itemView, 
        model: m
        attributes: itemAtts
        tagName : if options?.itemTag then itemTagName else itemView.prototype.tagName
    else
      new Template._BindView
        tagName: itemTagName
        attributes: itemAtts
        model: m
    execContext.addView mview
    
    #
    # Render the item view using the template
    #
    mview.render = ()-> @span context(@, null, null, context.data)
    return mview
  
  #
  # Container view setup closure
  #
  setup = (col, mainView, childViews) ->
    # create all childs
    col.each (m)->
      mview = item_view m
      childViews[m.cid] = mview

    #
    # Rendering for the main view simply calls render of the child
    # and wrap this with the container view element.
    #
    mainView.render = ->
      rendered = _.map childViews, (v)->
        v.render()
      new Handlebars.SafeString @span( rendered.join("\n") )
  
  setup(collection, view, views)
  
  collection.bind "refresh", ()->
    # dump everything and resetup the view
    # Call make alive to keep track of new views.
    views = {}
    setup(collection, view, views)
    view.rerender()
    execContext.makeAlive()
  collection.bind "add", (m)->
    # create the new view as needed
    # Call make alive to keep track of new views.
    mview = item_view m
    views[m.cid] = mview
    view.live().append(mview.render())
    execContext.makeAlive()
  collection.bind "remove", (m)->
    # remove the view associated with the model
    # Stop tracking this view.
    mview = views[m.cid]
    mview.live().remove()
    execContext.removeView mview

  view.render()